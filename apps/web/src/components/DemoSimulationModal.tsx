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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 tracking-wide uppercase">
                  DEMO SIMULATION CONTROLLER
                </h3>
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 font-black px-2 py-0.5 rounded-full">
                  ONE-CLICK TESTING
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Trigger any core FairRide innovation with 1-click to test the dynamic platform
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Status Notification */}
        {lastAction && (
          <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span>⚡ {lastAction}</span>
            <button
              onClick={() => setLastAction(null)}
              className="text-[10px] text-emerald-700 hover:underline uppercase cursor-pointer"
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
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 group-hover:bg-slate-300 flex items-center justify-center font-black">
                1
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 transition-colors flex items-center gap-1.5">
                  <span>1. Request Ride & Lock Fare</span>
                  <span className="text-[10px] bg-white border border-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-mono font-bold">
                    ₹617 Locked
                  </span>
                </h4>
                <p className="text-xs text-slate-500">
                  Simulates Cyber Towers Gate 1 to RGIA Airport with zero-surge guarantee.
                </p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 group-hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer">
              Run Step 1
            </button>
          </div>

          {/* 2. Driver Accepts */}
          <div
            onClick={handleSimulateDriverAccept}
            className="p-4 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                2
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950 transition-colors flex items-center gap-1.5">
                  <span>2. Driver Accepts Ride</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                    Rajesh (3 min away)
                  </span>
                </h4>
                <p className="text-xs text-slate-600">
                  Assigns verified partner Rajesh Kumar (Hyundai Aura TS 07 UB 1420).
                </p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-xs font-bold text-white shadow-sm cursor-pointer">
              Run Step 2
            </button>
          </div>

          {/* 3. Driver Cancel & Auto-Recovery */}
          <div
            onClick={handleSimulateDriverCancelAndAutoRecovery}
            className="p-4 rounded-2xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                <RotateCcw className="w-5 h-5 animate-spin text-amber-700" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950 transition-colors flex items-center gap-1.5">
                  <span>3. Driver Cancel &amp; Auto-Recovery Engine</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-black px-1.5 py-0.2 rounded">
                    ZERO PENALTY
                  </span>
                </h4>
                <p className="text-xs text-slate-600">
                  Driver cancels &rarr; System immediately heals and auto-reassigns replacement driver!
                </p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-xl bg-amber-600 group-hover:bg-amber-700 text-xs font-bold text-white shadow-sm cursor-pointer">
              Run Step 3
            </button>
          </div>

          {/* 4. Route Detour & SOS */}
          <div
            onClick={handleSimulateRouteDeviation}
            className="p-4 rounded-2xl bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-black">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-950 transition-colors flex items-center gap-1.5">
                  <span>4. 580m Route Detour &amp; Route Guardian Alert</span>
                  <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded font-bold">
                    SAFETY ALARM
                  </span>
                </h4>
                <p className="text-xs text-slate-600">
                  Simulates cab veering off corridor. Prompts passenger "Are you safe?" & dispatch alert.
                </p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-xl bg-rose-600 group-hover:bg-rose-700 text-xs font-bold text-white shadow-sm cursor-pointer">
              Run Step 4
            </button>
          </div>

          {/* 5. Finish Trip */}
          <div
            onClick={handleSimulateCompleteTrip}
            className="p-4 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-indigo-950 transition-colors flex items-center gap-1.5">
                  <span>5. Complete Trip &amp; Download Fare Audit</span>
                  <span className="text-[10px] bg-indigo-200 text-indigo-900 px-1.5 py-0.2 rounded font-bold">
                    RECEIPT READY
                  </span>
                </h4>
                <p className="text-xs text-slate-600">
                  Completes ride, credits driver wallet (92%), and issues tamper-proof audit receipt.
                </p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 text-xs font-bold text-white shadow-sm cursor-pointer">
              Run Step 5
            </button>
          </div>
        </div>

        {/* Footer with Active Status & Reset */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Current Trip State:</span>
            <span className="font-mono font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
              {activeBooking?.state || 'NO ACTIVE TRIP'}
            </span>
            {activeBooking?.verificationPin && (
              <span className="font-mono font-bold text-slate-600">
                (PIN: {activeBooking.verificationPin})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeBooking && (
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Trip</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
