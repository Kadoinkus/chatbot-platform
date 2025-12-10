import { NextRequest, NextResponse } from 'next/server';
import { getDbForClient } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params;
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'clientId query parameter is required' },
        { status: 400 }
      );
    }

    const db = getDbForClient(clientId);
    let workspace = await db.workspaces.getById(workspaceId);
    if (!workspace) {
      // Try resolve by slug via client workspaces
      const byClient = await db.workspaces.getByClientId(clientId);
      workspace = byClient.find(ws => ws.slug === workspaceId) || null;
    }

    if (!workspace) {
      return NextResponse.json(
        {
          code: 'WORKSPACE_NOT_FOUND',
          message: `Workspace "${workspaceId}" not found`,
        },
        { status: 404 }
      );
    }

    const bots = await db.assistants.getByWorkspaceId(workspaceId);
    const botSummary = bots.map(bot => ({
      id: bot.id,
      name: bot.name,
      status: bot.status,
      conversations: bot.conversations,
    }));

    return NextResponse.json({
      data: {
        ...workspace,
        bots: botSummary,
      },
    });
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch workspace',
      },
      { status: 500 }
    );
  }
}
