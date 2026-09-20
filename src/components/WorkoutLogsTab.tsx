import React, { useState, useEffect } from 'react';
import { 
  History, Calendar, Clock, Dumbbell, Trash2, ChevronDown, 
  ChevronUp, Search, Download, Plus, Award, CheckCircle2, 
  Flame, TrendingUp, Sparkles, Pause, Play, Timer, X,
  AlertTriangle, RotateCcw, Filter, Check, ShieldAlert
} from 'lucide-react';
import { WorkoutSessionLog, MuscleGroup } from '../types';
import { 
  deleteWorkoutLog, 
  calculate1RM, 
  saveWorkoutLog,
  clearAllWorkoutLogs,
  clearAthleteWorkoutLogs,
  clearHybridStrengthLogs
} from '../utils/storage';
import { soundManager } from '../utils/audio';
import { TEMPLATE_EXERCISES, HybridStrengthLogItem, getDefaultRestPeriod } from '../data/protocolData';
import { getCurrentAthlete, getAthletes, AthleteProfile } from '../utils/athleteAuth';

interface WorkoutLogsTabProps {
  logs: WorkoutSessionLog[];
  onUpdateLogs: (logs: WorkoutSessionLog[]) => void;
  onOpenLiveWorkout?: () => void;
  onNavigateToGraphs?: () => void;
}

export const WorkoutLogsTab: React.FC<WorkoutLogsTabProps> = ({
  logs,
  onUpdateLogs,
  onOpenLiveWorkout,
  onNavigateToGraphs,
}) => {
  // Current active athlete & filter
  const [currentAthlete, setCurrentAthlete] = useState<AthleteProfile>(() => getCurrentAthlete());
  const [athleteFilter, setAthleteFilter] = useState<'current' | 'all'>('current');
  const athletes = getAthletes();

  // Lift Tracker form state (exact fields from user's template)
  const [exercise, setExercise] = useState<string>('Back Squat');
  const [weight, setWeight] = useState<string>('');
  const [reps, setReps] = useState<string>('');
  const [restSeconds, setRestSeconds] = useState<number>(() => getDefaultRestPeriod('Back Squat'));
  const [hybridLogs, setHybridLogs] = useState<HybridStrengthLogItem[]>([]);

  // Clear modal and toast notifications
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [clearScope, setClearScope] = useState<'all' | 'current'>('all');
  const [clearLiftsToo, setClearLiftsToo] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Accordion view
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(logs[0]?.id || null);

  // Dedicated inline rest timer state
  const [activeRestTimer, setActiveRestTimer] = useState<{
    exerciseName: string;
    secondsRemaining: number;
    totalSeconds: number;
    isRunning: boolean;
  } | null>(null);

  // Listen for athlete profile changes or global clear events
  useEffect(() => {
    const handleAthleteChanged = (e: Event) => {
      const customEvent = e as CustomEvent<AthleteProfile>;
      if (customEvent.detail) {
        setCurrentAthlete(customEvent.detail);
      }
    };

    const handleLogsCleared = () => {
      setHybridLogs([]);
    };

    window.addEventListener('athlete_changed', handleAthleteChanged);
    window.addEventListener('logs_cleared', handleLogsCleared);
    return () => {
      window.removeEventListener('athlete_changed', handleAthleteChanged);
      window.removeEventListener('logs_cleared', handleLogsCleared);
    };
  }, []);

  useEffect(() => {
    if (!activeRestTimer || !activeRestTimer.isRunning) return;

    const interval = window.setInterval(() => {
      setActiveRestTimer((prev) => {
        if (!prev || !prev.isRunning) return prev;
        if (prev.secondsRemaining <= 1) {
          soundManager.playRestComplete();
          return { ...prev, secondsRemaining: 0, isRunning: false };
        }
        if (prev.secondsRemaining <= 4 && prev.secondsRemaining > 1) {
          soundManager.playCountdownBeep();
        }
        return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRestTimer?.isRunning]);

  const handleStartRest = (secs: number, exName: string) => {
    setActiveRestTimer({
      exerciseName: exName,
      secondsRemaining: secs,
      totalSeconds: secs,
      isRunning: true,
    });
    soundManager.playCountdownBeep(true);
  };

  // Load hybridStrengthLogs from localStorage on mount - start fresh with [] by default
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hybridStrengthLogs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHybridLogs(parsed);
          return;
        }
      }
      setHybridLogs([]);
    } catch (error) {
      console.error('Failed to parse hybridStrengthLogs:', error);
      setHybridLogs([]);
    }
  }, []);

  const handleSaveSet = () => {
    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps, 10);
    if (!weight || isNaN(weightNum) || !reps || isNaN(repsNum) || weightNum <= 0 || repsNum <= 0) {
      return;
    }

    const estimated1RM = calculate1RM(weightNum, repsNum);
    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const newLogItem: HybridStrengthLogItem = {
      id: Date.now(),
      date: todayStr,
      exercise,
      weight: weightNum.toFixed(1),
      reps: repsNum,
      estimated1RM,
    };

    const updatedHybrid = [newLogItem, ...hybridLogs];
    setHybridLogs(updatedHybrid);
    localStorage.setItem('hybridStrengthLogs', JSON.stringify(updatedHybrid));

    // Play sound and trigger inline rest timer for this exercise
    soundManager.playSetLogged();
    handleStartRest(restSeconds, exercise);

    // Also synchronize this lift as a session log to feed the progress graphs and PR board!
    const muscleGroup: MuscleGroup = exercise.includes('Squat') || exercise.includes('Lunge')
      ? 'Quads'
      : exercise.includes('Deadlift') || exercise.includes('RDL') || exercise.includes('Hip Thrust')
      ? 'Hamstrings & Glutes'
      : exercise.includes('Bench')
      ? 'Chest'
      : exercise.includes('Row') || exercise.includes('Pull-Up')
      ? 'Back'
      : exercise.includes('Press')
      ? 'Shoulders'
      : 'Full Body';

    const newSessionLog: WorkoutSessionLog = {
      id: `session-${Date.now()}`,
      athleteId: currentAthlete.id,
      workoutTitle: `${exercise} Quick Set`,
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMinutes: 15,
      totalVolumeLbs: weightNum * repsNum,
      totalSetsCompleted: 1,
      notes: `Logged via Overland Athletics Lift Tracker for ${currentAthlete.name}: ${weightNum} lbs × ${repsNum} reps (Est 1RM: ${estimated1RM} lbs).`,
      exercises: [
        {
          exerciseName: exercise,
          muscleGroup,
          sets: [
            {
              setNumber: 1,
              weightLbs: weightNum,
              reps: repsNum,
              rpe: 8,
              estimated1RM,
            },
          ],
        },
      ],
    };

    const updatedSessionLogs = saveWorkoutLog(newSessionLog);
    onUpdateLogs(updatedSessionLogs);

    setWeight('');
    setReps('');
  };

  const handleDeleteSet = (id: number) => {
    const updated = hybridLogs.filter((log) => log.id !== id);
    setHybridLogs(updated);
    localStorage.setItem('hybridStrengthLogs', JSON.stringify(updated));
  };

  const handleClearHybridSets = () => {
    if (window.confirm('Clear all recent quick lift sets?')) {
      clearHybridStrengthLogs();
      setHybridLogs([]);
      setToastMessage('Recent lift sets cleared.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleDeleteSession = (logId: string) => {
    if (window.confirm('Delete this workout log entry?')) {
      const updated = deleteWorkoutLog(logId);
      onUpdateLogs(updated);
    }
  };

  const handleExecuteClear = () => {
    if (clearScope === 'all') {
      const updated = clearAllWorkoutLogs();
      onUpdateLogs(updated);
      if (clearLiftsToo) {
        clearHybridStrengthLogs();
        setHybridLogs([]);
      }
      setToastMessage('All workout logs & lift records cleared across all athletes.');
    } else {
      const updated = clearAthleteWorkoutLogs(currentAthlete.id);
      onUpdateLogs(updated);
      if (clearLiftsToo) {
        clearHybridStrengthLogs();
        setHybridLogs([]);
      }
      setToastMessage(`Cleared all workout history for ${currentAthlete.name}.`);
    }

    setIsClearModalOpen(false);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter logs by active athlete scope
  const athleteScopedLogs = logs.filter((log) => {
    if (athleteFilter === 'all') return true;
    if (log.athleteId) {
      return log.athleteId === currentAthlete.id;
    }
    // Backward compatibility for legacy logs without athleteId
    return currentAthlete.id === 'athlete-default' || currentAthlete.id === 'athlete-aj-risner';
  });

  const filteredSessionLogs = athleteScopedLogs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.workoutTitle.toLowerCase().includes(q) ||
      log.date.includes(q) ||
      log.exercises.some((e) => e.exerciseName.toLowerCase().includes(q))
    );
  });

  const exportData = () => {
    const exportPayload = {
      quickLiftLogs: hybridLogs,
      sessionLogs: logs,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Overland_Athletics_Lifts_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Switcher between Logs and Progress */}
      {onNavigateToGraphs && (
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
            <button
              type="button"
              className="px-4 py-1.5 bg-amber-500 text-black font-black rounded-lg text-xs font-bold shadow-sm"
            >
              Workout Logs & Sets
            </button>
            <button
              type="button"
              onClick={onNavigateToGraphs}
              className="px-4 py-1.5 text-zinc-400 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Progress Graphs & PRs</span>
            </button>
          </div>
        </div>
      )}

      {/* Branded Header Banner (From Template) */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-4 bg-red-500/10 rounded-full mb-4 border border-red-500/20">
          <div className="text-red-500">
            <Dumbbell className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-wide font-athletic">
          Lift <span className="text-red-600">Tracker</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Log your main lifts to ensure progressive overload across the 12-week protocol.
        </p>
      </div>

      {/* QUICK SET LOGGER (From User's Template) */}
      <div className="bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
            <Flame className="w-4 h-4" />
            Quick Set Logging
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">
            Auto-calculates 1RM & updates graphs
          </span>
        </div>

        {/* Exercise Dropdown */}
        <div>
          <select 
            value={exercise}
            onChange={(e) => {
              const nextEx = e.target.value;
              setExercise(nextEx);
              setRestSeconds(getDefaultRestPeriod(nextEx));
            }}
            className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors font-medium"
          >
            {TEMPLATE_EXERCISES.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>
        </div>

        {/* Weight & Reps inputs */}
        <div className="flex gap-3">
          <input 
            type="number" 
            step="0.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Weight (lbs)"
            className="flex-1 bg-zinc-950 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors placeholder:text-zinc-600 font-mono"
          />
          <input 
            type="number" 
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="Reps"
            className="w-28 bg-zinc-950 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors placeholder:text-zinc-600 font-mono"
          />
        </div>

        {/* Rest Period Customizer for this Lift */}
        <div className="pt-2 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Rest Interval ({exercise}):
            </span>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-500/20">
              {restSeconds}s
            </span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { label: '45s', val: 45 },
              { label: '60s', val: 60 },
              { label: '90s', val: 90 },
              { label: '2m', val: 120 },
              { label: '3m', val: 180 },
              { label: '4m', val: 240 },
            ].map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => setRestSeconds(p.val)}
                className={`px-2 py-1 text-xs font-mono rounded transition-all cursor-pointer ${
                  restSeconds === p.val
                    ? 'bg-red-600 text-white font-bold'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
            <div className="flex items-center border-l border-zinc-800 pl-1 ml-1">
              <button
                type="button"
                onClick={() => setRestSeconds((prev) => Math.max(15, prev - 15))}
                className="px-1.5 py-0.5 text-xs font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded cursor-pointer"
                title="Minus 15 seconds"
              >
                -15s
              </button>
              <button
                type="button"
                onClick={() => setRestSeconds((prev) => Math.max(15, prev + 15))}
                className="px-1.5 py-0.5 text-xs font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded ml-1 cursor-pointer"
                title="Plus 15 seconds"
              >
                +15s
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons: Log Set + Manual Start Timer */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button 
            onClick={handleSaveSet}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black px-6 py-3.5 rounded-xl transition-all text-sm uppercase tracking-wider shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Log Set & Start Rest ({restSeconds}s)
          </button>

          <button
            type="button"
            onClick={() => handleStartRest(restSeconds, exercise)}
            className="px-5 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 hover:text-white border border-amber-500/30 rounded-xl transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            title="Start Rest Timer now"
          >
            <Clock className="w-4 h-4" />
            Timer Only ({restSeconds}s)
          </button>
        </div>

        {/* Inline Active Rest Countdown Banner */}
        {activeRestTimer && (
          <div className="mt-3 bg-zinc-950/90 border border-amber-500/40 rounded-xl p-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${activeRestTimer.secondsRemaining === 0 ? 'bg-emerald-500' : activeRestTimer.isRunning ? 'bg-amber-400 animate-ping' : 'bg-zinc-500'}`} />
                <span className="text-xs font-bold text-zinc-300 truncate">
                  {activeRestTimer.secondsRemaining === 0 ? 'Rest Finished!' : `Resting: ${activeRestTimer.exerciseName}`}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {activeRestTimer.secondsRemaining > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveRestTimer({
                          ...activeRestTimer,
                          isRunning: !activeRestTimer.isRunning,
                        })
                      }
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-mono font-black flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      {activeRestTimer.isRunning ? (
                        <Pause className="w-3 h-3 fill-current" />
                      ) : (
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      )}
                      <span>{activeRestTimer.secondsRemaining}s</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveRestTimer({
                          ...activeRestTimer,
                          secondsRemaining: activeRestTimer.secondsRemaining + 30,
                        })
                      }
                      className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono rounded-lg transition-colors cursor-pointer"
                      title="Add 30s"
                    >
                      +30s
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartRest(restSeconds, exercise)}
                    className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Restart
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveRestTimer(null)}
                  className="p-1 text-zinc-400 hover:text-amber-400 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Dismiss timer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {activeRestTimer.secondsRemaining > 0 && (
              <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-1000 ease-linear rounded-full"
                  style={{
                    width: `${Math.min(100, (activeRestTimer.secondsRemaining / (activeRestTimer.totalSeconds || 1)) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* RECENT SETS (Exact from User's Template + 1RM indicator + Rest Trigger) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
            Recent Sets
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 font-mono text-xs">
              {hybridLogs.length} sets logged
            </span>
            {hybridLogs.length > 0 && (
              <button
                type="button"
                onClick={handleClearHybridSets}
                className="text-[11px] text-zinc-500 hover:text-amber-400 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
              >
                Clear Sets
              </button>
            )}
          </div>
        </div>

        {hybridLogs.length === 0 ? (
          <p className="text-zinc-600 text-sm italic text-center py-6 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
            No lifts logged yet. Start tracking your PRs.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {hybridLogs.slice(0, 9).map((log) => {
              const defaultRest = getDefaultRestPeriod(log.exercise);
              return (
                <div 
                  key={log.id} 
                  className="flex flex-col justify-between bg-zinc-900/80 hover:bg-zinc-900 p-4 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-all gap-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-white font-bold text-sm mb-1 truncate">
                        {log.exercise}
                      </span>
                      <span className="text-zinc-300 font-mono text-xs">
                        <strong className="text-white text-sm">{log.weight}</strong>{' '}
                        <span className="text-zinc-500 font-normal">lbs</span> ×{' '}
                        <strong className="text-white text-sm">{log.reps}</strong>{' '}
                        <span className="text-zinc-500 font-normal">reps</span>
                      </span>
                      {log.estimated1RM && (
                        <span className="text-[11px] font-mono text-amber-400 mt-1 font-semibold">
                          Est. 1RM: {log.estimated1RM} lbs
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-zinc-500 text-[10px] font-mono mb-2">
                        {log.date}
                      </span>
                      <button 
                        onClick={() => handleDeleteSet(log.id)} 
                        className="text-zinc-600 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        title="Delete set"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Rest Timer Trigger for this lift */}
                  <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500">
                      Rest: {defaultRest}s
                    </span>
                    <button
                      onClick={() => handleStartRest(defaultRest, log.exercise)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-zinc-700/60"
                      title={`Start ${defaultRest}s rest timer for ${log.exercise}`}
                    >
                      <Clock className="w-3 h-3 text-amber-400" />
                      Rest Timer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL WORKOUT SESSION LOGS SECTION */}
      <div className="pt-6 border-t border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white uppercase tracking-wide font-athletic">
                Comprehensive Session History
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                {athleteScopedLogs.length} {athleteScopedLogs.length === 1 ? 'Session' : 'Sessions'}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Full multi-exercise workouts logged through the Live Workout Tracker.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Athlete Scope Toggle */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAthleteFilter('current')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  athleteFilter === 'current'
                    ? 'bg-amber-500 text-black font-black shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {currentAthlete.name.split(' ')[0]}'s Logs
              </button>
              <button
                type="button"
                onClick={() => setAthleteFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  athleteFilter === 'all'
                    ? 'bg-amber-500 text-black font-black shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All Athletes ({logs.length})
              </button>
            </div>

            {/* Clear All Logs Button */}
            <button
              type="button"
              onClick={() => setIsClearModalOpen(true)}
              className="px-3 py-1.5 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 hover:text-amber-100 text-xs font-bold rounded-xl border border-amber-700/50 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Clear workout history"
            >
              <Trash2 className="w-3.5 h-3.5 text-amber-400" />
              Clear Logs
            </button>

            <button
              onClick={exportData}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search workout sessions by exercise or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Sessions Accordion or Empty State */}
        {filteredSessionLogs.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl border border-zinc-800/80 bg-zinc-900/30 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3 shadow-inner">
              <History className="w-7 h-7 text-amber-400/80" />
            </div>
            <h4 className="text-lg font-black text-white font-athletic uppercase tracking-wider">
              {logs.length === 0 
                ? 'Workout Logbook Fresh & Cleared'
                : athleteFilter === 'current'
                ? `No Logged Sessions for ${currentAthlete.name}`
                : 'No Matching Workout Sessions Found'}
            </h4>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mt-1 mb-5 leading-relaxed">
              {logs.length === 0
                ? "All athletes start with a clean slate. Launch an active workout session to log sets, timed runs, and track your progressive overload."
                : athleteFilter === 'current'
                ? `${currentAthlete.name} has no recorded workouts yet. Start a session to track progress for this athlete.`
                : 'Try adjusting your search query or clear your filter to view logged sessions.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {onOpenLiveWorkout && (
                <button
                  type="button"
                  onClick={onOpenLiveWorkout}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black font-bold text-xs rounded-xl shadow-lg shadow-amber-950/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Dumbbell className="w-4 h-4" />
                  Start Live Workout Session
                </button>
              )}
              {athleteFilter === 'current' && logs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAthleteFilter('all')}
                  className="px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  View All Athletes ({logs.length} total)
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessionLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;

              return (
                <div
                  key={log.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isExpanded
                      ? 'bg-zinc-900 border-zinc-700 shadow-xl'
                      : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/80'
                  }`}
                >
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="p-4 flex items-center justify-between cursor-pointer gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white tracking-wide truncate">
                            {log.workoutTitle}
                          </h4>
                          {log.athleteId && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono">
                              {log.athleteId === 'athlete-aj-risner'
                                ? (currentAthlete.id === 'athlete-aj-risner' ? 'Coach AJ' : 'Athlete')
                                : (athletes.find((a) => a.id === log.athleteId)?.name || 'Athlete')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5 font-mono">
                          <span>{log.date}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            {log.durationMinutes}m
                          </span>
                          <span>•</span>
                          <span className="text-amber-400 font-bold">
                            {log.totalVolumeLbs.toLocaleString()} lbs
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(log.id);
                        }}
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Delete workout entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="text-zinc-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-5 pt-2 border-t border-zinc-800 space-y-3 bg-zinc-950/40">
                      {log.notes && (
                        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-zinc-300 italic">
                          "{log.notes}"
                        </div>
                      )}

                      <div className="space-y-2.5">
                        {log.exercises.map((ex, idx) => (
                          <div
                            key={idx}
                            className="bg-zinc-950/90 rounded-xl border border-zinc-800/80 p-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-white tracking-wide">
                                {ex.exerciseName}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-400">
                                {ex.sets.length} sets
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {ex.sets.map((set) => {
                                const isTimed = set.isTimed || ex.isTimed || Boolean(set.timeFormatted);
                                return (
                                  <div
                                    key={set.setNumber}
                                    className={`p-2 rounded-lg border text-xs flex flex-col justify-between ${
                                      isTimed 
                                        ? 'bg-emerald-950/20 border-emerald-500/30' 
                                        : 'bg-zinc-900 border-zinc-800'
                                    }`}
                                  >
                                    <div className="text-[10px] text-zinc-500 font-mono flex items-center justify-between">
                                      <span>SET {set.setNumber}</span>
                                      {set.rpe && <span className="text-amber-400 font-bold">RPE {set.rpe}</span>}
                                    </div>
                                    {isTimed ? (
                                      <div className="font-mono font-bold text-sm text-emerald-400 my-0.5">
                                        {set.timeFormatted || (set.timeSeconds ? `${Math.floor(set.timeSeconds / 60)}:${set.timeSeconds % 60 < 10 ? '0' : ''}${set.timeSeconds % 60}` : 'Done')}
                                        {set.distanceMiles ? ` • ${set.distanceMiles} mi` : ''}
                                        {set.weightLbs > 0 ? ` • ${set.weightLbs} lbs` : ''}
                                      </div>
                                    ) : (
                                      <div className="font-mono font-bold text-sm text-white my-0.5">
                                        {set.weightLbs} lbs × {set.reps}
                                      </div>
                                    )}
                                    <div className="text-[10px] font-mono text-amber-400">
                                      {!isTimed && set.estimated1RM ? `1RM: ${set.estimated1RM} lbs` : isTimed ? (set.distanceMiles && set.timeSeconds ? `${((set.timeSeconds / 60) / set.distanceMiles).toFixed(1)} min/mi` : 'Timed Effort') : ''}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-zinc-500 hover:text-zinc-300 ml-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Clear Logs Confirmation Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-zinc-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-700/50 flex items-center justify-center text-amber-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white font-athletic uppercase tracking-wide">
                      Clear Workout Logs
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Reset history for a fresh start
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsClearModalOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-zinc-300 leading-relaxed">
                Choose whether to reset workout history across all athletes or only clear logs for the active athlete ({currentAthlete.name}):
              </p>

              <div className="space-y-2.5">
                <label
                  onClick={() => setClearScope('all')}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    clearScope === 'all'
                      ? 'bg-amber-950/20 border-amber-500/70 text-white'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <input
                    type="radio"
                    name="clearScope"
                    checked={clearScope === 'all'}
                    onChange={() => setClearScope('all')}
                    className="mt-0.5 accent-amber-500"
                  />
                  <div className="text-xs">
                    <div className="font-bold text-white flex items-center gap-2">
                      Clear All Athletes' Logs
                      <span className="px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-300 text-[10px] font-bold">
                        Global Fresh Start
                      </span>
                    </div>
                    <p className="text-zinc-400 mt-0.5 text-[11px] leading-relaxed">
                      Wipes all workout history across all athlete profiles ({logs.length} total logged sessions).
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setClearScope('current')}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    clearScope === 'current'
                      ? 'bg-amber-950/20 border-amber-500/70 text-white'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <input
                    type="radio"
                    name="clearScope"
                    checked={clearScope === 'current'}
                    onChange={() => setClearScope('current')}
                    className="mt-0.5 accent-amber-500"
                  />
                  <div className="text-xs">
                    <div className="font-bold text-white">
                      Clear Only {currentAthlete.name}'s Logs
                    </div>
                    <p className="text-zinc-400 mt-0.5 text-[11px] leading-relaxed">
                      Wipes only sessions logged by {currentAthlete.name}. Other athletes' progress remains preserved.
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-2 border-t border-zinc-800/80">
                <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clearLiftsToo}
                    onChange={(e) => setClearLiftsToo(e.target.checked)}
                    className="rounded border-zinc-700 accent-amber-500"
                  />
                  <span>Also clear recent Quick Lift Tracker sets ({hybridLogs.length} sets)</span>
                </label>
              </div>

              <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>This action cannot be undone. Cleared workout logs and PR graph data will be reset.</span>
              </div>
            </div>

            <div className="p-4 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteClear}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black font-bold text-xs rounded-xl shadow-lg shadow-amber-950/30 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {clearScope === 'all' ? 'Clear All Logs (Total Reset)' : `Clear ${currentAthlete.name}'s Logs`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
