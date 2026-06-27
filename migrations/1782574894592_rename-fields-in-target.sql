-- Up Migration

ALTER table targets
  RENAME COLUMN closed_at TO cancelled_at;

-- Down Migration