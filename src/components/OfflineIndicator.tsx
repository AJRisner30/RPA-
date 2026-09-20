import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 text-black px-3.5 py-2 text-xs font-bold shadow-xl border border-amber-400 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
      <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Offline Mode — Protocols and logs cached locally</span>
    </div>
  );
};
