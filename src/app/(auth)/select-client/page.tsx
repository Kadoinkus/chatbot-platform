'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Input, Spinner, Alert } from '@/components/ui';
import { getSession } from '@/lib/auth';
import type { Client } from '@/types';

type ClientWithoutLogin = Omit<Client, 'login'>;

export default function SelectClientPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientWithoutLogin[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load session and accessible clients
  useEffect(() => {
    async function loadData() {
      try {
        const authData = await getSession();

        // If not authenticated, redirect to login
        if (!authData?.session) {
          router.push('/login');
          return;
        }

        // If not superadmin or already has a client selected, redirect to app
        if (!authData.session.isSuperadmin) {
          router.push(`/app/${authData.session.clientSlug}/home`);
          return;
        }

        // If superadmin already has a client selected, redirect to app
        if (authData.session.clientSlug) {
          router.push(`/app/${authData.session.clientSlug}/home`);
          return;
        }

        // Load accessible clients
        if (authData.accessibleClients) {
          setClients(authData.accessibleClients);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load clients:', err);
        setError('Failed to load clients');
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

  // Filter and sort clients alphabetically
  const filteredClients = useMemo(() => {
    let filtered = clients;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.slug.toLowerCase().includes(searchLower)
      );
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [clients, search]);

  // Handle client selection
  async function handleSelectClient(clientSlug: string) {
    setIsSelecting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/select-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientSlug }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to select client');
      }

      const { data } = await response.json();
      window.location.href = data.redirectUrl;
    } catch (err) {
      console.error('Failed to select client:', err);
      setError(err instanceof Error ? err.message : 'Failed to select client');
      setIsSelecting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="p-6">
          <h1 className="text-xl font-semibold text-foreground mb-1">Select Client</h1>
          <p className="text-sm text-foreground-secondary mb-4">
            {clients.length} client{clients.length !== 1 ? 's' : ''} available
          </p>

          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          {clients.length > 5 && (
            <Input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full mb-4"
            />
          )}

          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {filteredClients.length === 0 ? (
              <p className="text-center py-4 text-foreground-secondary text-sm">
                {search ? 'No results' : 'No clients available'}
              </p>
            ) : (
              filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleSelectClient(client.slug)}
                  disabled={isSelecting}
                  className={`
                    w-full text-left px-3 py-2 rounded-md transition-colors
                    ${isSelecting
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-surface-elevated cursor-pointer'
                    }
                  `}
                >
                  <span className="text-foreground">{client.name}</span>
                  <span className="text-foreground-tertiary text-sm ml-2">
                    {client.slug}
                  </span>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
