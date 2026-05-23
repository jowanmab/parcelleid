#!/usr/bin/env bash
# Deploy script pour la feature "favoris"
#   - SCP favorites.py vers /opt/parcelleid/
#   - Migration SQL (CREATE TABLE favorites)
#   - Patch api.py pour inclure le router (idempotent)
#   - Backup api.py + restart du service
#
# Lance ce script depuis ta machine locale, à la racine du repo :
#     bash deploy_favorites.sh
# (suppose que ta clé SSH root@62.238.18.248 est déjà configurée)

set -euo pipefail

HOST="${PARCELLEID_HOST:-root@62.238.18.248}"
REMOTE_DIR="/opt/parcelleid"
DB_NAME="parcelleid_dev"
DB_USER="parcelle_user"
SERVICE="parcelleid.service"

say() { printf "\n\033[1;34m▸ %s\033[0m\n" "$*"; }
ok()  { printf "  \033[1;32m✓\033[0m %s\n" "$*"; }
err() { printf "  \033[1;31m✗\033[0m %s\n" "$*" >&2; }

# ── Vérifs locales ────────────────────────────────────────────────────────────
[[ -f favorites.py ]]                      || { err "favorites.py introuvable (lance depuis la racine du repo)"; exit 1; }
[[ -f migrations/001_favorites.sql ]]      || { err "migrations/001_favorites.sql introuvable"; exit 1; }

say "Connexion à $HOST"
ssh -o BatchMode=yes -o ConnectTimeout=8 "$HOST" 'echo "  ok"' \
  || { err "SSH impossible — vérifie ta clé ou exporte PARCELLEID_HOST=user@host"; exit 1; }

# ── 1. Upload du router + migration ───────────────────────────────────────────
say "Upload favorites.py et migration SQL"
scp -q favorites.py "$HOST:$REMOTE_DIR/favorites.py"
scp -q migrations/001_favorites.sql "$HOST:/tmp/001_favorites.sql"
ok "fichiers transférés"

# ── 2. Migration SQL ──────────────────────────────────────────────────────────
say "Migration SQL (création table favorites)"
ssh "$HOST" "sudo -u postgres psql -d $DB_NAME -v ON_ERROR_STOP=1 -f /tmp/001_favorites.sql && rm /tmp/001_favorites.sql"
ok "table favorites prête"

# ── 3. Patch api.py (idempotent) + backup ─────────────────────────────────────
say "Patch api.py pour inclure le router (idempotent)"
ssh "$HOST" bash <<'REMOTE'
set -euo pipefail
cd /opt/parcelleid

if grep -q "from favorites import router as favorites_router" api.py; then
    echo "  ✓ api.py déjà patché (rien à faire)"
    exit 0
fi

cp api.py "api.py.bak.$(date +%Y%m%d-%H%M%S)"
echo "  ✓ backup api.py créé"

# Insertion juste après le include_router de auth (pattern attendu)
if grep -q "app.include_router(auth_router)\|app.include_router(auth\." api.py; then
    sed -i '/app.include_router(auth/a from favorites import router as favorites_router\napp.include_router(favorites_router)' api.py
    echo "  ✓ inclus après auth.include_router"
else
    # Fallback : ajout en fin de fichier
    cat >> api.py <<'PY'

from favorites import router as favorites_router
app.include_router(favorites_router)
PY
    echo "  ✓ append en fin de fichier (vérifie le placement)"
fi
REMOTE
ok "api.py patché"

# ── 4. Restart service ────────────────────────────────────────────────────────
say "Restart $SERVICE"
ssh "$HOST" "systemctl restart $SERVICE && sleep 1 && systemctl is-active $SERVICE"
ok "service redémarré"

# ── 5. Test endpoint (doit retourner 401 sans token, prouve qu'il existe) ─────
say "Test endpoint /me/favorites (attendu : HTTP 401 Non authentifié)"
code=$(curl -s -o /dev/null -w "%{http_code}" -m 8 https://parcelleid.duckdns.org/me/favorites || echo "0")
if [[ "$code" == "401" || "$code" == "403" ]]; then
    ok "endpoint répond ($code Unauthorized) → tout OK 🎉"
else
    err "endpoint a retourné HTTP $code (attendu 401) — check journalctl -u $SERVICE -n 30"
    exit 1
fi

echo
echo "✅ Déploiement terminé. Va sur https://jowanmab.github.io/parcelleid/sig.html et teste les ★"
