import { NextRequest, NextResponse } from 'next/server';
import { getDbForClient } from '@/lib/db';
import { enforceClientAccess } from '@/lib/api-auth';
import { redactConversations, shouldRedactRole } from '@/lib/redaction';
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

    const access = await enforceClientAccess(clientId);
    if ('response' in access) {
      return access.response;
    }

    const db = getDbForClient(clientId);

    // Get conversations
    let conversations = botId
      ? await db.conversations.getByAssistantId(botId)
      : await db.conversations.getByClientId(clientId);

    // Filter by status if provided
    if (status && ['active', 'resolved', 'escalated'].includes(status)) {
      conversations = conversations.filter(c => c.status === status);
    }

    // Apply pagination
    const offsetNum = parseInt(offset || '0', 10);
    const limitNum = parseInt(limit || '50', 10);
    let paginatedConversations = conversations.slice(offsetNum, offsetNum + limitNum);

    const shouldRedact = shouldRedactRole(access.session.role);
    if (shouldRedact) {
      paginatedConversations = redactConversations(paginatedConversations);
    }

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
