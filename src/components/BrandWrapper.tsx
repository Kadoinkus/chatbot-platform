'use client';
import { clients } from '@/lib/data';
import React from 'react';
export default function BrandWrapper({ clientId, children }:{ clientId: string; children: React.ReactNode }) {
  const client = clients.find(c => c.id === clientId);
  const palette = client?.palette ?? { primary: '#0EA5E9', primaryDark: '#0284C7', accent: '#111827' };
  return (
    <div style={{ ['--brand' as any]: palette.primary, ['--brandDark' as any]: palette.primaryDark } as React.CSSProperties}>
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
