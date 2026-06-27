-- Up Migration

ALTER TABLE steps
  DROP CONSTRAINT targets_id_fkey;

ALTER TABLE steps
  ADD CONSTRAINT fk_target_id
  FOREIGN KEY(target_id)
  REFERENCES targets(id)
  ON DELETE CASCADE;

-- Down Migration