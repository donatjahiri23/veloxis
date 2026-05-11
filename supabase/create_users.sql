-- Drop old table if it exists (references auth.users which we no longer use)
DROP TABLE IF EXISTS users CASCADE;

-- Create standalone users table (no Supabase Auth dependency)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
  role TEXT DEFAULT 'owner',
  plan TEXT DEFAULT 'starter',
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS so our API routes can read/write freely
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Index for fast username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
