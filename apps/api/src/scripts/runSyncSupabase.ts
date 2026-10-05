import { connectDB } from '../config/db.js';
import { syncAllDatabaseToSupabase } from '../services/supabaseSync.service.js';

async function run() {
  try {
    console.log('[Runner] Connecting to database...');
    await connectDB();
    console.log('[Runner] Database connected. Starting full 7-table Supabase sync...');
    
    const result = await syncAllDatabaseToSupabase();
    console.log('[Runner] Result:', JSON.stringify(result, null, 2));
    
    process.exit(0);
  } catch (err: any) {
    console.error('[Runner] Error:', err);
    process.exit(1);
  }
}

run();
