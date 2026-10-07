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
    <div className="rounded-2xl border-2 border-emerald-400 bg-white p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
          ⚡ NEW RIDE REQUEST
        </span>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
          <Clock className="w-3.5 h-3.5" />
          <span>{request.durationMin} mins • {request.distanceKm} km</span>
        </div>
      </div>

      {/* Origin & Destination */}
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0" />
          <div>
            <p className="font-bold text-slate-900">{request.pickup}</p>
            {request.pickupPointNotice && (
              <span className="text-xs text-amber-800 font-semibold bg-amber-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                📍 {request.pickupPointNotice}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <div className="w-3 h-3 rounded-full bg-indigo-500 mt-1 shrink-0" />
          <p className="font-bold text-slate-900">{request.destination}</p>
        </div>
      </div>

      {/* Driver Net Earnings Breakdown Box */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
        <div className="flex justify-between items-center text-xs text-slate-600">
          <span>Passenger Total Fare:</span>
          <span className="font-mono text-slate-900 font-bold">{formatCurrencyINR(earnings.passengerFare)}</span>
        </div>
        <div className="flex justify-between items-center text-xs text-slate-600">
          <span>Platform Service Fee (10%):</span>
          <span className="font-mono text-rose-600 font-semibold">- {formatCurrencyINR(earnings.platformFee)}</span>
        </div>
        <div className="flex justify-between items-center text-xs text-slate-700">
          <span className="font-semibold">Driver Gross Total:</span>
          <span className="font-mono font-bold text-slate-900">{formatCurrencyINR(earnings.driverGrossEarnings)}</span>
        </div>
        <div className="flex justify-between items-center text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <Fuel className="w-3 h-3 text-amber-600" />
            Estimated Fuel Cost:
          </span>
          <span className="font-mono text-amber-700 font-medium">- {formatCurrencyINR(earnings.estimatedFuelCost)}</span>
        </div>

        <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-emerald-800">
              ESTIMATED NET EARNINGS
            </p>
            <p className="text-[10px] text-slate-500">Pure take-home estimate</p>
          </div>
          <p className="text-2xl font-black text-emerald-700 font-mono">
            {formatCurrencyINR(earnings.estimatedNetEarnings)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={() => setShowDeclineModal(true)}
          className="py-3 px-4 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer"
        >
          Decline Ride
        </button>

        <button
          onClick={onAccept}
          className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <CheckCircle className="w-4 h-4 stroke-[2.5]" />
          <span>ACCEPT RIDE</span>
        </button>
      </div>

      {/* Decline Reason Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Reason for Declining
            </h3>
            <p className="text-xs text-slate-500">
              FairRide respects your flexibility. Please share why you are unable to take this trip:
            </p>

            <div className="space-y-2">
              {DRIVER_DECLINE_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs font-medium transition-colors ${
                    selectedReason === reason
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="declineReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="accent-emerald-600"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => {
                  setShowDeclineModal(false);
                  onDecline(selectedReason);
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition-colors cursor-pointer"
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
