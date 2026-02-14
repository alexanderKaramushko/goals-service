-- Up Migration

ALTER TABLE targets
RENAME shouldbecompletedat TO should_be_completed_at;

ALTER TABLE targets
RENAME closedat TO closed_at;

ALTER TABLE targets
RENAME createdat TO created_at;

ALTER TABLE targets
RENAME updatedat TO updated_at;

ALTER TABLE targets
RENAME userid TO user_id;

-- Down Migration