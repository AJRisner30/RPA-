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

export type WorkoutFormat = 'straight' | 'superset' | 'emom' | 'amrap' | 'circuit';

export interface SupersetMovementItem {
  name: string;
  targetReps: string;
  muscleGroup?: MuscleGroup;
  weight_lbs?: number;
  notes?: string;
  originalExerciseName?: string;
  adaptationReason?: string;
}

export interface BlockMovementItem {
  name: string;
  targetReps: string;
  muscleGroup?: MuscleGroup;
  notes?: string;
  originalExerciseName?: string;
  adaptationReason?: string;
}

export interface ProgramScheduleDay {
  day: number;
  focus: string;
  warmup?: string;
  conditioning?: string;
  isRestDay?: boolean;
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
  type?: 'strength' | 'cardio' | 'core' | 'circuit' | 'superset' | 'emom' | 'amrap';
  format?: WorkoutFormat;
  supersetExercises?: SupersetMovementItem[];
  emomMinutes?: number;
  emomIntervalSeconds?: number;
  emomMovements?: BlockMovementItem[];
  amrapDurationMinutes?: number;
  amrapMovements?: BlockMovementItem[];
  circuitStations?: string[];
  workSeconds?: number;
  restSeconds?: number;
  distance_miles?: number;
  weight_lbs?: number;
  pace?: string;
  progression_rules?: ProgressionRule;
  originalExerciseName?: string;
  adaptationReason?: string;
  scalingNote?: string;
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
  baseProgramKey?: string;
  programKind?: 'program' | 'single_workout';
  isCoachPublished?: boolean;
  isPublished?: boolean;
  allowAiAdaptation?: boolean;
  createdByEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupersetLiveEntry {
  name: string;
  muscleGroup?: MuscleGroup;
  weightLbs: number;
  reps: number;
  targetReps?: string;
  prevWeightLbs?: number;
  prevReps?: number;
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
  supersetEntries?: SupersetLiveEntry[];
  amrapRoundsCompleted?: number;
  amrapExtraReps?: number;
  emomRoundsCompleted?: number;
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
  format?: WorkoutFormat;
  supersetExercises?: SupersetMovementItem[];
  emomMinutes?: number;
  emomIntervalSeconds?: number;
  emomMovements?: BlockMovementItem[];
  amrapDurationMinutes?: number;
  amrapMovements?: BlockMovementItem[];
  circuitStations?: string[];
  workSeconds?: number;
  restSeconds?: number;
  distanceMiles?: number;
  distance_miles?: number;
  autoOverload?: AutoOverloadRecommendation;
  sets: LiveSet[];
}

export interface WorkoutSessionLog {
  id: string;
  athleteId?: string;
  athleteName?: string;
  userEmail?: string;
  isCoachLog?: boolean;
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
    format?: WorkoutFormat;
    supersetGroupName?: string;
    sets: {
      setNumber: number;
      weightLbs: number;
      reps: number;
      timeSeconds?: number;
      timeFormatted?: string;
      distanceMiles?: number;
      rpe?: number;
      estimated1RM: number;
      amrapRoundsCompleted?: number;
      amrapExtraReps?: number;
      emomRoundsCompleted?: number;
      supersetEntries?: SupersetLiveEntry[];
    }[];
  }[];
}

export type ProgramKey = 'apex_protocol' | 'tactical_hypertrophy' | 'hybrid_protocol' | 'hybrid_db' | 'universal_pat' | 'custom_ai';

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
    | 'complete_apex_peak'
    | 'universal_pat_testing'
    | 'custom_ai_individualized';
  preparingForPat?: 'yes_upcoming_pat' | 'no_general_tactical';
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

export interface SubscriptionRecord {
  tier: 'standard' | 'pro' | 'enterprise';
  status: 'active_subscriber' | 'trialing' | 'canceled' | 'past_due';
  provider: 'square' | 'manual' | 'promo';
  squareOrderId?: string;
  squarePaymentId?: string;
  subscribedAt: string; // ISO string
  amount: number; // 15 or 30
  currency: 'USD';
  environment?: 'sandbox' | 'production';
}

export interface SquareConfig {
  environment: 'sandbox' | 'production';
  standardPlanUrl: string;
  proPlanUrl: string;
  applicationId?: string;
  locationId?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface TrialCodeRecord {
  code: string;
  days: number;
  tier: 'pro' | 'standard';
  description: string;
  createdAt?: string;
  createdBy?: string;
  maxUses?: number;
  currentUses?: number;
}

export interface TrialActivationRecord {
  code?: string;
  activatedAt?: string;
  startedAtMs?: number;
  trialEndMs: number;
  daysGranted?: number;
  hasSelectedPlan?: boolean;
  tier: 'pro' | 'standard';
  status?: 'trialing' | 'active_subscriber' | 'expired' | 'unpaid';
  resetVersion?: number;
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
  subscription?: SubscriptionRecord;
  trialActivation?: TrialActivationRecord;
  hasCompletedTour?: boolean;
  tourCompletedAt?: string;
  trialState?: {
    startedAtMs: number;
    trialEndMs: number;
    hasSelectedPlan: boolean;
    tier: 'pro' | 'standard';
    status: 'trialing' | 'active_subscriber' | 'expired' | 'unpaid';
  };
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
  const normalizedType = (type || '').toLowerCase().trim();
  if (normalizedType === 'strength' || normalizedType === 'superset') return false;
  if (normalizedType === 'cardio') return true;

  const name = (exerciseName || '').toLowerCase();
  const reps = (targetReps || '').toLowerCase().trim();

  // Cardio ergometers / machines MUST be checked before 'row' (since 'rower' contains 'row')
  if (
    /\b(rower|rowing machine|concept2|ergometer|skierg|assault bike|air bike|airdyne|treadmill|spin bike)\b/i.test(name) ||
    /\bcalorie\s+row\b/i.test(name)
  ) {
    return true;
  }

  // Strength and accessory movements that must NEVER be timed cardio
  if (
    /\b(lunge|lunges|split squat|squat|squats|step-up|step-ups|step up|step down|step-down|deadlift|deadlifts|rdl|press|presses|row|rows|pull-up|pull-ups|pullup|pullups|chin-up|chin-ups|chinup|chinups|push-up|push-ups|pushup|pushups|dip|dips|curl|curls|raise|raises|swing|swings|bench|fly|flye|flyes|pulldown|pulldowns|pushdown|pushdowns|extension|extensions|thruster|thrusters|clean|snatch|shrug|shrugs|hip thrust|hip thrusts|glute bridge|glute bridges|calf|calves|tibialis|face pull|face pulls|high pull|high pulls|pull-through|pull through|skull crusher|skull crushers|rollout|rollouts|crunch|crunches|sit-up|sit-ups|situp|situps|russian twist|woodchop|tuck|tucks|inverted)\b/i.test(
      name
    ) ||
    reps.includes('steps') ||
    reps.includes('/leg') ||
    reps.includes('/side') ||
    /\bper\s+(?:leg|arm|side)\b/i.test(reps)
  ) {
    return false;
  }

  // Pure rep prescriptions (e.g. "8-10 reps", "12 reps", "10-12") without time/distance indicators
  if (
    (/\b\d+(?:\s*[-–]\s*\d+)?\s*reps?\b/i.test(reps) || /^\d+(?:\s*[-–]\s*\d+)?$/.test(reps)) &&
    !/\b(hold|plank|sprint|run|mile|miles|yard|yd|yds|meter|meters|min|mins|minute|minutes|sec|secs|second|seconds)\b/i.test(reps) &&
    !/\b(plank|wall sit|hollow body|bear crawl|carry|carries|farmer|run|jog|sprint|time trial|shuttle)\b/i.test(name)
  ) {
    return false;
  }

  // Explicit time or distance indicators in targetReps (word-boundary safe; never match plural 'reps')
  if (
    /\b\d+(?:\.\d+)?\s*(?:s|sec|secs|second|seconds|min|mins|minute|minutes|mile|miles|mi|km|meter|meters)\b/i.test(reps) ||
    /\b(?:hold|holds|repeat|repeats|isometric|time trial)\b/i.test(reps)
  ) {
    return true;
  }

  // Name matching for runs, holds, carries, sprints
  return /\b(run|runs|running|jog|jogging|sprint|sprints|tempo\s+run|tempo\s+jog|intervals|plank|planks|hollow\s+body|bear\s+crawl\s+hold|wall\s+sit|carry|carries|farmer\s+walk|farmers\s+walk|farmer\s+walks|farmers\s+walks|ruck|rucking|spin|bike|rower|skierg|active\s+recovery|shakeout|time\s+trial|shuttle)\b/i.test(
    name
  );
}

export interface OfficerAssignedProgram {
  id: string;
  officerUserId: string; // The specific officer account this program is exclusively tied to
  officerEmail?: string;
  officerName?: string;
  badgeNumber?: string;
  department?: string;
  programTitle: string;
  programSubtitle?: string;
  category: 'Strength' | 'Hypertrophy' | 'Athletic Conditioning' | 'Power' | 'Hybrid' | 'Tactical & Rucking';
  coachNotes?: string;
  frequency?: string;
  estimatedDurationMinutes?: number;
  scheduleDays?: {
    day: number;
    dayLabel?: string;
    focus: string;
    warmup?: string;
    exercises: ExerciseTemplate[];
    runPacing?: string;
    coachNotes?: string;
  }[];
  exercises: ExerciseTemplate[];
  assignedByEmail?: string;
  assignedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

