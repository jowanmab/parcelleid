#!/usr/bin/env python3
"""
Compare le positionnement XY fourni par ADEME (coordonnee_cartographique_*_ban)
avec ce que retourne l'API BAN officielle pour la meme adresse.

Tire N points au hasard (defaut 200) parmi les DPE recents de l'ADEME,
reprojette les coords ADEME (Lambert 93 metropole / CRS locaux DOM) en WGS84,
puis geocode l'adresse via api-adresse.data.gouv.fr. Calcule la distance
haversine entre les deux points et imprime des stats agreges.

Usage : python3 compare_ademe_ban_xy.py [--n 200] [--seed 42]
Necessite : requests, pyproj.
"""
import argparse
import random
import sys
import time
from math import asin, cos, radians, sin, sqrt
from statistics import mean, median

import requests
from pyproj import Transformer

ADEME_URL = "https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant/lines"
BAN_URL = "https://api-adresse.data.gouv.fr/search/"

ADEME_FIELDS = ",".join([
    "numero_dpe",
    "adresse_ban",
    "adresse_brut",
    "code_postal_brut",
    "nom_commune_brut",
    "coordonnee_cartographique_x_ban",
    "coordonnee_cartographique_y_ban",
])

DOM_CRS = {
    "971": "EPSG:5490", "972": "EPSG:5490", "973": "EPSG:2972",
    "974": "EPSG:2975", "976": "EPSG:4471",
}
METROPOLE_CRS = "EPSG:2154"

_t_cache = {}
def transformer_for(cp):
    cp3 = (str(cp) if cp is not None else "")[:3]
    src = DOM_CRS.get(cp3, METROPOLE_CRS)
    if src not in _t_cache:
        _t_cache[src] = Transformer.from_crs(src, "EPSG:4326", always_xy=True)
    return _t_cache[src]


def haversine_m(lon1, lat1, lon2, lat2):
    R = 6371008.8
    lon1, lat1, lon2, lat2 = map(radians, (lon1, lat1, lon2, lat2))
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return 2 * R * asin(sqrt(a))


def fetch_ademe_pool(pool_size=2000):
    """Fetch a single page from ADEME to sample from."""
    r = requests.get(
        ADEME_URL,
        params={"size": pool_size, "select": ADEME_FIELDS},
        timeout=120,
    )
    r.raise_for_status()
    return r.json().get("results", [])


def geocode_ban(addr, cp=None):
    params = {"q": addr, "limit": 1, "autocomplete": 0}
    if cp:
        params["postcode"] = str(cp)
    r = requests.get(BAN_URL, params=params, timeout=30)
    if r.status_code != 200:
        return None
    feats = r.json().get("features", [])
    if not feats:
        return None
    f = feats[0]
    lon, lat = f["geometry"]["coordinates"]
    props = f.get("properties", {})
    return {
        "lon": lon,
        "lat": lat,
        "label": props.get("label"),
        "score": props.get("score"),
        "type": props.get("type"),
    }


def percentile(sorted_vals, p):
    if not sorted_vals:
        return None
    k = (len(sorted_vals) - 1) * p / 100
    f = int(k)
    c = min(f + 1, len(sorted_vals) - 1)
    if f == c:
        return sorted_vals[f]
    return sorted_vals[f] + (sorted_vals[c] - sorted_vals[f]) * (k - f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=200, help="Number of points to compare")
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--pool", type=int, default=2000,
                    help="Size of ADEME page to sample from")
    args = ap.parse_args()

    random.seed(args.seed)
    print(f"Fetching pool of {args.pool} DPE from ADEME...", file=sys.stderr)
    pool = fetch_ademe_pool(args.pool)
    print(f"  got {len(pool)} records", file=sys.stderr)

    eligible = [r for r in pool
                if r.get("coordonnee_cartographique_x_ban") is not None
                and r.get("coordonnee_cartographique_y_ban") is not None
                and (r.get("adresse_ban") or r.get("adresse_brut"))]
    print(f"  {len(eligible)} have both XY_ban and an address", file=sys.stderr)

    sample = random.sample(eligible, min(args.n, len(eligible)))
    print(f"Comparing {len(sample)} points...\n", file=sys.stderr)

    distances = []
    not_found = 0
    exact = 0
    worst = []

    for i, rec in enumerate(sample, 1):
        cp = rec.get("code_postal_brut")
        x = rec["coordonnee_cartographique_x_ban"]
        y = rec["coordonnee_cartographique_y_ban"]
        addr = rec.get("adresse_ban") or rec.get("adresse_brut")

        try:
            lon_ademe, lat_ademe = transformer_for(cp).transform(x, y)
        except Exception as e:
            print(f"  [{i}] proj failed cp={cp}: {e}", file=sys.stderr)
            continue

        ban = geocode_ban(addr, cp)
        time.sleep(0.05)  # courtesy throttle (BAN allows 50 req/s)

        if not ban:
            not_found += 1
            continue

        d = haversine_m(lon_ademe, lat_ademe, ban["lon"], ban["lat"])
        distances.append(d)
        if d < 0.01:
            exact += 1
        worst.append((d, addr, cp, lon_ademe, lat_ademe, ban["lon"], ban["lat"],
                      ban.get("score"), ban.get("type")))

        if i % 25 == 0:
            print(f"  ... {i}/{len(sample)} done", file=sys.stderr)

    distances.sort()
    worst.sort(reverse=True)

    print("\n" + "=" * 72)
    print(f"Compared:        {len(distances)} / {len(sample)}")
    print(f"Not found BAN:   {not_found}")
    print("-" * 72)
    if distances:
        print(f"min  : {distances[0]:>10.2f} m")
        print(f"p25  : {percentile(distances, 25):>10.2f} m")
        print(f"p50  : {median(distances):>10.2f} m")
        print(f"p75  : {percentile(distances, 75):>10.2f} m")
        print(f"p90  : {percentile(distances, 90):>10.2f} m")
        print(f"p95  : {percentile(distances, 95):>10.2f} m")
        print(f"p99  : {percentile(distances, 99):>10.2f} m")
        print(f"max  : {distances[-1]:>10.2f} m")
        print(f"mean : {mean(distances):>10.2f} m")
        print("-" * 72)
        buckets = [
            ("== 0 m (exact)",        sum(1 for d in distances if d < 0.01)),
            ("< 1 m",                 sum(1 for d in distances if d < 1)),
            ("< 5 m",                 sum(1 for d in distances if d < 5)),
            ("< 10 m",                sum(1 for d in distances if d < 10)),
            ("< 50 m",                sum(1 for d in distances if d < 50)),
            ("< 100 m",               sum(1 for d in distances if d < 100)),
            (">= 100 m",              sum(1 for d in distances if d >= 100)),
            (">= 1 km",               sum(1 for d in distances if d >= 1000)),
        ]
        n = len(distances)
        for label, c in buckets:
            print(f"{label:>16} : {c:>4} ({100*c/n:5.1f} %)")
        print("-" * 72)
        print("Top 10 worst deviations:")
        for d, addr, cp, lon_a, lat_a, lon_b, lat_b, score, btype in worst[:10]:
            print(f"  {d:>10.1f} m  | {cp} | {addr[:60]:<60} "
                  f"| ban_type={btype} score={score}")
            print(f"             ADEME  ({lon_a:.6f}, {lat_a:.6f})  "
                  f"BAN ({lon_b:.6f}, {lat_b:.6f})")


if __name__ == "__main__":
    sys.exit(main() or 0)
