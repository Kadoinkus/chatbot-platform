'use client';
import React, { useEffect, useState } from 'react';
import { getClientById } from '@/lib/dataService';
import { useAuth } from '@/hooks/useAuth';
import { registerClientColors } from '@/lib/brandColors';
import type { Client } from '@/types';

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

/**
 * Extract palette from client, preferring brandColors over legacy palette
 */
function extractPalette(client: Client): Palette {
  // Prefer brandColors (new columns), fallback to palette (legacy)
  const primary = client.brandColors?.primary || client.palette?.primary || fallbackPalette.primary;
  const primaryDark = client.brandColors?.secondary || client.palette?.primaryDark || fallbackPalette.primaryDark;
  const accent = client.palette?.accent || fallbackPalette.accent;

  return { primary, primaryDark, accent };
}

export default function BrandWrapper({ clientId, children }: { clientId: string; children: React.ReactNode }) {
  const { client: authClient, isLoading } = useAuth();
  const [palette, setPalette] = useState<Palette>(fallbackPalette);

  useEffect(() => {
    // Wait for auth to finish loading before deciding on palette source
    if (isLoading) {
      return;
    }

    // Prefer the palette from the authenticated client if it matches
    if (authClient && (authClient.id === clientId || authClient.slug === clientId)) {
      const extracted = extractPalette(authClient);
      setPalette(extracted);

      // Register to color cache for other components
      if (authClient.brandColors?.primary) {
        registerClientColors(authClient.id, authClient.brandColors);
        registerClientColors(authClient.slug, authClient.brandColors);
      }
      return;
    }

    // Otherwise fetch the client to get palette
    let cancelled = false;
    (async () => {
      const client = await getClientById(clientId);
      if (!cancelled && client) {
        const extracted = extractPalette(client);
        setPalette(extracted);

        // Register to color cache for other components
        if (client.brandColors?.primary) {
          registerClientColors(client.id, client.brandColors);
          registerClientColors(client.slug, client.brandColors);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authClient, clientId, isLoading]);

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
