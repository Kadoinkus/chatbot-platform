import { NextRequest, NextResponse } from 'next/server';
import { getDbForClient } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    // Route param is named workspaceId but we treat it as slug only
    const { workspaceId: workspaceSlug } = await params;
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'clientId query parameter is required' },
        { status: 400 }
      );
    }

    const db = getDbForClient(clientId);
    const workspace = await db.workspaces.getBySlug(workspaceSlug);

    if (!workspace) {
      return NextResponse.json(
        {
          code: 'WORKSPACE_NOT_FOUND',
          message: `Workspace "${workspaceSlug}" not found`,
        },
        { status: 404 }
      );
    }

    const bots = await db.assistants.getByWorkspaceSlug(workspace.slug);
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
