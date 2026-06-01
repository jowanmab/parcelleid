# LocaliseImmo / ParcelleID

**Retrouvez l'adresse exacte d'une annonce immobilière** à partir de la surface du terrain
et des informations du logement, grâce aux données cadastrales officielles françaises (IGN,
DGFiP, DVF). Gratuit, sans inscription.

🌐 Site en ligne : **https://localiseimmo.fr**

---

## Ce que fait le projet

À partir des informations publiques d'une annonce (commune, surface, classe énergétique),
LocaliseImmo croise le cadastre officiel, l'imagerie satellite IGN, le PLU et la base DVF
pour identifier la ou les parcelles compatibles, puis affiche l'emplacement exact sur une
carte interactive — avec le voisinage, les commerces, les transports et l'historique des ventes.

- **35 000 communes** françaises couvertes
- **~30 s** par géolocalisation
- Données **100 % publiques** sous Licence Ouverte Etalab (IGN, DGFiP, Etalab/DVF, geo.api.gouv.fr)

## Structure du dépôt

Le dépôt contient **le front** (site statique hébergé sur GitHub Pages). L'API et la base de
données tournent sur un serveur séparé (voir [`SESSION_RECAP.md`](./SESSION_RECAP.md)).

| Élément | Description |
|---|---|
| `index.html` | Landing LocaliseImmo (React via Babel standalone) |
| `comment-ca-marche.html`, `sources.html`, `blog.html`, `article.html` | Pages marketing (React) |
| `mentions-legales.html`, `confidentialite.html` | Pages légales (HTML statique, RGPD) |
| `sig.html` | Outil SIG / carte cadastre (Leaflet) — cœur applicatif |
| `sig-bootstrap.js` | Préremplit le formulaire de `sig.html` via les paramètres d'URL |
| `js/*.jsx` | Composants React des pages marketing |
| `image-slot.js` | Web Component pour photos remplaçables |
| `styles.css`, `tokens.css` | Styles (palette sage + pêche) |
| `assets/` | Logos, illustrations, favicon |
| `auth.py`, `update_dpe.py` | Scripts côté serveur (auth, pipeline DPE) — déployés hors GitHub Pages |
| `robots.txt`, `sitemap.xml`, `CNAME` | SEO + domaine custom GitHub Pages |

> Fichiers d'archive non servis en production : `sig.backup.html`,
> `parcelleid-v5-method2-local.html` (voir §8 du recap).

## Lancer le site en local

Le front est 100 % statique — un simple serveur HTTP suffit :

```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080/
```

> Note : les pages marketing compilent le JSX dans le navigateur via `@babel/standalone`.
> La recherche réelle appelle l'API de production (`https://parcelleid.duckdns.org`).

## Architecture (vue d'ensemble)

```
Navigateur ──> GitHub Pages (front statique, localiseimmo.fr)
                   │
                   └─ sig.html ──> API FastAPI (Hetzner) ──> PostgreSQL + PostGIS
                                       (parcelles, dpe, parcelle_dpe_match)
```

| Couche | Techno |
|---|---|
| Front | HTML + JS + Leaflet 1.9 + React 18 (Babel standalone, build production) |
| API | Python 3.12 + FastAPI + uvicorn + psycopg2 |
| Base | PostgreSQL 16 + PostGIS |
| Hébergement front | GitHub Pages (domaine custom `localiseimmo.fr`) |
| Analytics | Umami Cloud |

## Documentation

📘 **[`SESSION_RECAP.md`](./SESSION_RECAP.md)** — documentation technique détaillée : frontend,
API, schéma de base, pipeline DPE, performance, SEO/indexation, décisions architecturales et
tâches futures.

---

_Projet personnel — non affilié à un organisme public. Données cadastrales : IGN / Cadastre
officiel français, Licence Ouverte Etalab._
