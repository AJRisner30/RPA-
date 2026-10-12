import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useAndroidHaptics } from '../hooks/useAndroidHaptics';

interface AndroidInstallBannerProps {
  onOpenAndroidAppModal?: () => void;
}

export const AndroidInstallBanner: React.FC<AndroidInstallBannerProps> = ({
  onOpenAndroidAppModal,
}) => {
  const { isInstalled, isInstallable, isAndroid, install } = usePWAInstall();
  const { tap, success } = useAndroidHaptics();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('android_banner_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    } catch {}
  }, []);

  if (isInstalled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    tap();
    setIsDismissed(true);
    try {
      localStorage.setItem('android_banner_dismissed', 'true');
    } catch {}
  };

  const handleInstall = async () => {
    tap();
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        success();
      }
    } else if (onOpenAndroidAppModal) {
      onOpenAndroidAppModal();
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-950/90 via-[#0b1728] to-blue-950/90 border-b border-emerald-500/30 px-3 py-2 text-white relative z-20 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="font-athletic font-black uppercase text-emerald-300 mr-1.5 tracking-wider">
              Android App
            </span>
            <span className="text-slate-300 hidden sm:inline">
              Install Patrol Ready Performance on your Android device for native offline duty tracking &amp; haptics.
            </span>
            <span className="text-slate-300 sm:hidden">
              Install on Android for offline duty tracking
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleInstall}
            className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-[11px] tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-3 h-3 stroke-[2.5]" />
            <span>Install</span>
          </button>
          
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
