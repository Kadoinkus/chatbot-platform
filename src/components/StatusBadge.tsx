export default function StatusBadge({ status }:{ status: 'Live'|'Paused'|'Needs finalization' }) {
  const map = {
    'Live': { color: 'bg-status-live', label: 'Live' },
    'Paused': { color: 'bg-status-paused', label: 'Paused' },
    'Needs finalization': { color: 'bg-status-needs-finalization', label: 'Needs finalization' }
  }[status];
  return <span className="badge bg-background-tertiary text-foreground-secondary"><span className={`status-dot ${map.color}`}></span>{map.label}</span>;
}
