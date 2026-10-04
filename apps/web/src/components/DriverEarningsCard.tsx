import React, { useState } from 'react';
import { Fuel, ArrowRight, DollarSign, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DriverNetEarningsPreview } from '@fairride/types';
import { formatCurrencyINR } from '@fairride/shared';
import { DRIVER_DECLINE_REASONS } from '@fairride/constants';

interface DriverEarningsCardProps {
  request: {
    bookingId: string;
    pickup: string;
    destination: string;
    pickupPointNotice?: string;
    distanceKm: number;
    durationMin: number;
    earnings: DriverNetEarningsPreview;
  };
  onAccept: () => void;
  onDecline: (reason: string) => void;
}

export const DriverEarningsCard: React.FC<DriverEarningsCardProps> = ({
  request,
  onAccept,
  onDecline
}) => {
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>(DRIVER_DECLINE_REASONS[0]);

  const { earnings } = request;

  return (
    <div className="rounded-2xl border-2 border-emerald-500/40 bg-slate-900/95 p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          ⚡ NEW RIDE REQUEST
        </span>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>{request.durationMin} mins • {request.distanceKm} km</span>
        </div>
      </div>

      {/* Origin & Destination */}
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-400 mt-1 shrink-0" />
          <div>
            <p className="font-bold text-white">{request.pickup}</p>
            {request.pickupPointNotice && (
              <span className="text-xs text-amber-300 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded">
                📍 {request.pickupPointNotice}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <div className="w-3 h-3 rounded-full bg-cyan-400 mt-1 shrink-0" />
          <p className="font-bold text-white">{request.destination}</p>
        </div>
      </div>

      {/* Driver Net Earnings Breakdown Box */}
      <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 space-y-2">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>Passenger Total Fare:</span>
          <span className="font-mono text-slate-200 font-bold">{formatCurrencyINR(earnings.passengerFare)}</span>
        </div>
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>Platform Service Fee (10%):</span>
          <span className="font-mono text-rose-400">- {formatCurrencyINR(earnings.platformFee)}</span>
        </div>
        <div className="flex justify-between items-center text-xs text-slate-300">
          <span>Driver Gross Total:</span>
          <span className="font-mono font-bold text-white">{formatCurrencyINR(earnings.driverGrossEarnings)}</span>
        </div>
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Fuel className="w-3 h-3 text-amber-400" />
            Estimated Fuel Cost:
          </span>
          <span className="font-mono text-amber-300 font-medium">- {formatCurrencyINR(earnings.estimatedFuelCost)}</span>
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-emerald-400">
              ESTIMATED NET EARNINGS
            </p>
            <p className="text-[10px] text-slate-400">Pure take-home estimate</p>
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {formatCurrencyINR(earnings.estimatedNetEarnings)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={() => setShowDeclineModal(true)}
          className="py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-bold text-sm transition-all"
        >
          Decline Ride
        </button>

        <button
          onClick={onAccept}
          className="py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5"
        >
          <CheckCircle className="w-4 h-4 stroke-[2.5]" />
          <span>ACCEPT RIDE</span>
        </button>
      </div>

      {/* Decline Reason Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              Reason for Declining
            </h3>
            <p className="text-xs text-slate-400">
              FairRide respects your flexibility. Please share why you are unable to take this trip:
            </p>

            <div className="space-y-2">
              {DRIVER_DECLINE_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs font-medium transition-colors ${
                    selectedReason === reason
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="declineReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="accent-emerald-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300"
              >
                Back
              </button>
              <button
                onClick={() => {
                  setShowDeclineModal(false);
                  onDecline(selectedReason);
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
