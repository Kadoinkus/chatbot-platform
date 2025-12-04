import { NextRequest, NextResponse } from 'next/server';
import { getBotsByClientId, getBotsByWorkspaceId, loadBots } from '@/lib/dataLoader.server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const workspaceId = searchParams.get('workspaceId');

    let bots;

    if (workspaceId) {
      bots = await getBotsByWorkspaceId(workspaceId);
    } else if (clientId) {
      bots = await getBotsByClientId(clientId);
    } else {
      // Return all bots (admin view)
      bots = await loadBots();
    }

    return NextResponse.json({ data: bots });
  } catch (error) {
    console.error('Error fetching bots:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch bots',
      },
      { status: 500 }
    );
  }
}
