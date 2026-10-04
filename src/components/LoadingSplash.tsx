import React from 'react';
import { OverlandCompanyEmblem } from './BrandingLogos';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export const LoadingSplash: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#10151a] text-zinc-100 flex flex-col items-center justify-center p-4 relative font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(245,158,11,0.1),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-sm">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-500/25 rounded-full blur-xl animate-pulse" />
          <div className="relative p-1 bg-gradient-to-b from-amber-400/40 via-zinc-800 to-zinc-900 rounded-2xl shadow-2xl border border-amber-400/30">
            <OverlandCompanyEmblem size="lg" />
          </div>
        </div>

        <div className="space-y-1 pt-2">
          <h2 className="text-xl font-black uppercase tracking-wider text-white font-athletic">
            Overland Athletics
          </h2>
          <span className="text-xs text-amber-400 font-bold tracking-widest uppercase font-mono block">
            Authenticating Protocol Credentials...
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono pt-3">
          <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>Verifying encrypted cloud session</span>
        </div>
      </div>
    </div>
  );
};
