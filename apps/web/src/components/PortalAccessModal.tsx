import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  X,
  Shield,
  Building2,
  Car,
  KeyRound,
  Lock,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface PortalAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPortal: 'DRIVER' | 'CORPORATE' | 'ADMIN' | null;
  onNavigateToOnboarding?: () => void;
}

export const PortalAccessModal: React.FC<PortalAccessModalProps> = ({
  isOpen,
  onClose,
  targetPortal,
  onNavigateToOnboarding
}) => {
  const { setActiveRoleView, setCurrentUser } = useAppStore();

  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen || !targetPortal) return null;

  const portalConfig = {
    DRIVER: {
      title: 'Driver Partner Portal Access',
      subtitle: 'Restricted to registered FairRide commercial drivers',
      codePlaceholder: 'e.g. DRV-8821 or DRV-HYD-101',
      codeLabel: 'Driver Partner Access Code',
      icon: Car,
      accentColor: 'text-amber-400',
      badge: 'DRIVER PARTNER ACCESS',
      defaultCode: 'DRV-8821',
      demoCodes: [
        { label: 'Rajesh Kumar (Sedan)', code: 'DRV-8821' },
        { label: 'Vikram Singh (SUV)', code: 'DRV-4019' }
      ]
    },
    CORPORATE: {
      title: 'Corporate Enterprise Portal Access',
      subtitle: 'Restricted to corporate employee ride administrators',
      codePlaceholder: 'e.g. CORP-TCS-HYD or CORP-ENTERPRISE',
      codeLabel: 'Corporate Organization Code',
      icon: Building2,
      accentColor: 'text-cyan-400',
      badge: 'ENTERPRISE BUSINESS PORTAL',
      defaultCode: 'CORP-TCS-HYD',
      demoCodes: [
        { label: 'TCS Hyderabad Mobility', code: 'CORP-TCS-HYD' },
        { label: 'Infosys Cyberabad', code: 'CORP-INFY-2026' }
      ]
    },
    ADMIN: {
      title: 'Admin & Safety Operations Console',
      subtitle: 'Restricted to FairRide platform operations & safety dispatch officers',
      codePlaceholder: 'Enter Admin Security Passcode',
      codeLabel: 'Master Security Key',
      icon: Shield,
      accentColor: 'text-rose-400',
      badge: 'RESTRICTED OPERATIONS CONSOLE',
      defaultCode: 'ADMIN-2026',
      demoCodes: [
        { label: 'Hyderabad Safety Officer', code: 'ADMIN-2026' }
      ]
    }
  }[targetPortal];

  const handleVerifyAccess = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanCode = accessCode.trim().toUpperCase();

    if (!cleanCode) {
      setError(`Please enter your ${portalConfig.codeLabel}`);
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);

      if (targetPortal === 'DRIVER') {
        if (!cleanCode.startsWith('DRV')) {
          setError('Invalid Driver Partner Code. Format: DRV-XXXX');
          return;
        }
        setCurrentUser({
          userId: 'drv_demo_rajesh',
          name: 'Rajesh Kumar',
          email: 'rajesh.kumar@fairride.partner',
          phone: '+91 9800000003',
          role: 'DRIVER' as any,
          walletBalance: 1450,
          fairPoints: 200
        });
        setActiveRoleView('DRIVER');
        onClose();
      } else if (targetPortal === 'CORPORATE') {
        if (!cleanCode.startsWith('CORP')) {
          setError('Invalid Corporate Org Code. Format: CORP-XXXX');
          return;
        }
        setCurrentUser({
          userId: 'corp_user_01',
          name: 'Priya Sharma (Corporate Admin)',
          email: 'priya.sharma@tcs.com',
          phone: '+91 9800000005',
          role: 'CORPORATE' as any,
          walletBalance: 50000,
          fairPoints: 1200
        });
        setActiveRoleView('CORPORATE');
        onClose();
      } else if (targetPortal === 'ADMIN') {
        if (cleanCode !== 'ADMIN-2026' && cleanCode !== 'ADMIN' && cleanCode !== '1234') {
          setError('Invalid Admin Security Passcode. Access denied.');
          return;
        }
        setCurrentUser({
          userId: 'admin_master_01',
          name: 'Platform Operations Admin',
          email: 'admin@fairride.in',
          phone: '+91 9800000001',
          role: 'ADMIN' as any,
          walletBalance: 99999,
          fairPoints: 5000
        });
        setActiveRoleView('ADMIN');
        onClose();
      }
    }, 600);
  };

  const Icon = portalConfig.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-300">
            <Icon className={`w-3.5 h-3.5 ${portalConfig.accentColor}`} />
            <span>{portalConfig.badge}</span>
          </div>
          <h2 className="text-xl font-black text-white">{portalConfig.title}</h2>
          <p className="text-xs text-slate-400">{portalConfig.subtitle}</p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerifyAccess} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              {portalConfig.codeLabel}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
              <input
                type="text"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value);
                  setError('');
                }}
                placeholder={portalConfig.codePlaceholder}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-11 pr-4 py-3 text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-400 tracking-wider"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Code helper */}
          <div className="pt-1">
            <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
              Click to Auto-Fill Code:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {portalConfig.demoCodes.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setAccessCode(item.code)}
                  className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-slate-600 transition-all font-mono"
                >
                  {item.code} • <span className="text-slate-400">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isVerifying ? 'Verifying Code...' : 'Authorize & Enter Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* If Driver: Option to Register new driver */}
          {targetPortal === 'DRIVER' && onNavigateToOnboarding && (
            <div className="text-center pt-2 border-t border-slate-800">
              <p className="text-xs text-slate-400">
                New driver without a partner code?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToOnboarding();
                  }}
                  className="text-emerald-400 font-bold hover:underline ml-1"
                >
                  Register & Pay Onboarding Fee
                </button>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
