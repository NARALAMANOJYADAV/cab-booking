import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';
import {
  Search,
  MapPin,
  Navigation,
  Lock,
  Shield,
  Zap,
  Mic,
  RotateCcw,
  Sparkles,
  Phone,
  Clock,
  DollarSign,
  Leaf,
  Users,
  Eye,
  Plane,
  Building,
  CheckCircle,
  AlertTriangle,
  Car,
  ChevronRight,
  ShieldCheck,
  ArrowRightLeft,
  Info,
  Compass,
  CreditCard,
  MessageSquare,
  Crosshair,
  Calendar,
  Share2
} from 'lucide-react';
import { InteractiveMap } from '../components/InteractiveMap';
import { FareLockBadge } from '../components/FareLockBadge';
import { RouteGuardianBanner } from '../components/RouteGuardianBanner';
import { VoiceBookingModal } from '../components/VoiceBookingModal';
import { FareAuditReceiptModal } from '../components/FareAuditReceiptModal';
import { UpiPaymentModal } from '../components/UpiPaymentModal';
import { VEHICLE_CONFIGS } from '@fairride/constants';
import { VehicleCategory, TripType, RidePreference } from '@fairride/types';
import { formatCurrencyINR } from '@fairride/shared';

export const PassengerHomePage: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    setAuthModalOpen,
    activeBooking,
    setActiveBooking,
    updateBookingState,
    seniorMode,
    t
  } = useAppStore();

  // Search state
  const [pickupSearch, setPickupSearch] = useState('Cyber Towers, Hitech City');
  const [destinationSearch, setDestinationSearch] = useState('RGIA Airport Shamshabad');
  const [pickupCoords, setPickupCoords] = useState<[number, number]>([78.3811, 17.4474]);
  const [destinationCoords, setDestinationCoords] = useState<[number, number]>([78.4298, 17.2403]);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState('Gate 1 Main Security Flagpole');
  const [specificInstructions, setSpecificInstructions] = useState('Meet at Gate 1 near security flagpole');
  const [flightNumber, setFlightNumber] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [pickupSearchResults, setPickupSearchResults] = useState<any[]>([]);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);

  // Trip selection
  const [tripType, setTripType] = useState<TripType>('ONE_WAY');
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>('SEDAN');
  const [selectedPreference, setSelectedPreference] = useState<RidePreference>('FASTEST');
  const [quotes, setQuotes] = useState<any[]>([]);
  const [lockedQuote, setLockedQuote] = useState<any>(null);
  const [isSwapping, setIsSwapping] = useState(false);

  // Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTripPaid, setIsTripPaid] = useState(false);

  // GPS & Ride Scheduling states
  const [isLocating, setIsLocating] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState(() => {
    const d = new Date(Date.now() + 3600000);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setPickupCoords([lng, lat]);
        setPickupSearch(`GPS: Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        setIsLocating(false);
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        setPickupCoords([78.3811, 17.4474]);
        setPickupSearch('Cyber Towers, Hitech City (Auto-detected)');
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleShareTrip = () => {
    const ref = activeBooking?.bookingReference || 'FR-8891';
    const shareUrl = `${window.location.origin}/track/${ref}`;
    navigator.clipboard?.writeText(shareUrl);
    const msg = `🚗 Tracking my FairRide trip live: ${shareUrl}\nDriver: ${activeBooking?.driver?.name || 'Verified Driver'} (${activeBooking?.driver?.plateNumber || 'TS07UB1420'})`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Quick landmark shortcuts
  const popularPlaces = [
    { name: 'Cyber Towers Gate 1', category: 'Tech Hub', coords: [78.3811, 17.4474] as [number, number] },
    { name: 'RGIA Airport Terminal 1', category: 'Airport', coords: [78.4298, 17.2403] as [number, number] },
    { name: 'Inorbit Mall Valet', category: 'Shopping', coords: [78.3875, 17.4344] as [number, number] },
    { name: 'Hitech Metro Exit B', category: 'Metro Transit', coords: [78.3789, 17.4489] as [number, number] },
    { name: 'Secunderabad Stn Platform 10', category: 'Railway', coords: [78.5020, 17.4342] as [number, number] }
  ];

  // Fetch quotes whenever coordinates or tripType changes
  useEffect(() => {
    fetchQuotes(pickupCoords, destinationCoords);
  }, [pickupCoords, destinationCoords, tripType, selectedPreference]);

  const fetchQuotes = async (pCoords = pickupCoords, dCoords = destinationCoords) => {
    try {
      const res = await api.getQuotes({
        pickupCoordinates: pCoords,
        destinationCoordinates: dCoords,
        tripType
      });
      if (res.data?.quotes && res.data.quotes.length > 0) {
        setQuotes(res.data.quotes);
        const matched =
          res.data.quotes.find((q: any) => q.vehicleCategory === selectedCategory) || res.data.quotes[0];
        setLockedQuote(matched);
      }
    } catch {
      // Fallback
    }
  };

  const handleSelectPickup = (place: any) => {
    setPickupSearch(place.name || place.address);
    if (place.coordinates) {
      setPickupCoords(place.coordinates);
    }
    setPickupSearchResults([]);
    setIsSearchingPickup(false);
  };

  const handlePickupInput = async (value: string) => {
    setPickupSearch(value);
    if (value.length > 2) {
      setIsSearchingPickup(true);
      try {
        const res = await api.searchPlaces(value);
        setPickupSearchResults(res.data || []);
      } catch {
        setPickupSearchResults([]);
      }
    } else {
      setPickupSearchResults([]);
      setIsSearchingPickup(false);
    }
  };

  const handleSelectPlace = (place: any) => {
    setDestinationSearch(place.name || place.address);
    if (place.coordinates) {
      setDestinationCoords(place.coordinates);
    }
    setSearchResults([]);
    setIsSearchingDest(false);
  };

  const handleDestinationInput = async (value: string) => {
    setDestinationSearch(value);
    if (value.length > 2) {
      setIsSearchingDest(true);
      try {
        const res = await api.searchPlaces(value);
        setSearchResults(res.data || []);
      } catch {
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setIsSearchingDest(false);
    }
  };

  const handleSwapAddresses = () => {
    setIsSwapping(true);
    const tempSearch = pickupSearch;
    const tempCoords = pickupCoords;
    setPickupSearch(destinationSearch);
    setPickupCoords(destinationCoords);
    setDestinationSearch(tempSearch);
    setDestinationCoords(tempCoords);
    setTimeout(() => setIsSwapping(false), 300);
  };

  const handleLockAndBook = async () => {
    if (!lockedQuote) return;

    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    try {
      let lockData: any;
      try {
        const lockRes = await api.lockFare(lockedQuote);
        lockData = lockRes.data;
      } catch {
        lockData = { _id: 'lock_demo_101', totalFare: lockedQuote.breakdown.totalFare };
      }

      let b: any;
      try {
        const bookRes = await api.createBooking({
          lockId: lockData._id,
          pickup: {
            type: 'Point',
            coordinates: pickupCoords,
            address: pickupSearch,
            pickupPointType: 'GATE',
            specificInstructions
          },
          destination: {
            type: 'Point',
            coordinates: destinationCoords,
            address: destinationSearch
          },
          vehicleCategory: selectedCategory,
          paymentMethod: 'UPI'
        });
        b = bookRes.data;
      } catch {
        b = {
          _id: 'bk_live_' + Date.now(),
          bookingReference: 'FR-' + Math.floor(1000 + Math.random() * 9000),
          verificationPin: '5821',
          timeline: []
        };
      }

      setActiveBooking({
        bookingId: b._id,
        bookingReference: b.bookingReference,
        state: 'DRIVER_ASSIGNED',
        pickupAddress: pickupSearch,
        destinationAddress: destinationSearch,
        pickupCoords: pickupCoords,
        destinationCoords: destinationCoords,
        pickupPointType: selectedPickupPoint,
        specificInstructions,
        vehicleCategory: selectedCategory,
        lockedFare: lockedQuote.breakdown.totalFare,
        verificationPin: b.verificationPin || '5821',
        driver: {
          id: 'drv_demo_rajesh',
          name: 'Rajesh Kumar',
          phone: '+91 9800000003',
          rating: 4.92,
          vehicleModel: 'Hyundai Aura (White)',
          plateNumber: 'TS 07 UB 1420',
          currentCoords: [pickupCoords[0] + 0.003, pickupCoords[1] + 0.002],
          etaMinutes: 3
        },
        timeline: b.timeline || []
      });
    } catch (err: any) {
      alert(err.message || 'Booking creation failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
      {/* Voice Booking Dialog */}
      <VoiceBookingModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onConfirmBooking={(parsed) => {
          setPickupSearch(parsed.pickup);
          setDestinationSearch(parsed.destination);
          setSelectedCategory(parsed.vehicleCategory);
          handleLockAndBook();
        }}
      />

      {/* Downloadable Fare Audit Receipt Modal */}
      <FareAuditReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        bookingReference={activeBooking?.bookingReference || 'FR-HIST-8291'}
        originalLockedFare={activeBooking?.lockedFare || 420}
        finalFare={activeBooking?.finalFare || 420}
        difference={0}
        pickup={activeBooking?.pickupAddress || pickupSearch}
        destination={activeBooking?.destinationAddress || destinationSearch}
        date={new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
        onOpenDispute={() => alert('FairRide Instant Dispute Console Opened: Refund reviewed in 120s.')}
      />

      {/* Razorpay & UPI Instant Settlement Modal */}
      <UpiPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bookingId={activeBooking?.bookingId}
        bookingReference={activeBooking?.bookingReference || 'FR-8891'}
        amount={activeBooking?.lockedFare || 420}
        onPaymentSuccess={() => {
          setIsTripPaid(true);
        }}
      />

      {/* TOP COMMAND HEADER: Personalized Greeting & Trust Metrics */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-4 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white tracking-tight">
              Good evening, <span className="text-emerald-400">Aarav</span> 👋
            </h1>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
              PLATINUM PASSENGER
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Book With Confidence • Guaranteed zero extra cash demands & transparent driver earnings.
          </p>
        </div>

        {/* Live Platform Confidence Badges */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-1.5 shadow">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Surge Guarantee</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-1.5 shadow">
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Auto-Recovery Engine</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-1.5 shadow">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Route Guardian 24/7</span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 1. ACTIVE TRIP IN-TRANSIT COCKPIT (Shown when trip is active) */}
      {/* ==================================================================== */}
      {activeBooking && activeBooking.state !== 'CANCELLED' && activeBooking.state !== 'PAYMENT_COMPLETED' ? (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Auto-Recovery Banner if driver cancelled */}
          {activeBooking.state === 'RECOVERY' && (
            <div className="p-4 rounded-3xl bg-amber-500/15 border-2 border-amber-500 text-amber-200 flex items-center justify-between shadow-2xl animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <RotateCcw className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-white">{t('autoRecoveryTitle')}</h4>
                  <p className="text-xs text-amber-300">{t('autoRecoveryDesc')}</p>
                </div>
              </div>
              <span className="text-xs bg-amber-400 text-slate-950 font-black px-3 py-1 rounded-full shadow">
                ZERO PENALTY REASSIGNMENT
              </span>
            </div>
          )}

          {/* Route Guardian Detour Alert */}
          {activeBooking.routeDeviationFlagged && (
            <RouteGuardianBanner
              deviationMeters={580}
              onRespond={(action) => {
                if (action === 'IM_SAFE') {
                  setActiveBooking({ routeDeviationFlagged: false });
                } else {
                  alert(`EMERGENCY ALERT: Safety Operations Console & Hyderabad Police notified with action: ${action}`);
                }
              }}
            />
          )}

          {/* Large Live Cartographic Map */}
          <InteractiveMap
            pickupCoords={activeBooking.pickupCoords || pickupCoords}
            destinationCoords={activeBooking.destinationCoords || destinationCoords}
            pickupName={activeBooking.pickupAddress}
            destinationName={activeBooking.destinationAddress}
            isDeviated={activeBooking.routeDeviationFlagged}
            showCorridor={true}
            className="h-80 sm:h-[420px]"
          />

          {/* In-Transit Cockpit Details Grid */}
          <div className="grid md:grid-cols-12 gap-5">
            {/* Driver Identity & Verification Card (5 Cols) */}
            <div className="md:col-span-5 glass-panel rounded-3xl p-6 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  VERIFIED HYDERABAD DRIVER
                </span>
                <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  ★ {activeBooking.driver?.rating || 4.92}
                </span>
              </div>

              {/* Driver Profile */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 flex items-center justify-center text-2xl font-black shadow-lg">
                  {activeBooking.driver?.name?.charAt(0) || 'R'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{activeBooking.driver?.name}</h3>
                  <p className="text-xs text-slate-300 font-medium">
                    {activeBooking.driver?.vehicleModel}
                  </p>
                  {/* Authentic Yellow Indian Vehicle Plate */}
                  <div className="mt-1.5 inline-block plate-badge px-2.5 py-0.5 rounded text-xs font-black">
                    {activeBooking.driver?.plateNumber}
                  </div>
                </div>
              </div>

              {/* Driver Net Earnings Transparency (Solves Driver Demanding Cash) */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-300 font-semibold">
                  <span>Driver Net Take-Home:</span>
                  <span className="text-emerald-400 font-black font-mono">
                    {formatCurrencyINR(Math.round((activeBooking.lockedFare || 420) * 0.92))} (92%)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  FairRide charges only 8% fee. Driver knows their full cut upfront. No cash haggling!
                </p>
              </div>

              {/* Communication Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`tel:${activeBooking.driver?.phone}`}
                  className="py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 border border-slate-700/80 transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Driver</span>
                </a>
                <button
                  onClick={() => alert('Live driver chat: "Arriving at Gate 1 flagpole in 2 mins."')}
                  className="py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 border border-slate-700/80 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Chat</span>
                </button>
              </div>
            </div>

            {/* Middle: High-Security Verification PIN & Safe Pickup Point (4 Cols) */}
            <div className="md:col-span-4 glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between text-center space-y-4 shadow-xl">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  BOARDING VERIFICATION PIN
                </span>
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/40 glow-amber inline-block w-full">
                  <span className="text-4xl font-black font-mono tracking-widest text-amber-400">
                    {activeBooking.verificationPin || '5821'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Share this PIN <strong className="text-white">ONLY</strong> after sitting inside and checking license plate{' '}
                  <strong className="text-amber-300 font-mono">{activeBooking.driver?.plateNumber}</strong>.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-left text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Designated Pickup:</span>
                </div>
                <p className="text-slate-300 text-[11px] pl-5">
                  {activeBooking.pickupPointType || 'Gate 1 Main Security Flagpole'}
                </p>
              </div>
            </div>

            {/* Right: FareLock Guarantee & Safety Controls (3 Cols) */}
            <div className="md:col-span-3 glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between space-y-4 shadow-xl">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                  LOCKED UPFRONT FARE
                </span>
                <p className="text-3xl font-black text-white font-mono">
                  {formatCurrencyINR(activeBooking.lockedFare || 420)}
                </p>
                <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                  ✓ Protected against traffic delays
                </span>
              </div>

              <div className="space-y-2 pt-2">
                {/* Pay via UPI / Razorpay Button */}
                {isTripPaid ? (
                  <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Paid via Razorpay UPI</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Pay via UPI / Razorpay</span>
                  </button>
                )}

                {/* Share Live Trip Button */}
                <button
                  onClick={handleShareTrip}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700/80 transition-all flex items-center justify-center gap-1.5"
                  title="Share Live Trip Tracking URL via WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Share Live Trip</span>
                </button>

                {/* Inspect Fare Audit */}
                <button
                  onClick={() => setIsReceiptModalOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700/80 transition-all flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Inspect Fare Audit</span>
                </button>

                {/* Instant Emergency SOS */}
                <button
                  onClick={() => {
                    if (confirm('🚨 EMERGENCY SOS: Trigger instant emergency police dispatch & alert trusted contacts?')) {
                      alert('EMERGENCY SOS BROADCAST ACTIVE: Police helpline 112 alerted. Emergency contacts pinged with live GPS.');
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/40 glow-rose transition-all flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>EMERGENCY SOS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ==================================================================== */
        /* 2. ADVANCED PASSENGER BOOKING WORKSPACE (SPLIT LAYOUT) */
        /* ==================================================================== */
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Modern Booking Dock (5 Columns) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Main Booking Card */}
            <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-5 shadow-2xl">
              {/* Header with Title and Voice Booking Action */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">Plan Your Journey</h2>
                  <p className="text-xs text-slate-400">Guaranteed fares • No unexpected charges</p>
                </div>

                <button
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition-all shadow-md group"
                  title="Speak your destination naturally in English, Hindi, or Telugu"
                >
                  <Mic className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Voice Book</span>
                </button>
              </div>

              {/* Trip Purpose Pill Switcher */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs font-bold">
                {[
                  { id: 'ONE_WAY', label: 'City Ride', icon: Car },
                  { id: 'AIRPORT_TRANSFER', label: 'Airport', icon: Plane },
                  { id: 'HOURLY_RENTAL', label: 'Rental', icon: Clock }
                ].map((type) => {
                  const Icon = type.icon;
                  const isActive = tripType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setTripType(type.id as any)}
                      className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Ride Now vs Schedule Later Switcher */}
              <div className="flex items-center justify-between bg-slate-950/80 p-1 rounded-2xl border border-slate-800/80 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsScheduled(false)}
                  className={`flex-1 py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    !isScheduled
                      ? 'bg-slate-800 text-emerald-300 font-black shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ride Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsScheduled(true)}
                  className={`flex-1 py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    isScheduled
                      ? 'bg-slate-800 text-emerald-300 font-black shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Schedule Later</span>
                </button>
              </div>

              {/* Scheduled Date & Time Pickers */}
              {isScheduled && (
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-950/90 border border-slate-800 animate-in fade-in">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                      Trip Date
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                      Pickup Time
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              )}

              {/* Connected Journey Route Planner */}
              <div className="relative space-y-3">
                {/* Visual Route Connector Line */}
                <div className="absolute left-[21px] top-[26px] bottom-[26px] w-[2px] bg-gradient-to-b from-emerald-500 via-teal-400 to-cyan-400 z-0 pointer-events-none" />

                {/* Pickup Location Field */}
                <div className="relative z-30">
                  <div className="absolute left-3.5 top-3.5 w-4 h-4 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <input
                    type="text"
                    value={pickupSearch}
                    onChange={(e) => handlePickupInput(e.target.value)}
                    placeholder="Enter pickup location (e.g. Cyber Towers)..."
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl pl-10 pr-11 py-3 text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition-all placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className="absolute right-3 top-2.5 p-1 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                    title="Use My Current GPS Location"
                  >
                    <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin text-emerald-300' : ''}`} />
                  </button>

                  {/* Dynamic Pickup Places Autocomplete Dropdown */}
                  {pickupSearchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-2 shadow-2xl z-50 space-y-1 max-h-56 overflow-y-auto">
                      {pickupSearchResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => handleSelectPickup(result)}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-800 transition-colors flex items-start gap-2.5 group"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white group-hover:text-emerald-300 truncate">
                              {result.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{result.address}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Swap Addresses Button */}
                <div className="relative z-20 flex justify-end -my-2 pr-3">
                  <button
                    type="button"
                    onClick={handleSwapAddresses}
                    className={`w-7 h-7 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-emerald-400 flex items-center justify-center shadow-lg transition-transform ${
                      isSwapping ? 'rotate-180' : ''
                    }`}
                    title="Swap pickup and destination"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 rotate-90" />
                  </button>
                </div>

                {/* Destination Location Field */}
                <div className="relative z-10">
                  <div className="absolute left-3.5 top-3.5 w-4 h-4 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  </div>
                  <input
                    type="text"
                    value={destinationSearch}
                    onChange={(e) => handleDestinationInput(e.target.value)}
                    placeholder="Where to? (Type any address or landmark)..."
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl pl-10 pr-10 py-3 text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all placeholder:text-slate-500"
                  />

                  {/* Dynamic Places Autocomplete Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-2 shadow-2xl z-50 space-y-1 max-h-56 overflow-y-auto">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => handleSelectPlace(result)}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-800 transition-colors flex items-start gap-2.5 group"
                        >
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                              {result.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{result.address}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Fast Landmark Shortcuts */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  QUICK DESTINATIONS:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {popularPlaces.map((place) => (
                    <button
                      key={place.name}
                      type="button"
                      onClick={() => handleSelectPlace(place)}
                      className="px-2.5 py-1 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300 hover:text-white transition-all flex items-center gap-1"
                    >
                      <MapPin className="w-2.5 h-2.5 text-cyan-400" />
                      <span>{place.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Smart Pickup Point Coordinator */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    SMART PICKUP POINT COORDINATION:
                  </span>
                  <span className="text-slate-400 font-normal lowercase">prevents driver confusion</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {[
                    'Gate 1 Main Security Flagpole',
                    'Metro Station Exit B Footbridge',
                    'Terminal 1 Arrivals Pillar 4',
                    'Mall Valet Drop-off Zone'
                  ].map((pt) => {
                    const isSelected = selectedPickupPoint === pt;
                    return (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => setSelectedPickupPoint(pt)}
                        className={`p-2 rounded-xl text-left font-medium transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold shadow-sm'
                            : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                        }`}
                      >
                        {pt}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  value={specificInstructions}
                  onChange={(e) => setSpecificInstructions(e.target.value)}
                  placeholder="Optional driver note: 'Standing near the flagpole'"
                  className="w-full bg-slate-900 border border-slate-800/80 rounded-xl px-3 py-2 text-[11px] text-slate-300 focus:outline-none focus:border-emerald-400/50"
                />
              </div>

              {/* Airport Flight Sync Box (When Airport Transfer is active) */}
              {tripType === 'AIRPORT_TRANSFER' && (
                <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                    <Plane className="w-3.5 h-3.5" />
                    <span>Airport Transfer: Flight Auto-Sync</span>
                  </div>
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="Enter Flight Number (e.g. 6E 534 / AI 840)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <p className="text-[10px] text-cyan-200">
                    Provides automatic traffic buffer and directs driver directly to designated airline check-in terminal.
                  </p>
                </div>
              )}

              {/* Ride Optimization Criteria */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  OPTIMIZE RIDE FOR:
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
                  {[
                    { id: 'FASTEST', label: '⚡ Fastest' },
                    { id: 'CHEAPEST', label: '💸 Cheapest' },
                    { id: 'SAFEST', label: '🛡️ Safest' },
                    { id: 'GREENEST', label: '🌱 Green EV' },
                    { id: 'COMFORT', label: '✨ Comfort' },
                    { id: 'ACCESSIBILITY', label: '♿ Access' }
                  ].map((pref) => {
                    const isSelected = selectedPreference === pref.id;
                    return (
                      <button
                        key={pref.id}
                        onClick={() => setSelectedPreference(pref.id as any)}
                        className={`py-2 px-1 rounded-xl text-center transition-all ${
                          isSelected
                            ? 'bg-slate-800 text-emerald-400 border border-emerald-500/50 font-bold shadow'
                            : 'bg-slate-950/70 text-slate-400 border border-slate-900 hover:text-white'
                        }`}
                      >
                        {pref.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Multimodal Transit Comparison Card */}
            <div className="glass-panel rounded-3xl p-4 border border-slate-800 text-xs flex items-center justify-between shadow-lg">
              <div className="space-y-0.5">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  Multimodal Journey Planner
                </p>
                <p className="text-[11px] text-slate-400">
                  Save 40% (₹145) by connecting Cab + Hitech Express Metro
                </p>
              </div>
              <button
                onClick={() =>
                  alert(
                    'Multimodal Transit Breakdown:\n• Cab to Metro Stn: ₹85 (6 min)\n• Metro Express: ₹40 (18 min)\n• Final ETA: 24 mins (Save ₹215)'
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
              >
                Compare
              </button>
            </div>

            {/* ONE IS BELOW THE MULTIMODAL JOURNEY PLANNER */}
            {lockedQuote && (
              <div className="pt-1">
                <FareLockBadge
                  fare={lockedQuote.breakdown.totalFare}
                  breakdown={lockedQuote.breakdown}
                  className="w-full min-h-[68px] sm:min-h-[72px]"
                />
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Live Interactive Map & Vehicle Fleets (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Cartographic Map Canvas */}
            <InteractiveMap
              pickupCoords={pickupCoords}
              destinationCoords={destinationCoords}
              pickupName={pickupSearch}
              destinationName={destinationSearch}
              showCorridor={true}
              className="h-80 sm:h-[390px]"
            />

            {/* Available Vehicle Fleets with Transparent Locked Pricing */}
            <div className="space-y-3">
              {/* AI Route & Vehicle Recommendation */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent border border-emerald-500/20 text-xs flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-xs flex items-center gap-1.5">
                    <span>AI Route & Vehicle Recommendation</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-black">
                      OPTIMAL CORRIDOR
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-300 truncate">
                    Expressway adherence 100% • Lowest surge • Recommended: Sedan for fast airport & city connection.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  SELECT VEHICLE TIER (GUARANTEED FARE):
                </span>
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Zero Sudden Surge
                </span>
              </div>

              {/* Vehicle Options Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {quotes.map((q) => {
                  const isSelected = selectedCategory === q.vehicleCategory;
                  return (
                    <button
                      key={q.vehicleCategory}
                      onClick={() => {
                        setSelectedCategory(q.vehicleCategory);
                        setLockedQuote(q);
                      }}
                      className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between relative overflow-hidden group ${
                        isSelected
                          ? 'bg-gradient-to-b from-emerald-500/15 to-slate-900/90 border-emerald-400 text-white shadow-xl shadow-emerald-500/15 ring-1 ring-emerald-400'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900/90'
                      }`}
                    >
                      {/* Top Row: Vehicle Name & Eco Badge */}
                      <div className="flex items-center justify-between w-full">
                        <span className="font-extrabold text-xs text-white">{q.vehicleName}</span>
                        {q.co2AvoidedKg > 0 ? (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/30">
                            ZERO EMISSIONS
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Users className="w-2.5 h-2.5" />
                            {q.capacity || 4}
                          </span>
                        )}
                      </div>

                      {/* Middle: Price in Large Typography */}
                      <div className="mt-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black font-mono tracking-tight text-white">
                            {formatCurrencyINR(q.breakdown.totalFare)}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {q.durationMin} mins away • Direct route
                        </p>
                      </div>

                      {/* Selection Checkmark Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AND ANOTHER IS SIDE OF THIS (Below Vehicle Selection in Right Column) */}
            {lockedQuote && (
              <div className="pt-2">
                <button
                  onClick={handleLockAndBook}
                  className="w-full min-h-[68px] sm:min-h-[72px] px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 shadow-xl shadow-emerald-500/25 flex items-center justify-between gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-emerald-300/50 group relative overflow-hidden text-left"
                >
                  {/* Left: Icon + Title + Subtitle */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-950/20 text-slate-950 flex items-center justify-center font-black shadow-sm shrink-0">
                      <Lock className="w-5 h-5 stroke-[2.8]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-black tracking-tight uppercase text-slate-950 block truncate">
                        LOCK FARE & CONFIRM BOOKING
                      </span>
                      <span className="text-[11px] text-slate-900/90 font-bold block truncate mt-0.5">
                        Instant Match • 4-Digit Security PIN
                      </span>
                    </div>
                  </div>

                  {/* Right: Fare Price + Action Arrow */}
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-950 bg-slate-950/15 px-3 py-1 rounded-xl leading-none">
                      ({formatCurrencyINR(lockedQuote.breakdown.totalFare)})
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-slate-950/15 flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
                      <ChevronRight className="w-5 h-5 text-slate-950 stroke-[3]" />
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
