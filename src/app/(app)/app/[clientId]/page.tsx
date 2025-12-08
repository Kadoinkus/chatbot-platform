'use client';
import { useState, useEffect } from 'react';
import { getClientById, getWorkspacesByClientId, getAssistantsByWorkspaceId } from '@/lib/dataService';
import type { Client, Workspace, Assistant } from '@/lib/dataService';
import AssistantCard from '@/components/AssistantCard';
import { Plus, Search, Filter, Bot as BotIcon } from 'lucide-react';
import Link from 'next/link';
import {
  Page,
  PageContent,
  PageHeader,
  Button,
  Input,
  Select,
  Card,
  Spinner,
  EmptyState,
} from '@/components/ui';

export default function AllAssistantsPage({ params }: { params: { clientId: string } }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('all');
  const [client, setClient] = useState<Client | undefined>();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [allAssistants, setAllAssistants] = useState<(Assistant & { workspaceName: string; workspace: Workspace })[]>([]);
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

        // Load all assistants from all workspaces
        const assistantsWithWorkspace: (Assistant & { workspaceName: string; workspace: Workspace })[] = [];
        for (const ws of workspacesData || []) {
          const assistants = await getAssistantsByWorkspaceId(ws.id);
          assistants.forEach(assistant => {
            assistantsWithWorkspace.push({
              ...assistant,
              workspaceName: ws.name,
              workspace: ws
            });
          });
        }
        setAllAssistants(assistantsWithWorkspace);

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
            icon={<BotIcon size={48} />}
            title="Client not found"
            message="The requested client could not be found."
          />
        </PageContent>
      </Page>
    );
  }

  // Filter assistants based on search term and selected workspace
  const filteredAssistants = allAssistants.filter(assistant => {
    const matchesSearch =
      assistant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assistant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assistant.workspaceName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesWorkspace =
      selectedWorkspace === 'all' ||
      assistant.workspaceId === selectedWorkspace;

    return matchesSearch && matchesWorkspace;
  });

  const workspaceOptions = [
    { value: 'all', label: 'All Workspaces' },
    ...workspaces.map(ws => ({ value: ws.id, label: ws.name }))
  ];

  return (
    <Page>
      <PageContent>
            <PageHeader
              title="Your AI Assistants"
              description={`Manage all your AI assistants across all workspaces for ${client.name}`}
            />

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 mb-6">
              <div className="flex-1 max-w-md">
                <Input
                  icon={<Search size={20} />}
                  placeholder="Search AI assistants and workspaces..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Workspace Filter */}
              <Select
                fullWidth={false}
                options={workspaceOptions}
                value={selectedWorkspace}
                onChange={(e) => setSelectedWorkspace(e.target.value)}
                minWidth="180px"
              />

              <Link href={`/app/${client.id}/marketplace`}>
                <Button icon={<Plus size={18} />}>
                  New AI Assistant
                </Button>
              </Link>
            </div>

            {/* Assistant Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {filteredAssistants.map(assistant => (
                <AssistantCard
                  key={assistant.id}
                  assistant={assistant}
                  clientId={client.id}
                  workspaceName={assistant.workspaceName}
                  workspace={assistant.workspace}
                />
              ))}
            </div>

            {/* Empty States */}
            {filteredAssistants.length === 0 && allAssistants.length === 0 && (
              <EmptyState
                icon={<BotIcon size={48} />}
                title="No AI assistants yet"
                message="Create your first AI assistant to get started."
                action={
                  <Link href={`/app/${client.id}/marketplace`}>
                    <Button icon={<Plus size={18} />}>
                      Create First AI Assistant
                    </Button>
                  </Link>
                }
              />
            )}

            {filteredAssistants.length === 0 && allAssistants.length > 0 && (
              <EmptyState
                title="No results found"
                message="No AI assistants found matching your search criteria."
                action={
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedWorkspace('all');
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            )}
      </PageContent>
    </Page>
  );
}
