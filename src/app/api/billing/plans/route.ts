import { NextResponse } from 'next/server';
import { getBillingPlans } from '@/lib/billingPlansService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const plans = await getBillingPlans();
    return NextResponse.json({ data: plans });
  } catch (error) {
    console.error('Error fetching billing plans:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to fetch billing plans' },
      { status: 500 }
    );
  }
}
