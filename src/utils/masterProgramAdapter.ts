import {
  ProgramKey,
  MuscleGroup,
  WorkoutProgram,
  ExerciseTemplate,
  SupersetMovementItem,
  BlockMovementItem,
} from '../types';
import {
  PROTOCOL_DATA,
  ProtocolDay,
  ProtocolPhase,
  parseExerciseString,
  getApexWeekData,
  getTacticalHypertrophyWeekData,
  getUniversalPatWeekData,
} from '../data/protocolData';
import {
  extractBannedMovements,
  BannedLimitation,
  getDistinctCircuitForDay,
  sanitizeExerciseList,
} from './tacticalExerciseEngine';
import {
  getExerciseFormat,
  isSupersetExercise,
  parseSupersetDetails,
  parseEmomDetails,
  parseAmrapDetails,
  inferMovementMuscleGroup,
} from './workoutFormats';
import {
  GeneratedWorkoutPlan,
  GeneratedDay,
  GeneratedExercise,
  WorkoutGenerationRequest,
} from './aiWorkoutService';

export interface MasterProgramMetadata {
  key: ProgramKey;
  title: string;
  shortTitle: string;
  subtitle: string;
  nativeWeeks: number;
  recommendedWeeksOptions: number[];
  frequency: string;
  category: 'Strength' | 'Hypertrophy' | 'Athletic Conditioning' | 'Power' | 'Hybrid';
  summary: string;
  defaultEquipment: string;
}

export const MASTER_PROGRAMS_CATALOG: MasterProgramMetadata[] = [
  {
    key: 'apex_protocol',
    title: 'Law Enforcement 52-Week Fitness & Readiness Program',
    shortTitle: '52-Week LEO Readiness',
    subtitle: '4-Quarter Periodized Strength, Running Stamina, Pursuit Speed & Use-of-Force Readiness',
    nativeWeeks: 52,
    recommendedWeeksOptions: [4, 8, 12, 26, 52],
    frequency: '5-6 Days / Week',
    category: 'Hybrid',
    summary: 'Comprehensive 52-week annual tactical periodization across 4 Quarters (Aerobic Base & Core, Running Stamina & Grappling Strength, Limit Strength & Pursuit Speed, and Use-of-Force Simulation Peak) with mandatory 10-minute DIME warm-ups and low-end set/rep progression.',
    defaultEquipment: 'Full Commercial Gym (Barbells, DBs, Cables, Sandbag/Sled)',
  },
  {
    key: 'tactical_hypertrophy',
    title: '12-Week Tactical Bodybuilding Program',
    shortTitle: 'Tactical Bodybuilding',
    subtitle: '3-Phase Power-Building, Speed & Pursuit Split (Starts Sunday • Mandatory Daily DIME)',
    nativeWeeks: 12,
    recommendedWeeksOptions: [4, 8, 12],
    frequency: '6 Days / Week (Starts Sunday • 4 Lift + 2 Speed/Cond)',
    category: 'Hypertrophy',
    summary: '12-week Sunday–Saturday periodization across Phase 1 (Armor & Base), Phase 2 (Power-Building), and Phase 3 (Peak & Velocity) with Double Progression (+5 upper / +10 lower), Deload Weeks 4/8/12 (-40% sets), Bad Shift Protocol, Mandatory Daily 8-Min DIME Warm-Up, and Zero Olympic Lift, Burpee, Sandbag, or Jump Rope guardrails.',
    defaultEquipment: 'Full Commercial Gym (Barbells, DBs, Cables, Sled, Med Ball)',
  },
  {
    key: 'hybrid_protocol',
    title: 'Patrol Ready 12-Week Hybrid Protocol',
    shortTitle: '12-Week Hybrid Protocol',
    subtitle: '3-Phase Periodized Strength & Running Architecture (Full Gym or AI DB/Bodyweight)',
    nativeWeeks: 12,
    recommendedWeeksOptions: [4, 8, 12],
    frequency: '5 Days / Week',
    category: 'Hybrid',
    summary: 'Three 4-week mesocycles (Foundation, Intensification, Peak Performance) blending compound strength with track intervals, tempo runs, and long aerobic endurance. Easily adapts to Dumbbell & Bodyweight setups via the AI Adaptation Engine.',
    defaultEquipment: 'Full Gym or AI-Adapted Dumbbells & Bodyweight',
  },
  {
    key: 'universal_pat',
    title: 'Universal Police PAT & Academy Readiness',
    shortTitle: 'Universal PAT Protocol',
    subtitle: '8-Week Academy & POST Physical Agility Test Prep',
    nativeWeeks: 8,
    recommendedWeeksOptions: [4, 8, 12],
    frequency: '5 Days / Week',
    category: 'Athletic Conditioning',
    summary: 'Targeted preparation for law enforcement physical agility tests: 1.5-mile benchmark runs, 300m anaerobic sprints, 165 lb dummy drag simulation, box jumps, and cadence push-up/sit-up density.',
    defaultEquipment: 'Full Commercial Gym (Barbells, DBs, Cables, Machines)',
  },
];

export function getMasterProgramMetadata(key?: ProgramKey | string): MasterProgramMetadata {
  const normalizedKey = key === 'hybrid_db' ? 'hybrid_protocol' : key;
  const found = MASTER_PROGRAMS_CATALOG.find((p) => p.key === normalizedKey);
  return found || MASTER_PROGRAMS_CATALOG[0];
}

function inferMuscleGroupFromName(name: string): MuscleGroup {
  const lower = name.toLowerCase();
  if (lower.includes('squat') || lower.includes('lunge') || lower.includes('step-up') || lower.includes('leg press') || lower.includes('calf') || lower.includes('sled') || lower.includes('box jump')) {
    return 'Quads';
  }
  if (lower.includes('deadlift') || lower.includes('rdl') || lower.includes('romanian') || lower.includes('hip thrust') || lower.includes('glute') || lower.includes('hamstring') || lower.includes('leg curl') || lower.includes('swing') || lower.includes('sorensen') || lower.includes('hyperextension')) {
    return 'Hamstrings & Glutes';
  }
  if (lower.includes('bench') || lower.includes('floor press') || lower.includes('push-up') || lower.includes('pushup') || lower.includes('dip') || lower.includes('fly') || lower.includes('chest pass')) {
    return 'Chest';
  }
  if (lower.includes('pull-up') || lower.includes('pullup') || lower.includes('chin-up') || lower.includes('row') || lower.includes('pulldown') || lower.includes('face pull') || lower.includes('shrug')) {
    return 'Back';
  }
  if (lower.includes('overhead') || lower.includes('ohp') || lower.includes('military') || lower.includes('push press') || lower.includes('z-press') || lower.includes('lateral raise') || lower.includes('landmine') || lower.includes('shoulder') || lower.includes('arnold')) {
    return 'Shoulders';
  }
  if (lower.includes('curl') || lower.includes('tricep') || lower.includes('skull') || lower.includes('wrist') || lower.includes('close-grip') || lower.includes('pushdown')) {
    return 'Arms';
  }
  if (lower.includes('plank') || lower.includes('pallof') || lower.includes('hollow') || lower.includes('sit-up') || lower.includes('knee raise') || lower.includes('leg raise') || lower.includes('tuck') || lower.includes('twist') || lower.includes('rollout') || lower.includes('core') || lower.includes('deadbug') || lower.includes('crunch')) {
    return 'Core';
  }
  return 'Full Body';
}

function isRecoveryPlaceholder(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.startsWith('stretching') ||
    lower.startsWith('passive foam') ||
    lower.startsWith('complete rest') ||
    lower.startsWith('complete physiological') ||
    lower.startsWith('recovery / active') ||
    lower.startsWith('full recovery') ||
    lower.startsWith('yoga or') ||
    lower.startsWith('none') ||
    lower.startsWith('refuel and rest') ||
    lower.startsWith('pre-sprint neuromuscular')
  );
}

/**
 * Equipment adaptation: swaps barbell/machine movements when athlete only has Dumbbells or Bodyweight
 */
function adaptExerciseForEquipment(
  exerciseName: string,
  equipmentList: string[]
): { name: string; adapted: boolean; reason?: string } {
  const eqStr = (equipmentList || []).join(' ').toLowerCase();
  const hasFullGym = eqStr.includes('commercial') || eqStr.includes('barbell');
  if (hasFullGym) {
    return { name: exerciseName, adapted: false };
  }

  const isBodyweightOnly =
    eqStr.includes('bodyweight') &&
    !eqStr.includes('dumbbell') &&
    !eqStr.includes('kettlebell');
  const lower = exerciseName.toLowerCase();

  if (isBodyweightOnly) {
    if (lower.includes('leg press')) {
      return { name: 'Close-Stance Tempo Bodyweight Squats (3-2-1 Tempo)', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('squat') && !lower.includes('split')) {
      return { name: 'Tempo Bodyweight Squat to Pause (3-2-1 Tempo)', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('split squat') || lower.includes('lunge')) {
      return { name: 'Rear-Foot Elevated Bulgarian Split Squat (Bodyweight Tempo)', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('leg curl')) {
      return { name: 'Eccentric Hamstring Walkouts / Slider Curl', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('deadlift') || lower.includes('rdl') || lower.includes('romanian') || lower.includes('hip thrust')) {
      return { name: 'Single-Leg Bodyweight Hip Thrust & Hamstring Walkout', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('med-ball') || lower.includes('chest pass')) {
      return { name: 'Explosive Plyometric Push-Ups (Full Reset)', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('pushdown') || lower.includes('skullcrusher') || lower.includes('overhead cable')) {
      return { name: 'Strict Diamond Push-Ups or Bench Tricep Dips', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('dip') && lower.includes('close-grip')) {
      return { name: 'Parallel Bar or Bench Tricep Dips (Controlled Eccentric)', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('bench') || lower.includes('floor press') || lower.includes('incline')) {
      return { name: 'Deficit Hand-Release Push-Ups (Feet Elevated)', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('lateral raise')) {
      return { name: 'Prone Y-T-W Scapular Raises (Slow Tempo)', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('face pull')) {
      return { name: 'Prone Y-T-W External Rotation Holds', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('overhead') || lower.includes('ohp') || lower.includes('push press') || lower.includes('z-press')) {
      return { name: 'Elevated Pike Push-Ups (Strict Shoulder Press)', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('pull-up') || lower.includes('lat pulldown')) {
      return { name: 'Strict Bodyweight Pull-Ups or Inverted Table Rows', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('row')) {
      return { name: 'Inverted Bodyweight Table / Bar Rows (Pause at Top)', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('shrug')) {
      return { name: 'Scapular Pull-Up Holds (2-Sec Peak Squeeze)', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('calf')) {
      return { name: 'Single-Leg Elevated Bodyweight Calf Raises (2s Stretch)', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('sled')) {
      return { name: 'Explosive Broad Jumps or 20m Hill Accelerations', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('kettlebell swing')) {
      return { name: 'Explosive Broad Jumps (Step Back & Full Reset)', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('pallof')) {
      return { name: 'Side Plank Anti-Rotation Holds (30s/side)', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('cable crunch')) {
      return { name: 'Strict Hanging Knee Raises or Hollow Body Rocks', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('assault bike')) {
      return { name: 'Shuttle Accelerations (15s Sprint / 45s Walk Recovery)', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('farmer') || lower.includes('carry')) {
      return { name: 'Bear Crawl Hold & Isometric Core Brace', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    if (lower.includes('curl')) {
      return { name: 'Underhand Chin-Up Negative Holds', adapted: true, reason: 'Adapted for Bodyweight Equipment' };
    }
    return { name: exerciseName, adapted: false };
  }

  // Dumbbell / Kettlebell Home Gym Adaptation (No Barbell / Cables / Machines)
  if (lower.includes('trap bar deadlift or front squat')) {
    return { name: 'Heavy Dual-Dumbbell Front Squat or Trap-Stance DB Deadlift', adapted: true, reason: 'Swapped Barbell/Trap Bar for Dumbbells' };
  }
  if (lower.includes('leg press')) {
    return { name: 'Heavy Goblet Squat (3-Second Eccentric)', adapted: true, reason: 'Swapped Machine for Dumbbells' };
  }
  if (lower.includes('barbell back squat') || lower.includes('front squat') || lower === 'back squat') {
    return { name: 'Heavy Dumbbell Goblet Squat or Dual-DB Front Squat', adapted: true, reason: 'Swapped Barbell for Dumbbells' };
  }
  if (lower.includes('trap bar deadlift') || (lower.includes('deadlift') && !lower.includes('romanian') && !lower.includes('rdl') && !lower.includes('dumbbell'))) {
    return { name: 'Heavy Dual-Dumbbell Deadlift (Suitcase Stance)', adapted: true, reason: 'Swapped Barbell/Trap Bar for Dumbbells' };
  }
  if (lower.includes('romanian deadlift') || lower.includes('rdl')) {
    if (!lower.includes('dumbbell') && !lower.includes('db')) {
      return { name: 'Heavy Dumbbell Romanian Deadlift (RDL)', adapted: true, reason: 'Swapped Barbell for Dumbbells' };
    }
  }
  if (lower.includes('incline barbell') || lower.includes('barbell incline')) {
    return { name: 'Incline Dumbbell Bench Press (30°)', adapted: true, reason: 'Swapped Barbell for Dumbbells' };
  }
  if (lower.includes('barbell bench') || lower.includes('flat barbell bench')) {
    return { name: 'Heavy Dumbbell Floor Press or Flat DB Bench Press', adapted: true, reason: 'Swapped Barbell for Dumbbells' };
  }
  if (lower.includes('close-grip barbell') || lower.includes('close-grip bench')) {
    return { name: 'Weighted Dips or Neutral-Grip Crush Dumbbell Press', adapted: true, reason: 'Swapped Barbell for Dumbbells' };
  }
  if (lower.includes('overhead barbell') || lower.includes('strict overhead press') || lower.includes('military overhead press') || lower.includes('barbell z-press')) {
    return { name: 'Seated or Standing Dual-Dumbbell Overhead Press', adapted: true, reason: 'Swapped Barbell for Dumbbells' };
  }
  if (lower.includes('push press') && !lower.includes('dumbbell')) {
    return { name: 'Dual-Dumbbell Push Press', adapted: true, reason: 'Swapped Barbell for Dumbbells' };
  }
  if (lower.includes('med-ball') || lower.includes('chest pass')) {
    return { name: 'Explosive Plyometric Push-Ups (Full Reset)', adapted: true, reason: 'Adapted for Dumbbell Home Gym' };
  }
  if (lower.includes('cable tricep pushdown')) {
    return { name: 'Seated Dumbbell Overhead Triceps Extensions', adapted: true, reason: 'Swapped Cable for Dumbbells' };
  }
  if (lower.includes('skullcrushers or overhead cable') || lower.includes('skullcrusher')) {
    return { name: 'Dumbbell Skullcrushers or Overhead DB Triceps Extension', adapted: true, reason: 'Swapped Barbell/Cable for Dumbbells' };
  }
  if (lower.includes('weighted pull-ups or lat pulldowns')) {
    return { name: 'Pull-Ups or Heavy Single-Arm Dumbbell Rows', adapted: true, reason: 'Adapted for Dumbbell Home Gym' };
  }
  if (lower.includes('barbell bent-over row') || lower.includes('pendlay') || lower.includes('t-bar')) {
    return { name: 'Chest-Supported Dual-Dumbbell Row', adapted: true, reason: 'Swapped Barbell for Dumbbells' };
  }
  if (lower.includes('face pull')) {
    return { name: 'Bent-Over Rear Delt Dumbbell Flyes (External Rotation)', adapted: true, reason: 'Swapped Cable for Dumbbells' };
  }
  if (lower.includes('barbell or heavy dumbbell shrugs') || lower.includes('barbell shrug')) {
    return { name: 'Heavy Dumbbell Shrugs (2-Sec Top Pause)', adapted: true, reason: 'Swapped Barbell for Dumbbells' };
  }
  if (lower.includes('barbell hip thrust')) {
    return { name: 'Heavy Dumbbell Hip Thrusts (Back on Bench)', adapted: true, reason: 'Swapped Barbell for Dumbbells' };
  }
  if (lower.includes('lying or seated leg curls')) {
    return { name: 'Dumbbell Hamstring Leg Curls or Slider Curls', adapted: true, reason: 'Swapped Machine for Dumbbells' };
  }
  if (lower.includes('heavy sled push') || lower.includes('sled push')) {
    return { name: 'Heavy Dumbbell Split-Stance Marches or Kettlebell Swings', adapted: true, reason: 'Swapped Sled for Dumbbells' };
  }
  if (lower.includes('standing calf') || lower.includes('barbell calf')) {
    return { name: 'Standing Dumbbell Calf Raises (2s Pause)', adapted: true, reason: 'Swapped Machine/Barbell for Dumbbells' };
  }
  if (lower.includes('ez-bar') || lower.includes('barbell ez-curl') || lower.includes('barbell curl')) {
    return { name: 'Strict Dumbbell Supinating Biceps Curls', adapted: true, reason: 'Swapped Barbell/EZ-Bar for Dumbbells' };
  }
  if (lower.includes('cable crunches')) {
    return { name: 'Ab-Wheel Rollouts or Weighted Decline Sit-Ups', adapted: true, reason: 'Swapped Cable for Home Core' };
  }
  if (lower.includes('pallof press')) {
    return { name: 'Dumbbell Anti-Rotation Plank Pull-Throughs', adapted: true, reason: 'Swapped Cable for Dumbbells' };
  }
  if (lower.includes('trap bar farmer')) {
    return { name: "Heavy Dumbbell Farmer's Walks", adapted: true, reason: 'Swapped Trap Bar for Dumbbells' };
  }

  return { name: exerciseName, adapted: false };
}

/**
 * Scales sets, reps, rest seconds, and target RPE based on ability level and week deload/peak status
 */
function scalePrescriptionForAbility(
  defaultSets: number,
  targetReps: string,
  restSeconds: number,
  fitnessLevel: string,
  isCompound: boolean,
  isDeloadWeek: boolean,
  isPeakWeek: boolean,
  weekNum: number
): {
  sets: number;
  reps: string;
  rest: number;
  rpe: number;
  scalingSummary?: string;
} {
  const level = (fitnessLevel || 'Intermediate').toLowerCase();
  let sets = defaultSets;
  let reps = targetReps;
  let rest = restSeconds;
  let rpe = isCompound ? 8.0 : 8.0;
  const adjustments: string[] = [];

  if (level.includes('beginner')) {
    if (sets >= 4) {
      sets = sets - 1;
      adjustments.push(`-1 set for Beginner recovery`);
    }
    rpe = isCompound ? 7.0 : 7.5;
    rest = restSeconds + 20;
    // Slightly higher rep target on heavy low-rep sets for motor learning
    if (/^[345]$/.test(reps.trim())) {
      reps = '6-8';
      adjustments.push(`6-8 reps for motor control`);
    }
    adjustments.push(`RPE ${rpe} cap`);
  } else if (level.includes('advanced')) {
    rpe = isCompound ? 8.5 : 8.5;
    if (isCompound && weekNum % 4 === 3) {
      sets = Math.min(5, sets + 1);
      adjustments.push(`+1 peak volume set`);
    }
    adjustments.push(`RPE ${rpe} intensity`);
  } else if (level.includes('elite')) {
    if (isCompound && sets < 5) {
      sets = sets + 1;
      adjustments.push(`+1 Elite working set`);
    }
    rpe = isCompound ? 9.0 : 8.5;
    adjustments.push(`Elite RPE ${rpe}`);
  } else {
    // Intermediate baseline
    // Apply subtle weekly wave progression across 4-week blocks
    const blockWeek = ((weekNum - 1) % 4) + 1;
    if (blockWeek === 1) rpe = 7.5;
    else if (blockWeek === 2) rpe = 8.0;
    else if (blockWeek === 3) rpe = 8.5;
  }

  if (isDeloadWeek) {
    sets = Math.max(2, sets - 1);
    rpe = 6.5;
    adjustments.push(`Deload Week (-1 set, RPE 6.5)`);
  } else if (isPeakWeek && isCompound) {
    rpe = Math.min(9.5, rpe + 0.5);
    adjustments.push(`Peak Benchmark Effort`);
  }

  return {
    sets,
    reps,
    rest,
    rpe,
    scalingSummary: adjustments.length > 0 ? adjustments.join(' • ') : undefined,
  };
}

function selectSafeDistinctCircuit(
  dayNum: number,
  cardioCircuitType: string | undefined,
  bannedRules: BannedLimitation[]
) {
  for (let offset = 0; offset < 12; offset++) {
    const candidate = getDistinctCircuitForDay(dayNum - 1 + offset, cardioCircuitType, bannedRules);
    const haystack = `${candidate.name} ${(candidate.circuitStations || []).join(' ')}`.toLowerCase();
    const violates = bannedRules.some((r) => r.forbiddenRegex.test(haystack));
    if (!violates) {
      return candidate;
    }
  }
  return getDistinctCircuitForDay(dayNum - 1, cardioCircuitType, bannedRules);
}

/**
 * Adapts the master program's running / conditioning prescription for ability level & injuries
 */
function adaptMasterConditioning(
  dayRun: string,
  dayPace: string,
  dayNum: number,
  weekNum: number,
  fitnessLevel: string,
  bannedRules: BannedLimitation[],
  cardioPreference?: string,
  runningDistPref?: string,
  cardioCircuitType?: string,
  skipSupplementalRunOnRestRun?: boolean
): GeneratedExercise[] {
  const results: GeneratedExercise[] = [];
  const runClean = (dayRun || '').trim();
  const lowerRun = runClean.toLowerCase();
  const isRestRun =
    !runClean ||
    lowerRun.startsWith('rest') ||
    lowerRun.startsWith('complete rest') ||
    lowerRun === 'n/a' ||
    lowerRun.includes('optional 15-min light walk');

  const hasRunBan = bannedRules.some(
    (r) => r.keyword === 'run' || r.keyword === 'jump' || r.keyword === 'lunge'
  );
  const level = (fitnessLevel || 'Intermediate').toLowerCase();

  // Case 1: User explicitly wants Cardio Circuits instead of running, OR has a lower-body impact injury banning runs
  if (cardioPreference === 'cardio_circuits' || (hasRunBan && !isRestRun)) {
    const circuitEx = selectSafeDistinctCircuit(dayNum, cardioCircuitType, bannedRules);
    const originalLabel = !isRestRun ? runClean : 'Master Conditioning Slot';
    const scaledRounds = level.includes('beginner')
      ? Math.max(2, circuitEx.defaultSets - 1)
      : level.includes('elite')
      ? circuitEx.defaultSets + 1
      : circuitEx.defaultSets;

    results.push({
      ...circuitEx,
      id: `adapt-circuit-d${dayNum}`,
      defaultSets: scaledRounds,
      targetReps: `${scaledRounds} rounds (${level.includes('beginner') ? '35s Work / 25s Rest' : '40s Work / 20s Rest'})`,
      originalExerciseName: originalLabel,
      adaptationReason: hasRunBan
        ? `Swapped "${originalLabel}" to Low-Impact Tactical Circuit for joint protection`
        : `Adapted to ${cardioCircuitType || 'Tactical Conditioning Circuit'} (${scaledRounds} rounds for ${fitnessLevel})`,
      notes: `${circuitEx.notes} [Adapted from Master Program: ${originalLabel}]`,
    });
    return results;
  }

  // Case 2: Master program has a scheduled run/conditioning session on this day
  if (!isRestRun) {
    let adaptedRunName = runClean;
    let adaptedTargetReps = runClean;
    let adaptedPace = dayPace || 'Zone 2 Conversational Pace';
    let adaptationReason: string | undefined;

    // Scale distance or minutes in the run title for Beginner / Advanced / Elite
    const mileRangeMatch = runClean.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*Miles?/i);
    const mileMatch = runClean.match(/(\d+(?:\.\d+)?)[-\s]*Miles?/i);
    const minMatch = runClean.match(/(\d+)\s*Min/i);
    const repeatMatch = runClean.match(/(\d+)\s*x\s*(\d+m)/i);

    if (level.includes('beginner')) {
      if (mileRangeMatch) {
        const origLow = parseFloat(mileRangeMatch[1]);
        const origHigh = parseFloat(mileRangeMatch[2]);
        const scaledLow = Math.max(1.0, parseFloat((origLow * 0.75).toFixed(1)));
        const scaledHigh = Math.max(scaledLow + 0.3, parseFloat((origHigh * 0.75).toFixed(1)));
        adaptedRunName = runClean.replace(mileRangeMatch[0], `${scaledLow}–${scaledHigh} Miles`);
        adaptedTargetReps = `${scaledLow}–${scaledHigh} Miles`;
        adaptationReason = `Scaled from ${origLow}–${origHigh} Miles (-25% volume for Beginner tier)`;
      } else if (mileMatch) {
        const origMiles = parseFloat(mileMatch[1]);
        const scaledMiles = Math.max(1.0, parseFloat((origMiles * 0.75).toFixed(1)));
        adaptedRunName = runClean.replace(mileMatch[0], `${scaledMiles} Mile`);
        adaptedTargetReps = `${scaledMiles} Miles`;
        adaptationReason = `Scaled from ${origMiles} Miles (-25% volume for Beginner tier)`;
      } else if (minMatch) {
        const origMins = parseInt(minMatch[1], 10);
        const scaledMins = Math.max(15, Math.round((origMins * 0.75) / 5) * 5);
        adaptedRunName = runClean.replace(minMatch[0], `${scaledMins} Min`);
        adaptedTargetReps = `${scaledMins} Mins`;
        adaptationReason = `Scaled from ${origMins} Mins (-25% duration for Beginner tier)`;
      } else if (repeatMatch) {
        const origReps = parseInt(repeatMatch[1], 10);
        const scaledReps = Math.max(3, origReps - 2);
        adaptedRunName = runClean.replace(repeatMatch[0], `${scaledReps} x ${repeatMatch[2]}`);
        adaptedTargetReps = `${scaledReps} x ${repeatMatch[2]} Intervals`;
        adaptationReason = `Scaled from ${origReps} repeats to ${scaledReps} repeats for Beginner tier`;
      }
      adaptedPace = `${adaptedPace} [Beginner Scaling: Add +45-60s/mi cushion or walk-jog intervals as needed]`;
    } else if (level.includes('elite')) {
      if (mileRangeMatch) {
        const origLow = parseFloat(mileRangeMatch[1]);
        const origHigh = parseFloat(mileRangeMatch[2]);
        const scaledLow = parseFloat((origLow * 1.15).toFixed(1));
        const scaledHigh = parseFloat((origHigh * 1.15).toFixed(1));
        adaptedRunName = runClean.replace(mileRangeMatch[0], `${scaledLow}–${scaledHigh} Miles`);
        adaptedTargetReps = `${scaledLow}–${scaledHigh} Miles`;
        adaptationReason = `Scaled from ${origLow}–${origHigh} Miles (+15% volume for Elite tier)`;
      } else if (mileMatch) {
        const origMiles = parseFloat(mileMatch[1]);
        const scaledMiles = parseFloat((origMiles * 1.15).toFixed(1));
        adaptedRunName = runClean.replace(mileMatch[0], `${scaledMiles} Mile`);
        adaptedTargetReps = `${scaledMiles} Miles`;
        adaptationReason = `Scaled from ${origMiles} Miles (+15% volume for Elite tier)`;
      } else if (repeatMatch) {
        const origReps = parseInt(repeatMatch[1], 10);
        const scaledReps = origReps + 1;
        adaptedRunName = runClean.replace(repeatMatch[0], `${scaledReps} x ${repeatMatch[2]}`);
        adaptedTargetReps = `${scaledReps} x ${repeatMatch[2]} Intervals`;
        adaptationReason = `Scaled from ${origReps} to ${scaledReps} repeats for Elite tier`;
      }
    }

    results.push({
      id: `adapt-run-d${dayNum}`,
      name: adaptedRunName,
      muscleGroup: 'Full Body',
      type: 'cardio',
      defaultSets: 1,
      targetReps: adaptedTargetReps,
      restPeriodSeconds: 0,
      targetRpe: lowerRun.includes('interval') || lowerRun.includes('sprint') || lowerRun.includes('benchmark') ? 8.5 : 7.0,
      originalExerciseName: adaptationReason ? runClean : undefined,
      adaptationReason,
      notes: `Target Pace: ${adaptedPace} (Week ${weekNum})`,
    });
  } else if (cardioPreference === 'running' && !skipSupplementalRunOnRestRun) {
    // Master day had no run, but user requested running on every training day
    const dist = runningDistPref || '1.5-2.0 Miles';
    results.push({
      id: `adapt-extra-run-d${dayNum}`,
      name: `Supplemental Tactical Aerobic Run (${dist})`,
      muscleGroup: 'Full Body',
      type: 'cardio',
      defaultSets: 1,
      targetReps: dist,
      restPeriodSeconds: 0,
      targetRpe: 7,
      adaptationReason: `Added per athlete running preference (${dist})`,
      notes: `Zone 2 steady aerobic add-on (${dist}) following strength work.`,
    });
  }

  // If hybrid preference, also append a distinct conditioning circuit on non-interval lift days
  if (cardioPreference === 'hybrid' && results.length === 0) {
    const circuitEx = selectSafeDistinctCircuit(dayNum, cardioCircuitType, bannedRules);
    results.push({
      ...circuitEx,
      id: `adapt-hybrid-circuit-d${dayNum}`,
      adaptationReason: `Added Hybrid Conditioning Circuit (${fitnessLevel} scaling)`,
    });
  }

  return results;
}

/**
 * Retrieves the authentic ProtocolPhase for a given Master Program and week number (1..52)
 */
function getMasterPhaseForWeek(baseKey: ProgramKey, weekNum: number, totalWeeksRequested: number): ProtocolPhase {
  if (baseKey === 'apex_protocol') {
    // If user requested a 12-week condensed cycle across the 4 Quarters of the 52-week program:
    // Weeks 1-3 -> Quarter 1, Weeks 4-6 -> Quarter 2, Weeks 7-9 -> Quarter 3, Weeks 10-12 -> Quarter 4
    if (totalWeeksRequested === 12) {
      const mappedApexWeek =
        weekNum <= 3
          ? weekNum // Weeks 1-3 (Quarter 1)
          : weekNum <= 6
          ? 13 + (weekNum - 3) // Weeks 14-16 (Quarter 2)
          : weekNum <= 9
          ? 26 + (weekNum - 6) // Weeks 27-29 (Quarter 3)
          : 39 + (weekNum - 9); // Weeks 40-42 (Quarter 4)
      return getApexWeekData(Math.min(52, mappedApexWeek));
    }
    return getApexWeekData(Math.min(52, weekNum));
  }

  if (baseKey === 'tactical_hypertrophy') {
    const cycleWeek = ((weekNum - 1) % 12) + 1;
    return getTacticalHypertrophyWeekData(cycleWeek);
  }

  if (baseKey === 'universal_pat') {
    const cycleWeek = ((weekNum - 1) % 8) + 1;
    return getUniversalPatWeekData(cycleWeek);
  }

  // Default: 'hybrid_protocol' (also covers any legacy 'hybrid_db' key)
  if (weekNum <= 4) return PROTOCOL_DATA.phase1;
  if (weekNum <= 8) return PROTOCOL_DATA.phase2;
  return PROTOCOL_DATA.phase3;
}

export interface AdaptationSummaryStats {
  baseProgramKey: ProgramKey | string;
  baseProgramTitle: string;
  totalWeeks: number;
  totalDays: number;
  fitnessLevel: string;
  clinicalSwapsCount: number;
  equipmentSwapsCount: number;
  scaledExercisesCount: number;
  conditioningAdaptationsCount: number;
  activeInjuryGuardrails: string[];
}

/**
 * Helper to run both equipment & injury substitution on a single movement name.
 */
function adaptSingleMovement(
  rawName: string,
  mg: MuscleGroup,
  notes: string | undefined,
  equipmentList: string[],
  bannedRules: BannedLimitation[]
): {
  name: string;
  eqSwapped: boolean;
  clinicalSwapped: boolean;
  reason?: string;
} {
  const eqResult = adaptExerciseForEquipment(rawName, equipmentList);
  let workingName = eqResult.name;
  let reason = eqResult.reason;
  let clinicalSwapped = false;

  if (bannedRules.length > 0) {
    const sanitizedArr = sanitizeExerciseList(
      [{ name: workingName, muscleGroup: mg, notes }],
      bannedRules
    );
    const afterSanitize = sanitizedArr[0];
    if (afterSanitize.name !== workingName) {
      workingName = afterSanitize.name;
      reason = `Clinically swapped from "${rawName}" (${bannedRules.map((b) => b.label).join(', ')})`;
      clinicalSwapped = true;
    }
  }

  return {
    name: workingName,
    eqSwapped: eqResult.adapted,
    clinicalSwapped,
    reason,
  };
}

/**
 * Adapts a Coach-published custom program or standalone single workout across injuries, equipment & ability level
 * while faithfully preserving Straight Sets, Supersets, EMOMs, AMRAPs, and Circuits.
 */
export function adaptCustomCoachProgram(params: WorkoutGenerationRequest): GeneratedWorkoutPlan {
  const customProg = params.customProgram!;
  const fitnessLevel = params.fitnessLevel || 'Intermediate';
  const levelLower = fitnessLevel.toLowerCase();
  const isSingleWorkout = customProg.programKind === 'single_workout';

  const weeksCount = isSingleWorkout
    ? 1
    : typeof params.scheduleWeeks === 'number' && params.scheduleWeeks >= 1 && params.scheduleWeeks <= 12
    ? Math.round(params.scheduleWeeks)
    : 4;

  const rawLimitations = [
    ...(params.injuries || []),
    params.injuryNotes || '',
    params.notes || '',
  ].join(' ');
  const bannedRules = extractBannedMovements(rawLimitations, params.injuries || []);

  const templateDays =
    customProg.schedule && customProg.schedule.length > 0
      ? customProg.schedule
      : [
          {
            day: 1,
            focus: customProg.title,
            isRestDay: false,
            exercises: customProg.exercises || [],
          },
        ];

  const schedule: GeneratedDay[] = [];
  let clinicalSwapsCount = 0;
  let equipmentSwapsCount = 0;
  let scaledExercisesCount = 0;
  let conditioningAdaptationsCount = 0;

  let globalDayCounter = 0;

  for (let weekNum = 1; weekNum <= weeksCount; weekNum++) {
    const isDeloadWeek = !isSingleWorkout && (weekNum === 4 || weekNum === 8 || weekNum === 12);
    const isPeakWeek = !isSingleWorkout && weekNum === weeksCount && weeksCount >= 4 && !isDeloadWeek;

    templateDays.forEach((srcDay, dayIdx) => {
      globalDayCounter += 1;
      const srcExercises = srcDay.exercises || [];

      if (srcDay.isRestDay || srcExercises.length === 0) {
        schedule.push({
          day: globalDayCounter,
          focus: isSingleWorkout
            ? srcDay.focus
            : `Week ${weekNum} • Day ${dayIdx + 1}: ${srcDay.focus}`,
          isRestDay: true,
          warmup: srcDay.warmup,
          exercises: [],
        });
        return;
      }

      const adaptedExercises: GeneratedExercise[] = srcExercises.map((tmpl: ExerciseTemplate, exIdx: number) => {
        const format = getExerciseFormat(tmpl);
        const uid = `adapt-coach-w${weekNum}-d${dayIdx + 1}-b${exIdx + 1}`;

        // 1. SUPERSET BLOCK
        if (format === 'superset') {
          const parsedSS = parseSupersetDetails(tmpl);
          const adaptedMovements: SupersetMovementItem[] = parsedSS.movements.map((mov) => {
            const movMg = mov.muscleGroup || inferMovementMuscleGroup(mov.name);
            const res = adaptSingleMovement(mov.name, movMg, mov.notes || tmpl.notes, params.equipment || [], bannedRules);
            if (res.eqSwapped) equipmentSwapsCount++;
            if (res.clinicalSwapped) clinicalSwapsCount++;

            const scaledMov = scalePrescriptionForAbility(
              tmpl.defaultSets || parsedSS.rounds,
              mov.targetReps || '10',
              tmpl.restPeriodSeconds || 75,
              fitnessLevel,
              false,
              isDeloadWeek,
              isPeakWeek,
              weekNum
            );

            return {
              ...mov,
              name: res.name,
              muscleGroup: movMg,
              targetReps: scaledMov.reps,
              originalExerciseName: res.name !== mov.name ? mov.name : undefined,
              adaptationReason: res.reason,
            };
          });

          const scaledRounds = scalePrescriptionForAbility(
            tmpl.defaultSets || parsedSS.rounds || 3,
            tmpl.targetReps || '10',
            tmpl.restPeriodSeconds || 75,
            fitnessLevel,
            exIdx === 0,
            isDeloadWeek,
            isPeakWeek,
            weekNum
          );
          scaledExercisesCount++;

          const anySwap = adaptedMovements.find((m) => m.originalExerciseName);
          return {
            id: uid,
            name: adaptedMovements.map((m) => m.name).join(' + '),
            muscleGroup: tmpl.muscleGroup || 'Full Body',
            type: 'superset',
            format: 'superset',
            defaultSets: scaledRounds.sets,
            targetReps: adaptedMovements.map((m) => m.targetReps).join(' / '),
            restPeriodSeconds: scaledRounds.rest,
            targetRpe: scaledRounds.rpe,
            supersetExercises: adaptedMovements,
            originalExerciseName: anySwap ? parsedSS.title : undefined,
            adaptationReason: anySwap?.adaptationReason,
            scalingNote: scaledRounds.scalingSummary,
            notes: [
              anySwap ? `[ADAPTED: ${anySwap.adaptationReason}]` : '',
              scaledRounds.scalingSummary ? `[${fitnessLevel} Scaling: ${scaledRounds.scalingSummary}]` : '',
              tmpl.notes || '',
            ]
              .filter(Boolean)
              .join(' • '),
          };
        }

        // 2. EMOM BLOCK
        if (format === 'emom') {
          const parsedEmom = parseEmomDetails(tmpl);
          const adaptedMovements: BlockMovementItem[] = parsedEmom.movements.map((mov) => {
            const movMg = mov.muscleGroup || inferMovementMuscleGroup(mov.name);
            const res = adaptSingleMovement(mov.name, movMg, tmpl.notes, params.equipment || [], bannedRules);
            if (res.eqSwapped) equipmentSwapsCount++;
            if (res.clinicalSwapped) clinicalSwapsCount++;
            return {
              ...mov,
              name: res.name,
              muscleGroup: movMg,
              originalExerciseName: res.name !== mov.name ? mov.name : undefined,
              adaptationReason: res.reason,
            };
          });

          const origMins = parsedEmom.totalMinutes || 10;
          const scaledMins = levelLower.includes('beginner')
            ? Math.max(6, Math.round(origMins * 0.75))
            : levelLower.includes('elite')
            ? origMins + 2
            : isDeloadWeek
            ? Math.max(6, Math.round(origMins * 0.7))
            : origMins;

          const intervalSec = parsedEmom.intervalSeconds || 60;
          const roundCount = Math.max(1, Math.round((scaledMins * 60) / intervalSec));
          const targetRpe = levelLower.includes('beginner') ? 7 : levelLower.includes('elite') ? 9 : isDeloadWeek ? 6.5 : 8.5;
          conditioningAdaptationsCount++;

          const anySwap = adaptedMovements.find((m) => m.originalExerciseName);
          return {
            id: uid,
            name: tmpl.name,
            muscleGroup: tmpl.muscleGroup || 'Full Body',
            type: 'emom',
            format: 'emom',
            defaultSets: roundCount,
            targetReps: `${scaledMins} Min EMOM (Every ${intervalSec}s)`,
            restPeriodSeconds: 0,
            targetRpe,
            emomMinutes: scaledMins,
            emomIntervalSeconds: intervalSec,
            emomMovements: adaptedMovements,
            originalExerciseName: anySwap ? tmpl.name : undefined,
            adaptationReason: anySwap?.adaptationReason || (scaledMins !== origMins ? `Scaled EMOM from ${origMins}m to ${scaledMins}m for ${fitnessLevel}` : undefined),
            scalingNote: `${scaledMins}m @ RPE ${targetRpe}`,
            notes: tmpl.notes || 'Complete work cleanly inside each interval.',
          };
        }

        // 3. AMRAP BLOCK
        if (format === 'amrap') {
          const parsedAmrap = parseAmrapDetails(tmpl);
          const adaptedMovements: BlockMovementItem[] = parsedAmrap.movements.map((mov) => {
            const movMg = mov.muscleGroup || inferMovementMuscleGroup(mov.name);
            const res = adaptSingleMovement(mov.name, movMg, tmpl.notes, params.equipment || [], bannedRules);
            if (res.eqSwapped) equipmentSwapsCount++;
            if (res.clinicalSwapped) clinicalSwapsCount++;
            return {
              ...mov,
              name: res.name,
              muscleGroup: movMg,
              originalExerciseName: res.name !== mov.name ? mov.name : undefined,
              adaptationReason: res.reason,
            };
          });

          const origMins = parsedAmrap.durationMinutes || 12;
          const scaledMins = levelLower.includes('beginner')
            ? Math.max(6, Math.round(origMins * 0.75))
            : levelLower.includes('elite')
            ? origMins + 3
            : isDeloadWeek
            ? Math.max(6, Math.round(origMins * 0.7))
            : origMins;
          const targetRpe = levelLower.includes('beginner') ? 7.5 : levelLower.includes('elite') ? 9 : isDeloadWeek ? 6.5 : 8.5;
          conditioningAdaptationsCount++;

          const anySwap = adaptedMovements.find((m) => m.originalExerciseName);
          return {
            id: uid,
            name: tmpl.name,
            muscleGroup: tmpl.muscleGroup || 'Full Body',
            type: 'amrap',
            format: 'amrap',
            defaultSets: 1,
            targetReps: `${scaledMins} Min AMRAP`,
            restPeriodSeconds: tmpl.restPeriodSeconds || 120,
            targetRpe,
            amrapDurationMinutes: scaledMins,
            amrapMovements: adaptedMovements,
            originalExerciseName: anySwap ? tmpl.name : undefined,
            adaptationReason: anySwap?.adaptationReason || (scaledMins !== origMins ? `Scaled time cap from ${origMins}m to ${scaledMins}m for ${fitnessLevel}` : undefined),
            scalingNote: `${scaledMins}m Cap @ RPE ${targetRpe}`,
            notes: tmpl.notes || 'Steady sustained effort across full duration.',
          };
        }

        // 4. CIRCUIT BLOCK
        if (format === 'circuit') {
          const origStations = tmpl.circuitStations || [];
          const adaptedStations = origStations.map((st) => {
            const res = adaptSingleMovement(st, inferMovementMuscleGroup(st), tmpl.notes, params.equipment || [], bannedRules);
            if (res.eqSwapped) equipmentSwapsCount++;
            if (res.clinicalSwapped) clinicalSwapsCount++;
            return res.name;
          });

          const origRounds = tmpl.defaultSets || 4;
          const scaledRounds = levelLower.includes('beginner')
            ? Math.max(2, origRounds - 1)
            : levelLower.includes('elite')
            ? origRounds + 1
            : isDeloadWeek
            ? Math.max(2, origRounds - 1)
            : origRounds;
          const workSec = levelLower.includes('beginner') ? Math.max(25, (tmpl.workSeconds || 40) - 10) : (tmpl.workSeconds || 40);
          const restSec = levelLower.includes('beginner') ? (tmpl.restSeconds || 20) + 10 : (tmpl.restSeconds || 20);
          conditioningAdaptationsCount++;

          return {
            id: uid,
            name: tmpl.name,
            muscleGroup: tmpl.muscleGroup || 'Full Body',
            type: 'circuit',
            format: 'circuit',
            defaultSets: scaledRounds,
            targetReps: `${scaledRounds} Rounds (${workSec}s Work / ${restSec}s Rest)`,
            restPeriodSeconds: tmpl.restPeriodSeconds || 60,
            targetRpe: levelLower.includes('beginner') ? 7.5 : levelLower.includes('elite') ? 9 : 8.5,
            circuitStations: adaptedStations,
            workSeconds: workSec,
            restSeconds: restSec,
            scalingNote: `${scaledRounds} Rounds • ${workSec}s/${restSec}s`,
            notes: tmpl.notes || '',
          };
        }

        // 5. STRAIGHT SETS / CARDIO BLOCK
        const res = adaptSingleMovement(
          tmpl.name,
          tmpl.muscleGroup || inferMovementMuscleGroup(tmpl.name),
          tmpl.notes,
          params.equipment || [],
          bannedRules
        );
        if (res.eqSwapped) equipmentSwapsCount++;
        if (res.clinicalSwapped) clinicalSwapsCount++;

        const isCompound = exIdx <= 1 || (tmpl.restPeriodSeconds || 90) >= 120;
        const scaled = scalePrescriptionForAbility(
          tmpl.defaultSets || 3,
          tmpl.targetReps || '8-10',
          tmpl.restPeriodSeconds || 90,
          fitnessLevel,
          isCompound,
          isDeloadWeek,
          isPeakWeek,
          weekNum
        );
        scaledExercisesCount++;

        return {
          id: uid,
          name: res.name,
          muscleGroup: tmpl.muscleGroup || inferMovementMuscleGroup(res.name),
          type: tmpl.type || 'strength',
          format: 'straight',
          defaultSets: scaled.sets,
          targetReps: scaled.reps,
          restPeriodSeconds: scaled.rest,
          targetRpe: scaled.rpe,
          originalExerciseName: res.name !== tmpl.name ? tmpl.name : undefined,
          adaptationReason: res.reason,
          scalingNote: scaled.scalingSummary,
          notes: [
            res.reason ? `[ADAPTED: ${res.reason}]` : '',
            scaled.scalingSummary ? `[${fitnessLevel} Scaling: ${scaled.scalingSummary}]` : '',
            tmpl.notes || '',
          ]
            .filter(Boolean)
            .join(' • '),
        };
      });

      schedule.push({
        day: globalDayCounter,
        focus: isSingleWorkout
          ? `${srcDay.focus} (${fitnessLevel} Adapted)`
          : `Week ${weekNum} • Day ${dayIdx + 1}: ${srcDay.focus}`,
        isRestDay: false,
        warmup: srcDay.warmup,
        conditioning: srcDay.conditioning,
        exercises: adaptedExercises,
      });
    });
  }

  const activeInjuryLabels = bannedRules.map((r) => r.label);
  const adaptationStats: AdaptationSummaryStats = {
    baseProgramKey: customProg.id,
    baseProgramTitle: customProg.title,
    totalWeeks: weeksCount,
    totalDays: schedule.length,
    fitnessLevel,
    clinicalSwapsCount,
    equipmentSwapsCount,
    scaledExercisesCount,
    conditioningAdaptationsCount,
    activeInjuryGuardrails: activeInjuryLabels,
  };

  return {
    title: `${customProg.title} (${fitnessLevel} Adapted)`,
    subtitle: `Coach Risner Custom Blueprint • ${isSingleWorkout ? 'Single Session' : `${weeksCount} Weeks`} • ${fitnessLevel}`,
    category: customProg.category || 'Hybrid',
    frequency: customProg.frequency || (isSingleWorkout ? 'Single Workout Session' : `${templateDays.length} Days / Week`),
    scheduleDuration: isSingleWorkout
      ? 'Adapted Single Workout Session'
      : `${weeksCount}-Week Adapted Custom Program`,
    estimatedDurationMinutes: customProg.estimatedDurationMinutes || params.sessionDurationMinutes || 60,
    description: `Adapted from Coach Risner's custom blueprint "${customProg.title}" preserving Straight Sets, Supersets, EMOM, AMRAP, and Circuit structures calibrated for ${fitnessLevel} ability.`,
    coachingPhilosophy: `Format-Aware Coach Adaptation: Every paired Superset, EMOM interval, AMRAP time cap, and Circuit station keeps its intended metabolic stimulus while movements, volume, and RPE adapt around your injuries and gear.`,
    weeklyProgressionTips: [
      `Follow target RPE caps across Straight Sets and Supersets before increasing external load.`,
      activeInjuryLabels.length > 0
        ? `Joint Guardrails Active: ${clinicalSwapsCount} movement(s) inside Coach's template were safely swapped (${activeInjuryLabels.join(', ')}).`
        : `Ability Calibration (${fitnessLevel}): Sets, interval lengths, and RPE match your recovery profile.`,
    ],
    nutritionAdvice:
      'Consume 1.0g protein per lb lean body weight daily and prioritize hydration + electrolytes around conditioning blocks.',
    schedule,
    source: 'coach-custom-program-adapter',
    baseProgramKey: customProg.id,
    programKind: customProg.programKind || (isSingleWorkout ? 'single_workout' : 'program'),
    adaptationStats,
  };
}

/**
 * Core Master Program Adaptation Engine:
 * Takes Coach Risner's authentic master programs (or published custom programs/workouts)
 * and alters exercises, sets, reps, RPE, and conditioning based on injuries, ability level, and equipment.
 */
export function adaptMasterProgram(params: WorkoutGenerationRequest): GeneratedWorkoutPlan {
  if (params.customProgram) {
    return adaptCustomCoachProgram(params);
  }
  const rawKey = (params.baseProgramKey as ProgramKey) || 'apex_protocol';
  const baseKey: ProgramKey = rawKey === 'hybrid_db' ? 'hybrid_protocol' : rawKey;
  const meta = getMasterProgramMetadata(baseKey);
  const fitnessLevel = params.fitnessLevel || 'Intermediate';

  let weeksCount = meta.nativeWeeks;
  if (typeof params.scheduleWeeks === 'number' && params.scheduleWeeks >= 1 && params.scheduleWeeks <= 52) {
    weeksCount = Math.round(params.scheduleWeeks);
  } else if (params.scheduleDuration === '4weeks' || params.scheduleDuration === 'monthly') {
    weeksCount = 4;
  } else if (params.scheduleDuration === '6weeks') {
    weeksCount = 6;
  } else if (params.scheduleDuration === '8weeks') {
    weeksCount = 8;
  } else if (params.scheduleDuration === '12weeks') {
    weeksCount = 12;
  } else if (params.scheduleDuration === '26weeks') {
    weeksCount = 26;
  } else if (params.scheduleDuration === '52weeks' || params.scheduleDuration === 'full') {
    weeksCount = meta.nativeWeeks;
  }

  const rawLimitations = [
    ...(params.injuries || []),
    params.injuryNotes || '',
    params.notes || '',
  ].join(' ');
  const bannedRules = extractBannedMovements(rawLimitations, params.injuries || []);

  const schedule: GeneratedDay[] = [];
  let clinicalSwapsCount = 0;
  let equipmentSwapsCount = 0;
  let scaledExercisesCount = 0;
  let conditioningAdaptationsCount = 0;

  const is52WeekBuiltIn = baseKey === 'apex_protocol';
  const isTacticalBodybuilding = baseKey === 'tactical_hypertrophy';

  // Enforce 12-Week Tactical Bodybuilding architectural guardrails:
  // Zero Olympic lifts, burpees, sandbags, or jump ropes.
  const programBannedRules: BannedLimitation[] = isTacticalBodybuilding
    ? [
        ...bannedRules,
        {
          keyword: 'burpee',
          label: 'Zero Burpees Guardrail',
          forbiddenRegex: /\b(burpees?|combat\s*sprawls?)\b/i,
          substitutions: {
            chest: 'Explosive Med-Ball Chest Pass',
            back: 'Kettlebell Power Swings',
            quads: '50m Sled Push',
            hamstrings: 'Kettlebell Swings',
            shoulders: 'Sled Push Intervals',
            arms: 'Hammer Curls',
            core: 'Pallof Press',
            fullBody: 'Assault Bike Sprint Intervals (Zero Burpee Guardrail)',
          },
        },
        {
          keyword: 'sandbag_olympic_rope',
          label: 'Zero Olympic Lifts / Sandbags / Jump Ropes',
          forbiddenRegex: /\b(sandbag|jump\s*rope|double[-\s]?under|snatch|power\s*clean|hang\s*clean|clean\s*&\s*jerk)\b/i,
          substitutions: {
            chest: 'Explosive Med-Ball Chest Pass',
            back: 'Chest-Supported Dumbbell Row',
            quads: 'Heavy Sled Push or Box Jumps',
            hamstrings: 'Kettlebell Swings',
            shoulders: 'Seated Dumbbell Overhead Press',
            arms: 'EZ-Bar Curls',
            core: 'Pallof Press',
            fullBody: 'Heavy Sled Push & Kettlebell Swing Intervals',
          },
        },
      ]
    : bannedRules;

  for (let weekNum = 1; weekNum <= weeksCount; weekNum++) {
    const phaseData = getMasterPhaseForWeek(baseKey, weekNum, weeksCount);
    const isDeloadWeek = isTacticalBodybuilding
      ? weekNum === 4 || weekNum === 8 || weekNum === 12
      : (weekNum % 4 === 0 && weekNum !== 52) || weekNum === 51;
    const isPeakWeek = isTacticalBodybuilding
      ? weekNum === 11
      : (weekNum === weeksCount && weeksCount >= 4) || weekNum === 13 || weekNum === 26 || weekNum === 39 || weekNum === 52;

    phaseData.days.forEach((protoDay: ProtocolDay, dayIdx: number) => {
      const globalDayNum = (weekNum - 1) * 7 + (dayIdx + 1);
      const rawStrength = protoDay.strength || [];
      const realStrengthStrings = rawStrength.filter((s) => !isRecoveryPlaceholder(s));

      const hasRunBan = bannedRules.some(
        (r) => r.keyword === 'run' || r.keyword === 'jump' || r.keyword === 'lunge'
      );
      const tacticalHasConditioningInStrength =
        isTacticalBodybuilding && (dayIdx === 2 || dayIdx === 5);

      // Avoid duplicating Tuesday sprints/agility or Friday Zone 2 Flush on 12-Week Tactical Bodybuilding
      // since day.strength already holds the exact track/turf sprints, bike finisher, and Zone 2 Flush.
      const conditioningExercises =
        tacticalHasConditioningInStrength && params.cardioPreference !== 'cardio_circuits' && !hasRunBan
          ? []
          : adaptMasterConditioning(
              protoDay.run,
              protoDay.pace,
              globalDayNum,
              weekNum,
              is52WeekBuiltIn ? 'Intermediate' : fitnessLevel,
              programBannedRules,
              params.cardioPreference,
              params.runningDistancePreference,
              params.cardioCircuitType,
              isTacticalBodybuilding
            );

      conditioningExercises.forEach((cEx) => {
        if (cEx.adaptationReason) conditioningAdaptationsCount++;
      });

      const isRestDay =
        realStrengthStrings.length === 0 &&
        conditioningExercises.length === 0 &&
        (protoDay.focus.toLowerCase().includes('rest') ||
          protoDay.focus.toLowerCase().includes('recovery'));

      if (isRestDay) {
        schedule.push({
          day: globalDayNum,
          focus: `Week ${weekNum} • ${protoDay.day}: ${protoDay.focus}`,
          isRestDay: true,
          warmup: protoDay.warmup,
          exercises: [],
        });
        return;
      }

      const dayExercises: GeneratedExercise[] = [];

      realStrengthStrings.forEach((exStr, exIdx) => {
        // On Tactical Bodybuilding Tuesday/Friday, if athlete switched to Cardio Circuits or has a Run Ban,
        // skip the duplicate run/sprint items inside realStrengthStrings so the swapped circuit takes over cleanly.
        if (
          tacticalHasConditioningInStrength &&
          (params.cardioPreference === 'cardio_circuits' || hasRunBan) &&
          /\b(sprint|sprints|pro\s+agility|t-drill|zone\s*2\s*run)\b/i.test(exStr)
        ) {
          return;
        }

        const parsed = parseExerciseString(exStr);
        const originalName = parsed.name;

        // Superset Support inside Master Programs (e.g. Tactical Bodybuilding Sun/Mon/Wed supersets)
        if (isSupersetExercise({ name: originalName, notes: parsed.notes })) {
          const parsedSS = parseSupersetDetails({
            name: originalName,
            defaultSets: parsed.defaultSets,
            targetReps: parsed.targetReps,
            restPeriodSeconds: parsed.restSeconds,
            targetRpe: parsed.targetRpe,
            notes: parsed.notes,
          });

          const adaptedMovements: SupersetMovementItem[] = parsedSS.movements.map((mov) => {
            const movMg = mov.muscleGroup || inferMovementMuscleGroup(mov.name);
            const res = adaptSingleMovement(mov.name, movMg, parsed.notes, params.equipment || [], programBannedRules);
            if (res.eqSwapped) equipmentSwapsCount++;
            if (res.clinicalSwapped) clinicalSwapsCount++;

            const scaledMov = scalePrescriptionForAbility(
              parsedSS.rounds,
              mov.targetReps || '12-15',
              parsed.restSeconds || 75,
              fitnessLevel,
              false,
              isDeloadWeek,
              isPeakWeek,
              weekNum
            );

            return {
              ...mov,
              name: res.name,
              muscleGroup: movMg,
              targetReps: scaledMov.reps,
              originalExerciseName: res.name !== mov.name ? mov.name : undefined,
              adaptationReason: res.reason,
            };
          });

          const scaledRounds = scalePrescriptionForAbility(
            parsedSS.rounds,
            parsed.targetReps,
            parsed.restSeconds || 75,
            fitnessLevel,
            false,
            isDeloadWeek,
            isPeakWeek,
            weekNum
          );
          if (scaledRounds.sets !== parsedSS.rounds || fitnessLevel !== 'Intermediate') {
            scaledExercisesCount++;
          }

          const anySwap = adaptedMovements.find((m) => m.originalExerciseName);
          const noteParts: string[] = [];
          if (anySwap?.adaptationReason) noteParts.push(`[ADAPTED: ${anySwap.adaptationReason}]`);
          if (scaledRounds.scalingSummary) noteParts.push(`[${fitnessLevel} Scaling: ${scaledRounds.scalingSummary}]`);
          if (parsed.notes) noteParts.push(parsed.notes);

          dayExercises.push({
            id: `master-${baseKey}-w${weekNum}-d${dayIdx + 1}-ex${exIdx + 1}`,
            name: `Superset: ${adaptedMovements.map((m) => m.name).join(' + ')}`,
            muscleGroup: adaptedMovements[0]?.muscleGroup || 'Full Body',
            type: 'superset',
            format: 'superset',
            defaultSets: scaledRounds.sets,
            targetReps: adaptedMovements.map((m) => m.targetReps).join(' / '),
            restPeriodSeconds: scaledRounds.rest,
            targetRpe: scaledRounds.rpe,
            supersetExercises: adaptedMovements,
            originalExerciseName: anySwap ? originalName : undefined,
            adaptationReason: anySwap?.adaptationReason,
            scalingNote: scaledRounds.scalingSummary,
            notes: noteParts.join(' • '),
          });
          return;
        }

        const mg = inferMuscleGroupFromName(originalName);
        const isCompound = exIdx === 0 || exIdx === 1 || parsed.restSeconds >= 120;

        // 1. Equipment adaptation check
        const eqResult = adaptExerciseForEquipment(originalName, params.equipment || []);
        let workingName = eqResult.name;
        let adaptationReason = eqResult.reason;
        if (eqResult.adapted) {
          equipmentSwapsCount++;
        }

        // 2. Clinical injury & limitation swap check
        if (programBannedRules.length > 0) {
          const sanitizedArr = sanitizeExerciseList(
            [
              {
                name: workingName,
                muscleGroup: mg,
                notes: parsed.notes,
              },
            ],
            programBannedRules
          );
          const afterSanitize = sanitizedArr[0];
          if (afterSanitize.name !== workingName) {
            workingName = afterSanitize.name;
            adaptationReason = `Clinically swapped from "${originalName}" (${programBannedRules.map((b) => b.label).join(', ')})`;
            clinicalSwapsCount++;
          }
        }

        // 3. Ability level set/rep/RPE scaling
        // Excluded for the 52-Week Program since its progression, low-end start & deloads are already built in.
        let finalSets = parsed.defaultSets;
        let finalReps = parsed.targetReps;
        let finalRest = parsed.restSeconds;
        let finalRpe = parsed.targetRpe || 8.0;
        let scalingSummary: string | undefined;

        const isSprintOrConditioningDrill =
          /\b(sprint|sprints|pro\s+agility|t-drill|assault\s+bike|zone\s*2|med-ball|box\s+jumps|sled)\b/i.test(workingName);

        if (!is52WeekBuiltIn) {
          if (isSprintOrConditioningDrill && workingName.toLowerCase().includes('zone 2')) {
            // Preserve Zone 2 Flush duration target cleanly while allowing Beginner scaling
            finalSets = 1;
            finalReps = fitnessLevel.toLowerCase().includes('beginner') ? '20 mins Zone 2' : '25-30 mins Zone 2';
            finalRest = 0;
            finalRpe = 7.0;
          } else {
            const scaled = scalePrescriptionForAbility(
              parsed.defaultSets,
              parsed.targetReps,
              parsed.restSeconds,
              fitnessLevel,
              isCompound,
              isDeloadWeek,
              isPeakWeek,
              weekNum
            );
            finalSets = scaled.sets;
            finalReps = scaled.reps;
            finalRest = scaled.rest;
            finalRpe = scaled.rpe;
            scalingSummary = scaled.scalingSummary;

            if (scaled.sets !== parsed.defaultSets || scaled.reps !== parsed.targetReps || fitnessLevel !== 'Intermediate') {
              scaledExercisesCount++;
            }
          }
        }

        if (workingName === 'Bear Crawl Hold & Isometric Core Brace') {
          finalReps = '45s hold';
        } else if (workingName === 'Underhand Chin-Up Negative Holds') {
          finalReps = '30s hold';
        }

        const noteParts: string[] = [];
        if (adaptationReason) {
          noteParts.push(`[ADAPTED: ${adaptationReason}]`);
        }
        if (scalingSummary) {
          noteParts.push(`[${fitnessLevel} Scaling: ${scalingSummary}]`);
        }
        if (parsed.notes) {
          noteParts.push(parsed.notes);
        } else if (protoDay.progressionRule) {
          noteParts.push(protoDay.progressionRule);
        }

        const resolvedType =
          isSprintOrConditioningDrill &&
          (workingName.toLowerCase().includes('sprint') ||
            workingName.toLowerCase().includes('agility') ||
            workingName.toLowerCase().includes('t-drill') ||
            workingName.toLowerCase().includes('bike') ||
            workingName.toLowerCase().includes('zone 2'))
            ? 'cardio'
            : workingName === 'Bear Crawl Hold & Isometric Core Brace' || mg === 'Core'
            ? 'core'
            : 'strength';

        dayExercises.push({
          id: `master-${baseKey}-w${weekNum}-d${dayIdx + 1}-ex${exIdx + 1}`,
          name: workingName,
          muscleGroup: mg,
          type: resolvedType,
          defaultSets: finalSets,
          targetReps: finalReps,
          restPeriodSeconds: finalRest,
          targetRpe: finalRpe,
          originalExerciseName: workingName !== originalName ? originalName : undefined,
          adaptationReason,
          scalingNote: scalingSummary,
          notes: noteParts.join(' • '),
        });
      });

      // Append adapted running / conditioning exercises
      dayExercises.push(...conditioningExercises);

      const phaseBadge = isDeloadWeek
        ? `Wk ${weekNum} Deload`
        : isPeakWeek
        ? `Wk ${weekNum} Peak`
        : `Wk ${weekNum}`;

      schedule.push({
        day: globalDayNum,
        focus: `Day ${globalDayNum} (${phaseBadge}): ${protoDay.focus}`,
        isRestDay: false,
        warmup: protoDay.warmup,
        conditioning: protoDay.run,
        exercises: dayExercises,
      });
    });
  }

  const activeInjuryLabels = bannedRules.map((r) => r.label);
  const injuryBadge =
    activeInjuryLabels.length > 0
      ? ` • Adapted for ${activeInjuryLabels.slice(0, 2).join(' & ')}`
      : '';

  const effectiveAbilityLabel = is52WeekBuiltIn ? 'Built-In 52-Wk Progression' : fitnessLevel;

  const adaptationStats: AdaptationSummaryStats = {
    baseProgramKey: baseKey,
    baseProgramTitle: meta.title,
    totalWeeks: weeksCount,
    totalDays: schedule.length,
    fitnessLevel: effectiveAbilityLabel,
    clinicalSwapsCount,
    equipmentSwapsCount,
    scaledExercisesCount,
    conditioningAdaptationsCount,
    activeInjuryGuardrails: activeInjuryLabels,
  };

  return {
    title: is52WeekBuiltIn
      ? `${meta.shortTitle} (${activeInjuryLabels.length > 0 ? 'Injury-Adapted' : 'Built-In Progression'})`
      : `${meta.shortTitle} (${fitnessLevel} Adapted)`,
    subtitle: `Coach Risner Master Protocol • ${weeksCount} Weeks • ${effectiveAbilityLabel}${injuryBadge}`,
    category: meta.category,
    frequency: meta.frequency,
    scheduleDuration: `${weeksCount}-Week ${is52WeekBuiltIn ? '52-Wk Built-In Progression' : 'Adapted Master Protocol'} (${meta.shortTitle})`,
    estimatedDurationMinutes: params.sessionDurationMinutes || 60,
    description: is52WeekBuiltIn
      ? `Preserves Coach Risner's exact prescribed sets, reps, and built-in 52-week progression from "${meta.title}" across ${weeksCount} weeks (${schedule.length} days)${
          activeInjuryLabels.length > 0
            ? `, with ${clinicalSwapsCount} clinical movement swaps protecting: ${activeInjuryLabels.join(', ')}`
            : ''
        }${equipmentSwapsCount > 0 ? ` and ${equipmentSwapsCount} equipment substitutions` : ''}.`
      : `Directly adapted from Coach Risner's "${meta.title}" across ${weeksCount} weeks (${schedule.length} days). Customized for ${fitnessLevel} ability level${
          activeInjuryLabels.length > 0
            ? ` with ${clinicalSwapsCount} clinical movement swaps protecting: ${activeInjuryLabels.join(', ')}`
            : ''
        }${equipmentSwapsCount > 0 ? ` and ${equipmentSwapsCount} equipment substitutions` : ''}.`,
    coachingPhilosophy: is52WeekBuiltIn
      ? `Built-In 52-Week Progression + Joint/Equipment Protection: Sets and reps remain 100% faithful to the 52-week program's built-in 4-quarter progression, low-end range initialization, and 4th-week 40% deloads—while movements automatically adapt for your injuries and available gear.`
      : isTacticalBodybuilding
      ? `12-Week Tactical Bodybuilding Architecture: Preserves the Sunday–Saturday split (Armor & Base → Power-Building → Peak & Velocity), Mandated Daily 8-Min DIME Warm-Up, Deload Weeks 4/8/12 (-40% sets), Bad Shift Protocol, and strict Zero Olympic/Burpee/Sandbag/Jump-Rope guardrails while adapting equipment, injuries, and RPE to ${fitnessLevel}.`
      : `Master Program Integrity + Individualized Biomechanics: Instead of random exercises, you are running Coach Risner's exact ${meta.title} split and progression laws—with movements, sets, reps, target RPE, and conditioning calibrated to your current ability tier and joint profile.`,
    weeklyProgressionTips: [
      is52WeekBuiltIn
        ? `Built-In 3-Step Overload: Starts at the low end of prescribed set/rep ranges — 1. Reps First (hit top of rep range) → 2. Weight Second (+2.5–5 lbs upper / +5–10 lbs lower) → 3. Sets Third.`
        : isTacticalBodybuilding
        ? `Double Progression & Bad Shift Protocol: Add +5 lbs (upper) or +10 lbs (lower) once hitting top reps with 1–2 RIR. Off double shifts/4h sleep: halve secondary accessory sets, lift main compound @ 3 RIR, swap sprints for 20m Zone 2 flush.`
        : `Master Overload Law: Follow the prescribed rep targets on every compound lift. When you hit the top of the rep range at or below target RPE, add +5 lbs (upper) or +10 lbs (lower).`,
      activeInjuryLabels.length > 0
        ? `Clinical Joint Guardrail Active: ${clinicalSwapsCount} movements in ${meta.shortTitle} were automatically swapped to joint-sparing variations (${activeInjuryLabels.join(', ')}). Never force range of motion through pain.`
        : is52WeekBuiltIn
        ? `Built-In Sets & Reps Preserved: Rep and set prescriptions are excluded from ability scaling so your 52-week progression and Set 1 auto-pacing remain exact.`
        : isTacticalBodybuilding
        ? `Mandated Daily DIME & Guardrails: Complete the 8-Minute DIME Warm-Up before EVERY session. Zero Olympic lifts, burpees, sandbags, or jump ropes allowed.`
        : `Ability Tier Scaling (${fitnessLevel}): Sets, target RPE, and running volume have been calibrated to your ${fitnessLevel} recovery capacity.`,
      is52WeekBuiltIn
        ? `Every-4th-Week 40% Deloads & Set 1 Pacing: Weeks 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, and 48 cut volume 40%, while Set 1 auto-pacing calculates subsequent set weights in real time.`
        : isTacticalBodybuilding
        ? `12-Week Periodized Deload Rhythm: Weeks 4, 8, and 12 automatically cut working sets by 40% (~80% prior load, crisp speed) before transitioning between Phases 1–3.`
        : `Deload & Peak Rhythm: Week 4 and Week 8 automatically reduce working sets and cap RPE at 6.5 to flush systemic fatigue before the next intensification block.`,
    ],
    nutritionAdvice:
      'Consume 1.0g of high-quality protein per pound of lean body weight daily. Hydrate with 1/2 oz water per lb body weight + electrolytes prior to training and conditioning sessions.',
    schedule,
    source: 'master-program-adapter',
    baseProgramKey: baseKey,
    adaptationStats,
  };
}
