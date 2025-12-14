import type { ChatSession } from '@/types';
import type { Assistant, Client, Workspace, User } from '@/types';

/**
 * Normalize raw chat session data (mock JSON or Supabase rows) into
 * the domain ChatSession shape expected by the app.
 */
export function normalizeChatSession(raw: any): ChatSession {
  const sessionStartedAt = raw.session_started_at || raw.session_start || raw.created_at;
  const sessionEndedAt = raw.session_ended_at ?? raw.session_end ?? null;
  const sessionStartDate = sessionStartedAt ? new Date(sessionStartedAt) : null;
  const sessionEndDate = sessionEndedAt ? new Date(sessionEndedAt) : null;
  const sessionDurationSeconds =
    sessionStartDate && sessionEndDate
      ? Math.round((sessionEndDate.getTime() - sessionStartDate.getTime()) / 1000)
      : null;

  const totalUserMessages = raw.total_user_messages ?? raw.user_messages ?? 0;
  const totalAssistantMessages = raw.total_bot_messages ?? raw.assistant_messages ?? 0;
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
    mascot_slug: raw.mascot_slug || raw.mascot_id,
    client_slug: raw.client_slug || raw.client_id,
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
  return {
    id: raw.id,
    slug: raw.slug || raw.id,
    name: raw.name,
    email: raw.email || undefined,
    phone: raw.phone || undefined,
    website: raw.website || undefined,
    logoUrl: raw.logo_url || undefined,
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
  return {
    id: raw.mascot_slug,
    clientId: raw.client_slug,
    // Workspace may be stored as slug or id; support both to avoid orphaning assistants in UI filters.
    workspaceSlug: raw.workspace_slug || raw.workspace_id || raw.workspace || raw.workspaceSlug,
    name: raw.name,
    // Keep undefined if missing; UI components handle fallback avatars
    image: raw.image_url || undefined,
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
  return {
    id: raw.id,
    slug: raw.slug || raw.id,
    workspaceNumber: raw.workspace_number || 1,
    clientId: raw.client_slug,
    clientSlug: raw.client_slug,
    name: raw.name,
    description: raw.description || undefined,
    plan: raw.plan,
    status: raw.status,
    bundleLoads: {
      limit: raw.bundle_loads_limit || 0,
      used: raw.bundle_loads_used || 0,
      remaining: (raw.bundle_loads_limit || 0) - (raw.bundle_loads_used || 0),
    },
    messages: {
      limit: raw.messages_limit || 0,
      used: raw.messages_used || 0,
      remaining: (raw.messages_limit || 0) - (raw.messages_used || 0),
    },
    apiCalls: {
      limit: raw.api_calls_limit || 0,
      used: raw.api_calls_used || 0,
      remaining: (raw.api_calls_limit || 0) - (raw.api_calls_used || 0),
    },
    sessions: {
      limit: raw.sessions_limit || 0,
      used: raw.sessions_used || 0,
      remaining: (raw.sessions_limit || 0) - (raw.sessions_used || 0),
    },
    walletCredits: raw.wallet_credits || 0,
    overageRates: {
      bundleLoads: raw.overage_rate_bundle_loads || 0,
      messages: raw.overage_rate_messages || 0,
      apiCalls: raw.overage_rate_api_calls || 0,
      sessions: raw.overage_rate_sessions || 0,
    },
    billingCycle: raw.billing_cycle || 'monthly',
    monthlyFee: raw.monthly_fee || 0,
    nextBillingDate: raw.next_billing_date || '',
    usageResetInterval: raw.usage_reset_interval || undefined,
    subscriptionStartDate: raw.subscription_start_date || undefined,
    billingResetDay: raw.billing_reset_day || undefined,
    nextUsageResetDate: raw.next_usage_reset_date || undefined,
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
