import { NextRequest, NextResponse } from 'next/server';
import { loadUsers } from '@/lib/dataLoader.server';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const users = await loadUsers();
    const user = users.find(u => u.id === userId);

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
