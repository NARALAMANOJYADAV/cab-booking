import { connectDB } from '../config/db.js';
import { runSeed } from './seed.js';
import { syncAllDatabaseToSupabase } from '../services/supabaseSync.service.js';
import { supabase } from '../config/supabase.js';

async function seedAndSync() {
  try {
    console.log('[Seed & Sync] Connecting to DB...');
    await connectDB();
    console.log('[Seed & Sync] Running seed...');
    await runSeed();
    console.log('[Seed & Sync] Running full 7-table Supabase sync...');
    const syncRes = await syncAllDatabaseToSupabase();
    console.log('[Seed & Sync] Sync completed:', syncRes);

    console.log('\n--- VERIFYING SUPABASE ROW COUNTS ACROSS ALL 7 TABLES ---');
    const tables = ['users', 'drivers', 'bookings', 'fare_locks', 'safety_incidents', 'disputes', 'driver_earnings'];
    for (const t of tables) {
      const { count, error } = await supabase!.from(t).select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`❌ ${t}: ${error.message}`);
      } else {
        console.log(`✅ ${t}: ${count} rows`);
      }
    }
    process.exit(0);
  } catch (err: any) {
    console.error('[Seed & Sync] Fatal error:', err);
    process.exit(1);
  }
}

seedAndSync();
