/**
 * Chart Color Utilities
 *
 * Provides a consistent color palette for all charts across the application.
 * Supports 20+ distinct colors using brand color, greys, and brand tints.
 *
 * Usage:
 *   import { getChartColors, GREYS } from '@/lib/chartColors';
 *   const colors = getChartColors(brandColor, 5);
 */

/**
 * Grey scale for charts (8 shades from black to white)
 * These work well in both light and dark mode
 */
export const GREYS = [
  '#1F2937', // gray-800 (near black)
  '#374151', // gray-700
  '#4B5563', // gray-600
  '#6B7280', // gray-500
  '#9CA3AF', // gray-400
  '#D1D5DB', // gray-300
  '#E5E7EB', // gray-200
  '#F3F4F6', // gray-100 (near white)
] as const;

/**
 * Named grey colors for convenience
 */
export const GREY = {
  black: GREYS[0],
  900: GREYS[0],
  800: GREYS[1],
  700: GREYS[2],
  600: GREYS[3],
  500: GREYS[4],
  400: GREYS[5],
  300: GREYS[6],
  white: GREYS[7],
  200: GREYS[7],
} as const;

/**
 * Lighten a hex color by mixing with white
 * @param hex - Hex color code (with or without #)
 * @param percent - Amount to lighten (0-1, where 1 is pure white)
 * @returns Lightened hex color
 */
export function lightenColor(hex: string, percent: number): string {
  // Remove # if present
  const color = hex.replace('#', '');

  // Parse RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Mix with white (255, 255, 255)
  const newR = Math.round(r + (255 - r) * percent);
  const newG = Math.round(g + (255 - g) * percent);
  const newB = Math.round(b + (255 - b) * percent);

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Darken a hex color by mixing with black
 * @param hex - Hex color code (with or without #)
 * @param percent - Amount to darken (0-1, where 1 is pure black)
 * @returns Darkened hex color
 */
export function darkenColor(hex: string, percent: number): string {
  // Remove # if present
  const color = hex.replace('#', '');

  // Parse RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Mix with black (0, 0, 0)
  const newR = Math.round(r * (1 - percent));
  const newG = Math.round(g * (1 - percent));
  const newB = Math.round(b * (1 - percent));

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Generate brand tints (lighter versions of brand color)
 * @param brandColor - The brand color hex code
 * @returns Array of 5 progressively lighter tints
 */
export function getBrandTints(brandColor: string): string[] {
  return [
    lightenColor(brandColor, 0.25), // 25% lighter
    lightenColor(brandColor, 0.40), // 40% lighter
    lightenColor(brandColor, 0.55), // 55% lighter
    lightenColor(brandColor, 0.70), // 70% lighter
    lightenColor(brandColor, 0.82), // 82% lighter
  ];
}

/**
 * Get chart colors for N values (supports 20+ values)
 *
 * Color order: brand → black → white → alternating greys and brand tints
 * This ensures maximum visual distinction between adjacent segments.
 *
 * @param brandColor - The brand color hex code
 * @param count - Number of colors needed
 * @returns Array of hex color codes
 *
 * @example
 * // For a pie chart with 3 segments
 * const colors = getChartColors('#FFD700', 3);
 * // Returns: ['#FFD700', '#1F2937', '#F3F4F6']
 *
 * @example
 * // For a bar chart with 6 categories
 * const colors = getChartColors('#A855F7', 6);
 */
export function getChartColors(brandColor: string, count: number): string[] {
  const brandTints = getBrandTints(brandColor);

  // Build palette: brand, black, white, then interleave greys and brand tints
  const palette = [
    brandColor,      // 1. Brand (full)
    GREYS[0],        // 2. Black
    GREYS[7],        // 3. Near white
    GREYS[2],        // 4. Dark grey
    brandTints[0],   // 5. Brand tint 1
    GREYS[4],        // 6. Medium grey
    brandTints[1],   // 7. Brand tint 2
    GREYS[1],        // 8. Very dark grey
    brandTints[2],   // 9. Brand tint 3
    GREYS[5],        // 10. Light grey
    brandTints[3],   // 11. Brand tint 4
    GREYS[3],        // 12. Mid-dark grey
    brandTints[4],   // 13. Brand tint 5
    GREYS[6],        // 14. Very light grey
    lightenColor(brandColor, 0.15), // 15. Brand tint (slight)
    GREYS[2],        // 16. Reuse dark grey
    lightenColor(brandColor, 0.50), // 17. Brand tint (medium)
    GREYS[4],        // 18. Reuse medium grey
    lightenColor(brandColor, 0.65), // 19. Brand tint (light)
    GREYS[6],        // 20. Reuse very light grey
  ];

  // Return colors for the requested count, cycling if needed
  return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
}

/**
 * Get a single chart color by index
 * @param brandColor - The brand color hex code
 * @param index - Color index (0-based)
 * @returns Hex color code
 */
export function getChartColor(brandColor: string, index: number): string {
  return getChartColors(brandColor, index + 1)[index];
}

/**
 * Chart color palette type
 */
export type ChartColorPalette = ReturnType<typeof getChartColors>;
