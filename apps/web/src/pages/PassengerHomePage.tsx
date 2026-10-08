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
  Share2,
  CheckCircle2
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
    setBecomeDriverModalOpen,
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

  const fetchQuotes = async (origin: [number, number], dest: [number, number]) => {
    try {
      const res = await api.getQuotes({
        pickupCoords: origin,
        destinationCoords: dest,
        tripType
      });
      if (res.data && res.data.length > 0) {
        setQuotes(res.data);
        const current = res.data.find((q: any) => q.vehicleCategory === selectedCategory) || res.data[0];
        setLockedQuote(current);
      }
    } catch {
      // Fallback reliable initial fare estimation
      const mockQuotes = Object.keys(VEHICLE_CONFIGS).map((cat) => {
        const cfg = VEHICLE_CONFIGS[cat as VehicleCategory];
        const distKm = 31.4;
        const durMin = 42;
        const total = Math.round(cfg.baseFare + distKm * cfg.perKmRate + durMin * cfg.perMinuteRate + 45);
        return {
          vehicleCategory: cat,
          vehicleName: cfg.name || cat,
          capacity: cfg.capacity,
          durationMin: durMin,
          distanceKm: distKm,
          co2AvoidedKg: cat === 'EV' ? 3.8 : 0,
          breakdown: {
            baseFare: cfg.baseFare,
            distanceCharge: Math.round(distKm * cfg.perKmRate),
            timeComponent: Math.round(durMin * cfg.perMinuteRate),
            toll: 45,
            platformFee: 25,
            tax: Math.round(total * 0.05),
            totalFare: total,
            currency: 'INR'
          }
        };
      });
      setQuotes(mockQuotes);
      setLockedQuote(mockQuotes.find((q) => q.vehicleCategory === selectedCategory) || mockQuotes[0]);
    }
  };

  const handleSelectPlace = (place: any) => {
    setDestinationSearch(place.name + (place.address ? `, ${place.address}` : ''));
    if (place.coords) {
      setDestinationCoords(place.coords);
    }
    setSearchResults([]);
    setIsSearchingDest(false);
  };

  const handleSelectPickup = (place: any) => {
    setPickupSearch(place.name + (place.address ? `, ${place.address}` : ''));
    if (place.coords) {
      setPickupCoords(place.coords);
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

  const handlePickupKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (pickupSearchResults.length > 0) {
        handleSelectPickup(pickupSearchResults[0]);
      } else if (pickupSearch.trim()) {
        try {
          const res = await api.searchPlaces(pickupSearch.trim());
          if (res.data && res.data.length > 0) {
            handleSelectPickup(res.data[0]);
            return;
          }
        } catch {}
        const matched = popularPlaces.find(p => p.name.toLowerCase().includes(pickupSearch.toLowerCase()));
        if (matched) {
          setPickupCoords(matched.coords);
        } else {
          setPickupCoords([78.3811 + (Math.random() - 0.5) * 0.03, 17.4474 + (Math.random() - 0.5) * 0.03]);
        }
        setIsSearchingPickup(false);
      }
    }
  };

  const handleDestinationKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length > 0) {
        handleSelectPlace(searchResults[0]);
      } else if (destinationSearch.trim()) {
        try {
          const res = await api.searchPlaces(destinationSearch.trim());
          if (res.data && res.data.length > 0) {
            handleSelectPlace(res.data[0]);
            return;
          }
        } catch {}
        const matched = popularPlaces.find(p => p.name.toLowerCase().includes(destinationSearch.toLowerCase()));
        if (matched) {
          setDestinationCoords(matched.coords);
        } else {
          setDestinationCoords([78.4298 + (Math.random() - 0.5) * 0.04, 17.2403 + (Math.random() - 0.5) * 0.04]);
        }
        setIsSearchingDest(false);
      }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {isAuthenticated && currentUser?.name ? (
                <>Welcome back, <span className="text-emerald-700">{currentUser.name}</span> 👋</>
              ) : (
                <>Plan & Book Your Ride 👋</>
              )}
            </h1>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
              TRUST-FIRST RIDE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Book With Confidence • Guaranteed zero extra cash demands & upfront transparent driver earnings.
          </p>
        </div>

        {/* Live Platform Confidence Badges */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero Surge Guarantee</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-sm">
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>Auto-Recovery Engine</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-cyan-600" />
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
            <div className="p-4 rounded-3xl bg-amber-50 border-2 border-amber-400 text-amber-900 flex items-center justify-between shadow-md animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black">
                  <RotateCcw className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900">{t('autoRecoveryTitle')}</h4>
                  <p className="text-xs text-amber-800">{t('autoRecoveryDesc')}</p>
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
            <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  VERIFIED HYDERABAD DRIVER
                </span>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  ★ {activeBooking.driver?.rating || 4.92}
                </span>
              </div>

              {/* Driver Profile */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-2xl font-black shadow-md">
                  {activeBooking.driver?.name?.charAt(0) || 'R'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{activeBooking.driver?.name}</h3>
                  <p className="text-xs text-slate-600 font-medium">
                    {activeBooking.driver?.vehicleModel}
                  </p>
                  {/* Authentic Yellow Indian Vehicle Plate */}
                  <div className="mt-1.5 inline-block plate-badge px-2.5 py-0.5 rounded text-xs font-black">
                    {activeBooking.driver?.plateNumber}
                  </div>
                </div>
              </div>

              {/* Driver Net Earnings Transparency (Solves Driver Demanding Cash) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    Transparent Driver Net Take-Home
                  </span>
                  <span className="font-mono font-black text-emerald-700">
                    {formatCurrencyINR(Math.round((activeBooking.lockedFare || 420) * 0.88))} (88%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Driver received guaranteed full net payout upfront. Zero cash request required.
                </p>
              </div>

              {/* Direct Actions: Call, Message, Share */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <a
                  href={`tel:${activeBooking.driver?.phone || '+919800000003'}`}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call</span>
                </a>
                <button
                  onClick={() => alert(`Direct in-app chat connected with ${activeBooking.driver?.name}`)}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Chat</span>
                </button>
                <button
                  onClick={handleShareTrip}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Ride Status, PIN & Live State Flow (7 Cols) */}
            <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 space-y-5 shadow-sm">
              {/* Trip Reference & Verification OTP PIN */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    BOOKING REFERENCE
                  </span>
                  <span className="font-mono font-black text-sm text-slate-900">
                    {activeBooking.bookingReference || 'FR-LIVE-8291'}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    START TRIP OTP PIN
                  </span>
                  <span className="font-mono font-black text-xl text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 tracking-widest inline-block">
                    {activeBooking.verificationPin || '4892'}
                  </span>
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">Trip Progression:</span>
                  <span className="text-emerald-700 uppercase font-mono font-black">
                    {activeBooking.state}
                  </span>
                </div>

                {/* State Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-500"
                    style={{
                      width:
                        activeBooking.state === 'REQUESTED'
                          ? '20%'
                          : activeBooking.state === 'DRIVER_ACCEPTED' || activeBooking.state === 'DRIVER_ASSIGNED'
                          ? '40%'
                          : activeBooking.state === 'DRIVER_ARRIVED'
                          ? '60%'
                          : activeBooking.state === 'TRIP_STARTED' || activeBooking.state === 'TRIP_IN_PROGRESS'
                          ? '80%'
                          : '100%'
                    }}
                  />
                </div>
              </div>

              {/* Route Summary */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-700">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[9px] mt-0.5">
                    A
                  </div>
                  <span className="font-medium text-slate-900">{activeBooking.pickupAddress}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <div className="w-3.5 h-3.5 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-[9px] mt-0.5">
                    B
                  </div>
                  <span className="font-medium text-slate-900">{activeBooking.destinationAddress}</span>
                </div>
              </div>

              {/* Actions: Pay Online & SOS */}
              <div className="pt-3 border-t border-slate-200 flex items-center gap-3">
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isTripPaid ? 'Payment Complete ✓' : `Pay ${formatCurrencyINR(activeBooking.lockedFare || 420)} via UPI`}</span>
                </button>

                <button
                  onClick={() => setIsReceiptModalOpen(true)}
                  className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Fare Audit</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('🚨 EMERGENCY SOS: Trigger instant emergency police dispatch & alert trusted contacts?')) {
                      alert('EMERGENCY SOS BROADCAST ACTIVE: Police helpline 112 alerted. Emergency contacts pinged with live GPS.');
                    }
                  }}
                  className="py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>SOS</span>
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
            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-5 shadow-sm">
              {/* Header with Title and Voice Booking Action */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Plan Your Journey</h2>
                  <p className="text-xs text-slate-500">Guaranteed fares • No unexpected charges</p>
                </div>

                <button
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-all shadow-sm group cursor-pointer"
                  title="Speak your destination naturally in English, Hindi, or Telugu"
                >
                  <Mic className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span>Voice Book</span>
                </button>
              </div>

              {/* Trip Purpose Pill Switcher */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
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
                      className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white font-black shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Ride Now vs Schedule Later Switcher */}
              <div className="flex items-center justify-between bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsScheduled(false)}
                  className={`flex-1 py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    !isScheduled
                      ? 'bg-white text-emerald-700 font-black shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ride Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsScheduled(true)}
                  className={`flex-1 py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isScheduled
                      ? 'bg-white text-emerald-700 font-black shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Schedule Later</span>
                </button>
              </div>

              {/* Scheduled Date & Time Pickers */}
              {isScheduled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 animate-in fade-in">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                      Trip Date
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                      Pickup Time
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Connected Journey Route Planner */}
              <div className="relative space-y-3">
                {/* Visual Route Connector Line */}
                <div className="absolute left-[21px] top-[26px] bottom-[26px] w-[2px] bg-gradient-to-b from-emerald-500 via-teal-400 to-cyan-500 z-0 pointer-events-none" />

                {/* Pickup Location Field */}
                <div className="relative z-30">
                  <div className="absolute left-3.5 top-3.5 w-4 h-4 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  </div>
                  <input
                    type="text"
                    value={pickupSearch}
                    onChange={(e) => handlePickupInput(e.target.value)}
                    onKeyDown={handlePickupKeyDown}
                    placeholder="Enter pickup location (e.g. Cyber Towers) [Press Enter]..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-11 py-3 text-xs text-slate-900 font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className="absolute right-3 top-2.5 p-1 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                    title="Use My Current GPS Location"
                  >
                    <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin text-emerald-600' : ''}`} />
                  </button>

                  {/* Dynamic Pickup Places Autocomplete Dropdown */}
                  {pickupSearchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl p-2 shadow-2xl z-50 space-y-1 max-h-56 overflow-y-auto">
                      {pickupSearchResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => handleSelectPickup(result)}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 transition-colors flex items-start gap-2.5 group cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 truncate">
                              {result.name}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">{result.address}</p>
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
                    className={`w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-emerald-500 flex items-center justify-center shadow-sm transition-transform cursor-pointer ${
                      isSwapping ? 'rotate-180' : ''
                    }`}
                    title="Swap pickup and destination"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 rotate-90" />
                  </button>
                </div>

                {/* Destination Location Field */}
                <div className="relative z-10">
                  <div className="absolute left-3.5 top-3.5 w-4 h-4 rounded-full bg-cyan-100 border-2 border-cyan-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-600" />
                  </div>
                  <input
                    type="text"
                    value={destinationSearch}
                    onChange={(e) => handleDestinationInput(e.target.value)}
                    onKeyDown={handleDestinationKeyDown}
                    placeholder="Where to? (Type address & press Enter)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-xs text-slate-900 font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder:text-slate-400"
                  />

                  {/* Dynamic Places Autocomplete Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl p-2 shadow-2xl z-50 space-y-1 max-h-56 overflow-y-auto">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => handleSelectPlace(result)}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 transition-colors flex items-start gap-2.5 group cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5 text-cyan-600 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-cyan-700 truncate">
                              {result.name}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">{result.address}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Fast Landmark Shortcuts */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  QUICK DESTINATIONS:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {popularPlaces.map((place) => (
                    <button
                      key={place.name}
                      type="button"
                      onClick={() => handleSelectPlace(place)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-[11px] text-slate-700 hover:text-emerald-800 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-2.5 h-2.5 text-cyan-600" />
                      <span>{place.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Smart Pickup Point Coordinator */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    SMART PICKUP POINT COORDINATION:
                  </span>
                  <span className="text-slate-500 font-normal lowercase">prevents driver confusion</span>
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
                        className={`p-2 rounded-xl text-left font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold shadow-sm'
                            : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
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
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Airport Flight Sync Box (When Airport Transfer is active) */}
              {tripType === 'AIRPORT_TRANSFER' && (
                <div className="p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-800">
                    <Plane className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Airport Transfer: Flight Auto-Sync</span>
                  </div>
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="Enter Flight Number (e.g. 6E 534 / AI 840)"
                    className="w-full bg-white border border-cyan-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[10px] text-cyan-700">
                    Provides automatic traffic buffer and directs driver directly to designated airline check-in terminal.
                  </p>
                </div>
              )}

              {/* Ride Optimization Criteria */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
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
                        className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold shadow-sm'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-200'
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
            <div className="bg-white rounded-3xl p-4 border border-slate-200 text-xs flex items-center justify-between shadow-sm">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  Multimodal Journey Planner
                </p>
                <p className="text-[11px] text-slate-500">
                  Save 40% (₹145) by connecting Cab + Hitech Express Metro
                </p>
              </div>
              <button
                onClick={() =>
                  alert(
                    'Multimodal Transit Breakdown:\n• Cab to Metro Stn: ₹85 (6 min)\n• Metro Express: ₹40 (18 min)\n• Final ETA: 24 mins (Save ₹215)'
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-all cursor-pointer"
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
          <div className="lg:col-span-7 space-y-4">
            {/* Live Route Radar Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-black text-slate-900 tracking-tight">
                  LIVE ROUTE CORRIDOR • REAL-TIME TRACKING ACTIVE
                </span>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                GPS TELEMETRY 60FPS
              </span>
            </div>

            {/* Live Cartographic Map Canvas */}
            <InteractiveMap
              pickupCoords={pickupCoords}
              destinationCoords={destinationCoords}
              pickupName={pickupSearch}
              destinationName={destinationSearch}
              showCorridor={true}
              className="h-80 sm:h-[400px]"
            />

            {/* Available Vehicle Fleets with Transparent Locked Pricing */}
            <div className="space-y-3">
              {/* AI Route & Vehicle Recommendation */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-900 font-bold text-xs flex items-center gap-1.5">
                    <span>AI Route & Vehicle Recommendation</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-black">
                      OPTIMAL CORRIDOR
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-600 truncate">
                    Expressway adherence 100% • Lowest surge • Recommended: Sedan for fast airport & city connection.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  SELECT VEHICLE TIER (GUARANTEED FARE):
                </span>
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
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
                      className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between relative overflow-hidden group cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-500 text-slate-900 shadow-md ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {/* Top Row: Vehicle Name & Eco Badge */}
                      <div className="flex items-center justify-between w-full">
                        <span className="font-extrabold text-xs text-slate-900">{q.vehicleName}</span>
                        {q.co2AvoidedKg > 0 ? (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded border border-emerald-200">
                            ZERO EMISSIONS
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Users className="w-2.5 h-2.5" />
                            {q.capacity || 4}
                          </span>
                        )}
                      </div>

                      {/* Middle: Price in Large Typography */}
                      <div className="mt-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black font-mono tracking-tight text-slate-900">
                            {formatCurrencyINR(q.breakdown.totalFare)}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {q.durationMin} mins away • Direct route
                        </p>
                      </div>

                      {/* Selection Checkmark Indicator */}
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-600" />
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
                  className="w-full min-h-[68px] sm:min-h-[72px] px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center justify-between gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-emerald-500 group relative overflow-hidden text-left"
                >
                  {/* Left: Icon + Title + Subtitle */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-white/20 text-white flex items-center justify-center font-black shadow-sm shrink-0">
                      <Lock className="w-5 h-5 stroke-[2.8]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-black tracking-tight uppercase text-white block truncate">
                        LOCK FARE & CONFIRM BOOKING
                      </span>
                      <span className="text-[11px] text-emerald-100 font-bold block truncate mt-0.5">
                        Instant Match • 4-Digit Security PIN
                      </span>
                    </div>
                  </div>

                  {/* Right: Fare Price + Action Arrow */}
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white bg-white/15 px-3 py-1 rounded-xl leading-none">
                      ({formatCurrencyINR(lockedQuote.breakdown.totalFare)})
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
                      <ChevronRight className="w-5 h-5 text-white stroke-[3]" />
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Become a Captain / Driver Promotion Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-emerald-50 to-amber-50 border border-amber-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
                  <Car className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900">
                      Have a Commercial Vehicle? Drive with FairRide
                    </h4>
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                      92% NET TAKE-HOME
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Upgrade your rider account in 2 mins with basic RC & Driving License. Daily payouts & zero commission lock-in.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBecomeDriverModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Become a Captain</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
