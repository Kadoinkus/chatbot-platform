import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsForClient } from '@/lib/db/analytics';
import { enforceClientAccess } from '@/lib/api-auth';
import { redactChatSessions, shouldRedactRole } from '@/lib/redaction';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const botId = searchParams.get('botId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!clientId) {
      return NextResponse.json(
        { code: 'MISSING_PARAM', message: 'clientId parameter is required' },
        { status: 400 }
      );
    }

    const access = await enforceClientAccess(clientId);
    if ('response' in access) {
      return access.response;
    }

    const analytics = getAnalyticsForClient(clientId);

    // Build date range filter
    const dateRange = from && to
      ? { start: new Date(from), end: new Date(to) }
      : undefined;

    let sessions;
    if (botId) {
      sessions = await analytics.chatSessions.getWithAnalysisByBotId(botId, { dateRange });
    } else {
      sessions = await analytics.chatSessions.getWithAnalysisByClientId(clientId, { dateRange });
    }

    const shouldRedact = shouldRedactRole(access.session.role);
    const redactedSessions = shouldRedact ? redactChatSessions(sessions) : sessions;

    return NextResponse.json({ data: redactedSessions });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to fetch chat sessions' },
      { status: 500 }
    );
  }
}
