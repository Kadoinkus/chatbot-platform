import { Suspense } from 'react';
import { db } from '@/lib/db';
import type { Assistant, Client, Workspace } from '@/types';
import { Spinner } from '@/components/ui';
import AssistantsClient from './AssistantsClient';

type AssistantWithWorkspace = Assistant & { workspace?: Workspace; workspaceName?: string };

async function fetchData(clientId: string) {
  const [client, workspaces, assistants] = await Promise.all([
    db.clients.getByIdOrSlug(clientId),
    db.workspaces.getByClientId(clientId),
    db.assistants.getByClientId(clientId),
  ]);

  const workspaceMap = (workspaces || []).reduce<Record<string, Workspace>>((acc, ws) => {
    acc[ws.id] = ws;
    return acc;
  }, {});

  const assistantsEnriched: AssistantWithWorkspace[] = assistants.map(a => ({
    ...a,
    workspace: workspaceMap[a.workspaceId],
    workspaceName: workspaceMap[a.workspaceId]?.name,
  }));

  return { client, workspaces, assistants: assistantsEnriched };
}

export default async function AllAssistantsPage({ params }: { params: { clientId: string } }) {
  return (
    <Suspense fallback={<div className="p-6 flex justify-center"><Spinner size="lg" /></div>}>
      <AllAssistantsContent clientId={params.clientId} />
    </Suspense>
  );
}

async function AllAssistantsContent({ clientId }: { clientId: string }) {
  const { client, workspaces, assistants } = await fetchData(clientId);
  return (
    <AssistantsClient
      client={client}
      assistants={assistants}
      workspaces={workspaces}
    />
  );
}
