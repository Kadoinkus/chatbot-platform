type DevSessionCandidate = {
  domain?: string | null;
  ip_address?: string | null;
  is_dev?: boolean | null;
};

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
  if (isLocalhostDomain(row.domain)) return true;
  const ip = (row.ip_address || '').trim();
  return ip === '::1' && row.is_dev === true;
}

export function filterDevSessions<T extends DevSessionCandidate>(rows: T[]): T[] {
  return rows.filter((row) => !shouldExcludeDevSession(row));
}
