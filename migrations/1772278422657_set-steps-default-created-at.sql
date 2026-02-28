-- Up Migration

ALTER TABLE STEPS
  ALTER COLUMN created_at SET DEFAULT now();

-- Down Migration