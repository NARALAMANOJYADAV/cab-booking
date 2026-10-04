-- ====================================================================
-- FAIRRIDE INTELLIGENT MOBILITY PLATFORM - SUPABASE POSTGRESQL SCHEMA
-- Tagline: "Book With Confidence."
-- Run this in your Supabase Dashboard: SQL Editor -> "New query" -> "Run"
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('PASSENGER', 'DRIVER', 'ADMIN', 'CORPORATE')),
    avatar_url TEXT,
    rating NUMERIC(3,2) DEFAULT 5.00,
    wallet_balance NUMERIC(10,2) DEFAULT 1000.00,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. DRIVERS TABLE
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('BIKE', 'AUTO', 'MINI', 'SEDAN', 'PREMIUM', 'XL', 'EV')),
    vehicle_number TEXT NOT NULL,
    vehicle_model TEXT NOT NULL,
    license_number TEXT NOT NULL,
    status TEXT DEFAULT 'OFFLINE' CHECK (status IN ('OFFLINE', 'AVAILABLE', 'ON_TRIP', 'BUSY', 'SUSPENDED')),
    rating NUMERIC(3,2) DEFAULT 4.90,
    total_trips INTEGER DEFAULT 0,
    cancellation_rate NUMERIC(5,2) DEFAULT 0.00,
    acceptance_rate NUMERIC(5,2) DEFAULT 100.00,
    current_lat NUMERIC(10,7) DEFAULT 12.9716,
    current_lng NUMERIC(10,7) DEFAULT 77.5946,
    kyc_status TEXT DEFAULT 'APPROVED' CHECK (kyc_status IN ('PENDING', 'VERIFIED', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code TEXT UNIQUE NOT NULL,
    passenger_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'SEARCHING' CHECK (status IN (
        'REQUESTED', 'SEARCHING', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 
        'ARRIVED_PICKUP', 'TRIP_STARTED', 'IN_TRANSIT', 'NEAR_DESTINATION', 
        'COMPLETED', 'CANCELLED_BY_PASSENGER', 'CANCELLED_BY_DRIVER', 
        'AUTO_REASSIGNED', 'DISPUTED'
    )),
    pickup_address TEXT NOT NULL,
    dropoff_address TEXT NOT NULL,
    pickup_lat NUMERIC(10,7) NOT NULL,
    pickup_lng NUMERIC(10,7) NOT NULL,
    dropoff_lat NUMERIC(10,7) NOT NULL,
    dropoff_lng NUMERIC(10,7) NOT NULL,
    agreed_fare NUMERIC(10,2) NOT NULL,
    locked_fare NUMERIC(10,2) NOT NULL,
    fare_currency TEXT DEFAULT 'INR',
    ride_otp TEXT NOT NULL,
    distance_km NUMERIC(6,2) DEFAULT 0.0,
    duration_mins INTEGER DEFAULT 0,
    payment_method TEXT DEFAULT 'WALLET' CHECK (payment_method IN ('WALLET', 'UPI', 'CARD', 'CASH', 'CORPORATE')),
    payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'REFUNDED', 'DISPUTED')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. FARE LOCKS TABLE
CREATE TABLE IF NOT EXISTS public.fare_locks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    quoted_amount NUMERIC(10,2) NOT NULL,
    locked_amount NUMERIC(10,2) NOT NULL,
    expiry_time TIMESTAMPTZ NOT NULL,
    is_guaranteed BOOLEAN DEFAULT TRUE,
    variance_reason TEXT DEFAULT 'FairRide Zero-Surge Guarantee',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. SAFETY INCIDENTS & ROUTE GUARDIAN TABLE
CREATE TABLE IF NOT EXISTS public.safety_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL_SOS')),
    incident_type TEXT NOT NULL CHECK (incident_type IN (
        'ROUTE_DEVIATION', 'UNEXPECTED_STOP', 'DEMANDING_EXTRA_CASH', 
        'RECKLESS_DRIVING', 'HARASSMENT', 'SOS_BUTTON_TRIGGERED', 'VEHICLE_BREAKDOWN'
    )),
    description TEXT,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    route_deviation_detected BOOLEAN DEFAULT FALSE,
    audio_recording_url TEXT,
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'DISPATCHED_POLICE', 'RESOLVED', 'FALSE_ALARM')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. DISPUTES & INSTANT REFUND SYSTEM
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    initiator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN (
        'OVERCHARGING', 'DEMANDED_CASH', 'DRIVER_ASKED_CANCEL', 
        'WRONG_ROUTE_TAKEN', 'VEHICLE_MISMATCH', 'SAFETY_CONCERN'
    )),
    description TEXT NOT NULL,
    claimed_amount NUMERIC(10,2) DEFAULT 0.00,
    refunded_amount NUMERIC(10,2) DEFAULT 0.00,
    status TEXT DEFAULT 'UNDER_REVIEW' CHECK (status IN ('UNDER_REVIEW', 'APPROVED_REFUNDED', 'REJECTED')),
    evidence_urls TEXT[],
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. DRIVER WALLET & LEDGER TABLE
CREATE TABLE IF NOT EXISTS public.driver_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    gross_fare NUMERIC(10,2) NOT NULL,
    platform_fee NUMERIC(10,2) NOT NULL,
    fuel_toll_cost NUMERIC(10,2) DEFAULT 0.00,
    net_earning NUMERIC(10,2) NOT NULL,
    settled_to_bank BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fare_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_earnings ENABLE ROW LEVEL SECURITY;

-- Clean existing policies for idempotency
DROP POLICY IF EXISTS "Public can view active drivers" ON public.drivers;
DROP POLICY IF EXISTS "Users can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Service role full access users" ON public.users;
DROP POLICY IF EXISTS "Service role full access drivers" ON public.drivers;
DROP POLICY IF EXISTS "Service role full access bookings" ON public.bookings;
DROP POLICY IF EXISTS "Service role full access fare_locks" ON public.fare_locks;
DROP POLICY IF EXISTS "Service role full access safety" ON public.safety_incidents;
DROP POLICY IF EXISTS "Service role full access disputes" ON public.disputes;
DROP POLICY IF EXISTS "Service role full access earnings" ON public.driver_earnings;

-- Allow public read access to active drivers so passengers can view available cabs on map
CREATE POLICY "Public can view active drivers" 
ON public.drivers FOR SELECT 
USING (status IN ('AVAILABLE', 'BUSY', 'ON_TRIP'));

-- Allow public/authenticated read access to bookings
CREATE POLICY "Users can view bookings" 
ON public.bookings FOR SELECT 
TO authenticated, anon
USING (true);

-- Allow authenticated/anon users to insert bookings
CREATE POLICY "Users can create bookings" 
ON public.bookings FOR INSERT 
TO authenticated, anon
WITH CHECK (true);

-- Allow updates on bookings
CREATE POLICY "Users can update bookings" 
ON public.bookings FOR UPDATE 
TO authenticated, anon
USING (true);

-- Allow service role full bypass on all tables (Backend API service key)
CREATE POLICY "Service role full access users" ON public.users FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access drivers" ON public.drivers FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access bookings" ON public.bookings FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access fare_locks" ON public.fare_locks FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access safety" ON public.safety_incidents FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access disputes" ON public.disputes FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access earnings" ON public.driver_earnings FOR ALL TO service_role USING (true);

-- ====================================================================
-- 10. REALTIME CONFIGURATION (Idempotent)
-- ====================================================================
DO $$ 
BEGIN 
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.safety_incidents;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;

-- ====================================================================
-- 11. STORAGE BUCKETS SETUP (Idempotent)
-- ====================================================================
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES 
        ('driver-documents', 'driver-documents', true),
        ('dispute-evidence', 'dispute-evidence', true)
    ON CONFLICT (id) DO NOTHING;
EXCEPTION WHEN OTHERS THEN 
    NULL;
END $$;

-- Clean existing storage policies
DROP POLICY IF EXISTS "Public read driver-documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone upload driver-documents" ON storage.objects;
DROP POLICY IF EXISTS "Public read dispute-evidence" ON storage.objects;
DROP POLICY IF EXISTS "Anyone upload dispute-evidence" ON storage.objects;

DO $$
BEGIN
    CREATE POLICY "Public read driver-documents" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'driver-documents');

    CREATE POLICY "Anyone upload driver-documents" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'driver-documents');

    CREATE POLICY "Public read dispute-evidence" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'dispute-evidence');

    CREATE POLICY "Anyone upload dispute-evidence" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'dispute-evidence');
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- ====================================================================
-- 12. SAMPLE SEED DATA FOR TESTING
-- ====================================================================
INSERT INTO public.users (id, email, phone, full_name, role, rating, wallet_balance)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'passenger@fairride.local', '+919876543210', 'Alex Passenger', 'PASSENGER', 4.95, 2500.00),
    ('22222222-2222-2222-2222-222222222222', 'driver@fairride.local', '+919876543211', 'Rajesh Driver', 'DRIVER', 4.98, 12000.00),
    ('33333333-3333-3333-3333-333333333333', 'admin@fairride.local', '+919876543212', 'Sarah Admin', 'ADMIN', 5.00, 50000.00)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.drivers (id, user_id, vehicle_type, vehicle_number, vehicle_model, license_number, status, rating, total_trips, current_lat, current_lng)
VALUES 
    ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'SEDAN', 'KA 01 MJ 2026', 'Honda City i-VTEC', 'DL-KA-01-2018-999', 'AVAILABLE', 4.98, 1240, 12.9716, 77.5946)
ON CONFLICT (id) DO NOTHING;
