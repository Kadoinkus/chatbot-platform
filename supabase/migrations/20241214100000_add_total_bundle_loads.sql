-- ============================================================================
-- Add total_bundle_loads Column to Mascots
-- ============================================================================
-- Adds lifetime bundle load tracking to match sessions and messages pattern.

-- Add column to mascots
ALTER TABLE mascots
ADD COLUMN IF NOT EXISTS total_bundle_loads INTEGER NOT NULL DEFAULT 0;

-- Backfill historical bundle loads
UPDATE mascots m
SET total_bundle_loads = COALESCE(stats.bundle_loads, 0)
FROM (
  SELECT
    mascot_slug,
    COUNT(*) FILTER (
      WHERE glb_source IN ('netlify', 'cdn_fetch')
      AND glb_transfer_size > 0
      AND is_dev = FALSE
    ) AS bundle_loads
  FROM chat_sessions
  WHERE mascot_slug IS NOT NULL
  GROUP BY mascot_slug
) stats
WHERE m.mascot_slug = stats.mascot_slug
  AND COALESCE(m.total_bundle_loads, 0) = 0;

-- Update the session tracking trigger to also increment total_bundle_loads
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
Triggered AFTER INSERT on chat_sessions. Skips dev sessions.
Updates both period counters (*_used) and lifetime totals (total_*).';
