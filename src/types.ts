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
  isBodyweight?: boolean;
  isTimed?: boolean;
  timeSeconds?: number;
  timeFormatted?: string;
  targetHoldSeconds?: number;
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
  prevDistanceMiles?: number;
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
  recommendedReps?: number;
  repRangeMin?: number;
  repRangeMax?: number;
  recommendedSets?: number;
  setRangeMin?: number;
  setRangeMax?: number;
  targetRepsText?: string;
  lastRpe?: number;
  status: 'overload_applied' | 'rep_progression' | 'set_progression' | 'maintain' | 'baseline';
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
  isBodyweight?: boolean;
  hasDistance?: boolean;
  targetHoldSeconds?: number;
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
 * Parses a prescribed hold/duration string like "60s", "45 sec", "20-30s/side",
 * "1:30", or "2 min" into seconds (starting at the low end for ranges).
 */
export function parseTimedHoldSeconds(
  targetReps?: string,
  exerciseName?: string
): number | undefined {
  const reps = (targetReps || '').trim();
  const mmssMatch = reps.match(/\b(\d+):(\d{2})\b/);
  if (mmssMatch) {
    const mins = parseInt(mmssMatch[1], 10);
    const secs = parseInt(mmssMatch[2], 10);
    if (!isNaN(mins) && !isNaN(secs)) return mins * 60 + secs;
  }

  const minRangeMatch = reps.match(/(\d+(?:\.\d+)?)\s*(?:[-–]\s*\d+(?:\.\d+)?)?\s*(?:min|mins|minute|minutes)\b/i);
  if (minRangeMatch) {
    const mins = parseFloat(minRangeMatch[1]);
    if (!isNaN(mins) && mins > 0) return Math.round(mins * 60);
  }

  const secRangeMatch = reps.match(/(\d+)\s*(?:[-–]\s*\d+)?\s*(?:s|sec|secs|second|seconds)\b/i);
  if (secRangeMatch) {
    const secs = parseInt(secRangeMatch[1], 10);
    if (!isNaN(secs) && secs > 0) return secs;
  }

  const name = (exerciseName || '').toLowerCase();
  if (/\b(plank|copenhagen|wall\s+sit|hollow\s+body|hollow\s+hold|dead\s+hang|active\s+hang|isometric|l-sit|bear\s+crawl\s+hold|negative\s+hold)\b/i.test(name)) {
    return 45;
  }
  return undefined;
}

/**
 * Checks if a timed exercise is an isometric/stationary hold (e.g. Plank, Side Plank,
 * Copenhagen Side Plank, Wall Sit, Hollow Body Hold, Dead Hang) rather than a distance
 * run/row/carry so the UI hides "Distance (mi)" and displays a Hold Timer instead.
 */
export function isTimedHoldExercise(
  exerciseName: string,
  targetReps?: string,
  distanceMiles?: number
): boolean {
  if (distanceMiles && distanceMiles > 0) return false;
  const name = (exerciseName || '').toLowerCase();
  const reps = (targetReps || '').toLowerCase();

  const hasExplicitTimeUnit =
    /\b\d+(?:\.\d+)?\s*(?:s|sec|secs|second|seconds|min|mins|minute|minutes)\b/i.test(reps) ||
    /\b\d+:\d{2}\b/.test(reps) ||
    (/\b(?:hold|holds|isometric)\b/i.test(reps) && !/\b(?:pause|eccentric|negative)\b/i.test(reps));

  if (
    /\b(plank\s+shoulder\s+taps?|plank\s+taps?|plank\s+up-?downs?|plank\s+jacks?|plank\s+walks?|plank\s+to\s+push(?:-?ups?)?|renegade\s+rows?|plank\s+rows?)\b/i.test(
      name
    ) &&
    !hasExplicitTimeUnit
  ) {
    return false;
  }

  if (
    /\b(run|runs|running|jog|jogging|sprint|sprints|mile|miles|mi|km|meter|meters|yard|yds|yd|rower|rowing|skierg|bike|assault|airdyne|treadmill|spin|ruck|carry|carries|farmer|suitcase|sled|drag|shuttle)\b/i.test(
      `${name} ${reps}`
    ) &&
    !/\b(plank|wall\s+sit|dead\s+hang|hollow\s+body|hollow\s+hold|bear\s+crawl\s+hold|negative\s+hold)\b/i.test(name)
  ) {
    return false;
  }

  return (
    /\b(plank|planks|side\s+plank|copenhagen|wall\s+sit|wall\s+sits|dead\s+hang|dead\s+hangs|active\s+hang|passive\s+hang|hollow\s+body|hollow\s+hold|l-sit|pallof\s+hold|superman\s+hold|bridge\s+hold|sorensen|isometric|iso\s+hold|bear\s+crawl\s+hold|negative\s+hold)\b/i.test(
      name
    ) ||
    (/\b(?:s|sec|secs|second|seconds|hold|holds|isometric)\b/i.test(reps) &&
      !/\b(?:mile|miles|mi|km|meter|meters|m|yd|yds|yard)\b/i.test(reps))
  );
}

/**
 * Checks if an exercise is timed (cardio runs, interval sprints, planks, isometric holds)
 * rather than traditional repetition sets.
 */
export function isExerciseTimed(
  exerciseName: string,
  type?: string,
  targetReps?: string
): boolean {
  const normalizedType = (type || '').toLowerCase().trim();
  if (normalizedType === 'superset') return false;

  const name = (exerciseName || '').toLowerCase();
  const reps = (targetReps || '').toLowerCase().trim();

  // Dynamic plank variations that prescribe rep counts instead of a hold
  const isDynamicPlankReps =
    /\b(plank\s+shoulder\s+taps?|plank\s+taps?|plank\s+up-?downs?|plank\s+jacks?|plank\s+walks?|plank\s+to\s+push(?:-?ups?)?|renegade\s+rows?|plank\s+rows?)\b/i.test(
      name
    );

  // Explicit time or duration units (note: check both "30s" and "20-30s/side" cleanly)
  const hasExplicitTimeUnit =
    /\b\d+(?:\.\d+)?\s*(?:s|sec|secs|second|seconds|min|mins|minute|minutes)\b/i.test(reps) ||
    /\b\d+:\d{2}\b/.test(reps) ||
    (/\b(?:hold|holds|isometric|time\s+trial)\b/i.test(reps) &&
      !/\b(?:pause|eccentric|negative)\b/i.test(reps));

  const hasExplicitRepsOnly =
    (/\b\d+(?:\s*[-–]\s*\d+)?\s*reps?\b/i.test(reps) || /\bmax\s*reps?\b/i.test(reps)) &&
    !hasExplicitTimeUnit;

  // Isometric / stationary hold movements (Plank, Side Plank, Copenhagen, Hollow Body Hold, Wall Sit, Dead Hang, etc.)
  const isHoldName =
    /\b(plank|planks|side\s+plank|copenhagen|wall\s+sit|wall\s+sits|dead\s+hang|dead\s+hangs|active\s+hang|passive\s+hang|hollow\s+body|hollow\s+hold|l-sit|pallof\s+hold|superman\s+hold|glute\s+bridge\s+hold|bridge\s+hold|sorensen\s+hold|isometric\s+hold|iso\s+hold|star\s+plank|rkc\s+plank|plank\s+series|bear\s+crawl\s+hold|negative\s+holds?|isometric\s+core\s+brace)\b/i.test(
      name
    ) && !isDynamicPlankReps;

  if (isHoldName && !hasExplicitRepsOnly) {
    return true;
  }

  // Ergometers / cardio machines MUST be checked before 'row'
  if (
    /\b(rower|rowing machine|concept2|ergometer|skierg|assault bike|air bike|airdyne|treadmill|spin bike)\b/i.test(name) ||
    /\bcalorie\s+row\b/i.test(name)
  ) {
    return true;
  }

  // Distance/time cardio & carries
  if (
    /\b\d+(?:\.\d+)?\s*(?:mile|miles|mi|km|meter|meters)\b/i.test(reps) ||
    /\b(?:repeat|repeats|time trial)\b/i.test(reps)
  ) {
    return true;
  }

  // If reps explicitly include a time duration (e.g. "40s", "45 sec hold", "20-30s/side") and not pause-rep lifts
  if (hasExplicitTimeUnit && !/\b(squat|deadlift|rdl|bench|press|curl|lunge)\b/i.test(name)) {
    return true;
  }

  // Strength and rep-based accessory movements that must NEVER be timed
  if (
    /\b(lunge|lunges|split squat|squat|squats|step-up|step-ups|step up|step down|step-down|deadlift|deadlifts|rdl|press|presses|row|rows|pull-up|pull-ups|pullup|pullups|chin-up|chin-ups|chinup|chinups|push-up|push-ups|pushup|pushups|dip|dips|curl|curls|raise|raises|swing|swings|bench|fly|flye|flyes|pulldown|pulldowns|pushdown|pushdowns|extension|extensions|thruster|thrusters|clean|snatch|shrug|shrugs|hip thrust|hip thrusts|glute bridge|glute bridges|calf|calves|tibialis|face pull|face pulls|high pull|high pulls|pull-through|pull through|skull crusher|skull crushers|rollout|rollouts|crunch|crunches|sit-up|sit-ups|situp|situps|russian twist|woodchop|tuck|tucks|inverted|dead bug|bird-?dog)\b/i.test(
      name
    ) ||
    reps.includes('steps') ||
    reps.includes('/leg') ||
    (reps.includes('/side') && !hasExplicitTimeUnit) ||
    (/\bper\s+(?:leg|arm|side)\b/i.test(reps) && !hasExplicitTimeUnit)
  ) {
    return false;
  }

  if (normalizedType === 'cardio') return true;

  // Pure rep prescriptions (e.g. "8-10 reps", "12 reps", "10-12")
  if (
    (/\b\d+(?:\s*[-–]\s*\d+)?\s*reps?\b/i.test(reps) || /^\d+(?:\s*[-–]\s*\d+)?$/.test(reps)) &&
    !/\b(hold|plank|sprint|run|mile|miles|yard|yd|yds|meter|meters|min|mins|minute|minutes|sec|secs|second|seconds)\b/i.test(reps) &&
    !/\b(plank|wall sit|hollow body|bear crawl|carry|carries|farmer|run|jog|sprint|time trial|shuttle)\b/i.test(name)
  ) {
    return false;
  }

  // Name matching for runs, carries, sprints
  return /\b(run|runs|running|jog|jogging|sprint|sprints|tempo\s+run|tempo\s+jog|intervals|bear\s+crawl\s+hold|carry|carries|farmer\s+walk|farmers\s+walk|farmer\s+walks|farmers\s+walks|ruck|rucking|spin|bike|rower|skierg|active\s+recovery|shakeout|time\s+trial|shuttle)\b/i.test(
    name
  );
}

/**
 * Determines whether an exercise is performed purely with bodyweight (no external load),
 * so workout loggers do NOT ask the athlete for weight (lbs).
 * Explicitly weighted variants (e.g. "Weighted Pull-Ups", "Weighted Dips", "Weighted Planks",
 * "Barbell", "Dumbbell", "Kettlebell") still return false.
 */
export function isBodyweightExercise(
  exerciseName: string,
  contextText?: string
): boolean {
  const name = (exerciseName || '').toLowerCase().trim();
  if (!name) return false;

  // Explicitly weighted / vest variations ALWAYS ask for weight
  if (
    /\b(weighted|weight\s+vest|plate\s+carrier|vested|with\s+vest|on\s+belt|dip\s+belt|chains?)\b/i.test(
      name
    )
  ) {
    return false;
  }

  const hasExplicitExternalEquipmentTool =
    /\b(barbell|bb|dumbbell|dumbbells|db|kettlebell|kettlebells|kb|ez[-\s]?bar|trap\s*bar|hex\s*bar|safety\s*squat\s*bar|cambered\s*bar|cable|cables|pulley|machine|smith|landmine|sandbag|sled|prowler|slamball|slam\s*ball|medicine\s*ball|med\s*ball|wall\s*ball|plate|plates|t-bar|lat\s+pulldown|pulldown|leg\s+press|hack\s+squat|pendulum\s+squat|seated\s+leg\s+curl|lying\s+leg\s+curl|leg\s+extension|goblet|dummy\s+drag|battle\s+rope|banded)\b/i.test(
      name
    );

  if (hasExplicitExternalEquipmentTool) {
    return false;
  }

  // Explicitly labeled as Bodyweight / Unweighted (even for lunge, RDL, hip thrust, calf raise, squat patterns)
  if (/\b(bodyweight|bw|unweighted|zero[-\s]equipment)\b/i.test(name)) {
    return true;
  }

  const hasCommonWeightedMovementPattern =
    /\b(sumo\s+deadlift|front\s+squat|back\s+squat|zercher|romanian\s+deadlift|rdl|deadlift|rack\s+pull|good\s+morning|hip\s+thrust|bench\s+press|floor\s+press|incline\s+press|overhead\s+press|ohp|shoulder\s+press|strict\s+press|push\s+press|z-press|z\s+press|arnold\s+press|military\s+press|pallof\s+press|chest\s+press|chest-supported|preacher\s+curl|hammer\s+curl|bicep\s+curl|tricep\s+pushdown|skull\s*crusher|shrug|farmer|farmers|suitcase|woodchopper|band\s+pull-?apart)\b/i.test(
      name
    );

  if (hasCommonWeightedMovementPattern) {
    return false;
  }

  // Bodyweight calisthenics, core, isometric holds, and unloaded speed/agility/cardio
  const isCalisthenicMovement =
    /\b(calisthenics?|air\s+squat|air\s+squats|squat\s+jump|squat\s+jumps|jump\s+squat|jump\s+squats|box\s+jump|box\s+jumps|broad\s+jump|broad\s+jumps|depth\s+jump|depth\s+jumps|tuck\s+jump|tuck\s+jumps|l-hop|l-hops|pogo\s+hop|pogo\s+hops|ice\s+skater|ice\s+skaters|skater|skaters|squat\s+thrust|burpee|burpees|sprawl|sprawls|push-?up|push-?ups|pushup|pushups|pull-?up|pull-?ups|pullup|pullups|chin-?up|chin-?ups|chinup|chinups|muscle-?up|muscle-?ups|inverted\s+(?:bodyweight\s+)?row|inverted\s+rows|trx\s+row|trx\s+rows|ring\s+row|ring\s+rows|pike\s+push|diamond\s+push|hand-release|scapular\s+push|bench\s+dip|box\s+dip|ring\s+dip|dip|dips|plank|planks|copenhagen|side\s+plank|hollow\s+body|hollow\s+rock|hollow\s+rocks|hollow\s+hold|hollow\s+holds|dead\s+bug|dead\s+bugs|deadbug|deadbugs|bird-?dog|bird-?dogs|mcgill|superman|supermans|prone\s+y-t-w|wall\s+sit|wall\s+sits|dead\s+hang|dead\s+hangs|active\s+hang|passive\s+hang|l-sit|mountain\s+climber|mountain\s+climbers|flutter\s+kick|flutter\s+kicks|bicycle\s+crunch|v-?up|v-?ups|sit-?up|sit-?ups|situp|situps|crunch|crunches|leg\s+raise|leg\s+raises|knee\s+raise|knee\s+raises|toes\s+to\s+bar|hanging\s+(?:knee|leg|l-sit)|ab\s+wheel|rollout|rollouts|russian\s+twist|russian\s+twists|bear\s+crawl|crab\s+walk|glute\s+bridge|glute\s+bridges|single-?leg\s+bridge|clamshell|clamshells|fire\s+hydrant|sorensen|back\s+extension|hyperextension|nordic|slider\s+leg\s+curl|jumping\s+jack|jumping\s+jacks|high\s+knee|high\s+knees|butt\s+kick|inchworm|inchworms|mobility|stretch|stretching|foam\s+roll|yoga|cat-cow|90\/90|sprint|sprints|shuttle|shuttles|pro\s+agility|t-drill|agility\s+run|agility\s+runs|zone\s+2\s+run|aerobic\s+run|recovery\s+run|tempo\s+run|tempo\s+runs|finisher\s+run|assault\s+bike|air\s+bike|airdyne|echo\s+bike|treadmill|rowing\s+machine|skierg)\b/i.test(
      name
    );

  if (isCalisthenicMovement) {
    return true;
  }

  // If the entire workout/program explicitly enforces Bodyweight-Only mode (and movement isn't explicitly weighted)
  const ctx = (contextText || '').toLowerCase();
  if (
    /\b(bodyweight\s+only|bodyweight-only|100%\s+bodyweight|zero\s+weighted|zero\s+equipment|calisthenics\s+only)\b/i.test(
      ctx
    )
  ) {
    return true;
  }

  return false;
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

