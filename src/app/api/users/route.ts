import { NextRequest, NextResponse } from 'next/server';
import { db as baseDb, getDbForClient } from '@/lib/db';
import * as mockDb from '@/lib/db/mock';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    let users;
    if (clientId) {
      const scopedDb = getDbForClient(clientId);
      users = await scopedDb.users.getByClientId(clientId);
      if (!users || users.length === 0) {
        // Fallback to mock data for demo clients when Supabase is configured
        users = await mockDb.users.getByClientId(clientId);
      }
    } else {
      const all = await baseDb.users.getAll();
      users = all.length > 0 ? all : await mockDb.users.getAll();
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
