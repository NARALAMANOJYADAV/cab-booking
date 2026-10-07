import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  Car,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Upload,
  User,
  Phone,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Zap,
  Sparkles,
  X,
  Lock,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { formatCurrencyINR } from '@fairride/shared';

interface BecomeDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BecomeDriverModal: React.FC<BecomeDriverModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser, setCurrentUser, setActiveRoleView } = useAppStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPartnerCode, setGeneratedPartnerCode] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    city: 'Hyderabad',
    licenseNumber: '',
    licenseExpiry: '2029-12-31',
    aadhaarNumber: '',
    vehicleCategory: 'SEDAN',
    vehicleModel: 'Maruti Suzuki Dzire (White)',
    plateNumber: '',
    rcNumber: '',
    insuranceValidTill: '2027-06-30'
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!formData.licenseNumber || formData.licenseNumber.length < 8) {
      setErrorMsg('Please enter a valid Commercial Driving License number (e.g. TS09 20210008421)');
      return;
    }
    if (!formData.aadhaarNumber || formData.aadhaarNumber.length < 12) {
      setErrorMsg('Please enter a valid 12-digit Aadhaar / National ID number');
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!formData.plateNumber) {
      setErrorMsg('Please enter your vehicle commercial registration plate (e.g. TS 07 UB 1420)');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const code = `DRV-HYD-${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedPartnerCode(code);

      // Upgrade active user to DRIVER role
      setCurrentUser({
        ...currentUser,
        userId: currentUser.userId || 'drv_' + Date.now(),
        name: formData.fullName || currentUser.name || 'Driver Partner',
        phone: formData.phone || currentUser.phone || '+91 9800000003',
        role: 'DRIVER' as any,
        walletBalance: (currentUser.walletBalance || 0) + 300, // ₹300 initial security deposit credit
        fairPoints: (currentUser.fairPoints || 0) + 100
      });

      setStep(3);
    }, 1200);
  };

  const handleGoToDriverConsole = () => {
    setActiveRoleView('DRIVER');
    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Car className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Become a FairRide Driver Partner
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                  92% TAKE-HOME
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Upgrade your existing passenger account to Captain mode with zero sudden surge penalties
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-3 gap-2 px-6 pt-4 pb-2 text-center border-b border-slate-100 bg-slate-50">
          {[
            { num: 1, label: 'Identity & ID Proof' },
            { num: 2, label: 'Vehicle Details' },
            { num: 3, label: 'Instant Activation' }
          ].map((s) => (
            <div key={s.num} className="space-y-1">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  step >= s.num ? 'bg-emerald-600' : 'bg-slate-200'
                }`}
              />
              <span
                className={`text-[11px] font-bold block ${
                  step === s.num ? 'text-emerald-800 font-black' : 'text-slate-400'
                }`}
              >
                {s.num}. {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: DRIVING LICENSE & AADHAAR ID PROOF */}
          {/* ========================================================================= */}
          {step === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Seamless Account Upgrade</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Your existing profile ({currentUser?.name || 'Passenger'}) will gain instant driver dispatch capabilities. Please provide valid commercial driving credentials.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Full Legal Name (as per DL)
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Manoj Narala"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Mobile Number for Dispatches
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="98765 43210"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Commercial Driving License (DL) No.
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="TS09 20210008421"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Aadhaar / National ID Proof No.
                  </label>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    maxLength={12}
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                    placeholder="12-digit Aadhaar (e.g. 5821 4091 8832)"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* DigiLocker Auto Verification Badge */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between text-slate-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Valid ID & DL Verification</span>
                </div>
                <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                  ✓ DigiLocker API Auto-Check Ready
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow cursor-pointer transition-all"
                >
                  <span>Proceed to Vehicle Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: VEHICLE DETAILS & COMMERCIAL RC */}
          {/* ========================================================================= */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4 animate-in fade-in">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Vehicle Category
                  </label>
                  <select
                    name="vehicleCategory"
                    value={formData.vehicleCategory}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="SEDAN">Prime Sedan (Dzire, Aura, Etios)</option>
                    <option value="HATCHBACK">Mini / Hatchback (WagonR, Tiago)</option>
                    <option value="SUV">Fair SUV (Ertiga, Carens, Innova)</option>
                    <option value="AUTO">Fair Auto (Bajaj RE, Piaggio)</option>
                    <option value="ELECTRIC">Zero-Surge EV (Tigor EV, Nexon)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Vehicle Model & Color
                  </label>
                  <input
                    type="text"
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={handleChange}
                    placeholder="e.g. Maruti Dzire (White)"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Commercial Number Plate (Yellow Plate)
                  </label>
                  <input
                    type="text"
                    name="plateNumber"
                    value={formData.plateNumber}
                    onChange={handleChange}
                    placeholder="e.g. TS 07 UB 1420"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs font-mono font-bold text-amber-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Commercial RC Book Number
                  </label>
                  <input
                    type="text"
                    name="rcNumber"
                    value={formData.rcNumber}
                    onChange={handleChange}
                    placeholder="e.g. RC-TS07-8821"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Earnings Transparency Box */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5 text-emerald-950">
                <p className="font-black flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>FairRide Captain Economics Pledge</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
                  <div>• Driver Take-Home: <strong className="text-emerald-700 font-bold">92% Flat</strong></div>
                  <div>• Platform Service Fee: <strong className="text-slate-900 font-bold">Only 8%</strong></div>
                  <div>• Payout Frequency: <strong className="text-slate-900 font-bold">Instant to Bank</strong></div>
                  <div>• Initial Security Float: <strong className="text-emerald-700 font-bold">₹300 Credited</strong></div>
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow cursor-pointer transition-all disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>{isSubmitting ? 'Verifying & Activating Account...' : 'Submit Credentials & Activate Driver Mode'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: ACTIVATION SUCCESS & GO ONLINE */}
          {/* ========================================================================= */}
          {step === 3 && (
            <div className="py-4 text-center space-y-5 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">Captain Account Successfully Activated!</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  Your commercial vehicle and ID proof have been verified. ₹300 initial security deposit has been added to your driver wallet.
                </p>
              </div>

              {/* Assigned Driver Partner Code */}
              <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 max-w-sm mx-auto space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                  YOUR ASSIGNED DRIVER PARTNER CODE:
                </span>
                <p className="text-3xl font-black font-mono tracking-wider text-amber-950">
                  {generatedPartnerCode || 'DRV-HYD-7821'}
                </p>
                <span className="text-[10px] text-slate-500 block">
                  Use this code or your mobile number to sign in as a driver anytime.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left max-w-md mx-auto text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">Captain Name:</span>
                  <strong className="text-slate-900">{formData.fullName || currentUser.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Vehicle:</span>
                  <strong className="text-amber-800 font-mono">{formData.plateNumber || 'TS 07 UB 1420'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Net Earnings:</span>
                  <strong className="text-emerald-700">92% Take-Home</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Driver Wallet:</span>
                  <strong className="text-emerald-700 font-mono">₹300.00 Active</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoToDriverConsole}
                className="w-full max-w-md mx-auto py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-wider shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Driver Cockpit & Go Online</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default BecomeDriverModal;
