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
import { normalizeChatSession, mapAssistantFromMascot, mapClient, mapWorkspace, mapUser } from '../mappers';

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


function getClients(): Client[] {
  if (!cache.clients) {
    const raw = loadJsonFile<any[]>('clients.json');
    cache.clients = raw.map(mapClient);
  }
  return cache.clients;
}

function getAssistants(): Assistant[] {
  if (!cache.assistants) {
    // Assistants are stored as mascots in mock data
    const mascots = loadJsonFile<any[]>('mascots.json');
    cache.assistants = mascots.map(mapAssistantFromMascot);
  }
  return cache.assistants;
}

function getWorkspaces(): Workspace[] {
  if (!cache.workspaces) {
    const raw = loadJsonFile<any[]>('workspaces.json');
    cache.workspaces = raw.map(mapWorkspace);
  }
  return cache.workspaces;
}

function getUsers(): User[] {
  if (!cache.users) {
    const raw = loadJsonFile<any[]>('users.json');
    cache.users = raw.map(mapUser);
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

// Aggregate assistant usage from chat sessions (fallback when metrics.json lacks per-assistant data)
function aggregateAssistantUsageFromSessions(assistantId: string): {
  usageByDay: ClientMetrics['usageByDay'];
  topIntents: ClientMetrics['topIntents'];
} {
  const sessions = getChatSessions().filter(s => s.mascot_slug === assistantId);
  const usageByDayMap = new Map<string, { conversations: number; resolved: number }>();
  const intentCounts = new Map<string, number>();

  sessions.forEach(session => {
    const date = session.session_started_at?.slice(0, 10) || 'unknown';
    const prev = usageByDayMap.get(date) || { conversations: 0, resolved: 0 };
    prev.conversations += 1;
    // Treat sessions with an end time as resolved
    if (session.session_ended_at) prev.resolved += 1;
    usageByDayMap.set(date, prev);

    if (session.referrer_domain) {
      intentCounts.set(session.referrer_domain, (intentCounts.get(session.referrer_domain) || 0) + 1);
    }
  });

  const usageByDay = Array.from(usageByDayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, conversations: counts.conversations, resolved: counts.resolved }));

  const topIntents = Array.from(intentCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([intent, count]) => ({ intent, count }));

  return { usageByDay, topIntents };
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

  async resolveSlug(idOrSlug: string) {
    const client = await this.getByIdOrSlug(idOrSlug);
    return client?.slug || null;
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
    // Mock assistants store client slug in clientId; accept either id or slug
    const resolvedSlug = await clients.resolveSlug(clientId) || clientId;
    return getAssistants().filter(a => a.clientId === resolvedSlug || a.clientId === clientId);
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
    return getWorkspaces().find(w => w.id === id || w.slug === id) || null;
  },

  async getByClientId(clientId: string) {
    const resolvedSlug = await clients.resolveSlug(clientId) || clientId;
    return getWorkspaces().filter(w => w.clientId === resolvedSlug || w.clientSlug === resolvedSlug);
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
    const resolvedSlug = await clients.resolveSlug(clientId) || clientId;
    return getUsers().filter(u => u.clientId === resolvedSlug || u.clientSlug === resolvedSlug);
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
    const resolvedSlug = await clients.resolveSlug(clientId) || clientId;
    return getConversations().filter(c => c.clientId === resolvedSlug || c.clientId === clientId);
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
    const resolvedSlug = await clients.resolveSlug(clientId) || clientId;
    return getSessions().filter(s => s.clientId === resolvedSlug || s.clientId === clientId);
  },

  async getActiveByClientId(clientId: string) {
    const resolvedSlug = await clients.resolveSlug(clientId) || clientId;
    return getSessions().filter(s => (s.clientId === resolvedSlug || s.clientId === clientId) && s.status === 'active');
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
    const resolvedSlug = await clients.resolveSlug(clientId) || clientId;
    let result = getAssistantSessions().filter(s => s.client_slug === resolvedSlug || s.client_slug === clientId);

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
    const resolvedSlug = await clients.resolveSlug(clientId) || clientId;
    const metricsData = getMetrics();
    return {
      usageByDay: metricsData.usageByDay[resolvedSlug] || [],
      topIntents: metricsData.topIntents[resolvedSlug] || [],
    };
  },

  async getAssistantMetrics(assistantId: string): Promise<AssistantMetricsResult> {
    const metricsData = getMetrics();
    let usageByDay = metricsData.assistantUsageByDay?.[assistantId] || [];
    let topIntents = metricsData.assistantIntents?.[assistantId] || [];

    // Fallback: if no per-assistant metrics, derive from client metrics
    if (!usageByDay.length || !topIntents.length) {
      const assistant = getAssistants().find(a => a.id === assistantId);
      const clientSlug = assistant?.clientId;
      if (clientSlug) {
        if (!usageByDay.length) {
          usageByDay = metricsData.usageByDay[clientSlug] || [];
        }
        if (!topIntents.length) {
          topIntents = metricsData.topIntents[clientSlug] || [];
        }
      }
    }

    // Final fallback: aggregate from chat sessions for that assistant
    if (!usageByDay.length || !topIntents.length) {
      const aggregated = aggregateAssistantUsageFromSessions(assistantId);
      if (!usageByDay.length) usageByDay = aggregated.usageByDay;
      if (!topIntents.length) topIntents = aggregated.topIntents;
    }

    return { usageByDay, topIntents };
  },
};
