import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://itctieptnuggjqfhdvbh.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0Y3RpZXB0bnVnZ2pxZmhkdmJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTcyOTMsImV4cCI6MjEwNjUzMzI5M30.UH17tw-DYSMTGFKrP8AGEkhPBY_Ulkojt0Pv7MC38ck';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

let supabaseClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    console.info('[Supabase] Web client initialized connected to:', supabaseUrl);
  } catch (err) {
    console.warn('[Supabase] Initialization warning:', err);
  }
}

/**
 * Checks if Supabase client credentials are present in Vite env
 */
export const isSupabaseReady = (): boolean => {
  return !!supabaseClient;
};

/**
 * Export the initialized Supabase client
 */
export const supabase = supabaseClient;

/**
 * Helper to subscribe to live booking status updates via Supabase Realtime Postgres Changes
 */
export function subscribeToBookingRealtime(
  bookingId: string,
  onUpdate: (payload: any) => void
) {
  if (!supabaseClient) return () => {};

  const channel = supabaseClient
    .channel(`booking-live-${bookingId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${bookingId}`
      },
      (payload) => {
        onUpdate(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabaseClient?.removeChannel(channel);
  };
}
