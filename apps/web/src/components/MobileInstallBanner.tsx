import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Smartphone, Download, X, ShieldCheck } from 'lucide-react';

export const MobileInstallBanner: React.FC = () => {
  const { setInstallModalOpen, deferredInstallPrompt, setDeferredInstallPrompt } = useAppStore();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [setDeferredInstallPrompt]);

  if (isDismissed) return null;

  return (
    <aside aria-label="Mobile app download" className="fixed bottom-4 left-4 right-4 z-40 sm:hidden animate-in slide-in-from-bottom duration-300">
      <div className="p-3.5 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-white shrink-0 shadow">
            <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-white truncate">
                FairRide Mobile App
              </span>
              <span className="text-[9px] bg-emerald-400 text-slate-950 font-black px-1.5 py-0.2 rounded">
                LITE
              </span>
            </div>
            <p className="text-[10px] text-slate-300 truncate">
              Install for instant 1-tap booking & offline locks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setInstallModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow cursor-pointer flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Install</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss banner"
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
