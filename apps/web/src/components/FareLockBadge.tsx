import React, { useState } from 'react';
import { Lock, ShieldCheck, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { FareBreakdown } from '@fairride/types';
import { formatCurrencyINR } from '@fairride/shared';

interface FareLockBadgeProps {
  fare: number;
  breakdown?: FareBreakdown;
  validMinutes?: number;
  className?: string;
}

export const FareLockBadge: React.FC<FareLockBadgeProps> = ({
  fare,
  breakdown,
  validMinutes = 15,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const defaultBreakdown: FareBreakdown = breakdown || {
    baseFare: Math.round(fare * 0.25),
    distanceCharge: Math.round(fare * 0.50),
    timeComponent: Math.round(fare * 0.12),
    toll: 0,
    platformFee: Math.round(fare * 0.08),
    tax: Math.round(fare * 0.05),
    totalFare: fare,
    currency: 'INR'
  };

  return (
    <div
      className={`rounded-2xl border border-amber-300 bg-amber-50/80 px-4 py-3 shadow-sm flex flex-col justify-center transition-all ${className}`}
    >
      {/* Sleek Horizontal Content Row */}
      <div className="flex items-center justify-between gap-3 w-full">
        {/* Left: Icon + Title + Guarantee Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-sm shrink-0">
            <Lock className="w-5 h-5 stroke-[2.8]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-black tracking-wider uppercase text-amber-900">
                FARE LOCKED
              </span>
              <span className="text-[9px] sm:text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded-full border border-amber-300">
                GUARANTEED
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
              Zero sudden surge • No surprise charges
            </p>
          </div>
        </div>

        {/* Right: Large Price + Breakdown Link */}
        <div className="text-right shrink-0">
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight leading-none">
            {formatCurrencyINR(fare)}
          </p>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[10px] sm:text-[11px] text-amber-800 hover:text-amber-900 font-bold hover:underline flex items-center gap-0.5 justify-end mt-1 ml-auto cursor-pointer"
          >
            <span>{showDetails ? 'Hide' : 'Inspect'} breakdown</span>
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expandable Breakdown Details */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-amber-200 text-xs space-y-2 animate-fadeIn">
          <div className="flex justify-between text-slate-700">
            <span>Base Fare (First 2.5 km)</span>
            <span className="font-mono font-bold text-slate-900">{formatCurrencyINR(defaultBreakdown.baseFare)}</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>Distance Charge</span>
            <span className="font-mono font-bold text-slate-900">{formatCurrencyINR(defaultBreakdown.distanceCharge)}</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>Time Component</span>
            <span className="font-mono font-bold text-slate-900">{formatCurrencyINR(defaultBreakdown.timeComponent)}</span>
          </div>
          {defaultBreakdown.toll > 0 && (
            <div className="flex justify-between text-slate-700">
              <span>Highway Toll (Electronic Fastag)</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrencyINR(defaultBreakdown.toll)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-500">
            <span>FairRide Platform Fee (8%)</span>
            <span className="font-mono">{formatCurrencyINR(defaultBreakdown.platformFee)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>GST / Taxes (5%)</span>
            <span className="font-mono">{formatCurrencyINR(defaultBreakdown.tax)}</span>
          </div>

          <div className="pt-2 border-t border-amber-200 flex justify-between font-black text-slate-900 text-sm">
            <span className="text-amber-900">Total Guaranteed Upfront Fare</span>
            <span className="font-mono text-emerald-700 font-black">{formatCurrencyINR(defaultBreakdown.totalFare)}</span>
          </div>

          <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200 text-[11px] text-slate-600 flex items-start gap-2 mt-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              Once booked, this fare cannot be increased by the driver. Any variable modification produces an itemized <strong>Fare Audit</strong> receipt after the trip.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
