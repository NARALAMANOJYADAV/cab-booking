import dotenv from 'dotenv';
import path from 'path';
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { createClient } from '@supabase/supabase-js';

async function verifySupabaseConnection() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  console.log('====================================================');
  console.log('       FAIRRIDE - SUPABASE CONNECTION TESTER        ');
  console.log('====================================================');
  console.log('SUPABASE_URL:', url ? `${url.substring(0, 25)}...` : '❌ NOT SET');
  console.log('SUPABASE KEY:', key ? `${key.substring(0, 15)}...` : '❌ NOT SET');

  if (!url || !key) {
    console.error('\n⚠️ Missing Supabase credentials in your .env file!');
    console.log('Please open .env and set:');
    console.log('  SUPABASE_URL=https://your-project.supabase.co');
    console.log('  SUPABASE_SERVICE_ROLE_KEY=eyJh... (or SUPABASE_ANON_KEY)');
    process.exit(1);
  }

  try {
    const supabase = createClient(url, key);
    console.log('\nTesting connection to Supabase database...');
    
    const { data, error } = await supabase.from('users').select('count').limit(1);

    if (error) {
      if (error.code === '42P01' || error.message.includes('Could not find the table')) {
        console.log('✅ Connected to your Supabase project (itctieptnuggjqfhdvbh) successfully!');
        console.log('ℹ️ Your database is currently empty (tables not created yet).');
        console.log('\n👉 FINAL STEP:');
        console.log('   1. Open: https://supabase.com/dashboard/project/itctieptnuggjqfhdvbh/sql/new');
        console.log('   2. Paste the contents of "supabase_schema.sql"');
        console.log('   3. Click "RUN" to create all FairRide tables!');
      } else {
        console.error('❌ Supabase Query Error:', error.message);
      }
    } else {
      console.log('🎉 SUCCESS! Supabase is fully connected and all tables exist!');
    }
  } catch (err: any) {
    console.error('❌ Failed to connect to Supabase:', err.message);
  }
}

verifySupabaseConnection();
