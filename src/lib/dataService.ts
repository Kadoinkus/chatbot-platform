// Data types
export type Palette = { primary: string; primaryDark: string; accent: string; };

export type BotMetrics = {
  responseTime: number;
  resolutionRate: number;
  csat: number;
};

export type PlanType = 'starter' | 'growth' | 'premium' | 'enterprise';

export type Workspace = {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  plan: PlanType;
  // Bundle loads (expensive 3D avatar rendering)
  bundleLoads: {
    limit: number;
    used: number;
    remaining: number;
  };
  // Messages (cheaper OpenAI costs)
  messages: {
    limit: number;
    used: number;
    remaining: number;
  };
  // API calls
  apiCalls: {
    limit: number;
    used: number;
    remaining: number;
  };
  walletCredits: number;
  overageRates: {
    bundleLoads: number; // per bundle load
    messages: number;    // per message
    apiCalls: number;    // per API call
  };
  status: 'active' | 'suspended' | 'trial';
  createdAt: string;
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  nextBillingDate: string;
  monthlyFee: number;
};

export type Bot = {
  id: string;
  clientId: string;
  workspaceId: string;
  name: string;
  image: string;
  status: 'Live' | 'Paused' | 'Needs finalization';
  conversations: number;
  description: string;
  metrics: BotMetrics;
};

export type Client = {
  id: string;
  name: string;
  slug: string;
  palette: Palette;
  login: { email: string; password: string };
  defaultWorkspaceId?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'agent' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  avatar: string;
  lastActive: string;
  conversationsHandled: number;
  joinedDate: string;
  phone?: string;
  clientId: string;
};

export type UsageData = {
  date: string;
  conversations: number;
  resolved: number;
};

export type IntentData = {
  intent: string;
  count: number;
};

export type MetricsData = {
  usageByDay: Record<string, UsageData[]>;
  botUsageByDay: Record<string, UsageData[]>;
  topIntents: Record<string, IntentData[]>;
  botIntents: Record<string, IntentData[]>;
  csat: Record<string, number>;
};

export type Conversation = {
  id: string;
  botId: string;
  clientId: string;
  userId: string;
  userName: string;
  status: 'active' | 'resolved' | 'escalated';
  startedAt: string;
  endedAt?: string;
  messages: number;
  satisfaction?: number;
  intent: string;
  channel: 'webchat' | 'whatsapp' | 'facebook' | 'telegram';
  preview: string;
};

export type BotSession = {
  session_id: string;
  bot_id: string;
  client_id: string;
  start_time: string;
  end_time: string;
  ip_address: string;
  country: string;
  language: string;
  messages_sent: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  escalated: 'Yes' | 'No';
  forwarded_hr: 'Yes' | 'No';
  full_transcript: string;
  avg_response_time: number;
  tokens: number;
  tokens_eur: number;
  category: string;
  questions: string[];
  user_rating: number;
  summary: string;
  // Enterprise analytics fields
  intent_confidence: number;
  resolution_type: 'self_service' | 'escalated' | 'partial' | 'unresolved';
  completion_status: 'completed' | 'incomplete' | 'escalated' | 'partial';
  user_type: 'new' | 'returning' | 'existing';
  channel: 'webchat' | 'whatsapp' | 'facebook' | 'telegram';
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  session_steps: number;
  goal_achieved: boolean;
  error_occurred: boolean;
  bot_handoff: boolean;
  human_cost_equivalent: number;
  automation_saving: number;
};

export type Session = {
  id: string;
  userId: string;
  userName: string;
  clientId: string;
  startedAt: string;
  endedAt?: string;
  lastActivity: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  status: 'active' | 'idle' | 'ended';
  actions: Array<{
    type: string;
    timestamp: string;
    [key: string]: any;
  }>;
};

export type Message = {
  id: string;
  conversationId: string;
  sender: 'user' | 'bot' | 'agent';
  senderName: string;
  content: string;
  timestamp: string;
};

// Data loading functions
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

export async function getClientById(id: string): Promise<Client | undefined> {
  const clients = await loadClients();
  return clients.find(c => c.id === id);
}

export async function getBotsByClientId(clientId: string): Promise<Bot[]> {
  const bots = await loadBots();
  return bots.filter(b => b.clientId === clientId);
}

export async function getBotsByWorkspaceId(workspaceId: string): Promise<Bot[]> {
  const bots = await loadBots();
  return bots.filter(b => b.workspaceId === workspaceId);
}

export async function getWorkspacesByClientId(clientId: string): Promise<Workspace[]> {
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

export async function getUsersByClientId(clientId: string): Promise<User[]> {
  const users = await loadUsers();
  return users.filter(u => u.clientId === clientId);
}

export async function getClientMetrics(clientId: string): Promise<{
  usageByDay: UsageData[];
  topIntents: IntentData[];
  csat: number;
}> {
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

export async function getConversationsByClientId(clientId: string): Promise<Conversation[]> {
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

export async function getSessionsByClientId(clientId: string): Promise<Session[]> {
  const sessions = await loadSessions();
  return sessions.filter(s => s.clientId === clientId);
}

export async function getActiveSessionsByClientId(clientId: string): Promise<Session[]> {
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
    mascots: bots
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