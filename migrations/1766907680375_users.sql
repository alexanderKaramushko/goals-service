-- Up Migration

ALTER TABLE users
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

UPDATE users u
SET created_at = now()
WHERE u.created_at IS NULL

-- Down Migration