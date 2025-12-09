import { NextRequest, NextResponse } from 'next/server';
import { db as baseDb, getDbForClient } from '@/lib/db';
import * as mockDb from '@/lib/db/mock';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const workspaceId = searchParams.get('workspaceId');

    let assistants;

    if (workspaceId) {
      // Prefer client-scoped DB when possible; fall back to mock for demo data when Supabase is configured
      const byWorkspace =
        (await baseDb.assistants.getByWorkspaceId(workspaceId)) ||
        (await mockDb.assistants.getByWorkspaceId(workspaceId));
      assistants = byWorkspace;
    } else if (clientId) {
      const scopedDb = getDbForClient(clientId);
      assistants = await scopedDb.assistants.getByClientId(clientId);
    } else {
      // Return all assistants (admin view)
      const all = await baseDb.assistants.getAll();
      assistants = all.length > 0 ? all : await mockDb.assistants.getAll();
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
