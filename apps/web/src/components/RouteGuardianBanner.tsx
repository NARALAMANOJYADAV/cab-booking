import React from 'react';
import { AlertTriangle, ShieldCheck, PhoneCall, HelpCircle, Check } from 'lucide-react';

interface RouteGuardianBannerProps {
  deviationMeters: number;
  onRespond: (action: 'IM_SAFE' | 'NEED_HELP' | 'EMERGENCY') => void;
  className?: string;
}

export const RouteGuardianBanner: React.FC<RouteGuardianBannerProps> = ({
  deviationMeters,
  onRespond,
  className = ''
}) => {
  return (
    <div className={`rounded-2xl border-2 border-rose-500/80 bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/90 p-4 shadow-2xl animate-pulse ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/40">
          <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-white text-sm tracking-wide">
              ROUTE GUARDIAN: DETOUR FLAGGED
            </h4>
            <span className="text-[10px] bg-rose-500 text-white font-black px-1.5 py-0.5 rounded">
              {deviationMeters}m OFF ROUTE
            </span>
          </div>
          <p className="text-xs text-rose-200/90 mt-1">
            We noticed the vehicle departed from the calculated safe corridor. Are you okay? Drivers may legitimately detour for traffic, diversions, or road closures.
          </p>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <button
              onClick={() => onRespond('IM_SAFE')}
              className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-600/30 transition-all"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>I'M SAFE</span>
            </button>

            <button
              onClick={() => onRespond('NEED_HELP')}
              className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-amber-600/30 transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>NEED HELP</span>
            </button>

            <button
              onClick={() => onRespond('EMERGENCY')}
              className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-center gap-1 shadow-md shadow-rose-600/50 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>SOS CALL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
