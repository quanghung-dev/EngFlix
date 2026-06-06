CREATE TABLE IF NOT EXISTS pronunciation_attempts (
    id                  SERIAL PRIMARY KEY,
    user_id             VARCHAR(255) NOT NULL REFERENCES users (uid) ON DELETE CASCADE,
    lesson_id           INTEGER      NOT NULL REFERENCES lessons (id) ON DELETE CASCADE,
    transcript_id       INTEGER      NOT NULL REFERENCES transcripts (id) ON DELETE CASCADE,

    reference_text      TEXT         NOT NULL,

    overall_score       NUMERIC(5,2) NOT NULL DEFAULT 0,
    accuracy_score      NUMERIC(5,2) NOT NULL DEFAULT 0,
    fluency_score       NUMERIC(5,2) NOT NULL DEFAULT 0,
    completeness_score  NUMERIC(5,2) NOT NULL DEFAULT 0,
    prosody_score       NUMERIC(5,2) NOT NULL DEFAULT 0,

    words_json          JSONB        NOT NULL DEFAULT '[]'::jsonb,

    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_pronunciation_attempts_scores
        CHECK (
            overall_score BETWEEN 0 AND 100
            AND accuracy_score BETWEEN 0 AND 100
            AND fluency_score BETWEEN 0 AND 100
            AND completeness_score BETWEEN 0 AND 100
            AND prosody_score BETWEEN 0 AND 100
        )
);

CREATE INDEX IF NOT EXISTS idx_pronunciation_attempts_user_id
    ON pronunciation_attempts (user_id);

CREATE INDEX IF NOT EXISTS idx_pronunciation_attempts_user_lesson
    ON pronunciation_attempts (user_id, lesson_id);

CREATE INDEX IF NOT EXISTS idx_pronunciation_attempts_user_transcript
    ON pronunciation_attempts (user_id, transcript_id);

CREATE TABLE IF NOT EXISTS pronunciation_progress (
    user_id          VARCHAR(255) NOT NULL REFERENCES users (uid) ON DELETE CASCADE,
    lesson_id        INTEGER      NOT NULL REFERENCES lessons (id) ON DELETE CASCADE,
    transcript_id    INTEGER      NOT NULL REFERENCES transcripts (id) ON DELETE CASCADE,

    best_attempt_id  INTEGER REFERENCES pronunciation_attempts (id) ON DELETE SET NULL,
    best_score       NUMERIC(5,2) NOT NULL DEFAULT 0,
    attempts_count   INTEGER      NOT NULL DEFAULT 0,

    completed        BOOLEAN      NOT NULL DEFAULT false,
    completed_at     TIMESTAMP,
    last_attempt_at  TIMESTAMP,

    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, transcript_id),

    CONSTRAINT chk_pronunciation_progress_best_score
        CHECK (best_score BETWEEN 0 AND 100)
);

CREATE INDEX IF NOT EXISTS idx_pronunciation_progress_user_lesson
    ON pronunciation_progress (user_id, lesson_id);

CREATE INDEX IF NOT EXISTS idx_pronunciation_progress_completed
    ON pronunciation_progress (user_id, lesson_id, completed);
