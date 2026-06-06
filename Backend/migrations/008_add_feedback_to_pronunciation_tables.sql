ALTER TABLE pronunciation_attempts ADD COLUMN IF NOT EXISTS feedback TEXT;
ALTER TABLE pronunciation_progress ADD COLUMN IF NOT EXISTS feedback TEXT;
