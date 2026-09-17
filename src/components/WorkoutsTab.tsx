import React, { useState, useMemo, useEffect } from 'react';
import { 
  Play, Pause, X, Dumbbell, Clock, Flame, 
  Sparkles, ShieldCheck, Zap, ChevronDown, 
  ChevronUp, Timer, TrendingUp, Calendar, 
  ChevronLeft, ChevronRight, CheckCircle2,
  SlidersHorizontal, ArrowRight, Activity, Award, RotateCcw
} from 'lucide-react';
import { WorkoutProgram, ExerciseTemplate, MuscleGroup } from '../types';
import { PROTOCOL_DATA, COACH_RULES, ProtocolDay, getDefaultRestPeriod, parseExerciseString, getApexWeekData } from '../data/protocolData';
import { soundManager } from '../utils/audio';

// Custom Running Shoe SVG icon
const ShoeIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M4 16v-2.38C4 11.5 5.97 10 8 10h12.5c1.1 0 2 .9 2 2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/>
    <path d="M20 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2"/>
    <path d="M8 10V7c0-1.66-1.34-3-3-3s-3 1.34-3 3v6"/>
  </svg>
);

interface WorkoutsTabProps {
  programs?: WorkoutProgram[];
  onStartWorkout: (program: WorkoutProgram) => void;
  onSelectWarmup: (warmupId: string) => void;
  onSavePrograms?: (programs: WorkoutProgram[]) => void;
}

export const WorkoutsTab: React.FC<WorkoutsTabProps> = ({
  onStartWorkout,
  onSelectWarmup,
}) => {
  // Primary program selector: 'apex_protocol' (26-week tactical blueprint) vs 'hybrid_protocol' (condensed 3 phases) vs 'hybrid_db' (dumbbell & calisthenics)
  const [selectedProgram, setSelectedProgram] = useState<'apex_protocol' | 'hybrid_protocol' | 'hybrid_db'>('apex_protocol');
  
  // Active phase inside The Apex Protocol (5 Mesocycles)
  const [activeApexPhaseKey, setActiveApexPhaseKey] = useState<
    'apex_phase1' | 'apex_phase2' | 'apex_phase3' | 'apex_phase4' | 'apex_phase5'
  >('apex_phase1');

  // Active week inside The Apex Protocol (Weeks 1 to 26)
  const [activeApexWeek, setActiveApexWeek] = useState<number>(1);

  // Active phase inside Hybrid Protocol (condenses Phase 1, Phase 2, Phase 3 into 1 tab)
  const [activeProtocolPhaseKey, setActiveProtocolPhaseKey] = useState<'phase1' | 'phase2' | 'phase3'>('phase1');

  // Active phase inside Hybrid DB & Bodyweight (condenses Phase 1, Phase 2, Phase 3 into 1 tab)
  const [activeDbPhaseKey, setActiveDbPhaseKey] = useState<'db_phase1' | 'db_phase2' | 'db_phase3'>('db_phase1');
  
  const [showCoachNotes, setShowCoachNotes] = useState<boolean>(false);
  const [dayViewMode, setDayViewMode] = useState<number | 'all'>('all');

  // Inline exercise countdown timer state (replaces the floating bottom timer)
  const [activeExerciseTimer, setActiveExerciseTimer] = useState<{
    exerciseName: string;
    secondsRemaining: number;
    totalSeconds: number;
    isRunning: boolean;
  } | null>(null);

  // User-customizable rest periods per exercise (persisted in localStorage)
  const [exerciseRestTimes, setExerciseRestTimes] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('rpa_exercise_rest_times');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Countdown ticker for active exercise timer
  useEffect(() => {
    if (!activeExerciseTimer || !activeExerciseTimer.isRunning) return;

    const interval = window.setInterval(() => {
      setActiveExerciseTimer((prev) => {
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
  }, [activeExerciseTimer?.isRunning]);

  // Current active phase data based on selected program
  const currentPhase = useMemo(() => {
    if (selectedProgram === 'apex_protocol') {
      return getApexWeekData(activeApexWeek);
    }
    if (selectedProgram === 'hybrid_db') {
      return PROTOCOL_DATA[activeDbPhaseKey] || PROTOCOL_DATA.db_phase1 || PROTOCOL_DATA.hybrid_db;
    }
    return PROTOCOL_DATA[activeProtocolPhaseKey] || PROTOCOL_DATA.phase1;
  }, [selectedProgram, activeApexWeek, activeDbPhaseKey, activeProtocolPhaseKey]);

  // Determine current day of week to highlight in schedule
  const todayDayName = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  }, []);

  const getExerciseRest = (exerciseString: string): number => {
    const cleanStr = exerciseString.replace(/\[.*?\]/g, '').trim();
    if (exerciseRestTimes[cleanStr]) {
      return exerciseRestTimes[cleanStr];
    }
    if (exerciseRestTimes[exerciseString]) {
      return exerciseRestTimes[exerciseString];
    }
    const bracketMatch = exerciseString.match(/\[.*?rest:\s*(\d+)s?.*?\]/i);
    if (bracketMatch) {
      const parsed = parseInt(bracketMatch[1], 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return getDefaultRestPeriod(cleanStr);
  };

  const handleUpdateExerciseRest = (exerciseString: string, seconds: number) => {
    const cleanStr = exerciseString.replace(/\[.*?\]/g, '').trim();
    const validSecs = Math.max(15, seconds);
    const updated = {
      ...exerciseRestTimes,
      [cleanStr]: validSecs,
    };
    setExerciseRestTimes(updated);
    localStorage.setItem('rpa_exercise_rest_times', JSON.stringify(updated));

    // If currently timing this exercise, adjust remaining proportionally
    if (activeExerciseTimer && activeExerciseTimer.exerciseName === cleanStr) {
      const diff = validSecs - activeExerciseTimer.totalSeconds;
      const newRemaining = Math.max(0, activeExerciseTimer.secondsRemaining + diff);
      setActiveExerciseTimer({
        ...activeExerciseTimer,
        totalSeconds: validSecs,
        secondsRemaining: newRemaining,
      });
    }
  };

  const handleToggleExerciseTimer = (exerciseString: string, defaultSecs?: number) => {
    const cleanStr = exerciseString.replace(/\[.*?\]/g, '').trim();
    const targetSecs = defaultSecs ?? getExerciseRest(cleanStr);

    if (activeExerciseTimer && activeExerciseTimer.exerciseName === cleanStr) {
      if (activeExerciseTimer.secondsRemaining === 0) {
        // Restart timer
        setActiveExerciseTimer({
          exerciseName: cleanStr,
          secondsRemaining: targetSecs,
          totalSeconds: targetSecs,
          isRunning: true,
        });
        soundManager.playCountdownBeep(true);
      } else {
        // Pause or Resume
        setActiveExerciseTimer({
          ...activeExerciseTimer,
          isRunning: !activeExerciseTimer.isRunning,
        });
      }
    } else {
      // Start countdown on this exercise
      setActiveExerciseTimer({
        exerciseName: cleanStr,
        secondsRemaining: targetSecs,
        totalSeconds: targetSecs,
        isRunning: true,
      });
      soundManager.playCountdownBeep(true);
    }
  };

  const handleCancelExerciseTimer = () => {
    setActiveExerciseTimer(null);
  };

  const handleAdjustActiveTimerRemaining = (secondsDelta: number) => {
    if (!activeExerciseTimer) return;
    const newRemaining = Math.max(5, activeExerciseTimer.secondsRemaining + secondsDelta);
    setActiveExerciseTimer({
      ...activeExerciseTimer,
      secondsRemaining: newRemaining,
    });
  };

  // Helper to determine if a strength entry is a real exercise or a rest/recovery note
  const isRealStrengthExercise = (str: string): boolean => {
    if (!str) return false;
    const clean = str.replace(/\[.*?\]/g, '').trim().toLowerCase();
    if (!clean) return false;
    if (
      clean === 'rest' ||
      clean.startsWith('rest ') ||
      clean.startsWith('rest/') ||
      clean.startsWith('rest /') ||
      clean.startsWith('rest -') ||
      clean.startsWith('rest:') ||
      clean === 'complete rest' ||
      clean.includes('complete rest') ||
      clean.includes('nutrition replenishment') ||
      clean.includes('meal prep') ||
      clean.includes('sleep quality') ||
      clean === 'none' ||
      clean === 'n/a'
    ) {
      return false;
    }
    return true;
  };

  // Helper to determine if a run/conditioning entry is real conditioning or rest
  const isRealConditioningRun = (runStr?: string): boolean => {
    if (!runStr) return false;
    const clean = runStr.replace(/\[.*?\]/g, '').trim().toLowerCase();
    if (
      clean === 'rest' ||
      clean.startsWith('rest ') ||
      clean.startsWith('rest/') ||
      clean.startsWith('rest /') ||
      clean.startsWith('rest -') ||
      clean.startsWith('rest:') ||
      clean.includes('complete rest') ||
      clean.includes('rest from running') ||
      clean.includes('cns recovery') ||
      clean === 'none' ||
      clean === 'n/a'
    ) {
      return false;
    }
    return true;
  };

  // Helper to determine if a day is purely a rest day
  const isProtocolRestDay = (day: ProtocolDay): boolean => {
    const focusLower = day.focus.toLowerCase();
    if (
      focusLower.includes('complete rest') ||
      focusLower === 'rest' ||
      focusLower.startsWith('rest /') ||
      focusLower.startsWith('rest -')
    ) {
      return true;
    }
    const hasRealStrength = day.strength.some(isRealStrengthExercise);
    const hasRealRun = isRealConditioningRun(day.run);
    return !hasRealStrength && !hasRealRun;
  };

  // Helper to convert a ProtocolDay into a live WorkoutProgram for the tracker
  const convertDayToProgram = (day: ProtocolDay): WorkoutProgram => {
    const exercises: ExerciseTemplate[] = day.strength
      .filter(isRealStrengthExercise)
      .map((str, idx) => {
        const parsed = parseExerciseString(str);
        const name = parsed.name;
        const defaultSets = parsed.defaultSets;
        const targetReps = parsed.targetReps;

        // Determine muscle group
        let muscleGroup: MuscleGroup = 'Full Body';
        const lowerName = name.toLowerCase();
        if (lowerName.includes('squat') || lowerName.includes('lunge') || lowerName.includes('quad') || lowerName.includes('split squat')) {
          muscleGroup = 'Quads';
        } else if (lowerName.includes('deadlift') || lowerName.includes('rdl') || lowerName.includes('hip thrust') || lowerName.includes('hamstring') || lowerName.includes('swing')) {
          muscleGroup = 'Hamstrings & Glutes';
        } else if (lowerName.includes('bench') || lowerName.includes('floor press') || lowerName.includes('push-up') || lowerName.includes('pushup') || lowerName.includes('chest') || lowerName.includes('dip')) {
          muscleGroup = 'Chest';
        } else if (lowerName.includes('row') || lowerName.includes('pull-up') || lowerName.includes('pullup') || lowerName.includes('lat') || lowerName.includes('chin')) {
          muscleGroup = 'Back';
        } else if (lowerName.includes('overhead press') || lowerName.includes('ohp') || lowerName.includes('push press') || lowerName.includes('press') || lowerName.includes('shoulder') || lowerName.includes('delt')) {
          muscleGroup = 'Shoulders';
        } else if (lowerName.includes('plank') || lowerName.includes('pallof') || lowerName.includes('twist') || lowerName.includes('woodchopper') || lowerName.includes('raise') || lowerName.includes('core') || lowerName.includes('ab wheel')) {
          muscleGroup = 'Core';
        }

        // Auto-Overload rules for all 3 programs (Apex Protocol, Hybrid Protocol, Hybrid DB & Bodyweight)
        let progressionRuleObj = undefined;
        let defaultWeightLbs: number | undefined = undefined;

        // Strict OHP: 2.5 lbs weekly increment (Apex Protocol explicit)
        if (lowerName.includes('overhead press') || lowerName.includes('ohp')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 2.5,
            action: '+2.5 lbs next session',
          };
          defaultWeightLbs = 75;
        } else if (lowerName.includes('pull-up') || lowerName.includes('pullup')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 2.5,
            action: '+2.5 lbs on belt',
          };
          defaultWeightLbs = 0;
        } else if (lowerName.includes('squat') && !lowerName.includes('split')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 5,
            action: '+2.5 to 5 lbs next session',
          };
          defaultWeightLbs = 135;
        } else if (lowerName.includes('deadlift') || lowerName.includes('trap bar')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 10,
            action: '+5 to 10 lbs next session',
          };
          defaultWeightLbs = 185;
        } else if (lowerName.includes('rdl') || lowerName.includes('romanian')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 5,
            action: '+5 lbs next session',
          };
          defaultWeightLbs = 115;
        } else if (lowerName.includes('push press')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 5,
            action: '+5 lbs next session',
          };
          defaultWeightLbs = 95;
        } else if (lowerName.includes('floor press') || lowerName.includes('bench') || lowerName.includes('row')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 5,
            action: '+5 lbs next session',
          };
          defaultWeightLbs = 50;
        } else if (lowerName.includes('split squat') || lowerName.includes('lunge')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 5,
            action: '+5 lbs next session',
          };
          defaultWeightLbs = 30;
        } else if (lowerName.includes('carry') || lowerName.includes('farmer')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 5,
            action: '+5 lbs next session',
          };
          defaultWeightLbs = 50;
        } else if (lowerName.includes('swing')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 5,
            action: '+5 lbs next session',
          };
          defaultWeightLbs = 35;
        } else if (lowerName.includes('pallof')) {
          defaultWeightLbs = 20;
        } else if (lowerName.includes('push-up') || lowerName.includes('pushup')) {
          progressionRuleObj = {
            metric: 'reps' as const,
            trigger: 'every_session' as const,
            increment_value: 1,
            action: '+1 rep next session',
          };
          defaultWeightLbs = 0;
        } else if (lowerName.includes('plank')) {
          progressionRuleObj = {
            metric: 'seconds' as const,
            trigger: 'per_set' as const,
            increment_value: 15,
            action: '+15s hold',
          };
          defaultWeightLbs = 0;
        }

        const configuredRest = getExerciseRest(str);

        return {
          id: `proto-ex-${idx}-${Date.now()}`,
          name,
          muscleGroup,
          defaultSets,
          targetReps,
          targetRpe: 8.5,
          weight_lbs: defaultWeightLbs,
          restPeriodSeconds: configuredRest,
          progression_rules: progressionRuleObj,
          notes: parsed.notes
            ? parsed.notes
            : `RPA Protocol (${day.day} - ${day.focus}). Target Rest: ${configuredRest}s.`
        };
      });

    // If day has conditioning (run / ruck) and is not rest, append as trackable cardio
    if (isRealConditioningRun(day.run)) {
      const combined = `${day.run} ${day.pace} ${day.focus}`.toLowerCase();
      const isRuck = combined.includes('ruck');
      const isIntervals = combined.includes('interval') || combined.includes('track') || combined.includes('sprint') || combined.includes('repeats');

      // Pack weight for rucking
      let packWeight: number | undefined;
      const packMatch = combined.match(/(\d+(?:\.\d+)?)\s*(?:lbs?|pound)/);
      if (packMatch) {
        packWeight = parseFloat(packMatch[1]);
      } else if (isRuck) {
        packWeight = 30;
      }

      // Accurate distance extraction from day.run title and pace
      let distance: number | undefined;
      const rangeMatch = day.run.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*mile/i);
      if (rangeMatch) {
        distance = parseFloat(((parseFloat(rangeMatch[1]) + parseFloat(rangeMatch[2])) / 2).toFixed(1));
      } else {
        const singleMatch = day.run.match(/(\d+(?:\.\d+)?)\s*mile/i);
        if (singleMatch) {
          distance = parseFloat(singleMatch[1]);
        } else {
          const paceRangeMatch = day.pace.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*mile/i);
          if (paceRangeMatch) {
            distance = parseFloat(((parseFloat(paceRangeMatch[1]) + parseFloat(paceRangeMatch[2])) / 2).toFixed(1));
          } else {
            const paceSingleMatch = day.pace.match(/(\d+(?:\.\d+)?)\s*mile/i);
            if (paceSingleMatch) {
              distance = parseFloat(paceSingleMatch[1]);
            }
          }
        }
      }

      // Duration in minutes
      let durationMins: number | undefined;
      const minMatch = day.run.match(/(\d+(?:\.\d+)?)\s*(?:-\s*(\d+(?:\.\d+)?))?\s*min/i);
      if (minMatch) {
        if (minMatch[2]) {
          durationMins = Math.round((parseFloat(minMatch[1]) + parseFloat(minMatch[2])) / 2);
        } else {
          durationMins = Math.round(parseFloat(minMatch[1]));
        }
      } else {
        const paceMinMatch = day.pace.match(/(\d+(?:\.\d+)?)\s*(?:-\s*(\d+(?:\.\d+)?))?\s*min/i);
        if (paceMinMatch) {
          durationMins = Math.round(parseFloat(paceMinMatch[1]));
        }
      }

      // Sensible defaults if not specified
      if (!distance && !durationMins) {
        if (isRuck) {
          distance = 5.0;
          durationMins = 75;
        } else if (isIntervals) {
          distance = 2.5;
          durationMins = 25;
        } else {
          distance = 3.5;
          durationMins = 30;
        }
      } else if (!distance && durationMins) {
        distance = parseFloat((durationMins / 9.5).toFixed(1));
      } else if (distance && !durationMins) {
        durationMins = isRuck ? Math.round(distance * 15) : Math.round(distance * 9);
      }

      const targetText = durationMins 
        ? `${durationMins} mins${distance ? ` (${distance} mi target)` : ''}`
        : `${distance} miles`;

      exercises.push({
        id: `proto-cardio-${Date.now()}`,
        name: day.run.trim(),
        muscleGroup: 'Full Body',
        type: 'cardio',
        defaultSets: 1,
        targetReps: targetText,
        restPeriodSeconds: 0,
        distance_miles: distance,
        weight_lbs: packWeight,
        pace: day.pace,
        progression_rules: isRuck
          ? { metric: 'weight_lbs', trigger: 'pace_under_15_min', increment_value: 5, action: '+5 lbs pack load when pace < 15 min/mi' }
          : isIntervals
          ? { metric: 'seconds', trigger: 'pace_progression', increment_value: -2, action: 'drop 2-3s per interval repeat' }
          : { metric: 'distance_miles', trigger: 'per_week', increment_value: 0.5, action: '+0.5 mi weekly aerobic expansion' },
        notes: `${day.run} • Target Pace: ${day.pace}`
      });
    }

    const programTitle = selectedProgram === 'apex_protocol'
      ? `The Apex Protocol (${currentPhase.title.split(':')[0]} • ${day.day}: ${day.focus})`
      : selectedProgram === 'hybrid_protocol'
      ? `Hybrid Protocol (${currentPhase.title.split(':')[0]} • ${day.day}: ${day.focus})`
      : `Hybrid DB & Bodyweight (${currentPhase.title.split(':')[0]} • ${day.day}: ${day.focus})`;

    const recommendedWarmupId = selectedProgram === 'apex_protocol'
      ? 'warmup-apex-sop'
      : 'warmup-upper-primer';

    return {
      id: `session-${day.day.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      title: programTitle,
      subtitle: `${currentPhase.title} (${currentPhase.weeks})`,
      category: 'Hybrid',
      frequency: 'Scheduled',
      estimatedDurationMinutes: 60,
      recommendedWarmupId,
      description: `${currentPhase.title} - ${day.day}: ${day.focus}. Auto-Overload enabled session combining compound strength and aerobic capacity.`,
      exercises: exercises.length > 0 ? exercises : [
        {
          id: 'ex-default',
          name: 'Core & Mobility Circuit',
          muscleGroup: 'Core',
          defaultSets: 3,
          targetReps: '15-20',
          restPeriodSeconds: 60,
          notes: 'Active recovery and mobility maintenance.'
        }
      ],
    };
  };

  const handleLaunchDayLifts = (day: ProtocolDay) => {
    const program = convertDayToProgram(day);
    onStartWorkout(program);
  };

  // Mesocycle phase options for The Apex Protocol (26-Week Master)
  const apexMesocycles = [
    {
      id: 'apex_phase1' as const,
      label: 'Phase 1: Foundation & Base',
      weeks: 'Weeks 1-4',
      badge: 'Base & Hypertrophy',
      focus: 'Aerobic Base (Zone 2) & Structural Joint Prep',
      weekRange: [1, 2, 3, 4],
      defaultWeek: 1
    },
    {
      id: 'apex_phase2' as const,
      label: 'Phase 2: Build & Strength',
      weeks: 'Weeks 5-10',
      badge: 'Volume & Heavy Lifts',
      focus: 'Progressive Barbell Loading, 400m Repeats & 35 lb Ruck Mileage',
      weekRange: [5, 6, 7, 8, 9, 10],
      defaultWeek: 5
    },
    {
      id: 'apex_phase3' as const,
      label: 'Phase 3: Intensify & Threshold',
      weeks: 'Weeks 11-16',
      badge: 'Threshold & Power',
      focus: 'Heavy Triple Progression, VO2 Max Intervals & 40 lb Ruck Load',
      weekRange: [11, 12, 13, 14, 15, 16],
      defaultWeek: 11
    },
    {
      id: 'apex_phase4' as const,
      label: 'Phase 4: Tactical Peak',
      weeks: 'Weeks 17-22',
      badge: 'Heavy Ruck & Speed Under Load',
      focus: 'Speed Under Load, 45 lb Heavy Ruck & Explosive Combat Chassis',
      weekRange: [17, 18, 19, 20, 21, 22],
      defaultWeek: 17
    },
    {
      id: 'apex_phase5' as const,
      label: "Phase 5: Tactical Peak & Taper",
      weeks: 'Weeks 23-26',
      badge: 'Tactical Peak Performance',
      focus: "Event-Specific Drills, Taper & Tactical Peak Performance",
      weekRange: [23, 24, 25, 26],
      defaultWeek: 23
    },
  ];

  // Mesocycle phase options for the condensed Hybrid Protocol tab
  const protocolMesocycles = [
    {
      id: 'phase1' as const,
      label: 'Phase 1: Foundation',
      weeks: 'Weeks 1-4',
      badge: 'Hypertrophy & Base',
      focus: 'Aerobic Base (Zone 2) & Foundational Hypertrophy'
    },
    {
      id: 'phase2' as const,
      label: 'Phase 2: Build & Intensify',
      weeks: 'Weeks 5-8',
      badge: 'Strength & Threshold',
      focus: 'Heavy Strength Loads & Threshold Expansions'
    },
    {
      id: 'phase3' as const,
      label: 'Phase 3: Peak Performance',
      weeks: 'Weeks 9-12',
      badge: 'Peak Power & Race Pace',
      focus: 'Max CNS Power Output & Race Pacing'
    },
  ];

  // Mesocycle phase options for the condensed Hybrid DB & Bodyweight tab
  const dbMesocycles = [
    {
      id: 'db_phase1' as const,
      label: 'Phase 1: DB Foundation',
      weeks: 'Weeks 1-4',
      badge: 'Hypertrophy & Work Capacity',
      focus: 'Push-Up Volume, DB Hypertrophy & Base Ruck (30 lbs)'
    },
    {
      id: 'db_phase2' as const,
      label: 'Phase 2: Strength Density',
      weeks: 'Weeks 5-8',
      badge: 'Heavy DB Loads & Threshold',
      focus: 'Weighted/Deficit Push-Ups, Tempo Running & 35 lb Ruck'
    },
    {
      id: 'db_phase3' as const,
      label: 'Phase 3: Tactical Peak',
      weeks: 'Weeks 9-12',
      badge: 'Max DB Power & Tactical Test',
      focus: 'Explosive Plyo Push-Ups, 40-45 lb Ruck & Peak Assessment'
    },
  ];

  const daysToShow = dayViewMode === 'all' 
    ? currentPhase.days 
    : [currentPhase.days[dayViewMode] || currentPhase.days[0]];

  return (
    <div className="space-y-6">
      {/* Sleek Coach & System Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-rose-600/20 text-rose-400 border border-rose-600/30 flex items-center gap-1">
              <Zap className="w-3 h-3 text-rose-500" />
              RPA Hybrid Architecture
            </span>
            <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Aryan Risner, ISSA-CPT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-athletic uppercase tracking-wide">
            {selectedProgram === 'apex_protocol' ? (
              <>The Apex <span className="text-emerald-400">Protocol</span> (26-Week Master)</>
            ) : selectedProgram === 'hybrid_protocol' ? (
              <>Hybrid <span className="text-rose-500">Protocol</span> (12-Week Master)</>
            ) : (
              <>Hybrid <span className="text-amber-500">Dumbbell & Bodyweight</span> (12-Week Master)</>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-2xl leading-relaxed">
            {selectedProgram === 'apex_protocol'
              ? "The definitive 26-week tactical conditioning blueprint authored by Coach Aryan 'AJ' Risner. Built to forge elite combat chassis durability, massive compound strength, high-velocity running, and load carriage mastery."
              : selectedProgram === 'hybrid_protocol'
              ? 'Concurrently periodized 12-week master protocol condensing all 3 phases (Foundation, Build, Peak) with automated progressive overload benchmarks.'
              : 'Concurrently periodized 12-week dumbbell compound power, chest-to-deck bodyweight volume, and aerobic ruck endurance with automated progressive overload rules.'}
          </p>
        </div>

        {/* Live Active Program Meta Chip */}
        <div className="shrink-0 bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-800 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Active Track</span>
            <span className="text-xs font-black text-white font-mono">
              {selectedProgram === 'apex_protocol'
                ? `The Apex Protocol (${currentPhase.weeks})`
                : selectedProgram === 'hybrid_protocol' 
                ? `Hybrid Protocol (${currentPhase.title.split(':')[0]})`
                : `DB & Bodyweight (${currentPhase.title.split(':')[0]})`}
            </span>
          </div>
        </div>
      </div>

      {/* PRIMARY PROGRAM SELECTOR: 3 Programs side-by-side */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-zinc-400 font-athletic flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-rose-500" />
            Select Training Program
          </span>
          <span className="text-xs font-mono text-zinc-400">
            {currentPhase.weeks}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Program 1: The Apex Protocol (26-Week Master) */}
          <button
            type="button"
            onClick={() => {
              setSelectedProgram('apex_protocol');
              setDayViewMode('all');
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              selectedProgram === 'apex_protocol'
                ? 'bg-emerald-500/10 border-emerald-500/70 shadow-lg shadow-emerald-500/10'
                : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                selectedProgram === 'apex_protocol'
                  ? 'bg-emerald-500 text-zinc-950 font-black'
                  : 'bg-zinc-800 text-zinc-400'
              }`}>
                Auto-Overload • {selectedProgram === 'apex_protocol' ? currentPhase.weeks : 'Weeks 1-26'}
              </span>
              <Sparkles className={`w-4 h-4 ${selectedProgram === 'apex_protocol' ? 'text-emerald-400' : 'text-zinc-600'}`} />
            </div>

            <div>
              <span className={`text-base font-black tracking-wide block font-athletic uppercase ${
                selectedProgram === 'apex_protocol' ? 'text-white' : 'text-zinc-300'
              }`}>
                The Apex Protocol (26-Week Master)
              </span>
              <span className="text-xs text-zinc-400 block mt-1 leading-snug">
                Elite tactical conditioning blueprint. Barbell compounds, strict linear overload, VO2 max intervals & 45 lb heavy rucks.
              </span>
            </div>

            {selectedProgram === 'apex_protocol' && (
              <div className="h-1 w-full mt-3 rounded-full bg-emerald-400" />
            )}
          </button>

          {/* Program 2: Hybrid Protocol (12-Week Master - Condenses all 3 phases into 1 tab) */}
          <button
            type="button"
            onClick={() => {
              setSelectedProgram('hybrid_protocol');
              setDayViewMode('all');
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              selectedProgram === 'hybrid_protocol'
                ? 'bg-rose-600/10 border-rose-500/70 shadow-lg shadow-rose-500/10'
                : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                selectedProgram === 'hybrid_protocol'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-zinc-800 text-zinc-400'
              }`}>
                Auto-Overload • {selectedProgram === 'hybrid_protocol' ? currentPhase.weeks : 'Weeks 1-12'}
              </span>
              <Sparkles className={`w-4 h-4 ${selectedProgram === 'hybrid_protocol' ? 'text-rose-400' : 'text-zinc-600'}`} />
            </div>

            <div>
              <span className={`text-base font-black tracking-wide block font-athletic uppercase ${
                selectedProgram === 'hybrid_protocol' ? 'text-white' : 'text-zinc-300'
              }`}>
                Hybrid Protocol (12-Week Master)
              </span>
              <span className="text-xs text-zinc-400 block mt-1 leading-snug">
                Barbell strength, speed intervals, tempo running & aerobic base. Condenses all 3 phases (Foundation, Build, Peak) in 1 unified tab.
              </span>
            </div>

            {selectedProgram === 'hybrid_protocol' && (
              <div className="h-1 w-full mt-3 rounded-full bg-rose-600" />
            )}
          </button>

          {/* Program 3: Hybrid DB & Bodyweight */}
          <button
            type="button"
            onClick={() => {
              setSelectedProgram('hybrid_db');
              setDayViewMode('all');
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              selectedProgram === 'hybrid_db'
                ? 'bg-amber-500/10 border-amber-500/70 shadow-lg shadow-amber-500/10'
                : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                selectedProgram === 'hybrid_db'
                  ? 'bg-amber-500 text-zinc-950 font-black'
                  : 'bg-zinc-800 text-zinc-400'
              }`}>
                Auto-Overload • {selectedProgram === 'hybrid_db' ? currentPhase.weeks : 'Weeks 1-12'}
              </span>
              <Sparkles className={`w-4 h-4 ${selectedProgram === 'hybrid_db' ? 'text-amber-400' : 'text-zinc-600'}`} />
            </div>

            <div>
              <span className={`text-base font-black tracking-wide block font-athletic uppercase ${
                selectedProgram === 'hybrid_db' ? 'text-white' : 'text-zinc-300'
              }`}>
                Hybrid Dumbbell & Bodyweight
              </span>
              <span className="text-xs text-zinc-400 block mt-1 leading-snug">
                Dumbbell power, high-volume push-ups, Zone 2 running & weighted rucking. Condenses all 3 phases in 1 unified tab.
              </span>
            </div>

            {selectedProgram === 'hybrid_db' && (
              <div className="h-1 w-full mt-3 rounded-full bg-amber-500" />
            )}
          </button>
        </div>
      </div>

      {/* AUTOMATED OVERLOAD BENCHMARKS STRIP */}
      {selectedProgram === 'apex_protocol' ? (
        /* The Apex Protocol Overload Benchmarks */
        <div className="bg-zinc-900/95 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs sm:text-sm font-black uppercase text-emerald-400 tracking-wider font-athletic">
                The Apex Protocol Auto-Overload Laws ({currentPhase.weeks})
              </h3>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">
              ISSACPT Tactical Standard: Strict linear increments & progressive volume
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3">
            <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Strict OHP & Pull-Ups</span>
              <span className="text-sm font-black text-emerald-400 font-mono">+2.5 lbs</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">Strict linear progression each week</span>
            </div>

            <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Squat & Trap Bar DL</span>
              <span className="text-sm font-black text-emerald-400 font-mono">+10 lbs / +5 lbs</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">+10 lbs if RPE ≤ 7.5; else +5 lbs</span>
            </div>

            <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Incline, Rows & Push Press</span>
              <span className="text-sm font-black text-emerald-400 font-mono">+5 lbs</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">Upon completing all target reps</span>
            </div>

            <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Aerobic Run & Ruck</span>
              <span className="text-sm font-black text-emerald-400 font-mono">+5 min / +2 min / +1 mi</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">Dynamic weekly prescription</span>
            </div>
          </div>
        </div>
      ) : selectedProgram === 'hybrid_protocol' ? (
        /* Hybrid Protocol Overload Benchmarks */
        <div className="bg-zinc-900/95 border border-rose-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs sm:text-sm font-black uppercase text-rose-400 tracking-wider font-athletic">
                Hybrid Protocol Auto-Overload Benchmarks
              </h3>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">
              Apply triggers directly upon completing top rep targets
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3">
            <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Squat & Deadlift</span>
              <span className="text-sm font-black text-rose-400 font-mono">+10 lbs</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">Upon hitting top rep ceiling</span>
            </div>

            <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Bench, OHP & Rows</span>
              <span className="text-sm font-black text-rose-400 font-mono">+5 lbs</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">Upon hitting target reps</span>
            </div>

            <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Weighted Pull-Ups</span>
              <span className="text-sm font-black text-rose-400 font-mono">+2.5 - 5 lbs</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">Upon completing 6-8 reps</span>
            </div>

            <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Zone 2 Aerobic Base</span>
              <span className="text-sm font-black text-rose-400 font-mono">+0.5 - 1.0 mi/wk</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">Continuous base expansion</span>
            </div>
          </div>
        </div>
      ) : (
        /* Hybrid DB & Bodyweight Overload Benchmarks */
        <div className="bg-zinc-900/95 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs sm:text-sm font-black uppercase text-amber-400 tracking-wider font-athletic">
                Hybrid DB & Bodyweight Auto-Overload ({currentPhase.weeks})
              </h3>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">
              Apply triggers directly upon session completion
            </span>
          </div>

          {activeDbPhaseKey === 'db_phase1' ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3">
              <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">DB Floor Press</span>
                <span className="text-sm font-black text-amber-400 font-mono">+5 lbs</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Upon 3 sets × 12 reps</span>
              </div>

              <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Push-ups</span>
                <span className="text-sm font-black text-amber-400 font-mono">+1 rep</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Every workout session</span>
              </div>

              <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Zone 2 Run</span>
                <span className="text-sm font-black text-amber-400 font-mono">+0.5 mi / wk</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Conversational base pace</span>
              </div>

              <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Ruck March (30 lbs)</span>
                <span className="text-sm font-black text-amber-400 font-mono">+5 lbs pack</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">When pace is &lt; 15 min/mi</span>
              </div>
            </div>
          ) : activeDbPhaseKey === 'db_phase2' ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3">
              <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Heavy Floor Press</span>
                <span className="text-sm font-black text-amber-400 font-mono">+5 lbs</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Upon 3 sets × 8-10 reps</span>
              </div>

              <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Deficit / Weighted Push</span>
                <span className="text-sm font-black text-amber-400 font-mono">+1 rep / +5 lbs</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Elevate feet or weight vest</span>
              </div>

              <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Threshold Tempo</span>
                <span className="text-sm font-black text-amber-400 font-mono">3.5 - 4.0 mi</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">RPE 7-8 comfortably hard</span>
              </div>

              <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Heavy Ruck (35 lbs)</span>
                <span className="text-sm font-black text-amber-400 font-mono">Sub-14:30 pace</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">5.0-6.0 mi target</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3">
              <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Heavy DB Press</span>
                <span className="text-sm font-black text-amber-400 font-mono">+5 lbs</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Upon 4 sets × 6 reps</span>
              </div>

              <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Plyo Clapping Push</span>
                <span className="text-sm font-black text-amber-400 font-mono">Max Height</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Explosive power drive</span>
              </div>

              <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Tactical Ruck (40-45#)</span>
                <span className="text-sm font-black text-amber-400 font-mono">Sub-14:30 pace</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">6.0-8.0 mi heavy carry</span>
              </div>

              <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Week 12 Fitness Test</span>
                <span className="text-sm font-black text-amber-400 font-mono">Peak Assess</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">5K trial + max push-up test</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 26-WEEK MESOCYCLE & WEEK SELECTOR (For The Apex Protocol) */}
      {selectedProgram === 'apex_protocol' && (
        <div className="bg-zinc-900 border border-emerald-500/30 rounded-2xl p-3 sm:p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 font-athletic flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              26-Week Mesocycle Progression (5 Phases)
            </span>
            <span className="text-[11px] text-emerald-400 font-mono font-bold">
              {currentPhase.weeks} • Week {activeApexWeek} Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {apexMesocycles.map((m) => {
              const isSelected = activeApexPhaseKey === m.id;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setActiveApexPhaseKey(m.id);
                    setActiveApexWeek(m.defaultWeek);
                    setDayViewMode('all');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 shadow-md shadow-emerald-950/30'
                      : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      isSelected ? 'bg-emerald-500 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {m.weeks}
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>

                  <div>
                    <span className={`text-xs sm:text-sm font-black block tracking-wide ${
                      isSelected ? 'text-white' : 'text-zinc-300'
                    }`}>
                      {m.label}
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5 truncate">
                      {m.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Week Pill Row for Current Mesocycle */}
          <div className="pt-2.5 border-t border-zinc-800/80 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Select Week:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(apexMesocycles.find((m) => m.id === activeApexPhaseKey)?.weekRange || [1, 2, 3, 4]).map((w) => {
                const isSelectedWeek = activeApexWeek === w;
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => {
                      setActiveApexWeek(w);
                      setDayViewMode('all');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                      isSelectedWeek
                        ? 'bg-emerald-400 text-zinc-950 border-emerald-300 shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    Week {w}
                  </button>
                );
              })}
            </div>
            <span className="text-[10px] font-mono text-emerald-400 ml-auto hidden sm:inline">
              Conditioning dynamically tailored to Week {activeApexWeek}
            </span>
          </div>
        </div>
      )}

      {/* CONDENSED 3-PHASE MESOCYCLE SWITCHER (For Hybrid Protocol) */}
      {selectedProgram === 'hybrid_protocol' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-md">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-300 font-athletic flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              12-Week Mesocycle Progression
            </span>
            <span className="text-[11px] text-rose-400 font-mono font-bold">
              {currentPhase.weeks} Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {protocolMesocycles.map((m) => {
              const isSelected = activeProtocolPhaseKey === m.id;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setActiveProtocolPhaseKey(m.id);
                    setDayViewMode('all');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-rose-600/15 border-rose-500 shadow-md shadow-rose-950/30'
                      : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      isSelected ? 'bg-rose-600 text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {m.weeks}
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
                  </div>

                  <div>
                    <span className={`text-xs sm:text-sm font-black block tracking-wide ${
                      isSelected ? 'text-white' : 'text-zinc-300'
                    }`}>
                      {m.label}
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      {m.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 12-WEEK MESOCYCLE PROGRESSION BAR (For Hybrid DB & Bodyweight) */}
      {selectedProgram === 'hybrid_db' && (
        <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-3 sm:p-4 shadow-md">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-athletic flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-500" />
              12-Week Mesocycle Progression
            </span>
            <span className="text-[11px] text-amber-400 font-mono font-bold">
              {currentPhase.weeks} Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {dbMesocycles.map((m) => {
              const isSelected = activeDbPhaseKey === m.id;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setActiveDbPhaseKey(m.id);
                    setDayViewMode('all');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-950/30'
                      : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      isSelected ? 'bg-amber-500 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {m.weeks}
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                  </div>

                  <div>
                    <span className={`text-xs sm:text-sm font-black block tracking-wide ${
                      isSelected ? 'text-white' : 'text-zinc-300'
                    }`}>
                      {m.label}
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      {m.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Collapsible Coach's Tactical Directives Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 shadow-sm">
        <button
          type="button"
          onClick={() => setShowCoachNotes(!showCoachNotes)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              {currentPhase.coachRule ? "Coach Aryan's Tactical Directives & Overload Laws" : "Order of Operations & Recovery Guidelines"}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white">
            <span>{showCoachNotes ? 'Hide rules' : 'View coaching cues'}</span>
            {showCoachNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {showCoachNotes && (
          <div className="mt-3 pt-3 border-t border-zinc-800 text-xs text-zinc-300 space-y-2 animate-in fade-in duration-200">
            <p className="leading-relaxed text-zinc-300">
              {currentPhase.coachRule ? currentPhase.coachRule : COACH_RULES.orderOfOperations.splitSessions}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
                  {COACH_RULES.zone2Guidance.title}
                </span>
                <span className="text-[11px] text-zinc-400">{COACH_RULES.zone2Guidance.rule}</span>
              </div>
              <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                  {COACH_RULES.progressiveOverload.title}
                </span>
                <span className="text-[11px] text-zinc-400">{COACH_RULES.progressiveOverload.rule}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Day Navigator Filter Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-2.5 sm:p-3 shadow-md">
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-300 font-athletic">
              Daily Schedule Navigator
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">
            {dayViewMode === 'all' ? 'Showing all 7 days' : `Day ${dayViewMode + 1} of 7`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {/* "All Days" Pill */}
          <button
            type="button"
            onClick={() => setDayViewMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              dayViewMode === 'all'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            All Days ({currentPhase.days.length})
          </button>

          {/* Individual Day Pills */}
          {currentPhase.days.map((day, idx) => {
            const isSelected = dayViewMode === idx;
            const isRest = isProtocolRestDay(day);
            const isToday = day.day.toLowerCase() === todayDayName.toLowerCase();

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setDayViewMode(idx)}
                className={`relative px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-zinc-100 text-zinc-950 border-white shadow-md'
                    : isRest
                    ? 'bg-zinc-950/60 text-zinc-400 border-zinc-800/60 hover:border-zinc-700'
                    : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <span>{day.day}</span>
                {isToday && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-rose-600' : 'bg-emerald-400'}`} />
                )}
                {isRest && (
                  <span className="text-[9px] uppercase font-mono opacity-70">(Rest)</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Focused Day Navigator Header (When a single day is selected) */}
      {dayViewMode !== 'all' && (
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => {
              const prevIdx = (dayViewMode - 1 + currentPhase.days.length) % currentPhase.days.length;
              setDayViewMode(prevIdx);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-zinc-800 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Day</span>
          </button>

          <span className="text-xs font-bold text-zinc-400">
            {currentPhase.days[dayViewMode]?.day} • {currentPhase.days[dayViewMode]?.focus}
          </span>

          <button
            type="button"
            onClick={() => {
              const nextIdx = (dayViewMode + 1) % currentPhase.days.length;
              setDayViewMode(nextIdx);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-zinc-800 cursor-pointer"
          >
            <span>Next Day</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Daily Cards */}
      <div className="space-y-5">
        {daysToShow.map((day, idx) => {
          const isRestDay = isProtocolRestDay(day);
          const isToday = day.day.toLowerCase() === todayDayName.toLowerCase();

          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isRestDay
                  ? 'bg-zinc-950/60 border-zinc-800/80'
                  : 'bg-zinc-900 border-zinc-800 shadow-lg'
              }`}
            >
              {/* Day Header */}
              <div className="bg-zinc-800/70 px-5 py-4 flex justify-between items-center border-b border-zinc-800 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center font-black text-sm text-white font-mono">
                    {day.day.length > 5 ? day.day.substring(0, 3) : day.day}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-white text-base sm:text-lg tracking-wide font-athletic">
                        {day.day}
                      </h3>
                      {isToday && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-full uppercase">
                          Today's Target
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-rose-400 font-bold tracking-wide">
                      {day.focus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {day.progressionRule && (
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-lg flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{day.progressionRule}</span>
                    </span>
                  )}

                  {!isRestDay && (
                    <button
                      type="button"
                      onClick={() => handleLaunchDayLifts(day)}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm shadow-rose-950 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Start Session</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Day Body Content */}
              <div className="p-4 sm:p-6 space-y-4">
                {/* WARM UP PRIMER */}
                <div className="bg-zinc-950/70 rounded-xl p-3.5 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                      <Flame className="w-3.5 h-3.5 mr-1.5" />
                      <span>Movement Primer & Dynamic Warm-Up</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{day.warmup}</p>
                  </div>

                  {!isRestDay && (
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedProgram === 'apex_protocol') {
                          onSelectWarmup('warmup-apex-sop');
                        } else if (day.focus.toLowerCase().includes('lower') || day.focus.toLowerCase().includes('squat') || day.focus.toLowerCase().includes('deadlift')) {
                          onSelectWarmup('warmup-lower-hip');
                        } else {
                          onSelectWarmup('warmup-upper-primer');
                        }
                      }}
                      className="shrink-0 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30 transition-colors flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Guided Primer</span>
                    </button>
                  )}
                </div>

                {/* STRENGTH SECTION */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center text-zinc-400 text-xs font-bold uppercase tracking-wider">
                      <Dumbbell className="w-4 h-4 mr-2 text-zinc-500" />
                      <span>Strength Exercises & Auto-Overload Rules</span>
                    </div>

                    <span className="text-[11px] text-zinc-500 font-mono">
                      {isRestDay ? '0 movements' : `${day.strength.filter(isRealStrengthExercise).length} movements`}
                    </span>
                  </div>

                  {isRestDay ? (
                    <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/60 text-center">
                      <p className="text-sm text-zinc-400 italic">
                        {day.strength.join(', ')}
                      </p>
                      <span className="text-xs text-zinc-500 block mt-1">
                        Active recovery, nutrition replenishment, and muscle restoration.
                      </span>
                    </div>
                  ) : day.strength.filter(isRealStrengthExercise).length === 0 ? (
                    <div className="p-3.5 bg-zinc-950/40 rounded-xl border border-zinc-800/60 text-center">
                      <p className="text-xs text-zinc-400">
                        Conditioning & Aerobic Base priority session. Scheduled cardio details below.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {day.strength.filter(isRealStrengthExercise).map((exerciseStr, i) => {
                        const currentRest = getExerciseRest(exerciseStr);
                        const overloadMatch = exerciseStr.match(/\[(Overload:.*?)\]/);
                        const cleanExerciseName = exerciseStr.replace(/\[.*?\]/g, '').trim();

                        return (
                          <div
                            key={i}
                            className="bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                          >
                            {/* Exercise Details */}
                            <div className="flex items-start gap-2.5 min-w-0">
                              <span className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-mono text-zinc-400 font-bold shrink-0 mt-0.5">
                                {i + 1}
                              </span>

                              <div>
                                <span className="font-bold text-white text-sm tracking-wide block">
                                  {cleanExerciseName}
                                </span>

                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  {overloadMatch && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                                      <TrendingUp className="w-3 h-3 text-amber-400 shrink-0" />
                                      <span>{overloadMatch[1]}</span>
                                    </span>
                                  )}

                                  <span className="text-[10px] text-zinc-400">
                                    {currentRest >= 180 ? 'Heavy CNS Rest' : currentRest >= 120 ? 'Strength Rest' : 'Standard Rest'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Clean, Streamlined Dedicated Rest Timer for this Exercise */}
                            <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                              {activeExerciseTimer && activeExerciseTimer.exerciseName === cleanExerciseName ? (
                                <div className="flex items-center gap-1 bg-zinc-900/95 border border-amber-500/60 shadow-lg shadow-amber-500/10 rounded-xl p-1 animate-in fade-in duration-200">
                                  {/* -15s */}
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustActiveTimerRemaining(-15)}
                                    className="px-1.5 py-1 text-[11px] font-mono text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                                    title="Minus 15s"
                                  >
                                    -15
                                  </button>

                                  {/* Main Toggle / Countdown Display */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleExerciseTimer(cleanExerciseName, currentRest)}
                                    className={`flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-black rounded-lg transition-all cursor-pointer ${
                                      activeExerciseTimer.secondsRemaining === 0
                                        ? 'bg-emerald-500 text-black animate-pulse'
                                        : activeExerciseTimer.isRunning
                                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                                          : 'bg-zinc-800 text-amber-300 border border-amber-500/30'
                                    }`}
                                    title={
                                      activeExerciseTimer.secondsRemaining === 0
                                        ? 'Rest complete! Click to restart.'
                                        : activeExerciseTimer.isRunning
                                          ? 'Pause countdown'
                                          : 'Resume countdown'
                                    }
                                  >
                                    {activeExerciseTimer.secondsRemaining === 0 ? (
                                      <span className="flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>DONE!</span>
                                      </span>
                                    ) : (
                                      <>
                                        {activeExerciseTimer.isRunning ? (
                                          <Pause className="w-3 h-3 fill-current" />
                                        ) : (
                                          <Play className="w-3 h-3 fill-current ml-0.5" />
                                        )}
                                        <span>{activeExerciseTimer.secondsRemaining}s</span>
                                      </>
                                    )}
                                  </button>

                                  {/* +15s */}
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustActiveTimerRemaining(15)}
                                    className="px-1.5 py-1 text-[11px] font-mono text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                                    title="Plus 15s"
                                  >
                                    +15
                                  </button>

                                  {/* Cancel Timer */}
                                  <button
                                    type="button"
                                    onClick={handleCancelExerciseTimer}
                                    className="p-1 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer ml-0.5"
                                    title="Dismiss timer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateExerciseRest(cleanExerciseName, currentRest - 15)}
                                      className="px-1.5 py-1 text-[11px] font-mono text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                                      title="Minus 15s"
                                    >
                                      -15
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleToggleExerciseTimer(cleanExerciseName, currentRest)}
                                      className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800/80 hover:bg-rose-600 hover:text-white text-amber-400 font-mono text-xs font-bold rounded transition-all cursor-pointer"
                                      title={`Click to start ${currentRest}s rest countdown`}
                                    >
                                      <Clock className="w-3 h-3" />
                                      <span>{currentRest}s</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleUpdateExerciseRest(cleanExerciseName, currentRest + 15)}
                                      className="px-1.5 py-1 text-[11px] font-mono text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                                      title="Plus 15s"
                                    >
                                      +15
                                    </button>
                                  </div>

                                  {/* 1-Tap Trigger Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleExerciseTimer(cleanExerciseName, currentRest)}
                                    className="p-1.5 bg-zinc-900 hover:bg-rose-600/20 text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-500/40 rounded-lg transition-colors cursor-pointer"
                                    title="Start rest timer now"
                                  >
                                    <Timer className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* CONDITIONING / CARDIO SECTION */}
                <div className="bg-zinc-950/70 rounded-xl p-3.5 border border-zinc-800/80">
                  <div className="flex items-center text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                    <div className="mr-2 text-rose-500">
                      <ShoeIcon />
                    </div>
                    <span>Conditioning & Aerobic Base</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <p className="font-bold text-white text-xs sm:text-sm">{day.run}</p>
                    <p className="text-xs text-zinc-400 font-mono">{day.pace}</p>
                  </div>
                </div>

                {/* Day Card Footer CTA */}
                {!isRestDay && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleLaunchDayLifts(day)}
                      className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-950/50 cursor-pointer active:scale-98"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Start & Track {day.day} Session</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
