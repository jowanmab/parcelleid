-- Table favorites : un user peut sauvegarder N parcelles
CREATE TABLE IF NOT EXISTS favorites (
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parcelle_id VARCHAR(32) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, parcelle_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_created
    ON favorites(user_id, created_at DESC);
