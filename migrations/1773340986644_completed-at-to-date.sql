-- Up Migration

ALTER TABLE targets
  ADD COLUMN completed_at DATE;

ALTER TABLE steps
  ALTER COLUMN completed_at TYPE DATE;

-- Down Migration