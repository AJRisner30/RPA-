import React from 'react';
import { 
  Lock, ArrowRight, CheckCircle2, 
  AlertTriangle, CreditCard 
} from 'lucide-react';
import { useUserTier, UserTier } from '../hooks/useUserTier';

export type PricingTier = 'standard' | 'pro' | 'enterprise';

export interface RequireTierProps {
  children: React.ReactNode;
  requiredTier?: PricingTier;
  featureName?: string;
  redirectPath?: string;
  onUnauthorizedRedirect?: () => void;
  fallback?: React.ReactNode;
  showUpgradeCard?: boolean;
}

const TIER_HIERARCHY: Record<PricingTier, number> = {
  standard: 1,
  pro: 2,
  enterprise: 3,
};

export const RequireTier: React.FC<RequireTierProps> = ({
  children,
  requiredTier = 'pro',
  featureName = 'Auto-Overload Engine',
  redirectPath = '#pricing',
  onUnauthorizedRedirect,
  fallback,
  showUpgradeCard = true,
}) => {
  const { 
    tier, 
    status, 
    isTrialExpired, 
    isExempt, 
    isActiveSubscriber,
    hasActiveAccess, 
    loading 
  } = useUserTier();

  // 1. MASTER EXEMPT ACCOUNT: Aryan Risner (risneraryan@gmail.com) has unconditional master access
  if (isExempt) {
    return <>{children}</>;
  }

  // 2. Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl animate-pulse text-zinc-400">
        <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          Verifying {featureName} Access &amp; Subscription Status...
        </span>
      </div>
    );
  }

  // 3. User tier hierarchy check
  const userRank = TIER_HIERARCHY[tier] || 1;
  const requiredRank = TIER_HIERARCHY[requiredTier] || 2;
  const hasTierRank = userRank >= requiredRank;

  const isAuthorized = hasActiveAccess && hasTierRank;

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const handleGoToPricing = () => {
    if (onUnauthorizedRedirect) {
      onUnauthorizedRedirect();
    } else {
      window.location.hash = redirectPath || '#pricing';
    }
  };

  if (!showUpgradeCard) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-red-500/40 bg-gradient-to-b from-zinc-900/95 via-zinc-950 to-black p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800/80 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
            isTrialExpired 
              ? 'bg-red-500/10 text-red-400 border-red-500/30' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            {isTrialExpired ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <Lock className="w-4 h-4" />}
          </span>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
              {featureName}{' '}
              <span className={isTrialExpired ? 'text-red-400 text-xs font-black' : 'text-amber-400 text-xs font-black'}>
                [{isTrialExpired ? 'TRIAL EXPIRED — LOCKED' : `${requiredTier.toUpperCase()} REQUIRED`}]
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              {isTrialExpired
                ? '14-Day Free Trial Concluded • Subscribe to Continue'
                : 'Patrol Ready Performance • Pro Tactical Plan Required'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border ${
            isTrialExpired
              ? 'bg-red-950/80 text-red-300 border-red-800'
              : 'bg-zinc-800/80 text-zinc-300 border-zinc-700'
          }`}>
            Status: <span className="uppercase">{isTrialExpired ? 'TRIAL EXPIRED' : status.replace('_', ' ')}</span>
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-4 mb-6">
        <p className="text-sm text-zinc-300 leading-relaxed">
          {isTrialExpired ? (
            <>
              Your <strong className="text-white">14-day risk-free Pro trial</strong> has concluded. To restore immediate access to <strong className="text-amber-300">{featureName}</strong> and your tactical progression calculations, activate your monthly subscription with Square.
            </>
          ) : (
            <>
              Access to the <strong className="text-white">{featureName}</strong> requires an active <span className="text-amber-400 font-semibold font-mono">{requiredTier.toUpperCase()}</span> tier or an active 14-day trial.
            </>
          )}
        </p>

        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-2.5">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono mb-1">
            Included with Pro Frontline Membership ($30/mo):
          </div>
          <div className="flex items-start gap-2 text-xs text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Automated RPE &amp; Double-Progression load increases (+2.5 to +10 lbs)</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Full 26-Week Periodization, Universal PAT Agility, and Hypertrophy protocols</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Secure Cloud Syncing across all shifts and mobile devices</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-800/80">
        <span className="text-xs text-zinc-400">
          Instant unlock upon Square checkout. Cancel anytime.
        </span>

        <button
          type="button"
          onClick={handleGoToPricing}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
        >
          <CreditCard className="w-4 h-4" />
          <span>Subscribe with Square ($30/mo)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
