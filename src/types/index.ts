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

export type Client = {
  id: string;
  name: string;
  slug: string;
  palette: Palette;
  login: ClientLogin;
  defaultWorkspaceId?: string;
  /** Demo accounts have read-only access and display a demo badge */
  isDemo?: boolean;
};

// =============================================================================
// Workspace (Resource Pool)
// =============================================================================

export type PlanType = 'starter' | 'basic' | 'premium' | 'enterprise';
export type WorkspaceStatus = 'active' | 'suspended' | 'trial';
export type BillingCycle = 'monthly' | 'quarterly' | 'annual';

export type UsageCounter = {
  limit: number;
  used: number;
  remaining: number;
};

export type OverageRates = {
  bundleLoads: number;
  messages: number;
  apiCalls: number;
};

export type Workspace = {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  plan: PlanType;
  status: WorkspaceStatus;
  bundleLoads: UsageCounter;
  messages: UsageCounter;
  apiCalls: UsageCounter;
  walletCredits: number;
  overageRates: OverageRates;
  billingCycle: BillingCycle;
  monthlyFee: number;
  nextBillingDate: string;
  createdAt: string;
};

// =============================================================================
// Bot (formerly "Mascot" in some places)
// =============================================================================

export type BotStatus = 'Live' | 'Paused' | 'Needs finalization';

export type BotMetrics = {
  responseTime: number;
  resolutionRate: number;
  csat: number;
};

export type Bot = {
  id: string;
  clientId: string;
  workspaceId: string;
  name: string;
  image: string;
  status: BotStatus;
  conversations: number;
  description: string;
  metrics: BotMetrics;
};

// =============================================================================
// User (Team Member)
// =============================================================================

export type TeamRole = 'admin' | 'manager' | 'agent' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'pending';

export type User = {
  id: string;
  clientId: string;
  name: string;
  email: string;
  role: TeamRole;
  status: UserStatus;
  avatar: string;
  lastActive: string;
  conversationsHandled: number;
  joinedDate: string;
  phone?: string;
};

// =============================================================================
// Conversation
// =============================================================================

export type ConversationStatus = 'active' | 'resolved' | 'escalated';
export type Channel = 'webchat' | 'whatsapp' | 'facebook' | 'telegram';

export type Conversation = {
  id: string;
  botId: string;
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

export type MessageSender = 'user' | 'bot' | 'agent';

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
// Bot Session (Analytics)
// =============================================================================

export type Sentiment = 'positive' | 'neutral' | 'negative';
export type YesNo = 'Yes' | 'No';
export type ResolutionType = 'self_service' | 'escalated' | 'partial' | 'unresolved';
export type CompletionStatus = 'completed' | 'incomplete' | 'escalated' | 'partial';
export type UserType = 'new' | 'returning' | 'existing';
export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export type BotSession = {
  session_id: string;
  bot_id: string;
  client_id: string;
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
  bot_handoff: boolean;
  human_cost_equivalent: number;
  automation_saving: number;
};

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
  botUsageByDay: Record<string, UsageData[]>;
  topIntents: Record<string, IntentData[]>;
  botIntents: Record<string, IntentData[]>;
  csat: Record<string, number>;
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
    bots: number;
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
    csatChange: string;
  };
};

// =============================================================================
// Legacy Compatibility (to be removed after migration)
// =============================================================================

/**
 * @deprecated Use `Bot` instead. Mascot was the old name for Bot.
 */
export type Mascot = Bot;
