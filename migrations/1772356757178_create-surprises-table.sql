-- Up Migration

CREATE TABLE IF NOT EXISTS surprises (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  CONSTRAINT users_id_fkey
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  target_id INT NOT NULL,
  CONSTRAINT targets_id_fkey
    FOREIGN KEY(target_id)
    REFERENCES targets(id)
    ON DELETE CASCADE,
  type TEXT NOT NULL check(type in ('target', 'user')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP
)

-- Down Migration