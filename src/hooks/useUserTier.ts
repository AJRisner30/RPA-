import { useState, useEffect, useCallback } from 'react';
import { onIdTokenChanged, User, IdTokenResult } from 'firebase/auth';
import { auth } from '../firebase';

export type UserTier = 'standard' | 'pro' | 'enterprise';
export type UserAccountStatus = 'trialing' | 'active_subscriber' | 'past_due' | 'canceled' | 'unpaid';

export interface UserTierState {
  tier: UserTier;
  status: UserAccountStatus;
  trialEnd: number | null; // Milliseconds timestamp
  trialEndSeconds: number | null;
  trialDaysRemaining: number;
  trialHoursRemaining: number;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  isTrialExpiringSoon: boolean; // < 3 days remaining
  isActiveSubscriber: boolean;
  hasActiveAccess: boolean; // pro tier AND (active_subscriber OR unexpired trial)
  claims: Record<string, any>;
  isPro: boolean;
  isEnterprise: boolean;
  isStandard: boolean;
  loading: boolean;
  user: User | null;
  error: string | null;
  refreshClaims: () => Promise<IdTokenResult | null>;
  setSimulatedOverride: (override: Partial<{ tier: UserTier; status: UserAccountStatus; trialEndOffsetDays: number }> | null) => void;
}

const STORAGE_SIMULATION_KEY = 'rpa_tier_simulation_override_v1';

export function useUserTier(): UserTierState {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [tier, setTier] = useState<UserTier>('standard');
  const [status, setStatus] = useState<UserAccountStatus>('trialing');
  const [trialEndMs, setTrialEndMs] = useState<number | null>(null);
  const [claims, setClaims] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [simulatedOverride, setSimOverride] = useState<any>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SIMULATION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const evaluateClaims = useCallback(async (currentUser: User | null, forceRefresh = false) => {
    if (!currentUser) {
      setUser(null);
      setTier('standard');
      setStatus('trialing');
      setTrialEndMs(null);
      setClaims({});
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const tokenResult: IdTokenResult = await currentUser.getIdTokenResult(forceRefresh);
      const userClaims = tokenResult.claims || {};

      // If simulated override is active in development/demo mode, merge it
      let effectiveTierRaw = (userClaims.tier as string)?.toLowerCase();
      let effectiveStatusRaw = (userClaims.status as string)?.toLowerCase() as UserAccountStatus;
      let effectiveTrialEnd = userClaims.trialEnd as number | undefined;

      if (simulatedOverride) {
        if (simulatedOverride.tier) effectiveTierRaw = simulatedOverride.tier;
        if (simulatedOverride.status) effectiveStatusRaw = simulatedOverride.status;
        if (typeof simulatedOverride.trialEndOffsetDays === 'number') {
          effectiveTrialEnd = Math.floor(Date.now() / 1000) + (simulatedOverride.trialEndOffsetDays * 86400);
        }
      }

      // Default tier is 'pro' during initial trial if user is trialing or has no tier yet
      let detectedTier: UserTier = 'standard';
      if (effectiveTierRaw === 'pro') {
        detectedTier = 'pro';
      } else if (effectiveTierRaw === 'enterprise') {
        detectedTier = 'enterprise';
      } else if (!effectiveTierRaw) {
        detectedTier = 'pro'; // Default new user to 14-day Pro trial
      }

      // Default status
      const detectedStatus: UserAccountStatus = effectiveStatusRaw || 'trialing';

      // Parse trialEnd timestamp (normalize seconds vs milliseconds)
      let resolvedTrialEndMs: number | null = null;
      if (effectiveTrialEnd) {
        resolvedTrialEndMs = effectiveTrialEnd < 10000000000 ? effectiveTrialEnd * 1000 : effectiveTrialEnd;
      } else {
        // Fallback default: 14 days from account creation or now
        resolvedTrialEndMs = Date.now() + 14 * 24 * 60 * 60 * 1000;
      }

      setUser(currentUser);
      setClaims(userClaims);
      setTier(detectedTier);
      setStatus(detectedStatus);
      setTrialEndMs(resolvedTrialEndMs);
      setLoading(false);
      return tokenResult;
    } catch (err: any) {
      console.error('[useUserTier] Error fetching token custom claims:', err);
      setError(err?.message || 'Failed to verify authorization claims.');
      setLoading(false);
      return null;
    }
  }, [simulatedOverride]);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      await evaluateClaims(currentUser, false);
    });

    return () => unsubscribe();
  }, [evaluateClaims]);

  const refreshClaims = useCallback(async () => {
    if (!auth.currentUser) return null;
    return await evaluateClaims(auth.currentUser, true);
  }, [evaluateClaims]);

  const setSimulatedOverride = useCallback((override: any) => {
    try {
      if (override) {
        localStorage.setItem(STORAGE_SIMULATION_KEY, JSON.stringify(override));
      } else {
        localStorage.removeItem(STORAGE_SIMULATION_KEY);
      }
    } catch {}
    setSimOverride(override);
  }, []);

  // Compute trial time calculations
  const now = Date.now();
  const isSubscriber = status === 'active_subscriber';
  const isTrialActive = !isSubscriber && status === 'trialing' && trialEndMs !== null && now < trialEndMs;
  const isTrialExpired = !isSubscriber && trialEndMs !== null && now >= trialEndMs;

  const msRemaining = trialEndMs ? Math.max(0, trialEndMs - now) : 0;
  const trialDaysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
  const trialHoursRemaining = Math.ceil(msRemaining / (1000 * 60 * 60));
  const isTrialExpiringSoon = isTrialActive && trialDaysRemaining <= 3;

  // Pro feature access allowed if user has Pro/Enterprise tier AND (active subscriber OR trial is not expired)
  const isProTier = tier === 'pro' || tier === 'enterprise';
  const hasActiveAccess = isProTier && (isSubscriber || isTrialActive);

  return {
    tier,
    status,
    trialEnd: trialEndMs,
    trialEndSeconds: trialEndMs ? Math.floor(trialEndMs / 1000) : null,
    trialDaysRemaining,
    trialHoursRemaining,
    isTrialActive,
    isTrialExpired,
    isTrialExpiringSoon,
    isActiveSubscriber: isSubscriber,
    hasActiveAccess,
    claims,
    isPro: isProTier,
    isEnterprise: tier === 'enterprise',
    isStandard: tier === 'standard',
    loading,
    user,
    error,
    refreshClaims,
    setSimulatedOverride,
  };
}
