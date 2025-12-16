/**
 * Seed Demo Auth Users in Supabase
 *
 * This script creates demo users in Supabase Auth with auto-confirmation.
 * Demo users can log in immediately without email verification.
 *
 * Usage:
 *   npx tsx scripts/seed-demo-auth-users.ts
 *
 * Required environment variables:
 *   - DEMO_SUPABASE_URL or NEXT_PUBLIC_DEMO_SUPABASE_URL
 *   - DEMO_SUPABASE_SERVICE_ROLE_KEY
 *
 * Optional environment variables (defaults to demo passwords):
 *   - DEMO_JUMBO_PASSWORD (default: 'jumbo-demo-2024')
 *   - DEMO_HITAPES_PASSWORD (default: 'hitapes-demo-2024')
 */

import { createClient } from '@supabase/supabase-js';

// Note: When running with tsx, Next.js env loading doesn't apply.
// Pass env vars via command line or source them from .env.local:
// Example: source .env.local && npx tsx scripts/seed-demo-auth-users.ts

interface DemoUser {
  email: string;
  password: string;
  clientSlug: string;
  clientName: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    email: 'jumbo@demo.app',
    password: process.env.DEMO_JUMBO_PASSWORD || 'jumbo-demo-2024',
    clientSlug: 'jumboDemo',
    clientName: 'Jumbo',
  },
  {
    email: 'hitapes@demo.app',
    password: process.env.DEMO_HITAPES_PASSWORD || 'hitapes-demo-2024',
    clientSlug: 'hitapesDemo',
    clientName: 'HiTapes',
  },
];

async function seedDemoUsers() {
  const supabaseUrl = process.env.DEMO_SUPABASE_URL || process.env.NEXT_PUBLIC_DEMO_SUPABASE_URL;
  const serviceRoleKey = process.env.DEMO_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing required environment variables:');
    if (!supabaseUrl) console.error('  - DEMO_SUPABASE_URL or NEXT_PUBLIC_DEMO_SUPABASE_URL');
    if (!serviceRoleKey) console.error('  - DEMO_SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('Seeding demo auth users...\n');

  for (const user of DEMO_USERS) {
    console.log(`Processing ${user.clientName} (${user.email})...`);

    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error(`  Error listing users: ${listError.message}`);
      continue;
    }

    const existingUser = existingUsers?.users?.find((u) => u.email === user.email);

    if (existingUser) {
      console.log(`  User already exists (id: ${existingUser.id})`);

      // Update user metadata if needed
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        user_metadata: {
          client_slug: user.clientSlug,
          client_name: user.clientName,
          is_demo: true,
        },
      });

      if (updateError) {
        console.error(`  Error updating metadata: ${updateError.message}`);
      } else {
        console.log(`  Updated user metadata`);
      }
      continue;
    }

    // Create new user with auto-confirmation
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true, // Skip email verification
      user_metadata: {
        client_slug: user.clientSlug,
        client_name: user.clientName,
        is_demo: true,
      },
    });

    if (error) {
      console.error(`  Error creating user: ${error.message}`);
      continue;
    }

    console.log(`  Created user (id: ${data.user.id})`);
  }

  console.log('\nDemo auth users seeded successfully!');
  console.log('\nLogin credentials:');
  for (const user of DEMO_USERS) {
    console.log(`  ${user.clientName}: ${user.email} / ${user.password}`);
  }
}

seedDemoUsers().catch(console.error);
