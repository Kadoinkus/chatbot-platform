// Client brand colors mapping utility
const brandMap = {
  'demo-jumbo': '#FFD700', // Jumbo - Yellow
  'demo-hitapes': '#A855F7', // HiTapes - Light Purple
  'demo-happiness': '#EF4444', // Happinessbureau - Red
  // Demo UUIDs map to their slugs so UUID-based sessions still get colors
  'c1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c': '#FFD700', // demo-jumbo id
  'd2e3f4a5-b6c7-4d8e-9f0a-1b2c3d4e5f6a': '#A855F7', // demo-hitapes id
} as const;

export const getClientBrandColor = (clientIdOrSlug: string): string => {
  const key = (clientIdOrSlug || '').toLowerCase();
  return brandMap[key] || '#6B7280';
};

export const clientBrandColors = brandMap;
