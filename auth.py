from fastapi import APIRouter, HTTPException, Depends, Response, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import secrets, os, resend, psycopg2, psycopg2.extras

# ── Config ────────────────────────────────────────────────────────────────────
SECRET_KEY   = "CHANGE_MOI_AVEC_UN_VRAI_SECRET_32_CHARS"
ALGORITHM    = "HS256"
ACCESS_EXP   = 15          # minutes
REFRESH_EXP  = 30          # jours
RESEND_KEY   = "re_VOTRE_CLE_RESEND"
FROM_EMAIL   = "noreply@parcelleid.fr"
FRONT_URL    = "https://jowanmab.github.io/parcelleid"

resend.api_key = RESEND_KEY

DB = dict(host="127.0.0.1", dbname="parcelleid_dev",
          user="parcelle_user", password="Siderm7433")

def get_db():
    return psycopg2.connect(**DB, cursor_factory=psycopg2.extras.RealDictCursor)

# ── Crypto ────────────────────────────────────────────────────────────────────
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer  = HTTPBearer(auto_error=False)

def hash_password(p): return pwd_ctx.hash(p)
def verify_password(p, h): return pwd_ctx.verify(p, h)

def make_token(data: dict, expires_minutes: int):
    exp = datetime.utcnow() + timedelta(minutes=expires_minutes)
    return jwt.encode({**data, "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

# ── Dépendance auth ───────────────────────────────────────────────────────────
def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    if not creds:
        raise HTTPException(401, "Non authentifié")
    try:
        payload = decode_token(creds.credentials)
        return payload  # contient user_id, email, plan
    except JWTError:
        raise HTTPException(401, "Token invalide ou expiré")

def require_pro(user=Depends(get_current_user)):
    if user.get("plan") != "pro":
        raise HTTPException(403, "Fonctionnalité réservée au plan Pro")
    return user

# ── Schemas ───────────────────────────────────────────────────────────────────
class RegisterIn(BaseModel):
    email: EmailStr
    password: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class RefreshIn(BaseModel):
    refresh_token: str

# ── Router ────────────────────────────────────────────────────────────────────
router = APIRouter(prefix="/auth", tags=["auth"])

# POST /auth/register
@router.post("/register")
def register(body: RegisterIn):
    if len(body.password) < 8:
        raise HTTPException(400, "Mot de passe trop court (8 caractères min)")
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id FROM users WHERE email=%s", (body.email,))
    if cur.fetchone():
        raise HTTPException(409, "Email déjà utilisé")

    h = hash_password(body.password)
    cur.execute(
        "INSERT INTO users (email, password_hash) VALUES (%s,%s) RETURNING id",
        (body.email, h)
    )
    user_id = cur.fetchone()["id"]

    # crédits gratuits
    cur.execute("INSERT INTO search_credits (user_id) VALUES (%s)", (user_id,))

    # token vérification email
    token = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(hours=24)
    cur.execute(
        "INSERT INTO email_tokens (user_id, token, type, expires_at) VALUES (%s,%s,'verify',%s)",
        (user_id, token, expires)
    )
    db.commit()
    db.close()

    # envoi email
    link = f"{FRONT_URL}?verify={token}"
    resend.Emails.send({
        "from": FROM_EMAIL,
        "to": body.email,
        "subject": "Confirmez votre email — ParcelleID",
        "html": f"""
        <h2>Bienvenue sur ParcelleID !</h2>
        <p>Cliquez sur le lien pour activer votre compte :</p>
        <a href="{link}" style="background:#2563eb;color:white;padding:12px 24px;
           border-radius:8px;text-decoration:none;display:inline-block">
           Confirmer mon email
        </a>
        <p>Lien valable 24h.</p>
        """
    })
    return {"message": "Compte créé, vérifiez votre email"}

# POST /auth/verify-email
@router.post("/verify-email")
def verify_email(token: str):
    db = get_db(); cur = db.cursor()
    cur.execute(
        "SELECT * FROM email_tokens WHERE token=%s AND type='verify' AND used=FALSE",
        (token,)
    )
    row = cur.fetchone()
    if not row or row["expires_at"] < datetime.utcnow():
        raise HTTPException(400, "Lien invalide ou expiré")
    cur.execute("UPDATE users SET is_verified=TRUE WHERE id=%s", (row["user_id"],))
    cur.execute("UPDATE email_tokens SET used=TRUE WHERE id=%s", (row["id"],))
    db.commit(); db.close()
    return {"message": "Email vérifié, vous pouvez vous connecter"}

# POST /auth/login
@router.post("/login")
def login(body: LoginIn):
    db = get_db(); cur = db.cursor()
    cur.execute("SELECT * FROM users WHERE email=%s", (body.email,))
    user = cur.fetchone()
    db.close()
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Email ou mot de passe incorrect")
    if not user["is_verified"]:
        raise HTTPException(403, "Email non vérifié")

    payload = {"user_id": user["id"], "email": user["email"], "plan": user["plan"]}
    access  = make_token(payload, ACCESS_EXP)
    refresh = make_token({"user_id": user["id"], "type": "refresh"}, REFRESH_EXP * 24 * 60)
    return {"access_token": access, "refresh_token": refresh, "plan": user["plan"]}

# POST /auth/refresh
@router.post("/refresh")
def refresh_token(body: RefreshIn):
    try:
        payload = decode_token(body.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(401, "Token invalide")
    except JWTError:
        raise HTTPException(401, "Token expiré, reconnectez-vous")

    db = get_db(); cur = db.cursor()
    cur.execute("SELECT * FROM users WHERE id=%s", (payload["user_id"],))
    user = cur.fetchone(); db.close()
    if not user:
        raise HTTPException(401, "Utilisateur introuvable")

    new_payload = {"user_id": user["id"], "email": user["email"], "plan": user["plan"]}
    return {"access_token": make_token(new_payload, ACCESS_EXP)}

# GET /auth/me
@router.get("/me")
def me(user=Depends(get_current_user)):
    db = get_db(); cur = db.cursor()
    cur.execute("SELECT credits FROM search_credits WHERE user_id=%s", (user["user_id"],))
    row = cur.fetchone(); db.close()
    return {
        "email": user["email"],
        "plan": user["plan"],
        "credits": row["credits"] if row else 0
    }

# POST /auth/logout  (côté client :