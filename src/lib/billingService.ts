// Enhanced Billing System with Marketplace & Shared Resource Pools
// ================================================================

// Core Types
export type BillingModel = 'subscription' | 'credits';
export type SubscriptionTier = 'starter' | 'basic' | 'premium' | 'enterprise';
export type TemplateType = 'free' | 'premium' | 'custom';

// Artist Template Marketplace
export interface MascotTemplate {
  id: string;
  name: string;
  artistId: string;
  artistName: string;
  description: string;
  image: string;
  category: string;
  type: TemplateType;
  monthlyFee: number; // 0 for free, e.g. 30 for premium
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
  price: number; // One-time purchase
  items: string[];
  preview: string;
}

// Subscription Plans with Shared Resource Pools
export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: number;
  currency: string;
  mascotSlots: number; // 1 for Basic, 2 for Premium, 5 for Enterprise
  sharedLimits: {
    bundleLoads: number;    // Shared across all mascots
    chatMessages: number;   // Shared across all mascots
    apiCalls: number;       // Shared across all mascots
    storage: string;
    knowledgebaseSize: string; // Knowledgebase size limit
  };
  features: string[];
  includesCustomMascot: boolean; // true for Enterprise
  templateCredits: number; // Free template subscriptions included
}

// Individual Mascot Configuration
export interface MascotInstance {
  id: string;
  name: string;
  image: string;
  templateId: string;
  template: MascotTemplate;
  clientId: string;
  billingModel: BillingModel;
  
  // If part of subscription, shares the pool
  subscriptionId?: string;
  
  // If credits-based, has own limits
  creditBalance?: number;
  
  // Usage tracking (counts against shared pool or credits)
  currentUsage: {
    bundleLoads: number;
    chatMessages: number;
    apiCalls: number;
  };
  
  // Customizations
  purchasedAssetPacks: string[];
  customSettings: Record<string, any>;
  
  status: 'active' | 'paused' | 'limit_reached';
  createdAt: string;
}

// Client Subscription (manages shared resource pool)
export interface ClientSubscription {
  id: string;
  clientId: string;
  tier: SubscriptionTier;
  plan: SubscriptionPlan;
  
  // Mascots using this subscription's shared pool
  mascotIds: string[];
  
  // Template subscriptions (monthly fees to artists)
  templateSubscriptions: Array<{
    templateId: string;
    monthlyFee: number;
    artistId: string;
    startDate: string;
  }>;
  
  // Shared usage across all mascots
  sharedUsage: {
    bundleLoads: number;
    chatMessages: number;
    apiCalls: number;
    storage: number;
  };
  
  // Usage allocation per mascot (optional soft limits)
  usageAllocation?: Record<string, {
    bundleLoadsPercent: number;
    chatMessagesPercent: number;
  }>;
  
  billingCycle: 'monthly' | 'annual';
  nextBillingDate: string;
  status: 'active' | 'past_due' | 'cancelled';
}

// Enhanced Client Billing
export interface ClientBillingV2 {
  clientId: string;
  
  // Main subscription (if any)
  subscription?: ClientSubscription;
  
  // All mascots (both subscription and credit-based)
  mascots: MascotInstance[];
  
  // Credit balance for credit-based mascots or overflow
  creditBalance: number;
  
  // Payment info
  paymentMethod: {
    type: string;
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  };
  
  // Auto-recharge for credits
  autoRecharge: {
    enabled: boolean;
    threshold: number;
    amount: number;
  };
  
  // Monthly costs breakdown
  monthlyCosts: {
    subscriptionBase: number;      // Base subscription (99/299/999)
    templateFees: number;           // Sum of all template monthly fees
    assetPurchases: number;         // One-time asset pack purchases this month
    creditUsage: number;            // Credit-based mascot usage
    total: number;
  };
  
  // Invoices
  invoices: Invoice[];
  
  // Marketplace purchases
  marketplacePurchases: MarketplacePurchase[];
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  items: Array<{
    type: 'subscription' | 'template_fee' | 'asset_pack' | 'credits' | 'custom_mascot';
    description: string;
    amount: number;
    artistId?: string; // For template fees and asset packs
  }>;
}

export interface MarketplacePurchase {
  id: string;
  date: string;
  type: 'template_subscription' | 'asset_pack';
  itemId: string;
  itemName: string;
  artistId: string;
  artistName: string;
  amount: number;
  recurring: boolean;
}

// Artist earnings tracking
export interface ArtistEarnings {
  artistId: string;
  artistName: string;
  templates: Array<{
    templateId: string;
    templateName: string;
    subscriberCount: number;
    monthlyRevenue: number;
  }>;
  assetPacks: Array<{
    packId: string;
    packName: string;
    salesThisMonth: number;
    revenueThisMonth: number;
  }>;
  totalMonthlyRevenue: number;
  totalLifetimeRevenue: number;
  platformCommission: number; // e.g., 30%
  netRevenue: number;
}

// Billing configuration
export const BILLING_CONFIG = {
  plans: {
    starter: {
      tier: 'starter' as SubscriptionTier,
      name: 'Starter',
      price: 99,
      currency: 'USD',
      mascotSlots: 1,
      sharedLimits: {
        bundleLoads: 1000,
        chatMessages: 25000,
        apiCalls: 50000,
        storage: '50MB',
        knowledgebaseSize: '0.1MB'
      },
      features: [
        '1 mascot slot',
        'Basic Q&A chatflow',
        '0.1MB knowledgebase',
        'Basic templates only',
        'Email support',
        'Basic analytics',
        'Standard chat widget',
        'Basic security & encryption'
      ],
      includesCustomMascot: false,
      templateCredits: 0
    },
    basic: {
      tier: 'basic' as SubscriptionTier,
      name: 'Basic',
      price: 299,
      currency: 'USD',
      mascotSlots: 2,
      sharedLimits: {
        bundleLoads: 5000,
        chatMessages: 100000,
        apiCalls: 250000,
        storage: '200MB',
        knowledgebaseSize: '0.5MB'
      },
      features: [
        '2 mascot slots',
        'Basic chatflow templates',
        '0.5MB knowledgebase',
        'Basic + Pro templates',
        'Priority support',
        'Advanced analytics',
        'Custom branded widget',
        'Enhanced security & compliance'
      ],
      includesCustomMascot: false,
      templateCredits: 1
    },
    premium: {
      tier: 'premium' as SubscriptionTier,
      name: 'Premium',
      price: 2499,
      currency: 'EUR',
      mascotSlots: 5,
      sharedLimits: {
        bundleLoads: 25000,
        chatMessages: 500000,
        apiCalls: 1000000,
        storage: '2GB',
        knowledgebaseSize: '5MB'
      },
      features: [
        'Up to 5 mascot slots',
        'Advanced chatflows',
        '5MB knowledgebase',
        'Basic + Pro templates',
        '24/7 phone support',
        'Custom analytics dashboard',
        'White-label solution',
        'Advanced security & audit logs'
      ],
      includesCustomMascot: false,
      templateCredits: 3
    },
    enterprise: {
      tier: 'enterprise' as SubscriptionTier,
      name: 'Enterprise',
      price: 0, // Price on request
      currency: 'EUR',
      mascotSlots: 10,
      sharedLimits: {
        bundleLoads: 100000,
        chatMessages: 2000000,
        apiCalls: 5000000,
        storage: '10GB',
        knowledgebaseSize: '20MB'
      },
      features: [
        'Up to 10 mascot slots',
        'Custom chatflows',
        '20MB knowledgebase',
        'All templates + custom design',
        'Dedicated account manager',
        'Custom analytics dashboard',
        'On-premise deployment options',
        'Enterprise-grade security & SLA'
      ],
      includesCustomMascot: true,
      templateCredits: 10
    }
  } as Record<SubscriptionTier, SubscriptionPlan>,
  
  creditPricing: {
    bundleLoad: 0.04,
    chatMessage: 0.0015,
    apiCall: 0.0001,
    packages: [
      { amount: 50, bonus: 0, savings: 0 },
      { amount: 100, bonus: 5, savings: 5 },
      { amount: 250, bonus: 25, savings: 12.5 },
      { amount: 500, bonus: 75, savings: 25 },
      { amount: 1000, bonus: 200, savings: 50 }
    ]
  },
  
  platformCommission: 0.3, // 30% platform fee on marketplace
  
  usageWarnings: {
    levels: [0.8, 0.9, 0.95, 1.0], // Warning at 80%, 90%, 95%, 100%
    gracePeriod: 24 // Hours before hard stop at 100%
  }
};

// Service Functions
// =================

let billingDataV2: any = null;

export async function loadBillingDataV2(): Promise<any> {
  if (billingDataV2) return billingDataV2;
  
  try {
    const response = await fetch('/data/billing.json');
    billingDataV2 = await response.json();
    return billingDataV2;
  } catch (error) {
    console.error('Error loading billing data:', error);
    // Return mock data for development
    return getMockBillingData();
  }
}

export async function getClientBillingV2(clientId: string): Promise<ClientBillingV2 | null> {
  const data = await loadBillingDataV2();
  return data.clients[clientId] || null;
}

// Calculate shared pool usage across mascots
export function calculateSharedPoolUsage(subscription: ClientSubscription, mascots: MascotInstance[]): {
  totalUsage: {
    bundleLoads: number;
    bundleLoadsPercent: number;
    chatMessages: number;
    chatMessagesPercent: number;
    apiCalls: number;
    apiCallsPercent: number;
  };
  perMascot: Array<{
    mascotId: string;
    mascotName: string;
    usage: {
      bundleLoads: number;
      chatMessages: number;
      apiCalls: number;
    };
    percentOfTotal: {
      bundleLoads: number;
      chatMessages: number;
      apiCalls: number;
    };
  }>;
  warnings: string[];
} {
  const limits = subscription.plan.sharedLimits;
  const warnings: string[] = [];
  
  // Calculate total usage
  const totalUsage = mascots
    .filter(m => subscription.mascotIds.includes(m.id))
    .reduce((acc, mascot) => ({
      bundleLoads: acc.bundleLoads + mascot.currentUsage.bundleLoads,
      chatMessages: acc.chatMessages + mascot.currentUsage.chatMessages,
      apiCalls: acc.apiCalls + mascot.currentUsage.apiCalls
    }), { bundleLoads: 0, chatMessages: 0, apiCalls: 0 });
  
  // Calculate percentages
  const bundleLoadsPercent = (totalUsage.bundleLoads / limits.bundleLoads) * 100;
  const chatMessagesPercent = (totalUsage.chatMessages / limits.chatMessages) * 100;
  const apiCallsPercent = (totalUsage.apiCalls / limits.apiCalls) * 100;
  
  // Check for warnings
  BILLING_CONFIG.usageWarnings.levels.forEach(level => {
    const percent = level * 100;
    if (bundleLoadsPercent >= percent) {
      warnings.push(`Bundle loads at ${bundleLoadsPercent.toFixed(1)}% of limit`);
    }
    if (chatMessagesPercent >= percent) {
      warnings.push(`Chat messages at ${chatMessagesPercent.toFixed(1)}% of limit`);
    }
  });
  
  // Calculate per-mascot breakdown
  const perMascot = mascots
    .filter(m => subscription.mascotIds.includes(m.id))
    .map(mascot => ({
      mascotId: mascot.id,
      mascotName: mascot.name,
      usage: mascot.currentUsage,
      percentOfTotal: {
        bundleLoads: totalUsage.bundleLoads > 0 
          ? (mascot.currentUsage.bundleLoads / totalUsage.bundleLoads) * 100 
          : 0,
        chatMessages: totalUsage.chatMessages > 0
          ? (mascot.currentUsage.chatMessages / totalUsage.chatMessages) * 100
          : 0,
        apiCalls: totalUsage.apiCalls > 0
          ? (mascot.currentUsage.apiCalls / totalUsage.apiCalls) * 100
          : 0
      }
    }));
  
  return {
    totalUsage: {
      ...totalUsage,
      bundleLoadsPercent,
      chatMessagesPercent,
      apiCallsPercent
    },
    perMascot,
    warnings
  };
}

// Calculate total monthly costs including marketplace fees
export function calculateTotalMonthlyCostV2(billing: ClientBillingV2): {
  breakdown: {
    subscriptionBase: number;
    templateFees: Array<{ templateId: string; templateName: string; fee: number; artistId: string }>;
    creditUsage: number;
    assetPurchases: number;
  };
  total: number;
  projectedTotal: number; // Based on current usage rate
} {
  const subscriptionBase = billing.subscription?.plan.price || 0;
  
  // Calculate template fees
  const templateFees = billing.subscription?.templateSubscriptions.map(ts => {
    const template = billing.mascots.find(m => m.templateId === ts.templateId)?.template;
    return {
      templateId: ts.templateId,
      templateName: template?.name || 'Unknown Template',
      fee: ts.monthlyFee,
      artistId: ts.artistId
    };
  }) || [];
  
  const totalTemplateFees = templateFees.reduce((sum, t) => sum + t.fee, 0);
  
  // Calculate credit usage for credit-based mascots
  const creditMascots = billing.mascots.filter(m => m.billingModel === 'credits');
  const creditUsage = creditMascots.reduce((sum, mascot) => {
    const usage = mascot.currentUsage;
    return sum + 
      (usage.bundleLoads * BILLING_CONFIG.creditPricing.bundleLoad) +
      (usage.chatMessages * BILLING_CONFIG.creditPricing.chatMessage) +
      (usage.apiCalls * BILLING_CONFIG.creditPricing.apiCall);
  }, 0);
  
  // Asset purchases this month
  const currentMonth = new Date().toISOString().slice(0, 7);
  const assetPurchases = billing.marketplacePurchases
    .filter(p => p.type === 'asset_pack' && p.date.startsWith(currentMonth))
    .reduce((sum, p) => sum + p.amount, 0);
  
  // Project credit usage for full month
  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const projectedCreditUsage = (creditUsage / dayOfMonth) * daysInMonth;
  
  return {
    breakdown: {
      subscriptionBase,
      templateFees,
      creditUsage,
      assetPurchases
    },
    total: subscriptionBase + totalTemplateFees + creditUsage + assetPurchases,
    projectedTotal: subscriptionBase + totalTemplateFees + projectedCreditUsage + assetPurchases
  };
}

// Check if client can add another mascot
export function canAddMascot(billing: ClientBillingV2): {
  canAdd: boolean;
  reason?: string;
  availableSlots: number;
  suggestion?: string;
} {
  if (!billing.subscription) {
    return {
      canAdd: true,
      reason: 'No subscription - can add credit-based mascot',
      availableSlots: 999,
      suggestion: 'Consider a subscription for better value'
    };
  }
  
  const plan = billing.subscription.plan;
  const currentMascots = billing.subscription.mascotIds.length;
  const availableSlots = plan.mascotSlots - currentMascots;
  
  if (availableSlots > 0) {
    return {
      canAdd: true,
      availableSlots,
      suggestion: `You have ${availableSlots} slot(s) available in your ${plan.name} plan`
    };
  }
  
  // Check upgrade path
  if (plan.tier === 'starter') {
    return {
      canAdd: false,
      reason: 'Starter plan limit reached (1 mascot)',
      availableSlots: 0,
      suggestion: 'Upgrade to Basic for 2 mascot slots or add a credit-based mascot'
    };
  } else if (plan.tier === 'basic') {
    return {
      canAdd: false,
      reason: 'Basic plan limit reached (2 mascots)',
      availableSlots: 0,
      suggestion: 'Upgrade to Premium for 5 mascot slots or add a credit-based mascot'
    };
  } else if (plan.tier === 'premium') {
    return {
      canAdd: false,
      reason: 'Premium plan limit reached (5 mascots)',
      availableSlots: 0,
      suggestion: 'Upgrade to Enterprise for 10 mascot slots or add a credit-based mascot'
    };
  } else {
    return {
      canAdd: false,
      reason: 'Enterprise plan limit reached (10 mascots)',
      availableSlots: 0,
      suggestion: 'Add additional credit-based mascots as needed'
    };
  }
}

// Calculate artist earnings
export function calculateArtistEarnings(artistId: string, billingData: any): ArtistEarnings {
  const templates = billingData.templates.filter((t: MascotTemplate) => t.artistId === artistId);
  const commission = BILLING_CONFIG.platformCommission;
  
  const templateEarnings = templates.map((template: MascotTemplate) => ({
    templateId: template.id,
    templateName: template.name,
    subscriberCount: template.subscriberCount,
    monthlyRevenue: template.subscriberCount * template.monthlyFee * (1 - commission)
  }));
  
  // Calculate asset pack sales
  const assetPackEarnings = billingData.assetPacks
    .filter((pack: any) => pack.artistId === artistId)
    .map((pack: any) => ({
      packId: pack.id,
      packName: pack.name,
      salesThisMonth: pack.salesThisMonth || 0,
      revenueThisMonth: (pack.salesThisMonth || 0) * pack.price * (1 - commission)
    }));
  
  const totalMonthlyRevenue = 
    templateEarnings.reduce((sum: number, t: any) => sum + t.monthlyRevenue, 0) +
    assetPackEarnings.reduce((sum: number, p: any) => sum + p.revenueThisMonth, 0);
  
  return {
    artistId,
    artistName: billingData.artists[artistId]?.name || 'Unknown Artist',
    templates: templateEarnings,
    assetPacks: assetPackEarnings,
    totalMonthlyRevenue,
    totalLifetimeRevenue: 0, // Would need historical data
    platformCommission: commission * 100,
    netRevenue: totalMonthlyRevenue
  };
}

// Mock data for development
function getMockBillingData() {
  return {
    clients: {},
    templates: [],
    artists: {},
    assetPacks: []
  };
}

// API Functions (these would connect to your backend)
export async function subscribToTemplate(
  clientId: string,
  mascotId: string,
  templateId: string
): Promise<{ success: boolean; message: string }> {
  // API call to subscribe to template
  console.log(`Client ${clientId} subscribing mascot ${mascotId} to template ${templateId}`);
  return { success: true, message: 'Template subscription activated' };
}

export async function purchaseAssetPack(
  clientId: string,
  mascotId: string,
  packId: string
): Promise<{ success: boolean; message: string }> {
  // API call to purchase asset pack
  console.log(`Client ${clientId} purchasing asset pack ${packId} for mascot ${mascotId}`);
  return { success: true, message: 'Asset pack purchased successfully' };
}

export async function upgradeSubscription(
  clientId: string,
  newTier: SubscriptionTier
): Promise<{ success: boolean; message: string }> {
  // API call to upgrade subscription
  console.log(`Client ${clientId} upgrading to ${newTier}`);
  return { success: true, message: `Upgraded to ${newTier} plan` };
}

export async function allocateUsageLimits(
  clientId: string,
  allocation: Record<string, { bundleLoadsPercent: number; chatMessagesPercent: number }>
): Promise<{ success: boolean; message: string }> {
  // API call to set usage allocation
  console.log(`Setting usage allocation for client ${clientId}:`, allocation);
  return { success: true, message: 'Usage allocation updated' };
}