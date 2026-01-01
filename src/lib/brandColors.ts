/**
 * Brand & Mascot Color Resolution
 *
 * Two-level color system:
 *   - Brand defaults on clients (brand_color_*)
 *   - Optional mascot overrides on mascots (mascot_color_*)
 *
 * Resolution chain: mascot override → client brand → hardcoded fallback → default
 */

import type { BrandColors, AssistantColors, ColorMode } from '@/types';

const DEFAULT_PRIMARY = '#6B7280';

// =============================================================================
// Dual Caches
// =============================================================================

const clientColorCache: Record<string, BrandColors> = {};
const mascotColorCache: Record<string, AssistantColors> = {};

// Hardcoded fallbacks for demo clients (keys are lowercase slugs)
// NOTE: Actual slugs are 'jumboDemo', 'hitapesDemo' - stored lowercase for case-insensitive lookup
const brandMap: Record<string, string> = {
  jumbodemo: '#FFD700', // Jumbo - Yellow
  hitapesdemo: '#0EA5E9', // HiTapes - Cyan Blue
  // Demo UUIDs map to their colors
  'c1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c': '#FFD700', // jumboDemo id
  'd2e3f4a5-b6c7-4d8e-9f0a-1b2c3d4e5f6a': '#0EA5E9', // hitapesDemo id
};

// =============================================================================
// Registration Functions
// =============================================================================

/**
 * Register a client's brand colors (call when fetching client data)
 */
export function registerClientColors(clientIdOrSlug: string, colors: BrandColors): void {
  if (clientIdOrSlug && colors.primary) {
    clientColorCache[clientIdOrSlug.toLowerCase()] = colors;
  }
}

/**
 * Register a mascot's color overrides (call when fetching assistant data)
 */
export function registerMascotColors(mascotSlug: string, colors: AssistantColors): void {
  if (mascotSlug && (colors.primary || colors.secondary || colors.background)) {
    mascotColorCache[mascotSlug.toLowerCase()] = colors;
  }
}

/**
 * @deprecated Use registerClientColors instead
 */
export function registerClientPalette(clientIdOrSlug: string, primaryColor: string): void {
  registerClientColors(clientIdOrSlug, { primary: primaryColor });
}

// =============================================================================
// Resolution Functions
// =============================================================================

export interface ResolveColorOptions {
  mascotSlug?: string;
  clientSlugOrId?: string;
  colorType?: 'primary' | 'secondary' | 'background';
  /** Direct mascot colors object - bypasses cache lookup */
  mascotColors?: AssistantColors;
  /** Direct brand colors object - bypasses cache lookup */
  brandColors?: BrandColors;
  /** Direct value for SSR - bypasses cache (deprecated, use mascotColors) */
  providedMascotColor?: string;
  /** Direct value for SSR - bypasses cache (deprecated, use brandColors) */
  providedBrandColor?: string;
}

/**
 * Resolve a color with mascot override priority
 *
 * Resolution order:
 * 1. mascotColors object (direct pass-through, bypasses cache)
 * 2. providedMascotColor (legacy SSR bypass)
 * 3. brandColors object (direct pass-through, bypasses cache)
 * 4. providedBrandColor (legacy SSR bypass)
 * 5. mascotColorCache[mascotSlug]
 * 6. clientColorCache[clientSlugOrId]
 * 7. hardcoded brandMap (demo accounts, primary only)
 * 8. default (#6B7280 for primary, undefined for others)
 */
export function resolveColor({
  mascotSlug,
  clientSlugOrId,
  colorType = 'primary',
  mascotColors,
  brandColors,
  providedMascotColor,
  providedBrandColor,
}: ResolveColorOptions): string | undefined {
  // 1. Direct mascot colors object (preferred method)
  if (mascotColors?.[colorType]) {
    return mascotColors[colorType];
  }

  // 2. Legacy SSR bypass - provided mascot color string
  if (providedMascotColor) {
    return providedMascotColor;
  }

  // 3. Direct brand colors object
  if (brandColors?.[colorType]) {
    return brandColors[colorType];
  }

  // 4. Legacy SSR bypass - provided brand color string
  if (providedBrandColor) {
    return providedBrandColor;
  }

  // 5. Check mascot cache
  if (mascotSlug) {
    const mascotKey = mascotSlug.toLowerCase();
    const cachedMascotColors = mascotColorCache[mascotKey];
    if (cachedMascotColors?.[colorType]) {
      return cachedMascotColors[colorType]!;
    }
  }

  // 6. Check client cache
  if (clientSlugOrId) {
    const clientKey = clientSlugOrId.toLowerCase();
    const cachedClientColors = clientColorCache[clientKey];
    if (cachedClientColors?.[colorType]) {
      return cachedClientColors[colorType]!;
    }

    // 7. Check hardcoded map (legacy demo accounts) - only for primary
    if (colorType === 'primary' && brandMap[clientKey]) {
      return brandMap[clientKey];
    }
  }

  // 8. Default fallback
  if (colorType === 'primary') {
    return DEFAULT_PRIMARY;
  }

  // For secondary/background, fall back to a resolved primary to avoid empty CSS values
  const fallbackPrimary =
    mascotColors?.primary ||
    providedMascotColor ||
    brandColors?.primary ||
    providedBrandColor ||
    (mascotSlug ? mascotColorCache[mascotSlug.toLowerCase()]?.primary : undefined) ||
    (clientSlugOrId ? clientColorCache[clientSlugOrId.toLowerCase()]?.primary : undefined) ||
    (clientSlugOrId ? brandMap[clientSlugOrId.toLowerCase()] : undefined) ||
    DEFAULT_PRIMARY;

  return fallbackPrimary;
}

/**
 * Get brand color for a client (backward compatible)
 * @deprecated Prefer resolveColor() for mascot-aware resolution
 */
export function getClientBrandColor(clientIdOrSlug: string, brandColors?: BrandColors): string {
  return resolveColor({ clientSlugOrId: clientIdOrSlug, brandColors, colorType: 'primary' }) || DEFAULT_PRIMARY;
}

/**
 * Get color for a mascot with fallback to client brand
 *
 * @param mascotSlug - The mascot/assistant ID
 * @param clientSlugOrId - The client ID or slug for fallback
 * @param colorType - Which color to resolve (default: 'primary')
 * @param mascotColors - Optional direct colors object (bypasses cache)
 * @param brandColors - Optional direct brand colors object (bypasses cache)
 */
export function getMascotColor(
  mascotSlug: string,
  clientSlugOrId: string,
  colorType: 'primary' | 'secondary' | 'background' = 'primary',
  mascotColors?: AssistantColors,
  brandColors?: BrandColors
): string {
  return resolveColor({ mascotSlug, clientSlugOrId, colorType, mascotColors, brandColors }) || DEFAULT_PRIMARY;
}

/**
 * Get color mode for a mascot with fallback to client brand
 */
export function getMascotColorMode(mascotSlug: string, clientSlugOrId: string): ColorMode | undefined {
  const mascotKey = mascotSlug?.toLowerCase();
  const clientKey = clientSlugOrId?.toLowerCase();

  // Check mascot first
  if (mascotKey && mascotColorCache[mascotKey]?.mode) {
    return mascotColorCache[mascotKey].mode;
  }

  // Check client
  if (clientKey && clientColorCache[clientKey]?.mode) {
    return clientColorCache[clientKey].mode;
  }

  return undefined;
}

// =============================================================================
// Cache Utilities
// =============================================================================

/**
 * Check if a client's colors are registered in the cache
 */
export function hasClientColors(clientIdOrSlug: string): boolean {
  const key = clientIdOrSlug?.toLowerCase();
  return !!(key && clientColorCache[key]);
}

/**
 * Check if a mascot's colors are registered in the cache
 */
export function hasMascotColors(mascotSlug: string): boolean {
  const key = mascotSlug?.toLowerCase();
  return !!(key && mascotColorCache[key]);
}

/**
 * Get the cached brand colors for a client (or undefined if not cached)
 */
export function getCachedClientColors(clientIdOrSlug: string): BrandColors | undefined {
  const key = clientIdOrSlug?.toLowerCase();
  return key ? clientColorCache[key] : undefined;
}

/**
 * Get the cached color overrides for a mascot (or undefined if not cached)
 */
export function getCachedMascotColors(mascotSlug: string): AssistantColors | undefined {
  const key = mascotSlug?.toLowerCase();
  return key ? mascotColorCache[key] : undefined;
}

// Export hardcoded map for backward compatibility
export const clientBrandColors = brandMap;
