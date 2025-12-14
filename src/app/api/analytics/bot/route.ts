import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsForClient } from '@/lib/db/analytics';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const botId = searchParams.get('botId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!clientId || !botId) {
      return NextResponse.json(
        { code: 'MISSING_PARAM', message: 'clientId and botId parameters are required' },
        { status: 400 }
      );
    }

    const analytics = getAnalyticsForClient(clientId);

    // Build date range filter
    const dateRange = from && to
      ? { start: new Date(from), end: new Date(to) }
      : undefined;

    // Fetch all bot analytics in parallel
    const [
      overview,
      sentiment,
      categories,
      languages,
      countries,
      devices,
      timeSeries,
      questions,
      unansweredQuestions,
      sessions,
      sentimentTimeSeries,
      hourlyBreakdown,
      animationStats,
    ] = await Promise.all([
      analytics.aggregations.getOverviewByBotId(botId, dateRange),
      analytics.aggregations.getSentimentByBotId(botId, dateRange),
      analytics.aggregations.getCategoriesByBotId(botId, dateRange),
      analytics.aggregations.getLanguagesByBotId(botId, dateRange),
      analytics.aggregations.getCountriesByBotId(botId, dateRange),
      analytics.aggregations.getDevicesByBotId(botId, dateRange),
      analytics.aggregations.getTimeSeriesByBotId(botId, dateRange),
      analytics.aggregations.getQuestionsByBotId(botId, dateRange),
      analytics.aggregations.getUnansweredQuestionsByBotId(botId, dateRange),
      analytics.chatSessions.getWithAnalysisByBotId(botId, { dateRange }),
      analytics.aggregations.getSentimentTimeSeriesByBotId(botId, dateRange),
      analytics.aggregations.getHourlyBreakdownByBotId(botId, dateRange),
      analytics.aggregations.getAnimationStatsByBotId(botId, dateRange),
    ]);

    return NextResponse.json({
      data: {
        overview,
        sentiment,
        categories,
        languages,
        countries,
        devices,
        timeSeries,
        questions,
        unansweredQuestions,
        sessions,
        sentimentTimeSeries,
        hourlyBreakdown,
        animationStats,
      },
    });
  } catch (error) {
    console.error('Error fetching bot analytics:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to fetch bot analytics' },
      { status: 500 }
    );
  }
}
