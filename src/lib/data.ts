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
import type { AgentStatus, Assistant, Palette } from '@/types';

// Import JSON data directly for synchronous access (needed for auth)
// These are in snake_case format (DB format) - matching Supabase
import clientsJson from '../../public/data/clients.json';
import mascotsJson from '../../public/data/mascots.json';
import type { DB_Client, DB_Mascot } from '@/types/database';

// For authentication and initial page loads, we need synchronous data
// This merges clients with their mascots/assistants for backward compatibility
export const clients = (clientsJson as DB_Client[]).map(client => {
  // Find mascots for this client (using snake_case field from JSON)
  const clientMascots: Assistant[] = (mascotsJson as DB_Mascot[])
    .filter(mascot => mascot.client_slug === client.slug)
    .map(mascot => ({
      id: mascot.mascot_slug, // Use mascot_slug as ID for compatibility
      clientId: mascot.client_slug,
      workspaceId: mascot.workspace_id,
      name: mascot.name,
      image: mascot.image_url || '',
      status: mascot.status as AgentStatus,
      conversations: mascot.total_conversations,
      description: mascot.description || '',
      metrics: {
        responseTime: mascot.avg_response_time_ms ? mascot.avg_response_time_ms / 1000 : 0,
        resolutionRate: mascot.resolution_rate || 0,
        csat: mascot.csat_score || 0,
      }
    }));

  // Build palette from client colors
  const palette: Palette = {
    primary: client.palette_primary || '#6366F1',
    primaryDark: client.palette_primary_dark || '#4F46E5',
    accent: client.palette_accent || '#111827',
  };

  return {
    id: client.slug, // Use slug as id for backward compatibility
    slug: client.slug,
    name: client.name,
    email: client.email,
    phone: client.phone,
    website: client.website,
    logoUrl: client.logo_url,
    industry: client.industry,
    companySize: client.company_size,
    country: client.country,
    timezone: client.timezone,
    palette,
    // Demo login credentials (not in production DB, only for mock data)
    login: (client as any).login as { email: string; password: string } | undefined,
    defaultWorkspaceId: client.default_workspace_id,
    isDemo: client.is_demo,
    status: client.status,
    trialEndsAt: client.trial_ends_at,
    createdAt: client.created_at,
    updatedAt: client.updated_at,
    assistants: clientMascots,
    metrics: {
      usageByDay: [],
      topIntents: [],
      csat: 0
    }
  };
});

// Async function to get full client data
export async function getFullClientData() {
  try {
    return await getClientsWithAssistants();
  } catch (error) {
    console.warn('Failed to load external data, falling back to minimal data:', error);
    return clients;
  }
}
