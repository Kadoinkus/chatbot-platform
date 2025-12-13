-- ============================================================================
-- Usage Tracking Triggers Migration
-- ============================================================================
-- This migration adds automatic usage tracking for mascots and workspaces.
--
-- Features:
-- - Track sessions, messages, and bundle loads per mascot and workspace
-- - Support for period counters (reset on schedule) and lifetime totals
-- - Automatic reset scheduling: daily, monthly, quarterly, annual
-- - Dev sessions (is_dev = TRUE) are completely skipped
--
-- Note: All date comparisons use UTC.
-- ============================================================================

-- ============================================================================
-- FUNCTION 1: Calculate Next Usage Reset Date
-- ============================================================================
-- Calculates the next reset date based on interval and billing anchor day.
-- Handles month-end clamping (e.g., billing_reset_day=31 in February -> 28/29)

CREATE OR REPLACE FUNCTION calculate_next_usage_reset_date(
  p_from_date DATE,
  p_interval TEXT,
  p_billing_day INTEGER DEFAULT 1
)
RETURNS DATE
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_next DATE;
  v_target_day INTEGER;
  v_days_in_month INTEGER;
BEGIN
  -- Default billing day to 1 if NULL
  p_billing_day := COALESCE(p_billing_day, 1);

  CASE p_interval
    WHEN 'daily' THEN
      -- Simply add one day
      v_next := p_from_date + INTERVAL '1 day';

    WHEN 'monthly' THEN
      -- Move to next month
      v_next := date_trunc('month', p_from_date) + INTERVAL '1 month';
      -- Calculate days in that month
      v_days_in_month := EXTRACT(DAY FROM (v_next + INTERVAL '1 month - 1 day'))::INTEGER;
      -- Clamp billing day to last day of month
      v_target_day := LEAST(p_billing_day, v_days_in_month);
      v_next := v_next + (v_target_day - 1) * INTERVAL '1 day';

    WHEN 'quarterly' THEN
      -- Move to next quarter
      v_next := date_trunc('quarter', p_from_date) + INTERVAL '3 months';
      -- Calculate days in that month
      v_days_in_month := EXTRACT(DAY FROM (v_next + INTERVAL '1 month - 1 day'))::INTEGER;
      -- Clamp billing day to last day of month
      v_target_day := LEAST(p_billing_day, v_days_in_month);
      v_next := v_next + (v_target_day - 1) * INTERVAL '1 day';

    WHEN 'annual' THEN
      -- Move to next year
      v_next := date_trunc('year', p_from_date) + INTERVAL '1 year';
      -- Calculate days in that month (January always has 31)
      v_days_in_month := 31;
      -- Clamp billing day to last day of month
      v_target_day := LEAST(p_billing_day, v_days_in_month);
      v_next := v_next + (v_target_day - 1) * INTERVAL '1 day';

    ELSE
      -- Unknown interval, return NULL
      RETURN NULL;
  END CASE;

  RETURN v_next;
END;
$$;

COMMENT ON FUNCTION calculate_next_usage_reset_date IS
'Calculates the next usage reset date based on interval type and billing anchor day.
Handles month-end clamping for billing days that exceed the month length.';


-- ============================================================================
-- FUNCTION 2: Track Chat Session Usage (Trigger Function)
-- ============================================================================
-- Triggered AFTER INSERT on chat_sessions
-- Increments: sessions_used, total_conversations, bundle_loads_used (if applicable)
-- Skips dev sessions (is_dev = TRUE)

CREATE OR REPLACE FUNCTION track_chat_session_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_workspace_slug TEXT;
  v_is_bundle_load BOOLEAN := FALSE;
BEGIN
  -- Skip dev sessions entirely
  IF NEW.is_dev = TRUE THEN
    RETURN NEW;
  END IF;

  -- Lookup workspace_slug from mascot
  SELECT workspace_slug INTO v_workspace_slug
  FROM mascots
  WHERE mascot_slug = NEW.mascot_slug;

  -- Verify workspace exists (FK should prevent this, but be defensive)
  IF v_workspace_slug IS NULL THEN
    RAISE EXCEPTION 'Mascot % has no workspace_slug', NEW.mascot_slug;
  END IF;

  -- Determine if this is a bundle load
  -- Bundle load = fresh CDN download with actual data transfer
  IF NEW.glb_source IS NOT NULL AND NEW.glb_source NOT IN ('netlify', 'cdn_fetch', 'browser_cache', 'memory_cache') THEN
    RAISE NOTICE 'Unknown glb_source: %', NEW.glb_source;
  END IF;

  v_is_bundle_load := (
    NEW.glb_source IN ('netlify', 'cdn_fetch')
    AND COALESCE(NEW.glb_transfer_size, 0) > 0
  );

  -- Update mascot counters (atomic increment)
  UPDATE mascots
  SET
    sessions_used = COALESCE(sessions_used, 0) + 1,
    total_conversations = COALESCE(total_conversations, 0) + 1,
    bundle_loads_used = CASE
      WHEN v_is_bundle_load THEN COALESCE(bundle_loads_used, 0) + 1
      ELSE bundle_loads_used
    END
  WHERE mascot_slug = NEW.mascot_slug;

  -- Update workspace period counters only (atomic increment)
  -- Note: workspaces don't have total_conversations/total_messages columns
  UPDATE workspaces
  SET
    sessions_used = COALESCE(sessions_used, 0) + 1,
    bundle_loads_used = CASE
      WHEN v_is_bundle_load THEN COALESCE(bundle_loads_used, 0) + 1
      ELSE bundle_loads_used
    END
  WHERE slug = v_workspace_slug;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION track_chat_session_usage IS
'Tracks session and bundle load usage for mascots and workspaces.
Triggered AFTER INSERT on chat_sessions. Skips dev sessions.';


-- ============================================================================
-- FUNCTION 3: Track Chat Message Usage (Trigger Function)
-- ============================================================================
-- Triggered AFTER INSERT on chat_messages
-- Increments: messages_used, total_messages
-- Derives mascot from session_id (NOT from NEW.mascot_slug) to prevent bad data
-- Skips messages from dev sessions

CREATE OR REPLACE FUNCTION track_chat_message_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_mascot_slug TEXT;
  v_workspace_slug TEXT;
  v_is_dev BOOLEAN;
BEGIN
  -- Lookup mascot_slug and is_dev from the session
  -- We derive mascot from session, NOT from NEW.mascot_slug
  -- Note: chat_sessions primary key is 'id', not 'session_id'
  SELECT cs.mascot_slug, cs.is_dev INTO v_mascot_slug, v_is_dev
  FROM chat_sessions cs
  WHERE cs.id = NEW.session_id;

  -- Skip if session not found (shouldn't happen with FK constraint)
  IF v_mascot_slug IS NULL THEN
    RAISE WARNING 'Message session_id % not found in chat_sessions', NEW.session_id;
    RETURN NEW;
  END IF;

  -- Skip dev sessions entirely
  IF v_is_dev = TRUE THEN
    RETURN NEW;
  END IF;

  -- Lookup workspace_slug from mascot
  SELECT workspace_slug INTO v_workspace_slug
  FROM mascots
  WHERE mascot_slug = v_mascot_slug;

  -- Verify workspace exists
  IF v_workspace_slug IS NULL THEN
    RAISE EXCEPTION 'Mascot % has no workspace_slug', v_mascot_slug;
  END IF;

  -- Update mascot counters (atomic increment)
  UPDATE mascots
  SET
    messages_used = COALESCE(messages_used, 0) + 1,
    total_messages = COALESCE(total_messages, 0) + 1
  WHERE mascot_slug = v_mascot_slug;

  -- Update workspace period counter only (atomic increment)
  -- Note: workspaces don't have total_messages column
  UPDATE workspaces
  SET
    messages_used = COALESCE(messages_used, 0) + 1
  WHERE slug = v_workspace_slug;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION track_chat_message_usage IS
'Tracks message usage for mascots and workspaces.
Triggered AFTER INSERT on chat_messages. Derives mascot from session_id, not NEW.mascot_slug.
Skips messages from dev sessions.';


-- ============================================================================
-- FUNCTION 4: Process Workspace Usage Resets
-- ============================================================================
-- Called by pg_cron daily (or manually)
-- Resets period counters for workspaces where next_usage_reset_date <= CURRENT_DATE
-- Archives current usage to usage_resets table before zeroing
--
-- Handles missed periods: if job skipped days/weeks, archives each missed
-- period individually to preserve historical granularity.

CREATE OR REPLACE FUNCTION process_workspace_usage_resets()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_workspace RECORD;
  v_reset_count INTEGER := 0;
  v_current_reset_date DATE;
  v_next_reset_date DATE;
  v_period_start DATE;
  v_is_first_period BOOLEAN;
  v_sessions INTEGER;
  v_messages INTEGER;
  v_bundles INTEGER;
BEGIN
  -- Process each workspace that is due for reset
  -- FOR UPDATE SKIP LOCKED prevents concurrent resets
  FOR v_workspace IN
    SELECT *
    FROM workspaces
    WHERE next_usage_reset_date IS NOT NULL
      AND next_usage_reset_date <= CURRENT_DATE
      AND usage_reset_interval IS NOT NULL
      AND status = 'active'
    FOR UPDATE SKIP LOCKED
  LOOP
    v_current_reset_date := v_workspace.next_usage_reset_date;
    v_is_first_period := TRUE;

    -- Loop through all missed periods one at a time
    WHILE v_current_reset_date <= CURRENT_DATE LOOP
      -- Calculate next reset date anchored to current period (not CURRENT_DATE)
      v_next_reset_date := calculate_next_usage_reset_date(
        v_current_reset_date,
        v_workspace.usage_reset_interval,
        v_workspace.billing_reset_day
      );

      -- Skip if we couldn't calculate next date (unknown interval)
      IF v_next_reset_date IS NULL THEN
        RAISE NOTICE 'Unknown usage_reset_interval for workspace %: %',
          v_workspace.slug, v_workspace.usage_reset_interval;
        EXIT; -- Exit WHILE loop
      END IF;

      -- Calculate period start based on interval
      v_period_start := v_current_reset_date -
        CASE v_workspace.usage_reset_interval
          WHEN 'daily' THEN INTERVAL '1 day'
          WHEN 'monthly' THEN INTERVAL '1 month'
          WHEN 'quarterly' THEN INTERVAL '3 months'
          WHEN 'annual' THEN INTERVAL '1 year'
          ELSE INTERVAL '1 month'
        END;

      -- First period gets actual usage; subsequent missed periods get 0
      IF v_is_first_period THEN
        v_sessions := COALESCE(v_workspace.sessions_used, 0);
        v_messages := COALESCE(v_workspace.messages_used, 0);
        v_bundles := COALESCE(v_workspace.bundle_loads_used, 0);
      ELSE
        -- Missed periods have no data (we had no counters running)
        v_sessions := 0;
        v_messages := 0;
        v_bundles := 0;
      END IF;

      -- Archive this period's usage (using existing table column names)
      INSERT INTO usage_resets (
        workspace_slug,
        reset_at,
        period_start,
        period_end,
        sessions_final,
        messages_final,
        bundle_loads_final
      ) VALUES (
        v_workspace.slug,
        v_current_reset_date::TIMESTAMPTZ,
        v_period_start,
        v_current_reset_date - INTERVAL '1 day',
        v_sessions,
        v_messages,
        v_bundles
      );

      v_reset_count := v_reset_count + 1;
      v_is_first_period := FALSE;
      v_current_reset_date := v_next_reset_date;

      RAISE NOTICE 'Archived period for workspace % (% to %), next: %',
        v_workspace.slug, v_period_start, v_current_reset_date - INTERVAL '1 day', v_next_reset_date;
    END LOOP;

    -- After processing all periods, update workspace with final next date
    -- and zero counters (only need to zero once after all periods)
    UPDATE workspaces
    SET
      sessions_used = 0,
      messages_used = 0,
      bundle_loads_used = 0,
      next_usage_reset_date = v_current_reset_date
    WHERE slug = v_workspace.slug;

    -- Zero all mascot period counters for this workspace
    UPDATE mascots
    SET
      sessions_used = 0,
      messages_used = 0,
      bundle_loads_used = 0
    WHERE workspace_slug = v_workspace.slug;

  END LOOP;

  RETURN v_reset_count;
END;
$$;

COMMENT ON FUNCTION process_workspace_usage_resets IS
'Processes periodic usage resets for all due workspaces.
Archives each missed period individually to preserve historical granularity.
Called by pg_cron daily or manually. Returns count of periods archived.';


-- ============================================================================
-- FUNCTION 5: Initialize Workspace Reset Date (Trigger Function)
-- ============================================================================
-- Triggered BEFORE INSERT on workspaces
-- Auto-sets next_usage_reset_date based on usage_reset_interval

CREATE OR REPLACE FUNCTION initialize_workspace_reset_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only set if interval is defined but reset date is not
  IF NEW.usage_reset_interval IS NOT NULL AND NEW.next_usage_reset_date IS NULL THEN
    NEW.next_usage_reset_date := calculate_next_usage_reset_date(
      CURRENT_DATE,
      NEW.usage_reset_interval,
      NEW.billing_reset_day
    );
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION initialize_workspace_reset_date IS
'Auto-initializes next_usage_reset_date for new workspaces based on their usage_reset_interval.';


-- ============================================================================
-- CREATE TRIGGERS
-- ============================================================================

-- Trigger 1: Track session usage
DROP TRIGGER IF EXISTS tr_track_chat_session_usage ON chat_sessions;
CREATE TRIGGER tr_track_chat_session_usage
  AFTER INSERT ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION track_chat_session_usage();

-- Trigger 2: Track message usage
DROP TRIGGER IF EXISTS tr_track_chat_message_usage ON chat_messages;
CREATE TRIGGER tr_track_chat_message_usage
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION track_chat_message_usage();

-- Trigger 3: Initialize workspace reset date
DROP TRIGGER IF EXISTS tr_initialize_workspace_reset_date ON workspaces;
CREATE TRIGGER tr_initialize_workspace_reset_date
  BEFORE INSERT ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION initialize_workspace_reset_date();


-- ============================================================================
-- usage_resets TABLE already exists with columns:
-- id, reset_at, period_start, period_end, bundle_loads_final, messages_final,
-- api_calls_final, sessions_final, overage_charged_eur, credits_spent_eur,
-- created_at, workspace_slug
-- ============================================================================

-- Index for querying reset history (if not exists)
CREATE INDEX IF NOT EXISTS idx_usage_resets_workspace_date
  ON usage_resets(workspace_slug, reset_at DESC);


-- ============================================================================
-- DATA FIX: Initialize Reset Dates for Existing Workspaces
-- ============================================================================

UPDATE workspaces
SET next_usage_reset_date = calculate_next_usage_reset_date(
  CURRENT_DATE,
  usage_reset_interval,
  billing_reset_day
)
WHERE next_usage_reset_date IS NULL
  AND usage_reset_interval IS NOT NULL
  AND status = 'active';


-- ============================================================================
-- DATA FIX: Backfill Lifetime Totals Only
-- ============================================================================
-- Only backfill if current value is 0 or NULL (preserve existing data)
-- Period counters (*_used) stay at 0 - they start fresh

-- Backfill mascot lifetime totals
UPDATE mascots m
SET
  total_conversations = CASE
    WHEN COALESCE(m.total_conversations, 0) = 0
    THEN COALESCE(stats.session_count, 0)
    ELSE m.total_conversations
  END,
  total_messages = CASE
    WHEN COALESCE(m.total_messages, 0) = 0
    THEN COALESCE(stats.message_count, 0)
    ELSE m.total_messages
  END
FROM (
  SELECT
    cs.mascot_slug,
    COUNT(*) AS session_count,
    SUM(COALESCE(cs.total_bot_messages, 0) + COALESCE(cs.total_user_messages, 0)) AS message_count
  FROM chat_sessions cs
  WHERE cs.is_dev = FALSE
  GROUP BY cs.mascot_slug
) stats
WHERE m.mascot_slug = stats.mascot_slug;

-- Note: workspaces don't have total_conversations/total_messages columns
-- Workspace lifetime totals can be derived from mascots when needed via query


-- ============================================================================
-- pg_cron SETUP (Safe - handles missing extension gracefully)
-- ============================================================================
-- Only available on Supabase Pro plan
-- Falls back gracefully in development/local environments

DO $outer$
BEGIN
  -- Attempt to create extension if available
  CREATE EXTENSION IF NOT EXISTS pg_cron;

  -- Only schedule if not already scheduled
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-usage-reset') THEN
    PERFORM cron.schedule(
      'daily-usage-reset',
      '5 0 * * *',  -- Run at 00:05 UTC daily
      'SELECT process_workspace_usage_resets()'
    );
    RAISE NOTICE 'pg_cron job scheduled: daily-usage-reset at 00:05 UTC';
  ELSE
    RAISE NOTICE 'pg_cron job already exists: daily-usage-reset';
  END IF;

EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'pg_cron not available (cron.job table missing) - schedule resets manually';
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'pg_cron requires superuser privileges - schedule resets manually';
  WHEN feature_not_supported THEN
    RAISE NOTICE 'pg_cron not supported in this environment - schedule resets manually';
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron setup failed: % - schedule resets manually', SQLERRM;
END $outer$;


-- ============================================================================
-- VERIFICATION QUERIES (for manual testing)
-- ============================================================================
-- Uncomment and run these after applying the migration to verify:

-- Check triggers are created:
-- SELECT trigger_name, event_manipulation, action_statement
-- FROM information_schema.triggers
-- WHERE trigger_name LIKE 'tr_%usage%';

-- Check functions are created:
-- SELECT routine_name, routine_type
-- FROM information_schema.routines
-- WHERE routine_schema = 'public'
--   AND routine_name IN (
--     'calculate_next_usage_reset_date',
--     'track_chat_session_usage',
--     'track_chat_message_usage',
--     'process_workspace_usage_resets',
--     'initialize_workspace_reset_date'
--   );

-- Check pg_cron job (if available):
-- SELECT * FROM cron.job WHERE jobname = 'daily-usage-reset';
