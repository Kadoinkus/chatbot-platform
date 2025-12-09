/**
 * Supabase Analytics Implementation
 *
 * Production analytics operations using Supabase.
 * Implements the same interface as the mock implementation.
 */

import { supabaseAdmin } from '../supabase/client';
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

// Helper to check if Supabase is configured
function requireSupabase() {
  if (!supabaseAdmin) {
    throw new Error(
      'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
    );
  }
  return supabaseAdmin;
}

// Helper to apply date range filter to query
function applyDateRange<T extends { gte: (col: string, val: string) => T; lte: (col: string, val: string) => T }>(
  query: T,
  dateRange?: DateRange,
  column = 'session_start'
): T {
  if (!dateRange) return query;
  return query
    .gte(column, dateRange.start.toISOString())
    .lte(column, dateRange.end.toISOString());
}

// Map chat_sessions row (session_start/session_end naming) to ChatSession type expected by the app
function mapChatSession(row: any): ChatSession {
  const sessionStartedAt = row.session_start || row.session_started_at || row.created_at;
  const sessionEndedAt = row.session_end ?? row.session_ended_at ?? null;
  const totalUserMessages = row.total_user_messages ?? row.user_messages ?? 0;
  const totalAssistantMessages = row.total_bot_messages ?? row.assistant_messages ?? 0;
  const totalMessages =
    row.total_messages ?? (Number.isFinite(totalUserMessages) && Number.isFinite(totalAssistantMessages)
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

// Chat session operations
export const chatSessions: ChatSessionOperations = {
  async getByBotId(botId: string, filters?: ChatSessionFilters): Promise<ChatSession[]> {
    const supabase = requireSupabase();

    let query = supabase
      .from('chat_sessions')
      .select('*')
      .eq('mascot_slug', botId)
      .order('session_start', { ascending: false });

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

    let query = supabase
      .from('chat_sessions')
      .select('*')
      .eq('client_slug', clientId)
      .order('session_start', { ascending: false });

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

    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? mapChatSession(data) : null;
  },

  async getWithAnalysisByBotId(
    botId: string,
    filters?: ChatSessionFilters
  ): Promise<ChatSessionWithAnalysis[]> {
    const supabase = requireSupabase();

    let query = supabase
      .from('chat_sessions')
      .select(`
        *,
        analysis:chat_session_analyses(*)
      `)
      .eq('mascot_slug', botId)
      .order('session_start', { ascending: false });

    if (filters?.dateRange) {
      query = query
        .gte('session_start', filters.dateRange.start.toISOString())
        .lte('session_start', filters.dateRange.end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    // Transform the nested analysis array to single object
    return (data || []).map((row: any) => ({
      ...mapChatSession(row),
      analysis: row.analysis?.[0] ? mapChatSessionAnalysis(row.analysis[0]) : null,
    }));
  },

  async getWithAnalysisByClientId(
    clientId: string,
    filters?: ChatSessionFilters
  ): Promise<ChatSessionWithAnalysis[]> {
    const supabase = requireSupabase();

    let query = supabase
      .from('chat_sessions')
      .select(`
        *,
        analysis:chat_session_analyses(*)
      `)
      .eq('client_slug', clientId)
      .order('session_start', { ascending: false });

    if (filters?.dateRange) {
      query = query
        .gte('session_start', filters.dateRange.start.toISOString())
        .lte('session_start', filters.dateRange.end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((row: any) => ({
      ...mapChatSession(row),
      analysis: row.analysis?.[0] ? mapChatSessionAnalysis(row.analysis[0]) : null,
    }));
  },
};

// Chat session analysis operations
export const analyses: ChatSessionAnalysisOperations = {
  async getBySessionId(sessionId: string): Promise<ChatSessionAnalysis | null> {
    const supabase = requireSupabase();

    const { data, error } = await supabase
      .from('chat_session_analyses')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? mapChatSessionAnalysis(data) : null;
  },

  async getByBotId(botId: string, filters?: ChatSessionFilters): Promise<ChatSessionAnalysis[]> {
    const supabase = requireSupabase();

    let query = supabase
      .from('chat_session_analyses')
      .select('*')
      .eq('mascot_slug', botId)
      .order('created_at', { ascending: false });

    if (filters?.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start.toISOString())
        .lte('created_at', filters.dateRange.end.toISOString());
    }

    if (filters?.sentiment) {
      query = query.eq('sentiment', filters.sentiment);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.resolution) {
      query = query.eq('resolution_status', filters.resolution);
    }

    if (filters?.escalated !== undefined) {
      query = query.eq('escalated', filters.escalated);
    }

    if (filters?.language) {
      query = query.eq('language', filters.language);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapChatSessionAnalysis);
  },

  async getByClientId(clientId: string, filters?: ChatSessionFilters): Promise<ChatSessionAnalysis[]> {
    const supabase = requireSupabase();

    // First get all session IDs for this client
    let sessionQuery = supabase
      .from('chat_sessions')
      .select('id')
      .eq('client_slug', clientId);

    if (filters?.dateRange) {
      sessionQuery = sessionQuery
        .gte('session_start', filters.dateRange.start.toISOString())
        .lte('session_start', filters.dateRange.end.toISOString());
    }

    const { data: sessions, error: sessionsError } = await sessionQuery;
    if (sessionsError) throw sessionsError;

    const sessionIds = (sessions || []).map(s => s.id);
    if (sessionIds.length === 0) return [];

    // Then get analyses for those sessions
    let analysisQuery = supabase
      .from('chat_session_analyses')
      .select('*')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false });

    if (filters?.sentiment) {
      analysisQuery = analysisQuery.eq('sentiment', filters.sentiment);
    }

    if (filters?.category) {
      analysisQuery = analysisQuery.eq('category', filters.category);
    }

    if (filters?.resolution) {
      analysisQuery = analysisQuery.eq('resolution_status', filters.resolution);
    }

    if (filters?.escalated !== undefined) {
      analysisQuery = analysisQuery.eq('escalated', filters.escalated);
    }

    if (filters?.language) {
      analysisQuery = analysisQuery.eq('language', filters.language);
    }

    const { data, error } = await analysisQuery;
    if (error) throw error;
    return (data || []).map(mapChatSessionAnalysis);
  },
};

// Aggregated analytics operations
export const aggregations: AnalyticsAggregations = {
  async getOverviewByBotId(botId: string, dateRange?: DateRange): Promise<OverviewMetrics> {
    const supabase = requireSupabase();

    // Get session aggregates
    let sessionQuery = supabase
      .from('chat_sessions')
      .select('*')
      .eq('mascot_slug', botId);

    if (dateRange) {
      sessionQuery = sessionQuery
        .gte('session_start', dateRange.start.toISOString())
        .lte('session_start', dateRange.end.toISOString());
    }

    const { data: sessions, error: sessionError } = await sessionQuery;
    if (sessionError) throw sessionError;
    const mappedSessions = (sessions || []).map(mapChatSession);

    // Get analysis aggregates
    let analysisQuery = supabase
      .from('chat_session_analyses')
      .select('resolution_status, escalated')
      .eq('mascot_slug', botId);

    if (dateRange) {
      analysisQuery = analysisQuery
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
    }

    const { data: analysesData, error: analysisError } = await analysisQuery;
    if (analysisError) throw analysisError;

    const totalSessions = mappedSessions.length;
    const totalMessages = mappedSessions.reduce((sum, s) => sum + (s.total_messages || 0), 0);
    const totalTokens = mappedSessions.reduce((sum, s) => sum + (s.total_tokens || 0), 0);
    const totalCostEur = mappedSessions.reduce((sum, s) => sum + (s.total_cost_eur || 0), 0);

    const validResponseTimes = mappedSessions.filter(s => s.average_response_time_ms != null);
    const averageResponseTimeMs = validResponseTimes.length > 0
      ? validResponseTimes.reduce((sum, s) => sum + (s.average_response_time_ms || 0), 0) / validResponseTimes.length
      : 0;

    const validDurations = mappedSessions.filter(s => s.session_duration_seconds != null);
    const averageSessionDurationSeconds = validDurations.length > 0
      ? validDurations.reduce((sum, s) => sum + (s.session_duration_seconds || 0), 0) / validDurations.length
      : 0;

    const resolved = analysesData?.filter(a => a.resolution_status === 'resolved').length || 0;
    const resolutionRate = totalSessions > 0 ? (resolved / totalSessions) * 100 : 0;

    const escalated = analysesData?.filter(a => a.escalated).length || 0;
    const escalationRate = totalSessions > 0 ? (escalated / totalSessions) * 100 : 0;

    return {
      totalSessions,
      totalMessages,
      totalTokens,
      totalCostEur,
      averageResponseTimeMs,
      averageSessionDurationSeconds,
      resolutionRate,
      escalationRate,
    };
  },

  async getOverviewByClientId(clientId: string, dateRange?: DateRange): Promise<OverviewMetrics> {
    const supabase = requireSupabase();

    let sessionQuery = supabase
      .from('chat_sessions')
      .select('*')
      .eq('client_slug', clientId);

    if (dateRange) {
      sessionQuery = sessionQuery
        .gte('session_start', dateRange.start.toISOString())
        .lte('session_start', dateRange.end.toISOString());
    }

    const { data: sessions, error: sessionError } = await sessionQuery;
    if (sessionError) throw sessionError;
    const mappedSessions = (sessions || []).map(mapChatSession);

    // Get analysis data via session IDs
    let sessionIdsQuery = supabase
      .from('chat_sessions')
      .select('id')
      .eq('client_slug', clientId);

    if (dateRange) {
      sessionIdsQuery = sessionIdsQuery
        .gte('session_start', dateRange.start.toISOString())
        .lte('session_start', dateRange.end.toISOString());
    }

    const { data: sessionIds } = await sessionIdsQuery;
    const ids = (sessionIds || []).map(s => s.id);

    let analysesData: any[] = [];
    if (ids.length > 0) {
      const { data } = await supabase
        .from('chat_session_analyses')
        .select('resolution_status, escalated')
        .in('session_id', ids);
      analysesData = data || [];
    }

    const totalSessions = mappedSessions.length;
    const totalMessages = mappedSessions.reduce((sum, s) => sum + (s.total_messages || 0), 0);
    const totalTokens = mappedSessions.reduce((sum, s) => sum + (s.total_tokens || 0), 0);
    const totalCostEur = mappedSessions.reduce((sum, s) => sum + (s.total_cost_eur || 0), 0);

    const validResponseTimes = mappedSessions.filter(s => s.average_response_time_ms != null);
    const averageResponseTimeMs = validResponseTimes.length > 0
      ? validResponseTimes.reduce((sum, s) => sum + (s.average_response_time_ms || 0), 0) / validResponseTimes.length
      : 0;

    const validDurations = mappedSessions.filter(s => s.session_duration_seconds != null);
    const averageSessionDurationSeconds = validDurations.length > 0
      ? validDurations.reduce((sum, s) => sum + (s.session_duration_seconds || 0), 0) / validDurations.length
      : 0;

    const resolved = analysesData.filter(a => a.resolution_status === 'resolved').length;
    const resolutionRate = totalSessions > 0 ? (resolved / totalSessions) * 100 : 0;

    const escalated = analysesData.filter(a => a.escalated).length;
    const escalationRate = totalSessions > 0 ? (escalated / totalSessions) * 100 : 0;

    return {
      totalSessions,
      totalMessages,
      totalTokens,
      totalCostEur,
      averageResponseTimeMs,
      averageSessionDurationSeconds,
      resolutionRate,
      escalationRate,
    };
  },

  async getSentimentByBotId(botId: string, dateRange?: DateRange): Promise<SentimentBreakdown> {
    const supabase = requireSupabase();

    let query = supabase
      .from('chat_session_analyses')
      .select('sentiment')
      .eq('mascot_slug', botId);

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return {
      positive: (data || []).filter(a => a.sentiment === 'positive').length,
      neutral: (data || []).filter(a => a.sentiment === 'neutral').length,
      negative: (data || []).filter(a => a.sentiment === 'negative').length,
    };
  },

  async getCategoriesByBotId(botId: string, dateRange?: DateRange): Promise<CategoryBreakdown[]> {
    const supabase = requireSupabase();

    let query = supabase
      .from('chat_session_analyses')
      .select('category')
      .eq('mascot_slug', botId);

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    const total = data?.length || 0;
    const counts: Record<string, number> = {};
    (data || []).forEach(a => {
      const cat = a.category || 'Unknown';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([category, count]) => ({
        category,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  },

  async getLanguagesByBotId(botId: string, dateRange?: DateRange): Promise<LanguageBreakdown[]> {
    const supabase = requireSupabase();

    let query = supabase
      .from('chat_session_analyses')
      .select('language')
      .eq('mascot_slug', botId);

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    const total = data?.length || 0;
    const counts: Record<string, number> = {};
    (data || []).forEach(a => {
      const lang = a.language || 'Unknown';
      counts[lang] = (counts[lang] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([language, count]) => ({
        language,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  },

  async getDevicesByBotId(botId: string, dateRange?: DateRange): Promise<DeviceBreakdown[]> {
    const supabase = requireSupabase();

    let query = supabase
      .from('chat_sessions')
      .select('device_type')
      .eq('mascot_slug', botId);

    if (dateRange) {
      query = query
        .gte('session_start', dateRange.start.toISOString())
        .lte('session_start', dateRange.end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    const total = data?.length || 0;
    const counts: Record<string, number> = {};
    (data || []).forEach(s => {
      const device = s.device_type || 'Unknown';
      counts[device] = (counts[device] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([deviceType, count]) => ({
        deviceType,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  },

  async getCountriesByBotId(botId: string, dateRange?: DateRange): Promise<CountryBreakdown[]> {
    const supabase = requireSupabase();

    let query = supabase
      .from('chat_sessions')
      .select('country')
      .eq('mascot_slug', botId);

    if (dateRange) {
      query = query
        .gte('session_start', dateRange.start.toISOString())
        .lte('session_start', dateRange.end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    const total = data?.length || 0;
    const counts: Record<string, number> = {};
    (data || []).forEach(s => {
      const country = s.country || 'Unknown';
      counts[country] = (counts[country] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([country, count]) => ({
        country,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  },

  async getTimeSeriesByBotId(botId: string, dateRange?: DateRange): Promise<TimeSeriesDataPoint[]> {
    const supabase = requireSupabase();

    let query = supabase
      .from('chat_sessions')
      .select('*')
      .eq('mascot_slug', botId);

    if (dateRange) {
      query = query
        .gte('session_start', dateRange.start.toISOString())
        .lte('session_start', dateRange.end.toISOString());
    }

    const { data, error } = await query.order('session_start', { ascending: true });
    if (error) throw error;
    const sessions = (data || []).map(mapChatSession);

    // Group by date
    const byDate: Record<string, { sessions: number; messages: number; tokens: number; cost: number }> = {};

    sessions.forEach(s => {
      const date = s.session_started_at.split('T')[0];
      if (!byDate[date]) {
        byDate[date] = { sessions: 0, messages: 0, tokens: 0, cost: 0 };
      }
      byDate[date].sessions += 1;
      byDate[date].messages += s.total_messages || 0;
      byDate[date].tokens += s.total_tokens || 0;
      byDate[date].cost += s.total_cost_eur || 0;
    });

    return Object.entries(byDate)
      .map(([date, d]) => ({
        date,
        sessions: d.sessions,
        messages: d.messages,
        tokens: d.tokens,
        cost: d.cost,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  async getQuestionsByBotId(botId: string, dateRange?: DateRange): Promise<QuestionAnalytics[]> {
    const supabase = requireSupabase();

    let query = supabase
      .from('chat_session_analyses')
      .select('questions, unanswered_questions')
      .eq('mascot_slug', botId);

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    const questionCounts: Record<string, { total: number; unanswered: number }> = {};

    (data || []).forEach(a => {
      (a.questions || []).forEach((q: string) => {
        if (!questionCounts[q]) {
          questionCounts[q] = { total: 0, unanswered: 0 };
        }
        questionCounts[q].total += 1;
      });

      (a.unanswered_questions || []).forEach((q: string) => {
        if (!questionCounts[q]) {
          questionCounts[q] = { total: 0, unanswered: 0 };
        }
        questionCounts[q].unanswered += 1;
      });
    });

    return Object.entries(questionCounts)
      .map(([question, counts]) => ({
        question,
        frequency: counts.total,
        answered: counts.unanswered === 0,
      }))
      .sort((a, b) => b.frequency - a.frequency);
  },

  async getUnansweredQuestionsByBotId(botId: string, dateRange?: DateRange): Promise<QuestionAnalytics[]> {
    const supabase = requireSupabase();

    let query = supabase
      .from('chat_session_analyses')
      .select('unanswered_questions')
      .eq('mascot_slug', botId);

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    const questionCounts: Record<string, number> = {};

    (data || []).forEach(a => {
      (a.unanswered_questions || []).forEach((q: string) => {
        questionCounts[q] = (questionCounts[q] || 0) + 1;
      });
    });

    return Object.entries(questionCounts)
      .map(([question, frequency]) => ({
        question,
        frequency,
        answered: false,
      }))
      .sort((a, b) => b.frequency - a.frequency);
  },

  async getSentimentTimeSeriesByBotId(botId: string, dateRange?: DateRange): Promise<SentimentTimeSeriesDataPoint[]> {
    const supabase = requireSupabase();

    let query = supabase
      .from('chat_session_analyses')
      .select('created_at, sentiment')
      .eq('mascot_slug', botId);

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    const byDate: Record<string, { positive: number; neutral: number; negative: number }> = {};

    (data || []).forEach(a => {
      const date = a.created_at.split('T')[0];
      if (!byDate[date]) {
        byDate[date] = { positive: 0, neutral: 0, negative: 0 };
      }
      if (a.sentiment === 'positive') byDate[date].positive += 1;
      else if (a.sentiment === 'neutral') byDate[date].neutral += 1;
      else if (a.sentiment === 'negative') byDate[date].negative += 1;
    });

    return Object.entries(byDate)
      .map(([date, d]) => ({
        date,
        positive: d.positive,
        neutral: d.neutral,
        negative: d.negative,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  async getHourlyBreakdownByBotId(botId: string, dateRange?: DateRange): Promise<HourlyBreakdown[]> {
    const supabase = requireSupabase();

    let query = supabase
      .from('chat_sessions')
      .select('session_start')
      .eq('mascot_slug', botId);

    if (dateRange) {
      query = query
        .gte('session_start', dateRange.start.toISOString())
        .lte('session_start', dateRange.end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    const total = data?.length || 0;
    const hourCounts: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      hourCounts[i] = 0;
    }

    (data || []).forEach(s => {
      const hour = new Date(s.session_start).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => a.hour - b.hour);
  },

  async getEngagementByBotId(botId: string, dateRange?: DateRange): Promise<EngagementBreakdown[]> {
    const supabase = requireSupabase();

    let query = supabase
      .from('chat_session_analyses')
      .select('engagement_level')
      .eq('mascot_slug', botId);

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    const total = data?.length || 0;
    const counts = { low: 0, medium: 0, high: 0 };

    (data || []).forEach(a => {
      const level = a.engagement_level as string;
      if (level === 'low' || level === 'medium' || level === 'high') {
        counts[level] += 1;
      }
    });

    return [
      { level: 'low' as const, count: counts.low, percentage: total > 0 ? (counts.low / total) * 100 : 0 },
      { level: 'medium' as const, count: counts.medium, percentage: total > 0 ? (counts.medium / total) * 100 : 0 },
      { level: 'high' as const, count: counts.high, percentage: total > 0 ? (counts.high / total) * 100 : 0 },
    ];
  },

  async getConversationTypesByBotId(botId: string, dateRange?: DateRange): Promise<ConversationTypeBreakdown[]> {
    const supabase = requireSupabase();

    let query = supabase
      .from('chat_session_analyses')
      .select('conversation_type')
      .eq('mascot_slug', botId);

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    const total = data?.length || 0;
    const counts = { casual: 0, goal_driven: 0 };

    (data || []).forEach(a => {
      const type = a.conversation_type as string;
      if (type === 'casual') counts.casual += 1;
      else if (type === 'goal_driven') counts.goal_driven += 1;
    });

    return [
      { type: 'casual' as const, count: counts.casual, percentage: total > 0 ? (counts.casual / total) * 100 : 0 },
      { type: 'goal_driven' as const, count: counts.goal_driven, percentage: total > 0 ? (counts.goal_driven / total) * 100 : 0 },
    ];
  },

  async getAnimationStatsByBotId(botId: string, dateRange?: DateRange): Promise<AnimationStats> {
    const supabase = requireSupabase();

    // Get messages with animation data (include session_id for easter egg % calculation)
    let messagesQuery = supabase
      .from('chat_messages')
      .select('session_id, response_animation, easter_egg_animation, has_easter_egg, wait_sequence')
      .eq('mascot_slug', botId)
      .eq('author', 'bot');

    if (dateRange) {
      messagesQuery = messagesQuery
        .gte('timestamp', dateRange.start.toISOString())
        .lte('timestamp', dateRange.end.toISOString());
    }

    const { data: messagesData, error: messagesError } = await messagesQuery;
    if (messagesError) throw messagesError;

    // Count animations and track sessions with easter eggs
    const animationCounts: Record<string, number> = {};
    const easterEggCounts: Record<string, number> = {};
    const waitSequenceCounts: Record<string, number> = {};
    const allSessions = new Set<string>();
    const sessionsWithEasterEggs = new Set<string>();
    let totalTriggers = 0;
    let easterEggsTriggered = 0;

    (messagesData || []).forEach((m: { session_id?: string; response_animation?: string; easter_egg_animation?: string; has_easter_egg?: boolean; wait_sequence?: string }) => {
      // Track all unique sessions
      if (m.session_id) {
        allSessions.add(m.session_id);
      }

      if (m.response_animation) {
        animationCounts[m.response_animation] = (animationCounts[m.response_animation] || 0) + 1;
        totalTriggers += 1;
      }
      if (m.has_easter_egg && m.easter_egg_animation) {
        easterEggCounts[m.easter_egg_animation] = (easterEggCounts[m.easter_egg_animation] || 0) + 1;
        easterEggsTriggered += 1;
        // Track sessions that have easter eggs
        if (m.session_id) {
          sessionsWithEasterEggs.add(m.session_id);
        }
      }
      if (m.wait_sequence) {
        waitSequenceCounts[m.wait_sequence] = (waitSequenceCounts[m.wait_sequence] || 0) + 1;
      }
    });

    const topAnimations = Object.entries(animationCounts)
      .map(([animation, count]) => ({ animation, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topEasterEggs = Object.entries(easterEggCounts)
      .map(([animation, count]) => ({ animation, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const waitSequences = Object.entries(waitSequenceCounts)
      .map(([sequence, count]) => ({ sequence, count }))
      .sort((a, b) => a.sequence.localeCompare(b.sequence));

    return {
      totalTriggers,
      easterEggsTriggered,
      sessionsWithEasterEggs: sessionsWithEasterEggs.size,
      totalSessions: allSessions.size,
      topAnimations,
      topEasterEggs,
      waitSequences,
    };
  },
};
