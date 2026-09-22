import React, { useState, useEffect } from 'react';
import { 
  getStoredPrograms, savePrograms, 
  getStoredWorkoutLogs,
  getStoredRuckLogs, saveRuckLog, deleteRuckLog
} from './utils/storage';
import { WorkoutProgram, WorkoutSessionLog, RuckSessionLog } from './types';
import { Navbar, TabType } from './components/Navbar';
import { WorkoutsTab } from './components/WorkoutsTab';
import { WarmupsTab } from './components/WarmupsTab';
import { RepLoadCalculatorTab } from './components/RepLoadCalculatorTab';
import { ProgressGraphsTab } from './components/ProgressGraphsTab';
import { WorkoutLogsTab } from './components/WorkoutLogsTab';
import { RuckProgressTab } from './components/RuckProgressTab';
import { ContactTab } from './components/ContactTab';
import { ActiveWorkoutModal } from './components/ActiveWorkoutModal';
import { AthleteLoginModal } from './components/AthleteLoginModal';
import { getCurrentAthlete, AthleteProfile, updateAthleteProfile } from './utils/athleteAuth';
import { Award, ShieldCheck, Dumbbell, Heart, Flame, Mail, Instagram, ExternalLink, Zap, Smartphone, Footprints } from 'lucide-react';
import { OverlandCompanyEmblem } from './components/BrandingLogos';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { useFirebase } from './context/FirebaseContext';
import { 
  subscribeToUserWorkoutLogs, 
  subscribeToUserAthlete, 
  saveWorkoutLogToFirestore,
  subscribeToUserRuckLogs,
  saveRuckLogToFirestore,
  deleteRuckLogFromFirestore
} from './utils/firebaseSync';

export default function App() {
  const { user } = useFirebase();
  const [activeTab, setActiveTab] = useState<TabType>('workouts');
  const [programs, setPrograms] = useState<WorkoutProgram[]>(() => getStoredPrograms());
  const [logs, setLogs] = useState<WorkoutSessionLog[]>(() => getStoredWorkoutLogs());
  const [ruckLogs, setRuckLogs] = useState<RuckSessionLog[]>(() => getStoredRuckLogs());
  const [currentAthlete, setCurrentAthlete] = useState<AthleteProfile>(() => getCurrentAthlete());
  const [isAthleteModalOpen, setIsAthleteModalOpen] = useState<boolean>(false);

  // Active workout session modal state
  const [activeLiveProgram, setActiveLiveProgram] = useState<WorkoutProgram | null>(null);

  // Pre-selected warmup flow
  const [targetWarmupId, setTargetWarmupId] = useState<string | null>(null);

  // Real-time Firestore sync when authenticated
  useEffect(() => {
    if (!user) return;

    // 1. Subscribe to workout logs in Firestore
    const unsubscribeLogs = subscribeToUserWorkoutLogs(user.uid, (cloudLogs) => {
      setLogs(cloudLogs);
      try {
        localStorage.setItem('rpa_workout_logs_v1', JSON.stringify(cloudLogs));
      } catch {}
    });

    // 2. Subscribe to athlete profile in Firestore
    const unsubscribeAthlete = subscribeToUserAthlete(user.uid, (cloudAthlete) => {
      if (cloudAthlete) {
        setCurrentAthlete(cloudAthlete);
        updateAthleteProfile(cloudAthlete.id, cloudAthlete);
      }
    });

    // 3. Subscribe to rucking logs in Firestore
    const unsubscribeRucks = subscribeToUserRuckLogs(user.uid, (cloudRucks) => {
      setRuckLogs(cloudRucks);
      try {
        localStorage.setItem('rpa_ruck_logs_v1', JSON.stringify(cloudRucks));
      } catch {}
    });

    return () => {
      unsubscribeLogs();
      unsubscribeAthlete();
      unsubscribeRucks();
    };
  }, [user]);

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

  const handleSaveRuckLog = (newRuckLog: RuckSessionLog, syncToWorkoutLogs: boolean) => {
    const updatedRucks = saveRuckLog(newRuckLog);
    setRuckLogs(updatedRucks);

    if (syncToWorkoutLogs) {
      const companionWorkoutLog: WorkoutSessionLog = {
        id: `workout-sync-${newRuckLog.id}`,
        userId: user?.uid,
        athleteId: newRuckLog.athleteId,
        workoutTitle: `🎒 ${newRuckLog.title} (${newRuckLog.weightLbs}# / ${newRuckLog.distanceMiles}mi)`,
        date: newRuckLog.date,
        startTime: '07:00',
        endTime: '08:00',
        durationMinutes: newRuckLog.durationMinutes,
        totalVolumeLbs: Math.round(newRuckLog.distanceMiles * newRuckLog.weightLbs),
        totalSetsCompleted: 1,
        rating: 5,
        notes: `Tactical ruck march on ${newRuckLog.terrain || 'pavement'}. Pace: ${newRuckLog.paceMinPerMile ? newRuckLog.paceMinPerMile.toFixed(2) : '--'} min/mi. Workload: ${newRuckLog.workloadIndex || (newRuckLog.distanceMiles * newRuckLog.weightLbs)} lb-mi. ${newRuckLog.notes || ''}`.trim(),
        exercises: [
          {
            exerciseName: `Weighted Ruck March (${newRuckLog.weightLbs} lbs)`,
            muscleGroup: 'Full Body',
            isTimed: true,
            sets: [
              {
                setNumber: 1,
                weightLbs: newRuckLog.weightLbs,
                reps: 1,
                distanceMiles: newRuckLog.distanceMiles,
                timeSeconds: newRuckLog.durationMinutes * 60,
                timeFormatted: `${newRuckLog.durationMinutes}:00`,
                rpe: newRuckLog.rpe,
                estimated1RM: newRuckLog.weightLbs,
              }
            ]
          }
        ]
      };
      setLogs((prev) => [companionWorkoutLog, ...prev]);
      if (user) {
        saveWorkoutLogToFirestore(companionWorkoutLog, user.uid).catch(console.warn);
      }
    }

    if (user) {
      saveRuckLogToFirestore(newRuckLog, user.uid).catch((err) => {
        console.warn('[Firebase] Save ruck log Firestore error:', err);
      });
    }
  };

  const handleDeleteRuckLog = (ruckId: string) => {
    const updated = deleteRuckLog(ruckId);
    setRuckLogs(updated);
    if (user) {
      deleteRuckLogFromFirestore(ruckId).catch((err) => {
        console.warn('[Firebase] Delete ruck log Firestore error:', err);
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#10151a] text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
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
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-5">
        {activeTab === 'workouts' && (
          <WorkoutsTab
            programs={programs}
            onStartWorkout={handleStartWorkout}
            onSelectWarmup={handleSelectWarmupFromProgram}
            onSavePrograms={handleUpdatePrograms}
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
            onNavigateToRuck={() => setActiveTab('ruck')}
          />
        )}

        {activeTab === 'graphs' && (
          <ProgressGraphsTab 
            logs={logs} 
            currentAthlete={currentAthlete}
            onNavigateToLogs={() => setActiveTab('logs')}
            onNavigateToRuck={() => setActiveTab('ruck')}
          />
        )}

        {activeTab === 'ruck' && (
          <RuckProgressTab
            ruckLogs={ruckLogs}
            workoutLogs={logs}
            currentAthlete={currentAthlete}
            onSaveRuckLog={handleSaveRuckLog}
            onDeleteRuckLog={handleDeleteRuckLog}
            onNavigateToWorkoutLogs={() => setActiveTab('logs')}
            onNavigateToGraphs={() => setActiveTab('graphs')}
          />
        )}

        {activeTab === 'contact' && (
          <ContactTab />
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
          setRuckLogs(getStoredRuckLogs());
        }}
      />

      {/* Footer Branded with Overland Athletics, Run Lift Ruck, Socials, and Partners */}
      <footer className="mt-auto border-t border-amber-500/20 bg-[#0d1217] py-8 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-3">
              <OverlandCompanyEmblem size="sm" />
              <div className="flex items-center gap-2">
                <span className="font-athletic font-black tracking-wider uppercase text-zinc-100">
                  Overland Athletics
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-amber-400 font-bold tracking-wide">Run • Lift • Ruck</span>
                <span className="text-zinc-600 hidden sm:inline">•</span>
                <span className="hidden sm:inline text-zinc-400">Go The Distance</span>
              </div>
            </div>

            {/* Quick Contact & Social Links in Footer */}
            <div className="flex items-center gap-4 flex-wrap justify-center text-xs">
              <a
                href="mailto:risnerathletics@gmail.com"
                className="flex items-center gap-1.5 text-zinc-300 hover:text-amber-400 transition-colors font-medium cursor-pointer"
                title="Email Overland Athletics"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>risnerathletics@gmail.com</span>
              </a>

              <span className="text-zinc-700 hidden sm:inline">•</span>

              <a
                href="https://www.instagram.com/ajrisner"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-zinc-300 hover:text-pink-400 transition-colors font-medium cursor-pointer"
                title="Instagram: @ajrisner"
              >
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
                <span>@ajrisner</span>
                <ExternalLink className="w-3 h-3 text-zinc-500" />
              </a>

              <span className="text-zinc-700 hidden sm:inline">•</span>

              <a
                href="https://bckd.co/87uJC2e"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors font-bold cursor-pointer"
                title="Bucked Up Supplement Partner"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Bucked Up Supplements</span>
                <ExternalLink className="w-3 h-3 text-amber-400/60" />
              </a>
            </div>

            <div className="flex items-center gap-2 text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Overland Athletics • Elite Performance</span>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400 font-mono">
            <div className="flex items-center gap-3">
              <span>Overland Athletics • Run • Lift • Ruck • All Rights Reserved</span>
              <span className="text-zinc-600 hidden md:inline">|</span>
              <PWAInstallButton variant="pill" />
            </div>
            <span className="text-amber-400/80">Elite Performance • Go The Distance</span>
          </div>
        </div>
      </footer>

      {/* Real-time Network Offline Detection Status */}
      <OfflineIndicator />
    </div>
  );
}
