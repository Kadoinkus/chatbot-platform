import { createHmac, timingSafeEqual } from 'crypto';
import { config } from '@/lib/config';
import type { AuthSession } from '@/types';

const secret = config.session.secret;

function sign(payload: string): string {
  if (!secret) {
    throw new Error('SESSION_SECRET is required');
  }
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function encodeSessionCookie(session: AuthSession): string {
  const payload = JSON.stringify(session);
  if (!secret) {
    if (config.isProduction) {
      throw new Error('SESSION_SECRET is required');
    }
    return payload;
  }

  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = sign(payload);
  return `${encodedPayload}.${signature}`;
}

export function decodeSessionCookie(value: string): AuthSession | null {
  if (!value) return null;
  if (!secret) {
    if (config.isProduction) {
      return null;
    }
    try {
      return JSON.parse(value) as AuthSession;
    } catch {
      return null;
    }
  }

  const parts = value.split('.');
  if (parts.length !== 2) return null;
  const [encodedPayload, signature] = parts;

  let payload: string;
  try {
    payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
  } catch {
    return null;
  }

  const expected = sign(payload);
  if (!safeEqual(signature, expected)) {
    return null;
  }

  try {
    return JSON.parse(payload) as AuthSession;
  } catch {
    return null;
  }
}
