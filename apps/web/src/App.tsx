import React, { useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { Navbar } from './components/Navbar';
import { DemoSimulationModal } from './components/DemoSimulationModal';
import { AuthModal } from './components/AuthModal';
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
  const [passengerSubTab, setPassengerSubTab] = useState<'BOOK' | 'TRIPS' | 'WALLET' | 'SAFETY' | 'LANDING'>('LANDING');
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
  const [isSimControlsOpen, setIsSimControlsOpen] = useState(true);

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
  const isLanding = activeRoleView === 'PASSENGER' && passengerSubTab === 'LANDING';

  return (
    <div className={`min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans transition-colors duration-200 ${seniorMode ? 'senior-mode' : ''} ${lowInternetMode ? 'low-internet' : ''}`}>
      {/* Top Universal Navbar */}
      <Navbar isLandingPage={isLanding} onNavigateToBook={() => setPassengerSubTab('BOOK')} />

      {/* Top Passenger Ribbon & Centered DEMO SIMULATION CONTROLLER (ONE-CLICK TESTING) - ONLY in App views */}
      {activeRoleView === 'PASSENGER' && !isLanding && (
        <div className="bg-white border-b border-slate-200 px-4 py-2.5 shadow-sm sticky top-16 z-40 transition-all">
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-2.5">
            {/* Top Row: Centered Navigation Tabs + Controller Button beside Explore FairRide */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
              <button
                onClick={() => setPassengerSubTab('BOOK')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  passengerSubTab === 'BOOK'
                    ? 'bg-emerald-600 text-white font-black shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Book Ride</span>
              </button>

              <button
                onClick={() => setPassengerSubTab('TRIPS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  passengerSubTab === 'TRIPS'
                    ? 'bg-emerald-600 text-white font-black shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>My Trips</span>
              </button>

              <button
                onClick={() => setPassengerSubTab('WALLET')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  passengerSubTab === 'WALLET'
                    ? 'bg-emerald-600 text-white font-black shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Wallet & FairPoints</span>
              </button>

              <button
                onClick={() => setPassengerSubTab('SAFETY')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  passengerSubTab === 'SAFETY'
                    ? 'bg-rose-600 text-white font-black shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Safety Center</span>
              </button>

              <button
                onClick={() => setPassengerSubTab('LANDING')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  passengerSubTab === 'LANDING'
                    ? 'bg-slate-800 text-white font-black shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Explore FairRide</span>
              </button>

              {/* DEMO SIMULATION CONTROLLER (ONE-CLICK TESTING) beside Explore FairRide */}
              <button
                onClick={() => setIsSimControlsOpen(!isSimControlsOpen)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 border shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  isSimControlsOpen
                    ? 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-300/50'
                    : 'bg-amber-50/60 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
                title="Toggle Demo Simulation Controller (One-Click Testing) at the Top"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span className="tracking-wide uppercase font-black">
                  DEMO SIMULATION CONTROLLER (ONE-CLICK TESTING)
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono border border-amber-200 font-bold">
                  {currentBookingState}
                </span>
                {isSimControlsOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-amber-700" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-amber-700" />
                )}
              </button>
            </div>

            {/* Top One-Click Testing Strip (Rendered directly at the top) */}
            {isSimControlsOpen && (
              <div className="w-full max-w-5xl p-2.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner flex items-center justify-center gap-1.5 flex-wrap">
                {/* Step 1 */}
                <button
                  onClick={handleSimulateRequest}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                    activeBooking?.state === 'REQUESTED'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                      : 'bg-white hover:bg-blue-50 text-slate-700 border-slate-200'
                  }`}
                  title="1. Lock Fare & Request Ride (₹617)"
                >
                  <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                  <span>1. Request Ride</span>
                  <span className="text-[10px] font-normal hidden sm:inline">(₹617)</span>
                </button>

                {/* Step 2 */}
                <button
                  onClick={handleSimulateDriverAccept}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                    activeBooking?.state === 'DRIVER_ACCEPTED'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                      : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200'
                  }`}
                  title="2. Driver Rajesh Accepts (3m ETA)"
                >
                  <Car className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2. Driver Accepts</span>
                  <span className="text-[10px] font-normal hidden sm:inline">Rajesh (3m)</span>
                </button>

                {/* Step 3 */}
                <button
                  onClick={handleSimulateDriverCancelAndAutoRecovery}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                    activeBooking?.state === 'RECOVERY' || activeBooking?.isRecovered
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-200'
                  }`}
                  title="3. Auto-Recovery Engine: Driver cancels -> Instant zero-penalty reassignment"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>3. Auto-Recovery</span>
                  <span className="text-[10px] font-normal hidden sm:inline">Zero Penalty</span>
                </button>

                {/* Step 4 */}
                <button
                  onClick={handleSimulateRouteDeviation}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                    activeBooking?.routeDeviationFlagged
                      ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                      : 'bg-white hover:bg-rose-50 text-slate-700 border-slate-200'
                  }`}
                  title="4. Trigger Route Guardian Detour Alert"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>4. Detour / SOS</span>
                </button>

                {/* Step 5 */}
                <button
                  onClick={handleSimulateCompleteTrip}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                    activeBooking?.state === 'TRIP_COMPLETED'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                      : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200'
                  }`}
                  title="5. Finish Trip & Generate Zero-Hidden-Fee Fare Audit Receipt"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>5. Finish Trip</span>
                </button>

                {/* Reset button */}
                {activeBooking && (
                  <button
                    onClick={handleResetSimulation}
                    className="px-2 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                    title="Reset Active Booking Simulation"
                  >
                    <RotateCw className="w-3 h-3 text-slate-500" />
                    <span>Reset</span>
                  </button>
                )}

                {/* Full Advanced Modal */}
                <button
                  onClick={() => setIsSimulationModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                  title="Open Full Demo Simulation Modal with Custom Parameters"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>More Scenarios...</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-10">
        {activeRoleView === 'PASSENGER' ? (
          passengerSubTab === 'BOOK' ? (
            <PassengerHomePage />
          ) : passengerSubTab === 'TRIPS' ? (
            <PassengerTripsPage />
          ) : passengerSubTab === 'WALLET' ? (
            <WalletPage />
          ) : passengerSubTab === 'SAFETY' ? (
            <SafetyCenterPage />
          ) : (
            <LandingPage onBookRide={() => setPassengerSubTab('BOOK')} />
          )
        ) : activeRoleView === 'DRIVER' ? (
          <DriverDashboardPage />
        ) : activeRoleView === 'ADMIN' ? (
          <AdminDashboardPage />
        ) : (
          <CorporatePortalPage />
        )}
      </main>

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
