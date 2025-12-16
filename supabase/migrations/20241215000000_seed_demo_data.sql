-- ============================================================================
-- MIGRATION: Seed Demo Data for jumboDemo and hitapesDemo
-- ============================================================================
-- This migration backfills demo data into Supabase so demo clients work like
-- real clients with data fetched from the database.
--
-- Demo clients:
--   - jumboDemo (Jumbo retail demo)
--   - hitapesDemo (HiTapes tech demo)
--
-- This script is idempotent - safe to run multiple times.
-- Uses DELETE + INSERT approach for clean, consistent demo data on every run.
-- ============================================================================

BEGIN;

-- ============================================================================
-- CLEANUP: Remove existing demo data for fresh reseed
-- ============================================================================
-- Order matters due to foreign key constraints (delete children first)
-- Chat tables first (if chat migration was previously applied)
DELETE FROM chat_session_analyses WHERE mascot_slug LIKE 'jumboDemo%' OR mascot_slug LIKE 'hitapesDemo%';
DELETE FROM chat_messages WHERE mascot_slug LIKE 'jumboDemo%' OR mascot_slug LIKE 'hitapesDemo%';
DELETE FROM chat_sessions WHERE client_slug IN ('jumboDemo', 'hitapesDemo');
-- Then workspace-related tables
DELETE FROM credit_transactions WHERE workspace_slug LIKE 'jumboDemo%' OR workspace_slug LIKE 'hitapesDemo%';
DELETE FROM usage_resets WHERE workspace_slug LIKE 'jumboDemo%' OR workspace_slug LIKE 'hitapesDemo%';
DELETE FROM usage_history WHERE workspace_slug LIKE 'jumboDemo%' OR workspace_slug LIKE 'hitapesDemo%';
DELETE FROM workspace_members WHERE workspace_slug LIKE 'jumboDemo%' OR workspace_slug LIKE 'hitapesDemo%';
DELETE FROM users WHERE client_slug IN ('jumboDemo', 'hitapesDemo');
DELETE FROM mascots WHERE client_slug IN ('jumboDemo', 'hitapesDemo');
DELETE FROM workspaces WHERE client_slug IN ('jumboDemo', 'hitapesDemo');
DELETE FROM clients WHERE slug IN ('jumboDemo', 'hitapesDemo');

-- ============================================================================
-- 1. CLIENTS
-- ============================================================================
INSERT INTO clients (
  id, slug, name, email, phone, website, logo_url, industry, company_size,
  country, timezone, palette_primary, palette_primary_dark, palette_accent,
  default_workspace_id, is_demo, status, trial_ends_at, created_at, updated_at
) VALUES
  (
    'c1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
    'jumboDemo',
    'Jumbo',
    'jumbo@demo.app',
    '+31 20 123 4567',
    'https://jumbo.com',
    '/images/client-logos/jumbo-logo.png',
    'Retail',
    '500+',
    'NL',
    'Europe/Amsterdam',
    '#FFD700',
    '#E6C200',
    '#111827',
    'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    TRUE,
    'active',
    NULL,
    '2024-01-01T00:00:00Z',
    '2024-12-01T10:30:00Z'
  ),
  (
    'd2e3f4a5-b6c7-4d8e-9f0a-1b2c3d4e5f6a',
    'hitapesDemo',
    'HiTapes',
    'hitapes@demo.app',
    '+31 30 987 6543',
    'https://hitapes.com',
    '/images/client-logos/hitapes-logo.png',
    'Technology',
    '11-50',
    'NL',
    'Europe/Amsterdam',
    '#0EA5E9',
    '#0284C7',
    '#111827',
    'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
    TRUE,
    'active',
    NULL,
    '2024-01-01T00:00:00Z',
    '2024-11-15T14:20:00Z'
  );

-- ============================================================================
-- 2. WORKSPACES
-- ============================================================================
INSERT INTO workspaces (
  id, slug, workspace_number, client_slug, name, description, plan, status,
  monthly_fee, billing_cycle, usage_reset_interval, billing_reset_day,
  subscription_start_date, next_billing_date, next_usage_reset_date,
  bundle_loads_limit, bundle_loads_used, messages_limit, messages_used,
  api_calls_limit, api_calls_used, sessions_limit, sessions_used,
  wallet_credits, overage_rate_bundle_loads, overage_rate_messages,
  overage_rate_api_calls, overage_rate_sessions,
  total_conversations, total_messages, total_bundle_loads,
  created_at, updated_at
) VALUES
  -- jumboDemo-wp-001: Customer Service (Premium)
  (
    'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    'jumboDemo-wp-001',
    1,
    'jumboDemo',
    'Customer Service',
    'Main customer support workspace',
    'premium',
    'active',
    2499.0,
    'annual',
    'monthly',
    1,
    '2024-01-01',
    '2026-01-01',
    '2025-01-01',
    25000, 18500,
    500000, 234000,
    1000000, 445000,
    125000, 89500,
    50.0,
    0.25, 0.0015, 0.0001, 0.01,
    35000, 280000, 26500,
    '2024-01-01T00:00:00Z',
    '2024-12-09T10:00:00Z'
  ),
  -- jumboDemo-wp-002: HR Support (Basic)
  (
    'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    'jumboDemo-wp-002',
    2,
    'jumboDemo',
    'HR Support',
    'Internal employee assistance',
    'basic',
    'active',
    299.0,
    'annual',
    'monthly',
    15,
    '2024-01-15',
    '2026-01-15',
    '2025-01-15',
    5000, 1200,
    100000, 28000,
    250000, 65000,
    25000, 6200,
    25.0,
    0.3, 0.002, 0.00015, 0.015,
    8500, 56000, 2400,
    '2024-01-15T00:00:00Z',
    '2024-12-09T10:00:00Z'
  ),
  -- jumboDemo-wp-003: Store Locator (Starter)
  (
    'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
    'jumboDemo-wp-003',
    3,
    'jumboDemo',
    'Store Locator',
    'Simple store information bot',
    'starter',
    'active',
    99.0,
    'annual',
    'daily',
    20,
    '2024-01-20',
    '2026-01-20',
    '2024-12-10',
    1000, 890,
    25000, 12000,
    50000, 18000,
    5000, 4200,
    0,
    0.35, 0.0025, 0.0002, 0.02,
    5600, 24000, 1800,
    '2024-01-20T00:00:00Z',
    '2024-12-09T10:00:00Z'
  ),
  -- hitapesDemo-wp-001: Main Workspace (Basic)
  (
    'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
    'hitapesDemo-wp-001',
    1,
    'hitapesDemo',
    'Main Workspace',
    'All company operations',
    'basic',
    'active',
    299.0,
    'annual',
    'monthly',
    1,
    '2024-01-01',
    '2026-01-01',
    '2025-01-01',
    5000, 5150,
    100000, 56000,
    250000, 123000,
    25000, 15800,
    43.0,
    0.3, 0.002, 0.00015, 0.015,
    17000, 112000, 8500,
    '2024-01-01T00:00:00Z',
    '2024-12-09T10:00:00Z'
  );

-- ============================================================================
-- 3. MASCOTS
-- ============================================================================
INSERT INTO mascots (
  id, mascot_slug, mascot_number, mascot_shortcut, client_slug, workspace_slug,
  name, description, image_url, status,
  total_conversations, total_messages, total_bundle_loads,
  avg_response_time_ms, resolution_rate, csat_score, config_version,
  bundle_allocation_pct, sessions_allocation_pct, messages_allocation_pct,
  bundle_loads_used, sessions_used, messages_used,
  created_at, updated_at
) VALUES
  -- Liza (jumboDemo Customer Service)
  (
    '11111111-1111-4111-8111-111111111111',
    'jumboDemo-ma-001',
    1,
    NULL,
    'jumboDemo',
    'jumboDemo-wp-001',
    'Liza',
    'Customer service assistant for general inquiries',
    '/images/client-mascots/m1-liza.png',
    'active',
    35000, 87500, 8500,
    1200, 82.0, 4.5, 'v2.1.0',
    30, 30, 30,
    5550, 26850, 70200,
    '2024-01-01T00:00:00Z',
    '2024-12-09T10:00:00Z'
  ),
  -- Remco (jumboDemo Technical Support)
  (
    '22222222-2222-4222-8222-222222222222',
    'jumboDemo-ma-002',
    2,
    NULL,
    'jumboDemo',
    'jumboDemo-wp-001',
    'Remco',
    'Technical support specialist assistant',
    '/images/client-mascots/m2-remco.png',
    'active',
    75000, 200000, 18000,
    800, 88.0, 4.7, 'v2.1.0',
    70, 70, 70,
    12950, 62650, 163800,
    '2024-01-15T00:00:00Z',
    '2024-12-09T10:00:00Z'
  ),
  -- Sarah (jumboDemo HR)
  (
    '33333333-3333-4333-8333-333333333333',
    'jumboDemo-ma-003',
    3,
    NULL,
    'jumboDemo',
    'jumboDemo-wp-002',
    'Sarah',
    'HR assistant for internal queries',
    '/images/client-mascots/m3-sarah.png',
    'active',
    8500, 35000, 2400,
    1000, 80.0, 4.6, 'v2.0.5',
    NULL, NULL, NULL,
    1200, 6200, 28000,
    '2024-01-20T00:00:00Z',
    '2024-12-09T10:00:00Z'
  ),
  -- Max (jumboDemo Store Locator)
  (
    '44444444-4444-4444-8444-444444444444',
    'jumboDemo-ma-004',
    4,
    NULL,
    'jumboDemo',
    'jumboDemo-wp-003',
    'Max',
    'Store information and locator assistant',
    '/images/client-mascots/m4-max.png',
    'active',
    5600, 15000, 1800,
    500, 95.0, 4.9, 'v1.8.0',
    NULL, NULL, NULL,
    890, 4200, 12000,
    '2024-02-01T00:00:00Z',
    '2024-12-09T10:00:00Z'
  ),
  -- Vinny (hitapesDemo Sales)
  (
    '55555555-5555-4555-8555-555555555555',
    'hitapesDemo-ma-001',
    1,
    NULL,
    'hitapesDemo',
    'hitapesDemo-wp-001',
    'Vinny',
    'Sales assistant and product recommendations',
    '/images/client-mascots/m5-vinny.png',
    'active',
    12000, 51000, 5000,
    900, 85.0, 4.8, 'v2.0.0',
    60, 60, 60,
    3090, 9480, 33600,
    '2024-01-01T00:00:00Z',
    '2024-12-09T10:00:00Z'
  ),
  -- Tech (hitapesDemo Technical Support - paused)
  (
    '66666666-6666-4666-8666-666666666666',
    'hitapesDemo-ma-002',
    2,
    NULL,
    'hitapesDemo',
    'hitapesDemo-wp-001',
    'Tech',
    'Technical support and troubleshooting',
    '/images/client-mascots/m6-tech.png',
    'paused',
    8000, 30000, 3500,
    NULL, NULL, NULL, 'v1.5.0',
    40, 40, 40,
    2060, 6320, 22400,
    '2024-03-01T00:00:00Z',
    '2024-12-09T10:00:00Z'
  );

-- ============================================================================
-- 4. USERS
-- ============================================================================
INSERT INTO users (
  id, client_slug, name, email, avatar_url, phone, role, status,
  email_verified, last_login_at, last_active_at,
  invited_by, invited_at, joined_at, conversations_handled,
  created_at, updated_at
) VALUES
  -- Sarah Johnson (jumboDemo admin)
  (
    'e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b',
    'jumboDemo',
    'Sarah Johnson',
    'sarah@jumbo.com',
    NULL,
    '+1 (555) 123-4567',
    'admin',
    'active',
    TRUE,
    '2024-12-09T08:30:00Z',
    '2024-12-09T10:28:00Z',
    NULL, NULL,
    '2023-01-15T00:00:00Z',
    1247,
    '2023-01-15T00:00:00Z',
    '2024-12-09T10:28:00Z'
  ),
  -- Mike Chen (jumboDemo manager)
  (
    'f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c',
    'jumboDemo',
    'Mike Chen',
    'mike@jumbo.com',
    NULL,
    '+1 (555) 234-5678',
    'manager',
    'active',
    TRUE,
    '2024-12-09T07:00:00Z',
    '2024-12-09T09:30:00Z',
    'e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b',
    '2023-02-18T00:00:00Z',
    '2023-02-20T00:00:00Z',
    892,
    '2023-02-20T00:00:00Z',
    '2024-12-09T09:30:00Z'
  ),
  -- Emily Rodriguez (jumboDemo agent)
  (
    'a3b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7d',
    'jumboDemo',
    'Emily Rodriguez',
    'emily@jumbo.com',
    NULL,
    NULL,
    'member',
    'active',
    TRUE,
    '2024-12-09T08:45:00Z',
    '2024-12-09T10:15:00Z',
    'e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b',
    '2023-03-08T00:00:00Z',
    '2023-03-10T00:00:00Z',
    634,
    '2023-03-10T00:00:00Z',
    '2024-12-09T10:15:00Z'
  ),
  -- David Park (jumboDemo agent - inactive)
  (
    'b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e',
    'jumboDemo',
    'David Park',
    'david@jumbo.com',
    NULL,
    NULL,
    'member',
    'inactive',
    TRUE,
    '2024-12-07T09:00:00Z',
    '2024-12-07T17:00:00Z',
    'f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c',
    '2023-04-03T00:00:00Z',
    '2023-04-05T00:00:00Z',
    456,
    '2023-04-05T00:00:00Z',
    '2024-12-07T17:00:00Z'
  ),
  -- Lisa Wong (jumboDemo viewer - pending)
  (
    'c5d6e7f8-a9b0-4c1d-2e3f-4a5b6c7d8e9f',
    'jumboDemo',
    'Lisa Wong',
    'lisa@jumbo.com',
    NULL,
    NULL,
    'viewer',
    'pending',
    FALSE,
    NULL,
    NULL,
    'e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b',
    '2024-01-08T00:00:00Z',
    NULL,
    0,
    '2024-01-10T00:00:00Z',
    '2024-01-10T00:00:00Z'
  ),
  -- Alex Thompson (hitapesDemo admin)
  (
    'd6e7f8a9-b0c1-4d2e-3f4a-5b6c7d8e9f0a',
    'hitapesDemo',
    'Alex Thompson',
    'alex@hitapes.com',
    NULL,
    '+1 (555) 345-6789',
    'admin',
    'active',
    TRUE,
    '2024-12-09T08:55:00Z',
    '2024-12-09T10:25:00Z',
    NULL, NULL,
    '2023-01-10T00:00:00Z',
    890,
    '2023-01-10T00:00:00Z',
    '2024-12-09T10:25:00Z'
  );

-- ============================================================================
-- 5. WORKSPACE_MEMBERS
-- ============================================================================
INSERT INTO workspace_members (
  id, workspace_slug, user_id, role, permissions, created_at, updated_at
) VALUES
  ('0000aaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'jumboDemo-wp-001', 'e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', 'admin', NULL, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
  ('0000bbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'jumboDemo-wp-001', 'f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c', 'manager', NULL, '2024-02-20T00:00:00Z', '2024-02-20T00:00:00Z'),
  ('0000cccc-cccc-4ccc-8ccc-cccccccccccc', 'jumboDemo-wp-001', 'a3b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7d', 'agent', NULL, '2024-03-10T00:00:00Z', '2024-03-10T00:00:00Z'),
  ('0000dddd-dddd-4ddd-8ddd-dddddddddddd', 'jumboDemo-wp-001', 'b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e', 'agent', NULL, '2024-04-05T00:00:00Z', '2024-04-05T00:00:00Z'),
  ('0000eeee-eeee-4eee-8eee-eeeeeeeeeeee', 'jumboDemo-wp-002', 'e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', 'admin', NULL, '2024-01-15T00:00:00Z', '2024-01-15T00:00:00Z'),
  ('0000ffff-ffff-4fff-8fff-ffffffffffff', 'jumboDemo-wp-002', 'f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c', 'manager', '{"can_manage_users": true, "can_view_analytics": true, "can_edit_mascots": false}'::JSONB, '2024-02-20T00:00:00Z', '2024-06-15T00:00:00Z'),
  ('00001111-1111-4111-8111-111111111111', 'jumboDemo-wp-003', 'e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', 'admin', NULL, '2024-01-20T00:00:00Z', '2024-01-20T00:00:00Z'),
  ('00002222-2222-4222-8222-222222222222', 'jumboDemo-wp-003', 'c5d6e7f8-a9b0-4c1d-2e3f-4a5b6c7d8e9f', 'viewer', NULL, '2024-01-10T00:00:00Z', '2024-01-10T00:00:00Z'),
  ('00003333-3333-4333-8333-333333333333', 'hitapesDemo-wp-001', 'd6e7f8a9-b0c1-4d2e-3f4a-5b6c7d8e9f0a', 'admin', NULL, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z');

-- ============================================================================
-- 6. USAGE_HISTORY
-- ============================================================================
INSERT INTO usage_history (
  id, workspace_slug, date, bundle_loads, messages, api_calls, sessions,
  tokens_used, cost_eur, created_at
) VALUES
  -- jumboDemo-wp-001
  ('aaaa1111-1111-4111-8111-111111111111', 'jumboDemo-wp-001', '2024-12-09', 620, 7800, 14500, 2980, 185000, 2.78, '2024-12-09T23:59:59Z'),
  ('aaaa2222-2222-4222-8222-222222222222', 'jumboDemo-wp-001', '2024-12-08', 580, 7200, 13800, 2850, 172000, 2.58, '2024-12-08T23:59:59Z'),
  ('aaaa3333-3333-4333-8333-333333333333', 'jumboDemo-wp-001', '2024-12-07', 610, 7600, 14200, 2920, 180000, 2.70, '2024-12-07T23:59:59Z'),
  ('aaaa4444-4444-4444-8444-444444444444', 'jumboDemo-wp-001', '2024-12-06', 595, 7400, 14000, 2880, 176000, 2.64, '2024-12-06T23:59:59Z'),
  ('aaaa5555-5555-4555-8555-555555555555', 'jumboDemo-wp-001', '2024-12-05', 605, 7500, 14100, 2900, 178000, 2.67, '2024-12-05T23:59:59Z'),
  -- jumboDemo-wp-002
  ('bbbb1111-1111-4111-8111-111111111111', 'jumboDemo-wp-002', '2024-12-09', 42, 950, 2200, 210, 22000, 0.33, '2024-12-09T23:59:59Z'),
  ('bbbb2222-2222-4222-8222-222222222222', 'jumboDemo-wp-002', '2024-12-08', 38, 880, 2050, 195, 20500, 0.31, '2024-12-08T23:59:59Z'),
  ('bbbb3333-3333-4333-8333-333333333333', 'jumboDemo-wp-002', '2024-12-07', 40, 920, 2150, 205, 21500, 0.32, '2024-12-07T23:59:59Z'),
  ('bbbb4444-4444-4444-8444-444444444444', 'jumboDemo-wp-002', '2024-12-06', 36, 850, 1980, 188, 19800, 0.30, '2024-12-06T23:59:59Z'),
  ('bbbb5555-5555-4555-8555-555555555555', 'jumboDemo-wp-002', '2024-12-05', 44, 980, 2280, 218, 22800, 0.34, '2024-12-05T23:59:59Z'),
  -- jumboDemo-wp-003
  ('cccc1111-1111-4111-8111-111111111111', 'jumboDemo-wp-003', '2024-12-09', 32, 420, 620, 145, 9800, 0.15, '2024-12-09T23:59:59Z'),
  ('cccc2222-2222-4222-8222-222222222222', 'jumboDemo-wp-003', '2024-12-08', 28, 380, 560, 128, 8800, 0.13, '2024-12-08T23:59:59Z'),
  ('cccc3333-3333-4333-8333-333333333333', 'jumboDemo-wp-003', '2024-12-07', 30, 400, 590, 135, 9200, 0.14, '2024-12-07T23:59:59Z'),
  ('cccc4444-4444-4444-8444-444444444444', 'jumboDemo-wp-003', '2024-12-06', 26, 360, 540, 122, 8400, 0.13, '2024-12-06T23:59:59Z'),
  ('cccc5555-5555-4555-8555-555555555555', 'jumboDemo-wp-003', '2024-12-05', 34, 440, 650, 152, 10200, 0.15, '2024-12-05T23:59:59Z'),
  -- hitapesDemo-wp-001
  ('dddd1111-1111-4111-8111-111111111111', 'hitapesDemo-wp-001', '2024-12-09', 175, 1900, 4200, 540, 45000, 0.68, '2024-12-09T23:59:59Z'),
  ('dddd2222-2222-4222-8222-222222222222', 'hitapesDemo-wp-001', '2024-12-08', 168, 1820, 4050, 520, 43200, 0.65, '2024-12-08T23:59:59Z'),
  ('dddd3333-3333-4333-8333-333333333333', 'hitapesDemo-wp-001', '2024-12-07', 172, 1860, 4120, 532, 44000, 0.66, '2024-12-07T23:59:59Z'),
  ('dddd4444-4444-4444-8444-444444444444', 'hitapesDemo-wp-001', '2024-12-06', 165, 1780, 3980, 510, 42500, 0.64, '2024-12-06T23:59:59Z'),
  ('dddd5555-5555-4555-8555-555555555555', 'hitapesDemo-wp-001', '2024-12-05', 180, 1950, 4320, 555, 46200, 0.69, '2024-12-05T23:59:59Z');

-- ============================================================================
-- 7. USAGE_RESETS
-- ============================================================================
INSERT INTO usage_resets (
  id, workspace_slug, reset_at, period_start, period_end,
  bundle_loads_final, messages_final, api_calls_final, sessions_final,
  overage_charged_eur, credits_spent_eur, created_at
) VALUES
  ('eeee1111-1111-4111-8111-111111111111', 'jumboDemo-wp-001', '2024-12-01T00:00:00Z', '2024-11-01', '2024-11-30', 24800, 485000, 980000, 122500, 0, 0, '2024-12-01T00:00:00Z'),
  ('eeee2222-2222-4222-8222-222222222222', 'jumboDemo-wp-001', '2024-11-01T00:00:00Z', '2024-10-01', '2024-10-31', 26200, 512000, 1050000, 130000, 325.50, 50.00, '2024-11-01T00:00:00Z'),
  ('eeee3333-3333-4333-8333-333333333333', 'jumboDemo-wp-002', '2024-12-15T00:00:00Z', '2024-11-15', '2024-12-14', 4850, 98000, 245000, 24200, 0, 0, '2024-12-15T00:00:00Z'),
  ('eeee4444-4444-4444-8444-444444444444', 'jumboDemo-wp-003', '2024-12-09T00:00:00Z', '2024-12-08', '2024-12-08', 28, 380, 560, 128, 0, 0, '2024-12-09T00:00:00Z'),
  ('eeee5555-5555-4555-8555-555555555555', 'hitapesDemo-wp-001', '2024-12-01T00:00:00Z', '2024-11-01', '2024-11-30', 5320, 102000, 258000, 26500, 80.00, 57.00, '2024-12-01T00:00:00Z');

-- ============================================================================
-- 8. CREDIT_TRANSACTIONS
-- ============================================================================
INSERT INTO credit_transactions (
  id, workspace_slug, type, amount_eur, balance_after_eur,
  description, reference_id, created_by, created_at
) VALUES
  ('ffff1111-1111-4111-8111-111111111111', 'jumboDemo-wp-001', 'purchase', 100.00, 100.00, 'Initial credit purchase', 'pay_abc123', 'e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', '2024-01-01T10:00:00Z'),
  ('ffff2222-2222-4222-8222-222222222222', 'jumboDemo-wp-001', 'overage_deduction', -50.00, 50.00, 'Overage charges for October 2024', 'eeee2222-2222-4222-8222-222222222222', NULL, '2024-11-01T00:00:00Z'),
  ('ffff3333-3333-4333-8333-333333333333', 'jumboDemo-wp-002', 'purchase', 50.00, 50.00, 'Credit top-up', 'pay_def456', 'e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', '2024-06-15T14:30:00Z'),
  ('ffff4444-4444-4444-8444-444444444444', 'jumboDemo-wp-002', 'bonus', 25.00, 75.00, 'Promotional credit bonus', 'promo_summer24', NULL, '2024-07-01T00:00:00Z'),
  ('ffff5555-5555-4555-8555-555555555555', 'jumboDemo-wp-002', 'overage_deduction', -50.00, 25.00, 'Overage charges for September 2024', NULL, NULL, '2024-10-15T00:00:00Z'),
  ('ffff6666-6666-4666-8666-666666666666', 'hitapesDemo-wp-001', 'purchase', 100.00, 100.00, 'Initial credit purchase', 'pay_ghi789', 'd6e7f8a9-b0c1-4d2e-3f4a-5b6c7d8e9f0a', '2024-01-01T10:00:00Z'),
  ('ffff7777-7777-4777-8777-777777777777', 'hitapesDemo-wp-001', 'overage_deduction', -57.00, 43.00, 'Overage charges for November 2024 (150 bundles @ 0.38/each)', 'eeee5555-5555-4555-8555-555555555555', NULL, '2024-12-01T00:00:00Z'),
  ('ffff8888-8888-4888-8888-888888888888', 'jumboDemo-wp-003', 'purchase', 20.00, 20.00, 'Credit purchase', 'pay_jkl012', 'e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', '2024-03-01T09:00:00Z'),
  ('ffff9999-9999-4999-8999-999999999999', 'jumboDemo-wp-003', 'overage_deduction', -20.00, 0.00, 'Overage charges depleted credits', NULL, NULL, '2024-08-20T00:00:00Z');

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'Demo data seeded successfully for jumboDemo and hitapesDemo clients';
  RAISE NOTICE 'Clients: %, Workspaces: %, Mascots: %',
    (SELECT COUNT(*) FROM clients WHERE is_demo = TRUE),
    (SELECT COUNT(*) FROM workspaces WHERE client_slug IN ('jumboDemo', 'hitapesDemo')),
    (SELECT COUNT(*) FROM mascots WHERE client_slug IN ('jumboDemo', 'hitapesDemo'));
END $$;
