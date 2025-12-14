import { NextRequest, NextResponse } from 'next/server';
// Server-side bootstrap that aggregates client + workspaces + assistants
// Uses internal API routes via absolute URLs to avoid relative fetch issues in the Route handler.

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ code: 'MISSING_PARAM', message: 'clientId is required' }, { status: 400 });
    }

    const origin = request.nextUrl.origin;

    const [clientRes, workspacesRes, assistantsRes] = await Promise.all([
      fetch(`${origin}/api/clients/id/${clientId}`, { cache: 'no-store' }),
      fetch(`${origin}/api/workspaces?clientId=${clientId}`, { cache: 'no-store' }),
      fetch(`${origin}/api/assistants?clientId=${clientId}`, { cache: 'no-store' }),
    ]);

    const clientJson = await clientRes.json();
    const workspacesJson = await workspacesRes.json();
    const assistantsJson = await assistantsRes.json();

    const client = clientJson.data || null;
    const workspaces = workspacesJson.data || [];
    const assistants = assistantsJson.data || [];

    return NextResponse.json({
      data: {
        client,
        workspaces,
        assistants,
      },
    });
  } catch (error) {
    console.error('Error in bootstrap API:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to load app data' },
      { status: 500 }
    );
  }
}
