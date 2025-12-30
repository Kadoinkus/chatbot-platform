import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminProd } from '@/lib/db/supabase/client';

export const dynamic = 'force-dynamic';

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    if (!supabaseAdminProd) {
      return NextResponse.json({ code: 'NO_DB', message: 'Supabase not configured' }, { status: 500 });
    }

    // Prefer route param; fallback to parsing from pathname for robustness
    const pathSegments = _request.nextUrl.pathname.split('/').filter(Boolean);
    const fallbackId = pathSegments.length >= 3 ? pathSegments[pathSegments.length - 2] : null;
    const invoiceIdOrSlug = params?.invoiceId || fallbackId;

    if (!invoiceIdOrSlug) {
      return NextResponse.json({ code: 'MISSING_PARAM', message: 'invoiceId is required' }, { status: 400 });
    }

    let targetInvoiceId: string | null = null;
    let targetInvoiceSlug: string | null = null;
    let targetInvoiceNr: string | null = null;

    if (isUuid(invoiceIdOrSlug)) {
      targetInvoiceId = invoiceIdOrSlug;
    } else {
      // Try slug first, then invoice_nr
      let invoiceRow = null;
      let invoiceLookupError = null;
      const slugQuery = await supabaseAdminProd
        .from('invoices')
        .select('id, invoice_slug, invoice_nr')
        .eq('invoice_slug', invoiceIdOrSlug)
        .single();
      invoiceRow = slugQuery.data;
      invoiceLookupError = slugQuery.error;

      if (!invoiceRow && (!invoiceLookupError || invoiceLookupError.code === 'PGRST116')) {
        const nrQuery = await supabaseAdminProd
          .from('invoices')
          .select('id, invoice_slug, invoice_nr')
          .eq('invoice_nr', invoiceIdOrSlug)
          .single();
        invoiceRow = nrQuery.data;
        invoiceLookupError = nrQuery.error;
      }

      if (invoiceLookupError && invoiceLookupError.code !== 'PGRST116') {
        console.error('Error fetching invoice by slug:', invoiceLookupError);
        return NextResponse.json({ code: 'DB_ERROR', message: 'Failed to fetch invoice' }, { status: 500 });
      }

      targetInvoiceId = invoiceRow?.id ?? null;
      targetInvoiceSlug = invoiceRow?.invoice_slug ?? null;
      targetInvoiceNr = invoiceRow?.invoice_nr ?? null;
    }

    if (!targetInvoiceId) {
      return NextResponse.json({ data: [] });
    }

    const orFilters = [
      `invoice_id.eq.${targetInvoiceId}`,
      targetInvoiceSlug ? `invoice_slug.eq.${targetInvoiceSlug}` : null,
      targetInvoiceNr ? `invoice_nr.eq.${targetInvoiceNr}` : null,
      // also allow direct match against the provided identifier if columns exist
      `invoice_slug.eq.${invoiceIdOrSlug}`,
      `invoice_nr.eq.${invoiceIdOrSlug}`,
    ].filter(Boolean).join(',');

    const { data, error } = await supabaseAdminProd
      .from('invoice_lines')
      .select('*')
      .or(orFilters)
      .order('line_nr', { ascending: true });

    if (error) {
      console.error('Error fetching invoice lines:', error);
      return NextResponse.json({ code: 'DB_ERROR', message: 'Failed to fetch invoice lines', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error('Unhandled error fetching invoice lines:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch invoice lines' }, { status: 500 });
  }
}
