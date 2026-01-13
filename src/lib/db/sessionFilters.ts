type DevSessionCandidate = {
  domain?: string | null;
  ip_address?: string | null;
  is_dev?: boolean | null;
  total_messages?: number | string | null;
  total_bot_messages?: number | string | null;
  total_user_messages?: number | string | null;
};

function normalizeCount(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function getTotalMessages(row: DevSessionCandidate): number | null {
  const total = normalizeCount(row.total_messages);
  if (total !== null) return total;

  const bot = normalizeCount(row.total_bot_messages);
  const user = normalizeCount(row.total_user_messages);
  if (bot === null && user === null) return null;
  return (bot ?? 0) + (user ?? 0);
}

function isLocalhostDomain(domain?: string | null): boolean {
  const normalized = (domain || '').trim().toLowerCase();
  if (!normalized) return false;

  let host = normalized;
  if (normalized.includes('://')) {
    try {
      host = new URL(normalized).hostname.toLowerCase();
    } catch {
      host = normalized;
    }
  } else if (normalized.includes('/')) {
    try {
      host = new URL(`http://${normalized}`).hostname.toLowerCase();
    } catch {
      host = normalized;
    }
  }

  if (host === 'localhost') return true;
  return host.startsWith('localhost:');
}

export function shouldExcludeDevSession(row: DevSessionCandidate): boolean {
  const totalMessages = getTotalMessages(row);
  if (totalMessages !== null && totalMessages <= 0) return true;
  if (isLocalhostDomain(row.domain)) return true;
  const ip = (row.ip_address || '').trim();
  return ip === '::1' && row.is_dev === true;
}

export function filterDevSessions<T extends DevSessionCandidate>(rows: T[]): T[] {
  return rows.filter((row) => !shouldExcludeDevSession(row));
}
