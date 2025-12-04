import { NextRequest, NextResponse } from 'next/server';
import { loadConversations, getMessagesByConversationId } from '@/lib/dataLoader.server';

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params;

    // Get conversation
    const conversations = await loadConversations();
    const conversation = conversations.find(c => c.id === conversationId);

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
    const messages = await getMessagesByConversationId(conversationId);

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
