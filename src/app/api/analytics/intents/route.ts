import { NextRequest, NextResponse } from 'next/server';
import { getDbForClient } from '@/lib/db';
import * as mockDb from '@/lib/db/mock';

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

    let data;
    if (botId) {
      const db = getDbForClient(clientId);
      let metrics = await db.metrics.getAssistantMetrics(botId);
      if (!metrics.topIntents?.length) {
        metrics = await mockDb.metrics.getAssistantMetrics(botId);
      }
      data = metrics.topIntents;
    } else {
      const db = getDbForClient(clientId);
      let metrics = await db.metrics.getClientMetrics(clientId);
      if (!metrics.topIntents?.length) {
        metrics = await mockDb.metrics.getClientMetrics(clientId);
      }
      data = metrics.topIntents;
    }

    // Calculate total
    const total = data.reduce((sum, intent) => sum + intent.count, 0);

    return NextResponse.json({
      data: {
        data,
        total,
      },
    });
  } catch (error) {
    console.error('Error fetching intents analytics:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch intents analytics',
      },
      { status: 500 }
    );
  }
}
