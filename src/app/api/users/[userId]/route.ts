import { NextRequest, NextResponse } from 'next/server';
import { db as baseDb } from '@/lib/db';
import * as mockDb from '@/lib/db/mock';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const fromBase = await baseDb.users.getById(userId);
    const user = fromBase || (await mockDb.users.getById(userId));

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
