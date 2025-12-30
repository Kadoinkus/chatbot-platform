/**
 * Database Types (Supabase Schema)
 *
 * SINGLE SOURCE OF TRUTH for all database table shapes.
 * These types use snake_case to match Supabase column names exactly.
 *
 * App-side types are derived from these using utility transformations.
 */

// =============================================================================
// Utility Types for snake_case → camelCase conversion
// =============================================================================

type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamel<U>>}`
  : S;

type SnakeToCamelObject<T> = T extends Date
  ? T
  : T extends Array<infer U>
  ? Array<SnakeToCamelObject<U>>
  : T extends object
  ? { [K in keyof T as SnakeToCamel<K & string>]: SnakeToCamelObject<T[K]> }
  : T;

type CamelToSnake<S extends string> = S extends `${infer T}${infer U}`
  ? T extends Capitalize<T>
    ? `_${Lowercase<T>}${CamelToSnake<U>}`
    : `${T}${CamelToSnake<U>}`
  : S;

type CamelToSnakeObject<T> = T extends Date
  ? T
  : T extends Array<infer U>
  ? Array<CamelToSnakeObject<U>>
  : T extends object
  ? { [K in keyof T as CamelToSnake<K & string>]: CamelToSnakeObject<T[K]> }
  : T;

// Export utilities for use in mapping functions
export type { SnakeToCamelObject, CamelToSnakeObject };

// =============================================================================
// Database Enums
// =============================================================================

export type DB_ClientStatus = 'active' | 'suspended' | 'trial' | 'cancelled';
export type DB_CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';
export type DB_PlanType = 'starter' | 'basic' | 'premium' | 'enterprise' | 'custom';
export type DB_WorkspaceStatus = 'active' | 'suspended' | 'trial';
export type DB_BillingCycle = 'monthly' | 'quarterly' | 'annual';
export type DB_UsageResetInterval = 'daily' | 'monthly' | 'quarterly' | 'annual';
export type DB_AgentStatus = 'active' | 'paused' | 'disabled' | 'draft';
export type DB_UserRole = 'owner' | 'admin' | 'member' | 'viewer';
export type DB_TeamRole = 'admin' | 'manager' | 'agent' | 'viewer';
export type DB_UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type DB_CreditTransactionType = 'purchase' | 'bonus' | 'overage_deduction' | 'refund' | 'adjustment';

// =============================================================================
// TABLE: clients
// =============================================================================

export interface DB_Client {
  id: string;                          // uuid
  slug: string;                        // unique
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  // Media is resolved via client_assets (type 'logo'); legacy field kept optional for JSON mocks
  logo_url?: string | null;
  logo_asset_url?: string | null;
  industry: string | null;
  company_size: DB_CompanySize | null;
  country: string | null;
  timezone: string;                    // default: 'Europe/Amsterdam'
  palette_primary: string | null;
  palette_primary_dark: string | null;
  palette_accent: string | null;
  default_workspace_id: string | null; // uuid FK
  is_demo: boolean;                    // default: false
  status: DB_ClientStatus;             // default: 'active'
  trial_ends_at: string | null;        // timestamptz
  created_at: string;                  // timestamptz
  updated_at: string;                  // timestamptz
}

// =============================================================================
// TABLE: workspaces
// Uniqueness constraints:
//   - slug: UNIQUE globally (e.g., 'demo-jumbo-wp-001')
//   - (client_slug, workspace_number): UNIQUE per client
// Slug format: {client_slug}-wp-{workspace_number:03d}
// =============================================================================

export interface DB_Workspace {
  id: string;                          // uuid
  slug: string;                        // UNIQUE globally (e.g., 'demo-jumbo-wp-001')
  workspace_number: number;            // Sequence number per client (1, 2, 3...)
  client_slug: string;                 // FK to clients.slug
  name: string;
  description: string | null;
  plan: DB_PlanType;                   // default: 'starter'
  status: DB_WorkspaceStatus;          // default: 'active'
  monthly_fee: number;                 // decimal
  billing_cycle: DB_BillingCycle;      // default: 'monthly'
  usage_reset_interval: DB_UsageResetInterval; // default: 'monthly'
  billing_reset_day: number;           // 1-28
  subscription_start_date: string | null; // date
  next_billing_date: string | null;    // date
  next_usage_reset_date: string | null; // date
  // Usage limits & counters
  bundle_loads_limit: number;
  bundle_loads_used: number;
  messages_limit: number;
  messages_used: number;
  api_calls_limit: number;
  api_calls_used: number;
  sessions_limit: number;
  sessions_used: number;
  // Billing
  wallet_credits: number;              // decimal
  overage_rate_bundle_loads: number;   // decimal
  overage_rate_messages: number;       // decimal
  overage_rate_api_calls: number;      // decimal
  overage_rate_sessions: number;       // decimal
  // Overage tracking
  bundle_overage_used: number;
  session_overage_used: number;
  credits_spent_on_overage: number;    // decimal
  // Lifetime totals (aggregated from mascots)
  total_conversations: number;         // default: 0
  total_messages: number;              // default: 0
  total_bundle_loads: number;          // default: 0
  created_at: string;                  // timestamptz
  updated_at: string;                  // timestamptz
}

// =============================================================================
// TABLE: users
// =============================================================================

export interface DB_User {
  id: string;                          // uuid
  client_slug: string;                 // FK to clients.slug
  email: string;                       // unique
  name: string;
  avatar_url: string | null;
  phone: string | null;
  role: DB_TeamRole;                   // default: 'member'
  status: DB_UserStatus;               // default: 'pending'
  email_verified: boolean;             // default: false
  last_login_at: string | null;        // timestamptz
  last_active_at: string | null;       // timestamptz
  invited_by: string | null;           // uuid FK to users.id
  invited_at: string | null;           // timestamptz
  joined_at: string | null;            // timestamptz
  conversations_handled: number;       // default: 0
  created_at: string;                  // timestamptz
  updated_at: string;                  // timestamptz
}

// =============================================================================
// TABLE: mascots
// Uniqueness constraints:
//   - mascot_slug: UNIQUE globally (e.g., 'demo-jumbo-ma-001')
//   - (client_slug, mascot_number): UNIQUE per client
// Slug format: {client_slug}-ma-{mascot_number:03d}
// =============================================================================

export interface DB_Mascot {
  id: string;                          // uuid
  mascot_slug: string;                 // UNIQUE globally (e.g., 'demo-jumbo-ma-001')
  mascot_number: number;               // Sequence number per client (1, 2, 3...)
  client_slug: string;                 // FK to clients.slug
  workspace_slug: string;              // FK to workspaces.slug
  name: string;
  description: string | null;
  // Media is resolved via client_assets (type 'avatar'); legacy field kept optional for JSON mocks
  image_url?: string | null;
  avatar_asset_url?: string | null;
  status: DB_AgentStatus;              // default: 'draft'
  // Lifetime stats
  total_conversations: number;         // default: 0
  total_messages: number;              // default: 0
  total_bundle_loads: number;          // default: 0
  // Performance metrics
  avg_response_time_ms: number | null;
  resolution_rate: number | null;      // percentage
  csat_score: number | null;           // customer satisfaction score
  config_version: string | null;
  // Allocation percentages (null = equal split)
  bundle_allocation_pct: number | null;
  sessions_allocation_pct: number | null;
  messages_allocation_pct: number | null;
  // Per-mascot usage (current period)
  bundle_loads_used: number;           // default: 0
  sessions_used: number;               // default: 0
  messages_used: number;               // default: 0
  created_at: string | null;           // timestamptz
  updated_at: string | null;           // timestamptz
}

// =============================================================================
// TABLE: workspace_members
// =============================================================================

export interface DB_WorkspaceMember {
  id: string;                          // uuid
  workspace_slug: string;              // FK to workspaces.slug
  user_id: string;                     // uuid FK
  role: DB_TeamRole;                   // default: 'viewer'
  permissions: Record<string, boolean> | null; // jsonb
  created_at: string;                  // timestamptz
  updated_at: string;                  // timestamptz
}

// =============================================================================
// TABLE: usage_history
// =============================================================================

export interface DB_UsageHistory {
  id: string;                          // uuid
  workspace_slug: string;              // FK to workspaces.slug
  date: string;                        // date YYYY-MM-DD
  bundle_loads: number;
  messages: number;
  api_calls: number;
  sessions: number;
  tokens_used: number;
  cost_eur: number;                    // decimal
  created_at: string;                  // timestamptz
}

// =============================================================================
// TABLE: usage_resets
// =============================================================================

export interface DB_UsageReset {
  id: string;                          // uuid
  workspace_slug: string;              // FK to workspaces.slug
  reset_date: string;                  // date
  period_start: string;                // date
  period_end: string;                  // date
  sessions_used: number;               // default: 0
  messages_used: number;               // default: 0
  bundle_loads_used: number;           // default: 0
  created_at: string;                  // timestamptz
}

// =============================================================================
// TABLE: credit_transactions
// =============================================================================

export interface DB_CreditTransaction {
  id: string;                          // uuid
  workspace_slug: string;              // FK to workspaces.slug
  type: DB_CreditTransactionType;
  amount_eur: number;                  // decimal (+credit, -debit)
  balance_after_eur: number;           // decimal
  description: string | null;
  reference_id: string | null;
  created_by: string | null;           // uuid FK to users.id
  created_at: string;                  // timestamptz
}

// =============================================================================
// EXISTING TABLES: chat_sessions, chat_session_analyses, chat_messages
// (Already aligned with Supabase schema)
// =============================================================================

export interface DB_ChatSession {
  id: string;
  mascot_slug: string;
  client_slug: string | null;
  domain: string;
  user_id: string | null;
  session_start: string;
  session_end: string | null;
  first_message_at: string | null;
  last_message_at: string | null;
  last_activity: string | null;
  is_active: boolean;
  end_reason: string | null;
  total_bot_messages: number;
  total_user_messages: number;
  total_tokens: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_cost_usd: number | null;
  total_cost_eur: number;
  average_response_time_ms: number | null;
  ip_address: string | null;
  user_agent: string | null;
  country: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  referrer_url: string | null;
  page_url: string | null;
  widget_version: string | null;
  easter_eggs_triggered: number;
  is_dev: boolean;
  glb_source: string | null;
  glb_transfer_size: number | null;
  glb_encoded_body_size: number | null;
  glb_response_end: number | null;
  glb_url: string | null;
  full_transcript: Array<{ author: string; message: string; timestamp: string }> | null;
  analysis_processed: boolean;
  analysis_status: string | null;
  analysis_attempts: number;
  analysis_locked_at: string | null;
  analysis_processed_at: string | null;
  analysis_last_error: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DB_ChatSessionAnalysis {
  session_id: string;                  // PK, FK to chat_sessions.id
  mascot_slug: string;
  language: string | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  category: string | null;
  escalated: boolean;
  forwarded_email: boolean;
  forwarded_url: boolean;
  url_links: string[] | null;
  email_links: string[] | null;
  questions: string[] | null;
  unanswered_questions: string[] | null;
  summary: string | null;
  session_outcome: 'completed' | 'abandoned' | 'error' | 'timeout' | null;
  resolution_status: 'resolved' | 'partial' | 'unresolved' | null;
  engagement_level: 'low' | 'medium' | 'high' | null;
  conversation_type: 'casual' | 'goal_driven' | 'support' | 'sales' | null;
  analytics_total_tokens: number | null;
  analytics_total_prompt_tokens: number | null;
  analytics_total_completion_tokens: number | null;
  analytics_total_cost_usd: number | null;
  analytics_total_cost_eur: number | null;
  analytics_model_used: string | null;
  custom_object1: Record<string, unknown> | null;
  custom_object2: Record<string, unknown> | null;
  raw_response: unknown | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DB_ChatMessage {
  id: string;
  session_id: string;
  mascot_slug: string;
  author: 'user' | 'bot';
  message: string;
  timestamp: string;
  response_time_ms: number | null;
  response_animation: string | Record<string, unknown> | null;
  easter_egg_animation: string | null;
  wait_sequence: string | null;
  has_easter_egg: boolean;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  model_used: string | null;
  cost_usd: number | null;
  cost_eur: number | null;
  finish_reason: string | null;
  raw_response: string | null;
  error_message: string | null;
  created_at: string | null;
}

// =============================================================================
// Derived App Types (camelCase)
// =============================================================================

export type Client = SnakeToCamelObject<DB_Client>;
export type Workspace = SnakeToCamelObject<DB_Workspace>;
export type User = SnakeToCamelObject<DB_User>;
export type Mascot = SnakeToCamelObject<DB_Mascot>;
export type WorkspaceMember = SnakeToCamelObject<DB_WorkspaceMember>;
export type UsageHistory = SnakeToCamelObject<DB_UsageHistory>;
export type UsageReset = SnakeToCamelObject<DB_UsageReset>;
export type CreditTransaction = SnakeToCamelObject<DB_CreditTransaction>;
export type ChatSession = SnakeToCamelObject<DB_ChatSession>;
export type ChatSessionAnalysis = SnakeToCamelObject<DB_ChatSessionAnalysis>;
export type ChatMessage = SnakeToCamelObject<DB_ChatMessage>;

// =============================================================================
// Type-safe mapping utilities
// =============================================================================

/**
 * Convert a snake_case DB record to camelCase app type
 */
export function toAppType<T extends Record<string, unknown>>(
  dbRecord: T
): SnakeToCamelObject<T> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(dbRecord)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[camelKey] = toAppType(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      result[camelKey] = value.map(item =>
        typeof item === 'object' && item !== null
          ? toAppType(item as Record<string, unknown>)
          : item
      );
    } else {
      result[camelKey] = value;
    }
  }

  return result as SnakeToCamelObject<T>;
}

/**
 * Convert a camelCase app record to snake_case DB type
 */
export function toDbType<T extends Record<string, unknown>>(
  appRecord: T
): CamelToSnakeObject<T> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(appRecord)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[snakeKey] = toDbType(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      result[snakeKey] = value.map(item =>
        typeof item === 'object' && item !== null
          ? toDbType(item as Record<string, unknown>)
          : item
      );
    } else {
      result[snakeKey] = value;
    }
  }

  return result as CamelToSnakeObject<T>;
}

/**
 * Type guard to check if a value matches a DB type
 */
export function isDbRecord<T>(value: unknown, requiredKeys: (keyof T)[]): value is T {
  if (typeof value !== 'object' || value === null) return false;
  return requiredKeys.every(key => key in value);
}
