-- Add cadence fields to subscriptions and keep next reset/billing dates in sync
BEGIN;

-- Add cadence columns with sensible defaults
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS usage_reset_interval TEXT NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS billing_reset_day INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS next_usage_reset_date DATE,
  ADD COLUMN IF NOT EXISTS next_billing_date DATE;

-- Helper function to clamp a day to the last day of a given month
CREATE OR REPLACE FUNCTION public.clamp_day_to_month(p_year INT, p_month INT, p_day INT)
RETURNS DATE AS $$
DECLARE
  month_start DATE;
  month_end DATE;
BEGIN
  month_start := make_date(p_year, p_month, 1);
  month_end := (month_start + INTERVAL '1 month - 1 day')::date;
  RETURN make_date(p_year, p_month, LEAST(p_day, EXTRACT(day FROM month_end)::int));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to compute next usage/billing dates based on cadence fields
CREATE OR REPLACE FUNCTION public.set_subscription_cadence()
RETURNS trigger AS $$
DECLARE
  today DATE := CURRENT_DATE;
  target DATE;
  year INT;
  month INT;
BEGIN
  -- Next usage reset date
  IF NEW.usage_reset_interval = 'daily' THEN
    NEW.next_usage_reset_date := today + INTERVAL '1 day';
  ELSE
    year := EXTRACT(year FROM today)::int;
    month := EXTRACT(month FROM today)::int;
    target := clamp_day_to_month(year, month, COALESCE(NEW.billing_reset_day, 1));
    IF target <= today THEN
      -- move to next month
      IF month = 12 THEN
        year := year + 1;
        month := 1;
      ELSE
        month := month + 1;
      END IF;
      target := clamp_day_to_month(year, month, COALESCE(NEW.billing_reset_day, 1));
    END IF;
    NEW.next_usage_reset_date := target;
  END IF;

  -- Next billing date (based on billing_frequency)
  year := EXTRACT(year FROM today)::int;
  month := EXTRACT(month FROM today)::int;
  target := clamp_day_to_month(year, month, COALESCE(NEW.billing_reset_day, 1));

  IF target <= today THEN
    IF NEW.billing_frequency = 'yearly' THEN
      year := year + 1;
    ELSE
      IF month = 12 THEN
        year := year + 1;
        month := 1;
      ELSE
        month := month + 1;
      END IF;
    END IF;
    target := clamp_day_to_month(year, month, COALESCE(NEW.billing_reset_day, 1));
  END IF;

  NEW.next_billing_date := target;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to keep cadence dates in sync
DROP TRIGGER IF EXISTS trg_subscriptions_set_cadence ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_set_cadence
  BEFORE INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_subscription_cadence();

-- Backfill cadence dates for existing rows
-- Force trigger to run for existing rows
UPDATE public.subscriptions
SET billing_reset_day = billing_reset_day;

COMMIT;
