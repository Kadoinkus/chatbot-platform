'use client';
import { useState, useEffect } from 'react';
import { getClientById, getWorkspacesByClientId, getBotsByWorkspaceId } from '@/lib/dataService';
import type { Client, Workspace, Bot } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import BotCard from '@/components/BotCard';
import AuthGuard from '@/components/AuthGuard';
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

export default function AllBotsPage({ params }: { params: { clientId: string } }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('all');
  const [client, setClient] = useState<Client | undefined>();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [allBots, setAllBots] = useState<(Bot & { workspaceName: string })[]>([]);
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

        // Load all bots from all workspaces
        const botsWithWorkspace: (Bot & { workspaceName: string })[] = [];
        for (const workspace of workspacesData || []) {
          const bots = await getBotsByWorkspaceId(workspace.id);
          bots.forEach(bot => {
            botsWithWorkspace.push({
              ...bot,
              workspaceName: workspace.name
            });
          });
        }
        setAllBots(botsWithWorkspace);

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
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={params.clientId} />
        <Page className="flex items-center justify-center">
          <Spinner size="lg" />
        </Page>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={params.clientId} />
        <Page>
          <PageContent>
            <EmptyState
              icon={<BotIcon size={48} />}
              title="Client not found"
              message="The requested client could not be found."
            />
          </PageContent>
        </Page>
      </div>
    );
  }

  // Filter bots based on search term and selected workspace
  const filteredBots = allBots.filter(bot => {
    const matchesSearch =
      bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bot.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bot.workspaceName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesWorkspace =
      selectedWorkspace === 'all' ||
      bot.workspaceId === selectedWorkspace;

    return matchesSearch && matchesWorkspace;
  });

  const workspaceOptions = [
    { value: 'all', label: 'All Workspaces' },
    ...workspaces.map(ws => ({ value: ws.id, label: ws.name }))
  ];

  return (
    <AuthGuard clientId={params.clientId}>
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={client.id} />

        <Page>
          <PageContent>
            <PageHeader
              title="All Bots"
              description={`Manage all your AI assistants across all workspaces for ${client.name}`}
            />

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 mb-6">
              <div className="flex-1 max-w-md">
                <Input
                  icon={<Search size={20} />}
                  placeholder="Search bots and workspaces..."
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
                  New Bot
                </Button>
              </Link>
            </div>

            {/* Bot Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {filteredBots.map(bot => (
                <BotCard
                  key={bot.id}
                  bot={bot}
                  clientId={client.id}
                  workspaceName={bot.workspaceName}
                />
              ))}
            </div>

            {/* Empty States */}
            {filteredBots.length === 0 && allBots.length === 0 && (
              <EmptyState
                icon={<BotIcon size={48} />}
                title="No bots yet"
                message="Create your first bot to get started with AI assistance."
                action={
                  <Link href={`/app/${client.id}/marketplace`}>
                    <Button icon={<Plus size={18} />}>
                      Create First Bot
                    </Button>
                  </Link>
                }
              />
            )}

            {filteredBots.length === 0 && allBots.length > 0 && (
              <EmptyState
                title="No results found"
                message="No bots found matching your search criteria."
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
      </div>
    </AuthGuard>
  );
}
