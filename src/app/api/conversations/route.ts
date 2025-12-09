import { NextRequest, NextResponse } from 'next/server';
import { getDbForClient } from '@/lib/db';
import * as mockDb from '@/lib/db/mock';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const botId = searchParams.get('botId');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

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

    // Get conversations
    let conversations;
    if (botId) {
      conversations = await db.conversations.getByAssistantId(botId);
      if (!conversations || conversations.length === 0) {
        conversations = await mockDb.conversations.getByAssistantId(botId);
      }
    } else {
      conversations = await db.conversations.getByClientId(clientId);
      if (!conversations || conversations.length === 0) {
        conversations = await mockDb.conversations.getByClientId(clientId);
      }
    }

    // Filter by status if provided
    if (status && ['active', 'resolved', 'escalated'].includes(status)) {
      conversations = conversations.filter(c => c.status === status);
    }

    // Apply pagination
    const offsetNum = parseInt(offset || '0', 10);
    const limitNum = parseInt(limit || '50', 10);
    const paginatedConversations = conversations.slice(offsetNum, offsetNum + limitNum);

    return NextResponse.json({ data: paginatedConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch conversations',
      },
      { status: 500 }
    );
  }
}
