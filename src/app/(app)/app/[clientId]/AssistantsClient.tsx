'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Plus, Search, Bot as BotIcon } from 'lucide-react';
import type { Assistant, Client, Workspace } from '@/types';
import AssistantCard from '@/components/AssistantCard';
import {
  Page,
  PageContent,
  PageHeader,
  Button,
  Input,
  Select,
  EmptyState,
} from '@/components/ui';

type AssistantWithWorkspace = Assistant & { workspace?: Workspace; workspaceName?: string };

export default function AssistantsClient({
  client,
  assistants,
  workspaces,
}: {
  client: Client | null;
  assistants: AssistantWithWorkspace[];
  workspaces: Workspace[];
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('all');

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

  const filteredAssistants = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return assistants.filter(assistant => {
      const matchesSearch =
        assistant.name.toLowerCase().includes(query) ||
        assistant.description.toLowerCase().includes(query) ||
        assistant.workspaceName?.toLowerCase().includes(query);

      const matchesWorkspace =
        selectedWorkspace === 'all' ||
        assistant.workspaceId === selectedWorkspace;

      return matchesSearch && matchesWorkspace;
    });
  }, [assistants, searchTerm, selectedWorkspace]);

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
        {filteredAssistants.length === 0 && assistants.length === 0 && (
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

        {filteredAssistants.length === 0 && assistants.length > 0 && (
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
