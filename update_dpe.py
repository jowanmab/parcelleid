#!/usr/bin/env python3
"""
ParcelleID - Mise a jour incrementale DPE depuis ADEME.

Tourne 2x/semaine (mardi & vendredi 19h via cron). Recupere les DPE
dont date_etablissement_dpe >= max(date_diagnostic) actuel - 7 jours
(marge securite). UPSERT via cle numero_dpe (ON CONFLICT DO NOTHING).
Mappe spatialement les nouveaux DPE aux parcelles.

Important - CRS source par dept :
  - Metropole : Lambert 93 (EPSG:2154)
  - 971/972 Antilles : RGAF09 / UTM 20N (EPSG:5490)
  - 973 Guyane : RGFG95 / UTM 22N (EPSG:2972)
  - 974 Reunion : RGR92 / UTM 40S (EPSG:2975)
  - 976 Mayotte : RGM04 / UTM 38S (EPSG:4471)
"""
import os, sys, logging, time, fcntl
from datetime import date, timedelta

import requests
import psycopg2
from psycopg2.extras import execute_values
from pyproj import Transformer

DB_PARAMS = dict(dbname="parcelleid_dev", user="parcelle_user",
                 password="Siderm7433", host="localhost", port="5432")

API_URL = "https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant/lines"
SELECT_FIELDS = ("numero_dpe,date_etablissement_dpe,adresse_ban,adresse_brut,"
                 "code_postal_brut,nom_commune_brut,etiquette_dpe,etiquette_ges,"
                 "surface_habitable_logement,coordonnee_cartographique_x_ban,"
                 "coordonnee_cartographique_y_ban")
PAGE_SIZE = 10000
BATCH_SIZE = 1000
CUTOFF_OVERLAP_DAYS = 7

LOG_FILE = "/var/log/parcelleid-dpe.log"
LOCK_FILE = "/var/run/parcelleid-update.lock"

# Healthchecks.io : ping success en fin de run, ping /fail si exception.
HC_PIPELINE = "https://hc-ping.com/c66b01e1-770c-4eb5-a92c-deaec1198299"

DOM_CRS = {"971": "EPSG:5490", "972": "EPSG:5490", "973": "EPSG:2972",
           "974": "EPSG:2975", "976": "EPSG:4471"}
METROPOLE_CRS = "EPSG:2154"

_t_cache = {}
def get_transformer(code_postal):
    cp = (str(code_postal) if code_postal is not None else "")[:3]
    src = DOM_CRS.get(cp, METROPOLE_CRS)
    if src not in _t_cache:
        _t_cache[src] = Transformer.from_crs(src, "EPSG:4326", always_xy=True)
    return _t_cache[src]


def get_cutoff(conn):
    cur = conn.cursor()
    cur.execute("SELECT MAX(date_diagnostic) FROM dpe")
    row = cur.fetchone()
    cur.close()
    if row and row[0]:
        return row[0] - timedelta(days=CUTOFF_OVERLAP_DAYS)
    return date(2021, 7, 1)


def insert_batch(conn, items):
    if not items:
        return []
    rows = []
    for it in items:
        cp = it.get("code_postal_brut")
        x = it.get("coordonnee_cartographique_x_ban")
        y = it.get("coordonnee_cartographique_y_ban")
        lon, lat = None, None
        if x is not None and y is not None and cp is not None:
            try:
                lon, lat = get_transformer(cp).transform(x, y)
            except Exception as e:
                logging.warning("transform failed cp=%s: %s", cp, e)
        rows.append((
            it.get("numero_dpe"),
            it.get("date_etablissement_dpe"),
            it.get("adresse_ban") or it.get("adresse_brut"),
            str(cp) if cp is not None else None,
            it.get("nom_commune_brut"),
            it.get("etiquette_dpe"),
            it.get("etiquette_ges"),
            it.get("surface_habitable_logement"),
            lon, lat,
        ))
    cur = conn.cursor()
    execute_values(cur, """
        INSERT INTO dpe (numero_dpe, date_diagnostic, adresse, code_postal,
                          commune, classe_energie, classe_ges, surface_habitable,
                          longitude, latitude)
        VALUES %s
        ON CONFLICT (numero_dpe) DO NOTHING
        RETURNING id
    """, rows)
    new_ids = [r[0] for r in cur.fetchall()]
    if new_ids:
        cur.execute("""
            UPDATE dpe SET geom = ST_SetSRID(ST_Point(longitude, latitude), 4326)
            WHERE id = ANY(%s) AND longitude IS NOT NULL AND latitude IS NOT NULL
        """, (new_ids,))
    conn.commit()
    cur.close()
    return new_ids


def map_to_parcels(conn, new_ids):
    """
    Mappe chaque nouveau DPE a UNE parcelle (la plus proche dans 10m).
    Si le point DPE est a >10m de toute parcelle, il n'est pas mappe
    (acceptable : mieux vaut "pas mappe" que "mappe au mauvais voisin").
    """
    if not new_ids:
        return 0
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO parcelle_dpe_match (dpe_id, parcelle_gid)
        SELECT d.id, closest.gid
        FROM dpe d
        CROSS JOIN LATERAL (
          SELECT p.gid FROM parcelles p
          WHERE ST_DWithin(p.geom, d.geom, 0.00015)  -- ~15m
          ORDER BY ST_Distance(p.geom, d.geom)
          LIMIT 1
        ) closest
        WHERE d.id = ANY(%s) AND d.geom IS NOT NULL
        ON CONFLICT (dpe_id) DO NOTHING
    """, (new_ids,))
    n = cur.rowcount
    conn.commit()
    cur.close()
    return n


def fetch_since(cutoff_date):
    params = {"size": PAGE_SIZE, "select": SELECT_FIELDS,
              "qs": f"date_etablissement_dpe:[{cutoff_date.isoformat()} TO *]"}
    next_url = None
    while True:
        for retry in range(3):
            try:
                if next_url:
                    r = requests.get(next_url, timeout=120)
                else:
                    r = requests.get(API_URL, params=params, timeout=120)
                r.raise_for_status()
                data = r.json()
                break
            except Exception as e:
                logging.warning("ADEME fetch error (retry %d): %s", retry+1, e)
                time.sleep(5 * (retry+1))
        else:
            raise RuntimeError("ADEME unreachable after 3 retries")
        results = data.get("results", [])
        if not results:
            break
        for item in results:
            yield item
        next_url = data.get("next")
        if not next_url:
            break
        time.sleep(0.2)


def main(dry_run=False):
    if not dry_run:
        lock_fd = open(LOCK_FILE, "w")
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except IOError:
            logging.error("Lock held by another instance, exiting")
            sys.exit(1)

    conn = psycopg2.connect(**DB_PARAMS)
    cutoff = get_cutoff(conn)
    logging.info("=== START run (dry_run=%s). Cutoff=%s ===", dry_run, cutoff)

    batch = []
    seen = new_total = mapped_total = 0
    try:
        for item in fetch_since(cutoff):
            batch.append(item)
            seen += 1
            if len(batch) >= BATCH_SIZE:
                if dry_run:
                    new_total += len(batch)
                else:
                    new_ids = insert_batch(conn, batch)
                    mapped_total += map_to_parcels(conn, new_ids)
                    new_total += len(new_ids)
                batch = []
                if seen % 10000 == 0:
                    logging.info("... %d seen, %d new, %d mapped", seen, new_total, mapped_total)
        if batch:
            if dry_run:
                new_total += len(batch)
            else:
                new_ids = insert_batch(conn, batch)
                mapped_total += map_to_parcels(conn, new_ids)
                new_total += len(new_ids)
        logging.info("=== END. Seen=%d, New=%d, Mapped=%d ===", seen, new_total, mapped_total)
        if not dry_run:
            try:
                requests.get(HC_PIPELINE, timeout=10,
                             data=f"Seen={seen}, New={new_total}, Mapped={mapped_total}".encode())
            except Exception as e:
                logging.warning("Healthchecks ping failed: %s", e)
        return 0
    except Exception as e:
        logging.exception("FATAL: %s", e)
        if not dry_run:
            try:
                requests.get(HC_PIPELINE + "/fail", timeout=10,
                             data=f"FATAL: {e}".encode())
            except Exception:
                pass
        return 2
    finally:
        conn.close()
        if not dry_run:
            try: os.unlink(LOCK_FILE)
            except: pass


if __name__ == "__main__":
    logging.basicConfig(filename=LOG_FILE, level=logging.INFO,
                        format="%(asctime)s [%(levelname)s] %(message)s")
    sh = logging.StreamHandler(sys.stderr)
    sh.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))
    logging.getLogger().addHandler(sh)
    sys.exit(main(dry_run="--dry-run" in sys.argv))
