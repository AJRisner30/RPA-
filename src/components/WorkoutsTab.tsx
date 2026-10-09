import React, { useState, useMemo, useEffect } from 'react';
import { 
  Play, Pause, X, Dumbbell, Clock, Flame, 
  Sparkles, ShieldCheck, Zap, ChevronDown, 
  ChevronUp, Timer, TrendingUp, Calendar, 
  ChevronLeft, ChevronRight, CheckCircle2,
  SlidersHorizontal, ArrowRight, Activity, Award, RotateCcw,
  LogOut, RefreshCw, BatteryCharging
} from 'lucide-react';
import { WorkoutProgram, ExerciseTemplate, MuscleGroup, AthleteProfile, ProgramKey } from '../types';
import { PROTOCOL_DATA, COACH_RULES, ProtocolDay, getDefaultRestPeriod, parseExerciseString, getApexWeekData, getTacticalHypertrophyWeekData } from '../data/protocolData';
import { soundManager } from '../utils/audio';
import { PatrolReadyCompanyEmblem } from './BrandingLogos';
import { RequireTier } from './RequireTier';

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
  currentAthlete?: AthleteProfile;
  activeProgramKey?: ProgramKey;
  onSelectProgram?: (programKey: ProgramKey) => void;
  onOpenQuestionnaire?: () => void;
  onOpenAthleteModal?: () => void;
  readinessScore?: number;
  readinessTier?: string;
}

export const WorkoutsTab: React.FC<WorkoutsTabProps> = ({
  onStartWorkout,
  onSelectWarmup,
  currentAthlete,
  activeProgramKey,
  onSelectProgram,
  onOpenQuestionnaire,
  onOpenAthleteModal,
  readinessScore,
  readinessTier,
}) => {
  // Primary program selector: 'apex_protocol' (26-week tactical blueprint) vs 'tactical_hypertrophy' (6-week hypertrophy & conditioning) vs 'hybrid_protocol' vs 'hybrid_db'
  const [selectedProgram, setSelectedProgram] = useState<ProgramKey>(
    activeProgramKey || currentAthlete?.questionnaire?.recommendedProgramKey || 'apex_protocol'
  );

  useEffect(() => {
    if (activeProgramKey) {
      setSelectedProgram(activeProgramKey);
    }
  }, [activeProgramKey]);

  const handleProgramSwitch = (progKey: ProgramKey) => {
    setSelectedProgram(progKey);
    onSelectProgram?.(progKey);
    setDayViewMode('all');
  };
  
  // Active week inside Tactical Hypertrophy & Conditioning (Weeks 1 to 6)
  const [activeTacticalWeek, setActiveTacticalWeek] = useState<number>(1);

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
    if (selectedProgram === 'tactical_hypertrophy') {
      return getTacticalHypertrophyWeekData(activeTacticalWeek);
    }
    if (selectedProgram === 'hybrid_db') {
      return PROTOCOL_DATA[activeDbPhaseKey] || PROTOCOL_DATA.db_phase1 || PROTOCOL_DATA.hybrid_db;
    }
    return PROTOCOL_DATA[activeProtocolPhaseKey] || PROTOCOL_DATA.phase1;
  }, [selectedProgram, activeApexWeek, activeTacticalWeek, activeDbPhaseKey, activeProtocolPhaseKey]);

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

        // Auto-Overload rules for all programs (Tactical Hypertrophy, Apex Protocol, Hybrid Protocol, Hybrid DB & Bodyweight)
        let progressionRuleObj = undefined;
        let defaultWeightLbs: number | undefined = undefined;

        // Strict OHP & Press
        if (lowerName.includes('overhead press') || lowerName.includes('ohp') || lowerName.includes('strict overhead')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 2.5,
            action: '+2.5 to 5 lbs next session',
          };
          defaultWeightLbs = 75;
        } else if (lowerName.includes('pull-up') || lowerName.includes('pullup') || lowerName.includes('chin-up')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 2.5,
            action: '+2.5 to 5 lbs on belt',
          };
          defaultWeightLbs = 0;
        } else if (lowerName.includes('deadlift') || lowerName.includes('trap bar')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 10,
            action: '+10 lbs next session',
          };
          defaultWeightLbs = 185;
        } else if (lowerName.includes('squat') && !lowerName.includes('split')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 10,
            action: '+10 lbs next session',
          };
          defaultWeightLbs = 135;
        } else if (lowerName.includes('hip thrust')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 10,
            action: '+10 lbs next session',
          };
          defaultWeightLbs = 135;
        } else if (lowerName.includes('rdl') || lowerName.includes('romanian')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 10,
            action: '+10 lbs next session',
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
        } else if (lowerName.includes('z-press') || lowerName.includes('z press')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 5,
            action: '+5 lbs next session',
          };
          defaultWeightLbs = 65;
        } else if (lowerName.includes('dip')) {
          progressionRuleObj = {
            metric: 'reps' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 1,
            action: '+1 rep or add weight vest',
          };
          defaultWeightLbs = 0;
        } else if (lowerName.includes('curl')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 5,
            action: '+5 lbs next session',
          };
          defaultWeightLbs = 25;
        } else if (lowerName.includes('calf')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 5,
            action: '+5 to 10 lbs next session',
          };
          defaultWeightLbs = 135;
        } else if (lowerName.includes('lateral raise')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 2.5,
            action: '+2.5 to 5 lbs next session',
          };
          defaultWeightLbs = 15;
        } else if (lowerName.includes('face pull')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 5,
            action: '+5 lbs next session',
          };
          defaultWeightLbs = 35;
        } else if (lowerName.includes('close-grip') || lowerName.includes('close grip')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 5,
            action: '+5 lbs next session',
          };
          defaultWeightLbs = 95;
        } else if (lowerName.includes('bench') || lowerName.includes('floor press')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 5,
            action: '+5 lbs next session',
          };
          defaultWeightLbs = lowerName.includes('barbell') || lowerName.includes('incline') ? 115 : 50;
        } else if (lowerName.includes('row')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 5,
            action: '+5 lbs next session',
          };
          defaultWeightLbs = lowerName.includes('barbell') || lowerName.includes('bent') ? 115 : 60;
        } else if (lowerName.includes('split squat') || lowerName.includes('lunge')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 5,
            action: '+5 lbs next session',
          };
          defaultWeightLbs = 30;
        } else if (lowerName.includes('leg curl')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 5,
            action: '+5 to 10 lbs next session',
          };
          defaultWeightLbs = 60;
        } else if (lowerName.includes('carry') || lowerName.includes('farmer') || lowerName.includes('suitcase')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 5,
            action: '+5 lbs next session',
          };
          defaultWeightLbs = 50;
        } else if (lowerName.includes('wrist') || lowerName.includes('roller') || lowerName.includes('pinch')) {
          progressionRuleObj = {
            metric: 'weight_lbs' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 5,
            action: '+5 lbs or +10s TUT',
          };
          defaultWeightLbs = 25;
        } else if (lowerName.includes('sorensen') || lowerName.includes('hyperextension') || lowerName.includes('back extension')) {
          progressionRuleObj = {
            metric: 'reps' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 1,
            action: '+1 rep next session',
          };
          defaultWeightLbs = 0;
        } else if (lowerName.includes('leg raise') || lowerName.includes('knee raise') || lowerName.includes('hanging')) {
          progressionRuleObj = {
            metric: 'reps' as const,
            trigger: 'complete_max_reps' as const,
            increment_value: 1,
            action: '+1 rep next session',
          };
          defaultWeightLbs = 0;
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
            increment_value: 5,
            action: '+5s hold',
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
            : `Patrol Ready Protocol (${day.day} - ${day.focus}). Target Rest: ${configuredRest}s.`
        };
      });

    // If day has conditioning (run / pursuit / sprints) and is not rest, append as trackable cardio
    if (isRealConditioningRun(day.run)) {
      const combined = `${day.run} ${day.pace} ${day.focus}`.toLowerCase();
      const isIntervals = combined.includes('interval') || combined.includes('track') || combined.includes('sprint') || combined.includes('repeats');

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
        if (isIntervals) {
          distance = 2.5;
          durationMins = 25;
        } else {
          distance = 3.5;
          durationMins = 30;
        }
      } else if (!distance && durationMins) {
        distance = parseFloat((durationMins / 9.5).toFixed(1));
      } else if (distance && !durationMins) {
        durationMins = Math.round(distance * 9);
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
        pace: day.pace,
        progression_rules: isIntervals
          ? { metric: 'seconds', trigger: 'pace_progression', increment_value: -2, action: 'drop 2-3s per interval repeat' }
          : { metric: 'distance_miles', trigger: 'per_week', increment_value: 0.5, action: '+0.5 mi weekly aerobic expansion' },
        notes: `${day.run} • Target Pace: ${day.pace}`
      });
    }

    const programTitle = selectedProgram === 'apex_protocol'
      ? `The Apex Protocol (${currentPhase.title.split(':')[0]} • ${day.day}: ${day.focus})`
      : selectedProgram === 'tactical_hypertrophy'
      ? `Tactical Hypertrophy & Conditioning (${currentPhase.weeks} • ${day.day}: ${day.focus})`
      : selectedProgram === 'hybrid_protocol'
      ? `Hybrid Protocol (${currentPhase.title.split(':')[0]} • ${day.day}: ${day.focus})`
      : `Hybrid DB & Bodyweight (${currentPhase.title.split(':')[0]} • ${day.day}: ${day.focus})`;

    const recommendedWarmupId = selectedProgram === 'apex_protocol'
      ? 'warmup-apex-sop'
      : selectedProgram === 'tactical_hypertrophy'
      ? 'warmup-universal-tactical'
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
      focus: 'Progressive Barbell Loading, 400m Repeats & Duty Conditioning Base',
      weekRange: [5, 6, 7, 8, 9, 10],
      defaultWeek: 5
    },
    {
      id: 'apex_phase3' as const,
      label: 'Phase 3: Intensify & Threshold',
      weeks: 'Weeks 11-16',
      badge: 'Threshold & Power',
      focus: 'Heavy Triple Progression, VO2 Max Intervals & Foot Pursuit Conditioning',
      weekRange: [11, 12, 13, 14, 15, 16],
      defaultWeek: 11
    },
    {
      id: 'apex_phase4' as const,
      label: 'Phase 4: Tactical Peak',
      weeks: 'Weeks 17-22',
      badge: 'Speed & Agility Under Stress',
      focus: 'Speed Under Load, Agility Obstacle Drills & Explosive Combat Chassis',
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
      focus: 'Push-Up Volume, DB Hypertrophy & Duty Carry Conditioning'
    },
    {
      id: 'db_phase2' as const,
      label: 'Phase 2: Strength Density',
      weeks: 'Weeks 5-8',
      badge: 'Heavy DB Loads & Threshold',
      focus: 'Weighted/Deficit Push-Ups, Tempo Running & Foot Pursuit Sprints'
    },
    {
      id: 'db_phase3' as const,
      label: 'Phase 3: Tactical Peak',
      weeks: 'Weeks 9-12',
      badge: 'Max DB Power & Tactical Test',
      focus: 'Explosive Plyo Push-Ups, LEO Agility Circuit & Peak Assessment'
    },
  ];

  const daysToShow = dayViewMode === 'all' 
    ? currentPhase.days 
    : [currentPhase.days[dayViewMode] || currentPhase.days[0]];

  return (
    <div className="space-y-6">
      {/* INITIAL QUESTIONNAIRE & PROGRAM RECOMMENDATION BANNER */}
      {currentAthlete?.questionnaire ? (
        <div className="bg-gradient-to-r from-[#0c182c] via-[#0f1f38] to-[#0c182c] border border-blue-500/40 rounded-2xl p-3 sm:p-3.5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold">
                  Diagnostic Ability Match:
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-500/30 font-bold">
                  {currentAthlete.questionnaire.fitnessTier}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  • {currentAthlete.questionnaire.weeklyDays} Days/Wk
                </span>
              </div>
              <div className="text-xs text-slate-200 mt-0.5">
                Recommended Track: <span className="font-bold text-white font-athletic uppercase">{currentAthlete.questionnaire.recommendedProgramTitle}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenQuestionnaire}
            className="px-3 py-1.5 rounded-xl border border-blue-500/40 bg-blue-950/80 hover:bg-blue-900 text-blue-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Retake Assessment</span>
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-950/90 via-[#0d1a30] to-blue-950/90 border-2 border-blue-400/60 rounded-2xl p-4 sm:p-4.5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-black">
                  Initial Tactical Assessment
                </span>
                <span className="text-[9px] bg-red-950/80 border border-red-500/40 text-red-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  Recommended
                </span>
              </div>
              <h2 className="text-xs sm:text-sm font-black text-white font-athletic uppercase tracking-wide">
                New Officer or Athlete? Take the 2-Minute Physical Ability &amp; Program Matcher
              </h2>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Diagnose your baseline push/pull/running capacity and goals to automatically unlock your recommended beginning training plan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenQuestionnaire}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-athletic font-black uppercase text-xs tracking-wider shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 self-start md:self-auto active:scale-[0.98]"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Take Ability Questionnaire</span>
          </button>
        </div>
      )}

      {/* Sleek, Compact Command Deck: Combines Identity, Status, and 4-Program Selector */}
      <div className="bg-[#0f172a] border-2 border-blue-500/30 hover:border-blue-400/50 rounded-2xl p-3 sm:p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Identity & Status */}
          <div className="flex items-center gap-3">
            <div className="shrink-0 hidden sm:flex">
              <PatrolReadyCompanyEmblem size="sm" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                  Patrol Ready Performance
                </span>
                <span className="text-xs text-blue-400 font-bold flex items-center gap-1">
                  Tactical fitness for the Frontline.
                </span>
                <span className="text-slate-600 hidden md:inline">•</span>
                <span className="text-xs text-slate-400 hidden md:inline font-mono">
                  Duty Readiness &amp; Combat Chassis
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white font-athletic uppercase tracking-wide mt-0.5 flex items-center gap-2">
                <span>
                  {selectedProgram === 'apex_protocol' ? (
                    <>The Apex <span className="text-blue-400">Protocol (LEO Master)</span></>
                  ) : selectedProgram === 'tactical_hypertrophy' ? (
                    <>Patrol Ready <span className="text-blue-400">Tactical Hypertrophy &amp; Conditioning</span></>
                  ) : selectedProgram === 'hybrid_protocol' ? (
                    <>Patrol Ready <span className="text-blue-400">Hybrid Protocol</span></>
                  ) : (
                    <>Patrol Ready <span className="text-blue-400">DB &amp; Bodyweight</span></>
                  )}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {currentPhase.weeks}
                </span>
              </h1>
            </div>
          </div>

          {/* Quick Action Toggles: Readiness Score, Overload Rules, Coach Directives, and Ability Matcher */}
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenAthleteModal && (
              <button
                type="button"
                onClick={onOpenAthleteModal}
                className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border bg-blue-950/90 hover:bg-blue-900 text-blue-300 border-blue-500/50 shadow-sm"
                title="View Tactical Readiness Score & Daily Recovery Breakdown"
              >
                <BatteryCharging className="w-3.5 h-3.5 text-blue-400" />
                <span>{readinessScore !== undefined ? `${readinessScore}% Readiness` : 'Readiness'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenQuestionnaire}
              className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border bg-blue-950 hover:bg-blue-900/80 text-blue-300 border-blue-500/50 shadow-sm"
              title="Open Ability Assessment & Program Matcher"
            >
              <Award className="w-3.5 h-3.5 text-blue-400" />
              <span>Program Matcher</span>
            </button>

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
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/60 shadow-sm'
                  : 'bg-[#0f172a] hover:bg-[#162238] text-slate-300 border-slate-700'
              }`}
              title="Toggle Coach Directives"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Coach Cues</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showCoachNotes ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Compact 4-Program Selector Bar (Responsive Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800/80">
          {/* Program 1: The Apex Protocol */}
          <button
            type="button"
            onClick={() => handleProgramSwitch('apex_protocol')}
            className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
              selectedProgram === 'apex_protocol'
                ? 'bg-blue-950/70 border-blue-400 shadow-md ring-1 ring-blue-400/40 text-white'
                : 'bg-[#0a0f1d] border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${selectedProgram === 'apex_protocol' ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`} />
                <span className="text-xs font-black uppercase tracking-wide truncate font-athletic">The Apex Protocol</span>
              </div>
              <span className="text-[10px] text-slate-400 block font-mono truncate">26-Wk Master • Barbell & VO2</span>
            </div>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded font-mono shrink-0 ${
              selectedProgram === 'apex_protocol' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              26 WKS
            </span>
          </button>

          {/* Program 2: Tactical Hypertrophy & Conditioning Protocol */}
          <button
            type="button"
            onClick={() => handleProgramSwitch('tactical_hypertrophy')}
            className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
              selectedProgram === 'tactical_hypertrophy'
                ? 'bg-blue-950/70 border-blue-400 shadow-md ring-1 ring-blue-400/40 text-white'
                : 'bg-[#0a0f1d] border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${selectedProgram === 'tactical_hypertrophy' ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`} />
                <span className="text-xs font-black uppercase tracking-wide truncate font-athletic">Tactical Hypertrophy</span>
              </div>
              <span className="text-[10px] text-slate-400 block font-mono truncate">6-Wk Cycle • 4-Day Hyper + Conditioning</span>
            </div>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded font-mono shrink-0 ${
              selectedProgram === 'tactical_hypertrophy' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              6 WKS
            </span>
          </button>

          {/* Program 3: Hybrid Protocol */}
          <button
            type="button"
            onClick={() => handleProgramSwitch('hybrid_protocol')}
            className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
              selectedProgram === 'hybrid_protocol'
                ? 'bg-blue-950/70 border-blue-400 shadow-md ring-1 ring-blue-400/40 text-white'
                : 'bg-[#0a0f1d] border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${selectedProgram === 'hybrid_protocol' ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`} />
                <span className="text-xs font-black uppercase tracking-wide truncate font-athletic">Hybrid Protocol</span>
              </div>
              <span className="text-[10px] text-slate-400 block font-mono truncate">12-Wk Master • Strength/Run</span>
            </div>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded font-mono shrink-0 ${
              selectedProgram === 'hybrid_protocol' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              12 WKS
            </span>
          </button>

          {/* Program 4: Hybrid DB & Bodyweight */}
          <button
            type="button"
            onClick={() => handleProgramSwitch('hybrid_db')}
            className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
              selectedProgram === 'hybrid_db'
                ? 'bg-blue-950/70 border-blue-400 shadow-md ring-1 ring-blue-400/40 text-white'
                : 'bg-[#0a0f1d] border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${selectedProgram === 'hybrid_db' ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`} />
                <span className="text-xs font-black uppercase tracking-wide truncate font-athletic">Hybrid DB & BW</span>
              </div>
              <span className="text-[10px] text-slate-400 block font-mono truncate">12-Wk Master • DB & Calisthenics</span>
            </div>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded font-mono shrink-0 ${
              selectedProgram === 'hybrid_db' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              12 WKS
            </span>
          </button>
        </div>
      </div>

      {/* Dynamic Program Content - Smooth CSS Fade-in Transition When Switching Programs */}
      <div key={`${selectedProgram}-${activeApexPhaseKey}-${activeApexWeek}-${activeTacticalWeek}`} className="animate-tab-fade space-y-6">
        {/* COMPACT TACTICAL HYPERTROPHY WEEK SELECTOR RAIL */}
        {selectedProgram === 'tactical_hypertrophy' && (
          <div className="bg-[#0f172a] border border-blue-500/30 rounded-2xl p-2.5 sm:p-3 shadow-md space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 shrink-0 flex items-center gap-1 mr-1">
                  <Calendar className="w-3 h-3" />
                  Tactical Week:
                </span>
                {[1, 2, 3, 4, 5, 6].map((w) => {
                  const isSelectedWeek = activeTacticalWeek === w;
                  const isDeload = w === 4;
                  return (
                    <button
                      key={w}
                      type="button"
                      onClick={() => {
                        setActiveTacticalWeek(w);
                        setDayViewMode('all');
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                        isSelectedWeek
                          ? 'bg-blue-600 text-white border-blue-400 shadow-sm font-black'
                          : 'bg-[#0a0f1d] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <span>Week {w}</span>
                      {isDeload && <span className="text-[9px] font-black uppercase bg-red-950/80 text-red-300 border border-red-500/40 px-1 rounded">Deload</span>}
                    </button>
                  );
                })}
              </div>
              <span className="text-[11px] font-mono text-blue-400 font-bold shrink-0">
                Week {activeTacticalWeek} Active • Duty Conditioning Synced
              </span>
            </div>
          </div>
        )}

        {/* COMPACT MESOCYCLE & WEEK SELECTOR RAIL */}
        {selectedProgram === 'apex_protocol' && (
        <div className="bg-[#0f172a] border border-blue-500/30 rounded-2xl p-2.5 sm:p-3 shadow-md space-y-2">
          {/* Phase Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 shrink-0 flex items-center gap-1 mr-1">
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
                      ? 'bg-blue-600 text-white border-blue-400 shadow-sm font-black'
                      : 'bg-[#0a0f1d] text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-[#111c2e]'
                  }`}
                >
                  <span>{m.weeks}</span>
                  <span className="text-[10px] opacity-80 hidden md:inline">({m.badge.split('&')[0].trim()})</span>
                  {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                </button>
              );
            })}
          </div>

          {/* Week Selector inlined cleanly */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1.5 border-t border-slate-800/80 scrollbar-none">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1">
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
                      ? 'bg-blue-600 text-white border-blue-400 shadow-sm font-black'
                      : 'bg-[#0a0f1d] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  W{w}
                </button>
              );
            })}
            <span className="text-[10px] font-mono text-blue-400 ml-auto hidden sm:inline shrink-0">
              Week {activeApexWeek} Active
            </span>
          </div>
        </div>
      )}

      {selectedProgram === 'hybrid_protocol' && (
        <div className="bg-[#0f172a] border border-blue-500/30 rounded-2xl p-2.5 sm:p-3 shadow-md flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 shrink-0 flex items-center gap-1 mr-1">
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
                    ? 'bg-blue-600 text-white border-blue-400 font-black shadow-sm'
                    : 'bg-[#0a0f1d] text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-[#111c2e]'
                }`}
              >
                <span>{m.label} ({m.weeks})</span>
                {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
              </button>
            );
          })}
        </div>
      )}

      {selectedProgram === 'hybrid_db' && (
        <div className="bg-[#0f172a] border border-blue-500/30 rounded-2xl p-2.5 sm:p-3 shadow-md flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 shrink-0 flex items-center gap-1 mr-1">
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
                    ? 'bg-blue-600 text-white border-blue-400 font-black shadow-sm'
                    : 'bg-[#0a0f1d] text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-[#111c2e]'
                }`}
              >
                <span>{m.label} ({m.weeks})</span>
                {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
              </button>
            );
          })}
        </div>
      )}

      {/* COLLAPSIBLE AUTO-OVERLOAD BENCHMARKS (Expands cleanly on user request) */}
      {showOverloadRules && (
        <RequireTier 
          requiredTier="pro" 
          featureName="Auto-Overload Engine"
        >
          <div className="bg-zinc-900/95 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 shadow-lg animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs sm:text-sm font-black uppercase text-emerald-400 tracking-wider font-athletic">
                  {selectedProgram === 'apex_protocol' 
                    ? `The Apex Protocol Auto-Overload Laws (${currentPhase.weeks})`
                    : selectedProgram === 'tactical_hypertrophy'
                    ? `Tactical Hypertrophy Auto-Overload Benchmarks (${currentPhase.weeks})`
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
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Aerobic Run & Sprints</span>
                <span className="text-sm font-black text-emerald-400 font-mono">+5 min / +2 min / +1 mi</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Dynamic weekly prescription</span>
              </div>
            </div>
          ) : selectedProgram === 'tactical_hypertrophy' ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2.5">
              <div className="p-2.5 bg-[#0a0f1d] rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Strict OHP & Pull-Ups</span>
                <span className="text-sm font-black text-blue-400 font-mono">+2.5 - 5 lbs</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Upon completing 8 reps at RPE 8</span>
              </div>
              <div className="p-2.5 bg-[#0a0f1d] rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trap Bar, Squat & RDL</span>
                <span className="text-sm font-black text-blue-400 font-mono">+10 lbs</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Double progression on top reps</span>
              </div>
              <div className="p-2.5 bg-[#0a0f1d] rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Incline, Bench & Rows</span>
                <span className="text-sm font-black text-blue-400 font-mono">+5 lbs</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Upon completing 10-12 reps with clean tempo</span>
              </div>
              <div className="p-2.5 bg-[#0a0f1d] rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">6-Wk Duty Conditioning</span>
                <span className="text-sm font-black text-blue-400 font-mono">1.5-Mi Standard</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Sub-7:30/mi Zone 4/5 pace</span>
              </div>
            </div>
          ) : selectedProgram === 'hybrid_protocol' ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2.5">
              <div className="p-2.5 bg-[#0a0f1d] rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Squat & Deadlift</span>
                <span className="text-sm font-black text-blue-400 font-mono">+10 lbs</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Upon hitting top rep ceiling</span>
              </div>
              <div className="p-2.5 bg-[#0a0f1d] rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bench, OHP & Rows</span>
                <span className="text-sm font-black text-blue-400 font-mono">+5 lbs</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Upon hitting target reps</span>
              </div>
              <div className="p-2.5 bg-[#0a0f1d] rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weighted Pull-Ups</span>
                <span className="text-sm font-black text-blue-400 font-mono">+2.5 - 5 lbs</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Upon completing 6-8 reps</span>
              </div>
              <div className="p-2.5 bg-[#0a0f1d] rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Zone 2 Aerobic Base</span>
                <span className="text-sm font-black text-blue-400 font-mono">+0.5 - 1.0 mi/wk</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Continuous base expansion</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2.5">
              <div className="p-2.5 bg-[#0a0f1d] rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DB Floor Press</span>
                <span className="text-sm font-black text-blue-400 font-mono">+5 lbs</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Upon 3 sets × 12 reps</span>
              </div>
              <div className="p-2.5 bg-[#0a0f1d] rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Push-ups</span>
                <span className="text-sm font-black text-blue-400 font-mono">+1 rep</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Every workout session</span>
              </div>
              <div className="p-2.5 bg-[#0a0f1d] rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Zone 2 Run</span>
                <span className="text-sm font-black text-blue-400 font-mono">+0.5 mi / wk</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Conversational base pace</span>
              </div>
              <div className="p-2.5 bg-[#0a0f1d] rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duty Agility / Farmer's Carry</span>
                <span className="text-sm font-black text-blue-400 font-mono">+5-10 lbs carry</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Maintain upright trunk posture</span>
              </div>
            </div>
          )}
          </div>
        </RequireTier>
      )}

      {/* COLLAPSIBLE COACH'S DIRECTIVES */}
      {showCoachNotes && (
        <div className="bg-[#0f172a] border border-blue-500/30 rounded-xl p-3.5 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {currentPhase.coachRule ? "Coach Aryan's Tactical Directives & Overload Laws" : "Order of Operations & Recovery Guidelines"}
            </span>
          </div>
          <p className="leading-relaxed text-xs text-slate-300">
            {currentPhase.coachRule ? currentPhase.coachRule : COACH_RULES.orderOfOperations.splitSessions}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800">
            <div className="p-2 bg-[#0a0f1d] rounded-lg border border-slate-800">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-0.5">
                {COACH_RULES.zone2Guidance.title}
              </span>
              <span className="text-[11px] text-slate-400">{COACH_RULES.zone2Guidance.rule}</span>
            </div>
            <div className="p-2 bg-[#0a0f1d] rounded-lg border border-slate-800">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                {COACH_RULES.progressiveOverload.title}
              </span>
              <span className="text-[11px] text-slate-400">{COACH_RULES.progressiveOverload.rule}</span>
            </div>
          </div>
        </div>
      )}

      {/* Day Navigator Filter Bar */}
      <div className="bg-[#0f172a] border-2 border-blue-500/40 rounded-2xl p-2.5 sm:p-3 shadow-md">
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
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
            <span className="text-[11px] text-slate-300 font-mono font-bold">
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
                ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-950/60 ring-2 ring-blue-400/30'
                : 'bg-[#0a0f1d] text-slate-200 border-slate-700 hover:border-blue-400 hover:text-white hover:bg-[#111c2e]'
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
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-950/60 ring-2 ring-blue-400/30'
                    : isRest
                    ? 'bg-[#0a0f1d]/80 text-slate-400 border-slate-800 hover:border-slate-600'
                    : 'bg-[#0a0f1d] text-slate-200 border-slate-700 hover:border-blue-400 hover:text-white'
                }`}
              >
                <span>{day.day}</span>
                {isToday && (
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-400 shadow-sm shadow-emerald-400/50'}`} />
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
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0f172a] border-2 border-blue-500/50 rounded-2xl shadow-md">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const prevIdx = (dayViewMode - 1 + currentPhase.days.length) % currentPhase.days.length;
                setDayViewMode(prevIdx);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#0a0f1d] hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-black transition-all border-2 border-slate-700 hover:border-blue-400 cursor-pointer"
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
              className="flex items-center gap-1 px-3 py-1.5 bg-[#0a0f1d] hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-black transition-all border-2 border-slate-700 hover:border-blue-400 cursor-pointer"
            >
              <span>Next Day</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setDayViewMode('all')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 border-blue-400 shadow-md cursor-pointer active:scale-95"
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
                    <span className="text-xs text-blue-400 font-bold tracking-wide">
                      {day.focus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {day.progressionRule && (
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded-lg flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-blue-400 shrink-0" />
                      <span>{day.progressionRule}</span>
                    </span>
                  )}

                  {!isRestDay && (
                    <button
                      type="button"
                      onClick={() => handleLaunchDayLifts(day)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md shadow-blue-950/50 border-2 border-blue-400 cursor-pointer active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-white text-white stroke-[2]" />
                      <span>Start Live Session</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Day Body Content */}
              <div className="p-4 sm:p-6 space-y-4">
                {/* WARM UP PRIMER */}
                <div className="bg-[#0a0f1d] rounded-xl p-3.5 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                      <Flame className="w-3.5 h-3.5 mr-1.5" />
                      <span>Movement Primer & Dynamic Warm-Up</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{day.warmup}</p>
                  </div>

                  {!isRestDay && (
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedProgram === 'apex_protocol') {
                          onSelectWarmup('warmup-apex-sop');
                        } else if (selectedProgram === 'tactical_hypertrophy') {
                          onSelectWarmup('warmup-universal-tactical');
                        } else if (day.focus.toLowerCase().includes('lower') || day.focus.toLowerCase().includes('squat') || day.focus.toLowerCase().includes('deadlift')) {
                          onSelectWarmup('warmup-lower-hip');
                        } else {
                          onSelectWarmup('warmup-upper-primer');
                        }
                      }}
                      className="shrink-0 px-3 py-1.5 bg-[#0f172a] hover:bg-slate-800 text-blue-300 hover:text-white text-xs font-bold rounded-lg border border-blue-500/30 transition-colors flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
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
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                                      <TrendingUp className="w-3 h-3 text-blue-400 shrink-0" />
                                      <span>{overloadMatch[1]}</span>
                                    </span>
                                  )}

                                  <span className="text-[10px] text-slate-400">
                                    {currentRest >= 180 ? 'Heavy CNS Rest' : currentRest >= 120 ? 'Strength Rest' : 'Standard Rest'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Clean, Streamlined Dedicated Rest Timer for this Exercise */}
                            <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                              {activeExerciseTimer && activeExerciseTimer.exerciseName === cleanExerciseName ? (
                                <div className="flex items-center gap-1 bg-[#0f172a] border border-blue-500/60 shadow-lg shadow-blue-500/20 rounded-xl p-1 animate-in fade-in duration-200">
                                  {/* -15s */}
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustActiveTimerRemaining(-15)}
                                    className="px-1.5 py-1 text-[11px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
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
                                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                          : 'bg-slate-800 text-blue-300 border border-blue-500/30'
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
                                    className="px-1.5 py-1 text-[11px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                    title="Plus 15s"
                                  >
                                    +15
                                  </button>

                                  {/* Cancel Timer */}
                                  <button
                                    type="button"
                                    onClick={handleCancelExerciseTimer}
                                    className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors cursor-pointer ml-0.5"
                                    title="Dismiss timer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <div className="flex items-center bg-[#0a0f1d] border border-slate-800 rounded-lg p-0.5">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateExerciseRest(cleanExerciseName, currentRest - 15)}
                                      className="px-1.5 py-1 text-[11px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                      title="Minus 15s"
                                    >
                                      -15
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleToggleExerciseTimer(cleanExerciseName, currentRest)}
                                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-800/80 hover:bg-blue-600 hover:text-white text-blue-400 font-mono text-xs font-bold rounded transition-all cursor-pointer"
                                      title={`Click to start ${currentRest}s rest countdown`}
                                    >
                                      <Clock className="w-3 h-3" />
                                      <span>{currentRest}s</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleUpdateExerciseRest(cleanExerciseName, currentRest + 15)}
                                      className="px-1.5 py-1 text-[11px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                      title="Plus 15s"
                                    >
                                      +15
                                    </button>
                                  </div>

                                  {/* 1-Tap Trigger Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleExerciseTimer(cleanExerciseName, currentRest)}
                                    className="p-1.5 bg-[#0a0f1d] hover:bg-blue-900/30 text-slate-400 hover:text-blue-400 border border-slate-800 hover:border-blue-500/40 rounded-lg transition-colors cursor-pointer"
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
                <div className="bg-[#0a0f1d] rounded-xl p-3.5 border border-slate-800/80">
                  <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                    <div className="mr-2 text-blue-400">
                      <ShoeIcon />
                    </div>
                    <span>Conditioning & Aerobic Base</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <p className="font-bold text-white text-xs sm:text-sm">{day.run}</p>
                    <p className="text-xs text-slate-400 font-mono">{day.pace}</p>
                  </div>
                </div>

                {/* Day Card Footer CTA */}
                {!isRestDay && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleLaunchDayLifts(day)}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-950/40 border border-blue-400/40 cursor-pointer active:scale-98"
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
    </div>
  );
};
