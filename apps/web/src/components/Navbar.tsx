import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  ShieldCheck,
  User,
  Car,
  Building2,
  ShieldAlert,
  Globe,
  Eye,
  WifiOff,
  Flame,
  Wallet,
  LogOut,
  ChevronDown,
  KeyRound,
  UserCheck,
  Phone,
  Mail,
  Gift,
  Copy,
  Check,
  X,
  Sparkles,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { formatCurrencyINR } from '@fairride/shared';

interface NavbarProps {
  onOpenPortalModal?: (portal: 'DRIVER' | 'CORPORATE' | 'ADMIN') => void;
  onOpenDriverOnboarding?: () => void;
  isLandingPage?: boolean;
  onNavigateToBook?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isLandingPage, onNavigateToBook }) => {
  const {
    currentUser,
    isAuthenticated,
    logout,
    setAuthModalOpen,
    setBecomeDriverModalOpen,
    activeRoleView,
    setActiveRoleView,
    refreshProfile,
    seniorMode,
    toggleSeniorMode,
    lowInternetMode,
    toggleLowInternetMode,
    language,
    setLanguage,
    t
  } = useAppStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPortalsDropdownOpen, setIsPortalsDropdownOpen] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      refreshProfile();
    }
  }, [isAuthenticated]);

  const copyReferral = () => {
    if (currentUser.referralCode) {
      navigator.clipboard.writeText(currentUser.referralCode);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 border-b border-slate-200 shadow-sm text-slate-800 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Tagline */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md">
                <ShieldCheck className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight font-sans text-slate-900">
                    FAIR<span className="text-emerald-600">RIDE</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200">
                    TRUST-FIRST
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500 hidden sm:block">
                  {t('tagline')}
                </p>
              </div>
            </div>

            {/* When in Passenger View: Show separate, restricted Partner Portals dropdown + Become Captain Button */}
            {activeRoleView === 'PASSENGER' ? (
              <div className="flex items-center gap-2">
                {/* Special Option: Become a Driver / Captain */}
                <button
                  onClick={() => setBecomeDriverModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                  title="Upgrade account to Driver Partner mode with vehicle details & ID proof"
                >
                  <Car className="w-3.5 h-3.5 text-amber-700" />
                  <span>Become a Captain</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-black px-1.5 py-0.2 rounded">92%</span>
                </button>

                {isLandingPage && onNavigateToBook && (
                  <button
                    onClick={onNavigateToBook}
                    className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Book Ride</span>
                  </button>
                )}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsPortalsDropdownOpen(!isPortalsDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    <span>Partner Portals</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isPortalsDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isPortalsDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl p-2 shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95 border bg-white border-slate-200 text-slate-800 shadow-slate-300/50">
                      <div className="px-3 py-1.5 border-b border-slate-100 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <span>Role-Based Portal Access</span>
                        <span className="text-amber-600">Secure</span>
                      </div>

                      {/* Driver Portal */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsPortalsDropdownOpen(false);
                          setActiveRoleView('DRIVER');
                        }}
                        className="w-full text-left p-2.5 rounded-xl flex items-center gap-2.5 text-xs font-medium hover:bg-slate-50 text-slate-800 group transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                          <Car className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold group-hover:text-amber-700">Driver Partner Portal</p>
                          <p className="text-[10px] truncate text-slate-500">Login with Partner Code (DRV-) or Register</p>
                        </div>
                      </button>

                      {/* Become Driver Upgrade */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsPortalsDropdownOpen(false);
                          setBecomeDriverModalOpen(true);
                        }}
                        className="w-full text-left p-2.5 rounded-xl border border-amber-200 bg-amber-50/80 hover:bg-amber-100 flex items-center gap-2 text-xs font-bold text-amber-900 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>Upgrade Passenger to Captain ➔</span>
                      </button>

                      {/* Corporate Enterprise Portal */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsPortalsDropdownOpen(false);
                          setActiveRoleView('CORPORATE');
                        }}
                        className="w-full text-left p-2.5 rounded-xl flex items-center gap-2.5 text-xs font-medium hover:bg-slate-50 text-slate-800 group transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold group-hover:text-indigo-700">Corporate Portal</p>
                          <p className="text-[10px] truncate text-slate-500">Enterprise Org Code (CORP-)</p>
                        </div>
                      </button>

                      {/* Admin Console */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsPortalsDropdownOpen(false);
                          setActiveRoleView('ADMIN');
                        }}
                        className="w-full text-left p-2.5 rounded-xl flex items-center gap-2.5 text-xs font-medium hover:bg-slate-50 text-slate-800 group transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold group-hover:text-rose-700">Admin & Operations</p>
                          <p className="text-[10px] truncate text-slate-500">Security Passcode Required</p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* When in Driver / Corporate / Admin view: Distinctive Portal Header with Exit Button */
              <div className="flex items-center gap-2.5">
                <span className={`text-xs font-black uppercase px-3 py-1.5 rounded-full border flex items-center gap-1.5 shadow-sm ${
                  activeRoleView === 'DRIVER'
                    ? 'text-amber-800 bg-amber-50 border-amber-200'
                    : activeRoleView === 'CORPORATE'
                    ? 'text-indigo-800 bg-indigo-50 border-indigo-200'
                    : 'text-rose-800 bg-rose-50 border-rose-200'
                }`}>
                  {activeRoleView === 'DRIVER' && <Car className="w-3.5 h-3.5 text-amber-700" />}
                  {activeRoleView === 'CORPORATE' && <Building2 className="w-3.5 h-3.5 text-indigo-700" />}
                  {activeRoleView === 'ADMIN' && <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />}
                  <span>
                    {activeRoleView === 'DRIVER' && (currentUser?.role === 'DRIVER' ? `DRIVER CONSOLE: ${currentUser.name}` : 'DRIVER PARTNER PORTAL')}
                    {activeRoleView === 'CORPORATE' && (currentUser?.role?.startsWith('CORPORATE') ? `CORPORATE PORTAL: ${currentUser.name}` : 'CORPORATE MOBILITY DESK')}
                    {activeRoleView === 'ADMIN' && (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'OPERATIONS_ADMIN' ? `OPERATIONS ROOM: ${currentUser.name}` : 'OPERATIONS COMMAND CENTER')}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => setActiveRoleView('PASSENGER')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition-all border border-slate-300 shadow-sm cursor-pointer"
                  title="Return to Consumer Passenger Site"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit to Passenger</span>
                </button>
              </div>
            )}

            {/* Quick Utility Tools: Senior Mode, Lite Mode, i18n */}
            <div className="flex items-center gap-2">
              {/* Senior Mode Toggle */}
              <button
                onClick={toggleSeniorMode}
                className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 cursor-pointer ${
                  seniorMode
                    ? 'bg-amber-100 text-amber-800 border-amber-300 ring-2 ring-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
                title="Accessibility Senior Mode (Large text & High Contrast)"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden lg:inline text-[11px] font-bold">Senior</span>
              </button>

              {/* Low Internet Mode Toggle */}
              <button
                onClick={toggleLowInternetMode}
                className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 cursor-pointer ${
                  lowInternetMode
                    ? 'bg-cyan-100 text-cyan-800 border-cyan-300 ring-2 ring-cyan-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
                title="Low Internet Lite Mode (Ultra-low bandwidth protocol)"
              >
                <WifiOff className="w-4 h-4" />
                <span className="hidden lg:inline text-[11px] font-bold">Lite</span>
              </button>

              {/* Regional Language Selector */}
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2 py-1">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  aria-label="Language selection"
                  className="text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="en">English (EN)</option>
                  <option value="te">తెలుగు (TE)</option>
                  <option value="hi">हिन्दी (HI)</option>
                  <option value="ta">தமிழ் (TA)</option>
                  <option value="kn">ಕನ್ನಡ (KN)</option>
                </select>
              </div>

              {/* User Authentication Menu & Profile */}
              <div className="relative">
                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-90 transition-opacity cursor-pointer group"
                      title="Account Profile & Settings"
                    >
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                          {currentUser.name}
                        </p>
                        <p className="text-[10px] font-semibold tracking-wide text-emerald-700 flex items-center justify-end gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Trust {currentUser.trustScore || 99}%
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs shadow-sm">
                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800 transition-transform" />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl overflow-hidden z-50 p-2.5 text-xs animate-in fade-in duration-200 border bg-white border-slate-200 text-slate-800 shadow-slate-300/60 ring-1 ring-black/5">
                        {/* User Info Header with Full Details */}
                        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 mb-2 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-sm text-slate-900">
                              {currentUser.name}
                            </span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded border bg-emerald-100 text-emerald-800 border-emerald-200">
                              {currentUser.role}
                            </span>
                          </div>

                          <div className="space-y-1 text-[11px] text-slate-600">
                            {currentUser.phone && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span className="font-mono">{currentUser.phone}</span>
                              </div>
                            )}
                            {currentUser.email && (
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span className="truncate">{currentUser.email}</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1 text-slate-500 font-medium">
                              <Wallet className="w-3 h-3 text-amber-600" />
                              <span>Wallet:</span>
                              <strong className="font-mono text-slate-900">
                                {formatCurrencyINR(currentUser.walletBalance ?? 100)}
                              </strong>
                            </div>
                            <span className="text-emerald-700 font-bold font-mono">
                              {currentUser.trustScore || 99}% Verified
                            </span>
                          </div>
                        </div>

                        {/* Special Option in Dropdown: Become Driver Partner */}
                        {currentUser.role === 'PASSENGER' && (
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setBecomeDriverModalOpen(true);
                            }}
                            className="w-full px-3 py-2 rounded-xl text-left font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors flex items-center justify-between cursor-pointer border border-amber-200 mb-1"
                          >
                            <div className="flex items-center gap-2">
                              <Car className="w-3.5 h-3.5 text-amber-700" />
                              <span>Become a Driver (92% Payout)</span>
                            </div>
                            <Sparkles className="w-3 h-3 text-amber-600" />
                          </button>
                        )}

                        {/* Menu Actions */}
                        <div className="space-y-1">
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setIsProfileModalOpen(true);
                            }}
                            className="w-full px-3 py-2 rounded-xl text-left font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <User className="w-3.5 h-3.5 text-emerald-600" />
                            <span>View Full Account Details</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setAuthModalOpen(true);
                            }}
                            className="w-full px-3 py-2 rounded-xl text-left font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Switch Account / Sign In</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              logout();
                            }}
                            className="w-full px-3 py-2 rounded-xl text-left font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5 text-rose-500" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <UserCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FULL ACCOUNT DETAILS MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow text-base">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{currentUser.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded border border-emerald-200">
                      {currentUser.role}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">• Verified Account</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Content Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Trust Score & Verification Card */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-6 h-6 text-emerald-700" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Identity & Trust Score</h4>
                    <p className="text-[11px] text-emerald-800 font-medium">Clean ride history • KYC Verified</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black font-mono text-emerald-700">
                    {currentUser.trustScore || 99}%
                  </span>
                  <p className="text-[10px] text-slate-500">Trust Index</p>
                </div>
              </div>

              {/* Special Button in Profile Modal: Become a Driver */}
              {currentUser.role === 'PASSENGER' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-amber-950 text-xs">Drive with FairRide</h4>
                    <p className="text-[11px] text-slate-600">Upgrade to Driver Partner & earn 92% take-home</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileModalOpen(false);
                      setBecomeDriverModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-sm cursor-pointer transition-all"
                  >
                    Upgrade Now
                  </button>
                </div>
              )}

              {/* Contact Information */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Contact Information
                </h4>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      Mobile Number:
                    </span>
                    <span className="font-bold text-slate-900 font-mono">
                      {currentUser.phone || 'Not provided'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-emerald-600" />
                      Email Address:
                    </span>
                    <span className="font-bold text-slate-900 truncate max-w-[200px]">
                      {currentUser.email || 'Not provided'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      Account Role:
                    </span>
                    <span className="font-bold text-indigo-700 uppercase">
                      {currentUser.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wallet & Rewards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                    <Wallet className="w-3 h-3 text-amber-600" />
                    Wallet Balance
                  </span>
                  <p className="text-lg font-black text-slate-900 font-mono">
                    {formatCurrencyINR(currentUser.walletBalance ?? 100)}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-semibold">₹100 Bonus Active</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    FairPoints
                  </span>
                  <p className="text-lg font-black text-indigo-600 font-mono">
                    {currentUser.fairPoints ?? 100} pts
                  </p>
                  <span className="text-[10px] text-slate-500">1 pt = ₹1 Fare Discount</span>
                </div>
              </div>

              {/* Referral Code */}
              {currentUser.referralCode && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">
                      Your Referral Code
                    </span>
                    <span className="font-mono font-black text-sm text-indigo-600">
                      {currentUser.referralCode}
                    </span>
                  </div>
                  <button
                    onClick={copyReferral}
                    className="py-1.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300 shadow-sm"
                  >
                    {copiedReferral ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedReferral ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                256-Bit Encrypted Session
              </span>
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  logout();
                }}
                className="text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Navbar;
