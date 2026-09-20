import React, { useState, useEffect } from 'react';
import { 
  X, Check, Plus, Trash2, Clock, Dumbbell, Flame, Award, 
  ChevronRight, Sparkles, MessageSquare, AlertCircle, RefreshCw,
  HelpCircle, Activity, Gauge, Pause, Play, Timer, TrendingUp, Zap, RotateCcw,
  LogOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WorkoutProgram, LiveExerciseSession, LiveSet, WorkoutSessionLog, MuscleGroup, isExerciseTimed, AutoOverloadRecommendation } from '../types';
import { calculate1RM, saveWorkoutLog, getStoredWorkoutLogs } from '../utils/storage';
import { getAutoOverloadRecommendation } from '../utils/autoOverload';
import { getCurrentAthlete } from '../utils/athleteAuth';
import { soundManager } from '../utils/audio';

interface ActiveWorkoutModalProps {
  program: WorkoutProgram;
  onClose: () => void;
  onWorkoutCompleted: (log: WorkoutSessionLog) => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  program,
  onClose,
  onWorkoutCompleted,
}) => {
  const currentAthlete = getCurrentAthlete();
  // Find athlete-specific past logs for progressive overload calculations
  const allLogs = getStoredWorkoutLogs();
  const pastLogs = allLogs.filter(
    (l) => l.athleteId === currentAthlete.id || (!l.athleteId && (currentAthlete.id === 'athlete-default' || currentAthlete.id === 'athlete-aj-risner'))
  );
  const effectiveLogs = pastLogs.length > 0 ? pastLogs : allLogs;

  // Initialize live exercise sessions based on program with Auto-Overload and Time-based tracking
  const [exercises, setExercises] = useState<LiveExerciseSession[]>(() => {
    return program.exercises.map((template) => {
      const timed = isExerciseTimed(template.name, template.type, template.targetReps);
      const overload = getAutoOverloadRecommendation(
        template.name,
        template.targetReps,
        template.targetRpe,
        effectiveLogs
      );

      if (timed) {
        // Cardio / Timed exercise (Run, Ruck, Interval, Plank)
        let prevTimeFormatted: string | undefined;
        let prevDistance: number | undefined;
        let prevWeight: number | undefined = template.weight_lbs;

        for (const log of effectiveLogs) {
          const matchingEx = log.exercises.find(
            (e) => e.exerciseName.toLowerCase() === template.name.toLowerCase()
          );
          if (matchingEx && matchingEx.sets.length > 0) {
            const lastSet = matchingEx.sets[matchingEx.sets.length - 1];
            if (lastSet.timeFormatted) prevTimeFormatted = lastSet.timeFormatted;
            if (lastSet.distanceMiles) prevDistance = lastSet.distanceMiles;
            if (lastSet.weightLbs) prevWeight = lastSet.weightLbs;
            break;
          }
        }

        // Parse target duration string
        let defaultTime = '30:00';
        if (template.targetReps && template.targetReps.toLowerCase().includes('min')) {
          const m = template.targetReps.match(/(\d+)/);
          if (m) defaultTime = `${m[1]}:00`;
        } else if (template.name.toLowerCase().includes('plank')) {
          defaultTime = '00:60';
        } else if (template.distance_miles) {
          const estMinutes = Math.round(template.distance_miles * 9);
          defaultTime = `${estMinutes}:00`;
        }

        const initialSets: LiveSet[] = Array.from({ length: template.defaultSets || 1 }).map((_, i) => ({
          id: `set-${template.id}-${i + 1}`,
          setNumber: i + 1,
          weightLbs: template.weight_lbs || 0,
          reps: 1,
          rpe: template.targetRpe || 8,
          completed: false,
          restSeconds: template.restPeriodSeconds || 0,
          isTimed: true,
          timeFormatted: prevTimeFormatted || defaultTime,
          timeSeconds: 0,
          distanceMiles: template.distance_miles || prevDistance,
          prevTimeFormatted: prevTimeFormatted,
          prevWeightLbs: prevWeight,
          prevReps: 1,
        }));

        return {
          exerciseId: template.id,
          exerciseName: template.name,
          muscleGroup: template.muscleGroup,
          restPeriodSeconds: template.restPeriodSeconds || 0,
          notes: template.notes,
          targetReps: template.targetReps,
          targetRpe: template.targetRpe,
          progressionRules: template.progression_rules,
          isTimed: true,
          distance_miles: template.distance_miles,
          autoOverload: overload,
          sets: initialSets,
        };
      } else {
        // Compound strength & hypertrophy exercise
        // Auto-Overload automatically inputs next week's recommended weight!
        let startingWeight = 50;
        let prevWeight = template.weight_lbs;
        let prevReps = 8;

        if (overload.status === 'overload_applied' || overload.status === 'maintain') {
          startingWeight = overload.recommendedWeightLbs;
          prevWeight = overload.previousWeightLbs;
          prevReps = overload.previousReps;
        } else if (template.weight_lbs !== undefined) {
          startingWeight = template.weight_lbs;
        } else {
          const isBodyweight = 
            template.name.toLowerCase().includes('push-up') ||
            template.name.toLowerCase().includes('pull-up') ||
            template.name.toLowerCase().includes('dip') ||
            template.muscleGroup === 'Core';
          startingWeight = isBodyweight ? 0 : 95;
        }

        let startingReps = 8;
        if (template.targetReps) {
          const parsed = parseInt(template.targetReps, 10);
          if (!isNaN(parsed)) {
            startingReps = parsed;
          }
        }

        const initialSets: LiveSet[] = Array.from({ length: template.defaultSets || 3 }).map((_, i) => ({
          id: `set-${template.id}-${i + 1}`,
          setNumber: i + 1,
          weightLbs: startingWeight,
          reps: startingReps,
          rpe: template.targetRpe || 8,
          completed: false,
          restSeconds: template.restPeriodSeconds || 90,
          prevWeightLbs: overload.previousWeightLbs ?? prevWeight,
          prevReps: overload.previousReps ?? startingReps,
          isTimed: false,
        }));

        return {
          exerciseId: template.id,
          exerciseName: template.name,
          muscleGroup: template.muscleGroup,
          restPeriodSeconds: template.restPeriodSeconds || 90,
          notes: template.notes,
          targetReps: template.targetReps,
          targetRpe: template.targetRpe,
          progressionRules: template.progression_rules,
          isTimed: false,
          autoOverload: overload,
          sets: initialSets,
        };
      }
    });
  });

  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [workoutStartTime] = useState<Date>(new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [workoutNotes, setWorkoutNotes] = useState<string>('');
  const [sessionRating, setSessionRating] = useState<number>(5);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [showRpeGuide, setShowRpeGuide] = useState<boolean>(false);

  // Live stopwatch for individual timed exercise sets (runs, intervals, planks)
  const [activeSetStopwatch, setActiveSetStopwatch] = useState<{
    exerciseIdx: number;
    setIdx: number;
    seconds: number;
  } | null>(null);

  // Live set stopwatch ticker
  useEffect(() => {
    if (!activeSetStopwatch) return;
    const interval = window.setInterval(() => {
      setActiveSetStopwatch((prev) => {
        if (!prev) return null;
        return { ...prev, seconds: prev.seconds + 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSetStopwatch?.exerciseIdx, activeSetStopwatch?.setIdx]);

  const handleToggleSetStopwatch = (exerciseIdx: number, setIdx: number) => {
    if (activeSetStopwatch && activeSetStopwatch.exerciseIdx === exerciseIdx && activeSetStopwatch.setIdx === setIdx) {
      // Stop and record exact logged time
      const totalSecs = activeSetStopwatch.seconds;
      const m = Math.floor(totalSecs / 60);
      const s = totalSecs % 60;
      const formatted = `${m}:${s < 10 ? '0' : ''}${s}`;

      handleUpdateSet(exerciseIdx, setIdx, 'timeFormatted', formatted);
      handleUpdateSet(exerciseIdx, setIdx, 'timeSeconds', totalSecs);
      setActiveSetStopwatch(null);
      soundManager.playRestComplete();
    } else {
      // Start live set stopwatch
      setActiveSetStopwatch({
        exerciseIdx,
        setIdx,
        seconds: 0,
      });
      soundManager.playCountdownBeep(true);
    }
  };

  // Live workout timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentExercise = exercises[activeExerciseIndex];

  const handleUpdateSet = (
    exerciseIdx: number,
    setIdx: number,
    field: 'weightLbs' | 'reps' | 'rpe' | 'distanceMiles' | 'timeFormatted' | 'timeSeconds',
    value: any
  ) => {
    setExercises((prev) => {
      const copy = [...prev];
      const ex = { ...copy[exerciseIdx] };
      const setList = [...ex.sets];
      setList[setIdx] = {
        ...setList[setIdx],
        [field]: value,
      };
      ex.sets = setList;
      copy[exerciseIdx] = ex;
      return copy;
    });
  };

  const handleApplyOverloadWeightToAllSets = (exerciseIdx: number, targetWeight: number) => {
    setExercises((prev) => {
      const copy = [...prev];
      const ex = { ...copy[exerciseIdx] };
      ex.sets = ex.sets.map((s) => ({ ...s, weightLbs: targetWeight }));
      copy[exerciseIdx] = ex;
      return copy;
    });
    soundManager.playSetLogged();
  };

  // Inline rest timer state for the modal
  const [modalRestTimer, setModalRestTimer] = useState<{
    exerciseName: string;
    secondsRemaining: number;
    totalSeconds: number;
    isRunning: boolean;
  } | null>(null);

  // Countdown ticker for active modal rest timer
  useEffect(() => {
    if (!modalRestTimer || !modalRestTimer.isRunning) return;

    const interval = window.setInterval(() => {
      setModalRestTimer((prev) => {
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
  }, [modalRestTimer?.isRunning]);

  const handleStartRestTimer = (seconds: number, exerciseName: string) => {
    setModalRestTimer({
      exerciseName,
      secondsRemaining: seconds,
      totalSeconds: seconds,
      isRunning: true,
    });
    soundManager.playCountdownBeep(true);
  };

  const handleToggleCompleteSet = (exerciseIdx: number, setIdx: number) => {
    const currentSet = exercises[exerciseIdx].sets[setIdx];
    const willBeComplete = !currentSet.completed;

    setExercises((prev) => {
      const copy = [...prev];
      const ex = { ...copy[exerciseIdx] };
      const setList = [...ex.sets];
      setList[setIdx] = { ...setList[setIdx], completed: willBeComplete };
      ex.sets = setList;
      copy[exerciseIdx] = ex;
      return copy;
    });

    if (willBeComplete) {
      soundManager.playSetLogged();
      // Auto-trigger inline rest countdown for this exercise
      const restSecs = currentSet.restSeconds || currentExercise.restPeriodSeconds || 90;
      handleStartRestTimer(restSecs, currentExercise.exerciseName);
    }
  };

  const handleUpdateExerciseRestPeriod = (exerciseIdx: number, seconds: number) => {
    const validSecs = Math.max(15, seconds);
    setExercises((prev) => {
      const copy = [...prev];
      const ex = { ...copy[exerciseIdx] };
      ex.restPeriodSeconds = validSecs;
      ex.sets = ex.sets.map((s) => ({ ...s, restSeconds: validSecs }));
      copy[exerciseIdx] = ex;
      return copy;
    });
  };

  const handleAddSet = (exerciseIdx: number) => {
    setExercises((prev) => {
      const copy = [...prev];
      const ex = { ...copy[exerciseIdx] };
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSet: LiveSet = {
        id: `set-${ex.exerciseId}-${Date.now()}`,
        setNumber: ex.sets.length + 1,
        weightLbs: lastSet ? lastSet.weightLbs : 135,
        reps: lastSet ? lastSet.reps : 8,
        rpe: lastSet?.rpe || 8,
        completed: false,
        restSeconds: ex.restPeriodSeconds,
        prevWeightLbs: lastSet?.prevWeightLbs,
        prevReps: lastSet?.prevReps,
      };
      ex.sets = [...ex.sets, newSet];
      copy[exerciseIdx] = ex;
      return copy;
    });
  };

  const handleRemoveSet = (exerciseIdx: number, setIdx: number) => {
    setExercises((prev) => {
      const copy = [...prev];
      const ex = { ...copy[exerciseIdx] };
      if (ex.sets.length <= 1) return prev;
      ex.sets = ex.sets.filter((_, i) => i !== setIdx).map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      copy[exerciseIdx] = ex;
      return copy;
    });
  };

  // Calculate live stats
  const totalSetsCompleted = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalPlannedSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  const totalVolumeLbs = exercises.reduce((acc, ex) => {
    if (ex.isTimed && !ex.exerciseName.toLowerCase().includes('ruck')) {
      return acc;
    }
    return (
      acc +
      ex.sets.reduce((setAcc, set) => {
        return set.completed ? setAcc + (set.weightLbs || 0) * (ex.isTimed ? 1 : set.reps) : setAcc;
      }, 0)
    );
  }, 0);

  const handleFinishWorkout = () => {
    const endTime = new Date();
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    // Construct the structured log
    const sessionLog: WorkoutSessionLog = {
      id: `log-${Date.now()}`,
      athleteId: currentAthlete.id,
      programId: program.id,
      workoutTitle: program.title,
      date: new Date().toISOString().split('T')[0],
      startTime: workoutStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMinutes,
      totalVolumeLbs,
      totalSetsCompleted,
      rating: sessionRating,
      notes: workoutNotes,
      exercises: exercises.map((ex) => ({
        exerciseName: ex.exerciseName,
        muscleGroup: ex.muscleGroup,
        isTimed: ex.isTimed,
        sets: ex.sets
          .filter((s) => s.completed || s.weightLbs > 0 || (s.timeFormatted && s.timeFormatted !== '00:00') || (s.distanceMiles && s.distanceMiles > 0))
          .map((s) => ({
            setNumber: s.setNumber,
            weightLbs: s.weightLbs,
            reps: s.reps,
            rpe: s.rpe,
            timeFormatted: s.timeFormatted,
            timeSeconds: s.timeSeconds,
            distanceMiles: s.distanceMiles,
            isTimed: s.isTimed || ex.isTimed,
            estimated1RM: !ex.isTimed ? calculate1RM(s.weightLbs, s.reps) : 0,
          })),
      })),
    };

    saveWorkoutLog(sessionLog);
    soundManager.playRestComplete();

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#f59e0b', '#10b981', '#ffffff'],
      });
    } catch {
      // confetti fallback
    }

    onWorkoutCompleted(sessionLog);
  };

  const handleExitRequest = () => {
    if (totalSetsCompleted > 0) {
      setShowExitModal(true);
    } else {
      onClose();
    }
  };

  const handleExitWorkoutWithSave = () => {
    const endTime = new Date();
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    const sessionLog: WorkoutSessionLog = {
      id: `log-${Date.now()}`,
      athleteId: currentAthlete.id,
      programId: program.id,
      workoutTitle: `${program.title} (Ended Early)`,
      date: new Date().toISOString().split('T')[0],
      startTime: workoutStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMinutes,
      totalVolumeLbs,
      totalSetsCompleted,
      rating: sessionRating,
      notes: workoutNotes ? `${workoutNotes} (Session ended early)` : 'Session ended early by athlete.',
      exercises: exercises.map((ex) => ({
        exerciseName: ex.exerciseName,
        muscleGroup: ex.muscleGroup,
        isTimed: ex.isTimed,
        sets: ex.sets
          .filter((s) => s.completed || s.weightLbs > 0 || (s.timeFormatted && s.timeFormatted !== '00:00'))
          .map((s) => ({
            setNumber: s.setNumber,
            weightLbs: s.weightLbs,
            reps: s.reps,
            rpe: s.rpe,
            timeFormatted: s.timeFormatted,
            timeSeconds: s.timeSeconds,
            distanceMiles: s.distanceMiles,
            isTimed: s.isTimed || ex.isTimed,
            estimated1RM: !ex.isTimed ? calculate1RM(s.weightLbs, s.reps) : 0,
          })),
      })),
    };

    saveWorkoutLog(sessionLog);
    setShowExitModal(false);
    onWorkoutCompleted(sessionLog);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="bg-[#12171d] border-b-2 border-zinc-800 px-3 sm:px-5 py-3 flex items-center justify-between shrink-0 gap-3 shadow-lg">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-athletic font-black text-sm shadow-md shadow-amber-950/40 shrink-0">
            LIVE
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide truncate max-w-[140px] sm:max-w-xs md:max-w-md">
                {program.title}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-black uppercase shrink-0">
                {program.category}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate">
              Overland Athletics Live Weights Tracker
            </p>
          </div>
        </div>

        {/* Live Metrics & Actions Header */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-700 shadow-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-xs sm:text-sm font-black text-white">
              {formatElapsed(elapsedSeconds)}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-700 shadow-sm">
            <Dumbbell className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-xs sm:text-sm font-black text-white">
              {totalVolumeLbs.toLocaleString()} <span className="text-zinc-500 text-xs">lbs</span>
            </span>
          </div>

          {/* EXIT WORKOUT BUTTON (HIGH VISIBILITY) */}
          <button
            type="button"
            onClick={handleExitRequest}
            className="px-3 sm:px-4 py-2 bg-red-950/90 hover:bg-red-900 text-red-200 hover:text-white border-2 border-red-700 hover:border-red-500 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-red-950/50 cursor-pointer active:scale-95"
            title="Exit and leave workout session"
          >
            <LogOut className="w-4 h-4 text-red-400 stroke-[2.5]" />
            <span>Exit Workout</span>
          </button>

          {/* FINISH WORKOUT BUTTON */}
          <button
            type="button"
            onClick={() => setIsFinishing(true)}
            className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black rounded-xl text-xs sm:text-sm border-2 border-emerald-300 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 uppercase tracking-wider"
            title="Review and complete session"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Finish</span>
          </button>

          <button
            type="button"
            onClick={handleExitRequest}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors hidden sm:block"
            title="Exit workout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Workout Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Exercise Navigation Sidebar */}
        <div className="w-full md:w-80 bg-zinc-950/80 border-b md:border-b-0 md:border-r border-zinc-800 p-3 overflow-y-auto shrink-0 max-h-48 md:max-h-none">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Exercises ({totalSetsCompleted}/{totalPlannedSets} Sets)
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {Math.round((totalSetsCompleted / Math.max(1, totalPlannedSets)) * 100)}%
            </span>
          </div>

          <div className="space-y-1.5">
            {exercises.map((ex, idx) => {
              const setsDone = ex.sets.filter((s) => s.completed).length;
              const isDone = setsDone === ex.sets.length;
              const isCurrent = idx === activeExerciseIndex;

              return (
                <button
                  key={ex.exerciseId}
                  onClick={() => setActiveExerciseIndex(idx)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                    isCurrent
                      ? 'bg-zinc-800 text-white border border-amber-500/50 shadow-md'
                      : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 border border-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : isCurrent
                          ? 'bg-amber-500 text-black font-black'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold truncate leading-snug">{ex.exerciseName}</p>
                      <p className="text-[10px] text-zinc-400">
                        {setsDone}/{ex.sets.length} sets completed
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isCurrent ? 'text-amber-400 translate-x-0.5' : 'text-zinc-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Quick Exit from Sidebar */}
          <div className="pt-3 mt-3 border-t border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={handleExitRequest}
              className="w-full py-2.5 px-3 bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-800/60 hover:border-red-600 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              title="Exit and leave workout session"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Exit Workout Session</span>
            </button>
          </div>
        </div>

        {/* Center Current Exercise Work Area */}
        {currentExercise && (
          <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-zinc-900/50">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Exercise Card Header */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">
                        {currentExercise.muscleGroup}
                      </span>
                      <span className="text-xs text-amber-400 flex items-center gap-1 font-mono font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <Clock className="w-3 h-3 text-amber-400" />
                        Rest: {currentExercise.restPeriodSeconds}s
                      </span>
                      {currentExercise.targetRpe && (
                        <span className="text-xs text-amber-400 flex items-center gap-1 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          <Gauge className="w-3 h-3 text-amber-400" />
                          Target RPE: {currentExercise.targetRpe}
                        </span>
                      )}
                      {currentExercise.targetReps && (
                        <span className="text-xs text-zinc-400 font-mono bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/60">
                          Target Reps: {currentExercise.targetReps}
                        </span>
                      )}
                      {currentExercise.progressionRules && (
                        <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>
                            Overload: +{currentExercise.progressionRules.increment_value}{' '}
                            {currentExercise.progressionRules.metric === 'weight_lbs' ? 'lbs' : currentExercise.progressionRules.metric === 'reps' ? 'rep' : 'mi'}
                            {' '}({currentExercise.progressionRules.trigger.replace(/_/g, ' ')})
                          </span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-white font-athletic tracking-wide mt-1">
                      {currentExercise.exerciseName}
                    </h3>
                  </div>

                  {/* Rest Timer Button / Active Indicator */}
                  {modalRestTimer && modalRestTimer.secondsRemaining > 0 ? (
                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/40 rounded-xl px-3 py-1.5 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() =>
                          setModalRestTimer({
                            ...modalRestTimer,
                            isRunning: !modalRestTimer.isRunning,
                          })
                        }
                        className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black font-mono rounded-lg transition-all cursor-pointer shadow-md shadow-amber-500/20"
                      >
                        {modalRestTimer.isRunning ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                        <span>{modalRestTimer.secondsRemaining}s</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setModalRestTimer({
                            ...modalRestTimer,
                            secondsRemaining: modalRestTimer.secondsRemaining + 30,
                          })
                        }
                        className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono rounded-lg transition-colors cursor-pointer"
                        title="Add 30 seconds"
                      >
                        +30s
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalRestTimer(null)}
                        className="p-1 text-zinc-400 hover:text-amber-400 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Stop Rest Timer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : modalRestTimer && modalRestTimer.secondsRemaining === 0 ? (
                    <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/40 rounded-xl px-3 py-1.5 self-start sm:self-auto animate-pulse">
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Rest Complete!
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartRestTimer(currentExercise.restPeriodSeconds, currentExercise.exerciseName)}
                        className="px-2 py-1 bg-emerald-500 text-black text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Restart
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalRestTimer(null)}
                        className="p-1 text-zinc-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartRestTimer(currentExercise.restPeriodSeconds, currentExercise.exerciseName)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-950/40 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer active:scale-95"
                    >
                      <Clock className="w-4 h-4" />
                      Start Rest ({currentExercise.restPeriodSeconds}s)
                    </button>
                  )}
                </div>

                {/* Inline Rest Progress Bar (if timer is active) */}
                {modalRestTimer && modalRestTimer.secondsRemaining > 0 && (
                  <div className="mt-3 bg-zinc-950/80 border border-amber-500/20 rounded-xl p-2.5">
                    <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5 text-amber-400" />
                        Resting for {modalRestTimer.exerciseName}
                      </span>
                      <span className="font-black text-amber-400">
                        {modalRestTimer.secondsRemaining}s remaining
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-1000 ease-linear rounded-full"
                        style={{
                          width: `${Math.min(100, (modalRestTimer.secondsRemaining / (modalRestTimer.totalSeconds || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Rest Time Customizer for this Exercise */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      Set Rest Duration:
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleUpdateExerciseRestPeriod(activeExerciseIndex, currentExercise.restPeriodSeconds - 15)}
                        className="px-2 py-0.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 font-mono transition-colors cursor-pointer"
                        title="Minus 15s"
                      >
                        -15s
                      </button>
                      <button
                        onClick={() => handleUpdateExerciseRestPeriod(activeExerciseIndex, currentExercise.restPeriodSeconds + 15)}
                        className="px-2 py-0.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 font-mono transition-colors cursor-pointer"
                        title="Plus 15s"
                      >
                        +15s
                      </button>
                    </div>
                  </div>

                  {/* Presets */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                    {[
                      { label: '45s', val: 45 },
                      { label: '60s', val: 60 },
                      { label: '90s', val: 90 },
                      { label: '120s', val: 120 },
                      { label: '150s', val: 150 },
                      { label: '180s', val: 180 },
                      { label: '240s', val: 240 },
                    ].map((p) => (
                      <button
                        key={p.val}
                        onClick={() => handleUpdateExerciseRestPeriod(activeExerciseIndex, p.val)}
                        className={`px-2 py-1 text-xs font-mono rounded transition-all cursor-pointer ${
                          currentExercise.restPeriodSeconds === p.val
                            ? 'bg-red-600 text-white font-bold shadow-sm'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {currentExercise.notes && (
                  <div className="mt-3.5 p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl text-xs text-zinc-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300 uppercase text-[10px] tracking-wider block">
                        Overland Athletics Directive & Coaching Cue:
                      </span>
                      <p className="mt-0.5 leading-relaxed">{currentExercise.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Auto-Overload Progression Banner for Strength Exercises */}
              {currentExercise.autoOverload && !currentExercise.isTimed && (
                <div className={`p-3.5 rounded-2xl border mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  currentExercise.autoOverload.status === 'overload_applied'
                    ? 'bg-gradient-to-r from-amber-950/40 via-zinc-900 to-amber-950/30 border-amber-500/40 shadow-md'
                    : currentExercise.autoOverload.status === 'maintain'
                    ? 'bg-zinc-950/80 border-sky-500/30'
                    : 'bg-zinc-950/60 border-zinc-800'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      currentExercise.autoOverload.status === 'overload_applied'
                        ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase font-athletic tracking-wider text-amber-300">
                          {currentExercise.autoOverload.status === 'overload_applied'
                            ? `⚡ Auto-Overload Applied: +${currentExercise.autoOverload.incrementLbs} lbs`
                            : currentExercise.autoOverload.status === 'maintain'
                            ? '⚡ Auto-Overload: Consolidate Working Weight'
                            : '⚡ Auto-Overload Engine Ready'}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                          Next Week Target
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-0.5 leading-snug">
                        {currentExercise.autoOverload.reason}
                      </p>
                    </div>
                  </div>

                  {currentExercise.autoOverload.status === 'overload_applied' && currentExercise.autoOverload.previousWeightLbs && (
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleApplyOverloadWeightToAllSets(activeExerciseIndex, currentExercise.autoOverload!.recommendedWeightLbs)}
                        className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold font-mono flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                        title="Set all sets to next week's recommended overload weight"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        Target {currentExercise.autoOverload.recommendedWeightLbs} lbs
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyOverloadWeightToAllSets(activeExerciseIndex, currentExercise.autoOverload!.previousWeightLbs!)}
                        className="px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
                        title="Revert all sets to previous week's weight"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Prev ({currentExercise.autoOverload.previousWeightLbs} lbs)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Set-by-Set Logging Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                    {currentExercise.isTimed ? (
                      <Clock className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Dumbbell className="w-4 h-4 text-amber-400" />
                    )}
                    {currentExercise.isTimed ? 'Conditioning, Distance & Time Log' : 'Weights & Reps Log'}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRpeGuide(!showRpeGuide)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                        showRpeGuide
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-zinc-800/80 text-zinc-400 hover:text-amber-400 border-zinc-700/60'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>RPE Guide</span>
                    </button>
                    <span className="text-xs text-zinc-500 hidden sm:inline">
                      {currentExercise.isTimed ? 'Pace & Exertion' : 'Auto 1RM & Intensity'}
                    </span>
                  </div>
                </div>

                {/* Expandable RPE Scale & Intensity Reference Guide */}
                {showRpeGuide && (
                  <div className="mb-3.5 p-3.5 bg-zinc-950/90 border border-amber-500/30 rounded-xl text-xs space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150 shadow-inner">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                      <div className="flex items-center gap-2 text-amber-400 font-athletic font-bold uppercase tracking-wider text-[11px]">
                        <HelpCircle className="w-4 h-4 text-amber-400" />
                        Overland Athletics Rate of Perceived Exertion (RPE / RIR) Scale
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowRpeGuide(false)}
                        className="text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      RPE measures effort and reps in reserve (RIR) on every logged set. Tracking RPE ensures progressive overload without exceeding recovery capacity.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/30">
                        <div className="font-bold text-amber-400 font-mono">RPE 10 (0 RIR)</div>
                        <div className="text-zinc-400 text-[10px] mt-0.5">Absolute maximum effort. All-out sprint / 0 reps left.</div>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-600/30">
                        <div className="font-bold text-amber-400 font-mono">RPE 9 (1 RIR)</div>
                        <div className="text-zinc-400 text-[10px] mt-0.5">Heavy strain / Race pace. Exactly 1 rep left in tank.</div>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-600/30">
                        <div className="font-bold text-emerald-400 font-mono">RPE 8 (2 RIR)</div>
                        <div className="text-zinc-400 text-[10px] mt-0.5">Primary strength & tempo zone. 2 solid reps left.</div>
                      </div>
                      <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                        <div className="font-bold text-sky-400 font-mono">RPE 7 (3+ RIR)</div>
                        <div className="text-zinc-400 text-[10px] mt-0.5">Aerobic Zone 2 or explosive warmups. Conversation pace.</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Table Header: Dynamically adapts for Timed/Cardio vs Strength */}
                {currentExercise.isTimed ? (
                  <div className="grid grid-cols-12 gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1 mb-1 items-center">
                    <div className="col-span-1 text-center">Set</div>
                    <div className="col-span-2 hidden sm:block">Previous</div>
                    <div className="col-span-3 sm:col-span-3 text-center">
                      {currentExercise.exerciseName.toLowerCase().includes('ruck') ? 'Pack (lbs) / Dist' : 'Distance (mi)'}
                    </div>
                    <div className="col-span-4 sm:col-span-3 text-center">Time / Duration</div>
                    <div className="col-span-2 sm:col-span-2 text-center flex items-center justify-center gap-1">
                      <span className="text-amber-400 font-black">RPE</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 text-center">Done</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-12 gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1 mb-1 items-center">
                    <div className="col-span-1 text-center">Set</div>
                    <div className="col-span-2 hidden sm:block">Previous</div>
                    <div className="col-span-4 sm:col-span-3 text-center">Weight (lbs)</div>
                    <div className="col-span-2 sm:col-span-2 text-center">Reps</div>
                    <div className="col-span-3 sm:col-span-2 text-center flex items-center justify-center gap-1">
                      <span className="text-amber-400 font-black">RPE</span>
                      <span className="text-[9px] text-zinc-500 font-normal lowercase hidden sm:inline">(1-10)</span>
                    </div>
                    <div className="col-span-2 sm:col-span-2 text-center">Done</div>
                  </div>
                )}

                {/* Sets List */}
                <div className="space-y-2">
                  {currentExercise.sets.map((set, setIdx) => {
                    const isStopwatchActive = activeSetStopwatch?.exerciseIdx === activeExerciseIndex && activeSetStopwatch?.setIdx === setIdx;

                    if (currentExercise.isTimed) {
                      // TIMED / CARDIO SET ROW (Runs, Planks, Intervals, Rucks)
                      return (
                        <div
                          key={set.id}
                          className={`p-2.5 rounded-xl border transition-all space-y-2 ${
                            set.completed
                              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                              : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 text-zinc-200'
                          }`}
                        >
                          <div className="grid grid-cols-12 gap-1.5 sm:gap-2 items-center">
                            {/* Set # */}
                            <div className="col-span-1 text-center font-bold font-mono text-sm">
                              {set.setNumber}
                            </div>

                            {/* Previous Time / Distance (Desktop) */}
                            <div className="col-span-2 hidden sm:block text-xs text-zinc-400 truncate">
                              {set.prevTimeFormatted ? (
                                <span className="font-mono text-[11px]">
                                  {set.prevTimeFormatted}
                                  {set.prevWeightLbs ? ` • ${set.prevWeightLbs}lbs` : ''}
                                </span>
                              ) : (
                                <span className="text-zinc-600">—</span>
                              )}
                            </div>

                            {/* Distance / Load Input */}
                            <div className="col-span-3 sm:col-span-3 flex items-center justify-center gap-1">
                              <input
                                type="number"
                                step="0.1"
                                placeholder={currentExercise.exerciseName.toLowerCase().includes('ruck') ? '35' : '3.0'}
                                value={
                                  currentExercise.exerciseName.toLowerCase().includes('ruck')
                                    ? set.weightLbs || ''
                                    : set.distanceMiles !== undefined ? set.distanceMiles : ''
                                }
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  if (currentExercise.exerciseName.toLowerCase().includes('ruck')) {
                                    handleUpdateSet(activeExerciseIndex, setIdx, 'weightLbs', val);
                                  } else {
                                    handleUpdateSet(activeExerciseIndex, setIdx, 'distanceMiles', val);
                                  }
                                }}
                                className="w-full max-w-[4.8rem] text-center font-mono font-bold text-xs sm:text-sm bg-zinc-900 border border-zinc-700 rounded-lg py-1.5 text-white focus:outline-none focus:border-amber-500"
                              />
                              <span className="text-[10px] text-zinc-400 hidden sm:inline">
                                {currentExercise.exerciseName.toLowerCase().includes('ruck') ? 'lbs' : 'mi'}
                              </span>
                            </div>

                            {/* Time / Duration Input with Live Stopwatch Trigger */}
                            <div className="col-span-4 sm:col-span-3 flex items-center justify-center gap-1.5">
                              <input
                                type="text"
                                placeholder="mm:ss or mins"
                                value={
                                  isStopwatchActive
                                    ? formatElapsed(activeSetStopwatch.seconds)
                                    : set.timeFormatted || ''
                                }
                                onChange={(e) =>
                                  handleUpdateSet(activeExerciseIndex, setIdx, 'timeFormatted', e.target.value)
                                }
                                className={`w-full max-w-[5.2rem] text-center font-mono font-bold text-xs sm:text-sm border rounded-lg py-1.5 text-white focus:outline-none focus:border-amber-500 ${
                                  isStopwatchActive
                                    ? 'bg-amber-950/70 border-amber-500 text-amber-300 animate-pulse'
                                    : 'bg-zinc-900 border-zinc-700'
                                }`}
                              />

                              {/* Live Stopwatch Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleSetStopwatch(activeExerciseIndex, setIdx)}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                  isStopwatchActive
                                    ? 'bg-amber-500 text-black font-black border-amber-500 animate-pulse shadow-md shadow-amber-950/40'
                                    : 'bg-zinc-800 hover:bg-zinc-700 text-amber-400 border-zinc-700'
                                }`}
                                title={isStopwatchActive ? 'Stop timer and record time' : 'Start live set stopwatch'}
                              >
                                {isStopwatchActive ? (
                                  <Pause className="w-3.5 h-3.5" />
                                ) : (
                                  <Play className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>

                            {/* RPE Input */}
                            <div className="col-span-2 sm:col-span-2 flex items-center justify-center">
                              <input
                                type="number"
                                step="0.5"
                                min="1"
                                max="10"
                                placeholder="8.0"
                                value={set.rpe !== undefined ? set.rpe : ''}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  handleUpdateSet(activeExerciseIndex, setIdx, 'rpe', raw === '' ? undefined : parseFloat(raw));
                                }}
                                className="w-full max-w-[3.6rem] text-center font-mono font-bold text-xs bg-zinc-900 border border-zinc-700 rounded-lg py-1.5 text-white focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            {/* Complete Checkmark */}
                            <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleToggleCompleteSet(activeExerciseIndex, setIdx)}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold transition-all shadow-md cursor-pointer ${
                                  set.completed
                                    ? 'bg-emerald-500 text-zinc-950 shadow-emerald-500/30'
                                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700'
                                }`}
                                title={set.completed ? 'Mark incomplete' : 'Log timed set'}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Quick Time Presets Chips */}
                          <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-800/60 overflow-x-auto text-[10px]">
                            <span className="text-zinc-500 font-bold uppercase shrink-0">Quick Set:</span>
                            {currentExercise.exerciseName.toLowerCase().includes('plank') || currentExercise.exerciseName.toLowerCase().includes('hold') ? (
                              ['00:30', '00:45', '00:60', '01:15', '01:30'].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => handleUpdateSet(activeExerciseIndex, setIdx, 'timeFormatted', preset)}
                                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono transition-colors cursor-pointer"
                                >
                                  {preset}
                                </button>
                              ))
                            ) : (
                              ['15:00', '20:00', '25:00', '30:00', '35:00', '40:00', '45:00', '60:00'].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => handleUpdateSet(activeExerciseIndex, setIdx, 'timeFormatted', preset)}
                                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono transition-colors cursor-pointer"
                                >
                                  {preset}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    }

                    // STANDARD STRENGTH EXERCISE SET ROW
                    const e1RM = calculate1RM(set.weightLbs, set.reps);

                    return (
                      <div
                        key={set.id}
                        className={`grid grid-cols-12 gap-1.5 sm:gap-2 items-center p-2 sm:p-2.5 rounded-xl border transition-all ${
                          set.completed
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                            : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 text-zinc-200'
                        }`}
                      >
                        {/* Set # */}
                        <div className="col-span-1 text-center font-bold font-mono text-sm">
                          {set.setNumber}
                        </div>

                        {/* Previous weight & reps (Desktop) */}
                        <div className="col-span-2 hidden sm:block text-xs text-zinc-400 truncate">
                          {set.prevWeightLbs ? (
                            <span className="font-mono text-[11px]">
                              {set.prevWeightLbs} <span className="text-[9px] text-zinc-500">lbs</span> × {set.prevReps}
                            </span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </div>

                        {/* Weight Input with Previous hint on mobile */}
                        <div className="col-span-4 sm:col-span-3 flex flex-col items-center justify-center gap-0.5">
                          <div className="flex items-center justify-center w-full">
                            <input
                              type="number"
                              step="5"
                              value={set.weightLbs || ''}
                              onChange={(e) =>
                                handleUpdateSet(
                                  activeExerciseIndex,
                                  setIdx,
                                  'weightLbs',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full max-w-[5.4rem] text-center font-mono font-bold text-xs sm:text-sm bg-zinc-900 border border-zinc-700 rounded-lg py-1.5 text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          {/* Mobile-only previous indicator */}
                          {set.prevWeightLbs ? (
                            <span className="text-[9px] font-mono text-zinc-500 sm:hidden truncate">
                              Prev: {set.prevWeightLbs}×{set.prevReps}
                            </span>
                          ) : null}
                        </div>

                        {/* Reps Input */}
                        <div className="col-span-2 sm:col-span-2 flex items-center justify-center">
                          <input
                            type="number"
                            value={set.reps || ''}
                            onChange={(e) =>
                              handleUpdateSet(
                                activeExerciseIndex,
                                setIdx,
                                'reps',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full max-w-[3.8rem] text-center font-mono font-bold text-xs sm:text-sm bg-zinc-900 border border-zinc-700 rounded-lg py-1.5 text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* RPE Input Field */}
                        <div className="col-span-3 sm:col-span-2 flex flex-col items-center justify-center">
                          <div className="relative w-full max-w-[4.6rem]">
                            <input
                              type="number"
                              step="0.5"
                              min="1"
                              max="10"
                              placeholder="8.0"
                              value={set.rpe !== undefined ? set.rpe : ''}
                              onChange={(e) => {
                                const raw = e.target.value;
                                const val = raw === '' ? undefined : parseFloat(raw);
                                handleUpdateSet(activeExerciseIndex, setIdx, 'rpe', val);
                              }}
                              className={`w-full text-center font-mono font-bold text-xs sm:text-sm rounded-lg py-1.5 border transition-all focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                                (set.rpe || 0) >= 9.5
                                  ? 'bg-amber-950/40 border-amber-500/70 text-amber-300'
                                  : (set.rpe || 0) >= 8.5
                                  ? 'bg-amber-950/50 border-amber-500/70 text-amber-300'
                                  : (set.rpe || 0) >= 7.5
                                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                                  : 'bg-zinc-900 border-zinc-700 text-zinc-200'
                              }`}
                              title="Rate of Perceived Exertion (1 to 10 scale)"
                            />
                          </div>
                          <span className="text-[9px] font-mono mt-0.5 text-zinc-400 truncate">
                            {set.rpe !== undefined && set.rpe > 0
                              ? set.rpe >= 10
                                ? '0 RIR (Max)'
                                : set.rpe >= 9.5
                                ? '0-1 RIR'
                                : set.rpe >= 9
                                ? '1 RIR'
                                : set.rpe >= 8.5
                                ? '1-2 RIR'
                                : set.rpe >= 8
                                ? '2 RIR'
                                : set.rpe >= 7.5
                                ? '2-3 RIR'
                                : set.rpe >= 7
                                ? '3 RIR'
                                : `${set.rpe} RPE`
                              : 'RPE 1-10'}
                          </span>
                        </div>

                        {/* Checkmark Button */}
                        <div className="col-span-2 sm:col-span-2 flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleCompleteSet(activeExerciseIndex, setIdx)}
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold transition-all shadow-md cursor-pointer ${
                              set.completed
                                ? 'bg-emerald-500 text-zinc-950 shadow-emerald-500/30'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700'
                            }`}
                            title={set.completed ? 'Mark incomplete' : 'Log set with RPE & start rest timer'}
                          >
                            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>

                          {currentExercise.sets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSet(activeExerciseIndex, setIdx)}
                              className="p-1 text-zinc-600 hover:text-amber-400 transition-colors hidden sm:block cursor-pointer"
                              title="Delete set"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Set Actions & 1RM / RPE Estimation preview */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => handleAddSet(activeExerciseIndex)}
                    className="w-full sm:w-auto px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    Add Set
                  </button>

                  {/* Calculated 1RM and Avg RPE badges */}
                  {(() => {
                    const currentExCompletedSets = currentExercise.sets.filter((s) => s.completed);
                    const currentExRpeSets = currentExCompletedSets.filter(
                      (s) => s.rpe !== undefined && s.rpe > 0
                    );
                    const currentExAvgRpe =
                      currentExRpeSets.length > 0
                        ? (
                            currentExRpeSets.reduce((sum, s) => sum + (s.rpe || 0), 0) /
                            currentExRpeSets.length
                          ).toFixed(1)
                        : null;

                    return (
                      <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span>Est. 1RM Peak:</span>
                          <span className="font-mono font-bold text-amber-400 text-sm">
                            {Math.max(
                              0,
                              ...currentExercise.sets.map((s) => calculate1RM(s.weightLbs, s.reps))
                            )}{' '}
                            lbs
                          </span>
                        </div>
                        {currentExAvgRpe && (
                          <div className="flex items-center gap-1.5 border-l border-zinc-800 pl-3">
                            <span>Logged Avg RPE:</span>
                            <span className="font-mono font-bold text-amber-400 text-sm">
                              {currentExAvgRpe} / 10
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Navigation between exercises and Exit Workout */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={activeExerciseIndex === 0}
                  onClick={() => setActiveExerciseIndex((prev) => Math.max(0, prev - 1))}
                  className="px-3.5 sm:px-4 py-2 bg-zinc-800 disabled:opacity-30 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Previous Exercise
                </button>

                <button
                  type="button"
                  onClick={handleExitRequest}
                  className="px-3.5 py-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-white border border-red-800/80 hover:border-red-600 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Exit active workout session"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span>Exit Workout</span>
                </button>

                {activeExerciseIndex < exercises.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveExerciseIndex((prev) => Math.min(exercises.length - 1, prev + 1))}
                    className="px-4 sm:px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/30 transition-all cursor-pointer"
                  >
                    Next Exercise
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsFinishing(true)}
                    className="px-4 sm:px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/30 cursor-pointer uppercase tracking-wider"
                  >
                    Review & Complete
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Finishing Workout Confirmation Modal */}
      {isFinishing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsFinishing(false)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-zinc-800">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-1 mx-auto mb-3 flex items-center justify-center shadow-lg shadow-emerald-900/40">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white font-athletic uppercase tracking-wider">
                Workout Summary & Log
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Overland Athletics Training Record
              </p>
            </div>

            {(() => {
              const completedSetsList = exercises.flatMap((ex) => ex.sets).filter((s) => s.completed);
              const rpeSetsList = completedSetsList.filter((s) => s.rpe !== undefined && s.rpe > 0);
              const avgRpeVal =
                rpeSetsList.length > 0
                  ? (rpeSetsList.reduce((acc, s) => acc + (s.rpe || 0), 0) / rpeSetsList.length).toFixed(1)
                  : null;

              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                      Duration
                    </span>
                    <span className="font-mono text-lg sm:text-xl font-black text-amber-400">
                      {formatElapsed(elapsedSeconds)}
                    </span>
                  </div>

                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                      Total Volume
                    </span>
                    <span className="font-mono text-lg sm:text-xl font-black text-amber-400">
                      {totalVolumeLbs.toLocaleString()} <span className="text-[10px] font-normal">lbs</span>
                    </span>
                  </div>

                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                      Sets Logged
                    </span>
                    <span className="font-mono text-lg sm:text-xl font-black text-emerald-400">
                      {totalSetsCompleted}
                    </span>
                  </div>

                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                      Avg Session RPE
                    </span>
                    <span className="font-mono text-lg sm:text-xl font-black text-amber-400">
                      {avgRpeVal ? `${avgRpeVal}/10` : '—'}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Coach Rating & Notes */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Workout Effort / Rating (1-5 Stars):
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSessionRating(star)}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs border transition-colors ${
                        sessionRating >= star
                          ? 'bg-amber-500 text-zinc-950 border-amber-400'
                          : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Athlete Session Notes & Cues:
                </label>
                <textarea
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  placeholder="e.g. Great explosive speed on bench press; back felt fresh. Rest timer kept pacing tight."
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-800 flex gap-2">
              <button
                type="button"
                onClick={() => setIsFinishing(false)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-colors"
              >
                Return to Live Workout
              </button>

              <button
                type="button"
                onClick={handleFinishWorkout}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Save & Complete Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Workout Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#141a21] border-2 border-red-900/80 rounded-2xl p-6 shadow-2xl relative text-center">
            <button
              type="button"
              onClick={() => setShowExitModal(false)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-red-950/90 border border-red-700 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-red-950/50">
              <LogOut className="w-7 h-7 text-red-400 stroke-[2.5]" />
            </div>

            <h3 className="text-xl font-black text-white font-athletic uppercase tracking-wider">
              Exit Active Workout?
            </h3>

            <p className="text-xs text-zinc-300 mt-2.5 leading-relaxed">
              You currently have <span className="font-bold text-amber-400">{totalSetsCompleted}</span> of{' '}
              <span className="font-bold text-white">{totalPlannedSets}</span> sets logged{' '}
              (<span className="font-mono text-zinc-200">{formatElapsed(elapsedSeconds)}</span> elapsed,{' '}
              <span className="font-bold text-amber-400">{totalVolumeLbs.toLocaleString()} lbs</span> total volume).
            </p>

            <p className="text-[11px] text-zinc-400 mt-1.5">
              Would you like to save your completed sets to your training record before exiting, discard this session, or keep lifting?
            </p>

            <div className="flex flex-col gap-2.5 mt-6">
              <button
                type="button"
                onClick={handleExitWorkoutWithSave}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Save Completed Sets & Exit
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowExitModal(false);
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-red-950/80 hover:bg-red-900 text-red-200 hover:text-white border border-red-700/80 hover:border-red-500 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                Discard Session & Exit
              </button>

              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Keep Working Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
