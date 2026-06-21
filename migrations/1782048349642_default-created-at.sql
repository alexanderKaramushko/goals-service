-- Up Migration

ALTER TABLE targets
  ALTER COLUMN created_at SET DEFAULT now();

UPDATE targets t
  SET created_at = now()
  WHERE t.created_at IS NULL;

ALTER TABLE targets
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE rewards
  ALTER COLUMN created_at SET DEFAULT now();

-- Down Migration