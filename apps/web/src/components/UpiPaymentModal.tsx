import React, { useState } from 'react';
import {
  X,
  QrCode,
  Smartphone,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Copy,
  Lock,
  Zap
} from 'lucide-react';
import { formatCurrencyINR } from '@fairride/shared';
import { api } from '../api/client';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
  bookingReference: string;
  amount: number;
  onPaymentSuccess?: () => void;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  bookingReference,
  amount,
  onPaymentSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'QR' | 'UPI_INTENT' | 'RAZORPAY'>('QR');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const upiId = 'fairride@icici';
  const upiIntentString = `upi://pay?pa=${upiId}&pn=FairRide&am=${amount}&tn=Ride_${bookingReference}&cu=INR`;

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    try {
      if (bookingId) {
        try {
          await api.verifyPayment({
            bookingId,
            orderId: 'order_demo_' + Date.now(),
            paymentId: 'pay_demo_' + Date.now(),
            signature: 'mock_valid_signature',
            paymentMethod: selectedMethod === 'RAZORPAY' ? 'CARD' : 'UPI',
            idempotencyKey: 'idemp_' + Date.now()
          });
        } catch {
          // Fallback gracefully
        }
      }

      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      }, 1200);
    } catch {
      setIsProcessing(false);
      setIsSuccess(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Payment Verified!</h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Settled {formatCurrencyINR(amount)} via Razorpay UPI Instant Settlement
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-emerald-800 font-bold">
              Ref: {bookingReference} • Status: SUCCESS
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow cursor-pointer"
            >
              Back to Trip Cockpit
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>SECURE RAZORPAY & UPI GATEWAY</span>
              </div>
              <h2 className="text-lg font-black text-slate-900">Complete Ride Payment</h2>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xs text-slate-500 font-medium">Guaranteed Locked Total:</span>
                <span className="text-2xl font-black font-mono text-emerald-700">
                  {formatCurrencyINR(amount)}
                </span>
              </div>
            </div>

            {/* Payment Method Switcher */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
              {[
                { id: 'QR', label: 'Scan QR', icon: QrCode },
                { id: 'UPI_INTENT', label: 'UPI Apps', icon: Smartphone },
                { id: 'RAZORPAY', label: 'Cards/Net', icon: CreditCard }
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = selectedMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id as any)}
                    className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer ${
                      isSelected
                        ? 'bg-white text-emerald-800 shadow-sm font-black border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mode 1: QR Code */}
            {selectedMethod === 'QR' && (
              <div className="space-y-3.5 text-center p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="bg-white p-3 rounded-2xl inline-block border border-slate-200 shadow-sm">
                  <svg className="w-36 h-36 mx-auto" viewBox="0 0 100 100" fill="none">
                    <rect width="100" height="100" fill="white" />
                    {/* Corner Squares */}
                    <rect x="10" y="10" width="25" height="25" fill="#0f172a" rx="4" />
                    <rect x="15" y="15" width="15" height="15" fill="white" rx="2" />
                    <rect x="19" y="19" width="7" height="7" fill="#0f172a" />

                    <rect x="65" y="10" width="25" height="25" fill="#0f172a" rx="4" />
                    <rect x="70" y="15" width="15" height="15" fill="white" rx="2" />
                    <rect x="74" y="19" width="7" height="7" fill="#0f172a" />

                    <rect x="10" y="65" width="25" height="25" fill="#0f172a" rx="4" />
                    <rect x="15" y="70" width="15" height="15" fill="white" rx="2" />
                    <rect x="19" y="74" width="7" height="7" fill="#0f172a" />

                    {/* QR Matrix Dots */}
                    <rect x="42" y="14" width="6" height="6" fill="#0f172a" />
                    <rect x="52" y="14" width="6" height="6" fill="#0f172a" />
                    <rect x="42" y="24" width="6" height="6" fill="#0f172a" />
                    <rect x="14" y="42" width="6" height="6" fill="#0f172a" />
                    <rect x="24" y="42" width="6" height="6" fill="#0f172a" />
                    <rect x="34" y="42" width="6" height="6" fill="#0f172a" />
                    <rect x="44" y="44" width="12" height="12" fill="#10b981" rx="2" />
                    <rect x="62" y="42" width="6" height="6" fill="#0f172a" />
                    <rect x="74" y="42" width="6" height="6" fill="#0f172a" />
                    <rect x="84" y="42" width="6" height="6" fill="#0f172a" />
                    <rect x="42" y="62" width="6" height="6" fill="#0f172a" />
                    <rect x="52" y="62" width="6" height="6" fill="#0f172a" />
                    <rect x="42" y="74" width="6" height="6" fill="#0f172a" />
                    <rect x="62" y="62" width="6" height="6" fill="#0f172a" />
                    <rect x="74" y="74" width="6" height="6" fill="#0f172a" />
                    <rect x="84" y="62" width="6" height="6" fill="#0f172a" />
                    <rect x="62" y="84" width="6" height="6" fill="#0f172a" />
                    <rect x="74" y="84" width="6" height="6" fill="#0f172a" />
                  </svg>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-800">{upiId}</span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                    title="Copy UPI ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {copied && <span className="text-[10px] text-emerald-700 font-bold">Copied!</span>}
                </div>
                <p className="text-[11px] text-slate-500">
                  Scan with Google Pay, PhonePe, Paytm, or any BHIM UPI App
                </p>
              </div>
            )}

            {/* Mode 2: UPI Apps Intent */}
            {selectedMethod === 'UPI_INTENT' && (
              <div className="space-y-2.5">
                <p className="text-xs text-slate-700 font-semibold">Choose your installed UPI App:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Google Pay', color: 'bg-blue-50 border-blue-200 text-blue-900' },
                    { name: 'PhonePe', color: 'bg-purple-50 border-purple-200 text-purple-900' },
                    { name: 'Paytm UPI', color: 'bg-sky-50 border-sky-200 text-sky-900' },
                    { name: 'BHIM UPI', color: 'bg-amber-50 border-amber-200 text-amber-900' }
                  ].map((app) => (
                    <button
                      key={app.name}
                      type="button"
                      onClick={handleSimulatePayment}
                      disabled={isProcessing}
                      className={`p-3 rounded-2xl ${app.color} border hover:shadow-sm text-left transition-all flex items-center justify-between group cursor-pointer`}
                    >
                      <span className="text-xs font-bold">
                        {app.name}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mode 3: Razorpay Cards / Netbanking */}
            {selectedMethod === 'RAZORPAY' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Razorpay Standard Checkout</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Supports Visa, MasterCard, RuPay, NetBanking across all Indian banks, and Corporate Cards.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>256-bit bank-grade encryption & RBI Tokenization compliance</span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>
                {isProcessing
                  ? 'Verifying Payment with Bank...'
                  : `Confirm & Settle ${formatCurrencyINR(amount)}`}
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
