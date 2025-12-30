-- Add per-message limits aligned with bundle/conversation limits
BEGIN;

-- Plan-level default message cap
ALTER TABLE public.billing_plans
  ADD COLUMN IF NOT EXISTS messages_limit NUMERIC;

-- Subscription-level override and stored effective value
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS custom_messages_limit NUMERIC,
  ADD COLUMN IF NOT EXISTS effective_messages_limit NUMERIC;

-- Extend effective-fields trigger to include messages
CREATE OR REPLACE FUNCTION public.set_subscription_effectives()
RETURNS trigger AS $$
DECLARE
  plan_bundle NUMERIC;
  plan_conv   NUMERIC;
  plan_msg    NUMERIC;
  plan_fee    NUMERIC;
BEGIN
  SELECT bundle_load_limit, conversations_limit, messages_limit, monthly_fee_ex_vat
    INTO plan_bundle, plan_conv, plan_msg, plan_fee
  FROM public.billing_plans
  WHERE plan_slug = NEW.plan_slug;

  NEW.effective_bundle_limit := COALESCE(NEW.custom_bundle_limit, plan_bundle);
  NEW.effective_conversations_limit := COALESCE(NEW.custom_conversations_limit, plan_conv);
  NEW.effective_messages_limit := COALESCE(NEW.custom_messages_limit, plan_msg);

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

-- Backfill to compute effective_* for existing subscriptions
UPDATE public.subscriptions
SET plan_slug = plan_slug;

COMMIT;
