-- Add overage rates to plans/subscriptions and compute effective values (sessions + bundle loads)
BEGIN;

-- Plan-level defaults
ALTER TABLE public.billing_plans
  ADD COLUMN IF NOT EXISTS overage_rate_bundle_loads NUMERIC,
  ADD COLUMN IF NOT EXISTS overage_rate_conversations NUMERIC;

-- Subscription-level overrides and stored effective values
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS custom_overage_rate_bundle_loads NUMERIC,
  ADD COLUMN IF NOT EXISTS custom_overage_rate_conversations NUMERIC,
  ADD COLUMN IF NOT EXISTS effective_overage_rate_bundle_loads NUMERIC,
  ADD COLUMN IF NOT EXISTS effective_overage_rate_conversations NUMERIC;

-- Update the effective-fields function to include overage rates
CREATE OR REPLACE FUNCTION public.set_subscription_effectives()
RETURNS trigger AS $$
DECLARE
  plan_bundle           NUMERIC;
  plan_conv             NUMERIC;
  plan_msg              NUMERIC;
  plan_fee              NUMERIC;
  plan_overage_bundle   NUMERIC;
  plan_overage_conv     NUMERIC;
BEGIN
  SELECT
    bundle_load_limit,
    conversations_limit,
    messages_limit,
    monthly_fee_ex_vat,
    overage_rate_bundle_loads,
    overage_rate_conversations
  INTO
    plan_bundle,
    plan_conv,
    plan_msg,
    plan_fee,
    plan_overage_bundle,
    plan_overage_conv
  FROM public.billing_plans
  WHERE plan_slug = NEW.plan_slug;

  -- Limits
  NEW.effective_bundle_limit := COALESCE(NEW.custom_bundle_limit, plan_bundle);
  NEW.effective_conversations_limit := COALESCE(NEW.custom_conversations_limit, plan_conv);
  NEW.effective_messages_limit := COALESCE(NEW.custom_messages_limit, plan_msg);

  -- Overage rates
  NEW.effective_overage_rate_bundle_loads :=
    COALESCE(NEW.custom_overage_rate_bundle_loads, plan_overage_bundle);
  NEW.effective_overage_rate_conversations :=
    COALESCE(NEW.custom_overage_rate_conversations, plan_overage_conv);

  -- Price
  NEW.effective_monthly_fee :=
    ROUND(
      COALESCE(NEW.custom_monthly_fee, plan_fee)
      * (1 - (COALESCE(NEW.discount_percentage, 0) / 100.0)),
      2
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_subscriptions_set_effectives ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_set_effectives
  BEFORE INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_subscription_effectives();

-- Backfill existing rows
UPDATE public.subscriptions
SET plan_slug = plan_slug;

COMMIT;
