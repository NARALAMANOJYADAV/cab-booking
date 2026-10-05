import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  Car,
  ShieldCheck,
  CreditCard,
  QrCode,
  CheckCircle2,
  FileText,
  Upload,
  User,
  Phone,
  AlertCircle,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Zap,
  Building,
  DollarSign,
  Lock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { formatCurrencyINR } from '@fairride/shared';

interface DriverOnboardingPageProps {
  onSuccessRedirect?: () => void;
  onBackToPassenger?: () => void;
}

export const DriverOnboardingPage: React.FC<DriverOnboardingPageProps> = ({
  onSuccessRedirect,
  onBackToPassenger
}) => {
  const { setActiveRoleView, setCurrentUser, setActiveBooking } = useAppStore();

  const [activeTab, setActiveTab] = useState<'REGISTER' | 'LOGIN'>('REGISTER');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Registration Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: 'Hyderabad',
    licenseNumber: '',
    licenseExpiry: '2029-12-31',
    vehicleCategory: 'SEDAN',
    vehicleModel: 'Hyundai Aura (White)',
    plateNumber: '',
    rcNumber: '',
    insuranceValidTill: '2027-06-30'
  });

  // Login Form State
  const [loginPartnerCode, setLoginPartnerCode] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Payment State for Step 3 (Onboarding Fee)
  const [selectedPaymentApp, setSelectedPaymentApp] = useState<'QR' | 'GPAY' | 'PHONEPE' | 'PAYTM'>('QR');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [generatedPartnerCode, setGeneratedPartnerCode] = useState('');

  const ONBOARDING_FEE = 999;

  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 3 -> Process Onboarding Payment
  const handlePayOnboardingFee = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setIsPaymentComplete(true);
      const code = `DRV-HYD-${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedPartnerCode(code);
      setStep(4);
    }, 1500);
  };

  // Step 4 -> Complete Onboarding & Enter Driver Console
  const handleFinishOnboarding = () => {
    // Set logged in user as Driver
    setCurrentUser({
      userId: 'drv_' + Date.now(),
      name: formData.fullName || 'Rajesh Kumar',
      email: `${formData.fullName.toLowerCase().replace(/\s+/g, '') || 'driver'}@fairride.partner`,
      phone: formData.phone.startsWith('+91') ? formData.phone : `+91 ${formData.phone}`,
      role: 'DRIVER' as any,
      walletBalance: 300, // ₹300 initial security deposit credit
      fairPoints: 50
    });

    setActiveRoleView('DRIVER');
    if (onSuccessRedirect) onSuccessRedirect();
  };

  // Handle Driver Login via Partner Code
  const handleDriverLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanCode = loginPartnerCode.trim().toUpperCase();
    if (!cleanCode) {
      setLoginError('Please enter your Driver Partner Code (e.g. DRV-8821 or DRV-HYD-101)');
      return;
    }

    // Accept valid demo partner codes or any DRV- code
    if (!cleanCode.startsWith('DRV')) {
      setLoginError('Invalid Code format! Driver partner codes start with DRV- (e.g. DRV-8821)');
      return;
    }

    setCurrentUser({
      userId: 'drv_demo_rajesh',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@fairride.partner',
      phone: loginPhone || '+91 9800000003',
      role: 'DRIVER' as any,
      walletBalance: 1450,
      fairPoints: 200
    });

    setActiveRoleView('DRIVER');
    if (onSuccessRedirect) onSuccessRedirect();
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      {/* Back button to consumer passenger site */}
      <div className="w-full max-w-2xl mb-4 flex items-center justify-between">
        <button
          onClick={onBackToPassenger || (() => setActiveRoleView('PASSENGER'))}
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors p-2 rounded-xl hover:bg-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Passenger Booking</span>
        </button>

        <span className="text-xs font-black uppercase text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5">
          <Car className="w-3.5 h-3.5" />
          <span>FAIRRIDE DRIVER PARTNER NETWORK</span>
        </span>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Subtle Decorative Background Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Section */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 p-3 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl text-slate-950 shadow-xl shadow-emerald-500/20">
            <Car className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            FairRide Driver Partner Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Take home <strong className="text-emerald-400">92% of every fare</strong> with zero sudden surge penalties & transparent instant bank payouts.
          </p>
        </div>

        {/* Tab Switcher: Register New Driver vs Existing Driver Login */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 mb-8 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('REGISTER')}
            className={`py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'REGISTER'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Driver Registration</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('LOGIN')}
            className={`py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'LOGIN'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Driver Partner Login</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: DRIVER PARTNER LOGIN WITH SPECIFIC CODE */}
        {/* ========================================================================= */}
        {activeTab === 'LOGIN' ? (
          <form onSubmit={handleDriverLogin} className="space-y-5 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <p className="font-bold">Specific Driver Access Code Required</p>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  Enter your assigned Driver Partner Code (e.g. <strong className="text-white">DRV-8821</strong> or <strong className="text-white">DRV-HYD-101</strong>) to access the driver dispatch console.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Driver Partner Code
              </label>
              <input
                type="text"
                value={loginPartnerCode}
                onChange={(e) => setLoginPartnerCode(e.target.value)}
                placeholder="e.g. DRV-8821"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-400 tracking-wider"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Registered Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-sm font-bold text-slate-500">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="98000 00003"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-14 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-400 font-medium"
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Quick Demo Access Buttons */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">
                Quick Demo Partner Codes:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { code: 'DRV-8821', name: 'Rajesh Kumar (Hyundai Aura Sedan)' },
                  { code: 'DRV-4019', name: 'Vikram Singh (Honda City)' },
                  { code: 'DRV-7734', name: 'Mohammed Arif (Ertiga SUV)' }
                ].map((d) => (
                  <button
                    key={d.code}
                    type="button"
                    onClick={() => {
                      setLoginPartnerCode(d.code);
                      setLoginPhone('9800000003');
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 transition-all font-mono"
                  >
                    {d.code} • {d.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Verify Code & Enter Driver Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: MULTI-STEP DRIVER ONBOARDING & PAYMENT REGISTRATION PROCESS */
          /* ========================================================================= */
          <div className="space-y-6 animate-in fade-in">
            {/* Step Progress Indicators */}
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { num: 1, label: 'KYC & License' },
                { num: 2, label: 'Vehicle Info' },
                { num: 3, label: 'Onboarding Fee' },
                { num: 4, label: 'Activation' }
              ].map((s) => (
                <div key={s.num} className="space-y-1">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      step >= s.num ? 'bg-emerald-400' : 'bg-slate-800'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider block ${
                      step === s.num ? 'text-emerald-300' : 'text-slate-500'
                    }`}
                  >
                    {s.num}. {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* STEP 1: PERSONAL DETAILS & DRIVING LICENSE */}
            {/* --------------------------------------------------------------------- */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-black text-white">Step 1: Driver Identity & Driving License</h3>
                  <p className="text-xs text-slate-400">Required by Ministry of Road Transport & Highways (MoRTH)</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Full Legal Name (as per Driving License)
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Babu Narala"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Phone Number (for OTP & Dispatches)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="98765 43210"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-400"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Operating City
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-400"
                    >
                      <option value="Hyderabad">Hyderabad, Telangana</option>
                      <option value="Bengaluru">Bengaluru, Karnataka</option>
                      <option value="Chennai">Chennai, Tamil Nadu</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Commercial Driving License (DL) No.
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      placeholder="TS09 20210008421"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      DL Expiry Date
                    </label>
                    <input
                      type="date"
                      name="licenseExpiry"
                      value={formData.licenseExpiry}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Upload DL & Aadhaar Documents</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Auto-Verified via DigiLocker API
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!formData.fullName || !formData.phone) {
                      setFormData({
                        ...formData,
                        fullName: 'Ramesh Babu',
                        phone: '9848012345',
                        licenseNumber: 'TS09 20210008421'
                      });
                    }
                    setStep(2);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <span>Continue to Vehicle Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* STEP 2: VEHICLE DETAILS & COMMERCIAL RC */}
            {/* --------------------------------------------------------------------- */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-black text-white">Step 2: Vehicle Details & Commercial Permit</h3>
                  <p className="text-xs text-slate-400">Add the vehicle you will drive on the platform</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Vehicle Category
                    </label>
                    <select
                      name="vehicleCategory"
                      value={formData.vehicleCategory}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-400"
                    >
                      <option value="SEDAN">Prime Sedan (Aura, Dzire, Etios)</option>
                      <option value="HATCHBACK">Mini / Hatchback (WagonR, Tiago)</option>
                      <option value="SUV">Fair SUV (Ertiga, Carens, Innova)</option>
                      <option value="AUTO">Fair Auto (Bajaj RE, Piaggio)</option>
                      <option value="ELECTRIC">Zero-Surge EV (Tigor EV, Nexon)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Vehicle Model & Color
                    </label>
                    <input
                      type="text"
                      name="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleChange}
                      placeholder="e.g. Maruti Dzire (Silver)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Commercial Number Plate (Yellow Plate)
                    </label>
                    <input
                      type="text"
                      name="plateNumber"
                      value={formData.plateNumber}
                      onChange={handleChange}
                      placeholder="TS 07 UB 1420"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Commercial RC Book Number
                    </label>
                    <input
                      type="text"
                      name="rcNumber"
                      value={formData.rcNumber}
                      onChange={handleChange}
                      placeholder="RC-9982410"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                {/* Trust & Zero Sudden Surge Pledge */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1 text-emerald-300">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>FairRide Driver Partner Guarantee</span>
                  </p>
                  <p className="text-[11px] text-slate-300">
                    You keep 92% of every rupee earned. The platform takes only an 8% flat fee. No hidden penalties, no forced extra cash demands.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.plateNumber) {
                        setFormData({
                          ...formData,
                          plateNumber: 'TS 07 UB 1420',
                          rcNumber: 'RC-TS07-8821'
                        });
                      }
                      setStep(3);
                    }}
                    className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <span>Continue to Onboarding Fee</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* STEP 3: DRIVER ONBOARDING KIT & SECURITY DEPOSIT (PAYING MONEY TO APP) */}
            {/* --------------------------------------------------------------------- */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20 mb-1">
                    <DollarSign className="w-3 h-3" />
                    <span>INDUSTRY STANDARD DRIVER ACTIVATION</span>
                  </div>
                  <h3 className="text-base font-black text-white">
                    Step 3: Driver Onboarding Kit & Wallet Activation Deposit
                  </h3>
                  <p className="text-xs text-slate-400">
                    Why real cab apps charge an initial fee & how it is structured:
                  </p>
                </div>

                {/* Real-world Breakdown Box */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-baseline border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-300">Total Activation Package:</span>
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      {formatCurrencyINR(ONBOARDING_FEE)}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Commercial Fastag + Live GPS Decal Kit:</span>
                      </span>
                      <span className="font-mono text-slate-200">₹399</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Background Verification & Police Clearance Audit:</span>
                      </span>
                      <span className="font-mono text-slate-200">₹300</span>
                    </div>

                    <div className="flex justify-between items-center text-emerald-300 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Credited Back to Your Driver Wallet:</span>
                      </span>
                      <span className="font-mono">₹300 (Initial Float)</span>
                    </div>
                  </div>
                </div>

                {/* Payment App Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Select UPI Payment Method:
                  </label>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                    {[
                      { id: 'QR', label: 'Scan QR', color: 'border-emerald-500/50 text-emerald-300' },
                      { id: 'GPAY', label: 'Google Pay', color: 'border-blue-500/50 text-blue-300' },
                      { id: 'PHONEPE', label: 'PhonePe', color: 'border-purple-500/50 text-purple-300' },
                      { id: 'PAYTM', label: 'Paytm UPI', color: 'border-sky-500/50 text-sky-300' }
                    ].map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setSelectedPaymentApp(app.id as any)}
                        className={`p-2.5 rounded-xl border transition-all text-xs ${
                          selectedPaymentApp === app.id
                            ? 'bg-slate-800 font-black shadow ring-1 ring-emerald-400 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {app.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive UPI Payment Demonstration Box */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
                  <div className="bg-white p-2.5 rounded-2xl inline-block shadow-xl">
                    <svg className="w-28 h-28 mx-auto" viewBox="0 0 100 100" fill="none">
                      <rect width="100" height="100" fill="white" />
                      <rect x="10" y="10" width="25" height="25" fill="#0f172a" rx="4" />
                      <rect x="15" y="15" width="15" height="15" fill="white" rx="2" />
                      <rect x="19" y="19" width="7" height="7" fill="#0f172a" />
                      <rect x="65" y="10" width="25" height="25" fill="#0f172a" rx="4" />
                      <rect x="70" y="15" width="15" height="15" fill="white" rx="2" />
                      <rect x="74" y="19" width="7" height="7" fill="#0f172a" />
                      <rect x="10" y="65" width="25" height="25" fill="#0f172a" rx="4" />
                      <rect x="15" y="70" width="15" height="15" fill="white" rx="2" />
                      <rect x="19" y="74" width="7" height="7" fill="#0f172a" />
                      <rect x="44" y="44" width="12" height="12" fill="#10b981" rx="2" />
                      <rect x="42" y="14" width="6" height="6" fill="#0f172a" />
                      <rect x="52" y="14" width="6" height="6" fill="#0f172a" />
                      <rect x="14" y="42" width="6" height="6" fill="#0f172a" />
                      <rect x="74" y="42" width="6" height="6" fill="#0f172a" />
                    </svg>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    UPI ID: <strong className="text-slate-200 font-mono">fairride.onboarding@icici</strong>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-1/3 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePayOnboardingFee}
                    disabled={isProcessingPayment}
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>
                      {isProcessingPayment
                        ? 'Verifying Payment...'
                        : `Pay ₹${ONBOARDING_FEE} & Activate Partner Account`}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* STEP 4: ACTIVATION & UNIQUE DRIVER PARTNER CODE ASSIGNED */}
            {/* --------------------------------------------------------------------- */}
            {step === 4 && (
              <div className="py-6 text-center space-y-5 animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">Driver Partner Account Activated!</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                    Your onboarding deposit is verified, your commercial vehicle is registered, and ₹300 is credited to your driver wallet.
                  </p>
                </div>

                {/* Assigned Driver Partner Code */}
                <div className="p-4 rounded-3xl bg-slate-950 border border-amber-500/40 max-w-sm mx-auto space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    YOUR SPECIFIC DRIVER PARTNER CODE:
                  </span>
                  <p className="text-3xl font-black font-mono tracking-wider text-white">
                    {generatedPartnerCode || 'DRV-HYD-5821'}
                  </p>
                  <span className="text-[10px] text-slate-400 block">
                    Save this code! Use this code to log into your driver dashboard anytime.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left max-w-md mx-auto text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Driver Name:</span>
                    <strong className="text-white">{formData.fullName || 'Ramesh Babu'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Vehicle:</span>
                    <strong className="text-amber-300 font-mono">{formData.plateNumber || 'TS 07 UB 1420'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Net Share:</span>
                    <strong className="text-emerald-400">92% Net Take-Home</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Initial Wallet Balance:</span>
                    <strong className="text-emerald-400 font-mono">₹300.00</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFinishOnboarding}
                  className="w-full max-w-md mx-auto py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Go Online & Start Receiving Bookings</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
