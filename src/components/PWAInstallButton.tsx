import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AppStoreModal } from './AppStoreModal';

interface PWAInstallButtonProps {
  variant?: 'nav' | 'banner' | 'pill';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'nav',
  className = '' 
}) => {
  const { isInstalled } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If running in standalone mode, display "App Store & Info" pill
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 shadow-md shrink-0 ${
          variant === 'nav'
            ? 'px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black border-2 border-amber-300 shadow-amber-500/20 text-xs font-black uppercase tracking-wider'
            : variant === 'pill'
            ? 'px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-[11px] font-black tracking-wide uppercase border border-amber-300 shadow-sm'
            : 'px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider border-2 border-amber-300 shadow-lg'
        } ${className}`}
        title="Install app to your device or view App Store publishing details"
      >
        {isInstalled ? (
          <>
            <Smartphone className="w-3.5 h-3.5 text-black stroke-[2.5] shrink-0" />
            <span className="whitespace-nowrap">App Installed</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5 text-black stroke-[2.5] shrink-0" />
            <span className="whitespace-nowrap">Install App</span>
          </>
        )}
      </button>

      <AppStoreModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};
