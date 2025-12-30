-- Recreate subscriptions_effective view with explicit columns (no created_at/updated_at)
BEGIN;

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
  s.effective_monthly_fee,
  s.custom_bundle_limit,
  s.custom_conversations_limit,
  s.notes,
  s.status,
  -- Effective limits: use overrides if present, otherwise plan defaults
  COALESCE(s.custom_bundle_limit, p.bundle_load_limit) AS effective_bundle_limit,
  COALESCE(s.custom_conversations_limit, p.conversations_limit) AS effective_conversations_limit,
  -- Effective monthly fee: custom fee if present, otherwise plan fee; then apply discount
  ROUND(
    COALESCE(s.custom_monthly_fee, p.monthly_fee_ex_vat) * (1 - (COALESCE(s.discount_percentage, 0) / 100.0)),
    2
  ) AS effective_monthly_fee_computed
FROM public.subscriptions s
JOIN public.billing_plans p ON p.plan_slug = s.plan_slug;

COMMIT;
