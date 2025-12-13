-- ============================================================================
-- Add Lifetime Totals to Workspaces
-- ============================================================================
-- Adds lifetime tracking columns to workspaces to match mascots pattern.
-- Backfills by aggregating from mascots.

-- Add columns to workspaces
ALTER TABLE workspaces
ADD COLUMN IF NOT EXISTS total_conversations INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_messages INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_bundle_loads INTEGER NOT NULL DEFAULT 0;

-- Backfill workspace lifetime totals by summing from mascots
UPDATE workspaces w
SET
  total_conversations = COALESCE(agg.total_conv, 0),
  total_messages = COALESCE(agg.total_msg, 0),
  total_bundle_loads = COALESCE(agg.total_bundles, 0)
FROM (
  SELECT
    workspace_slug,
    SUM(COALESCE(total_conversations, 0)) AS total_conv,
    SUM(COALESCE(total_messages, 0)) AS total_msg,
    SUM(COALESCE(total_bundle_loads, 0)) AS total_bundles
  FROM mascots
  GROUP BY workspace_slug
) agg
WHERE w.slug = agg.workspace_slug;


-- ============================================================================
-- Update Session Trigger to Increment Workspace Lifetime Totals
-- ============================================================================

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
    END,
    total_bundle_loads = CASE
      WHEN v_is_bundle_load THEN COALESCE(total_bundle_loads, 0) + 1
      ELSE total_bundle_loads
    END
  WHERE mascot_slug = NEW.mascot_slug;

  -- Update workspace counters (period + lifetime)
  UPDATE workspaces
  SET
    sessions_used = COALESCE(sessions_used, 0) + 1,
    total_conversations = COALESCE(total_conversations, 0) + 1,
    bundle_loads_used = CASE
      WHEN v_is_bundle_load THEN COALESCE(bundle_loads_used, 0) + 1
      ELSE bundle_loads_used
    END,
    total_bundle_loads = CASE
      WHEN v_is_bundle_load THEN COALESCE(total_bundle_loads, 0) + 1
      ELSE total_bundle_loads
    END
  WHERE slug = v_workspace_slug;

  RETURN NEW;
END;
$$;


-- ============================================================================
-- Update Message Trigger to Increment Workspace Lifetime Totals
-- ============================================================================

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

  -- Update workspace counters (period + lifetime)
  UPDATE workspaces
  SET
    messages_used = COALESCE(messages_used, 0) + 1,
    total_messages = COALESCE(total_messages, 0) + 1
  WHERE slug = v_workspace_slug;

  RETURN NEW;
END;
$$;


COMMENT ON FUNCTION track_chat_session_usage IS
'Tracks session and bundle load usage for mascots and workspaces.
Updates both period counters (*_used) and lifetime totals (total_*).
Triggered AFTER INSERT on chat_sessions. Skips dev sessions.';

COMMENT ON FUNCTION track_chat_message_usage IS
'Tracks message usage for mascots and workspaces.
Updates both period counters (*_used) and lifetime totals (total_*).
Triggered AFTER INSERT on chat_messages. Derives mascot from session_id.
Skips messages from dev sessions.';
