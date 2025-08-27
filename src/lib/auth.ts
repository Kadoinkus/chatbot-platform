'use client';
import { clients } from '@/lib/data';
export type Session = { clientId: string } | null;
const KEY = 'chatbot-platform.session';
export function signIn(email: string, password: string): Session {
  const client = clients.find(c => c.login.email === email && c.login.password === password);
  if (!client) return null;
  const session: Session = { clientId: client.id };
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY, JSON.stringify(session));
  }
  return session;
}
export function signOut() { 
  if (typeof window !== 'undefined') {
    localStorage.removeItem(KEY); 
  }
}
export function getSession(): Session {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
