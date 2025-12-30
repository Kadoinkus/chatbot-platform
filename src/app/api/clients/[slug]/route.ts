import { NextRequest, NextResponse } from 'next/server';
import { getDbForClient } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const db = getDbForClient(slug);
    const client = await db.clients.getBySlug(slug);

    if (!client) {
      return NextResponse.json(
        {
          code: 'CLIENT_NOT_FOUND',
          message: `Client with slug "${slug}" not found`,
        },
        { status: 404 }
      );
    }

    // Return client without password
    const { login, ...clientData } = client;

    return NextResponse.json({ data: clientData });
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch client',
      },
      { status: 500 }
    );
  }
}
