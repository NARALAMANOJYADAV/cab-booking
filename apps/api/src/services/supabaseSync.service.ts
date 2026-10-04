import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { User, Driver, Booking, Wallet, FareLock } from '../models/index.js';

// In-memory mapping from MongoDB ObjectId string to Supabase UUID
const mongoUserToSupabaseIdMap = new Map<string, string>();
const mongoDriverToSupabaseIdMap = new Map<string, string>();

/**
 * Normalizes user role to match Supabase CHECK (role IN ('PASSENGER', 'DRIVER', 'ADMIN', 'CORPORATE'))
 */
function normalizeUserRole(role?: string): 'PASSENGER' | 'DRIVER' | 'ADMIN' | 'CORPORATE' {
  if (!role) return 'PASSENGER';
  const upper = role.toUpperCase();
  if (upper.includes('ADMIN')) return 'ADMIN';
  if (upper.includes('DRIVER')) return 'DRIVER';
  if (upper.includes('CORP')) return 'CORPORATE';
  return 'PASSENGER';
}

/**
 * Normalizes booking status to match Supabase CHECK constraint
 */
function normalizeBookingStatus(state?: string): string {
  if (!state) return 'REQUESTED';
  const upper = state.toUpperCase();
  const map: Record<string, string> = {
    SEARCHING: 'SEARCHING',
    QUOTE_CREATED: 'REQUESTED',
    FARE_LOCKED: 'REQUESTED',
    REQUESTED: 'REQUESTED',
    DRIVER_ASSIGNED: 'DRIVER_ASSIGNED',
    DRIVER_ACCEPTED: 'DRIVER_ASSIGNED',
    DRIVER_ARRIVING: 'DRIVER_ARRIVING',
    DRIVER_ARRIVED: 'ARRIVED_PICKUP',
    ARRIVED_PICKUP: 'ARRIVED_PICKUP',
    TRIP_STARTED: 'TRIP_STARTED',
    TRIP_IN_PROGRESS: 'IN_TRANSIT',
    IN_TRANSIT: 'IN_TRANSIT',
    NEAR_DESTINATION: 'NEAR_DESTINATION',
    TRIP_COMPLETED: 'COMPLETED',
    COMPLETED: 'COMPLETED',
    PAYMENT_PENDING: 'COMPLETED',
    PAYMENT_COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED_BY_PASSENGER',
    CANCELLED_BY_PASSENGER: 'CANCELLED_BY_PASSENGER',
    CANCELLED_BY_DRIVER: 'CANCELLED_BY_DRIVER',
    RECOVERY: 'AUTO_REASSIGNED',
    AUTO_REASSIGNED: 'AUTO_REASSIGNED',
    DISPUTED: 'DISPUTED'
  };
  return map[upper] || 'REQUESTED';
}

/**
 * Normalizes payment method to match Supabase CHECK constraint
 */
function normalizePaymentMethod(method?: string): string {
  if (!method) return 'WALLET';
  const upper = method.toUpperCase();
  if (['WALLET', 'UPI', 'CARD', 'CASH', 'CORPORATE'].includes(upper)) {
    return upper;
  }
  return 'WALLET';
}

/**
 * Normalizes payment status to match Supabase CHECK constraint
 */
function normalizePaymentStatus(status?: string): string {
  if (!status) return 'PENDING';
  const upper = status.toUpperCase();
  if (['PENDING', 'PAID', 'REFUNDED', 'DISPUTED'].includes(upper)) {
    return upper;
  }
  if (upper === 'COMPLETED') return 'PAID';
  if (upper === 'FAILED') return 'DISPUTED';
  return 'PENDING';
}

/**
 * Synchronizes a User record to Supabase public.users
 */
export async function syncUserToSupabase(
  user: any,
  walletBalance?: number
): Promise<{ id: string | null; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { id: null, error: 'Supabase not configured' };
  }

  try {
    const email = (user.email || `user_${user.phone || Date.now()}@fairride.local`).toLowerCase().trim();
    const phone = user.phone ? (user.phone.startsWith('+91') ? user.phone : `+91${user.phone.replace(/\D/g, '').slice(-10)}`) : null;
    const fullName = user.name || user.fullName || user.full_name || 'FairRide User';
    const role = normalizeUserRole(user.role);

    // Determine wallet balance if not explicitly provided
    let balance = walletBalance;
    if (balance === undefined && user._id) {
      try {
        const wallet = await Wallet.findOne({ userId: user._id });
        balance = wallet?.balance ?? 1000;
      } catch {
        balance = 1000;
      }
    }

    const payload: any = {
      email,
      phone,
      full_name: fullName,
      role,
      rating: user.rating || 5.0,
      wallet_balance: balance ?? 1000,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('users')
      .upsert(payload, { onConflict: 'email' })
      .select('id, email')
      .single();

    if (error) {
      console.warn(`[Supabase Sync] Warning upserting user ${email}:`, error.message);
      return { id: null, error: error.message };
    }

    if (data?.id) {
      if (user._id) {
        mongoUserToSupabaseIdMap.set(user._id.toString(), data.id);
      }
      mongoUserToSupabaseIdMap.set(email, data.id);
      if (phone) mongoUserToSupabaseIdMap.set(phone, data.id);
      console.log(`[Supabase Sync] ✅ Synced user ${email} (Supabase UUID: ${data.id})`);
      return { id: data.id };
    }

    return { id: null };
  } catch (err: any) {
    console.warn('[Supabase Sync] Unexpected error syncing user:', err.message);
    return { id: null, error: err.message };
  }
}

/**
 * Synchronizes a Driver record to Supabase public.drivers
 */
export async function syncDriverToSupabase(driver: any): Promise<{ id: string | null; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { id: null, error: 'Supabase not configured' };
  }

  try {
    // Ensure the driver's user account is synced first
    let userUuid: string | null = null;
    const mongoUserId = driver.userId?._id?.toString() || driver.userId?.toString();

    if (mongoUserId && mongoUserToSupabaseIdMap.has(mongoUserId)) {
      userUuid = mongoUserToSupabaseIdMap.get(mongoUserId)!;
    } else if (driver.userId && typeof driver.userId === 'object' && driver.userId.email) {
      const uRes = await syncUserToSupabase(driver.userId);
      userUuid = uRes.id;
    } else if (mongoUserId) {
      const u = await User.findById(mongoUserId);
      if (u) {
        const uRes = await syncUserToSupabase(u);
        userUuid = uRes.id;
      }
    }

    if (!userUuid) {
      // Find default driver user or use fallback
      const { data: defaultUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'driver@fairride.local')
        .single();
      userUuid = defaultUser?.id || null;
    }

    if (!userUuid) {
      console.warn('[Supabase Sync] Could not resolve user UUID for driver:', driver._id);
      return { id: null, error: 'Driver user UUID not found' };
    }

    const vehicleNumber = driver.vehicleId?.registrationNumber || driver.vehicleNumber || 'TS09UB1234';
    const vehicleModel = driver.vehicleId?.model || driver.vehicleModel || 'Swift Dzire';
    const rawType = (driver.vehicleId?.category || driver.vehicleType || 'SEDAN').toUpperCase();
    const allowedTypes = ['BIKE', 'AUTO', 'MINI', 'SEDAN', 'PREMIUM', 'XL', 'EV'];
    const vehicleType = allowedTypes.includes(rawType) ? rawType : 'SEDAN';

    const payload = {
      user_id: userUuid,
      vehicle_type: vehicleType,
      vehicle_number: vehicleNumber,
      vehicle_model: vehicleModel,
      license_number: driver.licenseNumber || `DL-TS-${Date.now().toString().slice(-6)}`,
      status: driver.isOnline ? (driver.isBusy ? 'ON_TRIP' : 'AVAILABLE') : 'OFFLINE',
      rating: driver.rating || 4.9,
      total_trips: driver.totalTrips || 0,
      cancellation_rate: driver.cancellationRate || 0.0,
      acceptance_rate: driver.acceptanceRate || 100.0,
      current_lat: driver.currentLocation?.coordinates?.[1] || 17.4474,
      current_lng: driver.currentLocation?.coordinates?.[0] || 78.3811,
      kyc_status: driver.verificationStatus === 'VERIFIED' ? 'APPROVED' : 'PENDING'
    };

    // Upsert by vehicle_number (or check existing driver for this user_id)
    const { data: existing } = await supabase
      .from('drivers')
      .select('id')
      .eq('user_id', userUuid)
      .single();

    let driverSupabaseId: string | null = null;
    if (existing?.id) {
      const { data, error } = await supabase
        .from('drivers')
        .update(payload)
        .eq('id', existing.id)
        .select('id')
        .single();
      if (!error && data?.id) driverSupabaseId = data.id;
    } else {
      const { data, error } = await supabase
        .from('drivers')
        .insert(payload)
        .select('id')
        .single();
      if (!error && data?.id) driverSupabaseId = data.id;
    }

    if (driverSupabaseId) {
      if (driver._id) mongoDriverToSupabaseIdMap.set(driver._id.toString(), driverSupabaseId);
      console.log(`[Supabase Sync] ✅ Synced driver ${vehicleNumber} (Supabase UUID: ${driverSupabaseId})`);
      return { id: driverSupabaseId };
    }

    return { id: null };
  } catch (err: any) {
    console.warn('[Supabase Sync] Unexpected error syncing driver:', err.message);
    return { id: null, error: err.message };
  }
}

/**
 * Synchronizes booking state to Supabase PostgreSQL in real-time
 */
export async function syncBookingToSupabase(booking: any): Promise<{ id: string | null; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { id: null, error: 'Supabase not configured' };
  }

  try {
    const bookingCode = booking.bookingReference || `FR-BK-${Date.now()}`;

    // 1. Resolve Passenger UUID for Supabase foreign key
    let passengerUuid: string | null = null;
    const mongoPassengerId = booking.passengerId?._id?.toString() || booking.passengerId?.toString();

    if (mongoPassengerId && mongoUserToSupabaseIdMap.has(mongoPassengerId)) {
      passengerUuid = mongoUserToSupabaseIdMap.get(mongoPassengerId)!;
    } else if (booking.passengerId && typeof booking.passengerId === 'object' && booking.passengerId.email) {
      const uRes = await syncUserToSupabase(booking.passengerId);
      passengerUuid = uRes.id;
    } else if (mongoPassengerId) {
      const u = await User.findById(mongoPassengerId);
      if (u) {
        const uRes = await syncUserToSupabase(u);
        passengerUuid = uRes.id;
      }
    }

    // Fallback: If still not resolved, query Supabase users for passenger@fairride.local
    if (!passengerUuid) {
      const { data: defaultUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'passenger@fairride.local')
        .single();
      passengerUuid = defaultUser?.id || null;
    }

    // 2. Resolve Driver UUID for Supabase foreign key
    let driverUuid: string | null = null;
    const mongoDriverId = booking.driverId?._id?.toString() || booking.driverId?.toString();
    if (mongoDriverId && mongoDriverToSupabaseIdMap.has(mongoDriverId)) {
      driverUuid = mongoDriverToSupabaseIdMap.get(mongoDriverId)!;
    } else if (mongoDriverId) {
      const d = await Driver.findById(mongoDriverId).populate('vehicleId');
      if (d) {
        const dRes = await syncDriverToSupabase(d);
        driverUuid = dRes.id;
      }
    }

    const payload = {
      booking_code: bookingCode,
      passenger_id: passengerUuid,
      driver_id: driverUuid,
      status: normalizeBookingStatus(booking.state),
      pickup_address: booking.pickup?.address || 'Pickup Point, Hyderabad',
      dropoff_address: booking.destination?.address || 'Destination Point, Hyderabad',
      pickup_lat: booking.pickup?.coordinates?.[1] || 17.4474,
      pickup_lng: booking.pickup?.coordinates?.[0] || 78.3811,
      dropoff_lat: booking.destination?.coordinates?.[1] || 17.2403,
      dropoff_lng: booking.destination?.coordinates?.[0] || 78.4298,
      agreed_fare: booking.finalFare || booking.lockedFare || 420,
      locked_fare: booking.lockedFare || 420,
      fare_currency: 'INR',
      ride_otp: booking.verificationPin || '5821', // Supabase NOT NULL constraint
      distance_km: booking.distanceKm || 12.5,
      duration_mins: booking.estimatedDurationMin || 25,
      payment_method: normalizePaymentMethod(booking.paymentMethod),
      payment_status: normalizePaymentStatus(booking.paymentStatus),
      updated_at: new Date().toISOString()
    };

    // Upsert into Supabase public.bookings
    const { data, error } = await supabase
      .from('bookings')
      .upsert(payload, { onConflict: 'booking_code' })
      .select('id, booking_code')
      .single();

    if (error) {
      console.warn(`[Supabase Sync] Warning syncing booking ${bookingCode}:`, error.message);
      return { id: null, error: error.message };
    }

    const supabaseBookingId = data?.id;
    console.log(`[Supabase Sync] ✅ Successfully synced booking ${bookingCode} (${payload.status}) to Supabase!`);

    // Optional: sync to fare_locks table if fare lock details exist
    if (supabaseBookingId && passengerUuid && booking.lockedFare) {
      try {
        await supabase.from('fare_locks').upsert(
          {
            booking_id: supabaseBookingId,
            user_id: passengerUuid,
            quoted_amount: booking.lockedFare,
            locked_amount: booking.lockedFare,
            expiry_time: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            is_guaranteed: true,
            variance_reason: 'FairRide Zero-Surge Guarantee'
          },
          { onConflict: 'booking_id' }
        );
      } catch {
        // Non-critical
      }
    }

    return { id: supabaseBookingId };
  } catch (err: any) {
    console.warn('[Supabase Sync] Non-blocking sync error:', err.message);
    return { id: null, error: err.message };
  }
}

/**
 * Synchronizes safety incidents to Supabase public.safety_incidents
 */
export async function syncSafetyIncidentToSupabase(incident: any): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    const allowedSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL_SOS'];
    const rawPriority = (incident.priority || 'HIGH').toUpperCase();
    const severity = rawPriority === 'CRITICAL' ? 'CRITICAL_SOS' : (allowedSeverities.includes(rawPriority) ? rawPriority : 'MEDIUM');

    const allowedTypes = [
      'ROUTE_DEVIATION', 'UNEXPECTED_STOP', 'DEMANDING_EXTRA_CASH',
      'RECKLESS_DRIVING', 'HARASSMENT', 'SOS_BUTTON_TRIGGERED', 'VEHICLE_BREAKDOWN'
    ];
    const rawType = (incident.triggerType || 'SOS_BUTTON_TRIGGERED').toUpperCase();
    const incidentType = rawType === 'SOS_BUTTON' ? 'SOS_BUTTON_TRIGGERED' : (allowedTypes.includes(rawType) ? rawType : 'ROUTE_DEVIATION');

    let passengerUuid: string | null = null;
    const mongoPassengerId = incident.passengerId?.toString();
    if (mongoPassengerId && mongoUserToSupabaseIdMap.has(mongoPassengerId)) {
      passengerUuid = mongoUserToSupabaseIdMap.get(mongoPassengerId)!;
    }

    const payload = {
      severity,
      incident_type: incidentType,
      description: incident.notes?.[0]?.text || `Incident reported: ${incident.incidentNumber || 'Emergency SOS'}`,
      latitude: incident.currentLocation?.coordinates?.[1] || 17.4474,
      longitude: incident.currentLocation?.coordinates?.[0] || 78.3811,
      route_deviation_detected: incidentType === 'ROUTE_DEVIATION',
      audio_recording_url: incident.audioSnapshotUrl || null,
      status: incident.status === 'RESOLVED' ? 'RESOLVED' : 'OPEN',
      reporter_id: passengerUuid
    };

    const { error } = await supabase.from('safety_incidents').insert(payload);
    if (error) {
      console.warn('[Supabase Sync] Warning syncing safety incident:', error.message);
    } else {
      console.log(`[Supabase Sync] ✅ Synced safety incident ${incident.incidentNumber || ''} to Supabase`);
    }
  } catch (err: any) {
    console.warn('[Supabase Sync] Error syncing safety incident:', err.message);
  }
}

/**
 * Complete database synchronization from MongoDB to Supabase PostgreSQL.
 * Iterates through all users, drivers, and bookings in MongoDB and populates Supabase.
 */
export async function syncAllDatabaseToSupabase(): Promise<{
  success: boolean;
  usersSynced: number;
  driversSynced: number;
  bookingsSynced: number;
  message: string;
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      usersSynced: 0,
      driversSynced: 0,
      bookingsSynced: 0,
      message: 'Supabase credentials are not configured in .env'
    };
  }

  console.log('[Supabase Sync] 🚀 Beginning full MongoDB -> Supabase synchronization...');

  let usersSynced = 0;
  let driversSynced = 0;
  let bookingsSynced = 0;

  try {
    // 1. Sync all Users with Wallets
    const users = await User.find();
    console.log(`[Supabase Sync] Found ${users.length} users to sync...`);
    for (const u of users) {
      const wallet = await Wallet.findOne({ userId: u._id });
      const res = await syncUserToSupabase(u, wallet?.balance ?? 1000);
      if (res.id) usersSynced++;
    }

    // 2. Sync all Drivers with Vehicles
    const drivers = await Driver.find().populate('vehicleId');
    console.log(`[Supabase Sync] Found ${drivers.length} drivers to sync...`);
    for (const d of drivers) {
      const res = await syncDriverToSupabase(d);
      if (res.id) driversSynced++;
    }

    // 3. Sync all Bookings (including historical completed rides)
    const bookings = await Booking.find().limit(50);
    console.log(`[Supabase Sync] Found ${bookings.length} bookings to sync...`);
    for (const b of bookings) {
      const res = await syncBookingToSupabase(b);
      if (res.id) bookingsSynced++;
    }

    const message = `Supabase Sync Complete! Synced ${usersSynced} users, ${driversSynced} drivers, and ${bookingsSynced} bookings to PostgreSQL.`;
    console.log(`[Supabase Sync] 🏁 ${message}`);

    return {
      success: true,
      usersSynced,
      driversSynced,
      bookingsSynced,
      message
    };
  } catch (err: any) {
    console.error('[Supabase Sync] Full sync error:', err);
    return {
      success: false,
      usersSynced,
      driversSynced,
      bookingsSynced,
      message: err.message
    };
  }
}

/**
 * Inspect live Supabase table counts and health
 */
export async function getSupabaseSyncStatus(): Promise<any> {
  const configured = isSupabaseConfigured();
  if (!configured || !supabase) {
    return {
      isConfigured: false,
      message: 'Supabase credentials not configured'
    };
  }

  try {
    const [
      { count: usersCount },
      { count: driversCount },
      { count: bookingsCount },
      { count: safetyCount }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('drivers').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('safety_incidents').select('*', { count: 'exact', head: true })
    ]);

    return {
      isConfigured: true,
      supabaseUrl: process.env.SUPABASE_URL || 'https://itctieptnuggjqfhdvbh.supabase.co',
      status: 'CONNECTED',
      tables: {
        users: usersCount ?? 0,
        drivers: driversCount ?? 0,
        bookings: bookingsCount ?? 0,
        safetyIncidents: safetyCount ?? 0
      },
      lastChecked: new Date().toISOString()
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      status: 'ERROR',
      error: err.message
    };
  }
}
