'use client';
import React, { useEffect, useState } from 'react';
import { getClientById } from '@/lib/dataService';
import { useAuth } from '@/hooks/useAuth';

type Palette = {
  primary: string;
  primaryDark: string;
  accent: string;
};

// Extend CSSProperties to allow custom CSS variables
interface BrandCSSProperties extends React.CSSProperties {
  '--brand'?: string;
  '--brandDark'?: string;
}

const fallbackPalette: Palette = { primary: '#0EA5E9', primaryDark: '#0284C7', accent: '#111827' };

export default function BrandWrapper({ clientId, children }: { clientId: string; children: React.ReactNode }) {
  const { client: authClient } = useAuth();
  const [palette, setPalette] = useState<Palette>(fallbackPalette);

  useEffect(() => {
    // Prefer the palette from the authenticated client if it matches
    if (authClient && (authClient.id === clientId || authClient.slug === clientId) && authClient.palette) {
      setPalette(authClient.palette as Palette);
      return;
    }

    // Otherwise fetch the client to get palette
    let cancelled = false;
    (async () => {
      const client = await getClientById(clientId);
      if (!cancelled && client?.palette) {
        setPalette(client.palette as Palette);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authClient, clientId]);

  return (
    <div style={{ '--brand': palette.primary, '--brandDark': palette.primaryDark } as BrandCSSProperties}>
      {children}
      <style jsx global>{`
        :root { --brand: ${palette.primary}; --brandDark: ${palette.primaryDark}; }
        .brand-bg { background-color: var(--brand); }
        .brand-border { border-color: var(--brand); }
        .brand-text { color: var(--brand); }
        .brand-hover:hover { background-color: var(--brandDark); }
      `}</style>
    </div>
  );
}
