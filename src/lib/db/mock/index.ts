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
  Bot,
  Workspace,
  User,
  Conversation,
  Message,
  Session,
  BotSession,
  MetricsData,
} from '@/types';
import type {
  ClientOperations,
  BotOperations,
  WorkspaceOperations,
  UserOperations,
  ConversationOperations,
  MessageOperations,
  SessionOperations,
  MetricsOperations,
  DateRange,
  ClientMetrics,
  BotMetricsResult,
} from '../types';

// Cache for loaded data
const cache: {
  clients?: Client[];
  bots?: Bot[];
  workspaces?: Workspace[];
  users?: User[];
  conversations?: Conversation[];
  messages?: Message[];
  sessions?: Session[];
  botSessions?: BotSession[];
  metrics?: MetricsData;
} = {};

function loadJsonFile<T>(filename: string): T {
  const filePath = path.join(process.cwd(), 'public', 'data', filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data) as T;
}

function getClients(): Client[] {
  if (!cache.clients) {
    cache.clients = loadJsonFile<Client[]>('clients.json');
  }
  return cache.clients;
}

function getBots(): Bot[] {
  if (!cache.bots) {
    cache.bots = loadJsonFile<Bot[]>('bots.json');
  }
  return cache.bots;
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

function getConversations(): Conversation[] {
  if (!cache.conversations) {
    cache.conversations = loadJsonFile<Conversation[]>('conversations.json');
  }
  return cache.conversations;
}

function getMessages(): Message[] {
  if (!cache.messages) {
    cache.messages = loadJsonFile<Message[]>('messages.json');
  }
  return cache.messages;
}

function getSessions(): Session[] {
  if (!cache.sessions) {
    cache.sessions = loadJsonFile<Session[]>('sessions.json');
  }
  return cache.sessions;
}

function getBotSessions(): BotSession[] {
  if (!cache.botSessions) {
    cache.botSessions = loadJsonFile<BotSession[]>('bot_sessions.json');
  }
  return cache.botSessions;
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

// Bot operations
export const bots: BotOperations = {
  async getAll() {
    return getBots();
  },

  async getById(id: string) {
    return getBots().find(b => b.id === id) || null;
  },

  async getByClientId(clientId: string) {
    // Resolve slug to id if needed
    const resolvedId = await clients.resolveId(clientId) || clientId;
    return getBots().filter(b => b.clientId === resolvedId);
  },

  async getByWorkspaceId(workspaceId: string) {
    return getBots().filter(b => b.workspaceId === workspaceId);
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

  async getByBotId(botId: string) {
    return getConversations().filter(c => c.botId === botId);
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

  async getBotSessions(botId: string, dateRange?: DateRange) {
    let result = getBotSessions().filter(s => s.bot_id === botId);

    if (dateRange) {
      result = result.filter(s => {
        const sessionDate = new Date(s.start_time);
        return sessionDate >= dateRange.start && sessionDate <= dateRange.end;
      });
    }

    return result;
  },

  async getBotSessionsByClientId(clientId: string, dateRange?: DateRange) {
    const resolvedId = await clients.resolveId(clientId) || clientId;
    let result = getBotSessions().filter(s => s.client_id === resolvedId);

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

  async getBotMetrics(botId: string): Promise<BotMetricsResult> {
    const metricsData = getMetrics();
    return {
      usageByDay: metricsData.botUsageByDay[botId] || [],
      topIntents: metricsData.botIntents[botId] || [],
    };
  },
};
