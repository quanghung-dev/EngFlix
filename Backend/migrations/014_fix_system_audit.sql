-- Migration: Fix System Audit Findings
-- 1. Migrate bookmarks to transcript_bookmarks if they don't exist
INSERT INTO transcript_bookmarks (user_id, transcript_id, note, created_at)
SELECT user_id, transcript_id, note, created_at
FROM bookmarks
ON CONFLICT (user_id, transcript_id) DO NOTHING;

-- 2. Drop legacy bookmarks table
DROP TABLE IF EXISTS bookmarks CASCADE;

-- 3. Delete duplicate vocabulary items, keeping only the latest (highest ID)
DELETE FROM vocabulary_items
WHERE id NOT IN (
    SELECT MAX(id)
    FROM vocabulary_items
    GROUP BY deck_id, normalized_phrase
);

-- 4. Add example_translation column if it does not exist
ALTER TABLE vocabulary_items
ADD COLUMN IF NOT EXISTS example_translation TEXT;

-- 5. Add unique constraint on (deck_id, normalized_phrase)
ALTER TABLE vocabulary_items
ADD CONSTRAINT uq_vocabulary_items_deck_normalized_phrase
UNIQUE (deck_id, normalized_phrase);
