-- Up Migration

ALTER TABLE users
  ADD COLUMN timezone TEXT NOT NULL;

-- Down Migration