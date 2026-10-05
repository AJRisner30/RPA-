import React from 'react';
import { PatrolReadyCompanyEmblem } from './BrandingLogos';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export const LoadingSplash: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#080e18] text-slate-100 flex flex-col items-center justify-center p-4 relative font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(37,99,235,0.18),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-sm">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/25 rounded-full blur-xl animate-pulse" />
          <div className="relative p-1 bg-gradient-to-b from-blue-400/40 via-slate-800 to-slate-950 rounded-2xl shadow-2xl border border-blue-400/40">
            <PatrolReadyCompanyEmblem size="lg" />
          </div>
        </div>

        <div className="space-y-1 pt-2">
          <div className="flex items-center justify-center gap-1.5">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white font-athletic">
              Patrol Ready
            </h2>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-blue-400 font-athletic">
              Performance
            </h2>
          </div>
          <span className="text-xs text-blue-300 font-bold tracking-widest uppercase font-mono block">
            Tactical fitness for the Frontline.
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono pt-3">
          <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
          <span>Authenticating Officer &amp; Operator Credentials...</span>
        </div>
      </div>
    </div>
  );
};
