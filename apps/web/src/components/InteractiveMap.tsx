import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  AlertTriangle,
  Shield,
  Compass,
  Activity,
  Car,
  Layers,
  Zap,
  RotateCcw,
  Volume2
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface InteractiveMapProps {
  pickupCoords?: [number, number];
  destinationCoords?: [number, number];
  pickupName?: string;
  destinationName?: string;
  driverCoords?: [number, number];
  showCorridor?: boolean;
  isDeviated?: boolean;
  onDeviationDetected?: (distanceMeters: number) => void;
  className?: string;
  allowSimulations?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  pickupCoords = [78.3811, 17.4474],
  destinationCoords = [78.4298, 17.2403],
  pickupName = 'Cyber Towers (Gate 1)',
  destinationName = 'RGIA Airport (Terminal 1)',
  driverCoords: propDriverCoords,
  showCorridor = true,
  isDeviated: propIsDeviated = false,
  onDeviationDetected,
  className = 'h-96 lg:h-[480px]',
  allowSimulations = true
}) => {
  const { lowInternetMode, activeBooking, setActiveBooking } = useAppStore();

  // Progress along the route (0 = pickup, 1 = destination) - Live continuous auto-tracking
  const [tripProgress, setTripProgress] = useState(0.20);
  const [simulatedDeviation, setSimulatedDeviation] = useState(false);
  const [isAutoMoving, setIsAutoMoving] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(48);

  // Smooth continuous live tracking loop
  useEffect(() => {
    if (!isAutoMoving) return;
    const interval = setInterval(() => {
      setTripProgress((prev) => {
        if (prev >= 0.96) return 0.04;
        return Number((prev + 0.004).toFixed(4));
      });
      // Realistic speed fluctuation around 42-54 km/h
      setCurrentSpeed(Math.round(44 + Math.sin(Date.now() / 1500) * 8));
    }, 60);
    return () => clearInterval(interval);
  }, [isAutoMoving]);

  // Reset progress when pickup or destination coordinates change
  useEffect(() => {
    setTripProgress(0.08);
  }, [pickupCoords?.[0], pickupCoords?.[1], destinationCoords?.[0], destinationCoords?.[1]]);

  const isDeviated = propIsDeviated || simulatedDeviation;

  // Dynamic projection of pickup and destination coordinates onto the SVG canvas
  const { startX, startY, controlX, controlY, endX, endY } = React.useMemo(() => {
    const pLng = Number(pickupCoords?.[0] ?? 78.3811);
    const pLat = Number(pickupCoords?.[1] ?? 17.4474);
    const dLng = Number(destinationCoords?.[0] ?? 78.4298);
    const dLat = Number(destinationCoords?.[1] ?? 17.2403);

    // Bounding calculation with min span safeguard
    const minLng = Math.min(pLng, dLng);
    const maxLng = Math.max(pLng, dLng);
    const minLat = Math.min(pLat, dLat);
    const maxLat = Math.max(pLat, dLat);

    const spanLng = Math.max(maxLng - minLng, 0.02);
    const spanLat = Math.max(maxLat - minLat, 0.02);

    // Add 25% padding so pins are clearly separated from boundaries
    const boundMinLng = minLng - spanLng * 0.25;
    const boundMaxLng = maxLng + spanLng * 0.25;
    const boundMinLat = minLat - spanLat * 0.25;
    const boundMaxLat = maxLat + spanLat * 0.25;

    // Canvas drawing boundaries
    const canvasMinX = 140;
    const canvasMaxX = 710;
    const canvasMinY = 100;
    const canvasMaxY = 320;

    const project = (lng: number, lat: number): [number, number] => {
      const normX = (lng - boundMinLng) / (boundMaxLng - boundMinLng);
      // Invert Y: higher latitude (North) maps to smaller Y (top of SVG)
      const normY = (boundMaxLat - lat) / (boundMaxLat - boundMinLat);
      const x = Math.round(canvasMinX + normX * (canvasMaxX - canvasMinX));
      const y = Math.round(canvasMinY + normY * (canvasMaxY - canvasMinY));
      return [
        Math.max(120, Math.min(730, x)),
        Math.max(90, Math.min(330, y))
      ];
    };

    const [sX, sY] = project(pLng, pLat);
    const [eX, eY] = project(dLng, dLat);

    // Compute Bezier control point with an organic highway arch perpendicular to direction
    const midX = (sX + eX) / 2;
    const midY = (sY + eY) / 2;
    const dx = eX - sX;
    const dy = eY - sY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Perpendicular vector for natural curve offset
    const perpOffset = Math.min(60, Math.max(25, dist * 0.15));
    const perpX = dist > 0 ? (-dy / dist) * perpOffset : 0;
    const perpY = dist > 0 ? (dx / dist) * perpOffset : -30;

    const cX = Math.round(Math.max(120, Math.min(730, midX + perpX)));
    const cY = Math.round(Math.max(80, Math.min(330, midY + perpY)));

    return {
      startX: sX,
      startY: sY,
      controlX: cX,
      controlY: cY,
      endX: eX,
      endY: eY
    };
  }, [pickupCoords, destinationCoords]);

  // Route path dynamic definition
  const routePath = `M ${startX} ${startY} Q ${controlX} ${controlY}, ${endX} ${endY}`;

  // Calculate coordinates along a smooth curve
  const t = tripProgress;
  // Bezier point formula: (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
  const normalX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
  const normalY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;

  // Tangent derivative for vehicle heading angle
  const tangentX = 2 * (1 - t) * (controlX - startX) + 2 * t * (endX - controlX);
  const tangentY = 2 * (1 - t) * (controlY - startY) + 2 * t * (endY - controlY);
  const headingDeg = Math.round((Math.atan2(tangentY, tangentX) * 180) / Math.PI);

  // If deviated, driver veers off toward north-east detour coordinates relative to route
  const detourX = Math.round(Math.max(100, Math.min(750, controlX + (endX - startX) * 0.15)));
  const detourY = Math.round(Math.max(65, Math.min(350, controlY - 55)));
  const driverScreenX = isDeviated ? detourX : normalX;
  const driverScreenY = isDeviated ? detourY : normalY;

  const handleToggleDeviation = () => {
    const nextState = !simulatedDeviation;
    setSimulatedDeviation(nextState);
    if (activeBooking) {
      setActiveBooking({ routeDeviationFlagged: nextState });
    }
    if (nextState && onDeviationDetected) {
      onDeviationDetected(580);
    }
  };

  const handleTestAutoRecovery = () => {
    if (activeBooking) {
      setActiveBooking({
        state: 'RECOVERY',
        routeDeviationFlagged: false,
        driver: {
          id: 'drv_recovery_99',
          name: 'Vikram Singh',
          phone: '+91 9800000010',
          rating: 4.95,
          vehicleModel: 'Honda City i-VTEC (Silver)',
          plateNumber: 'TS09EF8821',
          currentCoords: [78.382, 17.448],
          etaMinutes: 2
        }
      });
      setTimeout(() => {
        setActiveBooking({ state: 'DRIVER_ARRIVING' });
      }, 4000);
    }
  };

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border border-slate-200 bg-[#EEF4FB] ${className} select-none shadow-md transition-all duration-300`}
    >
      {/* Background Cartographic Vector Geometry */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-95"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 850 420"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Subtle City Road Grid Pattern */}
          <pattern id="road-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(148, 163, 184, 0.25)" strokeWidth="1" />
            <circle cx="30" cy="30" r="1.5" fill="rgba(148, 163, 184, 0.35)" />
          </pattern>

          {/* Durgam Cheruvu Lake Water Gradient */}
          <linearGradient id="lake-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.6" />
          </linearGradient>

          {/* Planned Safe Journey Route Gradient */}
          <linearGradient id="safe-route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>

          {/* Danger Detour Gradient */}
          <linearGradient id="detour-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="corridor-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Base Grid */}
        <rect width="100%" height="100%" fill="url(#road-grid)" />

        {/* Natural Land & Water Features: Durgam Cheruvu Lake */}
        <path
          d="M 220 220 C 260 190, 310 200, 340 240 C 370 280, 330 320, 270 310 C 230 300, 200 250, 220 220 Z"
          fill="url(#lake-gradient)"
          stroke="#38BDF8"
          strokeWidth="1.5"
        />
        <text x="255" y="260" fill="#0284C7" fontSize="9" fontWeight="700" letterSpacing="0.05em">
          DURGAM CHERUVU LAKE
        </text>

        {/* Express Arterial Highway Network */}
        {/* Outer Ring Road Express */}
        <path
          d="M -20 180 C 200 130, 480 90, 880 200"
          stroke="#E2E8F0"
          strokeWidth="12"
          fill="none"
        />
        <path
          d="M -20 180 C 200 130, 480 90, 880 200"
          stroke="#94A3B8"
          strokeWidth="2"
          strokeDasharray="8 6"
          fill="none"
        />
        <text x="390" y="112" fill="#64748B" fontSize="8.5" fontWeight="700" letterSpacing="0.08em">
          PVNR ELEVATED EXPRESSWAY (100 KM/H)
        </text>

        {/* Secondary Arterials */}
        <path d="M 130 -20 Q 180 200, 280 440" stroke="#E2E8F0" strokeWidth="8" fill="none" />
        <path d="M 450 -20 Q 420 180, 680 440" stroke="#E2E8F0" strokeWidth="8" fill="none" />
        <path d="M 50 360 C 240 280, 520 340, 820 290" stroke="#E2E8F0" strokeWidth="7" fill="none" />

        {/* Blue Metro Line */}
        <path
          d="M 50 70 L 260 140 L 440 230 L 640 290"
          stroke="#0284C7"
          strokeWidth="3.5"
          strokeDasharray="10 5"
          fill="none"
        />
        <circle cx="260" cy="140" r="4.5" fill="#0284C7" stroke="#ffffff" strokeWidth="2" />
        <text x="268" y="136" fill="#0284C7" fontSize="8" fontWeight="800">
          METRO HITECH STN
        </text>

        {/* Route Guardian Safe Corridor Tube (500m Safety Margin) */}
        {showCorridor && (
          <path
            d={routePath}
            stroke="rgba(16, 185, 129, 0.2)"
            strokeWidth="48"
            strokeLinecap="round"
            fill="none"
            filter="url(#corridor-glow)"
          />
        )}

        {/* Planned High-Confidence Trip Route */}
        <path
          d={routePath}
          stroke="url(#safe-route-gradient)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Real-time Animated Route Pulse Dotted Line */}
        <path
          d={routePath}
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="4 16"
          fill="none"
          className="animate-pulse opacity-90"
        />

        {/* Deviation Detour Vector Line */}
        {isDeviated && (
          <>
            <path
              d={`M ${normalX} ${normalY} Q ${(normalX + detourX) / 2} ${Math.min(normalY, detourY) - 25}, ${detourX} ${detourY}`}
              stroke="url(#detour-gradient)"
              strokeWidth="5"
              strokeDasharray="6 4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Warning zone indicator */}
            <circle cx={detourX} cy={detourY} r="35" fill="rgba(239, 68, 68, 0.15)" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="4 4" />
          </>
        )}

        {/* Real-time Roaming Ambient Cabs */}
        <g opacity="0.9">
          <g transform="translate(190, 165)">
            <circle cx="0" cy="0" r="10" fill="rgba(16, 185, 129, 0.25)" />
            <circle cx="0" cy="0" r="4.5" fill="#059669" />
          </g>
          <g transform="translate(520, 235)">
            <circle cx="0" cy="0" r="10" fill="rgba(2, 132, 199, 0.25)" />
            <circle cx="0" cy="0" r="4.5" fill="#0284C7" />
          </g>
          <g transform="translate(340, 95)">
            <circle cx="0" cy="0" r="10" fill="rgba(16, 185, 129, 0.25)" />
            <circle cx="0" cy="0" r="4.5" fill="#059669" />
          </g>
          <g transform="translate(620, 185)">
            <circle cx="0" cy="0" r="10" fill="rgba(217, 119, 6, 0.25)" />
            <circle cx="0" cy="0" r="4.5" fill="#D97706" />
          </g>
          <g transform="translate(270, 310)">
            <circle cx="0" cy="0" r="10" fill="rgba(16, 185, 129, 0.25)" />
            <circle cx="0" cy="0" r="4.5" fill="#059669" />
          </g>
        </g>
      </svg>

      {/* Floating Header Badges */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        {/* Left: Route Guardian Live Corridor Status */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div
            className={`px-3 py-1.5 rounded-2xl backdrop-blur-md border text-xs font-black flex items-center gap-2 shadow-md transition-all ${
              isDeviated
                ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                : 'bg-white/95 border-emerald-200 text-emerald-800'
            }`}
          >
            <Shield className={`w-4 h-4 ${isDeviated ? 'text-rose-600' : 'text-emerald-600'}`} />
            <span>
              {isDeviated ? 'ROUTE DEVIATION: 580m DETOUR FLAGGED' : 'ROUTE GUARDIAN: 100% CORRIDOR ADHERENCE'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isDeviated ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
              }`}
            />
          </div>
        </div>

        {/* Right: Live Traffic Flow & Real-time Cabs Available Badges */}
        <div className="hidden sm:flex items-center gap-2 pointer-events-auto">
          <div className="px-2.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-200 text-[11px] font-bold text-emerald-700 flex items-center gap-1.5 shadow-sm">
            <Car className="w-3 h-3 text-emerald-600" />
            <span>6 Cabs Nearby (2-4 min)</span>
          </div>

          <div className="px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-sm">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Expressway: Optimal</span>
          </div>
        </div>
      </div>

      {/* Origin Pickup Point Marker (Left Hub) */}
      <div
        className="absolute z-10 flex flex-col items-center pointer-events-none transition-all duration-700 ease-out"
        style={{ left: `${(startX / 850) * 100}%`, top: `${(startY / 420) * 100}%`, transform: 'translate(-50%, -100%)' }}
      >
        <div className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-black text-[11px] shadow-lg flex items-center gap-1.5 border border-emerald-400 max-w-[210px]" title={pickupName}>
          <MapPin className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
          <span className="truncate">PICKUP: {pickupName}</span>
        </div>
        <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-md shadow-emerald-600/50 mt-1" />
      </div>

      {/* Destination Dropoff Point Marker (Right Hub) */}
      <div
        className="absolute z-10 flex flex-col items-center pointer-events-none transition-all duration-700 ease-out"
        style={{ left: `${(endX / 850) * 100}%`, top: `${(endY / 420) * 100}%`, transform: 'translate(-50%, -100%)' }}
      >
        <div className="px-2.5 py-1 rounded-xl bg-cyan-600 text-white font-black text-[11px] shadow-lg flex items-center gap-1.5 border border-cyan-400 max-w-[210px]" title={destinationName}>
          <Navigation className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
          <span className="truncate">DESTINATION: {destinationName}</span>
        </div>
        <div className="w-4 h-4 rounded-full bg-cyan-500 border-2 border-white shadow-md shadow-cyan-600/50 mt-1" />
      </div>

      {/* Moving Driver Vehicle Marker (Smooth Real-Time GPS Animation) */}
      <div
        className="absolute z-30 flex flex-col items-center transition-all duration-75 ease-linear pointer-events-none"
        style={{
          left: `${(driverScreenX / 850) * 100}%`,
          top: `${(driverScreenY / 420) * 100}%`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Pulsing Radar Rings */}
        {!lowInternetMode && (
          <>
            <div
              className={`absolute w-20 h-20 rounded-full pointer-events-none animate-ping opacity-25 ${
                isDeviated ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
            />
            <div
              className={`absolute w-12 h-12 rounded-full pointer-events-none opacity-40 ${
                isDeviated ? 'bg-rose-500/30' : 'bg-emerald-500/30'
              }`}
            />
          </>
        )}

        {/* Vehicle Icon Badge with Dynamic Direction Heading Rotation */}
        <div
          className={`p-2.5 rounded-2xl border-2 shadow-xl transition-transform duration-100 ${
            isDeviated
              ? 'bg-rose-600 border-white text-white shadow-rose-600/50 scale-110 animate-bounce'
              : 'bg-white border-emerald-500 text-emerald-600 shadow-emerald-500/40 hover:scale-110'
          }`}
          style={{
            transform: `rotate(${isDeviated ? 45 : headingDeg}deg)`
          }}
        >
          <Car className="w-5 h-5 stroke-[2.5]" />
        </div>

        {/* Live Dynamic Telemetry & Speed Tag */}
        <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/90 text-white backdrop-blur-md border border-slate-700 text-[10px] font-black tracking-wide shadow-lg flex items-center gap-1.5 whitespace-nowrap">
          {isDeviated ? (
            <span className="text-rose-400 flex items-center gap-1 font-bold">
              <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />
              OFF-ROUTE • 580m DETOUR
            </span>
          ) : (
            <div className="flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 font-mono">{currentSpeed} km/h</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-200">En Route ({Math.round((1 - tripProgress) * 32)}m ETA)</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Simulation & Testing Controls */}
      {allowSimulations && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 z-20">
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-lg overflow-x-auto">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-2 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              SIMULATE:
            </span>

            {/* Test Detour Button */}
            <button
              onClick={handleToggleDeviation}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
                isDeviated
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              <span>{isDeviated ? 'Reset Route' : 'Test Detour'}</span>
            </button>

            {/* Test Driver Motion */}
            <button
              onClick={() => setIsAutoMoving(!isAutoMoving)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
                isAutoMoving
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Car className="w-3 h-3 text-emerald-600" />
              <span>{isAutoMoving ? 'Pause Motion' : 'Auto-Move Cab'}</span>
            </button>

            {/* Test Auto-Recovery (Solves Driver Cancellation) */}
            {activeBooking && (
              <button
                onClick={handleTestAutoRecovery}
                className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition-all flex items-center gap-1"
                title="Simulate driver cancellation with zero penalty auto-reassignment"
              >
                <RotateCcw className="w-3 h-3 text-amber-600" />
                <span>Test Auto-Recovery</span>
              </button>
            )}
          </div>

          {/* Compass Rose */}
          <div className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
            <Compass className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
      )}
    </div>
  );
};
