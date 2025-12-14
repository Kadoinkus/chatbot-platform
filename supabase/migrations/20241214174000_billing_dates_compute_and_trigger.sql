-- Compute next_billing_date based on billing_cycle + billing_reset_day
-- and keep it up to date via trigger. Anchors on subscription_start_date
-- (fallback created_at).

CREATE OR REPLACE FUNCTION public.compute_next_billing_date(
  anchor_date DATE,
  billing_reset_day INTEGER,
  billing_cycle TEXT,
  today DATE DEFAULT NOW()::DATE
) RETURNS DATE
LANGUAGE plpgsql
AS $$
DECLARE
  safe_reset_day INTEGER := GREATEST(1, LEAST(28, COALESCE(billing_reset_day, 1)));
  period_months  INTEGER := CASE LOWER(COALESCE(billing_cycle, 'monthly'))
    WHEN 'annual' THEN 12
    WHEN 'quarterly' THEN 3
    WHEN 'daily' THEN 0
    ELSE 1
  END;
  next_reset DATE;
  months_since INTEGER;
BEGIN
  -- Daily billing: next day
  IF period_months = 0 THEN
    RETURN today + INTERVAL '1 day';
  END IF;

  -- Months since anchor
  months_since :=
    (EXTRACT(YEAR FROM today)::INT - EXTRACT(YEAR FROM anchor_date)::INT) * 12 +
    (EXTRACT(MONTH FROM today)::INT - EXTRACT(MONTH FROM anchor_date)::INT);

  -- Next reset based on completed periods since anchor
  next_reset := (anchor_date + MAKE_INTERVAL(months => (FLOOR(months_since / period_months)::INT + 1) * period_months))::DATE;
  next_reset := MAKE_DATE(EXTRACT(YEAR FROM next_reset)::INT, EXTRACT(MONTH FROM next_reset)::INT, safe_reset_day);

  -- If that date is in the past or today, move to the next period
  IF next_reset <= today THEN
    next_reset := (next_reset + MAKE_INTERVAL(months => period_months))::DATE;
    next_reset := MAKE_DATE(EXTRACT(YEAR FROM next_reset)::INT, EXTRACT(MONTH FROM next_reset)::INT, safe_reset_day);
  END IF;

  RETURN next_reset;
END;
$$;

-- Trigger function to ensure next_billing_date stays current
CREATE OR REPLACE FUNCTION public.ensure_workspace_billing_dates()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  anchor_date DATE;
BEGIN
  -- Defaults
  IF NEW.billing_cycle IS NULL THEN
    NEW.billing_cycle := 'monthly';
  END IF;
  IF NEW.billing_reset_day IS NULL THEN
    NEW.billing_reset_day := 1;
  END IF;

  -- Anchor for billing calculations
  anchor_date := COALESCE(NEW.subscription_start_date, NEW.created_at::DATE, CURRENT_DATE);

  -- Recompute when missing, in the past, or billing settings changed
  IF NEW.next_billing_date IS NULL
     OR NEW.next_billing_date::DATE <= CURRENT_DATE
     OR (TG_OP = 'UPDATE' AND (
          (NEW.billing_cycle IS DISTINCT FROM OLD.billing_cycle) OR
          (NEW.billing_reset_day IS DISTINCT FROM OLD.billing_reset_day) OR
          (NEW.subscription_start_date IS DISTINCT FROM OLD.subscription_start_date)
        ))
  THEN
    NEW.next_billing_date := public.compute_next_billing_date(
      anchor_date,
      NEW.billing_reset_day,
      NEW.billing_cycle,
      CURRENT_DATE
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Refresh trigger
DROP TRIGGER IF EXISTS trg_ensure_billing_dates ON public.workspaces;
CREATE TRIGGER trg_ensure_billing_dates
  BEFORE INSERT OR UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_workspace_billing_dates();

-- One-time catch-up: advance any past/empty billing dates
UPDATE public.workspaces w
SET next_billing_date = public.compute_next_billing_date(
  COALESCE(w.subscription_start_date, w.created_at::DATE),
  w.billing_reset_day,
  w.billing_cycle,
  CURRENT_DATE
)
WHERE w.next_billing_date IS NULL
   OR w.next_billing_date::TEXT = ''
   OR w.next_billing_date::DATE IS NULL
   OR w.next_billing_date::DATE <= CURRENT_DATE;
