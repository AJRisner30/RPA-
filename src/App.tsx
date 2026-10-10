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
import { TrialBanner } from './components/TrialBanner';
import { SignInGate } from './components/SignInGate';
import { LoadingSplash } from './components/LoadingSplash';
import { getCurrentAthlete, AthleteProfile, updateAthleteProfile, registerAthlete } from './utils/athleteAuth';
import { calculateReadinessScore } from './utils/readinessEngine';
import { Award, ShieldCheck, Dumbbell, Heart, Flame, Mail, Instagram, ExternalLink, Zap, Smartphone } from 'lucide-react';
import { PatrolReadyCompanyEmblem } from './components/BrandingLogos';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { useFirebase } from './context/FirebaseContext';
import { 
  subscribeToUserWorkoutLogs, 
  subscribeToUserAthlete, 
  saveWorkoutLogToFirestore,
  saveAthleteToFirestore
} from './utils/firebaseSync';

export default function App() {
  const { user, loading } = useFirebase();
  const [activeTab, setActiveTab] = useState<TabType>('workouts');
  const [programs, setPrograms] = useState<WorkoutProgram[]>(() => getStoredPrograms());
  const [logs, setLogs] = useState<WorkoutSessionLog[]>(() => getStoredWorkoutLogs());
  const [currentAthlete, setCurrentAthlete] = useState<AthleteProfile>(() => getCurrentAthlete());
  const [isAthleteModalOpen, setIsAthleteModalOpen] = useState<boolean>(false);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState<boolean>(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
  const [activeProgramKey, setActiveProgramKey] = useState<ProgramKey>(() => 
    getCurrentAthlete().questionnaire?.recommendedProgramKey || 'apex_protocol'
  );

  // Active workout session modal state
  const [activeLiveProgram, setActiveLiveProgram] = useState<WorkoutProgram | null>(null);

  // Pre-selected warmup flow
  const [targetWarmupId, setTargetWarmupId] = useState<string | null>(null);

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

    return () => {
      unsubscribeLogs();
      unsubscribeAthlete();
    };
  }, [user]);

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

  // 1. Initial page boot: display branded loading splash while auth state is resolving
  if (loading) {
    return <LoadingSplash />;
  }

  // 2. Strict Authentication Gate: Require everyone to sign in before being able to use the app
  if (!user) {
    return <SignInGate />;
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
        readinessScore={readiness.overallScore}
        readinessTier={readiness.tier}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-5">
        {/* 14-Day Risk-Free Trial Status & Upgrade Warning Banner */}
        <TrialBanner 
          onOpenCheckout={() => setIsPricingModalOpen(true)}
          className="mb-4"
        />

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

      {/* RBAC Pricing Tiers & Custom Claims Modal */}
      <PricingTiersModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
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
                href="https://bckd.co/87uJC2e"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors font-bold cursor-pointer"
                title="Bucked Up Supplement Partner"
              >
                <Zap className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                <span>Bucked Up Supps</span>
                <ExternalLink className="w-3 h-3 text-blue-400/60" />
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
    </div>
  );
}
