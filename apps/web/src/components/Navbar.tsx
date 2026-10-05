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
  ExternalLink
} from 'lucide-react';
import { formatCurrencyINR } from '@fairride/shared';

interface NavbarProps {
  onOpenPortalModal?: (portal: 'DRIVER' | 'CORPORATE' | 'ADMIN') => void;
  onOpenDriverOnboarding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenPortalModal,
  onOpenDriverOnboarding
}) => {
  const {
    currentUser,
    isAuthenticated,
    logout,
    setAuthModalOpen,
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
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-navy-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Tagline */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                    FAIR<span className="text-brand-400">RIDE</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    TRUST-FIRST
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium hidden sm:block">
                  {t('tagline')}
                </p>
              </div>
            </div>

            {/* When in Passenger View: Show separate, restricted Partner Portals dropdown */}
            {activeRoleView === 'PASSENGER' ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsPortalsDropdownOpen(!isPortalsDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-sm"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Partner Portals</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isPortalsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isPortalsDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-2xl p-2 shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 border-b border-slate-800 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span>Restricted Portal Access</span>
                      <span className="text-amber-400">Code Required</span>
                    </div>

                    {/* Driver Portal */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsPortalsDropdownOpen(false);
                        if (onOpenPortalModal) onOpenPortalModal('DRIVER');
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 text-xs text-white font-medium group transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Car className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold group-hover:text-amber-300">Driver Partner Login</p>
                        <p className="text-[10px] text-slate-400 truncate">Requires Driver Partner Code (DRV-)</p>
                      </div>
                    </button>

                    {/* Driver Registration with Onboarding Fee */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsPortalsDropdownOpen(false);
                        if (onOpenDriverOnboarding) onOpenDriverOnboarding();
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 font-bold transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>New Driver? Register & Onboard</span>
                    </button>

                    {/* Corporate Enterprise Portal */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsPortalsDropdownOpen(false);
                        if (onOpenPortalModal) onOpenPortalModal('CORPORATE');
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 text-xs text-white font-medium group transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold group-hover:text-cyan-300">Corporate Portal</p>
                        <p className="text-[10px] text-slate-400 truncate">Requires Corporate Org Code (CORP-)</p>
                      </div>
                    </button>

                    {/* Admin Console */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsPortalsDropdownOpen(false);
                        if (onOpenPortalModal) onOpenPortalModal('ADMIN');
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 text-xs text-white font-medium group transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold group-hover:text-rose-300">Admin & Operations</p>
                        <p className="text-[10px] text-slate-400 truncate">Requires Security Passcode</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* When in Driver / Corporate / Admin view: Distinctive Portal Header with Exit Button */
              <div className="flex items-center gap-2.5">
                <span className={`text-xs font-black uppercase px-3 py-1.5 rounded-full border flex items-center gap-1.5 shadow-sm ${
                  activeRoleView === 'DRIVER'
                    ? 'text-amber-300 bg-amber-500/10 border-amber-500/30'
                    : activeRoleView === 'CORPORATE'
                    ? 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30'
                    : 'text-rose-300 bg-rose-500/10 border-rose-500/30'
                }`}>
                  {activeRoleView === 'DRIVER' && <Car className="w-3.5 h-3.5 text-amber-400" />}
                  {activeRoleView === 'CORPORATE' && <Building2 className="w-3.5 h-3.5 text-cyan-400" />}
                  {activeRoleView === 'ADMIN' && <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
                  <span>
                    {activeRoleView === 'DRIVER' && 'DRIVER CONSOLE: Rajesh Kumar (TS 07 UB 1420)'}
                    {activeRoleView === 'CORPORATE' && 'CORPORATE PORTAL: TCS Hyderabad Mobility'}
                    {activeRoleView === 'ADMIN' && 'OPERATIONS & SAFETY HEADQUARTERS'}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => setActiveRoleView('PASSENGER')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all border border-slate-700 shadow-sm cursor-pointer"
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
                className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                  seniorMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-2 ring-amber-500/30'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title="Accessibility Senior Mode (Large text & High Contrast)"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden lg:inline text-[11px] font-bold">Senior Mode</span>
              </button>

              {/* Low Internet Mode Toggle */}
              <button
                onClick={toggleLowInternetMode}
                className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                  lowInternetMode
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 ring-2 ring-cyan-500/30'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title="Low Internet Lite Mode (Ultra-low bandwidth protocol)"
              >
                <WifiOff className="w-4 h-4" />
                <span className="hidden lg:inline text-[11px] font-bold">Lite Mode</span>
              </button>

              {/* Regional Language Selector */}
              <div className="flex items-center gap-1 bg-slate-900/60 rounded-lg border border-slate-800 px-2 py-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  aria-label="Language selection"
                  className="bg-slate-900 text-slate-200 text-xs font-semibold rounded-lg border border-slate-800 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
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
                      className="flex items-center gap-2 pl-2 border-l border-slate-800 hover:opacity-90 transition-opacity cursor-pointer group"
                      title="Account Profile & Settings"
                    >
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                          {currentUser.name}
                        </p>
                        <p className="text-[10px] text-emerald-400 font-semibold tracking-wide flex items-center justify-end gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Trust {currentUser.trustScore || 99}%
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-md">
                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 p-2.5 text-xs animate-in fade-in duration-200 ring-1 ring-white/10">
                        {/* User Info Header with Full Details */}
                        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 mb-2 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-sm text-white">{currentUser.name}</span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {currentUser.role}
                            </span>
                          </div>

                          <div className="space-y-1 text-[11px] text-slate-300">
                            {currentUser.phone && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span className="font-mono">{currentUser.phone}</span>
                              </div>
                            )}
                            {currentUser.email && (
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span className="truncate">{currentUser.email}</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1 text-slate-400">
                              <Wallet className="w-3 h-3 text-amber-400" />
                              <span>Wallet:</span>
                              <strong className="text-white font-mono">
                                {formatCurrencyINR(currentUser.walletBalance ?? 100)}
                              </strong>
                            </div>
                            <span className="text-emerald-400 font-bold font-mono">
                              {currentUser.trustScore || 99}% Verified
                            </span>
                          </div>
                        </div>

                        {/* Menu Actions */}
                        <div className="space-y-1">
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setIsProfileModalOpen(true);
                            }}
                            className="w-full px-3 py-2 rounded-xl text-left font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <User className="w-3.5 h-3.5 text-emerald-400" />
                            <span>View Full Account Details</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setAuthModalOpen(true);
                            }}
                            className="w-full px-3 py-2 rounded-xl text-left font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Switch Account / Sign In</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              logout();
                            }}
                            className="w-full px-3 py-2 rounded-xl text-left font-bold text-rose-300 hover:text-rose-200 hover:bg-rose-500/15 transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5 text-rose-400" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 cursor-pointer transition-all hover:scale-[1.02]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10 flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-emerald-500/20 text-base">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">{currentUser.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.2 rounded border border-emerald-500/30">
                      {currentUser.role}
                    </span>
                    <span className="text-xs text-slate-400">• Verified Account</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Content Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Trust Score & Verification Card */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Identity & Trust Score</h4>
                    <p className="text-[11px] text-emerald-300">Clean ride history • KYC Verified</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black font-mono text-emerald-400">
                    {currentUser.trustScore || 99}%
                  </span>
                  <p className="text-[10px] text-slate-400">Trust Index</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Contact Information
                </h4>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      Mobile Number:
                    </span>
                    <span className="font-bold text-white font-mono">
                      {currentUser.phone || 'Not provided'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-emerald-400" />
                      Email Address:
                    </span>
                    <span className="font-bold text-white truncate max-w-[200px]">
                      {currentUser.email || 'Not provided'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      Account Role:
                    </span>
                    <span className="font-bold text-brand-300 uppercase">
                      {currentUser.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wallet & Rewards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <Wallet className="w-3 h-3 text-amber-400" />
                    Wallet Balance
                  </span>
                  <p className="text-lg font-black text-white font-mono">
                    {formatCurrencyINR(currentUser.walletBalance ?? 100)}
                  </p>
                  <span className="text-[10px] text-emerald-400 font-semibold">₹100 Bonus Active</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    FairPoints
                  </span>
                  <p className="text-lg font-black text-cyan-400 font-mono">
                    {currentUser.fairPoints ?? 100} pts
                  </p>
                  <span className="text-[10px] text-slate-400">1 pt = ₹1 Fare Discount</span>
                </div>
              </div>

              {/* Referral Code */}
              {currentUser.referralCode && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Your Referral Code
                    </span>
                    <span className="font-mono font-black text-sm text-brand-300">
                      {currentUser.referralCode}
                    </span>
                  </div>
                  <button
                    onClick={copyReferral}
                    className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedReferral ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedReferral ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                256-Bit Encrypted Session
              </span>
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  logout();
                }}
                className="text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
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
