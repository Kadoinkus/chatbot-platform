import { NextRequest, NextResponse } from 'next/server';
import {
  getWorkspacesByClientId,
  getBotsByClientId,
  getConversationsByClientId,
} from '@/lib/dataLoader.server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        {
          code: 'MISSING_PARAM',
          message: 'clientId parameter is required',
        },
        { status: 400 }
      );
    }

    // Fetch all data in parallel
    const [workspaces, bots, conversations] = await Promise.all([
      getWorkspacesByClientId(clientId),
      getBotsByClientId(clientId),
      getConversationsByClientId(clientId),
    ]);

    // Calculate totals
    const activeConversations = conversations.filter(c => c.status === 'active').length;
    const today = new Date().toDateString();
    const resolvedToday = conversations.filter(
      c => c.status === 'resolved' && c.endedAt && new Date(c.endedAt).toDateString() === today
    ).length;
    const escalatedToday = conversations.filter(
      c => c.status === 'escalated' && new Date(c.startedAt).toDateString() === today
    ).length;

    // Calculate usage across all workspaces
    const totalBundleLoads = workspaces.reduce((sum, ws) => sum + ws.bundleLoads.used, 0);
    const totalBundleLoadsLimit = workspaces.reduce((sum, ws) => sum + ws.bundleLoads.limit, 0);
    const totalMessages = workspaces.reduce((sum, ws) => sum + ws.messages.used, 0);
    const totalMessagesLimit = workspaces.reduce((sum, ws) => sum + ws.messages.limit, 0);

    // Calculate trends (mock for now - would be computed from historical data)
    const trends = {
      conversationsChange: '+12%',
      resolutionRateChange: '+5%',
      csatChange: '+0.2',
    };

    return NextResponse.json({
      data: {
        clientId,
        totals: {
          workspaces: workspaces.length,
          bots: bots.length,
          activeConversations,
          totalConversations: conversations.length,
          resolvedToday,
          escalatedToday,
        },
        usage: {
          bundleLoadsUsed: totalBundleLoads,
          bundleLoadsLimit: totalBundleLoadsLimit,
          messagesUsed: totalMessages,
          messagesLimit: totalMessagesLimit,
        },
        trends,
      },
    });
  } catch (error) {
    console.error('Error fetching counters:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch counters',
      },
      { status: 500 }
    );
  }
}
