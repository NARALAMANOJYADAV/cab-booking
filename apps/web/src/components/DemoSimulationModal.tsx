import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  Zap,
  Play,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  X,
  Car,
  Shield,
  Phone,
  Clock,
  Sparkles,
  RefreshCw,
  FileText
} from 'lucide-react';
import { formatCurrencyINR } from '@fairride/shared';

interface DemoSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoSimulationModal: React.FC<DemoSimulationModalProps> = ({ isOpen, onClose }) => {
  const { activeBooking, setActiveBooking, updateBookingState } = useAppStore();
  const [lastAction, setLastAction] = useState<string | null>(null);

  if (!isOpen) return null;

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
    setLastAction('Step 1: Ride requested & fare locked at ₹617 with Zero-Surge Guarantee!');
  };

  const handleSimulateDriverAccept = () => {
    if (!activeBooking) handleSimulateRequest();
    setActiveBooking({
      state: 'DRIVER_ACCEPTED',
      driver: {
        id: 'drv_demo_rajesh',
        name: 'Rajesh Kumar',
        phone: '+91 9800000003',
        rating: 4.92,
        vehicleModel: 'Hyundai Aura (White)',
        plateNumber: 'TS 07 UB 1420',
        currentCoords: [78.3840, 17.4490],
        etaMinutes: 3
      },
      timeline: [
        ...(activeBooking?.timeline || []),
        { event: 'DRIVER_ACCEPTED', actor: 'DRIVER', timestamp: new Date().toLocaleTimeString() }
      ]
    });
    setLastAction('Step 2: Driver Rajesh Kumar (TS07UB1420) accepted! ETA 3 mins.');
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
    setLastAction('Step 3: Driver cancelled -> Auto-Recovery Engine triggered!');

    setTimeout(() => {
      setActiveBooking({
        state: 'DRIVER_ASSIGNED',
        isRecovered: true,
        driver: {
          id: 'drv_demo_venkatesh',
          name: 'Venkatesh Babu (Auto-Recovered)',
          phone: '+91 9600000012',
          rating: 4.95,
          vehicleModel: 'Maruti Suzuki Swift Dzire (Silver)',
          plateNumber: 'TS 08 AB 8811',
          currentCoords: [78.3820, 17.4450],
          etaMinutes: 2
        },
        timeline: [
          ...(activeBooking?.timeline || []),
          { event: 'AUTO_RECOVERY_SUCCESS', actor: 'SYSTEM', timestamp: new Date().toLocaleTimeString() }
        ]
      });
      setLastAction('Step 3 Success: Replacement driver Venkatesh Babu auto-reassigned with ZERO PENALTY!');
    }, 1800);
  };

  const handleSimulateRouteDeviation = () => {
    setActiveBooking({
      state: 'TRIP_IN_PROGRESS',
      routeDeviationFlagged: true
    });
    setLastAction('Step 4: 580m Route Deviation simulated! Route Guardian alarm triggered.');
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
    setLastAction('Step 5: Trip completed! Fare Audit receipt generated & settled.');
  };

  const handleReset = () => {
    setActiveBooking(null);
    setLastAction('Simulation cleared. Ready for fresh testing.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-wide uppercase">
                  DEMO SIMULATION CONTROLLER
                </h3>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  ONE-CLICK TESTING
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Trigger any core FairRide innovation with 1-click to test the dynamic platform
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Status Notification */}
        {lastAction && (
          <div className="px-5 py-2.5 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span>⚡ {lastAction}</span>
            <button
              onClick={() => setLastAction(null)}
              className="text-[10px] text-emerald-400 hover:underline uppercase"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 5 One-Click Scenario Cards */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {/* 1. Request Ride */}
          <div
            onClick={handleSimulateRequest}
            className="p-4 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 group-hover:text-white group-hover:bg-slate-700 flex items-center justify-center font-black">
                1
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>1. Request Ride & Lock Fare</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                    ₹617 Locked
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  Simulates Cyber Towers Gate 1 to RGIA Airport with zero-surge guarantee.
                </p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-xl bg-slate-800 group-hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700">
              Run Step 1
            </button>
          </div>

          {/* 2. Driver Accepts */}
          <div
            onClick={handleSimulateDriverAccept}
            className="p-4 rounded-2xl bg-emerald-950/20 hover:bg-emerald-950/30 border border-emerald-500/30 hover:border-emerald-500/50 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                2
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                  <span>2. Driver Accepts Ride</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded">
                    Rajesh (3 min away)
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  Assigns verified partner Rajesh Kumar (Hyundai Aura TS 07 UB 1420).
                </p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-xl bg-emerald-500/20 group-hover:bg-emerald-500/30 text-xs font-bold text-emerald-300 border border-emerald-500/40">
              Run Step 2
            </button>
          </div>

          {/* 3. Driver Cancel & Auto-Recovery */}
          <div
            onClick={handleSimulateDriverCancelAndAutoRecovery}
            className="p-4 rounded-2xl bg-amber-950/20 hover:bg-amber-950/30 border border-amber-500/40 hover:border-amber-500/60 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                <RotateCcw className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>3. Driver Cancel &amp; Auto-Recovery Engine</span>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded">
                    ZERO PENALTY
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  Driver cancels &rarr; System immediately heals and auto-reassigns replacement driver!
                </p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-xl bg-amber-500/20 group-hover:bg-amber-500/30 text-xs font-bold text-amber-300 border border-amber-500/40">
              Run Step 3
            </button>
          </div>

          {/* 4. Route Detour & SOS */}
          <div
            onClick={handleSimulateRouteDeviation}
            className="p-4 rounded-2xl bg-rose-950/20 hover:bg-rose-950/30 border border-rose-500/30 hover:border-rose-500/50 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors flex items-center gap-1.5">
                  <span>4. 580m Route Detour &amp; Route Guardian Alert</span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded">
                    SAFETY ALARM
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  Simulates cab veering off corridor. Prompts passenger "Are you safe?" & dispatch alert.
                </p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-xl bg-rose-500/20 group-hover:bg-rose-500/30 text-xs font-bold text-rose-300 border border-rose-500/40">
              Run Step 4
            </button>
          </div>

          {/* 5. Finish Trip */}
          <div
            onClick={handleSimulateCompleteTrip}
            className="p-4 rounded-2xl bg-cyan-950/20 hover:bg-cyan-950/30 border border-cyan-500/30 hover:border-cyan-500/50 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <span>5. Complete Trip &amp; Download Fare Audit</span>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded">
                    RECEIPT READY
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  Completes ride, credits driver wallet (92%), and issues tamper-proof audit receipt.
                </p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-xl bg-cyan-500/20 group-hover:bg-cyan-500/30 text-xs font-bold text-cyan-300 border border-cyan-500/40">
              Run Step 5
            </button>
          </div>
        </div>

        {/* Footer with Active Status & Reset */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Current Trip State:</span>
            <span className="font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {activeBooking?.state || 'NO ACTIVE TRIP'}
            </span>
            {activeBooking?.verificationPin && (
              <span className="font-mono font-bold text-slate-300">
                (PIN: {activeBooking.verificationPin})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeBooking && (
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Trip</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
