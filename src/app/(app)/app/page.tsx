'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { clients } from '@/lib/data';

export default function AppHome() {
  const router = useRouter();
  const session = getSession();
  
  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    
    const client = clients.find(c => c.id === session.clientId);
    if (client) {
      router.push(`/app/${client.id}`);
    }
  }, [session, router]);
  
  return null;
}
