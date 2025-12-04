/**
 * Slug Resolution Utility (Server-side only)
 *
 * Resolves client slugs to client IDs and full client objects.
 * Used by API routes and middleware for URL-based client lookups.
 */

import type { Client } from '@/types';
import { loadClients, getClientById as getClientByIdFromLoader, getClientBySlug } from './dataLoader.server';

export type SlugResolution = {
  clientId: string;
  client: Client;
} | null;

/**
 * Resolve a client slug to its ID and full client object
 * @param slug - The URL-friendly client slug (e.g., "jumbo")
 * @returns Object with clientId and client, or null if not found
 */
export function resolveClientSlug(slug: string): SlugResolution {
  try {
    const client = getClientBySlug(slug);

    if (!client) {
      return null;
    }

    return {
      clientId: client.id,
      client,
    };
  } catch (error) {
    console.error('Error resolving client slug:', error);
    return null;
  }
}

/**
 * Resolve a client ID to its slug
 * @param clientId - The client ID
 * @returns The client slug, or null if not found
 */
export function resolveClientId(clientId: string): string | null {
  try {
    const client = getClientByIdFromLoader(clientId);
    return client?.slug ?? null;
  } catch (error) {
    console.error('Error resolving client ID:', error);
    return null;
  }
}

/**
 * Validate that a slug matches a client ID
 * @param slug - The URL slug
 * @param clientId - The expected client ID
 * @returns True if the slug belongs to the client ID
 */
export function validateSlugClientId(
  slug: string,
  clientId: string
): boolean {
  const resolution = resolveClientSlug(slug);
  return resolution?.clientId === clientId;
}

/**
 * Get client by ID with full data
 * @param clientId - The client ID
 * @returns Client object or null
 */
export function getClientById(clientId: string): Client | null {
  try {
    return getClientByIdFromLoader(clientId) ?? null;
  } catch (error) {
    console.error('Error getting client by ID:', error);
    return null;
  }
}
