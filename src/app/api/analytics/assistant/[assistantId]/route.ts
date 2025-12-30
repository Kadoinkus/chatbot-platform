import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsForClient } from '@/lib/db/analytics';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ assistantId: string }> }
) {
  try {
    const { assistantId } = await context.params;
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!clientId) {
      return NextResponse.json({ code: 'MISSING_PARAM', message: 'clientId is required' }, { status: 400 });
    }

    const analytics = getAnalyticsForClient(clientId);
    const dateRange =
      from && to
        ? { start: new Date(from), end: new Date(to) }
        : undefined;

    const [
      overview,
      sentiment,
      categories,
      languages,
      countries,
      devices,
      questions,
      unansweredQuestions,
      timeSeries,
      sessions,
      sentimentTimeSeries,
      hourlyBreakdown,
      animationStats,
    ] = await Promise.all([
      analytics.aggregations.getOverviewByBotId(assistantId, dateRange),
      analytics.aggregations.getSentimentByBotId(assistantId, dateRange),
      analytics.aggregations.getCategoriesByBotId(assistantId, dateRange),
      analytics.aggregations.getLanguagesByBotId(assistantId, dateRange),
      analytics.aggregations.getCountriesByBotId(assistantId, dateRange),
      analytics.aggregations.getDevicesByBotId(assistantId, dateRange),
      analytics.aggregations.getQuestionsByBotId(assistantId, dateRange),
      analytics.aggregations.getUnansweredQuestionsByBotId(assistantId, dateRange),
      analytics.aggregations.getTimeSeriesByBotId(assistantId, dateRange),
      analytics.chatSessions.getWithAnalysisByBotId(assistantId, { dateRange }),
      analytics.aggregations.getSentimentTimeSeriesByBotId(assistantId, dateRange),
      analytics.aggregations.getHourlyBreakdownByBotId(assistantId, dateRange),
      analytics.aggregations.getAnimationStatsByBotId(assistantId, dateRange),
    ]);

    return NextResponse.json({
      data: {
        overview,
        sentiment,
        categories,
        languages,
        countries,
        devices,
        questions,
        unansweredQuestions,
        timeSeries,
        sessions,
        sentimentTimeSeries,
        hourlyBreakdown,
        animationStats,
      },
    });
  } catch (error) {
    console.error('Error fetching assistant analytics:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to fetch assistant analytics' },
      { status: 500 }
    );
  }
}
