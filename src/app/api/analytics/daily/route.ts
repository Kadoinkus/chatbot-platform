import { NextRequest, NextResponse } from 'next/server';
import { getDbForClient } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const botId = searchParams.get('botId');

    if (!clientId) {
      return NextResponse.json(
        {
          code: 'MISSING_PARAM',
          message: 'clientId parameter is required',
        },
        { status: 400 }
      );
    }

    const db = getDbForClient(clientId);
    const metrics = botId
      ? await db.metrics.getAssistantMetrics(botId)
      : await db.metrics.getClientMetrics(clientId);
    const data = metrics.usageByDay;

    // Calculate totals
    const totals = data.reduce(
      (acc, day) => ({
        conversations: acc.conversations + day.conversations,
        resolved: acc.resolved + day.resolved,
      }),
      { conversations: 0, resolved: 0 }
    );

    const resolutionRate = totals.conversations > 0
      ? Math.round((totals.resolved / totals.conversations) * 100)
      : 0;

    return NextResponse.json({
      data: {
        data,
        totals: {
          ...totals,
          resolutionRate,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching daily analytics:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch daily analytics',
      },
      { status: 500 }
    );
  }
}
