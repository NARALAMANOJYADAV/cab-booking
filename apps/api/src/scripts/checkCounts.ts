import { supabase } from '../config/supabase.js';

async function checkCounts() {
  if (!supabase) {
    console.log('Supabase not configured');
    process.exit(1);
  }
  const tables = ['users', 'drivers', 'bookings', 'fare_locks', 'safety_incidents', 'disputes', 'driver_earnings'];
  for (const t of tables) {
    try {
      const { data, count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`❌ ${t}: ERROR - ${error.message}`);
      } else {
        console.log(`✅ ${t}: ${count} rows`);
      }
    } catch (e: any) {
      console.log(`❌ ${t}: EXCEPTION - ${e.message}`);
    }
  }
  process.exit(0);
}

checkCounts();
