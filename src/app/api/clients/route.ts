import { NextResponse } from 'next/server';
import { loadClients } from '@/lib/dataLoader.server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const clients = await loadClients();

    // Return list of clients for login dropdown (without passwords)
    const clientList = clients.map(client => ({
      id: client.id,
      name: client.name,
      slug: client.slug,
      email: client.login.email,
    }));

    return NextResponse.json({ data: clientList });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch clients',
      },
      { status: 500 }
    );
  }
}
