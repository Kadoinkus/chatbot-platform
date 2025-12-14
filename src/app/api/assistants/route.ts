import { NextRequest, NextResponse } from 'next/server';
import { getDbForClient } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const workspaceSlug = searchParams.get('workspaceSlug');

    if (!clientId) {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'clientId is required' },
        { status: 400 }
      );
    }

    const db = getDbForClient(clientId);
    let assistants;

    if (workspaceSlug) {
      // Resolve workspaceSlug from id or slug to avoid orphaned assistants when callers pass ids.
      const workspaces = await db.workspaces.getByClientId(clientId);
      const match = workspaces.find((w) => w.slug === workspaceSlug || w.id === workspaceSlug);
      const resolvedWorkspaceSlug = match?.slug || workspaceSlug;
      assistants = await db.assistants.getByWorkspaceSlug(resolvedWorkspaceSlug);
    } else {
      assistants = await db.assistants.getByClientId(clientId);
    }

    return NextResponse.json({ data: assistants });
  } catch (error) {
    console.error('Error fetching assistants:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch assistants',
      },
      { status: 500 }
    );
  }
}
