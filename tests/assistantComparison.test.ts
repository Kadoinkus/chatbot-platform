import { describe, it, expect } from 'vitest';
import {
  calculateTotals,
  calculateAssistantCosts,
  formatNumber,
  formatPercent,
  formatDuration,
} from '@/lib/analytics/assistantComparison';
import type { AssistantWithMetrics } from '@/lib/analytics/assistantComparison';

const baseAssistant: AssistantWithMetrics = {
  assistantId: 'a1',
  assistantName: 'Alpha',
  assistantImage: '',
  clientId: 'c1',
  status: 'Active',
  overview: {
    totalSessions: 10,
    totalMessages: 100,
    totalTokens: 1000,
    totalCostEur: 5,
    averageResponseTimeMs: 2000,
    averageSessionDurationSeconds: 120,
    resolutionRate: 80,
    escalationRate: 10,
  },
  sentiment: { positive: 6, neutral: 3, negative: 1 },
  categories: [],
  questions: [],
  unanswered: [],
  countries: [],
  languages: [],
  devices: [],
  animations: {
    totalTriggers: 0,
    easterEggsTriggered: 0,
    sessionsWithEasterEggs: 0,
    totalSessions: 0,
    topAnimations: [],
    topEasterEggs: [],
    waitSequences: [],
  },
  sessions: [],
  timeSeries: [{ date: '2025-01-01', sessions: 2, messages: 10, tokens: 100, cost: 1 }],
};

describe('assistantComparison utilities', () => {
  it('aggregates totals across assistants', () => {
    const totals = calculateTotals([baseAssistant]);
    expect(totals.totalSessions).toBe(10);
    expect(totals.totalMessages).toBe(100);
    expect(totals.totalCostEur).toBe(5);
    expect(totals.avgResolutionRate).toBe(80);
    expect(totals.sentiment.positive).toBeGreaterThan(0);
  });

  it('calculates assistant costs including analytics', () => {
    const assistant = {
      ...baseAssistant,
      overview: { ...baseAssistant.overview, totalSessions: 2 },
      sessions: [
        { total_cost_eur: 1, analysis: { analytics_total_cost_eur: 0.5 } },
        { total_cost_eur: 2, analysis: { analytics_total_cost_eur: 1 } },
      ] as any,
    };
    const costs = calculateAssistantCosts(assistant);
    expect(costs.totalCost).toBeCloseTo(4.5);
    expect(costs.costPerSession).toBeCloseTo(2.25);
  });

  it('formats helpers correctly', () => {
    expect(formatNumber(1200)).toBe('1.2K');
    expect(formatPercent(42)).toBe('42%');
    expect(formatDuration(75)).toBe('1m 15s');
  });
});
