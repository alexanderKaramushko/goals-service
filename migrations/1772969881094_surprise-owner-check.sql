-- Up Migration

ALTER TABLE surprises
  ALTER COLUMN user_id
  DROP NOT NULL;

ALTER TABLE surprises
  ADD CONSTRAINT owner_check
  CHECK (
    (type = 'user' AND user_id IS NOT NULL AND target_id IS NULL) OR
    (type = 'target' and target_id IS NOT NULL AND target_id IS NULL)
  );

-- Down Migration