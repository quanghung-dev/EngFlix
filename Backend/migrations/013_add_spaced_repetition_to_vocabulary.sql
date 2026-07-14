-- Migration: Add spaced repetition metadata to vocabulary items
ALTER TABLE vocabulary_items
ADD COLUMN next_review_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN review_interval INTEGER DEFAULT 1,
ADD COLUMN ease_factor DOUBLE PRECISION DEFAULT 2.5,
ADD COLUMN correct_count INTEGER DEFAULT 0,
ADD COLUMN incorrect_count INTEGER DEFAULT 0,
ADD COLUMN source_sentence TEXT;
