export type Palette = { primary: string; primaryDark: string; accent: string; };
export type Mascot = {
  id: string;
  name: string;
  image: string;
  status: 'Live'|'Paused'|'Needs finalization';
  conversations: number;
  description: string;
  metrics: {
    usageByDay: Array<{ date: string; conversations: number; resolved: number }>;
    topIntents: Array<{ intent: string; count: number }>;
    responseTime: number;
    resolutionRate: number;
    csat: number;
  };
};
export type Client = {
  id: string; name: string; slug: string; palette: Palette;
  login: { email: string; password: string };
  mascots: Mascot[];
  metrics: {
    usageByDay: Array<{ date: string; conversations: number; resolved: number }>;
    topIntents: Array<{ intent: string; count: number }>;
    csat: number;
  };
};
export const clients: Client[] = [
  {
    id: 'c1', name: 'Jumbo', slug: 'jumbo',
    palette: { primary: '#FFD700', primaryDark: '#E6C200', accent: '#111827' },
    login: { email: 'jumbo@demo.app', password: 'jumbo123' },
    mascots: [
      { 
        id: 'm1', 
        name: 'Liza', 
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liza&backgroundColor=FFD700',
        status: 'Live', 
        conversations: 482,
        description: 'Customer service bot for general inquiries',
        metrics: {
          usageByDay: [
            { date: '2025-08-01', conversations: 80, resolved: 64 },
            { date: '2025-08-02', conversations: 65, resolved: 52 },
            { date: '2025-08-03', conversations: 90, resolved: 75 },
            { date: '2025-08-04', conversations: 60, resolved: 48 },
            { date: '2025-08-05', conversations: 75, resolved: 63 },
            { date: '2025-08-06', conversations: 95, resolved: 82 },
            { date: '2025-08-07', conversations: 85, resolved: 70 }
          ],
          topIntents: [
            { intent: 'Opening hours', count: 150 },
            { intent: 'Product availability', count: 120 },
            { intent: 'Store locations', count: 95 }
          ],
          responseTime: 1.2,
          resolutionRate: 82,
          csat: 4.5
        }
      },
      { 
        id: 'm2', 
        name: 'Remco', 
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Remco&backgroundColor=FFD700',
        status: 'Live', 
        conversations: 324,
        description: 'Technical support specialist bot',
        metrics: {
          usageByDay: [
            { date: '2025-08-01', conversations: 40, resolved: 32 },
            { date: '2025-08-02', conversations: 33, resolved: 29 },
            { date: '2025-08-03', conversations: 40, resolved: 34 },
            { date: '2025-08-04', conversations: 30, resolved: 22 },
            { date: '2025-08-05', conversations: 39, resolved: 34 },
            { date: '2025-08-06', conversations: 45, resolved: 39 },
            { date: '2025-08-07', conversations: 43, resolved: 35 }
          ],
          topIntents: [
            { intent: 'Returns', count: 60 },
            { intent: 'Technical issues', count: 55 },
            { intent: 'Warranty', count: 42 }
          ],
          responseTime: 0.8,
          resolutionRate: 88,
          csat: 4.7
        }
      }
    ],
    metrics: {
      usageByDay: [
        { date: '2025-08-01', conversations: 120, resolved: 96 },
        { date: '2025-08-02', conversations: 98, resolved: 81 },
        { date: '2025-08-03', conversations: 130, resolved: 109 },
        { date: '2025-08-04', conversations: 90, resolved: 70 },
        { date: '2025-08-05', conversations: 114, resolved: 97 },
        { date: '2025-08-06', conversations: 140, resolved: 121 },
        { date: '2025-08-07', conversations: 128, resolved: 105 }
      ],
      topIntents: [
        { intent: 'Opening hours', count: 210 },
        { intent: 'Returns', count: 150 },
        { intent: 'Employee onboarding', count: 92 },
        { intent: 'Vacancies', count: 65 }
      ],
      csat: 4.6
    }
  },
  {
    id: 'c2', name: 'HiTapes', slug: 'hitapes',
    palette: { primary: '#0EA5E9', primaryDark: '#0284C7', accent: '#111827' },
    login: { email: 'hitapes@demo.app', password: 'hitapes123' },
    mascots: [
      { 
        id: 'm3', 
        name: 'Vinny', 
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vinny&backgroundColor=0EA5E9',
        status: 'Live', 
        conversations: 322,
        description: 'Sales assistant and product recommendations',
        metrics: {
          usageByDay: [
            { date: '2025-08-01', conversations: 60, resolved: 48 },
            { date: '2025-08-02', conversations: 55, resolved: 45 },
            { date: '2025-08-03', conversations: 62, resolved: 50 },
            { date: '2025-08-04', conversations: 70, resolved: 55 },
            { date: '2025-08-05', conversations: 68, resolved: 54 },
            { date: '2025-08-06', conversations: 75, resolved: 63 },
            { date: '2025-08-07', conversations: 80, resolved: 66 }
          ],
          topIntents: [
            { intent: 'Pricing', count: 77 },
            { intent: 'Shipping tapes', count: 65 },
            { intent: 'Supported formats', count: 40 }
          ],
          responseTime: 0.9,
          resolutionRate: 85,
          csat: 4.8
        }
      },
      { 
        id: 'm4', 
        name: 'Max', 
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max&backgroundColor=0EA5E9',
        status: 'Paused', 
        conversations: 0,
        description: 'Onboarding specialist for new customers',
        metrics: {
          usageByDay: [
            { date: '2025-08-01', conversations: 0, resolved: 0 },
            { date: '2025-08-02', conversations: 0, resolved: 0 },
            { date: '2025-08-03', conversations: 0, resolved: 0 },
            { date: '2025-08-04', conversations: 0, resolved: 0 },
            { date: '2025-08-05', conversations: 0, resolved: 0 },
            { date: '2025-08-06', conversations: 0, resolved: 0 },
            { date: '2025-08-07', conversations: 0, resolved: 0 }
          ],
          topIntents: [],
          responseTime: 0,
          resolutionRate: 0,
          csat: 0
        }
      }
    ],
    metrics: {
      usageByDay: [
        { date: '2025-08-01', conversations: 60, resolved: 48 },
        { date: '2025-08-02', conversations: 55, resolved: 45 },
        { date: '2025-08-03', conversations: 62, resolved: 50 },
        { date: '2025-08-04', conversations: 70, resolved: 55 },
        { date: '2025-08-05', conversations: 68, resolved: 54 },
        { date: '2025-08-06', conversations: 75, resolved: 63 },
        { date: '2025-08-07', conversations: 80, resolved: 66 }
      ],
      topIntents: [
        { intent: 'Pricing', count: 77 },
        { intent: 'Shipping tapes', count: 65 },
        { intent: 'Supported formats', count: 40 }
      ],
      csat: 4.8
    }
  },
  {
    id: 'c3', name: 'Happinessbureau', slug: 'happiness',
    palette: { primary: '#EF4444', primaryDark: '#DC2626', accent: '#111827' },
    login: { email: 'happiness@demo.app', password: 'happy123' },
    mascots: [
      { 
        id: 'm5', 
        name: 'HappyBot', 
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HappyBot&backgroundColor=EF4444',
        status: 'Needs finalization', 
        conversations: 0,
        description: 'Workshop coordinator and event management',
        metrics: {
          usageByDay: [
            { date: '2025-08-01', conversations: 20, resolved: 15 },
            { date: '2025-08-02', conversations: 18, resolved: 14 },
            { date: '2025-08-03', conversations: 22, resolved: 16 },
            { date: '2025-08-04', conversations: 25, resolved: 20 },
            { date: '2025-08-05', conversations: 27, resolved: 22 },
            { date: '2025-08-06', conversations: 30, resolved: 24 },
            { date: '2025-08-07', conversations: 28, resolved: 23 }
          ],
          topIntents: [
            { intent: 'Workshop info', count: 18 },
            { intent: 'Booking', count: 15 },
            { intent: 'Case studies', count: 12 }
          ],
          responseTime: 1.5,
          resolutionRate: 75,
          csat: 4.4
        }
      },
      { 
        id: 'm6', 
        name: 'Joy', 
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joy&backgroundColor=EF4444',
        status: 'Live', 
        conversations: 156,
        description: 'HR assistant for internal queries',
        metrics: {
          usageByDay: [
            { date: '2025-08-01', conversations: 15, resolved: 12 },
            { date: '2025-08-02', conversations: 14, resolved: 11 },
            { date: '2025-08-03', conversations: 18, resolved: 15 },
            { date: '2025-08-04', conversations: 20, resolved: 16 },
            { date: '2025-08-05', conversations: 22, resolved: 18 },
            { date: '2025-08-06', conversations: 25, resolved: 20 },
            { date: '2025-08-07', conversations: 23, resolved: 19 }
          ],
          topIntents: [
            { intent: 'Team building', count: 25 },
            { intent: 'Company culture', count: 20 },
            { intent: 'Benefits', count: 15 }
          ],
          responseTime: 1.0,
          resolutionRate: 80,
          csat: 4.6
        }
      }
    ],
    metrics: {
      usageByDay: [
        { date: '2025-08-01', conversations: 20, resolved: 15 },
        { date: '2025-08-02', conversations: 18, resolved: 14 },
        { date: '2025-08-03', conversations: 22, resolved: 16 },
        { date: '2025-08-04', conversations: 25, resolved: 20 },
        { date: '2025-08-05', conversations: 27, resolved: 22 },
        { date: '2025-08-06', conversations: 30, resolved: 24 },
        { date: '2025-08-07', conversations: 28, resolved: 23 }
      ],
      topIntents: [
        { intent: 'Workshop info', count: 18 },
        { intent: 'Booking', count: 15 },
        { intent: 'Case studies', count: 12 }
      ],
      csat: 4.4
    }
  }
];
