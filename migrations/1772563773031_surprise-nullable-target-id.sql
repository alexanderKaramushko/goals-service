-- Up Migration

ALTER TABLE surprises
  ALTER COLUMN target_id
  DROP NOT NULL;


-- Down Migration