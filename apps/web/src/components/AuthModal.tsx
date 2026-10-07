import React, { useState } from 'react';
import { useAppStore, UserSession } from '../store/useAppStore';
import { api } from '../api/client';
import {
  Lock,
  Phone,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Gift,
  Car,
  Building2,
  ShieldAlert,
  KeyRound,
  ExternalLink
} from 'lucide-react';
import { formatCurrencyINR } from '@fairride/shared';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultTab?: 'SIGNIN' | 'REGISTER';
  defaultRole?: 'PASSENGER' | 'DRIVER' | 'CORPORATE' | 'ADMIN';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = 'SIGNIN',
  defaultRole = 'PASSENGER'
}) => {
  const { login, setActiveRoleView, setCurrentUser } = useAppStore();
  const [selectedRole, setSelectedRole] = useState<'PASSENGER' | 'DRIVER' | 'CORPORATE' | 'ADMIN'>(defaultRole);
  const [activeTab, setActiveTab] = useState<'SIGNIN' | 'REGISTER'>(defaultTab);

  // Passenger Auth State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regReferral, setRegReferral] = useState('');

  // Driver Auth State
  const [driverPartnerCode, setDriverPartnerCode] = useState('');
  const [driverPhone, setDriverPhone] = useState('');

  // Corporate Auth State
  const [corpOrgCode, setCorpOrgCode] = useState('CORP-TCS');
  const [corpEmail, setCorpEmail] = useState('priya.sharma@tcs.com');
  const [corpPass, setCorpPass] = useState('password123');

  // Admin Auth State
  const [adminPasscode, setAdminPasscode] = useState('ADMIN-2026');
  const [adminEmail, setAdminEmail] = useState('admin@fairride.in');

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Passenger Login
  const handlePassengerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await api.login({ identifier: identifier.trim(), password });
      const userData = res.data?.user;
      const accessToken = res.data?.accessToken || 'token_' + Date.now();

      const userSession: UserSession = {
        userId: userData?.userId || userData?._id || 'usr_' + Date.now(),
        name: userData?.name || identifier.split('@')[0],
        email: userData?.email || (identifier.includes('@') ? identifier : `${identifier}@fairride.local`),
        phone: userData?.phone || (identifier.replace(/\D/g, '').length >= 10 ? identifier : '+91 9800000002'),
        role: 'PASSENGER',
        trustScore: userData?.trustScore ?? 99,
        referralCode: userData?.referralCode,
        walletBalance: userData?.walletBalance ?? 100,
        fairPoints: userData?.fairPoints ?? 100,
        isVerified: true
      };

      login(userSession, accessToken);
      setActiveRoleView('PASSENGER');
      setSuccessMsg('Signed in successfully! Welcome to FairRide.');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your mobile/email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Passenger Registration
  const handlePassengerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const cleanDigits = regPhone.replace(/\D/g, '').slice(-10);
      const standardPhone = cleanDigits.length >= 10 ? `+91${cleanDigits}` : regPhone.trim();

      const res = await api.register({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: standardPhone,
        password: regPassword,
        role: 'PASSENGER',
        referralCode: regReferral.trim() || undefined
      });

      const userData = res.data?.user;
      const accessToken = res.data?.accessToken || 'token_' + Date.now();

      const userSession: UserSession = {
        userId: userData?.userId || userData?._id || 'usr_' + Date.now(),
        name: regName.trim(),
        email: regEmail.trim(),
        phone: standardPhone,
        role: 'PASSENGER',
        trustScore: 100,
        referralCode: userData?.referralCode,
        walletBalance: 100,
        fairPoints: 100,
        isVerified: true
      };

      login(userSession, accessToken);
      setActiveRoleView('PASSENGER');
      setSuccessMsg('Passenger account created! ₹100 Welcome Bonus credited.');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Driver Login
  const handleDriverLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCode = driverPartnerCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Please enter your Driver Partner Code (e.g. DRV-8821 or DRV-HYD-101)');
      return;
    }
    if (!cleanCode.startsWith('DRV')) {
      setErrorMsg('Driver Partner Codes start with DRV- (e.g. DRV-8821)');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const driverUser: UserSession = {
        userId: 'drv_demo_rajesh',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@fairride.partner',
        phone: driverPhone || '+91 9800000003',
        role: 'DRIVER' as any,
        walletBalance: 1450,
        fairPoints: 200,
        trustScore: 99,
        isVerified: true
      };

      login(driverUser, 'token_drv_' + Date.now());
      setActiveRoleView('DRIVER');
      setSuccessMsg(`Welcome Captain Rajesh Kumar! Redirecting to Driver Console...`);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 600);
    }, 500);
  };

  // Handle Corporate Login
  const handleCorporateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCode = corpOrgCode.trim().toUpperCase();
    if (!cleanCode.startsWith('CORP')) {
      setErrorMsg('Corporate Org Codes start with CORP- (e.g. CORP-TCS)');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const corpUser: UserSession = {
        userId: 'corp_user_01',
        name: 'Priya Sharma (Corporate Admin)',
        email: corpEmail.trim() || 'priya.sharma@tcs.com',
        phone: '+91 9800000005',
        role: 'CORPORATE_MANAGER' as any,
        walletBalance: 50000,
        fairPoints: 1200,
        trustScore: 100,
        isVerified: true
      };

      login(corpUser, 'token_corp_' + Date.now());
      setActiveRoleView('CORPORATE');
      setSuccessMsg(`Welcome to Corporate Travel Desk (${cleanCode})!`);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 600);
    }, 500);
  };

  // Handle Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCode = adminPasscode.trim().toUpperCase();
    if (cleanCode !== 'ADMIN-2026' && cleanCode !== 'ADMIN' && cleanCode !== '1234') {
      setErrorMsg('Invalid Security Passcode! Access restricted to verified operations personnel.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const adminUser: UserSession = {
        userId: 'admin_master_01',
        name: 'Sunita Verma (Operations Admin)',
        email: adminEmail.trim() || 'admin@fairride.in',
        phone: '+91 9800000001',
        role: 'SUPER_ADMIN' as any,
        walletBalance: 99999,
        fairPoints: 5000,
        trustScore: 100,
        isVerified: true
      };

      login(adminUser, 'token_admin_' + Date.now());
      setActiveRoleView('ADMIN');
      setSuccessMsg(`Security clearance granted. Entering Operations Command Room...`);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 600);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white shadow-md ${
              selectedRole === 'DRIVER'
                ? 'bg-amber-500'
                : selectedRole === 'CORPORATE'
                ? 'bg-indigo-600'
                : selectedRole === 'ADMIN'
                ? 'bg-rose-600'
                : 'bg-emerald-600'
            }`}>
              {selectedRole === 'DRIVER' && <Car className="w-5 h-5" />}
              {selectedRole === 'CORPORATE' && <Building2 className="w-5 h-5" />}
              {selectedRole === 'ADMIN' && <ShieldAlert className="w-5 h-5" />}
              {selectedRole === 'PASSENGER' && <ShieldCheck className="w-5 h-5 stroke-[2.5]" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                  {selectedRole === 'DRIVER' && 'Driver Partner Access'}
                  {selectedRole === 'CORPORATE' && 'Corporate Travel Desk'}
                  {selectedRole === 'ADMIN' && 'Operations Command Clearance'}
                  {selectedRole === 'PASSENGER' && 'Passenger Sign In'}
                </h3>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                  selectedRole === 'DRIVER'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : selectedRole === 'CORPORATE'
                    ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                    : selectedRole === 'ADMIN'
                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  {selectedRole}
                </span>
              </div>
              <p className="text-xs text-slate-500">FairRide trust-first intelligent mobility authentication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ROLE SELECTOR TABS (Explicitly separated login workflows) */}
        <div className="grid grid-cols-4 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold gap-1">
          {[
            { id: 'PASSENGER', label: 'Passenger', icon: User },
            { id: 'DRIVER', label: 'Driver', icon: Car },
            { id: 'CORPORATE', label: 'Corporate', icon: Building2 },
            { id: 'ADMIN', label: 'Admin', icon: ShieldAlert }
          ].map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setSelectedRole(r.id as any);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow font-black border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ROLE 1: PASSENGER AUTHENTICATION */}
          {/* ========================================================================= */}
          {selectedRole === 'PASSENGER' && (
            <div>
              {/* Sub-tab: Sign In vs Register */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold border border-slate-200">
                <button
                  type="button"
                  onClick={() => { setActiveTab('SIGNIN'); setErrorMsg(null); }}
                  className={`py-2 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'SIGNIN' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-600'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('REGISTER'); setErrorMsg(null); }}
                  className={`py-2 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'REGISTER' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-600'
                  }`}
                >
                  Create Account (₹100 Bonus)
                </button>
              </div>

              {activeTab === 'SIGNIN' ? (
                <form onSubmit={handlePassengerLogin} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Mobile Number or Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4 text-emerald-600" />
                      </div>
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="8106905004 or name@fairride.local"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Account Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4 text-emerald-600" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIdentifier('8106905004');
                        setPassword('password123');
                      }}
                      className="text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Auto-fill Demo Passenger</span>
                    </button>
                    <span className="text-slate-400">Default: password123</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    <span>Sign In to Passenger Account</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePassengerRegister} className="space-y-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <Gift className="w-4 h-4 shrink-0 text-emerald-700" />
                    <span>Instant signup! ₹100 Welcome Bonus automatically credited to your FairRide wallet.</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Manoj Narala"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="8106905004"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="manoj@fairride.local"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Create Password</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      minLength={6}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                      <span>Referral Code (Optional)</span>
                      <span className="text-emerald-700 font-semibold">+50 FairPoints</span>
                    </label>
                    <input
                      type="text"
                      value={regReferral}
                      onChange={(e) => setRegReferral(e.target.value)}
                      placeholder="e.g. FRAARAV120"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                    <span>Create Passenger Account & Claim ₹100</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* ROLE 2: DRIVER PARTNER AUTHENTICATION */}
          {/* ========================================================================= */}
          {selectedRole === 'DRIVER' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-amber-700" />
                  <span>FairRide Driver Partner Network</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  Keep 92% of every fare. Sign in with your assigned Partner Code (e.g. DRV-8821) or register a new commercial vehicle.
                </p>
              </div>

              <form onSubmit={handleDriverLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Driver Partner Code
                  </label>
                  <input
                    type="text"
                    value={driverPartnerCode}
                    onChange={(e) => setDriverPartnerCode(e.target.value)}
                    placeholder="e.g. DRV-8821 or DRV-HYD-101"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500 tracking-wider"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Registered Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-sm font-bold text-slate-500">+91</span>
                    <input
                      type="tel"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      placeholder="98000 00003"
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-14 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                </div>

                {/* Quick Demo Access Codes */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase">
                    Demo Driver Codes:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { code: 'DRV-8821', name: 'Rajesh (Sedan)' },
                      { code: 'DRV-4019', name: 'Vikram (City)' },
                      { code: 'DRV-7734', name: 'Arif (SUV)' }
                    ].map((d) => (
                      <button
                        key={d.code}
                        type="button"
                        onClick={() => {
                          setDriverPartnerCode(d.code);
                          setDriverPhone('9800000003');
                        }}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-300 text-[11px] text-slate-700 hover:text-amber-800 hover:border-amber-400 transition-all font-mono cursor-pointer"
                      >
                        {d.code} • {d.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm uppercase tracking-wider shadow flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Verify Code & Enter Driver Cockpit</span>
                </button>

                <div className="pt-2 text-center border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setActiveRoleView('DRIVER');
                    }}
                    className="text-xs text-emerald-700 hover:underline font-bold cursor-pointer"
                  >
                    New Driver? Complete 4-Step Registration & Pay Onboarding Fee →
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ROLE 3: CORPORATE ENTERPRISE AUTHENTICATION */}
          {/* ========================================================================= */}
          {selectedRole === 'CORPORATE' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-700" />
                  <span>B2B Corporate Travel Desk</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  Employee travel policies, manager approvals, monthly GST billing, and department budgets.
                </p>
              </div>

              <form onSubmit={handleCorporateLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Corporate Organization Code
                  </label>
                  <input
                    type="text"
                    value={corpOrgCode}
                    onChange={(e) => setCorpOrgCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CORP-TCS or CORP-INFY"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500 tracking-wider"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    value={corpEmail}
                    onChange={(e) => setCorpEmail(e.target.value)}
                    placeholder="priya.sharma@tcs.com"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Account Password
                  </label>
                  <input
                    type="password"
                    value={corpPass}
                    onChange={(e) => setCorpPass(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCorpOrgCode('CORP-TCS');
                      setCorpEmail('priya.sharma@tcs.com');
                      setCorpPass('password123');
                    }}
                    className="text-indigo-700 hover:text-indigo-800 font-bold cursor-pointer"
                  >
                    Auto-fill Demo: TCS Enterprise
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-wider shadow flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Authenticate & Enter Corporate Console</span>
                </button>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ROLE 4: OPERATIONS ADMIN AUTHENTICATION */}
          {/* ========================================================================= */}
          {selectedRole === 'ADMIN' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-700" />
                  <span>Operations Room Security Clearance</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  Restricted to fleet controllers, emergency SOS dispatchers, and dispute arbiters.
                </p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Admin Security Passcode
                  </label>
                  <input
                    type="password"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    placeholder="Enter key (e.g. ADMIN-2026)"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-rose-500 tracking-wider"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Admin Work Email
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@fairride.in"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminPasscode('ADMIN-2026');
                      setAdminEmail('admin@fairride.in');
                    }}
                    className="text-rose-700 hover:text-rose-800 font-bold cursor-pointer"
                  >
                    Auto-fill Key: ADMIN-2026
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm uppercase tracking-wider shadow flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Verify Clearance & Enter Command Room</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AuthModal;
