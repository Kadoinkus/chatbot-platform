import { describe, it, expect } from 'vitest';
import { normalizeChatSession, mapAssistantFromMascot } from '@/lib/db/mappers';

describe('db mappers', () => {
  it('normalizes chat session fields and derives referrer domain', () => {
    const raw = {
      id: 'sess-1',
      mascot_slug: 'm1',
      client_slug: 'demo',
      session_start: '2025-01-01T10:00:00Z',
      session_end: '2025-01-01T10:05:30Z',
      total_user_messages: 3,
      total_bot_messages: 5,
      browser: 'Chrome 120.0',
      os: 'Windows 11',
      referrer_url: 'https://example.com/landing',
      country: 'NL',
      device_type: 'mobile',
      ip_address: '192.168.1.25',
    };

    const session = normalizeChatSession(raw);

    expect(session.id).toBe('sess-1');
    expect(session.session_duration_seconds).toBe(330); // 5m 30s
    expect(session.total_messages).toBe(8);
    expect(session.browser_name).toBe('Chrome');
    expect(session.os_name).toBe('Windows');
    expect(session.referrer_domain).toBe('example.com');
    expect(session.visitor_ip_hash?.endsWith('.xxx')).toBe(true);
    expect(session.is_mobile).toBe(true);
  });

  it('maps mascot to assistant with normalized status and metrics', () => {
    const raw = {
      mascot_slug: 'm1',
      client_slug: 'demo',
      workspace_id: 'ws_1',
      name: 'Helper',
      status: 'active',
      total_conversations: 42,
      avg_response_time_ms: 1500,
      resolution_rate: 87,
    };

    const assistant = mapAssistantFromMascot(raw);
    expect(assistant.id).toBe('m1');
    expect(assistant.clientId).toBe('demo');
    expect(assistant.workspaceId).toBe('ws_1');
    expect(assistant.status).toBe('Active');
    expect(assistant.metrics.responseTime).toBeCloseTo(1.5);
    expect(assistant.metrics.resolutionRate).toBe(87);
  });
});
