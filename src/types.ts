export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Quads'
  | 'Hamstrings & Glutes'
  | 'Shoulders'
  | 'Arms'
  | 'Core'
  | 'Full Body';

export interface ProgressionRule {
  metric: string;
  trigger: string;
  increment_value: number;
  action?: string;
}

export interface ProgramScheduleDay {
  day: number;
  focus: string;
  exercises: ExerciseTemplate[];
}

export interface ExerciseTemplate {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  defaultSets: number;
  targetReps: string;
  targetRpe?: number;
  restPeriodSeconds: number; // e.g. 90
  notes?: string;
  videoGuide?: string;
  type?: 'strength' | 'cardio' | 'core';
  distance_miles?: number;
  weight_lbs?: number;
  pace?: string;
  progression_rules?: ProgressionRule;
}

export interface WorkoutProgram {
  id: string;
  title: string;
  subtitle: string;
  category: 'Strength' | 'Hypertrophy' | 'Athletic Conditioning' | 'Power' | 'Hybrid';
  frequency: string;
  estimatedDurationMinutes: number;
  description: string;
  recommendedWarmupId?: string;
  exercises: ExerciseTemplate[];
  schedule?: ProgramScheduleDay[];
}

export interface LiveSet {
  id: string;
  setNumber: number;
  weightLbs: number;
  reps: number;
  timeSeconds?: number;
  timeFormatted?: string; // e.g. "30:00", "45s", "08:15"
  distanceMiles?: number;
  rpe?: number;
  completed: boolean;
  restSeconds: number;
  prevWeightLbs?: number;
  prevReps?: number;
  prevTimeFormatted?: string;
  isTimed?: boolean;
}

export interface AutoOverloadRecommendation {
  exerciseName: string;
  hasPreviousData: boolean;
  lastSessionDate?: string;
  previousWeightLbs: number;
  recommendedWeightLbs: number;
  incrementLbs: number;
  previousReps: number;
  targetRepsText?: string;
  lastRpe?: number;
  status: 'overload_applied' | 'maintain' | 'baseline';
  reason: string;
  isLowerBodyCompound: boolean;
  isUpperBodyCompound: boolean;
  isDumbbell: boolean;
  isTimed: boolean;
  previousTimeFormatted?: string;
  recommendedTimeFormatted?: string;
}

export interface LiveExerciseSession {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  restPeriodSeconds: number;
  notes?: string;
  targetReps?: string;
  targetRpe?: number;
  progressionRules?: ProgressionRule;
  isTimed?: boolean;
  distanceMiles?: number;
  distance_miles?: number;
  autoOverload?: AutoOverloadRecommendation;
  sets: LiveSet[];
}

export interface WorkoutSessionLog {
  id: string;
  athleteId?: string;
  programId?: string;
  workoutTitle: string;
  date: string; // ISO format YYYY-MM-DD
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalVolumeLbs: number;
  totalSetsCompleted: number;
  rating?: number; // 1-5
  notes?: string;
  exercises: {
    exerciseName: string;
    muscleGroup: MuscleGroup;
    isTimed?: boolean;
    sets: {
      setNumber: number;
      weightLbs: number;
      reps: number;
      timeSeconds?: number;
      timeFormatted?: string;
      distanceMiles?: number;
      rpe?: number;
      estimated1RM: number;
    }[];
  }[];
}

export interface WarmUpStep {
  id: string;
  name: string;
  targetArea: string;
  durationSeconds?: number;
  repsText?: string;
  cues: string[];
  coachingPoint: string;
}

export interface WarmUpRoutine {
  id: string;
  title: string;
  category: 'Upper Body' | 'Lower Body' | 'Full Body / CNS' | 'Mobility Flow';
  durationMinutes: number;
  description: string;
  focusMuscles: string[];
  steps: WarmUpStep[];
}

export type SupplementTimingPhase =
  | 'morning'
  | 'pre_workout'
  | 'intra_workout'
  | 'post_workout'
  | 'evening';

export interface SupplementProtocol {
  id: string;
  name: string;
  dosage: string;
  phase: SupplementTimingPhase;
  phaseLabel: string;
  timingWindow: string; // e.g. "30-45 min before training"
  benefit: string;
  issaGuideline: string;
  takenToday: boolean;
  takenAt?: string; // e.g. "14:32"
}

export interface PersonalRecord {
  exerciseName: string;
  maxWeightLbs: number;
  repsAtMax: number;
  estimated1RM: number;
  date: string;
}

export interface AthleteProfile {
  id: string;
  name: string;
  email: string;
  pin?: string;
  avatarColor: string;
  joinedDate: string;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite';
  primaryGoal: 'Hybrid Athlete' | 'Strength & Power' | 'Hypertrophy' | 'Tactical & Rucking' | 'Endurance & Running';
  weightLbs?: number;
  restingHr?: number;
  maxHr?: number;
  notes?: string;
}

/**
 * Checks if an exercise is timed (cardio runs, rucking, planks, sprints, isometric holds)
 * rather than traditional barbell/dumbbell repetitions.
 */
export function isExerciseTimed(
  exerciseName: string,
  type?: string,
  targetReps?: string
): boolean {
  if (type === 'cardio') return true;
  const name = exerciseName.toLowerCase();
  const reps = (targetReps || '').toLowerCase();

  // Explicit time indicators in target reps
  if (
    reps.includes('min') ||
    reps.includes('sec') ||
    reps.includes(' s') ||
    reps.endsWith('s') ||
    reps.includes('mile') ||
    reps.includes('repeat') ||
    reps.includes('hold')
  ) {
    return true;
  }

  // Name matching for runs, rucks, holds, carries, sprints
  const timedKeywords = [
    'run',
    'jog',
    'sprint',
    'tempo',
    'intervals',
    'ruck',
    'plank',
    'hollow body',
    'bear crawl hold',
    'wall sit',
    'carry',
    'farmer',
    'walk',
    'spin',
    'bike',
    'rower',
    'skierg',
    'active recovery',
    'shakeout',
    'time trial'
  ];

  return timedKeywords.some((kw) => name.includes(kw));
}

