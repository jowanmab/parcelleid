# ParcelleID / LocaliseImmo — Récap technique

Document de référence vivant : changements front, backend, DB, pipeline, SEO.
Sert de contexte pour les futures conversations Claude. Enrichi au fil des sessions.

**Sessions couvertes :** mai 2026 (§1-12) · juin 2026 — SEO & indexation (§13).

---

## 🎯 Vue d'ensemble

Au cours de cette session, on a transformé ParcelleID d'un outil cadastrale basique
en plateforme complète avec :
- **Site marketing LocaliseImmo** (landing + blog + comment-ca-marche + sources)
- **Outil SIG enrichi** (badge multi-logements, vignettes Street View + satellite)
- **Optimisation DB majeure** (index review, précalcul parcelle_dpe_match many-to-many)
- **Pipeline DPE automatisé** (2× par semaine via cron + monitoring Healthchecks.io)
- **Fix bug DOM** (reprojection 666 K parcelles Antilles/Guyane/Réunion/Mayotte)

---

## 1. Frontend

### Fichiers principaux

| Fichier | Rôle |
|---|---|
| `index.html` | Landing LocaliseImmo (React + Babel standalone) |
| `sig.html` | Outil SIG / carte (ancien `index.html` renommé) |
| `comment-ca-marche.html`, `sources.html`, `blog.html`, `article.html` | Pages marketing |
| `sig-bootstrap.js` | Code injecté dans sig.html pour préremplir le formulaire via params URL |
| `styles.css` / `tokens.css` | Styles LocaliseImmo (palette sage + pêche) |
| `image-slot.js` | Web Component pour photos remplaçables |
| `js/*.jsx` | Composants React des pages marketing |
| `assets/` | Logos + illustrations Storyset |

### Changements UX clés sur sig.html

1. **Clic carte → réorganisation liste** : `bringFeatureToTop()` déplace la parcelle cliquée en tête de la liste scrollable, scroll auto en haut, panel mobile → état `mid`.
2. **Pas de voile sur les parcelles** : `STYLE_DEFAULT/HOVER/SELECTED` ont `fillOpacity: 0` pour mieux voir le satellite.
3. **Outil aire** : tooltip permanent au centroïde du polygone avec la surface.
4. **Bandeau résumé sticky** : "📍 commune · chips · ✏️ Modifier" affiché aussi en desktop après recherche, plus seulement mobile.
5. **Formulaire compacté desktop** : surface logement + date diagnostic sur 1 ligne 2 colonnes, boutons DPE 32px au lieu de 44px (mobile garde 44px pour touch).
6. **Recherche multicritère** : autorisée sur n'importe quelle combinaison de filtres (surface, DPE, GES, date). Bouton activé dès qu'un filtre est rempli.
7. **Vignette enrichie** : badges DPE/GES colorés A-G, indicateur mismatch (bordure rouge) si la classe diffère du filtre, écart % couleur-codé, date diag affichée.
8. **Badge multi-logements** :
   - Avec filtre DPE : `🏘️ +N autres logements ici · Affinez votre recherche`
   - Sans filtre DPE : `🏘️ N logements DPE sur cette parcelle · Affinez pour cibler`
9. **Palette sage + pêche** : `--blue` → `#8AB89A`, `--orange` → `#E89878`, etc. Conserve les noms de variables pour minimiser les changements de sélecteurs.
10. **INSEE arrondissements** : `INSEE_ARRONDISSEMENTS` fan-out parallèle pour Paris (75056 → 75101-75120), Marseille (13055 → 13201-13216), Lyon (69123 → 69381-69389).
11. **Zoom adaptatif vignette satellite** : `computeFitZoom()` calcule le bon zoom (15-19) pour que la parcelle remplisse ~80% du canvas.

### Refonte mobile Airbnb-style (2026-05-27)

Backup conservée : `sig.backup.html` (124 ko, état pré-refonte).

1. **Pill de recherche en haut** (logo + pill compacte) : flexbox fixé top, logo gauche (icône SVG + texte 2 lignes "Localise/Immo"), pill droite (icône loupe + titre dynamique + sous-titre + bouton filtres rond). Tap pill → ouvre modal plein écran.
2. **Modal plein écran pour les filtres** : le `#search-form-block` est physiquement déplacé hors de `.panel` dans `<body>` à l'ouverture (sinon `display:none` du parent cacherait aussi le contenu malgré `position:fixed`). Restauré à sa place originale à la fermeture. Topbar fixée avec bouton ✕ + titre. Animation slide-up + fade.
3. **Bandeau bas réduit à 56 px** (au lieu de 76 px) : affiche uniquement "X biens trouvés" — la pill du haut affiche les filtres.
4. **Drawer scroll 2 étapes** : collapsed (56 px) → mid (50 %) → open (95 %). Drag handle gère les transitions.
5. **FAB "Carte" fixe** : pill noire centrée en bas du viewport (`bottom: env(safe-area-inset-bottom) + 22px`), visible quand drawer est mid/open. Tap → repli drawer à collapsed.
6. **Carte adaptative façon Airbnb** : `.map-wrap` height change réellement (100 % → 50 % → 5 %) via classes `body.panel-mid/open`. `setPanelState()` capture `priorBounds = map.getBounds()` AVANT le changement, puis boucle `requestAnimationFrame` sur 420 ms appelant `invalidateSize()` + `fitBounds(priorBounds)` à chaque frame. Résultat : la carte zoome out progressivement pendant qu'elle rétrécit, gardant exactement le même contenu géographique visible.
7. **Contrôles Leaflet réorganisés** :
   - `zoomControl: false` (suppression des +/-)
   - LayerControl (Carte/Satellite/PLU) : `topleft`, taille -10 % (61×41 px, font 0.54rem)
   - Pegman : `topright`, descendu à `top: 56px` sur desktop pour ne pas chevaucher `#map-count`
   - Attribution + footer : ancrés au bas de la carte rétrécie (`bottom: 10px`)
8. **Bouton "Modifier" → scroll top + focus** : `expandSearch()` scrolle le `.panel-scroll` à 0 dans tous les cas et focus le champ commune sur desktop.

### Recherche → SIG bridge

La landing pousse vers `./sig.html?commune=...&insee=...&surf_log=...&dpe=D&...`
Le bootstrap dans sig.html (à la fin du `<script>` principal) lit ces params, préremplit
le formulaire et appelle `doSearch()` automatiquement.

---

## 2. Backend API

### Localisation

- Serveur : Hetzner CX33, `62.238.18.248`
- Fichier : `/opt/parcelleid/api.py`
- Service systemd : `parcelleid.service`
- Logs : `journalctl -u parcelleid.service`

### Config uvicorn

```ini
# /etc/systemd/system/parcelleid.service
ExecStart=/opt/parcelleid/venv/bin/uvicorn api:app --host 0.0.0.0 --port 8000 --workers 4
```

### Pool psycopg2

```python
pg_pool = pool.ThreadedConnectionPool(
    minconn=2, maxconn=16,
    dbname="parcelleid_dev", user="parcelle_user",
    password=...,  # voir notes externes
    host="localhost", port="5432"
)
```

### Endpoints

| Méthode | URL | Rôle |
|---|---|---|
| `GET` | `/parcelles` | Recherche principale (cf. params ci-dessous) |
| `GET` | `/health` | Healthcheck (ping DB) — utilisé par cron heartbeat |
| `POST` | `/auth/*` | Auth via `auth.py` (Resend pour mail verif) |

### Params `/parcelles`

| Param | Type | Description |
|---|---|---|
| `insee` | str | Code INSEE de la commune (requis) |
| `surf` | float | Surface cadastrale ciblée |
| `tol` | float | Tolérance ± % pour `surf` |
| `surf_log` | float | Surface habitable ciblée |
| `tol_log` | float | Tolérance ± % pour `surf_log` (défaut 4) |
| `classe_energie` | str (A-G) | Filtre classe DPE |
| `classe_ges` | str (A-G) | Filtre classe GES |
| `date_dpe_min` | YYYY-MM-DD | Date diagnostic minimum |

### Architecture requête : 2 chemins

**Chemin précalculé** (`use_precomputed = (dept ∈ PRECOMPUTED_DEPTS) and has_dpe_filter`)
- Active dès qu'au moins 1 filtre DPE/GES/date/surf_log est posé ET dept précalculé
- `PRECOMPUTED_DEPTS = None` actuellement → toute la France
- SQL : filter `dpe` d'abord (utilise les nouveaux index), JOIN `parcelle_dpe_match`,
  filter par commune, ROW_NUMBER pour garder 1 ligne par parcelle, COUNT(*) pour `nb_logements`
- Permet le badge multi-logements

**Chemin fallback** (pas de filtre DPE)
- Utilise `parcelles.dpe_id` (mapping 1-1 historique)
- LATERAL subquery pour `nb_logements` (utilise PK composite de parcelle_dpe_match)

### Code clé de `/parcelles` (chemin précalculé)

```sql
WITH matching_dpe AS (
    SELECT d.id, d.classe_energie, d.classe_ges, d.date_diagnostic, d.surface_habitable
    FROM dpe d WHERE {dpe_where_clause}  -- utilise idx_dpe_*
),
matched AS (
    SELECT pdm.parcelle_gid, md.id AS dpe_pk, md.classe_energie, md.classe_ges,
           md.date_diagnostic, md.surface_habitable
    FROM matching_dpe md
    JOIN parcelle_dpe_match pdm ON pdm.dpe_id = md.id  -- via idx_pdm_dpe
),
in_commune AS (
    SELECT m.*, p.id AS parcelle_id, p.contenance, p.commune
    FROM matched m
    JOIN parcelles p ON p.gid = m.parcelle_gid  -- via PK
    WHERE {parc_where_clause}  -- p.commune = X [AND p.contenance BETWEEN]
),
ranked AS (
    SELECT *,
      ROW_NUMBER() OVER (PARTITION BY parcelle_gid ORDER BY dpe_pk) AS rn,
      COUNT(*) OVER (PARTITION BY parcelle_gid) AS nb_logements
    FROM in_commune
)
SELECT r.parcelle_id, r.contenance, r.commune,
       ST_AsGeoJSON(p.geom) AS geom_json,  -- ⚠️ APRÈS le filtre, pas dans in_commune
       r.classe_energie, r.classe_ges, r.date_diagnostic, r.surface_habitable,
       r.nb_logements
FROM ranked r JOIN parcelles p ON p.gid = r.parcelle_gid
WHERE r.rn = 1
ORDER BY r.contenance
```

**Note perf critique** : `ST_AsGeoJSON` est dans le SELECT final, PAS dans `in_commune`,
sinon on convertit en GeoJSON 1485 parcelles (Paris 1er) au lieu de ~70 retenues = 5s économisées.

### Code clé de `/parcelles` (fallback)

```sql
SELECT p.id, p.contenance, p.commune, ST_AsGeoJSON(p.geom),
       d.classe_energie, d.classe_ges, d.date_diagnostic, d.surface_habitable,
       COALESCE(c.nb, 1) AS nb_logements
FROM parcelles p
LEFT JOIN dpe d ON p.dpe_id = d.id
LEFT JOIN LATERAL (
    SELECT COUNT(*)::int AS nb
    FROM parcelle_dpe_match pdm WHERE pdm.parcelle_gid = p.gid
) c ON true
WHERE {where_clause}
ORDER BY p.contenance
```

### Déploiement API

```bash
# scp local → serveur
scp api.py root@62.238.18.248:/opt/parcelleid/api.py

# Sur le serveur, toujours backup avant modif
cp /opt/parcelleid/api.py /opt/parcelleid/api.py.bak.$(date +%Y%m%d-%H%M%S)
systemctl restart parcelleid.service
```

---

## 3. Base de données

### Schéma résumé

| Table | Lignes | Total | Données | Indexes |
|---|---|---|---|---|
| `parcelles` | 35 M | 39 GB | 30 GB | 8.9 GB |
| `dpe` | 14.7 M | 7.5 GB | 4.2 GB | 3.3 GB |
| `parcelle_dpe_match` | 8.6 M | 786 MB | 298 MB | 488 MB |
| `ban` | 261 K (dpt 72 only) | 55 MB | — | — |

### Inventaire des index (état final optimisé)

**`parcelles`** :
- `parcelles_finale_pkey` (gid PK, 1.7 GB)
- `idx_p_commune_cont` (commune, contenance, 3.6 GB) — composite, sert aussi pour commune seule
- `idx_pf_geom` (GiST geom, 3.5 GB) — critique pour ST_Contains du précalcul

**`dpe`** :
- `dpe_pkey` (id PK, 782 MB)
- `idx_dpe_geom` (GiST geom, 1.3 GB) — pour ST_Contains du pipeline hebdo
- `idx_dpe_surface_habitable` (316 MB)
- `idx_dpe_classe_energie` (260 MB)
- `idx_dpe_classe_ges` (97 MB)
- `idx_dpe_date_diagnostic` (98 MB)
- `uq_dpe_numero_dpe` (UNIQUE, 443 MB) — critique pour UPSERT pipeline

**`parcelle_dpe_match`** :
- `parcelle_dpe_match_pkey` (parcelle_gid, dpe_id, 246 MB)
- `idx_pdm_dpe` (dpe_id seul, 241 MB)

### Indexes supprimés (économie 1.82 GB, après audit)

- ~~`idx_pf_commune`~~ (parcelles) — redondant avec composite
- ~~`idx_parcelles_dpe`~~ (parcelles) — jamais utilisé dans les requêtes API
- ~~`idx_dpe_commune`~~ (dpe) — plus utilisé depuis `parcelle_dpe_match`
- ~~`idx_pdm_parcelle`~~ (parcelle_dpe_match) — couvert par PK leftmost

### Indexes ajoutés (+860 MB, capacités essentielles)

```sql
CREATE INDEX CONCURRENTLY idx_dpe_classe_ges ON dpe(classe_ges);
CREATE INDEX CONCURRENTLY idx_dpe_date_diagnostic ON dpe(date_diagnostic);
CREATE UNIQUE INDEX CONCURRENTLY uq_dpe_numero_dpe ON dpe(numero_dpe);
```

### Table parcelle_dpe_match — précalcul

Many-to-many entre `parcelles.gid` et `dpe.id`, peuplée par :

```sql
INSERT INTO parcelle_dpe_match (parcelle_gid, dpe_id)
SELECT p.gid, d.id
FROM parcelles p
JOIN dpe d ON ST_Contains(p.geom, d.geom)
ON CONFLICT DO NOTHING;
```

Durée : **~4h48** pour toute la France (8.63M lignes). Paris seul : 3min40s.

### Bug DOM (corrigé) — coords aberrantes

**Symptôme** : parcelles Pointe-à-Pitre affichées dans le golfe de Guinée.
**Cause** : le script d'import DPE utilisait `Transformer.from_crs("EPSG:2154", ...)` (Lambert 93)
qui n'est valide qu'en métropole. Les DOM ont leurs propres CRS locaux.
**Fix appliqué** : reprojection batch des 666K parcelles DOM via :

```sql
-- Pour 971/972 Antilles
UPDATE parcelles SET geom = ST_Transform(ST_SetSRID(ST_Transform(geom, 2154), 5490), 4326)
WHERE LEFT(commune, 3) IN ('971','972');

-- 973 Guyane : SRID 2972 (RGFG95/UTM 22N)
-- 974 Réunion : SRID 2975 (RGR92/UTM 40S)
-- 976 Mayotte : SRID 4471 (RGM04/UTM 38S)
```

La même logique est dans `update_dpe.py` via dictionnaire `DOM_CRS`.

---

## 4. Pipeline DPE (script + cron)

### Fichier `/opt/update_dpe.py`

Tourne 2× par semaine (mardi+vendredi 19h). Logique :

1. `cutoff = MAX(date_diagnostic) - 7 jours` (marge sécurité)
2. Fetch ADEME via `qs=date_etablissement_dpe:[CUTOFF TO *]`
3. Routing CRS source selon `code_postal[:3]` (DOM_CRS dict)
4. UPSERT `INSERT ... ON CONFLICT (numero_dpe) DO NOTHING RETURNING id`
5. Pour les nouveaux IDs : INSERT parcelle_dpe_match via ST_Contains
6. Lock file `/var/run/parcelleid-update.lock` (évite double-execution)
7. Logs vers `/var/log/parcelleid-dpe.log`
8. Healthchecks.io : ping success en fin, ping `/fail` si exception

Test dry-run :
```bash
/opt/parcelleid/venv/bin/python3 /opt/update_dpe.py --dry-run
```

### Cron entries

**`/etc/cron.d/parcelleid-dpe-update`** :
```cron
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
0 19 * * 2,5 root /opt/parcelleid/venv/bin/python3 /opt/update_dpe.py 2>&1 | logger -t parcelleid-dpe
```

**`/etc/cron.d/parcelleid-heartbeat`** :
```cron
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
*/5 * * * * root curl -sS --max-time 10 https://parcelleid.duckdns.org/health | grep -q '"ok":true' && curl -sS -m 10 https://hc-ping.com/74769651-410e-4242-bba7-de0946b40680 > /dev/null
```

### Monitoring Healthchecks.io

| Check | UUID | Schedule |
|---|---|---|
| API Heartbeat | `74769651-410e-4242-bba7-de0946b40680` | period 1h, grace 1h |
| Pipeline DPE | `c66b01e1-770c-4eb5-a92c-deaec1198299` | period 3 jours, grace 1h |

**Note** : pour le pipeline DPE, idéalement passer en mode cron schedule `0 19 * * 2,5`
sur HC.io (sinon faux positif sur l'écart Vendredi→Mardi de 4 jours).

### Résultats run inaugural (17 mai 2026)

- Seen : 110 781 candidats depuis 2026-04-27
- New : 4 949 vraiment nouveaux (les autres déjà en base via UNIQUE numero_dpe)
- Mapped : 2 775 nouveaux liés à une parcelle (les 2174 restants ont géom mais imprécisions GPS hors parcelle)
- Durée : ~90s

---

## 5. Données DPE — état actuel

| Métrique | Valeur |
|---|---|
| Total DPE | 14.7 M |
| DPE avec géom | 14.3 M (97 %) |
| DPE liés à parcelle via `parcelles.dpe_id` (legacy 1-1) | 4.78 M |
| Mappings via `parcelle_dpe_match` (many-to-many) | 8.63 M |
| Date max DPE | 2026-05-04 |

Le mapping many-to-many capture les immeubles : à Bordeaux on a trouvé un immeuble avec
**103 logements 55m²** sur une même parcelle, à Paris jusqu'à 13 logements 33m², à Marseille
**1338 logements DPE** sur une parcelle de 40 450m² (grande résidence).

---

## 6. Performance

### Bench actuel Paris 20 arrondissements en parallèle

| Requête | Temps moyen |
|---|---|
| `surf_log=33` | 7.8 s |
| `surf_log=33 + DPE=E` | 6.8 s |
| `surf_log=33 + GES=D` | 6.4 s |
| `surf_log=33 + date >= 2026-03-12` | 6.4 s |
| `GES=D` seul | 9.7 s |
| `date >= X` seul | 7.6 s |

Recherches multi-critères (3 filtres) typiquement **<7 s**, certains cas (M9 = 100m² hab + 500m² parcelle + DPE C) à **0.95s**.

Les recherches "single critère très large" (`DPE=D` seul → 42K résultats) restent à 15s, principalement coût de sérialisation GeoJSON, pas DB.

---

## 7. Site marketing LocaliseImmo

Pages publiques (domaine custom `localiseimmo.fr` via CNAME GitHub Pages) :
- `https://localiseimmo.fr/` → landing LocaliseImmo
- `https://localiseimmo.fr/comment-ca-marche.html`
- `https://localiseimmo.fr/sources.html`
- `https://localiseimmo.fr/blog.html`
- `https://localiseimmo.fr/article.html`
- `https://localiseimmo.fr/sig.html` → outil cadastre (ancien `index.html`)
- `https://localiseimmo.fr/robots.txt` · `https://localiseimmo.fr/sitemap.xml` (SEO, cf. §13)

Le bouton "Géolocaliser l'annonce" envoie les paramètres en query string vers `sig.html`,
qui les lit via `sig-bootstrap.js` et lance la recherche automatiquement.

---

## 8. Cleanup serveur

Supprimés sans regret :
- `/opt/cadastre-import/parcelles_72.zip` + `batiments_72.zip` + tmp_*/ (~720 MB)
- Journal systemd vacuumed à 100 MB (-444 MB)

Conservés (encore utiles ou backups) :
- `/opt/parcelleid/parcelles.dump` (130 MB) — backup
- `/opt/dpe_final.csv` (1.65 GB) — source d'import historique
- `/opt/parcelleid/api.py.bak.*` — historique versions API

### Fichiers du repo non servis en production (backups / archives)

Présents dans le dépôt mais ne faisant pas partie du site live — à connaître pour éviter
toute confusion ou édition par erreur :

| Fichier | Taille | Rôle |
|---|---|---|
| `sig.backup.html` | ~122 Ko | Backup de `sig.html` **avant** la refonte mobile Airbnb-style (cf. §1). Référencé nulle part. |
| `parcelleid-v5-method2-local.html` | ~32 Ko | Ancienne version « method2 » de l'outil (titre encore « ParcelleID »), prototype local. Référencé nulle part. |
| `assets/loader.html` | ~101 Ko | Écran de chargement, **encore référencé** par 2 fichiers — ne pas considérer comme orphelin. |

> Note : les `*.bak` / `*.bak.*` sont déjà ignorés via `.gitignore`. Les fichiers ci-dessus
> n'ont pas ce suffixe et sont donc versionnés — décision de nettoyage à prendre séparément.

---

## 9. Commandes utiles

### SSH
```bash
ssh root@62.238.18.248
```

### DB
```bash
export PGPASSWORD='...'   # voir notes
psql -U parcelle_user -d parcelleid_dev -h localhost
```

### Test API
```bash
# Healthcheck
curl https://parcelleid.duckdns.org/health

# Recherche complète
curl "https://parcelleid.duckdns.org/parcelles?insee=75101&surf_log=33&tol_log=4&classe_energie=D"
```

### Pipeline manuel
```bash
# Test dry-run
/opt/parcelleid/venv/bin/python3 /opt/update_dpe.py --dry-run

# Run réel
/opt/parcelleid/venv/bin/python3 /opt/update_dpe.py
```

### Cron
```bash
ls /etc/cron.d/parcelleid-*
journalctl -t parcelleid-dpe -n 50    # logs cron
tail -f /var/log/parcelleid-dpe.log    # logs pipeline
```

### Restart API après modif
```bash
cp /opt/parcelleid/api.py /opt/parcelleid/api.py.bak.$(date +%Y%m%d-%H%M%S)
systemctl restart parcelleid.service
systemctl status parcelleid.service
```

---

## 10. Tâches futures envisagées

- **Re-importer les DPE DOM** une fois que ADEME en aura plus (actuellement 25 seulement)
- **Partitioning de `dpe` par département** (gros chantier, utile au-delà de 30M lignes)
- **Endpoint multi-INSEE** pour réduire les 20 appels parallèles Paris en 1 seul
- **Simplifier les géométries** (`ST_SimplifyPreserveTopology`) pour les zooms larges
- **Limiter LIMIT 1000** sur les recherches single-critère très larges
- **Page "Tarifs"** sur le marketing (lien encore `href="#"` dans Landing/BlogHub/Article).
  ✅ Mentions légales + Confidentialité désormais créées (`mentions-legales.html`, `confidentialite.html`)
- **Pipeline upgrade** : passer ON CONFLICT DO NOTHING → DO UPDATE si ADEME publie des corrections

---

## 11. Stack technique

| Layer | Tech |
|---|---|
| Front | HTML + vanilla JS + Leaflet 1.9 (sig.html) + React 18 sur les 5 pages marketing via Babel standalone (build production depuis §13) |
| API | Python 3.12 + FastAPI + uvicorn (4 workers) + psycopg2 (pool 16) |
| DB | PostgreSQL 16 + PostGIS |
| Server | Hetzner CX33, Ubuntu 24.04 |
| Hosting front | GitHub Pages (repo `jowanmab/parcelleid`) |
| API host | `https://parcelleid.duckdns.org` |
| Monitoring | Healthchecks.io (2 checks gratuits) |
| Email | Resend (clé dans `auth.py`) |

---

## 12. Décisions architecturales clés (et pourquoi)

1. **Many-to-many `parcelle_dpe_match` plutôt que 1-1 `parcelles.dpe_id`**
   → Capture les immeubles multi-logements (Bordeaux 103 logements, Marseille 1338, Paris jusqu'à 13). L'ancien `dpe_id` 1-1 fait perdre 67% des DPE (9.94M sur 14.7M).

2. **2 chemins SQL** (précalculé / fallback) plutôt qu'un seul unifié
   → Le fallback (sans filtre DPE) reste rapide via PK simple, sans payer le coût du window function.

3. **`ST_AsGeoJSON` après le filtrage** plutôt qu'avant
   → Conversion de 70 géométries au lieu de 1485 = 5s économisées sur Paris 1er.

4. **UNIQUE sur `numero_dpe`** (vs index simple)
   → Permet `ON CONFLICT DO NOTHING` pour le pipeline UPSERT. Zero duplicate possible.

5. **Healthchecks.io** (vs Resend custom)
   → 5 min de setup vs 50 lignes de Python à maintenir. Free tier suffit.

6. **Backup obligatoire `api.py.bak.TIMESTAMP`** avant chaque modif
   → 1 fois on a eu un crash post-modif, restauré en 30s via backup.

---

## 13. SEO & indexation Google (session 1er juin 2026)

### Problème de départ

`localiseimmo.fr` était **invisible sur Google** : `site:localiseimmo.fr` → 0 résultat, et
le site n'apparaissait même pas en tapant son nom. Trois causes identifiées :

1. **Contenu rendu 100 % côté client** : le `<body>` ne contenait qu'un `<div id="root">`
   vide, tout le HTML étant généré dans le navigateur par React + `@babel/standalone`.
   Googlebot ne voyait aucun texte à indexer.
2. **Aucun `robots.txt` ni `sitemap.xml`** : pas de carte du site pour les crawlers.
3. **Aucune balise SEO** : pas de `meta description`, canonical, Open Graph.

À cela s'ajoutait que le site n'avait jamais été soumis à Google Search Console.

### PR #2 — Rendre le site indexable (mergée)

- **`robots.txt`** (`Allow: /` + lien sitemap) et **`sitemap.xml`** (7 pages publiques).
- **Contenu HTML statique de secours** injecté dans chaque page React (`index`,
  `comment-ca-marche`, `sources`, `blog`, `article`) : `<h1>`, intro, points clés, liens
  internes — lus par Google, puis **remplacés automatiquement** par l'app React au chargement
  (transparent pour les visiteurs).
- **Balises SEO** sur toutes les pages : `meta description`, `link canonical`, Open Graph,
  `robots index,follow`, titres enrichis. Canonical ajouté aussi sur les pages légales.

### PR #3 — Renforcement SEO (mergée)

- **Données structurées Schema.org (JSON-LD)** :
  - Accueil : `Organization` + `WebSite` + `WebApplication` (gratuit, langue, catégorie).
  - `comment-ca-marche.html` : `FAQPage` (5 questions) → éligible à l'affichage enrichi Google.
- **Contenu d'accueil optimisé** : `<h1>` ciblé « Géolocaliser une annonce immobilière »,
  `<h2>`/`<h3>`, section méthode + mini-FAQ textuelle, mots-clés (cadastre, parcelle, DVF, IGN).
- **Performance** : React passé en **build production** (`*.production.min.js`) sur les 5 pages
  (au lieu des builds `development` lourds) + `preconnect`/`dns-prefetch` vers `unpkg`/`umami`.
- **Cohérence de marque** : ancien nom « ScanImmo » corrigé en « LocaliseImmo » dans tous les
  composants (`Article`, `Sources`, `BlogHub`, `CommentCaMarche`).

> ⚠️ **Dette technique introduite** : les attributs `integrity` (SRI) des scripts React/Babel
> ont été retirés (impossible de calculer les empreintes des builds production dans
> l'environnement Claude, réseau restreint). À recalculer et réajouter quand possible.

### Google Search Console — configuration effectuée

- **Propriété « Domaine »** `localiseimmo.fr` validée via enregistrement **TXT DNS chez OVH**
  (sous-domaine `@`, valeur `google-site-verification=u0t8cQwTEGCA4TS7v4Xsl3gl63KZN1pSfpkKKn0d2o0`).
  ⚠️ Ne jamais supprimer ce TXT (Google revérifie périodiquement).
- **Sitemap soumis** : `sitemap.xml` (statut « Réussite »).
- Note OVH : pour une propriété « Domaine », le champ Sitemaps n'a pas de préfixe prérempli
  → saisir `sitemap.xml` (ou l'URL complète selon l'écran).

### Reste à faire — SEO

- [ ] **Demander l'indexation** des pages clés dans Search Console (« Inspecter une URL » →
      `https://localiseimmo.fr/` et `/comment-ca-marche.html` → « Demander une indexation »).
- [ ] **Vérifier les données structurées** sur search.google.com/test/rich-results.
- [ ] **Surveiller le rapport « Pages »** (ex-Couverture) sous 1-3 semaines : repérer les
      statuts « Détectée, actuellement non indexée » ou erreurs.
- [ ] **Recalculer les hash SRI** des builds React/Babel production et réintégrer `integrity`.
- [ ] **Publier des articles de blog optimisés** (le vrai levier de trafic) : ex. « Retrouver
      l'adresse d'une annonce Leboncoin/SeLoger », « Comprendre le cadastre », « Lire le DVF ».
- [ ] **(Optionnel, gros chantier)** Pré-compiler le JSX (Vite/esbuild) pour supprimer
      `@babel/standalone` au runtime → rendu plus rapide et fiable, meilleur SEO.

### Attentes réalistes

- Sur le **nom de marque « localiseimmo »** : position #1 quasi certaine sous quelques jours.
- Sur les **requêtes génériques** : fondations techniques posées, mais le classement dépend du
  **temps** (Google teste les nouveaux sites des semaines/mois) et de la **notoriété** (liens
  entrants, trafic, contenu). Pas de garantie de 1ʳᵉ page par la seule technique.

---

## Glossaire mini

- **GiST** : Generalized Search Tree, index spatial Postgres pour requêtes ST_Contains/ST_DWithin
- **parcelle_dpe_match** : table many-to-many de mappings spatiaux (parcelle_gid, dpe_id)
- **ROW_NUMBER OVER (PARTITION BY)** : window function SQL pour garder 1 ligne par groupe
- **UPSERT** : INSERT ... ON CONFLICT DO NOTHING (ou DO UPDATE)
- **CRS** : Coordinate Reference System (Lambert 93 = 2154, RGAF09/UTM 20N = 5490, etc.)

---

_Initié à l'issue de la session du 17 mai 2026. Dernière mise à jour : 1er juin 2026 (SEO & indexation)._
