
CREATE TABLE IF NOT EXISTS dictation_status (
    user_id       VARCHAR(255) NOT NULL REFERENCES users (uid) ON DELETE CASCADE,
    transcript_id INTEGER      NOT NULL REFERENCES transcripts (id) ON DELETE CASCADE,
    lesson_id     INTEGER      NOT NULL,
    completed_at  TIMESTAMP    NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, transcript_id)
);
CREATE INDEX IF NOT EXISTS idx_dictation_status_lesson_id ON dictation_status (lesson_id);

CREATE TABLE IF NOT EXISTS shadowing_status (
    user_id       VARCHAR(255) NOT NULL REFERENCES users (uid) ON DELETE CASCADE,
    transcript_id INTEGER      NOT NULL REFERENCES transcripts (id) ON DELETE CASCADE,
    lesson_id     INTEGER      NOT NULL,
    completed_at  TIMESTAMP    NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, transcript_id)
);
CREATE INDEX IF NOT EXISTS idx_shadowing_status_lesson_id ON shadowing_status (lesson_id);

CREATE TABLE IF NOT EXISTS vocabulary_categories (
    id          SERIAL       PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_vocabulary_categories_name UNIQUE (name)
);


CREATE TABLE IF NOT EXISTS vocabulary_decks (
    id            SERIAL       PRIMARY KEY,
    user_id       VARCHAR(255) REFERENCES users (uid) ON DELETE SET NULL,
    category_id   INTEGER      REFERENCES vocabulary_categories (id) ON DELETE SET NULL,
    name          VARCHAR(255) NOT NULL,
    description   TEXT,
    thumbnail_url VARCHAR(500),
    level         VARCHAR(20),
    is_default    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vocabulary_decks_user_id     ON vocabulary_decks (user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_decks_category_id ON vocabulary_decks (category_id);

CREATE TABLE IF NOT EXISTS vocabulary_items (
    id                SERIAL       PRIMARY KEY,
    deck_id           INTEGER      NOT NULL REFERENCES vocabulary_decks (id) ON DELETE CASCADE,
    lesson_id         INTEGER      REFERENCES lessons (id) ON DELETE SET NULL,
    transcript_id     INTEGER      REFERENCES transcripts (id) ON DELETE SET NULL,
    phrase            VARCHAR(500) NOT NULL,
    normalized_phrase VARCHAR(500) NOT NULL,
    meaning           TEXT         NOT NULL,
    example_sentence  TEXT,
    note              TEXT,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vocabulary_items_deck_id ON vocabulary_items (deck_id);