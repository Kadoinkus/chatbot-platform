import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getWorkspaceUsageStatus, calculateProjectedOverage } from '@/lib/billingService';
import type { Workspace } from '@/types';

const baseWorkspace: Workspace = {
  id: 'ws_1',
  slug: 'c1-wp-001',
  workspaceNumber: 1,
  clientId: 'c1',
  clientSlug: 'c1',
  name: 'Test Workspace',
  description: 'Test',
  plan: 'basic',
  status: 'active',
  bundleLoads: { limit: 5000, used: 4000, remaining: 1000 },
  messages: { limit: 100000, used: 20000, remaining: 80000 },
  apiCalls: { limit: 250000, used: 100000, remaining: 150000 },
  sessions: { limit: 25000, used: 10000, remaining: 15000 },
  walletCredits: 50,
  overageRates: { bundleLoads: 0.3, messages: 0.002, apiCalls: 0.00015, sessions: 0.015 },
  billingCycle: 'monthly',
  monthlyFee: 299,
  nextBillingDate: '2025-01-01',
  createdAt: '2025-01-01',
};

describe('billingService', () => {
  describe('getWorkspaceUsageStatus', () => {
    it('computes percentages and over-limit correctly', () => {
      const status = getWorkspaceUsageStatus(baseWorkspace);

      expect(status.bundleLoads.percentage).toBeCloseTo(80);
      expect(status.sessions.percentage).toBeCloseTo(40);
      expect(status.messages.percentage).toBeCloseTo(20);
      expect(status.apiCalls.percentage).toBeCloseTo(40);
      expect(status.isOverLimit).toBe(false);
      expect(status.canOperate).toBe(true);
    });

    it('flags over-limit when bundles or sessions exceed 100%', () => {
      const status = getWorkspaceUsageStatus({
        ...baseWorkspace,
        bundleLoads: { ...baseWorkspace.bundleLoads, used: 6000, remaining: -1000 },
        walletCredits: 0,
      });

      expect(status.isOverLimit).toBe(true);
      expect(status.canOperate).toBe(false);
      expect(status.warnings.some((w) => w.toLowerCase().includes('bundle'))).toBe(true);
    });
  });

  describe('calculateProjectedOverage', () => {
    const fixedDate = new Date('2025-01-15T12:00:00Z');

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(fixedDate);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('projects overage costs when usage exceeds limits', () => {
      const workspace = {
        ...baseWorkspace,
        bundleLoads: { limit: 5000, used: 6000, remaining: -1000 },
        sessions: { limit: 25000, used: 30000, remaining: -5000 },
        messages: { limit: 100000, used: 20000, remaining: 80000 },
        apiCalls: { limit: 250000, used: 250000, remaining: 0 },
      };

      const result = calculateProjectedOverage(workspace);

      expect(result.projectedOverage).toBeGreaterThan(0);
      // Ensure bundles and sessions contribute to total
      expect(result.breakdown.bundleLoads).toBeGreaterThan(0);
      expect(result.breakdown.sessions).toBeGreaterThan(0);
    });
  });
});
