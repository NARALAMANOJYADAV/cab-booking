import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  Smartphone,
  Download,
  QrCode,
  CheckCircle2,
  Share2,
  PlusSquare,
  Sparkles,
  Zap,
  ShieldCheck,
  BatteryCharging,
  WifiOff,
  X,
  ExternalLink,
  ChevronRight,
  ArrowDown
} from 'lucide-react';

export const InstallAppModal: React.FC = () => {
  const { isInstallModalOpen, setInstallModalOpen, deferredInstallPrompt, setDeferredInstallPrompt } = useAppStore();
  const [activeOsTab, setActiveOsTab] = useState<'AUTO' | 'ANDROID' | 'IOS'>('AUTO');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  if (!isInstallModalOpen) return null;

  const handleNativeInstall = async () => {
    if (deferredInstallPrompt) {
      try {
        setIsInstalling(true);
        deferredInstallPrompt.prompt();
        const choiceResult = await deferredInstallPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setInstalledSuccess(true);
          setDeferredInstallPrompt(null);
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      } finally {
        setIsInstalling(false);
      }
    } else {
      // If browser doesn't support direct trigger, switch to step-by-step
      setActiveOsTab('ANDROID');
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://cab-booking.tech4.in';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(currentUrl)}&margin=8&color=0f172a&bgcolor=ffffff`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/20">
              <Smartphone className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-slate-900">
                  Install FairRide App
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full border border-emerald-300">
                  PWA READY
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Install as a native mobile app on Android, iOS & Desktop
              </p>
            </div>
          </div>
          <button
            onClick={() => setInstallModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick 1-Tap PWA Install Trigger / Status Banner */}
          {installedSuccess ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">FairRide App Successfully Installed!</h4>
                <p className="text-xs text-emerald-700">You can now open FairRide directly from your mobile home screen or app drawer.</p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shrink-0 shadow">
                  <Download className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">Direct 1-Tap Install</h4>
                  <p className="text-xs text-slate-300">No App Store / Play Store download needed (0 MB storage footprint)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleNativeInstall}
                disabled={isInstalling}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>{deferredInstallPrompt ? 'Install App Now' : 'Add to Home Screen'}</span>
              </button>
            </div>
          )}

          {/* OS Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveOsTab('AUTO')}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeOsTab === 'AUTO'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-600" />
              <span>QR Code</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveOsTab('ANDROID')}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeOsTab === 'ANDROID'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🤖 Android</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveOsTab('IOS')}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeOsTab === 'IOS'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🍎 iPhone / iPad</span>
            </button>
          </div>

          {/* Tab 1: QR Code Scanner for Mobile */}
          {activeOsTab === 'AUTO' && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-md shrink-0">
                <img
                  src={qrCodeUrl}
                  alt="Scan QR Code to Open on Phone"
                  className="w-36 h-36 rounded-lg object-contain"
                />
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  <span>Scan with Smartphone Camera</span>
                </div>
                <h4 className="font-extrabold text-base text-slate-900">
                  Open on Your Mobile Device
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Open your camera app on iOS or Android and point at this QR code to load FairRide directly and add it to your Home Screen in 5 seconds.
                </p>
                <div className="pt-1 flex items-center justify-center sm:justify-start gap-2 text-[11px] text-slate-500 font-mono">
                  <span className="truncate max-w-[200px]">{currentUrl}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Android Step-by-Step */}
          {activeOsTab === 'ANDROID' && (
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
                Android Chrome / Edge / Brave Instructions
              </h4>
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="text-xs text-slate-700">
                    <strong className="text-slate-900 block font-bold mb-0.5">Open Browser Menu</strong>
                    Tap the <strong>three dots (⋮)</strong> in the top right corner of Chrome or Edge browser.
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="text-xs text-slate-700">
                    <strong className="text-slate-900 block font-bold mb-0.5">Select Install App</strong>
                    Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong> from the dropdown menu.
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div className="text-xs text-slate-700">
                    <strong className="text-slate-900 block font-bold mb-0.5">Confirm & Enjoy</strong>
                    Tap <strong>"Install"</strong>. FairRide will appear on your app drawer with offline caching enabled!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: iOS Step-by-Step */}
          {activeOsTab === 'IOS' && (
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
                Apple iPhone / iPad Safari Instructions
              </h4>
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="text-xs text-slate-700">
                    <strong className="text-slate-900 block font-bold mb-0.5">Open in Safari</strong>
                    Open this website in <strong>Apple Safari</strong> browser.
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="text-xs text-slate-700">
                    <strong className="text-slate-900 block font-bold mb-0.5">Tap Share Button</strong>
                    Tap the <strong>Share icon (<Share2 className="w-3.5 h-3.5 inline text-indigo-600" />)</strong> in the bottom toolbar of Safari.
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div className="text-xs text-slate-700">
                    <strong className="text-slate-900 block font-bold mb-0.5">Add to Home Screen</strong>
                    Scroll down and tap <strong>"Add to Home Screen (<PlusSquare className="w-3.5 h-3.5 inline text-indigo-600" />)"</strong>, then tap <strong>Add</strong> in the top right.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Key Advantages Checklist */}
          <div className="pt-2 border-t border-slate-200">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-3">
              Why Install FairRide Web App?
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Instant 1-tap booking</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <BatteryCharging className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero battery drain</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <WifiOff className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>Low bandwidth lite mode</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Live Route Guardian SOS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Version 1.0.0 • Verified PWA Build
          </span>
          <button
            type="button"
            onClick={() => setInstallModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
