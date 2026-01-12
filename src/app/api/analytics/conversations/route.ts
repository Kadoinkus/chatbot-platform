import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsForClient } from '@/lib/db/analytics';
import { enforceClientAccess } from '@/lib/api-auth';
import { redactChatSessions, shouldRedactRole } from '@/lib/redaction';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, from, to, assistantIds } = body as {
      clientId?: string;
      from?: string;
      to?: string;
      assistantIds?: string[];
    };

    if (!clientId) {
      return NextResponse.json({ code: 'MISSING_PARAM', message: 'clientId is required' }, { status: 400 });
    }

    const access = await enforceClientAccess(clientId);
    if ('response' in access) {
      return access.response;
    }

    const analytics = getAnalyticsForClient(clientId);
    const dateRange = from && to ? { start: new Date(from), end: new Date(to) } : undefined;

    let sessions = await analytics.chatSessions.getWithAnalysisByClientId(clientId, { dateRange });

    if (assistantIds && assistantIds.length > 0 && !assistantIds.includes('all')) {
      const set = new Set(assistantIds);
      sessions = sessions.filter((s) => set.has(s.mascot_slug));
    }

    // Hard filter to ensure client scoping even if upstream data contains other client_slug
    sessions = sessions.filter((s: any) => (s.client_slug || '').toLowerCase() === clientId.toLowerCase());

    const shouldRedact = shouldRedactRole(access.session.role);
    if (shouldRedact) {
      sessions = redactChatSessions(sessions);
    }

    return NextResponse.json({ data: sessions });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
