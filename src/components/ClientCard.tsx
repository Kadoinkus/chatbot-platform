import Link from 'next/link';
import StatusBadge from './StatusBadge';
import { MessageSquare } from 'lucide-react';
import type { AgentStatus } from '@/types';

export default function ClientCard({ clientId, name, slug, primary, assistants }:{
  clientId: string; name: string; slug: string; primary: string;
  assistants: Array<{ id: string; name: string; status: AgentStatus; conversations: number }>
}) {
  const total = assistants.reduce((acc, m) => acc + (m.conversations || 0), 0);
  return (
    <Link href={`/app/${clientId}`} className="card p-6 hover:shadow-md transition block">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl" style={{ backgroundColor: primary }} />
          <div>
            <div className="font-semibold">{name}</div>
            <div className="text-xs text-neutral-500">@{slug}</div>
          </div>
        </div>
        <div className="text-sm text-neutral-600 flex items-center gap-1"><MessageSquare size={16} /> {total} conversations</div>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        {assistants.map(m => (
          <div key={m.id} className="rounded-xl border p-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="font-medium">{m.name}</div>
              <StatusBadge status={m.status} />
            </div>
            <div className="mt-2 text-xs text-neutral-600 flex items-center gap-1">
              <MessageSquare size={14} /> Active convos: {m.conversations}
            </div>
          </div>
        ))}
      </div>
    </Link>
  );
}
