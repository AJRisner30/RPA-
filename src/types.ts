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
  userId?: string;
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

export type ProgramKey = 'apex_protocol' | 'tactical_hypertrophy' | 'hybrid_protocol' | 'hybrid_db';

export interface QuestionnaireAnswers {
  completedAt: string;
  pushUpScore: 'under_15' | '15_to_30' | '30_to_50' | 'over_50';
  pullUpScore: 'zero' | '1_to_5' | '6_to_12' | 'over_12';
  aerobicScore: 'under_1_mile' | '13_to_16_min' | '10_30_to_13_min' | 'sub_10_30';
  equipmentAccess: 'bodyweight_dumbbells' | 'full_tactical_gym' | 'basic_station_gym';
  liftingExperience: 'beginner' | 'intermediate' | 'advanced_tactical';
  weeklyDays: 3 | 4 | 5 | 6;
  primaryGoalCategory: 
    | 'tactical_duty_readiness' 
    | 'muscle_armor_hypertrophy' 
    | 'hybrid_strength_running' 
    | 'station_db_minimal' 
    | 'complete_apex_peak';
  injuryConstraints?: string;
  recommendedProgramKey: ProgramKey;
  recommendedProgramTitle: string;
  recommendationReason: string;
  recommendedStartingWeek: number;
  fitnessTier: 'Recruit Foundation' | 'Operational LEO' | 'Tactical Elite';
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

export interface BodyweightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightLbs: number;
  notes?: string;
}

export interface RecoveryCheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  sleepHours: number; // e.g. 7.5
  sleepQuality: 1 | 2 | 3 | 4 | 5; // 1 = Poor, 5 = Deep / Restful
  muscleSoreness: 1 | 2 | 3 | 4 | 5; // 1 = Fresh, 5 = Very Sore
  shiftStress: 1 | 2 | 3 | 4 | 5; // 1 = Calm, 5 = Extreme Shift Stress
  restingHr?: number;
  notes?: string;
  createdAt: string;
}

export type ReadinessTier = 
  | 'Patrol Ready: Peak'
  | 'Optimal: Combat Chassis'
  | 'Operational: Monitor Fatigue'
  | 'Recovery Advisory'
  | 'Strained / De-load Priority';

export interface ReadinessScoreBreakdown {
  overallScore: number; // 0 - 100
  tier: ReadinessTier;
  recoveryScore: number; // 0 - 100
  weightConsistencyScore: number; // 0 - 100
  workoutCompletionScore: number; // 0 - 100
  workoutsCompleted7d: number;
  targetWorkoutsPerWeek: number;
  workoutStreak: number;
  lastWeightDate?: string;
  lastWeightLbs?: number;
  daysSinceLastWeight?: number;
  lastRecoveryDate?: string;
  hoursOfSleep?: number;
  coachAdvisory: string;
  statusBadgeColor: string;
}

export interface AthleteProfile {
  id: string;
  name: string;
  email: string;
  pin?: string;
  avatarColor: string;
  joinedDate: string;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite';
  primaryGoal: 'Hybrid Athlete' | 'Strength & Power' | 'Hypertrophy' | 'Tactical Conditioning & Pursuit' | 'Endurance & Running';
  weightLbs?: number;
  restingHr?: number;
  maxHr?: number;
  notes?: string;
  questionnaire?: QuestionnaireAnswers;
  weightHistory?: BodyweightEntry[];
  recoveryHistory?: RecoveryCheckIn[];
  lastRecoveryCheckIn?: RecoveryCheckIn;
}

/**
 * Checks if an exercise is timed (cardio runs, interval sprints, planks, isometric holds)
 * rather than traditional barbell/dumbbell repetitions.
 */
export function isExerciseTimed(
  exerciseName: string,
  type?: string,
  targetReps?: string
): boolean {
  if (type === 'strength') return false;
  if (type === 'cardio') return true;
  const name = exerciseName.toLowerCase();
  const reps = (targetReps || '').toLowerCase();

  // Strength and accessory movements that must NEVER be timed cardio
  if (
    name.includes('lunge') || 
    name.includes('split squat') || 
    name.includes('squat') || 
    name.includes('step-up') ||
    name.includes('deadlift') ||
    name.includes('press') ||
    name.includes('row') ||
    name.includes('pull-up') ||
    name.includes('curl') ||
    name.includes('raise') ||
    name.includes('swing') ||
    reps.includes('steps') ||
    reps.includes('/leg') ||
    reps.includes('/side')
  ) {
    return false;
  }

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

  // Name matching for runs, holds, carries, sprints
  const timedKeywords = [
    'run',
    'jog',
    'sprint',
    'tempo',
    'intervals',
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

