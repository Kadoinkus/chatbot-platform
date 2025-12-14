import { NextRequest, NextResponse } from 'next/server';
import { getDbForClient } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assistantId: string }> }
) {
  try {
    const { assistantId } = await params;
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'clientId query parameter is required' },
        { status: 400 }
      );
    }

    const db = getDbForClient(clientId);
    const assistant = await db.assistants.getById(assistantId);

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
