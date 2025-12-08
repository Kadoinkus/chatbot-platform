import type { AgentStatus } from '@/types';

export default function StatusBadge({ status }: { status: AgentStatus }) {
  const map: Record<AgentStatus, { color: string; label: string }> = {
    'Active': { color: 'bg-status-live', label: 'Active' },
    'Paused': { color: 'bg-status-paused', label: 'Paused' },
    'Disabled': { color: 'bg-status-needs-finalization', label: 'Disabled' },
    'Draft': { color: 'bg-status-needs-finalization', label: 'Draft' }
  };
  const config = map[status];
  return <span className="badge bg-background-tertiary text-foreground-secondary"><span className={`status-dot ${config.color}`}></span>{config.label}</span>;
}
