-- Add plan capability/support fields and seed values
BEGIN;

-- 1) Add columns (idempotent)
ALTER TABLE public.billing_plans
  ADD COLUMN IF NOT EXISTS mascots_limit INT,
  ADD COLUMN IF NOT EXISTS knowledge_pages_per_mascot INT,
  ADD COLUMN IF NOT EXISTS flow_access_level TEXT,
  ADD COLUMN IF NOT EXISTS analytics_tier TEXT,
  ADD COLUMN IF NOT EXISTS customization_tier TEXT,
  ADD COLUMN IF NOT EXISTS support_sla_hours INT,
  ADD COLUMN IF NOT EXISTS support_channels TEXT[],
  ADD COLUMN IF NOT EXISTS security_tier TEXT,
  ADD COLUMN IF NOT EXISTS white_label BOOLEAN DEFAULT FALSE;

-- 2) Update plan rows (skip custom)
UPDATE public.billing_plans SET
  mascots_limit = 1,
  knowledge_pages_per_mascot = 5,
  flow_access_level = 'single_basic_flow',
  analytics_tier = 'standard',
  customization_tier = 'basic',
  support_sla_hours = 120,
  support_channels = ARRAY['email'],
  security_tier = 'standard',
  white_label = FALSE
WHERE plan_slug = 'starter';

UPDATE public.billing_plans SET
  mascots_limit = 3,
  knowledge_pages_per_mascot = 10,
  flow_access_level = 'basic_flows',
  analytics_tier = 'standard',
  customization_tier = 'basic',
  support_sla_hours = 24,
  support_channels = ARRAY['email'],
  security_tier = 'standard',
  white_label = FALSE
WHERE plan_slug = 'basic';

UPDATE public.billing_plans SET
  mascots_limit = 10,
  knowledge_pages_per_mascot = 20,
  flow_access_level = 'basic_and_advanced_flows',
  analytics_tier = 'advanced',
  customization_tier = 'advanced',
  support_sla_hours = 24,
  support_channels = ARRAY['email','phone'],
  security_tier = 'enhanced',
  white_label = FALSE
WHERE plan_slug = 'premium';

UPDATE public.billing_plans SET
  mascots_limit = NULL,
  knowledge_pages_per_mascot = NULL,
  flow_access_level = 'custom_flows',
  analytics_tier = 'custom',
  customization_tier = 'white_label',
  support_sla_hours = NULL,
  support_channels = ARRAY['email','phone'],
  security_tier = 'enterprise',
  white_label = TRUE
WHERE plan_slug = 'enterprise';

COMMIT;
