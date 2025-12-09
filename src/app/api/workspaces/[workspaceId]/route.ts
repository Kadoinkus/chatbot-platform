import { NextRequest, NextResponse } from 'next/server';
import { db as baseDb, getDbForClient } from '@/lib/db';
import * as mockDb from '@/lib/db/mock';

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params;
    // Try base DB first, then fall back to mock (important when Supabase is configured but demo data lives in mock)
    const workspace =
      (await baseDb.workspaces.getById(workspaceId)) ||
      (await mockDb.workspaces.getById(workspaceId));

    if (!workspace) {
      return NextResponse.json(
        {
          code: 'WORKSPACE_NOT_FOUND',
          message: `Workspace "${workspaceId}" not found`,
        },
        { status: 404 }
      );
    }

    // Choose DB for assistants based on workspace client context
    const clientKey = (workspace as any).clientSlug || (workspace as any).clientId || workspace.clientId;
    const assistantDb = clientKey ? getDbForClient(String(clientKey)) : baseDb;
    const bots = await assistantDb.assistants.getByWorkspaceId(workspaceId);
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
