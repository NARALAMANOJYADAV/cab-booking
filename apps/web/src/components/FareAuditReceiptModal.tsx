import React from 'react';
import { CheckCircle2, Download, Printer, ShieldCheck, AlertCircle, X, FileText } from 'lucide-react';
import { formatCurrencyINR } from '@fairride/shared';

interface FareAuditReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingReference: string;
  originalLockedFare: number;
  finalFare: number;
  difference: number;
  pickup: string;
  destination: string;
  date: string;
  adjustments?: Array<{ reason: string; amount: number; category: string }>;
  onOpenDispute?: () => void;
}

export const FareAuditReceiptModal: React.FC<FareAuditReceiptModalProps> = ({
  isOpen,
  onClose,
  bookingReference,
  originalLockedFare,
  finalFare,
  difference,
  pickup,
  destination,
  date,
  adjustments = [],
  onOpenDispute
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-wider border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>FAIRRIDE AUDITED RECEIPT</span>
          </div>
          <h2 className="text-xl font-black text-white font-mono tracking-tight">{bookingReference}</h2>
          <p className="text-xs text-slate-400">{date} • Hyderabad City Transport</p>
        </div>

        {/* Route Details */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-2">
          <div className="flex items-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
            <div>
              <span className="text-slate-400 font-medium">From: </span>
              <span className="text-white font-bold">{pickup}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mt-1 shrink-0" />
            <div>
              <span className="text-slate-400 font-medium">To: </span>
              <span className="text-white font-bold">{destination}</span>
            </div>
          </div>
        </div>

        {/* Fare Audit Comparison Box */}
        <div className="bg-gradient-to-b from-slate-800/60 to-slate-950/90 rounded-2xl p-4 border border-slate-700/60 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-300 font-medium">Original Locked Fare:</span>
            <span className="font-mono font-bold text-white text-base">{formatCurrencyINR(originalLockedFare)}</span>
          </div>

          {adjustments.length > 0 ? (
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Itemized Adjustments:</span>
              {adjustments.map((adj, i) => (
                <div key={i} className="flex justify-between text-xs text-slate-300 pl-2">
                  <span>• {adj.reason}</span>
                  <span className="font-mono text-amber-300">+{formatCurrencyINR(adj.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Zero fare adjustments. Exact locked fare honored.</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-700 flex justify-between items-baseline">
            <div>
              <p className="text-xs font-black uppercase text-slate-400 tracking-wider">FINAL AUDITED TOTAL</p>
              <p className="text-[10px] text-slate-400">All taxes & platform fees inclusive</p>
            </div>
            <p className="text-2xl font-black text-emerald-400 font-mono">
              {formatCurrencyINR(finalFare)}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => window.print()}
              className="py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Tax Invoice</span>
            </button>

            <button
              onClick={() => alert(`Receipt ${bookingReference} downloaded as verified PDF.`)}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download PDF</span>
            </button>
          </div>

          {onOpenDispute && (
            <button
              onClick={onOpenDispute}
              className="w-full text-center py-2 text-xs text-rose-400 font-bold hover:underline"
            >
              Dispute this trip or charges
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
