import { connectDB } from '../config/db.js';
import { Booking, FareLock, FareAudit, Dispute, SafetyIncident, WalletTransaction, Driver } from '../models/index.js';
import { supabase } from '../config/supabase.js';

async function cleanDummyData() {
  try {
    console.log('[Clean Data] Connecting to database...');
    await connectDB();

    console.log('[Clean Data] 1. Removing mock bookings, fare locks, audits, disputes, safety incidents from MongoDB...');
    
    const [
      bookingsDeleted,
      fareLocksDeleted,
      fareAuditsDeleted,
      disputesDeleted,
      incidentsDeleted,
      txDeleted
    ] = await Promise.all([
      Booking.deleteMany({}),
      FareLock.deleteMany({}),
      FareAudit.deleteMany({}),
      Dispute.deleteMany({}),
      SafetyIncident.deleteMany({}),
      WalletTransaction.deleteMany({})
    ]);

    console.log(`[Clean Data] MongoDB Cleaned:`);
    console.log(`  - Bookings deleted: ${bookingsDeleted.deletedCount}`);
    console.log(`  - Fare Locks deleted: ${fareLocksDeleted.deletedCount}`);
    console.log(`  - Fare Audits deleted: ${fareAuditsDeleted.deletedCount}`);
    console.log(`  - Disputes deleted: ${disputesDeleted.deletedCount}`);
    console.log(`  - Safety Incidents deleted: ${incidentsDeleted.deletedCount}`);
    console.log(`  - Transactions deleted: ${txDeleted.deletedCount}`);

    // Reset driver daily stats to 0 while keeping drivers and vehicles
    await Driver.updateMany({}, {
      $set: {
        todayGrossEarnings: 0,
        todayNetEarnings: 0,
        completedTripsCount: 0,
        totalTrips: 0
      }
    });
    console.log('  - Driver trip & earning counters reset to 0');

    // Clean Supabase tables (keeping users and drivers)
    if (supabase) {
      console.log('\n[Clean Data] 2. Removing dummy data from Supabase PostgreSQL...');

      // Delete dependent tables first, then bookings
      const { error: errEarnings } = await supabase.from('driver_earnings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (errEarnings) console.warn('Supabase driver_earnings delete warning:', errEarnings.message);

      const { error: errLocks } = await supabase.from('fare_locks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (errLocks) console.warn('Supabase fare_locks delete warning:', errLocks.message);

      const { error: errDisputes } = await supabase.from('disputes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (errDisputes) console.warn('Supabase disputes delete warning:', errDisputes.message);

      const { error: errIncidents } = await supabase.from('safety_incidents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (errIncidents) console.warn('Supabase safety_incidents delete warning:', errIncidents.message);

      const { error: errBookings } = await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (errBookings) console.warn('Supabase bookings delete warning:', errBookings.message);

      // Reset driver counters in Supabase
      await supabase.from('drivers').update({ total_trips: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');

      console.log('\n--- VERIFYING SUPABASE TABLE ROW COUNTS ---');
      const tables = ['users', 'drivers', 'bookings', 'fare_locks', 'safety_incidents', 'disputes', 'driver_earnings'];
      for (const t of tables) {
        const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
        if (error) {
          console.log(`❌ ${t}: ${error.message}`);
        } else {
          console.log(`✅ ${t}: ${count} rows remaining`);
        }
      }
    }

    console.log('\n🎉 Fake data successfully removed!');
    process.exit(0);
  } catch (err: any) {
    console.error('[Clean Data] Fatal error:', err);
    process.exit(1);
  }
}

cleanDummyData();
