/**
 * Script to create marketing user in Supabase
 * Run with: npx tsx scripts/create-marketing-user.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tysswplcmiqyqlcddfqz.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5c3N3cGxjbWlxeXFsY2RkZnF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzODQzMjUsImV4cCI6MjA3Mzk2MDMyNX0.AUpy7CRDxPG9_dxtSSO2tSjRXtvvnPDR59WK-yIPLWg';

async function createMarketingUser() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Creating marketing user...');

  const { data, error } = await supabase.auth.signUp({
    email: 'marketing@equanime.co',
    password: 'Aria.123',
    options: {
      data: {
        full_name: 'Juan Orozco',
      },
    },
  });

  if (error) {
    console.error('Error creating user:', error.message);
    process.exit(1);
  }

  console.log('✅ Marketing user created successfully!');
  console.log('Email:', 'marketing@equanime.co');
  console.log('Password:', 'Aria.123');
  console.log('Full Name:', 'Juan Orozco');
  console.log('User ID:', data.user?.id);

  if (data.user && !data.user.email_confirmed_at) {
    console.log('\n⚠️  Note: Email confirmation may be required depending on your Supabase settings.');
    console.log('Check your Supabase dashboard to disable email confirmation if needed.');
  }
}

createMarketingUser();
