-- Migration: Add streak freeze columns to user_stats
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- Add streak freeze columns (these default to 1 free freeze per user)
ALTER TABLE user_stats 
  ADD COLUMN IF NOT EXISTS streak_freezes_remaining INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS streak_freeze_used_at TIMESTAMPTZ DEFAULT NULL;

-- Optional: Give all existing users 1 freeze
UPDATE user_stats 
SET streak_freezes_remaining = 1 
WHERE streak_freezes_remaining IS NULL;

-- Note: Freezes reset weekly. You can do this manually from admin panel
-- or set up a Supabase cron (pg_cron) if on a paid plan.
-- For free tier, the simplest approach is to reset manually or 
-- add reset logic in the frontend when the week changes.
