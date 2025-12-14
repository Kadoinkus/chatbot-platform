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
        .select('*, chat_session_analyses(*)')
        .eq('mascot_slug', botId)
        .order('session_start', { ascending: false });

      if (filters?.dateRange) {
        query = applyDateRange(query, filters.dateRange, 'session_start');
      }

      const { data, error } = await query;

      // Debug logging
      console.log(`[Analytics:${label}] getWithAnalysisByBotId:`, {
        botId,
        dateRange: filters?.dateRange ? {
          start: filters.dateRange.start.toISOString(),
          end: filters.dateRange.end.toISOString()
        } : null,
        resultCount: data?.length || 0,
        error: error?.message || null,
      });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        ...mapChatSession(row),
        analysis: row.chat_session_analyses ? mapChatSessionAnalysis(row.chat_session_analyses) : null,
      }));
    },

    async getWithAnalysisByClientId(clientId: string, filters?: ChatSessionFilters): Promise<ChatSessionWithAnalysis[]> {
      const supabase = requireSupabase();

      let query = supabase
        .from('chat_sessions')
        .select('*, chat_session_analyses(*)')
        .eq('client_slug', clientId)
        .order('session_start', { ascending: false });

      if (filters?.dateRange) {
        query = applyDateRange(query, filters.dateRange, 'session_start');
      }

      const { data, error } = await query;

      // Debug logging
      console.log(`[Analytics:${label}] getWithAnalysisByClientId:`, {
        clientId,
        dateRange: filters?.dateRange ? {
          start: filters.dateRange.start.toISOString(),
          end: filters.dateRange.end.toISOString()
        } : null,
        resultCount: data?.length || 0,
        error: error?.message || null,
      });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        ...mapChatSession(row),
        analysis: row.chat_session_analyses ? mapChatSessionAnalysis(row.chat_session_analyses) : null,
      }));
    },

    async getTodayCountByBotId(botId: string): Promise<number> {
      const supabase = requireSupabase();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { count, error } = await supabase
        .from('chat_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('mascot_slug', botId)
        .gte('session_start', today.toISOString())
        .lt('session_start', tomorrow.toISOString());

      if (error) throw error;
      return count || 0;
    },

    async getTodayCountsByBotIds(botIds: string[]): Promise<Record<string, number>> {
      const supabase = requireSupabase();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result: Record<string, number> = {};
      for (const botId of botIds) {
        result[botId] = 0;
      }

      if (botIds.length === 0) return result;

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('mascot_slug')
        .in('mascot_slug', botIds)
        .gte('session_start', today.toISOString())
        .lt('session_start', tomorrow.toISOString());

      if (error) throw error;

      for (const row of data || []) {
        result[row.mascot_slug] = (result[row.mascot_slug] || 0) + 1;
      }

      return result;
    },
  };

  // Chat session analysis operations
  const chatSessionAnalysis: ChatSessionAnalysisOperations = {
    async getBySessionId(sessionId: string): Promise<ChatSessionAnalysis | null> {
      const supabase = requireSupabase();

      const { data, error } = await supabase.from('chat_session_analyses').select('*').eq('session_id', sessionId).single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? mapChatSessionAnalysis(data) : null;
    },

    async getByBotId(botId: string, filters?: ChatSessionFilters): Promise<ChatSessionAnalysis[]> {
      const supabase = requireSupabase();

      let query = supabase
        .from('chat_session_analyses')
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
        .from('chat_session_analyses')
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

  // Helper to build session query with date range and is_dev filter
  async function getSessionsFiltered(
    filterCol: 'mascot_slug' | 'client_slug',
    filterVal: string,
    dateRange?: DateRange
  ): Promise<any[]> {
    const supabase = requireSupabase();
    let query = supabase
      .from('chat_sessions')
      .select('*')
      .eq(filterCol, filterVal)
      .eq('is_dev', false);

    if (dateRange) {
      query = query
        .gte('session_start', dateRange.start.toISOString())
        .lte('session_start', dateRange.end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Helper to build analysis query with date range filter
  async function getAnalysesFiltered(
    filterCol: 'mascot_slug' | 'client_slug',
    filterVal: string,
    dateRange?: DateRange
  ): Promise<any[]> {
    const supabase = requireSupabase();
    let query = supabase
      .from('chat_session_analyses')
      .select('*')
      .eq(filterCol, filterVal);

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Helper to calculate overview metrics from sessions and analyses
  function calculateOverviewMetrics(sessions: any[], analyses: any[]): OverviewMetrics {
    const totalSessions = sessions.length;
    const totalMessages = sessions.reduce(
      (sum, s) => sum + (s.total_bot_messages || 0) + (s.total_user_messages || 0),
      0
    );
    const totalTokens = sessions.reduce((sum, s) => sum + (s.total_tokens || 0), 0);
    const totalCostEur = sessions.reduce((sum, s) => sum + (s.total_cost_eur || 0), 0);

    const validResponseTimes = sessions.filter((s) => s.average_response_time_ms != null);
    const averageResponseTimeMs =
      validResponseTimes.length > 0
        ? validResponseTimes.reduce((sum, s) => sum + s.average_response_time_ms, 0) / validResponseTimes.length
        : 0;

    // Calculate duration using session_end or last_activity as fallback
    const validDurations = sessions.filter((s) => s.session_start && (s.session_end || s.last_activity));
    const averageSessionDurationSeconds =
      validDurations.length > 0
        ? validDurations.reduce((sum, s) => {
            const start = new Date(s.session_start).getTime();
            const end = new Date(s.session_end || s.last_activity).getTime();
            return sum + (end - start) / 1000;
          }, 0) / validDurations.length
        : 0;

    const resolved = analyses.filter((a) => a.resolution_status === 'resolved').length;
    const resolutionRate = totalSessions > 0 ? (resolved / totalSessions) * 100 : 0;

    const escalated = analyses.filter((a) => a.escalated === true).length;
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
  }

  // Aggregations - real Supabase implementations
  const aggregations: AnalyticsAggregations = {
    async getOverviewByBotId(botId: string, dateRange?: DateRange): Promise<OverviewMetrics> {
      const [sessions, botAnalyses] = await Promise.all([
        getSessionsFiltered('mascot_slug', botId, dateRange),
        getAnalysesFiltered('mascot_slug', botId, dateRange),
      ]);
      return calculateOverviewMetrics(sessions, botAnalyses);
    },

    async getOverviewByClientId(clientId: string, dateRange?: DateRange): Promise<OverviewMetrics> {
      const [sessions, clientAnalyses] = await Promise.all([
        getSessionsFiltered('client_slug', clientId, dateRange),
        getAnalysesFiltered('client_slug', clientId, dateRange),
      ]);
      return calculateOverviewMetrics(sessions, clientAnalyses);
    },

    async getSentimentByBotId(botId: string, dateRange?: DateRange): Promise<SentimentBreakdown> {
      const botAnalyses = await getAnalysesFiltered('mascot_slug', botId, dateRange);
      return {
        positive: botAnalyses.filter((a) => a.sentiment === 'positive').length,
        neutral: botAnalyses.filter((a) => a.sentiment === 'neutral').length,
        negative: botAnalyses.filter((a) => a.sentiment === 'negative').length,
      };
    },

    async getCategoriesByBotId(botId: string, dateRange?: DateRange): Promise<CategoryBreakdown[]> {
      const botAnalyses = await getAnalysesFiltered('mascot_slug', botId, dateRange);
      const total = botAnalyses.length;

      const categoryCounts: Record<string, number> = {};
      botAnalyses.forEach((a) => {
        const category = a.category || 'Unknown';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });

      return Object.entries(categoryCounts)
        .map(([category, count]) => ({
          category,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);
    },

    async getLanguagesByBotId(botId: string, dateRange?: DateRange): Promise<LanguageBreakdown[]> {
      const botAnalyses = await getAnalysesFiltered('mascot_slug', botId, dateRange);
      const total = botAnalyses.length;

      const languageCounts: Record<string, number> = {};
      botAnalyses.forEach((a) => {
        const language = a.language || 'Unknown';
        languageCounts[language] = (languageCounts[language] || 0) + 1;
      });

      return Object.entries(languageCounts)
        .map(([language, count]) => ({
          language,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);
    },

    async getDevicesByBotId(botId: string, dateRange?: DateRange): Promise<DeviceBreakdown[]> {
      const sessions = await getSessionsFiltered('mascot_slug', botId, dateRange);
      const total = sessions.length;

      const deviceCounts: Record<string, number> = {};
      sessions.forEach((s) => {
        const device = s.device_type || 'Unknown';
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });

      return Object.entries(deviceCounts)
        .map(([deviceType, count]) => ({
          deviceType,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);
    },

    async getCountriesByBotId(botId: string, dateRange?: DateRange): Promise<CountryBreakdown[]> {
      const sessions = await getSessionsFiltered('mascot_slug', botId, dateRange);
      const total = sessions.length;

      const countryCounts: Record<string, number> = {};
      sessions.forEach((s) => {
        const country = s.country || 'Unknown';
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      });

      return Object.entries(countryCounts)
        .map(([country, count]) => ({
          country,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);
    },

    async getTimeSeriesByBotId(botId: string, dateRange?: DateRange): Promise<TimeSeriesDataPoint[]> {
      const sessions = await getSessionsFiltered('mascot_slug', botId, dateRange);

      // Group by date
      const byDate: Record<string, { sessions: number; messages: number; tokens: number; cost: number }> = {};

      sessions.forEach((s) => {
        const date = s.session_start ? s.session_start.split('T')[0] : null;
        if (!date) return;

        if (!byDate[date]) {
          byDate[date] = { sessions: 0, messages: 0, tokens: 0, cost: 0 };
        }
        byDate[date].sessions += 1;
        byDate[date].messages += (s.total_bot_messages || 0) + (s.total_user_messages || 0);
        byDate[date].tokens += s.total_tokens || 0;
        byDate[date].cost += s.total_cost_eur || 0;
      });

      return Object.entries(byDate)
        .map(([date, data]) => ({
          date,
          sessions: data.sessions,
          messages: data.messages,
          tokens: data.tokens,
          cost: data.cost,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    },

    async getQuestionsByBotId(botId: string, dateRange?: DateRange): Promise<QuestionAnalytics[]> {
      const botAnalyses = await getAnalysesFiltered('mascot_slug', botId, dateRange);

      // Count all questions
      const questionCounts: Record<string, { total: number; unanswered: number }> = {};

      botAnalyses.forEach((a) => {
        // All questions asked
        const questions = a.questions || [];
        questions.forEach((q: string) => {
          if (!questionCounts[q]) {
            questionCounts[q] = { total: 0, unanswered: 0 };
          }
          questionCounts[q].total += 1;
        });

        // Mark unanswered
        const unanswered = a.unanswered_questions || [];
        unanswered.forEach((q: string) => {
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
      const botAnalyses = await getAnalysesFiltered('mascot_slug', botId, dateRange);

      // Count only unanswered questions
      const questionCounts: Record<string, number> = {};

      botAnalyses.forEach((a) => {
        const unanswered = a.unanswered_questions || [];
        unanswered.forEach((q: string) => {
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
      const botAnalyses = await getAnalysesFiltered('mascot_slug', botId, dateRange);

      // Group by date
      const byDate: Record<string, { positive: number; neutral: number; negative: number }> = {};

      botAnalyses.forEach((a) => {
        const date = a.created_at ? a.created_at.split('T')[0] : null;
        if (!date) return;

        if (!byDate[date]) {
          byDate[date] = { positive: 0, neutral: 0, negative: 0 };
        }
        if (a.sentiment === 'positive') byDate[date].positive += 1;
        else if (a.sentiment === 'neutral') byDate[date].neutral += 1;
        else if (a.sentiment === 'negative') byDate[date].negative += 1;
      });

      return Object.entries(byDate)
        .map(([date, data]) => ({
          date,
          positive: data.positive,
          neutral: data.neutral,
          negative: data.negative,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    },

    async getHourlyBreakdownByBotId(botId: string, dateRange?: DateRange): Promise<HourlyBreakdown[]> {
      const sessions = await getSessionsFiltered('mascot_slug', botId, dateRange);
      const total = sessions.length;

      // Count sessions by hour (initialize all 24 hours)
      const hourCounts: Record<number, number> = {};
      for (let i = 0; i < 24; i++) {
        hourCounts[i] = 0;
      }

      sessions.forEach((s) => {
        if (!s.session_start) return;
        const hour = new Date(s.session_start).getUTCHours();
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
      const botAnalyses = await getAnalysesFiltered('mascot_slug', botId, dateRange);
      const total = botAnalyses.length;

      const engagementCounts: { low: number; medium: number; high: number } = { low: 0, medium: 0, high: 0 };

      botAnalyses.forEach((a) => {
        const level = a.engagement_level as string | undefined;
        if (level === 'low') engagementCounts.low += 1;
        else if (level === 'medium') engagementCounts.medium += 1;
        else if (level === 'high') engagementCounts.high += 1;
      });

      return [
        { level: 'low' as const, count: engagementCounts.low, percentage: total > 0 ? (engagementCounts.low / total) * 100 : 0 },
        { level: 'medium' as const, count: engagementCounts.medium, percentage: total > 0 ? (engagementCounts.medium / total) * 100 : 0 },
        { level: 'high' as const, count: engagementCounts.high, percentage: total > 0 ? (engagementCounts.high / total) * 100 : 0 },
      ];
    },

    async getConversationTypesByBotId(botId: string, dateRange?: DateRange): Promise<ConversationTypeBreakdown[]> {
      const botAnalyses = await getAnalysesFiltered('mascot_slug', botId, dateRange);
      const total = botAnalyses.length;

      const typeCounts = { casual: 0, goal_driven: 0 };

      botAnalyses.forEach((a) => {
        const type = a.conversation_type;
        if (type === 'casual') typeCounts.casual += 1;
        else if (type === 'goal_driven') typeCounts.goal_driven += 1;
      });

      return [
        { type: 'casual' as const, count: typeCounts.casual, percentage: total > 0 ? (typeCounts.casual / total) * 100 : 0 },
        { type: 'goal_driven' as const, count: typeCounts.goal_driven, percentage: total > 0 ? (typeCounts.goal_driven / total) * 100 : 0 },
      ];
    },

    async getAnimationStatsByBotId(botId: string, dateRange?: DateRange): Promise<AnimationStats> {
      const supabase = requireSupabase();

      // Get sessions in date range (with is_dev filter)
      const sessions = await getSessionsFiltered('mascot_slug', botId, dateRange);
      const sessionIds = sessions.map((s) => s.id);
      const totalSessions = sessionIds.length;

      if (sessionIds.length === 0) {
        return {
          totalTriggers: 0,
          easterEggsTriggered: 0,
          sessionsWithEasterEggs: 0,
          totalSessions: 0,
          topAnimations: [],
          topEasterEggs: [],
          waitSequences: [],
        };
      }

      // Fetch messages for these sessions
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('session_id, response_animation, easter_egg_animation, wait_sequence')
        .in('session_id', sessionIds);

      if (error) throw error;

      // Count animations and track sessions with easter eggs
      const animationCounts: Record<string, number> = {};
      const easterEggCounts: Record<string, number> = {};
      const waitSequenceCounts: Record<string, number> = {};
      const sessionsWithEasterEggs = new Set<string>();
      let totalTriggers = 0;
      let easterEggsTriggered = 0;

      (messages || []).forEach((m: any) => {
        // Handle response_animation (can be string or JSONB object)
        if (m.response_animation) {
          let animationName: string | null = null;
          if (typeof m.response_animation === 'string') {
            animationName = m.response_animation;
          } else if (typeof m.response_animation === 'object' && m.response_animation.name) {
            animationName = m.response_animation.name;
          }
          if (animationName) {
            animationCounts[animationName] = (animationCounts[animationName] || 0) + 1;
            totalTriggers += 1;
          }
        }

        // Handle easter eggs
        if (m.easter_egg_animation) {
          easterEggCounts[m.easter_egg_animation] = (easterEggCounts[m.easter_egg_animation] || 0) + 1;
          easterEggsTriggered += 1;
          sessionsWithEasterEggs.add(m.session_id);
        }

        // Handle wait sequences
        if (m.wait_sequence) {
          waitSequenceCounts[m.wait_sequence] = (waitSequenceCounts[m.wait_sequence] || 0) + 1;
        }
      });

      const topAnimations = Object.entries(animationCounts)
        .map(([animation, count]) => ({ animation, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const topEasterEggs = Object.entries(easterEggCounts)
        .map(([animation, count]) => ({ animation, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const waitSequences = Object.entries(waitSequenceCounts)
        .map(([sequence, count]) => ({ sequence, count }))
        .sort((a, b) => a.sequence.localeCompare(b.sequence));

      return {
        totalTriggers,
        easterEggsTriggered,
        sessionsWithEasterEggs: sessionsWithEasterEggs.size,
        totalSessions,
        topAnimations,
        topEasterEggs,
        waitSequences,
      };
    },

    // ========== CLIENT-LEVEL AGGREGATIONS ==========

    async getSentimentByClientId(clientId: string, dateRange?: DateRange): Promise<SentimentBreakdown> {
      const clientAnalyses = await getAnalysesFiltered('client_slug', clientId, dateRange);
      return {
        positive: clientAnalyses.filter((a) => a.sentiment === 'positive').length,
        neutral: clientAnalyses.filter((a) => a.sentiment === 'neutral').length,
        negative: clientAnalyses.filter((a) => a.sentiment === 'negative').length,
      };
    },

    async getCategoriesByClientId(clientId: string, dateRange?: DateRange): Promise<CategoryBreakdown[]> {
      const clientAnalyses = await getAnalysesFiltered('client_slug', clientId, dateRange);
      const total = clientAnalyses.length;

      const categoryCounts: Record<string, number> = {};
      clientAnalyses.forEach((a) => {
        const category = a.category || 'Unknown';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });

      return Object.entries(categoryCounts)
        .map(([category, count]) => ({
          category,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);
    },

    async getLanguagesByClientId(clientId: string, dateRange?: DateRange): Promise<LanguageBreakdown[]> {
      const clientAnalyses = await getAnalysesFiltered('client_slug', clientId, dateRange);
      const total = clientAnalyses.length;

      const languageCounts: Record<string, number> = {};
      clientAnalyses.forEach((a) => {
        const language = a.language || 'Unknown';
        languageCounts[language] = (languageCounts[language] || 0) + 1;
      });

      return Object.entries(languageCounts)
        .map(([language, count]) => ({
          language,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);
    },

    async getDevicesByClientId(clientId: string, dateRange?: DateRange): Promise<DeviceBreakdown[]> {
      const sessions = await getSessionsFiltered('client_slug', clientId, dateRange);
      const total = sessions.length;

      const deviceCounts: Record<string, number> = {};
      sessions.forEach((s) => {
        const device = s.device_type || 'Unknown';
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });

      return Object.entries(deviceCounts)
        .map(([deviceType, count]) => ({
          deviceType,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);
    },

    async getCountriesByClientId(clientId: string, dateRange?: DateRange): Promise<CountryBreakdown[]> {
      const sessions = await getSessionsFiltered('client_slug', clientId, dateRange);
      const total = sessions.length;

      const countryCounts: Record<string, number> = {};
      sessions.forEach((s) => {
        const country = s.country || 'Unknown';
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      });

      return Object.entries(countryCounts)
        .map(([country, count]) => ({
          country,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);
    },

    async getTimeSeriesByClientId(clientId: string, dateRange?: DateRange): Promise<TimeSeriesDataPoint[]> {
      const sessions = await getSessionsFiltered('client_slug', clientId, dateRange);

      const byDate: Record<string, { sessions: number; messages: number; tokens: number; cost: number }> = {};

      sessions.forEach((s) => {
        const date = s.session_start ? s.session_start.split('T')[0] : null;
        if (!date) return;

        if (!byDate[date]) {
          byDate[date] = { sessions: 0, messages: 0, tokens: 0, cost: 0 };
        }
        byDate[date].sessions += 1;
        byDate[date].messages += (s.total_bot_messages || 0) + (s.total_user_messages || 0);
        byDate[date].tokens += s.total_tokens || 0;
        byDate[date].cost += s.total_cost_eur || 0;
      });

      return Object.entries(byDate)
        .map(([date, data]) => ({
          date,
          sessions: data.sessions,
          messages: data.messages,
          tokens: data.tokens,
          cost: data.cost,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    },

    async getQuestionsByClientId(clientId: string, dateRange?: DateRange): Promise<QuestionAnalytics[]> {
      const clientAnalyses = await getAnalysesFiltered('client_slug', clientId, dateRange);

      const questionCounts: Record<string, { total: number; unanswered: number }> = {};

      clientAnalyses.forEach((a) => {
        const questions = a.questions || [];
        questions.forEach((q: string) => {
          if (!questionCounts[q]) {
            questionCounts[q] = { total: 0, unanswered: 0 };
          }
          questionCounts[q].total += 1;
        });

        const unanswered = a.unanswered_questions || [];
        unanswered.forEach((q: string) => {
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

    async getUnansweredQuestionsByClientId(clientId: string, dateRange?: DateRange): Promise<QuestionAnalytics[]> {
      const clientAnalyses = await getAnalysesFiltered('client_slug', clientId, dateRange);

      const questionCounts: Record<string, number> = {};

      clientAnalyses.forEach((a) => {
        const unanswered = a.unanswered_questions || [];
        unanswered.forEach((q: string) => {
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

    async getSentimentTimeSeriesByClientId(clientId: string, dateRange?: DateRange): Promise<SentimentTimeSeriesDataPoint[]> {
      const clientAnalyses = await getAnalysesFiltered('client_slug', clientId, dateRange);

      const byDate: Record<string, { positive: number; neutral: number; negative: number }> = {};

      clientAnalyses.forEach((a) => {
        const date = a.created_at ? a.created_at.split('T')[0] : null;
        if (!date) return;

        if (!byDate[date]) {
          byDate[date] = { positive: 0, neutral: 0, negative: 0 };
        }
        if (a.sentiment === 'positive') byDate[date].positive += 1;
        else if (a.sentiment === 'neutral') byDate[date].neutral += 1;
        else if (a.sentiment === 'negative') byDate[date].negative += 1;
      });

      return Object.entries(byDate)
        .map(([date, data]) => ({
          date,
          positive: data.positive,
          neutral: data.neutral,
          negative: data.negative,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    },

    async getHourlyBreakdownByClientId(clientId: string, dateRange?: DateRange): Promise<HourlyBreakdown[]> {
      const sessions = await getSessionsFiltered('client_slug', clientId, dateRange);
      const total = sessions.length;

      const hourCounts: Record<number, number> = {};
      for (let i = 0; i < 24; i++) {
        hourCounts[i] = 0;
      }

      sessions.forEach((s) => {
        if (!s.session_start) return;
        const hour = new Date(s.session_start).getUTCHours();
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

    async getEngagementByClientId(clientId: string, dateRange?: DateRange): Promise<EngagementBreakdown[]> {
      const clientAnalyses = await getAnalysesFiltered('client_slug', clientId, dateRange);
      const total = clientAnalyses.length;

      const engagementCounts: { low: number; medium: number; high: number } = { low: 0, medium: 0, high: 0 };

      clientAnalyses.forEach((a) => {
        const level = a.engagement_level as string | undefined;
        if (level === 'low') engagementCounts.low += 1;
        else if (level === 'medium') engagementCounts.medium += 1;
        else if (level === 'high') engagementCounts.high += 1;
      });

      return [
        { level: 'low' as const, count: engagementCounts.low, percentage: total > 0 ? (engagementCounts.low / total) * 100 : 0 },
        { level: 'medium' as const, count: engagementCounts.medium, percentage: total > 0 ? (engagementCounts.medium / total) * 100 : 0 },
        { level: 'high' as const, count: engagementCounts.high, percentage: total > 0 ? (engagementCounts.high / total) * 100 : 0 },
      ];
    },

    async getConversationTypesByClientId(clientId: string, dateRange?: DateRange): Promise<ConversationTypeBreakdown[]> {
      const clientAnalyses = await getAnalysesFiltered('client_slug', clientId, dateRange);
      const total = clientAnalyses.length;

      const typeCounts = { casual: 0, goal_driven: 0 };

      clientAnalyses.forEach((a) => {
        const type = a.conversation_type;
        if (type === 'casual') typeCounts.casual += 1;
        else if (type === 'goal_driven') typeCounts.goal_driven += 1;
      });

      return [
        { type: 'casual' as const, count: typeCounts.casual, percentage: total > 0 ? (typeCounts.casual / total) * 100 : 0 },
        { type: 'goal_driven' as const, count: typeCounts.goal_driven, percentage: total > 0 ? (typeCounts.goal_driven / total) * 100 : 0 },
      ];
    },

    async getAnimationStatsByClientId(clientId: string, dateRange?: DateRange): Promise<AnimationStats> {
      const supabase = requireSupabase();

      const sessions = await getSessionsFiltered('client_slug', clientId, dateRange);
      const sessionIds = sessions.map((s) => s.id);
      const totalSessions = sessionIds.length;

      if (sessionIds.length === 0) {
        return {
          totalTriggers: 0,
          easterEggsTriggered: 0,
          sessionsWithEasterEggs: 0,
          totalSessions: 0,
          topAnimations: [],
          topEasterEggs: [],
          waitSequences: [],
        };
      }

      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('session_id, response_animation, easter_egg_animation, wait_sequence')
        .in('session_id', sessionIds);

      if (error) throw error;

      const animationCounts: Record<string, number> = {};
      const easterEggCounts: Record<string, number> = {};
      const waitSequenceCounts: Record<string, number> = {};
      const sessionsWithEasterEggs = new Set<string>();
      let totalTriggers = 0;
      let easterEggsTriggered = 0;

      (messages || []).forEach((m: any) => {
        if (m.response_animation) {
          let animationName: string | null = null;
          if (typeof m.response_animation === 'string') {
            animationName = m.response_animation;
          } else if (typeof m.response_animation === 'object' && m.response_animation.name) {
            animationName = m.response_animation.name;
          }
          if (animationName) {
            animationCounts[animationName] = (animationCounts[animationName] || 0) + 1;
            totalTriggers += 1;
          }
        }

        if (m.easter_egg_animation) {
          easterEggCounts[m.easter_egg_animation] = (easterEggCounts[m.easter_egg_animation] || 0) + 1;
          easterEggsTriggered += 1;
          sessionsWithEasterEggs.add(m.session_id);
        }

        if (m.wait_sequence) {
          waitSequenceCounts[m.wait_sequence] = (waitSequenceCounts[m.wait_sequence] || 0) + 1;
        }
      });

      const topAnimations = Object.entries(animationCounts)
        .map(([animation, count]) => ({ animation, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const topEasterEggs = Object.entries(easterEggCounts)
        .map(([animation, count]) => ({ animation, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const waitSequences = Object.entries(waitSequenceCounts)
        .map(([sequence, count]) => ({ sequence, count }))
        .sort((a, b) => a.sequence.localeCompare(b.sequence));

      return {
        totalTriggers,
        easterEggsTriggered,
        sessionsWithEasterEggs: sessionsWithEasterEggs.size,
        totalSessions,
        topAnimations,
        topEasterEggs,
        waitSequences,
      };
    },
  };

  return {
    chatSessions,
    analyses: chatSessionAnalysis,
    aggregations,
  };
}
