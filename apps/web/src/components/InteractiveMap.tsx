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

  // Progress along the route (0 = pickup, 1 = destination)
  const [tripProgress, setTripProgress] = useState(0.28);
  const [simulatedDeviation, setSimulatedDeviation] = useState(false);
  const [isAutoMoving, setIsAutoMoving] = useState(false);

  // Auto-move simulation
  useEffect(() => {
    if (!isAutoMoving) return;
    const interval = setInterval(() => {
      setTripProgress((prev) => {
        if (prev >= 0.95) return 0.15;
        return prev + 0.05;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [isAutoMoving]);

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
      className={`relative w-full rounded-3xl overflow-hidden border border-slate-700/60 bg-[#070b14] ${className} select-none shadow-2xl transition-all duration-300`}
    >
      {/* Background Cartographic Vector Geometry */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-90"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 850 420"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Subtle City Road Grid Pattern */}
          <pattern id="road-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            <circle cx="30" cy="30" r="1" fill="rgba(255, 255, 255, 0.05)" />
          </pattern>

          {/* Durgam Cheruvu Lake Water Gradient */}
          <linearGradient id="lake-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.1" />
          </linearGradient>

          {/* Planned Safe Journey Route Gradient */}
          <linearGradient id="safe-route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          {/* Danger Detour Gradient */}
          <linearGradient id="detour-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
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
          stroke="rgba(56, 189, 248, 0.2)"
          strokeWidth="1.5"
        />
        <text x="255" y="260" fill="rgba(56, 189, 248, 0.45)" fontSize="9" fontWeight="700" letterSpacing="0.05em">
          DURGAM CHERUVU LAKE
        </text>

        {/* Express Arterial Highway Network */}
        {/* Outer Ring Road Express */}
        <path
          d="M -20 180 C 200 130, 480 90, 880 200"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
          fill="none"
        />
        <path
          d="M -20 180 C 200 130, 480 90, 880 200"
          stroke="rgba(148, 163, 184, 0.25)"
          strokeWidth="2"
          strokeDasharray="8 6"
          fill="none"
        />
        <text x="390" y="112" fill="rgba(148, 163, 184, 0.4)" fontSize="8.5" fontWeight="600" letterSpacing="0.08em">
          PVNR ELEVATED EXPRESSWAY (100 KM/H)
        </text>

        {/* Secondary Arterials */}
        <path d="M 130 -20 Q 180 200, 280 440" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" />
        <path d="M 450 -20 Q 420 180, 680 440" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" />
        <path d="M 50 360 C 240 280, 520 340, 820 290" stroke="rgba(255,255,255,0.05)" strokeWidth="5" fill="none" />

        {/* Blue Neon Metro Line */}
        <path
          d="M 50 70 L 260 140 L 440 230 L 640 290"
          stroke="rgba(6, 182, 212, 0.45)"
          strokeWidth="3.5"
          strokeDasharray="10 5"
          fill="none"
        />
        <circle cx="260" cy="140" r="4.5" fill="#06b6d4" stroke="#0f172a" strokeWidth="2" />
        <text x="268" y="136" fill="#06b6d4" fontSize="8" fontWeight="700">
          METRO HITECH STN
        </text>

        {/* Route Guardian Safe Corridor Tube (500m Safety Margin) */}
        {showCorridor && (
          <path
            d={routePath}
            stroke="rgba(16, 185, 129, 0.16)"
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
          className="animate-pulse opacity-75"
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
            <circle cx={detourX} cy={detourY} r="35" fill="rgba(239, 68, 68, 0.18)" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" />
          </>
        )}

        {/* Real-time Roaming Ambient Cabs */}
        <g opacity="0.85">
          <g transform="translate(190, 165)">
            <circle cx="0" cy="0" r="10" fill="rgba(16, 185, 129, 0.2)" />
            <circle cx="0" cy="0" r="4" fill="#10b981" />
          </g>
          <g transform="translate(520, 235)">
            <circle cx="0" cy="0" r="10" fill="rgba(6, 182, 212, 0.2)" />
            <circle cx="0" cy="0" r="4" fill="#06b6d4" />
          </g>
          <g transform="translate(340, 95)">
            <circle cx="0" cy="0" r="10" fill="rgba(16, 185, 129, 0.2)" />
            <circle cx="0" cy="0" r="4" fill="#10b981" />
          </g>
          <g transform="translate(620, 185)">
            <circle cx="0" cy="0" r="10" fill="rgba(245, 158, 11, 0.2)" />
            <circle cx="0" cy="0" r="4" fill="#f59e0b" />
          </g>
          <g transform="translate(270, 310)">
            <circle cx="0" cy="0" r="10" fill="rgba(16, 185, 129, 0.2)" />
            <circle cx="0" cy="0" r="4" fill="#10b981" />
          </g>
        </g>
      </svg>

      {/* Floating Header Badges */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        {/* Left: Route Guardian Live Corridor Status */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div
            className={`px-3 py-1.5 rounded-2xl backdrop-blur-md border text-xs font-black flex items-center gap-2 shadow-lg transition-all ${
              isDeviated
                ? 'bg-rose-950/85 border-rose-500/80 text-rose-200 animate-pulse'
                : 'bg-slate-900/85 border-emerald-500/40 text-emerald-300'
            }`}
          >
            <Shield className={`w-4 h-4 ${isDeviated ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span>
              {isDeviated ? 'ROUTE DEVIATION: 580m DETOUR FLAGGED' : 'ROUTE GUARDIAN: 100% CORRIDOR ADHERENCE'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isDeviated ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'
              }`}
            />
          </div>
        </div>

        {/* Right: Live Traffic Flow & Real-time Cabs Available Badges */}
        <div className="hidden sm:flex items-center gap-2 pointer-events-auto">
          <div className="px-2.5 py-1.5 rounded-2xl bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 shadow-lg">
            <Car className="w-3 h-3 text-emerald-400" />
            <span>6 Cabs Nearby (2-4 min)</span>
          </div>

          <div className="px-3 py-1.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 text-xs font-bold text-slate-200 flex items-center gap-2 shadow-lg">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Expressway: Optimal</span>
          </div>
        </div>
      </div>

      {/* Origin Pickup Point Marker (Left Hub) */}
      <div
        className="absolute z-10 flex flex-col items-center pointer-events-none transition-all duration-700 ease-out"
        style={{ left: `${(startX / 850) * 100}%`, top: `${(startY / 420) * 100}%`, transform: 'translate(-50%, -100%)' }}
      >
        <div className="px-2.5 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-[11px] shadow-xl flex items-center gap-1.5 border border-emerald-300 max-w-[210px]" title={pickupName}>
          <MapPin className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
          <span className="truncate">PICKUP: {pickupName}</span>
        </div>
        <div className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-lg shadow-emerald-500/80 mt-1" />
      </div>

      {/* Destination Dropoff Point Marker (Right Hub) */}
      <div
        className="absolute z-10 flex flex-col items-center pointer-events-none transition-all duration-700 ease-out"
        style={{ left: `${(endX / 850) * 100}%`, top: `${(endY / 420) * 100}%`, transform: 'translate(-50%, -100%)' }}
      >
        <div className="px-2.5 py-1 rounded-xl bg-cyan-500 text-slate-950 font-black text-[11px] shadow-xl flex items-center gap-1.5 border border-cyan-200 max-w-[210px]" title={destinationName}>
          <Navigation className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
          <span className="truncate">DESTINATION: {destinationName}</span>
        </div>
        <div className="w-4 h-4 rounded-full bg-cyan-400 border-2 border-slate-950 shadow-lg shadow-cyan-400/80 mt-1" />
      </div>

      {/* Moving Driver Vehicle Marker */}
      <div
        className="absolute z-30 flex flex-col items-center transition-all duration-700 ease-out"
        style={{
          left: `${(driverScreenX / 850) * 100}%`,
          top: `${(driverScreenY / 420) * 100}%`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Pulsing Radar Ring */}
        {!lowInternetMode && (
          <div
            className={`absolute w-16 h-16 rounded-full pointer-events-none radar-ring ${
              isDeviated ? 'bg-rose-500/25' : 'bg-emerald-500/25'
            }`}
          />
        )}

        {/* Vehicle Icon Badge */}
        <div
          className={`p-2.5 rounded-2xl border-2 shadow-2xl transition-all ${
            isDeviated
              ? 'bg-rose-600 border-white text-white shadow-rose-600/70 scale-110 animate-bounce'
              : 'bg-slate-950 border-emerald-400 text-emerald-400 shadow-emerald-500/50 hover:scale-105'
          }`}
        >
          <Car className="w-5 h-5 stroke-[2.5]" />
        </div>

        {/* Live Driver Tag */}
        <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-slate-700 text-[10px] font-black tracking-wide text-white shadow-xl flex items-center gap-1">
          {isDeviated ? (
            <span className="text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              OFF-ROUTE ALERT
            </span>
          ) : (
            <span className="text-slate-200">Rajesh (3 min away)</span>
          )}
        </div>
      </div>

      {/* Floating Bottom Simulation & Testing Controls */}
      {allowSimulations && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 z-20">
          <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              SIMULATE:
            </span>

            {/* Test Detour Button */}
            <button
              onClick={handleToggleDeviation}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
                isDeviated
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>{isDeviated ? 'Reset Route' : 'Test Detour'}</span>
            </button>

            {/* Test Driver Motion */}
            <button
              onClick={() => setIsAutoMoving(!isAutoMoving)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
                isAutoMoving
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <Car className="w-3 h-3 text-emerald-400" />
              <span>{isAutoMoving ? 'Pause Motion' : 'Auto-Move Cab'}</span>
            </button>

            {/* Test Auto-Recovery (Solves Driver Cancellation) */}
            {activeBooking && (
              <button
                onClick={handleTestAutoRecovery}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/40 transition-all flex items-center gap-1"
                title="Simulate driver cancellation with zero penalty auto-reassignment"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>Test Auto-Recovery</span>
              </button>
            )}
          </div>

          {/* Compass Rose */}
          <div className="w-8 h-8 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 flex items-center justify-center text-slate-400 shadow">
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      )}
    </div>
  );
};
