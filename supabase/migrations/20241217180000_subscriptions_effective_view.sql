-- Compute effective limits and pricing from billing_plans + subscriptions
BEGIN;

CREATE OR REPLACE VIEW subscriptions_effective AS
SELECT
  s.*,
  -- Effective limits: use overrides if present, otherwise plan defaults
  COALESCE(s.custom_bundle_limit, p.bundle_load_limit) AS effective_bundle_limit,
  COALESCE(s.custom_conversations_limit, p.conversations_limit) AS effective_conversations_limit,
  -- Effective monthly fee: custom fee if present, otherwise plan fee; then apply discount
  ROUND(
    (COALESCE(s.custom_monthly_fee, p.monthly_fee_ex_vat) * (1 - (COALESCE(s.discount_percentage, 0) / 100.0))),
    2
  ) AS effective_monthly_fee_computed
FROM public.subscriptions s
JOIN public.billing_plans p ON p.plan_slug = s.plan_slug;

COMMIT;
