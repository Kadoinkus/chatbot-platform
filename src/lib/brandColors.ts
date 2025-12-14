// Client brand colors mapping utility
// Hardcoded fallbacks for demo clients (when palette not available)
const brandMap: Record<string, string> = {
  'demo-jumbo': '#FFD700', // Jumbo - Yellow
  'demo-hitapes': '#A855F7', // HiTapes - Light Purple
  'demo-happiness': '#EF4444', // Happinessbureau - Red
  // Demo UUIDs map to their slugs so UUID-based sessions still get colors
  'c1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c': '#FFD700', // demo-jumbo id
  'd2e3f4a5-b6c7-4d8e-9f0a-1b2c3d4e5f6a': '#A855F7', // demo-hitapes id
};

// Runtime cache for client palettes (populated from API responses)
const paletteCache: Record<string, string> = {};

/**
 * Register a client's brand color (call this when fetching client data)
 */
export const registerClientPalette = (clientIdOrSlug: string, primaryColor: string): void => {
  if (clientIdOrSlug && primaryColor) {
    paletteCache[clientIdOrSlug.toLowerCase()] = primaryColor;
  }
};

/**
 * Get brand color for a client
 * Priority: 1) Cached palette 2) Hardcoded map 3) Default gray
 */
export const getClientBrandColor = (clientIdOrSlug: string): string => {
  const key = (clientIdOrSlug || '').toLowerCase();
  return paletteCache[key] || brandMap[key] || '#6B7280';
};

export const clientBrandColors = brandMap;
