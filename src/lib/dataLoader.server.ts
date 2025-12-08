/**
 * Server-side Data Loader
 *
 * Reads mock data from filesystem for API routes.
 * This file should only be imported from server-side code (API routes, server components).
 */

import fs from 'fs';
import path from 'path';
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
  ChatSession,
  ChatMessage,
} from '@/types';

// Cache for loaded data
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
    mascot_id: raw.mascot_id,
    client_id: raw.client_id,
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

function loadJsonFile<T>(filename: string): T {
  const filePath = path.join(process.cwd(), 'public', 'data', filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data) as T;
}

export function loadClients(): Client[] {
  if (!clientsData) {
    clientsData = loadJsonFile<Client[]>('clients.json');
  }
  return clientsData;
}

export function loadAssistants(): Assistant[] {
  if (!assistantsData) {
    assistantsData = loadJsonFile<Assistant[]>('assistants.json');
  }
  return assistantsData;
}

/** @deprecated Use loadAssistants() instead */
export const loadBots = loadAssistants;

export function loadWorkspaces(): Workspace[] {
  if (!workspacesData) {
    workspacesData = loadJsonFile<Workspace[]>('workspaces.json');
  }
  return workspacesData;
}

export function loadUsers(): User[] {
  if (!usersData) {
    usersData = loadJsonFile<User[]>('users.json');
  }
  return usersData;
}

export function loadMetrics(): MetricsData {
  if (!metricsData) {
    metricsData = loadJsonFile<MetricsData>('metrics.json');
  }
  return metricsData;
}

function loadChatSessions(): ChatSession[] {
  if (!chatSessionsData) {
    const raw = loadJsonFile<any[]>('chat_sessions.json');
    chatSessionsData = raw.map(normalizeChatSession);
  }
  return chatSessionsData;
}

function loadChatMessages(): ChatMessage[] {
  if (!chatMessagesData) {
    chatMessagesData = loadJsonFile<ChatMessage[]>('chat_messages.json');
  }
  return chatMessagesData;
}

export function loadConversations(): Conversation[] {
  if (conversationsData) return conversationsData;

  const sessions = loadChatSessions();
  const chatMessages = loadChatMessages();

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
      assistantId: session.mascot_id,
      clientId: session.client_id,
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

  return conversationsData;
}

export function loadSessions(): Session[] {
  if (!sessionsData) {
    sessionsData = loadJsonFile<Session[]>('sessions.json');
  }
  return sessionsData;
}

export function loadAssistantSessions(): AssistantSession[] {
  if (!assistantSessionsData) {
    assistantSessionsData = loadJsonFile<AssistantSession[]>('assistant_sessions.json');
  }
  return assistantSessionsData;
}

/** @deprecated Use loadAssistantSessions() instead */
export const loadBotSessions = loadAssistantSessions;

export function loadMessages(): Message[] {
  if (!messagesData) {
    const chatMessages = loadChatMessages();
    messagesData = chatMessages.map(msg => ({
      id: msg.id,
      conversationId: msg.session_id,
      sender: msg.author === 'bot' ? 'assistant' : 'user',
      senderName: msg.author === 'bot' ? 'Assistant' : 'User',
      content: msg.message,
      timestamp: msg.timestamp,
    }));
  }
  return messagesData;
}

// Query functions
export function getClientById(id: string): Client | undefined {
  return loadClients().find(c => c.id === id);
}

export function getClientBySlug(slug: string): Client | undefined {
  return loadClients().find(c => c.slug === slug);
}

export function getAssistantsByClientId(clientId: string): Assistant[] {
  return loadAssistants().filter(a => a.clientId === clientId);
}

/** @deprecated Use getAssistantsByClientId() instead */
export const getBotsByClientId = getAssistantsByClientId;

export function getAssistantsByWorkspaceId(workspaceId: string): Assistant[] {
  return loadAssistants().filter(a => a.workspaceId === workspaceId);
}

/** @deprecated Use getAssistantsByWorkspaceId() instead */
export const getBotsByWorkspaceId = getAssistantsByWorkspaceId;

export function getAssistantById(assistantId: string): Assistant | undefined {
  return loadAssistants().find(a => a.id === assistantId);
}

/** @deprecated Use getAssistantById() instead */
export const getBotById = getAssistantById;

export function getWorkspacesByClientId(clientId: string): Workspace[] {
  return loadWorkspaces().filter(w => w.clientId === clientId);
}

export function getWorkspaceById(workspaceId: string): Workspace | undefined {
  return loadWorkspaces().find(w => w.id === workspaceId);
}

export function getUsersByClientId(clientId: string): User[] {
  return loadUsers().filter(u => u.clientId === clientId);
}

export function getConversationsByClientId(clientId: string): Conversation[] {
  return loadConversations().filter(c => c.clientId === clientId);
}

export function getConversationsByAssistantId(assistantId: string): Conversation[] {
  return loadConversations().filter(c => c.assistantId === assistantId);
}

/** @deprecated Use getConversationsByAssistantId() instead */
export const getConversationsByBotId = getConversationsByAssistantId;

export function getMessagesByConversationId(conversationId: string): Message[] {
  return loadMessages().filter(m => m.conversationId === conversationId);
}

export function getAssistantSessionsByClientId(
  clientId: string,
  dateRange?: { start: Date; end: Date }
): AssistantSession[] {
  let sessions = loadAssistantSessions().filter(s => s.client_id === clientId);

  if (dateRange) {
    sessions = sessions.filter(s => {
      const sessionDate = new Date(s.start_time);
      return sessionDate >= dateRange.start && sessionDate <= dateRange.end;
    });
  }

  return sessions;
}

/** @deprecated Use getAssistantSessionsByClientId() instead */
export const getBotSessionsByClientId = getAssistantSessionsByClientId;

export function getAssistantSessionsByAssistantId(
  assistantId: string,
  dateRange?: { start: Date; end: Date }
): AssistantSession[] {
  let sessions = loadAssistantSessions().filter(s => s.assistant_id === assistantId);

  if (dateRange) {
    sessions = sessions.filter(s => {
      const sessionDate = new Date(s.start_time);
      return sessionDate >= dateRange.start && sessionDate <= dateRange.end;
    });
  }

  return sessions;
}

/** @deprecated Use getAssistantSessionsByAssistantId() instead */
export const getBotSessionsByBotId = getAssistantSessionsByAssistantId;

export function getClientMetrics(clientId: string) {
  const metrics = loadMetrics();
  return {
    usageByDay: metrics.usageByDay[clientId] || [],
    topIntents: metrics.topIntents[clientId] || [],
    csat: metrics.csat[clientId] || 0,
  };
}

export function getAssistantMetrics(assistantId: string) {
  const metrics = loadMetrics();
  return {
    usageByDay: metrics.assistantUsageByDay[assistantId] || [],
    topIntents: metrics.assistantIntents[assistantId] || [],
  };
}

/** @deprecated Use getAssistantMetrics() instead */
export const getBotMetrics = getAssistantMetrics;
