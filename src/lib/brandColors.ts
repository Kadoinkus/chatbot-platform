// Client brand colors mapping utility
export const getClientBrandColor = (clientId: string): string => {
  switch (clientId) {
    case 'c1': // Jumbo
      return '#FFD700';
    case 'c2': // HiTapes
      return '#A855F7';
    case 'c3': // Happinessbureau
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

export const clientBrandColors = {
  c1: '#FFD700', // Jumbo - Yellow
  c2: '#A855F7', // HiTapes - Light Purple
  c3: '#EF4444', // Happinessbureau - Red
} as const;