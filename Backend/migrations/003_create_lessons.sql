CREATE TABLE IF NOT EXISTS lessons (
    id            SERIAL PRIMARY KEY,
    category_id   INTEGER REFERENCES categories (id) ON DELETE SET NULL,
    title         VARCHAR(255),
    description   TEXT,
    video_url     VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    level         VARCHAR(20),
    duration      DOUBLE PRECISION,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    is_complete   BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_lessons_category_id ON lessons (category_id);