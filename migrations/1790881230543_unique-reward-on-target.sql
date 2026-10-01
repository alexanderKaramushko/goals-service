-- Up Migration

ALTER TABLE rewards
ADD CONSTRAINT rewards_sender_user_id_unique
UNIQUE (target_id, sender_user_id);

-- Down Migration