/**
 * Mock Analytics Implementation
 *
 * Uses static JSON imports for demo accounts.
 * Implements the same interface as the Supabase implementation.
 */

import type {
  ChatSession,
  ChatSessionAnalysis,
  ChatSessionWithAnalysis,
} from '@/types';
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
  ChatMessage,
} from './types';

// Static imports of mock data
import chatSessionsData from '../../../../public/data/chat_sessions.json';
import chatSessionAnalysesData from '../../../../public/data/chat_session_analyses.json';
import chatMessagesData from '../../../../public/data/chat_messages.json';

// Type for raw JSON data (different from Supabase schema)
interface RawChatSession {
  id: string;
  mascot_id: string;
  client_id: string;
  domain?: string | null;
  widget_version?: string | null;
  session_start: string;
  session_end: string;
  last_activity?: string | null;
  first_message_at?: string | null;
  last_message_at?: string | null;
  is_active?: boolean;
  end_reason?: string | null;
  ip_address?: string | null;
  country?: string | null;
  city?: string | null;
  user_agent?: string | null;
  device_type?: string | null;
  browser?: string | null;
  os?: string | null;
  referrer_url?: string | null;
  page_url?: string | null;
  user_id?: string | null;
  total_bot_messages?: number;
  total_user_messages?: number;
  total_tokens?: number;
  total_prompt_tokens?: number;
  total_completion_tokens?: number;
  total_cost_usd?: number;
  total_cost_eur?: number;
  average_response_time_ms?: number;
  easter_eggs_triggered?: number;
  is_dev?: boolean;
  glb_source?: string | null;
  glb_transfer_size?: number;
  analysis_processed?: boolean;
  analysis_status?: string | null;
  created_at: string;
}

// Map raw JSON to Supabase-aligned type
function mapToChatSession(raw: RawChatSession): ChatSession {
  const sessionStart = new Date(raw.session_start);
  const sessionEnd = new Date(raw.session_end);
  const durationSeconds = Math.round((sessionEnd.getTime() - sessionStart.getTime()) / 1000);

  return {
    id: raw.id,
    mascot_id: raw.mascot_id,
    client_id: raw.client_id,
    session_started_at: raw.session_start,
    session_ended_at: raw.session_end,
    first_message_at: raw.first_message_at || null,
    last_message_at: raw.last_message_at || null,
    visitor_ip_hash: raw.ip_address ? raw.ip_address.replace(/\.\d+$/, '.xxx') : null,
    visitor_country: raw.country || null,
    visitor_city: raw.city || null,
    visitor_region: null,
    visitor_timezone: null,
    visitor_language: null,
    device_type: raw.device_type || null,
    browser_name: raw.browser?.split(' ')[0] || null,
    browser_version: raw.browser?.split(' ')[1] || null,
    os_name: raw.os?.split(' ')[0] || null,
    os_version: raw.os?.split(' ').slice(1).join(' ') || null,
    is_mobile: raw.device_type === 'mobile',
    screen_width: null,
    screen_height: null,
    referrer_url: raw.referrer_url || null,
    referrer_domain: raw.referrer_url ? new URL(raw.referrer_url).hostname : null,
    landing_page_url: raw.page_url || null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    total_messages: (raw.total_bot_messages || 0) + (raw.total_user_messages || 0),
    user_messages: raw.total_user_messages || 0,
    bot_messages: raw.total_bot_messages || 0,
    total_tokens: raw.total_tokens || 0,
    input_tokens: raw.total_prompt_tokens || 0,
    output_tokens: raw.total_completion_tokens || 0,
    total_cost_eur: raw.total_cost_eur || 0,
    average_response_time_ms: raw.average_response_time_ms || null,
    session_duration_seconds: durationSeconds,
    status: raw.is_active ? 'active' : 'ended',
    easter_eggs_triggered: raw.easter_eggs_triggered || 0,
    created_at: raw.created_at,
    updated_at: raw.created_at,
  };
}

// Cache for transformed data
let cachedSessions: ChatSession[] | null = null;
let cachedAnalyses: ChatSessionAnalysis[] | null = null;
let cachedMessages: ChatMessage[] | null = null;

function getChatSessions(): ChatSession[] {
  if (!cachedSessions) {
    cachedSessions = (chatSessionsData as RawChatSession[]).map(mapToChatSession);
  }
  return cachedSessions;
}

function getChatSessionAnalyses(): ChatSessionAnalysis[] {
  if (!cachedAnalyses) {
    cachedAnalyses = chatSessionAnalysesData as ChatSessionAnalysis[];
  }
  return cachedAnalyses;
}

function getChatMessages(): ChatMessage[] {
  if (!cachedMessages) {
    cachedMessages = chatMessagesData as ChatMessage[];
  }
  return cachedMessages;
}

// Helper to filter sessions by date range
function filterByDateRange<T extends { created_at?: string; session_started_at?: string }>(
  items: T[],
  dateRange?: DateRange
): T[] {
  if (!dateRange) return items;

  return items.filter(item => {
    const dateStr = item.session_started_at || item.created_at;
    if (!dateStr) return true;
    const date = new Date(dateStr);
    return date >= dateRange.start && date <= dateRange.end;
  });
}

// Helper to apply filters to chat session analyses
function applyAnalysisFilters(
  analyses: ChatSessionAnalysis[],
  filters?: ChatSessionFilters
): ChatSessionAnalysis[] {
  if (!filters) return analyses;

  let result = analyses;

  if (filters.dateRange) {
    result = filterByDateRange(result, filters.dateRange);
  }

  if (filters.sentiment) {
    result = result.filter(a => a.sentiment === filters.sentiment);
  }

  if (filters.category) {
    result = result.filter(a => a.category === filters.category);
  }

  if (filters.resolution) {
    result = result.filter(a => a.resolution_status === filters.resolution);
  }

  if (filters.escalated !== undefined) {
    result = result.filter(a => a.escalated === filters.escalated);
  }

  if (filters.language) {
    result = result.filter(a => a.language === filters.language);
  }

  return result;
}

// Chat session operations
export const chatSessions: ChatSessionOperations = {
  async getByBotId(botId: string, filters?: ChatSessionFilters): Promise<ChatSession[]> {
    let sessions = getChatSessions().filter(s => s.mascot_id === botId);
    if (filters?.dateRange) {
      sessions = filterByDateRange(sessions, filters.dateRange);
    }
    return sessions;
  },

  async getByClientId(clientId: string, filters?: ChatSessionFilters): Promise<ChatSession[]> {
    let sessions = getChatSessions().filter(s => s.client_id === clientId);
    if (filters?.dateRange) {
      sessions = filterByDateRange(sessions, filters.dateRange);
    }
    return sessions;
  },

  async getById(sessionId: string): Promise<ChatSession | null> {
    return getChatSessions().find(s => s.id === sessionId) || null;
  },

  async getWithAnalysisByBotId(
    botId: string,
    filters?: ChatSessionFilters
  ): Promise<ChatSessionWithAnalysis[]> {
    const sessions = await this.getByBotId(botId, filters);
    const analyses = getChatSessionAnalyses();

    return sessions.map(session => ({
      ...session,
      analysis: analyses.find(a => a.session_id === session.id) || null,
    }));
  },

  async getWithAnalysisByClientId(
    clientId: string,
    filters?: ChatSessionFilters
  ): Promise<ChatSessionWithAnalysis[]> {
    const sessions = await this.getByClientId(clientId, filters);
    const analyses = getChatSessionAnalyses();

    return sessions.map(session => ({
      ...session,
      analysis: analyses.find(a => a.session_id === session.id) || null,
    }));
  },
};

// Chat session analysis operations
export const analyses: ChatSessionAnalysisOperations = {
  async getBySessionId(sessionId: string): Promise<ChatSessionAnalysis | null> {
    return getChatSessionAnalyses().find(a => a.session_id === sessionId) || null;
  },

  async getByBotId(botId: string, filters?: ChatSessionFilters): Promise<ChatSessionAnalysis[]> {
    let result = getChatSessionAnalyses().filter(a => a.mascot_id === botId);
    return applyAnalysisFilters(result, filters);
  },

  async getByClientId(clientId: string, filters?: ChatSessionFilters): Promise<ChatSessionAnalysis[]> {
    // Get analyses for all sessions belonging to this client
    const sessions = getChatSessions().filter(s => s.client_id === clientId);
    const sessionIds = new Set(sessions.map(s => s.id));
    let result = getChatSessionAnalyses().filter(a => sessionIds.has(a.session_id));
    return applyAnalysisFilters(result, filters);
  },
};

// Aggregated analytics operations
export const aggregations: AnalyticsAggregations = {
  async getOverviewByBotId(botId: string, dateRange?: DateRange): Promise<OverviewMetrics> {
    const sessions = await chatSessions.getByBotId(botId, { dateRange });
    const botAnalyses = await analyses.getByBotId(botId, { dateRange });

    const totalSessions = sessions.length;
    const totalMessages = sessions.reduce((sum, s) => sum + (s.total_messages || 0), 0);
    const totalTokens = sessions.reduce((sum, s) => sum + (s.total_tokens || 0), 0);
    const totalCostEur = sessions.reduce((sum, s) => sum + (s.total_cost_eur || 0), 0);

    const validResponseTimes = sessions.filter(s => s.average_response_time_ms != null);
    const averageResponseTimeMs = validResponseTimes.length > 0
      ? validResponseTimes.reduce((sum, s) => sum + s.average_response_time_ms!, 0) / validResponseTimes.length
      : 0;

    const validDurations = sessions.filter(s => s.session_duration_seconds != null);
    const averageSessionDurationSeconds = validDurations.length > 0
      ? validDurations.reduce((sum, s) => sum + s.session_duration_seconds!, 0) / validDurations.length
      : 0;

    const resolved = botAnalyses.filter(a => a.resolution_status === 'resolved').length;
    const resolutionRate = totalSessions > 0 ? (resolved / totalSessions) * 100 : 0;

    const escalated = botAnalyses.filter(a => a.escalated).length;
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
    const sessions = await chatSessions.getByClientId(clientId, { dateRange });
    const clientAnalyses = await analyses.getByClientId(clientId, { dateRange });

    const totalSessions = sessions.length;
    const totalMessages = sessions.reduce((sum, s) => sum + (s.total_messages || 0), 0);
    const totalTokens = sessions.reduce((sum, s) => sum + (s.total_tokens || 0), 0);
    const totalCostEur = sessions.reduce((sum, s) => sum + (s.total_cost_eur || 0), 0);

    const validResponseTimes = sessions.filter(s => s.average_response_time_ms != null);
    const averageResponseTimeMs = validResponseTimes.length > 0
      ? validResponseTimes.reduce((sum, s) => sum + s.average_response_time_ms!, 0) / validResponseTimes.length
      : 0;

    const validDurations = sessions.filter(s => s.session_duration_seconds != null);
    const averageSessionDurationSeconds = validDurations.length > 0
      ? validDurations.reduce((sum, s) => sum + s.session_duration_seconds!, 0) / validDurations.length
      : 0;

    const resolved = clientAnalyses.filter(a => a.resolution_status === 'resolved').length;
    const resolutionRate = totalSessions > 0 ? (resolved / totalSessions) * 100 : 0;

    const escalated = clientAnalyses.filter(a => a.escalated).length;
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
    const botAnalyses = await analyses.getByBotId(botId, { dateRange });
    const total = botAnalyses.length;

    return {
      positive: botAnalyses.filter(a => a.sentiment === 'positive').length,
      neutral: botAnalyses.filter(a => a.sentiment === 'neutral').length,
      negative: botAnalyses.filter(a => a.sentiment === 'negative').length,
    };
  },

  async getCategoriesByBotId(botId: string, dateRange?: DateRange): Promise<CategoryBreakdown[]> {
    const botAnalyses = await analyses.getByBotId(botId, { dateRange });
    const total = botAnalyses.length;

    const categoryCounts: Record<string, number> = {};
    botAnalyses.forEach(a => {
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
    const botAnalyses = await analyses.getByBotId(botId, { dateRange });
    const total = botAnalyses.length;

    const languageCounts: Record<string, number> = {};
    botAnalyses.forEach(a => {
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
    const botSessions = await chatSessions.getByBotId(botId, { dateRange });
    const total = botSessions.length;

    const deviceCounts: Record<string, number> = {};
    botSessions.forEach(s => {
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
    const botSessions = await chatSessions.getByBotId(botId, { dateRange });
    const total = botSessions.length;

    const countryCounts: Record<string, number> = {};
    botSessions.forEach(s => {
      const country = s.visitor_country || 'Unknown';
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
    const botSessions = await chatSessions.getByBotId(botId, { dateRange });

    // Group by date
    const byDate: Record<string, { sessions: number; messages: number; tokens: number; cost: number }> = {};

    botSessions.forEach(s => {
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
    const botAnalyses = await analyses.getByBotId(botId, { dateRange });

    // Count all questions
    const questionCounts: Record<string, { total: number; unanswered: number }> = {};

    botAnalyses.forEach(a => {
      // All questions asked
      a.questions.forEach(q => {
        if (!questionCounts[q]) {
          questionCounts[q] = { total: 0, unanswered: 0 };
        }
        questionCounts[q].total += 1;
      });

      // Mark unanswered
      a.unanswered_questions.forEach(q => {
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
    const botAnalyses = await analyses.getByBotId(botId, { dateRange });

    // Count only unanswered questions
    const questionCounts: Record<string, number> = {};

    botAnalyses.forEach(a => {
      a.unanswered_questions.forEach(q => {
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
    const botAnalyses = await analyses.getByBotId(botId, { dateRange });

    // Group by date
    const byDate: Record<string, { positive: number; neutral: number; negative: number }> = {};

    botAnalyses.forEach(a => {
      const date = a.created_at.split('T')[0];
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
    const botSessions = await chatSessions.getByBotId(botId, { dateRange });
    const total = botSessions.length;

    // Count sessions by hour
    const hourCounts: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      hourCounts[i] = 0;
    }

    botSessions.forEach(s => {
      const hour = new Date(s.session_started_at).getHours();
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
    const botAnalyses = await analyses.getByBotId(botId, { dateRange });
    const total = botAnalyses.length;

    const engagementCounts = {
      low: 0,
      medium: 0,
      high: 0,
    };

    botAnalyses.forEach(a => {
      const level = (a as { engagement_level?: string }).engagement_level;
      if (level === 'low' || level === 'medium' || level === 'high') {
        engagementCounts[level] += 1;
      }
    });

    return [
      { level: 'low' as const, count: engagementCounts.low, percentage: total > 0 ? (engagementCounts.low / total) * 100 : 0 },
      { level: 'medium' as const, count: engagementCounts.medium, percentage: total > 0 ? (engagementCounts.medium / total) * 100 : 0 },
      { level: 'high' as const, count: engagementCounts.high, percentage: total > 0 ? (engagementCounts.high / total) * 100 : 0 },
    ];
  },

  async getConversationTypesByBotId(botId: string, dateRange?: DateRange): Promise<ConversationTypeBreakdown[]> {
    const botAnalyses = await analyses.getByBotId(botId, { dateRange });
    const total = botAnalyses.length;

    const typeCounts = {
      casual: 0,
      goal_driven: 0,
    };

    botAnalyses.forEach(a => {
      const type = (a as { conversation_type?: string }).conversation_type;
      if (type === 'casual') typeCounts.casual += 1;
      else if (type === 'goal_driven') typeCounts.goal_driven += 1;
    });

    return [
      { type: 'casual' as const, count: typeCounts.casual, percentage: total > 0 ? (typeCounts.casual / total) * 100 : 0 },
      { type: 'goal_driven' as const, count: typeCounts.goal_driven, percentage: total > 0 ? (typeCounts.goal_driven / total) * 100 : 0 },
    ];
  },

  async getAnimationStatsByBotId(botId: string, dateRange?: DateRange): Promise<AnimationStats> {
    const botSessions = await chatSessions.getByBotId(botId, { dateRange });
    const messages = getChatMessages().filter(m => m.mascot_id === botId);

    // Get session IDs in date range
    const sessionIds = new Set(botSessions.map(s => s.id));
    const filteredMessages = messages.filter(m => sessionIds.has(m.session_id));

    // Count animations and track sessions with easter eggs
    const animationCounts: Record<string, number> = {};
    const easterEggCounts: Record<string, number> = {};
    const waitSequenceCounts: Record<string, number> = {};
    const sessionsWithEasterEggs = new Set<string>();
    let totalTriggers = 0;
    let easterEggsTriggered = 0;

    filteredMessages.forEach(m => {
      if (m.response_animation) {
        animationCounts[m.response_animation] = (animationCounts[m.response_animation] || 0) + 1;
        totalTriggers += 1;
      }
      if (m.has_easter_egg && m.easter_egg_animation) {
        easterEggCounts[m.easter_egg_animation] = (easterEggCounts[m.easter_egg_animation] || 0) + 1;
        easterEggsTriggered += 1;
        // Track sessions that have easter eggs
        sessionsWithEasterEggs.add(m.session_id);
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
      .sort((a, b) => a.sequence.localeCompare(b.sequence)); // Sort alphabetically (a, b, c, d)

    return {
      totalTriggers,
      easterEggsTriggered,
      sessionsWithEasterEggs: sessionsWithEasterEggs.size,
      totalSessions: sessionIds.size,
      topAnimations,
      topEasterEggs,
      waitSequences,
    };
  },
};
