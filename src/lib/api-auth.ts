import type { NextResponse } from 'next/server';
import { errors } from '@/lib/api-utils';
import { requireClientAccess, type ValidatedSession } from '@/lib/auth.server';

type ClientAccessResult =
  | { session: ValidatedSession; response?: never }
  | { session?: never; response: NextResponse };

export async function enforceClientAccess(clientId: string): Promise<ClientAccessResult> {
  try {
    const session = await requireClientAccess(clientId);
    return { session };
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('unauthorized')) {
        return { response: errors.unauthorized() };
      }
      if (message.includes('forbidden')) {
        return { response: errors.forbidden() };
      }
    }
    return { response: errors.internal() };
  }
}
