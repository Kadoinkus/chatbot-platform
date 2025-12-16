'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Input, Spinner, Alert } from '@/components/ui';
import { getSession } from '@/lib/auth';
import type { Client } from '@/types';

const LAST_CLIENT_KEY = 'superadmin-last-client';
const PINNED_CLIENTS_KEY = 'superadmin-pinned-clients';

type ClientWithoutLogin = Omit<Client, 'login'>;

export default function SelectClientPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientWithoutLogin[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinnedSlugs, setPinnedSlugs] = useState<string[]>([]);
  const [lastClientSlug, setLastClientSlug] = useState<string | null>(null);

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

        // Load pinned clients from localStorage
        const savedPinned = localStorage.getItem(PINNED_CLIENTS_KEY);
        if (savedPinned) {
          try {
            setPinnedSlugs(JSON.parse(savedPinned));
          } catch {
            // Invalid JSON, ignore
          }
        }

        // Load last selected client
        const lastClient = localStorage.getItem(LAST_CLIENT_KEY);
        if (lastClient) {
          setLastClientSlug(lastClient);
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

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    let filtered = clients;

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.slug.toLowerCase().includes(searchLower)
      );
    }

    // Sort: pinned first, then last used, then alphabetically
    return filtered.sort((a, b) => {
      const aIsPinned = pinnedSlugs.includes(a.slug);
      const bIsPinned = pinnedSlugs.includes(b.slug);
      const aIsLast = a.slug === lastClientSlug;
      const bIsLast = b.slug === lastClientSlug;

      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;
      if (aIsLast && !bIsLast) return -1;
      if (!aIsLast && bIsLast) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [clients, search, pinnedSlugs, lastClientSlug]);

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

      // Save to localStorage
      localStorage.setItem(LAST_CLIENT_KEY, clientSlug);

      // Full page reload to the new client
      window.location.href = data.redirectUrl;
    } catch (err) {
      console.error('Failed to select client:', err);
      setError(err instanceof Error ? err.message : 'Failed to select client');
      setIsSelecting(false);
    }
  }

  // Toggle pin status
  function togglePin(slug: string, e: React.MouseEvent) {
    e.stopPropagation();
    const newPinned = pinnedSlugs.includes(slug)
      ? pinnedSlugs.filter((s) => s !== slug)
      : [...pinnedSlugs, slug];
    setPinnedSlugs(newPinned);
    localStorage.setItem(PINNED_CLIENTS_KEY, JSON.stringify(newPinned));
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-start pt-8 sm:items-center sm:pt-0 justify-center bg-background p-4 transition-colors overflow-auto">
      <div className="w-full max-w-2xl">
        <Card className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">Select Client</h1>
            <p className="text-foreground-secondary mt-1">
              Choose a client to manage ({clients.length} available)
            </p>
          </div>

          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Search */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search by name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Client list */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredClients.length === 0 ? (
              <div className="text-center py-8 text-foreground-secondary">
                {search ? 'No clients match your search' : 'No clients available'}
              </div>
            ) : (
              filteredClients.map((client) => {
                const isPinned = pinnedSlugs.includes(client.slug);
                const isLast = client.slug === lastClientSlug;

                return (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client.slug)}
                    disabled={isSelecting}
                    className={`
                      w-full flex items-center gap-4 p-4 rounded-lg border transition-colors text-left
                      ${isSelecting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-elevated cursor-pointer'}
                      ${isPinned ? 'border-interactive bg-surface-elevated/50' : 'border-border'}
                    `}
                  >
                    {/* Logo or placeholder */}
                    <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {client.logoUrl ? (
                        <img
                          src={client.logoUrl}
                          alt={client.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-foreground-secondary">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Client info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">
                          {client.name}
                        </span>
                        {isLast && (
                          <span className="text-xs px-2 py-0.5 rounded bg-surface-elevated text-foreground-secondary">
                            Recent
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-foreground-secondary truncate">
                        {client.slug}
                      </div>
                    </div>

                    {/* Pin button */}
                    <button
                      onClick={(e) => togglePin(client.slug, e)}
                      className={`
                        p-2 rounded-lg transition-colors
                        ${isPinned ? 'text-interactive hover:text-interactive-hover' : 'text-foreground-tertiary hover:text-foreground-secondary'}
                      `}
                      title={isPinned ? 'Unpin client' : 'Pin client'}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={isPinned ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth={2}
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                        />
                      </svg>
                    </button>
                  </button>
                );
              })
            )}
          </div>

          {/* Logo at bottom */}
          <div className="mt-8 flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 586.27 166.98"
              className="h-6 text-foreground"
              fill="currentColor"
            >
              <g id="Layer_2" data-name="Layer 2">
                <g id="Laag_2" data-name="Laag 2">
                  <path d="M267,109.19c0-16.4,12.71-27.91,30.52-27.91s30,10.75,30,27.59-12.71,28.56-30.41,28.56S267,126.24,267,109.19Zm44.31.21c0-8.69-5.76-14.23-14-14.23s-14.12,5.43-14.12,14.34,6,14.45,14.12,14.45,14-5.76,14-14.55Z" />
                  <path d="M353.24,66.61V82.36h10.64V95.5H353.24v40.84h-16V95.5h-6.73V82.36h6.73V66.61Z" />
                  <path d="M364.88,129l7.06-10.54A19.61,19.61,0,0,0,386.06,125c4.13,0,7.39-1.85,7.39-5.21,0-3.15-1.74-4.24-9.67-5.76-9.67-2.06-14.45-7.28-14.45-15.53,0-9.78,7.82-17.27,20.09-17.27,7.82,0,13.58,2.39,17.38,5.21l-5.21,10.32a17.71,17.71,0,0,0-10.86-4.13c-3.26,0-6,1.19-6,3.91s1.85,4,8.36,5.54c10.75,2.5,15.64,7.06,15.64,15.86,0,11.19-7.93,19.44-22.16,19.44-9.78,0-17.81-4.24-21.72-8.47Z" />
                  <path d="M413.86,109.19c0-16.4,12.71-27.91,30.52-27.91s30,10.75,30,27.59S461.65,137.43,444,137.43,413.86,126.24,413.86,109.19Zm44.31.21c0-8.69-5.76-14.23-14-14.23S430,100.6,430,109.51,436,124,444.16,124s14-5.76,14-14.55Z" />
                  <path d="M476.46,128c0-5.54,4-9.34,9.56-9.34s9.45,3.8,9.45,9.34-3.69,9.45-9.45,9.45S476.46,133.74,476.46,128Z" />
                  <path d="M499.68,109.4c0-16.08,11.19-28.13,26-28.13,7.28,0,14.23,3,17.81,7.93h.11V82.36h16.08v54H543.56V130h-.11c-4,4.78-10.54,7.39-17.92,7.39-15.42,0-25.85-11.3-25.85-28Zm44.85-.32c0-8.8-6.08-14.45-14.34-14.45S516,100.6,516,109.29s5.54,14.77,13.79,14.77c8.91,0,14.77-6.19,14.77-15Z" />
                  <path d="M568.14,63.14a9.07,9.07,0,0,1,18.13,0c0,5.54-3.58,9-9.12,9S568.14,68.67,568.14,63.14Zm17.05,19.22v54.09h-16V82.36Z" />
                  <path d="M221.52,136.43l-1.08-29.14c0-6.36,2.17-11.54,9-11.54a13.07,13.07,0,0,1,5.67,1.3,11.94,11.94,0,0,1,4.53,3.87,11.5,11.5,0,0,1,1.92,5.33l3.67,30.17h20.19l-4.29-31.63c-2.41-12.73-13.26-22.75-27-24.43a33.14,33.14,0,0,0-4.12-.25c-17.73,0-28.8,13.5-28.8,30.09v26.23Z" />
                </g>
                <g id="Layer_2-2" data-name="Layer 2">
                  <path d="M154.71,0H12.27A12.27,12.27,0,0,0,0,12.27V154.71A12.27,12.27,0,0,0,12.27,167H154.71A12.27,12.27,0,0,0,167,154.71V12.27A12.27,12.27,0,0,0,154.71,0ZM126,134.48l-33.07.33L74.51,62.19a14.33,14.33,0,0,0-7.64-9.37A15.82,15.82,0,0,0,60,51.23c-8.3,0-11,6.32-11,14.07l2.56,69.15h-26V68.86c0-20.23,13.5-36.7,35.13-36.7a42.06,42.06,0,0,1,5,.31c16.72,2.05,30,14.26,32.89,29.79l4.78,21.67a1.69,1.69,0,0,0,3.32-.15L113,33.83l28.43.06Z" />
                </g>
              </g>
            </svg>
          </div>
        </Card>
      </div>
    </div>
  );
}
