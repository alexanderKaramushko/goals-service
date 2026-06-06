-- Up Migration

ALTER TABLE targets
ADD COLUMN result_comment TEXT;

ALTER TABLE targets
ADD COLUMN can_assign_reward BOOLEAN;

-- Down Migration