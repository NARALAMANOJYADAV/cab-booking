import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MapPin, Navigation, FileText, Scale, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { formatCurrencyINR } from '@fairride/shared';
import { FareAuditReceiptModal } from '../components/FareAuditReceiptModal';

export const PassengerTripsPage: React.FC = () => {
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeBookingRef, setDisputeBookingRef] = useState('');
  const [disputeCategory, setDisputeCategory] = useState('DRIVER_DEMANDED_EXTRA_MONEY');
  const [disputeDesc, setDisputeDesc] = useState('');

  const sampleTrips = [
    {
      id: 'FR-HIST-1002',
      date: 'Today, 10:15 AM',
      from: 'Cyber Towers Gate 1, Hitech City',
      to: 'Rajiv Gandhi International Airport (Terminal 1)',
      category: 'SEDAN',
      fare: 670,
      lockedFare: 670,
      driverName: 'Rajesh Kumar',
      status: 'PAYMENT_COMPLETED'
    },
    {
      id: 'FR-HIST-1001',
      date: 'Yesterday, 6:40 PM',
      from: 'Inorbit Mall West Entrance',
      to: 'Gachibowli Financial District',
      category: 'EV',
      fare: 280,
      lockedFare: 280,
      driverName: 'Mohammad Shakeel',
      status: 'PAYMENT_COMPLETED'
    },
    {
      id: 'FR-HIST-0998',
      date: 'Oct 01, 2026',
      from: 'AIG Hospitals Gachibowli',
      to: 'Jubilee Hills Road 36',
      category: 'ACCESSIBLE',
      fare: 350,
      lockedFare: 350,
      driverName: 'Venkatesh Babu',
      status: 'PAYMENT_COMPLETED'
    }
  ];

  const handleSubmitDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeDesc.trim()) return;
    alert(`Dispute for ${disputeBookingRef} filed successfully! Auto-evidence bundle attached.`);
    setDisputeModalOpen(false);
    setDisputeDesc('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">YOUR TRIPS & FARE AUDITS</h1>
        <p className="text-xs text-slate-500 font-medium">View complete trip history with transparent FareLock receipts</p>
      </div>

      <div className="space-y-4">
        {sampleTrips.map((trip) => (
          <div
            key={trip.id}
            className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-colors space-y-3"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 text-xs">
              <span className="font-mono font-bold text-slate-900">{trip.id}</span>
              <span className="text-slate-500">{trip.date}</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-800 font-semibold">{trip.from}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-slate-800 font-semibold">{trip.to}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <div>
                <span className="text-[11px] text-slate-500 block">Driver: {trip.driverName} • {trip.category}</span>
                <span className="text-base font-black text-emerald-700 font-mono">
                  {formatCurrencyINR(trip.fare)} <span className="text-xs text-emerald-600 font-sans font-bold">(Locked & Verified ✓)</span>
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedReceipt(trip)}
                  className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>Fare Audit</span>
                </button>
                <button
                  onClick={() => {
                    setDisputeBookingRef(trip.id);
                    setDisputeModalOpen(true);
                  }}
                  className="py-1.5 px-3 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Dispute</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fare Audit Receipt Modal */}
      {selectedReceipt && (
        <FareAuditReceiptModal
          isOpen={true}
          onClose={() => setSelectedReceipt(null)}
          bookingReference={selectedReceipt.id}
          originalLockedFare={selectedReceipt.lockedFare}
          finalFare={selectedReceipt.fare}
          difference={0}
          pickup={selectedReceipt.from}
          destination={selectedReceipt.to}
          date={selectedReceipt.date}
        />
      )}

      {/* File Dispute Dialog */}
      {disputeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitDispute}
            className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 relative shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setDisputeModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-slate-900 text-base">File Evidence-Based Dispute</h3>
            <p className="text-xs text-slate-500">
              Trip Ref: <span className="font-mono text-emerald-700 font-bold">{disputeBookingRef}</span>. The system will automatically attach the original FareLock and GPS breadcrumb trail.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Dispute Category:</label>
              <select
                value={disputeCategory}
                onChange={(e) => setDisputeCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              >
                <option value="DRIVER_DEMANDED_EXTRA_MONEY">Driver demanded extra cash over locked fare</option>
                <option value="WRONG_FARE">Incorrect toll or charge added</option>
                <option value="ROUTE_ISSUE">Significant unauthorized route detour</option>
                <option value="VEHICLE_ISSUE">Vehicle AC not working or unsafe condition</option>
                <option value="LOST_ITEM">Lost item in vehicle</option>
                <option value="OTHER">Other issue</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Explanation & Details:</label>
              <textarea
                rows={4}
                required
                value={disputeDesc}
                onChange={(e) => setDisputeDesc(e.target.value)}
                placeholder="Explain what happened. Support agents will review with full trip evidence..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Submit Dispute with Evidence Bundle
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
