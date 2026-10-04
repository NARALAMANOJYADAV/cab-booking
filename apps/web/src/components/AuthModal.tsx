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
  Car,
  Building2,
  RefreshCw,
  Gift
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultTab?: 'SIGNIN' | 'REGISTER' | 'DEMO';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = 'SIGNIN'
}) => {
  const { login } = useAppStore();
  const [activeTab, setActiveTab] = useState<'SIGNIN' | 'REGISTER' | 'DEMO'>(defaultTab);

  // Sign In State (Phone or Email + Password)
  const [identifier, setIdentifier] = useState('8106905004');
  const [password, setPassword] = useState('password123');

  // Register State
  const [regName, setRegName] = useState('Manoj N');
  const [regEmail, setRegEmail] = useState('manoj@fairride.local');
  const [regPhone, setRegPhone] = useState('8106905004');
  const [regPassword, setRegPassword] = useState('password123');
  const [regRole, setRegRole] = useState<'PASSENGER' | 'DRIVER' | 'CORPORATE_MANAGER'>('PASSENGER');
  const [regReferral, setRegReferral] = useState('');

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

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
        role: userData?.role || 'PASSENGER',
        trustScore: 99,
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

  // Handle Registration
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
        role: regRole,
        referralCode: regReferral.trim() || undefined
      });

      const userData = res.data?.user;
      const accessToken = res.data?.accessToken || 'token_' + Date.now();

      const userSession: UserSession = {
        userId: userData?.userId || userData?._id || 'usr_' + Date.now(),
        name: regName.trim(),
        email: regEmail.trim(),
        phone: standardPhone,
        role: regRole,
        trustScore: 100,
        isVerified: true
      };

      login(userSession, accessToken);
      setSuccessMsg('Account created successfully! ₹100 Welcome Bonus credited to your wallet.');
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

  // 1-Click Quick Demo Logins
  const handleQuickDemoLogin = (role: 'PASSENGER' | 'DRIVER' | 'ADMIN' | 'CORPORATE') => {
    let user: UserSession;
    if (role === 'PASSENGER') {
      user = {
        userId: 'usr_demo_aarav_sharma',
        name: 'Aarav Sharma',
        email: 'passenger@fairride.local',
        phone: '+91 9800000002',
        role: 'PASSENGER',
        trustScore: 98,
        isVerified: true
      };
    } else if (role === 'DRIVER') {
      user = {
        userId: 'usr_demo_rajesh_kumar',
        name: 'Rajesh Kumar (Driver TS07UB1420)',
        email: 'driver@fairride.local',
        phone: '+91 9800000003',
        role: 'DRIVER',
        trustScore: 99,
        isVerified: true
      };
    } else if (role === 'ADMIN') {
      user = {
        userId: 'usr_demo_sunita_verma',
        name: 'Sunita Verma (Safety & Admin)',
        email: 'admin@fairride.local',
        phone: '+91 9800000001',
        role: 'SUPER_ADMIN' as any,
        trustScore: 100,
        isVerified: true
      };
    } else {
      user = {
        userId: 'usr_demo_vikram_patel',
        name: 'Vikram Patel (Corporate TechCorp)',
        email: 'corporate@fairride.local',
        phone: '+91 9800000004',
        role: 'CORPORATE_MANAGER' as any,
        trustScore: 97,
        isVerified: true
      };
    }

    login(user, `jwt_demo_${role.toLowerCase()}_token`);
    setSuccessMsg(`Logged in as ${user.name}!`);
    setTimeout(() => {
      onClose();
      if (onSuccess) onSuccess();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-400 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-brand-500/25">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white tracking-tight">FairRide Sign In</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/30">
                  SECURE
                </span>
              </div>
              <p className="text-xs text-slate-400">Zero-surge booking • Verified drivers • Instant UPI settlements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 p-1.5 bg-slate-950/90 border-b border-slate-800 text-xs font-bold">
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
          <button
            onClick={() => { setActiveTab('DEMO'); setErrorMsg(null); }}
            className={`py-2.5 px-3 text-center rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'DEMO'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Demo</span>
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

          {/* TAB 1: SIGN IN (MOBILE OR EMAIL + PASSWORD) */}
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
                  Enter your 10-digit mobile number or registered email
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Password
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>Sign In to FairRide</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setActiveTab('REGISTER'); setErrorMsg(null); }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
                >
                  New to FairRide? Create an account & claim ₹100
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CREATE ACCOUNT (REGISTER) */}
          {activeTab === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <Gift className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Instant signup! ₹100 Welcome Bonus automatically credited to your FairRide wallet.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Account Role</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="PASSENGER">Passenger (Rider)</option>
                    <option value="DRIVER">Driver Partner</option>
                    <option value="CORPORATE_MANAGER">Corporate Manager</option>
                  </select>
                </div>
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
                <span>Create Account & Claim ₹100</span>
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

          {/* TAB 3: 1-CLICK QUICK DEMO PROFILES */}
          {activeTab === 'DEMO' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400">
                Instantly switch to any pre-seeded persona with verified KYC, trust score, and active wallet balance:
              </p>

              <button
                onClick={() => handleQuickDemoLogin('PASSENGER')}
                className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-brand-500/50 flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white group-hover:text-brand-300">Aarav Sharma (Passenger)</p>
                    <p className="text-[10px] text-slate-400">98% Trust Score • ₹1,250 Wallet • 480 FairPoints</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase text-brand-400 bg-brand-500/10 px-2 py-1 rounded-lg border border-brand-500/20">
                  Select
                </span>
              </button>

              <button
                onClick={() => handleQuickDemoLogin('DRIVER')}
                className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                    <Car className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white group-hover:text-amber-300">Rajesh Kumar (Driver Partner)</p>
                    <p className="text-[10px] text-slate-400">Hyundai Aura TS07UB1420 • 92% Take-Home Net</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                  Select
                </span>
              </button>

              <button
                onClick={() => handleQuickDemoLogin('ADMIN')}
                className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/50 flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white group-hover:text-rose-300">Sunita Verma (Super Admin)</p>
                    <p className="text-[10px] text-slate-400">Safety Incident Center • Driver KYC • Surge Audits</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">
                  Select
                </span>
              </button>

              <button
                onClick={() => handleQuickDemoLogin('CORPORATE')}
                className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white group-hover:text-blue-300">Vikram Patel (Corporate Manager)</p>
                    <p className="text-[10px] text-slate-400">TechCorp Solutions • GST Invoicing • Employee Rides</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
                  Select
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            256-Bit Encrypted Sessions
          </span>
          <span>FairRide Identity Engine</span>
        </div>
      </div>
    </div>
  );
};
