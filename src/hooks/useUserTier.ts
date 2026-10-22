import { useState, useEffect, useCallback } from 'react';
import { onIdTokenChanged, User, IdTokenResult } from 'firebase/auth';
import { auth } from '../firebase';
import { 
  getCurrentAthlete, 
  updateAthleteProfile, 
  isMasterExemptAccount, 
  getAthleteTrialState, 
  startAthleteFreeTrial 
} from '../utils/athleteAuth';
import { activateAthleteSubscription } from '../utils/squarePayments';
import { activateTrialCode } from '../utils/trialCodes';

export type UserTier = 'standard' | 'pro' | 'enterprise';
export type UserAccountStatus = 'trialing' | 'active_subscriber' | 'past_due' | 'canceled' | 'unpaid' | 'not_selected';

export interface UserTierState {
  tier: UserTier;
  status: UserAccountStatus;
  trialEnd: number | null; // Milliseconds timestamp
  trialEndSeconds: number | null;
  trialDaysRemaining: number;
  trialHoursRemaining: number;
  trialMinutesRemaining: number;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  isTrialExpiringSoon: boolean; // < 3 days remaining
  isActiveSubscriber: boolean;
  hasActiveAccess: boolean; // master exempt OR paying subscriber OR unexpired active trial
  hasSelectedPlan: boolean; // false if new user has not chosen free trial or subscription
  isExempt: boolean; // true ONLY for risneraryan@gmail.com
  claims: Record<string, any>;
  isPro: boolean;
  isEnterprise: boolean;
  isStandard: boolean;
  loading: boolean;
  user: User | null;
  error: string | null;
  refreshClaims: () => Promise<IdTokenResult | null>;
  setSimulatedOverride: (override: Partial<{ tier: UserTier; status: UserAccountStatus; trialEndOffsetDays: number; trialEndMs?: number }> | null) => void;
  activateSubscription: (tier: UserTier, providerDetails?: Record<string, any>) => Promise<void>;
  activateTrialWithCode: (code: string) => Promise<{ success: boolean; message: string; daysGranted?: number }>;
  startFreeTrial: (days?: number) => Promise<void>;
  simulateTrialDaysRemaining: (days: number) => void;
}

const STORAGE_SIMULATION_KEY = 'rpa_tier_simulation_override_v2';

export function useUserTier(): UserTierState {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [tier, setTier] = useState<UserTier>('standard');
  const [status, setStatus] = useState<UserAccountStatus>('not_selected');
  const [trialEndMs, setTrialEndMs] = useState<number | null>(null);
  const [hasSelectedPlan, setHasSelectedPlan] = useState<boolean>(false);
  const [claims, setClaims] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(() => Date.now());

  const [simulatedOverride, setSimOverride] = useState<any>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SIMULATION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Active clock ticker: recalculates elapsed time every 10 seconds so the trial countdown moves live
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const evaluateClaims = useCallback(async (currentUser: User | null, forceRefresh = false) => {
    if (!currentUser) {
      setUser(null);
      setTier('standard');
      setStatus('not_selected');
      setTrialEndMs(null);
      setHasSelectedPlan(false);
      setClaims({});
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const tokenResult: IdTokenResult = await currentUser.getIdTokenResult(forceRefresh);
      const userClaims = tokenResult.claims || {};
      const userEmail = currentUser.email || '';

      // 1. MASTER EXEMPT ACCOUNT CHECK: risneraryan@gmail.com has permanent full unrestricted access
      if (isMasterExemptAccount(userEmail)) {
        setUser(currentUser);
        setClaims(userClaims);
        setTier('pro');
        setStatus('active_subscriber');
        setTrialEndMs(Date.now() + 365 * 24 * 60 * 60 * 1000);
        setHasSelectedPlan(true);
        setLoading(false);
        return tokenResult;
      }

      // 2. Paying subscriber check (Square subscription or Custom Claim)
      const athlete = getCurrentAthlete();
      let effectiveTierRaw = (userClaims.tier as string)?.toLowerCase();
      let effectiveStatusRaw = (userClaims.status as string)?.toLowerCase() as UserAccountStatus;

      if (athlete?.subscription && athlete.subscription.status === 'active_subscriber') {
        effectiveTierRaw = athlete.subscription.tier;
        effectiveStatusRaw = 'active_subscriber';
      }

      // 3. Persistent 14-day Free Trial Check (Strict Per-User Check)
      const trialRecord = getAthleteTrialState(currentUser.uid || athlete?.id || 'officer', userEmail);
      let resolvedTrialEndMs: number | null = null;
      let planChosen = false;

      if (effectiveStatusRaw === 'active_subscriber') {
        planChosen = true;
      } else if (trialRecord && trialRecord.hasSelectedPlan) {
        planChosen = true;
        resolvedTrialEndMs = trialRecord.trialEndMs;
        effectiveTierRaw = trialRecord.tier || 'pro';
        effectiveStatusRaw = Date.now() < trialRecord.trialEndMs ? 'trialing' : 'unpaid';
      } else if (athlete?.trialActivation && athlete.trialActivation.trialEndMs && (athlete.id !== 'athlete-default' || (athlete.email && athlete.email.toLowerCase() === userEmail.toLowerCase()))) {
        planChosen = true;
        resolvedTrialEndMs = athlete.trialActivation.trialEndMs;
        effectiveTierRaw = athlete.trialActivation.tier || 'pro';
        effectiveStatusRaw = Date.now() < athlete.trialActivation.trialEndMs ? 'trialing' : 'unpaid';
      } else if (userClaims.trialEnd) {
        const rawEnd = userClaims.trialEnd as number;
        resolvedTrialEndMs = rawEnd < 10000000000 ? rawEnd * 1000 : rawEnd;
        planChosen = true;
        effectiveStatusRaw = Date.now() < resolvedTrialEndMs ? 'trialing' : 'unpaid';
      }

      // Simulated overrides for QA/testing (only applied if targeted to this user or untargeted within session)
      if (simulatedOverride) {
        const targetEmail = simulatedOverride.targetEmail;
        const matchesUser = !targetEmail || (userEmail && targetEmail.toLowerCase() === userEmail.toLowerCase());
        if (matchesUser) {
          if (simulatedOverride.tier) effectiveTierRaw = simulatedOverride.tier;
          if (simulatedOverride.status) effectiveStatusRaw = simulatedOverride.status;
          if (typeof simulatedOverride.trialEndOffsetDays === 'number') {
            resolvedTrialEndMs = Date.now() + (simulatedOverride.trialEndOffsetDays * 86400 * 1000);
            planChosen = true;
          } else if (typeof simulatedOverride.trialEndMs === 'number') {
            resolvedTrialEndMs = simulatedOverride.trialEndMs;
            planChosen = true;
          }
          if (simulatedOverride.hasSelectedPlan !== undefined) {
            planChosen = simulatedOverride.hasSelectedPlan;
          }
        }
      }

      // Determine detected tier
      let detectedTier: UserTier = 'standard';
      if (effectiveTierRaw === 'pro') detectedTier = 'pro';
      else if (effectiveTierRaw === 'enterprise') detectedTier = 'enterprise';
      else detectedTier = 'standard';

      // Determine detected status
      const detectedStatus: UserAccountStatus = effectiveStatusRaw || (planChosen ? 'trialing' : 'not_selected');

      setUser(currentUser);
      setClaims(userClaims);
      setTier(detectedTier);
      setStatus(detectedStatus);
      setTrialEndMs(resolvedTrialEndMs);
      setHasSelectedPlan(planChosen);
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

    const handleTrialChanged = () => {
      evaluateClaims(auth.currentUser, false);
    };
    window.addEventListener('trial_state_changed', handleTrialChanged);

    return () => {
      unsubscribe();
      window.removeEventListener('trial_state_changed', handleTrialChanged);
    };
  }, [evaluateClaims]);

  const refreshClaims = useCallback(async () => {
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

  const activateSubscription = useCallback(async (newTier: UserTier, providerDetails?: Record<string, any>) => {
    const userEmail = auth.currentUser?.email || '';
    const uid = auth.currentUser?.uid || getCurrentAthlete()?.id || 'local-officer';
    await activateAthleteSubscription(newTier, uid, providerDetails);
    setSimulatedOverride({ 
      tier: newTier, 
      status: 'active_subscriber', 
      hasSelectedPlan: true,
      targetEmail: userEmail,
    });
    await evaluateClaims(auth.currentUser, true);
  }, [evaluateClaims, setSimulatedOverride]);

  const activateTrialWithCode = useCallback(async (code: string) => {
    const userEmail = auth.currentUser?.email || '';
    const uid = auth.currentUser?.uid || getCurrentAthlete()?.id || 'local-officer';
    const res = await activateTrialCode(code, uid);
    if (res.success && res.daysGranted && res.activationRecord) {
      setSimulatedOverride({
        tier: res.activationRecord.tier,
        status: 'trialing',
        trialEndMs: res.activationRecord.trialEndMs,
        trialEndOffsetDays: res.daysGranted,
        hasSelectedPlan: true,
        targetEmail: userEmail,
      });
      await evaluateClaims(auth.currentUser, true);
    }
    return res;
  }, [evaluateClaims, setSimulatedOverride]);

  const startFreeTrial = useCallback(async (days = 14) => {
    const athlete = getCurrentAthlete();
    const userEmail = auth.currentUser?.email || athlete?.email || '';
    const athleteId = auth.currentUser?.uid || athlete?.id || 'default-officer';
    const newRecord = startAthleteFreeTrial(athleteId, days, userEmail);
    
    // Also store simulated override to ensure immediate reactivity
    setSimulatedOverride({
      tier: 'pro',
      status: 'trialing',
      trialEndMs: newRecord.trialEndMs,
      trialEndOffsetDays: days,
      hasSelectedPlan: true,
      targetEmail: userEmail,
    });
    await evaluateClaims(auth.currentUser, true);
  }, [evaluateClaims, setSimulatedOverride]);

  const simulateTrialDaysRemaining = useCallback((days: number) => {
    const userEmail = auth.currentUser?.email || '';
    if (days <= 0) {
      setSimulatedOverride({
        tier: 'pro',
        status: 'unpaid',
        trialEndMs: Date.now() - 1000,
        trialEndOffsetDays: 0,
        hasSelectedPlan: true,
        targetEmail: userEmail,
      });
    } else {
      setSimulatedOverride({
        tier: 'pro',
        status: 'trialing',
        trialEndMs: Date.now() + (days * 86400 * 1000),
        trialEndOffsetDays: days,
        hasSelectedPlan: true,
        targetEmail: userEmail,
      });
    }
    evaluateClaims(auth.currentUser, true);
  }, [evaluateClaims, setSimulatedOverride]);

  // Master exempt account calculation
  const isExempt = Boolean(user?.email && isMasterExemptAccount(user.email));

  // Compute live trial time calculations based on the live clock
  const now = currentTimeMs;
  const isSubscriber = status === 'active_subscriber';
  const isTrialActive = !isExempt && !isSubscriber && hasSelectedPlan && trialEndMs !== null && now < trialEndMs;
  const isTrialExpired = !isExempt && !isSubscriber && hasSelectedPlan && trialEndMs !== null && now >= trialEndMs;

  const msRemaining = trialEndMs ? Math.max(0, trialEndMs - now) : 0;
  const trialDaysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
  const trialHoursRemaining = Math.ceil(msRemaining / (1000 * 60 * 60));
  const trialMinutesRemaining = Math.ceil(msRemaining / (1000 * 60));
  const isTrialExpiringSoon = isTrialActive && trialDaysRemaining <= 3;

  // Access validation:
  // 1. Coach Aryan Risner (risneraryan@gmail.com) -> Always true
  // 2. Active paying subscriber -> Always true
  // 3. User with active unexpired trial -> True
  // 4. Otherwise (expired or plan not selected) -> FALSE (Locked)
  const isProTier = tier === 'pro' || tier === 'enterprise';
  const hasActiveAccess = isExempt || isSubscriber || isTrialActive;

  return {
    tier: isExempt ? 'pro' : tier,
    status: isExempt ? 'active_subscriber' : status,
    trialEnd: isExempt ? Date.now() + 365 * 86400000 : trialEndMs,
    trialEndSeconds: trialEndMs ? Math.floor(trialEndMs / 1000) : null,
    trialDaysRemaining,
    trialHoursRemaining,
    trialMinutesRemaining,
    isTrialActive,
    isTrialExpired,
    isTrialExpiringSoon,
    isActiveSubscriber: isExempt ? true : isSubscriber,
    hasActiveAccess,
    hasSelectedPlan: isExempt ? true : hasSelectedPlan,
    isExempt,
    claims,
    isPro: isExempt ? true : isProTier,
    isEnterprise: tier === 'enterprise',
    isStandard: tier === 'standard',
    loading,
    user,
    error,
    refreshClaims,
    setSimulatedOverride,
    activateSubscription,
    activateTrialWithCode,
    startFreeTrial,
    simulateTrialDaysRemaining,
  };
}
