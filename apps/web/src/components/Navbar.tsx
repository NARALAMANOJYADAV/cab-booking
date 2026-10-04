import React, { useState } from 'react';
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
  UserCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    logout,
    setAuthModalOpen,
    activeRoleView,
    quickSwitchRole,
    seniorMode,
    toggleSeniorMode,
    lowInternetMode,
    toggleLowInternetMode,
    language,
    setLanguage,
    t
  } = useAppStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-navy-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <ShieldCheck className="w-6 h-6 text-navy-950 stroke-[2.5]" />
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

          {/* Role Switcher Toolbar */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={() => quickSwitchRole('PASSENGER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeRoleView === 'PASSENGER'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Test as Passenger (Aarav)"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Passenger</span>
            </button>

            <button
              onClick={() => quickSwitchRole('DRIVER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeRoleView === 'DRIVER'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Test as Driver (Rajesh)"
            >
              <Car className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Driver</span>
            </button>

            <button
              onClick={() => quickSwitchRole('ADMIN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeRoleView === 'ADMIN'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Test as Admin & Safety Operator (Sunita)"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Admin / Safety</span>
            </button>

            <button
              onClick={() => quickSwitchRole('CORPORATE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeRoleView === 'CORPORATE'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Test as Corporate Manager (TechCorp)"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Corporate</span>
            </button>
          </div>

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
              title="FairRide Lite (Low Internet Mode - Minimal bandwidth, zero heavy animations)"
            >
              <WifiOff className="w-4 h-4" />
              <span className="hidden lg:inline text-[11px] font-bold">Lite</span>
            </button>

            {/* Language Switcher */}
            <div className="relative">
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
                        Trust {currentUser.trustScore || 98}%
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-md">
                      {currentUser.name.charAt(0)}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 text-xs animate-in fade-in duration-200 ring-1 ring-white/10">
                      {/* User Info Header */}
                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 mb-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-white">{currentUser.name}</span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {currentUser.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{currentUser.email || currentUser.phone}</p>
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Trust Score:</span>
                          <span className="text-emerald-400 font-bold font-mono">{currentUser.trustScore || 98}% Verified</span>
                        </div>
                      </div>

                      {/* Menu Actions */}
                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setAuthModalOpen(true);
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
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
  );
};
