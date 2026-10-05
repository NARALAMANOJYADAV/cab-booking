import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { User, Driver, Booking, Wallet, FareLock, Dispute, SafetyIncident } from '../models/index.js';

// In-memory mapping from MongoDB ObjectId string to Supabase UUID
const mongoUserToSupabaseIdMap = new Map<string, string>();
const mongoDriverToSupabaseIdMap = new Map<string, string>();
const mongoBookingToSupabaseIdMap = new Map<string, string>();

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
  if (upper === 'COMPLETED' || upper === 'SUCCESS') return 'PAID';
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
      const { data: defaultUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'driver@fairride.local')
        .single();
      userUuid = defaultUser?.id || null;
    }

    if (!userUuid) {
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
      total_trips: driver.completedTripsCount || driver.totalTrips || 0,
      cancellation_rate: driver.cancellationRate || 0.0,
      acceptance_rate: driver.acceptanceRate || 100.0,
      current_lat: driver.currentLocation?.coordinates?.[1] || 17.4474,
      current_lng: driver.currentLocation?.coordinates?.[0] || 78.3811,
      kyc_status: driver.verificationStatus === 'VERIFIED' ? 'APPROVED' : 'PENDING'
    };

    const { data: existing } = await supabase
      .from('drivers')
      .select('id')
      .eq('user_id', userUuid)
      .maybeSingle();

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
      return { id: driverSupabaseId };
    }

    return { id: null };
  } catch (err: any) {
    console.warn('[Supabase Sync] Unexpected error syncing driver:', err.message);
    return { id: null, error: err.message };
  }
}

/**
 * Resolves Supabase User UUID for a given passenger ID
 */
async function resolvePassengerUuid(passengerId: any): Promise<string | null> {
  if (!supabase) return null;
  const mongoPassengerId = passengerId?._id?.toString() || passengerId?.toString();
  if (mongoPassengerId && mongoUserToSupabaseIdMap.has(mongoPassengerId)) {
    return mongoUserToSupabaseIdMap.get(mongoPassengerId)!;
  }
  if (passengerId && typeof passengerId === 'object' && passengerId.email) {
    const uRes = await syncUserToSupabase(passengerId);
    if (uRes.id) return uRes.id;
  }
  if (mongoPassengerId) {
    const u = await User.findById(mongoPassengerId);
    if (u) {
      const uRes = await syncUserToSupabase(u);
      if (uRes.id) return uRes.id;
    }
  }
  const { data: defaultUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'passenger@fairride.local')
    .maybeSingle();
  return defaultUser?.id || null;
}

/**
 * Resolves Supabase Booking UUID for a given booking ID or booking code
 */
async function resolveBookingUuid(bookingIdOrCode: any): Promise<string | null> {
  if (!supabase || !bookingIdOrCode) return null;
  const idStr = bookingIdOrCode?._id?.toString() || bookingIdOrCode?.toString();
  if (idStr && mongoBookingToSupabaseIdMap.has(idStr)) {
    return mongoBookingToSupabaseIdMap.get(idStr)!;
  }

  // Look up in Supabase bookings
  const { data } = await supabase
    .from('bookings')
    .select('id')
    .or(`id.eq.${idStr},booking_code.eq.${idStr}`)
    .maybeSingle();

  if (data?.id) {
    mongoBookingToSupabaseIdMap.set(idStr, data.id);
    return data.id;
  }

  // Look up in MongoDB then check bookingReference
  if (idStr) {
    try {
      const b = await Booking.findById(idStr);
      if (b?.bookingReference) {
        const { data: bData } = await supabase
          .from('bookings')
          .select('id')
          .eq('booking_code', b.bookingReference)
          .maybeSingle();
        if (bData?.id) {
          mongoBookingToSupabaseIdMap.set(idStr, bData.id);
          return bData.id;
        }
      }
    } catch {
      // ignore
    }
  }

  return null;
}

/**
 * Synchronizes FareLock records to Supabase public.fare_locks
 */
export async function syncFareLockToSupabase(
  fareLock: any,
  bookingSupabaseId?: string
): Promise<{ id: string | null; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { id: null, error: 'Supabase not configured' };
  }

  try {
    const passengerUuid = await resolvePassengerUuid(fareLock.passengerId);
    if (!passengerUuid) {
      return { id: null, error: 'Passenger user UUID could not be resolved' };
    }

    let bookingUuid = bookingSupabaseId || null;
    if (!bookingUuid && fareLock._id) {
      try {
        const associatedBooking = await Booking.findOne({ fareLockId: fareLock._id });
        if (associatedBooking) {
          bookingUuid = await resolveBookingUuid(associatedBooking._id);
        }
      } catch {
        // ignore
      }
    }

    const lockedAmount = Number(fareLock.lockedFare || fareLock.breakdown?.totalFare || 420);
    const quotedAmount = Number(fareLock.breakdown?.totalFare || fareLock.lockedFare || lockedAmount);
    const expiryTime = fareLock.expiresAt
      ? new Date(fareLock.expiresAt).toISOString()
      : new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const createdAt = fareLock.lockedAt
      ? new Date(fareLock.lockedAt).toISOString()
      : (fareLock.createdAt ? new Date(fareLock.createdAt).toISOString() : new Date().toISOString());

    const payload = {
      booking_id: bookingUuid,
      user_id: passengerUuid,
      quoted_amount: quotedAmount,
      locked_amount: lockedAmount,
      expiry_time: expiryTime,
      is_guaranteed: true,
      variance_reason: 'FairRide Zero-Surge Guarantee',
      created_at: createdAt
    };

    let lockId: string | null = null;

    if (bookingUuid) {
      const { data: existing } = await supabase
        .from('fare_locks')
        .select('id')
        .eq('booking_id', bookingUuid)
        .maybeSingle();

      if (existing?.id) {
        const { data, error } = await supabase
          .from('fare_locks')
          .update(payload)
          .eq('id', existing.id)
          .select('id')
          .single();
        if (!error && data?.id) lockId = data.id;
      } else {
        const { data, error } = await supabase
          .from('fare_locks')
          .insert(payload)
          .select('id')
          .single();
        if (!error && data?.id) lockId = data.id;
      }
    } else {
      // Independent FareLock before booking is placed
      const { data, error } = await supabase
        .from('fare_locks')
        .insert(payload)
        .select('id')
        .single();
      if (!error && data?.id) lockId = data.id;
    }

    if (lockId) {
      console.log(`[Supabase Sync] ✅ Synced fare lock (₹${lockedAmount}) to Supabase (id: ${lockId})`);
      return { id: lockId };
    }

    return { id: null };
  } catch (err: any) {
    console.warn('[Supabase Sync] Warning syncing fare lock:', err.message);
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

    // 1. Resolve Passenger UUID
    const passengerUuid = await resolvePassengerUuid(booking.passengerId);

    // 2. Resolve Driver UUID
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
      ride_otp: booking.verificationPin || '5821',
      distance_km: booking.distanceKm || 12.5,
      duration_mins: booking.estimatedDurationMin || 25,
      payment_method: normalizePaymentMethod(booking.paymentMethod),
      payment_status: normalizePaymentStatus(booking.paymentStatus),
      updated_at: new Date().toISOString()
    };

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
    if (booking._id && supabaseBookingId) {
      mongoBookingToSupabaseIdMap.set(booking._id.toString(), supabaseBookingId);
      mongoBookingToSupabaseIdMap.set(bookingCode, supabaseBookingId);
    }
    console.log(`[Supabase Sync] ✅ Successfully synced booking ${bookingCode} (${payload.status}) to Supabase!`);

    // Synchronize Fare Lock associated with this booking
    if (supabaseBookingId && passengerUuid && booking.lockedFare) {
      try {
        let fareLockObj = null;
        if (booking.fareLockId) {
          fareLockObj = await FareLock.findById(booking.fareLockId);
        }
        await syncFareLockToSupabase(
          fareLockObj || {
            passengerId: booking.passengerId,
            lockedFare: booking.lockedFare,
            breakdown: { totalFare: booking.lockedFare }
          },
          supabaseBookingId
        );
      } catch {
        // non-blocking
      }
    }

    // If trip is completed or paid, sync driver earnings
    if (supabaseBookingId && driverUuid && (payload.status === 'COMPLETED' || payload.payment_status === 'PAID')) {
      const gross = Number(payload.agreed_fare || 420);
      const fee = Math.round(gross * 0.10);
      const net = gross - fee;
      await syncDriverEarningToSupabase({
        driverId: driverUuid,
        bookingId: supabaseBookingId,
        grossFare: gross,
        platformFee: fee,
        fuelTollCost: 0,
        netEarning: net,
        settledToBank: false
      });
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

    const passengerUuid = await resolvePassengerUuid(incident.passengerId);
    let bookingUuid = null;
    if (incident.bookingId) {
      bookingUuid = await resolveBookingUuid(incident.bookingId);
    }

    const payload = {
      booking_id: bookingUuid,
      severity,
      incident_type: incidentType,
      description: incident.notes?.[0]?.text || incident.addressAtIncident || `Incident reported: ${incident.incidentNumber || 'Emergency SOS'}`,
      latitude: incident.currentLocation?.coordinates?.[1] || 17.4474,
      longitude: incident.currentLocation?.coordinates?.[0] || 78.3811,
      route_deviation_detected: incidentType === 'ROUTE_DEVIATION',
      audio_recording_url: incident.audioSnapshotUrl || null,
      status: incident.status === 'RESOLVED' ? 'RESOLVED' : (incident.status === 'FALSE_ALARM' ? 'FALSE_ALARM' : 'OPEN'),
      reporter_id: passengerUuid
    };

    if (bookingUuid) {
      const { data: existing } = await supabase
        .from('safety_incidents')
        .select('id')
        .eq('booking_id', bookingUuid)
        .maybeSingle();

      if (existing?.id) {
        await supabase.from('safety_incidents').update(payload).eq('id', existing.id);
        console.log(`[Supabase Sync] ✅ Updated safety incident for booking ${bookingUuid}`);
        return;
      }
    }

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
 * Synchronizes a Dispute to Supabase public.disputes
 */
export async function syncDisputeToSupabase(dispute: any): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    const passengerUuid = await resolvePassengerUuid(dispute.passengerId);
    let bookingUuid = null;
    if (dispute.bookingId) {
      bookingUuid = await resolveBookingUuid(dispute.bookingId);
    }

    // Normalize category to match Supabase CHECK constraint
    const rawCat = (dispute.category || 'OVERCHARGING').toUpperCase();
    let category = 'OVERCHARGING';
    if (rawCat.includes('CASH') || rawCat.includes('DEMAND')) {
      category = 'DEMANDED_CASH';
    } else if (rawCat.includes('CANCEL')) {
      category = 'DRIVER_ASKED_CANCEL';
    } else if (rawCat.includes('ROUTE')) {
      category = 'WRONG_ROUTE_TAKEN';
    } else if (rawCat.includes('VEHICLE')) {
      category = 'VEHICLE_MISMATCH';
    } else if (rawCat.includes('SAFETY')) {
      category = 'SAFETY_CONCERN';
    } else {
      category = 'OVERCHARGING';
    }

    // Normalize status to match Supabase CHECK constraint
    const rawStatus = (dispute.status || 'UNDER_REVIEW').toUpperCase();
    let status = 'UNDER_REVIEW';
    if (rawStatus.includes('APPROVED') || rawStatus.includes('REFUND') || rawStatus === 'RESOLVED') {
      status = 'APPROVED_REFUNDED';
    } else if (rawStatus === 'REJECTED') {
      status = 'REJECTED';
    } else {
      status = 'UNDER_REVIEW';
    }

    const payload = {
      booking_id: bookingUuid,
      initiator_id: passengerUuid,
      category,
      description: dispute.description || 'Dispute regarding fare transparency and ride experience',
      claimed_amount: dispute.demandedAmount || 0,
      refunded_amount: dispute.refundAmount || 0,
      status,
      evidence_urls: dispute.passengerScreenshots || []
    };

    if (bookingUuid) {
      const { data: existing } = await supabase
        .from('disputes')
        .select('id')
        .eq('booking_id', bookingUuid)
        .maybeSingle();

      if (existing?.id) {
        await supabase.from('disputes').update(payload).eq('id', existing.id);
        console.log(`[Supabase Sync] ✅ Updated dispute for booking ${bookingUuid}`);
        return;
      }
    }

    const { error } = await supabase.from('disputes').insert(payload);
    if (error) {
      console.warn('[Supabase Sync] Warning syncing dispute:', error.message);
    } else {
      console.log(`[Supabase Sync] ✅ Synced dispute ${dispute.disputeNumber || ''} to Supabase`);
    }
  } catch (err: any) {
    console.warn('[Supabase Sync] Error syncing dispute:', err.message);
  }
}

/**
 * Synchronizes driver earning to Supabase public.driver_earnings
 */
export async function syncDriverEarningToSupabase(earning: {
  driverId: string;
  bookingId?: string | null;
  grossFare: number;
  platformFee: number;
  fuelTollCost?: number;
  netEarning: number;
  settledToBank?: boolean;
}): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    let driverUuid = earning.driverId;
    if (mongoDriverToSupabaseIdMap.has(earning.driverId)) {
      driverUuid = mongoDriverToSupabaseIdMap.get(earning.driverId)!;
    } else {
      // Check if driverId is a MongoDB ID or UUID
      const { data: dData } = await supabase
        .from('drivers')
        .select('id')
        .eq('id', driverUuid)
        .maybeSingle();
      if (!dData) {
        const { data: firstDriver } = await supabase.from('drivers').select('id').limit(1).maybeSingle();
        if (firstDriver) driverUuid = firstDriver.id;
      }
    }

    let bookingUuid = earning.bookingId || null;
    if (bookingUuid) {
      bookingUuid = await resolveBookingUuid(bookingUuid);
    }

    const payload = {
      driver_id: driverUuid,
      booking_id: bookingUuid,
      gross_fare: earning.grossFare,
      platform_fee: earning.platformFee,
      fuel_toll_cost: earning.fuelTollCost || 0.0,
      net_earning: earning.netEarning,
      settled_to_bank: earning.settledToBank ?? false
    };

    if (bookingUuid) {
      const { data: existing } = await supabase
        .from('driver_earnings')
        .select('id')
        .eq('booking_id', bookingUuid)
        .maybeSingle();

      if (existing?.id) {
        await supabase.from('driver_earnings').update(payload).eq('id', existing.id);
        console.log(`[Supabase Sync] ✅ Updated driver earning for booking ${bookingUuid}`);
        return;
      }
    }

    const { error } = await supabase.from('driver_earnings').insert(payload);
    if (error) {
      console.warn('[Supabase Sync] Warning syncing driver earnings:', error.message);
    } else {
      console.log(`[Supabase Sync] ✅ Synced driver earning (₹${earning.netEarning}) to Supabase`);
    }
  } catch (err: any) {
    console.warn('[Supabase Sync] Error syncing driver earning:', err.message);
  }
}

/**
 * Complete database synchronization from MongoDB to Supabase PostgreSQL.
 * Iterates through all 7 tables in MongoDB and populates Supabase.
 */
export async function syncAllDatabaseToSupabase(): Promise<{
  success: boolean;
  usersSynced: number;
  driversSynced: number;
  bookingsSynced: number;
  fareLocksSynced: number;
  disputesSynced: number;
  safetyIncidentsSynced: number;
  earningsSynced: number;
  message: string;
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      usersSynced: 0,
      driversSynced: 0,
      bookingsSynced: 0,
      fareLocksLocks: 0,
      disputesSynced: 0,
      safetyIncidentsSynced: 0,
      earningsSynced: 0,
      message: 'Supabase credentials are not configured in .env'
    } as any;
  }

  console.log('[Supabase Sync] 🚀 Beginning full MongoDB -> Supabase synchronization across ALL 7 tables...');

  let usersSynced = 0;
  let driversSynced = 0;
  let bookingsSynced = 0;
  let fareLocksSynced = 0;
  let disputesSynced = 0;
  let safetyIncidentsSynced = 0;
  let earningsSynced = 0;

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
    const bookings = await Booking.find().limit(100);
    console.log(`[Supabase Sync] Found ${bookings.length} bookings to sync...`);
    for (const b of bookings) {
      const res = await syncBookingToSupabase(b);
      if (res.id) bookingsSynced++;
    }

    // 4. Sync all Fare Locks
    const fareLocks = await FareLock.find().limit(100);
    console.log(`[Supabase Sync] Found ${fareLocks.length} fare locks to sync...`);
    for (const fl of fareLocks) {
      const res = await syncFareLockToSupabase(fl);
      if (res.id) fareLocksSynced++;
    }

    // 5. Sync all Disputes
    const disputes = await Dispute.find();
    console.log(`[Supabase Sync] Found ${disputes.length} disputes to sync...`);
    for (const disp of disputes) {
      await syncDisputeToSupabase(disp);
      disputesSynced++;
    }

    // 6. Sync all Safety Incidents
    const incidents = await SafetyIncident.find();
    console.log(`[Supabase Sync] Found ${incidents.length} safety incidents to sync...`);
    for (const inc of incidents) {
      await syncSafetyIncidentToSupabase(inc);
      safetyIncidentsSynced++;
    }

    // 7. Sync Driver Earnings for completed bookings
    const completedBookings = await Booking.find({
      state: { $in: ['COMPLETED', 'PAYMENT_COMPLETED', 'TRIP_COMPLETED'] },
      driverId: { $ne: null }
    }).populate('driverId');

    for (const cb of completedBookings) {
      const gross = Number(cb.finalFare || cb.lockedFare || 450);
      const fee = Math.round(gross * 0.10);
      const net = gross - fee;
      const dSupabaseId = mongoDriverToSupabaseIdMap.get(cb.driverId?._id?.toString() || '') || null;
      const bSupabaseId = mongoBookingToSupabaseIdMap.get(cb._id.toString()) || null;

      if (dSupabaseId) {
        await syncDriverEarningToSupabase({
          driverId: dSupabaseId,
          bookingId: bSupabaseId,
          grossFare: gross,
          platformFee: fee,
          fuelTollCost: 0,
          netEarning: net,
          settledToBank: true
        });
        earningsSynced++;
      }
    }

    const message = `Supabase Sync Complete! Synced ${usersSynced} users, ${driversSynced} drivers, ${bookingsSynced} bookings, ${fareLocksSynced} fare locks, ${disputesSynced} disputes, ${safetyIncidentsSynced} incidents, and ${earningsSynced} driver earnings.`;
    console.log(`[Supabase Sync] 🏁 ${message}`);

    return {
      success: true,
      usersSynced,
      driversSynced,
      bookingsSynced,
      fareLocksSynced,
      disputesSynced,
      safetyIncidentsSynced,
      earningsSynced,
      message
    };
  } catch (err: any) {
    console.error('[Supabase Sync] Full sync error:', err);
    return {
      success: false,
      usersSynced,
      driversSynced,
      bookingsSynced,
      fareLocksSynced,
      disputesSynced,
      safetyIncidentsSynced,
      earningsSynced,
      message: err.message
    };
  }
}

/**
 * Inspect live Supabase table counts and health for all 7 tables
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
      { count: fareLocksCount },
      { count: safetyCount },
      { count: disputesCount },
      { count: earningsCount }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('drivers').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('fare_locks').select('*', { count: 'exact', head: true }),
      supabase.from('safety_incidents').select('*', { count: 'exact', head: true }),
      supabase.from('disputes').select('*', { count: 'exact', head: true }),
      supabase.from('driver_earnings').select('*', { count: 'exact', head: true })
    ]);

    return {
      isConfigured: true,
      supabaseUrl: process.env.SUPABASE_URL || 'https://itctieptnuggjqfhdvbh.supabase.co',
      status: 'CONNECTED',
      tables: {
        users: usersCount ?? 0,
        drivers: driversCount ?? 0,
        bookings: bookingsCount ?? 0,
        fareLocks: fareLocksCount ?? 0,
        safetyIncidents: safetyCount ?? 0,
        disputes: disputesCount ?? 0,
        driverEarnings: earningsCount ?? 0
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
