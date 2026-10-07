import React, { useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { BecomeDriverModal } from './components/BecomeDriverModal';
import { InstallAppModal } from './components/InstallAppModal';
import { MobileInstallBanner } from './components/MobileInstallBanner';
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
  Home
} from 'lucide-react';

export const App: React.FC = () => {
  const {
    activeRoleView,
    lowInternetMode,
    seniorMode,
    isAuthModalOpen,
    setAuthModalOpen,
    isBecomeDriverModalOpen,
    setBecomeDriverModalOpen
  } = useAppStore();
  const [passengerSubTab, setPassengerSubTab] = useState<'BOOK' | 'TRIPS' | 'WALLET' | 'SAFETY' | 'LANDING'>('LANDING');

  const isLanding = activeRoleView === 'PASSENGER' && passengerSubTab === 'LANDING';

  return (
    <div className={`min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans transition-colors duration-200 ${seniorMode ? 'senior-mode' : ''} ${lowInternetMode ? 'low-internet' : ''}`}>
      {/* Top Universal Navbar */}
      <Navbar isLandingPage={isLanding} onNavigateToBook={() => setPassengerSubTab('BOOK')} />

      {/* Passenger Navigation Ribbon - ONLY in active Passenger App views */}
      {activeRoleView === 'PASSENGER' && !isLanding && (
        <nav aria-label="Passenger navigation" className="bg-white border-b border-slate-200 px-4 py-2.5 shadow-xs sticky top-16 z-40 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              type="button"
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
              type="button"
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
              type="button"
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
              type="button"
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
              type="button"
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
          </div>
        </nav>
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

      {/* FairRide Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Become a Driver Partner Modal */}
      <BecomeDriverModal
        isOpen={isBecomeDriverModalOpen}
        onClose={() => setBecomeDriverModalOpen(false)}
      />

      {/* Mobile Responsive App Installation Modal */}
      <InstallAppModal />

      {/* Floating Bottom App Installation Banner for Mobile */}
      <MobileInstallBanner />
    </div>
  );
};

export default App;
