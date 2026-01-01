'use client';

import { useMemo, useEffect } from 'react';
import {
  resolveColor,
  registerClientColors,
  registerMascotColors,
} from '@/lib/brandColors';
import type { Client, Assistant } from '@/types';

interface UseBrandColorOptions {
  client?: Client | null;
  assistant?: Assistant | null;
  colorType?: 'primary' | 'secondary' | 'background';
}

/**
 * Hook for resolving brand colors with mascot override support
 * Automatically registers colors to cache when client/assistant are provided
 *
 * @param options - Client, assistant, and color type to resolve
 * @returns The resolved color hex string
 */
export function useBrandColor({
  client,
  assistant,
  colorType = 'primary',
}: UseBrandColorOptions): string {
  // Register client colors to cache
  useEffect(() => {
    if (client?.brandColors?.primary) {
      registerClientColors(client.id, client.brandColors);
      registerClientColors(client.slug, client.brandColors);
    } else if (client?.palette?.primary) {
      // Legacy fallback
      registerClientColors(client.id, { primary: client.palette.primary });
      registerClientColors(client.slug, { primary: client.palette.primary });
    }
  }, [client]);

  // Register mascot colors to cache
  useEffect(() => {
    if (assistant?.colors && assistant.id) {
      registerMascotColors(assistant.id, assistant.colors);
    }
  }, [assistant]);

  // Resolve color with proper fallback chain
  return useMemo(() => {
    const resolved = resolveColor({
      mascotSlug: assistant?.id,
      clientSlugOrId: client?.slug || client?.id,
      colorType,
      mascotColors: assistant?.colors,
      brandColors: client?.brandColors,
    });

    // Always return a string with safe fallback
    // For secondary/background, fall back to primary color if not defined
    if (resolved) return resolved;

    // No color found - return default grey
    return '#6B7280';
  }, [
    assistant?.id,
    assistant?.colors,
    client?.slug,
    client?.id,
    client?.brandColors,
    colorType,
  ]);
}

/**
 * Convenience hook for primary color only
 */
export function usePrimaryColor(
  client?: Client | null,
  assistant?: Assistant | null
): string {
  return useBrandColor({ client, assistant, colorType: 'primary' });
}

/**
 * Convenience hook for secondary color only
 */
export function useSecondaryColor(
  client?: Client | null,
  assistant?: Assistant | null
): string {
  return useBrandColor({ client, assistant, colorType: 'secondary' });
}
