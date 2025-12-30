-- Use subscription cadence for workspace usage resets instead of workspace cadence columns
BEGIN;

-- Replace process_workspace_usage_resets to read cadence from subscriptions (or mirrored fields)
CREATE OR REPLACE FUNCTION public.process_workspace_usage_resets()
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
  -- Process each workspace due for reset, using subscription cadence
  FOR v_workspace IN
    SELECT w.slug,
           w.sessions_used,
           w.messages_used,
           w.bundle_loads_used,
           w.next_usage_reset_date,
           w.usage_reset_interval,
           w.billing_reset_day,
           w.status,
           -- Prefer cadence mirrored from subscription; fallback to subscription directly
           COALESCE(w.next_usage_reset_date, s.next_usage_reset_date) AS cad_next_usage_reset_date,
           COALESCE(w.usage_reset_interval, s.usage_reset_interval) AS cad_usage_reset_interval,
           COALESCE(w.billing_reset_day, s.billing_reset_day) AS cad_billing_reset_day
    FROM public.workspaces w
    LEFT JOIN public.subscriptions s ON s.workspace_slug = w.slug
    WHERE COALESCE(w.status, 'active') = 'active'
      AND COALESCE(w.next_usage_reset_date, s.next_usage_reset_date) IS NOT NULL
      AND COALESCE(w.usage_reset_interval, s.usage_reset_interval) IS NOT NULL
      AND COALESCE(w.next_usage_reset_date, s.next_usage_reset_date) <= CURRENT_DATE
    FOR UPDATE SKIP LOCKED
  LOOP
    v_current_reset_date := v_workspace.cad_next_usage_reset_date;
    v_is_first_period := TRUE;

    WHILE v_current_reset_date <= CURRENT_DATE LOOP
      -- Calculate next reset date based on subscription cadence (daily/monthly only)
      IF v_workspace.cad_usage_reset_interval = 'daily' THEN
        v_next_reset_date := v_current_reset_date + INTERVAL '1 day';
      ELSE
        -- monthly default; clamp to billing_reset_day (1-28)
        v_next_reset_date := date_trunc('month', v_current_reset_date) + INTERVAL '1 month';
        v_next_reset_date := public.clamp_day_to_month(
          EXTRACT(year FROM v_next_reset_date)::int,
          EXTRACT(month FROM v_next_reset_date)::int,
          LEAST(GREATEST(1, COALESCE(v_workspace.cad_billing_reset_day, 1)), 28)
        );
      END IF;

      -- Period start = previous period boundary
      v_period_start := v_current_reset_date - INTERVAL '1 month';
      IF v_workspace.cad_usage_reset_interval = 'daily' THEN
        v_period_start := v_current_reset_date - INTERVAL '1 day';
      END IF;

      -- First period gets actual usage; missed periods get zeroed
      IF v_is_first_period THEN
        v_sessions := COALESCE(v_workspace.sessions_used, 0);
        v_messages := COALESCE(v_workspace.messages_used, 0);
        v_bundles := COALESCE(v_workspace.bundle_loads_used, 0);
      ELSE
        v_sessions := 0;
        v_messages := 0;
        v_bundles := 0;
      END IF;

      -- Archive the period
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
        v_current_reset_date::timestamptz,
        v_period_start,
        v_current_reset_date - INTERVAL '1 day',
        v_sessions,
        v_messages,
        v_bundles
      );

      v_reset_count := v_reset_count + 1;
      v_is_first_period := FALSE;
      v_current_reset_date := v_next_reset_date;
    END LOOP;

    -- After processing, zero counters and set next_usage_reset_date
    UPDATE workspaces
    SET
      sessions_used = 0,
      messages_used = 0,
      bundle_loads_used = 0,
      next_usage_reset_date = v_current_reset_date
    WHERE slug = v_workspace.slug;

    -- Zero mascot period counters for this workspace
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

COMMIT;
