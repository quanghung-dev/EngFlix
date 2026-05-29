ALTER TABLE bookmarks
    ADD COLUMN IF NOT EXISTS transcript_id INTEGER;

ALTER TABLE bookmarks
    ADD COLUMN IF NOT EXISTS note TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'bookmarks'::regclass
          AND conname = 'bookmarks_transcript_id_fkey'
    ) THEN
        ALTER TABLE bookmarks
            ADD CONSTRAINT bookmarks_transcript_id_fkey
            FOREIGN KEY (transcript_id) REFERENCES transcripts (id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'bookmarks'::regclass
          AND conname = 'bookmarks_pkey'
    ) THEN
        ALTER TABLE bookmarks
            DROP CONSTRAINT bookmarks_pkey;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'bookmarks'::regclass
          AND conname = 'bookmarks_user_transcript_unique'
    ) THEN
        ALTER TABLE bookmarks
            ADD CONSTRAINT bookmarks_user_transcript_unique UNIQUE (user_id, transcript_id);
    END IF;
END $$;
