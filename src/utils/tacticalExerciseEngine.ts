import { MuscleGroup } from '../types';
import { GeneratedExercise, GeneratedDay, GeneratedWorkoutPlan, WorkoutGenerationRequest } from './aiWorkoutService';

export interface BannedLimitation {
  keyword: string;
  label: string;
  forbiddenRegex: RegExp;
  substitutions: {
    chest: string;
    back: string;
    quads: string;
    hamstrings: string;
    shoulders: string;
    arms: string;
    core: string;
    fullBody: string;
  };
}

export const KNOWN_LIMITATION_RULES: BannedLimitation[] = [
  {
    keyword: 'bench',
    label: 'Bench Press / Barbell Pressing',
    forbiddenRegex: /\b(bench\s*press|barbell\s*bench|incline\s*bench|flat\s*bench)\b/i,
    substitutions: {
      chest: 'Neutral-Grip Dumbbell Floor Press (Shoulder & Joint Safe)',
      back: 'Chest-Supported Dumbbell Seal Row',
      quads: 'Goblet Box Squat',
      hamstrings: 'High-Handle Trap Bar RDL',
      shoulders: 'Half-Kneeling Landmine Press',
      arms: 'Neutral-Grip Triceps Rope Extension',
      core: 'Pallof Anti-Rotation Cable Press',
      fullBody: 'Sandbag or Dumbbell Floor Press',
    },
  },
  {
    keyword: 'squat',
    label: 'Barbell Back / Heavy Squats',
    forbiddenRegex: /\b(back\s*squat|barbell\s*squat|front\s*squat|deep\s*squat)\b/i,
    substitutions: {
      chest: 'Dumbbell Floor Press',
      back: 'Barbell Pendlay Row',
      quads: 'Box Squat to Parallel (Vertical Shins) or Backward Sled Drag',
      hamstrings: 'High-Handle Trap Bar RDL (Knee & Hip Safe)',
      shoulders: 'Seated Dumbbell Shoulder Press',
      arms: 'Incline Dumbbell Biceps Curls',
      core: 'RKC High-Tension Plank',
      fullBody: 'Heavy Dumbbell Farmer Carries',
    },
  },
  {
    keyword: 'deadlift',
    label: 'Conventional Deadlift / Heavy Floor Pulls',
    forbiddenRegex: /\b(conventional\s*deadlift|deadlift\s*from\s*floor|barbell\s*deadlift)\b/i,
    substitutions: {
      chest: 'Dumbbell Incline Press',
      back: 'Chest-Supported Row',
      quads: 'Leg Press or Spanish Squat',
      hamstrings: 'Barbell Hip Thrusts with Back on Bench or Cable Pull-Throughs',
      shoulders: 'Standing Dumbbell Lateral Raise',
      arms: 'Hammer Curls',
      core: 'Hanging Knee Tucks',
      fullBody: 'Heavy Dumbbell Farmer Marches',
    },
  },
  {
    keyword: 'overhead',
    label: 'Overhead / Military Pressing',
    forbiddenRegex: /\b(overhead\s*press|military\s*press|push\s*press|behind\s*neck)\b/i,
    substitutions: {
      chest: 'Flat Dumbbell Press',
      back: 'Neutral-Grip Lat Pulldown',
      quads: 'Bulgarian Split Squat',
      hamstrings: 'Romanian Deadlift',
      shoulders: 'Half-Kneeling Angled Landmine Press (Zero Subacromial Pinch)',
      arms: 'Dumbbell Hammer Curls',
      core: 'Stir-the-Pot Stability Ball Plank',
      fullBody: 'Kettlebell Deadlift to High Pull (Shoulder Safe)',
    },
  },
  {
    keyword: 'pullup',
    label: 'Pull-Ups / Chin-Ups',
    forbiddenRegex: /\b(pull-?ups?|chin-?ups?)\b/i,
    substitutions: {
      chest: 'Push-Ups with Neutral Handles',
      back: 'Chest-Supported Neutral Row or Lat Pulldowns',
      quads: 'Goblet Squat',
      hamstrings: 'Hamstring Curls',
      shoulders: 'Face Pulls with External Rotation',
      arms: 'Barbell Biceps Curls',
      core: 'Hanging Leg Raise alternative: Dead Bug Core Brace',
      fullBody: 'Dumbbell Suitcase Carry',
    },
  },
  {
    keyword: 'lunge',
    label: 'Lunges / Deep Knee Flexion',
    forbiddenRegex: /\b(walking\s*lunge|lunges?|bulgarian\s*split\s*squat)\b/i,
    substitutions: {
      chest: 'Dumbbell Bench Press',
      back: 'Single-Arm Dumbbell Row',
      quads: 'Low Box Step-Ups or Banded Spanish Squats (Vertical Shin)',
      hamstrings: 'Glute Bridges / Hip Thrusts',
      shoulders: 'Dumbbell Lateral Raises',
      arms: 'Triceps Dips alternative: Cable Pushdowns',
      core: 'Side Plank Hip Lifts',
      fullBody: 'Backward Sled Drags',
    },
  },
  {
    keyword: 'run',
    label: 'Running / High Impact Jogging',
    forbiddenRegex: /\b(running|trail\s*run|sprint\s*intervals|jogging)\b/i,
    substitutions: {
      chest: 'Push-Up Density',
      back: 'Rowing Machine Low-Impact Ergometer (Zero Joint Impact)',
      quads: 'Assault Bike / AirDyne Low-Impact Flush',
      hamstrings: 'Incline Treadmill Ruck (Low Impact)',
      shoulders: 'Battle Ropes Wave Intervals',
      arms: 'Ski Erg / Assault Bike',
      core: 'Farmers Walk',
      fullBody: 'Assault Bike / Ergometer Low-Impact Cardio Intervals',
    },
  },
  {
    keyword: 'dip',
    label: 'Dips / Deep Shoulder Extension',
    forbiddenRegex: /\b(parallel\s*bar\s*dips?|chest\s*dips?|ring\s*dips?)\b/i,
    substitutions: {
      chest: 'Floor Press or Neutral Push-Ups',
      back: 'Seated Cable Row',
      quads: 'Goblet Squat',
      hamstrings: 'RDL',
      shoulders: 'Cable Lateral Raise',
      arms: 'Triceps Cable Rope Pushdowns (Elbow & Shoulder Safe)',
      core: 'Plank',
      fullBody: 'Kettlebell Swings',
    },
  },
  {
    keyword: 'burpee',
    label: 'Burpees / High-Impact Sprawls',
    forbiddenRegex: /\b(burpees?|combat\s*sprawls?)\b/i,
    substitutions: {
      chest: 'Hand-Release Push-Ups on Incline Bench',
      back: 'Kettlebell Power Swings',
      quads: 'Box Jumps or Step-Ups',
      hamstrings: 'Kettlebell Deadlift',
      shoulders: 'Slam Balls',
      arms: 'Farmer Carry',
      core: 'Mountain Climbers (Slow Strict Tempo)',
      fullBody: 'Heavy Kettlebell Swings (Hip Hinge Power - Zero Wrist/Knee Impact)',
    },
  },
];

/**
 * Extracts banned exercises from user free-form notes and injury lists.
 */
export function extractBannedMovements(rawText: string, injuries: string[] = []): BannedLimitation[] {
  const combined = [rawText, ...injuries].join(' ').toLowerCase();
  const matched: BannedLimitation[] = [];

  // Match keyword checks: "no bench", "can't do bench", "avoid squats", "cannot squat", "bad knees", etc.
  KNOWN_LIMITATION_RULES.forEach((rule) => {
    const isDirectlyNamed = new RegExp(
      `(?:no|not|can't|cannot|avoid|skip|bad|pain|injur|substitute|replace|without)\\s+(?:any\\s+)?(?:heavy\\s+)?(?:barbell\\s+)?(?:dumbbell\\s+)?${rule.keyword}`,
      'i'
    ).test(combined);

    const matchesForbidden = rule.forbiddenRegex.test(combined);
    
    // Check specific injury tags
    let isInjuryTrigger = false;
    if (rule.keyword === 'squat' && /knee|patell|meniscus|fai|labrum/i.test(combined)) {
      if (/no\s+squat|can't\s+squat|cannot\s+squat|avoid\s+squat/i.test(combined)) isInjuryTrigger = true;
    }
    if (rule.keyword === 'bench' && /shoulder|rotator|ac\s*joint/i.test(combined)) {
      if (/no\s+bench|can't\s+bench|cannot\s+bench|avoid\s+bench/i.test(combined)) isInjuryTrigger = true;
    }
    if (rule.keyword === 'overhead' && /shoulder|rotator|impingement/i.test(combined)) {
      isInjuryTrigger = true;
    }
    if (rule.keyword === 'run' && /shin\s*splint|plantar|stress\s*fracture|no\s*run/i.test(combined)) {
      isInjuryTrigger = true;
    }

    if (isDirectlyNamed || (matchesForbidden && /cannot|can't|no\s+|avoid|skip/i.test(combined)) || isInjuryTrigger) {
      if (!matched.some((m) => m.keyword === rule.keyword)) {
        matched.push(rule);
      }
    }
  });

  return matched;
}

/**
 * Sanitizes an individual exercise against user limitation rules.
 */
export function sanitizeExercise<T extends { name: string; notes?: string; muscleGroup?: any; circuitStations?: string[] }>(
  ex: T,
  bannedRules: BannedLimitation[]
): T {
  if (!bannedRules || bannedRules.length === 0) return ex;

  const exName = ex.name || '';
  const exNotes = ex.notes || '';
  const targetText = `${exName} ${exNotes}`.toLowerCase();

  // Check if this exercise matches any banned rule
  const violatingRule = bannedRules.find((rule) => rule.forbiddenRegex.test(targetText));

  if (violatingRule) {
    let replacementName = violatingRule.substitutions.fullBody;
    const mg = String(ex.muscleGroup || '').toLowerCase();
    if (mg.includes('chest')) replacementName = violatingRule.substitutions.chest;
    else if (mg.includes('back')) replacementName = violatingRule.substitutions.back;
    else if (mg.includes('quad')) replacementName = violatingRule.substitutions.quads;
    else if (mg.includes('hamstring') || mg.includes('glute')) replacementName = violatingRule.substitutions.hamstrings;
    else if (mg.includes('shoulder')) replacementName = violatingRule.substitutions.shoulders;
    else if (mg.includes('arm')) replacementName = violatingRule.substitutions.arms;
    else if (mg.includes('core')) replacementName = violatingRule.substitutions.core;

    return {
      ...ex,
      name: replacementName,
      notes: `SAFETY ADAPTATION: Replaced prohibited movement (${violatingRule.label}) with ${replacementName}. Optimized for joint protection while preserving training stimulus.`,
    };
  }

  // Also sanitize circuit stations if present
  if (Array.isArray(ex.circuitStations) && ex.circuitStations.length > 0) {
    const cleanedStations = ex.circuitStations.map((st) => {
      const match = bannedRules.find((rule) => rule.forbiddenRegex.test(st.toLowerCase()));
      if (match) {
        return `Joint-Safe Alternative: ${match.substitutions.fullBody}`;
      }
      return st;
    });
    return {
      ...ex,
      circuitStations: cleanedStations,
    };
  }

  return ex;
}

/**
 * Sanitizes an array of exercises against user limitation rules.
 */
export function sanitizeExerciseList<T extends { name: string; notes?: string; muscleGroup?: any; circuitStations?: string[] }>(
  exercises: T[],
  bannedRules: BannedLimitation[]
): T[] {
  if (!exercises || exercises.length === 0) return [];
  return exercises.map((ex) => sanitizeExercise(ex, bannedRules));
}

/**
 * Sanitizes every exercise in a workout plan by removing any exercise that
 * violates user limitations and replacing it with a safe biomechanical alternative.
 */
export function sanitizePlanAgainstLimitations(
  plan: GeneratedWorkoutPlan,
  bannedRules: BannedLimitation[]
): GeneratedWorkoutPlan {
  if (!bannedRules || bannedRules.length === 0) return plan;

  const sanitizedSchedule = (plan.schedule || []).map((day) => {
    if (!day.exercises || day.exercises.length === 0) return day;

    return {
      ...day,
      exercises: sanitizeExerciseList(day.exercises, bannedRules),
    };
  });

  return {
    ...plan,
    schedule: sanitizedSchedule,
  };
}

/**
 * Library of 12 distinct, high-impact tactical circuit archetypes
 * so the AI builder never repeats the same circuit movements.
 */
export interface TacticalCircuitTemplate {
  id: string;
  name: string;
  category: string;
  focus: string;
  rounds: number;
  workRest: string;
  restBetweenRoundsSeconds: number;
  stations: string[];
  executionCue: string;
}

export const TACTICAL_CIRCUIT_LIBRARY: TacticalCircuitTemplate[] = [
  {
    id: 'circuit-combat-kettlebell',
    name: 'Tactical Kettlebell Combat Flow',
    category: 'Full Body',
    focus: 'Rotational power, grip endurance, and posterior chain explosive speed.',
    rounds: 4,
    workRest: '40s Work / 20s Rest',
    restBetweenRoundsSeconds: 60,
    stations: [
      'Single-Arm Kettlebell Swings (alternating hands)',
      'Goblet Squats with pause at parallel',
      'Push-Up to Kettlebell Renegade Row',
      'Kettlebell High Pulls / Snatches',
    ],
    executionCue: 'Move station to station with zero delay. Snap hips aggressively on swings and maintain vertical torso on goblet squats.',
  },
  {
    id: 'circuit-pursuit-hiit',
    name: 'Duty Foot Pursuit & Anaerobic Sprint Circuit',
    category: 'Cardio & Pursuit',
    focus: 'Fast-twitch velocity, lactate threshold clearing, and rapid heartbeat recovery under fatigue.',
    rounds: 4,
    workRest: '30s Max Effort / 30s Active Recovery',
    restBetweenRoundsSeconds: 75,
    stations: [
      'Shuttle Sprints (10-20-10 Yard Shuttles)',
      'Explosive Combat Sprawls / Burpees to Stand',
      'Lateral Skater Hops / Bound Repeats',
      'Speed Mountain Climbers (Drive knees to chest)',
    ],
    executionCue: 'Simulates a foot pursuit transition to dynamic suspect control. Drive maximum leg drive and recover composure immediately.',
  },
  {
    id: 'circuit-swat-calisthenics',
    name: 'SWAT Bodyweight Armor & Chassis Metcon',
    category: 'Calisthenics',
    focus: 'Load carriage stamina, chest armor resilience, and rotational core stability without equipment.',
    rounds: 3,
    workRest: '45s Work / 15s Rest',
    restBetweenRoundsSeconds: 60,
    stations: [
      'Strict Hand-Release Push-Ups (Chest to deck)',
      'Explosive Jump Squats or Air Squats (Fast cadence)',
      'Inverted Rows under bar or Doorframe Pulls',
      'Hollow Body Rocks into Plank Shoulder Taps',
    ],
    executionCue: 'Lock down abdominal brace against duty belt line. Strive for consistent unbroken reps across all rounds.',
  },
  {
    id: 'circuit-sandbag-grinder',
    name: 'Tactical Sandbag & Heavy Load Grinder',
    category: 'Functional Strength',
    focus: 'Awkward load mechanics, anti-torsion trunk strength, and grappling grip power.',
    rounds: 4,
    workRest: '40s Work / 20s Rest',
    restBetweenRoundsSeconds: 60,
    stations: [
      'Sandbag Ground-to-Shoulder (Alternating sides)',
      'Bear Hug Loaded March / Squats',
      'Sandbag Floor Press or Clean to Press',
      'Burpee Over Sandbag (Lateral Jump)',
    ],
    executionCue: 'Treat the sandbag like a deadweight suspect or downed teammate. Keep spine neutral and lift through hips.',
  },
  {
    id: 'circuit-db-metcon',
    name: 'Dumbbell Metabolic Velocity Finisher',
    category: 'Full Body Density',
    focus: 'High work-density hypertrophy and oxygen uptake without barbell joint strain.',
    rounds: 4,
    workRest: '40s Work / 20s Rest',
    restBetweenRoundsSeconds: 60,
    stations: [
      'Dual Dumbbell Thrusters (Squat to Overhead Press)',
      'Dumbbell Suitcase Marches (Heavy grip brace)',
      'Dumbbell Romanian Deadlift to Shrug',
      'Dumbbell Push-Up to Hex Row',
    ],
    executionCue: 'Smooth transitions between movements. Choose moderate weights that allow continuous unbroken movement for 40 seconds.',
  },
  {
    id: 'circuit-erg-pursuit',
    name: 'Cardio Ergometer & Combat Power Intervals',
    category: 'Conditioning',
    focus: 'Anaerobic glycolytic capacity using non-impact machines.',
    rounds: 4,
    workRest: '45s Work / 15s Rest',
    restBetweenRoundsSeconds: 60,
    stations: [
      'Assault Bike or Rower Sprint (12-15 calories max pace)',
      'Medicine Ball or Dumbbell Slams (Explosive triple extension)',
      'Heavy Farmer Carry (60-80 lbs per hand)',
      'Hanging Knee Tucks or Plank Knee Drives',
    ],
    executionCue: 'Hit the ergometer with 90% power, transition immediately to the carries to test combat grip resilience.',
  },
  {
    id: 'circuit-core-armor',
    name: 'Combat Core & Anti-Rotation Duty Armor',
    category: 'Core & Trunk',
    focus: 'Resisting torso twisting, protecting lumbar spine against duty belt weight, and trunk bracing.',
    rounds: 3,
    workRest: '40s Work / 20s Rest',
    restBetweenRoundsSeconds: 45,
    stations: [
      'Pallof Cable or Band Anti-Rotation Hold',
      'Copenhagen Side Plank or Strict Side Plank with Hip Raise',
      'Heavy Sandbag or Dumbbell Suitcase Carry',
      'Hollow Body Flutter Kicks with overhead brace',
    ],
    executionCue: 'Zero twisting, zero spinal bending. Pure anti-flexion and anti-rotation stability.',
  },
  {
    id: 'circuit-pat-readiness',
    name: 'Police PAT Benchmark Obstacle Simulator',
    category: 'Academy Prep',
    focus: 'Push-up capacity, dummy drag simulation, directional change, and sprint recovery.',
    rounds: 3,
    workRest: '50s Work / 20s Rest',
    restBetweenRoundsSeconds: 60,
    stations: [
      'Cadence Push-Ups (1-second pause at top lockout)',
      'Backward Sled Drag or Heavy Dumbbell Heel Marches (Dummy Drag Sim)',
      'Box Step-Ups or Low Hurdle Lateral Bounds',
      'Stationary High-Knee Sprint Bursts',
    ],
    executionCue: 'Directly mimics physical ability test obstacles. Pace yourself to finish strong on station 4 without slowing down.',
  },
];

/**
 * Returns a distinct circuit template for a given day index, avoiding duplicates.
 */
export function getDistinctCircuitForDay(
  dayIndex: number,
  preferredStyle?: string,
  bannedRules: BannedLimitation[] = []
): GeneratedExercise {
  const library = [...TACTICAL_CIRCUIT_LIBRARY];
  // Select template based on index and style preference
  let chosen = library[dayIndex % library.length];

  if (preferredStyle) {
    const styleLower = preferredStyle.toLowerCase();
    const matched = library.find(
      (c) => c.name.toLowerCase().includes(styleLower) || c.category.toLowerCase().includes(styleLower)
    );
    if (matched) chosen = matched;
  }

  // Filter stations against banned rules
  const cleanStations = chosen.stations.map((st) => {
    for (const rule of bannedRules) {
      if (rule.forbiddenRegex.test(st)) {
        return rule.substitutions.fullBody;
      }
    }
    return st;
  });

  const formattedNotes = `Circuit Stations: 1. ${cleanStations[0]}, 2. ${cleanStations[1]}, 3. ${cleanStations[2]}, 4. ${cleanStations[3]}. ${chosen.executionCue}`;

  return {
    id: `ex-circuit-${dayIndex + 1}-${Date.now().toString(36)}`,
    name: `${chosen.name} (${chosen.rounds} Rounds)`,
    muscleGroup: 'Full Body',
    type: 'circuit',
    defaultSets: chosen.rounds,
    targetReps: `${chosen.rounds} rounds (${chosen.workRest})`,
    restPeriodSeconds: chosen.restBetweenRoundsSeconds,
    targetRpe: 8,
    notes: formattedNotes,
  };
}

/**
 * Massive tactical exercise library categorized by movement pattern and equipment
 * for dynamic, non-repetitive workout generation.
 */
export interface MovementPatternExercise {
  name: string;
  muscleGroup: MuscleGroup;
  equipment: ('barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'kettlebell')[];
  safeForShoulder: boolean;
  safeForLowerBack: boolean;
  safeForKnee: boolean;
  safeForHip: boolean;
  intensityTier: 'Strength' | 'Hypertrophy' | 'Endurance' | 'Any';
}

export const TACTICAL_EXERCISE_POOL: Record<string, MovementPatternExercise[]> = {
  horizontal_press: [
    { name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: ['barbell'], safeForShoulder: false, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Strength' },
    { name: 'Incline Dumbbell Bench Press', muscleGroup: 'Chest', equipment: ['dumbbell'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Hypertrophy' },
    { name: 'Neutral-Grip Dumbbell Floor Press', muscleGroup: 'Chest', equipment: ['dumbbell'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Any' },
    { name: 'Weighted Push-Ups or Deficit Push-Ups', muscleGroup: 'Chest', equipment: ['bodyweight'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Endurance' },
    { name: 'Standing Cable Chest Press', muscleGroup: 'Chest', equipment: ['cable'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Hypertrophy' },
    { name: 'Dumbbell Svend Press & Hex Press Superset', muscleGroup: 'Chest', equipment: ['dumbbell'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Hypertrophy' },
  ],
  horizontal_pull: [
    { name: 'Barbell Pendlay Row', muscleGroup: 'Back', equipment: ['barbell'], safeForShoulder: true, safeForLowerBack: false, safeForKnee: true, safeForHip: true, intensityTier: 'Strength' },
    { name: 'Chest-Supported Dumbbell Seal Row', muscleGroup: 'Back', equipment: ['dumbbell'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Hypertrophy' },
    { name: 'Single-Arm Dumbbell Meadow Row', muscleGroup: 'Back', equipment: ['dumbbell'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Hypertrophy' },
    { name: 'Seated Cable Row (Neutral Grip)', muscleGroup: 'Back', equipment: ['cable'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Any' },
    { name: 'Inverted Bodyweight TRX Rows', muscleGroup: 'Back', equipment: ['bodyweight'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Endurance' },
    { name: 'Face Pulls with Rope & External Rotation', muscleGroup: 'Back', equipment: ['cable'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Any' },
  ],
  vertical_press: [
    { name: 'Standing Overhead Barbell Military Press', muscleGroup: 'Shoulders', equipment: ['barbell'], safeForShoulder: false, safeForLowerBack: false, safeForKnee: true, safeForHip: true, intensityTier: 'Strength' },
    { name: 'Seated Dumbbell Arnold Press', muscleGroup: 'Shoulders', equipment: ['dumbbell'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Hypertrophy' },
    { name: 'Half-Kneeling Landmine Angled Press', muscleGroup: 'Shoulders', equipment: ['barbell'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Any' },
    { name: 'Dumbbell High-Incline Scapular Press', muscleGroup: 'Shoulders', equipment: ['dumbbell'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Hypertrophy' },
    { name: 'Pike Push-Ups on Elevated Box', muscleGroup: 'Shoulders', equipment: ['bodyweight'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Endurance' },
  ],
  vertical_pull: [
    { name: 'Strict Pull-Ups (Overhand Grip)', muscleGroup: 'Back', equipment: ['bodyweight'], safeForShoulder: false, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Strength' },
    { name: 'Neutral-Grip Lat Pulldown', muscleGroup: 'Back', equipment: ['cable', 'machine'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Hypertrophy' },
    { name: 'Single-Arm Half-Kneeling Cable Pulldown', muscleGroup: 'Back', equipment: ['cable'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Hypertrophy' },
    { name: 'Straight-Arm Cable Scapular Pushdowns', muscleGroup: 'Back', equipment: ['cable'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Endurance' },
  ],
  quad_dominant: [
    { name: 'Barbell Back Squat', muscleGroup: 'Quads', equipment: ['barbell'], safeForShoulder: false, safeForLowerBack: false, safeForKnee: false, safeForHip: false, intensityTier: 'Strength' },
    { name: 'Box Squat to Parallel (Vertical Shins)', muscleGroup: 'Quads', equipment: ['barbell', 'dumbbell'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Any' },
    { name: 'Goblet Squats with Heavy Dumbbell or Kettlebell', muscleGroup: 'Quads', equipment: ['dumbbell', 'kettlebell'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Hypertrophy' },
    { name: 'Bulgarian Split Squats (Foot Elevated)', muscleGroup: 'Quads', equipment: ['dumbbell', 'bodyweight'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: false, safeForHip: false, intensityTier: 'Hypertrophy' },
    { name: 'Backward Sled Drags / Pushes', muscleGroup: 'Quads', equipment: ['bodyweight'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Any' },
    { name: 'Banded Spanish Squats', muscleGroup: 'Quads', equipment: ['bodyweight'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Hypertrophy' },
  ],
  hip_hinge: [
    { name: 'Conventional Barbell Deadlift', muscleGroup: 'Hamstrings & Glutes', equipment: ['barbell'], safeForShoulder: true, safeForLowerBack: false, safeForKnee: true, safeForHip: false, intensityTier: 'Strength' },
    { name: 'High-Handle Trap Bar Deadlift', muscleGroup: 'Hamstrings & Glutes', equipment: ['barbell'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Strength' },
    { name: 'Romanian Deadlift (Dumbbell or Barbell)', muscleGroup: 'Hamstrings & Glutes', equipment: ['dumbbell', 'barbell'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Hypertrophy' },
    { name: 'Barbell or Dumbbell Hip Thrusts (Neutral Pelvis)', muscleGroup: 'Hamstrings & Glutes', equipment: ['barbell', 'dumbbell'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Hypertrophy' },
    { name: 'Heavy Kettlebell Power Swings', muscleGroup: 'Hamstrings & Glutes', equipment: ['kettlebell', 'dumbbell'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Endurance' },
    { name: 'Back Extensions on Roman Chair with Weight', muscleGroup: 'Hamstrings & Glutes', equipment: ['bodyweight', 'dumbbell'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Any' },
  ],
  core_and_carry: [
    { name: 'Heavy Dumbbell Farmer Carries (60 yds)', muscleGroup: 'Full Body', equipment: ['dumbbell', 'kettlebell'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Any' },
    { name: 'Standing Single-Arm Suitcase March', muscleGroup: 'Core', equipment: ['dumbbell', 'kettlebell'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Any' },
    { name: 'Hanging Knee Raises into Strict Tucks', muscleGroup: 'Core', equipment: ['bodyweight'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Endurance' },
    { name: 'Pallof Anti-Rotation Cable Press & Hold', muscleGroup: 'Core', equipment: ['cable'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Any' },
    { name: 'RKC Plank with Maximum Glute/Core Contraction', muscleGroup: 'Core', equipment: ['bodyweight'], safeForShoulder: true, safeForLowerBack: true, safeForKnee: true, safeForHip: true, intensityTier: 'Any' },
  ],
};

/**
 * Builds a dynamic, varied workout schedule tailored strictly to settings,
 * equipment, goals, and limitations when Gemini is offline or unavailable.
 */
export function buildDynamicCalibratedPlan(params: WorkoutGenerationRequest): GeneratedWorkoutPlan {
  const goalStr = (params.goals || []).join(' ').toLowerCase();
  const isStrength = goalStr.includes('strength') || goalStr.includes('power');
  const isHypertrophy = goalStr.includes('hypertrophy') || goalStr.includes('muscle');
  const isEndurance = goalStr.includes('endurance') || goalStr.includes('loss') || goalStr.includes('shred');
  const isPat = goalStr.includes('pat') || goalStr.includes('police') || goalStr.includes('academy');
  const isHybrid = goalStr.includes('hybrid') || goalStr.includes('ruck');

  const category = isPat
    ? 'Athletic Conditioning'
    : isStrength
    ? 'Strength'
    : isHypertrophy
    ? 'Hypertrophy'
    : isEndurance
    ? 'Athletic Conditioning'
    : 'Hybrid';

  const daysPerWeek = parseInt(params.frequency, 10) || 4;
  const isMonthly = params.scheduleDuration === 'monthly';
  const totalDays = isMonthly ? 28 : 7;
  const level = params.fitnessLevel || 'Intermediate';

  // Parse limitations
  const rawLimitations = [
    ...(params.injuries || []),
    params.injuryNotes || '',
    params.notes || '',
  ].join(' ');
  const bannedRules = extractBannedMovements(rawLimitations, params.injuries || []);

  // Sets and reps calibration
  const setsCompound = isStrength ? 4 : isHypertrophy ? 4 : isEndurance ? 3 : 3;
  const repsCompound = isStrength
    ? (level === 'Beginner' ? '5 reps' : '3-5 reps')
    : isHypertrophy
    ? '8-10 reps'
    : isEndurance
    ? '12-15 reps'
    : '6-8 reps';

  const setsAccessory = isStrength ? 3 : isHypertrophy ? 3 : 3;
  const repsAccessory = isStrength ? '6-8 reps' : isHypertrophy ? '10-12 reps' : '15-20 reps';
  const restCompound = isStrength ? 150 : isHypertrophy ? 90 : 60;
  const restAccessory = isStrength ? 90 : isHypertrophy ? 60 : 45;

  const schedule: GeneratedDay[] = [];

  // Determine split strategy
  // 3 Days: Full Body A, B, C
  // 4 Days: Upper A, Lower A, Upper B, Lower B
  // 5 Days: Push, Pull, Legs, Upper Armor, Tactical Metcon
  // 6 Days: Push, Pull, Legs, Push, Pull, Legs
  for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
    const cycleDay = ((dayNum - 1) % 7) + 1;
    let isTrainingDay = false;

    if (daysPerWeek === 3) isTrainingDay = [1, 3, 5].includes(cycleDay);
    else if (daysPerWeek === 4) isTrainingDay = [1, 2, 4, 5].includes(cycleDay);
    else if (daysPerWeek === 5) isTrainingDay = [1, 2, 3, 5, 6].includes(cycleDay);
    else if (daysPerWeek === 6) isTrainingDay = [1, 2, 3, 4, 5, 6].includes(cycleDay);
    else isTrainingDay = [1, 3, 5, 6].includes(cycleDay);

    if (!isTrainingDay) {
      schedule.push({
        day: dayNum,
        focus: `Day ${dayNum}: Active Regeneration & Mobility Flush`,
        isRestDay: true,
        exercises: [],
      });
      continue;
    }

    // Build unique exercise list for this day
    const dayExercises: GeneratedExercise[] = [];
    let dayFocus = '';

    if (daysPerWeek === 3) {
      // Full Body Rotation
      if (cycleDay === 1) {
        dayFocus = `Day ${dayNum}: Full Body Chassis A (Horizontal Press & Hinge)`;
        dayExercises.push(
          { id: `ex-${dayNum}-1`, name: 'Neutral-Grip Dumbbell Floor Press or Barbell Bench', muscleGroup: 'Chest', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Controlled eccentric, explosive concentric drive.' },
          { id: `ex-${dayNum}-2`, name: 'Chest-Supported Row or Pendlay Row', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Drive elbows back, squeeze mid-back for 1 second.' },
          { id: `ex-${dayNum}-3`, name: 'High-Handle Trap Bar Deadlift or Romanian Deadlift', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Hinge back deeply, vertical spine, drive through heels.' },
          { id: `ex-${dayNum}-4`, name: 'Goblet Squat or Leg Press', muscleGroup: 'Quads', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 7, notes: 'Vertical torso, active quad burn.' }
        );
      } else if (cycleDay === 3) {
        dayFocus = `Day ${dayNum}: Full Body Chassis B (Vertical Press & Quad Power)`;
        dayExercises.push(
          { id: `ex-${dayNum}-1`, name: 'Box Squat to Parallel or Belt Squat', muscleGroup: 'Quads', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Sit back smoothly, explode off box with zero momentum.' },
          { id: `ex-${dayNum}-2`, name: 'Half-Kneeling Landmine Press or Seated DB Press', muscleGroup: 'Shoulders', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Braced core, angled upward press.' },
          { id: `ex-${dayNum}-3`, name: 'Neutral-Grip Lat Pulldown or Inverted Rows', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Full lat stretch at top, pull elbows to hips.' },
          { id: `ex-${dayNum}-4`, name: 'Barbell or Dumbbell Hip Thrusts', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 7, notes: 'Neutral pelvis, full glute contraction at top.' }
        );
      } else {
        dayFocus = `Day ${dayNum}: Full Body Chassis C (Duty Power & Unilateral Balance)`;
        dayExercises.push(
          { id: `ex-${dayNum}-1`, name: 'Bulgarian Split Squats or Step-Ups', muscleGroup: 'Quads', defaultSets: setsCompound, targetReps: repsAccessory, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Unilateral pursuit stability and knee armor.' },
          { id: `ex-${dayNum}-2`, name: 'Single-Arm Dumbbell Row', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Heavy pull without torso twisting.' },
          { id: `ex-${dayNum}-3`, name: 'Incline Dumbbell Press', muscleGroup: 'Chest', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Upper chest angle, controlled 3-second descent.' },
          { id: `ex-${dayNum}-4`, name: 'Heavy Dumbbell Farmer Carries', muscleGroup: 'Full Body', defaultSets: 3, targetReps: '60 yds', restPeriodSeconds: 60, targetRpe: 8, notes: 'Crush grip, chest proud, short rapid steps.' }
        );
      }
    } else {
      // 4 to 6 Days: Upper / Lower or Push / Pull / Legs
      if (cycleDay === 1) {
        dayFocus = `Day ${dayNum}: Upper Body Heavy Armor (Chest, Back & Shoulders)`;
        dayExercises.push(
          { id: `ex-${dayNum}-1`, name: isStrength ? 'Barbell Bench Press or DB Floor Press' : 'Incline Dumbbell Bench Press', muscleGroup: 'Chest', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Tight arch, controlled descent to chest.' },
          { id: `ex-${dayNum}-2`, name: 'Chest-Supported Row or Pendlay Row', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Explosive drive off floor, pause at chest.' },
          { id: `ex-${dayNum}-3`, name: 'Seated Dumbbell Arnold Press or Landmine Press', muscleGroup: 'Shoulders', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Scapular plane pressing protects rotator cuff.' },
          { id: `ex-${dayNum}-4`, name: 'Neutral-Grip Lat Pulldown or Pull-Ups', muscleGroup: 'Back', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Full dead-hang stretch, drive down through elbows.' }
        );
      } else if (cycleDay === 2) {
        dayFocus = `Day ${dayNum}: Lower Body Kinetic Power & Posterior Chain`;
        dayExercises.push(
          { id: `ex-${dayNum}-1`, name: isStrength ? 'Box Squat or Back Squat' : 'Goblet Squats or Hack Squat', muscleGroup: 'Quads', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Brace against duty belt, drive knees out.' },
          { id: `ex-${dayNum}-2`, name: 'Romanian Deadlift (Dumbbell or Barbell)', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Hips back deeply, feel full hamstring recruitment.' },
          { id: `ex-${dayNum}-3`, name: 'Bulgarian Split Squats or Backward Sled Drags', muscleGroup: 'Quads', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Single-leg duty stability.' },
          { id: `ex-${dayNum}-4`, name: 'Standing Calf Raises & Hanging Knee Tucks', muscleGroup: 'Core', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 7, notes: 'Strict core anti-extension.' }
        );
      } else if (cycleDay === 4) {
        dayFocus = `Day ${dayNum}: Upper Body Hypertrophy & Combat Pull Density`;
        dayExercises.push(
          { id: `ex-${dayNum}-1`, name: 'Neutral-Grip Dumbbell Floor Press', muscleGroup: 'Chest', defaultSets: setsCompound, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Triceps and chest lockout power.' },
          { id: `ex-${dayNum}-2`, name: 'Single-Arm Dumbbell Meadows Row', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Pull toward back hip.' },
          { id: `ex-${dayNum}-3`, name: 'Dumbbell Lateral Raises (Heavy Leaning)', muscleGroup: 'Shoulders', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Medial deltoid armor cap.' },
          { id: `ex-${dayNum}-4`, name: 'Hammer Curls & Overhead Triceps Extensions', muscleGroup: 'Arms', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 7, notes: 'Arm tendon resilience for physical duty.' }
        );
      } else {
        dayFocus = `Day ${dayNum}: Posterior Chain Power & Tactical Loaded Carriage`;
        dayExercises.push(
          { id: `ex-${dayNum}-1`, name: 'High-Handle Trap Bar Deadlift', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Maximum whole-body recruitment.' },
          { id: `ex-${dayNum}-2`, name: 'Barbell or Dumbbell Hip Thrusts', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Glute power for rapid sprinting.' },
          { id: `ex-${dayNum}-3`, name: 'Heavy Dumbbell Farmer Carries', muscleGroup: 'Full Body', defaultSets: 4, targetReps: '60 yds', restPeriodSeconds: 60, targetRpe: 9, notes: 'Crush grip, chest proud, short rapid steps.' }
        );
      }
    }

    // Append Cardio or Circuit Variety
    if (params.cardioPreference === 'running') {
      const dist = params.runningDistancePreference || '1.5-2.0 Miles';
      dayExercises.push({
        id: `ex-${dayNum}-run`,
        name: `Tactical Aerobic Run (${dist})`,
        muscleGroup: 'Full Body',
        type: 'cardio',
        defaultSets: 1,
        targetReps: dist,
        restPeriodSeconds: 0,
        targetRpe: 7,
        notes: 'Paced Zone 2 aerobic stamina run for cardiovascular stroke volume.',
      });
    } else if (params.cardioPreference === 'cardio_circuits' || params.cardioPreference === 'hybrid') {
      // Pick a distinct circuit for each day!
      const circuitEx = getDistinctCircuitForDay(dayNum - 1, params.cardioCircuitType, bannedRules);
      dayExercises.push(circuitEx);
    }

    schedule.push({
      day: dayNum,
      focus: dayFocus,
      isRestDay: false,
      exercises: dayExercises,
    });
  }

  const rawPlan: GeneratedWorkoutPlan = {
    title: `Patrol Ready ${category} Architecture`,
    subtitle: `${params.fitnessLevel} • ${params.frequency} • ${category}`,
    category,
    frequency: params.frequency,
    scheduleDuration: isMonthly ? '4-Week Monthly Periodization' : '7-Day Rotation',
    estimatedDurationMinutes: params.sessionDurationMinutes || 55,
    description: `Dynamic tactical protocol tailored for ${params.fitnessLevel} athletes focusing on ${params.goals.join(', ')}. Calibrated for equipment: ${(params.equipment || []).join(', ')}.`,
    coachingPhilosophy: 'Double progression with undulating intensity: Heavy compound multi-joint movements are paired with metabolic durability finishers. Rest timers ensure complete neural ATP regeneration.',
    weeklyProgressionTips: [
      'Apply progressive overload: when all prescribed reps are achieved with perfect form, increase load by 2.5-5 lbs on upper lifts and 5-10 lbs on lower lifts.',
      'Maintain 1-2 reps in reserve (RPE 8) on heavy sets to prevent central nervous system depletion before duty shifts.',
      'Sleep minimum 7-8 hours nightly to facilitate myofibrillar protein synthesis and hormonal recovery.',
    ],
    nutritionAdvice: 'Consume 1.0g of high-quality protein per pound of lean body weight daily. Hydrate with 1/2 oz water per lb body weight + sodium/potassium electrolytes before training.',
    schedule,
    source: 'tactical-engine',
  };

  // Final sanity pass: enforce limitation sanitize
  return sanitizePlanAgainstLimitations(rawPlan, bannedRules);
}
