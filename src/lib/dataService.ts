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
  BotStatus,
  BotMetrics,
  Bot,
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
  BotSession,
  UsageData,
  IntentData,
  MetricsData,
  AuthSession,
  ApiError,
  ApiResponse,
  CounterSummary,
} from '@/types';

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
  UsageData,
  IntentData,
} from '@/types';

// Data loading functions (client-side fetch)
let clientsData: Client[] | null = null;
let botsData: Bot[] | null = null;
let workspacesData: Workspace[] | null = null;
let usersData: User[] | null = null;
let metricsData: MetricsData | null = null;
let conversationsData: Conversation[] | null = null;
let sessionsData: Session[] | null = null;
let botSessionsData: BotSession[] | null = null;
let messagesData: Message[] | null = null;

export async function loadClients(): Promise<Client[]> {
  if (clientsData) return clientsData;
  const response = await fetch('/data/clients.json');
  clientsData = await response.json();
  return clientsData!;
}

export async function loadBots(): Promise<Bot[]> {
  if (botsData) return botsData;
  const response = await fetch('/data/bots.json');
  botsData = await response.json();
  return botsData!;
}

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

export async function loadConversations(): Promise<Conversation[]> {
  if (conversationsData) return conversationsData;
  const response = await fetch('/data/conversations.json');
  conversationsData = await response.json();
  return conversationsData!;
}

export async function loadSessions(): Promise<Session[]> {
  if (sessionsData) return sessionsData;
  const response = await fetch('/data/sessions.json');
  sessionsData = await response.json();
  return sessionsData!;
}

export async function loadBotSessions(): Promise<BotSession[]> {
  if (botSessionsData) return botSessionsData;
  const response = await fetch('/data/bot_sessions.json');
  botSessionsData = await response.json();
  return botSessionsData!;
}

export async function loadMessages(): Promise<Message[]> {
  if (messagesData) return messagesData;
  const response = await fetch('/data/messages.json');
  messagesData = await response.json();
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

export async function getBotsByClientId(clientIdOrSlug: string): Promise<Bot[]> {
  // Resolve slug to actual ID if needed
  const clientId = await resolveClientId(clientIdOrSlug) || clientIdOrSlug;
  const bots = await loadBots();
  return bots.filter(b => b.clientId === clientId);
}

export async function getBotsByWorkspaceId(workspaceId: string): Promise<Bot[]> {
  const bots = await loadBots();
  return bots.filter(b => b.workspaceId === workspaceId);
}

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

export async function getBotById(id: string): Promise<Bot | undefined> {
  const bots = await loadBots();
  return bots.find(b => b.id === id);
}

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

export async function getBotMetrics(botId: string): Promise<{
  usageByDay: UsageData[];
  topIntents: IntentData[];
}> {
  const metrics = await loadMetrics();
  return {
    usageByDay: metrics.botUsageByDay[botId] || [],
    topIntents: metrics.botIntents[botId] || []
  };
}

export async function getConversationsByClientId(clientIdOrSlug: string): Promise<Conversation[]> {
  const clientId = await resolveClientId(clientIdOrSlug) || clientIdOrSlug;
  const conversations = await loadConversations();
  return conversations.filter(c => c.clientId === clientId);
}

export async function getConversationsByBotId(botId: string): Promise<Conversation[]> {
  const conversations = await loadConversations();
  return conversations.filter(c => c.botId === botId);
}

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

export async function getBotSessionsByBotId(botId: string, dateRange?: { start: Date; end: Date }): Promise<BotSession[]> {
  const sessions = await loadBotSessions();
  let filtered = sessions.filter(s => s.bot_id === botId);
  
  if (dateRange) {
    filtered = filtered.filter(s => {
      const sessionDate = new Date(s.start_time);
      return sessionDate >= dateRange.start && sessionDate <= dateRange.end;
    });
  }
  
  return filtered;
}

export async function getBotSessionsByClientId(clientId: string, dateRange?: { start: Date; end: Date }): Promise<BotSession[]> {
  const sessions = await loadBotSessions();
  let filtered = sessions.filter(s => s.client_id === clientId);
  
  if (dateRange) {
    filtered = filtered.filter(s => {
      const sessionDate = new Date(s.start_time);
      return sessionDate >= dateRange.start && sessionDate <= dateRange.end;
    });
  }
  
  return filtered;
}

// Legacy compatibility - reconstructed client objects with nested bots and metrics
export async function getClientsWithBots(): Promise<any[]> {
  const clients = await loadClients();
  const bots = await loadBots();
  const metrics = await loadMetrics();

  return clients.map(client => ({
    ...client,
    bots: bots
      .filter(bot => bot.clientId === client.id)
      .map(bot => ({
        ...bot,
        metrics: {
          ...bot.metrics,
          usageByDay: metrics.botUsageByDay[bot.id] || [],
          topIntents: metrics.botIntents[bot.id] || []
        }
      })),
    metrics: {
      usageByDay: metrics.usageByDay[client.id] || [],
      topIntents: metrics.topIntents[client.id] || [],
      csat: metrics.csat[client.id] || 0
    }
  }));
}