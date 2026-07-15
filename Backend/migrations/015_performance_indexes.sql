-- Composite indexes for the Topics, study bootstrap, and progress hot paths.
CREATE INDEX IF NOT EXISTS idx_lessons_category_created_id
    ON lessons (category_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_lessons_level_created_id
    ON lessons (level, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_transcripts_lesson_sequence_id
    ON transcripts (lesson_id, sequence ASC, id ASC);

CREATE INDEX IF NOT EXISTS idx_learning_history_user_updated_id
    ON learning_history (user_id, updated_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_transcript_progress_user_lesson_completed
    ON transcript_progress (user_id, lesson_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_pronunciation_progress_user_lesson_updated
    ON pronunciation_progress (user_id, lesson_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_pronunciation_attempts_user_created_id
    ON pronunciation_attempts (user_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_dictation_status_user_completed
    ON dictation_status (user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_shadowing_status_user_completed
    ON shadowing_status (user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_vocabulary_decks_user_custom_id
    ON vocabulary_decks (user_id, id)
    WHERE is_default IS FALSE;

CREATE INDEX IF NOT EXISTS idx_vocabulary_items_deck_review
    ON vocabulary_items (deck_id, next_review_at);
