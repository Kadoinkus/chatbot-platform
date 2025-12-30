-- One-time charges and reusable assets for enterprise/upsell tracking.
-- - one_time_charges: records bespoke, non-recurring fees (setup, custom assets, integrations, etc.).
-- - assets: reusable deliverables (characters, rigs, animation packs, voices, integrations).
-- - asset_assignments: links assets to clients/workspaces with optional license terms.

BEGIN;

-- Reusable assets (characters, rigs, animation packs, voices, etc.)
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,                       -- e.g., character, rig, animation_pack, voice, integration, other
  description TEXT,
  cost_basis NUMERIC,                       -- optional internal cost reference
  status TEXT NOT NULL DEFAULT 'draft',     -- draft | in_progress | delivered | archived
  delivered_at TIMESTAMPTZ,
  files_uri TEXT,                           -- storage location/URL
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER tr_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Assign assets to clients/workspaces (reuse across accounts is allowed)
CREATE TABLE IF NOT EXISTS public.asset_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  client_slug TEXT NOT NULL REFERENCES public.clients(slug),
  workspace_slug TEXT REFERENCES public.workspaces(slug),
  license_terms TEXT,                       -- optional terms or JSON
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_assignments_asset ON public.asset_assignments(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_client ON public.asset_assignments(client_slug);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_workspace ON public.asset_assignments(workspace_slug);

CREATE TRIGGER tr_asset_assignments_updated_at
  BEFORE UPDATE ON public.asset_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- One-time charges (bespoke, non-recurring fees)
CREATE TABLE IF NOT EXISTS public.one_time_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug TEXT NOT NULL REFERENCES public.clients(slug),
  workspace_slug TEXT REFERENCES public.workspaces(slug),
  asset_id UUID REFERENCES public.assets(id), -- optional link if tied to a specific asset
  description TEXT NOT NULL,
  category TEXT NOT NULL,                     -- e.g., setup, character, rig, animation_pack, voice, integration, custom_dev, other
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending',     -- pending | invoiced | paid | waived | cancelled
  invoice_id TEXT,                            -- internal invoice id
  external_invoice_id TEXT,                   -- external billing system id
  billed_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  delivery_ref TEXT,                          -- e.g., URL, doc id, or file reference
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_one_time_charges_client ON public.one_time_charges(client_slug);
CREATE INDEX IF NOT EXISTS idx_one_time_charges_workspace ON public.one_time_charges(workspace_slug);
CREATE INDEX IF NOT EXISTS idx_one_time_charges_status ON public.one_time_charges(status);

CREATE TRIGGER tr_one_time_charges_updated_at
  BEFORE UPDATE ON public.one_time_charges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;
