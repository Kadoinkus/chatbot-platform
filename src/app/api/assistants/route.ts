import { NextRequest, NextResponse } from 'next/server';
import { getAssistantsByClientId, getAssistantsByWorkspaceId, loadAssistants } from '@/lib/dataLoader.server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const workspaceId = searchParams.get('workspaceId');

    let assistants;

    if (workspaceId) {
      assistants = await getAssistantsByWorkspaceId(workspaceId);
    } else if (clientId) {
      assistants = await getAssistantsByClientId(clientId);
    } else {
      // Return all assistants (admin view)
      assistants = await loadAssistants();
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
