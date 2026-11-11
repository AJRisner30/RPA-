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
      arms: 'Incline Hammer Curls',
      core: 'Suitcase Carry Hold',
      fullBody: 'Heavy Dumbbell Trap Bar Carry',
    },
  },
  {
    keyword: 'overhead',
    label: 'Strict Overhead Pressing',
    forbiddenRegex: /\b(overhead\s*press|military\s*press|strict\s*press|push\s*press|standing\s*barbell\s*press)\b/i,
    substitutions: {
      chest: 'Incline Dumbbell Press (30-degree shallow angle)',
      back: 'Chest-Supported T-Bar Row',
      quads: 'Goblet Squat',
      hamstrings: 'Dumbbell Romanian Deadlift',
      shoulders: 'Half-Kneeling Landmine Angled Press (Scapular-Plane Safe)',
      arms: 'Banded Face Pulls & Triceps Extensions',
      core: 'Tall-Kneeling Cable Anti-Rotation Chop',
      fullBody: 'Loaded Trap Bar Carries',
    },
  },
  {
    keyword: 'pullup',
    label: 'Pull-Ups / Chins',
    forbiddenRegex: /\b(pull-?\s*ups?|chin-?\s*ups?|dead-?\s*hang\s*pull-?\s*ups?)\b/i,
    substitutions: {
      chest: 'Flat Dumbbell Press',
      back: 'Inverted Bodyweight Rows or Chest-Supported Dumbbell Rows',
      quads: 'Box Step-Ups',
      hamstrings: 'Single-Leg Romanian Deadlift',
      shoulders: 'Dumbbell Lateral Raise',
      arms: 'Incline Dumbbell Curls',
      core: 'RKC Plank & Deadbugs',
      fullBody: 'Farmer Carries',
    },
  },
  {
    keyword: 'lunge',
    label: 'Lunges / Split Squats',
    forbiddenRegex: /\b(walking\s*lunges?|lunges?|bulgarian\s*split\s*squats?|split\s*squats?|reverse\s*lunges?)\b/i,
    substitutions: {
      chest: 'Dumbbell Bench Press',
      back: 'Barbell Row',
      quads: 'Parallel Box Squats (Zero Knee Shear) or Backward Sled Drags',
      hamstrings: 'Bilateral Glute Bridges / Hip Thrusts',
      shoulders: 'Seated Dumbbell Press',
      arms: 'Rope Hammer Curls',
      core: 'Pallof Press',
      fullBody: 'Heavy Trap Bar Marches',
    },
  },
  {
    keyword: 'run',
    label: 'Running / Impact Sprints',
    forbiddenRegex: /\b(running|duty\s*run|sprints?|treadmill\s*run|jogging)\b/i,
    substitutions: {
      chest: 'Push-Up Variations',
      back: 'Concept2 Rower Intervals',
      quads: 'Low-Impact Assault AirBike Flush Intervals (Zero Joint Impact)',
      hamstrings: 'Heavy Kettlebell Swings',
      shoulders: 'SkiErg Intervals',
      arms: 'Battle Ropes',
      core: 'Sled Pushes',
      fullBody: 'Assault Bike / Rower Power Intervals (Non-Impact)',
    },
  },
  {
    keyword: 'dip',
    label: 'Dips (Chest / Triceps)',
    forbiddenRegex: /\b(dips?|chest\s*dips?|tricep\s*dips?|ring\s*dips?)\b/i,
    substitutions: {
      chest: 'Close-Grip Push-Ups or Floor Press',
      back: 'Cable Row',
      quads: 'Goblet Squats',
      hamstrings: 'Hip Thrusts',
      shoulders: 'Cable Face Pulls',
      arms: 'Cable Triceps Rope Pushdowns (Elbow Safe)',
      core: 'Hanging Knee Tucks',
      fullBody: 'Sandbag Floor Press',
    },
  },
  {
    keyword: 'burpee',
    label: 'Burpees / Sprawls',
    forbiddenRegex: /\b(burpees?|combat\s*sprawls?|sprawls?)\b/i,
    substitutions: {
      chest: 'Incline Push-Ups on Bench',
      back: 'Chest-Supported Row',
      quads: 'Fast Box Step-Ups (Non-Impact)',
      hamstrings: 'Kettlebell Deadlift to High Pull',
      shoulders: 'Dumbbell Clean & Press',
      arms: 'Battle Rope Waves',
      core: 'Plank Shoulder Taps',
      fullBody: 'Medicine Ball Slams or Kettlebell Swings',
    },
  },
];

export function extractBannedMovements(rawNotes: string, injuries: string[] = []): BannedLimitation[] {
  const combined = [rawNotes, ...injuries].join(' ').toLowerCase();
  const matched: BannedLimitation[] = [];

  const directPatterns: { pattern: RegExp; ruleKeyword: string }[] = [
    { pattern: /\b(no|cannot|can't|avoid|don't|exclude|prohibit|zero|eliminate|stop)\b[^.!?\n]*\bbench\b/i, ruleKeyword: 'bench' },
    { pattern: /\b(no|cannot|can't|avoid|don't|exclude|prohibit|zero|eliminate|stop)\b[^.!?\n]*\bsquat/i, ruleKeyword: 'squat' },
    { pattern: /\b(no|cannot|can't|avoid|don't|exclude|prohibit|zero|eliminate|stop)\b[^.!?\n]*\bdeadlift/i, ruleKeyword: 'deadlift' },
    { pattern: /\b(no|cannot|can't|avoid|don't|exclude|prohibit|zero|eliminate|stop)\b[^.!?\n]*\b(overhead|military|shoulder\s*press)/i, ruleKeyword: 'overhead' },
    { pattern: /\b(no|cannot|can't|avoid|don't|exclude|prohibit|zero|eliminate|stop)\b[^.!?\n]*\bpull-?ups?/i, ruleKeyword: 'pullup' },
    { pattern: /\b(no|cannot|can't|avoid|don't|exclude|prohibit|zero|eliminate|stop)\b[^.!?\n]*\blunges?/i, ruleKeyword: 'lunge' },
    { pattern: /\b(no|cannot|can't|avoid|don't|exclude|prohibit|zero|eliminate|stop)\b[^.!?\n]*\b(run|running|sprints?)/i, ruleKeyword: 'run' },
    { pattern: /\b(no|cannot|can't|avoid|don't|exclude|prohibit|zero|eliminate|stop)\b[^.!?\n]*\bdips?\b/i, ruleKeyword: 'dip' },
    { pattern: /\b(no|cannot|can't|avoid|don't|exclude|prohibit|zero|eliminate|stop)\b[^.!?\n]*\b(burpee|sprawl)/i, ruleKeyword: 'burpee' },
  ];

  for (const dp of directPatterns) {
    if (dp.pattern.test(combined)) {
      const rule = KNOWN_LIMITATION_RULES.find((r) => r.keyword === dp.ruleKeyword);
      if (rule && !matched.some((m) => m.keyword === rule.keyword)) {
        matched.push(rule);
      }
    }
  }

  // Clinical injury correlations
  if (/hip|labrum|fai|impingement/i.test(combined)) {
    const squatRule = KNOWN_LIMITATION_RULES.find((r) => r.keyword === 'squat');
    if (squatRule && !matched.some((m) => m.keyword === squatRule.keyword)) matched.push(squatRule);
    const lungeRule = KNOWN_LIMITATION_RULES.find((r) => r.keyword === 'lunge');
    if (lungeRule && !matched.some((m) => m.keyword === lungeRule.keyword)) matched.push(lungeRule);
  }

  if (/shoulder|rotator|cuff|labrum\s*tear.*shoulder/i.test(combined)) {
    const ohRule = KNOWN_LIMITATION_RULES.find((r) => r.keyword === 'overhead');
    if (ohRule && !matched.some((m) => m.keyword === ohRule.keyword)) matched.push(ohRule);
    const dipRule = KNOWN_LIMITATION_RULES.find((r) => r.keyword === 'dip');
    if (dipRule && !matched.some((m) => m.keyword === dipRule.keyword)) matched.push(dipRule);
  }

  if (/lumbar|disc|sciatica|lower\s*back\s*injury/i.test(combined)) {
    const dlRule = KNOWN_LIMITATION_RULES.find((r) => r.keyword === 'deadlift');
    if (dlRule && !matched.some((m) => m.keyword === dlRule.keyword)) matched.push(dlRule);
  }

  return matched;
}

export function sanitizeExercise<T extends { name: string; notes?: string; muscleGroup?: any; circuitStations?: string[] }>(
  ex: T,
  bannedRules: BannedLimitation[]
): T {
  if (!bannedRules || bannedRules.length === 0) return ex;

  const exName = ex.name || '';
  const exNotes = ex.notes || '';
  const targetText = `${exName} ${exNotes}`.toLowerCase();

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

export function sanitizeExerciseList<T extends { name: string; notes?: string; muscleGroup?: any; circuitStations?: string[] }>(
  exercises: T[],
  bannedRules: BannedLimitation[]
): T[] {
  if (!exercises || exercises.length === 0) return [];
  return exercises.map((ex) => sanitizeExercise(ex, bannedRules));
}

export function sanitizePlanAgainstLimitations(
  plan: any,
  bannedRules: BannedLimitation[]
): any {
  if (!bannedRules || bannedRules.length === 0) return plan;

  const sanitizedSchedule = (plan.schedule || []).map((day: any) => {
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

export function getDistinctCircuitForDay(
  dayIndex: number,
  preferredStyle?: string,
  bannedRules: BannedLimitation[] = []
): any {
  const library = [...TACTICAL_CIRCUIT_LIBRARY];
  let chosen = library[dayIndex % library.length];

  if (preferredStyle) {
    const styleLower = preferredStyle.toLowerCase();
    const matched = library.find(
      (c) => c.name.toLowerCase().includes(styleLower) || c.category.toLowerCase().includes(styleLower)
    );
    if (matched) chosen = matched;
  }

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
 * Detects whether a training day is primarily focused on Lower Body / Legs / Posterior Chain
 */
export function isLegOrLowerDay(day: { focus?: string; exercises?: any[] }): boolean {
  if (!day) return false;
  const focusLower = (day.focus || '').toLowerCase();

  // Explicit Upper / Push / Pull indicators override generic mentions
  const isExplicitUpper = /\b(upper body|upper push|upper pull|push armor|pull armor|chest|bench|back|lat|shoulders?|deltoids?|biceps|triceps|arms)\b/i.test(focusLower);
  const isExplicitLower = /\b(lower body|legs?|quads?|hamstrings?|posterior chain|glutes?|squats?|deadlifts?|calves|chassis b)\b/i.test(focusLower);

  if (isExplicitLower && !isExplicitUpper) {
    return true;
  }
  if (isExplicitUpper && !isExplicitLower) {
    return false;
  }

  // Count exercises if focus is ambiguous or hybrid
  if (Array.isArray(day.exercises) && day.exercises.length > 0) {
    const nonCardio = day.exercises.filter((ex: any) => ex.type !== 'cardio' && ex.type !== 'circuit');
    if (nonCardio.length > 0) {
      const lowerCount = nonCardio.filter((ex: any) => {
        const mg = (ex.muscleGroup || '').toLowerCase();
        const nm = (ex.name || '').toLowerCase();
        return mg.includes('quad') || mg.includes('hamstring') || mg.includes('glute') ||
               nm.includes('squat') || nm.includes('deadlift') || nm.includes('lunge') ||
               nm.includes('split squat') || nm.includes('hip thrust') || nm.includes('leg press');
      }).length;
      return lowerCount / nonCardio.length >= 0.5;
    }
  }

  return isExplicitLower;
}

/**
 * Validates the training schedule to ensure physiological recovery rules:
 * 1. Lower body / leg training requires at least 48-72 hours recovery.
 * 2. Never program consecutive leg days (e.g. Day 2 Legs, Day 3 Legs).
 * 3. Never program near-consecutive leg days separated by only 1 rest day without an upper body session (e.g. Day 2 Legs, Day 3 Rest, Day 4 Legs).
 * If an illegal leg clash is detected, automatically converts the second session into an Upper Body session.
 */
export function validateAndFixSplitLogic(plan: any, bannedRules: BannedLimitation[] = []): any {
  if (!plan || !Array.isArray(plan.schedule) || plan.schedule.length === 0) {
    return plan;
  }

  const updatedSchedule = [...plan.schedule];
  let lastTrainingDayNumber: number | null = null;
  let lastTrainingDayWasLower = false;

  for (let i = 0; i < updatedSchedule.length; i++) {
    const day = updatedSchedule[i];
    if (day.isRestDay || !day.exercises || day.exercises.length === 0) {
      continue;
    }

    const currentDayIsLower = isLegOrLowerDay(day);

    if (currentDayIsLower && lastTrainingDayWasLower) {
      // Clash detected! Either consecutive (e.g. Day 2 Legs -> Day 3 Legs) or separated by only 1 rest day (e.g. Day 2 Legs -> Day 3 Rest -> Day 4 Legs)
      // Convert this day to an Upper Body session with safe compound and accessory movements
      const dayNum = day.day || (i + 1);
      const isStrength = (plan.category || '').toLowerCase().includes('strength');
      const compoundReps = isStrength ? '5 reps' : '8-10 reps';
      const accessoryReps = isStrength ? '6-8 reps' : '10-12 reps';

      // Keep any cardio or circuit exercises
      const existingCardio = day.exercises.filter((ex: any) => ex.type === 'cardio' || ex.type === 'circuit');

      const upperReplacementExercises = [
        {
          id: `ex-${dayNum}-fix-1`,
          name: isStrength ? 'Barbell Bench Press or DB Floor Press' : 'Incline Dumbbell Bench Press',
          muscleGroup: 'Chest',
          defaultSets: 4,
          targetReps: compoundReps,
          restPeriodSeconds: isStrength ? 150 : 90,
          targetRpe: 8,
          notes: 'Upper body chest and triceps pressing strength. Maintain tight upper back stability.',
        },
        {
          id: `ex-${dayNum}-fix-2`,
          name: 'Chest-Supported Row or Pendlay Barbell Row',
          muscleGroup: 'Back',
          defaultSets: 4,
          targetReps: compoundReps,
          restPeriodSeconds: isStrength ? 120 : 90,
          targetRpe: 8,
          notes: 'Explosive pull to sternum, squeeze lats and scapular retractors.',
        },
        {
          id: `ex-${dayNum}-fix-3`,
          name: 'Half-Kneeling Landmine Press or Seated DB Arnold Press',
          muscleGroup: 'Shoulders',
          defaultSets: 3,
          targetReps: accessoryReps,
          restPeriodSeconds: 60,
          targetRpe: 8,
          notes: 'Scapular plane overhead pressing. Core braced to prevent lumbar arching.',
        },
        {
          id: `ex-${dayNum}-fix-4`,
          name: 'Neutral-Grip Lat Pulldown or Inverted Rows',
          muscleGroup: 'Back',
          defaultSets: 3,
          targetReps: accessoryReps,
          restPeriodSeconds: 60,
          targetRpe: 8,
          notes: 'Full lat stretch at extension, drive elbows down into back pockets.',
        },
        ...existingCardio,
      ];

      const sanitizedUpper = bannedRules.length > 0
        ? sanitizeExerciseList(upperReplacementExercises, bannedRules)
        : upperReplacementExercises;

      updatedSchedule[i] = {
        ...day,
        focus: `Day ${dayNum}: Upper Body Heavy Armor & Pull Density (Re-balanced for Recovery)`,
        exercises: sanitizedUpper,
      };

      lastTrainingDayNumber = dayNum;
      lastTrainingDayWasLower = false;
    } else {
      lastTrainingDayNumber = day.day || (i + 1);
      lastTrainingDayWasLower = currentDayIsLower;
    }
  }

  return {
    ...plan,
    schedule: updatedSchedule,
  };
}

export function buildDynamicCalibratedPlan(params: {
  goals: string[];
  fitnessLevel: string;
  frequency: string;
  scheduleDuration: 'weekly' | 'monthly';
  equipment: string[];
  sessionDurationMinutes?: number;
  injuries?: string[];
  injuryNotes?: string;
  notes?: string;
  cardioPreference?: 'none' | 'running' | 'cardio_circuits' | 'hybrid';
  runningDistancePreference?: string;
  cardioCircuitType?: string;
  userEmail?: string;
}): any {
  const goalStr = (params.goals || []).join(' ').toLowerCase();
  const isStrength = goalStr.includes('strength') || goalStr.includes('power');
  const isHypertrophy = goalStr.includes('hypertrophy') || goalStr.includes('muscle');
  const isEndurance = goalStr.includes('endurance') || goalStr.includes('loss') || goalStr.includes('shred');
  const isPat = goalStr.includes('pat') || goalStr.includes('police') || goalStr.includes('academy');

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

  const rawLimitations = [
    ...(params.injuries || []),
    params.injuryNotes || '',
    params.notes || '',
  ].join(' ');
  const bannedRules = extractBannedMovements(rawLimitations, params.injuries || []);

  const setsCompound = isStrength ? 4 : isHypertrophy ? 4 : 3;
  const repsCompound = isStrength
    ? (level === 'Beginner' ? '5 reps' : '3-5 reps')
    : isHypertrophy
    ? '8-10 reps'
    : isEndurance
    ? '12-15 reps'
    : '6-8 reps';

  const setsAccessory = 3;
  const repsAccessory = isStrength ? '6-8 reps' : isHypertrophy ? '10-12 reps' : '15-20 reps';
  const restCompound = isStrength ? 150 : isHypertrophy ? 90 : 60;
  const restAccessory = isStrength ? 90 : isHypertrophy ? 60 : 45;

  const schedule: any[] = [];

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

    const dayExercises: any[] = [];
    let dayFocus = '';

    if (daysPerWeek === 3) {
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
    } else if (daysPerWeek === 4) {
      // 4-Day Split: [1, 2, 4, 5] (Rest on 3, 6, 7)
      // Day 1: Upper A
      // Day 2: Lower A (Squat/Quad)
      // Day 3: Rest
      // Day 4: Upper B (Pull/Incline/Arms)
      // Day 5: Lower B (Deadlift/Hinge/Carries)
      // Day 6-7: Rest
      if (cycleDay === 1) {
        dayFocus = `Day ${dayNum}: Upper Body Heavy Armor (Chest, Back & Shoulders)`;
        dayExercises.push(
          { id: `ex-${dayNum}-1`, name: isStrength ? 'Barbell Bench Press or DB Floor Press' : 'Incline Dumbbell Bench Press', muscleGroup: 'Chest', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Tight arch, controlled descent to chest.' },
          { id: `ex-${dayNum}-2`, name: 'Chest-Supported Row or Pendlay Row', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Explosive drive off floor, pause at chest.' },
          { id: `ex-${dayNum}-3`, name: 'Seated Dumbbell Arnold Press or Landmine Press', muscleGroup: 'Shoulders', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Scapular plane pressing protects rotator cuff.' },
          { id: `ex-${dayNum}-4`, name: 'Neutral-Grip Lat Pulldown or Pull-Ups', muscleGroup: 'Back', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Full dead-hang stretch, drive down through elbows.' }
        );
      } else if (cycleDay === 2) {
        dayFocus = `Day ${dayNum}: Lower Body Kinetic Power & Quad Armor`;
        dayExercises.push(
          { id: `ex-${dayNum}-1`, name: isStrength ? 'Box Squat to Parallel or Back Squat' : 'Goblet Squats or Hack Squat', muscleGroup: 'Quads', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Brace against duty belt, drive knees out.' },
          { id: `ex-${dayNum}-2`, name: 'Bulgarian Split Squats or Step-Ups', muscleGroup: 'Quads', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Single-leg duty stability and knee resilience.' },
          { id: `ex-${dayNum}-3`, name: 'Romanian Deadlift (Dumbbell or Barbell)', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Hips back deeply, feel full hamstring recruitment.' },
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
        // cycleDay === 5
        dayFocus = `Day ${dayNum}: Posterior Chain Power & Tactical Loaded Carriage`;
        dayExercises.push(
          { id: `ex-${dayNum}-1`, name: 'High-Handle Trap Bar Deadlift', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Maximum whole-body recruitment.' },
          { id: `ex-${dayNum}-2`, name: 'Barbell or Dumbbell Hip Thrusts', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Glute power for rapid sprinting.' },
          { id: `ex-${dayNum}-3`, name: 'Backward Sled Drags or Hamstring Curls', muscleGroup: 'Quads', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 7, notes: 'Knee bulletproofing and blood flow flush.' },
          { id: `ex-${dayNum}-4`, name: 'Heavy Dumbbell Farmer Carries', muscleGroup: 'Full Body', defaultSets: 4, targetReps: '60 yds', restPeriodSeconds: 60, targetRpe: 9, notes: 'Crush grip, chest proud, short rapid steps.' }
        );
      }
    } else if (daysPerWeek === 5) {
      // 5-Day Split: [1, 2, 3, 5, 6] (Rest on 4, 7)
      // Day 1: Upper Push Armor
      // Day 2: Upper Pull Armor
      // Day 3: Lower Body Chassis A (Squats, Quads, Core)
      // Day 4: REST & ACTIVE RECOVERY
      // Day 5: Upper Body Density & Armor (Push/Pull, Delts, Arms)
      // Day 6: Lower Body Chassis B (Deadlifts, Posterior Chain, Carries)
      // Day 7: REST
      if (cycleDay === 1) {
        dayFocus = `Day ${dayNum}: Upper Push Armor (Chest, Delts & Triceps)`;
        dayExercises.push(
          { id: `ex-${dayNum}-1`, name: isStrength ? 'Barbell Bench Press or DB Floor Press' : 'Incline Dumbbell Bench Press', muscleGroup: 'Chest', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Tight arch, controlled descent, explode to lockout.' },
          { id: `ex-${dayNum}-2`, name: 'Half-Kneeling Landmine Press or Seated DB Press', muscleGroup: 'Shoulders', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Scapular plane pressing protects rotator cuff.' },
          { id: `ex-${dayNum}-3`, name: 'Dumbbell Incline Flyes or Push-Up Burnouts', muscleGroup: 'Chest', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Controlled stretch, strict contraction.' },
          { id: `ex-${dayNum}-4`, name: 'Overhead Cable or DB Triceps Extensions', muscleGroup: 'Arms', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 7, notes: 'Long-head triceps lockout stability.' }
        );
      } else if (cycleDay === 2) {
        dayFocus = `Day ${dayNum}: Upper Pull Armor (Lats, Mid-Back & Biceps)`;
        dayExercises.push(
          { id: `ex-${dayNum}-1`, name: 'Chest-Supported Dumbbell Row or Pendlay Row', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Drive elbows back, squeeze mid-back for 1s.' },
          { id: `ex-${dayNum}-2`, name: 'Neutral-Grip Lat Pulldown or Pull-Ups', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Full dead-hang stretch, drive down through elbows.' },
          { id: `ex-${dayNum}-3`, name: 'Rear Delt Flyes or Face Pulls', muscleGroup: 'Shoulders', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Posterior shoulder integrity and upper posture.' },
          { id: `ex-${dayNum}-4`, name: 'Incline Dumbbell Biceps Curls or Hammer Curls', muscleGroup: 'Arms', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 7, notes: 'Strict curls without torso sway.' }
        );
      } else if (cycleDay === 3) {
        dayFocus = `Day ${dayNum}: Lower Body Chassis A (Squat Power & Quad Armor)`;
        dayExercises.push(
          { id: `ex-${dayNum}-1`, name: isStrength ? 'Box Squat to Parallel or Back Squat' : 'Goblet Squats or Hack Squat', muscleGroup: 'Quads', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Braced core, vertical spine, explode up.' },
          { id: `ex-${dayNum}-2`, name: 'Bulgarian Split Squats (Foot Elevated)', muscleGroup: 'Quads', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Single-leg pursuit stability and knee armor.' },
          { id: `ex-${dayNum}-3`, name: 'Standing Calf Raises', muscleGroup: 'Quads', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 7, notes: 'Full stretch, hold 2s at top.' },
          { id: `ex-${dayNum}-4`, name: 'Hanging Knee Tucks or RKC Plank', muscleGroup: 'Core', defaultSets: 3, targetReps: '12-15 reps', restPeriodSeconds: 60, targetRpe: 7, notes: 'Anti-extension core armor.' }
        );
      } else if (cycleDay === 5) {
        dayFocus = `Day ${dayNum}: Upper Body Armor & Density (Push/Pull Supersets)`;
        dayExercises.push(
          { id: `ex-${dayNum}-1`, name: 'Neutral-Grip Dumbbell Floor Press', muscleGroup: 'Chest', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Heavy pressing power with zero shoulder strain.' },
          { id: `ex-${dayNum}-2`, name: 'Single-Arm Dumbbell Meadows Row', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Stretch lat fully, pull toward hip crease.' },
          { id: `ex-${dayNum}-3`, name: 'Dumbbell Lateral Raises (Heavy Leaning)', muscleGroup: 'Shoulders', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Medial deltoid armor cap.' },
          { id: `ex-${dayNum}-4`, name: 'Dual Cable or DB Hammer Curls & Triceps Dips', muscleGroup: 'Arms', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 7, notes: 'Forearm and elbow tendon durability.' }
        );
      } else {
        // cycleDay === 6
        dayFocus = `Day ${dayNum}: Lower Body Chassis B (Posterior Chain & Loaded Carries)`;
        dayExercises.push(
          { id: `ex-${dayNum}-1`, name: 'High-Handle Trap Bar Deadlift', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Drive through heels, neutral spine.' },
          { id: `ex-${dayNum}-2`, name: 'Romanian Deadlift (Dumbbell or Barbell)', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Deep hamstring hinge, maintain lat engagement.' },
          { id: `ex-${dayNum}-3`, name: 'Barbell or Dumbbell Hip Thrusts', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Glute power for rapid sprinting.' },
          { id: `ex-${dayNum}-4`, name: 'Heavy Dumbbell Farmer Carries', muscleGroup: 'Full Body', defaultSets: 4, targetReps: '60 yds', restPeriodSeconds: 60, targetRpe: 9, notes: 'Crush grip, chest proud, short rapid steps.' }
        );
      }
    } else {
      // 6-Day Split: [1, 2, 3, 4, 5, 6] (Push A, Pull A, Legs A, Push B, Pull B, Legs B)
      if (cycleDay === 1) {
        dayFocus = `Day ${dayNum}: Push A (Chest, Shoulders & Triceps Heavy)`;
        dayExercises.push(
          { id: `ex-${dayNum}-1`, name: isStrength ? 'Barbell Bench Press or DB Floor Press' : 'Flat Dumbbell Bench Press', muscleGroup: 'Chest', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Heavy chest push power.' },
          { id: `ex-${dayNum}-2`, name: 'Seated Dumbbell Shoulder Press', muscleGroup: 'Shoulders', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Vertical pressing power.' },
          { id: `ex-${dayNum}-3`, name: 'Dumbbell Incline Press', muscleGroup: 'Chest', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Clavicular head development.' },
          { id: `ex-${dayNum}-4`, name: 'Overhead Triceps Extensions', muscleGroup: 'Arms', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 7, notes: 'Triceps lockout endurance.' }
        );
      } else if (cycleDay === 2) {
        dayFocus = `Day ${dayNum}: Pull A (Back, Rear Delts & Biceps Heavy)`;
        dayExercises.push(
          { id: `ex-${dayNum}-1`, name: 'Chest-Supported Row or Pendlay Row', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Heavy horizontal pulling.' },
          { id: `ex-${dayNum}-2`, name: 'Neutral-Grip Lat Pulldown or Weighted Pull-Ups', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Vertical pulling lat sweep.' },
          { id: `ex-${dayNum}-3`, name: 'Face Pulls or Rear Delt Flyes', muscleGroup: 'Shoulders', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Scapular health and upper back density.' },
          { id: `ex-${dayNum}-4`, name: 'Barbell or Incline DB Biceps Curls', muscleGroup: 'Arms', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 7, notes: 'Peak contraction curls.' }
        );
      } else if (cycleDay === 3) {
        dayFocus = `Day ${dayNum}: Legs A (Squat Power & Quad Hypertrophy)`;
        dayExercises.push(
          { id: `ex-${dayNum}-1`, name: isStrength ? 'Box Squat to Parallel or Back Squat' : 'Goblet Squats or Hack Squat', muscleGroup: 'Quads', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Lower body foundation and knee armor.' },
          { id: `ex-${dayNum}-2`, name: 'Bulgarian Split Squats (Foot Elevated)', muscleGroup: 'Quads', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Unilateral pursuit stamina.' },
          { id: `ex-${dayNum}-3`, name: 'Standing Calf Raises', muscleGroup: 'Quads', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 7, notes: 'Achilles and calf spring power.' },
          { id: `ex-${dayNum}-4`, name: 'Hanging Knee Raises or RKC Plank', muscleGroup: 'Core', defaultSets: 3, targetReps: '12-15 reps', restPeriodSeconds: 60, targetRpe: 7, notes: 'Anti-extension core resilience.' }
        );
      } else if (cycleDay === 4) {
        dayFocus = `Day ${dayNum}: Push B (Incline Press, Lateral Delts & Triceps)`;
        dayExercises.push(
          { id: `ex-${dayNum}-1`, name: 'Incline Dumbbell Bench Press', muscleGroup: 'Chest', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Controlled 3-second descent.' },
          { id: `ex-${dayNum}-2`, name: 'Half-Kneeling Landmine Press', muscleGroup: 'Shoulders', defaultSets: setsCompound, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Scapular mobility and overhead drive.' },
          { id: `ex-${dayNum}-3`, name: 'Dumbbell Lateral Raises (Heavy Leaning)', muscleGroup: 'Shoulders', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Lateral deltoid width.' },
          { id: `ex-${dayNum}-4`, name: 'Triceps Rope Pushdowns', muscleGroup: 'Arms', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 7, notes: 'Flare rope out at bottom.' }
        );
      } else if (cycleDay === 5) {
        dayFocus = `Day ${dayNum}: Pull B (Lats, Upper Back Rows & Grip/Arms)`;
        dayExercises.push(
          { id: `ex-${dayNum}-1`, name: 'Single-Arm Dumbbell Meadows Row', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Pull elbow toward hip.' },
          { id: `ex-${dayNum}-2`, name: 'Neutral-Grip Lat Pulldown or Inverted Rows', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Full dead-hang stretch.' },
          { id: `ex-${dayNum}-3`, name: 'Heavy Kettlebell or DB Shrugs', muscleGroup: 'Back', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Trapezius armor for vest wear.' },
          { id: `ex-${dayNum}-4`, name: 'Incline Hammer Curls', muscleGroup: 'Arms', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 7, notes: 'Forearm brachioradialis strength.' }
        );
      } else {
        // cycleDay === 6
        dayFocus = `Day ${dayNum}: Legs B (Posterior Chain Hinge, Glutes & Loaded Carries)`;
        dayExercises.push(
          { id: `ex-${dayNum}-1`, name: 'High-Handle Trap Bar Deadlift', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: 8, notes: 'Maximum posterior chain tension.' },
          { id: `ex-${dayNum}-2`, name: 'Romanian Deadlift (Dumbbell or Barbell)', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Deep hamstring stretch.' },
          { id: `ex-${dayNum}-3`, name: 'Barbell or Dumbbell Hip Thrusts', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: 8, notes: 'Full glute extension.' },
          { id: `ex-${dayNum}-4`, name: 'Heavy Dumbbell Farmer Carries', muscleGroup: 'Full Body', defaultSets: 4, targetReps: '60 yds', restPeriodSeconds: 60, targetRpe: 9, notes: 'Crush grip, short rapid strides.' }
        );
      }
    }

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

  const rawPlan = {
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

  const fixedPlan = validateAndFixSplitLogic(rawPlan, bannedRules);
  return sanitizePlanAgainstLimitations(fixedPlan, bannedRules);
}
