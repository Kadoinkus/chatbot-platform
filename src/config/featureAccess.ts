import { UserRole } from '@/types';

export type FeatureKey =
  | 'settings'
  | 'help'
  | 'cart'
  | 'marketplace'
  | 'analytics.trueCosts'
  | 'assistant.support'
  | 'assistant.operations';

const featureVisibility: Record<FeatureKey, UserRole[]> = {
  settings: [],
  help: [],
  cart: [],
  marketplace: [],
  'analytics.trueCosts': [],
  'assistant.support': [],
  'assistant.operations': [],
};

/**
 * Returns true when the given role should see a feature.
 * Superadmins always see everything so they can continue development.
 */
export function canAccessFeature(
  feature: FeatureKey,
  options?: { role?: UserRole; isSuperadmin?: boolean },
): boolean {
  const role = options?.role;
  const isSuperadmin = options?.isSuperadmin;

  if (isSuperadmin) {
    return true;
  }

  if (!role) {
    return false;
  }

  return featureVisibility[feature]?.includes(role) ?? false;
}
