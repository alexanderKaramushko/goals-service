-- Up Migration

ALTER TABLE targets
  ALTER COLUMN should_be_completed_at TYPE DATE;

ALTER TABLE steps
  ALTER COLUMN should_be_completed_at TYPE DATE;

-- Down Migration