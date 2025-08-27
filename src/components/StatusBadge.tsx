export default function StatusBadge({ status }:{ status: 'Live'|'Paused'|'Needs finalization' }) {
  const map = {
    'Live': { color: 'bg-green-500', label: 'Live' },
    'Paused': { color: 'bg-yellow-500', label: 'Paused' },
    'Needs finalization': { color: 'bg-red-500', label: 'Needs finalization' }
  }[status];
  return <span className="badge bg-neutral-100"><span className={`status-dot ${map.color}`}></span>{map.label}</span>;
}
