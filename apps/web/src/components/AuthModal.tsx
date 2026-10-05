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
  Gift
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultTab?: 'SIGNIN' | 'REGISTER';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = 'SIGNIN'
}) => {
  const { login } = useAppStore();
  const [activeTab, setActiveTab] = useState<'SIGNIN' | 'REGISTER'>(defaultTab);

  // Sign In State (Phone or Email + Password)
  const [identifier, setIdentifier] = useState('8106905004');
  const [password, setPassword] = useState('password123');

  // Register State (Strictly Passenger)
  const [regName, setRegName] = useState('Manoj N');
  const [regEmail, setRegEmail] = useState('manoj@fairride.local');
  const [regPhone, setRegPhone] = useState('8106905004');
  const [regPassword, setRegPassword] = useState('password123');
  const [regReferral, setRegReferral] = useState('');

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Quick fill demo passenger
  const handleQuickFillPassenger = () => {
    setIdentifier('8106905004');
    setPassword('password123');
  };

  // Handle Login with Mobile or Email + Password
  const handleLogin = async (e: React.FormEvent) => {
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
  const handleRegister = async (e: React.FormEvent) => {
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
      setSuccessMsg('Passenger account created successfully! ₹100 Welcome Bonus credited to your wallet.');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-400 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-brand-500/25">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white tracking-tight">Passenger Sign In</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/30">
                  RIDER ACCOUNT
                </span>
              </div>
              <p className="text-xs text-slate-400">Zero-surge booking • Verified drivers • Fair fares</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher - Strictly Passenger */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950/90 border-b border-slate-800 text-xs font-bold">
          <button
            onClick={() => { setActiveTab('SIGNIN'); setErrorMsg(null); }}
            className={`py-2.5 px-3 text-center rounded-xl transition-all ${
              activeTab === 'SIGNIN'
                ? 'bg-brand-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('REGISTER'); setErrorMsg(null); }}
            className={`py-2.5 px-3 text-center rounded-xl transition-all ${
              activeTab === 'REGISTER'
                ? 'bg-brand-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: PASSENGER SIGN IN */}
          {activeTab === 'SIGNIN' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Mobile Number or Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4 text-emerald-400" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="8106905004 or name@fairride.local"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-semibold text-white focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Enter your registered 10-digit mobile number or email
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Account Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-semibold text-white focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleQuickFillPassenger}
                  className="text-brand-400 hover:text-brand-300 font-medium cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-fill Demo Rider</span>
                </button>
                <span className="text-slate-500">Default: password123</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-500 via-emerald-400 to-teal-400 hover:from-brand-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>Sign In to Passenger Account</span>
              </button>

              <div className="pt-2 text-center border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => { setActiveTab('REGISTER'); setErrorMsg(null); }}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  New to FairRide? <strong className="text-emerald-400">Create Passenger Account (₹100 Bonus)</strong>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PASSENGER REGISTRATION */}
          {activeTab === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <Gift className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Instant signup! ₹100 Welcome Bonus automatically credited to your FairRide wallet.</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Manoj N"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="8106905004"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="manoj@fairride.local"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Create Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  minLength={6}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center justify-between">
                  <span>Referral Code (Optional)</span>
                  <span className="text-emerald-400 font-normal">Bonus +50 FairPoints</span>
                </label>
                <input
                  type="text"
                  value={regReferral}
                  onChange={(e) => setRegReferral(e.target.value)}
                  placeholder="e.g. FRAARAV120"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                <span>Create Passenger Account & Claim ₹100</span>
              </button>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => { setActiveTab('SIGNIN'); setErrorMsg(null); }}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Already have an account? <strong className="text-emerald-400">Sign In</strong>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default AuthModal;
