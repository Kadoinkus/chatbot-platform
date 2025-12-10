'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Plus, Bot as BotIcon } from 'lucide-react';
import type { Assistant, Client, Workspace } from '@/types';
import AssistantCard from '@/components/AssistantCard';
import { Page, PageContent, PageHeader, Button, EmptyState } from '@/components/ui';
import { FilterBar } from '@/components/analytics';

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

  return (
    <Page>
      <PageContent>
        <PageHeader
          title="Your AI Assistants"
          description={`Manage all your AI assistants across all workspaces for ${client.name}`}
        />

        {/* Search and Filters */}
        <FilterBar
          workspaces={workspaces}
          selectedWorkspace={selectedWorkspace}
          onWorkspaceChange={setSelectedWorkspace}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search AI assistants and workspaces..."
          extraActions={
            <Link href={`/app/${client.slug}/marketplace`}>
              <Button icon={<Plus size={18} />}>
                New AI Assistant
              </Button>
            </Link>
          }
        />

        {/* Assistant Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {filteredAssistants.map(assistant => (
            <AssistantCard
              key={assistant.id}
              assistant={assistant}
              clientId={client.slug}
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
              <Link href={`/app/${client.slug}/marketplace`}>
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
