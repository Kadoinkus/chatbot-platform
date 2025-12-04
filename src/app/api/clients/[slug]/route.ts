import { NextRequest, NextResponse } from 'next/server';
import { resolveClientSlug } from '@/lib/slugResolver';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const resolution = await resolveClientSlug(slug);

    if (!resolution) {
      return NextResponse.json(
        {
          code: 'CLIENT_NOT_FOUND',
          message: `Client with slug "${slug}" not found`,
        },
        { status: 404 }
      );
    }

    // Return client without password
    const { login, ...clientData } = resolution.client;

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
