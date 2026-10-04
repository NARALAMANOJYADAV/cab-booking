import { supabase, isSupabaseConfigured } from '../config/supabase.js';

/**
 * Synchronizes booking state to Supabase PostgreSQL in real-time
 */
export async function syncBookingToSupabase(booking: any): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    const payload = {
      booking_code: booking.bookingReference,
      status: booking.state || 'REQUESTED',
      pickup_address: booking.pickup?.address || 'Pickup Point',
      dropoff_address: booking.destination?.address || 'Destination Point',
      pickup_lat: booking.pickup?.coordinates?.[1] || 17.4474,
      pickup_lng: booking.pickup?.coordinates?.[0] || 78.3811,
      dropoff_lat: booking.destination?.coordinates?.[1] || 17.2403,
      dropoff_lng: booking.destination?.coordinates?.[0] || 78.4298,
      agreed_fare: booking.lockedFare || 420,
      locked_fare: booking.lockedFare || 420,
      fare_currency: 'INR',
      ride_otp: booking.verificationPin || '5821',
      distance_km: booking.distanceKm || 28.5,
      duration_mins: booking.estimatedDurationMin || 35,
      payment_method: booking.paymentMethod || 'WALLET',
      payment_status: booking.paymentStatus || 'PENDING',
      updated_at: new Date().toISOString()
    };

    // Upsert into Supabase public.bookings
    const { error } = await supabase
      .from('bookings')
      .upsert(payload, { onConflict: 'booking_code' });

    if (error) {
      console.warn('[Supabase Sync] Warning syncing booking to Supabase:', error.message);
    } else {
      console.log(`[Supabase Sync] ✅ Successfully synced booking ${booking.bookingReference} (${booking.state}) to Supabase!`);
    }
  } catch (err: any) {
    console.warn('[Supabase Sync] Non-blocking sync error:', err.message);
  }
}
