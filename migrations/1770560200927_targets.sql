-- Up Migration

ALTER TABLE targets
ALTER COLUMN status DROP NOT NULL;

-- Down Migration