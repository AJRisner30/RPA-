import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { IdTokenResult } from 'firebase/auth';
import { 
  ShieldAlert, Zap, Lock, RefreshCw, ArrowRight, CheckCircle2, 
  AlertTriangle, CreditCard 
} from 'lucide-react';

export type PricingTier = 'standard' | 'pro' | 'enterprise';

export interface RequireTierProps {
  children: React.ReactNode;
  /**
   * The minimum tier required to access this feature.
   * Defaults to 'pro'.
   */
  requiredTier?: PricingTier;
  /**
   * Display name of the premium feature (e.g., 'Auto-Overload Engine')
   */
  featureName?: string;
  /**
   * Target tab or URL route to redirect unauthorized or expired users to.
   * Defaults to '#checkout'.
   */
  redirectPath?: string;
  /**
   * Callback invoked when an unauthorized user attempts access
   */
  onUnauthorizedRedirect?: () => void;
  /**
   * Optional custom fallback component to render when access is denied
   */
  fallback?: React.ReactNode;
  /**
   * Whether to show an upgrade card in place if redirection is not immediate
   */
  showUpgradeCard?: boolean;
}

const TIER_HIERARCHY: Record<PricingTier, number> = {
  standard: 1,
  pro: 2,
  enterprise: 3,
};

/**
 * React Component Wrapper: RequireTier (or ProFeatureGate)
 * 
 * Verifies custom claims via `auth.currentUser.getIdTokenResult()`:
 * 1. Checks tier hierarchy.
 * 2. Checks trial expiration (`trialEnd` claim).
 * 3. Automatically redirects users to a checkout page if their trial has expired
 *    and their status has not updated to 'active_subscriber'.
 */
export const RequireTier: React.FC<RequireTierProps> = ({
  children,
  requiredTier = 'pro',
  featureName = 'Auto-Overload Engine',
  redirectPath = '#checkout',
  onUnauthorizedRedirect,
  fallback,
  showUpgradeCard = true,
}) => {
  const [checking, setChecking] = useState<boolean>(true);
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [currentTier, setCurrentTier] = useState<PricingTier>('standard');
  const [accountStatus, setAccountStatus] = useState<string>('trialing');
  const [trialExpired, setTrialExpired] = useState<boolean>(false);
  const [trialEndMs, setTrialEndMs] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkAuthAndClaim = async (forceRefresh = false) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setAuthorized(false);
      setCurrentTier('standard');
      setAccountStatus('trialing');
      setTrialExpired(false);
      setChecking(false);
      return;
    }

    try {
      if (forceRefresh) setIsRefreshing(true);
      // Retrieve the Firebase Auth ID Token Result with custom claims
      const tokenResult: IdTokenResult = await currentUser.getIdTokenResult(forceRefresh);
      const claims = tokenResult.claims || {};

      // 1. Check local simulation override if set (for live developer testing)
      let rawTier = (claims.tier as string)?.toLowerCase() as PricingTier || 'pro';
      let rawStatus = (claims.status as string)?.toLowerCase() || 'trialing';
      let rawTrialEnd = claims.trialEnd as number | undefined;

      try {
        const storedOverride = localStorage.getItem('rpa_tier_simulation_override_v1');
        if (storedOverride) {
          const parsed = JSON.parse(storedOverride);
          if (parsed.tier) rawTier = parsed.tier;
          if (parsed.status) rawStatus = parsed.status;
          if (typeof parsed.trialEndOffsetDays === 'number') {
            rawTrialEnd = Math.floor(Date.now() / 1000) + (parsed.trialEndOffsetDays * 86400);
          }
        }
      } catch {}

      setCurrentTier(rawTier);
      setAccountStatus(rawStatus);

      // 2. Parse trialEnd timestamp
      let endMs: number;
      if (rawTrialEnd) {
        endMs = rawTrialEnd < 10000000000 ? rawTrialEnd * 1000 : rawTrialEnd;
      } else {
        // Fallback default trial: 14 days from user creation
        const creationTime = new Date(currentUser.metadata.creationTime || Date.now()).getTime();
        endMs = creationTime + 14 * 24 * 60 * 60 * 1000;
      }
      setTrialEndMs(endMs);

      // 3. Evaluate active access rules:
      // Must have tier >= requiredTier
      // AND either status is 'active_subscriber' OR current time is less than trialEnd
      const userRank = TIER_HIERARCHY[rawTier] || 1;
      const requiredRank = TIER_HIERARCHY[requiredTier] || 2;
      const hasTierRank = userRank >= requiredRank;

      const isSubscriber = rawStatus === 'active_subscriber';
      const isExpired = !isSubscriber && Date.now() >= endMs;
      setTrialExpired(isExpired);

      const hasAccess = hasTierRank && (isSubscriber || !isExpired);
      setAuthorized(hasAccess);
      setErrorMessage(null);

      // 4. AUTOMATIC REDIRECT:
      // If their trial has expired and their status has not updated to active,
      // automatically redirect users to checkout page.
      if (!hasAccess) {
        if (onUnauthorizedRedirect) {
          onUnauthorizedRedirect();
        } else if (redirectPath) {
          if (typeof window !== 'undefined') {
            window.location.hash = redirectPath;
          }
        }
      }
    } catch (err: any) {
      console.error('[RequireTier] Error inspecting getIdTokenResult():', err);
      setErrorMessage(err?.message || 'Unable to verify custom claims.');
      setAuthorized(false);
    } finally {
      setChecking(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkAuthAndClaim(false);

    const unsubscribe = auth.onIdTokenChanged(() => {
      checkAuthAndClaim(false);
    });

    return () => unsubscribe();
  }, [requiredTier, redirectPath]);

  // Loading state
  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl animate-pulse text-zinc-400">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mb-2" />
        <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          Verifying {featureName} Access &amp; Trial Status...
        </span>
      </div>
    );
  }

  // Access Granted
  if (authorized) {
    return <>{children}</>;
  }

  // Custom fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Expired Trial / Unauthorized Upgrade Card
  if (showUpgradeCard) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-b from-zinc-900/95 via-zinc-950 to-black p-6 shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-zinc-800/80 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
              trialExpired 
                ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {trialExpired ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <Lock className="w-4 h-4" />}
            </span>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                {featureName}{' '}
                <span className={trialExpired ? 'text-red-400 text-xs font-black' : 'text-amber-400 text-xs font-black'}>
                  [{trialExpired ? 'TRIAL EXPIRED' : `${requiredTier.toUpperCase()} REQUIRED`}]
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                {trialExpired
                  ? '14-Day Free Trial Concluded • Upgrade to Continue'
                  : 'Custom Claim RBAC Protection Active'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border ${
              trialExpired
                ? 'bg-red-950/80 text-red-300 border-red-800'
                : 'bg-zinc-800/80 text-zinc-300 border-zinc-700'
            }`}>
              Status: <span className="uppercase">{accountStatus.replace('_', ' ')}</span>
            </span>
          </div>
        </div>

        {/* Informative Body */}
        <div className="space-y-4 mb-6">
          <p className="text-sm text-zinc-300 leading-relaxed">
            {trialExpired ? (
              <>
                Your <strong className="text-white">14-day risk-free Pro trial</strong> has concluded. To restore immediate access to the <strong className="text-amber-300">{featureName}</strong> and your tactical progression calculations, activate the <strong className="text-white">Pro Plan ($30/mo)</strong>.
              </>
            ) : (
              <>
                Access to the <strong className="text-white">{featureName}</strong> requires an active <span className="text-amber-400 font-semibold font-mono">{requiredTier.toUpperCase()}</span> tier or an active 14-day trial.
              </>
            )}
          </p>

          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-2.5">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono mb-1">
              Included with Pro Membership ($30/mo):
            </div>
            <div className="flex items-start gap-2 text-xs text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Auto-Overload Engine:</strong> Automatic linear &amp; percentage load calculations</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Restricted Firestore Metrics:</strong> Access to protected <code className="text-amber-300 font-mono">performance_metrics</code> collection</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Readiness Scoring:</strong> Multi-variable biometric &amp; recovery index</span>
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-300">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={() => checkAuthAndClaim(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 rounded-xl transition cursor-pointer disabled:opacity-50"
            title="Refresh custom claims token"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isRefreshing ? 'Refreshing Token...' : 'Refresh Claims'}</span>
          </button>

          <div className="flex items-center gap-2">
            <a
              href="#checkout"
              onClick={() => {
                if (onUnauthorizedRedirect) onUnauthorizedRedirect();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Proceed to Checkout ($30/mo)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export const ProFeatureGate = RequireTier;
export const RequireProTier: React.FC<Omit<RequireTierProps, 'requiredTier'>> = (props) => (
  <RequireTier requiredTier="pro" {...props} />
);

export default RequireTier;
