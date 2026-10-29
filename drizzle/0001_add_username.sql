ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS username VARCHAR(100);
CREATE UNIQUE INDEX IF NOT EXISTS auth_users_username_idx ON auth_users (username) WHERE username IS NOT NULL;