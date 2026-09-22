import React, { useState, useMemo, useEffect } from 'react';
import { 
  Play, Pause, X, Dumbbell, Clock, Flame, 
  Sparkles, ShieldCheck, Zap, ChevronDown, 
  ChevronUp, Timer, TrendingUp, Calendar, 
  ChevronLeft, ChevronRight, CheckCircle2,
  SlidersHorizontal, ArrowRight, Activity, Award, RotateCcw,
  LogOut
} from 'lucide-react';
import { WorkoutProgram, ExerciseTemplate, MuscleGroup } from '../types';
import { PROTOCOL_DATA, COACH_RULES, ProtocolDay, getDefaultRestPeriod, parseExerciseString, getApexWeekData } from '../data/protocolData';
import { soundManager } from '../utils/audio';
import { OverlandCompanyEmblem } from './BrandingLogos';

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
  const [showOverloadRules, setShowOverloadRules] = useState<boolean>(false);
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
            : `Overland Protocol (${day.day} - ${day.focus}). Target Rest: ${configuredRest}s.`
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
      {/* Sleek, Compact Command Deck: Combines Identity, Status, and 3-Program Selector */}
      <div className="bg-[#141a22] border-2 border-zinc-700/80 hover:border-zinc-600 rounded-2xl p-3 sm:p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Identity & Status */}
          <div className="flex items-center gap-3">
            <div className="shrink-0 hidden sm:flex">
              <OverlandCompanyEmblem size="sm" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Overland Athletics
                </span>
                <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Run • Lift • Ruck
                </span>
                <span className="text-zinc-500 hidden md:inline">•</span>
                <span className="text-xs text-zinc-400 hidden md:inline font-mono">
                  Go The Distance
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white font-athletic uppercase tracking-wide mt-0.5 flex items-center gap-2">
                <span>
                  {selectedProgram === 'apex_protocol' ? (
                    <>The Apex <span className="text-emerald-400">Protocol</span></>
                  ) : selectedProgram === 'hybrid_protocol' ? (
                    <>Hybrid <span className="text-amber-400">Protocol</span></>
                  ) : (
                    <>Hybrid <span className="text-amber-400">DB & Bodyweight</span></>
                  )}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {currentPhase.weeks}
                </span>
              </h1>
            </div>
          </div>

          {/* Quick Action Toggles: Overload Rules & Coach Directives buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowOverloadRules(!showOverloadRules)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
                showOverloadRules
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-sm'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
              title="Toggle Auto-Overload Guidelines"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Auto-Overload</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showOverloadRules ? 'rotate-180' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setShowCoachNotes(!showCoachNotes)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
                showCoachNotes
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
              title="Toggle Coach Directives"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Coach Cues</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showCoachNotes ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Compact 3-Program Selector Bar (Replaces 3 huge cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-800/80">
          {/* Program 1: The Apex Protocol */}
          <button
            type="button"
            onClick={() => {
              setSelectedProgram('apex_protocol');
              setDayViewMode('all');
            }}
            className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
              selectedProgram === 'apex_protocol'
                ? 'bg-emerald-950/60 border-emerald-400 shadow-md ring-1 ring-emerald-400/40 text-white'
                : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${selectedProgram === 'apex_protocol' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                <span className="text-xs font-black uppercase tracking-wide truncate font-athletic">The Apex Protocol</span>
              </div>
              <span className="text-[10px] text-zinc-400 block font-mono truncate">26-Wk Master • Barbell & VO2</span>
            </div>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded font-mono shrink-0 ${
              selectedProgram === 'apex_protocol' ? 'bg-emerald-400 text-black' : 'bg-zinc-800 text-zinc-400'
            }`}>
              26 WKS
            </span>
          </button>

          {/* Program 2: Hybrid Protocol */}
          <button
            type="button"
            onClick={() => {
              setSelectedProgram('hybrid_protocol');
              setDayViewMode('all');
            }}
            className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
              selectedProgram === 'hybrid_protocol'
                ? 'bg-amber-950/60 border-amber-400 shadow-md ring-1 ring-amber-400/40 text-white'
                : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${selectedProgram === 'hybrid_protocol' ? 'bg-amber-400 animate-pulse' : 'bg-zinc-600'}`} />
                <span className="text-xs font-black uppercase tracking-wide truncate font-athletic">Hybrid Protocol</span>
              </div>
              <span className="text-[10px] text-zinc-400 block font-mono truncate">12-Wk Master • Strength/Run</span>
            </div>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded font-mono shrink-0 ${
              selectedProgram === 'hybrid_protocol' ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'
            }`}>
              12 WKS
            </span>
          </button>

          {/* Program 3: Hybrid DB & Bodyweight */}
          <button
            type="button"
            onClick={() => {
              setSelectedProgram('hybrid_db');
              setDayViewMode('all');
            }}
            className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
              selectedProgram === 'hybrid_db'
                ? 'bg-amber-950/60 border-amber-400 shadow-md ring-1 ring-amber-400/40 text-white'
                : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${selectedProgram === 'hybrid_db' ? 'bg-amber-400 animate-pulse' : 'bg-zinc-600'}`} />
                <span className="text-xs font-black uppercase tracking-wide truncate font-athletic">Hybrid DB & BW</span>
              </div>
              <span className="text-[10px] text-zinc-400 block font-mono truncate">12-Wk Master • DB & Calisthenics</span>
            </div>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded font-mono shrink-0 ${
              selectedProgram === 'hybrid_db' ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'
            }`}>
              12 WKS
            </span>
          </button>
        </div>
      </div>

      {/* COMPACT MESOCYCLE & WEEK SELECTOR RAIL */}
      {selectedProgram === 'apex_protocol' && (
        <div className="bg-[#141a22] border border-emerald-500/30 rounded-2xl p-2.5 sm:p-3 shadow-md space-y-2">
          {/* Phase Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 shrink-0 flex items-center gap-1 mr-1">
              <Activity className="w-3 h-3" />
              Phase:
            </span>
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
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-400 text-black border-emerald-300 shadow-sm font-black'
                      : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <span>{m.weeks}</span>
                  <span className="text-[10px] opacity-80 hidden md:inline">({m.badge.split('&')[0].trim()})</span>
                  {isSelected && <CheckCircle2 className="w-3 h-3 text-black" />}
                </button>
              );
            })}
          </div>

          {/* Week Selector inlined cleanly */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1.5 border-t border-zinc-800/80 scrollbar-none">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 shrink-0 mr-1">
              Week:
            </span>
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
                  className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer border ${
                    isSelectedWeek
                      ? 'bg-emerald-400 text-black border-emerald-300 shadow-sm font-black'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  W{w}
                </button>
              );
            })}
            <span className="text-[10px] font-mono text-emerald-400 ml-auto hidden sm:inline shrink-0">
              Week {activeApexWeek} Active
            </span>
          </div>
        </div>
      )}

      {selectedProgram === 'hybrid_protocol' && (
        <div className="bg-[#141a22] border border-amber-500/30 rounded-2xl p-2.5 sm:p-3 shadow-md flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 shrink-0 flex items-center gap-1 mr-1">
            <Activity className="w-3 h-3" />
            Phase:
          </span>
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
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-400 text-black border-amber-300 font-black shadow-sm'
                    : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <span>{m.label} ({m.weeks})</span>
                {isSelected && <CheckCircle2 className="w-3 h-3 text-black" />}
              </button>
            );
          })}
        </div>
      )}

      {selectedProgram === 'hybrid_db' && (
        <div className="bg-[#141a22] border border-amber-500/30 rounded-2xl p-2.5 sm:p-3 shadow-md flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 shrink-0 flex items-center gap-1 mr-1">
            <Activity className="w-3 h-3" />
            Phase:
          </span>
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
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-400 text-black border-amber-300 font-black shadow-sm'
                    : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <span>{m.label} ({m.weeks})</span>
                {isSelected && <CheckCircle2 className="w-3 h-3 text-black" />}
              </button>
            );
          })}
        </div>
      )}

      {/* COLLAPSIBLE AUTO-OVERLOAD BENCHMARKS (Expands cleanly on user request) */}
      {showOverloadRules && (
        <div className="bg-zinc-900/95 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 shadow-lg animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs sm:text-sm font-black uppercase text-emerald-400 tracking-wider font-athletic">
                {selectedProgram === 'apex_protocol' 
                  ? `The Apex Protocol Auto-Overload Laws (${currentPhase.weeks})`
                  : selectedProgram === 'hybrid_protocol'
                  ? 'Hybrid Protocol Auto-Overload Benchmarks'
                  : `Hybrid DB & Bodyweight Auto-Overload (${currentPhase.weeks})`}
              </h3>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">
              Apply linear increments upon completing target reps
            </span>
          </div>

          {selectedProgram === 'apex_protocol' ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2.5">
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
          ) : selectedProgram === 'hybrid_protocol' ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2.5">
              <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Squat & Deadlift</span>
                <span className="text-sm font-black text-amber-400 font-mono">+10 lbs</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Upon hitting top rep ceiling</span>
              </div>
              <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Bench, OHP & Rows</span>
                <span className="text-sm font-black text-amber-400 font-mono">+5 lbs</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Upon hitting target reps</span>
              </div>
              <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Weighted Pull-Ups</span>
                <span className="text-sm font-black text-amber-400 font-mono">+2.5 - 5 lbs</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Upon completing 6-8 reps</span>
              </div>
              <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Zone 2 Aerobic Base</span>
                <span className="text-sm font-black text-amber-400 font-mono">+0.5 - 1.0 mi/wk</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Continuous base expansion</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2.5">
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
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Ruck March</span>
                <span className="text-sm font-black text-amber-400 font-mono">+5 lbs pack</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">When pace is &lt; 15 min/mi</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* COLLAPSIBLE COACH'S DIRECTIVES */}
      {showCoachNotes && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              {currentPhase.coachRule ? "Coach Aryan's Tactical Directives & Overload Laws" : "Order of Operations & Recovery Guidelines"}
            </span>
          </div>
          <p className="leading-relaxed text-xs text-zinc-300">
            {currentPhase.coachRule ? currentPhase.coachRule : COACH_RULES.orderOfOperations.splitSessions}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-800">
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

      {/* Day Navigator Filter Bar */}
      <div className="bg-[#141a22] border-2 border-zinc-700 rounded-2xl p-2.5 sm:p-3 shadow-md">
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black uppercase tracking-wider text-white font-athletic">
              Daily Schedule Navigator
            </span>
          </div>
          <div className="flex items-center gap-2">
            {dayViewMode !== 'all' && (
              <button
                type="button"
                onClick={() => setDayViewMode('all')}
                className="px-2.5 py-0.5 bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-700 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                title="Exit single day view"
              >
                <X className="w-3 h-3" />
                <span>Exit Day View</span>
              </button>
            )}
            <span className="text-[11px] text-zinc-300 font-mono font-bold">
              {dayViewMode === 'all' ? 'Showing all 7 days' : `Day ${dayViewMode + 1} of 7`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {/* "All Days" Pill */}
          <button
            type="button"
            onClick={() => setDayViewMode('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 border-2 ${
              dayViewMode === 'all'
                ? 'bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-950/40 ring-2 ring-amber-400/20'
                : 'bg-zinc-950 text-zinc-200 border-zinc-700 hover:border-amber-400 hover:text-white hover:bg-zinc-800'
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
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border-2 ${
                  isSelected
                    ? 'bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-950/40 ring-2 ring-amber-400/20'
                    : isRest
                    ? 'bg-zinc-950/80 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                    : 'bg-zinc-950 text-zinc-200 border-zinc-700 hover:border-amber-400 hover:text-white'
                }`}
              >
                <span>{day.day}</span>
                {isToday && (
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-black' : 'bg-emerald-400 shadow-sm shadow-emerald-400/50'}`} />
                )}
                {isRest && (
                  <span className="text-[9px] uppercase font-mono opacity-80">(Rest)</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Focused Day Navigator Header (When a single day is selected) */}
      {dayViewMode !== 'all' && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#141a22] border-2 border-amber-500/50 rounded-2xl shadow-md">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const prevIdx = (dayViewMode - 1 + currentPhase.days.length) % currentPhase.days.length;
                setDayViewMode(prevIdx);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl text-xs font-black transition-all border-2 border-zinc-700 hover:border-amber-400 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev Day</span>
            </button>

            <span className="text-xs sm:text-sm font-black text-white px-2">
              {currentPhase.days[dayViewMode]?.day} • {currentPhase.days[dayViewMode]?.focus}
            </span>

            <button
              type="button"
              onClick={() => {
                const nextIdx = (dayViewMode + 1) % currentPhase.days.length;
                setDayViewMode(nextIdx);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl text-xs font-black transition-all border-2 border-zinc-700 hover:border-amber-400 cursor-pointer"
            >
              <span>Next Day</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setDayViewMode('all')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 border-amber-300 shadow-md cursor-pointer active:scale-95"
          >
            <X className="w-3.5 h-3.5 stroke-[3]" />
            <span>Exit Day View (Show All Days)</span>
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
                    <span className="text-xs text-amber-400 font-bold tracking-wide">
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
                      className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md shadow-amber-950/40 border-2 border-amber-300 cursor-pointer active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-black text-black stroke-[2]" />
                      <span>Start Live Session</span>
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
                                    className="p-1 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer ml-0.5"
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
                                      className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800/80 hover:bg-amber-500 hover:text-black hover:text-white text-amber-400 font-mono text-xs font-bold rounded transition-all cursor-pointer"
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
                                    className="p-1.5 bg-zinc-900 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 border border-zinc-800 hover:border-amber-500/40 rounded-lg transition-colors cursor-pointer"
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
                    <div className="mr-2 text-amber-400">
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
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-950/30 cursor-pointer active:scale-98"
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
