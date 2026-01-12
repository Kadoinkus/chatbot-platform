import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseClientProd } from '@/lib/db/supabase/client';
import { EmailSchema, formatZodErrors } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

const ResetPasswordRequestSchema = z.object({
  email: EmailSchema,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = ResetPasswordRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          errors: formatZodErrors(validation.error),
        },
        { status: 400 }
      );
    }

    if (!supabaseClientProd) {
      return NextResponse.json(
        { code: 'AUTH_NOT_CONFIGURED', message: 'Supabase is not configured' },
        { status: 500 }
      );
    }

    const origin = request.headers.get('origin') || request.nextUrl.origin;
    const redirectTo = `${origin}/reset-password`;

    const { error } = await supabaseClientProd.auth.resetPasswordForEmail(
      validation.data.email,
      { redirectTo }
    );

    if (error) {
      return NextResponse.json(
        { code: 'RESET_FAILED', message: error.message || 'Unable to send reset email' },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to send reset email' },
      { status: 500 }
    );
  }
}
