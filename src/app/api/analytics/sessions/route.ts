import { NextRequest, NextResponse } from 'next/server';
import { getBotSessionsByClientId, getBotSessionsByBotId } from '@/lib/dataLoader.server';

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
        {
          code: 'MISSING_PARAM',
          message: 'clientId parameter is required',
        },
        { status: 400 }
      );
    }

    // Build date range if provided
    const dateRange = from && to
      ? { start: new Date(from), end: new Date(to) }
      : undefined;

    // Get sessions
    let sessions;
    if (botId) {
      sessions = await getBotSessionsByBotId(botId, dateRange);
    } else {
      sessions = await getBotSessionsByClientId(clientId, dateRange);
    }

    // Calculate summary statistics
    const total = sessions.length;
    const avgDuration = total > 0
      ? sessions.reduce((sum, s) => {
          const start = new Date(s.start_time).getTime();
          const end = new Date(s.end_time).getTime();
          return sum + (end - start) / 1000 / 60; // minutes
        }, 0) / total
      : 0;
    const avgMessages = total > 0
      ? sessions.reduce((sum, s) => sum + s.messages_sent, 0) / total
      : 0;

    // Sentiment breakdown
    const sentimentBreakdown = sessions.reduce((acc, s) => {
      acc[s.sentiment] = (acc[s.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Resolution breakdown
    const resolutionBreakdown = sessions.reduce((acc, s) => {
      acc[s.resolution_type] = (acc[s.resolution_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      data: {
        sessions,
        summary: {
          total,
          avgDuration: Math.round(avgDuration * 10) / 10,
          avgMessages: Math.round(avgMessages * 10) / 10,
          sentimentBreakdown,
          resolutionBreakdown,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching sessions analytics:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch sessions analytics',
      },
      { status: 500 }
    );
  }
}
