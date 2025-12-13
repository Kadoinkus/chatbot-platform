/**
 * Centralized Type Definitions
 *
 * Single source of truth for all domain types.
 * Aligned with Supabase schema (see docs/SUPABASE_DATA_REQUIREMENTS.md)
 */

// =============================================================================
// Authentication & Session
// =============================================================================

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

/**
 * Authentication session stored in cookie/localStorage
 * Expanded from original { clientId } to support proper auth flow
 */
export type AuthSession = {
  clientId: string;
  clientSlug: string;
  userId: string;
  role: UserRole;
  defaultWorkspaceId?: string;
};

// =============================================================================
// Client (Company/Account)
// =============================================================================

export type Palette = {
  primary: string;
  primaryDark: string;
  accent: string;
};

export type ClientLogin = {
  email: string;
  password: string;
};

export type ClientStatus = 'active' | 'suspended' | 'trial' | 'cancelled';
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';

export type Client = {
  id: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
  industry?: string;
  companySize?: CompanySize;
  country?: string;
  timezone?: string;
  palette: Palette;
  login?: ClientLogin;
  defaultWorkspaceId?: string;
  /** Demo accounts have read-only access and display a demo badge */
  isDemo?: boolean;
  status?: ClientStatus;
  trialEndsAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

// =============================================================================
// Workspace (Resource Pool)
// =============================================================================

export type PlanType = 'starter' | 'basic' | 'premium' | 'enterprise' | 'custom';
export type WorkspaceStatus = 'active' | 'suspended' | 'trial';
export type BillingCycle = 'monthly' | 'quarterly' | 'annual';  // Invoice frequency
export type UsageResetInterval = 'daily' | 'monthly' | 'quarterly' | 'annual';  // When usage counters reset

export type UsageCounter = {
  limit: number;
  used: number;
  remaining: number;
};

export type OverageRates = {
  bundleLoads: number;
  messages: number;
  apiCalls: number;
  sessions?: number;  // EUR per session overage (client-facing) - optional for backward compat
};

// Overage tracking for current billing period
export type OverageTracking = {
  bundleOverageUsed: number;      // Extra bundles used beyond limit
  sessionOverageUsed: number;     // Extra sessions used beyond limit
  creditsSpentOnOverage: number;  // EUR deducted from wallet this period
};

/**
 * Workspace (Resource Pool)
 * Uniqueness constraints:
 *   - slug: UNIQUE globally (e.g., 'demo-jumbo-wp-001')
 *   - (clientSlug, workspaceNumber): UNIQUE per client
 * Slug format: {clientSlug}-wp-{workspaceNumber:03d}
 */
export type Workspace = {
  id: string;
  slug: string;                         // UNIQUE globally (e.g., 'demo-jumbo-wp-001')
  workspaceNumber: number;              // Sequence number per client (1, 2, 3...)
  clientId?: string;                    // @deprecated - use clientSlug
  clientSlug: string;                   // FK to clients.slug
  name: string;
  description?: string;
  plan: PlanType;
  status: WorkspaceStatus;
  bundleLoads: UsageCounter;
  messages: UsageCounter;
  apiCalls: UsageCounter;
  sessions?: UsageCounter;              // Session tracking (client-facing)
  walletCredits: number;
  overageRates: OverageRates;
  // Billing (invoice frequency - when customer is charged)
  billingCycle: BillingCycle;           // 'annual' = prepaid yearly invoice
  monthlyFee: number;                   // Base fee per period
  nextBillingDate: string;              // Next invoice date
  // Usage reset (separate from billing - when counters reset)
  usageResetInterval?: UsageResetInterval;  // Defaults to 'monthly' - daily, monthly, quarterly, annual
  subscriptionStartDate?: string;       // ISO date when subscription started
  billingResetDay?: number;             // Day of month usage resets (1-28, ignored for daily)
  nextUsageResetDate?: string;          // Next counter reset date
  overageTracking?: OverageTracking;    // Track overage this usage period
  // Lifetime totals (aggregated from mascots)
  totalConversations?: number;
  totalMessages?: number;
  totalBundleLoads?: number;
  createdAt: string;
  updatedAt?: string;
};

// =============================================================================
// AI Assistant (formerly "Bot" / "Mascot")
// Entity name: "AI Assistant" | Operational actions: "Agent" (Pause Agent, Activate Agent, etc.)
// =============================================================================

/** Agent status for operational control (Activate Agent, Pause Agent, Disable Agent) */
export type AgentStatus = 'Active' | 'Paused' | 'Disabled' | 'Draft';

export type AssistantMetrics = {
  responseTime: number;
  resolutionRate: number;
};

export type Assistant = {
  id: string;
  clientId: string;
  workspaceSlug: string;
  name: string;
  image: string;
  status: AgentStatus;
  conversations: number;
  description: string;
  metrics: AssistantMetrics;
};

// Legacy aliases for backward compatibility
/** @deprecated Use `Assistant` instead */
export type Bot = Assistant;
/** @deprecated Use `AgentStatus` instead */
export type BotStatus = AgentStatus;
/** @deprecated Use `AssistantStatus` instead - now AgentStatus */
export type AssistantStatus = AgentStatus;
/** @deprecated Use `AssistantMetrics` instead */
export type BotMetrics = AssistantMetrics;

// =============================================================================
// User (Team Member)
// =============================================================================

export type TeamRole = 'admin' | 'manager' | 'agent' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export type User = {
  id: string;
  clientId?: string;                   // @deprecated - use clientSlug
  clientSlug: string;                  // FK to clients.slug
  name: string;
  email: string;
  role: TeamRole;
  status: UserStatus;
  avatar?: string;                     // @deprecated - use avatarUrl
  avatarUrl?: string;
  lastActive?: string;                 // @deprecated - use lastActiveAt
  lastActiveAt?: string | null;
  lastLoginAt?: string | null;
  conversationsHandled: number;
  joinedDate?: string;                 // @deprecated - use joinedAt
  joinedAt?: string | null;
  phone?: string | null;
  emailVerified?: boolean;
  invitedBy?: string | null;           // FK to users.id
  invitedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

// =============================================================================
// Conversation
// =============================================================================

export type ConversationStatus = 'active' | 'resolved' | 'escalated';
export type Channel = 'webchat' | 'whatsapp' | 'facebook' | 'telegram';

export type Conversation = {
  id: string;
  assistantId: string;
  clientId: string;
  userId: string;
  userName: string;
  status: ConversationStatus;
  startedAt: string;
  endedAt?: string;
  messages: number;
  satisfaction?: number;
  intent: string;
  channel: Channel;
  preview: string;
};

// =============================================================================
// Message
// =============================================================================

export type MessageSender = 'user' | 'assistant' | 'agent';

export type Message = {
  id: string;
  conversationId: string;
  sender: MessageSender;
  senderName: string;
  content: string;
  timestamp: string;
};

// =============================================================================
// Session (User Session Tracking)
// =============================================================================

export type SessionStatus = 'active' | 'idle' | 'ended';

export type SessionAction = {
  type: string;
  timestamp: string;
  [key: string]: unknown;
};

export type Session = {
  id: string;
  userId: string;
  userName: string;
  clientId: string;
  startedAt: string;
  endedAt?: string;
  lastActivity: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  status: SessionStatus;
  actions: SessionAction[];
};

// =============================================================================
// Assistant Session (Analytics)
// =============================================================================

export type Sentiment = 'positive' | 'neutral' | 'negative';
export type YesNo = 'Yes' | 'No';
export type ResolutionType = 'self_service' | 'escalated' | 'partial' | 'unresolved';
export type CompletionStatus = 'completed' | 'incomplete' | 'escalated' | 'partial';
export type UserType = 'new' | 'returning' | 'existing';
export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export type AssistantSession = {
  session_id: string;
  assistant_id: string;
  client_slug: string;
  start_time: string;
  end_time: string;
  ip_address: string;
  country: string;
  language: string;
  messages_sent: number;
  sentiment: Sentiment;
  escalated: YesNo;
  forwarded_hr: YesNo;
  full_transcript: string;
  avg_response_time: number;
  tokens: number;
  tokens_eur: number;
  category: string;
  questions: string[];
  user_rating: number;
  summary: string;
  // Enterprise analytics fields
  intent_confidence: number;
  resolution_type: ResolutionType;
  completion_status: CompletionStatus;
  user_type: UserType;
  channel: Channel;
  device_type: DeviceType;
  browser: string;
  session_steps: number;
  goal_achieved: boolean;
  error_occurred: boolean;
  assistant_handoff: boolean;
  human_cost_equivalent: number;
  automation_saving: number;
};

/** @deprecated Use `AssistantSession` instead */
export type BotSession = AssistantSession;

// =============================================================================
// Metrics & Analytics
// =============================================================================

export type UsageData = {
  date: string;
  conversations: number;
  resolved: number;
};

export type IntentData = {
  intent: string;
  count: number;
};

export type MetricsData = {
  usageByDay: Record<string, UsageData[]>;
  assistantUsageByDay: Record<string, UsageData[]>;
  topIntents: Record<string, IntentData[]>;
  assistantIntents: Record<string, IntentData[]>;
};

// =============================================================================
// API Response Types
// =============================================================================

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ApiError;
};

export type CounterSummary = {
  clientId: string;
  totals: {
    workspaces: number;
    assistants: number;
    activeConversations: number;
    totalConversations: number;
    resolvedToday: number;
    escalatedToday: number;
  };
  usage: {
    bundleLoadsUsed: number;
    bundleLoadsLimit: number;
    messagesUsed: number;
    messagesLimit: number;
  };
  trends: {
    conversationsChange: string;
    resolutionRateChange: string;
  };
};

// =============================================================================
// Mascot (Supabase table - maps to Assistant in UI)
// =============================================================================

/**
 * Mascot record from Supabase mascots table
 * Uniqueness constraints:
 *   - mascotSlug: UNIQUE globally (e.g., 'demo-jumbo-ma-001')
 *   - (clientSlug, mascotNumber): UNIQUE per client
 * Slug format: {clientSlug}-ma-{mascotNumber:03d}
 */
export type MascotDB = {
  id: string;
  mascotSlug: string;                  // UNIQUE globally (e.g., 'demo-jumbo-ma-001')
  mascotNumber: number;                // Sequence number per client (1, 2, 3...)
  clientSlug: string;                  // FK to clients.slug
  workspaceSlug: string;               // FK to workspaces.slug
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  status: AgentStatus;
  // Lifetime stats
  totalConversations: number;
  totalMessages: number;
  totalBundleLoads: number;
  // Performance metrics
  avgResponseTimeMs?: number | null;
  resolutionRate?: number | null;      // % resolved
  configVersion?: string | null;
  // Allocation percentages (null = equal split among workspace mascots)
  bundleAllocationPct?: number | null;
  sessionsAllocationPct?: number | null;
  messagesAllocationPct?: number | null;
  // Current period usage (per mascot)
  bundleLoadsUsed: number;
  sessionsUsed: number;
  messagesUsed: number;
  createdAt?: string;
  updatedAt?: string;
};

// =============================================================================
// Usage History (Daily Snapshots)
// =============================================================================

/**
 * Daily usage snapshot for trend reporting
 */
export type UsageHistory = {
  id: string;
  workspaceSlug: string;
  date: string;                        // YYYY-MM-DD
  bundleLoads: number;
  messages: number;
  apiCalls: number;
  sessions: number;
  tokensUsed: number;
  costEur: number;
  createdAt: string;
};

// =============================================================================
// Usage Resets (Counter Reset Records)
// =============================================================================

/**
 * Record of usage counter reset at end of billing period
 */
export type UsageReset = {
  id: string;
  workspaceSlug: string;
  resetAt: string;                     // When reset occurred
  periodStart: string;                 // YYYY-MM-DD
  periodEnd: string;                   // YYYY-MM-DD
  bundleLoadsFinal: number;
  messagesFinal: number;
  apiCallsFinal: number;
  sessionsFinal: number;
  overageChargedEur: number;
  creditsSpentEur: number;
  createdAt: string;
};

// =============================================================================
// Credit Transactions (Wallet Ledger)
// =============================================================================

export type CreditTransactionType = 'purchase' | 'bonus' | 'overage_deduction' | 'refund' | 'adjustment';

/**
 * Wallet credit transaction record
 */
export type CreditTransaction = {
  id: string;
  workspaceSlug: string;
  type: CreditTransactionType;
  amountEur: number;                   // Positive = credit, negative = debit
  balanceAfterEur: number;
  description?: string | null;
  referenceId?: string | null;         // External reference (payment ID, reset ID)
  createdBy?: string | null;           // FK to users.id
  createdAt: string;
};

// =============================================================================
// Workspace Members (RBAC)
// =============================================================================

export type WorkspaceMemberRole = 'admin' | 'manager' | 'agent' | 'viewer';

/**
 * User access and role per workspace
 */
export type WorkspaceMember = {
  id: string;
  workspaceSlug: string;
  userId: string;
  role: WorkspaceMemberRole;
  permissions?: Record<string, boolean> | null;  // Custom permission overrides
  createdAt: string;
  updatedAt: string;
};

// =============================================================================
// Legacy Compatibility (to be removed after migration)
// =============================================================================

/**
 * @deprecated Use `Assistant` instead. Mascot was the old name.
 */
export type Mascot = Assistant;

// =============================================================================
// Chat Session Analytics (Supabase-aligned)
// =============================================================================

/**
 * Chat session from Supabase chat_sessions table
 * Represents a single conversation session with aggregated data
 */
export type ChatSession = {
  id: string;
  mascot_slug: string; // Maps to assistant_slug in platform
  client_slug: string;
  domain?: string | null;
  user_id?: string | null;
  session_started_at: string;
  session_ended_at: string | null;
  first_message_at: string | null;
  last_message_at: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  visitor_ip_hash: string | null;
  visitor_country: string | null;
  visitor_city: string | null;
  visitor_region: string | null;
  visitor_timezone: string | null;
  visitor_language: string | null;
  device_type: string | null;
  browser_name: string | null;
  browser_version: string | null;
  os_name: string | null;
  os_version: string | null;
  is_mobile: boolean;
  screen_width: number | null;
  screen_height: number | null;
  widget_version?: string | null;
  referrer_url: string | null;
  referrer_domain: string | null;
  landing_page_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  total_messages: number;
  user_messages: number;
  assistant_messages: number;
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
  total_cost_usd?: number;
  total_cost_eur: number;
  average_response_time_ms: number | null;
  session_duration_seconds: number | null;
  status: 'active' | 'ended' | 'timeout' | 'error';
  easter_eggs_triggered: number;
  created_at: string;
  updated_at: string;
  // GLB bundle tracking for new vs returning users
  glb_source: 'cdn_fetch' | 'memory_cache' | string | null;
  glb_transfer_size: number | null;
  glb_encoded_body_size?: number | null;
  glb_response_end?: number | null;
  glb_url?: string | null;
  // Full conversation transcript as JSON array
  full_transcript: TranscriptMessage[] | null;
};

/**
 * Single message in a transcript (matches Supabase format)
 */
export type TranscriptMessage = {
  author: 'user' | 'assistant';
  message: string;
  timestamp: string;
  easter?: string; // Easter egg triggered (empty string if none)
};

/**
 * Sentiment type for chat session analysis
 */
export type AnalysisSentiment = 'positive' | 'neutral' | 'negative';

/**
 * Resolution status for chat session
 */
export type ResolutionStatus = 'resolved' | 'partial' | 'unresolved';

/**
 * Session outcome type
 */
export type SessionOutcome = 'completed' | 'abandoned' | 'error' | 'timeout';

/**
 * Engagement level
 */
export type EngagementLevel = 'low' | 'medium' | 'high';

/**
 * Conversation type
 */
export type ConversationType = 'casual' | 'goal_driven' | 'support' | 'sales';

/**
 * Chat session analysis from Supabase chat_session_analyses table
 * AI-generated post-session analysis
 */
export type ChatSessionAnalysis = {
  session_id: string;
  mascot_slug: string;
  language: string | null;
  sentiment: AnalysisSentiment | null;
  escalated: boolean;
  forwarded_email: boolean;
  forwarded_url: boolean;
  url_links: string[];
  email_links: string[];
  category: string | null;
  questions: string[];
  unanswered_questions: string[];
  summary: string | null;
  session_outcome: SessionOutcome | null;
  resolution_status: ResolutionStatus | null;
  engagement_level: EngagementLevel | null;
  conversation_type: ConversationType | null;
  analytics_total_tokens: number | null;
  analytics_total_prompt_tokens?: number | null;
  analytics_total_completion_tokens?: number | null;
  analytics_total_cost_eur: number | null;
  analytics_total_cost_usd?: number | null;
  analytics_model_used: string | null;
  created_at: string;
  updated_at?: string;
  custom_object1?: Record<string, unknown> | null;
  custom_object2?: Record<string, unknown> | null;
  raw_response?: unknown;
};

/**
 * Combined chat session with analysis
 */
export type ChatSessionWithAnalysis = ChatSession & {
  analysis: ChatSessionAnalysis | null;
};

/**
 * Chat message from Supabase chat_messages table
 */
export type ChatMessage = {
  id: string;
  session_id: string;
  mascot_slug: string;
  message: string;
  author: 'user' | 'bot';
  timestamp: string;
  response_time_ms: number | null;
  response_animation: string | Record<string, unknown> | null;
  easter_egg_animation: string | null;
  wait_sequence: string | null;
  has_easter_egg: boolean;
  prompt_tokens?: number | null;
  completion_tokens?: number | null;
  total_tokens?: number | null;
  model_used?: string | null;
  cost_usd?: number | null;
  cost_eur?: number | null;
  finish_reason?: string | null;
  raw_response?: string | null;
  error_message?: string | null;
};
