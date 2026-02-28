-- Up Migration

ALTER TABLE STEPS
  ALTER COLUMN target_id
  DROP NOT NULL;

-- Down Migration