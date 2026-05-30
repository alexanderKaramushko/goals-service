-- Up Migration

ALTER TABLE steps
ADD COLUMN result_comment TEXT;

-- Down Migration