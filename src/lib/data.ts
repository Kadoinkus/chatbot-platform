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

import type { AgentStatus, Assistant, Palette, Client } from '@/types';

// Synchronous mock data for legacy/demo flows (used by some client components)
// These imports are tree-shaken out of production builds when not used.
import clientsJson from '../../public/data/clients.json';
import mascotsJson from '../../public/data/mascots.json';
import type { DB_Client, DB_Mascot } from '@/types/database';

// Extended DB_Client type for demo JSON which includes login credentials
type DemoClient = DB_Client & {
  login?: { email: string; password: string };
};

// Build a synchronous clients array (legacy/demo)
export const clients: Client[] = (clientsJson as DemoClient[]).map(client => {
  // Find mascots for this client (using snake_case field from JSON)
  const clientMascots: Assistant[] = (mascotsJson as DB_Mascot[])
    .filter(mascot => mascot.client_slug === client.slug)
    .map(mascot => ({
      id: mascot.mascot_slug, // Use mascot_slug as ID for compatibility
      clientId: mascot.client_slug,
      workspaceSlug: mascot.workspace_slug,
      name: mascot.name,
      // Prefer asset-based avatar, fall back to legacy image_url for mocks
      image: mascot.avatar_asset_url || mascot.image_url || '',
      status: mascot.status as AgentStatus,
      conversations: mascot.total_conversations,
      description: mascot.description || '',
      metrics: {
        responseTime: mascot.avg_response_time_ms ? mascot.avg_response_time_ms / 1000 : 0,
        resolutionRate: mascot.resolution_rate || 0,
      },
      usage: {
        bundleLoads: mascot.bundle_loads_used || 0,
        sessions: mascot.sessions_used || 0,
        messages: mascot.messages_used || 0,
      },
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
    email: client.email || undefined,
    phone: client.phone || undefined,
    website: client.website || undefined,
    // Prefer asset-based logo, fall back to legacy logo_url in mock JSON
    logoUrl: client.logo_asset_url || client.logo_url || undefined,
    industry: client.industry || undefined,
    companySize: client.company_size || undefined,
    country: client.country || undefined,
    timezone: client.timezone || undefined,
    palette,
    // Demo login credentials (not in production DB, only for mock data)
    login: client.login,
    defaultWorkspaceId: client.default_workspace_id || undefined,
    isDemo: client.is_demo,
    status: client.status,
    trialEndsAt: client.trial_ends_at || undefined,
    createdAt: client.created_at,
    updatedAt: client.updated_at || undefined,
  };
});
