/**
 * Plan Display Configuration
 *
 * Maps database billing_plans fields to human-readable display values.
 * All mappings have fallbacks for null/unknown values.
 */

import type { BillingPlan, FlowAccessLevel, AnalyticsTier, CustomizationTier, SecurityTier, PlanType } from '@/types';
import { Package, Zap, Crown, Shield, type LucideIcon } from 'lucide-react';

// =============================================================================
// Label Mappings
// =============================================================================

const FLOW_ACCESS_LABELS: Record<FlowAccessLevel, string> = {
  single_basic_flow: 'Single basic flow',
  basic_flows: 'Basic flows',
  basic_and_advanced_flows: 'Basic and advanced flows',
  custom_flows: 'Custom flows',
};

const ANALYTICS_LABELS: Record<AnalyticsTier, string> = {
  standard: 'Basic analytics',
  advanced: 'Advanced analytics',
  custom: 'Custom analytics dashboard',
};

const CUSTOMIZATION_LABELS: Record<CustomizationTier, string> = {
  basic: 'Standard chat widget',
  advanced: 'Custom branded widget',
  white_label: 'White-label solution',
};

const SECURITY_LABELS: Record<SecurityTier, string> = {
  standard: 'Basic security & encryption',
  enhanced: 'Enhanced security & compliance',
  enterprise: 'Enterprise-grade security & SLA',
};

// =============================================================================
// Fallback-Safe Getters
// =============================================================================

export function getFlowLabel(level: FlowAccessLevel | string | null): string {
  if (!level) return 'Custom';
  return FLOW_ACCESS_LABELS[level as FlowAccessLevel] ?? level;
}

export function getAnalyticsLabel(tier: AnalyticsTier | string | null): string {
  if (!tier) return 'Custom';
  return ANALYTICS_LABELS[tier as AnalyticsTier] ?? tier;
}

export function getCustomizationLabel(tier: CustomizationTier | string | null): string {
  if (!tier) return 'Custom';
  return CUSTOMIZATION_LABELS[tier as CustomizationTier] ?? tier;
}

export function getSecurityLabel(tier: SecurityTier | string | null): string {
  if (!tier) return 'Custom';
  return SECURITY_LABELS[tier as SecurityTier] ?? tier;
}

export function getSupportLabel(
  channels: string[] | null,
  slaHours: number | null
): string {
  if (!channels || channels.length === 0) return 'Custom support';
  if (channels.includes('dedicated')) return 'Dedicated account manager';
  if (channels.includes('phone')) {
    if (slaHours !== null && slaHours <= 24) return '24/7 phone support';
    return 'Priority support';
  }
  return 'Email support';
}

// =============================================================================
// Plan Styling
// =============================================================================

export const PLAN_ICONS: Record<PlanType, LucideIcon> = {
  starter: Package,
  basic: Zap,
  premium: Crown,
  enterprise: Shield,
  custom: Shield,
};

export const PLAN_ICON_COLORS: Record<PlanType, string> = {
  starter: 'text-success-600 dark:text-success-500',
  basic: 'text-info-600 dark:text-info-500',
  premium: 'text-plan-premium-text',
  enterprise: 'text-foreground',
  custom: 'text-foreground',
};

export const PLAN_CARD_STYLES: Record<PlanType, { highlighted: boolean; borderClass: string }> = {
  starter: { highlighted: false, borderClass: 'border-border hover:border-border-secondary' },
  basic: { highlighted: false, borderClass: 'border-border hover:border-border-secondary' },
  premium: { highlighted: true, borderClass: 'border-plan-premium-border bg-plan-premium-bg' },
  enterprise: { highlighted: false, borderClass: 'border-border hover:border-border-secondary' },
  custom: { highlighted: false, borderClass: 'border-border hover:border-border-secondary' },
};

// =============================================================================
// Feature Generation
// =============================================================================

/**
 * Generate human-readable feature list from BillingPlan data.
 * All outputs handle null gracefully with "Custom" fallbacks.
 */
export function generateFeaturesList(plan: BillingPlan): string[] {
  const features: string[] = [];

  // 1. Mascot slots (from mascotsLimit)
  if (plan.isCustom || plan.mascotsLimit === null) {
    features.push('Custom mascot slots');
  } else if (plan.mascotsLimit === 1) {
    features.push('1 mascot slot');
  } else {
    features.push(`Up to ${plan.mascotsLimit} mascot slots`);
  }

  // 2. Mascot reskins (from includedMascotReskins)
  if (plan.isCustom) {
    features.push('Unlimited mascot reskins');
  } else if (plan.includedMascotReskins !== null && plan.includedMascotReskins > 0) {
    features.push(
      `${plan.includedMascotReskins} mascot reskin${plan.includedMascotReskins !== 1 ? 's' : ''} included`
    );
  } else {
    features.push('No mascot reskins');
  }

  // 3. Mascot templates (from customizationTier)
  if (plan.isCustom || plan.planSlug === 'enterprise') {
    features.push('Custom mascot design');
  } else if (plan.customizationTier === 'basic') {
    features.push('Basic mascot templates');
  } else {
    features.push('Basic + Pro mascot templates');
  }

  // 4. Custom rigs (from includedCustomRigCount)
  if (plan.isCustom) {
    features.push('Custom mascot rigs');
  } else if (plan.includedCustomRigCount !== null && plan.includedCustomRigCount > 0) {
    features.push(
      `${plan.includedCustomRigCount} custom mascot rig${plan.includedCustomRigCount !== 1 ? 's' : ''}`
    );
  } else {
    features.push('Rigs from mascot library');
  }

  // 5. Chatflows (from flowAccessLevel)
  features.push(getFlowLabel(plan.flowAccessLevel));

  // 6. Knowledgebase (from knowledgePagesPerMascot)
  if (plan.isCustom || plan.knowledgePagesPerMascot === null) {
    features.push('Custom knowledgebase size');
  } else {
    const pages = plan.knowledgePagesPerMascot;
    features.push(`${pages.toLocaleString()} knowledgebase pages`);
  }

  // 7. Support (from supportChannels, supportSlaHours)
  features.push(getSupportLabel(plan.supportChannels, plan.supportSlaHours));

  // 8. Analytics (from analyticsTier)
  features.push(getAnalyticsLabel(plan.analyticsTier));

  // 9. Widget/Branding (from customizationTier)
  features.push(getCustomizationLabel(plan.customizationTier));

  // 10. Security (from securityTier)
  features.push(getSecurityLabel(plan.securityTier));

  return features;
}

// =============================================================================
// Display Format
// =============================================================================

export type DisplayPlan = {
  tier: PlanType;
  name: string;
  price: number | null;
  currency: string;
  mascotSlots: number | null;
  sharedLimits: {
    uniqueUsers: number | null;
    conversations: number | null;
  };
  features: string[];
  isCustom: boolean;
};

/**
 * Transform a BillingPlan into the display format expected by the Plans page.
 */
export function formatPlanForDisplay(plan: BillingPlan): DisplayPlan {
  return {
    tier: plan.planSlug,
    name: plan.planName,
    price: plan.monthlyFeeExVat,
    currency: 'EUR',
    mascotSlots: plan.isCustom ? null : plan.mascotsLimit,
    sharedLimits: {
      uniqueUsers: plan.isCustom ? null : plan.bundleLoadLimit,
      conversations: plan.isCustom ? null : plan.conversationsLimit,
    },
    features: generateFeaturesList(plan),
    isCustom: plan.isCustom,
  };
}

// =============================================================================
// Comparison Table Helpers
// =============================================================================

export type ComparisonRowKey =
  | 'mascotsLimit'
  | 'bundleLoadLimit'
  | 'conversationsLimit'
  | 'knowledgebaseSize'
  | 'flowAccessLevel'
  | 'templates'
  | 'marketplace'
  | 'customDesign'
  | 'customRig'
  | 'securityTier'
  | 'support';

export const COMPARISON_ROWS: { key: ComparisonRowKey; label: string }[] = [
  { key: 'mascotsLimit', label: 'Mascot Slots' },
  { key: 'bundleLoadLimit', label: 'Unique Users (Shared)' },
  { key: 'conversationsLimit', label: 'Conversations (Shared)' },
  { key: 'knowledgebaseSize', label: 'Knowledgebase Pages' },
  { key: 'flowAccessLevel', label: 'Chatflows' },
  { key: 'templates', label: 'Mascot Templates' },
  { key: 'marketplace', label: 'Marketplace Access' },
  { key: 'customDesign', label: 'Custom Mascot Design' },
  { key: 'customRig', label: 'Custom Mascot Rig' },
  { key: 'securityTier', label: 'Security Level' },
  { key: 'support', label: 'Support' },
];

/**
 * Get the display value for a specific comparison row.
 */
export function getComparisonValue(
  plan: BillingPlan,
  rowKey: ComparisonRowKey
): string | boolean {
  switch (rowKey) {
    case 'mascotsLimit':
      return plan.isCustom || plan.mascotsLimit === null
        ? 'Custom'
        : plan.mascotsLimit.toString();

    case 'bundleLoadLimit':
      return plan.isCustom || plan.bundleLoadLimit === null
        ? 'Custom'
        : plan.bundleLoadLimit.toLocaleString();

    case 'conversationsLimit':
      return plan.isCustom || plan.conversationsLimit === null
        ? 'Custom'
        : plan.conversationsLimit.toLocaleString();

    case 'knowledgebaseSize':
      if (plan.isCustom || plan.knowledgePagesPerMascot === null) return 'Custom';
      return `${plan.knowledgePagesPerMascot.toLocaleString()} pages`;

    case 'flowAccessLevel':
      return getFlowLabel(plan.flowAccessLevel);

    case 'templates':
      if (plan.isCustom || plan.planSlug === 'enterprise') return 'Custom design';
      return plan.customizationTier === 'basic' ? 'Basic' : 'Basic + Pro';

    case 'marketplace':
      // Check if plan has access to mascot rig catalogs
      if (plan.isCustom) return true;
      const catalogs = plan.allowedMascotRigCatalogs;
      return catalogs !== null && catalogs.length > 0;

    case 'customDesign':
      // Check if plan includes custom mascot designs or custom rigs
      if (plan.isCustom) return true;
      return (
        (plan.includedMascotReskins !== null && plan.includedMascotReskins > 0) ||
        (plan.includedCustomRigCount !== null && plan.includedCustomRigCount > 0)
      );

    case 'customRig':
      // Check if plan includes custom rigs
      if (plan.isCustom) return true;
      return plan.includedCustomRigCount !== null && plan.includedCustomRigCount > 0;

    case 'securityTier':
      if (plan.isCustom) return 'Enterprise';
      const sec = plan.securityTier;
      return sec === 'standard' ? 'Basic' : sec === 'enhanced' ? 'Enhanced' : 'Advanced';

    case 'support':
      return getSupportLabel(plan.supportChannels, plan.supportSlaHours);

    default:
      return '';
  }
}
