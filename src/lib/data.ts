// Re-export types and functions from dataService
export type { 
  Palette, 
  Bot as Mascot, // Keep the old name for compatibility
  Client, 
  User,
  UsageData,
  IntentData
} from './dataService';

// Import the async data functions
import { getClientsWithBots } from './dataService';

// Import JSON data directly for synchronous access (needed for auth)
import clientsJson from '../../public/data/clients.json';
import botsJson from '../../public/data/bots.json';

// For authentication and initial page loads, we need synchronous data
// This merges clients with their bots for backward compatibility
export const clients = clientsJson.map(client => ({
  ...client,
  mascots: botsJson
    .filter(bot => bot.clientId === client.id)
    .map(bot => ({
      ...bot,
      status: bot.status as 'Live' | 'Paused' | 'Needs finalization',
      metrics: {
        ...bot.metrics,
        usageByDay: [],
        topIntents: []
      }
    })),
  metrics: {
    usageByDay: [],
    topIntents: [],
    csat: 0
  }
}));

// Async function to get full client data
export async function getFullClientData() {
  try {
    return await getClientsWithBots();
  } catch (error) {
    console.warn('Failed to load external data, falling back to minimal data:', error);
    return clients;
  }
}