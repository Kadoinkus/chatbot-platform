-- =============================================================================
-- BASELINE MIGRATION: Current Supabase Schema
-- =============================================================================
-- This file documents the ACTUAL database schema as of December 2024.
-- Generated from production database queries.
--
-- DO NOT RUN this on an existing database - it's already applied.
-- Use this to recreate the database from scratch if needed.
-- =============================================================================


-- =============================================================================
-- TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: clients
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  industry TEXT,
  company_size TEXT, -- '1-10', '11-50', '51-200', '201-500', '500+'
  country TEXT,
  timezone TEXT NOT NULL DEFAULT 'Europe/Amsterdam',
  palette_primary TEXT,
  palette_primary_dark TEXT,
  palette_accent TEXT,
  default_workspace_id UUID,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'trial', 'cancelled'
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLE: workspaces
-- Slug format: {client_slug}-wp-{workspace_number:03d}
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  workspace_number INTEGER,
  client_slug TEXT NOT NULL REFERENCES clients(slug),
  name TEXT NOT NULL,
  description TEXT,
  plan TEXT NOT NULL DEFAULT 'starter',
  status TEXT NOT NULL DEFAULT 'active',
  monthly_fee NUMERIC NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  usage_reset_interval TEXT NOT NULL DEFAULT 'monthly',
  billing_reset_day INTEGER NOT NULL DEFAULT 1,
  subscription_start_date DATE,
  next_billing_date DATE,
  next_usage_reset_date DATE,
  -- Usage limits
  bundle_loads_limit INTEGER NOT NULL DEFAULT 0,
  bundle_loads_used INTEGER NOT NULL DEFAULT 0,
  messages_limit INTEGER NOT NULL DEFAULT 0,
  messages_used INTEGER NOT NULL DEFAULT 0,
  api_calls_limit INTEGER NOT NULL DEFAULT 0,
  api_calls_used INTEGER NOT NULL DEFAULT 0,
  sessions_limit INTEGER NOT NULL DEFAULT 0,
  sessions_used INTEGER NOT NULL DEFAULT 0,
  -- Billing
  wallet_credits NUMERIC NOT NULL DEFAULT 0,
  overage_rate_bundle_loads NUMERIC NOT NULL DEFAULT 0,
  overage_rate_messages NUMERIC NOT NULL DEFAULT 0,
  overage_rate_api_calls NUMERIC NOT NULL DEFAULT 0,
  overage_rate_sessions NUMERIC NOT NULL DEFAULT 0,
  -- Overage tracking
  bundle_overage_used INTEGER NOT NULL DEFAULT 0,
  session_overage_used INTEGER NOT NULL DEFAULT 0,
  credits_spent_on_overage NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLE: users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug TEXT NOT NULL REFERENCES clients(slug),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'pending',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,
  conversations_handled INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLE: mascots (AI Assistants)
-- Slug format: {client_slug}-ma-{mascot_number:03d}
-- IMPORTANT: mascot_slug is IMMUTABLE after creation
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mascots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mascot_slug TEXT UNIQUE NOT NULL,
  mascot_number INTEGER,
  mascot_shortcut TEXT,
  client_slug TEXT NOT NULL REFERENCES clients(slug),
  workspace_slug TEXT NOT NULL REFERENCES workspaces(slug),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  total_conversations INTEGER NOT NULL DEFAULT 0,
  total_messages INTEGER NOT NULL DEFAULT 0,
  avg_response_time_ms INTEGER,
  resolution_rate NUMERIC,
  csat_score NUMERIC,
  config_version TEXT,
  bundle_allocation_pct NUMERIC,
  sessions_allocation_pct NUMERIC,
  messages_allocation_pct NUMERIC,
  bundle_loads_used INTEGER NOT NULL DEFAULT 0,
  sessions_used INTEGER NOT NULL DEFAULT 0,
  messages_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLE: workspace_members
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_slug TEXT NOT NULL REFERENCES workspaces(slug),
  user_id UUID NOT NULL REFERENCES users(id),
  role TEXT NOT NULL DEFAULT 'viewer',
  permissions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLE: usage_history
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_slug TEXT NOT NULL REFERENCES workspaces(slug),
  date DATE NOT NULL,
  bundle_loads INTEGER NOT NULL DEFAULT 0,
  messages INTEGER NOT NULL DEFAULT 0,
  api_calls INTEGER NOT NULL DEFAULT 0,
  sessions INTEGER NOT NULL DEFAULT 0,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost_eur NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLE: usage_resets
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usage_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_slug TEXT NOT NULL REFERENCES workspaces(slug),
  reset_at TIMESTAMPTZ NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  bundle_loads_final INTEGER NOT NULL DEFAULT 0,
  messages_final INTEGER NOT NULL DEFAULT 0,
  api_calls_final INTEGER NOT NULL DEFAULT 0,
  sessions_final INTEGER NOT NULL DEFAULT 0,
  overage_charged_eur NUMERIC NOT NULL DEFAULT 0,
  credits_spent_eur NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLE: credit_transactions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_slug TEXT NOT NULL REFERENCES workspaces(slug),
  type TEXT NOT NULL,
  amount_eur NUMERIC NOT NULL,
  balance_after_eur NUMERIC NOT NULL,
  description TEXT,
  reference_id TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLE: chat_sessions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mascot_slug TEXT NOT NULL REFERENCES mascots(mascot_slug),
  client_slug TEXT REFERENCES clients(slug),
  domain TEXT NOT NULL,
  user_id TEXT,
  session_start TIMESTAMPTZ NOT NULL,
  session_end TIMESTAMPTZ,
  first_message_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  last_activity TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  end_reason TEXT,
  total_bot_messages INTEGER NOT NULL DEFAULT 0,
  total_user_messages INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  total_prompt_tokens INTEGER NOT NULL DEFAULT 0,
  total_completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_cost_usd NUMERIC,
  total_cost_eur NUMERIC NOT NULL DEFAULT 0,
  average_response_time_ms INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  referrer_url TEXT,
  page_url TEXT,
  widget_version TEXT,
  easter_eggs_triggered INTEGER NOT NULL DEFAULT 0,
  is_dev BOOLEAN NOT NULL DEFAULT FALSE,
  glb_source TEXT,
  glb_transfer_size INTEGER,
  glb_encoded_body_size INTEGER,
  glb_response_end INTEGER,
  glb_url TEXT,
  full_transcript JSONB,
  analysis_processed BOOLEAN NOT NULL DEFAULT FALSE,
  analysis_status TEXT,
  analysis_attempts INTEGER NOT NULL DEFAULT 0,
  analysis_locked_at TIMESTAMPTZ,
  analysis_processed_at TIMESTAMPTZ,
  analysis_last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLE: chat_session_analyses
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_session_analyses (
  session_id UUID PRIMARY KEY REFERENCES chat_sessions(id),
  mascot_slug TEXT NOT NULL,
  language TEXT,
  sentiment TEXT,
  category TEXT,
  escalated BOOLEAN NOT NULL DEFAULT FALSE,
  forwarded_email BOOLEAN NOT NULL DEFAULT FALSE,
  forwarded_url BOOLEAN NOT NULL DEFAULT FALSE,
  url_links TEXT[],
  email_links TEXT[],
  questions TEXT[],
  unanswered_questions TEXT[],
  summary TEXT,
  session_outcome TEXT,
  resolution_status TEXT,
  engagement_level TEXT,
  conversation_type TEXT,
  analytics_total_tokens INTEGER,
  analytics_total_prompt_tokens INTEGER,
  analytics_total_completion_tokens INTEGER,
  analytics_total_cost_usd NUMERIC,
  analytics_total_cost_eur NUMERIC,
  analytics_model_used TEXT,
  custom_object1 JSONB,
  custom_object2 JSONB,
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLE: chat_messages
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id),
  mascot_slug TEXT NOT NULL,
  author TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  response_time_ms INTEGER,
  response_animation JSONB,
  easter_egg_animation TEXT,
  wait_sequence TEXT,
  has_easter_egg BOOLEAN NOT NULL DEFAULT FALSE,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  model_used TEXT,
  cost_usd NUMERIC,
  cost_eur NUMERIC,
  finish_reason TEXT,
  raw_response TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Utility: update_updated_at_column
-- Automatically updates the updated_at timestamp on row changes
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Utility: safe_int
-- Safely converts text to integer, returns 0 on failure
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION safe_int(p TEXT)
RETURNS INTEGER AS $$
BEGIN
  IF p IS NULL OR trim(p) = '' THEN
    RETURN 0;
  END IF;
  RETURN p::int;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 0;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Utility: safe_numeric
-- Safely converts text to numeric, returns NULL on failure
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION safe_numeric(p TEXT)
RETURNS NUMERIC AS $$
BEGIN
  IF p IS NULL OR trim(p) = '' THEN
    RETURN NULL;
  END IF;
  RETURN p::numeric;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Utility: try_jsonb_array_text
-- Safely converts text to JSONB array, returns empty array on failure
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION try_jsonb_array_text(p TEXT)
RETURNS JSONB AS $$
BEGIN
  IF p IS NULL OR trim(p) = '' THEN
    RETURN '[]'::jsonb;
  END IF;
  RETURN p::jsonb;
EXCEPTION
  WHEN OTHERS THEN
    RETURN '[]'::jsonb;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Mascots: generate_mascot_identifiers
-- Generates mascot_number and mascot_slug if not provided
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_mascot_identifiers()
RETURNS TRIGGER AS $$
BEGIN
  -- Get next number for this client if not provided
  IF NEW.mascot_number IS NULL THEN
    SELECT COALESCE(MAX(mascot_number), 0) + 1 INTO NEW.mascot_number
    FROM mascots WHERE client_slug = NEW.client_slug;
  END IF;

  -- Generate mascot_slug if not provided
  IF NEW.mascot_slug IS NULL THEN
    NEW.mascot_slug := NEW.client_slug || '-ma-' || LPAD(NEW.mascot_number::text, 3, '0');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Mascots: generate_mascot_slug
-- ALWAYS generates mascot_slug (overwrites any provided value)
-- Format: {client_slug}-ma-{mascot_number:03d}
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_mascot_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Always get next number for this client
  IF NEW.mascot_number IS NULL THEN
    SELECT COALESCE(MAX(mascot_number), 0) + 1 INTO NEW.mascot_number
    FROM mascots WHERE client_slug = NEW.client_slug;
  END IF;

  -- ALWAYS generate slug (overwrite any provided value)
  NEW.mascot_slug := NEW.client_slug || '-ma-' || LPAD(NEW.mascot_number::text, 3, '0');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Mascots: prevent_mascot_slug_change
-- Prevents any changes to mascot_slug after creation (IMMUTABILITY)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION prevent_mascot_slug_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.mascot_slug IS DISTINCT FROM NEW.mascot_slug THEN
    RAISE EXCEPTION 'mascot_slug is immutable. Cannot change from % to %',
      OLD.mascot_slug, NEW.mascot_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Workspaces: generate_workspace_slug
-- Generates workspace slug in format: {client_slug}-wp-{number:03d}
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_workspace_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-generate workspace_number if not provided
  IF NEW.workspace_number IS NULL THEN
    SELECT COALESCE(MAX(workspace_number), 0) + 1
    INTO NEW.workspace_number
    FROM workspaces
    WHERE client_slug = NEW.client_slug;
  END IF;

  -- Auto-generate slug from client_slug and workspace_number
  NEW.slug := NEW.client_slug || '-wp-' || LPAD(NEW.workspace_number::text, 3, '0');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Workspaces: slugify_workspace
-- Creates a slug from client_slug and workspace name
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION slugify_workspace(client_slug TEXT, ws_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base TEXT;
BEGIN
  base := concat_ws('-', client_slug, ws_name);
  base := lower(coalesce(base, ''));
  base := regexp_replace(base, '[^a-z0-9]+', '-', 'g');
  base := trim(both '-' from base);
  RETURN base;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Workspaces: set_workspace_slug
-- Sets workspace slug based on name (alternative approach)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_workspace_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT')
     OR (NEW.slug IS NULL OR btrim(NEW.slug) = '')
     OR (TG_OP = 'UPDATE' AND NEW.name IS DISTINCT FROM OLD.name)
  THEN
    NEW.slug := slugify_workspace(NEW.client_slug, NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Chat Sessions: append_session_transcript
-- Appends a message to the session transcript
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION append_session_transcript(session_id UUID, transcript_entry JSONB)
RETURNS VOID AS $$
BEGIN
  IF session_id IS NULL OR transcript_entry IS NULL THEN
    RETURN;
  END IF;

  UPDATE chat_sessions
  SET
    full_transcript = COALESCE(full_transcript, '[]'::jsonb) || jsonb_build_array(transcript_entry),
    updated_at = NOW()
  WHERE id = session_id;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Chat Sessions: update_session_heartbeat
-- Updates the last_activity timestamp for a session
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_session_heartbeat(p_session_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE chat_sessions
  SET last_activity = NOW()
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Chat Sessions: end_session
-- Ends a session with a reason
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION end_session(p_session_id UUID, p_end_reason TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE chat_sessions
  SET
    session_end = NOW(),
    is_active = FALSE,
    end_reason = p_end_reason
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Chat Sessions: close_stale_sessions
-- Closes sessions inactive for specified minutes
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION close_stale_sessions(p_timeout_minutes INTEGER)
RETURNS INTEGER AS $$
DECLARE
  closed_count INTEGER;
BEGIN
  UPDATE chat_sessions
  SET
    session_end = last_activity,
    is_active = FALSE,
    end_reason = 'inactivity_timeout'
  WHERE is_active = TRUE
    AND session_end IS NULL
    AND last_activity < NOW() - (p_timeout_minutes || ' minutes')::INTERVAL;

  GET DIAGNOSTICS closed_count = ROW_COUNT;
  RETURN closed_count;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Chat Messages: update_session_totals
-- Updates session stats when a message is added
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_session_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.author = 'bot' THEN
    UPDATE chat_sessions SET
      total_bot_messages = total_bot_messages + 1,
      total_tokens = total_tokens + COALESCE(NEW.total_tokens, 0),
      total_prompt_tokens = total_prompt_tokens + COALESCE(NEW.prompt_tokens, 0),
      total_completion_tokens = total_completion_tokens + COALESCE(NEW.completion_tokens, 0),
      total_cost_usd = total_cost_usd + COALESCE(NEW.cost_usd, 0),
      total_cost_eur = total_cost_eur + COALESCE(NEW.cost_eur, 0),
      easter_eggs_triggered = easter_eggs_triggered + CASE WHEN NEW.has_easter_egg THEN 1 ELSE 0 END,
      last_activity = NOW(),
      last_message_at = NOW(),
      first_message_at = COALESCE(first_message_at, NOW()),
      updated_at = NOW()
    WHERE id = NEW.session_id;
  ELSIF NEW.author = 'user' THEN
    UPDATE chat_sessions SET
      total_user_messages = total_user_messages + 1,
      last_activity = NOW(),
      last_message_at = NOW(),
      first_message_at = COALESCE(first_message_at, NOW()),
      updated_at = NOW()
    WHERE id = NEW.session_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Chat Messages: refresh_avg_response_time_ms
-- Recalculates average response time for a session
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION refresh_avg_response_time_ms(p_session_id UUID)
RETURNS VOID AS $$
DECLARE
  v_avg NUMERIC;
BEGIN
  SELECT avg(response_time_ms::numeric)
  INTO v_avg
  FROM public.chat_messages
  WHERE session_id = p_session_id
    AND response_time_ms IS NOT NULL;

  UPDATE public.chat_sessions
  SET average_response_time_ms = round(v_avg)::int
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Chat Messages: chat_messages_refresh_avg_rt (trigger function)
-- Calls refresh_avg_response_time_ms on message changes
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION chat_messages_refresh_avg_rt()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.refresh_avg_response_time_ms(COALESCE(NEW.session_id, OLD.session_id));
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Mascots: auto-generate identifiers on insert
CREATE TRIGGER tr_mascot_identifiers
  BEFORE INSERT ON mascots
  FOR EACH ROW
  EXECUTE FUNCTION generate_mascot_identifiers();

-- Mascots: auto-generate slug on insert (enforces format)
CREATE TRIGGER trigger_generate_mascot_slug
  BEFORE INSERT ON mascots
  FOR EACH ROW
  EXECUTE FUNCTION generate_mascot_slug();

-- Mascots: prevent slug changes on update (IMMUTABILITY)
CREATE TRIGGER tr_prevent_mascot_slug_change
  BEFORE UPDATE ON mascots
  FOR EACH ROW
  EXECUTE FUNCTION prevent_mascot_slug_change();

-- Mascots: update timestamp
CREATE TRIGGER update_mascots_updated_at
  BEFORE UPDATE ON mascots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Workspaces: auto-generate slug on insert
CREATE TRIGGER trigger_generate_workspace_slug
  BEFORE INSERT ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION generate_workspace_slug();

-- Workspaces: set slug based on name
CREATE TRIGGER trg_set_workspace_slug
  BEFORE INSERT OR UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION set_workspace_slug();

-- Workspaces: update timestamp
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Clients: update timestamp
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Users: update timestamp
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Workspace Members: update timestamp
CREATE TRIGGER update_workspace_members_updated_at
  BEFORE UPDATE ON workspace_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Chat Sessions: update timestamp
CREATE TRIGGER trigger_update_session_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Chat Messages: update session totals on insert
CREATE TRIGGER trigger_update_session_totals
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_session_totals();

-- Chat Messages: refresh average response time
CREATE TRIGGER trg_chat_messages_refresh_avg_rt
  AFTER INSERT OR UPDATE OR DELETE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION chat_messages_refresh_avg_rt();


-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_mascots_client_slug ON mascots(client_slug);
CREATE INDEX IF NOT EXISTS idx_mascots_workspace_slug ON mascots(workspace_slug);
CREATE INDEX IF NOT EXISTS idx_workspaces_client_slug ON workspaces(client_slug);
CREATE INDEX IF NOT EXISTS idx_users_client_slug ON users(client_slug);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_mascot_slug ON chat_sessions(mascot_slug);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_client_slug ON chat_sessions(client_slug);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_mascot_slug ON chat_messages(mascot_slug);
CREATE INDEX IF NOT EXISTS idx_chat_session_analyses_mascot_slug ON chat_session_analyses(mascot_slug);


-- =============================================================================
-- VIEWS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- VIEW: daily_mascot_analytics
-- Daily aggregated analytics per mascot
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW daily_mascot_analytics AS
SELECT
  date(session_start) AS date,
  COALESCE(mascot_slug, mascot_shortcut) AS mascot_slug,
  count(*) AS total_sessions,
  sum(total_bot_messages) AS total_bot_messages,
  sum(total_user_messages) AS total_user_messages,
  sum((total_bot_messages + total_user_messages)) AS total_messages,
  sum(total_tokens) AS total_tokens,
  sum(total_cost_usd) AS total_cost_usd,
  sum(total_cost_eur) AS total_cost_eur,
  sum(easter_eggs_triggered) AS total_easter_eggs,
  avg((total_bot_messages + total_user_messages)) AS avg_messages_per_session,
  avg(average_response_time_ms) AS avg_response_time_ms
FROM chat_sessions
GROUP BY date(session_start), COALESCE(mascot_slug, mascot_shortcut);

-- -----------------------------------------------------------------------------
-- VIEW: active_sessions
-- Sessions with computed effectively_active status
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW active_sessions AS
SELECT
  id,
  mascot_slug,
  client_slug,
  domain,
  widget_version,
  session_start,
  session_end,
  last_activity,
  is_active,
  end_reason,
  ip_address,
  country,
  city,
  user_agent,
  device_type,
  browser,
  os,
  referrer_url,
  page_url,
  total_bot_messages AS total_messages,
  total_tokens,
  total_prompt_tokens,
  total_completion_tokens,
  total_cost_usd,
  total_cost_eur,
  average_response_time_ms,
  easter_eggs_triggered,
  is_dev,
  full_transcript,
  analysis_processed,
  analysis_status,
  analysis_attempts,
  analysis_locked_at,
  analysis_processed_at,
  analysis_last_error,
  created_at,
  updated_at,
  CASE
    WHEN session_end IS NOT NULL THEN false
    WHEN last_activity < (now() - '00:30:00'::interval) THEN false
    ELSE is_active
  END AS effectively_active,
  COALESCE(session_end, last_activity) AS effective_end_time
FROM chat_sessions cs;

-- -----------------------------------------------------------------------------
-- VIEW: client_analytics
-- Aggregated analytics per client
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW client_analytics AS
SELECT
  client_slug,
  count(*) AS total_sessions,
  sum(total_bot_messages) AS total_bot_messages,
  sum(total_user_messages) AS total_user_messages,
  sum((total_bot_messages + total_user_messages)) AS total_messages,
  sum(total_tokens) AS total_tokens,
  sum(total_cost_usd) AS total_cost_usd,
  sum(total_cost_eur) AS total_cost_eur,
  avg((total_bot_messages + total_user_messages)) AS avg_messages_per_session,
  avg(average_response_time_ms) AS avg_response_time_ms
FROM chat_sessions
GROUP BY client_slug;

-- -----------------------------------------------------------------------------
-- VIEW: chat_sessions_custom1
-- Custom session view with formatted timestamps and joined analysis
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW chat_sessions_custom1 AS
SELECT
  s.id AS session_id,
  s.mascot_slug,
  to_char((s.session_start AT TIME ZONE 'Europe/Amsterdam'), 'FMDD-FMMM-YYYY FMHH24:MI:SS') AS start_time,
  to_char((COALESCE(s.last_activity, s.session_end) AT TIME ZONE 'Europe/Amsterdam'), 'FMDD-FMMM-YYYY FMHH24:MI:SS') AS end_time,
  (NULLIF(s.ip_address, ''))::inet AS ip_address,
  NULLIF(s.country, '') AS country,
  NULLIF(a.language, '') AS language,
  safe_int((s.total_bot_messages)::text) AS messages_sent,
  NULLIF(a.sentiment, '') AS sentiment,
  a.escalated,
  a.forwarded_email,
  s.full_transcript,
  CASE
    WHEN NULLIF((s.average_response_time_ms)::text, '') IS NOT NULL
    THEN replace(to_char((safe_int((s.average_response_time_ms)::text))::numeric / 1000.0, 'FM999999990.999'), '.', ',')
    ELSE NULL
  END AS avg_response_time,
  safe_int((s.total_tokens)::text) AS tokens,
  safe_numeric((s.total_cost_eur)::text) AS tokens_eur,
  NULLIF(a.category, '') AS category,
  try_jsonb_array_text((a.questions)::text) AS questions,
  NULL::smallint AS user_rating,
  NULLIF(a.summary, '') AS summary
FROM chat_sessions s
LEFT JOIN chat_session_analyses a ON a.session_id = s.id;


-- =============================================================================
-- NOTES
-- =============================================================================
--
-- MASCOT_SLUG IMMUTABILITY:
-- - Generated automatically on INSERT: {client_slug}-ma-{number:03d}
-- - Format is ALWAYS enforced (user input is overwritten)
-- - Cannot be changed after creation (trigger raises exception)
--
-- WORKSPACE SLUG:
-- - Format: {client_slug}-wp-{number:03d}
-- - Generated automatically via generate_workspace_slug()
--
-- =============================================================================
