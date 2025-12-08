// Re-export types from centralized location
export type {
  Palette,
  Assistant,
  Client,
  User,
  UsageData,
  IntentData,
  AgentStatus,
  // Legacy aliases
  Bot,
  BotStatus,
} from '@/types';

// Import the async data functions
import { getClientsWithAssistants } from './dataService';
import type { Assistant, AgentStatus } from '@/types';

// Import JSON data directly for synchronous access (needed for auth)
import clientsJson from '../../public/data/clients.json';
import assistantsJson from '../../public/data/assistants.json';

// For authentication and initial page loads, we need synchronous data
// This merges clients with their assistants for backward compatibility
export const clients = clientsJson.map(client => ({
  ...client,
  assistants: assistantsJson
    .filter(assistant => assistant.clientId === client.id)
    .map(assistant => ({
      ...assistant,
      status: assistant.status as AgentStatus,
      metrics: {
        ...assistant.metrics,
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
    return await getClientsWithAssistants();
  } catch (error) {
    console.warn('Failed to load external data, falling back to minimal data:', error);
    return clients;
  }
}
