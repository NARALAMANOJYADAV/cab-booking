import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Zap,
  MapPin,
  Clock,
  HeartHandshake,
  CheckCircle2,
  Users,
  Compass,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  Leaf
} from 'lucide-react';
import { formatCurrencyINR } from '@fairride/shared';

export const LandingPage: React.FC = () => {
  const { setActiveRoleView, quickSwitchRole } = useAppStore();

  const [activeTab, setActiveTab] = useState<'FARE_LOCK' | 'AUTO_RECOVERY' | 'NET_EARNINGS' | 'ROUTE_GUARDIAN'>('FARE_LOCK');

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>THE TRUST-FIRST MOBILITY PLATFORM</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
              BOOK WITH <br />
              <span className="bg-gradient-to-r from-brand-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
                CONFIDENCE.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 font-medium leading-relaxed">
              Fair pricing. Smarter matching. Safer journeys. A mobility platform designed from the ground up to solve the real problems that passengers and drivers face every day.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => {
                  quickSwitchRole('PASSENGER');
                  setActiveRoleView('PASSENGER');
                }}
                className="py-4 px-8 rounded-2xl bg-gradient-to-r from-brand-500 to-emerald-400 hover:from-brand-400 hover:to-emerald-300 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>BOOK A RIDE</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>

              <button
                onClick={() => {
                  quickSwitchRole('DRIVER');
                  setActiveRoleView('DRIVER');
                }}
                className="py-4 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base border border-slate-700/80 shadow-lg flex items-center gap-2 transition-all"
              >
                <span>DRIVE WITH FAIRRIDE</span>
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </button>
            </div>

            {/* FairRide Trust Summary Banner */}
            <div className="pt-8 max-w-2xl mx-auto">
              <div className="glass-card rounded-2xl p-4 border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Fare Locked Upfront</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zero Offline Extortion</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Auto-Recovery Backup</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Route Guardian Safety</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Driver Net Transparency</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Evidence-Based Disputes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Core Innovation Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Engineering Real Solutions for Modern Mobility
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Explore how FairRide eliminates systemic pain points with architectural and cryptographic guarantees.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('FARE_LOCK')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'FARE_LOCK' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🔒 1. Upfront Fare Lock
            </button>
            <button
              onClick={() => setActiveTab('AUTO_RECOVERY')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'AUTO_RECOVERY' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ 2. Driver Cancel Auto-Recovery
            </button>
            <button
              onClick={() => setActiveTab('NET_EARNINGS')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'NET_EARNINGS' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              💰 3. Driver Net Take-Home
            </button>
            <button
              onClick={() => setActiveTab('ROUTE_GUARDIAN')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ROUTE_GUARDIAN' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🛡️ 4. Route Guardian Detour AI
            </button>
          </div>
        </div>

        {/* Interactive Tab Cards */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800">
          {activeTab === 'FARE_LOCK' && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase border border-amber-500/20">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Problem Solved: Hidden Charges & Post-Trip Surge</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Guaranteed Upfront Fare. Itemized to the Rupee.
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Traditional cab apps quote estimates and surprise you upon arrival with dynamic surge or vague waiting adjustments. FairRide creates an immutable <strong>FareLock</strong> record before booking.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Every charge (Base, Km, Time, Toll, Tax) is locked before driver matching.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>After trip, a downloadable <strong>Fare Audit</strong> compares original quote with final total.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Any legitimate variance (e.g. Fastag toll) requires audit verification.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-amber-500/30 shadow-2xl space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-amber-400 font-bold">
                  <span>FARE LOCK CERTIFICATE</span>
                  <span>#FL-88219</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Base Fare (2.5 km)</span>
                  <span className="text-white">₹80</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Distance Charge (24.2 km)</span>
                  <span className="text-white">₹435</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Time Component (38 mins)</span>
                  <span className="text-white">₹76</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Platform Fee (8%)</span>
                  <span className="text-white">₹47</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST (5%)</span>
                  <span className="text-white">₹32</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-emerald-400">
                  <span>LOCKED TOTAL FARE</span>
                  <span>₹670</span>
                </div>
                <div className="bg-emerald-500/10 p-2 rounded text-[11px] text-emerald-300 font-sans">
                  ✓ Protected against driver extortion and arbitrary surge spikes.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'AUTO_RECOVERY' && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase border border-emerald-500/20">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Problem Solved: Starting Over When Drivers Cancel</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Intelligent Auto-Recovery Engine
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  When a driver accepts and then cancels, other apps force you back to square one with higher surge pricing. FairRide automatically takes over, preserves your locked fare, and seamlessly pairs the next top-rated driver.
                </p>
                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Zap className="w-4 h-4" />
                    <span>Auto-Recovery Guarantee</span>
                  </div>
                  <p className="text-slate-300">
                    "Your driver cancelled. We are finding another vehicle immediately with zero penalty."
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs space-y-1">
                  <span className="font-bold text-rose-400">Step 1: Driver Cancellation</span>
                  <p className="text-slate-300">Assigned driver Rajesh cancels due to heavy opposite-lane traffic.</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs space-y-1">
                  <span className="font-bold text-amber-400">Step 2: Auto-Recovery Standby Activated</span>
                  <p className="text-slate-300">Dispatch engine queries closest eligible drivers within 3km without re-surging.</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-1">
                  <span className="font-bold text-emerald-400">Step 3: New Driver Assigned</span>
                  <p className="text-slate-300">Venkatesh Babu (4.9★, 2 mins away) auto-assigned. Fare stays ₹670 locked.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'NET_EARNINGS' && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase border border-cyan-500/20">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Problem Solved: Driver Uncertainty & Demanding Extra Cash</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Transparent Driver Net Earnings
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Drivers often demand cash off-app because they don't know their real take-home after platform commission and fuel costs. FairRide previews net earnings transparently before acceptance.
                </p>
                <p className="text-xs text-slate-400">
                  By clearly displaying fuel expenses, platform commission, and exact net profit upfront, drivers drive with clarity and passengers avoid offline extortion.
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-cyan-500/30 space-y-2 text-xs">
                <div className="flex justify-between pb-2 border-b border-slate-800 text-cyan-400 font-bold">
                  <span>DRIVER TRIP PREVIEW</span>
                  <span>31.4 km • 42 mins</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Passenger Total Fare:</span>
                  <span className="font-mono">₹720</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Platform Fee (10%):</span>
                  <span className="font-mono text-rose-400">- ₹72</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Fuel Cost (₹6.5/km):</span>
                  <span className="font-mono text-amber-400">- ₹204</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-emerald-400">
                  <span>ESTIMATED NET TAKE-HOME</span>
                  <span className="font-mono text-base">₹444</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ROUTE_GUARDIAN' && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold uppercase border border-rose-500/20">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Problem Solved: Passenger Safety & Route Deviation</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Route Guardian Live GPS Watchdog
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  During a trip, GPS updates are monitored against a 300-meter corridor buffer. If a vehicle takes an unexpected turn, the app asks if you are safe, alert triggers Safety Operations, and 1-tap SOS is instant.
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    ✓ I'M SAFE Option
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-bold">
                    🚨 Instant SOS Dispatch
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 animate-bounce" />
                  <span>LIVE CORRIDOR DETOUR ALERT</span>
                </div>
                <p className="text-xs text-slate-300">
                  Vehicle departed 580m from planned Outer Ring Road path. Prompting passenger check-in.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button className="py-2 rounded-xl bg-emerald-600 text-white">I'M SAFE</button>
                  <button className="py-2 rounded-xl bg-rose-600 text-white">EMERGENCY SOS</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* The 25 Problem-Solution Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            COMPREHENSIVE PROBLEM RESOLUTION
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            25 Mobility Problems Technically Solved
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            FairRide was built by methodically engineering solutions to every recurring friction point in ride-hailing.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: 1, title: 'Extra Fare Demands', desc: 'Upfront FareLock guarantees pricing. Anti-cancellation engine penalizes cash extortion.' },
            { id: 2, title: 'Driver Post-Accept Cancel', desc: 'Intelligent Auto-Recovery immediately pairs next best candidate with zero penalty.' },
            { id: 3, title: 'Unclear / Hidden Surge', desc: 'Complete transparent breakdown of base, km, min, toll, platform fee, and tax.' },
            { id: 4, title: 'Route Deviations', desc: 'Route Guardian monitors GPS corridor with customizable 300m tolerance buffer.' },
            { id: 5, title: 'Poor Pickup Coordination', desc: 'Smart Pickup Points specify exact Gates, Metro Exits, and Airport Terminals.' },
            { id: 6, title: 'Elderly Accessibility', desc: 'Senior Mode with high contrast, large touch targets, simplified navigation, and voice booking.' },
            { id: 7, title: 'Poor / Slow Internet', desc: 'FairRide Lite operates seamlessly on low bandwidth with idempotency and retry queues.' },
            { id: 8, title: 'Fragmented Airport Rides', desc: 'Airport Mode with flight tracking, luggage space filters, and dedicated terminal pickup.' },
            { id: 9, title: 'Driver Net Earnings Blindness', desc: 'Net take-home calculator transparently deducts fuel and platform commission upfront.' },
            { id: 10, title: 'Disputes Without Evidence', desc: 'Auto-assembled evidence bundles with GPS timeline, FareLock, and driver events.' },
            { id: 11, title: 'Weak Safety Escalations', desc: 'Admin Safety Console with CRITICAL priority queues, audio snapshot, and live map.' },
            { id: 12, title: 'Corporate Mobility Chaos', desc: 'Corporate Portal with department budgets, travel policy rules, and manager approvals.' },
            { id: 13, title: 'Referral / Promo Abuse', desc: 'Device fingerprint checks, phone verification, and ride completion requirements.' },
            { id: 14, title: 'Lack of Multimodal Options', desc: 'Integrated multimodal journey planner (Cab + Metro, Bus + Metro, Direct, Shared).' },
            { id: 15, title: 'Green Mobility Transparency', desc: 'EV rides with real-time calculated CO2 emissions avoided and carbon reward points.' }
          ].map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 hover:border-brand-500/40 transition-colors space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-400 font-mono text-xs font-bold flex items-center justify-center border border-brand-500/20">
                  {item.id}
                </span>
                <h4 className="font-bold text-white text-sm">{item.title}</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
