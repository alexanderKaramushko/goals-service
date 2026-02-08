-- Up Migration

CREATE TABLE IF NOT EXISTS targets (
  id VARCHAR(255) PRIMARY KEY,
  CONSTRAINT userId
    FOREIGN KEY(id)
      REFERENCES users(id)
      ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL check(status in ('created', 'active', 'completed', 'cancelled')),
  shouldBeCompletedAt TIMESTAMP,
  closedAt TIMESTAMP,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)

-- Down Migration