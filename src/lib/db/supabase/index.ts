import type { SupabaseClient } from '@supabase/supabase-js';
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
  DbOperations,
  UserWithAuth,
} from '../types';
import {
  mapClient,
  mapAssistantFromMascot,
  mapWorkspace,
  mapUser,
  mapConversationFromChatSession,
  mapMessageFromChatMessage,
  mapSessionFromChatSession,
  mapAssistantSessionFromChatSession,
} from '../mappers';

interface SupabaseDbOptions {
  adminClient: SupabaseClient | null;
  label?: string;
}

function isUuid(id: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function createSupabaseDb(options: SupabaseDbOptions): DbOperations {
  const { adminClient, label = 'SUPABASE' } = options;

  const requireSupabase = () => {
    if (!adminClient) {
      throw new Error(
        `[Supabase:${label}] not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.`
      );
    }
    return adminClient;
  };

  // Client operations
  const clients: ClientOperations = {
    async getAll() {
      const supabase = requireSupabase();
      const { data, error } = await supabase.from('clients').select('*').order('name');

      if (error) throw error;
      return (data || []).map(mapClient);
    },

    async getById(id: string) {
      if (!isUuid(id)) {
        return null;
      }

      const supabase = requireSupabase();
      const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? mapClient(data) : null;
    },

    async getBySlug(slug: string) {
      const supabase = requireSupabase();
      const { data, error } = await supabase.from('clients').select('*').eq('slug', slug).single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? mapClient(data) : null;
    },

    async getByIdOrSlug(idOrSlug: string) {
      if (isUuid(idOrSlug)) {
        const byId = await this.getById(idOrSlug);
        if (byId) return byId;
      }
      return this.getBySlug(idOrSlug);
    },

    async getBySlugs(slugs: string[]) {
      if (slugs.length === 0) return [];

      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .in('slug', slugs)
        .order('name');

      if (error) throw error;
      return (data || []).map(mapClient);
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

  // Assistant operations (uses 'mascots' table in Supabase)
  const assistants: AssistantOperations = {
    async getAll() {
      const supabase = requireSupabase();
      const { data, error } = await supabase.from('mascots').select('*').order('name');

      if (error) throw error;
      return (data || []).map(mapAssistantFromMascot);
    },

    async getById(id: string) {
      const supabase = requireSupabase();

      // If UUID, search by id; otherwise search by mascot_slug
      if (isUuid(id)) {
        const { data, error } = await supabase.from('mascots').select('*').eq('id', id).single();
        if (error && error.code !== 'PGRST116') throw error;
        return data ? mapAssistantFromMascot(data) : null;
      }

      // Search by mascot_slug for non-UUID ids (mapped assistant.id uses mascot_slug)
      const { data, error } = await supabase.from('mascots').select('*').eq('mascot_slug', id).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data ? mapAssistantFromMascot(data) : null;
    },

    async getByClientId(clientId: string) {
      const supabase = requireSupabase();
      const resolvedSlug = (await clients.resolveSlug(clientId)) || clientId;

      const { data, error } = await supabase
        .from('mascots')
        .select('*')
        .eq('client_slug', resolvedSlug)
        .order('name');

      if (error) throw error;
      return (data || []).map(mapAssistantFromMascot);
    },

    async getByWorkspaceSlug(workspaceSlug: string) {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('mascots')
        .select('*')
        .eq('workspace_slug', workspaceSlug)
        .order('name');

      if (error) throw error;
      return (data || []).map(mapAssistantFromMascot);
    },
  };

  // Workspace operations
  const workspaces: WorkspaceOperations = {
    async getAll() {
      const supabase = requireSupabase();
      const { data, error } = await supabase.from('workspaces').select('*').order('name');

      if (error) throw error;
      return (data || []).map(mapWorkspace);
    },

    async getById(id: string) {
      if (!isUuid(id)) {
        return null;
      }

      const supabase = requireSupabase();
      const { data, error } = await supabase.from('workspaces').select('*').eq('id', id).single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? mapWorkspace(data) : null;
    },

    async getBySlug(slug: string) {
      const supabase = requireSupabase();
      const { data, error } = await supabase.from('workspaces').select('*').eq('slug', slug).single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? mapWorkspace(data) : null;
    },

    async getByClientId(clientId: string) {
      const supabase = requireSupabase();
      const resolvedSlug = (await clients.resolveSlug(clientId)) || clientId;

      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('client_slug', resolvedSlug)
        .order('name');

      if (error) throw error;
      return (data || []).map(mapWorkspace);
    },
  };

  // User operations
  const users: UserOperations = {
    async getAll() {
      const supabase = requireSupabase();
      const { data, error } = await supabase.from('users').select('*').order('name');

      if (error) throw error;
      return (data || []).map(mapUser);
    },

    async getById(id: string) {
      if (!isUuid(id)) {
        return null;
      }

      const supabase = requireSupabase();
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? mapUser(data) : null;
    },

    async getByIdWithAuth(id: string): Promise<UserWithAuth | null> {
      if (!isUuid(id)) {
        return null;
      }

      const supabase = requireSupabase();
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;

      const user = mapUser(data);
      return {
        ...user,
        accessibleClientSlugs: data.accessible_client_slugs ?? null,
      };
    },

    async getByClientId(clientId: string) {
      const supabase = requireSupabase();
      const resolvedSlug = (await clients.resolveSlug(clientId)) || clientId;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('client_slug', resolvedSlug)
        .order('name');

      if (error) throw error;
      return (data || []).map(mapUser);
    },

    async getByEmail(email: string): Promise<UserWithAuth | null> {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;

      const user = mapUser(data);
      return {
        ...user,
        accessibleClientSlugs: data.accessible_client_slugs ?? null,
      };
    },
  };

  // Conversation operations
  const conversations: ConversationOperations = {
    async getAll() {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('session_start', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapConversationFromChatSession);
    },

    async getById(id: string) {
      if (!isUuid(id)) {
        return null;
      }

      const supabase = requireSupabase();
      const { data, error } = await supabase.from('chat_sessions').select('*').eq('id', id).single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? mapConversationFromChatSession(data) : null;
    },

    async getByClientId(clientId: string) {
      const supabase = requireSupabase();
      const resolvedSlug = (await clients.resolveSlug(clientId)) || clientId;

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('client_slug', resolvedSlug)
        .order('session_start', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapConversationFromChatSession);
    },

    async getByAssistantId(assistantId: string) {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('mascot_slug', assistantId)
        .order('session_start', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapConversationFromChatSession);
    },
  };

  // Message operations
  const messages: MessageOperations = {
    async getByConversationId(conversationId: string) {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', conversationId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return (data || []).map(mapMessageFromChatMessage);
    },
  };

  // Session operations
  const sessions: SessionOperations = {
    async getByClientId(clientId: string) {
      const supabase = requireSupabase();
      const resolvedSlug = (await clients.resolveSlug(clientId)) || clientId;

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('client_slug', resolvedSlug)
        .order('session_start', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapSessionFromChatSession);
    },

    async getActiveByClientId(clientId: string) {
      const supabase = requireSupabase();
      const resolvedSlug = (await clients.resolveSlug(clientId)) || clientId;

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('client_slug', resolvedSlug)
        .eq('is_active', true)
        .order('session_start', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapSessionFromChatSession);
    },

    async getAssistantSessions(assistantId: string, dateRange?: DateRange) {
      const supabase = requireSupabase();
      let query = supabase.from('chat_sessions').select('*').eq('mascot_slug', assistantId);

      if (dateRange) {
        query = query
          .gte('session_start', dateRange.start.toISOString())
          .lte('session_start', dateRange.end.toISOString());
      }

      const { data, error } = await query.order('session_start', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapAssistantSessionFromChatSession);
    },

    async getAssistantSessionsByClientId(clientId: string, dateRange?: DateRange) {
      const supabase = requireSupabase();
      const resolvedSlug = (await clients.resolveSlug(clientId)) || clientId;

      let query = supabase.from('chat_sessions').select('*').eq('client_slug', resolvedSlug);

      if (dateRange) {
        query = query
          .gte('session_start', dateRange.start.toISOString())
          .lte('session_start', dateRange.end.toISOString());
      }

      const { data, error } = await query.order('session_start', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapAssistantSessionFromChatSession);
    },
  };

  // Metrics operations
  const metrics: MetricsOperations = {
    async getClientMetrics(clientId: string): Promise<ClientMetrics> {
      requireSupabase();
      const resolvedSlug = (await clients.resolveSlug(clientId)) || clientId;
      void resolvedSlug;

      // TODO: Implement actual metrics queries
      console.warn(`[Supabase:${label}] getClientMetrics not fully implemented`);

      return {
        usageByDay: [],
        topIntents: [],
      };
    },

    async getAssistantMetrics(assistantId: string): Promise<AssistantMetricsResult> {
      requireSupabase();
      void assistantId;
      // TODO: Implement actual metrics queries
      console.warn(`[Supabase:${label}] getAssistantMetrics not fully implemented`);

      return {
        usageByDay: [],
        topIntents: [],
      };
    },
  };

  return {
    clients,
    assistants,
    workspaces,
    users,
    conversations,
    messages,
    sessions,
    metrics,
  };
}

export type SupabaseDb = ReturnType<typeof createSupabaseDb>;

// Pre-built instances for convenience
import { supabaseAdminProd, supabaseAdminDemo } from './client';

export const supabaseProdDb = createSupabaseDb({ adminClient: supabaseAdminProd, label: 'PROD' });
// Default export keeps backward compatibility for prod usage
export const supabaseDb = supabaseProdDb;
