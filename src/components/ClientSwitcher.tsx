'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { Client } from '@/types';

type ClientWithoutLogin = Omit<Client, 'login'>;

interface ClientSwitcherProps {
  compact?: boolean;
}

export default function ClientSwitcher({ compact = false }: ClientSwitcherProps) {
  const { session, client, accessibleClients, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Filter and sort clients: current first, then alphabetically
  const filteredClients = useMemo(() => {
    const clients = accessibleClients || [];

    // Filter if search is active
    const filtered = search
      ? clients.filter((c) => {
          const searchLower = search.toLowerCase();
          return (
            c.name.toLowerCase().includes(searchLower) ||
            c.slug.toLowerCase().includes(searchLower)
          );
        })
      : clients;

    // Copy before sorting to avoid mutating shared context state
    return [...filtered].sort((a, b) => {
      if (a.slug === session?.clientSlug) return -1;
      if (b.slug === session?.clientSlug) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [accessibleClients, search, session?.clientSlug]);

  // Gate on isLoading first to prevent hydration mismatch
  if (isLoading) {
    return null;
  }

  // Only show for superadmins
  if (!session?.isSuperadmin) {
    return null;
  }

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
      window.location.href = data.redirectUrl;
    } catch (err) {
      console.error('Failed to select client:', err);
      setIsSelecting(false);
    }
  }

  const clientCount = accessibleClients?.length || 0;
  const showSearch = clientCount > 5;

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
          <ChevronDown className="w-5 h-5 text-sidebar-text" />
        ) : (
          <>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {client?.name || 'Select Client'}
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
            w-64
          `}
        >
          {/* Search - only show if more than 5 clients */}
          {showSearch && (
            <div className="p-2 border-b border-border">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-interactive"
                autoFocus
              />
            </div>
          )}

          {/* Client list */}
          <div className="max-h-64 overflow-y-auto py-1">
            {filteredClients.length === 0 ? (
              <div className="px-3 py-2 text-foreground-secondary text-sm">
                {search ? 'No results' : 'No clients'}
              </div>
            ) : (
              filteredClients.map((c) => {
                const isCurrent = c.slug === session?.clientSlug;

                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectClient(c.slug)}
                    disabled={isSelecting}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 text-left transition-colors
                      ${isCurrent ? 'bg-interactive/10' : 'hover:bg-surface-hover'}
                      ${isSelecting ? 'opacity-50' : ''}
                    `}
                  >
                    <div className="min-w-0">
                      <span className="text-sm text-foreground">{c.name}</span>
                      <span className="text-xs text-foreground-tertiary ml-2">{c.slug}</span>
                    </div>
                    {isCurrent && (
                      <Check className="w-4 h-4 text-interactive flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
