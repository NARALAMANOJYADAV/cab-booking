import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL ||
  '';

const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

let supabaseClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        flowType: 'pkce'
      },
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

/**
 * Sign in using Google OAuth via Supabase
 */
export async function signInWithGoogle(redirectTo?: string) {
  if (!supabaseClient) {
    throw new Error('Supabase client is not configured with VITE_SUPABASE_URL / ANON_KEY');
  }

  const redirectUrl = redirectTo || (typeof window !== 'undefined' ? window.location.origin : undefined);

  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });

  if (error) {
    throw error;
  }

  return data;
}
