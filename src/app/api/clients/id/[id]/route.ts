import { NextRequest, NextResponse } from 'next/server';
import { getClientById } from '@/lib/dataLoader.server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const client = await getClientById(id);

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
