-- Up Migration

BEGIN;

ALTER TABLE rewards
  RENAME COLUMN user_id TO recipient_user_id;

ALTER TABLE rewards
  DROP CONSTRAINT users_id_fkey;

ALTER TABLE rewards
  ADD CONSTRAINT fk_recipient_user_id
  FOREIGN KEY(recipient_user_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE rewards
  DROP CONSTRAINT owner_check;

ALTER TABLE rewards
  ADD CONSTRAINT owner_check
  CHECK (
    (type = 'user' AND recipient_user_id IS NOT NULL AND target_id IS NULL) OR
    (type = 'target' and target_id IS NOT NULL AND recipient_user_id IS NULL)
  );

ALTER TABLE rewards
  ADD COLUMN sender_user_id VARCHAR(255) NOT NULL;

ALTER TABLE rewards
  ADD CONSTRAINT fk_sender_user_id
  FOREIGN KEY(sender_user_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

CREATE UNIQUE INDEX rewards_target_sender_unique_idx
  on rewards(target_id, sender_user_id)
  WHERE type = 'target';

CREATE UNIQUE INDEX rewards_user_sender_unique_idx
  on rewards(recipient_user_id, sender_user_id)
  WHERE type = 'user';

COMMIT;

-- Down Migration