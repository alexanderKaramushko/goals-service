-- Up Migration

ALTER TABLE targets
DROP CONSTRAINT targets_pkey,
DROP COLUMN id;

ALTER TABLE targets
ADD COLUMN id SERIAL;

ALTER TABLE targets
ADD PRIMARY KEY (id);

-- Down Migration