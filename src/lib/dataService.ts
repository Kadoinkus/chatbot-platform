// Re-export all domain types for convenience
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
  UsageData,
  IntentData,
} from '@/types';

// API response shape from our routes
interface ApiResponse<T> {
  data?: T;
  code?: string;
  message?: string;
}

async function apiGet<T>(url: string): Promise<T | null> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) return null;
  const json: ApiResponse<T> = await response.json();
  return json.data ?? null;
}

// Basic caching to reduce duplicate fetches during a session
const cache: Record<string, unknown> = {};
function memoize<T>(key: string, value: T) {
  cache[key] = value;
  return value;
}
function fromCache<T>(key: string): T | null {
  return (cache[key] as T) || null;
}

export async function getClients(): Promise<Client[]> {
  const cached = fromCache<Client[]>('clients');
  if (cached) return cached;
  const data = await apiGet<Client[]>('/api/clients');
  if (data) return memoize('clients', data);
  return [];
}

export async function getClientById(idOrSlug: string): Promise<Client | undefined> {
  const cachedList = fromCache<Client[]>('clients');
  if (cachedList) {
    const hit = cachedList.find(c => c.id === idOrSlug || c.slug === idOrSlug);
    if (hit) return hit;
  }

  const byId = await apiGet<Client>(`/api/clients/id/${idOrSlug}`);
  if (byId) return byId;
  const bySlug = await apiGet<Client>(`/api/clients/${idOrSlug}`);
  return bySlug ?? undefined;
}

export async function resolveClientId(idOrSlug: string): Promise<string | undefined> {
  const client = await getClientById(idOrSlug);
  return client?.id;
}

export async function getWorkspacesByClientId(clientIdOrSlug: string): Promise<Workspace[]> {
  const data = await apiGet<Workspace[]>(`/api/workspaces?clientId=${encodeURIComponent(clientIdOrSlug)}`);
  return data ?? [];
}

export async function getWorkspaceById(idOrSlug: string, clientId: string): Promise<Workspace | undefined> {
  const params = new URLSearchParams({ clientId });
  const data = await apiGet<Workspace>(`/api/workspaces/${encodeURIComponent(idOrSlug)}?${params.toString()}`);
  return data ?? undefined;
}

export async function getAssistantsByClientId(clientIdOrSlug: string): Promise<Assistant[]> {
  const data = await apiGet<Assistant[]>(`/api/assistants?clientId=${encodeURIComponent(clientIdOrSlug)}`);
  return data ?? [];
}

export async function getAssistantsByWorkspaceSlug(workspaceSlug: string, clientId: string): Promise<Assistant[]> {
  const params = new URLSearchParams({ workspaceSlug, clientId });
  const data = await apiGet<Assistant[]>(`/api/assistants?${params.toString()}`);
  return data ?? [];
}

/** @deprecated Use getAssistantsByWorkspaceSlug instead */
export const getAssistantsByWorkspaceId = getAssistantsByWorkspaceSlug;

export async function getAssistantById(id: string, clientId: string): Promise<Assistant | undefined> {
  const params = new URLSearchParams({ clientId });
  const data = await apiGet<Assistant>(`/api/assistants/${encodeURIComponent(id)}?${params.toString()}`);
  return data ?? undefined;
}

export async function getUsersByClientId(clientIdOrSlug: string): Promise<User[]> {
  const data = await apiGet<User[]>(`/api/users?clientId=${encodeURIComponent(clientIdOrSlug)}`);
  return data ?? [];
}

export async function getClientMetrics(clientIdOrSlug: string): Promise<{
  usageByDay: UsageData[];
  topIntents: IntentData[];
}> {
  const clientId = await resolveClientId(clientIdOrSlug) || clientIdOrSlug;

  const [daily, intents] = await Promise.all([
    apiGet<{ data: UsageData[] }>(`/api/analytics/daily?clientId=${encodeURIComponent(clientId)}`),
    apiGet<{ data: IntentData[] }>(`/api/analytics/intents?clientId=${encodeURIComponent(clientId)}`),
  ]);

  return {
    usageByDay: daily?.data ?? [],
    topIntents: intents?.data ?? [],
  };
}

export async function getAssistantMetrics(assistantId: string, clientId: string): Promise<{
  usageByDay: UsageData[];
  topIntents: IntentData[];
}> {
  const [daily, intents] = await Promise.all([
    apiGet<{ data: UsageData[] }>(
      `/api/analytics/daily?clientId=${encodeURIComponent(clientId)}&botId=${encodeURIComponent(assistantId)}`
    ),
    apiGet<{ data: IntentData[] }>(
      `/api/analytics/intents?clientId=${encodeURIComponent(clientId)}&botId=${encodeURIComponent(assistantId)}`
    ),
  ]);

  return {
    usageByDay: daily?.data ?? [],
    topIntents: intents?.data ?? [],
  };
}

// Legacy compatibility - reconstructed client objects with nested assistants and minimal metrics
export async function getClientsWithAssistants(): Promise<any[]> {
  const clients = await getClients();

  const assistantsByClient = await Promise.all(
    clients.map(async client => ({
      clientId: client.id,
      assistants: await getAssistantsByClientId(client.id),
    }))
  );
  const lookup = new Map(assistantsByClient.map(entry => [entry.clientId, entry.assistants]));

  return clients.map(client => ({
    ...client,
    assistants: lookup.get(client.id) || [],
    metrics: {
      usageByDay: [],
      topIntents: [],
    },
  }));
}
