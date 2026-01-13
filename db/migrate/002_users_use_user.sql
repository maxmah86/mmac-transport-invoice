-- 002_users_use_user.sql
-- Migrate users table from email login to user login

PRAGMA foreign_keys = OFF;

-- Rename old table
ALTER TABLE users RENAME TO users_old;

-- Create new users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Migrate existing data
INSERT INTO users (id, user, password_hash, role, created_at)
SELECT id, email, password_hash, role, created_at
FROM users_old;

-- Drop old table
DROP TABLE users_old;

PRAGMA foreign_keys = ON;
