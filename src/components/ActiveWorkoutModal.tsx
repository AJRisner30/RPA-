import React, { useState, useEffect } from 'react';
import { 
  X, Check, Plus, Trash2, Clock, Dumbbell, Flame, Award, 
  ChevronRight, ChevronLeft, MessageSquare, AlertCircle, RefreshCw,
  HelpCircle, Activity, Gauge, Pause, Play, Timer, TrendingUp, Zap, RotateCcw,
  LogOut, ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  WorkoutProgram,
  LiveExerciseSession,
  LiveSet,
  WorkoutSessionLog,
  MuscleGroup,
  isExerciseTimed,
  AutoOverloadRecommendation,
  SupersetLiveEntry,
} from '../types';
import { calculate1RM, saveWorkoutLog, getStoredWorkoutLogs } from '../utils/storage';
import { getAutoOverloadRecommendation } from '../utils/autoOverload';
import { getCurrentAthlete } from '../utils/athleteAuth';
import { soundManager } from '../utils/audio';
import { useAndroidHaptics } from '../hooks/useAndroidHaptics';
import { useRestTimer } from '../hooks/useRestTimer';
import {
  getExerciseFormat,
  parseSupersetDetails,
  parseEmomDetails,
  parseAmrapDetails,
  parseCircuitDetails,
} from '../utils/workoutFormats';

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
  const haptics = useAndroidHaptics();
  const currentAthlete = getCurrentAthlete();
  // Find athlete-specific past logs for progressive overload calculations
  const allLogs = getStoredWorkoutLogs();
  const pastLogs = allLogs.filter(
    (l) => l.athleteId === currentAthlete.id || (!l.athleteId && (currentAthlete.id === 'athlete-default' || currentAthlete.id === 'athlete-aj-risner'))
  );
  const effectiveLogs = pastLogs.length > 0 ? pastLogs : allLogs;

  // Initialize live exercise sessions based on program with Format awareness (Superset, EMOM, AMRAP, Circuit, Straight)
  const [exercises, setExercises] = useState<LiveExerciseSession[]>(() => {
    const findPrevStats = (movementName: string, fallbackWeight?: number) => {
      for (const log of effectiveLogs) {
        const match = log.exercises.find(
          (e) => e.exerciseName.toLowerCase() === movementName.toLowerCase()
        );
        if (match && match.sets.length > 0) {
          const lastSet = match.sets[match.sets.length - 1];
          return {
            prevWeightLbs: lastSet.weightLbs,
            prevReps: lastSet.reps,
          };
        }
      }
      return {
        prevWeightLbs: fallbackWeight,
        prevReps: undefined,
      };
    };

    return program.exercises.map((template) => {
      const format = getExerciseFormat(template);

      if (format === 'superset') {
        const parsedSS = parseSupersetDetails(template);
        const rounds = Math.max(1, parsedSS.rounds || template.defaultSets || 3);

        const initialSets: LiveSet[] = Array.from({ length: rounds }).map((_, roundIdx) => {
          const entries: SupersetLiveEntry[] = parsedSS.movements.map((mov) => {
            const overloadMov = getAutoOverloadRecommendation(
              mov.name,
              mov.targetReps || template.targetReps,
              template.targetRpe,
              effectiveLogs
            );
            const prev = findPrevStats(mov.name, mov.weight_lbs);
            const parsedTargetReps = parseInt(mov.targetReps || template.targetReps || '10', 10);
            const defaultReps = !isNaN(parsedTargetReps) ? parsedTargetReps : 10;
            const isBodyweightMov = /push-up|pushup|pull-up|chin-up|dip|plank|inverted/i.test(mov.name);

            const startWeight =
              overloadMov.status === 'overload_applied' || overloadMov.status === 'maintain'
                ? overloadMov.recommendedWeightLbs
                : mov.weight_lbs !== undefined
                ? mov.weight_lbs
                : prev.prevWeightLbs !== undefined
                ? prev.prevWeightLbs
                : isBodyweightMov
                ? 0
                : 35;

            return {
              name: mov.name,
              muscleGroup: mov.muscleGroup || template.muscleGroup,
              weightLbs: startWeight,
              reps: defaultReps,
              targetReps: mov.targetReps || template.targetReps || '10',
              prevWeightLbs: overloadMov.previousWeightLbs ?? prev.prevWeightLbs,
              prevReps: overloadMov.previousReps ?? prev.prevReps ?? defaultReps,
            };
          });

          return {
            id: `set-${template.id}-${roundIdx + 1}`,
            setNumber: roundIdx + 1,
            weightLbs: entries[0]?.weightLbs || 0,
            reps: entries[0]?.reps || 10,
            rpe: template.targetRpe || 8,
            completed: false,
            restSeconds: parsedSS.restBetweenRoundsSeconds || 75,
            isTimed: false,
            supersetEntries: entries,
          };
        });

        return {
          exerciseId: template.id,
          exerciseName: parsedSS.title || template.name,
          muscleGroup: template.muscleGroup,
          restPeriodSeconds: parsedSS.restBetweenRoundsSeconds || 75,
          notes: template.notes,
          targetReps: template.targetReps,
          targetRpe: template.targetRpe || 8,
          progressionRules: template.progression_rules,
          isTimed: false,
          format: 'superset',
          supersetExercises: parsedSS.movements,
          sets: initialSets,
        };
      }

      if (format === 'emom') {
        const parsedEmom = parseEmomDetails(template);
        const mins = Math.max(1, parsedEmom.totalMinutes || 10);
        const roundCount = Math.max(
          1,
          Math.round((mins * 60) / Math.max(30, parsedEmom.intervalSeconds || 60))
        );
        const initialSets: LiveSet[] = Array.from({ length: roundCount }).map((_, idx) => ({
          id: `set-${template.id}-${idx + 1}`,
          setNumber: idx + 1,
          weightLbs: template.weight_lbs || 0,
          reps: 1,
          rpe: template.targetRpe || 8,
          completed: false,
          restSeconds: 0,
          isTimed: true,
          timeFormatted: `${Math.round((parsedEmom.intervalSeconds || 60) / 60)}:00`,
          emomRoundsCompleted: 0,
        }));

        return {
          exerciseId: template.id,
          exerciseName: parsedEmom.title,
          muscleGroup: template.muscleGroup,
          restPeriodSeconds: template.restPeriodSeconds || 0,
          notes: template.notes,
          targetReps: `${parsedEmom.totalMinutes} Min EMOM (Every ${parsedEmom.intervalSeconds}s)`,
          targetRpe: parsedEmom.targetRpe,
          isTimed: true,
          format: 'emom',
          emomMinutes: parsedEmom.totalMinutes,
          emomIntervalSeconds: parsedEmom.intervalSeconds,
          emomMovements: parsedEmom.movements,
          sets: initialSets,
        };
      }

      if (format === 'amrap') {
        const parsedAmrap = parseAmrapDetails(template);
        const initialSets: LiveSet[] = [
          {
            id: `set-${template.id}-1`,
            setNumber: 1,
            weightLbs: template.weight_lbs || 0,
            reps: 0,
            rpe: parsedAmrap.targetRpe || 8.5,
            completed: false,
            restSeconds: template.restPeriodSeconds || 120,
            isTimed: true,
            timeFormatted: `${parsedAmrap.durationMinutes}:00`,
            amrapRoundsCompleted: 0,
            amrapExtraReps: 0,
          },
        ];

        return {
          exerciseId: template.id,
          exerciseName: parsedAmrap.title,
          muscleGroup: template.muscleGroup,
          restPeriodSeconds: template.restPeriodSeconds || 120,
          notes: template.notes,
          targetReps: `${parsedAmrap.durationMinutes} Min AMRAP`,
          targetRpe: parsedAmrap.targetRpe,
          isTimed: true,
          format: 'amrap',
          amrapDurationMinutes: parsedAmrap.durationMinutes,
          amrapMovements: parsedAmrap.movements,
          sets: initialSets,
        };
      }

      if (format === 'circuit') {
        const circuit = parseCircuitDetails(template);
        const rounds = Math.max(1, circuit.rounds || template.defaultSets || 3);
        const initialSets: LiveSet[] = Array.from({ length: rounds }).map((_, rIdx) => ({
          id: `set-${template.id}-${rIdx + 1}`,
          setNumber: rIdx + 1,
          weightLbs: template.weight_lbs || 0,
          reps: circuit.stations.length,
          rpe: circuit.targetRpe || 8.5,
          completed: false,
          restSeconds: circuit.restBetweenRoundsSeconds || 60,
          isTimed: true,
          timeFormatted: circuit.workRestScheme || 'Round Complete',
        }));

        return {
          exerciseId: template.id,
          exerciseName: circuit.circuitName,
          muscleGroup: template.muscleGroup,
          restPeriodSeconds: circuit.restBetweenRoundsSeconds || 60,
          notes: template.notes || circuit.executionCue,
          targetReps: `${rounds} Rounds (${circuit.workRestScheme})`,
          targetRpe: circuit.targetRpe,
          isTimed: true,
          format: 'circuit',
          circuitStations: circuit.stations.map((s) => s.name),
          workSeconds: template.workSeconds,
          restSeconds: template.restSeconds,
          sets: initialSets,
        };
      }

      const timed = isExerciseTimed(template.name, template.type, template.targetReps);
      const overload = getAutoOverloadRecommendation(
        template.name,
        template.targetReps,
        template.targetRpe,
        effectiveLogs
      );

      if (timed) {
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
          format: 'straight',
          distance_miles: template.distance_miles,
          autoOverload: overload,
          sets: initialSets,
        };
      } else {
        let startingWeight = 50;
        let prevWeight = template.weight_lbs;

        if (overload.status === 'overload_applied' || overload.status === 'maintain') {
          startingWeight = overload.recommendedWeightLbs;
          prevWeight = overload.previousWeightLbs;
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
          format: 'straight',
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

  const workoutStartTimeRef = React.useRef<number>(Date.now());
  const setStopwatchStartTimeRef = React.useRef<number | null>(null);

  // Live set stopwatch ticker (wall-clock synchronized)
  useEffect(() => {
    if (!activeSetStopwatch) {
      setStopwatchStartTimeRef.current = null;
      return;
    }
    if (!setStopwatchStartTimeRef.current) {
      setStopwatchStartTimeRef.current = Date.now() - (activeSetStopwatch.seconds * 1000);
    }
    const interval = window.setInterval(() => {
      if (!setStopwatchStartTimeRef.current) return;
      const exactSecs = Math.max(0, Math.floor((Date.now() - setStopwatchStartTimeRef.current) / 1000));
      setActiveSetStopwatch((prev) => {
        if (!prev || prev.seconds === exactSecs) return prev;
        return { ...prev, seconds: exactSecs };
      });
    }, 200);
    return () => clearInterval(interval);
  }, [activeSetStopwatch?.exerciseIdx, activeSetStopwatch?.setIdx]);

  const handleToggleSetStopwatch = (exerciseIdx: number, setIdx: number) => {
    if (activeSetStopwatch && activeSetStopwatch.exerciseIdx === exerciseIdx && activeSetStopwatch.setIdx === setIdx) {
      // Stop and record exact logged time
      const totalSecs = setStopwatchStartTimeRef.current 
        ? Math.max(1, Math.round((Date.now() - setStopwatchStartTimeRef.current) / 1000))
        : activeSetStopwatch.seconds;
      const m = Math.floor(totalSecs / 60);
      const s = totalSecs % 60;
      const formatted = `${m}:${s < 10 ? '0' : ''}${s}`;

      handleUpdateSet(exerciseIdx, setIdx, 'timeFormatted', formatted);
      handleUpdateSet(exerciseIdx, setIdx, 'timeSeconds', totalSecs);
      setActiveSetStopwatch(null);
      setStopwatchStartTimeRef.current = null;
      soundManager.playRestComplete();
    } else {
      // Start live set stopwatch
      setStopwatchStartTimeRef.current = Date.now();
      setActiveSetStopwatch({
        exerciseIdx,
        setIdx,
        seconds: 0,
      });
      soundManager.playCountdownBeep(true);
    }
  };

  // Live workout timer (wall-clock synchronized)
  useEffect(() => {
    const updateElapsed = () => {
      const now = Date.now();
      const exactElapsed = Math.max(0, Math.floor((now - workoutStartTimeRef.current) / 1000));
      setElapsedSeconds((prev) => (prev === exactElapsed ? prev : exactElapsed));
    };
    updateElapsed();
    const timer = setInterval(updateElapsed, 500);
    return () => clearInterval(timer);
  }, []);

  // Live EMOM / AMRAP interactive countdown clock
  const [blockClock, setBlockClock] = useState<{
    exerciseId: string;
    mode: 'emom' | 'amrap';
    isRunning: boolean;
    secondsRemaining: number;
    totalSeconds: number;
    intervalSeconds: number;
    currentInterval: number;
    totalIntervals: number;
  } | null>(null);

  useEffect(() => {
    if (!blockClock || !blockClock.isRunning) return;
    const id = window.setInterval(() => {
      setBlockClock((prev) => {
        if (!prev || !prev.isRunning) return prev;
        if (prev.secondsRemaining <= 1) {
          soundManager.playRestComplete();
          haptics.alert();
          if (prev.mode === 'emom' && prev.currentInterval < prev.totalIntervals) {
            return {
              ...prev,
              currentInterval: prev.currentInterval + 1,
              secondsRemaining: prev.intervalSeconds,
            };
          }
          return { ...prev, secondsRemaining: 0, isRunning: false };
        }
        const nextSec = prev.secondsRemaining - 1;
        if (nextSec <= 3 && nextSec > 0) {
          soundManager.playCountdownBeep(nextSec === 1);
        }
        return { ...prev, secondsRemaining: nextSec };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [blockClock?.isRunning, blockClock?.exerciseId]);

  const startOrToggleBlockClock = (
    ex: LiveExerciseSession,
    mode: 'emom' | 'amrap'
  ) => {
    if (blockClock && blockClock.exerciseId === ex.exerciseId && blockClock.mode === mode) {
      if (blockClock.secondsRemaining === 0) {
        const initSec = mode === 'emom' ? ex.emomIntervalSeconds || 60 : (ex.amrapDurationMinutes || 12) * 60;
        setBlockClock({
          ...blockClock,
          isRunning: true,
          secondsRemaining: initSec,
          currentInterval: 1,
        });
      } else {
        setBlockClock({ ...blockClock, isRunning: !blockClock.isRunning });
      }
      return;
    }

    if (mode === 'emom') {
      const intervalSec = ex.emomIntervalSeconds || 60;
      const totalIntervals = ex.sets.length || Math.max(1, Math.round(((ex.emomMinutes || 10) * 60) / intervalSec));
      setBlockClock({
        exerciseId: ex.exerciseId,
        mode: 'emom',
        isRunning: true,
        secondsRemaining: intervalSec,
        totalSeconds: intervalSec,
        intervalSeconds: intervalSec,
        currentInterval: 1,
        totalIntervals,
      });
    } else {
      const totalSec = Math.max(60, (ex.amrapDurationMinutes || 12) * 60);
      setBlockClock({
        exerciseId: ex.exerciseId,
        mode: 'amrap',
        isRunning: true,
        secondsRemaining: totalSec,
        totalSeconds: totalSec,
        intervalSeconds: totalSec,
        currentInterval: 1,
        totalIntervals: 1,
      });
    }
    soundManager.playCountdownBeep(true);
    haptics.tap();
  };

  const resetBlockClock = () => {
    setBlockClock(null);
  };

  const formatElapsed = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentExercise = exercises[activeExerciseIndex];

  const handleUpdateSet = (
    exerciseIdx: number,
    setIdx: number,
    field:
      | 'weightLbs'
      | 'reps'
      | 'rpe'
      | 'distanceMiles'
      | 'timeFormatted'
      | 'timeSeconds'
      | 'amrapRoundsCompleted'
      | 'amrapExtraReps'
      | 'emomRoundsCompleted',
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

  const handleUpdateSupersetEntry = (
    exerciseIdx: number,
    setIdx: number,
    entryIdx: number,
    field: 'weightLbs' | 'reps',
    value: number
  ) => {
    setExercises((prev) => {
      const copy = [...prev];
      const ex = { ...copy[exerciseIdx] };
      const setList = [...ex.sets];
      const targetSet = { ...setList[setIdx] };
      const entries = [...(targetSet.supersetEntries || [])];
      if (!entries[entryIdx]) return prev;
      entries[entryIdx] = {
        ...entries[entryIdx],
        [field]: value,
      };
      targetSet.supersetEntries = entries;
      // Keep top-level weightLbs/reps synced to primary movement for backwards compatibility
      if (entryIdx === 0) {
        if (field === 'weightLbs') targetSet.weightLbs = value;
        if (field === 'reps') targetSet.reps = value;
      }
      setList[setIdx] = targetSet;
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

  // Inline rest timer state for the modal (synchronized with wall clock via useRestTimer)
  const {
    activeTimer: modalRestTimer,
    startTimer: startModalRestTimer,
    togglePauseResume: toggleModalRestTimer,
    adjustRemaining: adjustModalRestTimer,
    stopTimer: stopModalRestTimer,
    updateTotalDuration: updateModalRestTimerTotal,
  } = useRestTimer({
    onComplete: () => {
      haptics.alert();
    },
  });

  const handleStartRestTimer = (seconds: number, exerciseName: string) => {
    const rawVal = parseInt(String(seconds ?? 90), 10);
    const validSecs = !isNaN(rawVal) && rawVal > 0 ? rawVal : 90;
    startModalRestTimer(exerciseName, validSecs);
    haptics.tap();
  };

  const handleToggleCompleteSet = (exerciseIdx: number, setIdx: number) => {
    const targetEx = exercises[exerciseIdx];
    const currentSet = targetEx?.sets[setIdx];
    if (!currentSet || !targetEx) return;

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
      haptics.success();
      // Auto-trigger inline rest countdown if this exercise prescribes rest (> 0)
      const rawSecs = currentSet.restSeconds !== undefined ? currentSet.restSeconds : targetEx.restPeriodSeconds;
      const parsedSecs = parseInt(String(rawSecs ?? 0), 10);
      if (parsedSecs > 0) {
        handleStartRestTimer(parsedSecs, targetEx.exerciseName);
      }
    } else {
      haptics.tap();
    }
  };

  const handleUpdateExerciseRestPeriod = (exerciseIdx: number, seconds: number) => {
    const validSecs = Math.max(15, parseInt(String(seconds), 10) || 15);
    setExercises((prev) => {
      const copy = [...prev];
      const ex = { ...copy[exerciseIdx] };
      ex.restPeriodSeconds = validSecs;
      ex.sets = ex.sets.map((s) => ({ ...s, restSeconds: validSecs }));
      copy[exerciseIdx] = ex;
      return copy;
    });

    if (modalRestTimer && modalRestTimer.exerciseName === exercises[exerciseIdx]?.exerciseName) {
      updateModalRestTimerTotal(validSecs);
    }
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
        isTimed: ex.isTimed,
        supersetEntries: lastSet?.supersetEntries
          ? lastSet.supersetEntries.map((entry) => ({ ...entry }))
          : undefined,
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

  // Calculate live stats (supports Superset multi-movement volume accurately)
  const totalSetsCompleted = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalPlannedSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  const totalVolumeLbs = exercises.reduce((acc, ex) => {
    if (ex.format === 'superset') {
      return (
        acc +
        ex.sets.reduce((setAcc, set) => {
          if (!set.completed) return setAcc;
          const roundVol = (set.supersetEntries || []).reduce(
            (subAcc, entry) => subAcc + (entry.weightLbs || 0) * (entry.reps || 0),
            0
          );
          return setAcc + roundVol;
        }, 0)
      );
    }
    if (ex.isTimed) {
      return acc;
    }
    return (
      acc +
      ex.sets.reduce((setAcc, set) => {
        return set.completed ? setAcc + (set.weightLbs || 0) * set.reps : setAcc;
      }, 0)
    );
  }, 0);

  const serializeExercisesForLog = () => {
    const exported: WorkoutSessionLog['exercises'] = [];
    exercises.forEach((ex) => {
      if (ex.format === 'superset') {
        const activeSets = ex.sets.filter((s) => s.completed || (s.supersetEntries || []).some((e) => e.weightLbs > 0 || e.reps > 0));
        const movCount = ex.sets[0]?.supersetEntries?.length || 0;
        for (let mIdx = 0; mIdx < movCount; mIdx++) {
          const movMeta = ex.sets[0]?.supersetEntries?.[mIdx];
          if (!movMeta) continue;
          exported.push({
            exerciseName: movMeta.name,
            muscleGroup: movMeta.muscleGroup || ex.muscleGroup,
            isTimed: false,
            format: 'superset',
            supersetGroupName: ex.exerciseName,
            sets: activeSets.map((s) => {
              const entry = s.supersetEntries?.[mIdx];
              const w = entry?.weightLbs || 0;
              const r = entry?.reps || 0;
              return {
                setNumber: s.setNumber,
                weightLbs: w,
                reps: r,
                rpe: s.rpe,
                estimated1RM: calculate1RM(w, r),
              };
            }),
          });
        }
        return;
      }

      exported.push({
        exerciseName: ex.exerciseName,
        muscleGroup: ex.muscleGroup,
        isTimed: ex.isTimed,
        format: ex.format,
        sets: ex.sets
          .filter(
            (s) =>
              s.completed ||
              s.weightLbs > 0 ||
              (s.timeFormatted && s.timeFormatted !== '00:00') ||
              (s.distanceMiles && s.distanceMiles > 0) ||
              (s.amrapRoundsCompleted && s.amrapRoundsCompleted > 0)
          )
          .map((s) => ({
            setNumber: s.setNumber,
            weightLbs: s.weightLbs,
            reps: ex.format === 'amrap' ? (s.amrapRoundsCompleted || s.reps || 0) : s.reps,
            rpe: s.rpe,
            timeFormatted: s.timeFormatted,
            timeSeconds: s.timeSeconds,
            distanceMiles: s.distanceMiles,
            amrapRoundsCompleted: s.amrapRoundsCompleted,
            amrapExtraReps: s.amrapExtraReps,
            emomRoundsCompleted: s.emomRoundsCompleted,
            estimated1RM: !ex.isTimed ? calculate1RM(s.weightLbs, s.reps) : 0,
          })),
      });
    });
    return exported;
  };

  const handleFinishWorkout = () => {
    const endTime = new Date();
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

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
      exercises: serializeExercisesForLog(),
    };

    saveWorkoutLog(sessionLog);
    soundManager.playRestComplete();
    haptics.heavy();

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#3b82f6', '#dc2626', '#ffffff'],
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
      exercises: serializeExercisesForLog(),
    };

    saveWorkoutLog(sessionLog);
    setShowExitModal(false);
    onWorkoutCompleted(sessionLog);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060a12]/95 backdrop-blur-md flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Sleek, Uncluttered Top Action Bar */}
      <div className="bg-[#0b121e] border-b border-slate-800/80 px-3 sm:px-6 py-2.5 flex items-center justify-between shrink-0 gap-3 shadow-md z-20">
        {/* Workout Identity & Category */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white tracking-wide truncate max-w-[150px] sm:max-w-xs md:max-w-md font-athletic uppercase">
                {program.title}
              </h2>
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                / {program.category}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
              Exercise {activeExerciseIndex + 1} of {exercises.length} · {totalSetsCompleted}/{totalPlannedSets} sets done
            </p>
          </div>
        </div>

        {/* Live Rest Banner & Header Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Active Rest Countdown in Header when running */}
          {modalRestTimer && modalRestTimer.secondsRemaining > 0 && (
            <div className="flex items-center gap-2 bg-blue-950/80 border border-blue-500/50 rounded-xl px-2.5 sm:px-3 py-1 shadow-md animate-in fade-in">
              <Timer className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] font-mono text-blue-300 uppercase hidden md:inline">Rest:</span>
                <span className="font-mono text-xs sm:text-sm font-black text-white">
                  {modalRestTimer.secondsRemaining}s
                </span>
              </div>
              <button
                type="button"
                onClick={() => adjustModalRestTimer(30)}
                className="px-1.5 py-0.5 text-[10px] font-mono bg-blue-900/60 hover:bg-blue-800 text-blue-200 rounded transition cursor-pointer"
                title="Add 30s rest"
              >
                +30
              </button>
              <button
                type="button"
                onClick={() => stopModalRestTimer()}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                title="Skip rest"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Workout Elapsed Time */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 border border-slate-800 rounded-xl font-mono text-xs text-slate-200">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold">{formatElapsed(elapsedSeconds)}</span>
          </div>

          {/* Volume Tracker (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 border border-slate-800 rounded-xl font-mono text-xs text-slate-300">
            <Dumbbell className="w-3.5 h-3.5 text-slate-400" />
            <span>{totalVolumeLbs.toLocaleString()} <span className="text-slate-500 text-[10px]">lbs</span></span>
          </div>

          {/* Exit Workout Button */}
          <button
            type="button"
            onClick={handleExitRequest}
            className="px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-slate-800 hover:border-red-500/50 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            title="Leave workout session"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Exit</span>
          </button>

          {/* Complete / Finish Button */}
          <button
            type="button"
            onClick={() => setIsFinishing(true)}
            className="px-3.5 sm:px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 uppercase tracking-wide font-athletic"
            title="Finish workout and save log"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Finish</span>
          </button>
        </div>
      </div>

      {/* Main Workout Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Streamlined Left Navigation Sidebar */}
        <div className="w-full md:w-72 bg-[#080d17] border-b md:border-b-0 md:border-r border-slate-800/80 p-2 sm:p-3 overflow-y-auto shrink-0 max-h-36 md:max-h-none flex md:flex-col gap-1.5 md:gap-2">
          <div className="hidden md:flex items-center justify-between pb-2 border-b border-slate-800/80 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-athletic">
              Session Exercises
            </span>
            <span className="text-xs font-mono font-bold text-blue-400">
              {Math.round((totalSetsCompleted / Math.max(1, totalPlannedSets)) * 100)}%
            </span>
          </div>

          <div className="flex md:flex-col gap-1.5 w-full overflow-x-auto md:overflow-x-visible">
            {exercises.map((ex, idx) => {
              const setsDone = ex.sets.filter((s) => s.completed).length;
              const isDone = setsDone === ex.sets.length;
              const isCurrent = idx === activeExerciseIndex;

              return (
                <button
                  key={ex.exerciseId}
                  onClick={() => setActiveExerciseIndex(idx)}
                  className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between cursor-pointer shrink-0 md:shrink ${
                    isCurrent
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                      : isDone
                      ? 'bg-emerald-950/20 text-slate-300 border border-emerald-500/30 hover:bg-slate-900'
                      : 'bg-slate-900/70 hover:bg-slate-800/80 text-slate-300 border border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isDone
                          ? 'bg-emerald-500 text-black'
                          : isCurrent
                          ? 'bg-white text-blue-600 font-black'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold truncate leading-tight">{ex.exerciseName}</p>
                      <span className={`text-[10px] font-mono ${isCurrent ? 'text-blue-100' : 'text-slate-400'}`}>
                        {setsDone}/{ex.sets.length} sets
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 hidden md:block ${
                      isCurrent ? 'text-white' : 'text-slate-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Current Exercise Work Area */}
        {currentExercise && (
          <div className="flex-1 p-3 sm:p-5 md:p-6 overflow-y-auto bg-[#070b14]">
            <div className="max-w-3xl mx-auto space-y-4 sm:space-y-5">
              
              {/* Clean, Non-Crowded Exercise Card Header */}
              <div className="bg-[#0b121e] border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    {/* Clean unboxed exercise metadata + format badge */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono mb-1">
                      {currentExercise.format && currentExercise.format !== 'straight' && (
                        <span
                          className={`px-2 py-0.5 rounded font-athletic font-bold uppercase tracking-wider text-[10px] border ${
                            currentExercise.format === 'superset'
                              ? 'bg-indigo-950/70 text-indigo-300 border-indigo-500/40'
                              : currentExercise.format === 'emom'
                              ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                              : currentExercise.format === 'amrap'
                              ? 'bg-red-950/70 text-red-300 border-red-500/40'
                              : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          {currentExercise.format === 'superset'
                            ? 'Superset'
                            : currentExercise.format === 'emom'
                            ? 'EMOM'
                            : currentExercise.format === 'amrap'
                            ? 'AMRAP'
                            : 'Circuit'}
                        </span>
                      )}
                      <span className="text-slate-300 font-bold">{currentExercise.muscleGroup}</span>
                      {currentExercise.restPeriodSeconds > 0 && (
                        <>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="text-blue-400 font-bold">Rest: {currentExercise.restPeriodSeconds}s</span>
                        </>
                      )}
                      {currentExercise.targetRpe && (
                        <>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="text-amber-400 font-bold">Target RPE: {currentExercise.targetRpe}</span>
                        </>
                      )}
                      {currentExercise.targetReps && (
                        <>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span>Target: {currentExercise.targetReps}</span>
                        </>
                      )}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-white font-athletic tracking-wide">
                      {currentExercise.exerciseName}
                    </h3>
                  </div>

                  {/* Rest Timer Button */}
                  <div className="shrink-0 self-start sm:self-auto">
                    {modalRestTimer && modalRestTimer.secondsRemaining > 0 ? (
                      <div className="flex items-center gap-1.5 bg-blue-950/80 border border-blue-500/60 rounded-xl p-1 shadow-md">
                        <button
                          type="button"
                          onClick={() => toggleModalRestTimer(currentExercise.exerciseName, currentExercise.restPeriodSeconds)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black font-mono rounded-lg transition-all cursor-pointer shadow"
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
                          onClick={() => adjustModalRestTimer(-15)}
                          className="px-2 py-1 text-slate-400 hover:text-white text-xs font-mono rounded bg-slate-900 transition"
                          title="Minus 15s"
                        >
                          -15
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustModalRestTimer(30)}
                          className="px-2 py-1 text-slate-400 hover:text-white text-xs font-mono rounded bg-slate-900 transition"
                          title="Add 30s"
                        >
                          +30
                        </button>
                        <button
                          type="button"
                          onClick={() => stopModalRestTimer()}
                          className="p-1 text-slate-400 hover:text-white rounded bg-slate-900 transition"
                          title="Stop timer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : modalRestTimer && modalRestTimer.secondsRemaining === 0 ? (
                      <div className="flex items-center gap-2 bg-emerald-950/90 border border-emerald-500/50 rounded-xl px-3 py-1.5">
                        <span className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1 font-athletic">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          Rest Complete
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStartRestTimer(currentExercise.restPeriodSeconds, currentExercise.exerciseName)}
                          className="px-2 py-0.5 bg-emerald-500 text-black text-[11px] font-bold rounded cursor-pointer"
                        >
                          Repeat
                        </button>
                        <button
                          type="button"
                          onClick={() => stopModalRestTimer()}
                          className="p-0.5 text-slate-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartRestTimer(currentExercise.restPeriodSeconds || 60, currentExercise.exerciseName)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold font-athletic uppercase tracking-wider flex items-center gap-1.5 transition shadow-sm cursor-pointer active:scale-95"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Rest ({currentExercise.restPeriodSeconds || 60}s)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Rest Progress Bar (When timer is running) */}
                {modalRestTimer && modalRestTimer.secondsRemaining > 0 && (
                  <div className="bg-[#070c14] border border-blue-500/30 rounded-xl p-2.5 space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5 text-blue-400" />
                        Rest Countdown: {modalRestTimer.exerciseName}
                      </span>
                      <span className="font-black text-blue-400 text-sm">
                        {modalRestTimer.secondsRemaining}s
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500 transition-all duration-1000 ease-linear rounded-full"
                        style={{
                          width: `${Math.min(100, (modalRestTimer.secondsRemaining / (modalRestTimer.totalSeconds || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Format Movement / Station Breakdown Pills */}
                {currentExercise.format === 'superset' && currentExercise.supersetExercises && currentExercise.supersetExercises.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentExercise.supersetExercises.map((subMov, subIdx) => (
                      <div
                        key={subIdx}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#070c14] border border-indigo-500/25 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-600/30 text-indigo-300 font-mono font-bold text-[10px]">
                            A{subIdx + 1}
                          </span>
                          <span className="font-semibold text-white truncate">{subMov.name}</span>
                        </div>
                        <span className="text-[11px] font-mono text-indigo-300 font-bold shrink-0 ml-2">
                          {subMov.targetReps || '10'} reps
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {currentExercise.format === 'emom' && currentExercise.emomMovements && currentExercise.emomMovements.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                        Every {currentExercise.emomIntervalSeconds || 60}s × {currentExercise.sets.length} Intervals ({currentExercise.emomMinutes || 10} Min Total)
                      </span>
                      <div className="flex items-center gap-2">
                        {blockClock && blockClock.exerciseId === currentExercise.exerciseId && blockClock.mode === 'emom' && (
                          <>
                            <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 font-mono text-xs font-black text-amber-200">
                              Int {blockClock.currentInterval}/{blockClock.totalIntervals} · {formatElapsed(blockClock.secondsRemaining)}
                            </span>
                            <button
                              type="button"
                              onClick={resetBlockClock}
                              className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
                              title="Reset EMOM clock"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => startOrToggleBlockClock(currentExercise, 'emom')}
                          className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] font-athletic uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          {blockClock?.exerciseId === currentExercise.exerciseId && blockClock.isRunning ? (
                            <>
                              <Pause className="w-3 h-3" /> Pause Clock
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3" /> Start EMOM Clock
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {currentExercise.emomMovements.map((mov, idx) => (
                        <div key={idx} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#070c14] border border-amber-500/20 text-xs">
                          <span className="text-white font-medium">{mov.name}</span>
                          {mov.targetReps && <span className="font-mono text-amber-300 font-bold ml-2">{mov.targetReps}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentExercise.format === 'amrap' && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-red-300 font-bold">
                        {currentExercise.amrapDurationMinutes || 12}-Minute Time Cap · As Many Rounds & Reps As Possible
                      </span>
                      <div className="flex items-center gap-2">
                        {blockClock && blockClock.exerciseId === currentExercise.exerciseId && blockClock.mode === 'amrap' && (
                          <>
                            <span className="px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-500/40 font-mono text-xs font-black text-red-200">
                              {formatElapsed(blockClock.secondsRemaining)} left
                            </span>
                            <button
                              type="button"
                              onClick={resetBlockClock}
                              className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
                              title="Reset AMRAP clock"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => startOrToggleBlockClock(currentExercise, 'amrap')}
                          className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-[11px] font-athletic uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          {blockClock?.exerciseId === currentExercise.exerciseId && blockClock.isRunning ? (
                            <>
                              <Pause className="w-3 h-3" /> Pause Cap
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3" /> Start AMRAP Clock
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    {currentExercise.amrapMovements && currentExercise.amrapMovements.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {currentExercise.amrapMovements.map((mov, idx) => (
                          <div key={idx} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#070c14] border border-red-500/20 text-xs">
                            <span className="text-white font-medium">{mov.name}</span>
                            {mov.targetReps && <span className="font-mono text-red-300 font-bold ml-2">{mov.targetReps}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {currentExercise.format === 'circuit' && currentExercise.circuitStations && currentExercise.circuitStations.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-bold block">
                      Circuit Stations ({currentExercise.circuitStations.length} Stations)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {currentExercise.circuitStations.map((st, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#070c14] border border-emerald-500/20 text-xs text-slate-200">
                          <span className="font-mono font-bold text-emerald-400">{idx + 1}.</span>
                          <span className="truncate">{st}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compact, clean coaching cue (quiet unboxed guidance) */}
                {currentExercise.notes && (
                  <div className="text-xs text-slate-300/90 leading-relaxed border-t border-slate-800/80 pt-2.5 flex items-start gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong className="text-blue-300 uppercase font-athletic text-[11px] mr-1">Cue:</strong>{currentExercise.notes}</span>
                  </div>
                )}
              </div>

              {/* Auto-Overload Progression Banner for Standard Straight Strength Exercises */}
              {currentExercise.autoOverload && !currentExercise.isTimed && (!currentExercise.format || currentExercise.format === 'straight') && (
                <div className="px-3.5 py-2.5 rounded-xl border border-slate-800 bg-[#0a0f1d] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Zap className="w-4 h-4 text-blue-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-athletic font-bold text-blue-300 uppercase tracking-wide mr-1.5">
                        {currentExercise.autoOverload.status === 'overload_applied'
                          ? `Auto-Overload: Target ${currentExercise.autoOverload.recommendedWeightLbs} lbs (+${currentExercise.autoOverload.incrementLbs} lbs)`
                          : 'Auto-Overload: Consolidate Working Weight'}
                      </span>
                      <span className="text-slate-400 text-[11px] hidden md:inline truncate">
                        — {currentExercise.autoOverload.reason}
                      </span>
                    </div>
                  </div>

                  {currentExercise.autoOverload.status === 'overload_applied' && currentExercise.autoOverload.previousWeightLbs && (
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleApplyOverloadWeightToAllSets(activeExerciseIndex, currentExercise.autoOverload!.recommendedWeightLbs)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer"
                        title="Set all sets to recommended overload weight"
                      >
                        Apply {currentExercise.autoOverload.recommendedWeightLbs} lbs
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyOverloadWeightToAllSets(activeExerciseIndex, currentExercise.autoOverload!.previousWeightLbs!)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                        title="Revert all sets to previous weight"
                      >
                        Prev ({currentExercise.autoOverload.previousWeightLbs})
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Set-by-Set Logging Table */}
              <div className="bg-[#0b121e] border border-slate-800/80 rounded-2xl p-3.5 sm:p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    {currentExercise.isTimed ? (
                      <Clock className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Dumbbell className="w-4 h-4 text-blue-400" />
                    )}
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-athletic">
                      {currentExercise.format === 'superset'
                        ? 'Superset Rounds (Log Paired Movements)'
                        : currentExercise.format === 'emom'
                        ? 'EMOM Interval Log'
                        : currentExercise.format === 'amrap'
                        ? 'AMRAP Scoreboard Log'
                        : currentExercise.format === 'circuit'
                        ? 'Circuit Rounds Log'
                        : currentExercise.isTimed
                        ? 'Conditioning & Time Log'
                        : 'Sets & Reps'}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRpeGuide(!showRpeGuide)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                        showRpeGuide
                          ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                      <span>RPE Scale</span>
                    </button>
                  </div>
                </div>

                {/* Compact RPE Guide (when toggled) */}
                {showRpeGuide && (
                  <div className="p-3 bg-[#070c14] border border-blue-500/30 rounded-xl text-xs space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                      <span className="text-blue-400 font-athletic font-bold uppercase tracking-wider text-[11px]">
                        RPE (Rate of Perceived Exertion / Reps In Reserve)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowRpeGuide(false)}
                        className="text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-red-950/40 border border-red-500/30">
                        <div className="font-bold text-red-400 font-mono">RPE 10 (0 RIR)</div>
                        <div className="text-slate-400 text-[10px]">Max effort. 0 reps left.</div>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-950/50 border border-blue-500/40">
                        <div className="font-bold text-blue-300 font-mono">RPE 9 (1 RIR)</div>
                        <div className="text-slate-400 text-[10px]">Heavy strain. 1 rep in tank.</div>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-950/40 border border-blue-500/30">
                        <div className="font-bold text-blue-400 font-mono">RPE 8 (2 RIR)</div>
                        <div className="text-slate-400 text-[10px]">Working zone. 2 solid reps left.</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="font-bold text-sky-400 font-mono">RPE 7 (3+ RIR)</div>
                        <div className="text-slate-400 text-[10px]">Warmup / Aerobic pace.</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Table Column Headers (only for standard straight or standard timed cardio sets) */}
                {(!currentExercise.format || currentExercise.format === 'straight') && (
                  currentExercise.isTimed ? (
                    <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 items-center">
                      <div className="col-span-1 text-center font-mono">Set</div>
                      <div className="col-span-2 hidden sm:block">Previous</div>
                      <div className="col-span-3 sm:col-span-3 text-center">Distance (mi)</div>
                      <div className="col-span-4 sm:col-span-3 text-center">Time / Stopwatch</div>
                      <div className="col-span-2 sm:col-span-2 text-center text-blue-400 font-mono">RPE</div>
                      <div className="col-span-2 sm:col-span-1 text-center">Done</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 items-center">
                      <div className="col-span-1 text-center font-mono">Set</div>
                      <div className="col-span-2 hidden sm:block">Previous</div>
                      <div className="col-span-4 sm:col-span-3 text-center">Weight (lbs)</div>
                      <div className="col-span-2 sm:col-span-2 text-center">Reps</div>
                      <div className="col-span-3 sm:col-span-2 text-center text-blue-400 font-mono">RPE</div>
                      <div className="col-span-2 sm:col-span-2 text-center">Done</div>
                    </div>
                  )
                )}

                {/* Sets / Rounds List */}
                <div className="space-y-2">
                  {currentExercise.sets.map((set, setIdx) => {
                    const isStopwatchActive = activeSetStopwatch?.exerciseIdx === activeExerciseIndex && activeSetStopwatch?.setIdx === setIdx;

                    // 1. SUPERSET ROUND CARD
                    if (currentExercise.format === 'superset') {
                      const subEntries = set.supersetEntries || [];
                      return (
                        <div
                          key={set.id}
                          className={`p-3 rounded-xl border transition-all space-y-2.5 ${
                            set.completed
                              ? 'bg-emerald-950/20 border-emerald-500/40'
                              : 'bg-[#070c14] border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800/80">
                            <span className="text-xs font-mono font-black text-indigo-300 uppercase tracking-wider">
                              Superset Set {set.setNumber}
                            </span>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                                <span>Round RPE</span>
                                <input
                                  type="number"
                                  step="0.5"
                                  min="1"
                                  max="10"
                                  placeholder="8"
                                  value={set.rpe !== undefined ? set.rpe : ''}
                                  onChange={(e) => {
                                    const raw = e.target.value;
                                    handleUpdateSet(activeExerciseIndex, setIdx, 'rpe', raw === '' ? undefined : parseFloat(raw));
                                  }}
                                  className="w-12 text-center font-mono font-bold text-xs bg-[#0d1424] border border-slate-700/80 rounded-lg py-1 text-white focus:outline-none focus:border-indigo-500"
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => handleToggleCompleteSet(activeExerciseIndex, setIdx)}
                                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                                  set.completed
                                    ? 'bg-emerald-500 text-slate-950 font-black shadow'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                }`}
                                title={set.completed ? 'Mark round incomplete' : 'Complete superset round & start rest'}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>{set.completed ? 'Logged' : 'Done'}</span>
                              </button>
                              {currentExercise.sets.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSet(activeExerciseIndex, setIdx)}
                                  className="p-1 text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                                  title="Delete superset round"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            {subEntries.map((entry, entryIdx) => (
                              <div
                                key={`${set.id}-sub-${entryIdx}`}
                                className="grid grid-cols-12 gap-2 items-center bg-[#0b121e]/80 border border-slate-800/80 rounded-lg px-2.5 py-2"
                              >
                                <div className="col-span-12 sm:col-span-5 flex items-center gap-2 min-w-0">
                                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold shrink-0">
                                    A{entryIdx + 1}
                                  </span>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-white truncate">{entry.name}</div>
                                    <div className="text-[10px] font-mono text-slate-400">
                                      Target: {entry.targetReps}
                                      {entry.prevWeightLbs !== undefined
                                        ? ` · Prev ${entry.prevWeightLbs}×${entry.prevReps || entry.reps}`
                                        : ''}
                                    </div>
                                  </div>
                                </div>

                                <div className="col-span-6 sm:col-span-4 flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono text-slate-500">LBS</span>
                                  <input
                                    type="number"
                                    step="2.5"
                                    value={entry.weightLbs || ''}
                                    onChange={(e) =>
                                      handleUpdateSupersetEntry(
                                        activeExerciseIndex,
                                        setIdx,
                                        entryIdx,
                                        'weightLbs',
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    placeholder="0"
                                    className="w-full text-center font-mono font-bold text-xs sm:text-sm bg-[#070c14] border border-slate-700/80 rounded-lg py-1.5 text-white focus:outline-none focus:border-indigo-500"
                                  />
                                </div>

                                <div className="col-span-6 sm:col-span-3 flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono text-slate-500">REPS</span>
                                  <input
                                    type="number"
                                    value={entry.reps || ''}
                                    onChange={(e) =>
                                      handleUpdateSupersetEntry(
                                        activeExerciseIndex,
                                        setIdx,
                                        entryIdx,
                                        'reps',
                                        parseInt(e.target.value, 10) || 0
                                      )
                                    }
                                    placeholder="10"
                                    className="w-full text-center font-mono font-bold text-xs sm:text-sm bg-[#070c14] border border-slate-700/80 rounded-lg py-1.5 text-white focus:outline-none focus:border-indigo-500"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // 2. AMRAP SCOREBOARD ROW
                    if (currentExercise.format === 'amrap') {
                      return (
                        <div
                          key={set.id}
                          className={`p-3.5 rounded-xl border transition-all space-y-3 ${
                            set.completed
                              ? 'bg-emerald-950/20 border-emerald-500/40'
                              : 'bg-[#070c14] border-slate-800'
                          }`}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                                Rounds Completed
                              </label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  value={set.amrapRoundsCompleted ?? 0}
                                  onChange={(e) =>
                                    handleUpdateSet(
                                      activeExerciseIndex,
                                      setIdx,
                                      'amrapRoundsCompleted',
                                      parseInt(e.target.value, 10) || 0
                                    )
                                  }
                                  className="w-full text-center font-mono font-black text-base bg-[#0d1424] border border-slate-700 rounded-lg py-2 text-white focus:outline-none focus:border-red-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateSet(
                                      activeExerciseIndex,
                                      setIdx,
                                      'amrapRoundsCompleted',
                                      (set.amrapRoundsCompleted || 0) + 1
                                    );
                                    soundManager.playSetLogged();
                                    haptics.tap();
                                  }}
                                  className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-lg shrink-0 cursor-pointer"
                                >
                                  +1 Rnd
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                                Extra Reps (Partial Round)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={set.amrapExtraReps ?? 0}
                                onChange={(e) =>
                                  handleUpdateSet(
                                    activeExerciseIndex,
                                    setIdx,
                                    'amrapExtraReps',
                                    parseInt(e.target.value, 10) || 0
                                  )
                                }
                                className="w-full text-center font-mono font-black text-base bg-[#0d1424] border border-slate-700 rounded-lg py-2 text-white focus:outline-none focus:border-red-500"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                                  Session RPE
                                </label>
                                <input
                                  type="number"
                                  step="0.5"
                                  min="1"
                                  max="10"
                                  value={set.rpe !== undefined ? set.rpe : ''}
                                  onChange={(e) => {
                                    const raw = e.target.value;
                                    handleUpdateSet(activeExerciseIndex, setIdx, 'rpe', raw === '' ? undefined : parseFloat(raw));
                                  }}
                                  className="w-full text-center font-mono font-bold text-sm bg-[#0d1424] border border-slate-700 rounded-lg py-2 text-white focus:outline-none focus:border-blue-500"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggleCompleteSet(activeExerciseIndex, setIdx)}
                                className={`mt-5 px-4 py-2 rounded-lg flex items-center gap-1.5 font-bold text-xs cursor-pointer ${
                                  set.completed
                                    ? 'bg-emerald-500 text-slate-950 font-black'
                                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                                }`}
                              >
                                <Check className="w-4 h-4 stroke-[2.5]" />
                                <span>{set.completed ? 'Logged' : 'Finish'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // 3. EMOM OR CIRCUIT ROUND ROW
                    if (currentExercise.format === 'emom' || currentExercise.format === 'circuit') {
                      const isEmom = currentExercise.format === 'emom';
                      return (
                        <div
                          key={set.id}
                          className={`grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl border transition-all ${
                            set.completed
                              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                              : 'bg-[#070c14] border-slate-800 hover:border-slate-700 text-slate-200'
                          }`}
                        >
                          <div className="col-span-3 sm:col-span-2 font-mono font-bold text-xs text-slate-300">
                            {isEmom ? `Min ${set.setNumber}` : `Round ${set.setNumber}`}
                          </div>
                          <div className="col-span-4 sm:col-span-5 text-xs font-mono text-slate-400 truncate">
                            {isEmom
                              ? `${currentExercise.emomIntervalSeconds || 60}s Interval Work`
                              : set.timeFormatted || 'Complete All Stations'}
                          </div>
                          <div className="col-span-3 sm:col-span-3 flex items-center justify-center gap-1">
                            <span className="text-[10px] font-mono text-slate-500">RPE</span>
                            <input
                              type="number"
                              step="0.5"
                              min="1"
                              max="10"
                              value={set.rpe !== undefined ? set.rpe : ''}
                              onChange={(e) => {
                                const raw = e.target.value;
                                handleUpdateSet(activeExerciseIndex, setIdx, 'rpe', raw === '' ? undefined : parseFloat(raw));
                              }}
                              className="w-12 text-center font-mono font-bold text-xs bg-[#0d1424] border border-slate-700/80 rounded-lg py-1 text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="col-span-2 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => handleToggleCompleteSet(activeExerciseIndex, setIdx)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all cursor-pointer ${
                                set.completed
                                  ? 'bg-emerald-500 text-slate-950 font-black shadow'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700'
                              }`}
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    if (currentExercise.isTimed) {
                      // STANDARD TIMED / CARDIO SET ROW
                      return (
                        <div
                          key={set.id}
                          className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
                            set.completed
                              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                              : 'bg-[#070c14] border-slate-800 hover:border-slate-700 text-slate-200'
                          }`}
                        >
                          <div className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-1 text-center font-bold font-mono text-sm text-slate-400">
                              {set.setNumber}
                            </div>

                            <div className="col-span-2 hidden sm:block text-xs text-slate-400 truncate font-mono">
                              {set.prevTimeFormatted ? (
                                <span>
                                  {set.prevTimeFormatted}
                                  {set.prevDistanceMiles ? ` · ${set.prevDistanceMiles}mi` : ''}
                                </span>
                              ) : (
                                <span className="text-slate-600">—</span>
                              )}
                            </div>

                            <div className="col-span-3 sm:col-span-3 flex items-center justify-center">
                              <input
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                value={set.distanceMiles !== undefined ? set.distanceMiles : ''}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  handleUpdateSet(activeExerciseIndex, setIdx, 'distanceMiles', val);
                                }}
                                className="w-full max-w-[4.8rem] text-center font-mono font-bold text-xs sm:text-sm bg-[#0d1424] border border-slate-700/80 rounded-lg py-1.5 text-white focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            <div className="col-span-4 sm:col-span-3 flex items-center justify-center gap-1.5">
                              <input
                                type="text"
                                placeholder="00:00"
                                value={
                                  isStopwatchActive
                                    ? formatElapsed(activeSetStopwatch.seconds)
                                    : set.timeFormatted || ''
                                }
                                onChange={(e) =>
                                  handleUpdateSet(activeExerciseIndex, setIdx, 'timeFormatted', e.target.value)
                                }
                                className={`w-full max-w-[5rem] text-center font-mono font-bold text-xs sm:text-sm border rounded-lg py-1.5 text-white focus:outline-none focus:border-blue-500 ${
                                  isStopwatchActive
                                    ? 'bg-blue-950/70 border-blue-500 text-blue-300'
                                    : 'bg-[#0d1424] border-slate-700/80'
                                }`}
                              />

                              <button
                                type="button"
                                onClick={() => handleToggleSetStopwatch(activeExerciseIndex, setIdx)}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                  isStopwatchActive
                                    ? 'bg-blue-600 text-white font-black border-blue-500'
                                    : 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
                                }`}
                                title={isStopwatchActive ? 'Stop stopwatch' : 'Start live set stopwatch'}
                              >
                                {isStopwatchActive ? (
                                  <Pause className="w-3.5 h-3.5" />
                                ) : (
                                  <Play className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>

                            <div className="col-span-2 sm:col-span-2 flex items-center justify-center">
                              <input
                                type="number"
                                step="0.5"
                                min="1"
                                max="10"
                                placeholder="8"
                                value={set.rpe !== undefined ? set.rpe : ''}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  handleUpdateSet(activeExerciseIndex, setIdx, 'rpe', raw === '' ? undefined : parseFloat(raw));
                                }}
                                className="w-full max-w-[3.4rem] text-center font-mono font-bold text-xs bg-[#0d1424] border border-slate-700/80 rounded-lg py-1.5 text-white focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleToggleCompleteSet(activeExerciseIndex, setIdx)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all cursor-pointer ${
                                  set.completed
                                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-950/40'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700'
                                }`}
                                title={set.completed ? 'Mark incomplete' : 'Log set & start rest'}
                              >
                                <Check className="w-4 h-4 stroke-[2.5]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // STANDARD STRENGTH EXERCISE SET ROW
                    return (
                      <div
                        key={set.id}
                        className={`grid grid-cols-12 gap-2 items-center p-2 sm:p-2.5 rounded-xl border transition-all ${
                          set.completed
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                            : 'bg-[#070c14] border-slate-800 hover:border-slate-700 text-slate-200'
                        }`}
                      >
                        <div className="col-span-1 text-center font-bold font-mono text-sm text-slate-400">
                          {set.setNumber}
                        </div>

                        <div className="col-span-2 hidden sm:block text-xs text-slate-400 truncate font-mono">
                          {set.prevWeightLbs ? (
                            <span>
                              {set.prevWeightLbs} <span className="text-[10px] text-slate-500">lbs</span> × {set.prevReps}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </div>

                        <div className="col-span-4 sm:col-span-3 flex flex-col items-center justify-center">
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
                            className="w-full max-w-[5.2rem] text-center font-mono font-bold text-xs sm:text-sm bg-[#0d1424] border border-slate-700/80 rounded-lg py-1.5 text-white focus:outline-none focus:border-blue-500"
                          />
                          {set.prevWeightLbs ? (
                            <span className="text-[9px] font-mono text-slate-500 sm:hidden truncate mt-0.5">
                              Prev: {set.prevWeightLbs}×{set.prevReps}
                            </span>
                          ) : null}
                        </div>

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
                            className="w-full max-w-[3.8rem] text-center font-mono font-bold text-xs sm:text-sm bg-[#0d1424] border border-slate-700/80 rounded-lg py-1.5 text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="col-span-3 sm:col-span-2 flex items-center justify-center">
                          <input
                            type="number"
                            step="0.5"
                            min="1"
                            max="10"
                            placeholder="8"
                            value={set.rpe !== undefined ? set.rpe : ''}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const val = raw === '' ? undefined : parseFloat(raw);
                              handleUpdateSet(activeExerciseIndex, setIdx, 'rpe', val);
                            }}
                            className="w-full max-w-[3.6rem] text-center font-mono font-bold text-xs sm:text-sm rounded-lg py-1.5 bg-[#0d1424] border border-slate-700/80 text-white focus:outline-none focus:border-blue-500"
                            title="Rate of Perceived Exertion (1 to 10 scale)"
                          />
                        </div>

                        <div className="col-span-2 sm:col-span-2 flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleCompleteSet(activeExerciseIndex, setIdx)}
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-bold transition-all cursor-pointer ${
                              set.completed
                                ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-950/40'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700'
                            }`}
                            title={set.completed ? 'Mark incomplete' : 'Log set & start rest timer'}
                          >
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                          </button>

                          {currentExercise.sets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSet(activeExerciseIndex, setIdx)}
                              className="p-1 text-slate-600 hover:text-red-400 transition-colors hidden sm:block cursor-pointer"
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

                {/* Set Actions & Peak 1RM Summary */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2.5 border-t border-slate-800/80">
                  {currentExercise.format !== 'amrap' ? (
                    <button
                      type="button"
                      onClick={() => handleAddSet(activeExerciseIndex)}
                      className="w-full sm:w-auto px-3.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 border border-slate-700/70 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-400" />
                      <span>{currentExercise.format === 'superset' || currentExercise.format === 'circuit' ? 'Add Round' : 'Add Set'}</span>
                    </button>
                  ) : (
                    <div className="text-[11px] font-mono text-slate-400">
                      Log rounds + extra reps at time cap.
                    </div>
                  )}

                  {/* Calculated 1RM / Volume and Avg RPE */}
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

                    const supersetPeak1RM =
                      currentExercise.format === 'superset'
                        ? Math.max(
                            0,
                            ...currentExercise.sets.flatMap((s) =>
                              (s.supersetEntries || []).map((entry) => calculate1RM(entry.weightLbs, entry.reps))
                            )
                          )
                        : 0;

                    return (
                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2.5 font-mono">
                        {currentExercise.format === 'superset' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500">Peak 1RM (SS):</span>
                            <span className="font-bold text-indigo-400">{supersetPeak1RM} lbs</span>
                          </div>
                        ) : (
                          !currentExercise.isTimed && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500">Peak 1RM:</span>
                              <span className="font-bold text-blue-400">
                                {Math.max(
                                  0,
                                  ...currentExercise.sets.map((s) => calculate1RM(s.weightLbs, s.reps))
                                )}{' '}
                                lbs
                              </span>
                            </div>
                          )
                        )}
                        {currentExAvgRpe && (
                          <div className="flex items-center gap-1.5">
                            {(!currentExercise.isTimed || currentExercise.format === 'superset') && <span className="text-slate-700">·</span>}
                            <span className="text-slate-500">Avg RPE:</span>
                            <span className="font-bold text-blue-400">
                              {currentExAvgRpe}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Clean Bottom Navigation Bar between Exercises */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  disabled={activeExerciseIndex === 0}
                  onClick={() => setActiveExerciseIndex((prev) => Math.max(0, prev - 1))}
                  className="px-3.5 sm:px-4 py-2 bg-slate-800/80 disabled:opacity-30 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="text-xs font-mono text-slate-400">
                  Exercise {activeExerciseIndex + 1} of {exercises.length}
                </div>

                {activeExerciseIndex < exercises.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveExerciseIndex((prev) => Math.min(exercises.length - 1, prev + 1))}
                    className="px-4 sm:px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-950/40 transition-all cursor-pointer font-athletic uppercase tracking-wider"
                  >
                    <span>Next Exercise</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsFinishing(true)}
                    className="px-4 sm:px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/30 cursor-pointer uppercase tracking-wider font-athletic"
                  >
                    <span>Review & Complete</span>
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
          <div className="w-full max-w-lg bg-[#0f172a] border border-blue-500/40 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsFinishing(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-1 mx-auto mb-3 flex items-center justify-center shadow-lg shadow-blue-900/40 border border-blue-400/40">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white font-athletic uppercase tracking-wider">
                Workout Summary & Log
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Patrol Ready Performance • Officer Training Record
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
                  <div className="p-3 bg-[#070c14] rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Duration
                    </span>
                    <span className="font-mono text-lg sm:text-xl font-black text-blue-400">
                      {formatElapsed(elapsedSeconds)}
                    </span>
                  </div>

                  <div className="p-3 bg-[#070c14] rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Total Volume
                    </span>
                    <span className="font-mono text-lg sm:text-xl font-black text-blue-400">
                      {totalVolumeLbs.toLocaleString()} <span className="text-[10px] font-normal">lbs</span>
                    </span>
                  </div>

                  <div className="p-3 bg-[#070c14] rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Sets Logged
                    </span>
                    <span className="font-mono text-lg sm:text-xl font-black text-emerald-400">
                      {totalSetsCompleted}
                    </span>
                  </div>

                  <div className="p-3 bg-[#070c14] rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Avg Session RPE
                    </span>
                    <span className="font-mono text-lg sm:text-xl font-black text-blue-400">
                      {avgRpeVal ? `${avgRpeVal}/10` : '—'}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Coach Rating & Notes */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
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
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Officer Session Notes & Cues:
                </label>
                <textarea
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  placeholder="e.g. Explosive speed on bench press; combat chassis felt stable. Rest timer kept pacing sharp."
                  rows={2}
                  className="w-full bg-[#070c14] border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex gap-2">
              <button
                type="button"
                onClick={() => setIsFinishing(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
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
          <div className="w-full max-w-md bg-[#0f172a] border-2 border-red-900/80 rounded-2xl p-6 shadow-2xl relative text-center">
            <button
              type="button"
              onClick={() => setShowExitModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
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

            <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
              You currently have <span className="font-bold text-blue-400">{totalSetsCompleted}</span> of{' '}
              <span className="font-bold text-white">{totalPlannedSets}</span> sets logged{' '}
              (<span className="font-mono text-slate-200">{formatElapsed(elapsedSeconds)}</span> elapsed,{' '}
              <span className="font-bold text-blue-400">{totalVolumeLbs.toLocaleString()} lbs</span> total volume).
            </p>

            <p className="text-[11px] text-slate-400 mt-1.5">
              Would you like to save your completed sets to your training record before exiting, discard this session, or keep lifting?
            </p>

            <div className="flex flex-col gap-2.5 mt-6">
              <button
                type="button"
                onClick={handleExitWorkoutWithSave}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
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
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
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
