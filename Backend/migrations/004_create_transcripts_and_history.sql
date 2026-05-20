CREATE TABLE IF NOT EXISTS transcripts (
    id              SERIAL PRIMARY KEY,
    lesson_id       INTEGER NOT NULL REFERENCES lessons (id) ON DELETE CASCADE,
    sequence        INTEGER NOT NULL,
    content         TEXT    NOT NULL,
    phonetic        VARCHAR(500),
    vietnamese      TEXT,
    start_timestamp DOUBLE PRECISION,
    end_timestamp   DOUBLE PRECISION
);
CREATE INDEX IF NOT EXISTS idx_transcripts_lesson_id ON transcripts (lesson_id);

CREATE TABLE IF NOT EXISTS bookmarks (
    user_id    VARCHAR(255) NOT NULL REFERENCES users (uid) ON DELETE CASCADE,
    lesson_id  INTEGER      NOT NULL REFERENCES lessons (id) ON DELETE CASCADE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, lesson_id)
);


CREATE TABLE IF NOT EXISTS learning_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users (uid) ON DELETE CASCADE,
    lesson_id INTEGER NOT NULL REFERENCES lessons (id) ON DELETE CASCADE,
    duration_watched DOUBLE PRECISION DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);