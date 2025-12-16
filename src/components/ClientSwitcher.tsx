'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Check, Search, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { Client } from '@/types';

const LAST_CLIENT_KEY = 'superadmin-last-client';
const PINNED_CLIENTS_KEY = 'superadmin-pinned-clients';

type ClientWithoutLogin = Omit<Client, 'login'>;

interface ClientSwitcherProps {
  compact?: boolean;
}

export default function ClientSwitcher({ compact = false }: ClientSwitcherProps) {
  const { session, client, accessibleClients } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [pinnedSlugs, setPinnedSlugs] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load pinned clients from localStorage
  useEffect(() => {
    const savedPinned = localStorage.getItem(PINNED_CLIENTS_KEY);
    if (savedPinned) {
      try {
        setPinnedSlugs(JSON.parse(savedPinned));
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    const clients = accessibleClients || [];
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

    // Sort: current first, then pinned, then alphabetically
    return filtered.sort((a, b) => {
      const aIsCurrent = a.slug === session?.clientSlug;
      const bIsCurrent = b.slug === session?.clientSlug;
      const aIsPinned = pinnedSlugs.includes(a.slug);
      const bIsPinned = pinnedSlugs.includes(b.slug);

      if (aIsCurrent) return -1;
      if (bIsCurrent) return 1;
      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [accessibleClients, search, pinnedSlugs, session?.clientSlug]);

  // Only show for superadmins - must be after all hooks
  if (!session?.isSuperadmin) {
    return null;
  }

  // Handle client selection
  async function handleSelectClient(clientSlug: string) {
    if (clientSlug === session?.clientSlug) {
      setIsOpen(false);
      return;
    }

    setIsSelecting(true);

    try {
      const response = await fetch('/api/auth/select-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientSlug }),
      });

      if (!response.ok) {
        throw new Error('Failed to select client');
      }

      const { data } = await response.json();

      // Save to localStorage
      localStorage.setItem(LAST_CLIENT_KEY, clientSlug);

      // Full page reload to the new client
      window.location.href = data.redirectUrl;
    } catch (err) {
      console.error('Failed to select client:', err);
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

  const clientCount = accessibleClients?.length || 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSelecting}
        className={`
          flex items-center gap-2 rounded-lg transition-colors
          ${compact
            ? 'w-12 h-12 justify-center hover:bg-sidebar-item-hover'
            : 'px-3 py-2 bg-surface-elevated hover:bg-surface-hover border border-border'
          }
          ${isSelecting ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        `}
        title={compact ? `Switch Client (${client?.name || 'Select'})` : undefined}
      >
        {compact ? (
          // Compact mode: just show client initial
          <div className="w-6 h-6 rounded bg-interactive text-foreground-inverse flex items-center justify-center text-xs font-bold">
            {client?.name?.charAt(0).toUpperCase() || '?'}
          </div>
        ) : (
          // Full mode: show client name and count
          <>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {client?.name || 'Select Client'}
              </div>
              <div className="text-xs text-foreground-secondary">
                {clientCount} clients available
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-foreground-secondary transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`
            absolute z-50 bg-surface-elevated border border-border rounded-lg shadow-lg overflow-hidden
            ${compact ? 'left-full ml-2 top-0' : 'left-0 top-full mt-1'}
            w-72 max-h-96
          `}
        >
          {/* Search */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-tertiary" />
              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-interactive"
                autoFocus
              />
            </div>
          </div>

          {/* Client list */}
          <div className="max-h-72 overflow-y-auto">
            {filteredClients.length === 0 ? (
              <div className="p-4 text-center text-foreground-secondary text-sm">
                {search ? 'No clients match your search' : 'No clients available'}
              </div>
            ) : (
              filteredClients.map((c) => {
                const isCurrent = c.slug === session?.clientSlug;
                const isPinned = pinnedSlugs.includes(c.slug);

                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectClient(c.slug)}
                    disabled={isSelecting}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 text-left transition-colors
                      ${isCurrent ? 'bg-interactive/10' : 'hover:bg-surface-hover'}
                      ${isSelecting ? 'opacity-50' : ''}
                    `}
                  >
                    {/* Logo or initial */}
                    <div className="w-8 h-8 rounded bg-surface-hover flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {c.logoUrl ? (
                        <img
                          src={c.logoUrl}
                          alt={c.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-foreground-secondary">
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Client info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {c.name}
                      </div>
                      <div className="text-xs text-foreground-secondary truncate">
                        {c.slug}
                      </div>
                    </div>

                    {/* Current indicator */}
                    {isCurrent && (
                      <Check className="w-4 h-4 text-interactive flex-shrink-0" />
                    )}

                    {/* Pin button */}
                    <button
                      onClick={(e) => togglePin(c.slug, e)}
                      className={`
                        p-1 rounded transition-colors flex-shrink-0
                        ${isPinned ? 'text-warning-500' : 'text-foreground-tertiary hover:text-foreground-secondary'}
                      `}
                      title={isPinned ? 'Unpin' : 'Pin'}
                    >
                      <Star
                        className="w-4 h-4"
                        fill={isPinned ? 'currentColor' : 'none'}
                      />
                    </button>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border bg-surface">
            <a
              href="/select-client"
              className="block w-full text-center text-sm text-interactive hover:text-interactive-hover py-1"
            >
              Open full picker
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
