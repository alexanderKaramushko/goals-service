-- Up Migration

CREATE TABLE IF NOT EXISTS step (
  id SERIAL PRIMARY KEY,
  target_id INT NOT NULL,
  CONSTRAINT targets_id_fkey
      FOREIGN KEY(target_id)
	  REFERENCES targets(id)
	  ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  should_be_completed_at TIMESTAMP NOT NULL,
  closed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP
)

-- Down Migration