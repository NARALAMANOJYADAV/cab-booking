import React, { useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { Navbar } from './components/Navbar';
import { DemoSimulationModal } from './components/DemoSimulationModal';
import { AuthModal } from './components/AuthModal';
import { PortalAccessModal } from './components/PortalAccessModal';
import { LandingPage } from './pages/LandingPage';
import { PassengerHomePage } from './pages/PassengerHomePage';
import { DriverDashboardPage } from './pages/DriverDashboardPage';
import { DriverOnboardingPage } from './pages/DriverOnboardingPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CorporatePortalPage } from './pages/CorporatePortalPage';
import { PassengerTripsPage } from './pages/PassengerTripsPage';
import { WalletPage } from './pages/WalletPage';
import { SafetyCenterPage } from './pages/SafetyCenterPage';
import {
  Compass,
  History,
  Wallet,
  ShieldCheck,
  Home,
  Zap,
  Play,
  Car,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Sparkles
} from 'lucide-react';

export const App: React.FC = () => {
  const {
    activeRoleView,
    lowInternetMode,
    seniorMode,
    activeBooking,
    setActiveBooking,
    isAuthModalOpen,
    setAuthModalOpen
  } = useAppStore();
  const [passengerSubTab, setPassengerSubTab] = useState<'BOOK' | 'TRIPS' | 'WALLET' | 'SAFETY' | 'LANDING'>('BOOK');
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
  const [isSimControlsOpen, setIsSimControlsOpen] = useState(true);
  const [isDriverOnboardingOpen, setIsDriverOnboardingOpen] = useState(false);
  const [portalModalTarget, setPortalModalTarget] = useState<'DRIVER' | 'CORPORATE' | 'ADMIN' | null>(null);

  // One-click demo simulation actions
  const handleSimulateRequest = () => {
    setActiveBooking({
      bookingId: 'book_demo_live_01',
      bookingReference: 'FR-LIVE-8291',
      state: 'REQUESTED',
      pickupAddress: 'Cyber Towers (Gate 1 Main Entrance)',
      destinationAddress: 'RGIA Airport (Terminal 1 Pillar 6)',
      pickupCoords: [78.3811, 17.4474],
      destinationCoords: [78.4298, 17.2403],
      pickupPointType: 'GATE',
      specificInstructions: 'Meet driver at Gate 1 near security kiosk',
      vehicleCategory: 'SEDAN',
      lockedFare: 617,
      verificationPin: '4892',
      timeline: [
        { event: 'BOOKING_CREATED', actor: 'PASSENGER', timestamp: new Date().toLocaleTimeString() },
        { event: 'FARE_LOCKED', actor: 'SYSTEM', timestamp: new Date().toLocaleTimeString() }
      ]
    });
  };

  const handleSimulateDriverAccept = () => {
    if (!activeBooking) handleSimulateRequest();
    setActiveBooking({
      state: 'DRIVER_ACCEPTED',
      driver: {
        id: 'drv_demo_rajesh',
        name: 'Rajesh Kumar',
        phone: '+91 9800000003',
        rating: 4.88,
        vehicleModel: 'Hyundai Aura (White)',
        plateNumber: 'TS07UB1420',
        currentCoords: [78.3840, 17.4490],
        etaMinutes: 3
      },
      timeline: [
        ...(activeBooking?.timeline || []),
        { event: 'DRIVER_ACCEPTED', actor: 'DRIVER', timestamp: new Date().toLocaleTimeString() }
      ]
    });
  };

  const handleSimulateDriverCancelAndAutoRecovery = () => {
    setActiveBooking({
      state: 'RECOVERY',
      isRecovered: true,
      timeline: [
        ...(activeBooking?.timeline || []),
        { event: 'DRIVER_CANCELLED', actor: 'DRIVER', timestamp: new Date().toLocaleTimeString() },
        { event: 'AUTO_RECOVERY_SEARCHING', actor: 'SYSTEM', timestamp: new Date().toLocaleTimeString() }
      ]
    });

    setTimeout(() => {
      setActiveBooking({
        state: 'DRIVER_ASSIGNED',
        isRecovered: true,
        driver: {
          id: 'drv_demo_venkatesh',
          name: 'Venkatesh Babu (Auto-Recovered)',
          phone: '+91 9600000012',
          rating: 4.92,
          vehicleModel: 'Maruti Suzuki Swift Dzire (Silver)',
          plateNumber: 'TS08AB8811',
          currentCoords: [78.3820, 17.4450],
          etaMinutes: 2
        },
        timeline: [
          ...(activeBooking?.timeline || []),
          { event: 'AUTO_RECOVERY_SUCCESS', actor: 'SYSTEM', timestamp: new Date().toLocaleTimeString() }
        ]
      });
    }, 1500);
  };

  const handleSimulateRouteDeviation = () => {
    setActiveBooking({
      state: 'TRIP_IN_PROGRESS',
      routeDeviationFlagged: true
    });
  };

  const handleSimulateCompleteTrip = () => {
    setActiveBooking({
      state: 'TRIP_COMPLETED',
      finalFare: 617,
      timeline: [
        ...(activeBooking?.timeline || []),
        { event: 'TRIP_COMPLETED', actor: 'DRIVER', timestamp: new Date().toLocaleTimeString() }
      ]
    });
  };

  const handleResetSimulation = () => {
    setActiveBooking(null);
  };

  const currentBookingState = activeBooking?.state || 'IDLE';

  return (
    <div className={`min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans ${seniorMode ? 'senior-mode' : ''} ${lowInternetMode ? 'low-internet' : ''}`}>
      {/* Top Universal Navbar */}
      <Navbar
        onOpenPortalModal={(portal) => setPortalModalTarget(portal)}
        onOpenDriverOnboarding={() => setIsDriverOnboardingOpen(true)}
      />

      {/* Top Passenger Ribbon & Centered DEMO SIMULATION CONTROLLER (ONE-CLICK TESTING) */}
      {!isDriverOnboardingOpen && activeRoleView === 'PASSENGER' && (
        <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2.5 backdrop-blur-md sticky top-16 z-40 transition-all">
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-2.5">
            {/* Top Row: Centered Navigation Tabs + Controller Button beside Explore FairRide */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
              <button
                onClick={() => setPassengerSubTab('BOOK')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  passengerSubTab === 'BOOK'
                    ? 'bg-brand-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Book Ride</span>
              </button>

              <button
                onClick={() => setPassengerSubTab('TRIPS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  passengerSubTab === 'TRIPS'
                    ? 'bg-brand-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>My Trips</span>
              </button>

              <button
                onClick={() => setPassengerSubTab('WALLET')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  passengerSubTab === 'WALLET'
                    ? 'bg-brand-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Wallet & FairPoints</span>
              </button>

              <button
                onClick={() => setPassengerSubTab('SAFETY')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  passengerSubTab === 'SAFETY'
                    ? 'bg-rose-500 text-white font-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Safety Center</span>
              </button>

              <button
                onClick={() => setPassengerSubTab('LANDING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  passengerSubTab === 'LANDING'
                    ? 'bg-slate-700 text-white font-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Explore FairRide</span>
              </button>

              {/* DEMO SIMULATION CONTROLLER (ONE-CLICK TESTING) beside Explore FairRide */}
              <button
                onClick={() => setIsSimControlsOpen(!isSimControlsOpen)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 border shadow-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  isSimControlsOpen
                    ? 'bg-gradient-to-r from-amber-500/25 via-brand-500/25 to-emerald-500/25 text-amber-300 border-amber-400 ring-2 ring-amber-400/40 shadow-amber-500/20'
                    : 'bg-gradient-to-r from-amber-500/15 via-brand-500/15 to-emerald-500/15 text-amber-300 border-amber-500/40 ring-1 ring-amber-400/20 hover:from-amber-500/30'
                }`}
                title="Toggle Demo Simulation Controller (One-Click Testing) at the Top"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="tracking-wide uppercase font-black">
                  DEMO SIMULATION CONTROLLER (ONE-CLICK TESTING)
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                  {currentBookingState}
                </span>
                {isSimControlsOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                )}
              </button>
            </div>

            {/* Top One-Click Testing Strip (Rendered directly at the top) */}
            {isSimControlsOpen && (
              <div className="w-full max-w-5xl p-2 rounded-2xl bg-slate-900/95 border border-amber-500/30 backdrop-blur-xl shadow-xl flex items-center justify-center gap-1.5 flex-wrap">
                {/* Step 1 */}
                <button
                  onClick={handleSimulateRequest}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                    activeBooking?.state === 'REQUESTED'
                      ? 'bg-blue-500/25 text-blue-200 border-blue-400 ring-1 ring-blue-400'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700/80'
                  }`}
                  title="1. Lock Fare & Request Ride (₹617)"
                >
                  <Play className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                  <span>1. Request Ride</span>
                  <span className="text-[10px] text-blue-300/80 font-normal hidden sm:inline">(₹617)</span>
                </button>

                {/* Step 2 */}
                <button
                  onClick={handleSimulateDriverAccept}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                    activeBooking?.state === 'DRIVER_ACCEPTED'
                      ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400 ring-1 ring-emerald-400'
                      : 'bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 border-emerald-800/50'
                  }`}
                  title="2. Driver Rajesh Accepts (3m ETA)"
                >
                  <Car className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2. Driver Accepts</span>
                  <span className="text-[10px] text-emerald-400/80 font-normal hidden sm:inline">Rajesh (3m)</span>
                </button>

                {/* Step 3 */}
                <button
                  onClick={handleSimulateDriverCancelAndAutoRecovery}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                    activeBooking?.state === 'RECOVERY' || activeBooking?.isRecovered
                      ? 'bg-amber-500/25 text-amber-200 border-amber-400 ring-1 ring-amber-400'
                      : 'bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 border-amber-800/50'
                  }`}
                  title="3. Auto-Recovery Engine: Driver cancels -> Instant zero-penalty reassignment"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>3. Auto-Recovery</span>
                  <span className="text-[10px] text-amber-400/80 font-normal hidden sm:inline">Zero Penalty</span>
                </button>

                {/* Step 4 */}
                <button
                  onClick={handleSimulateRouteDeviation}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                    activeBooking?.routeDeviationFlagged
                      ? 'bg-rose-500/25 text-rose-200 border-rose-400 ring-1 ring-rose-400'
                      : 'bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border-rose-800/50'
                  }`}
                  title="4. Trigger Route Guardian Detour Alert"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>4. Detour / SOS</span>
                </button>

                {/* Step 5 */}
                <button
                  onClick={handleSimulateCompleteTrip}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                    activeBooking?.state === 'TRIP_COMPLETED'
                      ? 'bg-brand-500/30 text-brand-200 border-brand-400 ring-1 ring-brand-400'
                      : 'bg-brand-950/30 hover:bg-brand-900/40 text-brand-300 border-brand-800/50'
                  }`}
                  title="5. Finish Trip & Generate Zero-Hidden-Fee Fare Audit Receipt"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-brand-400" />
                  <span>5. Finish Trip</span>
                </button>

                {/* Reset button */}
                {activeBooking && (
                  <button
                    onClick={handleResetSimulation}
                    className="px-2 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                    title="Reset Active Booking Simulation"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}

                {/* Full Advanced Modal */}
                <button
                  onClick={() => setIsSimulationModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
                  title="Open Full Demo Simulation Modal with Custom Parameters"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>More Scenarios...</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-10">
        {isDriverOnboardingOpen ? (
          <DriverOnboardingPage
            onSuccessRedirect={() => setIsDriverOnboardingOpen(false)}
            onBackToPassenger={() => setIsDriverOnboardingOpen(false)}
          />
        ) : activeRoleView === 'PASSENGER' ? (
          passengerSubTab === 'BOOK' ? (
            <PassengerHomePage />
          ) : passengerSubTab === 'TRIPS' ? (
            <PassengerTripsPage />
          ) : passengerSubTab === 'WALLET' ? (
            <WalletPage />
          ) : passengerSubTab === 'SAFETY' ? (
            <SafetyCenterPage />
          ) : (
            <LandingPage />
          )
        ) : activeRoleView === 'DRIVER' ? (
          <DriverDashboardPage />
        ) : activeRoleView === 'ADMIN' ? (
          <AdminDashboardPage />
        ) : (
          <CorporatePortalPage />
        )}
      </main>

      {/* Restricted Portal Access Security Code Gate Modal */}
      <PortalAccessModal
        isOpen={portalModalTarget !== null}
        targetPortal={portalModalTarget}
        onClose={() => setPortalModalTarget(null)}
        onNavigateToOnboarding={() => {
          setPortalModalTarget(null);
          setIsDriverOnboardingOpen(true);
        }}
      />

      {/* Full Demo Simulation Controller Modal */}
      <DemoSimulationModal
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
      />

      {/* FairRide Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export default App;
