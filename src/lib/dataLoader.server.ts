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
  Bot,
  Workspace,
  User,
  MetricsData,
  Conversation,
  Session,
  BotSession,
  Message,
} from '@/types';

// Cache for loaded data
let clientsData: Client[] | null = null;
let botsData: Bot[] | null = null;
let workspacesData: Workspace[] | null = null;
let usersData: User[] | null = null;
let metricsData: MetricsData | null = null;
let conversationsData: Conversation[] | null = null;
let sessionsData: Session[] | null = null;
let botSessionsData: BotSession[] | null = null;
let messagesData: Message[] | null = null;

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

export function loadBots(): Bot[] {
  if (!botsData) {
    botsData = loadJsonFile<Bot[]>('bots.json');
  }
  return botsData;
}

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

export function loadConversations(): Conversation[] {
  if (!conversationsData) {
    conversationsData = loadJsonFile<Conversation[]>('conversations.json');
  }
  return conversationsData;
}

export function loadSessions(): Session[] {
  if (!sessionsData) {
    sessionsData = loadJsonFile<Session[]>('sessions.json');
  }
  return sessionsData;
}

export function loadBotSessions(): BotSession[] {
  if (!botSessionsData) {
    botSessionsData = loadJsonFile<BotSession[]>('bot_sessions.json');
  }
  return botSessionsData;
}

export function loadMessages(): Message[] {
  if (!messagesData) {
    messagesData = loadJsonFile<Message[]>('messages.json');
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

export function getBotsByClientId(clientId: string): Bot[] {
  return loadBots().filter(b => b.clientId === clientId);
}

export function getBotsByWorkspaceId(workspaceId: string): Bot[] {
  return loadBots().filter(b => b.workspaceId === workspaceId);
}

export function getBotById(botId: string): Bot | undefined {
  return loadBots().find(b => b.id === botId);
}

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

export function getConversationsByBotId(botId: string): Conversation[] {
  return loadConversations().filter(c => c.botId === botId);
}

export function getMessagesByConversationId(conversationId: string): Message[] {
  return loadMessages().filter(m => m.conversationId === conversationId);
}

export function getBotSessionsByClientId(
  clientId: string,
  dateRange?: { start: Date; end: Date }
): BotSession[] {
  let sessions = loadBotSessions().filter(s => s.client_id === clientId);

  if (dateRange) {
    sessions = sessions.filter(s => {
      const sessionDate = new Date(s.start_time);
      return sessionDate >= dateRange.start && sessionDate <= dateRange.end;
    });
  }

  return sessions;
}

export function getBotSessionsByBotId(
  botId: string,
  dateRange?: { start: Date; end: Date }
): BotSession[] {
  let sessions = loadBotSessions().filter(s => s.bot_id === botId);

  if (dateRange) {
    sessions = sessions.filter(s => {
      const sessionDate = new Date(s.start_time);
      return sessionDate >= dateRange.start && sessionDate <= dateRange.end;
    });
  }

  return sessions;
}

export function getClientMetrics(clientId: string) {
  const metrics = loadMetrics();
  return {
    usageByDay: metrics.usageByDay[clientId] || [],
    topIntents: metrics.topIntents[clientId] || [],
    csat: metrics.csat[clientId] || 0,
  };
}

export function getBotMetrics(botId: string) {
  const metrics = loadMetrics();
  return {
    usageByDay: metrics.botUsageByDay[botId] || [],
    topIntents: metrics.botIntents[botId] || [],
  };
}
