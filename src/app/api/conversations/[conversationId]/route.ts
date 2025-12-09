import { NextRequest, NextResponse } from 'next/server';
import { db as baseDb } from '@/lib/db';
import * as mockDb from '@/lib/db/mock';

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params;

    // Get conversation
    let conversation = await baseDb.conversations.getById(conversationId);
    if (!conversation) {
      conversation = await mockDb.conversations.getById(conversationId);
    }

    if (!conversation) {
      return NextResponse.json(
        {
          code: 'CONVERSATION_NOT_FOUND',
          message: `Conversation "${conversationId}" not found`,
        },
        { status: 404 }
      );
    }

    // Get messages
    const messages =
      (await baseDb.messages.getByConversationId(conversationId)) ||
      (await mockDb.messages.getByConversationId(conversationId));

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
