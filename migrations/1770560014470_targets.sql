-- Up Migration

ALTER TABLE targets
ALTER COLUMN shouldBeCompletedAt SET NOT NULL;

-- Down Migration