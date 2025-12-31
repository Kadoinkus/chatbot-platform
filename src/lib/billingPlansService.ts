/**
 * Billing Plans Service
 *
 * Server-side service for fetching billing plans from Supabase.
 * Used by server components to get plan data without API routes.
 */

import { supabaseDb } from '@/lib/db/supabase';
import type { BillingPlan } from '@/types';

/**
 * Get all billing plans for public display.
 * Excludes 'custom' plan, returns starter, basic, premium, enterprise.
 * Ordered by tier (not price).
 *
 * Returns empty array on error to allow graceful degradation.
 */
export async function getBillingPlans(): Promise<BillingPlan[]> {
  try {
    return await supabaseDb.billingPlans.getDisplayPlans();
  } catch (error) {
    console.error('Failed to fetch billing plans:', error);
    return [];
  }
}

/**
 * Get a specific billing plan by slug.
 * Returns null if not found or on error.
 */
export async function getBillingPlanBySlug(
  slug: 'starter' | 'basic' | 'premium' | 'enterprise' | 'custom'
): Promise<BillingPlan | null> {
  try {
    return await supabaseDb.billingPlans.getBySlug(slug);
  } catch (error) {
    console.error(`Failed to fetch billing plan '${slug}':`, error);
    return null;
  }
}
