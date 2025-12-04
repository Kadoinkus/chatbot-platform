// Re-export types from centralized location
export type {
  Palette,
  Bot,
  Client,
  User,
  UsageData,
  IntentData,
  BotStatus,
} from '@/types';

// Import the async data functions
import { getClientsWithBots } from './dataService';
import type { Bot, BotStatus } from '@/types';

// Import JSON data directly for synchronous access (needed for auth)
import clientsJson from '../../public/data/clients.json';
import botsJson from '../../public/data/bots.json';

// For authentication and initial page loads, we need synchronous data
// This merges clients with their bots for backward compatibility
export const clients = clientsJson.map(client => ({
  ...client,
  bots: botsJson
    .filter(bot => bot.clientId === client.id)
    .map(bot => ({
      ...bot,
      status: bot.status as BotStatus,
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