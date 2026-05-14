-- 0042_add_soft_delete.sql
-- Adds a soft_deleted_at column to the users table so we can hide users
-- without losing their referenced data.

-- +migrate Up
ALTER TABLE users
  ADD COLUMN soft_deleted_at TIMESTAMPTZ NULL;

CREATE INDEX idx_users_soft_deleted_at ON users (soft_deleted_at)
  WHERE soft_deleted_at IS NOT NULL;

-- +migrate Down
-- TODO: drop the column and the index
