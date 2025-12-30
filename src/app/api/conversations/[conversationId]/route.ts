import { NextRequest, NextResponse } from 'next/server';
import { getDbForClient } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await context.params;
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'clientId query parameter is required' },
        { status: 400 }
      );
    }

    const db = getDbForClient(clientId);
    const conversation = await db.conversations.getById(conversationId);

    if (!conversation) {
      return NextResponse.json(
        {
          code: 'CONVERSATION_NOT_FOUND',
          message: `Conversation "${conversationId}" not found`,
        },
        { status: 404 }
      );
    }

    const messages = await db.messages.getByConversationId(conversationId);

    return NextResponse.json({
      data: {
        ...conversation,
        messageList: messages,
      },
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch conversation',
      },
      { status: 500 }
    );
  }
}
