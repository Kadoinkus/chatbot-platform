/**
 * Supabase Database Implementation
 *
 * Production database operations using Supabase.
 * Implements the same interface as the mock implementation.
 *
 * TODO: Implement each operation when wiring up Supabase
 */

import { supabaseAdmin } from './client';
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

// Helper to check if Supabase is configured
function requireSupabase() {
  if (!supabaseAdmin) {
    throw new Error(
      'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
    );
  }
  return supabaseAdmin;
}

// Client operations
export const clients: ClientOperations = {
  async getAll() {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data || null;
  },

  async getBySlug(slug: string) {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async getByIdOrSlug(idOrSlug: string) {
    // Try by id first, then by slug
    const byId = await this.getById(idOrSlug);
    if (byId) return byId;
    return this.getBySlug(idOrSlug);
  },

  async resolveId(idOrSlug: string) {
    const client = await this.getByIdOrSlug(idOrSlug);
    return client?.id || null;
  },
};

// Assistant operations (Supabase table still uses 'bots' for backward compatibility)
export const assistants: AssistantOperations = {
  async getAll() {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('bots')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('bots')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async getByClientId(clientId: string) {
    const supabase = requireSupabase();
    const resolvedId = await clients.resolveId(clientId) || clientId;

    const { data, error } = await supabase
      .from('bots')
      .select('*')
      .eq('client_slug', resolvedId)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getByWorkspaceId(workspaceId: string) {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('bots')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('name');

    if (error) throw error;
    return data || [];
  },
};

// Workspace operations
export const workspaces: WorkspaceOperations = {
  async getAll() {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async getByClientId(clientId: string) {
    const supabase = requireSupabase();
    const resolvedId = await clients.resolveId(clientId) || clientId;

    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('client_slug', resolvedId)
      .order('name');

    if (error) throw error;
    return data || [];
  },
};

// User operations
export const users: UserOperations = {
  async getAll() {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async getByClientId(clientId: string) {
    const supabase = requireSupabase();
    const resolvedId = await clients.resolveId(clientId) || clientId;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('client_slug', resolvedId)
      .order('name');

    if (error) throw error;
    return data || [];
  },
};

// Conversation operations
export const conversations: ConversationOperations = {
  async getAll() {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async getByClientId(clientId: string) {
    const supabase = requireSupabase();
    const resolvedId = await clients.resolveId(clientId) || clientId;

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('client_slug', resolvedId)
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
export const messages: MessageOperations = {
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
export const sessions: SessionOperations = {
  async getByClientId(clientId: string) {
    const supabase = requireSupabase();
    const resolvedId = await clients.resolveId(clientId) || clientId;

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('client_slug', resolvedId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getActiveByClientId(clientId: string) {
    const supabase = requireSupabase();
    const resolvedId = await clients.resolveId(clientId) || clientId;

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('client_slug', resolvedId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAssistantSessions(assistantId: string, dateRange?: DateRange) {
    const supabase = requireSupabase();
    let query = supabase
      .from('bot_sessions')
      .select('*')
      .eq('bot_id', assistantId);

    if (dateRange) {
      query = query
        .gte('start_time', dateRange.start.toISOString())
        .lte('start_time', dateRange.end.toISOString());
    }

    const { data, error } = await query.order('start_time', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAssistantSessionsByClientId(clientId: string, dateRange?: DateRange) {
    const supabase = requireSupabase();
    const resolvedId = await clients.resolveId(clientId) || clientId;

    let query = supabase
      .from('bot_sessions')
      .select('*')
      .eq('client_slug', resolvedId);

    if (dateRange) {
      query = query
        .gte('start_time', dateRange.start.toISOString())
        .lte('start_time', dateRange.end.toISOString());
    }

    const { data, error } = await query.order('start_time', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

// Metrics operations
export const metrics: MetricsOperations = {
  async getClientMetrics(clientId: string): Promise<ClientMetrics> {
    const supabase = requireSupabase();
    const resolvedId = await clients.resolveId(clientId) || clientId;

    // TODO: Implement actual metrics queries
    // This will depend on your Supabase schema for metrics
    // For now, return empty data
    console.warn('[Supabase] getClientMetrics not fully implemented');

    return {
      usageByDay: [],
      topIntents: [],
      csat: 0,
    };
  },

  async getAssistantMetrics(assistantId: string): Promise<AssistantMetricsResult> {
    // TODO: Implement actual metrics queries
    console.warn('[Supabase] getAssistantMetrics not fully implemented');

    return {
      usageByDay: [],
      topIntents: [],
    };
  },
};
