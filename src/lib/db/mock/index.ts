/**
 * Mock Database Implementation
 *
 * Uses JSON files from public/data/ for local development.
 * Implements the same interface as the Supabase implementation.
 */

import fs from 'fs';
import path from 'path';
import type {
  Client,
  Assistant,
  Workspace,
  User,
  Conversation,
  Message,
  Session,
  AssistantSession,
  MetricsData,
  ChatSession,
  ChatMessage,
} from '@/types';
import type {
  ClientOperations,
  AssistantOperations,
  WorkspaceOperations,
  UserOperations,
  ConversationOperations,
  MessageOperations,
  SessionOperations,
  MetricsOperations,
  DateRange,
  ClientMetrics,
  AssistantMetricsResult,
} from '../types';

// Cache for loaded data
const cache: {
  clients?: Client[];
  assistants?: Assistant[];
  workspaces?: Workspace[];
  users?: User[];
  conversations?: Conversation[];
  messages?: Message[];
  sessions?: Session[];
  assistantSessions?: AssistantSession[];
  metrics?: MetricsData;
  chatSessions?: ChatSession[];
  chatMessages?: ChatMessage[];
} = {};

function loadJsonFile<T>(filename: string): T {
  const filePath = path.join(process.cwd(), 'public', 'data', filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data) as T;
}

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

function getClients(): Client[] {
  if (!cache.clients) {
    cache.clients = loadJsonFile<Client[]>('clients.json');
  }
  return cache.clients;
}

function getAssistants(): Assistant[] {
  if (!cache.assistants) {
    cache.assistants = loadJsonFile<Assistant[]>('assistants.json');
  }
  return cache.assistants;
}

function getWorkspaces(): Workspace[] {
  if (!cache.workspaces) {
    cache.workspaces = loadJsonFile<Workspace[]>('workspaces.json');
  }
  return cache.workspaces;
}

function getUsers(): User[] {
  if (!cache.users) {
    cache.users = loadJsonFile<User[]>('users.json');
  }
  return cache.users;
}

function getChatSessions(): ChatSession[] {
  if (!cache.chatSessions) {
    const raw = loadJsonFile<any[]>('chat_sessions.json');
    cache.chatSessions = raw.map(normalizeChatSession);
  }
  return cache.chatSessions;
}

function getChatMessages(): ChatMessage[] {
  if (!cache.chatMessages) {
    cache.chatMessages = loadJsonFile<ChatMessage[]>('chat_messages.json');
  }
  return cache.chatMessages;
}

function getConversations(): Conversation[] {
  if (cache.conversations) return cache.conversations;

  const sessions = getChatSessions();
  const chatMessages = getChatMessages();

  const latestMessageBySession = chatMessages.reduce<Record<string, ChatMessage>>((acc, msg) => {
    const current = acc[msg.session_id];
    if (!current || new Date(msg.timestamp) > new Date(current.timestamp)) {
      acc[msg.session_id] = msg;
    }
    return acc;
  }, {});

  cache.conversations = sessions.map(session => {
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

  return cache.conversations;
}

function getMessages(): Message[] {
  if (cache.messages) return cache.messages;
  const chatMessages = getChatMessages();
  cache.messages = chatMessages.map(msg => ({
    id: msg.id,
    conversationId: msg.session_id,
    sender: msg.author === 'bot' ? 'assistant' : 'user',
    senderName: msg.author === 'bot' ? 'Assistant' : 'User',
    content: msg.message,
    timestamp: msg.timestamp,
  }));
  return cache.messages;
}

function getSessions(): Session[] {
  if (!cache.sessions) {
    cache.sessions = loadJsonFile<Session[]>('sessions.json');
  }
  return cache.sessions;
}

function getAssistantSessions(): AssistantSession[] {
  if (!cache.assistantSessions) {
    cache.assistantSessions = loadJsonFile<AssistantSession[]>('assistant_sessions.json');
  }
  return cache.assistantSessions;
}

function getMetrics(): MetricsData {
  if (!cache.metrics) {
    cache.metrics = loadJsonFile<MetricsData>('metrics.json');
  }
  return cache.metrics;
}

// Client operations
export const clients: ClientOperations = {
  async getAll() {
    return getClients();
  },

  async getById(id: string) {
    return getClients().find(c => c.id === id) || null;
  },

  async getBySlug(slug: string) {
    return getClients().find(c => c.slug === slug) || null;
  },

  async getByIdOrSlug(idOrSlug: string) {
    return getClients().find(c => c.id === idOrSlug || c.slug === idOrSlug) || null;
  },

  async resolveId(idOrSlug: string) {
    const client = await this.getByIdOrSlug(idOrSlug);
    return client?.id || null;
  },
};

// Assistant operations
export const assistants: AssistantOperations = {
  async getAll() {
    return getAssistants();
  },

  async getById(id: string) {
    return getAssistants().find(a => a.id === id) || null;
  },

  async getByClientId(clientId: string) {
    // Resolve slug to id if needed
    const resolvedId = await clients.resolveId(clientId) || clientId;
    return getAssistants().filter(a => a.clientId === resolvedId);
  },

  async getByWorkspaceId(workspaceId: string) {
    return getAssistants().filter(a => a.workspaceId === workspaceId);
  },
};

// Workspace operations
export const workspaces: WorkspaceOperations = {
  async getAll() {
    return getWorkspaces();
  },

  async getById(id: string) {
    return getWorkspaces().find(w => w.id === id) || null;
  },

  async getByClientId(clientId: string) {
    const resolvedId = await clients.resolveId(clientId) || clientId;
    return getWorkspaces().filter(w => w.clientId === resolvedId);
  },
};

// User operations
export const users: UserOperations = {
  async getAll() {
    return getUsers();
  },

  async getById(id: string) {
    return getUsers().find(u => u.id === id) || null;
  },

  async getByClientId(clientId: string) {
    const resolvedId = await clients.resolveId(clientId) || clientId;
    return getUsers().filter(u => u.clientId === resolvedId);
  },
};

// Conversation operations
export const conversations: ConversationOperations = {
  async getAll() {
    return getConversations();
  },

  async getById(id: string) {
    return getConversations().find(c => c.id === id) || null;
  },

  async getByClientId(clientId: string) {
    const resolvedId = await clients.resolveId(clientId) || clientId;
    return getConversations().filter(c => c.clientId === resolvedId);
  },

  async getByAssistantId(assistantId: string) {
    return getConversations().filter(c => c.assistantId === assistantId);
  },
};

// Message operations
export const messages: MessageOperations = {
  async getByConversationId(conversationId: string) {
    return getMessages().filter(m => m.conversationId === conversationId);
  },
};

// Session operations
export const sessions: SessionOperations = {
  async getByClientId(clientId: string) {
    const resolvedId = await clients.resolveId(clientId) || clientId;
    return getSessions().filter(s => s.clientId === resolvedId);
  },

  async getActiveByClientId(clientId: string) {
    const resolvedId = await clients.resolveId(clientId) || clientId;
    return getSessions().filter(s => s.clientId === resolvedId && s.status === 'active');
  },

  async getAssistantSessions(assistantId: string, dateRange?: DateRange) {
    let result = getAssistantSessions().filter(s => s.assistant_id === assistantId);

    if (dateRange) {
      result = result.filter(s => {
        const sessionDate = new Date(s.start_time);
        return sessionDate >= dateRange.start && sessionDate <= dateRange.end;
      });
    }

    return result;
  },

  async getAssistantSessionsByClientId(clientId: string, dateRange?: DateRange) {
    const resolvedId = await clients.resolveId(clientId) || clientId;
    let result = getAssistantSessions().filter(s => s.client_slug === resolvedId);

    if (dateRange) {
      result = result.filter(s => {
        const sessionDate = new Date(s.start_time);
        return sessionDate >= dateRange.start && sessionDate <= dateRange.end;
      });
    }

    return result;
  },
};

// Metrics operations
export const metrics: MetricsOperations = {
  async getClientMetrics(clientId: string): Promise<ClientMetrics> {
    const resolvedId = await clients.resolveId(clientId) || clientId;
    const metricsData = getMetrics();
    return {
      usageByDay: metricsData.usageByDay[resolvedId] || [],
      topIntents: metricsData.topIntents[resolvedId] || [],
      csat: metricsData.csat[resolvedId] || 0,
    };
  },

  async getAssistantMetrics(assistantId: string): Promise<AssistantMetricsResult> {
    const metricsData = getMetrics();
    return {
      usageByDay: metricsData.assistantUsageByDay?.[assistantId] || [],
      topIntents: metricsData.assistantIntents?.[assistantId] || [],
    };
  },
};
