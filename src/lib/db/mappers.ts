import type { ChatSession } from '@/types';
import type { Assistant, Client, Workspace, User, Conversation, Message, Session } from '@/types';
import type { AssistantSession } from '@/types';
import { PLAN_CONFIG } from '@/lib/billingService';

/**
 * Normalize raw chat session data (mock JSON or Supabase rows) into
 * the domain ChatSession shape expected by the app.
 */
export function normalizeChatSession(raw: any): ChatSession {
  const sessionStartedAt = raw.session_start || raw.created_at;
  const sessionEndedAt = raw.session_end ?? null;
  const sessionStartDate = sessionStartedAt ? new Date(sessionStartedAt) : null;
  const sessionEndDate = sessionEndedAt ? new Date(sessionEndedAt) : null;
  const sessionDurationSeconds =
    sessionStartDate && sessionEndDate
      ? Math.round((sessionEndDate.getTime() - sessionStartDate.getTime()) / 1000)
      : null;

  const totalUserMessages = raw.total_user_messages ?? 0;
  const totalAssistantMessages = raw.total_bot_messages ?? 0;
  const totalMessages = raw.total_messages ?? totalUserMessages + totalAssistantMessages;

  const browserParts = (raw.browser || '').split(' ');
  const osParts = (raw.os || '').split(' ');

  let referrerDomain: string | null = null;
  if (raw.referrer_url) {
    try {
      referrerDomain = new URL(raw.referrer_url).hostname;
    } catch {
      referrerDomain = null;
    }
  }

  return {
    id: raw.id,
    mascot_slug: raw.mascot_slug,
    client_slug: raw.client_slug,
    domain: raw.domain || null,
    user_id: raw.user_id || null,
    session_started_at: sessionStartedAt,
    session_ended_at: sessionEndedAt,
    first_message_at: raw.first_message_at || null,
    last_message_at: raw.last_message_at || null,
    ip_address: raw.ip_address || null,
    user_agent: raw.user_agent || null,
    visitor_ip_hash: raw.ip_address ? raw.ip_address.replace(/\.\d+$/, '.xxx') : null,
    visitor_country: raw.country || null,
    visitor_city: raw.city || null,
    visitor_region: null,
    visitor_timezone: null,
    visitor_language: null,
    device_type: raw.device_type || null,
    browser_name: browserParts[0] || null,
    browser_version: browserParts.slice(1).join(' ') || null,
    os_name: osParts[0] || null,
    os_version: osParts.slice(1).join(' ') || null,
    is_mobile: (raw.device_type || '').toLowerCase() === 'mobile',
    screen_width: null,
    screen_height: null,
    widget_version: raw.widget_version || null,
    referrer_url: raw.referrer_url || null,
    referrer_domain: referrerDomain,
    landing_page_url: raw.page_url || null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    total_messages: totalMessages,
    user_messages: totalUserMessages,
    assistant_messages: totalAssistantMessages,
    total_tokens: raw.total_tokens ?? 0,
    input_tokens: raw.total_prompt_tokens ?? 0,
    output_tokens: raw.total_completion_tokens ?? 0,
    total_cost_usd: raw.total_cost_usd ?? null,
    total_cost_eur: raw.total_cost_eur ?? 0,
    average_response_time_ms: raw.average_response_time_ms ?? null,
    session_duration_seconds: sessionDurationSeconds,
    status: raw.is_active ? 'active' : 'ended',
    easter_eggs_triggered: raw.easter_eggs_triggered ?? 0,
    created_at: raw.created_at || sessionStartedAt,
    updated_at: raw.updated_at || raw.created_at || sessionStartedAt,
    glb_source: raw.glb_source || null,
    glb_transfer_size: raw.glb_transfer_size ?? null,
    glb_encoded_body_size: raw.glb_encoded_body_size ?? null,
    glb_response_end: raw.glb_response_end ?? null,
    glb_url: raw.glb_url ?? null,
    full_transcript: raw.full_transcript || null,
  };
}

export function mapConversationFromChatSession(raw: any): Conversation {
  const startedAt = raw.session_start || raw.created_at;
  const endedAt = raw.session_end || raw.updated_at;
  const totalMessages = raw.total_messages ?? (raw.total_bot_messages ?? 0) + (raw.total_user_messages ?? 0);

  return {
    id: raw.id,
    assistantId: raw.mascot_slug,
    clientId: raw.client_slug || '',
    userId: raw.user_id || '',
    userName: raw.user_id || 'Visitor',
    status: raw.is_active ? 'active' : 'resolved',
    startedAt: startedAt || new Date().toISOString(),
    endedAt: endedAt || undefined,
    messages: totalMessages,
    satisfaction: raw.csat_score || undefined,
    intent: raw.intent || 'general',
    channel: 'webchat',
    preview:
      (raw.full_transcript && Array.isArray(raw.full_transcript)
        ? raw.full_transcript[0]?.message || ''
        : raw.page_url || '') || '',
  };
}

export function mapMessageFromChatMessage(raw: any): Message {
  const author = (raw.author || '').toLowerCase();
  const sender: Message['sender'] =
    author === 'user' ? 'user' : author === 'assistant' ? 'assistant' : 'agent';

  return {
    id: raw.id,
    conversationId: raw.session_id,
    sender,
    senderName: raw.author || sender,
    content: raw.message || '',
    timestamp: raw.timestamp || raw.created_at || new Date().toISOString(),
  };
}

export function mapSessionFromChatSession(raw: any): Session {
  const startedAt = raw.session_start || raw.created_at;
  const endedAt = raw.session_end || raw.updated_at;

  return {
    id: raw.id,
    userId: raw.user_id || '',
    userName: raw.user_id || 'Visitor',
    clientId: raw.client_slug || '',
    startedAt: startedAt || new Date().toISOString(),
    endedAt: endedAt || undefined,
    lastActivity: raw.last_activity || endedAt || startedAt || new Date().toISOString(),
    device: raw.device_type || 'unknown',
    browser: raw.browser || 'unknown',
    location: raw.country || 'unknown',
    ip: raw.ip_address || '',
    status: raw.is_active ? 'active' : 'ended',
    actions: [],
  };
}

export function mapAssistantSessionFromChatSession(raw: any): AssistantSession {
  return {
    session_id: raw.id,
    assistant_id: raw.mascot_slug,
    client_slug: raw.client_slug,
    start_time: raw.session_start || raw.created_at,
    end_time: raw.session_end || raw.updated_at || null,
    ip_address: raw.ip_address || '',
    country: raw.country || '',
    language: raw.language || '',
    messages_sent: raw.total_messages ?? (raw.total_bot_messages ?? 0) + (raw.total_user_messages ?? 0),
    sentiment: 'neutral',
    escalated: raw.escalated ? 'Yes' : 'No',
    forwarded_hr: 'No',
    full_transcript: raw.full_transcript ? JSON.stringify(raw.full_transcript) : '',
    avg_response_time: raw.average_response_time_ms ?? 0,
    tokens: raw.total_tokens ?? 0,
    tokens_eur: raw.total_cost_eur ?? 0,
    category: raw.category || 'general',
    questions: raw.questions || [],
    user_rating: raw.csat_score ?? 0,
    summary: raw.summary || '',
    assistant_handoff: !!raw.escalated,
    human_cost_equivalent: 0,
    automation_saving: 0,
    intent_confidence: 0,
    resolution_type: 'unresolved',
    completion_status: 'incomplete',
    user_type: 'new',
    channel: 'webchat',
    device_type: raw.device_type || 'desktop',
    browser: raw.browser || '',
    session_steps: 0,
    goal_achieved: false,
    error_occurred: false,
  };
}

// Helper to normalize assistant status casing
function normalizeAssistantStatus(status: string | undefined): Assistant['status'] {
  const normalized = (status || 'Draft').toLowerCase();
  const map: Record<string, Assistant['status']> = {
    active: 'Active',
    paused: 'Paused',
    disabled: 'Disabled',
    draft: 'Draft',
  };
  return map[normalized] || 'Draft';
}

export function mapClient(raw: any): Client {
  const logoUrl =
    raw.logo_asset_url ||
    (raw.assets
      ? raw.assets.find((a: any) => a?.asset_type === 'logo' && a?.is_active)?.asset_url
      : undefined) ||
    raw.logo_url || // legacy fallback (mock/demo)
    undefined;

  return {
    id: raw.id,
    slug: raw.slug || raw.id,
    name: raw.name,
    email: raw.email || undefined,
    phone: raw.phone || undefined,
    website: raw.website || undefined,
    logoUrl,
    industry: raw.industry || undefined,
    companySize: raw.company_size || undefined,
    country: raw.country || undefined,
    timezone: raw.timezone || undefined,
    palette: {
      primary: raw.palette_primary || '#6366F1',
      primaryDark: raw.palette_primary_dark || '#4F46E5',
      accent: raw.palette_accent || '#111827',
    },
    login: raw.login || { email: '', password: '' }, // legacy demo login; keep empty for real clients
    defaultWorkspaceId: raw.default_workspace_id || undefined,
    isDemo: raw.is_demo,
    status: raw.status,
    trialEndsAt: raw.trial_ends_at || undefined,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at || undefined,
  };
}

export function mapAssistantFromMascot(raw: any): Assistant {
  const avatarUrl =
    raw.avatar_asset_url ||
    (raw.assets
      ? raw.assets.find((a: any) => a?.asset_type === 'avatar' && a?.is_active)?.asset_url
      : undefined) ||
    raw.image_url || // legacy fallback (mock/demo)
    undefined;

  return {
    id: raw.mascot_slug,
    clientId: raw.client_slug,
    workspaceSlug: raw.workspace_slug,
    name: raw.name,
    // Keep undefined if missing; UI components handle fallback avatars
    image: avatarUrl,
    status: normalizeAssistantStatus(raw.status),
    conversations: raw.total_conversations || 0,
    description: raw.description || '',
    metrics: {
      responseTime: raw.avg_response_time_ms ? raw.avg_response_time_ms / 1000 : 0,
      resolutionRate: raw.resolution_rate || 0,
    },
    usage: {
      bundleLoads: raw.bundle_loads_used || 0,
      sessions: raw.sessions_used || 0,
      messages: raw.messages_used || 0,
    },
  };
}

export function mapWorkspace(raw: any): Workspace {
  // Prefer subscription + plan data; fall back to workspace fields only for counters/identity
  const subscription = Array.isArray(raw.subscriptions) ? raw.subscriptions[0] : raw.subscriptions;
  // Supabase join alias: plan: billing_plans(*)
  const plan = subscription?.plan || subscription?.billing_plans;

  const planSlug = subscription?.plan_slug ?? raw.plan ?? 'starter';
  const planConfig = PLAN_CONFIG[planSlug] ?? PLAN_CONFIG.starter;

  // Effective limits (override -> plan -> config fallback)
  const bundleLimit =
    subscription?.effective_bundle_limit ??
    subscription?.custom_bundle_limit ??
    plan?.bundle_load_limit ??
    planConfig.limits.bundleLoads;
  const bundleUsed = raw.bundle_loads_used ?? 0;

  const sessionsLimit =
    subscription?.effective_conversations_limit ??
    subscription?.custom_conversations_limit ??
    plan?.conversations_limit ??
    planConfig.limits.sessions;
  const sessionsUsed = raw.sessions_used ?? 0;

  const messagesLimit =
    subscription?.effective_messages_limit ??
    subscription?.custom_messages_limit ??
    plan?.messages_limit ??
    planConfig.limits.messages;
  const messagesUsed = raw.messages_used ?? 0;

  // Overage rates (override -> plan -> 0)
  const overageBundle =
    subscription?.effective_overage_rate_bundle_loads ??
    subscription?.custom_overage_rate_bundle_loads ??
    plan?.overage_rate_bundle_loads ??
    0;
  const overageConversations =
    subscription?.effective_overage_rate_conversations ??
    subscription?.custom_overage_rate_conversations ??
    plan?.overage_rate_conversations ??
    0;

  // Price and credits
  const monthlyFee =
    subscription?.effective_monthly_fee ??
    subscription?.custom_monthly_fee ??
    plan?.monthly_fee_ex_vat ??
    raw.monthly_fee ??
    0;

  const walletCredits = subscription?.wallet_credits ?? raw.wallet_credits ?? 0;

  // Cadence
  const billingFrequency = subscription?.billing_frequency ?? raw.billing_cycle ?? 'monthly';
  const billingCycle = billingFrequency === 'yearly' ? 'annual' : billingFrequency;

  const usageResetInterval = subscription?.usage_reset_interval ?? raw.usage_reset_interval ?? undefined;
  const billingResetDay = subscription?.billing_reset_day ?? raw.billing_reset_day ?? undefined;
  const nextUsageResetDate = subscription?.next_usage_reset_date ?? raw.next_usage_reset_date ?? undefined;
  const nextBillingDate = subscription?.next_billing_date ?? raw.next_billing_date ?? undefined;
  const subscriptionStartDate = subscription?.contract_start ?? raw.subscription_start_date ?? undefined;

  const status =
    subscription?.status ??
    raw.subscription_status ??
    raw.status ??
    'active';

  return {
    id: raw.id,
    slug: raw.slug || raw.id,
    workspaceNumber: raw.workspace_number || 1,
    clientId: raw.client_slug,
    clientSlug: raw.client_slug,
    name: raw.name,
    description: raw.description || undefined,
    plan: planSlug,
    status,
    bundleLoads: {
      limit: bundleLimit,
      used: bundleUsed,
      remaining: bundleLimit - bundleUsed,
    },
    messages: {
      limit: messagesLimit,
      used: messagesUsed,
      remaining: messagesLimit - messagesUsed,
    },
    apiCalls: {
      limit: 0,
      used: 0,
      remaining: 0,
    },
    sessions: {
      limit: sessionsLimit,
      used: sessionsUsed,
      remaining: sessionsLimit - sessionsUsed,
    },
    walletCredits,
    overageRates: {
      bundleLoads: overageBundle,
      messages: overageConversations, // mapped to conversations overage
      apiCalls: 0,
      sessions: overageConversations,
    },
    billingCycle,
    monthlyFee,
    annualDiscountPct: undefined,
    isAnnualPrepaid: undefined,
    nextBillingDate: nextBillingDate || '',
    usageResetInterval,
    subscriptionStartDate,
    billingResetDay,
    nextUsageResetDate,
    overageTracking: {
      bundleOverageUsed: raw.bundle_overage_used || 0,
      sessionOverageUsed: raw.session_overage_used || 0,
      creditsSpentOnOverage: raw.credits_spent_on_overage || 0,
    },
    // Lifetime totals
    totalConversations: raw.total_conversations || 0,
    totalMessages: raw.total_messages || 0,
    totalBundleLoads: raw.total_bundle_loads || 0,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at || undefined,
  };
}

export function mapUser(raw: any): User {
  return {
    id: raw.id,
    clientId: raw.client_slug,
    clientSlug: raw.client_slug,
    name: raw.name,
    email: raw.email,
    avatarUrl: raw.avatar_url || undefined,
    phone: raw.phone || undefined,
    role: raw.role,
    accessibleClientSlugs: Object.prototype.hasOwnProperty.call(raw, 'accessible_client_slugs')
      ? raw.accessible_client_slugs
      : undefined,
    status: raw.status,
    emailVerified: raw.email_verified,
    lastLoginAt: raw.last_login_at || undefined,
    lastActiveAt: raw.last_active_at || undefined,
    invitedBy: raw.invited_by || undefined,
    invitedAt: raw.invited_at || undefined,
    joinedAt: raw.joined_at || undefined,
    conversationsHandled: raw.conversations_handled || 0,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at || undefined,
  };
}
