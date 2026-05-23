from fastapi import APIRouter, HTTPException, Depends
from auth import get_current_user, get_db
import json

router = APIRouter(prefix="/me", tags=["favorites"])


# GET /me/favorites/ids — liste légère pour cocher les étoiles dans les résultats
@router.get("/favorites/ids")
def list_favorite_ids(user=Depends(get_current_user)):
    db = get_db(); cur = db.cursor()
    cur.execute("SELECT parcelle_id FROM favorites WHERE user_id=%s", (user["user_id"],))
    rows = cur.fetchall()
    db.close()
    return {"ids": [r["parcelle_id"] for r in rows]}


# GET /me/favorites — FeatureCollection GeoJSON des parcelles favorites
@router.get("/favorites")
def list_favorites(user=Depends(get_current_user)):
    db = get_db(); cur = db.cursor()
    cur.execute("""
        SELECT p.id, p.contenance, p.commune,
               ST_AsGeoJSON(p.geom) AS geom_json,
               d.classe_energie, d.classe_ges, d.date_diagnostic,
               d.surface_habitable,
               f.created_at
        FROM favorites f
        JOIN parcelles p ON p.id = f.parcelle_id
        LEFT JOIN dpe d  ON p.dpe_id = d.id
        WHERE f.user_id = %s
        ORDER BY f.created_at DESC
    """, (user["user_id"],))
    rows = cur.fetchall()
    db.close()

    features = []
    for r in rows:
        features.append({
            "type": "Feature",
            "geometry": json.loads(r["geom_json"]) if r["geom_json"] else None,
            "properties": {
                "id": r["id"],
                "commune": r["commune"],
                "contenance": float(r["contenance"]) if r["contenance"] is not None else None,
                "surface": float(r["contenance"]) if r["contenance"] is not None else None,
                "surface_habitable": float(r["surface_habitable"]) if r["surface_habitable"] is not None else None,
                "classe_energie": r["classe_energie"],
                "classe_ges": r["classe_ges"],
                "date_dpe": r["date_diagnostic"].isoformat() if r["date_diagnostic"] else None,
                "favorited_at": r["created_at"].isoformat() if r["created_at"] else None,
            }
        })
    return {"type": "FeatureCollection", "features": features}


# POST /me/favorites/{parcelle_id} — ajoute une parcelle aux favoris
@router.post("/favorites/{parcelle_id}")
def add_favorite(parcelle_id: str, user=Depends(get_current_user)):
    db = get_db(); cur = db.cursor()
    cur.execute("SELECT 1 FROM parcelles WHERE id=%s LIMIT 1", (parcelle_id,))
    if not cur.fetchone():
        db.close()
        raise HTTPException(404, "Parcelle introuvable")
    cur.execute(
        "INSERT INTO favorites (user_id, parcelle_id) VALUES (%s,%s) ON CONFLICT DO NOTHING",
        (user["user_id"], parcelle_id)
    )
    db.commit(); db.close()
    return {"ok": True}


# DELETE /me/favorites/{parcelle_id} — retire des favoris
@router.delete("/favorites/{parcelle_id}")
def remove_favorite(parcelle_id: str, user=Depends(get_current_user)):
    db = get_db(); cur = db.cursor()
    cur.execute(
        "DELETE FROM favorites WHERE user_id=%s AND parcelle_id=%s",
        (user["user_id"], parcelle_id)
    )
    db.commit(); db.close()
    return {"ok": True}
