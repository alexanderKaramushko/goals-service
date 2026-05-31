-- Up Migration

ALTER TAbLE steps
ADD CONSTRAINT steps_target_id_should_be_completed_at_unique
UNIQUE (target_id, should_be_completed_at);

-- Down Migration