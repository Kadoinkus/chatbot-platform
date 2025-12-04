import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceById, getBotsByWorkspaceId } from '@/lib/dataLoader.server';

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params;
    const workspace = await getWorkspaceById(workspaceId);

    if (!workspace) {
      return NextResponse.json(
        {
          code: 'WORKSPACE_NOT_FOUND',
          message: `Workspace "${workspaceId}" not found`,
        },
        { status: 404 }
      );
    }

    // Get bots in this workspace
    const bots = await getBotsByWorkspaceId(workspaceId);
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
