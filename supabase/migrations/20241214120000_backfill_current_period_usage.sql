-- ============================================================================
-- Backfill Current Period Usage Counters
-- ============================================================================
-- Populates period counters (sessions_used, messages_used, bundle_loads_used)
-- for both mascots and workspaces with usage from current billing period.
-- Dynamically calculates period start per workspace based on:
-- - next_usage_reset_date
-- - usage_reset_interval (daily, monthly, quarterly, annual)

-- ============================================================================
-- Backfill Workspace Period Counters (with dynamic period start)
-- ============================================================================

UPDATE workspaces w
SET
  sessions_used = COALESCE(stats.sessions_count, 0),
  messages_used = COALESCE(stats.messages_count, 0),
  bundle_loads_used = COALESCE(stats.bundles_count, 0)
FROM (
  SELECT
    ws.slug AS workspace_slug,
    COUNT(DISTINCT cs.id) FILTER (WHERE cs.is_dev = FALSE) AS sessions_count,
    SUM(COALESCE(cs.total_bot_messages, 0) + COALESCE(cs.total_user_messages, 0)) FILTER (WHERE cs.is_dev = FALSE) AS messages_count,
    COUNT(*) FILTER (WHERE cs.is_dev = FALSE AND cs.glb_source IN ('netlify', 'cdn_fetch') AND cs.glb_transfer_size > 0) AS bundles_count
  FROM workspaces ws
  LEFT JOIN mascots m ON m.workspace_slug = ws.slug
  LEFT JOIN chat_sessions cs ON cs.mascot_slug = m.mascot_slug
    AND cs.created_at >= (
      ws.next_usage_reset_date -
      CASE ws.usage_reset_interval
        WHEN 'daily' THEN INTERVAL '1 day'
        WHEN 'monthly' THEN INTERVAL '1 month'
        WHEN 'quarterly' THEN INTERVAL '3 months'
        WHEN 'annual' THEN INTERVAL '1 year'
        ELSE INTERVAL '1 month'
      END
    )::DATE
  GROUP BY ws.slug
) stats
WHERE w.slug = stats.workspace_slug;


-- ============================================================================
-- Backfill Mascot Period Counters (with dynamic period start per workspace)
-- ============================================================================

UPDATE mascots m
SET
  sessions_used = COALESCE(stats.sessions_count, 0),
  messages_used = COALESCE(stats.messages_count, 0),
  bundle_loads_used = COALESCE(stats.bundles_count, 0)
FROM (
  SELECT
    ma.mascot_slug,
    COUNT(cs.id) FILTER (WHERE cs.is_dev = FALSE) AS sessions_count,
    SUM(COALESCE(cs.total_bot_messages, 0) + COALESCE(cs.total_user_messages, 0)) FILTER (WHERE cs.is_dev = FALSE) AS messages_count,
    COUNT(*) FILTER (WHERE cs.is_dev = FALSE AND cs.glb_source IN ('netlify', 'cdn_fetch') AND cs.glb_transfer_size > 0) AS bundles_count
  FROM mascots ma
  JOIN workspaces ws ON ws.slug = ma.workspace_slug
  LEFT JOIN chat_sessions cs ON cs.mascot_slug = ma.mascot_slug
    AND cs.created_at >= (
      ws.next_usage_reset_date -
      CASE ws.usage_reset_interval
        WHEN 'daily' THEN INTERVAL '1 day'
        WHEN 'monthly' THEN INTERVAL '1 month'
        WHEN 'quarterly' THEN INTERVAL '3 months'
        WHEN 'annual' THEN INTERVAL '1 year'
        ELSE INTERVAL '1 month'
      END
    )::DATE
  GROUP BY ma.mascot_slug
) stats
WHERE m.mascot_slug = stats.mascot_slug;
