import { NextRequest, NextResponse } from 'next/server';
import { fetchAssistantComparisonData } from '@/lib/analytics/assistantComparison';
import { enforceClientAccess } from '@/lib/api-auth';
import { redactChatSessions, shouldRedactRole } from '@/lib/redaction';
import type { Assistant } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, assistants, dateRange } = body as {
      clientId?: string;
      assistants?: Assistant[];
      dateRange?: { start?: string; end?: string };
    };

    if (!clientId || !assistants || !Array.isArray(assistants)) {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'clientId and assistants are required' },
        { status: 400 }
      );
    }

    const range =
      dateRange?.start && dateRange?.end
        ? { start: new Date(dateRange.start), end: new Date(dateRange.end) }
        : undefined;

    const access = await enforceClientAccess(clientId);
    if ('response' in access) {
      return access.response;
    }

    const data = await fetchAssistantComparisonData(clientId, assistants, range);
    const shouldRedact = shouldRedactRole(access.session.role);
    const redactedData = shouldRedact
      ? data.map((assistant) => ({
          ...assistant,
          sessions: redactChatSessions(assistant.sessions),
        }))
      : data;

    return NextResponse.json({ data: redactedData });
  } catch (error) {
    console.error('Error in assistant comparison API:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to load assistant comparison data' },
      { status: 500 }
    );
  }
}
