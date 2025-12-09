import { NextRequest, NextResponse } from 'next/server';
import { getDbForClient } from '@/lib/db';

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

    const db = getDbForClient(clientId);
    const workspaces = await db.workspaces.getByClientId(clientId);

    return NextResponse.json({ data: workspaces });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch workspaces',
      },
      { status: 500 }
    );
  }
}
