-- Up Migration

CREATE INDEX IF NOT EXISTS idx_steps_should_be_completed_at ON steps(should_be_completed_at);

-- Down Migration