import { NextRequest, NextResponse } from 'next/server';
import { getBotById } from '@/lib/dataLoader.server';

export async function GET(
  request: NextRequest,
  { params }: { params: { botId: string } }
) {
  try {
    const { botId } = params;
    const bot = await getBotById(botId);

    if (!bot) {
      return NextResponse.json(
        {
          code: 'BOT_NOT_FOUND',
          message: `Bot "${botId}" not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: bot });
  } catch (error) {
    console.error('Error fetching bot:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch bot',
      },
      { status: 500 }
    );
  }
}
