-- Up Migration

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  full_name TEXT NOT NULL
)

-- Down Migration