-- Keep effective_monthly_fee stored on subscriptions, but always compute it from plan price and discount
BEGIN;

-- Ensure column exists
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS effective_monthly_fee NUMERIC(10,2);

-- Backfill existing rows from plan + discount + custom override
UPDATE public.subscriptions s
SET effective_monthly_fee = ROUND(
    COALESCE(s.custom_monthly_fee, p.monthly_fee_ex_vat) * (1 - (COALESCE(s.discount_percentage, 0) / 100.0)),
    2
)
FROM public.billing_plans p
WHERE p.plan_slug = s.plan_slug;

-- Trigger to keep the stored value in sync on insert/update
CREATE OR REPLACE FUNCTION public.set_effective_monthly_fee()
RETURNS trigger AS $$
DECLARE
  plan_price NUMERIC;
BEGIN
  SELECT monthly_fee_ex_vat INTO plan_price FROM public.billing_plans WHERE plan_slug = NEW.plan_slug;
  NEW.effective_monthly_fee := ROUND(
    COALESCE(NEW.custom_monthly_fee, plan_price) * (1 - (COALESCE(NEW.discount_percentage, 0) / 100.0)),
    2
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_subscriptions_set_effective_fee ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_set_effective_fee
BEFORE INSERT OR UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.set_effective_monthly_fee();

-- Recreate subscriptions_effective view to surface the stored value and effective limits
DROP VIEW IF EXISTS subscriptions_effective CASCADE;

CREATE VIEW subscriptions_effective AS
SELECT
  s.id,
  s.workspace_slug,
  s.client_slug,
  s.plan_slug,
  s.billing_frequency,
  s.contract_start,
  s.contract_end,
  s.renewal_notice_days,
  s.currency,
  s.vat_rate,
  s.vat_scheme,
  s.setup_fee_ex_vat,
  s.discount_percentage,
  s.discount_reason,
  s.custom_monthly_fee,
  s.custom_bundle_limit,
  s.custom_conversations_limit,
  s.notes,
  s.status,
  s.created_at,
  s.updated_at,
  COALESCE(s.custom_bundle_limit, p.bundle_load_limit) AS effective_bundle_limit,
  COALESCE(s.custom_conversations_limit, p.conversations_limit) AS effective_conversations_limit,
  s.effective_monthly_fee AS effective_monthly_fee_computed
FROM public.subscriptions s
JOIN public.billing_plans p ON p.plan_slug = s.plan_slug;

COMMIT;
