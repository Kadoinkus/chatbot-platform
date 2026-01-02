import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth.server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireSession();
    const userId = session.platformUserId || session.userId;

    if (!userId) {
      return NextResponse.json(
        { code: 'USER_ID_MISSING', message: 'No user id on session' },
        { status: 401 }
      );
    }

    const user = (await db.users.getByIdWithAuth(userId)) || (await db.users.getById(userId));

    if (!user) {
      return NextResponse.json(
        { code: 'PROFILE_NOT_FOUND', message: 'User profile not found' },
        { status: 404 }
      );
    }

    const profile = {
      id: user.id,
      email: user.email,
      name: user.name || '',
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      clientSlug: user.clientSlug,
      avatarUrl: user.avatarUrl || null,
      lastLoginAt: user.lastLoginAt || null,
      lastActiveAt: user.lastActiveAt || null,
    };

    return NextResponse.json({ data: { profile } });
  } catch (error) {
    console.error('Profile fetch failed:', error);
    return NextResponse.json(
      { code: 'PROFILE_FETCH_FAILED', message: 'Unable to load profile' },
      { status: 500 }
    );
  }
}
