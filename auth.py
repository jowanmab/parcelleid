from fastapi import APIRouter, HTTPException, Depends, Response, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta, date
from typing import Optional
import secrets, os, resend, psycopg2, psycopg2.extras

# ── DDL favoris (à exécuter une fois en prod) ─────────────────────────────────
# CREATE TABLE IF NOT EXISTS favorites (
#     id SERIAL PRIMARY KEY,
#     user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
#     parcelle_id TEXT NOT NULL,
#     insee TEXT, commune TEXT, adresse TEXT,
#     surface_habitable NUMERIC, surface_terrain NUMERIC,
#     classe_energie TEXT, classe_ges TEXT,
#     date_diagnostic DATE,
#     lat DOUBLE PRECISION, lng DOUBLE PRECISION,
#     created_at TIMESTAMP NOT NULL DEFAULT now(),
#     UNIQUE(user_id, parcelle_id)
# );
# CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id, created_at DESC);

# ── Config ────────────────────────────────────────────────────────────────────
# Secrets chargés depuis /opt/parcelleid/.env (via systemd EnvironmentFile).
# Fail-fast au démarrage si une variable manque.
SECRET_KEY   = os.environ["SECRET_KEY"]
RESEND_KEY   = os.environ["RESEND_KEY"]
ALGORITHM    = "HS256"
ACCESS_EXP   = 15          # minutes
REFRESH_EXP  = 30          # jours
FROM_EMAIL   = "onboarding@resend.dev"
FRONT_URL    = "https://jowanmab.github.io/parcelleid"

resend.api_key = RESEND_KEY

DB = dict(host="127.0.0.1", dbname="parcelleid_dev",
          user="parcelle_user", password=os.environ["DB_PASSWORD"])

def get_db():
    return psycopg2.connect(**DB, cursor_factory=psycopg2.extras.RealDictCursor)

# ── Crypto ────────────────────────────────────────────────────────────────────

bearer  = HTTPBearer(auto_error=False)

def hash_password(p): return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()
def verify_password(p, h): return bcrypt.checkpw(p.encode(), h.encode())

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

class ForgotIn(BaseModel):
    email: EmailStr

class ResetIn(BaseModel):
    token: str
    password: str

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

# POST /auth/forgot-password
@router.post("/forgot-password")
def forgot_password(body: ForgotIn):
    db = get_db(); cur = db.cursor()
    cur.execute("SELECT id FROM users WHERE email=%s", (body.email,))
    user = cur.fetchone()
    # On répond toujours OK pour éviter l'énumération d'emails
    if user:
        token = secrets.token_urlsafe(32)
        expires = datetime.utcnow() + timedelta(hours=2)
        cur.execute(
            "INSERT INTO email_tokens (user_id, token, type, expires_at) VALUES (%s,%s,'reset',%s)",
            (user["id"], token, expires)
        )
        db.commit()
        link = f"{FRONT_URL}?reset={token}"
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": body.email,
            "subject": "Réinitialisation de votre mot de passe — ParcelleID",
            "html": f"""
            <h2>Réinitialisation du mot de passe</h2>
            <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous :</p>
            <a href="{link}" style="background:#2563eb;color:white;padding:12px 24px;
               border-radius:8px;text-decoration:none;display:inline-block">
               Réinitialiser mon mot de passe
            </a>
            <p>Lien valable 2h. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
            """
        })
    db.close()
    return {"message": "Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé"}

# POST /auth/reset-password
@router.post("/reset-password")
def reset_password(body: ResetIn):
    if len(body.password) < 8:
        raise HTTPException(400, "Mot de passe trop court (8 caractères min)")
    db = get_db(); cur = db.cursor()
    cur.execute(
        "SELECT * FROM email_tokens WHERE token=%s AND type='reset' AND used=FALSE",
        (body.token,)
    )
    row = cur.fetchone()
    if not row or row["expires_at"] < datetime.utcnow():
        db.close()
        raise HTTPException(400, "Lien invalide ou expiré")
    h = hash_password(body.password)
    cur.execute("UPDATE users SET password_hash=%s WHERE id=%s", (h, row["user_id"]))
    cur.execute("UPDATE email_tokens SET used=TRUE WHERE id=%s", (row["id"],))
    db.commit(); db.close()
    return {"message": "Mot de passe mis à jour, vous pouvez vous connecter"}

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

# ── Favoris ──────────────────────────────────────────────────────────────────
class FavoriteIn(BaseModel):
    parcelle_id: str
    insee: Optional[str] = None
    commune: Optional[str] = None
    adresse: Optional[str] = None
    surface_habitable: Optional[float] = None
    surface_terrain: Optional[float] = None
    classe_energie: Optional[str] = None
    classe_ges: Optional[str] = None
    date_diagnostic: Optional[date] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

# GET /auth/favorites  — liste des favoris de l'utilisateur
@router.get("/favorites")
def list_favorites(user=Depends(get_current_user)):
    db = get_db(); cur = db.cursor()
    cur.execute("""
        SELECT parcelle_id, insee, commune, adresse,
               surface_habitable, surface_terrain,
               classe_energie, classe_ges, date_diagnostic,
               lat, lng, created_at
        FROM favorites
        WHERE user_id=%s
        ORDER BY created_at DESC
    """, (user["user_id"],))
    rows = cur.fetchall(); db.close()
    for r in rows:
        if r.get("date_diagnostic"): r["date_diagnostic"] = r["date_diagnostic"].isoformat()
        if r.get("created_at"):      r["created_at"]      = r["created_at"].isoformat()
        for k in ("surface_habitable", "surface_terrain", "lat", "lng"):
            if r.get(k) is not None: r[k] = float(r[k])
    return rows

# POST /auth/favorites — ajoute (idempotent)
@router.post("/favorites")
def add_favorite(body: FavoriteIn, user=Depends(get_current_user)):
    if not body.parcelle_id:
        raise HTTPException(400, "parcelle_id requis")
    db = get_db(); cur = db.cursor()
    cur.execute("""
        INSERT INTO favorites (
            user_id, parcelle_id, insee, commune, adresse,
            surface_habitable, surface_terrain,
            classe_energie, classe_ges, date_diagnostic, lat, lng
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT (user_id, parcelle_id) DO NOTHING
    """, (
        user["user_id"], body.parcelle_id, body.insee, body.commune, body.adresse,
        body.surface_habitable, body.surface_terrain,
        body.classe_energie, body.classe_ges, body.date_diagnostic, body.lat, body.lng
    ))
    db.commit(); db.close()
    return {"ok": True}

# DELETE /auth/favorites/{parcelle_id}
@router.delete("/favorites/{parcelle_id}")
def delete_favorite(parcelle_id: str, user=Depends(get_current_user)):
    db = get_db(); cur = db.cursor()
    cur.execute(
        "DELETE FROM favorites WHERE user_id=%s AND parcelle_id=%s",
        (user["user_id"], parcelle_id)
    )
    db.commit(); db.close()
    return {"ok": True}

# POST /auth/logout  (côté client : supprimer les tokens)
@router.post("/logout")
def logout():
    return {"message": "Déconnecté"}
