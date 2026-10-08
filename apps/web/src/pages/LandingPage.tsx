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
  CheckCircle2,
  Users,
  Compass,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  Leaf,
  Car,
  Star,
  Sparkles,
  PhoneCall,
  Shield,
  CreditCard,
  Building2,
  HelpCircle,
  ChevronDown,
  Navigation,
  KeyRound,
  DollarSign,
  Smartphone,
  Download
} from 'lucide-react';
import { formatCurrencyINR } from '@fairride/shared';

interface LandingPageProps {
  onBookRide?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onBookRide }) => {
  const { setActiveRoleView, quickSwitchRole, setInstallModalOpen } = useAppStore();

  const [activeTab, setActiveTab] = useState<'FARE_LOCK' | 'AUTO_RECOVERY' | 'NET_EARNINGS' | 'ROUTE_GUARDIAN'>('FARE_LOCK');
  const [selectedVehicle, setSelectedVehicle] = useState<'SEDAN' | 'EV' | 'AUTO' | 'BIKE' | 'SUV'>('SEDAN');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [driverHours, setDriverHours] = useState<number>(8);

  const handleStartBooking = () => {
    if (onBookRide) {
      onBookRide();
    } else {
      quickSwitchRole('PASSENGER');
      setActiveRoleView('PASSENGER');
    }
  };

  const vehicleRates: Record<string, { name: string; icon: string; base: number; perKm: number; time: string; co2: string; desc: string }> = {
    BIKE: { name: 'FairRide Bike', icon: '🛵', base: 30, perKm: 9, time: '2 mins away', co2: 'Low emission', desc: 'Fastest single commute to beat traffic' },
    AUTO: { name: 'FairRide Auto', icon: '🛺', base: 45, perKm: 14, time: '3 mins away', co2: 'Standard metered', desc: 'Everyday quick city commute at transparent rates' },
    SEDAN: { name: 'FairRide Prime Sedan', icon: '🚗', base: 80, perKm: 18, time: '4 mins away', co2: 'AC Comfort', desc: 'Spacious 4-seater with top-rated verified captains' },
    EV: { name: 'FairRide Green EV', icon: '⚡', base: 85, perKm: 17, time: '3 mins away', co2: '100% Zero Emission', desc: 'Silent eco-friendly electric ride with carbon points' },
    SUV: { name: 'FairRide XL SUV', icon: '🚙', base: 120, perKm: 24, time: '5 mins away', co2: 'Family & Luggage', desc: '6-seater spacious vehicle perfect for airport & group rides' }
  };

  const estimatedTripKm = 14.5;
  const currentRate = vehicleRates[selectedVehicle];
  const calculatedFare = Math.round(currentRate.base + estimatedTripKm * currentRate.perKm + 45); // + platform fee

  const faqs = [
    {
      q: 'How does the FareLock™ guarantee work?',
      a: 'When you input your pickup and drop-off, FairRide calculates an exact itemized price (Base Fare + Distance + Time + Toll + Tax). Once you click Lock Fare, this exact price is locked for 15 minutes and will never change after your trip, even if there is heavy traffic or route congestion.'
    },
    {
      q: 'What happens if a driver cancels my ride?',
      a: 'Unlike traditional cab apps that leave you stranded with higher surge rates, our Auto-Recovery engine immediately takes over. It auto-assigns the next closest verified driver within seconds with zero price increase and zero cancellation penalty.'
    },
    {
      q: 'How does Route Guardian™ protect passengers during night rides?',
      a: 'Route Guardian monitors live GPS coordinates against a safe 300-meter corridor. If an unexpected turn or prolonged stop is detected, the app automatically checks your safety, alerts our 24/7 Safety Command Center, and provides a 1-tap Emergency SOS trigger.'
    },
    {
      q: 'Why do drivers earn more on FairRide?',
      a: 'FairRide charges a transparent, flat 10% platform fee compared to 25–35% on legacy apps. Drivers see their exact fuel cost and take-home earnings before accepting, which eliminates offline cash extortion and ride cancellations.'
    },
    {
      q: 'How do instant dispute refunds work?',
      a: 'When you submit a dispute, FairRide automatically compiles an immutable digital evidence bundle (GPS breadcrumbs, FareLock receipt, driver timestamps). Operations admins review the facts and authorize instant refunds directly into your wallet.'
    }
  ];

  return (
    <div className="bg-[#FAFBFD] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/70 to-[#FAFBFD]">
        {/* Soft Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-tr from-emerald-100/60 via-teal-50/40 to-blue-100/40 blur-3xl -z-10 pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-amber-100/40 blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Value Proposition & Hero CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Pulsing Guarantee Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% ZERO-SURGE GUARANTEE • INDIA'S FAIR MOBILITY</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-black text-slate-950 tracking-tight leading-[1.08]">
                Book With Confidence. <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Fares That Never Change.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl">
                Experience transparent upfront <strong className="text-slate-900 font-semibold">FareLock™</strong>, instant driver auto-recovery backup, and real-time <strong className="text-slate-900 font-semibold">Route Guardian™ GPS safety</strong>. Zero hidden surge. Zero driver haggling.
              </p>

              {/* Hero CTA Button Group */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={handleStartBooking}
                  className="py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-base shadow-xl shadow-emerald-600/20 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer active:scale-95"
                >
                  <Compass className="w-5 h-5 stroke-[2.5]" />
                  <span>BOOK A RIDE NOW</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={() => setInstallModalOpen(true)}
                  className="py-4 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2 hover:scale-[1.02]"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Get Mobile App</span>
                </button>

                <button
                  onClick={() => {
                    quickSwitchRole('DRIVER');
                    setActiveRoleView('DRIVER');
                  }}
                  className="py-4 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm hover:shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Car className="w-4 h-4 text-amber-500" />
                  <span>Drive (92%)</span>
                </button>
              </div>

              {/* Trust Metric Badges */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>4.9 / 5.0</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Passenger Rating</p>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-emerald-700 font-black text-sm font-mono">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>3.2 Mins</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Average Pickup ETA</p>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-teal-700 font-black text-sm">
                    <Leaf className="w-4 h-4 text-emerald-500" />
                    <span>Zero Emission</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">EV Fleet Available</p>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-blue-700 font-black text-sm">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>100% Refund</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Dispute Protection</p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live Fare Estimator Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl shadow-slate-200/80 border border-slate-200/90 relative text-left">
                {/* Header of Estimator */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Live Fare Calculator
                    </span>
                    <h3 className="font-black text-slate-900 text-lg mt-1.5">Instant Transparent Quote</h3>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>

                {/* Sample Journey Display */}
                <div className="py-4 space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                      <span className="w-0.5 h-5 bg-slate-300" />
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-100" />
                    </div>
                    <div className="space-y-2 flex-1 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup Location</span>
                        <span className="font-bold text-slate-800">Cyber Towers, Hitech City (Gate 1)</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Drop-off Destination</span>
                        <span className="font-bold text-slate-800">RGIA International Airport (Terminal 1)</span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Tabs */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-700">Select Vehicle Category</span>
                    <div className="flex sm:grid sm:grid-cols-5 gap-2 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar snap-x">
                      {(['BIKE', 'AUTO', 'SEDAN', 'EV', 'SUV'] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedVehicle(cat)}
                          className={`py-2 px-3 sm:px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer shrink-0 snap-center min-w-[70px] sm:min-w-0 ${
                            selectedVehicle === cat
                              ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200 font-extrabold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span className="text-xl sm:text-base">{vehicleRates[cat].icon}</span>
                          <span className="text-[10px] uppercase font-bold">{cat}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Vehicle Info */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm">{currentRate.name}</span>
                        <p className="text-[11px] text-slate-500">{currentRate.desc}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {currentRate.time}
                      </span>
                    </div>

                    {/* Price Breakdown */}
                    <div className="pt-2 border-t border-emerald-200/60 space-y-1 text-slate-600 text-[11px]">
                      <div className="flex justify-between">
                        <span>Base Fare & Initial 2.5 km</span>
                        <span className="font-mono font-medium">{formatCurrencyINR(currentRate.base)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Distance Charge (14.5 km @ ₹{currentRate.perKm}/km)</span>
                        <span className="font-mono font-medium">{formatCurrencyINR(Math.round(estimatedTripKm * currentRate.perKm))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform Fee & Tax (Zero Surprise Surge)</span>
                        <span className="font-mono font-medium">₹45</span>
                      </div>
                      <div className="pt-1.5 border-t border-emerald-200 flex justify-between items-center text-slate-950 font-black text-sm">
                        <span className="text-emerald-900 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-emerald-600" />
                          Guaranteed Locked Fare
                        </span>
                        <span className="font-mono text-lg text-emerald-700">{formatCurrencyINR(calculatedFare)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instant Action CTA */}
                <button
                  onClick={handleStartBooking}
                  className="w-full py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <span>LOCK FARE & BOOK THIS RIDE</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </button>

                <p className="text-center text-[11px] text-slate-500 mt-2 font-medium">
                  ✓ 15-minute guaranteed price lock • 4-digit safety PIN verification
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. THE 4 PILLARS OF FAIR MOBILITY */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-14">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            ENGINEERED TRUST ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            How FairRide Solves Everyday Ride Friction
          </h2>
          <p className="text-slate-600 text-base max-w-2xl mx-auto">
            Traditional cab apps are broken by dynamic surge and driver cancellations. We engineered 4 algorithmic guarantees that restore trust for everyone.
          </p>
        </div>

        {/* Tab Selection Row */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex flex-wrap gap-1 shadow-inner">
            <button
              onClick={() => setActiveTab('FARE_LOCK')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'FARE_LOCK' ? 'bg-white text-emerald-800 shadow-md ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              🔒 1. Upfront FareLock™
            </button>
            <button
              onClick={() => setActiveTab('AUTO_RECOVERY')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'AUTO_RECOVERY' ? 'bg-white text-emerald-800 shadow-md ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              ⚡ 2. Instant Auto-Recovery
            </button>
            <button
              onClick={() => setActiveTab('NET_EARNINGS')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'NET_EARNINGS' ? 'bg-white text-emerald-800 shadow-md ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              💰 3. 90% Driver Take-Home
            </button>
            <button
              onClick={() => setActiveTab('ROUTE_GUARDIAN')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'ROUTE_GUARDIAN' ? 'bg-white text-rose-800 shadow-md ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              🛡️ 4. Route Guardian™ Safety
            </button>
          </div>
        </div>

        {/* Feature Tab Card in Crisp Light Theme */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-left">
          {activeTab === 'FARE_LOCK' && (
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase border border-emerald-200">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Problem Solved: Post-Trip Surge & Hidden Extortion</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-slate-950 leading-tight">
                  Guaranteed Upfront Fare. Locked to the Exact Rupee.
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Traditional ride apps give you a loose estimate and surprise you upon arrival with surge multipliers, vague waiting time fees, and driver demands for extra cash. FairRide creates an immutable, guaranteed FareLock record before matching.
                </p>
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Every cost (Base, Km rate, Platform Fee, GST) is locked upfront.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Post-trip <strong>Fare Audit Receipt</strong> guarantees 100% match with quote.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Drivers are paid fairly, removing any incentive for cash demands.</span>
                  </div>
                </div>
              </div>

              {/* Receipt Preview */}
              <div className="bg-slate-50 p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-inner space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 text-emerald-800 font-bold">
                  <span className="flex items-center gap-1.5 font-sans font-black text-sm text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    FAIRRIDE FARELOCK RECEIPT
                  </span>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">#FL-88219</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Base Fare (First 2.5 km)</span>
                  <span className="text-slate-900 font-bold">₹80.00</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Distance Charge (24.2 km)</span>
                  <span className="text-slate-900 font-bold">₹435.00</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Time Component (38 mins)</span>
                  <span className="text-slate-900 font-bold">₹76.00</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Fee (10% flat)</span>
                  <span className="text-slate-900 font-bold">₹59.00</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST & Safety Insurance</span>
                  <span className="text-slate-900 font-bold">₹20.00</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center font-bold text-base text-emerald-700 font-sans">
                  <span className="text-slate-950 font-black">LOCKED TOTAL PAYABLE</span>
                  <span className="font-mono text-xl font-black">₹670.00</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-sans font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero hidden surcharges. What you see is exactly what you pay.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'AUTO_RECOVERY' && (
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase border border-amber-200">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Problem Solved: Being Stranded on Driver Cancellations</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-slate-950 leading-tight">
                  Intelligent Auto-Recovery Engine
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  When a driver accepts your ride and cancels 5 minutes later, other apps dump you back into the queue with 2x surge pricing. FairRide's Auto-Recovery engine immediately takes over, preserves your locked fare, and dispatches the next closest top-rated captain within 30 seconds.
                </p>
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5 text-xs text-amber-950">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>Zero Penalty Passenger Guarantee</span>
                  </div>
                  <p className="text-slate-700">
                    Your fare remains locked. No surge re-calculation. No starting over from scratch.
                  </p>
                </div>
              </div>

              {/* Step Progression Visual */}
              <div className="space-y-3 font-sans text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <h5 className="font-bold text-slate-900">Driver Cancels Unexpectedly</h5>
                    <p className="text-slate-500 text-[11px]">Assigned driver cancels due to sudden traffic.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <h5 className="font-bold text-amber-950">Auto-Recovery Engine Activates</h5>
                    <p className="text-amber-800 text-[11px]">Sub-second candidate search pairs closest idle vehicle within 2 km.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center shrink-0">3</span>
                  <div>
                    <h5 className="font-bold text-emerald-950">New Captain Assigned (2 Mins ETA)</h5>
                    <p className="text-emerald-800 text-[11px]">Venkatesh (4.9★ Sedan) arrives with your original ₹670 locked fare.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'NET_EARNINGS' && (
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 text-xs font-bold uppercase border border-cyan-200">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Problem Solved: 30% Unfair Commission Deductions</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-slate-950 leading-tight">
                  Drivers Keep 90% of Every Fare
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Drivers demand offline cash on traditional platforms because opaque 30% commissions leave them losing money on fuel. FairRide shows captains their exact fuel cost and net take-home before accepting.
                </p>
                <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200 text-xs text-cyan-950 space-y-1">
                  <span className="font-bold text-sm block text-cyan-900">Transparent Digital Ledger</span>
                  <p className="text-slate-600">
                    Daily instant settlements directly to captain bank accounts with zero hidden withholding.
                  </p>
                </div>
              </div>

              {/* Driver Trip Preview Card */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 text-cyan-900 font-bold">
                  <span className="font-sans font-black text-sm text-slate-900">CAPTAIN TRIP PREVIEW</span>
                  <span className="font-mono text-slate-500">22.4 km • 32 mins</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Gross Passenger Fare:</span>
                  <span className="font-mono font-bold text-slate-900">₹620.00</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>FairRide Platform Fee (Flat 10%):</span>
                  <span className="font-mono font-bold">- ₹62.00</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Estimated Fuel Cost (₹5.8/km):</span>
                  <span className="font-mono">- ₹130.00</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold text-base text-emerald-700">
                  <span className="text-slate-900 font-black">CAPTAIN NET TAKE-HOME</span>
                  <span className="font-mono text-xl font-black">₹428.00</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ROUTE_GUARDIAN' && (
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold uppercase border border-rose-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Problem Solved: Passenger Safety & Route Detours</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-slate-950 leading-tight">
                  Route Guardian™ Live GPS Watchdog
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  During your ride, our live GPS sentinel monitors vehicle progress against a 300-meter safety buffer. If a vehicle takes an unexpected turn, the system initiates an immediate safety check-in and connects to 24/7 Safety Command.
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ✓ 4-Digit Boarding PIN
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 border border-rose-200">
                    🚨 1-Tap Emergency SOS
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-blue-100 text-blue-800 border border-blue-200">
                    📍 Live Family Tracking
                  </span>
                </div>
              </div>

              {/* Safety Alert Box */}
              <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-rose-700 font-extrabold text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>ROUTE GUARDIAN SAFETY CORRIDOR CHECK</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  "Vehicle deviated 480m from planned corridor near Outer Ring Road. Is everything alright?"
                </p>
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm">
                    I'M SAFE
                  </button>
                  <button className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-sm">
                    ALERT POLICE / SOS
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. FAIRRIDE VS TRADITIONAL RIDE APPS (COMPARISON TABLE) */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
              TRANSPARENT COMPARISON
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
              Why Commuters & Drivers Choose FairRide
            </h2>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 shadow-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-extrabold text-slate-500">
                <tr>
                  <th className="p-4 sm:p-5">Feature Guarantee</th>
                  <th className="p-4 sm:p-5 text-emerald-700 bg-emerald-50/70">FairRide Mobility</th>
                  <th className="p-4 sm:p-5 text-slate-500">Traditional Cab Apps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Fare Predictability</td>
                  <td className="p-4 sm:p-5 text-emerald-800 font-bold bg-emerald-50/40">
                    ✓ Upfront FareLock™ — Guaranteed 0% Surprise Surge
                  </td>
                  <td className="p-4 sm:p-5 text-rose-600">
                    ✗ Dynamic Surge multipliers up to 3.5x upon arrival
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Driver Cancellation Policy</td>
                  <td className="p-4 sm:p-5 text-emerald-800 font-bold bg-emerald-50/40">
                    ✓ Auto-Recovery pairs next driver with Zero penalty
                  </td>
                  <td className="p-4 sm:p-5 text-rose-600">
                    ✗ Left stranded; re-booking incurs higher surge
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Driver Commission</td>
                  <td className="p-4 sm:p-5 text-emerald-800 font-bold bg-emerald-50/40">
                    ✓ Flat 10% platform fee — Captain keeps 90%
                  </td>
                  <td className="p-4 sm:p-5 text-rose-600">
                    ✗ High 25%–35% deductions triggering cash extortion
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">In-Trip Safety Sentinel</td>
                  <td className="p-4 sm:p-5 text-emerald-800 font-bold bg-emerald-50/40">
                    ✓ Route Guardian™ 300m GPS corridor watchdog
                  </td>
                  <td className="p-4 sm:p-5 text-rose-600">
                    ✗ Passive tracking with delayed support response
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Dispute & Refund Speed</td>
                  <td className="p-4 sm:p-5 text-emerald-800 font-bold bg-emerald-50/40">
                    ✓ Evidence-based bundles with 1-click admin refunds
                  </td>
                  <td className="p-4 sm:p-5 text-rose-600">
                    ✗ Frustrating automated bot loops taking 4–7 days
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. DRIVER PARTNER INCOME SIMULATOR */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/30">
                CAPTAIN PARTNERSHIP PROGRAM
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Earn ₹45,000 to ₹75,000 / Month with Dignity.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                No arbitrary fines. No 30% commission cuts. With FairRide, you keep 90% of your hard-earned revenue with daily settlements directly to your bank account.
              </p>

              {/* Slider Controls */}
              <div className="pt-4 space-y-3 max-w-md">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-300">Daily Driving Hours:</span>
                  <span className="text-amber-400 text-sm font-mono">{driverHours} Hours / Day</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={14}
                  step={1}
                  value={driverHours}
                  onChange={(e) => setDriverHours(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    quickSwitchRole('DRIVER');
                    setActiveRoleView('DRIVER');
                  }}
                  className="py-3.5 px-8 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition-all shadow-lg hover:shadow-amber-400/25 flex items-center gap-2 cursor-pointer"
                >
                  <Car className="w-4 h-4" />
                  <span>ONBOARD AS DRIVER IN 3 MINS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calculated Monthly Take-Home */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200 p-6 sm:p-7 rounded-2xl shadow-sm space-y-3.5">
                <span className="text-xs uppercase font-bold text-slate-500 block tracking-wider">
                  Estimated Monthly Net Profit
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-700">
                  {formatCurrencyINR(Math.round(driverHours * 220 * 26))}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Calculated after flat 10% platform fee and estimated CNG/fuel deductions across 26 working days.
                </p>
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] block font-medium">Daily Net</span>
                    <span className="text-slate-900 font-bold font-mono text-sm">{formatCurrencyINR(Math.round(driverHours * 220))}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] block font-medium">Platform Cut</span>
                    <span className="text-emerald-700 font-bold font-mono text-sm">Only 10%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. VERIFIED TESTIMONIALS */}
      <section className="py-16 bg-[#FAFBFD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
              COMMUNITY TESTIMONIALS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
              Loved by Passengers and Captains Alike
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              {
                name: 'Ananya Deshmukh',
                role: 'Daily Commuter, Hitech City',
                rating: 5,
                comment: 'The FareLock feature is a blessing. No more arguing with drivers asking for ₹100 extra after midnight or unexpected 2.5x surge spikes during rain.'
              },
              {
                name: 'Rajeshwar Rao',
                role: 'Sedan Captain (3 Years Experience)',
                rating: 5,
                comment: 'On other apps, 30% of my fare was taken and I had to beg passengers for extra cash to cover fuel. FairRide flat 10% fee means I take home ₹50,000+ monthly with peace of mind.'
              },
              {
                name: 'Vikram Malhotra',
                role: 'VP Corporate Operations, Infosys',
                rating: 5,
                comment: 'Our employees use the FairRide Corporate Desk. The automated GST itemized receipts and zero cancellation penalties saved our monthly travel overhead by 22%.'
              }
            ].map((t, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-3">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic">"{t.comment}"</p>
                <div className="pt-2 border-t border-slate-100">
                  <h5 className="font-bold text-slate-900 text-sm">{t.name}</h5>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE FAQ ACCORDION */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
            Everything You Need to Know About FairRide
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left font-bold text-slate-900 text-sm flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. BOTTOM HIGH-CONVERSION BANNER */}
      <section className="py-16 bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3.5 py-1.5 rounded-full backdrop-blur-md">
            START YOUR FIRST FAIR TRIP TODAY
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to Experience Fair Mobility?
          </h2>
          <p className="text-emerald-100 text-base max-w-xl mx-auto">
            Join thousands of daily commuters and verified captains enjoying transparent fares and stress-free rides across India.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={handleStartBooking}
              className="py-4 px-8 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-base shadow-2xl transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              BOOK A RIDE NOW
            </button>
            <button
              type="button"
              onClick={() => setInstallModalOpen(true)}
              className="py-4 px-7 rounded-2xl bg-slate-950/80 hover:bg-slate-950 text-white font-bold text-base border border-white/20 backdrop-blur-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <span>Install Mobile App</span>
            </button>
            <button
              onClick={() => {
                quickSwitchRole('DRIVER');
                setActiveRoleView('DRIVER');
              }}
              className="py-4 px-6 rounded-2xl bg-emerald-900/60 hover:bg-emerald-900/90 text-white font-bold text-base border border-white/30 backdrop-blur-md transition-all cursor-pointer"
            >
              Drive with FairRide
            </button>
          </div>
        </div>
      </section>

      {/* 8. CLEAN LIGHT-MODE FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-12 text-xs text-slate-500 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-base text-slate-950 tracking-tight">FAIRRIDE</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Book With Confidence. India's transparent zero-surge intelligent mobility platform.
            </p>
          </div>

          <div className="space-y-2">
            <h6 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">Passenger Services</h6>
            <ul className="space-y-1.5">
              <li><button onClick={handleStartBooking} className="hover:text-emerald-600 transition-colors">Book a Ride</button></li>
              <li><button onClick={handleStartBooking} className="hover:text-emerald-600 transition-colors">FareLock™ Guarantee</button></li>
              <li><button onClick={handleStartBooking} className="hover:text-emerald-600 transition-colors">Route Guardian™ Safety</button></li>
              <li><button onClick={handleStartBooking} className="hover:text-emerald-600 transition-colors">Wallet & FairPoints</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h6 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">Mobility & Captains</h6>
            <ul className="space-y-1.5">
              <li><button onClick={() => setInstallModalOpen(true)} className="hover:text-emerald-600 transition-colors font-semibold text-emerald-700">📱 Install Mobile App</button></li>
              <li><button onClick={() => { quickSwitchRole('DRIVER'); setActiveRoleView('DRIVER'); }} className="hover:text-emerald-600 transition-colors">Become a Captain (92%)</button></li>
              <li><button onClick={() => { quickSwitchRole('CORPORATE'); setActiveRoleView('CORPORATE'); }} className="hover:text-emerald-600 transition-colors">Corporate Mobility</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h6 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">Safety & Support</h6>
            <p className="text-slate-600">24/7 Safety Helpline: <br /><strong className="text-slate-900 font-mono">+91 1800-FAIR-RIDE</strong></p>
            <p className="text-[11px] text-slate-400">© 2026 FairRide Technologies. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
