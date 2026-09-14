import React, { useState } from 'react';
import { 
  getStoredPrograms, savePrograms, 
  getStoredWorkoutLogs
} from './utils/storage';
import { WorkoutProgram, WorkoutSessionLog } from './types';
import { Navbar, TabType } from './components/Navbar';
import { WorkoutsTab } from './components/WorkoutsTab';
import { WarmupsTab } from './components/WarmupsTab';
import { RepLoadCalculatorTab } from './components/RepLoadCalculatorTab';
import { ProgressGraphsTab } from './components/ProgressGraphsTab';
import { WorkoutLogsTab } from './components/WorkoutLogsTab';
import { ActiveWorkoutModal } from './components/ActiveWorkoutModal';
import { Award, ShieldCheck, Dumbbell, Heart, Flame } from 'lucide-react';
import { RpaCompanyEmblem } from './components/BrandingLogos';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('workouts');
  const [programs, setPrograms] = useState<WorkoutProgram[]>(() => getStoredPrograms());
  const [logs, setLogs] = useState<WorkoutSessionLog[]>(() => getStoredWorkoutLogs());

  // Active workout session modal state
  const [activeLiveProgram, setActiveLiveProgram] = useState<WorkoutProgram | null>(null);

  // Pre-selected warmup flow
  const [targetWarmupId, setTargetWarmupId] = useState<string | null>(null);

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
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Brand & Tab Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'warmups') setTargetWarmupId(null);
        }}
        onStartActiveWorkout={() => handleStartWorkout(programs[0])}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
            onUpdateLogs={setLogs}
            onOpenLiveWorkout={() => handleStartWorkout(programs[0])}
            onNavigateToGraphs={() => setActiveTab('graphs')}
          />
        )}

        {activeTab === 'graphs' && (
          <ProgressGraphsTab 
            logs={logs} 
            onNavigateToLogs={() => setActiveTab('logs')}
          />
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

      {/* Footer Branded with RPA & ISSA Credentials */}
      <footer className="mt-auto border-t border-zinc-900 bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <RpaCompanyEmblem size="sm" />
            <div className="flex items-center gap-2">
              <span className="font-athletic font-black tracking-wider uppercase text-zinc-200">
                Risner Performance Athletics
              </span>
              <span className="text-zinc-600">•</span>
              <span>Strength & Conditioning System</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Certified by International Sports Sciences Association (ISSA-CPT)</span>
          </div>

          <div className="text-zinc-400 font-mono text-[11px]">
            Designed for Peak Human Performance
          </div>
        </div>
      </footer>
    </div>
  );
}
