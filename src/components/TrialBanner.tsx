import React from 'react';
import { 
  AlertTriangle, Clock, Zap, Sparkles, ArrowRight, ShieldCheck, 
  Lock, RefreshCw 
} from 'lucide-react';
import { useUserTier } from '../hooks/useUserTier';

export interface TrialBannerProps {
  onOpenCheckout?: () => void;
  className?: string;
  compact?: boolean;
}

/**
 * Component: TrialBanner
 * 
 * Reads the `trialEnd` custom claim, calculates remaining days,
 * and displays an urgent upgrade warning if fewer than 3 days remain.
 */
export const TrialBanner: React.FC<TrialBannerProps> = ({
  onOpenCheckout,
  className = '',
  compact = false,
}) => {
  const { 
    isTrialActive, 
    isTrialExpired, 
    isTrialExpiringSoon, 
    trialDaysRemaining, 
    trialHoursRemaining,
    isActiveSubscriber,
    loading 
  } = useUserTier();

  // If user is already a paying subscriber, no trial warning is necessary
  if (loading || isActiveSubscriber) {
    return null;
  }

  // 1. EXPIRED TRIAL BANNER
  if (isTrialExpired) {
    return (
      <div className={`w-full bg-gradient-to-r from-red-950 via-zinc-950 to-red-950 border-y sm:border border-red-500/50 sm:rounded-2xl p-3 sm:p-4 shadow-lg animate-in fade-in duration-200 ${className}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/40">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-red-300 font-mono">
                  14-Day Pro Trial Expired
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-900/60 text-red-200 border border-red-700">
                  Access Locked
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                Your 14-day risk-free access to the <strong className="text-white">Auto-Overload Engine</strong> and <code className="text-amber-300 font-mono text-[11px]">performance_metrics</code> has ended.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCheckout}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            <span>Upgrade to Pro ($30/mo)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 2. TRIAL EXPIRING SOON (< 3 DAYS REMAINING) - URGENT UPGRADE WARNING
  if (isTrialExpiringSoon) {
    return (
      <div className={`w-full bg-gradient-to-r from-amber-950/90 via-zinc-950 to-amber-950/90 border-y sm:border border-amber-500/60 sm:rounded-2xl p-3 sm:p-4 shadow-xl shadow-amber-500/10 animate-pulse-subtle ${className}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40 animate-bounce-short">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300 font-mono flex items-center gap-1.5">
                  ⚠️ Action Required: Trial Expiring Soon
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-amber-500 text-black">
                  {trialDaysRemaining === 1 ? 'Last 24 Hours' : `${trialDaysRemaining} Days Left`}
                </span>
              </div>
              <p className="text-xs text-zinc-200 mt-0.5 leading-snug">
                Fewer than 3 days left on your 14-day trial. Upgrade now to ensure uninterrupted Auto-Overload calculations and tactical telemetry.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenCheckout}
              className="flex-1 sm:flex-none px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-black" />
              <span>Lock In Pro Access ($30/mo)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. NORMAL ACTIVE TRIAL (> 3 DAYS REMAINING)
  if (isTrialActive) {
    if (compact) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 border border-amber-500/40 rounded-lg text-[11px] font-mono text-amber-300">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>14-Day Trial: <strong>{trialDaysRemaining}d remaining</strong></span>
        </div>
      );
    }

    return (
      <div className={`w-full bg-[#0d1627]/90 border-y sm:border border-blue-500/30 sm:rounded-2xl p-2.5 sm:p-3 shadow-md backdrop-blur-md ${className}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <div className="text-slate-300">
              <span className="font-bold text-white font-mono uppercase text-[11px]">
                14-Day Risk-Free Pro Trial Active
              </span>
              <span className="text-slate-400 ml-2 hidden md:inline">
                All Pro features unlocked (Auto-Overload Engine &amp; Firestore Performance Metrics).
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-[11px] font-bold text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-500/40">
              {trialDaysRemaining} Days Left
            </span>
            <button
              type="button"
              onClick={onOpenCheckout}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Pricing ($30/mo)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TrialBanner;
