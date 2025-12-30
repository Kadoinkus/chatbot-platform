-- New billing/subscription schema with seeded data; drops unused legacy billing/asset tables.
BEGIN;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.billing_plans (
  plan_slug TEXT PRIMARY KEY,
  plan_name TEXT NOT NULL,
  monthly_fee_ex_vat NUMERIC NOT NULL DEFAULT 0,
  bundle_load_limit INTEGER,
  conversations_limit INTEGER,
  is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER tr_billing_plans_updated_at
  BEFORE UPDATE ON public.billing_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_slug TEXT NOT NULL REFERENCES public.workspaces(slug),
  client_slug TEXT NOT NULL REFERENCES public.clients(slug),
  plan_slug TEXT NOT NULL REFERENCES public.billing_plans(plan_slug),
  billing_frequency TEXT NOT NULL CHECK (billing_frequency IN ('monthly','yearly')),
  contract_start DATE NOT NULL,
  contract_end DATE,
  renewal_notice_days INTEGER,
  currency TEXT NOT NULL DEFAULT 'EUR',
  vat_rate NUMERIC,
  vat_scheme TEXT,
  setup_fee_ex_vat NUMERIC,
  discount_percentage NUMERIC,
  discount_reason TEXT,
  custom_monthly_fee NUMERIC,
  effective_monthly_fee NUMERIC,
  custom_bundle_limit NUMERIC,
  custom_conversations_limit NUMERIC,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace ON public.subscriptions(workspace_slug);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON public.subscriptions(client_slug);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan_slug);
CREATE UNIQUE INDEX IF NOT EXISTS uq_subscriptions_active_workspace
  ON public.subscriptions(workspace_slug)
  WHERE status = 'active';

CREATE TRIGGER tr_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_nr TEXT UNIQUE NOT NULL,
  invoice_slug TEXT UNIQUE NOT NULL,
  client_slug TEXT NOT NULL REFERENCES public.clients(slug),
  workspace_slug TEXT REFERENCES public.workspaces(slug),
  invoice_type TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE,
  period_start DATE,
  period_end DATE,
  status TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  vat_rate NUMERIC,
  vat_scheme TEXT,
  amount_ex_vat NUMERIC NOT NULL,
  amount_vat NUMERIC NOT NULL,
  amount_inc_vat NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_slug);
CREATE INDEX IF NOT EXISTS idx_invoices_workspace ON public.invoices(workspace_slug);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

CREATE TRIGGER tr_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  line_nr INTEGER NOT NULL,
  line_type TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit_price_ex_vat NUMERIC NOT NULL,
  amount_ex_vat NUMERIC NOT NULL,
  UNIQUE (invoice_id, line_nr)
);

CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice ON public.invoice_lines(invoice_id);

CREATE TABLE IF NOT EXISTS public.client_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_slug TEXT UNIQUE NOT NULL,
  asset_type TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  client_slug TEXT NOT NULL REFERENCES public.clients(slug),
  mascot_slug TEXT REFERENCES public.mascots(mascot_slug),
  variation TEXT,
  version TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  asset_url TEXT,
  file_size_kb NUMERIC,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_assets_client ON public.client_assets(client_slug);
CREATE INDEX IF NOT EXISTS idx_client_assets_mascot ON public.client_assets(mascot_slug);
CREATE INDEX IF NOT EXISTS idx_client_assets_type ON public.client_assets(asset_type);

CREATE TRIGGER tr_client_assets_updated_at
  BEFORE UPDATE ON public.client_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------

INSERT INTO public.billing_plans (plan_slug, plan_name, monthly_fee_ex_vat, bundle_load_limit, conversations_limit, is_custom)
VALUES
  ('starter', 'Starter', 100.0, 100, 200, FALSE),
  ('basic', 'Basic', 299.0, 1000, 3000, FALSE),
  ('premium', 'Premium', 699.0, 2000, 6000, FALSE),
  ('enterprise', 'Enterprise', 0.0, 0, 0, TRUE),
  ('custom', 'Custom', 0.0, 0, 0, TRUE)
ON CONFLICT (plan_slug) DO NOTHING;

WITH data AS (
  SELECT * FROM (VALUES
    ('HB-wp-001', 'HB', 'starter', 'yearly', '2026-02-01', '2027-02-01', 30, 'EUR', 21, 'standard', 0.00, 100.0, 'pilot client', NULL, 0.0, NULL, NULL, 'Pilot client - free Year 1', 'active'),
    ('hitapes-wp-001', 'hitapes', 'starter', 'yearly', '2026-02-01', '2027-02-01', 30, 'EUR', 21, 'standard', 0.00, 100.0, 'pilot client', NULL, 0.0, NULL, NULL, 'Pilot client - free Year 1', 'active'),
    ('IUS-wp-001', 'IUS', 'custom', 'yearly', '2025-10-01', '2026-10-01', 30, 'EUR', 17, 'standard', 0.00, 0.0, NULL, 136.0, 136.0, 1000.0, 1000.0, 'University partnership', 'active'),
    ('fin-wp-001', 'fin', 'premium', 'yearly', '2026-03-01', '2027-03-01', 30, 'EUR', 21, 'standard', 0.00, 10.0, 'yearly discount', NULL, 629.1, NULL, NULL, '10% annual discount', 'active'),
    ('jumboBB-wp-001', 'jumboBB', 'custom', 'yearly', '2025-05-01', '2026-05-01', 30, 'EUR', 21, 'standard', 0.00, 37.5, 'partner discount', 133.3, 83.3, 100.0, 200.0, 'List price EUR 1,600/year', 'active'),
    ('rauw-wp-001', 'rauw', 'basic', 'yearly', '2026-02-01', '2027-02-01', 30, 'EUR', 21, 'standard', 5000.00, 100.0, 'partner discount', NULL, 0.0, NULL, NULL, 'Setup only - Year 1 license free', 'active'),
    ('se7en-wp-001', 'se7en', 'enterprise', 'yearly', '2025-10-01', '2026-10-01', 30, 'EUR', 21, 'standard', NULL, NULL, NULL, NULL, 0.0, 5000, 8000, 'In-store kiosk - Year 1 included', 'active'),
    ('se7en-wp-002', 'se7en', 'enterprise', 'yearly', '2025-10-01', '2026-10-01', 30, 'EUR', 21, 'standard', 12000.00, 5.0, 'contract discount', 300.0, 285.0, 5000, 8000, 'Website widget - primary contract', 'active'),
    ('notso-wp-001', 'notso', 'basic', 'yearly', '2025-10-01', '2026-10-01', 30, 'EUR', 21, 'standard', 0.00, 100.0, 'internal', NULL, 0.0, NULL, NULL, 'Internal use', 'active'),
    ('jumboDemo-wp-001', 'jumboDemo', 'premium', 'yearly', '2025-08-01', '2026-08-01', 30, 'EUR', 21, 'standard', 0.00, 100.0, 'demo client', NULL, 0.0, NULL, NULL, 'Demo account', 'active'),
    ('jumboDemo-wp-002', 'jumboDemo', 'basic', 'yearly', '2025-08-01', '2026-08-01', 30, 'EUR', 21, 'standard', 0.00, 100.0, 'demo client', NULL, 0.0, NULL, NULL, 'Demo account', 'active'),
    ('jumboDemo-wp-003', 'jumboDemo', 'starter', 'yearly', '2025-08-01', '2026-08-01', 30, 'EUR', 21, 'standard', 0.00, 100.0, 'demo client', NULL, 0.0, NULL, NULL, 'Demo account', 'active')
  ) AS t(
    workspace_slug, client_slug, plan_slug, billing_frequency, contract_start, contract_end,
    renewal_notice_days, currency, vat_rate, vat_scheme, setup_fee_ex_vat, discount_percentage,
    discount_reason, custom_monthly_fee, effective_monthly_fee, custom_bundle_limit,
    custom_conversations_limit, notes, status
  )
),
ready AS (
  SELECT t.*
  FROM data t
  JOIN public.workspaces w ON w.slug = t.workspace_slug
  JOIN public.clients c ON c.slug = t.client_slug
  JOIN public.billing_plans p ON p.plan_slug = t.plan_slug
)
INSERT INTO public.subscriptions (
  workspace_slug, client_slug, plan_slug, billing_frequency, contract_start, contract_end,
  renewal_notice_days, currency, vat_rate, vat_scheme, setup_fee_ex_vat, discount_percentage,
  discount_reason, custom_monthly_fee, effective_monthly_fee, custom_bundle_limit,
  custom_conversations_limit, notes, status
)
SELECT
  workspace_slug,
  client_slug,
  plan_slug,
  billing_frequency,
  contract_start::date,
  contract_end::date,
  renewal_notice_days, currency, vat_rate, vat_scheme, setup_fee_ex_vat, discount_percentage,
  discount_reason, custom_monthly_fee, effective_monthly_fee, custom_bundle_limit,
  custom_conversations_limit, notes, status
FROM ready
ON CONFLICT DO NOTHING;

-- Insert invoices and capture IDs for lines (guarded by existing clients/workspaces)
WITH data AS (
  SELECT * FROM (VALUES
    ('2025-001', 'jumboBB-inv-001', 'jumboBB', 'jumboBB-wp-001', 'subscription', '2025-03-27', '2025-04-10', '2025-05-01', '2026-05-01', 'paid', 'EUR', 21, 'standard', 1000.0, 210.0, 1210.0, 'Annual subscription'),
    ('2025-002', 'se7en-inv-001', 'se7en', 'se7en-wp-002', 'mixed', '2025-08-19', '2025-08-26', '2025-10-01', '2026-10-01', 'paid', 'EUR', 21, 'standard', 7710.0, 1619.1, 9329.1, 'Milestone 1 - 50% kickoff'),
    ('2025-003', 'se7en-inv-002', 'se7en', 'se7en-wp-002', 'mixed', '2025-10-06', '2025-10-13', '2025-10-01', '2026-10-01', 'paid', 'EUR', 21, 'standard', 4626.0, 971.46, 5597.46, 'Milestone 2 - 30% design approval'),
    ('2025-004', 'se7en-inv-003', 'se7en', 'se7en-wp-002', 'mixed', '2025-11-24', '2025-12-01', '2025-10-01', '2026-10-01', 'paid', 'EUR', 21, 'standard', 3084.0, 647.64, 3731.64, 'Milestone 3 - 20% final delivery'),
    ('2025-005', 'se7en-inv-004', 'se7en', 'se7en-wp-002', 'feature', '2025-11-24', '2025-12-08', '2025-10-01', '2026-10-01', 'paid', 'EUR', 21, 'standard', 1800.0, 378.0, 2178.0, 'Extra features'),
    ('2025-006', 'rauw-inv-001', 'rauw', 'rauw-wp-001', 'setup', '2025-12-09', '2025-12-11', '2026-02-01', '2027-02-01', 'paid', 'EUR', 21, 'standard', 2500.0, 525.0, 3025.0, 'Setup fee - 50% aanbetaling'),
    ('2025-007', 'fin-inv-001', 'fin', 'fin-wp-001', 'subscription', '2025-12-10', '2025-12-14', '2026-03-01', '2027-03-01', 'paid', 'EUR', 21, 'standard', 7549.2, 1585.33, 9134.53, 'Annual subscription prepaid'),
    ('2025VIS-001', 'IUS-inv-001', 'IUS', 'IUS-wp-001', 'subscription', '2025-05-16', '2025-05-26', '2025-10-01', '2026-10-01', 'paid', 'EUR', 17, 'standard', 1636.13, 278.14, 1914.27, 'Annual subscription - invoiced via Visiot')
  ) AS t(
    invoice_nr, invoice_slug, client_slug, workspace_slug, invoice_type, invoice_date,
    due_date, period_start, period_end, status, currency, vat_rate, vat_scheme,
    amount_ex_vat, amount_vat, amount_inc_vat, notes
  )
),
ready AS (
  SELECT t.*
  FROM data t
  JOIN public.clients c ON c.slug = t.client_slug
  LEFT JOIN public.workspaces w ON w.slug = t.workspace_slug
  WHERE t.workspace_slug IS NULL OR w.slug IS NOT NULL
),
ins AS (
  INSERT INTO public.invoices (
    invoice_nr, invoice_slug, client_slug, workspace_slug, invoice_type, invoice_date,
    due_date, period_start, period_end, status, currency, vat_rate, vat_scheme,
    amount_ex_vat, amount_vat, amount_inc_vat, notes
  )
  SELECT
    invoice_nr,
    invoice_slug,
    client_slug,
    workspace_slug,
    invoice_type,
    invoice_date::date,
    due_date::date,
    period_start::date,
    period_end::date,
    status,
    currency,
    vat_rate,
    vat_scheme,
    amount_ex_vat, amount_vat, amount_inc_vat, notes
  FROM ready
  ON CONFLICT (invoice_slug) DO NOTHING
  RETURNING id, invoice_slug
)
INSERT INTO public.invoice_lines (
  invoice_id, line_nr, line_type, description, quantity, unit_price_ex_vat, amount_ex_vat
)
SELECT inv.id, l.line_nr, l.line_type, l.description, l.quantity, l.unit_price_ex_vat, l.amount_ex_vat
FROM (VALUES
  ('jumboBB-inv-001', 1, 'subscription', 'Annual chatbot license', 12.0, 83.33, 1000.0),
  ('se7en-inv-001', 1, 'setup', 'Willy AI Mascot Setup - 50%', 1.0, 6000.0, 6000.0),
  ('se7en-inv-001', 2, 'subscription', 'Year 1 license - 50%', 6.0, 285.0, 1710.0),
  ('se7en-inv-002', 1, 'setup', 'Willy AI Mascot Setup - 30%', 1.0, 3600.0, 3600.0),
  ('se7en-inv-002', 2, 'subscription', 'Year 1 license - 30%', 3.6, 285.0, 1026.0),
  ('se7en-inv-003', 1, 'setup', 'Willy AI Mascot Setup - 20%', 1.0, 2400.0, 2400.0),
  ('se7en-inv-003', 2, 'subscription', 'Year 1 license - 20%', 2.4, 285.0, 684.0),
  ('se7en-inv-004', 1, 'feature', 'Color Customization - seat colors in kiosk', 1.0, 1200.0, 1200.0),
  ('se7en-inv-004', 2, 'feature', 'Manual Control - rotate 3D model + fullscreen', 1.0, 600.0, 600.0),
  ('rauw-inv-001', 1, 'setup', 'AI-Maarten Setup - 50% aanbetaling', 1.0, 2500.0, 2500.0),
  ('fin-inv-001', 1, 'subscription', 'Premium annual subscription (10% discount)', 12.0, 629.1, 7549.2),
  ('IUS-inv-001', 1, 'subscription', 'Custom annual subscription', 12.0, 136.34, 1636.13)
) AS l(invoice_slug, line_nr, line_type, description, quantity, unit_price_ex_vat, amount_ex_vat)
JOIN ins inv ON inv.invoice_slug = l.invoice_slug
ON CONFLICT DO NOTHING;

-- Assets (only insert rows where client exists and mascot slug exists if provided)
WITH data AS (
  SELECT * FROM (VALUES
    ('HB-logo-001', 'logo', 'HappinessBureau Logo', 'HB', NULL, NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-12-01'),
    ('HB-avatar-001', 'avatar', 'Joys Profile Picture', 'HB', 'HB-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-12-01'),
    ('HB-widget-001', 'widget', 'Joys Widget', 'HB', 'HB-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-12-01'),
    ('HB-glb-001', 'glb', 'Joys Default', 'HB', 'HB-ma-001', 'default', 'v1', TRUE, NULL, NULL, NULL, '2025-12-01'),
    ('HB-blend-001', 'blend', 'Joys Blender File', 'HB', 'HB-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-12-01'),
    ('HB-prompt-001', 'prompt', 'Joys System Prompt', 'HB', 'HB-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-12-01'),
    ('HB-aprompt-001', 'aprompt', 'Joys Analysis Prompt', 'HB', 'HB-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-12-01'),
    ('HB-config-001', 'config', 'Joys Config', 'HB', 'HB-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-12-01'),
    ('HB-kb-001', 'kb', 'Joys Knowledge Base', 'HB', 'HB-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-12-01'),
    ('IUS-logo-001', 'logo', 'IUS Logo', 'IUS', NULL, NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('IUS-avatar-001', 'avatar', 'Woof Profile Picture', 'IUS', 'IUS-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('IUS-widget-001', 'widget', 'Woof Widget', 'IUS', 'IUS-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('IUS-glb-001', 'glb', 'Woof Default', 'IUS', 'IUS-ma-001', 'default', 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('IUS-blend-001', 'blend', 'Woof Blender File', 'IUS', 'IUS-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('IUS-prompt-001', 'prompt', 'Woof System Prompt', 'IUS', 'IUS-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('IUS-aprompt-001', 'aprompt', 'Woof Analysis Prompt', 'IUS', 'IUS-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('IUS-config-001', 'config', 'Woof Config', 'IUS', 'IUS-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('IUS-kb-001', 'kb', 'Woof Knowledge Base', 'IUS', 'IUS-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('fin-logo-001', 'logo', 'Finsport Logo', 'fin', NULL, NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-03-01'),
    ('fin-avatar-001', 'avatar', 'Fin Profile Picture (Red/White)', 'fin', 'fin-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-03-01'),
    ('fin-avatar-002', 'avatar', 'Fin Profile Picture (Rotterdam)', 'fin', 'fin-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-03-01'),
    ('fin-widget-001', 'widget', 'Fin Red/White Widget', 'fin', 'fin-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-03-01'),
    ('fin-widget-002', 'widget', 'Fin Rotterdam Widget', 'fin', 'fin-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-03-01'),
    ('fin-glb-001', 'glb', 'Fin Red/White Default', 'fin', 'fin-ma-001', 'default', 'v1', TRUE, NULL, NULL, NULL, '2026-03-01'),
    ('fin-glb-002', 'glb', 'Fin Rotterdam Default', 'fin', 'fin-ma-002', 'default', 'v1', TRUE, NULL, NULL, NULL, '2026-03-01'),
    ('fin-blend-001', 'blend', 'Fin Red/White Blender File', 'fin', 'fin-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-03-01'),
    ('fin-blend-002', 'blend', 'Fin Rotterdam Blender File', 'fin', 'fin-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-03-01'),
    ('fin-prompt-001', 'prompt', 'Fin Red/White System Prompt', 'fin', 'fin-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-03-01'),
    ('fin-prompt-002', 'prompt', 'Fin Rotterdam System Prompt', 'fin', 'fin-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-03-01'),
    ('fin-aprompt-001', 'aprompt', 'Fin Red/White Analysis Prompt', 'fin', 'fin-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-03-01'),
    ('fin-aprompt-002', 'aprompt', 'Fin Rotterdam Analysis Prompt', 'fin', 'fin-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-03-01'),
    ('fin-config-001', 'config', 'Fin Red/White Config', 'fin', 'fin-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-03-01'),
    ('fin-config-002', 'config', 'Fin Rotterdam Config', 'fin', 'fin-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-03-01'),
    ('fin-kb-001', 'kb', 'Fin Red/White Knowledge Base', 'fin', 'fin-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-03-01'),
    ('fin-kb-002', 'kb', 'Fin Rotterdam Knowledge Base', 'fin', 'fin-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-03-01'),
    ('hitapes-logo-001', 'logo', 'Hitapes Logo', 'hitapes', NULL, NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-02-01'),
    ('hitapes-avatar-001', 'avatar', 'Vinny Profile Picture', 'hitapes', 'hitapes-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-02-01'),
    ('hitapes-widget-001', 'widget', 'Vinny Widget', 'hitapes', 'hitapes-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-02-01'),
    ('hitapes-glb-001', 'glb', 'Vinny Default', 'hitapes', 'hitapes-ma-001', 'default', 'v1', TRUE, NULL, NULL, NULL, '2026-02-01'),
    ('hitapes-blend-001', 'blend', 'Vinny Blender File', 'hitapes', 'hitapes-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-02-01'),
    ('hitapes-prompt-001', 'prompt', 'Vinny System Prompt', 'hitapes', 'hitapes-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-02-01'),
    ('hitapes-aprompt-001', 'aprompt', 'Vinny Analysis Prompt', 'hitapes', 'hitapes-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-02-01'),
    ('hitapes-config-001', 'config', 'Vinny Config', 'hitapes', 'hitapes-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-02-01'),
    ('hitapes-kb-001', 'kb', 'Vinny Knowledge Base', 'hitapes', 'hitapes-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-02-01'),
    ('jumboBB-logo-001', 'logo', 'Jumbo Logo', 'jumboBB', NULL, NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-05-01'),
    ('jumboBB-avatar-001', 'avatar', 'Liza Profile Picture', 'jumboBB', 'jumboBB-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-05-01'),
    ('jumboBB-widget-001', 'widget', 'Liza Widget', 'jumboBB', 'jumboBB-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-05-01'),
    ('jumboBB-glb-001', 'glb', 'Liza Default', 'jumboBB', 'jumboBB-ma-001', 'default', 'v1', TRUE, NULL, NULL, NULL, '2025-05-01'),
    ('jumboBB-glb-002', 'glb', 'Liza Christmas', 'jumboBB', 'jumboBB-ma-001', 'christmas', 'v1', TRUE, NULL, NULL, 'Christmas outfit', '2025-12-01'),
    ('jumboBB-glb-003', 'glb', 'Liza Santa', 'jumboBB', 'jumboBB-ma-001', 'santa', 'v1', TRUE, NULL, NULL, 'Santa Claus version', '2025-12-01'),
    ('jumboBB-blend-001', 'blend', 'Liza Blender File', 'jumboBB', 'jumboBB-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-05-01'),
    ('jumboBB-prompt-001', 'prompt', 'Liza System Prompt', 'jumboBB', 'jumboBB-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-05-01'),
    ('jumboBB-aprompt-001', 'aprompt', 'Liza Analysis Prompt', 'jumboBB', 'jumboBB-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-05-01'),
    ('jumboBB-config-001', 'config', 'Liza Config', 'jumboBB', 'jumboBB-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-05-01'),
    ('jumboBB-kb-001', 'kb', 'Liza Knowledge Base', 'jumboBB', 'jumboBB-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-05-01'),
    ('jumboDemo-logo-001', 'logo', 'Jumbo Logo (Demo)', 'jumboDemo', NULL, NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-08-01'),
    ('jumboDemo-avatar-001', 'avatar', 'Liza Profile Picture', 'jumboDemo', 'jumboDemo-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-08-01'),
    ('jumboDemo-avatar-002', 'avatar', 'Remco Profile Picture', 'jumboDemo', 'jumboDemo-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-08-01'),
    ('jumboDemo-avatar-003', 'avatar', 'Sarah Profile Picture', 'jumboDemo', 'jumboDemo-ma-003', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-08-01'),
    ('jumboDemo-avatar-004', 'avatar', 'Max Profile Picture', 'jumboDemo', 'jumboDemo-ma-004', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-08-01'),
    ('notso-logo-001', 'logo', 'Notso AI Logo', 'notso', NULL, NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-avatar-001', 'avatar', 'Owen Profile Picture', 'notso', 'notso-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-avatar-002', 'avatar', 'Copanda Profile Picture', 'notso', 'notso-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-avatar-003', 'avatar', 'Donnie Profile Picture', 'notso', 'notso-ma-003', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-widget-001', 'widget', 'Owen Widget', 'notso', 'notso-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-widget-002', 'widget', 'Copanda Widget', 'notso', 'notso-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-widget-003', 'widget', 'Donnie Widget', 'notso', 'notso-ma-003', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-glb-001', 'glb', 'Owen Default', 'notso', 'notso-ma-001', 'default', 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-glb-002', 'glb', 'Copanda Default', 'notso', 'notso-ma-002', 'default', 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-glb-003', 'glb', 'Donnie Default', 'notso', 'notso-ma-003', 'default', 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-blend-001', 'blend', 'Owen Blender File', 'notso', 'notso-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-blend-002', 'blend', 'Copanda Blender File', 'notso', 'notso-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-blend-003', 'blend', 'Donnie Blender File', 'notso', 'notso-ma-003', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-prompt-001', 'prompt', 'Owen System Prompt', 'notso', 'notso-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-prompt-002', 'prompt', 'Copanda System Prompt', 'notso', 'notso-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-prompt-003', 'prompt', 'Donnie System Prompt', 'notso', 'notso-ma-003', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-aprompt-001', 'aprompt', 'Owen Analysis Prompt', 'notso', 'notso-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-aprompt-002', 'aprompt', 'Copanda Analysis Prompt', 'notso', 'notso-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-aprompt-003', 'aprompt', 'Donnie Analysis Prompt', 'notso', 'notso-ma-003', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-config-001', 'config', 'Owen Config', 'notso', 'notso-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-config-002', 'config', 'Copanda Config', 'notso', 'notso-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-config-003', 'config', 'Donnie Config', 'notso', 'notso-ma-003', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-kb-001', 'kb', 'Owen Knowledge Base', 'notso', 'notso-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-kb-002', 'kb', 'Copanda Knowledge Base', 'notso', 'notso-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('notso-kb-003', 'kb', 'Donnie Knowledge Base', 'notso', 'notso-ma-003', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('rauw-logo-001', 'logo', 'Rauw CC Logo', 'rauw', NULL, NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-02-01'),
    ('rauw-avatar-001', 'avatar', 'AI Maarten Profile Picture', 'rauw', 'rauw-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-02-01'),
    ('rauw-widget-001', 'widget', 'AI Maarten Widget', 'rauw', 'rauw-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-02-01'),
    ('rauw-glb-001', 'glb', 'AI Maarten Default', 'rauw', 'rauw-ma-001', 'default', 'v1', TRUE, NULL, NULL, NULL, '2026-02-01'),
    ('rauw-blend-001', 'blend', 'AI Maarten Blender File', 'rauw', 'rauw-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-02-01'),
    ('rauw-prompt-001', 'prompt', 'AI Maarten System Prompt', 'rauw', 'rauw-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-02-01'),
    ('rauw-aprompt-001', 'aprompt', 'AI Maarten Analysis Prompt', 'rauw', 'rauw-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-02-01'),
    ('rauw-config-001', 'config', 'AI Maarten Config', 'rauw', 'rauw-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-02-01'),
    ('rauw-kb-001', 'kb', 'AI Maarten Knowledge Base', 'rauw', 'rauw-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2026-02-01'),
    ('se7en-logo-001', 'logo', 'Se7en Logo', 'se7en', NULL, NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('se7en-avatar-001', 'avatar', 'Willy Profile Picture (Kiosk)', 'se7en', 'se7en-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('se7en-avatar-002', 'avatar', 'Willy Profile Picture (Web)', 'se7en', 'se7en-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('se7en-widget-001', 'widget', 'Willy Kiosk Widget', 'se7en', 'se7en-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('se7en-widget-002', 'widget', 'Willy Web Widget', 'se7en', 'se7en-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('se7en-glb-001', 'glb', 'Willy Kiosk Default', 'se7en', 'se7en-ma-001', 'default', 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('se7en-glb-002', 'glb', 'Willy Web Default', 'se7en', 'se7en-ma-002', 'default', 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('se7en-blend-001', 'blend', 'Willy Kiosk Blender File', 'se7en', 'se7en-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('se7en-blend-002', 'blend', 'Willy Web Blender File', 'se7en', 'se7en-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('se7en-prompt-001', 'prompt', 'Willy Kiosk System Prompt', 'se7en', 'se7en-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('se7en-prompt-002', 'prompt', 'Willy Web System Prompt', 'se7en', 'se7en-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('se7en-aprompt-001', 'aprompt', 'Willy Kiosk Analysis Prompt', 'se7en', 'se7en-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('se7en-aprompt-002', 'aprompt', 'Willy Web Analysis Prompt', 'se7en', 'se7en-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('se7en-config-001', 'config', 'Willy Kiosk Config', 'se7en', 'se7en-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('se7en-config-002', 'config', 'Willy Web Config', 'se7en', 'se7en-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('se7en-kb-001', 'kb', 'Willy Kiosk Knowledge Base', 'se7en', 'se7en-ma-001', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01'),
    ('se7en-kb-002', 'kb', 'Willy Web Knowledge Base', 'se7en', 'se7en-ma-002', NULL, 'v1', TRUE, NULL, NULL, NULL, '2025-10-01')
  ) AS t(
    asset_slug, asset_type, asset_name, client_slug, mascot_slug,
    variation, version, is_active, asset_url, file_size_kb,
    notes, updated_at
  )
),
ready AS (
  SELECT t.*
  FROM data t
  JOIN public.clients c ON c.slug = t.client_slug
  LEFT JOIN public.mascots m ON m.mascot_slug = t.mascot_slug
  WHERE t.mascot_slug IS NULL OR m.mascot_slug IS NOT NULL
)
INSERT INTO public.client_assets (
  asset_slug, asset_type, asset_name, client_slug, mascot_slug, variation, version,
  is_active, asset_url, file_size_kb, notes, updated_at
)
SELECT
  asset_slug::text,
  asset_type::text,
  asset_name::text,
  client_slug::text,
  mascot_slug::text,
  variation::text,
  version::text,
  is_active::boolean,
  asset_url::text,
  file_size_kb::numeric,
  notes::text,
  updated_at::timestamptz
FROM ready
ON CONFLICT (asset_slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Drop unused legacy billing/asset tables (safe because they are unused)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS public.asset_assignments CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.one_time_charges CASCADE;
DROP TABLE IF EXISTS public.credit_transactions CASCADE;

COMMIT;
