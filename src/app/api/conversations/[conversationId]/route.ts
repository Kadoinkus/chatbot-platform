import { NextRequest, NextResponse } from 'next/server';
import { getDbForClient } from '@/lib/db';
import { enforceClientAccess } from '@/lib/api-auth';
import { redactConversations, redactMessages, shouldRedactRole } from '@/lib/redaction';

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

    const access = await enforceClientAccess(clientId);
    if ('response' in access) {
      return access.response;
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

    const shouldRedact = shouldRedactRole(access.session.role);
    const redactedConversation = shouldRedact ? redactConversations([conversation])[0] : conversation;
    const redactedMessages = shouldRedact ? redactMessages(messages) : messages;

    return NextResponse.json({
      data: {
        ...redactedConversation,
        messageList: redactedMessages,
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
