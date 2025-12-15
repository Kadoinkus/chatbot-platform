'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Assistant, Client, Workspace } from '@/types';
import { getClientBrandColor, registerClientPalette } from '@/lib/brandColors';
import { Plus, Building2, ChevronRight, Server, Users } from 'lucide-react';
import { Page, PageContent, PageHeader, Button, Card, Badge, EmptyState, UsageLimitBar } from '@/components/ui';
import { FilterBar } from '@/components/analytics';

type WorkspaceWithAssistants = Workspace & { assistants: Assistant[] };

export default function HomeClient({ client, workspaces }: { client: Client | null; workspaces: WorkspaceWithAssistants[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Register client palette for brand color lookups
  useEffect(() => {
    if (client?.palette?.primary) {
      registerClientPalette(client.id, client.palette.primary);
      registerClientPalette(client.slug, client.palette.primary);
    }
  }, [client]);

  const filteredWorkspaces = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return workspaces.filter(workspace =>
      workspace.name.toLowerCase().includes(query) ||
      workspace.description?.toLowerCase().includes(query) ||
      workspace.assistants.some(assistant => assistant.name.toLowerCase().includes(query))
    );
  }, [searchTerm, workspaces]);

  if (!client) {
    return (
      <Page>
        <PageContent>
          <EmptyState
            icon={<Building2 size={48} />}
            title="Client not found"
            message="The requested client could not be found."
          />
        </PageContent>
      </Page>
    );
  }

  const getPlanBadge = (plan: string) => {
    const planMap: Record<string, 'starter' | 'basic' | 'premium' | 'enterprise'> = {
      starter: 'starter',
      basic: 'basic',
      premium: 'premium',
      enterprise: 'enterprise'
    };
    return planMap[plan] || 'starter';
  };

  return (
    <Page>
      <PageContent>
        <PageHeader
          title="Workspaces"
          description={`Manage your workspaces and AI assistants for ${client.name}`}
        />

        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search workspaces and AI assistants..."
          extraActions={
            <Button icon={<Plus size={18} />}>
              New Workspace
            </Button>
          }
        />

        {/* Workspace Cards - 2 column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredWorkspaces.map(workspace => {
            const assistants = workspace.assistants;
            const activeAssistants = assistants.filter(a => a.status === 'Active').length;
            const pausedAssistants = assistants.filter(a => a.status === 'Paused').length;

            return (
              <Card key={workspace.id} hover padding="none">
                {/* Header */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="text-lg font-bold text-foreground truncate">{workspace.name}</h3>
                      <Badge plan={getPlanBadge(workspace.plan)} className="flex-shrink-0">
                        {workspace.plan}
                      </Badge>
                    </div>
                    <Link href={`/app/${client.slug}/workspace/${workspace.slug}`}>
                      <Button size="sm" variant="ghost" iconRight={<ChevronRight size={14} />}>
                        Manage
                      </Button>
                    </Link>
                  </div>
                  {workspace.description && (
                    <p className="text-sm text-foreground-secondary line-clamp-1">{workspace.description}</p>
                  )}
                </div>

                {/* Usage Bars */}
                {(() => {
                  const bundleLoads = workspace.bundleLoads || { used: 0, limit: 1000, remaining: 1000 };
                  const sessions = workspace.sessions || { used: 0, limit: 5000, remaining: 5000 };

                  return (
                    <div className="border-t border-border px-4 py-3 space-y-3">
                      {/* Bundle Loads */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Server size={14} className="text-foreground-tertiary" />
                            <span className="text-xs font-medium text-foreground-secondary">Bundle Loads</span>
                          </div>
                          <span className="text-xs text-foreground-tertiary">
                            {bundleLoads.used.toLocaleString()} / {bundleLoads.limit.toLocaleString()}
                          </span>
                        </div>
                        <UsageLimitBar used={bundleLoads.used} limit={bundleLoads.limit} />
                      </div>

                      {/* Sessions */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Users size={14} className="text-foreground-tertiary" />
                            <span className="text-xs font-medium text-foreground-secondary">Sessions</span>
                          </div>
                          <span className="text-xs text-foreground-tertiary">
                            {sessions.used.toLocaleString()} / {sessions.limit.toLocaleString()}
                          </span>
                        </div>
                        <UsageLimitBar used={sessions.used} limit={sessions.limit} />
                      </div>

                      {/* Reset info */}
                      {(() => {
                        const resetInterval = workspace.usageResetInterval || workspace.billingCycle || 'monthly';
                        const nextDate = workspace.nextUsageResetDate || workspace.nextBillingDate;

                        // Calculate fallback date if not set
                        let displayDate: string | null = null;
                        if (nextDate) {
                          displayDate = new Date(nextDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        } else if (resetInterval === 'monthly') {
                          const now = new Date();
                          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                          displayDate = nextMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }

                        return (
                          <p className="text-xs text-foreground-tertiary pt-1">
                            Resets {resetInterval}
                            {displayDate && <> · Next: {displayDate}</>}
                          </p>
                        );
                      })()}
                    </div>
                  );
                })()}

                {/* AI Assistants Section */}
                <div className="border-t border-border px-4 py-3">
                  {assistants.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          {assistants.slice(0, 5).map(assistant => (
                            <div
                              key={assistant.id}
                              className="relative w-14 h-14 rounded-full border-2 border-background -ml-4 first:ml-0 overflow-hidden"
                              style={{ backgroundColor: client?.palette?.primary || getClientBrandColor(assistant.clientId) }}
                            >
                              {assistant.image?.trim() ? (
                                <Image
                                  src={assistant.image.trim()}
                                  alt={assistant.name}
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">
                                  {assistant.name.charAt(0)}
                                </div>
                              )}
                            </div>
                          ))}
                          {assistants.length > 5 && (
                            <span className="w-14 h-14 rounded-full border-2 border-background -ml-4 bg-background-tertiary flex items-center justify-center text-sm font-medium text-foreground-secondary">
                              +{assistants.length - 5}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-foreground-tertiary">
                          {activeAssistants > 0 && <span className="text-success-600 dark:text-success-500">{activeAssistants} active</span>}
                          {activeAssistants > 0 && pausedAssistants > 0 && <span> · </span>}
                          {pausedAssistants > 0 && <span className="text-warning-600 dark:text-warning-500">{pausedAssistants} paused</span>}
                        </span>
                      </div>
                      <p className="text-xs text-foreground-tertiary">
                        {assistants.slice(0, 3).map(a => a.name).join(', ')}
                        {assistants.length > 3 && ` +${assistants.length - 3} more`}
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground-tertiary">No AI assistants assigned</span>
                      <Button size="sm" variant="ghost" icon={<Plus size={14} />}>
                        Add AI Assistant
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {filteredWorkspaces.length === 0 && workspaces.length === 0 && (
          <EmptyState
            icon={<Building2 size={48} />}
            title="No workspaces yet"
            message="Create your first workspace to organize your AI assistants and manage resources."
            action={
              <Button icon={<Plus size={18} />}>
                Create First Workspace
              </Button>
            }
          />
        )}

        {filteredWorkspaces.length === 0 && workspaces.length > 0 && (
          <EmptyState
            title="No results found"
            message="No workspaces found matching your search."
          />
        )}
      </PageContent>
    </Page>
  );
}
