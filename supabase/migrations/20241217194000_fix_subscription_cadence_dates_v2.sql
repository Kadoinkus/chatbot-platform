-- Recompute subscription cadence dates based on contract_start and billing_frequency (new migration version)
BEGIN;

-- Replace the cadence function to advance from contract_start using billing_frequency
CREATE OR REPLACE FUNCTION public.set_subscription_cadence()
RETURNS trigger AS $$
DECLARE
  today DATE := CURRENT_DATE;
  start_date DATE := COALESCE(NEW.contract_start, today);
  reset_day INT := COALESCE(NEW.billing_reset_day, 1);
  next_usage DATE;
  next_bill DATE;
  month INT;
  year INT;
BEGIN
  -- Next usage reset date
  IF NEW.usage_reset_interval = 'daily' THEN
    next_usage := today + INTERVAL '1 day';
  ELSE
    year := EXTRACT(year FROM today)::int;
    month := EXTRACT(month FROM today)::int;
    next_usage := public.clamp_day_to_month(year, month, reset_day);
    IF next_usage <= today THEN
      IF month = 12 THEN
        year := year + 1;
        month := 1;
      ELSE
        month := month + 1;
      END IF;
      next_usage := public.clamp_day_to_month(year, month, reset_day);
    END IF;
  END IF;
  NEW.next_usage_reset_date := next_usage;

  -- Next billing date: advance from contract_start by billing_frequency until after today
  next_bill := public.clamp_day_to_month(
    EXTRACT(year FROM start_date)::int,
    EXTRACT(month FROM start_date)::int,
    reset_day
  );
  IF next_bill < start_date THEN
    next_bill := start_date;
  END IF;

  WHILE next_bill <= today LOOP
    IF NEW.billing_frequency = 'yearly' THEN
      next_bill := next_bill + INTERVAL '1 year';
    ELSE
      next_bill := next_bill + INTERVAL '1 month';
    END IF;
    next_bill := public.clamp_day_to_month(
      EXTRACT(year FROM next_bill)::int,
      EXTRACT(month FROM next_bill)::int,
      reset_day
    );
  END LOOP;

  NEW.next_billing_date := next_bill;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS trg_subscriptions_set_cadence ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_set_cadence
  BEFORE INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_subscription_cadence();

-- Backfill: fire trigger for all rows
UPDATE public.subscriptions
SET billing_reset_day = billing_reset_day;

COMMIT;
