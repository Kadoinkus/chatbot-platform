// Re-export all types from centralized location
export type {
  Palette,
  Client,
  ClientLogin,
  PlanType,
  WorkspaceStatus,
  BillingCycle,
  UsageCounter,
  OverageRates,
  Workspace,
  AgentStatus,
  AssistantMetrics,
  Assistant,
  TeamRole,
  UserStatus,
  User,
  ConversationStatus,
  Channel,
  Conversation,
  MessageSender,
  Message,
  SessionStatus,
  SessionAction,
  Session,
  Sentiment,
  YesNo,
  ResolutionType,
  CompletionStatus,
  UserType,
  DeviceType,
  AssistantSession,
  UsageData,
  IntentData,
  MetricsData,
  AuthSession,
  ApiError,
  ApiResponse,
  CounterSummary,
  // Legacy aliases
  BotStatus,
  BotMetrics,
  Bot,
  BotSession,
} from '@/types';

import type {
  Client,
  Assistant,
  Workspace,
  User,
  MetricsData,
  Conversation,
  Session,
  AssistantSession,
  Message,
  UsageData,
  IntentData,
  ChatSession,
  ChatMessage,
} from '@/types';

// Data loading functions (client-side fetch)
let clientsData: Client[] | null = null;
let assistantsData: Assistant[] | null = null;
let workspacesData: Workspace[] | null = null;
let usersData: User[] | null = null;
let metricsData: MetricsData | null = null;
let conversationsData: Conversation[] | null = null;
let sessionsData: Session[] | null = null;
let assistantSessionsData: AssistantSession[] | null = null;
let messagesData: Message[] | null = null;
let chatSessionsData: ChatSession[] | null = null;
let chatMessagesData: ChatMessage[] | null = null;

function normalizeChatSession(raw: any): ChatSession {
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
    visitor_ip_hash: raw.ip_address ? raw.ip_address.replace(/\\.\\d+$/, '.xxx') : null,
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
    is_mobile: raw.device_type === 'mobile',
    screen_width: null,
    screen_height: null,
    widget_version: raw.widget_version || null,
    referrer_url: raw.referrer_url || null,
    referrer_domain: raw.referrer_url ? new URL(raw.referrer_url).hostname : null,
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

export async function loadClients(): Promise<Client[]> {
  if (clientsData) return clientsData;
  const response = await fetch('/data/clients.json');
  clientsData = await response.json();
  return clientsData!;
}

export async function loadAssistants(): Promise<Assistant[]> {
  if (assistantsData) return assistantsData;
  const response = await fetch('/data/assistants.json');
  assistantsData = await response.json();
  return assistantsData!;
}

/** @deprecated Use loadAssistants() instead */
export const loadBots = loadAssistants;

export async function loadWorkspaces(): Promise<Workspace[]> {
  if (workspacesData) return workspacesData;
  const response = await fetch('/data/workspaces.json');
  workspacesData = await response.json();
  return workspacesData!;
}

export async function loadUsers(): Promise<User[]> {
  if (usersData) return usersData;
  const response = await fetch('/data/users.json');
  usersData = await response.json();
  return usersData!;
}

export async function loadMetrics(): Promise<MetricsData> {
  if (metricsData) return metricsData;
  const response = await fetch('/data/metrics.json');
  metricsData = await response.json();
  return metricsData!;
}

async function loadChatSessions(): Promise<ChatSession[]> {
  if (chatSessionsData) return chatSessionsData;
  const response = await fetch('/data/chat_sessions.json');
  const raw = await response.json();
  chatSessionsData = (raw as any[]).map(normalizeChatSession);
  return chatSessionsData!;
}

async function loadChatMessages(): Promise<ChatMessage[]> {
  if (chatMessagesData) return chatMessagesData;
  const response = await fetch('/data/chat_messages.json');
  chatMessagesData = await response.json();
  return chatMessagesData!;
}

export async function loadConversations(): Promise<Conversation[]> {
  if (conversationsData) return conversationsData;
  // Derive synthetic conversations from chat sessions + messages
  const [sessions, chatMessages] = await Promise.all([loadChatSessions(), loadChatMessages()]);

  const latestMessageBySession = chatMessages.reduce<Record<string, ChatMessage>>((acc, msg) => {
    const current = acc[msg.session_id];
    if (!current || new Date(msg.timestamp) > new Date(current.timestamp)) {
      acc[msg.session_id] = msg;
    }
    return acc;
  }, {});

  conversationsData = sessions.map(session => {
    const latest = latestMessageBySession[session.id];
    const totalMessages = session.total_messages ?? (session.assistant_messages + session.user_messages);

    return {
      id: session.id,
      assistantId: session.mascot_slug,
      clientId: session.client_slug,
      userId: session.user_id ?? 'visitor',
      userName: session.user_id ?? 'Visitor',
      status: session.session_ended_at ? 'resolved' : 'active',
      startedAt: session.session_started_at,
      endedAt: session.session_ended_at ?? undefined,
      messages: totalMessages || 0,
      satisfaction: undefined,
      intent: session.referrer_domain || 'unknown',
      channel: 'webchat',
      preview: latest?.message || (session.full_transcript?.slice(-1)[0]?.message ?? ''),
    };
  });

  return conversationsData!;
}

export async function loadSessions(): Promise<Session[]> {
  if (sessionsData) return sessionsData;
  const response = await fetch('/data/sessions.json');
  sessionsData = await response.json();
  return sessionsData!;
}

export async function loadAssistantSessions(): Promise<AssistantSession[]> {
  if (assistantSessionsData) return assistantSessionsData;
  const response = await fetch('/data/assistant_sessions.json');
  assistantSessionsData = await response.json();
  return assistantSessionsData!;
}

/** @deprecated Use loadAssistantSessions() instead */
export const loadBotSessions = loadAssistantSessions;

export async function loadMessages(): Promise<Message[]> {
  if (messagesData) return messagesData;
  const chatMessages = await loadChatMessages();

  messagesData = chatMessages.map(msg => ({
    id: msg.id,
    conversationId: msg.session_id,
    sender: msg.author === 'bot' ? 'assistant' : 'user',
    senderName: msg.author === 'bot' ? 'Assistant' : 'User',
    content: msg.message,
    timestamp: msg.timestamp,
  }));

  return messagesData!;
}

// Combined data functions for backward compatibility
export async function getClients(): Promise<Client[]> {
  return loadClients();
}

export async function getClientById(idOrSlug: string): Promise<Client | undefined> {
  const clients = await loadClients();
  // Match by id OR slug to support both URL formats
  return clients.find(c => c.id === idOrSlug || c.slug === idOrSlug);
}

/**
 * Resolves a client ID or slug to the actual client ID.
 * Use this when you need the canonical ID for data lookups.
 */
export async function resolveClientId(idOrSlug: string): Promise<string | undefined> {
  const client = await getClientById(idOrSlug);
  return client?.id;
}

export async function getAssistantsByClientId(clientIdOrSlug: string): Promise<Assistant[]> {
  // Resolve slug to actual ID if needed
  const clientId = await resolveClientId(clientIdOrSlug) || clientIdOrSlug;
  const assistants = await loadAssistants();
  return assistants.filter(a => a.clientId === clientId);
}

/** @deprecated Use getAssistantsByClientId() instead */
export const getBotsByClientId = getAssistantsByClientId;

export async function getAssistantsByWorkspaceId(workspaceId: string): Promise<Assistant[]> {
  const assistants = await loadAssistants();
  return assistants.filter(a => a.workspaceId === workspaceId);
}

/** @deprecated Use getAssistantsByWorkspaceId() instead */
export const getBotsByWorkspaceId = getAssistantsByWorkspaceId;

export async function getWorkspacesByClientId(clientIdOrSlug: string): Promise<Workspace[]> {
  // Resolve slug to actual ID if needed
  const clientId = await resolveClientId(clientIdOrSlug) || clientIdOrSlug;
  const workspaces = await loadWorkspaces();
  return workspaces.filter(w => w.clientId === clientId);
}

export async function getWorkspaceById(id: string): Promise<Workspace | undefined> {
  const workspaces = await loadWorkspaces();
  return workspaces.find(w => w.id === id);
}

export async function getAssistantById(id: string): Promise<Assistant | undefined> {
  const assistants = await loadAssistants();
  return assistants.find(a => a.id === id);
}

/** @deprecated Use getAssistantById() instead */
export const getBotById = getAssistantById;

export async function getUsersByClientId(clientIdOrSlug: string): Promise<User[]> {
  const clientId = await resolveClientId(clientIdOrSlug) || clientIdOrSlug;
  const users = await loadUsers();
  return users.filter(u => u.clientId === clientId);
}

export async function getClientMetrics(clientIdOrSlug: string): Promise<{
  usageByDay: UsageData[];
  topIntents: IntentData[];
  csat: number;
}> {
  const clientId = await resolveClientId(clientIdOrSlug) || clientIdOrSlug;
  const metrics = await loadMetrics();
  return {
    usageByDay: metrics.usageByDay[clientId] || [],
    topIntents: metrics.topIntents[clientId] || [],
    csat: metrics.csat[clientId] || 0
  };
}

export async function getAssistantMetrics(assistantId: string): Promise<{
  usageByDay: UsageData[];
  topIntents: IntentData[];
}> {
  const metrics = await loadMetrics();
  return {
    usageByDay: metrics.assistantUsageByDay[assistantId] || [],
    topIntents: metrics.assistantIntents[assistantId] || []
  };
}

/** @deprecated Use getAssistantMetrics() instead */
export const getBotMetrics = getAssistantMetrics;

export async function getConversationsByClientId(clientIdOrSlug: string): Promise<Conversation[]> {
  const clientId = await resolveClientId(clientIdOrSlug) || clientIdOrSlug;
  const conversations = await loadConversations();
  return conversations.filter(c => c.clientId === clientId);
}

export async function getConversationsByAssistantId(assistantId: string): Promise<Conversation[]> {
  const conversations = await loadConversations();
  return conversations.filter(c => c.assistantId === assistantId);
}

/** @deprecated Use getConversationsByAssistantId() instead */
export const getConversationsByBotId = getConversationsByAssistantId;

export async function getMessagesByConversationId(conversationId: string): Promise<Message[]> {
  const messages = await loadMessages();
  return messages.filter(m => m.conversationId === conversationId);
}

export async function getSessionsByClientId(clientIdOrSlug: string): Promise<Session[]> {
  const clientId = await resolveClientId(clientIdOrSlug) || clientIdOrSlug;
  const sessions = await loadSessions();
  return sessions.filter(s => s.clientId === clientId);
}

export async function getActiveSessionsByClientId(clientIdOrSlug: string): Promise<Session[]> {
  const clientId = await resolveClientId(clientIdOrSlug) || clientIdOrSlug;
  const sessions = await loadSessions();
  return sessions.filter(s => s.clientId === clientId && s.status === 'active');
}

export async function getAssistantSessionsByAssistantId(assistantId: string, dateRange?: { start: Date; end: Date }): Promise<AssistantSession[]> {
  const sessions = await loadAssistantSessions();
  let filtered = sessions.filter(s => s.assistant_id === assistantId);

  if (dateRange) {
    filtered = filtered.filter(s => {
      const sessionDate = new Date(s.start_time);
      return sessionDate >= dateRange.start && sessionDate <= dateRange.end;
    });
  }

  return filtered;
}

/** @deprecated Use getAssistantSessionsByAssistantId() instead */
export const getBotSessionsByBotId = getAssistantSessionsByAssistantId;

export async function getAssistantSessionsByClientId(clientId: string, dateRange?: { start: Date; end: Date }): Promise<AssistantSession[]> {
  const sessions = await loadAssistantSessions();
  let filtered = sessions.filter(s => s.client_slug === clientId);

  if (dateRange) {
    filtered = filtered.filter(s => {
      const sessionDate = new Date(s.start_time);
      return sessionDate >= dateRange.start && sessionDate <= dateRange.end;
    });
  }

  return filtered;
}

/** @deprecated Use getAssistantSessionsByClientId() instead */
export const getBotSessionsByClientId = getAssistantSessionsByClientId;

// Legacy compatibility - reconstructed client objects with nested assistants and metrics
export async function getClientsWithAssistants(): Promise<any[]> {
  const clients = await loadClients();
  const assistants = await loadAssistants();
  const metrics = await loadMetrics();

  return clients.map(client => ({
    ...client,
    assistants: assistants
      .filter(assistant => assistant.clientId === client.id)
      .map(assistant => ({
        ...assistant,
        metrics: {
          ...assistant.metrics,
          usageByDay: metrics.assistantUsageByDay[assistant.id] || [],
          topIntents: metrics.assistantIntents[assistant.id] || []
        }
      })),
    metrics: {
      usageByDay: metrics.usageByDay[client.id] || [],
      topIntents: metrics.topIntents[client.id] || [],
      csat: metrics.csat[client.id] || 0
    }
  }));
}

/** @deprecated Use getClientsWithAssistants() instead */
export const getClientsWithBots = getClientsWithAssistants;
