import { NextRequest, NextResponse } from 'next/server';
import { db as baseDb, getDbForClient } from '@/lib/db';
import * as mockDb from '@/lib/db/mock';

export async function GET(
  request: NextRequest,
  { params }: { params: { assistantId: string } }
) {
  try {
    const { assistantId } = params;
    // Try base DB first, then mock (important when Supabase is configured but demo data is mock-only)
    let assistant = await baseDb.assistants.getById(assistantId);
    if (!assistant) {
      assistant = await mockDb.assistants.getById(assistantId);
    }

    if (!assistant) {
      return NextResponse.json(
        {
          code: 'ASSISTANT_NOT_FOUND',
          message: `AI Assistant "${assistantId}" not found`,
        },
        { status: 404 }
      );
    }

    // If we have client context, ensure subsequent related lookups use correct DB
    if ((assistant as any).clientId || (assistant as any).client_slug) {
      const clientId = (assistant as any).clientId || (assistant as any).client_slug;
      const scopedDb = getDbForClient(String(clientId));
      // Refresh from scoped DB to ensure consistency when we initially hit the wrong source
      const refreshed = await scopedDb.assistants.getById(assistantId);
      if (refreshed) {
        assistant = refreshed;
      }
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
