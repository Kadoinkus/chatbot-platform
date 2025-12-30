import { NextRequest, NextResponse } from 'next/server';
import { getDbForClient } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'clientId query parameter is required' },
        { status: 400 }
      );
    }

    const db = getDbForClient(clientId);
    const user = await db.users.getById(userId);

    if (!user) {
      return NextResponse.json(
        {
          code: 'USER_NOT_FOUND',
          message: `User "${userId}" not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch user',
      },
      { status: 500 }
    );
  }
}
