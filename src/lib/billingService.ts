// Billing data types
export interface BotUsage {
  bundleLoads: number;
  bundleLimit: number;
  chatMessages: number;
  chatLimit: number;
  currentMonthCost: number;
  extraCharges: number;
}

export interface BotBilling {
  billingModel: 'subscription' | 'credits';
  subscriptionTier?: 'basic' | 'premium' | 'enterprise';
  monthlyPrice: number;
  credits: number;
  usage: BotUsage;
  history: Array<{
    month: string;
    cost: number;
    bundleLoads: number;
    chatMessages: number;
  }>;
}

export interface ClientBilling {
  balance: number;
  currency: string;
  billingCycle: string;
  nextBillingDate: string;
  paymentMethod: {
    type: string;
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  };
  autoRecharge: {
    enabled: boolean;
    threshold: number;
    amount: number;
  };
  bots: Record<string, BotBilling>;
  invoices: Array<{
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    items: Array<{
      description: string;
      amount: number;
    }>;
  }>;
  transactions: Array<{
    date: string;
    type: 'subscription' | 'credit_purchase' | 'refund';
    amount: number;
    status: 'completed' | 'pending' | 'failed';
  }>;
}

export interface PlanDetails {
  name: string;
  price: number;
  currency: string;
  limits: {
    bundleLoads: number;
    chatMessages: number;
    apiCalls: number;
    storage: string;
  };
  features: string[];
}

export interface BillingData {
  clients: Record<string, ClientBilling>;
  plans: {
    subscription: {
      basic: PlanDetails;
      premium: PlanDetails;
      enterprise: PlanDetails;
    };
    credits: {
      pricing: {
        bundleLoad: number;
        chatMessage: number;
        apiCall: number;
      };
      packages: Array<{
        amount: number;
        bonus: number;
        savings: number;
      }>;
    };
  };
}

let billingData: BillingData | null = null;

export async function loadBillingData(): Promise<BillingData> {
  if (billingData) return billingData;
  
  try {
    const response = await fetch('/data/billing.json');
    billingData = await response.json();
    return billingData!;
  } catch (error) {
    console.error('Error loading billing data:', error);
    // Return a default structure if loading fails
    return {
      clients: {},
      plans: {
        subscription: {
          basic: {
            name: 'Basic',
            price: 99,
            currency: 'USD',
            limits: { bundleLoads: 1000, chatMessages: 25000, apiCalls: 50000, storage: '10GB' },
            features: []
          },
          premium: {
            name: 'Premium',
            price: 299,
            currency: 'USD',
            limits: { bundleLoads: 5000, chatMessages: 100000, apiCalls: 250000, storage: '50GB' },
            features: []
          },
          enterprise: {
            name: 'Enterprise',
            price: 999,
            currency: 'USD',
            limits: { bundleLoads: 999999, chatMessages: 999999, apiCalls: 999999, storage: 'Unlimited' },
            features: []
          }
        },
        credits: {
          pricing: { bundleLoad: 0.04, chatMessage: 0.0015, apiCall: 0.0001 },
          packages: []
        }
      }
    };
  }
}

export async function getClientBilling(clientId: string): Promise<ClientBilling | null> {
  const data = await loadBillingData();
  return data.clients[clientId] || null;
}

export async function getBotBilling(clientId: string, botId: string): Promise<BotBilling | null> {
  const clientBilling = await getClientBilling(clientId);
  if (!clientBilling) return null;
  return clientBilling.bots[botId] || null;
}

export async function getSubscriptionPlans() {
  const data = await loadBillingData();
  return data.plans.subscription;
}

export async function getCreditPricing() {
  const data = await loadBillingData();
  return data.plans.credits;
}

// Calculate total monthly cost for a client
export function calculateTotalMonthlyCost(clientBilling: ClientBilling): {
  subscriptions: number;
  credits: number;
  total: number;
  breakdown: Array<{ botId: string; cost: number; type: string }>;
} {
  let subscriptions = 0;
  let credits = 0;
  const breakdown: Array<{ botId: string; cost: number; type: string }> = [];

  Object.entries(clientBilling.bots).forEach(([botId, bot]) => {
    if (bot.billingModel === 'subscription') {
      subscriptions += bot.monthlyPrice;
      breakdown.push({ botId, cost: bot.monthlyPrice, type: 'subscription' });
    } else {
      credits += bot.usage.currentMonthCost;
      breakdown.push({ botId, cost: bot.usage.currentMonthCost, type: 'credits' });
    }
  });

  return {
    subscriptions,
    credits,
    total: subscriptions + credits,
    breakdown
  };
}

// Predict credit usage
export function predictCreditUsage(bot: BotBilling): {
  daysRemaining: number;
  estimatedMonthlyCost: number;
  runRate: number;
} {
  if (bot.billingModel !== 'credits') {
    return { daysRemaining: 999, estimatedMonthlyCost: 0, runRate: 0 };
  }

  // Calculate daily run rate from current usage
  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  const dailyCost = bot.usage.currentMonthCost / dayOfMonth;
  const estimatedMonthlyCost = dailyCost * daysInMonth;
  const daysRemaining = bot.credits / dailyCost;

  return {
    daysRemaining: Math.floor(daysRemaining),
    estimatedMonthlyCost: Math.round(estimatedMonthlyCost * 100) / 100,
    runRate: Math.round(dailyCost * 100) / 100
  };
}

// Update bot billing model
export async function updateBotBilling(
  clientId: string,
  botId: string,
  model: 'subscription' | 'credits',
  tier?: 'basic' | 'premium' | 'enterprise'
): Promise<boolean> {
  // In a real app, this would make an API call
  // For now, we'll just log it
  console.log(`Updating bot ${botId} billing to ${model} ${tier || ''}`);
  return true;
}

// Purchase credits
export async function purchaseCredits(
  clientId: string,
  amount: number
): Promise<{ success: boolean; newBalance: number }> {
  // In a real app, this would make an API call
  console.log(`Purchasing $${amount} credits for client ${clientId}`);
  const clientBilling = await getClientBilling(clientId);
  if (!clientBilling) return { success: false, newBalance: 0 };
  
  return {
    success: true,
    newBalance: clientBilling.balance + amount
  };
}