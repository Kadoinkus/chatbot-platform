// Workspace-Centric Billing System
// =================================
// Billing is managed at the WORKSPACE level. Each workspace has its own plan,
// usage limits, and wallet credits. Bots within a workspace share the workspace's
// resource pool.

import type { Workspace, PlanType, UsageCounter } from '@/types';

// =============================================================================
// Plan Configuration
// =============================================================================

export interface PlanConfig {
  tier: PlanType;
  name: string;
  price: number;
  currency: string;
  botSlots: number;
  limits: {
    bundleLoads: number;
    messages: number;
    apiCalls: number;
    storage: string;
    knowledgebaseSize: string;
  };
  features: string[];
  overageRates: {
    bundleLoads: number;
    messages: number;
    apiCalls: number;
  };
}

export const PLAN_CONFIG: Record<PlanType, PlanConfig> = {
  starter: {
    tier: 'starter',
    name: 'Starter',
    price: 99,
    currency: 'EUR',
    botSlots: 1,
    limits: {
      bundleLoads: 1000,
      messages: 25000,
      apiCalls: 50000,
      storage: '50MB',
      knowledgebaseSize: '0.1MB'
    },
    features: [
      '1 bot slot',
      'Basic Q&A chatflow',
      '0.1MB knowledgebase',
      'Basic templates only',
      'Email support',
      'Basic analytics',
      'Standard chat widget',
      'Basic security & encryption'
    ],
    overageRates: {
      bundleLoads: 0.35,
      messages: 0.0025,
      apiCalls: 0.0002
    }
  },
  basic: {
    tier: 'basic',
    name: 'Basic',
    price: 299,
    currency: 'EUR',
    botSlots: 2,
    limits: {
      bundleLoads: 5000,
      messages: 100000,
      apiCalls: 250000,
      storage: '200MB',
      knowledgebaseSize: '0.5MB'
    },
    features: [
      '2 bot slots',
      'Basic chatflow templates',
      '0.5MB knowledgebase',
      'Basic + Pro templates',
      'Priority support',
      'Advanced analytics',
      'Custom branded widget',
      'Enhanced security & compliance'
    ],
    overageRates: {
      bundleLoads: 0.30,
      messages: 0.002,
      apiCalls: 0.00015
    }
  },
  premium: {
    tier: 'premium',
    name: 'Premium',
    price: 2499,
    currency: 'EUR',
    botSlots: 5,
    limits: {
      bundleLoads: 25000,
      messages: 500000,
      apiCalls: 1000000,
      storage: '2GB',
      knowledgebaseSize: '5MB'
    },
    features: [
      'Up to 5 bot slots',
      'Advanced chatflows',
      '5MB knowledgebase',
      'All templates included',
      '24/7 phone support',
      'Custom analytics dashboard',
      'White-label solution',
      'Advanced security & audit logs'
    ],
    overageRates: {
      bundleLoads: 0.25,
      messages: 0.0015,
      apiCalls: 0.0001
    }
  },
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    price: 0, // Custom pricing
    currency: 'EUR',
    botSlots: 10,
    limits: {
      bundleLoads: 100000,
      messages: 2000000,
      apiCalls: 5000000,
      storage: '10GB',
      knowledgebaseSize: '20MB'
    },
    features: [
      'Up to 10 bot slots',
      'Custom chatflows',
      '20MB knowledgebase',
      'All templates + custom design',
      'Dedicated account manager',
      'Custom analytics dashboard',
      'On-premise deployment options',
      'Enterprise-grade security & SLA'
    ],
    overageRates: {
      bundleLoads: 0.20,
      messages: 0.001,
      apiCalls: 0.00008
    }
  }
};

// =============================================================================
// Usage Warning Levels
// =============================================================================

export const USAGE_WARNING_LEVELS = {
  levels: [0.8, 0.9, 0.95, 1.0], // Warning at 80%, 90%, 95%, 100%
  gracePeriod: 24 // Hours before hard stop at 100%
};

// =============================================================================
// Workspace Billing Functions
// =============================================================================

export interface UsageStatus {
  bundleLoads: {
    used: number;
    limit: number;
    percentage: number;
    remaining: number;
  };
  messages: {
    used: number;
    limit: number;
    percentage: number;
    remaining: number;
  };
  apiCalls: {
    used: number;
    limit: number;
    percentage: number;
    remaining: number;
  };
  warnings: string[];
  isOverLimit: boolean;
}

/**
 * Calculate usage status for a workspace
 */
export function getWorkspaceUsageStatus(workspace: Workspace): UsageStatus {
  const warnings: string[] = [];

  const bundlePercentage = (workspace.bundleLoads.used / workspace.bundleLoads.limit) * 100;
  const messagesPercentage = (workspace.messages.used / workspace.messages.limit) * 100;
  const apiCallsPercentage = (workspace.apiCalls.used / workspace.apiCalls.limit) * 100;

  // Check for warnings
  if (bundlePercentage >= 80) {
    warnings.push(`Bundle loads at ${bundlePercentage.toFixed(1)}% of limit`);
  }
  if (messagesPercentage >= 80) {
    warnings.push(`Messages at ${messagesPercentage.toFixed(1)}% of limit`);
  }
  if (apiCallsPercentage >= 80) {
    warnings.push(`API calls at ${apiCallsPercentage.toFixed(1)}% of limit`);
  }

  const isOverLimit = bundlePercentage >= 100 || messagesPercentage >= 100 || apiCallsPercentage >= 100;

  return {
    bundleLoads: {
      used: workspace.bundleLoads.used,
      limit: workspace.bundleLoads.limit,
      percentage: bundlePercentage,
      remaining: workspace.bundleLoads.remaining
    },
    messages: {
      used: workspace.messages.used,
      limit: workspace.messages.limit,
      percentage: messagesPercentage,
      remaining: workspace.messages.remaining
    },
    apiCalls: {
      used: workspace.apiCalls.used,
      limit: workspace.apiCalls.limit,
      percentage: apiCallsPercentage,
      remaining: workspace.apiCalls.remaining
    },
    warnings,
    isOverLimit
  };
}

/**
 * Calculate estimated overage cost if usage continues at current rate
 */
export function calculateProjectedOverage(workspace: Workspace): {
  projectedOverage: number;
  breakdown: {
    bundleLoads: number;
    messages: number;
    apiCalls: number;
  };
} {
  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const projectionMultiplier = daysInMonth / dayOfMonth;

  // Project usage for full month
  const projectedBundleLoads = workspace.bundleLoads.used * projectionMultiplier;
  const projectedMessages = workspace.messages.used * projectionMultiplier;
  const projectedApiCalls = workspace.apiCalls.used * projectionMultiplier;

  // Calculate overage (usage beyond limits)
  const bundleOverage = Math.max(0, projectedBundleLoads - workspace.bundleLoads.limit);
  const messagesOverage = Math.max(0, projectedMessages - workspace.messages.limit);
  const apiCallsOverage = Math.max(0, projectedApiCalls - workspace.apiCalls.limit);

  // Calculate costs
  const bundleCost = bundleOverage * workspace.overageRates.bundleLoads;
  const messagesCost = messagesOverage * workspace.overageRates.messages;
  const apiCallsCost = apiCallsOverage * workspace.overageRates.apiCalls;

  return {
    projectedOverage: bundleCost + messagesCost + apiCallsCost,
    breakdown: {
      bundleLoads: bundleCost,
      messages: messagesCost,
      apiCalls: apiCallsCost
    }
  };
}

/**
 * Check if workspace can add another bot
 */
export function canAddBot(workspace: Workspace, currentBotCount: number): {
  canAdd: boolean;
  reason?: string;
  availableSlots: number;
  suggestion?: string;
} {
  const planConfig = PLAN_CONFIG[workspace.plan];
  const availableSlots = planConfig.botSlots - currentBotCount;

  if (availableSlots > 0) {
    return {
      canAdd: true,
      availableSlots,
      suggestion: `You have ${availableSlots} bot slot(s) available in your ${planConfig.name} plan`
    };
  }

  // Suggest upgrade path
  const upgradeSuggestion = getUpgradeSuggestion(workspace.plan);

  return {
    canAdd: false,
    reason: `${planConfig.name} plan limit reached (${planConfig.botSlots} bot${planConfig.botSlots > 1 ? 's' : ''})`,
    availableSlots: 0,
    suggestion: upgradeSuggestion
  };
}

function getUpgradeSuggestion(currentPlan: PlanType): string {
  switch (currentPlan) {
    case 'starter':
      return 'Upgrade to Basic for 2 bot slots';
    case 'basic':
      return 'Upgrade to Premium for 5 bot slots';
    case 'premium':
      return 'Upgrade to Enterprise for 10 bot slots';
    case 'enterprise':
      return 'Contact support to increase your bot limit';
    default:
      return 'Consider upgrading your plan for more bot slots';
  }
}

/**
 * Calculate total monthly cost for a workspace
 */
export function calculateWorkspaceMonthlyCost(workspace: Workspace): {
  baseFee: number;
  projectedOverage: number;
  walletCreditsAvailable: number;
  estimatedTotal: number;
} {
  const overage = calculateProjectedOverage(workspace);
  const walletCreditsAvailable = workspace.walletCredits;

  // Wallet credits can offset overage costs
  const overageAfterCredits = Math.max(0, overage.projectedOverage - walletCreditsAvailable);

  return {
    baseFee: workspace.monthlyFee,
    projectedOverage: overage.projectedOverage,
    walletCreditsAvailable,
    estimatedTotal: workspace.monthlyFee + overageAfterCredits
  };
}

/**
 * Get plan features for display
 */
export function getPlanFeatures(plan: PlanType): string[] {
  return PLAN_CONFIG[plan].features;
}

/**
 * Get plan details
 */
export function getPlanConfig(plan: PlanType): PlanConfig {
  return PLAN_CONFIG[plan];
}

/**
 * Compare two plans
 */
export function comparePlans(currentPlan: PlanType, targetPlan: PlanType): {
  isUpgrade: boolean;
  priceDifference: number;
  additionalFeatures: string[];
} {
  const current = PLAN_CONFIG[currentPlan];
  const target = PLAN_CONFIG[targetPlan];

  const planOrder: PlanType[] = ['starter', 'basic', 'premium', 'enterprise'];
  const isUpgrade = planOrder.indexOf(targetPlan) > planOrder.indexOf(currentPlan);

  const additionalFeatures = target.features.filter(f => !current.features.includes(f));

  return {
    isUpgrade,
    priceDifference: target.price - current.price,
    additionalFeatures
  };
}

// =============================================================================
// Credit Package Configuration
// =============================================================================

export const CREDIT_PACKAGES = [
  { amount: 50, bonus: 0, savings: 0 },
  { amount: 100, bonus: 5, savings: 5 },
  { amount: 250, bonus: 25, savings: 12.5 },
  { amount: 500, bonus: 75, savings: 25 },
  { amount: 1000, bonus: 200, savings: 50 }
];

/**
 * Get best credit package recommendation based on projected overage
 */
export function recommendCreditPackage(projectedOverage: number): {
  package: typeof CREDIT_PACKAGES[0];
  reason: string;
} | null {
  if (projectedOverage <= 0) {
    return null;
  }

  // Find the smallest package that covers the overage
  for (const pkg of CREDIT_PACKAGES) {
    const totalCredits = pkg.amount + pkg.bonus;
    if (totalCredits >= projectedOverage) {
      return {
        package: pkg,
        reason: `Covers your projected €${projectedOverage.toFixed(2)} overage with €${(totalCredits - projectedOverage).toFixed(2)} buffer`
      };
    }
  }

  // Return largest package if overage exceeds all packages
  return {
    package: CREDIT_PACKAGES[CREDIT_PACKAGES.length - 1],
    reason: 'Largest package available - consider upgrading your plan for higher limits'
  };
}

// =============================================================================
// Marketplace Types (kept for template marketplace functionality)
// =============================================================================

export type TemplateType = 'free' | 'premium' | 'custom';

export interface MascotTemplate {
  id: string;
  name: string;
  artistId: string;
  artistName: string;
  description: string;
  image: string;
  category: string;
  type: TemplateType;
  monthlyFee: number;
  features: string[];
  animations: number;
  lastUpdated: string;
  subscriberCount: number;
  rating: number;
  reviews: number;
  assetPacks: AssetPack[];
}

export interface AssetPack {
  id: string;
  name: string;
  description: string;
  price: number;
  items: string[];
  preview: string;
}

// =============================================================================
// Data Loading (for marketplace data)
// =============================================================================

let marketplaceData: any = null;

export async function loadMarketplaceData(): Promise<any> {
  if (marketplaceData) return marketplaceData;

  try {
    const response = await fetch('/data/billing.json');
    marketplaceData = await response.json();
    return marketplaceData;
  } catch (error) {
    console.error('Error loading marketplace data:', error);
    return { templates: [], artists: {} };
  }
}

export async function getTemplates(): Promise<MascotTemplate[]> {
  const data = await loadMarketplaceData();
  return data.templates || [];
}

export async function getTemplateById(templateId: string): Promise<MascotTemplate | undefined> {
  const templates = await getTemplates();
  return templates.find(t => t.id === templateId);
}
