import { Suspense } from 'react';
import { getDbForClient } from '@/lib/db';
import type { Assistant, Client, Workspace } from '@/types';
import { Spinner } from '@/components/ui';
import HomeClient from './HomeClient';

type WorkspaceWithAssistants = Workspace & { assistants: Assistant[] };

async function fetchData(clientId: string) {
  const db = getDbForClient(clientId);
  const [client, workspaces, assistants] = await Promise.all([
    db.clients.getByIdOrSlug(clientId),
    db.workspaces.getByClientId(clientId),
    db.assistants.getByClientId(clientId),
  ]);

  const assistantsByWorkspace = assistants.reduce<Record<string, Assistant[]>>((acc, assistant) => {
    const list = acc[assistant.workspaceId] || [];
    list.push(assistant);
    acc[assistant.workspaceId] = list;
    return acc;
  }, {});

  const workspaceList: WorkspaceWithAssistants[] = (workspaces || []).map(ws => ({
    ...ws,
    assistants: assistantsByWorkspace[ws.id] || [],
  }));

  return { client, workspaces: workspaceList };
}

export default async function HomePage({ params }: { params: { clientId: string } }) {
  return (
    <Suspense fallback={<div className="p-6 flex justify-center"><Spinner size="lg" /></div>}>
      <HomePageContent clientId={params.clientId} />
    </Suspense>
  );
}

async function HomePageContent({ clientId }: { clientId: string }) {
  const { client, workspaces } = await fetchData(clientId);
  return <HomeClient client={client} workspaces={workspaces} />;
}
