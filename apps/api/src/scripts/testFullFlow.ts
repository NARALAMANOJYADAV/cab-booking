import { connectDB } from '../config/db.js';
import { User, Driver, Vehicle } from '../models/index.js';
import { FareService } from '../services/fare.service.js';
import { syncFareLockToSupabase, syncBookingToSupabase, syncDisputeToSupabase, syncSafetyIncidentToSupabase, syncDriverEarningToSupabase } from '../services/supabaseSync.service.js';
import { DisputeService } from '../services/dispute.service.js';
import { SafetyService } from '../services/safety.service.js';
import { PaymentService } from '../services/payment.service.js';
import { Booking, FareLock } from '../models/index.js';
import { supabase } from '../config/supabase.js';

async function testFullFlow() {
  try {
    await connectDB();

    // Create or find passenger
    let passenger = await User.findOne({ email: 'passenger@fairride.local' });
    if (!passenger) {
      passenger = await User.create({
        name: 'Aarav Passenger',
        email: 'passenger@fairride.local',
        phone: '+919800000002',
        role: 'PASSENGER',
        password: 'Password@123'
      });
    }

    // Create or find driver
    let driverUser = await User.findOne({ email: 'driver@fairride.local' });
    if (!driverUser) {
      driverUser = await User.create({
        name: 'Rajesh Driver',
        email: 'driver@fairride.local',
        phone: '+919800000003',
        role: 'DRIVER',
        password: 'Password@123'
      });
    }

    let vehicle = await Vehicle.findOne();
    if (!vehicle) {
      vehicle = await Vehicle.create({
        driverId: driverUser._id,
        category: 'SEDAN',
        brand: 'Honda',
        model: 'City',
        registrationNumber: 'TS09UB1234',
        color: 'Silver',
        seatingCapacity: 4,
        isAc: true,
        rcNumber: 'RC-TS09-9988',
        insuranceNumber: 'INS-2026-9911',
        fuelType: 'PETROL'
      });
    }

    let driver = await Driver.findOne({ userId: driverUser._id });
    if (!driver) {
      driver = await Driver.create({
        userId: driverUser._id,
        vehicleId: vehicle._id,
        licenseNumber: 'DL-TS-2026-001',
        isOnline: true,
        isBusy: false,
        verificationStatus: 'VERIFIED'
      });
    }

    console.log('\n--- 1. Testing Fare Lock (stores in fare_locks) ---');
    const quote = FareService.generateQuote([78.3811, 17.4474], [78.4298, 17.2403], 'SEDAN');
    const fareLock = await FareService.lockFare(passenger._id.toString(), quote);
    await syncFareLockToSupabase(fareLock);
    console.log('✅ Fare Lock stored in Supabase fare_locks table!');

    console.log('\n--- 2. Testing Booking Confirmation (stores in bookings & links fare_locks) ---');
    const booking = await Booking.create({
      bookingReference: `FR-LIVE-${Date.now().toString().slice(-4)}`,
      passengerId: passenger._id,
      driverId: driver._id,
      vehicleId: vehicle._id,
      fareLockId: fareLock._id,
      state: 'DRIVER_ASSIGNED',
      vehicleCategory: 'SEDAN',
      tripType: 'ONE_WAY',
      pickup: { type: 'Point', coordinates: [78.3811, 17.4474], address: 'Hitech City, Hyderabad' },
      destination: { type: 'Point', coordinates: [78.4298, 17.2403], address: 'RGIA Airport, Hyderabad' },
      verificationPin: '8492',
      distanceKm: fareLock.distanceKm,
      estimatedDurationMin: fareLock.durationMin,
      lockedFare: fareLock.lockedFare,
      paymentMethod: 'UPI',
      paymentStatus: 'PENDING'
    });
    await syncBookingToSupabase(booking);
    console.log('✅ Booking stored in Supabase bookings table!');

    console.log('\n--- 3. Testing Ride Completion & Payment (stores in driver_earnings) ---');
    booking.state = 'PAYMENT_COMPLETED';
    booking.paymentStatus = 'SUCCESS';
    booking.finalFare = booking.lockedFare;
    await booking.save();
    await PaymentService.processSuccessfulPayment(booking._id.toString(), booking.lockedFare, 'UPI');
    console.log('✅ Earnings stored in Supabase driver_earnings table!');

    console.log('\n--- 4. Testing Safety SOS Trigger (stores in safety_incidents) ---');
    const incident = await SafetyService.triggerSos(
      booking._id.toString(),
      [78.3900, 17.4300],
      'Live SOS test on Gachibowli flyover'
    );
    console.log('✅ Incident stored in Supabase safety_incidents table!');

    console.log('\n--- 5. Testing Dispute Filing (stores in disputes) ---');
    const dispute = await DisputeService.createDispute(
      booking._id.toString(),
      passenger._id.toString(),
      'DRIVER_DEMANDED_EXTRA_MONEY',
      'Driver asked for ₹100 cash above the locked fare rate',
      100
    );
    console.log('✅ Dispute stored in Supabase disputes table!');

    console.log('\n--- LIVE ROW COUNTS ACROSS ALL 7 TABLES IN SUPABASE ---');
    const tables = ['users', 'drivers', 'bookings', 'fare_locks', 'safety_incidents', 'disputes', 'driver_earnings'];
    for (const t of tables) {
      const { count } = await supabase!.from(t).select('*', { count: 'exact', head: true });
      console.log(`✅ ${t}: ${count} rows`);
    }

    process.exit(0);
  } catch (err: any) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testFullFlow();
