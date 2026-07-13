-- Migration: Add indexes for performance optimization
-- Target columns: category_id, level, lesson_id, deck_id, user_id

CREATE INDEX IF NOT EXISTS idx_lessons_category_id ON lessons(category_id);
CREATE INDEX IF NOT EXISTS idx_lessons_level ON lessons(level);
CREATE INDEX IF NOT EXISTS idx_transcripts_lesson_id ON transcripts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_items_deck_id ON vocabulary_items(deck_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_decks_user_id ON vocabulary_decks(user_id);
