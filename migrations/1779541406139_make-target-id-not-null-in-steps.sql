-- Up Migration

ALTER TABLE steps
ALTER COLUMN target_id SET NOT NULL;

-- Down Migration