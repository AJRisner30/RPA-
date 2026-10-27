import React, { useState, useEffect } from 'react';
import { 
  getStoredPrograms, savePrograms, 
  getStoredWorkoutLogs
} from './utils/storage';
import { WorkoutProgram, WorkoutSessionLog, ProgramKey, QuestionnaireAnswers } from './types';
import { Navbar, TabType } from './components/Navbar';
import { WorkoutsTab } from './components/WorkoutsTab';
import { OfficerPortalTab } from './components/OfficerPortalTab';
import { WarmupsTab } from './components/WarmupsTab';
import { RepLoadCalculatorTab } from './components/RepLoadCalculatorTab';
import { ProgressGraphsTab } from './components/ProgressGraphsTab';
import { WorkoutLogsTab } from './components/WorkoutLogsTab';
import { ContactTab } from './components/ContactTab';
import { ActiveWorkoutModal } from './components/ActiveWorkoutModal';
import { AthleteLoginModal } from './components/AthleteLoginModal';
import { AbilityQuestionnaireModal } from './components/AbilityQuestionnaireModal';
import { PricingTiersModal } from './components/PricingTiersModal';
import { SquareConfirmationModal } from './components/SquareConfirmationModal';
import { ActivateTrialCodeModal } from './components/ActivateTrialCodeModal';
import { SubscriptionRecord } from './types';
import { TrialBanner } from './components/TrialBanner';
import { SignInGate } from './components/SignInGate';
import { LoadingSplash } from './components/LoadingSplash';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { AndroidAppModal } from './components/AndroidAppModal';
import { AndroidInstallBanner } from './components/AndroidInstallBanner';
import { useAndroidBackButton } from './hooks/useAndroidBackButton';
import { useAndroidWakeLock } from './hooks/useAndroidWakeLock';
import { useUserTier } from './hooks/useUserTier';
import { 
  getCurrentAthlete, 
  AthleteProfile, 
  updateAthleteProfile, 
  registerAthlete, 
  isCoachSession 
} from './utils/athleteAuth';
import { calculateReadinessScore } from './utils/readinessEngine';
import { PlanSelectionModal } from './components/PlanSelectionModal';
import { 
  Award, ShieldCheck, Dumbbell, Heart, Flame, Mail, 
  Instagram, ExternalLink, Zap, Smartphone, Lock, CreditCard, ArrowRight, Sparkles 
} from 'lucide-react';
import { PatrolReadyCompanyEmblem } from './components/BrandingLogos';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { AIWorkoutGeneratorModal } from './components/AIWorkoutGeneratorModal';
import { useFirebase } from './context/FirebaseContext';
import { 
  subscribeToUserWorkoutLogs, 
  subscribeToUserAthlete, 
  subscribeToOfficerProgram,
  subscribeToUserCustomPrograms,
  saveWorkoutLogToFirestore,
  saveAthleteToFirestore,
  saveCustomProgramToFirestore
} from './utils/firebaseSync';

export default function App() {
  const { user, loading } = useFirebase();

  // Aryan Risner (risneraryan@gmail.com) is the single exempt account with permanent full access
  const isMasterExempt = Boolean(
    user?.email && user.email.trim().toLowerCase() === 'risneraryan@gmail.com'
  );
  const isCoach = isMasterExempt || isCoachSession();

  const [hasOfficerProgram, setHasOfficerProgram] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('workouts');
  const [programs, setPrograms] = useState<WorkoutProgram[]>(() => getStoredPrograms());
  const [logs, setLogs] = useState<WorkoutSessionLog[]>(() => getStoredWorkoutLogs());
  const [currentAthlete, setCurrentAthlete] = useState<AthleteProfile>(() => getCurrentAthlete());
  const [isAthleteModalOpen, setIsAthleteModalOpen] = useState<boolean>(false);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState<boolean>(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState<boolean>(false);
  const [isSquareSuccessModalOpen, setIsSquareSuccessModalOpen] = useState<boolean>(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [confirmedSquareTier, setConfirmedSquareTier] = useState<'standard' | 'pro' | 'enterprise'>('pro');
  const [squareSubRecord, setSquareSubRecord] = useState<SubscriptionRecord | null>(null);

  // AI Workout Architect Generator modal & active custom AI program
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState<boolean>(false);
  const [activeCustomAIProgram, setActiveCustomAIProgram] = useState<WorkoutProgram | null>(null);

  const { 
    tier, 
    status, 
    isTrialActive, 
    isTrialExpired, 
    trialDaysRemaining,
    trialHoursRemaining,
    hasActiveAccess, 
    hasSelectedPlan, 
    isExempt,
    activateSubscription,
    startFreeTrial,
  } = useUserTier();

  const [activeProgramKey, setActiveProgramKey] = useState<ProgramKey>(() => 
    getCurrentAthlete().questionnaire?.recommendedProgramKey || 'apex_protocol'
  );

  // Active workout session modal state
  const [activeLiveProgram, setActiveLiveProgram] = useState<WorkoutProgram | null>(null);

  // Pre-selected warmup flow
  const [targetWarmupId, setTargetWarmupId] = useState<string | null>(null);

  // Android Back Button handler: close open modals or return to workouts
  const hasOpenModal = 
    activeLiveProgram !== null || 
    isAIGeneratorOpen ||
    isAthleteModalOpen || 
    isQuestionnaireOpen || 
    isPricingModalOpen || 
    isAndroidModalOpen ||
    isSquareSuccessModalOpen ||
    isCodeModalOpen;

  const handleCloseTopModal = () => {
    if (activeLiveProgram !== null) {
      setActiveLiveProgram(null);
    } else if (isAIGeneratorOpen) {
      setIsAIGeneratorOpen(false);
    } else if (isCodeModalOpen) {
      setIsCodeModalOpen(false);
    } else if (isSquareSuccessModalOpen) {
      setIsSquareSuccessModalOpen(false);
    } else if (isAndroidModalOpen) {
      setIsAndroidModalOpen(false);
    } else if (isPricingModalOpen) {
      setIsPricingModalOpen(false);
    } else if (isQuestionnaireOpen) {
      setIsQuestionnaireOpen(false);
    } else if (isAthleteModalOpen) {
      setIsAthleteModalOpen(false);
    }
  };

  useAndroidBackButton({
    hasOpenModal,
    onCloseModal: handleCloseTopModal,
    activeTab,
    onSelectTab: setActiveTab,
  });

  // Android Screen Wake Lock: Keeps display on during live workouts
  useAndroidWakeLock(activeLiveProgram !== null);

  // Handle URL query parameters (e.g. Android Home Screen Shortcuts or Square payment return ?payment=success)
  useEffect(() => {
    const handleUrlParams = () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      
      // 1. Square Checkout return handler: ?payment=success&tier=pro
      const paymentParam = params.get('payment');
      if (paymentParam === 'success') {
        const rawTier = (params.get('tier') || 'pro').toLowerCase();
        const tierParam = rawTier === 'standard' ? 'standard' : rawTier === 'enterprise' ? 'enterprise' : 'pro';
        const orderIdParam = params.get('session_id') || params.get('order_id') || `sq_ord_${Date.now().toString(36)}`;

        activateSubscription(tierParam, {
          orderId: orderIdParam,
          environment: 'sandbox',
        }).then(() => {
          setConfirmedSquareTier(tierParam);
          setSquareSubRecord({
            tier: tierParam,
            status: 'active_subscriber',
            provider: 'square',
            squareOrderId: orderIdParam,
            subscribedAt: new Date().toISOString(),
            amount: tierParam === 'pro' ? 30 : tierParam === 'enterprise' ? 99 : 15,
            currency: 'USD',
            environment: 'sandbox',
          });
          setIsSquareSuccessModalOpen(true);
        }).catch((err) => {
          console.warn('[Square] Automated subscription unlock error:', err);
        });

        // Strip payment parameters cleanly without reloading
        try {
          const cleanUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, cleanUrl);
        } catch {}
      }

      // 2. Navigation tab shortcut
      const tabParam = params.get('tab') as TabType | null;
      if (tabParam && ['workouts', 'officer_portal', 'warmups', 'calculator', 'logs', 'graphs', 'contact'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    };
    handleUrlParams();
  }, [activateSubscription]);

  // Real-time Firestore sync when authenticated
  useEffect(() => {
    if (!user) return;

    // 1. Subscribe to workout logs in Firestore
    const unsubscribeLogs = subscribeToUserWorkoutLogs(user.uid, (cloudLogs) => {
      if (cloudLogs.length > 0) {
        setLogs(cloudLogs);
        try {
          localStorage.setItem('rpa_workout_logs_v1', JSON.stringify(cloudLogs));
        } catch {}
      } else {
        // First-time sync: backfill existing local logs to the user's cloud account
        const localLogs = getStoredWorkoutLogs();
        if (localLogs.length > 0) {
          localLogs.forEach((l) => {
            saveWorkoutLogToFirestore(l, user.uid).catch(() => {});
          });
        }
      }
    });

    // 2. Subscribe to athlete profile in Firestore
    const unsubscribeAthlete = subscribeToUserAthlete(user.uid, (cloudAthlete) => {
      if (cloudAthlete) {
        setCurrentAthlete(cloudAthlete);
        updateAthleteProfile(cloudAthlete.id, cloudAthlete);
      } else {
        const athleteName = user.displayName || user.email?.split('@')[0] || 'Patrol Officer';
        const athleteEmail = user.email || '';
        const newAthlete = registerAthlete({
          name: athleteName,
          email: athleteEmail,
          experienceLevel: 'Intermediate',
          primaryGoal: 'Tactical Conditioning & Pursuit',
          weightLbs: 185,
        });
        setCurrentAthlete(newAthlete);
        saveAthleteToFirestore(newAthlete, user.uid).catch((err) => {
          console.warn('[Firebase] Initial athlete save note:', err);
        });
      }
    });

    // 3. Subscribe to officer individual assigned program
    const unsubscribeOfficerProg = subscribeToOfficerProgram(user.uid, (prog) => {
      setHasOfficerProgram(!!prog);
    });

    // 4. Subscribe to user custom AI programs
    const unsubscribeCustomProgs = subscribeToUserCustomPrograms(user.uid, (cloudProgs) => {
      if (cloudProgs && cloudProgs.length > 0) {
        setActiveCustomAIProgram((prev) => prev || cloudProgs[0]);
      }
    });

    return () => {
      unsubscribeLogs();
      unsubscribeAthlete();
      unsubscribeOfficerProg();
      unsubscribeCustomProgs();
    };
  }, [user]);

  // Strict Tab Protection: Only Coach AJ or officers with an assigned program can view the officer portal
  useEffect(() => {
    if (activeTab === 'officer_portal' && !isCoach && !hasOfficerProgram) {
      setActiveTab('workouts');
    }
  }, [activeTab, isCoach, hasOfficerProgram]);

  // Handle hash navigation to checkout/pricing modal
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== 'undefined' && (window.location.hash === '#checkout' || window.location.hash === '#pricing')) {
        setIsPricingModalOpen(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleUpdatePrograms = (updated: WorkoutProgram[]) => {
    setPrograms(updated);
    savePrograms(updated);
  };

  const handleStartWorkout = (program: WorkoutProgram) => {
    if (!hasActiveAccess && !isMasterExempt) {
      if (isTrialExpired) {
        setIsPricingModalOpen(true);
      }
      return;
    }
    setActiveLiveProgram(program);
  };

  const handleSelectWarmupFromProgram = (warmupId: string) => {
    setTargetWarmupId(warmupId);
    setActiveTab('warmups');
  };

  const handleWorkoutCompleted = (newLog: WorkoutSessionLog) => {
    setLogs((prev) => [newLog, ...prev]);
    setActiveLiveProgram(null);
    setActiveTab('logs');

    if (user) {
      saveWorkoutLogToFirestore(newLog, user.uid).catch((err) => {
        console.warn('[Firebase] Background log sync note:', err);
      });
    }
  };

  const handleSaveQuestionnaire = (answers: QuestionnaireAnswers, recommendedProgram: ProgramKey) => {
    const updatedAthlete: AthleteProfile = {
      ...currentAthlete,
      questionnaire: answers,
      primaryGoal: answers.primaryGoalCategory === 'muscle_armor_hypertrophy'
        ? 'Hypertrophy'
        : answers.primaryGoalCategory === 'hybrid_strength_running'
        ? 'Hybrid Athlete'
        : 'Tactical Conditioning & Pursuit',
    };
    setCurrentAthlete(updatedAthlete);
    updateAthleteProfile(updatedAthlete.id, updatedAthlete);
    setActiveProgramKey(recommendedProgram);
    setActiveTab('workouts');

    if (user) {
      saveAthleteToFirestore(updatedAthlete, user.uid).catch((err) => {
        console.warn('[Firebase] Background athlete save note:', err);
      });
    }
  };

  const handleActivateFreeTrial = async () => {
    await startFreeTrial(14);
    if (user) {
      const athlete = getCurrentAthlete();
      await saveAthleteToFirestore(athlete, user.uid);
    }
  };

  // 1. Initial page boot: display branded loading splash while auth state is resolving
  if (loading) {
    return <LoadingSplash />;
  }

  // 2. Strict Authentication Gate: Direct all visitors to the Activate Free Trial & Sign Up screen
  if (!user) {
    return (
      <>
        <SignInGate 
          onOpenPricingModal={() => setIsPricingModalOpen(true)}
          onOpenCodeModal={() => setIsCodeModalOpen(true)}
        />
        <PricingTiersModal
          isOpen={isPricingModalOpen}
          onClose={() => setIsPricingModalOpen(false)}
          onPaymentSuccess={() => setIsPricingModalOpen(false)}
        />
        <ActivateTrialCodeModal
          isOpen={isCodeModalOpen}
          onClose={() => setIsCodeModalOpen(false)}
          onCodeActivated={() => setIsCodeModalOpen(false)}
        />
      </>
    );
  }

  const readiness = calculateReadinessScore(currentAthlete, logs);

  return (
    <div className="min-h-screen bg-[#080e18] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Brand & Tab Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'warmups') setTargetWarmupId(null);
        }}
        onStartActiveWorkout={() => handleStartWorkout(programs[0])}
        currentAthlete={currentAthlete}
        onOpenAthleteModal={() => setIsAthleteModalOpen(true)}
        onOpenQuestionnaire={() => setIsQuestionnaireOpen(true)}
        onOpenPricingModal={() => setIsPricingModalOpen(true)}
        onOpenAndroidAppModal={() => setIsAndroidModalOpen(true)}
        onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
        readinessScore={readiness.overallScore}
        readinessTier={readiness.tier}
        hasOfficerProgram={hasOfficerProgram}
      />

      {/* Android Native App Install Banner */}
      <AndroidInstallBanner 
        onOpenAndroidAppModal={() => setIsAndroidModalOpen(true)} 
      />

      {/* Main Content Area (With bottom padding for Android bottom navigation bar on mobile) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-5 pb-24 md:pb-6">
        {/* 14-Day Risk-Free Trial Status & Upgrade Warning Banner */}
        <TrialBanner 
          onOpenCheckout={() => setIsPricingModalOpen(true)}
          onOpenCodeModal={() => setIsCodeModalOpen(true)}
          className="mb-4"
        />

        {/* STRICT TRIAL ACCESS GATE & TRIAL LOCKER:
            Non-exempt users MUST start their 14-day free trial or subscribe before gaining access to anything.
            - If !hasActiveAccess && !isMasterExempt:
              1) If isTrialExpired: render the expired lockdown screen.
              2) If !hasSelectedPlan: render the 14-day free trial required gate.
            - Only render workout protocols and tabs when access is active or user is master exempt!
        */}
        {!hasActiveAccess && !isMasterExempt ? (
          isTrialExpired ? (
            /* 14-DAY TRIAL EXPIRED LOCKDOWN */
            <div className="rounded-3xl border-2 border-red-500/60 bg-gradient-to-b from-[#18080c] via-[#0d1322] to-[#070b14] p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden my-4 animate-in fade-in duration-200">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse" />
              
              <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center text-red-400 mb-4 shadow-lg shadow-red-950/50">
                <Lock className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/90 border border-red-700/60 text-red-200 text-xs font-mono font-black uppercase mb-3">
                <span>Access Locked • 14-Day Free Trial Ended</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black uppercase text-white font-athletic tracking-wide">
                14-Day Risk-Free Trial Concluded
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mt-2 leading-relaxed">
                Your 14-day free trial access to Patrol Ready Performance has ended. All tactical training protocols, automated progressive overload tracking, and readiness metrics are locked. Subscribe to an active membership plan to restore immediate access.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
                {/* Pro Tier Card */}
                <div className="p-5 rounded-2xl bg-[#0e1628] border-2 border-amber-500/60 flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-amber-400 uppercase">Pro Frontline</span>
                      <span className="text-xs font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-black">$30/mo</span>
                    </div>
                    <h4 className="text-base font-black text-white font-athletic uppercase">Full Auto-Overload Engine</h4>
                    <p className="text-xs text-slate-400 mt-1">Complete 26-week periodization, automated double progression (+2.5 to +10 lbs), Universal PAT protocol, and readiness telemetry.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPricingModalOpen(true)}
                    className="mt-5 w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Subscribe to Pro ($30)</span>
                  </button>
                </div>

                {/* Standard Tier Card */}
                <div className="p-5 rounded-2xl bg-[#090f1d] border border-slate-700 flex flex-col justify-between shadow-md">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase">Standard Tier</span>
                      <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">$15/mo</span>
                    </div>
                    <h4 className="text-base font-black text-white font-athletic uppercase">Core Workout Logging</h4>
                    <p className="text-xs text-slate-400 mt-1">Access all protocols and core workout logs without automated telemetry.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPricingModalOpen(true)}
                    className="mt-5 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Subscribe Standard ($15)</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
                <button
                  type="button"
                  onClick={() => setIsPricingModalOpen(true)}
                  className="text-white hover:text-blue-300 font-bold uppercase tracking-wider cursor-pointer underline flex items-center gap-1.5"
                >
                  <span>View Full Plan Comparison &amp; Square Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <span className="text-slate-600 hidden sm:inline">•</span>

                <button
                  type="button"
                  onClick={() => setIsCodeModalOpen(true)}
                  className="text-amber-400 hover:text-amber-300 font-mono font-bold uppercase tracking-wider cursor-pointer"
                >
                  Have an Agency / Promotional Code?
                </button>
              </div>
            </div>
          ) : (
            /* 14-DAY FREE TRIAL ONBOARDING REQUIRED GATE */
            <div className="rounded-3xl border-2 border-blue-500/50 bg-gradient-to-b from-[#0b162c] via-[#081020] to-[#050a14] p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden my-4 animate-in fade-in duration-200">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-amber-500 animate-pulse" />

              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/20 border-2 border-blue-500/40 flex items-center justify-center text-blue-400 mb-4 shadow-lg shadow-blue-950/50">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/90 border border-blue-500/60 text-blue-200 text-xs font-mono font-black uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>14-Day Free Trial Required • $0 Today</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black uppercase text-white font-athletic tracking-wide">
                Start Your 14-Day Free Trial
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mt-2 leading-relaxed">
                Welcome to Patrol Ready Performance. Access to all tactical training programs, the Universal PAT 8-week protocol, automated progressive overload engine, and physical readiness scoring requires activating your 14-day risk-free trial or selecting a membership plan.
              </p>

              {/* Primary 1-Click Action Card */}
              <div className="mt-8 max-w-xl mx-auto p-6 rounded-2xl bg-gradient-to-br from-blue-950/80 via-[#0d182e] to-amber-950/30 border-2 border-blue-500 shadow-xl text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-black">
                        Recommended • $0 Today
                      </span>
                    </div>
                    <h3 className="text-lg font-black uppercase text-white font-athletic">
                      14-Day Risk-Free Pro Access
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-snug">
                      Instant access to all workouts, periodization plans, and double progression tracking for 14 days.
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] text-blue-200 font-mono">
                      <span>✓ All Protocols Unlocked</span>
                      <span>✓ Auto-Overload Engine</span>
                      <span>✓ No Commitment</span>
                    </div>
                  </div>

                  <div className="shrink-0 sm:text-right">
                    <button
                      type="button"
                      onClick={handleActivateFreeTrial}
                      className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/40 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                    >
                      <span>Start 14-Day Free Trial</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Secondary Options */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
                <button
                  type="button"
                  onClick={() => setIsPricingModalOpen(true)}
                  className="text-slate-300 hover:text-white font-bold uppercase tracking-wider cursor-pointer underline flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                  <span>Subscribe Directly (Pro $30 / Standard $15)</span>
                </button>

                <span className="text-slate-600 hidden sm:inline">•</span>

                <button
                  type="button"
                  onClick={() => setIsCodeModalOpen(true)}
                  className="text-amber-400 hover:text-amber-300 font-mono font-bold uppercase tracking-wider cursor-pointer"
                >
                  Have an Agency Access Code?
                </button>
              </div>
            </div>
          )
        ) : (
          <div key={activeTab} className="animate-tab-fade">
            {activeTab === 'workouts' && (
              <WorkoutsTab
                programs={programs}
                onStartWorkout={handleStartWorkout}
                onSelectWarmup={handleSelectWarmupFromProgram}
                onSavePrograms={handleUpdatePrograms}
                currentAthlete={currentAthlete}
                activeProgramKey={activeProgramKey}
                onSelectProgram={(key) => setActiveProgramKey(key)}
                onOpenQuestionnaire={() => setIsQuestionnaireOpen(true)}
                onOpenAthleteModal={() => setIsAthleteModalOpen(true)}
                onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
                activeCustomProgram={activeCustomAIProgram}
                onClearCustomProgram={() => setActiveCustomAIProgram(null)}
                readinessScore={readiness.overallScore}
                readinessTier={readiness.tier}
              />
            )}

            {activeTab === 'officer_portal' && (
              <OfficerPortalTab
                currentAthlete={currentAthlete}
                onStartCustomWorkout={handleStartWorkout}
                onOpenPricingModal={() => setIsPricingModalOpen(true)}
              />
            )}

            {activeTab === 'warmups' && (
              <WarmupsTab selectedWarmupId={targetWarmupId} />
            )}

            {activeTab === 'calculator' && (
              <RepLoadCalculatorTab logs={logs} />
            )}

            {activeTab === 'logs' && (
              <WorkoutLogsTab
                logs={logs}
                currentAthlete={currentAthlete}
                onUpdateLogs={setLogs}
                onOpenLiveWorkout={() => handleStartWorkout(programs[0])}
                onNavigateToGraphs={() => setActiveTab('graphs')}
              />
            )}

            {activeTab === 'graphs' && (
              <ProgressGraphsTab 
                logs={logs} 
                currentAthlete={currentAthlete}
                onNavigateToLogs={() => setActiveTab('logs')}
              />
            )}

            {activeTab === 'contact' && (
              <ContactTab />
            )}
          </div>
        )}
      </main>

      {/* Live Interactive Weights Tracker Modal */}
      {activeLiveProgram && (
        <ActiveWorkoutModal
          program={activeLiveProgram}
          onClose={() => setActiveLiveProgram(null)}
          onWorkoutCompleted={handleWorkoutCompleted}
        />
      )}

      {/* Athlete Login & Profile Modal */}
      <AthleteLoginModal
        isOpen={isAthleteModalOpen}
        onClose={() => setIsAthleteModalOpen(false)}
        onAthleteChanged={(athlete) => {
          setCurrentAthlete(athlete);
          setLogs(getStoredWorkoutLogs());
        }}
        onOpenQuestionnaire={() => setIsQuestionnaireOpen(true)}
      />

      {/* Physical Ability & Program Matcher Modal */}
      <AbilityQuestionnaireModal
        isOpen={isQuestionnaireOpen}
        onClose={() => setIsQuestionnaireOpen(false)}
        currentAthlete={currentAthlete}
        onSaveQuestionnaire={handleSaveQuestionnaire}
      />

      {/* Plan Selection Onboarding Gate: Prompts everyone upon sign in to pick a free trial or subscription */}
      <PlanSelectionModal
        isOpen={!isMasterExempt && !hasSelectedPlan && !loading}
        onStartTrial={handleActivateFreeTrial}
        onOpenPricingModal={() => setIsPricingModalOpen(true)}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
      />

      {/* Agency & Promotional Code Redemption Modal */}
      <ActivateTrialCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        onCodeActivated={(record) => {
          setIsCodeModalOpen(false);
          setIsPricingModalOpen(false);
        }}
      />

      {/* RBAC Pricing Tiers & Square Payment Links Modal */}
      <PricingTiersModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onPaymentSuccess={(activatedTier) => {
          setIsPricingModalOpen(false);
          setConfirmedSquareTier(activatedTier);
          setIsSquareSuccessModalOpen(true);
        }}
      />

      {/* Square Payment Activation Confirmation Modal */}
      <SquareConfirmationModal
        isOpen={isSquareSuccessModalOpen}
        tier={confirmedSquareTier}
        subscriptionRecord={squareSubRecord}
        onClose={() => setIsSquareSuccessModalOpen(false)}
        onNavigateToWorkouts={() => {
          setIsSquareSuccessModalOpen(false);
          setActiveTab('workouts');
        }}
      />

      {/* Footer Branded with Patrol Ready Performance, Tactical Fitness for the Frontline */}
      <footer className="mt-auto border-t border-blue-500/20 bg-[#0b1320] py-8 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <PatrolReadyCompanyEmblem size="sm" />
              <div className="flex items-center gap-2">
                <span className="font-athletic font-black tracking-wider uppercase text-white">
                  Patrol Ready Performance
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-blue-400 font-bold tracking-wide">Tactical fitness for the Frontline.</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="hidden sm:inline text-slate-400">Duty Readiness &amp; Combat Chassis</span>
              </div>
            </div>

            {/* Quick Contact & Social Links in Footer */}
            <div className="flex items-center gap-4 flex-wrap justify-center text-xs">
              <a
                href="mailto:risnerathletics@gmail.com"
                className="flex items-center gap-1.5 text-slate-300 hover:text-blue-400 transition-colors font-medium cursor-pointer"
                title="Email Patrol Ready Performance"
              >
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>risnerathletics@gmail.com</span>
              </a>

              <span className="text-slate-700 hidden sm:inline">•</span>

              <a
                href="https://www.instagram.com/ajrisner"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-300 hover:text-blue-400 transition-colors font-medium cursor-pointer"
                title="Instagram: @ajrisner"
              >
                <Instagram className="w-3.5 h-3.5 text-blue-400" />
                <span>@ajrisner</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>

              <span className="text-slate-700 hidden sm:inline">•</span>

              <a
                href="https://50callabz.com/risner55"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors font-bold cursor-pointer"
                title="Official Supplement Partner: 50 Cal Labz (Use Code: PATROLREADY)"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>50 Cal Labz Supps (Code: PATROLREADY)</span>
                <ExternalLink className="w-3 h-3 text-amber-400/60" />
              </a>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Patrol Ready Performance • LEO Fitness</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-3">
              <span>Patrol Ready Performance • Tactical fitness for the Frontline. • All Rights Reserved</span>
              <PWAInstallButton variant="pill" withPrefixDivider />
            </div>
            <span className="text-blue-400/80">Duty Ready • Armor-Plated • Pursuit Velocity</span>
          </div>
        </div>
      </footer>

      {/* Real-time Network Offline Detection Status */}
      <OfflineIndicator />

      {/* Android Native Bottom Navigation (Mobile Viewports Only) */}
      <AndroidBottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'warmups') setTargetWarmupId(null);
        }}
        currentAthlete={currentAthlete}
        onOpenAthleteModal={() => setIsAthleteModalOpen(true)}
        onOpenPricingModal={() => setIsPricingModalOpen(true)}
        onOpenAndroidAppModal={() => setIsAndroidModalOpen(true)}
        onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
        readinessScore={readiness.overallScore}
        hasOfficerProgram={hasOfficerProgram}
      />

      {/* AI Tactical Workout Plan Architect Modal */}
      <AIWorkoutGeneratorModal
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        onActivateProgram={(program) => {
          setActiveCustomAIProgram(program);
          setActiveProgramKey('custom_ai');
          setActiveTab('workouts');
        }}
        onStartWorkout={(program) => {
          setActiveCustomAIProgram(program);
          setActiveProgramKey('custom_ai');
          setActiveTab('workouts');
          handleStartWorkout(program);
        }}
        onSaveToCloud={async (program) => {
          if (user) {
            await saveCustomProgramToFirestore(program, user.uid);
          }
        }}
        currentAthlete={currentAthlete}
        userEmail={user?.email || ''}
      />

      {/* Android Native App Packaging & Installation Modal */}
      <AndroidAppModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />
    </div>
  );
}
