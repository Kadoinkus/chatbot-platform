import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE_NAME = 'notsoai-session';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);

    return NextResponse.json({
      data: { success: true },
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during logout',
      },
      { status: 500 }
    );
  }
}
