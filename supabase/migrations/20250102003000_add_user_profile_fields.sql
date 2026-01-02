-- Add profile-related fields to public.users for the dashboard profile page
alter table public.users
  add column if not exists timezone text,
  add column if not exists position text,
  add column if not exists location text,
  add column if not exists bio text;

-- Restrict timezone to a known set (nullable allowed)
alter table public.users
  drop constraint if exists users_timezone_allowed;

alter table public.users
  add constraint users_timezone_allowed
  check (
    timezone is null
    or timezone in (
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Amsterdam',
      'Asia/Singapore'
    )
  );
