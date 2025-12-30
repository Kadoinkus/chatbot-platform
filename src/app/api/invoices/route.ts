import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminProd } from '@/lib/db/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdminProd) {
      return NextResponse.json({ code: 'NO_DB', message: 'Supabase not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ code: 'MISSING_PARAM', message: 'clientId is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdminProd
      .from('invoices')
      .select('*')
      .eq('client_slug', clientId)
      .order('invoice_date', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      return NextResponse.json({ code: 'DB_ERROR', message: 'Failed to fetch invoices' }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error('Unhandled error fetching invoices:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch invoices' }, { status: 500 });
  }
}
