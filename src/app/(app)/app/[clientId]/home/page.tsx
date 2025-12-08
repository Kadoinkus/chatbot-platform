'use client';
import { useState, useEffect } from 'react';
import { getClientById, getWorkspacesByClientId, getAssistantsByWorkspaceId } from '@/lib/dataService';
import type { Client, Workspace, Assistant } from '@/lib/dataService';
import { getClientBrandColor } from '@/lib/brandColors';
import { Plus, Search, Building2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import {
  Page,
  PageContent,
  PageHeader,
  Button,
  Input,
  Card,
  Badge,
  Spinner,
  EmptyState,
} from '@/components/ui';

export default function HomePage({ params }: { params: { clientId: string } }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [client, setClient] = useState<Client | undefined>();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceAssistants, setWorkspaceAssistants] = useState<Record<string, Assistant[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [clientData, workspacesData] = await Promise.all([
          getClientById(params.clientId),
          getWorkspacesByClientId(params.clientId)
        ]);

        setClient(clientData);
        setWorkspaces(workspacesData || []);

        // Load assistants for each workspace
        const assistantsData: Record<string, Assistant[]> = {};
        for (const workspace of workspacesData || []) {
          const assistants = await getAssistantsByWorkspaceId(workspace.id);
          assistantsData[workspace.id] = assistants || [];
        }
        setWorkspaceAssistants(assistantsData);

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.clientId]);

  if (loading) {
    return (
      <Page className="flex items-center justify-center">
        <Spinner size="lg" />
      </Page>
    );
  }

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

  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workspace.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (workspaceAssistants[workspace.id] || []).some(assistant =>
      assistant.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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

            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 mb-6">
              <div className="flex-1 max-w-md">
                <Input
                  icon={<Search size={20} />}
                  placeholder="Search workspaces and AI assistants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button icon={<Plus size={18} />}>
                New Workspace
              </Button>
            </div>

            {/* Workspace Cards - 2 column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredWorkspaces.map(workspace => {
                const assistants = workspaceAssistants[workspace.id] || [];
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
                        <Link href={`/app/${client.id}/workspace/${workspace.id}`}>
                          <Button size="sm" variant="ghost" iconRight={<ChevronRight size={14} />}>
                            Manage
                          </Button>
                        </Link>
                      </div>
                      {workspace.description && (
                        <p className="text-sm text-foreground-secondary line-clamp-1">{workspace.description}</p>
                      )}
                    </div>

                    {/* AI Assistants Section */}
                    <div className="border-t border-border px-4 py-3">
                      {assistants.length > 0 ? (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                              {assistants.slice(0, 5).map(assistant => (
                                <img
                                  key={assistant.id}
                                  src={assistant.image}
                                  alt={assistant.name}
                                  title={assistant.name}
                                  className="w-8 h-8 rounded-full border-2 border-background -ml-2 first:ml-0"
                                  style={{ backgroundColor: getClientBrandColor(assistant.clientId) }}
                                />
                              ))}
                              {assistants.length > 5 && (
                                <span className="w-8 h-8 rounded-full border-2 border-background -ml-2 bg-background-tertiary flex items-center justify-center text-xs font-medium text-foreground-secondary">
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
