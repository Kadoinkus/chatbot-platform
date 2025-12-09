import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    // Accept either UUID or slug for convenience in demo links
    const client = (await db.clients.getById(id)) || (await db.clients.getBySlug(id)) || null;

    if (!client) {
      return NextResponse.json(
        {
          code: 'CLIENT_NOT_FOUND',
          message: `Client with ID "${id}" not found`,
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
