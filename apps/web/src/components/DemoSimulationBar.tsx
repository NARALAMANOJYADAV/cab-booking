import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Play, RotateCcw, AlertTriangle, ShieldAlert, CheckCircle, ChevronUp, ChevronDown, Zap } from 'lucide-react';

export const DemoSimulationBar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { activeBooking, setActiveBooking, updateBookingState } = useAppStore();

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
    // 1. Mark driver cancelled
    // 2. Put into RECOVERY
    // 3. Immediately reassign replacement driver with zero penalty
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

  return (
    <aside aria-label="Demo environment controls" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-4xl w-[95%]">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-brand-500/40 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">
        <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 text-xs font-bold text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-white font-extrabold tracking-wide uppercase flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              DEMO SIMULATION CONTROLLER (ONE-CLICK TESTING)
            </span>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white p-1 rounded"
          >
            {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {!collapsed && (
          <div className="p-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <button
              onClick={handleSimulateRequest}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 flex flex-col items-center gap-1 text-center"
            >
              <span>1. Request Ride</span>
              <span className="text-[10px] text-slate-400 font-normal">Locks fare & initiates</span>
            </button>

            <button
              onClick={handleSimulateDriverAccept}
              className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex flex-col items-center gap-1 text-center"
            >
              <span>2. Driver Accepts</span>
              <span className="text-[10px] text-emerald-400 font-normal">Rajesh assigned (3m)</span>
            </button>

            <button
              onClick={handleSimulateDriverCancelAndAutoRecovery}
              className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold border border-amber-500/30 flex flex-col items-center gap-1 text-center"
              title="Test the breakthrough Auto-Recovery Engine: Driver cancels -> platform immediately recovers and reassigns without penalty"
            >
              <span className="flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>3. Auto-Recovery</span>
              </span>
              <span className="text-[10px] text-amber-400 font-normal">Driver cancel &gt; Auto heal</span>
            </button>

            <button
              onClick={handleSimulateRouteDeviation}
              className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold border border-rose-500/30 flex flex-col items-center gap-1 text-center"
              title="Test Route Guardian deviation alarm"
            >
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>4. Detour / SOS</span>
              </span>
              <span className="text-[10px] text-rose-400 font-normal">Route Guardian prompt</span>
            </button>

            <button
              onClick={handleSimulateCompleteTrip}
              className="p-2 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 font-bold border border-brand-500/40 flex flex-col items-center gap-1 text-center col-span-2 sm:col-span-1"
            >
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>5. Finish Trip</span>
              </span>
              <span className="text-[10px] text-brand-400 font-normal">Fare Audit Receipt</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
