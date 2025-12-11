/**
 * API Client Library
 *
 * Single source of truth for all API calls.
 * All UI components should consume data through this layer ONLY.
 */

import type {
  Client,
  Workspace,
  Assistant,
  User,
  Conversation,
  Message,
  AssistantSession,
  UsageData,
  IntentData,
  AuthSession,
  ApiError,
  CounterSummary,
} from '@/types';

// =============================================================================
// Base Fetch Utilities
// =============================================================================

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<{ data: T | null; error: ApiError | null }> {
    const { method = 'GET', body, headers = {} } = options;

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      credentials: 'include', // Include cookies for session
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const json = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: {
            code: json.code || `HTTP_${response.status}`,
            message: json.message || response.statusText,
            details: json.details,
          },
        };
      }

      return { data: json.data ?? json, error: null };
    } catch (err) {
      return {
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: err instanceof Error ? err.message : 'Network request failed',
        },
      };
    }
  }

  // Helper methods
  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  put<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const client = new ApiClient();

// =============================================================================
// Auth API
// =============================================================================

export type LoginResponse = {
  session: AuthSession;
  client: Client;
};

export type SessionResponse = {
  session: AuthSession | null;
  client: Client | null;
};

export const auth = {
  /**
   * Login with email and password
   */
  login: (email: string, password: string) =>
    client.post<LoginResponse>('/auth/login', { email, password }),

  /**
   * Logout current session
   */
  logout: () => client.post<{ success: boolean }>('/auth/logout'),

  /**
   * Get current session
   */
  getSession: () => client.get<SessionResponse>('/auth/session'),
};

// =============================================================================
// Clients API
// =============================================================================

export type ClientListItem = Pick<Client, 'id' | 'name' | 'slug'> & {
  email: string;
};

export const clients = {
  /**
   * Get all clients (for login dropdown)
   */
  list: () => client.get<ClientListItem[]>('/clients'),

  /**
   * Get client by slug
   */
  getBySlug: (slug: string) => client.get<Client>(`/clients/${slug}`),

  /**
   * Get client by ID
   */
  getById: (id: string) => client.get<Client>(`/clients/id/${id}`),
};

// =============================================================================
// Workspaces API
// =============================================================================

export type WorkspaceWithAssistants = Workspace & {
  assistants: Pick<Assistant, 'id' | 'name' | 'status' | 'conversations'>[];
};

export const workspaces = {
  /**
   * List workspaces for a client
   */
  list: (clientId: string) =>
    client.get<Workspace[]>(`/workspaces?clientId=${clientId}`),

  /**
   * Get single workspace by slug
   */
  get: (workspaceSlug: string) =>
    client.get<WorkspaceWithAssistants>(`/workspaces/${workspaceSlug}`),
};

// =============================================================================
// AI Assistants API
// =============================================================================

export type AssistantListParams = {
  clientId?: string;
  workspaceSlug?: string;
};

export const assistants = {
  /**
   * List AI assistants with optional filters
   */
  list: (params: AssistantListParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.clientId) searchParams.set('clientId', params.clientId);
    if (params.workspaceSlug) searchParams.set('workspaceSlug', params.workspaceSlug);
    const query = searchParams.toString();
    return client.get<Assistant[]>(`/assistants${query ? `?${query}` : ''}`);
  },

  /**
   * Get single assistant by ID
   */
  get: (assistantId: string) => client.get<Assistant>(`/assistants/${assistantId}`),
};

// =============================================================================
// Analytics API
// =============================================================================

export type AnalyticsParams = {
  clientId: string;
  assistantId?: string;
  from?: string; // ISO date
  to?: string; // ISO date
};

export type SessionsAnalytics = {
  sessions: AssistantSession[];
  summary: {
    total: number;
    avgDuration: number;
    avgMessages: number;
    sentimentBreakdown: Record<string, number>;
    resolutionBreakdown: Record<string, number>;
  };
};

export type DailyAnalytics = {
  data: UsageData[];
  totals: {
    conversations: number;
    resolved: number;
    resolutionRate: number;
  };
};

export type IntentsAnalytics = {
  data: IntentData[];
  total: number;
};

export const analytics = {
  /**
   * Get assistant sessions with analytics
   */
  sessions: (params: AnalyticsParams) => {
    const searchParams = new URLSearchParams();
    searchParams.set('clientId', params.clientId);
    if (params.assistantId) searchParams.set('assistantId', params.assistantId);
    if (params.from) searchParams.set('from', params.from);
    if (params.to) searchParams.set('to', params.to);
    return client.get<SessionsAnalytics>(`/analytics/sessions?${searchParams}`);
  },

  /**
   * Get daily aggregated metrics
   */
  daily: (params: AnalyticsParams) => {
    const searchParams = new URLSearchParams();
    searchParams.set('clientId', params.clientId);
    if (params.assistantId) searchParams.set('assistantId', params.assistantId);
    if (params.from) searchParams.set('from', params.from);
    if (params.to) searchParams.set('to', params.to);
    return client.get<DailyAnalytics>(`/analytics/daily?${searchParams}`);
  },

  /**
   * Get top intents breakdown
   */
  intents: (params: AnalyticsParams) => {
    const searchParams = new URLSearchParams();
    searchParams.set('clientId', params.clientId);
    if (params.assistantId) searchParams.set('assistantId', params.assistantId);
    return client.get<IntentsAnalytics>(`/analytics/intents?${searchParams}`);
  },
};

// =============================================================================
// Conversations API
// =============================================================================

export type ConversationListParams = {
  clientId: string;
  assistantId?: string;
  status?: 'active' | 'resolved' | 'escalated';
  limit?: number;
  offset?: number;
};

export type ConversationWithMessages = Conversation & {
  messageList: Message[];
};

export const conversations = {
  /**
   * List conversations with filters
   */
  list: (params: ConversationListParams) => {
    const searchParams = new URLSearchParams();
    searchParams.set('clientId', params.clientId);
    if (params.assistantId) searchParams.set('assistantId', params.assistantId);
    if (params.status) searchParams.set('status', params.status);
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.offset) searchParams.set('offset', params.offset.toString());
    return client.get<Conversation[]>(`/conversations?${searchParams}`);
  },

  /**
   * Get single conversation with messages
   */
  get: (conversationId: string) =>
    client.get<ConversationWithMessages>(`/conversations/${conversationId}`),
};

// =============================================================================
// Users API
// =============================================================================

export const users = {
  /**
   * List team members for a client
   */
  list: (clientId: string) =>
    client.get<User[]>(`/users?clientId=${clientId}`),

  /**
   * Get single user
   */
  get: (userId: string) => client.get<User>(`/users/${userId}`),
};

// =============================================================================
// Counters API (Dashboard Summary)
// =============================================================================

export const counters = {
  /**
   * Get aggregated counts for dashboard
   */
  get: (clientId: string) =>
    client.get<CounterSummary>(`/counters?clientId=${clientId}`),
};

// =============================================================================
// Export unified API object
// =============================================================================

export const api = {
  auth,
  clients,
  workspaces,
  assistants,
  analytics,
  conversations,
  users,
  counters,
};

export default api;
