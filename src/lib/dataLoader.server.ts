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
