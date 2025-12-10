// Minimal environment validation for CI/production builds
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SESSION_SECRET',
];

const missing = requiredVars.filter((key) => !process.env[key]);
const isProduction = process.env.NODE_ENV === 'production';

if (missing.length > 0 && isProduction) {
  console.error('[env-check] Missing required environment variables:');
  missing.forEach((key) => console.error(` - ${key}`));
  process.exit(1);
} else {
  if (missing.length > 0) {
    console.warn('[env-check] Missing variables (non-production run):', missing.join(', '));
  } else {
    console.log('[env-check] All required environment variables are set.');
  }
}
