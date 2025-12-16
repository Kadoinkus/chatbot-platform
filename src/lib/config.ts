/**
 * Application Configuration
 *
 * Type-safe access to environment variables with validation.
 * This file should only be imported from server-side code.
 */

import { z } from 'zod';

// Schema for environment variables
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Supabase (optional in development)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Session
  SESSION_SECRET: z.string().min(32).optional(),
  SESSION_MAX_AGE: z.string().optional().transform(v => v ? parseInt(v, 10) : 604800),

  // Rate limiting
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Feature flags
  ENABLE_DEBUG_LOGGING: z.string().optional().transform(v => v === 'true'),
});

// Parse and validate environment
function getConfig() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    // Don't throw in development to allow partial config
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment configuration');
    }
  }

  const env = result.success ? result.data : envSchema.parse({});

  return {
    // Environment
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',

    // Supabase
    supabase: {
      url: env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
      isConfigured: !!(env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
    },

    // Session
    session: {
      secret: env.SESSION_SECRET,
      maxAge: env.SESSION_MAX_AGE,
      isSecure: env.NODE_ENV === 'production',
    },

    // Rate limiting
    rateLimiting: {
      redisUrl: env.UPSTASH_REDIS_REST_URL,
      redisToken: env.UPSTASH_REDIS_REST_TOKEN,
      isConfigured: !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
    },

    // Feature flags
    features: {
      debugLogging: env.ENABLE_DEBUG_LOGGING ?? env.NODE_ENV === 'development',
    },
  };
}

// Export singleton config
export const config = getConfig();

// Type for the config object
export type AppConfig = ReturnType<typeof getConfig>;

/**
 * Validate that required configuration is present for production
 */
export function validateProductionConfig(): string[] {
  const errors: string[] = [];

  if (config.isProduction) {
    if (!config.supabase.isConfigured) {
      errors.push('Supabase configuration is required in production');
    }
    if (!config.session.secret) {
      errors.push('SESSION_SECRET is required in production');
    }
  }

  return errors;
}

/**
 * Log current configuration (safe version without secrets)
 */
export function logConfig(): void {
  console.log('[Config]', {
    environment: config.isDevelopment ? 'development' : config.isProduction ? 'production' : 'test',
    useMockData: config.useMockData,
    supabaseConfigured: config.supabase.isConfigured,
    rateLimitingConfigured: config.rateLimiting.isConfigured,
    sessionSecretSet: !!config.session.secret,
  });
}
