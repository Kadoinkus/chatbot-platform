import type { Assistant, ChatSessionWithAnalysis } from '@/types';
import type { AssistantWithMetrics } from '@/lib/analytics/assistantComparison';
import type {
  ConversationStats,
  ConversationsAdapterResult,
  NormalizedAssistant,
  NormalizedConversationSession,
} from './types';

function buildAssistantLookup(assistants?: Assistant[]) {
  if (!assistants || assistants.length === 0) return new Map<string, Assistant>();
  return new Map(assistants.map((assistant) => [assistant.id, assistant]));
}

function attachAssistant(
  session: ChatSessionWithAnalysis,
  assistant?: NormalizedAssistant
): NormalizedConversationSession {
  return assistant ? { ...session, assistant } : { ...session };
}

function toConversationStats(sessions: ChatSessionWithAnalysis[]): ConversationStats {
  const total = sessions.length;
  const resolved = sessions.filter((s) => s.analysis?.resolution_status === 'resolved').length;
  const avgDurationSeconds =
    total > 0 ? sessions.reduce((sum, s) => sum + (s.session_duration_seconds || 0), 0) / total : 0;

  const sentimentCounts = {
    positive: sessions.filter((s) => s.analysis?.sentiment === 'positive').length,
    neutral: sessions.filter((s) => s.analysis?.sentiment === 'neutral').length,
    negative: sessions.filter((s) => s.analysis?.sentiment === 'negative').length,
  };

  return {
    total,
    resolved,
    resolutionRate: total > 0 ? (resolved / total) * 100 : 0,
    avgDurationSeconds,
    sentimentCounts,
  };
}

/**
 * Normalize raw session list (with optional assistant catalog) into shared data.
 */
export function normalizeSessions(
  sessions: ChatSessionWithAnalysis[],
  assistants: Assistant[] = []
): ConversationsAdapterResult {
  const assistantLookup = buildAssistantLookup(assistants);

  const normalized = sessions.map((session) => {
    const assistant = assistantLookup.get(session.mascot_slug);
    const normalizedAssistant: NormalizedAssistant | undefined = assistant
      ? {
          id: assistant.id,
          name: assistant.name,
          image: assistant.image,
          workspaceSlug: assistant.workspaceSlug,
          status: assistant.status,
          clientId: assistant.clientId,
        }
      : undefined;

    return attachAssistant(session, normalizedAssistant);
  });

  return {
    sessions: normalized,
    stats: toConversationStats(sessions),
  };
}

/**
 * Normalize sessions coming from the single-assistant analytics page.
 */
export function normalizeAssistantSessions(
  assistant: Assistant | undefined,
  sessions: ChatSessionWithAnalysis[]
): ConversationsAdapterResult {
  const normalizedAssistant: NormalizedAssistant | undefined = assistant
    ? {
        id: assistant.id,
        name: assistant.name,
        image: assistant.image,
        workspaceSlug: assistant.workspaceSlug,
        status: assistant.status,
        clientId: assistant.clientId,
      }
    : undefined;

  const normalized = sessions.map((session) => attachAssistant(session, normalizedAssistant));

  return {
    sessions: normalized,
    stats: toConversationStats(sessions),
  };
}

/**
 * Normalize sessions pulled from multi-assistant comparison analytics.
 */
export function normalizeAssistantMetrics(
  metrics: AssistantWithMetrics[],
  assistants: Assistant[] = []
): ConversationsAdapterResult {
  const assistantLookup = buildAssistantLookup(assistants);

  const normalized: NormalizedConversationSession[] = metrics.flatMap((assistantMetrics) => {
    const assistant = assistantLookup.get(assistantMetrics.assistantId);
    const normalizedAssistant: NormalizedAssistant = {
      id: assistantMetrics.assistantId,
      name: assistantMetrics.assistantName,
      image: assistantMetrics.assistantImage,
      workspaceSlug: assistant?.workspaceSlug,
      status: assistant?.status || (assistantMetrics.status as Assistant['status']),
      clientId: assistantMetrics.clientId,
    };

    return assistantMetrics.sessions.map((session) => attachAssistant(session, normalizedAssistant));
  });

  return {
    sessions: normalized,
    stats: toConversationStats(normalized),
  };
}

export const calculateConversationStats = toConversationStats;
