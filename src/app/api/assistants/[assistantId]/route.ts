import { NextRequest, NextResponse } from 'next/server';
import { getAssistantById } from '@/lib/dataLoader.server';

export async function GET(
  request: NextRequest,
  { params }: { params: { assistantId: string } }
) {
  try {
    const { assistantId } = params;
    const assistant = await getAssistantById(assistantId);

    if (!assistant) {
      return NextResponse.json(
        {
          code: 'ASSISTANT_NOT_FOUND',
          message: `AI Assistant "${assistantId}" not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: assistant });
  } catch (error) {
    console.error('Error fetching assistant:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch assistant',
      },
      { status: 500 }
    );
  }
}
