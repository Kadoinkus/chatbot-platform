import { NextRequest, NextResponse } from 'next/server';
import { getUsersByClientId, loadUsers } from '@/lib/dataLoader.server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    let users;
    if (clientId) {
      users = await getUsersByClientId(clientId);
    } else {
      users = await loadUsers();
    }

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch users',
      },
      { status: 500 }
    );
  }
}
