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
} from '../types';

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
        `[Supabase:${label}] not configured. Set ${label === 'DEMO' ? 'DEMO_SUPABASE_URL and DEMO_SUPABASE_SERVICE_ROLE_KEY' : 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'} environment variables.`
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
      return data || [];
    },

    async getById(id: string) {
      if (!isUuid(id)) {
        return null;
      }

      const supabase = requireSupabase();
      const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },

    async getBySlug(slug: string) {
      const supabase = requireSupabase();
      const { data, error } = await supabase.from('clients').select('*').eq('slug', slug).single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },

    async getByIdOrSlug(idOrSlug: string) {
      if (isUuid(idOrSlug)) {
        const byId = await this.getById(idOrSlug);
        if (byId) return byId;
      }
      return this.getBySlug(idOrSlug);
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
      return data || [];
    },

    async getById(id: string) {
      if (!isUuid(id)) {
        return null;
      }

      const supabase = requireSupabase();
      const { data, error } = await supabase.from('mascots').select('*').eq('id', id).single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
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
      return data || [];
    },

    async getByWorkspaceId(workspaceId: string) {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('mascots')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('name');

      if (error) throw error;
      return data || [];
    },
  };

  // Workspace operations
  const workspaces: WorkspaceOperations = {
    async getAll() {
      const supabase = requireSupabase();
      const { data, error } = await supabase.from('workspaces').select('*').order('name');

      if (error) throw error;
      return data || [];
    },

    async getById(id: string) {
      if (!isUuid(id)) {
        return null;
      }

      const supabase = requireSupabase();
      const { data, error } = await supabase.from('workspaces').select('*').eq('id', id).single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
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
      return data || [];
    },
  };

  // User operations
  const users: UserOperations = {
    async getAll() {
      const supabase = requireSupabase();
      const { data, error } = await supabase.from('users').select('*').order('name');

      if (error) throw error;
      return data || [];
    },

    async getById(id: string) {
      if (!isUuid(id)) {
        return null;
      }

      const supabase = requireSupabase();
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
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
      return data || [];
    },
  };

  // Conversation operations
  const conversations: ConversationOperations = {
    async getAll() {
      const supabase = requireSupabase();
      const { data, error } = await supabase.from('conversations').select('*').order('started_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async getById(id: string) {
      if (!isUuid(id)) {
        return null;
      }

      const supabase = requireSupabase();
      const { data, error } = await supabase.from('conversations').select('*').eq('id', id).single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },

    async getByClientId(clientId: string) {
      const supabase = requireSupabase();
      const resolvedSlug = (await clients.resolveSlug(clientId)) || clientId;

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_slug', resolvedSlug)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async getByAssistantId(assistantId: string) {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('bot_id', assistantId)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  };

  // Message operations
  const messages: MessageOperations = {
    async getByConversationId(conversationId: string) {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  };

  // Session operations
  const sessions: SessionOperations = {
    async getByClientId(clientId: string) {
      const supabase = requireSupabase();
      const resolvedSlug = (await clients.resolveSlug(clientId)) || clientId;

      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('client_slug', resolvedSlug)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async getActiveByClientId(clientId: string) {
      const supabase = requireSupabase();
      const resolvedSlug = (await clients.resolveSlug(clientId)) || clientId;

      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('client_slug', resolvedSlug)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async getAssistantSessions(assistantId: string, dateRange?: DateRange) {
      const supabase = requireSupabase();
      let query = supabase.from('bot_sessions').select('*').eq('bot_id', assistantId);

      if (dateRange) {
        query = query.gte('start_time', dateRange.start.toISOString()).lte('start_time', dateRange.end.toISOString());
      }

      const { data, error } = await query.order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async getAssistantSessionsByClientId(clientId: string, dateRange?: DateRange) {
      const supabase = requireSupabase();
      const resolvedSlug = (await clients.resolveSlug(clientId)) || clientId;

      let query = supabase.from('bot_sessions').select('*').eq('client_slug', resolvedSlug);

      if (dateRange) {
        query = query.gte('start_time', dateRange.start.toISOString()).lte('start_time', dateRange.end.toISOString());
      }

      const { data, error } = await query.order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
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
export const supabaseDemoDb = createSupabaseDb({ adminClient: supabaseAdminDemo, label: 'DEMO' });
// Default export keeps backward compatibility for prod usage
export const supabaseDb = supabaseProdDb;
