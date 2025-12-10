/**
 * Supabase Analytics Implementation (configurable per environment)
 *
 * Creates analytics operations bound to a specific Supabase client.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ChatSession, ChatSessionAnalysis, ChatSessionWithAnalysis } from '@/types';
import type {
  ChatSessionOperations,
  ChatSessionAnalysisOperations,
  AnalyticsAggregations,
  ChatSessionFilters,
  DateRange,
  OverviewMetrics,
  SentimentBreakdown,
  CategoryBreakdown,
  LanguageBreakdown,
  DeviceBreakdown,
  CountryBreakdown,
  TimeSeriesDataPoint,
  QuestionAnalytics,
  SentimentTimeSeriesDataPoint,
  HourlyBreakdown,
  EngagementBreakdown,
  ConversationTypeBreakdown,
  AnimationStats,
} from './types';

function applyDateRange<T extends { gte: (col: string, val: string) => T; lte: (col: string, val: string) => T }>(
  query: T,
  dateRange?: DateRange,
  column = 'session_start'
): T {
  if (!dateRange) return query;
  return query.gte(column, dateRange.start.toISOString()).lte(column, dateRange.end.toISOString());
}

// Map chat_sessions row (session_start/session_end naming) to ChatSession type expected by the app
function mapChatSession(row: any): ChatSession {
  const sessionStartedAt = row.session_start || row.session_started_at || row.created_at;
  const sessionEndedAt = row.session_end ?? row.session_ended_at ?? null;
  const totalUserMessages = row.total_user_messages ?? row.user_messages ?? 0;
  const totalAssistantMessages = row.total_bot_messages ?? row.assistant_messages ?? 0;
  const totalMessages =
    row.total_messages ??
    (Number.isFinite(totalUserMessages) && Number.isFinite(totalAssistantMessages)
      ? totalUserMessages + totalAssistantMessages
      : 0);
  const status: ChatSession['status'] =
    row.end_reason === 'timeout'
      ? 'timeout'
      : row.end_reason === 'error'
        ? 'error'
        : row.is_active === false
          ? 'ended'
          : 'active';

  const durationSeconds =
    sessionStartedAt && sessionEndedAt
      ? Math.round((new Date(sessionEndedAt).getTime() - new Date(sessionStartedAt).getTime()) / 1000)
      : null;

  return {
    id: row.id,
    mascot_slug: row.mascot_slug,
    client_slug: row.client_slug ?? '',
    domain: row.domain ?? null,
    user_id: row.user_id ?? null,
    session_started_at: sessionStartedAt,
    session_ended_at: sessionEndedAt,
    first_message_at: row.first_message_at ?? null,
    last_message_at: row.last_message_at ?? null,
    ip_address: row.ip_address ?? null,
    user_agent: row.user_agent ?? null,
    visitor_ip_hash: row.ip_address ? row.ip_address.replace(/\.\d+$/, '.xxx') : null,
    visitor_country: row.country ?? null,
    visitor_city: row.city ?? null,
    visitor_region: null,
    visitor_timezone: null,
    visitor_language: null,
    device_type: row.device_type ?? null,
    browser_name: row.browser ?? null,
    browser_version: null,
    os_name: row.os ?? null,
    os_version: null,
    is_mobile: row.device_type ? row.device_type.toLowerCase() === 'mobile' : false,
    screen_width: null,
    screen_height: null,
    widget_version: row.widget_version ?? null,
    referrer_url: row.referrer_url ?? null,
    referrer_domain: null,
    landing_page_url: row.page_url ?? null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    total_messages: totalMessages,
    user_messages: totalUserMessages,
    assistant_messages: totalAssistantMessages,
    total_tokens: row.total_tokens ?? 0,
    input_tokens: row.total_prompt_tokens ?? row.input_tokens ?? 0,
    output_tokens: row.total_completion_tokens ?? row.output_tokens ?? 0,
    total_cost_usd: row.total_cost_usd ?? null,
    total_cost_eur: row.total_cost_eur ?? 0,
    average_response_time_ms: row.average_response_time_ms ?? null,
    session_duration_seconds: durationSeconds,
    status,
    easter_eggs_triggered: row.easter_eggs_triggered ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
    glb_source: row.glb_source ?? null,
    glb_transfer_size: row.glb_transfer_size ?? null,
    glb_encoded_body_size: row.glb_encoded_body_size ?? null,
    glb_response_end: row.glb_response_end ?? null,
    glb_url: row.glb_url ?? null,
    full_transcript: row.full_transcript ?? null,
  };
}

function mapChatSessionAnalysis(row: any): ChatSessionAnalysis {
  const promptTokens = row.analytics_total_prompt_tokens ?? null;
  const completionTokens = row.analytics_total_completion_tokens ?? null;
  const totalTokens =
    row.analytics_total_tokens ??
    (promptTokens != null && completionTokens != null ? promptTokens + completionTokens : promptTokens ?? completionTokens);

  return {
    ...row,
    analytics_total_tokens: totalTokens ?? null,
    analytics_total_cost_usd: row.analytics_total_cost_usd ?? null,
  } as ChatSessionAnalysis;
}

export function createSupabaseAnalytics(adminClient: SupabaseClient | null, label = 'SUPABASE') {
  const requireSupabase = () => {
    if (!adminClient) {
      throw new Error(
        `[Analytics:${label}] Supabase not configured. Set ${label === 'DEMO' ? 'DEMO_SUPABASE_URL/DEMO_SUPABASE_SERVICE_ROLE_KEY' : 'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY'}.`
      );
    }
    // Cast to any to avoid Postgrest type frictions in analytics queries
    return adminClient as any;
  };

  // Chat session operations
  const chatSessions: ChatSessionOperations = {
    async getByBotId(botId: string, filters?: ChatSessionFilters): Promise<ChatSession[]> {
      const supabase = requireSupabase();

      let query = supabase.from('chat_sessions').select('*').eq('mascot_slug', botId).order('session_start', { ascending: false });

      if (filters?.dateRange) {
        query = query
          .gte('session_start', filters.dateRange.start.toISOString())
          .lte('session_start', filters.dateRange.end.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(mapChatSession);
    },

    async getByClientId(clientId: string, filters?: ChatSessionFilters): Promise<ChatSession[]> {
      const supabase = requireSupabase();

      let query = supabase.from('chat_sessions').select('*').eq('client_slug', clientId).order('session_start', { ascending: false });

      if (filters?.dateRange) {
        query = query
          .gte('session_start', filters.dateRange.start.toISOString())
          .lte('session_start', filters.dateRange.end.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(mapChatSession);
    },

    async getById(sessionId: string): Promise<ChatSession | null> {
      const supabase = requireSupabase();

      const { data, error } = await supabase.from('chat_sessions').select('*').eq('id', sessionId).single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? mapChatSession(data) : null;
    },

    async getWithAnalysisByBotId(botId: string, filters?: ChatSessionFilters): Promise<ChatSessionWithAnalysis[]> {
      const supabase = requireSupabase();

      let query = supabase
        .from('chat_sessions')
        .select('*, chat_session_analysis(*)')
        .eq('mascot_slug', botId)
        .order('session_start', { ascending: false });

      if (filters?.dateRange) {
        query = applyDateRange(query, filters.dateRange, 'session_start');
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(row => ({
        ...mapChatSession(row),
        analysis: row.chat_session_analysis ? mapChatSessionAnalysis(row.chat_session_analysis) : null,
      }));
    },

    async getWithAnalysisByClientId(clientId: string, filters?: ChatSessionFilters): Promise<ChatSessionWithAnalysis[]> {
      const supabase = requireSupabase();

      let query = supabase
        .from('chat_sessions')
        .select('*, chat_session_analysis(*)')
        .eq('client_slug', clientId)
        .order('session_start', { ascending: false });

      if (filters?.dateRange) {
        query = applyDateRange(query, filters.dateRange, 'session_start');
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(row => ({
        ...mapChatSession(row),
        analysis: row.chat_session_analysis ? mapChatSessionAnalysis(row.chat_session_analysis) : null,
      }));
    },
  };

  // Chat session analysis operations
  const chatSessionAnalysis: ChatSessionAnalysisOperations = {
    async getBySessionId(sessionId: string): Promise<ChatSessionAnalysis | null> {
      const supabase = requireSupabase();

      const { data, error } = await supabase.from('chat_session_analysis').select('*').eq('session_id', sessionId).single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? mapChatSessionAnalysis(data) : null;
    },

    async getByBotId(botId: string, filters?: ChatSessionFilters): Promise<ChatSessionAnalysis[]> {
      const supabase = requireSupabase();

      let query = supabase
        .from('chat_session_analysis')
        .eq('mascot_slug', botId)
        .order('session_start', { ascending: false });

      if (filters?.dateRange) {
        query = applyDateRange(query, filters.dateRange, 'session_start');
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(mapChatSessionAnalysis);
    },

    async getByClientId(clientId: string, filters?: ChatSessionFilters): Promise<ChatSessionAnalysis[]> {
      const supabase = requireSupabase();

      let query = supabase
        .from('chat_session_analysis')
        .select('*')
        .eq('client_slug', clientId)
        .order('session_start', { ascending: false });

      if (filters?.dateRange) {
        query = applyDateRange(query, filters.dateRange, 'session_start');
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(mapChatSessionAnalysis);
    },
  };

  // Aggregations (placeholder implementations) - mirror mock shape but routed through Supabase client
  const aggregations: AnalyticsAggregations = {
    async getOverviewByBotId(botId: string, _dateRange?: DateRange): Promise<OverviewMetrics> {
      requireSupabase();
      console.warn(`[Analytics:${label}] getOverviewByBotId not fully implemented for bot ${botId}`);
      return {
        totalSessions: 0,
        totalMessages: 0,
        totalTokens: 0,
        totalCostEur: 0,
        averageResponseTimeMs: 0,
        averageSessionDurationSeconds: 0,
        resolutionRate: 0,
        escalationRate: 0,
      };
    },

    async getOverviewByClientId(clientId: string, _dateRange?: DateRange): Promise<OverviewMetrics> {
      requireSupabase();
      console.warn(`[Analytics:${label}] getOverviewByClientId not fully implemented for client ${clientId}`);
      return {
        totalSessions: 0,
        totalMessages: 0,
        totalTokens: 0,
        totalCostEur: 0,
        averageResponseTimeMs: 0,
        averageSessionDurationSeconds: 0,
        resolutionRate: 0,
        escalationRate: 0,
      };
    },

    async getSentimentByBotId(botId: string, _dateRange?: DateRange): Promise<SentimentBreakdown> {
      requireSupabase();
      console.warn(`[Analytics:${label}] getSentimentByBotId not fully implemented for bot ${botId}`);
      return { positive: 0, neutral: 0, negative: 0 };
    },

    async getCategoriesByBotId(botId: string, _dateRange?: DateRange): Promise<CategoryBreakdown[]> {
      requireSupabase();
      console.warn(`[Analytics:${label}] getCategoriesByBotId not fully implemented for bot ${botId}`);
      return [];
    },

    async getLanguagesByBotId(botId: string, _dateRange?: DateRange): Promise<LanguageBreakdown[]> {
      requireSupabase();
      console.warn(`[Analytics:${label}] getLanguagesByBotId not fully implemented for bot ${botId}`);
      return [];
    },

    async getDevicesByBotId(botId: string, _dateRange?: DateRange): Promise<DeviceBreakdown[]> {
      requireSupabase();
      console.warn(`[Analytics:${label}] getDevicesByBotId not fully implemented for bot ${botId}`);
      return [];
    },

    async getCountriesByBotId(botId: string, _dateRange?: DateRange): Promise<CountryBreakdown[]> {
      requireSupabase();
      console.warn(`[Analytics:${label}] getCountriesByBotId not fully implemented for bot ${botId}`);
      return [];
    },

    async getTimeSeriesByBotId(botId: string, _dateRange?: DateRange): Promise<TimeSeriesDataPoint[]> {
      requireSupabase();
      console.warn(`[Analytics:${label}] getTimeSeriesByBotId not fully implemented for bot ${botId}`);
      return [];
    },

    async getQuestionsByBotId(botId: string, _dateRange?: DateRange): Promise<QuestionAnalytics[]> {
      requireSupabase();
      console.warn(`[Analytics:${label}] getQuestionsByBotId not fully implemented for bot ${botId}`);
      return [];
    },

    async getUnansweredQuestionsByBotId(botId: string, _dateRange?: DateRange): Promise<QuestionAnalytics[]> {
      requireSupabase();
      console.warn(`[Analytics:${label}] getUnansweredQuestionsByBotId not fully implemented for bot ${botId}`);
      return [];
    },

    async getSentimentTimeSeriesByBotId(botId: string, _dateRange?: DateRange): Promise<SentimentTimeSeriesDataPoint[]> {
      requireSupabase();
      console.warn(`[Analytics:${label}] getSentimentTimeSeriesByBotId not fully implemented for bot ${botId}`);
      return [];
    },

    async getHourlyBreakdownByBotId(botId: string, _dateRange?: DateRange): Promise<HourlyBreakdown[]> {
      requireSupabase();
      console.warn(`[Analytics:${label}] getHourlyBreakdownByBotId not fully implemented for bot ${botId}`);
      return [];
    },

    async getEngagementByBotId(botId: string, _dateRange?: DateRange): Promise<EngagementBreakdown[]> {
      requireSupabase();
      console.warn(`[Analytics:${label}] getEngagementByBotId not fully implemented for bot ${botId}`);
      return [];
    },

    async getConversationTypesByBotId(botId: string, _dateRange?: DateRange): Promise<ConversationTypeBreakdown[]> {
      requireSupabase();
      console.warn(`[Analytics:${label}] getConversationTypesByBotId not fully implemented for bot ${botId}`);
      return [];
    },

    async getAnimationStatsByBotId(botId: string, _dateRange?: DateRange): Promise<AnimationStats> {
      requireSupabase();
      console.warn(`[Analytics:${label}] getAnimationStatsByBotId not fully implemented for bot ${botId}`);
      return {
        totalTriggers: 0,
        easterEggsTriggered: 0,
        sessionsWithEasterEggs: 0,
        totalSessions: 0,
        topAnimations: [],
        topEasterEggs: [],
        waitSequences: [],
      };
    },
  };

  return {
    chatSessions,
    analyses: chatSessionAnalysis,
    aggregations,
  };
}
