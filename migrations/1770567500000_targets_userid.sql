-- Up Migration

ALTER TABLE targets
  DROP CONSTRAINT IF EXISTS userId;

ALTER TABLE targets
  ADD COLUMN userId VARCHAR(255);

UPDATE targets
SET userId = id
WHERE userId IS NULL;

ALTER TABLE targets
  ALTER COLUMN userId SET NOT NULL;

ALTER TABLE targets
  ADD CONSTRAINT targets_userid_fkey
    FOREIGN KEY(userId)
      REFERENCES users(id)
      ON DELETE CASCADE;

-- Down Migration

ALTER TABLE targets
  DROP CONSTRAINT IF EXISTS targets_userid_fkey;

ALTER TABLE targets
  DROP COLUMN IF EXISTS userId;
