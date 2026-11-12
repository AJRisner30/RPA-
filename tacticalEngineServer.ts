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

export interface PeriodizedPhaseParams {
  phase: 1 | 2 | 3;
  weekNumber: number;
  isDeload: boolean;
  isPeakTesting: boolean;
  setsCompound: number;
  repsCompound: string;
  setsAccessory: number;
  repsAccessory: string;
  restCompound: number;
  restAccessory: number;
  targetRpeCompound: number;
  targetRpeAccessory: number;
  phaseName: string;
  phaseIntent: string;
  overloadCue: string;
}

export function getPeriodizedPhaseParams(weekNumber: number, goalStr: string, level: string): PeriodizedPhaseParams {
  const isStrength = goalStr.includes('strength') || goalStr.includes('power');
  const isHypertrophy = goalStr.includes('hypertrophy') || goalStr.includes('muscle');

  const phase: 1 | 2 | 3 = weekNumber <= 4 ? 1 : weekNumber <= 8 ? 2 : 3;
  const isDeload = weekNumber === 4 || weekNumber === 8;
  const isPeakTesting = weekNumber === 12;

  let setsCompound = 4;
  let repsCompound = '8-10 reps';
  let setsAccessory = 3;
  let repsAccessory = '10-12 reps';
  let restCompound = 90;
  let restAccessory = 60;
  let targetRpeCompound = 8;
  let targetRpeAccessory = 8;
  let phaseName = 'Phase 1: Base Accumulation';
  let phaseIntent = 'High-density volume, connective tissue preparation & structural balance.';
  let overloadCue = 'Focus on controlled eccentric (3s) and explosive concentric.';

  if (phase === 1) {
    phaseName = isDeload
      ? `Phase 1: Recovery Deload & Realization (Wk ${weekNumber})`
      : `Phase 1: Base Accumulation & Hypertrophy (Wk ${weekNumber})`;
    phaseIntent = isDeload
      ? 'Active CNS decompression and tissue recovery (-35% volume reduction).'
      : 'Building dense muscular armor, work capacity, and foundational movement patterns.';

    if (isDeload) {
      setsCompound = 2;
      repsCompound = isStrength ? '6 reps' : '8 reps';
      setsAccessory = 2;
      repsAccessory = '10 reps';
      restCompound = 90;
      restAccessory = 60;
      targetRpeCompound = 6.5;
      targetRpeAccessory = 6.5;
      overloadCue = 'Deload Protocol: Cut load by 10-15%, leave 3-4 reps in reserve. Focus on joint lubrication & recovery.';
    } else if (weekNumber === 1) {
      setsCompound = 3;
      repsCompound = isStrength ? '8 reps' : isHypertrophy ? '10-12 reps' : '12-15 reps';
      setsAccessory = 3;
      repsAccessory = isStrength ? '10 reps' : '12-15 reps';
      restCompound = isStrength ? 90 : 75;
      restAccessory = 60;
      targetRpeCompound = 7.5;
      targetRpeAccessory = 7;
      overloadCue = 'Week 1 Baseline: Establish clean form and baseline working weight. Stop 2-3 reps shy of failure.';
    } else if (weekNumber === 2) {
      setsCompound = 4;
      repsCompound = isStrength ? '8 reps' : isHypertrophy ? '10 reps' : '12 reps';
      setsAccessory = 3;
      repsAccessory = isStrength ? '8-10 reps' : '12 reps';
      restCompound = isStrength ? 100 : 75;
      restAccessory = 60;
      targetRpeCompound = 8;
      targetRpeAccessory = 7.5;
      overloadCue = 'Week 2 Accumulation: Add 1 working set or +2.5-5 lbs to compound baseline while keeping rest strict.';
    } else {
      setsCompound = 4;
      repsCompound = isStrength ? '6-8 reps' : isHypertrophy ? '8-10 reps' : '10-12 reps';
      setsAccessory = 4;
      repsAccessory = isStrength ? '8 reps' : '10-12 reps';
      restCompound = isStrength ? 120 : 90;
      restAccessory = 60;
      targetRpeCompound = 8.5;
      targetRpeAccessory = 8;
      overloadCue = 'Week 3 Peak Volume: Push compound sets to RPE 8.5 (1-2 reps in reserve). Maximize muscular tension before deload.';
    }
  } else if (phase === 2) {
    phaseName = isDeload
      ? `Phase 2: Pivot Deload (Wk ${weekNumber})`
      : `Phase 2: Strength Intensification (Wk ${weekNumber})`;
    phaseIntent = isDeload
      ? 'Strategic recovery pivot to prepare central nervous system for maximum force expression.'
      : 'Heavy compound multi-joint loading, high-threshold motor unit recruitment, and raw strength expression.';

    if (isDeload) {
      setsCompound = 3;
      repsCompound = isStrength ? '4 reps' : '5 reps';
      setsAccessory = 2;
      repsAccessory = '6-8 reps';
      restCompound = 120;
      restAccessory = 75;
      targetRpeCompound = 7;
      targetRpeAccessory = 7;
      overloadCue = 'Mid-Cycle Pivot Deload: -30% total volume. Maintain crisp velocity on all sets.';
    } else if (weekNumber === 5) {
      setsCompound = 4;
      repsCompound = isStrength ? '6 reps' : isHypertrophy ? '6-8 reps' : '8-10 reps';
      setsAccessory = 3;
      repsAccessory = isStrength ? '6-8 reps' : '8-10 reps';
      restCompound = isStrength ? 120 : 90;
      restAccessory = 75;
      targetRpeCompound = 8;
      targetRpeAccessory = 8;
      overloadCue = 'Week 5 Intensification Kickoff: Transition to heavy bilateral compound drivers. Enforce progressive overload.';
    } else if (weekNumber === 6) {
      setsCompound = 4;
      repsCompound = isStrength ? '5 reps' : isHypertrophy ? '6 reps' : '8 reps';
      setsAccessory = 3;
      repsAccessory = isStrength ? '6 reps' : '8 reps';
      restCompound = isStrength ? 150 : 100;
      restAccessory = 75;
      targetRpeCompound = 8.5;
      targetRpeAccessory = 8;
      overloadCue = 'Week 6 Heavy Progression: Increase compound loads by +5 lbs upper, +10 lbs lower. Take full 2+ min rest.';
    } else {
      setsCompound = 5;
      repsCompound = isStrength ? '4-5 reps' : isHypertrophy ? '5-6 reps' : '6-8 reps';
      setsAccessory = 4;
      repsAccessory = isStrength ? '5-6 reps' : '6-8 reps';
      restCompound = isStrength ? 150 : 120;
      restAccessory = 90;
      targetRpeCompound = 9;
      targetRpeAccessory = 8.5;
      overloadCue = 'Week 7 Peak Intensification: Maximum working sets at RPE 9. Drive maximum barbell velocity out of the bottom.';
    }
  } else {
    phaseName = isPeakTesting
      ? `Phase 3: Duty Benchmark Testing & Tactical Taper (Wk ${weekNumber})`
      : `Phase 3: Peak Tactical Power & Velocity (Wk ${weekNumber})`;
    phaseIntent = isPeakTesting
      ? 'Tactical benchmark performance testing, max effort realization, and active taper for duty deployment.'
      : 'Maximum rate of force development (RFD), explosive kinetic speed, and heavy awkward load carriage.';

    if (isPeakTesting) {
      setsCompound = 3;
      repsCompound = '3 reps (Benchmark Max Test)';
      setsAccessory = 2;
      repsAccessory = '5 reps (Readiness Taper)';
      restCompound = 180;
      restAccessory = 90;
      targetRpeCompound = 9.5;
      targetRpeAccessory = 7.5;
      overloadCue = 'Week 12 Benchmark Protocol: Warm up thoroughly. Perform 3 heavy benchmark test triples at RPE 9.5. Log PRs.';
    } else if (weekNumber === 9) {
      setsCompound = 4;
      repsCompound = isStrength ? '4 reps' : '5 reps';
      setsAccessory = 3;
      repsAccessory = '6 explosive reps';
      restCompound = 150;
      restAccessory = 90;
      targetRpeCompound = 8.5;
      targetRpeAccessory = 8;
      overloadCue = 'Week 9 Power Conversion: Focus on maximum rate of force development (RFD). Accelerate bar through the ceiling.';
    } else if (weekNumber === 10) {
      setsCompound = 5;
      repsCompound = isStrength ? '3 reps' : '4 reps';
      setsAccessory = 3;
      repsAccessory = '5 reps';
      restCompound = 180;
      restAccessory = 90;
      targetRpeCompound = 9;
      targetRpeAccessory = 8.5;
      overloadCue = 'Week 10 Heavy Power Waves: Heavy triples with explosive intent. Full 3-minute ATP-CP neural recovery between sets.';
    } else {
      setsCompound = 4;
      repsCompound = isStrength ? '3 reps (Heavy Cluster)' : '3-4 reps';
      setsAccessory = 3;
      repsAccessory = '4-5 reps';
      restCompound = 180;
      restAccessory = 90;
      targetRpeCompound = 9.5;
      targetRpeAccessory = 9;
      overloadCue = 'Week 11 Pre-Test Peak: Peak tactical load carriage. 1 rep in reserve. Prepare for next week benchmark assessment.';
    }
  }

  return {
    phase,
    weekNumber,
    isDeload,
    isPeakTesting,
    setsCompound,
    repsCompound,
    setsAccessory,
    repsAccessory,
    restCompound,
    restAccessory,
    targetRpeCompound,
    targetRpeAccessory,
    phaseName,
    phaseIntent,
    overloadCue,
  };
}

export function getPeriodizedExercises(
  daysPerWeek: number,
  cycleDay: number,
  phaseParams: PeriodizedPhaseParams,
  dayNum: number,
  isStrength: boolean,
  cardioPreference?: string,
  runningDist?: string,
  cardioCircuitType?: string,
  bannedRules: BannedLimitation[] = []
): { focus: string; exercises: any[] } {
  const { phase, weekNumber, isPeakTesting, setsCompound, repsCompound, setsAccessory, repsAccessory, restCompound, restAccessory, targetRpeCompound, targetRpeAccessory, overloadCue } = phaseParams;
  const exercises: any[] = [];
  let focus = '';

  if (daysPerWeek === 4) {
    if (cycleDay === 1) {
      if (phase === 1) {
        focus = `Day ${dayNum}: Upper Body Base Armor & Density (Phase 1 • Wk ${weekNumber})`;
        exercises.push(
          { id: `ex-${dayNum}-1`, name: 'Incline Dumbbell Bench Press', muscleGroup: 'Chest', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: `Upper chest hypertrophy. ${overloadCue}` },
          { id: `ex-${dayNum}-2`, name: 'Chest-Supported Dumbbell Row', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Retract scapulae fully, 1-sec squeeze at top.' },
          { id: `ex-${dayNum}-3`, name: 'Seated Dumbbell Arnold Press', muscleGroup: 'Shoulders', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Rotational delt armor with strict scapular plane path.' },
          { id: `ex-${dayNum}-4`, name: 'Neutral-Grip Lat Pulldown', muscleGroup: 'Back', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Full dead-hang stretch, pull elbows to hips.' },
          { id: `ex-${dayNum}-5`, name: 'Incline DB Biceps Curls & Overhead Triceps Extensions', muscleGroup: 'Arms', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Arm tendon resilience for physical duty.' }
        );
      } else if (phase === 2) {
        focus = `Day ${dayNum}: Upper Body Strength Intensification (Phase 2 • Wk ${weekNumber})`;
        exercises.push(
          { id: `ex-${dayNum}-1`, name: isStrength ? 'Barbell Flat Bench Press or Heavy DB Floor Press' : 'Flat Barbell Bench Press', muscleGroup: 'Chest', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: `Heavy horizontal pressing power. ${overloadCue}` },
          { id: `ex-${dayNum}-2`, name: 'Pendlay Barbell Row or Heavy Seal Row', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Explosive drive from floor or dead-stop, pause at chest.' },
          { id: `ex-${dayNum}-3`, name: 'Standing Barbell Overhead Press or Landmine Press', muscleGroup: 'Shoulders', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Locked core, strict vertical press.' },
          { id: `ex-${dayNum}-4`, name: 'Weighted or Strict Neutral-Grip Pull-Ups', muscleGroup: 'Back', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Dead hang to chin over bar. Full lat engagement.' },
          { id: `ex-${dayNum}-5`, name: 'Barbell EZ-Bar Curls & Skull Crushers', muscleGroup: 'Arms', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Heavy arm mass and elbow joint durability.' }
        );
      } else {
        focus = `Day ${dayNum}: Upper Body Peak Tactical Power & RFD (Phase 3 • Wk ${weekNumber})`;
        exercises.push(
          { id: `ex-${dayNum}-1`, name: isPeakTesting ? 'Competition Paused Bench Press (Benchmark Test)' : 'Competition Paused Bench Press or Explosive DB Press', muscleGroup: 'Chest', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: `Max rate of force development. ${overloadCue}` },
          { id: `ex-${dayNum}-2`, name: 'Heavy Single-Arm Kroc Row or Paused T-Bar Row', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Heavy grip overload and asymmetric back density.' },
          { id: `ex-${dayNum}-3`, name: 'Explosive Push Press or Landmine Speed Thrusters', muscleGroup: 'Shoulders', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Leg drive transition to overhead lockout speed.' },
          { id: `ex-${dayNum}-4`, name: 'Explosive Pull-Ups or Heavy Towel Grip Pulldowns', muscleGroup: 'Back', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Duty tactical grip strength and high-speed vertical pull.' },
          { id: `ex-${dayNum}-5`, name: 'Close-Grip Bench Press & Hammer Curls', muscleGroup: 'Arms', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Duty lockout pressing power and forearm armor.' }
        );
      }
    } else if (cycleDay === 2) {
      if (phase === 1) {
        focus = `Day ${dayNum}: Lower Body Kinetic Power & Quad Armor (Phase 1 • Wk ${weekNumber})`;
        exercises.push(
          { id: `ex-${dayNum}-1`, name: 'Goblet Squats with 3-sec pause or Hack Squat', muscleGroup: 'Quads', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: `Vertical torso, deep quad burn. ${overloadCue}` },
          { id: `ex-${dayNum}-2`, name: 'Bulgarian Split Squats (Dumbbells at sides)', muscleGroup: 'Quads', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Unilateral pursuit stamina and knee armor.' },
          { id: `ex-${dayNum}-3`, name: 'Romanian Deadlift (Dumbbell or Barbell)', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Hips back deeply, full hamstring stretch.' },
          { id: `ex-${dayNum}-4`, name: 'Standing Calf Raises & Hanging Knee Tucks', muscleGroup: 'Core', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Anti-extension core armor and ankle spring.' }
        );
      } else if (phase === 2) {
        focus = `Day ${dayNum}: Lower Body Heavy Force Production (Phase 2 • Wk ${weekNumber})`;
        exercises.push(
          { id: `ex-${dayNum}-1`, name: isStrength ? 'Heavy Box Squats to Parallel or Barbell Back Squat' : 'Box Squats to Parallel', muscleGroup: 'Quads', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: `Heavy knee extension power. ${overloadCue}` },
          { id: `ex-${dayNum}-2`, name: 'Heavy Barbell Step-Ups onto 18" Box', muscleGroup: 'Quads', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Single-leg duty pursuit force.' },
          { id: `ex-${dayNum}-3`, name: 'High-Handle Trap Bar RDLs or Barbell Good Mornings', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Heavy posterior chain hinge.' },
          { id: `ex-${dayNum}-4`, name: 'Seated Calf Raises & Strict Hanging Leg Raises', muscleGroup: 'Core', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Soleus armor and core anti-extension.' }
        );
      } else {
        focus = `Day ${dayNum}: Lower Body Peak RFD & Pursuit Velocity (Phase 3 • Wk ${weekNumber})`;
        exercises.push(
          { id: `ex-${dayNum}-1`, name: isPeakTesting ? 'Dead-Stop Box Squat (Benchmark 3-Rep Test)' : 'Dead-Stop Box Squats or Belt Squats', muscleGroup: 'Quads', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: `Explosive leg drive off box with zero momentum. ${overloadCue}` },
          { id: `ex-${dayNum}-2`, name: 'Explosive Jump Split Squats or Deficit Reverse Lunges', muscleGroup: 'Quads', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Fast-twitch velocity and sprint stride power.' },
          { id: `ex-${dayNum}-3`, name: 'Barbell Snatch-Grip RDLs or Single-Leg RDLs', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Upper back and hamstring isometric rigidity.' },
          { id: `ex-${dayNum}-4`, name: 'Standing Tibialis & Calf Spring Hops + Ab Wheel Rollouts', muscleGroup: 'Core', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Duty sprint deceleration resilience.' }
        );
      }
    } else if (cycleDay === 4) {
      if (phase === 1) {
        focus = `Day ${dayNum}: Upper Body Hypertrophy & Density (Phase 1 • Wk ${weekNumber})`;
        exercises.push(
          { id: `ex-${dayNum}-1`, name: 'Neutral-Grip Dumbbell Floor Press', muscleGroup: 'Chest', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: `Chest and triceps lockout strength. ${overloadCue}` },
          { id: `ex-${dayNum}-2`, name: 'Single-Arm Dumbbell Meadows Row', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Pull toward back hip crease.' },
          { id: `ex-${dayNum}-3`, name: 'Leaning Dumbbell Lateral Raises', muscleGroup: 'Shoulders', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Medial deltoid armor cap.' },
          { id: `ex-${dayNum}-4`, name: 'Hammer Curls & Overhead Triceps Cable Extensions', muscleGroup: 'Arms', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Forearm and elbow tendon durability.' }
        );
      } else if (phase === 2) {
        focus = `Day ${dayNum}: Upper Body Mass & Mechanical Tension (Phase 2 • Wk ${weekNumber})`;
        exercises.push(
          { id: `ex-${dayNum}-1`, name: 'Weighted Dips or Heavy Incline Barbell Bench', muscleGroup: 'Chest', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: `Heavy pressing density. ${overloadCue}` },
          { id: `ex-${dayNum}-2`, name: 'Barbell Bent-Over Row (Overhand Grip)', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Heavy horizontal pulling density.' },
          { id: `ex-${dayNum}-3`, name: 'Heavy Cable Lateral Raises or DB Upright Rows', muscleGroup: 'Shoulders', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Lateral deltoid width and vest stability.' },
          { id: `ex-${dayNum}-4`, name: 'Incline Dumbbell Curls & Barbell JM Press', muscleGroup: 'Arms', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Triceps lockout mass and arm armor.' }
        );
      } else {
        focus = `Day ${dayNum}: Upper Body Velocity & Duty Resilience (Phase 3 • Wk ${weekNumber})`;
        exercises.push(
          { id: `ex-${dayNum}-1`, name: isPeakTesting ? 'Plyometric Push-Ups (PAT Benchmark Test)' : 'Plyometric Push-Ups (Chest-to-Deck) or Banded DB Press', muscleGroup: 'Chest', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: `Upper body rate of force development. ${overloadCue}` },
          { id: `ex-${dayNum}-2`, name: 'Single-Arm Cable High Row with 2-sec Peak Squeeze', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Isometric back density under maximal tension.' },
          { id: `ex-${dayNum}-3`, name: 'Face Pulls with External Rotation & Heavy DB Shrugs', muscleGroup: 'Shoulders', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Duty vest neck and trapezius shield.' },
          { id: `ex-${dayNum}-4`, name: 'Barbell Spider Curls & Rope Triceps Pushdowns', muscleGroup: 'Arms', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Terminal arm pump and high work-capacity resilience.' }
        );
      }
    } else {
      if (phase === 1) {
        focus = `Day ${dayNum}: Posterior Chain Armor & Core Carriage (Phase 1 • Wk ${weekNumber})`;
        exercises.push(
          { id: `ex-${dayNum}-1`, name: 'Romanian Deadlift (Barbell or DB)', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: `Hamstring tension accumulation. ${overloadCue}` },
          { id: `ex-${dayNum}-2`, name: 'Barbell or Dumbbell Hip Thrusts', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Glute activation and pelvic stability.' },
          { id: `ex-${dayNum}-3`, name: 'Backward Sled Drags or Hamstring Curls', muscleGroup: 'Quads', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Knee bulletproofing and blood flow recovery.' },
          { id: `ex-${dayNum}-4`, name: 'Dumbbell Suitcase Walks (40 yds per hand)', muscleGroup: 'Full Body', defaultSets: 3, targetReps: '40 yds', restPeriodSeconds: 60, targetRpe: 8, notes: 'Anti-lateral flexion duty core armor.' }
        );
      } else if (phase === 2) {
        focus = `Day ${dayNum}: Posterior Chain Heavy Loading & Carries (Phase 2 • Wk ${weekNumber})`;
        exercises.push(
          { id: `ex-${dayNum}-1`, name: 'High-Handle Trap Bar Heavy Deadlift', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: `Whole-body heavy force production. ${overloadCue}` },
          { id: `ex-${dayNum}-2`, name: 'Barbell Glute Bridges with pause at top', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Sprint acceleration hip thrust.' },
          { id: `ex-${dayNum}-3`, name: 'Glute-Ham Raises or Nordic Hamstring Negatives', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Eccentric hamstring durability against sprint tears.' },
          { id: `ex-${dayNum}-4`, name: 'Heavy Dumbbell Farmer Carries (60 yds)', muscleGroup: 'Full Body', defaultSets: 4, targetReps: '60 yds', restPeriodSeconds: 60, targetRpe: 9, notes: 'Crush grip, chest proud, short rapid steps.' }
        );
      } else {
        focus = `Day ${dayNum}: Posterior Chain Peak RFD & Tactical Carriage (Phase 3 • Wk ${weekNumber})`;
        exercises.push(
          { id: `ex-${dayNum}-1`, name: isPeakTesting ? 'Dead-Stop Trap Bar Deadlift (Benchmark 3-Rep Test)' : 'Dead-Stop Trap Bar Deadlift from Floor', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: `Maximum rate of force development. ${overloadCue}` },
          { id: `ex-${dayNum}-2`, name: 'Heavy Barbell Hip Thrusts with 2-second hold at lockout', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Maximum glute power for foot pursuit speed.' },
          { id: `ex-${dayNum}-3`, name: 'Heavy Russian Kettlebell Swings (Maximum Hip Snap)', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Fast-twitch hip hinge velocity.' },
          { id: `ex-${dayNum}-4`, name: 'Heavy Zercher Carry or Asymmetric Sandbag Carry (50 yds)', muscleGroup: 'Full Body', defaultSets: 4, targetReps: '50 yds', restPeriodSeconds: 75, targetRpe: 9, notes: 'Awkward load carriage simulating dummy drag or downed partner.' }
        );
      }
    }
  } else if (daysPerWeek === 3) {
    if (cycleDay === 1) {
      if (phase === 1) {
        focus = `Day ${dayNum}: Full Body Chassis A (DB Press & Hinge • Phase 1 • Wk ${weekNumber})`;
        exercises.push(
          { id: `ex-${dayNum}-1`, name: 'Incline Dumbbell Bench Press', muscleGroup: 'Chest', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: overloadCue },
          { id: `ex-${dayNum}-2`, name: 'Chest-Supported Dumbbell Row', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Scapular retractors, pause 1s at chest.' },
          { id: `ex-${dayNum}-3`, name: 'Romanian Deadlift (Dumbbell or Barbell)', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Hips back deeply, vertical spine.' },
          { id: `ex-${dayNum}-4`, name: 'Goblet Squats or Hack Squat', muscleGroup: 'Quads', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Vertical torso, active quad burn.' }
        );
      } else if (phase === 2) {
        focus = `Day ${dayNum}: Full Body Chassis A (Barbell Bench & Heavy Deadlift • Phase 2 • Wk ${weekNumber})`;
        exercises.push(
          { id: `ex-${dayNum}-1`, name: 'Barbell Flat Bench Press or Heavy DB Floor Press', muscleGroup: 'Chest', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: overloadCue },
          { id: `ex-${dayNum}-2`, name: 'Pendlay Barbell Row or Heavy Seal Row', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Explosive drive off floor.' },
          { id: `ex-${dayNum}-3`, name: 'High-Handle Trap Bar Deadlift', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Maximum whole-body recruitment.' },
          { id: `ex-${dayNum}-4`, name: 'Heavy Box Squats to Parallel', muscleGroup: 'Quads', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Lower body foundation.' }
        );
      } else {
        focus = `Day ${dayNum}: Full Body Chassis A (Paused Bench & Dead-Stop Deadlift • Phase 3 • Wk ${weekNumber})`;
        exercises.push(
          { id: `ex-${dayNum}-1`, name: isPeakTesting ? 'Paused Competition Bench Press (Benchmark Test)' : 'Paused Competition Bench Press', muscleGroup: 'Chest', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: overloadCue },
          { id: `ex-${dayNum}-2`, name: 'Heavy Single-Arm Kroc Row', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Asymmetric grip and lat thickness.' },
          { id: `ex-${dayNum}-3`, name: isPeakTesting ? 'Dead-Stop Trap Bar Deadlift (Benchmark Test)' : 'Dead-Stop Trap Bar Deadlift from Floor', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Peak rate of force development.' },
          { id: `ex-${dayNum}-4`, name: 'Front Squats or Belt Squats', muscleGroup: 'Quads', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Pure quad drive with zero spinal strain.' }
        );
      }
    } else if (cycleDay === 3) {
      if (phase === 1) {
        focus = `Day ${dayNum}: Full Body Chassis B (Goblet Squat & Arnold Press • Phase 1 • Wk ${weekNumber})`;
        exercises.push(
          { id: `ex-${dayNum}-1`, name: 'Goblet Squats with 3-sec pause', muscleGroup: 'Quads', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: overloadCue },
          { id: `ex-${dayNum}-2`, name: 'Seated Dumbbell Arnold Press', muscleGroup: 'Shoulders', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Rotator cuff preservation.' },
          { id: `ex-${dayNum}-3`, name: 'Neutral-Grip Lat Pulldown', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Full lat stretch at top.' },
          { id: `ex-${dayNum}-4`, name: 'Barbell or Dumbbell Hip Thrusts', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Glute activation.' }
        );
      } else if (phase === 2) {
        focus = `Day ${dayNum}: Full Body Chassis B (Box Squats & Overhead Press • Phase 2 • Wk ${weekNumber})`;
        exercises.push(
          { id: `ex-${dayNum}-1`, name: 'Box Squats to Parallel or Barbell Back Squat', muscleGroup: 'Quads', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: overloadCue },
          { id: `ex-${dayNum}-2`, name: 'Standing Barbell Overhead Press', muscleGroup: 'Shoulders', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Strict vertical force.' },
          { id: `ex-${dayNum}-3`, name: 'Weighted or Strict Neutral-Grip Pull-Ups', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Dead-hang pull strength.' },
          { id: `ex-${dayNum}-4`, name: 'Barbell Glute Bridges with pause', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Hip thrust power.' }
        );
      } else {
        focus = `Day ${dayNum}: Full Body Chassis B (Dead-Stop Squat & Push Press • Phase 3 • Wk ${weekNumber})`;
        exercises.push(
          { id: `ex-${dayNum}-1`, name: isPeakTesting ? 'Dead-Stop Box Squat (Benchmark Test)' : 'Dead-Stop Box Squats (Explosive Leg Drive)', muscleGroup: 'Quads', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: overloadCue },
          { id: `ex-${dayNum}-2`, name: 'Explosive Push Press or Landmine Speed Thrusters', muscleGroup: 'Shoulders', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Full body velocity.' },
          { id: `ex-${dayNum}-3`, name: 'Explosive Chest-to-Bar Pull-Ups or Towel Pulldowns', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Tactical grip strength.' },
          { id: `ex-${dayNum}-4`, name: 'Heavy Barbell Hip Thrusts (2s hold)', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Sprinting acceleration.' }
        );
      }
    } else {
      if (phase === 1) {
        focus = `Day ${dayNum}: Full Body Chassis C (Unilateral Armor • Phase 1 • Wk ${weekNumber})`;
        exercises.push(
          { id: `ex-${dayNum}-1`, name: 'Bulgarian Split Squats (Dumbbells at side)', muscleGroup: 'Quads', defaultSets: setsCompound, targetReps: repsAccessory, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: overloadCue },
          { id: `ex-${dayNum}-2`, name: 'Single-Arm Dumbbell Row', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Heavy pull without torso twisting.' },
          { id: `ex-${dayNum}-3`, name: 'Incline Dumbbell Press', muscleGroup: 'Chest', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Upper chest angle.' },
          { id: `ex-${dayNum}-4`, name: 'Dumbbell Suitcase Walks', muscleGroup: 'Full Body', defaultSets: 3, targetReps: '40 yds', restPeriodSeconds: 60, targetRpe: 8, notes: 'Anti-lateral flexion core.' }
        );
      } else if (phase === 2) {
        focus = `Day ${dayNum}: Full Body Chassis C (Heavy Unilateral & Carries • Phase 2 • Wk ${weekNumber})`;
        exercises.push(
          { id: `ex-${dayNum}-1`, name: 'Heavy Barbell Step-Ups onto 18" Box', muscleGroup: 'Quads', defaultSets: setsCompound, targetReps: repsAccessory, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: overloadCue },
          { id: `ex-${dayNum}-2`, name: 'Barbell Bent-Over Row', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Heavy back density.' },
          { id: `ex-${dayNum}-3`, name: 'Weighted Dips or Heavy Floor Press', muscleGroup: 'Chest', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Triceps and chest lockout.' },
          { id: `ex-${dayNum}-4`, name: 'Heavy Dumbbell Farmer Carries', muscleGroup: 'Full Body', defaultSets: 4, targetReps: '60 yds', restPeriodSeconds: 60, targetRpe: 9, notes: 'Crush grip, chest proud.' }
        );
      } else {
        focus = `Day ${dayNum}: Full Body Chassis C (Explosive Velocity & Duty Carries • Phase 3 • Wk ${weekNumber})`;
        exercises.push(
          { id: `ex-${dayNum}-1`, name: 'Explosive Jump Split Squats or Deficit Reverse Lunges', muscleGroup: 'Quads', defaultSets: setsCompound, targetReps: repsAccessory, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: overloadCue },
          { id: `ex-${dayNum}-2`, name: 'Single-Arm Cable High Row with 2-sec hold', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Isometric back strength.' },
          { id: `ex-${dayNum}-3`, name: 'Plyometric Push-Ups (Chest-to-Deck)', muscleGroup: 'Chest', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Upper body RFD.' },
          { id: `ex-${dayNum}-4`, name: 'Heavy Zercher Carry or Asymmetric Sandbag Carry', muscleGroup: 'Full Body', defaultSets: 4, targetReps: '50 yds', restPeriodSeconds: 75, targetRpe: 9, notes: 'Duty tactical awkward carry.' }
        );
      }
    }
  } else if (daysPerWeek === 5) {
    if (cycleDay === 1) {
      focus = `Day ${dayNum}: Upper Push Armor (${phaseParams.phaseName})`;
      exercises.push(
        { id: `ex-${dayNum}-1`, name: phase === 1 ? 'Incline Dumbbell Bench Press' : phase === 2 ? 'Barbell Flat Bench Press' : (isPeakTesting ? 'Paused Competition Bench Press (Benchmark Test)' : 'Paused Competition Bench Press'), muscleGroup: 'Chest', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: overloadCue },
        { id: `ex-${dayNum}-2`, name: phase === 1 ? 'Seated Dumbbell Arnold Press' : phase === 2 ? 'Standing Barbell Overhead Press' : 'Explosive Push Press', muscleGroup: 'Shoulders', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Vertical pressing power.' },
        { id: `ex-${dayNum}-3`, name: phase === 1 ? 'Dumbbell Incline Flyes' : phase === 2 ? 'Weighted Dips' : 'Plyometric Push-Ups (Chest-to-Deck)', muscleGroup: 'Chest', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Chest density.' },
        { id: `ex-${dayNum}-4`, name: phase === 1 ? 'Overhead DB Triceps Extensions' : phase === 2 ? 'Barbell Skull Crushers' : 'Close-Grip Bench Press', muscleGroup: 'Arms', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Triceps lockout.' }
      );
    } else if (cycleDay === 2) {
      focus = `Day ${dayNum}: Upper Pull Armor (${phaseParams.phaseName})`;
      exercises.push(
        { id: `ex-${dayNum}-1`, name: phase === 1 ? 'Chest-Supported Dumbbell Row' : phase === 2 ? 'Pendlay Barbell Row' : (isPeakTesting ? 'Heavy Barbell Row (Benchmark Test)' : 'Heavy Single-Arm Kroc Row'), muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: overloadCue },
        { id: `ex-${dayNum}-2`, name: phase === 1 ? 'Neutral-Grip Lat Pulldown' : phase === 2 ? 'Weighted or Strict Neutral Pull-Ups' : 'Explosive Chest-to-Bar Pull-Ups', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Vertical lat power.' },
        { id: `ex-${dayNum}-3`, name: phase === 1 ? 'Rear Delt Flyes' : phase === 2 ? 'Face Pulls with Hold' : 'Single-Arm Cable High Row', muscleGroup: 'Shoulders', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Upper back posture.' },
        { id: `ex-${dayNum}-4`, name: phase === 1 ? 'Incline Dumbbell Biceps Curls' : phase === 2 ? 'Heavy Barbell EZ-Bar Curls' : 'Barbell Spider Curls', muscleGroup: 'Arms', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Biceps density.' }
      );
    } else if (cycleDay === 3) {
      focus = `Day ${dayNum}: Lower Body Chassis A (Squat Focus • ${phaseParams.phaseName})`;
      exercises.push(
        { id: `ex-${dayNum}-1`, name: phase === 1 ? 'Goblet Squats with 3-sec pause' : phase === 2 ? 'Heavy Box Squats to Parallel' : (isPeakTesting ? 'Dead-Stop Box Squat (Benchmark Test)' : 'Dead-Stop Box Squats'), muscleGroup: 'Quads', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: overloadCue },
        { id: `ex-${dayNum}-2`, name: phase === 1 ? 'Bulgarian Split Squats' : phase === 2 ? 'Heavy Barbell Step-Ups' : 'Explosive Jump Split Squats', muscleGroup: 'Quads', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Unilateral pursuit stamina.' },
        { id: `ex-${dayNum}-3`, name: phase === 1 ? 'Standing Calf Raises' : phase === 2 ? 'Seated Calf Raises' : 'Standing Tibialis & Calf Spring Hops', muscleGroup: 'Quads', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Ankle spring.' },
        { id: `ex-${dayNum}-4`, name: phase === 1 ? 'Hanging Knee Tucks' : phase === 2 ? 'Strict Hanging Leg Raises' : 'Ab Wheel Rollouts', muscleGroup: 'Core', defaultSets: 3, targetReps: '12-15 reps', restPeriodSeconds: 60, targetRpe: 7, notes: 'Anti-extension core.' }
      );
    } else if (cycleDay === 5) {
      focus = `Day ${dayNum}: Upper Body Density & Armor (${phaseParams.phaseName})`;
      exercises.push(
        { id: `ex-${dayNum}-1`, name: phase === 1 ? 'Neutral-Grip Dumbbell Floor Press' : phase === 2 ? 'Incline Barbell Bench Press' : 'Band-Resisted DB Press', muscleGroup: 'Chest', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: overloadCue },
        { id: `ex-${dayNum}-2`, name: phase === 1 ? 'Single-Arm Dumbbell Meadows Row' : phase === 2 ? 'Barbell Bent-Over Row' : 'Single-Arm Cable High Row (Hold)', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Lat thickness.' },
        { id: `ex-${dayNum}-3`, name: phase === 1 ? 'Leaning DB Lateral Raises' : phase === 2 ? 'Heavy Cable Lateral Raises' : 'Face Pulls & Heavy DB Shrugs', muscleGroup: 'Shoulders', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Deltoid width.' },
        { id: `ex-${dayNum}-4`, name: phase === 1 ? 'Hammer Curls & Triceps Dips' : phase === 2 ? 'JM Press & Incline DB Curls' : 'Rope Triceps Pushdowns & Spider Curls', muscleGroup: 'Arms', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Arm tendon armor.' }
      );
    } else {
      focus = `Day ${dayNum}: Lower Body Chassis B (Hinge & Carries • ${phaseParams.phaseName})`;
      exercises.push(
        { id: `ex-${dayNum}-1`, name: phase === 1 ? 'Romanian Deadlift (Barbell or DB)' : phase === 2 ? 'High-Handle Trap Bar Heavy Deadlift' : (isPeakTesting ? 'Dead-Stop Trap Bar Deadlift (Benchmark Test)' : 'Dead-Stop Trap Bar Deadlift'), muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: overloadCue },
        { id: `ex-${dayNum}-2`, name: phase === 1 ? 'Barbell or Dumbbell Hip Thrusts' : phase === 2 ? 'Barbell Glute Bridges with pause' : 'Heavy Hip Thrusts (2s lockout hold)', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Glute acceleration power.' },
        { id: `ex-${dayNum}-3`, name: phase === 1 ? 'Backward Sled Drags or Hamstring Curls' : phase === 2 ? 'Glute-Ham Raises or Nordic Negatives' : 'Heavy Russian Kettlebell Swings', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Hamstring resilience.' },
        { id: `ex-${dayNum}-4`, name: phase === 1 ? 'Dumbbell Suitcase Walks' : phase === 2 ? 'Heavy Dumbbell Farmer Carries' : 'Heavy Zercher Carry or Asymmetric Sandbag Carry', muscleGroup: 'Full Body', defaultSets: 4, targetReps: phase === 1 ? '40 yds' : '60 yds', restPeriodSeconds: 60, targetRpe: 9, notes: 'Crush grip & duty core.' }
      );
    }
  } else {
    // 6-Day Split: [1, 2, 3, 4, 5, 6]
    if (cycleDay === 1) {
      focus = `Day ${dayNum}: Push A (Heavy Press • ${phaseParams.phaseName})`;
      exercises.push(
        { id: `ex-${dayNum}-1`, name: phase === 1 ? 'Flat Dumbbell Bench Press' : phase === 2 ? 'Barbell Bench Press' : (isPeakTesting ? 'Paused Competition Bench Press (Benchmark Test)' : 'Paused Competition Bench Press'), muscleGroup: 'Chest', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: overloadCue },
        { id: `ex-${dayNum}-2`, name: phase === 1 ? 'Seated Dumbbell Shoulder Press' : phase === 2 ? 'Standing Barbell Overhead Press' : 'Explosive Push Press', muscleGroup: 'Shoulders', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Vertical pressing power.' },
        { id: `ex-${dayNum}-3`, name: phase === 1 ? 'Dumbbell Incline Press' : phase === 2 ? 'Weighted Dips' : 'Plyo Push-Ups (Chest-to-Deck)', muscleGroup: 'Chest', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Clavicular head development.' },
        { id: `ex-${dayNum}-4`, name: phase === 1 ? 'Overhead Triceps Extensions' : phase === 2 ? 'Barbell Skull Crushers' : 'Close-Grip Bench Press', muscleGroup: 'Arms', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Triceps lockout.' }
      );
    } else if (cycleDay === 2) {
      focus = `Day ${dayNum}: Pull A (Heavy Pull • ${phaseParams.phaseName})`;
      exercises.push(
        { id: `ex-${dayNum}-1`, name: phase === 1 ? 'Chest-Supported Row' : phase === 2 ? 'Pendlay Barbell Row' : (isPeakTesting ? 'Heavy Barbell Row (Benchmark Test)' : 'Heavy Single-Arm Kroc Row'), muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: overloadCue },
        { id: `ex-${dayNum}-2`, name: phase === 1 ? 'Neutral-Grip Lat Pulldown' : phase === 2 ? 'Weighted Pull-Ups' : 'Explosive Chest-to-Bar Pull-Ups', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: 'Vertical pulling sweep.' },
        { id: `ex-${dayNum}-3`, name: phase === 1 ? 'Face Pulls or Rear Delt Flyes' : phase === 2 ? 'Rear Delt Flyes with hold' : 'Cable High Row with squeeze', muscleGroup: 'Shoulders', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Scapular health.' },
        { id: `ex-${dayNum}-4`, name: phase === 1 ? 'Incline DB Biceps Curls' : phase === 2 ? 'Barbell EZ-Bar Curls' : 'Barbell Spider Curls', muscleGroup: 'Arms', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Peak contraction curls.' }
      );
    } else if (cycleDay === 3) {
      focus = `Day ${dayNum}: Legs A (Squat Power • ${phaseParams.phaseName})`;
      exercises.push(
        { id: `ex-${dayNum}-1`, name: phase === 1 ? 'Goblet Squats with 3-sec pause' : phase === 2 ? 'Heavy Box Squats to Parallel' : (isPeakTesting ? 'Dead-Stop Box Squat (Benchmark Test)' : 'Dead-Stop Box Squat'), muscleGroup: 'Quads', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: overloadCue },
        { id: `ex-${dayNum}-2`, name: phase === 1 ? 'Bulgarian Split Squats' : phase === 2 ? 'Heavy Barbell Step-Ups' : 'Explosive Jump Split Squats', muscleGroup: 'Quads', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Unilateral pursuit stamina.' },
        { id: `ex-${dayNum}-3`, name: phase === 1 ? 'Standing Calf Raises' : phase === 2 ? 'Seated Calf Raises' : 'Tibialis & Calf Spring Hops', muscleGroup: 'Quads', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Achilles and calf spring.' },
        { id: `ex-${dayNum}-4`, name: phase === 1 ? 'Hanging Knee Raises' : phase === 2 ? 'Strict Hanging Leg Raises' : 'Ab Wheel Rollouts', muscleGroup: 'Core', defaultSets: 3, targetReps: '12-15 reps', restPeriodSeconds: 60, targetRpe: 7, notes: 'Anti-extension core.' }
      );
    } else if (cycleDay === 4) {
      focus = `Day ${dayNum}: Push B (Incline & Lateral Delts • ${phaseParams.phaseName})`;
      exercises.push(
        { id: `ex-${dayNum}-1`, name: phase === 1 ? 'Incline Dumbbell Bench Press' : phase === 2 ? 'Incline Barbell Bench Press' : 'Band-Resisted DB Press', muscleGroup: 'Chest', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: overloadCue },
        { id: `ex-${dayNum}-2`, name: phase === 1 ? 'Half-Kneeling Landmine Press' : phase === 2 ? 'Standing DB Arnold Press' : 'Explosive Landmine Thruster', muscleGroup: 'Shoulders', defaultSets: setsCompound, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeCompound, notes: 'Overhead drive.' },
        { id: `ex-${dayNum}-3`, name: phase === 1 ? 'Dumbbell Lateral Raises' : phase === 2 ? 'Heavy Cable Lateral Raises' : 'Heavy DB Leaning Lateral Raises', muscleGroup: 'Shoulders', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Lateral deltoid cap.' },
        { id: `ex-${dayNum}-4`, name: phase === 1 ? 'Triceps Rope Pushdowns' : phase === 2 ? 'Barbell JM Press' : 'Dips / Ring Dips', muscleGroup: 'Arms', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Triceps lockout.' }
      );
    } else if (cycleDay === 5) {
      focus = `Day ${dayNum}: Pull B (Lats & Grip • ${phaseParams.phaseName})`;
      exercises.push(
        { id: `ex-${dayNum}-1`, name: phase === 1 ? 'Single-Arm Dumbbell Meadows Row' : phase === 2 ? 'Barbell Bent-Over Row' : 'Single-Arm Cable Row (Peak Hold)', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: overloadCue },
        { id: `ex-${dayNum}-2`, name: phase === 1 ? 'Neutral-Grip Lat Pulldown' : phase === 2 ? 'Strict Chin-Ups' : 'Heavy Towel Grip Pulldowns', muscleGroup: 'Back', defaultSets: setsCompound, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeCompound, notes: 'Dead-hang stretch.' },
        { id: `ex-${dayNum}-3`, name: phase === 1 ? 'Dumbbell Shrugs' : phase === 2 ? 'Heavy Barbell Shrugs' : 'Trap Bar Shrugs', muscleGroup: 'Back', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Trapezius vest armor.' },
        { id: `ex-${dayNum}-4`, name: phase === 1 ? 'Incline Hammer Curls' : phase === 2 ? 'Reverse EZ-Bar Curls' : 'Zottman Curls', muscleGroup: 'Arms', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Forearm brachioradialis.' }
      );
    } else {
      focus = `Day ${dayNum}: Legs B (Posterior Chain & Carries • ${phaseParams.phaseName})`;
      exercises.push(
        { id: `ex-${dayNum}-1`, name: phase === 1 ? 'Romanian Deadlift (Barbell or DB)' : phase === 2 ? 'High-Handle Trap Bar Heavy Deadlift' : (isPeakTesting ? 'Dead-Stop Trap Bar Deadlift (Benchmark Test)' : 'Dead-Stop Trap Bar Deadlift'), muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsCompound, restPeriodSeconds: restCompound, targetRpe: targetRpeCompound, notes: overloadCue },
        { id: `ex-${dayNum}-2`, name: phase === 1 ? 'Barbell or Dumbbell Hip Thrusts' : phase === 2 ? 'Barbell Hip Thrusts' : 'Heavy Barbell Hip Thrusts (2s hold)', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsCompound, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeCompound, notes: 'Glute sprint power.' },
        { id: `ex-${dayNum}-3`, name: phase === 1 ? 'Backward Sled Drags or Hamstring Curls' : phase === 2 ? 'Nordic Hamstring Negatives' : 'Heavy Russian Kettlebell Swings', muscleGroup: 'Hamstrings & Glutes', defaultSets: setsAccessory, targetReps: repsAccessory, restPeriodSeconds: restAccessory, targetRpe: targetRpeAccessory, notes: 'Hamstring resilience.' },
        { id: `ex-${dayNum}-4`, name: phase === 1 ? 'Dumbbell Suitcase Walks' : phase === 2 ? 'Heavy Dumbbell Farmer Carries' : 'Heavy Zercher Carry or Asymmetric Sandbag Carry', muscleGroup: 'Full Body', defaultSets: 4, targetReps: '60 yds', restPeriodSeconds: 60, targetRpe: 9, notes: 'Crush grip & tactical carriage.' }
      );
    }
  }

  // Add Cardio / Running if requested
  if (cardioPreference === 'running') {
    const dist = runningDist || '1.5-2.0 Miles';
    if (phase === 1) {
      exercises.push({
        id: `ex-${dayNum}-run`,
        name: `Tactical Aerobic Base Run (${dist})`,
        muscleGroup: 'Full Body',
        type: 'cardio',
        defaultSets: 1,
        targetReps: dist,
        restPeriodSeconds: 0,
        targetRpe: 7,
        notes: 'Phase 1 Base Aerobic: Continuous Zone 2 run at conversational pace (65-75% max HR) to build aerobic capacity.',
      });
    } else if (phase === 2) {
      exercises.push({
        id: `ex-${dayNum}-run`,
        name: `Anaerobic Threshold Pursuit Run (400m / 800m Repeats)`,
        muscleGroup: 'Full Body',
        type: 'cardio',
        defaultSets: 4,
        targetReps: '400m Repeats (1:1 Rest)',
        restPeriodSeconds: 90,
        targetRpe: 8.5,
        notes: 'Phase 2 Threshold Intervals: 400m run at duty pursuit pace, walk/jog 90s. Clearing lactate under fatigue.',
      });
    } else {
      exercises.push({
        id: `ex-${dayNum}-run`,
        name: isPeakTesting ? `1.5-Mile Duty PAT Benchmark Simulation Run` : `Max Effort Foot Pursuit Sprints (10-20-10 Yard Shuttles)`,
        muscleGroup: 'Full Body',
        type: 'cardio',
        defaultSets: isPeakTesting ? 1 : 6,
        targetReps: isPeakTesting ? '1.5 Miles (Max Timed Benchmark)' : '10-20-10 Shuttles',
        restPeriodSeconds: isPeakTesting ? 0 : 60,
        targetRpe: isPeakTesting ? 9.5 : 9,
        notes: isPeakTesting
          ? 'Phase 3 Peak Benchmark: Run 1.5 miles at maximum sustainable pace. Record benchmark time.'
          : 'Phase 3 Pursuit Speed: Maximum acceleration and deceleration simulating suspect pursuit.',
      });
    }
  } else if (cardioPreference === 'cardio_circuits' || cardioPreference === 'hybrid') {
    let circuitIndex = dayNum - 1;
    if (phase === 1) {
      circuitIndex = (dayNum % 2 === 0) ? 2 : 1;
    } else if (phase === 2) {
      circuitIndex = (dayNum % 2 === 0) ? 3 : 1;
    } else {
      circuitIndex = (dayNum % 2 === 0) ? 0 : 4;
    }
    const circuitEx = getDistinctCircuitForDay(circuitIndex, cardioCircuitType, bannedRules);
    exercises.push(circuitEx);
  }

  const sanitized = bannedRules.length > 0 ? sanitizeExerciseList(exercises, bannedRules) : exercises;
  return { focus, exercises: sanitized };
}

export function periodizeSchedule(
  rawSchedule: any[],
  totalDays: number,
  weeksCount: number,
  goalStr: string,
  level: string,
  bannedRules: BannedLimitation[],
  cardioPreference?: string,
  runningDist?: string,
  cardioCircuitType?: string,
  daysPerWeek: number = 4
): any[] {
  const isStrength = goalStr.toLowerCase().includes('strength') || goalStr.toLowerCase().includes('power');
  const periodizedSchedule: any[] = [];

  for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
    const cycleDay = ((dayNum - 1) % 7) + 1;
    const weekNumber = Math.ceil(dayNum / 7);
    const phaseParams = getPeriodizedPhaseParams(weekNumber, goalStr, level);

    let isTrainingDay = false;
    if (daysPerWeek === 3) isTrainingDay = [1, 3, 5].includes(cycleDay);
    else if (daysPerWeek === 4) isTrainingDay = [1, 2, 4, 5].includes(cycleDay);
    else if (daysPerWeek === 5) isTrainingDay = [1, 2, 3, 5, 6].includes(cycleDay);
    else if (daysPerWeek === 6) isTrainingDay = [1, 2, 3, 4, 5, 6].includes(cycleDay);
    else isTrainingDay = [1, 3, 5, 6].includes(cycleDay);

    if (!isTrainingDay) {
      periodizedSchedule.push({
        day: dayNum,
        focus: `Day ${dayNum}: Active Regeneration & Mobility Flush (${phaseParams.phaseName})`,
        isRestDay: true,
        exercises: [],
      });
      continue;
    }

    const { focus, exercises } = getPeriodizedExercises(
      daysPerWeek,
      cycleDay,
      phaseParams,
      dayNum,
      isStrength,
      cardioPreference,
      runningDist,
      cardioCircuitType,
      bannedRules
    );

    periodizedSchedule.push({
      day: dayNum,
      focus,
      isRestDay: false,
      exercises,
    });
  }

  return periodizedSchedule;
}

export function buildDynamicCalibratedPlan(params: {
  goals: string[];
  fitnessLevel: string;
  frequency: string;
  scheduleDuration: 'weekly' | 'monthly' | '8weeks' | '12weeks' | string;
  scheduleWeeks?: number;
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

  let weeksCount = 4;
  if (typeof params.scheduleWeeks === 'number' && params.scheduleWeeks >= 1 && params.scheduleWeeks <= 12) {
    weeksCount = Math.round(params.scheduleWeeks);
  } else if (params.scheduleDuration === '12weeks' || params.scheduleDuration === '12-week' || params.scheduleDuration === 'macrocycle') {
    weeksCount = 12;
  } else if (params.scheduleDuration === '8weeks' || params.scheduleDuration === '8-week') {
    weeksCount = 8;
  } else if (params.scheduleDuration === 'monthly' || params.scheduleDuration === '4weeks' || params.scheduleDuration === '4-week') {
    weeksCount = 4;
  } else if (params.scheduleDuration === 'weekly' || params.scheduleDuration === '1week' || params.scheduleDuration === '1-week') {
    weeksCount = 1;
  } else if (typeof params.scheduleDuration === 'string') {
    const match = params.scheduleDuration.match(/(\d+)\s*week/i);
    if (match) {
      weeksCount = Math.max(1, Math.min(12, parseInt(match[1], 10)));
    }
  }

  const totalDays = weeksCount * 7;
  const level = params.fitnessLevel || 'Intermediate';

  const rawLimitations = [
    ...(params.injuries || []),
    params.injuryNotes || '',
    params.notes || '',
  ].join(' ');
  const bannedRules = extractBannedMovements(rawLimitations, params.injuries || []);

  const schedule = periodizeSchedule(
    [],
    totalDays,
    weeksCount,
    goalStr,
    level,
    bannedRules,
    params.cardioPreference,
    params.runningDistancePreference,
    params.cardioCircuitType,
    daysPerWeek
  );

  const rawPlan = {
    title: `Patrol Ready ${category} Architecture`,
    subtitle: `${params.fitnessLevel} • ${params.frequency} • ${category}`,
    category,
    frequency: params.frequency,
    scheduleDuration: weeksCount === 1
      ? '7-Day Rotation'
      : weeksCount === 4
      ? '4-Week Monthly Periodization (Phase 1 Base Accumulation)'
      : `${weeksCount}-Week Periodized Macro-Cycle (${weeksCount <= 4 ? 'Phase 1 Accumulation' : weeksCount <= 8 ? 'Phase 1 & Phase 2 Intensification' : 'Full 3-Phase Periodization: Accumulation, Intensification & Peak Power'})`,
    estimatedDurationMinutes: params.sessionDurationMinutes || 55,
    description: `Dynamic tactical protocol tailored for ${params.fitnessLevel} athletes focusing on ${params.goals.join(', ')}. Periodized across ${weeksCount} weeks with distinct exercise rotations, wave loading, and phase transitions.`,
    coachingPhilosophy: weeksCount >= 8
      ? `Triple-phase undulating periodization: Phase 1 (Weeks 1-4) builds volume and tendon armor; Phase 2 (Weeks 5-8) drives heavy bilateral progressive overload; Phase 3 (Weeks 9-12) converts strength to peak duty power and benchmark velocity.`
      : 'Double progression with undulating intensity: Heavy compound multi-joint movements are paired with metabolic durability finishers. Rest timers ensure complete neural ATP regeneration.',
    weeklyProgressionTips: [
      weeksCount >= 8
        ? 'Phase 1 (Weeks 1-4 Accumulation): Build kinetic volume and technical precision (8-12 reps). Week 4 incorporates a 35% deload to prepare for heavy loading.'
        : 'Apply progressive overload: when all prescribed reps are achieved with perfect form, increase load by 2.5-5 lbs on upper lifts and 5-10 lbs on lower lifts.',
      weeksCount >= 8
        ? 'Phase 2 (Weeks 5-8 Intensification): Lifts rotate to heavy compound bilateral drivers (4-6 reps). Enforce double progression (+5 lbs upper, +10 lbs lower).'
        : 'Maintain 1-2 reps in reserve (RPE 8) on heavy sets to prevent central nervous system depletion before duty shifts.',
      weeksCount >= 12
        ? 'Phase 3 (Weeks 9-12 Peak Duty Power): Lifts rotate to explosive speed and heavy carries (3-5 reps). Week 12 features benchmark testing & tactical taper.'
        : 'Sleep minimum 7-8 hours nightly to facilitate myofibrillar protein synthesis and hormonal recovery.',
    ],
    nutritionAdvice: 'Consume 1.0g of high-quality protein per pound of lean body weight daily. Hydrate with 1/2 oz water per lb body weight + sodium/potassium electrolytes before training.',
    schedule,
    source: 'tactical-engine',
  };

  const fixedPlan = validateAndFixSplitLogic(rawPlan, bannedRules);
  return sanitizePlanAgainstLimitations(fixedPlan, bannedRules);
}
