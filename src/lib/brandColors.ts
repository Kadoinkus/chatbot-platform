// Client brand colors mapping utility
export const getClientBrandColor = (clientId: string): string => {
  switch (clientId) {
    case 'demo-jumbo': // Jumbo
      return '#FFD700';
    case 'demo-hitapes': // HiTapes
      return '#A855F7';
    case 'demo-happiness': // Happinessbureau
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

export const clientBrandColors = {
  'demo-jumbo': '#FFD700', // Jumbo - Yellow
  'demo-hitapes': '#A855F7', // HiTapes - Light Purple
  'demo-happiness': '#EF4444', // Happinessbureau - Red
} as const;
