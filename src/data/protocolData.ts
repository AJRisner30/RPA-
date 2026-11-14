export interface ProtocolDay {
  day: string;
  focus: string;
  warmup: string;
  strength: string[];
  run: string;
  pace: string;
  progressionRule?: string;
}

export interface ProtocolPhase {
  id: string;
  title: string;
  weeks: string;
  desc: string;
  coachRule?: string;
  days: ProtocolDay[];
}

export interface HybridStrengthLogItem {
  id: number;
  date: string;
  exercise: string;
  weight: string;
  reps: number;
  estimated1RM?: number;
}

// 12-Week Protocol (7-Day Split + Warmups) - Patrol Ready Performance Law Enforcement Template
export const PROTOCOL_DATA: Record<string, ProtocolPhase> = {
  phase1: {
    id: 'phase1',
    title: "Phase 1: Foundation",
    weeks: "Weeks 1-4",
    desc: "Establish aerobic base (Zone 2) and build foundational movement strength. Progress by adding 10% volume each week.",
    coachRule: "Patrol Ready Performance Overload Laws: +10 lbs on lower compound lifts (Squat, Deadlift) and +5 lbs on upper compound lifts (Bench, OHP, Rows) upon completing top rep range with strict form. Weekly Zone 2 volume increases by 0.5 - 1.0 mile.",
    days: [
      {
        day: 'Day 1',
        focus: "Lower Strength + Base",
        warmup: "Mandatory 10-Minute DIME Warm-Up (Recommended): 1) Bodyweight Squats (10), 2) Squat Jumps (8), 3) Forward Lunges (8/leg), 4) Side Plank (20s/side), 5) Push-Ups (10), 6) Single-Leg Reach (6/leg), 7) Side Hop to Balance (6/side), 8) Ice Skaters (8/side), 9) 'L' Hops (5/leg).",
        strength: [
          "Barbell Back Squat (4x8) [Overload: +10 lbs on 8 reps]",
          "RDLs (3x10) [Overload: +10 lbs on 10 reps]",
          "Bulgarian Split Squats (3x10/leg)"
        ],
        run: "30-45 Min Base Run",
        pace: "Zone 2 / RPE 3-4 (Conversational Pace)",
        progressionRule: "Back Squat: +10 lbs upon hitting 8 reps; Base Run: +0.5 mi/wk"
      },
      {
        day: 'Day 2',
        focus: "Upper Hypertrophy",
        warmup: "Mandatory 10-Minute DIME Warm-Up (Recommended) + band pull-aparts and thoracic rotations.",
        strength: [
          "Barbell Bench (4x8) [Overload: +5 lbs on 8 reps]",
          "Weighted Pull-Ups (4x6-8) [Overload: +2.5-5 lbs on 8 reps]",
          "DB Overhead Press (3x10) [Overload: +5 lbs on 10 reps]"
        ],
        run: "Rest from running.",
        pace: "N/A",
        progressionRule: "Bench: +5 lbs on 8 reps; Pull-Ups: +2.5-5 lbs on 8 reps"
      },
      {
        day: 'Day 3',
        focus: "Interval Speed Work",
        warmup: "Mandatory 10-Minute DIME Warm-Up (Recommended) + 3 short progressive strides.",
        strength: [
          "Planks (3x60s) [Overload: +15s per set]",
          "Russian Twists (3x20)",
          "Mobility Drills"
        ],
        run: "Track Intervals (20-30 Mins)",
        pace: "6x400m at 5K Pace (RPE 8). 90s jog recovery.",
        progressionRule: "Intervals: Drop 2-3s per 400m repeat; Planks: +15s"
      },
      {
        day: 'Day 4',
        focus: "Full Body + Tempo",
        warmup: "Mandatory 10-Minute DIME Warm-Up (Recommended) + light kettlebell swings and hip openers.",
        strength: [
          "Deadlift (4x5 Heavy) [Overload: +10 lbs on 5 reps]",
          "Push Press (4x6) [Overload: +5 lbs on 6 reps]",
          "Chest-Supported Row (3x10) [Overload: +5 lbs on 10 reps]"
        ],
        run: "Tempo Run (3-4 Miles)",
        pace: "3-4 Miles at Tempo Pace (RPE 6-7 with 0.5 mi warm-up/cool-down).",
        progressionRule: "Deadlift: +10 lbs on 5 reps; Push Press: +5 lbs on 6 reps"
      },
      {
        day: 'Day 5',
        focus: "Active Recovery",
        warmup: "Cat-cow transitions, 90/90 hip stretches, and deep diaphragmatic breathing.",
        strength: ["Stretching, foam rolling, or light yoga."],
        run: "Optional Light Spin (20-30 mins)",
        pace: "Keep heart rate under 110 bpm.",
        progressionRule: "Active recovery & mobility. Heart rate < 110 bpm."
      },
      {
        day: 'Day 6',
        focus: "Long Endurance",
        warmup: "Mandatory 10-Minute DIME Warm-Up (Recommended) + calf and hip flexor activation.",
        strength: ["Pre-hab exercises (glute bridges, clamshells)."],
        run: "Long Run (6-10 Miles)",
        pace: "6-10 Miles in Zone 2 / RPE 3-4. Time on feet is the goal.",
        progressionRule: "Zone 2 Long Run: +0.5 to +1.0 mile/week base building"
      },
      {
        day: 'Day 7',
        focus: "Complete Rest",
        warmup: "None. Enjoy the rest!",
        strength: ["Rest and meal prep."],
        run: "Rest.",
        pace: "N/A",
        progressionRule: "Complete Rest & Nutrition replenishment"
      }
    ]
  },
  phase2: {
    id: 'phase2',
    title: "Phase 2: Build & Intensify",
    weeks: "Weeks 5-8",
    desc: "Increase strength loads and expand aerobic threshold (harder intervals, longer tempos).",
    coachRule: "Patrol Ready Performance Overload Laws: +10 lbs on lower compound lifts (Squat, Deadlift) and +5 lbs on upper compound lifts (Bench, OHP, Rows) upon completing top rep range with strict form. Weekly Zone 2 volume increases by 0.5 - 1.0 mile.",
    days: [
      {
        day: 'Day 1',
        focus: "Lower Power + Recovery",
        warmup: "Mandatory 10-Minute DIME Warm-Up (Recommended) + empty bar warm-up sets.",
        strength: [
          "Back Squat (5x5) [Overload: +10 lbs on 5 reps]",
          "Front Squat (3x8) [Overload: +5-10 lbs on 8 reps]",
          "Hip Thrusts (4x8) [Overload: +10 lbs on 8 reps]"
        ],
        run: "30 Min Recovery Run",
        pace: "Very Easy / RPE 2-3.",
        progressionRule: "Back Squat: +10 lbs on 5x5; Hip Thrusts: +10 lbs"
      },
      {
        day: 'Day 2',
        focus: "Upper Body Strength",
        warmup: "Mandatory 10-Minute DIME Warm-Up (Recommended) + band dislocates and scapular pull-ups.",
        strength: [
          "Incline Bench (4x6) [Overload: +5 lbs on 6 reps]",
          "Bent Over Row (4x6) [Overload: +5 lbs on 6 reps]",
          "Arnold Press (3x8) [Overload: +5 lbs on 8 reps]"
        ],
        run: "Rest from running.",
        pace: "N/A",
        progressionRule: "Incline Bench: +5 lbs on 6 reps; Rows: +5 lbs on 6 reps"
      },
      {
        day: 'Day 3',
        focus: "Threshold Intervals",
        warmup: "Mandatory 10-Minute DIME Warm-Up (Recommended) + 3-4 tempo buildups.",
        strength: [
          "Hanging Leg Raises (3x12)",
          "Ab Wheel Rollouts (3x10) [Overload: +2 reps/set]"
        ],
        run: "Long Intervals (40 Mins)",
        pace: "4x800m at 5K Pace (RPE 8-9). 2 Min recovery.",
        progressionRule: "800m Repeats: Maintain target 5K pace; Rest: strict 2 min"
      },
      {
        day: 'Day 4',
        focus: "Full Body Volume",
        warmup: "Mandatory 10-Minute DIME Warm-Up (Recommended) + bird-dogs and kettlebell halos.",
        strength: [
          "Deadlift (4x4) [Overload: +10 lbs on 4 reps]",
          "DB Bench Press (3x10) [Overload: +5 lbs on 10 reps]",
          "Single Arm Row (3x10) [Overload: +5 lbs on 10 reps]"
        ],
        run: "Threshold Run (4-6 Miles)",
        pace: "4-6 Miles total (1 mi warmup + 3-4 Miles at Threshold Pace RPE 7-8 + 1 mi cooldown).",
        progressionRule: "Deadlift: +10 lbs on 4x4; DB Bench: +5 lbs on 10 reps"
      },
      {
        day: 'Day 5',
        focus: "Active Recovery",
        warmup: "Foam rolling calves and quads, followed by a light mobility flow.",
        strength: ["Light mobility work."],
        run: "Cross-training (20 mins)",
        pace: "Low intensity.",
        progressionRule: "Active recovery & low-impact aerobic flush"
      },
      {
        day: 'Day 6',
        focus: "Long Endurance",
        warmup: "Mandatory 10-Minute DIME Warm-Up (Recommended) + ankle circles and dynamic stretching.",
        strength: ["None."],
        run: "Long Run (8-14 Miles)",
        pace: "Zone 2. Add 2-3 surges in final miles.",
        progressionRule: "Long Run: Zone 2 pacing with 2-3 surges in final 2 miles"
      },
      {
        day: 'Day 7',
        focus: "Complete Rest",
        warmup: "None.",
        strength: ["Hydrate and recover."],
        run: "Rest.",
        pace: "N/A",
        progressionRule: "Rest, hydration, and central nervous system recovery"
      }
    ]
  },
  phase3: {
    id: 'phase3',
    title: "Phase 3: Peak Performance",
    weeks: "Weeks 9-12",
    desc: "Peak power output and race pacing. Volume drops slightly while intensity hits maximum.",
    coachRule: "Patrol Ready Performance Overload Laws: +10 lbs on lower compound lifts (Squat, Deadlift) and +5 lbs on upper compound lifts (Bench, OHP, Rows) upon completing top rep range with strict form. Weekly Zone 2 volume increases by 0.5 - 1.0 mile.",
    days: [
      {
        day: 'Day 1',
        focus: "Lower Max Strength",
        warmup: "Mandatory 10-Minute DIME Warm-Up (Recommended) + CNS Prep box jumps (3x3).",
        strength: [
          "Back Squat (3x3 Heavy) [Overload: +10 lbs on 3 reps]",
          "Speed Deadlifts (3x3) [Overload: Max bar speed]",
          "Walking Lunges (3x10/leg)"
        ],
        run: "20 Min Shakeout Run",
        pace: "RPE 2. Just moving blood.",
        progressionRule: "Back Squat: +10 lbs on heavy triple; CNS Max Power"
      },
      {
        day: 'Day 2',
        focus: "Upper Max Strength",
        warmup: "Mandatory 10-Minute DIME Warm-Up (Recommended) + rotator cuff warm-up.",
        strength: [
          "Bench Press (3x3) [Overload: +5 lbs on 3 reps]",
          "Weighted Pull-Ups (3x4) [Overload: +5 lbs on 4 reps]",
          "Plyo Pushups (3x8) [Overload: Max explosive height]"
        ],
        run: "Rest from running.",
        pace: "N/A",
        progressionRule: "Bench Press: +5 lbs on triple; Weighted Pull-Ups: +5 lbs"
      },
      {
        day: 'Day 3',
        focus: "Speed Endurance",
        warmup: "Mandatory 10-Minute DIME Warm-Up (Recommended) + 3x50m progressive sprints.",
        strength: [
          "Weighted Planks (3x45s) [Overload: +5-10 lbs plate]",
          "Cable Woodchoppers (3x12/side)"
        ],
        run: "Short Sprint Intervals",
        pace: "10x200m at Mile Pace (RPE 9+). 200m walk recovery.",
        progressionRule: "Sprint Intervals: 10x200m at Mile Pace (RPE 9+)"
      },
      {
        day: 'Day 4',
        focus: "Race Pace Sim",
        warmup: "Mandatory 10-Minute DIME Warm-Up (Recommended) + dial into race pace for 1 min.",
        strength: [
          "Trap Bar Deadlift (3x5) [Overload: +10 lbs on 5 reps]",
          "DB Overhead Press (3x8) [Overload: +5 lbs on 8 reps]"
        ],
        run: "Race Pace Simulation (2-3 Miles)",
        pace: "2-3 Miles at Goal Race Pace (RPE 8.5-9).",
        progressionRule: "Trap Bar Deadlift: +10 lbs on 5 reps; Race Pace Sim"
      },
      {
        day: 'Day 5',
        focus: "Active Recovery",
        warmup: "Yoga flow, deep stretching, and parasympathetic breathing.",
        strength: ["Yoga or dynamic stretching."],
        run: "Rest.",
        pace: "N/A",
        progressionRule: "Parasympathetic breathing, light yoga, and recovery"
      },
      {
        day: 'Day 6',
        focus: "Long Endurance (Taper)",
        warmup: "Mandatory 10-Minute DIME Warm-Up (Recommended) + light walk and mental visualization.",
        strength: ["None."],
        run: "Long Run (10-15+ Miles)",
        pace: "Zone 2. (Reduce mileage by 50% in Week 12).",
        progressionRule: "Taper & peak: reduce volume by 50% in Week 12"
      },
      {
        day: 'Day 7',
        focus: "Complete Rest",
        warmup: "None.",
        strength: ["Refuel and rest."],
        run: "Rest.",
        pace: "N/A",
        progressionRule: "Complete Rest & Mental preparation for testing"
      }
    ]
  }
};

export const COACH_RULES = {
  orderOfOperations: {
    title: "Order of Operations",
    splitSessions: "Try to separate lifting and running by 6+ hours to maximize recovery.",
    backToBack: "If you must do both at the same time, always lift first. Hitting heavy compound lifts under severe aerobic fatigue ruins your form and invites injury. Sip BCAAs to bridge the gap, then immediately hit your run."
  },
  zone2Guidance: {
    title: "Zone 2 Heart Rate Standard",
    rule: "Keep base and long runs strictly conversational (RPE 3-4, ~65-75% max HR). Building mitochondrial density and capillary beds allows you to clear lactate during heavy lifting intervals."
  },
  progressiveOverload: {
    title: "Progressive Overload Rule",
    rule: "Start at the low end of any prescribed set or rep range. Build reps to the top of the range first, then add 2.5-5 lbs (upper body) or 5-10 lbs (lower body) and drop back to the bottom of the rep range."
  }
};

export const TEMPLATE_EXERCISES = [
  "Goblet Squat or Back Squat (to parallel)",
  "Barbell Back Squat",
  "Trap-Bar Deadlift or Dumbbell RDL",
  "Conventional or Sumo Barbell Deadlift",
  "Conventional Barbell Deadlift",
  "Conventional or Trap-Bar Deadlift",
  "Reverse Lunges",
  "Bulgarian Split Squat",
  "Lateral Lunges",
  "Box Jumps",
  "Standing Long Jump (Broad Jump)",
  "Trap-Bar Jumps",
  "Dumbbell Bench Press or Push-Ups",
  "Barbell Bench Press or Incline Press",
  "Barbell Bench Press",
  "Speed Bench Press",
  "Single-Arm Dumbbell Bench Press",
  "Chin-Ups (or Band-Assisted Pull-Ups)",
  "Weighted or Strict Pull-Ups",
  "Weighted Pull-Ups",
  "Strict Pronated Pull-Ups",
  "Seated or Standing Dumbbell Shoulder Press",
  "Single-Arm Landmine Press",
  "Standing Barbell Push Press + Face Pulls",
  "Single-Arm Dumbbell Row + Band Pull-Aparts",
  "Inverted Row + Barbell Deadlift Grip Hold",
  "Two-Arm Kettlebell Swings",
  "Sandbag Shouldering",
  "Sandbag Bear-Hug Walk + Squats",
  "Heavy Sled Push & Backward Drag",
  "One-Arm Suitcase Carry",
  "Heavy Farmer's Walk",
  "Standing Overhead Barbell Press (OHP)",
  "Weighted Neutral-Grip Pull-Ups",
  "Barbell Incline Bench Press (30°)",
  "Barbell Bent-Over Row (Strict)",
  "Barbell Z-Press",
  "Bodyweight Dips",
  "Incline Dumbbell Hammer Curls",
  "Trap Bar Deadlift",
  "Front Squat",
  "Romanian Deadlift (RDL)",
  "Standing Barbell Calf Raises",
  "Hanging Leg / Knee Raises",
  "Flush & Pace Aerobic Interval",
  "Sorensen Back Extension",
  "Copenhagen Side Plank",
  "Flat Barbell Bench Press",
  "Chest-Supported T-Bar Row",
  "Standing Push Press",
  "Dual Dumbbell Lateral Raises",
  "Cable Rope Face Pulls",
  "Close-Grip Barbell Bench Press",
  "Barbell EZ-Curl",
  "Barbell Hip Thrusts",
  "Walking Dumbbell Lunges",
  "Lying or Seated Leg Curls",
  "Heavy Farmer's Walks",
  "Suitcase Carry",
  "Barbell Wrist Rollers",
  "Back Squat",
  "Deadlift",
  "Bench Press",
  "Incline Bench",
  "Overhead Press",
  "Pull-Ups (Weighted)",
  "Other"
];

export const getDefaultRestPeriod = (exerciseStr: string): number => {
  // If explicit rest period is defined in brackets, always respect it
  const bracketMatch = exerciseStr.match(/rest:\s*(\d+)s?/i);
  if (bracketMatch) {
    const val = parseInt(bracketMatch[1], 10);
    if (!isNaN(val) && val >= 0) return val;
  }

  const lower = exerciseStr.toLowerCase();
  // 150s for Trap Bar Deadlift in Tactical Hypertrophy
  if (lower.includes('trap bar') && (lower.includes('150') || lower.includes('tactical'))) {
    return 150;
  }
  // 180s (3 Min) for Trap Bar Deadlift & heavy power compounds
  if (lower.includes('trap bar') || lower.includes('deadlift') || lower.includes('speed deadlift')) {
    return 180;
  }
  // 120s (2 Min) for Barbell Back Squat, Strict OHP, Push Press, Weighted Pull-Ups, Front Squat, and Track Sprints
  if (
    lower.includes('squat') ||
    lower.includes('overhead press') ||
    lower.includes('ohp') ||
    lower.includes('push press') ||
    lower.includes('pull-up') ||
    lower.includes('pullup') ||
    lower.includes('bench') ||
    lower.includes('800m') ||
    lower.includes('sprint') ||
    lower.includes('flush & pace')
  ) {
    return 120;
  }
  // 90s for Romanian Deadlift, Bulgarian Split Squat, DB Incline Bench, Chest-Supported Row, Farmer's Carry, Walking Lunges, Hip Thrusts
  if (
    lower.includes('rdl') ||
    lower.includes('romanian') ||
    lower.includes('split squat') ||
    lower.includes('incline') ||
    lower.includes('row') ||
    lower.includes('farmer') ||
    lower.includes('carry') ||
    lower.includes('lunge') ||
    lower.includes('thrust')
  ) {
    return 90;
  }
  // 75s for Z-Press
  if (lower.includes('z-press') || lower.includes('z press')) {
    return 75;
  }
  // 60s for Pallof Press, Dips, Curls, Calf Raises, Leg Curls, Face Pulls, Close-Grip Bench, Kettlebell Swings
  if (
    lower.includes('dip') ||
    lower.includes('curl') ||
    lower.includes('calf') ||
    lower.includes('face pull') ||
    lower.includes('close-grip') ||
    lower.includes('close grip') ||
    lower.includes('pallof') ||
    lower.includes('swing') ||
    lower.includes('twist') ||
    lower.includes('raise') ||
    lower.includes('roller') ||
    lower.includes('pinch')
  ) {
    return 60;
  }
  // 45s for Copenhagen Plank & Plank Series
  if (lower.includes('copenhagen') || lower.includes('plank')) {
    return 45;
  }
  return 90;
};

export interface ParsedExercise {
  name: string;
  defaultSets: number;
  setRangeMin: number;
  setRangeMax: number;
  targetReps: string;
  repRangeMin?: number;
  repRangeMax?: number;
  targetRpe?: number;
  restSeconds: number;
  notes: string;
  overloadHint?: string;
}

export function parseExerciseString(exerciseStr: string): ParsedExercise {
  let overloadHint = '';
  const bracketMatches = [...exerciseStr.matchAll(/\[(.*?)\]/g)];
  if (bracketMatches.length > 0) {
    overloadHint = bracketMatches.map((m) => m[1].trim()).join(' • ');
  }
  const cleanStr = exerciseStr.replace(/\[.*?\]/g, '').trim().replace(/\.$/, '');

  let name = cleanStr;
  let defaultSets = 3;
  let setRangeMin = 3;
  let setRangeMax = 3;
  let targetReps = '8-10';
  let repRangeMin: number | undefined;
  let repRangeMax: number | undefined;
  const notes = overloadHint;

  // Match the LAST parenthetical group as the (sets x reps) specification, preserving earlier parens in exercise name
  const lastOpenParen = cleanStr.lastIndexOf('(');
  const lastCloseParen = cleanStr.lastIndexOf(')');
  if (lastOpenParen > 0 && lastCloseParen === cleanStr.length - 1) {
    name = cleanStr.slice(0, lastOpenParen).trim().replace(/\.$/, '');
    const spec = cleanStr.slice(lastOpenParen + 1, lastCloseParen).trim();

    if (spec.toLowerCase() === '5x5' || spec.toLowerCase() === '5 x 5') {
      defaultSets = 5;
      setRangeMin = 5;
      setRangeMax = 5;
      targetReps = '5';
      repRangeMin = 5;
      repRangeMax = 5;
    } else if (spec.toLowerCase() === '3x3' || spec.toLowerCase() === '3 x 3') {
      defaultSets = 3;
      setRangeMin = 3;
      setRangeMax = 3;
      targetReps = '3';
      repRangeMin = 3;
      repRangeMax = 3;
    } else {
      const xMatch = spec.match(/^(\d+(?:\s*[-–]\s*\d+)?)\s*[x×]\s*(.+)$/i);
      if (xMatch) {
        const setPart = xMatch[1].trim();
        const repPart = xMatch[2].trim();
        const setNums = setPart.match(/\d+/g);
        if (setNums && setNums.length >= 2) {
          setRangeMin = parseInt(setNums[0], 10);
          setRangeMax = parseInt(setNums[1], 10);
          // Start at the low end of the set range until session history dictates more
          defaultSets = setRangeMin;
        } else if (setNums && setNums.length === 1) {
          setRangeMin = parseInt(setNums[0], 10);
          setRangeMax = setRangeMin;
          defaultSets = setRangeMin;
        }

        targetReps = repPart;
        // Parse rep range min/max if purely numeric or starting with a range (e.g., "10-12", "6-8", "3-5", "3-4", "10/leg")
        const rangeMatch = repPart.match(/^(\d+)\s*[-–]\s*(\d+)/);
        if (rangeMatch) {
          repRangeMin = parseInt(rangeMatch[1], 10);
          repRangeMax = parseInt(rangeMatch[2], 10);
        } else {
          const singleRepMatch = repPart.match(/^(\d+)/);
          if (singleRepMatch) {
            repRangeMin = parseInt(singleRepMatch[1], 10);
            repRangeMax = repRangeMin;
          }
        }
      } else {
        targetReps = spec;
      }
    }
  }

  let restSeconds = getDefaultRestPeriod(exerciseStr);
  if (overloadHint) {
    const restMatch = overloadHint.match(/rest:\s*(\d+)\s*s/i);
    if (restMatch) {
      const parsedRest = parseInt(restMatch[1], 10);
      if (!isNaN(parsedRest) && parsedRest >= 0) {
        restSeconds = parsedRest;
      }
    }
  }

  // Extract targetRpe if specified in brackets (e.g. "RPE 7", "RPE 8", "RPE 8.5-9", "RPE 8-8.5")
  let targetRpe: number | undefined;
  if (overloadHint) {
    const rpeMatch = overloadHint.match(/rpe\s*(\d+(?:\.\d+)?)/i);
    if (rpeMatch) {
      const parsedRpe = parseFloat(rpeMatch[1]);
      if (!isNaN(parsedRpe) && parsedRpe >= 5 && parsedRpe <= 10) {
        targetRpe = parsedRpe;
      }
    }
  }

  return {
    name,
    defaultSets,
    setRangeMin,
    setRangeMax,
    targetReps,
    repRangeMin,
    repRangeMax,
    targetRpe,
    restSeconds,
    notes,
    overloadHint
  };
}

// ---------------------------------------------------------------------------
// LAW ENFORCEMENT 52-WEEK FITNESS & READINESS PROGRAM
// A Year-Long Guide to Pursuit Speed, Use-of-Force Strength, Back Health & Shift Resilience
// ---------------------------------------------------------------------------
export const DIME_WARMUP_TEXT =
  'Mandatory 10-Minute DIME Warm-Up (Do Before Every Workout): 1) Bodyweight Squats (10 reps), 2) Squat Jumps (8 reps), 3) Forward Lunges (8 reps/leg), 4) Side Plank (20 sec/side), 5) Push-Ups (10 reps), 6) Single-Leg Reach (6 reps/leg), 7) Side Hop to Balance (6 hops/side), 8) Ice Skaters Lateral (8/side), 9) "L" Hops Forward/Side (5 hops/leg). Cool-Down (5–10 Mins): Light walking + 20–30s static stretches for hip flexors, hamstrings, calves, and chest.';

export const APEX_PROTOCOL_PHASES: Record<string, ProtocolPhase> = {
  apex_phase1: {
    id: 'apex_phase1',
    title: 'Quarter 1 (Weeks 1–13): Aerobic Base, Posture & Core Stability',
    weeks: 'Weeks 1–13',
    desc: 'Build a solid cardiovascular running foundation (4 runs/week), undo tight hips and rounded shoulders from patrol driving, and strengthen core stability. Lower weights slowly (3 seconds down).',
    coachRule:
      'Quarter 1 Progression Rules: 1) Reps First (Double Progression) — Start at the low end of every set and rep range (e.g., 3 sets of 10 reps on 3-4x10-12). Add 1–2 reps per set each session until hitting the top of the rep range with 1–2 RIR. 2) Weight Second — Add +2.5–5 lbs (upper body) or +5–10 lbs (lower body) and reset to the bottom of the rep range. 3) Sets Third — Progress from 3 sets to 4 sets once recovery is proven. Every 4th week (Weeks 4, 8, 12) is a Deload Week (-40% sets & run distance). Week 13 is Benchmark Testing.',
    days: [
      {
        day: 'Day 1',
        focus: 'Lower-Body Strength + Easy Base Run',
        warmup: DIME_WARMUP_TEXT,
        strength: [
          'Goblet Squat or Back Squat (to parallel) (3-4x10-12) [Overload: Start at 3 sets x 10 reps; build to 12 reps then +5-10 lbs - Effort: Moderate (RPE 7) - Rest: 90s - Lower slowly (3s down), thighs parallel, flat braced back]',
          'Trap-Bar Deadlift or Dumbbell RDL (3-4x10-12) [Overload: Start at 3 sets x 10 reps; build to 12 reps then +5-10 lbs - Effort: Moderate (RPE 7) - Rest: 90s - Lower slowly (3s down)]',
          'Reverse Lunges (3x10/leg) [Overload: Start at 3 sets x 10/leg; add light DBs once stable - Effort: Bodyweight / Light DBs (RPE 7) - Rest: 60s]',
          'McGill Curl-Up + Side Plank + Bird Dog (3x10 sec holds each) [Effort: Bodyweight (RPE 7) - Rest: 45s - Spine-safe core bracing; never do straight-leg sit-ups]'
        ],
        run: 'Post-Lift Aerobic Run: 1.9 miles (1 set)',
        pace: 'Easy Conversational Pace (Rest: 0s)',
        progressionRule: 'Start at 3 sets x 10 reps (RPE 7, 3s eccentric). Build to 12 reps across all sets before adding +5–10 lbs. Post-Lift Run: 1.9 miles easy conversational pace.'
      },
      {
        day: 'Day 2',
        focus: 'Cardio Endurance & Tempo Running',
        warmup: DIME_WARMUP_TEXT,
        strength: [
          'Steady Aerobic Run (build distance weekly) (1x2.5-3.1 miles) [Overload: Start at 2.5 miles; increase distance max 10%/week toward 3.1 miles - Effort: Conversational Pace (RPE 7) - Rest: 0s]'
        ],
        run: 'Steady Aerobic Run (build distance weekly): 2.5–3.1 miles (start at 2.5 miles)',
        pace: 'Conversational Pace (Rest: 0s)',
        progressionRule: 'Start at 2.5 miles and build distance by no more than 10% per week up to 3.1 miles.'
      },
      {
        day: 'Day 3',
        focus: 'Upper-Body Strength & Grappling Grip',
        warmup: DIME_WARMUP_TEXT,
        strength: [
          'Dumbbell Bench Press or Push-Ups (3-4x10-12) [Overload: Start at 3 sets x 10 reps; build to 12 reps then +2.5-5 lbs - Effort: Moderate (RPE 7) - Rest: 90s - Lower slowly (3s down)]',
          'Chin-Ups (or Band-Assisted Pull-Ups) (4x6-8) [Overload: Start at 4 sets x 6 reps; build to 8 reps across all sets - Effort: Bodyweight / Band (RPE 7) - Rest: 90s]',
          'Seated or Standing Dumbbell Shoulder Press (3x10-12) [Overload: Start at 3 sets x 10 reps; build to 12 reps then +2.5-5 lbs - Effort: Moderate (RPE 7) - Rest: 90s - Lower slowly (3s down)]',
          'Single-Arm Dumbbell Row + Band Pull-Aparts (3x10/arm + 15 reps) [Overload: Start at 3 sets x 10/arm + 15 pull-aparts; +2.5-5 lbs DB when crisp - Effort: Moderate / Light (RPE 7) - Rest: 60s]'
        ],
        run: 'Rest from running',
        pace: 'N/A',
        progressionRule: 'DB Bench & Shoulder Press: Start at 3x10 (RPE 7), build to 12 reps then +2.5–5 lbs. Chin-Ups: Start at 4x6, build to 4x8.'
      },
      {
        day: 'Day 4',
        focus: 'Mid-Week Steady Run & Hip Mobility',
        warmup: DIME_WARMUP_TEXT,
        strength: [
          'Steady Aerobic Run + 10-Min Hip Mobility (1x2.5 miles) [Effort: Easy Conversational Pace (RPE 7) - Rest: 0s - Follow with 10-min hip flexor, hamstring, calf & chest static stretches]'
        ],
        run: 'Steady Aerobic Run (2.5 miles) + 10-Min Hip Mobility',
        pace: 'Easy Conversational Pace (Rest: 0s)',
        progressionRule: '2.5-mile easy conversational run followed by 10 minutes of hip mobility to undo patrol car stiffness.'
      },
      {
        day: 'Day 5',
        focus: 'Sprint Speed, Agility & Use-of-Force Circuit (Full Body + Run)',
        warmup: DIME_WARMUP_TEXT,
        strength: [
          'Two-Arm Kettlebell Swings (4x15) [Overload: +5 lbs KB when 4x15 is explosive - Effort: Moderate KB (RPE 7) - Rest: 60s]',
          'Lateral Lunges (side-to-side hip strength) (3x8/side) [Overload: Start bodyweight/light DBs; +2.5-5 lbs - Effort: Bodyweight / Light DBs (RPE 7) - Rest: 60s]',
          'Half-Kneeling Pallof Press (Anti-Rotation) (3x12/side) [Effort: Moderate Band/Cable (RPE 7) - Rest: 60s]',
          'One-Arm Suitcase Carry (3x25m/arm) [Overload: +5 lbs DB/KB when posture stays vertical - Effort: Moderate Dumbbell/KB (RPE 7) - Rest: 60s]'
        ],
        run: 'Easy Finisher Run: 1.5 miles (1 set)',
        pace: 'Easy Pace (Rest: 0s)',
        progressionRule: 'Complete all 4 full-body & anti-rotation core drills at RPE 7, then finish with a 1.5-mile Easy Finisher Run.'
      },
      {
        day: 'Day 6',
        focus: 'Rest & Shift Recovery',
        warmup: 'None — Focus on 7–9 hours of dark, cool sleep and meal prep for upcoming shifts.',
        strength: [
          'Rest & Shift Recovery: Focus on 7–9 hours of dark, cool sleep and meal prep (0.75–1.0g lean protein per lb of bodyweight).'
        ],
        run: 'Rest & Shift Recovery',
        pace: 'N/A',
        progressionRule: 'Prioritize 7–9 hours of sleep, hydration, and high-protein shift meal prep.'
      },
      {
        day: 'Day 7',
        focus: 'Rest & Shift Recovery',
        warmup: 'None — Focus on 7–9 hours of dark, cool sleep and meal prep for upcoming shifts.',
        strength: [
          'Rest & Shift Recovery: Focus on 7–9 hours of dark, cool sleep, hydration, and meal prep for upcoming shifts.'
        ],
        run: 'Rest & Shift Recovery',
        pace: 'N/A',
        progressionRule: 'Complete physiological & nervous system recovery before next training week.'
      }
    ]
  },
  apex_phase2: {
    id: 'apex_phase2',
    title: 'Quarter 2 (Weeks 14–26): Running Stamina & Grappling Strength',
    weeks: 'Weeks 14–26',
    desc: 'Increase running stamina with 100m–400m tempo/interval sessions and 3.1–3.7 mile runs while building lean muscle and grip strength for ground control.',
    coachRule:
      'Quarter 2 Progression Rules: Start at 6 reps on 4x6-8 compound lifts at Challenging Effort (RPE 8). Build to 8 reps across all 4 sets before adding +2.5–5 lbs (upper) or +5–10 lbs (lower). Never increase vest weight, running distance, and running speed in the same week. Deload (-40% volume) on Weeks 16, 20, 24. Benchmark Test on Week 26.',
    days: [
      {
        day: 'Day 1',
        focus: 'Lower-Body Strength + Post-Lift Aerobic Run',
        warmup: DIME_WARMUP_TEXT,
        strength: [
          'Barbell Back Squat (parallel depth) (4x6-8) [Overload: Start at 4 sets x 6 reps; build to 8 reps then +5-10 lbs - Effort: Challenging (RPE 8) - Rest: 120s (2-3 min)]',
          'Conventional or Sumo Barbell Deadlift (4x6) [Overload: +5-10 lbs on 4x6 with clean bar speed - Effort: Challenging (RPE 8) - Rest: 120s (2-3 min)]',
          'Bulgarian Split Squat (rear foot elevated) (3x8/leg) [Overload: +5 lbs DBs when 3x8/leg is solid - Effort: Moderate Dumbbells (RPE 8) - Rest: 90s]',
          'Tall-Kneeling Pallof Press + Glute Bridge (3x10/side + 15 reps) [Effort: Moderate Band/Cable (RPE 8) - Rest: 60s]'
        ],
        run: 'Post-Lift Aerobic Run: 1.9 miles (1 set)',
        pace: 'Easy Recovery Pace (Rest: 0s)',
        progressionRule: 'Back Squat: Start at 4x6 (RPE 8), build to 4x8 then +5–10 lbs. Deadlift: 4x6 at RPE 8. Finish with 1.9-mile easy recovery run.'
      },
      {
        day: 'Day 2',
        focus: 'Cardio Endurance: 100m Tempo Runs & Vest Conditioning',
        warmup: DIME_WARMUP_TEXT,
        strength: [
          '100m Tempo Runs (smooth, consistent speed) (10x100m (~16-18s)) [Effort: Moderate (65-75% speed, RPE 8) - Rest: 45s walk]',
          'Brisk Walk or Light Jog Wearing 20-30 lb Vest (1x1.5 miles) [Effort: Brisk Pace (20-30 lb Vest, RPE 7.5) - Rest: 0s]'
        ],
        run: '10x100m Tempo Runs (~16–18s, 45s walk rest) + 1.5 Mile Brisk Walk or Light Jog Wearing 20–30 lb Vest',
        pace: 'Moderate (65–75% speed) on 100m Tempo Runs + Brisk Pace with 20–30 lb Vest',
        progressionRule: 'Hit smooth 16–18s pacing across all 10x100m tempo repeats (45s walk rest), followed by 1.5 miles in a 20–30 lb duty vest.'
      },
      {
        day: 'Day 3',
        focus: 'Upper-Body Strength & Grappling Grip',
        warmup: DIME_WARMUP_TEXT,
        strength: [
          'Barbell Bench Press or Incline Press (4x6-8) [Overload: Start at 4 sets x 6 reps; build to 8 reps then +2.5-5 lbs - Effort: Challenging (RPE 8) - Rest: 120s (2-3 min)]',
          'Weighted or Strict Pull-Ups (4x6-8) [Overload: Start at 4 sets x 6 reps; build to 8 reps (BW or +10-25 lbs) - Effort: Challenging (RPE 8) - Rest: 120s (2 min)]',
          'Single-Arm Landmine Press (staggered stance) (3x8/arm) [Overload: +2.5-5 lbs on 3x8/arm - Effort: Moderate (RPE 8) - Rest: 90s]',
          'Inverted Row + Barbell Deadlift Grip Hold (3x10 reps + 30 sec) [Effort: Bodyweight / 60% Max Deadlift (RPE 8) - Rest: 90s]'
        ],
        run: 'Rest from running',
        pace: 'N/A',
        progressionRule: 'Bench Press & Pull-Ups: Start at 4x6 (RPE 8), build to 4x8 then add +2.5–5 lbs. Lock in 30s double-overhand grip holds at 60% max DL.'
      },
      {
        day: 'Day 4',
        focus: 'Mid-Week Long Steady Aerobic Run',
        warmup: DIME_WARMUP_TEXT,
        strength: [
          'Long Steady Aerobic Run (1x3.1-4.0 miles) [Overload: Start at 3.1 miles; increase distance max 10%/week up to 4.0 miles - Effort: Steady Zone 2 Pace (RPE 7) - Rest: 0s]'
        ],
        run: 'Long Steady Aerobic Run: 3.1–4.0 miles (start at 3.1 miles)',
        pace: 'Steady Zone 2 Pace (Rest: 0s)',
        progressionRule: 'Start at 3.1 miles and build weekly by no more than 10% toward 4.0 miles at steady Zone 2 pace.'
      },
      {
        day: 'Day 5',
        focus: 'Sprint Speed, Agility & Use-of-Force Circuit (Sandbag/Sled)',
        warmup: DIME_WARMUP_TEXT,
        strength: [
          'Sandbag Shouldering (lift to shoulder) (4x6/side) [Overload: Progress from 70 lb toward 100 lb sandbag - Effort: 70-100 lb Sandbag (RPE 8) - Rest: 90s]',
          'Sandbag Bear-Hug Walk + Squats (3x30m + 8 squats) [Effort: 70-100 lb Sandbag (RPE 8) - Rest: 90s]',
          'Rotational Medicine Ball Wall Throw (3x8/side) [Effort: 10-14 lb Med Ball (RPE 8) - Rest: 60s]',
          'Heavy Sled Push & Backward Drag (4x15m out / 15m back) [Overload: +10 lbs sled load when all 4 rounds stay crisp - Effort: Heavy (75-80% effort, RPE 8) - Rest: 120s (2 min)]'
        ],
        run: 'Heavy Sled Push & Backward Drag (4 × 15m out / 15m back)',
        pace: 'Heavy (75–80% effort, 2 min rest)',
        progressionRule: 'Build grappling & suspect-control power with 70–100 lb sandbag work and 4x15m out/15m back heavy sled pushes/drags.'
      },
      {
        day: 'Day 6',
        focus: 'Rest & Shift Recovery',
        warmup: 'None — Focus on 7–9 hours of dark, cool sleep and meal prep for upcoming shifts.',
        strength: [
          'Rest & Shift Recovery: Focus on 7–9 hours of dark, cool sleep and meal prep (0.75–1.0g lean protein per lb of bodyweight).'
        ],
        run: 'Rest & Shift Recovery',
        pace: 'N/A',
        progressionRule: 'Prioritize 7–9 hours of sleep, hydration, and high-protein shift meal prep.'
      },
      {
        day: 'Day 7',
        focus: 'Rest & Shift Recovery',
        warmup: 'None — Focus on 7–9 hours of dark, cool sleep and meal prep for upcoming shifts.',
        strength: [
          'Rest & Shift Recovery: Focus on 7–9 hours of dark, cool sleep, hydration, and meal prep for upcoming shifts.'
        ],
        run: 'Rest & Shift Recovery',
        pace: 'N/A',
        progressionRule: 'Complete physiological & nervous system recovery before next training week.'
      }
    ]
  },
  apex_phase3: {
    id: 'apex_phase3',
    title: 'Quarter 3 (Weeks 27–39): Limit Strength, Pursuit Speed & Threshold Runs',
    weeks: 'Weeks 27–39',
    desc: 'Build maximum strength while moving every rep upward as fast as possible, paired with short sprints, agility drills, and sustained 2.5–3.7 mile tempo runs.',
    coachRule:
      'Quarter 3 Progression Rules: Start at the low end of every set and rep range (e.g., 4 sets x 3 reps on 4-5x3-5 Back Squat & Bench Press; 3 sets x 3 reps on 3-4x3-4 Deadlift; 8 repeats on 8-10x40m Sprint Repeats). Explode upward fast on every concentric rep at 85–92% Max (RPE 8.5–9). Deload (-40% volume) on Weeks 28, 32, 36. Benchmark Test on Week 39.',
    days: [
      {
        day: 'Day 1',
        focus: 'Lower Max Strength & Explosive Power',
        warmup: DIME_WARMUP_TEXT,
        strength: [
          'Box Jumps (step down; land softly) (4x4) [Effort: Max Jump Height (RPE 8.5) - Rest: 120s (2 min)]',
          'Barbell Back Squat (explode up fast) (4-5x3-5) [Overload: Start at 4 sets x 3 reps; build to 5 reps then +5-10 lbs, then 5th set - Effort: Heavy (85-92% Max, RPE 8.5-9) - Rest: 180s (3-5 min)]',
          'Conventional Barbell Deadlift (3-4x3-4) [Overload: Start at 3 sets x 3 reps; build to 4 reps then +5-10 lbs, then 4th set - Effort: Heavy (85-90% Max, RPE 8.5-9) - Rest: 180s (3-5 min)]',
          "Standing Pallof Hold + Heavy Farmer's Walk (3x20s/side + 25m) [Overload: +5 lbs/hand on 25m walk - Effort: Heavy (RPE 8.5) - Rest: 90s]"
        ],
        run: 'Rest from running',
        pace: 'N/A',
        progressionRule: 'Back Squat: Start at 4x3 (85–92% Max), build to 5 reps before adding +5–10 lbs. Deadlift: Start at 3x3 (85–90% Max), build to 4 reps.'
      },
      {
        day: 'Day 2',
        focus: 'Pursuit Speed, Cone Agility & Recovery Run',
        warmup: DIME_WARMUP_TEXT,
        strength: [
          '10m & 20m Sprint Starts (from ready stance) (6x10-20m) [Effort: All-Out (95-100%, RPE 9.5) - Rest: 90s]',
          'Pro Agility (5m-10m-5m) & 10m T-Test Cone Drills (3x1 rep each drill) [Effort: All-Out (sharp cuts, RPE 9) - Rest: 120s (2 min)]'
        ],
        run: 'Easy Recovery Run: 2.0 miles (1 set)',
        pace: 'Easy Pace (after Sprint Starts & Cone Drills)',
        progressionRule: 'Execute 6x10–20m Sprint Starts from patrol ready stance and 3x1 Pro Agility & T-Test drills at 95–100% effort, then 2.0-mile easy recovery run.'
      },
      {
        day: 'Day 3',
        focus: 'Upper Max Strength & Explosive Pressing',
        warmup: DIME_WARMUP_TEXT,
        strength: [
          'Explosive Push-Ups or Med Ball Chest Pass (4x5) [Effort: Bodyweight / 10 lb Ball (RPE 8.5) - Rest: 90s]',
          'Barbell Bench Press (explode up fast) (4-5x3-5) [Overload: Start at 4 sets x 3 reps; build to 5 reps then +2.5-5 lbs, then 5th set - Effort: Heavy (85-92% Max, RPE 8.5-9) - Rest: 180s (3-5 min)]',
          'Weighted Pull-Ups (4x4-6) [Overload: Start at 4 sets x 4 reps; build to 6 reps then +2.5-5 lbs - Effort: Heavy (RPE 8.5) - Rest: 180s (3 min)]',
          'Standing Barbell Push Press + Face Pulls (4x4 + 15 reps) [Overload: +2.5-5 lbs on 4x4 Push Press - Effort: Heavy (80-85% Max, RPE 8.5) - Rest: 120s (2 min)]'
        ],
        run: 'Rest from running',
        pace: 'N/A',
        progressionRule: 'Bench Press: Start at 4x3 (85–92% Max), build to 5 reps then +2.5–5 lbs. Weighted Pull-Ups: Start at 4x4, build to 4x6.'
      },
      {
        day: 'Day 4',
        focus: 'Mid-Week Sustained Threshold Tempo Run',
        warmup: DIME_WARMUP_TEXT,
        strength: [
          'Sustained Tempo Run (fast, controlled pace) (1x3.0-4.0 miles) [Overload: Start at 3.0 miles; build max 10%/week to 4.0 miles - Effort: Threshold (75-80% HRR, RPE 8) - Rest: 0s]'
        ],
        run: 'Sustained Tempo Run (fast, controlled pace): 3.0–4.0 miles (start at 3.0 miles)',
        pace: 'Threshold (75–80% HRR, Rest: 0s)',
        progressionRule: 'Start at 3.0 miles at Threshold pace (75–80% HRR) and build progressively toward 4.0 miles.'
      },
      {
        day: 'Day 5',
        focus: 'Power & Repeat Sprint Ability (RSA)',
        warmup: DIME_WARMUP_TEXT,
        strength: [
          'Trap-Bar Jumps (jump explosively) (4x3) [Effort: Light (20% Squat Max, RPE 8) - Rest: 120s (2 min)]',
          'Speed Bench Press (max bar speed) (6x3) [Effort: Moderate (55-65% Max, RPE 8) - Rest: 60s]',
          'Medicine Ball Overhead Slam + Rotational Lunge (3x8 reps each) [Effort: 10-14 lb Med Ball (RPE 8) - Rest: 60s]',
          '40m Sprint Repeats (Repeat Sprint Ability) (8-10x40m) [Overload: Start at 8 sets x 40m; build to 10 repeats - Effort: Hard (90-95% effort, RPE 9) - Rest: 35s]'
        ],
        run: '40m Sprint Repeats (Repeat Sprint Ability): 8–10 × 40m (start at 8 × 40m)',
        pace: 'Hard (90–95% effort, 35s rest)',
        progressionRule: 'Explosive Trap-Bar Jumps (20% Squat Max) + Speed Bench (55–65% Max) + 40m Sprint Repeats (start at 8x40m with strict 35s rest).'
      },
      {
        day: 'Day 6',
        focus: 'Rest & Shift Recovery',
        warmup: 'None — Focus on 7–9 hours of dark, cool sleep and meal prep for upcoming shifts.',
        strength: [
          'Rest & Shift Recovery: Focus on 7–9 hours of dark, cool sleep and meal prep (0.75–1.0g lean protein per lb of bodyweight).'
        ],
        run: 'Rest & Shift Recovery',
        pace: 'N/A',
        progressionRule: 'Prioritize 7–9 hours of sleep, hydration, and high-protein shift meal prep.'
      },
      {
        day: 'Day 7',
        focus: 'Rest & Shift Recovery',
        warmup: 'None — Focus on 7–9 hours of dark, cool sleep and meal prep for upcoming shifts.',
        strength: [
          'Rest & Shift Recovery: Focus on 7–9 hours of dark, cool sleep, hydration, and meal prep for upcoming shifts.'
        ],
        run: 'Rest & Shift Recovery',
        pace: 'N/A',
        progressionRule: 'Complete physiological & nervous system recovery before next training week.'
      }
    ]
  },
  apex_phase4: {
    id: 'apex_phase4',
    title: 'Quarter 4 (Weeks 40–52): Use-of-Force Readiness & Annual Peak',
    weeks: 'Weeks 40–52',
    desc: 'Put your strong aerobic endurance, strength, and speed together into realistic police pursuit and arrest circuits. Week 51: Cut volume by 50% (Taper). Week 52: Final Fitness Test.',
    coachRule:
      'Quarter 4 Progression Rules: Maintain limit strength with low-volume heavy triples/quads (start at 3 sets x 3 reps on 3x3-4 Back Squat & Bench Press; 3x3 Deadlift at 80–85% Max, RPE 8–8.5) so legs stay fresh for Hill Sprints and the 4-Round Duty Pursuit & Use-of-Force Circuit in a 20-lb vest. Deload (-40% volume) on Weeks 40, 44, 48. Week 51: Cut volume by 50% (Taper). Week 52: Final Fitness Test.',
    days: [
      {
        day: 'Day 1',
        focus: 'Lower Strength Maintenance & Broad Jump Power',
        warmup: DIME_WARMUP_TEXT,
        strength: [
          'Standing Long Jump (Broad Jump) (3x3) [Effort: Max Distance (RPE 8.5) - Rest: 120s (2 min)]',
          'Barbell Back Squat (3x3-4) [Overload: Start at 3 sets x 3 reps; build to 4 reps then +5-10 lbs - Effort: Heavy (80-85% Max, RPE 8-8.5) - Rest: 180s (3 min)]',
          'Conventional or Trap-Bar Deadlift (3x3) [Overload: +5-10 lbs on 3x3 when bar speed is crisp - Effort: Heavy (80-85% Max, RPE 8-8.5) - Rest: 180s (3 min)]',
          'Staggered-Stance Pallof Press (3x10/side) [Effort: Moderate-Heavy (RPE 8) - Rest: 60s]'
        ],
        run: 'Rest from running',
        pace: 'N/A',
        progressionRule: 'Back Squat: Start at 3x3 (80–85% Max, RPE 8–8.5), build to 4 reps then +5–10 lbs. Deadlift: 3x3 at 80–85% Max.'
      },
      {
        day: 'Day 2',
        focus: 'Hill Sprints & Steady Aerobic Run',
        warmup: DIME_WARMUP_TEXT,
        strength: [
          'Hill Sprints (easier on hamstrings than flat sprints) (6x30m) [Effort: All-Out (95%, RPE 9) - Rest: 90s walk]'
        ],
        run: 'Steady Aerobic Run: 2.5–3.1 miles (start at 2.5 miles)',
        pace: 'Conversational Pace (after 6 × 30m Hill Sprints)',
        progressionRule: 'Complete 6x30m Hill Sprints at 95% effort (90s walk rest), then transition into a 2.5–3.1 mile conversational aerobic run.'
      },
      {
        day: 'Day 3',
        focus: 'Upper Strength Maintenance & Grappling Grip',
        warmup: DIME_WARMUP_TEXT,
        strength: [
          'Barbell Bench Press (3x3-4) [Overload: Start at 3 sets x 3 reps; build to 4 reps then +2.5-5 lbs - Effort: Heavy (80-85% Max, RPE 8-8.5) - Rest: 180s (3 min)]',
          'Strict Pronated Pull-Ups (3xMax (stop 1 shy)) [Overload: +1 rep per session or add vest - Effort: Bodyweight or +Vest (RPE 9) - Rest: 120s (2 min)]',
          'Single-Arm Dumbbell Bench Press (3x8/arm) [Overload: +2.5-5 lbs DB on 8/arm - Effort: Moderate-Heavy (RPE 8) - Rest: 90s]',
          "Heavy Farmer's Walk (3x30m) [Overload: +5 lbs/hand on completed 30m - Effort: Heavy Dumbbells/Handles (RPE 8.5) - Rest: 90s]"
        ],
        run: 'Rest from running',
        pace: 'N/A',
        progressionRule: 'Bench Press: Start at 3x3 (80–85% Max, RPE 8–8.5), build to 4 reps then +2.5–5 lbs. Pull-Ups: 3 sets stopping 1 rep shy of failure.'
      },
      {
        day: 'Day 4',
        focus: 'Mid-Week Steady Zone 2 Recovery Run',
        warmup: DIME_WARMUP_TEXT,
        strength: [
          'Steady Zone 2 Recovery Run (1x3.0 miles) [Effort: Easy Conversational Pace (RPE 7) - Rest: 0s]'
        ],
        run: 'Steady Zone 2 Recovery Run: 3.0 miles',
        pace: 'Easy Conversational Pace (Rest: 0s)',
        progressionRule: 'Maintain an easy conversational Zone 2 pace across 3.0 miles to flush fatigue before Day 5 Duty Circuit.'
      },
      {
        day: 'Day 5',
        focus: 'Duty Pursuit & Use-of-Force Circuit (Wearing 20-lb Weight Vest)',
        warmup: DIME_WARMUP_TEXT,
        strength: [
          '4 Rounds Wearing 20-lb Weight Vest (60-90s/round) (4x1 full circuit) [Effort: Hard (85-95% effort, RPE 9) - Rest: 120s (2-3 min between rounds) - Circuit Stations: 1) 45m Pursuit Sprint + 1.2m Barrier Vault / Box Step-Over, 2) 15m Low Crawl + 10 Sledgehammer Tire Strikes, 3) 165-lb Dummy / Heavy Sled Drag (10m out, turn, 10m back), 4) 30s Heavy Sandbag Bear-Hug Hold / Ground Control Drill]'
        ],
        run: '4 Rounds Duty Pursuit & Use-of-Force Circuit (Wearing 20-lb Weight Vest, 60–90s/round)',
        pace: 'Hard (85–95% effort, 2–3 min rest between rounds)',
        progressionRule: 'Complete 4 full rounds in a 20-lb weight vest (60–90s/round, 2–3 min rest): 1) 45m Sprint + 1.2m Vault, 2) 15m Low Crawl + 10 Sledgehammer Strikes, 3) 165-lb Dummy Drag (10m out/10m back), 4) 30s Sandbag Bear-Hug Hold.'
      },
      {
        day: 'Day 6',
        focus: 'Rest & Shift Recovery',
        warmup: 'None — Focus on 7–9 hours of dark, cool sleep and meal prep for upcoming shifts.',
        strength: [
          'Rest & Shift Recovery: Focus on 7–9 hours of dark, cool sleep and meal prep (0.75–1.0g lean protein per lb of bodyweight).'
        ],
        run: 'Rest & Shift Recovery',
        pace: 'N/A',
        progressionRule: 'Prioritize 7–9 hours of sleep, hydration, and high-protein shift meal prep.'
      },
      {
        day: 'Day 7',
        focus: 'Rest & Shift Recovery',
        warmup: 'None — Focus on 7–9 hours of dark, cool sleep and meal prep for upcoming shifts.',
        strength: [
          'Rest & Shift Recovery: Focus on 7–9 hours of dark, cool sleep, hydration, and meal prep for upcoming shifts.'
        ],
        run: 'Rest & Shift Recovery',
        pace: 'N/A',
        progressionRule: 'Complete physiological & nervous system recovery before next training week.'
      }
    ]
  }
};

/**
 * Returns customized week data for any week 1 through 52 of the Law Enforcement 52-Week Fitness & Readiness Program.
 * Incorporates Quarter 1–4 templates, 3-week progressive blocks, every-4th-week 40% Deloads (Weeks 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48),
 * Week 51 Taper (-50% volume), and Quarterly/Annual Benchmark Tests (Weeks 13, 26, 39, 52).
 */
export function getApexWeekData(weekNumber: number): ProtocolPhase {
  const week = Math.max(1, Math.min(52, weekNumber));

  let basePhaseId = 'apex_phase1';
  let quarterNum = 1;
  if (week >= 1 && week <= 13) {
    basePhaseId = 'apex_phase1';
    quarterNum = 1;
  } else if (week >= 14 && week <= 26) {
    basePhaseId = 'apex_phase2';
    quarterNum = 2;
  } else if (week >= 27 && week <= 39) {
    basePhaseId = 'apex_phase3';
    quarterNum = 3;
  } else {
    basePhaseId = 'apex_phase4';
    quarterNum = 4;
  }

  const basePhase = APEX_PROTOCOL_PHASES[basePhaseId];
  const clonedDays = JSON.parse(JSON.stringify(basePhase.days)) as ProtocolDay[];

  const isDeloadWeek = week % 4 === 0 && week <= 48;
  const isTaperWeek = week === 51;
  const isTestWeek = week === 13 || week === 26 || week === 39 || week === 52;

  let weekBadge = '';
  let weekRulePrefix = `Week ${week} of 52 (Quarter ${quarterNum}): `;

  if (isDeloadWeek) {
    weekBadge = ' (DELOAD WEEK — -40% VOLUME)';
    weekRulePrefix +=
      'RECOVERY / DELOAD WEEK (Every 4th Week Rule): Cut your strength sets and running distance by 40% this week so your joints and central nervous system recover. ';
    clonedDays.forEach((d) => {
      if (d.run && !d.run.toLowerCase().includes('rest')) {
        d.run = `${d.run} [Deload Week ${week}: Cut running distance/rounds by 40%]`;
      }
      d.progressionRule = `Deload Week ${week}: Cut strength sets and running distance by 40% for joint & CNS recovery. ${d.progressionRule || ''}`;
    });
  } else if (isTaperWeek) {
    weekBadge = ' (WEEK 51 TAPER — -50% VOLUME)';
    weekRulePrefix +=
      'WEEK 51 TAPER: Cut all strength sets, circuit rounds, and running volume by 50% this week while maintaining crisp movement speed to peak for Week 52 Final Fitness Testing. ';
    clonedDays.forEach((d) => {
      if (d.run && !d.run.toLowerCase().includes('rest')) {
        d.run = `${d.run} [Week 51 Taper: Cut volume by 50%]`;
      }
      d.progressionRule = `Week 51 Taper: Cut volume by 50% to shed fatigue before Week 52 Final Fitness Test. ${d.progressionRule || ''}`;
    });
  } else if (isTestWeek) {
    weekBadge = week === 52 ? ' (FINAL ANNUAL FITNESS TEST)' : ` (QUARTER ${quarterNum} BENCHMARK TEST)`;
    weekRulePrefix +=
      'FITNESS BENCHMARK WEEK (Test Well-Rested): Test 1) 1.5-Mile Run [Duty Ready <11:30 | High Readiness <10:15 | SWAT/Tactical <9:30] & 3.1-Mile (5K) Run [<24:00 | <21:00 | <19:15], 2) Squat & Trap-Bar Deadlift [1.5x | 1.75x | 2.0-2.5x BW], 3) Bench Press [1.0x | 1.25x | 1.5-1.75x BW] & 1-Min Push-Ups [35+ | 45+ | 60+], 4) Strict Pull-Ups [8+ | 14+ | 20+] & 40m Sprint [<5.6s | <5.2s | <4.9s], 5) Vertical Jump [50+ cm | 60+ cm | 70+ cm]. ';
  } else {
    const blockWeek = ((week - 1) % 4) + 1; // 1, 2, or 3 within the 4-week cycle
    weekRulePrefix += `3-Week Progressive Block (Week ${blockWeek} of 3): Start at the low end of set & rep ranges; add 1–2 reps per set until hitting the top of the rep range with 1–2 RIR, then add +2.5–5 lbs (upper) or +5–10 lbs (lower). `;
  }

  return {
    ...basePhase,
    id: `apex_week_${week}`,
    title: `${basePhase.title} — Week ${week}${weekBadge}`,
    weeks: `Week ${week} of 52 • Quarter ${quarterNum}`,
    coachRule: `${weekRulePrefix}${basePhase.coachRule || ''}`,
    days: clonedDays
  };
}

// Merge 52-Week Law Enforcement Program into PROTOCOL_DATA
Object.assign(PROTOCOL_DATA, APEX_PROTOCOL_PHASES);

// ---------------------------------------------------------------------------
// 12-WEEK TACTICAL BODYBUILDING PROGRAM (Starts Sunday • 4 Lift + 2 Speed/Cond + 1 Rest)
// ---------------------------------------------------------------------------
export const TACTICAL_BB_DIME_WARMUP_TEXT =
  'Mandatory 8-Minute DIME Warm-Up Protocol (Required Every Session): Dynamic Mobility — 10 World\'s Greatest Stretches (5/side), 10 Leg Swings (front/back & side-to-side/leg); Isolation & Activation — 15 Glute Bridges, 15 Band Pull-Aparts; Movement Prep — 20m High Knees, 20m Butt Kicks, 20m A-Skips; Explosive Primer — 3 Broad Jumps (step back and fully reset between reps).';

export const TACTICAL_BB_DAILY_RECOVERY_DIME_TEXT =
  'Mandatory Daily DIME Restorative Flow (8 Minutes) + Full Recovery: Complete light DIME Dynamic Mobility & Activation (10 World\'s Greatest Stretches, 10 Leg Swings/leg, 15 Glute Bridges, 15 Band Pull-Aparts) to relieve patrol-belt stiffness, then prioritize 8+ hours of sleep and hydration.';

export interface TacticalConditioningWeek {
  week: number;
  phase: 1 | 2 | 3;
  phaseName: string;
  conditioningSummary: string;
  is_deload?: boolean;
}

export const TACTICAL_CONDITIONING_MATRIX: TacticalConditioningWeek[] = [
  { week: 1, phase: 1, phaseName: 'Phase 1: Armor & Base', conditioningSummary: '6×20m Falling Starts + 4×40m Build-Ups + 4×50m Sled Push | Fri Zone 2 (25–30m)', is_deload: false },
  { week: 2, phase: 1, phaseName: 'Phase 1: Armor & Base', conditioningSummary: '6×20m Falling Starts + 4×40m Build-Ups + 4×50m Sled Push | Fri Zone 2 (25–30m)', is_deload: false },
  { week: 3, phase: 1, phaseName: 'Phase 1: Armor & Base', conditioningSummary: '6×20m Falling Starts + 4×40m Build-Ups + 4×50m Sled Push | Fri Zone 2 (25–30m)', is_deload: false },
  { week: 4, phase: 1, phaseName: 'Phase 1 Deload', conditioningSummary: 'Deload (-40% volume, ~80% weight, crisp speed)', is_deload: true },
  { week: 5, phase: 2, phaseName: 'Phase 2: Power-Building', conditioningSummary: '6× Pro Agility (5-10-5m) + 5×30m Flying Sprints + 6×15s/45s Assault Bike | Fri Zone 2', is_deload: false },
  { week: 6, phase: 2, phaseName: 'Phase 2: Power-Building', conditioningSummary: '6× Pro Agility (5-10-5m) + 5×30m Flying Sprints + 6×15s/45s Assault Bike | Fri Zone 2', is_deload: false },
  { week: 7, phase: 2, phaseName: 'Phase 2: Power-Building', conditioningSummary: '6× Pro Agility (5-10-5m) + 5×30m Flying Sprints + 6×15s/45s Assault Bike | Fri Zone 2', is_deload: false },
  { week: 8, phase: 2, phaseName: 'Phase 2 Deload', conditioningSummary: 'Deload (-40% volume, ~80% weight, crisp speed)', is_deload: true },
  { week: 9, phase: 3, phaseName: 'Phase 3: Peak & Velocity', conditioningSummary: '4×60m Broken Sprints (20m/drop/40m) + 4× T-Drill (10m×10m) | Fri Zone 2', is_deload: false },
  { week: 10, phase: 3, phaseName: 'Phase 3: Peak & Velocity', conditioningSummary: '4×60m Broken Sprints (20m/drop/40m) + 4× T-Drill (10m×10m) | Fri Zone 2', is_deload: false },
  { week: 11, phase: 3, phaseName: 'Phase 3: Peak & Velocity', conditioningSummary: '4×60m Broken Sprints (20m/drop/40m) + 4× T-Drill (10m×10m) | Fri Zone 2', is_deload: false },
  { week: 12, phase: 3, phaseName: 'Phase 3 Deload / Peak', conditioningSummary: 'Deload (-40% volume, ~80% weight, crisp bar speed)', is_deload: true },
];

function buildTacticalBodybuildingPhase(phaseNum: 1 | 2 | 3): ProtocolPhase {
  const isP1 = phaseNum === 1;
  const isP2 = phaseNum === 2;
  const mainReps = isP1 ? '8-10' : isP2 ? '5-6' : '3-5';
  const upperAccReps = isP1 ? '10-12' : isP2 ? '8-10' : '6-8';
  const lowerAccSingleReps = isP1 ? '10/leg' : isP2 ? '8/leg' : '6/leg';
  const legPressReps = isP1 ? '12' : isP2 ? '10' : '8';
  const compoundRest = isP1 ? 120 : isP2 ? 150 : 180;
  const accessoryRest = isP1 ? 75 : isP2 ? 90 : 75;

  const phaseTitle = isP1
    ? 'Phase 1 (Weeks 1–4): Armor & Base — 12-Week Tactical Bodybuilding Program'
    : isP2
    ? 'Phase 2 (Weeks 5–8): Power-Building — 12-Week Tactical Bodybuilding Program'
    : 'Phase 3 (Weeks 9–12): Peak & Velocity — 12-Week Tactical Bodybuilding Program';

  const phaseWeeks = isP1 ? 'Weeks 1–4' : isP2 ? 'Weeks 5–8' : 'Weeks 9–12';
  const phaseDesc = isP1
    ? 'Phase 1 (Armor & Base): Structural hypertrophy (8–10 main, 10–15 accessory), tendon preparation, and acceleration mechanics. Starts Sunday. Guardrails: Zero Olympic lifts, burpees, sandbags, or jump ropes. Mandatory 8-Min DIME Warm-Up daily.'
    : isP2
    ? 'Phase 2 (Power-Building): Maximal force production (5–6 main, 8–10 accessory), upper-back & shoulder density, and top-end agility/deceleration speed. Guardrails: Zero Olympic lifts, burpees, sandbags, or jump ropes. Mandatory 8-Min DIME Warm-Up daily.'
    : 'Phase 3 (Peak & Velocity): Heavy strength maintenance (3–5 main, 6–8 explosive/hypertrophy), ballistic power, and broken-sprint pursuit conditioning. Guardrails: Zero Olympic lifts, burpees, sandbags, or jump ropes. Mandatory 8-Min DIME Warm-Up daily.';

  const coachRule =
    'Tactical Bodybuilding Execution & Shift Rules: 1) Double Progression — Pick a weight within the rep range; once you hit the top reps across all sets with 1–2 RIR, add +5 lbs (upper) or +10 lbs (lower) next week. 2) Mandated Daily DIME — Complete the 8-Minute DIME Warm-Up before EVERY session. 3) Guardrails — Zero Olympic lifts, burpees, sandbags, or jump ropes. 4) Deload Weeks (4, 8, 12) — Cut working sets by 40% (~80% weight, crisp speed). 5) Bad Shift Protocol — Off double shift / 4 hrs sleep: cut secondary accessory sets by half, keep main lift @ 3 RIR, swap sprints for 20-min Zone 2 flush.';

  const tuesdayDay: ProtocolDay = isP1
    ? {
        day: 'Sunday +2 • Tuesday',
        focus: 'Tuesday: Speed & Pursuit Conditioning (Track / Turf — Phase 1 Acceleration)',
        warmup: TACTICAL_BB_DIME_WARMUP_TEXT,
        strength: [
          '20m Falling-Start Sprints (6x20m) [Overload: Explosive first 3 steps - Effort: Max Acceleration (RPE 9) - Rest: 90s - Walk-back recovery between reps]',
          '40m Build-Up Sprints (4x40m) [Overload: Smooth top-speed posture - Effort: Hard (85-90% effort, RPE 8.5) - Rest: 120s - 2 min recovery]',
          '50m Sled Push Finisher (4x50m) [Overload: Add +10 lbs sled when crisp - Effort: Moderate Load (RPE 8) - Rest: 60s - Drive low through balls of feet]'
        ],
        run: 'Phase 1 Track / Turf Acceleration: 6×20m Falling Starts + 4×40m Build-Ups + 4×50m Sled Push',
        pace: '90s walk-back (20m) • 2 min rest (40m @ 85–90%) • 60s rest (50m sled)',
        progressionRule: 'Phase 1 Acceleration: Foot-pursuit acceleration and anaerobic repeatability. Bad Shift Rule: Swap sprints for 20-min Zone 2 flush if sleep-deprived.'
      }
    : isP2
    ? {
        day: 'Sunday +2 • Tuesday',
        focus: 'Tuesday: Speed & Pursuit Conditioning (Track / Turf — Phase 2 Agility & Deceleration)',
        warmup: TACTICAL_BB_DIME_WARMUP_TEXT,
        strength: [
          'Pro Agility Shuttle (5-10-5 meters) (6x5-10-5m) [Overload: Sharp plant & drop hips - Effort: All-Out Change of Direction (RPE 9) - Rest: 90s]',
          '30m Flying Sprints (15m build-up, 30m max velocity) (5x30m) [Overload: Upright relaxed top speed - Effort: Max Velocity (RPE 9.5) - Rest: 120s - 2 min full recovery]',
          'Assault Bike Max Sprint / Easy Spin Finisher (6x15s sprint / 45s spin) [Effort: All-Out 15s / Easy 45s (RPE 9) - Rest: 45s]'
        ],
        run: 'Phase 2 Agility & Deceleration: 6× Pro Agility (5-10-5m) + 5×30m Flying Sprints + 6×15s/45s Bike Finisher',
        pace: '90s rest (Pro Agility) • 2 min rest (Flying Sprints) • 15s Max / 45s Easy Spin',
        progressionRule: 'Phase 2 Agility & Deceleration: Sharp lateral deceleration and top-end sprint mechanics. Bad Shift Rule: Swap sprints for 20-min Zone 2 flush.'
      }
    : {
        day: 'Sunday +2 • Tuesday',
        focus: 'Tuesday: Speed & Pursuit Conditioning (Track / Turf — Phase 3 Pursuit Simulation)',
        warmup: TACTICAL_BB_DIME_WARMUP_TEXT,
        strength: [
          '60m Broken Sprints (sprint 20m, drop to chest, pop up, sprint 40m) (4x60m) [Effort: Pursuit Simulation (RPE 9.5) - Rest: 150s - 2.5 min full recovery]',
          'T-Drill Agility Runs (10m x 10m) (4x10m x 10m) [Effort: Crisp Lateral & Backpedal Cuts (RPE 9) - Rest: 90s]'
        ],
        run: 'Phase 3 Pursuit Simulation: 4×60m Broken Sprints (20m/drop/40m) + 4× T-Drill (10m×10m)',
        pace: '2.5 min rest (Broken Sprints) • 90s rest (T-Drill)',
        progressionRule: 'Phase 3 Pursuit Simulation: Realistic foot-pursuit get-ups and multi-directional agility under fatigue. Bad Shift Rule: Swap for 20-min Zone 2 flush.'
      };

  return {
    id: `tactical_bodybuilding_p${phaseNum}`,
    title: phaseTitle,
    weeks: phaseWeeks,
    desc: phaseDesc,
    coachRule,
    days: [
      {
        day: 'Sunday',
        focus: 'Sunday: Upper Body — Push & Shoulder Armor',
        warmup: TACTICAL_BB_DIME_WARMUP_TEXT,
        strength: [
          `Incline Barbell or Dumbbell Bench Press (4x${mainReps}) [Overload: Double progression (+5 lbs upper at top reps, 1-2 RIR) - Effort: RPE 8 - Rest: ${compoundRest}s - Primary press; 2-sec controlled eccentric]`,
          `Seated Dumbbell Overhead Press (3x${upperAccReps}) [Overload: +5 lbs DBs on top reps (1-2 RIR) - Effort: RPE 8 - Rest: ${accessoryRest}s - Full range of motion; brace core without arch]`,
          `Weighted Dips or Close-Grip Bench Press (3x${upperAccReps}) [Overload: +5 lbs on top reps (1-2 RIR) - Effort: RPE 8 - Rest: ${accessoryRest}s - Keep elbows tucked to protect shoulder capsule]`,
          `Explosive Med-Ball Chest Pass (against wall) (4x5) [Overload: Maximum throwing velocity - Effort: Explosive (RPE 8.5) - Rest: 60s - Maximum velocity, full reset between throws]`,
          `Superset: Lateral Raises + Cable Tricep Pushdowns (3x12-15 / 12-15) [Overload: Minimal rest between paired movements; +2.5-5 lbs at 15 reps - Effort: RPE 8.5 - Rest: 60s]`
        ],
        run: 'Rest from running',
        pace: 'N/A',
        progressionRule: `Primary Press: 4×${mainReps} (+5 lbs upper when hitting top reps w/ 1–2 RIR); Accessories: ${upperAccReps}. Mandatory 8-Min DIME Warm-Up.`
      },
      {
        day: 'Monday',
        focus: 'Monday: Lower Body — Quad Drive & Acceleration',
        warmup: TACTICAL_BB_DIME_WARMUP_TEXT,
        strength: [
          `Trap Bar Deadlift or Front Squat (4x${mainReps}) [Overload: Double progression (+10 lbs lower at top reps, 1-2 RIR) - Effort: RPE 8 - Rest: ${compoundRest}s - Primary lower lift; explosive concentric drive]`,
          `Bulgarian Split Squats (Dumbbells) (3x${lowerAccSingleReps}) [Overload: +5-10 lbs DBs when hitting top reps - Effort: RPE 8 - Rest: ${accessoryRest}s - Maintain upright torso and knee alignment]`,
          `Leg Press (3x${legPressReps}) [Overload: +10 lbs at crisp eccentric control - Effort: RPE 8 - Rest: ${accessoryRest}s - Controlled 3-second eccentric lowering phase]`,
          `Box Jumps (4x4) [Overload: Step down and fully reset each rep - Effort: Explosive Power (RPE 8.5) - Rest: 90s - Focus on soft landing mechanics]`,
          `Superset: Standing Calf Raises + Hanging Leg Raises (3x12-15 / 12-15) [Overload: Full stretch at bottom of calf raise; no swinging - Effort: RPE 8.5 - Rest: 60s]`
        ],
        run: 'Rest from running',
        pace: 'N/A',
        progressionRule: `Primary Lower: 4×${mainReps} (+10 lbs lower at top reps w/ 1–2 RIR); Split Squats ${lowerAccSingleReps}, Leg Press ${legPressReps}. Mandatory 8-Min DIME Warm-Up.`
      },
      {
        ...tuesdayDay,
        day: 'Tuesday'
      },
      {
        day: 'Wednesday',
        focus: 'Wednesday: Upper Body — Pull & Duty-Belt Posture',
        warmup: TACTICAL_BB_DIME_WARMUP_TEXT,
        strength: [
          `Weighted Pull-Ups or Lat Pulldowns (4x${mainReps}) [Overload: Double progression (+5 lbs upper at top reps, 1-2 RIR) - Effort: RPE 8 - Rest: ${compoundRest}s - Full scapular depression and chest-to-bar pull]`,
          `Chest-Supported T-Bar or Dumbbell Row (4x${upperAccReps}) [Overload: +5 lbs on top reps - Effort: RPE 8 - Rest: ${accessoryRest}s - Eliminates lower-back fatigue; squeeze shoulder blades]`,
          `Face Pulls (4x15) [Overload: +5 lbs when external rotation stays crisp - Effort: RPE 8.5 - Rest: 60s - External rotation at peak contraction]`,
          `Barbell or Heavy Dumbbell Shrugs (3x10-12) [Overload: +5-10 lbs on 12 reps - Effort: RPE 8 - Rest: 60s - 2-second pause at the top of each repetition]`,
          `Superset: Hammer Curls + Heavy Farmer's Carries (3x10 / 40m) [Overload: +5 lbs at crisp posture - Effort: RPE 8.5 - Rest: 90s - Maintain tall posture and braced core on carries]`
        ],
        run: 'Rest from running',
        pace: 'N/A',
        progressionRule: `Pull-Ups/Pulldowns: 4×${mainReps} (+5 lbs upper at top reps); Rows: 4×${upperAccReps}; Shrugs + Hammer Curl/Farmer Carry superset. Mandatory 8-Min DIME Warm-Up.`
      },
      {
        day: 'Thursday',
        focus: 'Thursday: Lower Body — Posterior Chain & Top-End Speed',
        warmup: TACTICAL_BB_DIME_WARMUP_TEXT,
        strength: [
          `Romanian Deadlift (Barbell or Dumbbell) (4x${mainReps}) [Overload: Double progression (+10 lbs lower at top reps, 1-2 RIR) - Effort: RPE 8 - Rest: ${compoundRest}s - Push hips back until deep hamstring tension; flat spine]`,
          `Heavy Sled Push or Reverse Sled Drag (4x30m) [Overload: +10 lbs sled when trips stay crisp - Effort: Heavy (RPE 8.5) - Rest: 90s - Drive through balls of feet]`,
          `Lying or Seated Leg Curls (3x${legPressReps}) [Overload: +5-10 lbs with strict return control - Effort: RPE 8 - Rest: ${accessoryRest}s - Control the return phase; avoid hip lift]`,
          `Kettlebell Swings (4x12) [Overload: +5 lbs KB when hip snap is explosive - Effort: Explosive Hinge (RPE 8) - Rest: 60s - Explosive power hip snap; hinge, do not squat]`,
          `Pallof Press (3x10/side) [Overload: +2.5-5 lbs or band tension - Effort: RPE 8 - Rest: 60s - Anti-rotation core stability; 2-second hold at full extension]`
        ],
        run: 'Rest from running',
        pace: 'N/A',
        progressionRule: `RDL: 4×${mainReps} (+10 lbs lower at top reps); Sled Push/Drag: 4×30m (90s rest); Leg Curls: 3×${legPressReps}. Mandatory 8-Min DIME Warm-Up.`
      },
      {
        day: 'Friday',
        focus: 'Friday: Athletic Conditioning & Arms ("Friday Pump + Engine")',
        warmup: TACTICAL_BB_DIME_WARMUP_TEXT,
        strength: [
          'EZ-Bar Curls (3x10-12) [Overload: +5 lbs upper at 12 reps - Effort: RPE 8.5 - Rest: 60s - Part A Arm Hypertrophy (25 mins total)]',
          'Skullcrushers or Overhead Cable Extension (3x10-12) [Overload: +5 lbs upper at 12 reps - Effort: RPE 8.5 - Rest: 60s - Controlled eccentric, full elbow lock]',
          'Cable Crunches or Ab-Wheel Rollouts (3x12-15) [Overload: +5 lbs cable or deeper rollout - Effort: RPE 8 - Rest: 60s - Spine-safe anterior core hypertrophy]',
          'Zone 2 Run, Row, or Incline Treadmill Walk (1x25-30 mins) [Effort: Zone 2 HR 130-145 BPM Conversational Pace (RPE 6.5-7) - Rest: 0s - Part B Aerobic Base / Shift Flush to clear metabolic waste]'
        ],
        run: 'Part B — Aerobic Base / Shift Flush: 25–30 mins Zone 2 Run, Row, or Incline Treadmill Walk',
        pace: 'Heart rate 130–145 BPM — conversational pace to clear metabolic waste and build shift stamina',
        progressionRule: 'Part A (25 mins Arms & Core) + Part B (25–30 mins Zone 2 Flush @ 130–145 BPM). Mandatory 8-Min DIME Warm-Up.'
      },
      {
        day: 'Saturday',
        focus: 'Saturday: Complete Rest (Optional Daily DIME Mobility Flush)',
        warmup: TACTICAL_BB_DAILY_RECOVERY_DIME_TEXT,
        strength: [
          'Complete Rest: Full recovery, hydration, 8+ hours of dark sleep, and shift meal prep (Optional: light 8-min DIME mobility flow to relieve cruiser hip tightness).'
        ],
        run: 'Complete Rest',
        pace: 'N/A',
        progressionRule: 'Full recovery, hydration, and sleep prioritization before starting Sunday Upper Push.'
      }
    ]
  };
}

export const TACTICAL_BODYBUILDING_PHASES: Record<'tb_phase1' | 'tb_phase2' | 'tb_phase3', ProtocolPhase> = {
  tb_phase1: buildTacticalBodybuildingPhase(1),
  tb_phase2: buildTacticalBodybuildingPhase(2),
  tb_phase3: buildTacticalBodybuildingPhase(3),
};

export const TACTICAL_HYPERTROPHY_BASE_PHASE: ProtocolPhase = TACTICAL_BODYBUILDING_PHASES.tb_phase1;

/**
 * Applies 40% set reduction & ~80% weight deload guidance for Weeks 4, 8, and 12.
 */
function applyDeloadToExerciseString(exerciseStr: string): string {
  const bracketMatch = exerciseStr.match(/\[(.*?)\]/);
  const hint = bracketMatch ? bracketMatch[1] : '';
  const withoutBracket = exerciseStr.replace(/\[.*?\]/g, '').trim();
  const lastOpenParen = withoutBracket.lastIndexOf('(');
  const lastCloseParen = withoutBracket.lastIndexOf(')');

  let updatedCore = withoutBracket;
  if (lastOpenParen > 0 && lastCloseParen === withoutBracket.length - 1) {
    const spec = withoutBracket.slice(lastOpenParen + 1, lastCloseParen).trim();
    const xMatch = spec.match(/^(\d+)\s*[x×]\s*(.+)$/i);
    if (xMatch) {
      const origSets = parseInt(xMatch[1], 10);
      if (origSets >= 2) {
        // 40% reduction (e.g. 4 sets -> 2-3 sets; 3 sets -> 2 sets; 6 rounds -> 3-4 rounds)
        const deloadSets = origSets === 4 ? '2-3' : `${Math.max(2, Math.round(origSets * 0.6))}`;
        updatedCore = `${withoutBracket.slice(0, lastOpenParen)}(${deloadSets}x${xMatch[2]})`;
      }
    }
  }

  const deloadHint = hint
    ? `DELOAD (-40% sets, ~80% weight, crisp bar speed) • ${hint}`
    : 'DELOAD (-40% sets, ~80% weight, crisp bar speed)';
  return `${updatedCore} [${deloadHint}]`;
}

/**
 * Returns customized week data for any week 1 through 12 of the 12-Week Tactical Bodybuilding Program.
 * Incorporates Phase 1 (Wks 1–4), Phase 2 (Wks 5–8), Phase 3 (Wks 9–12),
 * Deload Weeks (Weeks 4, 8, 12: -40% working sets, ~80% weight), and Mandated Daily DIME Warm-Up.
 */
export function getTacticalHypertrophyWeekData(weekNumber: number): ProtocolPhase {
  const week = Math.max(1, Math.min(12, weekNumber));
  const phaseNum: 1 | 2 | 3 = week <= 4 ? 1 : week <= 8 ? 2 : 3;
  const basePhase = TACTICAL_BODYBUILDING_PHASES[`tb_phase${phaseNum}`];
  const clonedDays = JSON.parse(JSON.stringify(basePhase.days)) as ProtocolDay[];

  const isDeloadWeek = week === 4 || week === 8 || week === 12;
  if (isDeloadWeek) {
    clonedDays.forEach((d) => {
      const isRest = d.focus.toLowerCase().includes('complete rest');
      if (!isRest) {
        d.strength = d.strength.map((s) => applyDeloadToExerciseString(s));
        if (d.run && !d.run.toLowerCase().includes('rest')) {
          d.run = `${d.run} [Week ${week} Deload: -40% rounds/volume]`;
        }
        d.progressionRule = `DELOAD WEEK ${week}: Cut working sets by 40% (e.g. 4 sets → 2–3 sets) & keep weights at ~80% of prior week's load with crisp bar speed. ${d.progressionRule || ''}`;
      }
    });
  }

  const phaseLabel =
    phaseNum === 1 ? 'Phase 1: Armor & Base' : phaseNum === 2 ? 'Phase 2: Power-Building' : 'Phase 3: Peak & Velocity';

  return {
    ...basePhase,
    id: `tactical_bb_week_${week}`,
    title: `12-Week Tactical Bodybuilding — Week ${week} (${phaseLabel}${isDeloadWeek ? ' • DELOAD' : ''})`,
    weeks: `Week ${week} of 12 • ${phaseLabel}`,
    days: clonedDays
  };
}

// Add base tactical bodybuilding into PROTOCOL_DATA
PROTOCOL_DATA.tactical_hypertrophy = TACTICAL_HYPERTROPHY_BASE_PHASE;

// ---------------------------------------------------------------------------
// Universal Law Enforcement Physical Agility Test (PAT) & Academy Preparation Protocol
// ---------------------------------------------------------------------------
export const UNIVERSAL_PAT_PROTOCOL: ProtocolPhase = {
  id: 'universal_pat',
  title: 'Universal Law Enforcement Physical Agility Test (PAT) Protocol',
  weeks: 'Weeks 1-8',
  desc: 'Comprehensive 8-week academy & state POST agility preparation. Peak 1.5-mile running speed, 300m anaerobic sprint output, unbroken push-up & sit-up density, and 165 lb dummy drag power.',
  coachRule: 'Universal PAT Laws: Target +1 rep per week on continuous push-ups and 1-minute sit-ups. Drop 3-5 seconds off 300m interval repeats. Progressive +10 lbs on Trap Bar Deadlift. 1.5-Mile threshold goal: sub-11:00 passing standard.',
  days: [
    {
      day: 'Day 1',
      focus: 'PAT Upper Density: Bench & Push-Up Volume',
      warmup: DIME_WARMUP_TEXT,
      strength: [
        'Flat Barbell Bench Press (4x8) [Overload: +5 lbs on 8 reps - Rest: 90s - Retract scapulae, touch lower sternum]',
        'Strict Chest-to-Bar Pull-Ups (4x6-8) [Overload: +2.5 to 5 lbs - Rest: 90s - Full dead hang, clear chin above bar]',
        'Standing Military Overhead Press (3x8) [Overload: +5 lbs on 8 reps - Rest: 90s - Core braced, glutes squeezed]',
        'Incline Dumbbell Bench Press (3x10) [Overload: +5 lbs DBs on 10 reps - Rest: 75s - 30 deg incline, upper chest armor]',
        'Barbell Bent-Over Row (4x8-10) [Overload: +5 lbs on 10 reps - Rest: 75s - Strict 45 deg hinge, pull to navel]',
        'Academy Cadence Push-Up Benchmark (3xMax) [Cadence test: 2 sec down, 1 sec up - Rest: 90s - Track unbroken reps]'
      ],
      run: 'Rest from running',
      pace: 'N/A',
      progressionRule: 'Bench & OHP: +5 lbs on 8 reps; Pull-Ups: +2.5-5 lbs; Cadence Push-Ups: +2 reps weekly'
    },
    {
      day: 'Day 2',
      focus: '300-Meter Anaerobic Sprint & Glycolytic Capacity',
      warmup: DIME_WARMUP_TEXT,
      strength: [
        "Heavy Trap Bar Farmer's Walks (4x50m) [Overload: +10 lbs total on 50m - Rest: 90s - Upright posture, maximum grip crush]",
        'Plank Series (Front & Side Planks) (3x60s) [Overload: +15s hold - Rest: 45s - Full body tension]',
        'Hollow Body Holds (3x45s) [Overload: +10s hold - Rest: 45s - Lower back pressed into floor]'
      ],
      run: '4 x 300m Track Intervals (Maximal Pursuit Speed)',
      pace: 'Target: 50-58 sec per 300m repeat. 2.5-3 min full walking recovery between rounds.',
      progressionRule: '300m Intervals: Drop 1-2s per repeat; Farmer Walks: +10 lbs total load'
    },
    {
      day: 'Day 3',
      focus: 'PAT Lower Strength & Posterior Armor',
      warmup: DIME_WARMUP_TEXT,
      strength: [
        'Trap Bar Deadlift (4x6) [Overload: +10 lbs on 6 reps - Rest: 120s - Explosive hip extension, neutral spine]',
        'Front Squat (Clean Grip or Cross-Arm) (3x8) [Overload: +10 lbs on 8 reps - Rest: 90s - High elbows, vertical torso]',
        'Romanian Deadlift (RDL) (3x10) [Overload: +10 lbs on 10 reps - Rest: 90s - Deep hamstring hinge stretch]',
        'Walking Dumbbell Lunges (3x12/leg) [Overload: +5 lbs DBs - Rest: 75s - Upright torso, knee taps floor]',
        '1-Minute Academy Timed Sit-Up Benchmark (3x60s) [Rest: 90s - Interlocked fingers, elbows touch knees, track reps]'
      ],
      run: '20-25 Min Recovery Spin or Jog',
      pace: 'Zone 2 / Conversational recovery (HR under 135 BPM)',
      progressionRule: 'Trap Bar Deadlift & Front Squat: +10 lbs on target reps; 1-Min Sit-Ups: +2 reps weekly'
    },
    {
      day: 'Day 4',
      focus: 'Active Recovery & Tactical Decompression',
      warmup: "Cat-cow transitions (2 min), 90/90 hip flow (3 min), couch stretch (90s/side), diaphragmatic box breathing (4 min).",
      strength: [
        'Passive foam rolling, tissue flossing, ankle dorsiflexion stretches, thoracic foam roll extensions.'
      ],
      run: 'Complete Rest (or Optional 15-min light walk)',
      pace: 'N/A',
      progressionRule: 'Rest, tissue hydration, and joint mobility restoration'
    },
    {
      day: 'Day 5',
      focus: 'Obstacle Negotiation, Body Drag & Agility Circuit',
      warmup: DIME_WARMUP_TEXT,
      strength: [
        'Heavy Sandbag / Dummy Drag Simulation (5x50 yards) [Overload: +10 lbs or faster time - Rest: 90s - Backward drag, low hip stance]',
        'Explosive Box Jumps (4x5) [Overload: +2 inches height - Rest: 60s - 24-30 inch box, land soft, stand tall]',
        'Plyometric Push-Ups (or Deficit Push-Ups) (3x10) [Overload: +2 reps - Rest: 60s - Explosive hands leave ground]',
        'Dumbbell Step-Ups onto 20-inch Box (3x10/leg) [Overload: +5 lbs DBs - Rest: 60s - Simulates wall clearing drive]',
        "Farmer's Suitcase Carry (Single Arm) (3x40m/side) [Overload: +5 lbs - Rest: 60s - Resists lateral trunk flexion]",
        'Hanging Knee Tucks / Leg Raises (3x12) [Overload: +1 rep - Rest: 45s - Strict pelvic curl, no swinging]'
      ],
      run: '15-20 Min Tactical Flush Run',
      pace: 'Zone 2 (130-145 BPM) easy flush',
      progressionRule: 'Dummy Drag: 5x50y under 25s each; Box Jumps: +2 inches; Step-Ups: +5 lbs'
    },
    {
      day: 'Day 6',
      focus: '1.5-Mile Academy Test Benchmark & Aerobic Threshold',
      warmup: DIME_WARMUP_TEXT,
      strength: [
        'Post-Run Mandatory Core Bracing (3x15) [Deadbugs, bird-dogs, and side planks for lumbar spine integrity]'
      ],
      run: '1.5-Mile Academy Test Benchmark Run',
      pace: 'Target Pace: 6:45-7:30 min/mile (Sub-10:30 to 11:30 1.5-mile passing standard). 800m cool-down jog.',
      progressionRule: '1.5-Mile Benchmark: Drop 5-10s off total time bi-weekly; Maintain steady continuous split pacing'
    },
    {
      day: 'Day 7',
      focus: 'Full Rest & Systemic Recovery',
      warmup: "None. Rest and recovery.",
      strength: [
        'Complete physiological reset, systemic recovery, hydration, optimal protein fueling and sleep.'
      ],
      run: 'Complete Rest',
      pace: 'N/A',
      progressionRule: 'Rest, 8+ hours sleep, optimal protein & micronutrient intake'
    }
  ]
};

// Add Universal PAT into PROTOCOL_DATA
PROTOCOL_DATA.universal_pat = UNIVERSAL_PAT_PROTOCOL;

/**
 * Returns customized week data for any week 1 through 8 of the Universal PAT Protocol.
 * Dynamically injects progressive 300m pursuit repeats, dummy drag conditioning, and 1.5-mile test milestones.
 */
export function getUniversalPatWeekData(weekNumber: number): ProtocolPhase {
  const week = Math.max(1, Math.min(8, weekNumber));
  const clonedDays = JSON.parse(JSON.stringify(UNIVERSAL_PAT_PROTOCOL.days)) as ProtocolDay[];

  // Dynamic weekly progressions across the 8-week academy preparation cycle
  if (week === 1) {
    clonedDays[1].run = '4 x 300m Track Intervals (Maximal Pursuit Speed)';
    clonedDays[1].pace = 'Target: 52-58 sec per 300m repeat. 2.5-3 min full walking recovery between rounds.';
    clonedDays[1].progressionRule = 'Week 1 Benchmark: Establish baseline 300m pursuit turnover.';
    clonedDays[5].run = '1.5-Mile Academy Test Benchmark Run';
    clonedDays[5].pace = 'Target: 6:45-7:30 min/mile (Sub-11:15 academy benchmark). 800m cool-down jog.';
    clonedDays[5].progressionRule = 'Week 1 Diagnostic: Establish baseline 1.5-mile academy readiness time.';
  } else if (week === 2) {
    clonedDays[1].run = '4 x 300m Track Intervals (Lactate Tolerance)';
    clonedDays[1].pace = 'Target: 51-56 sec per 300m repeat. 2.5 min recovery.';
    clonedDays[1].progressionRule = '300m Repeats: Drop 1-2s from Week 1 baseline.';
    clonedDays[5].run = '1.5-Mile Aerobic Threshold Pace Run';
    clonedDays[5].pace = 'Target: 6:40-7:20 min/mile (Negative split last 800m).';
    clonedDays[5].progressionRule = 'Pacing Discipline: Run second half 5-10s faster than first half.';
  } else if (week === 3) {
    clonedDays[1].run = '5 x 300m Track Intervals (Volume Overload)';
    clonedDays[1].pace = 'Target: 50-54 sec per 300m repeat. 2.5 min walking recovery.';
    clonedDays[1].progressionRule = '+1 Repeat added. Maintain sub-54s speed across all 5 intervals.';
    clonedDays[5].run = '1.75-Mile Over-Distance Capacity Run';
    clonedDays[5].pace = 'Target: 6:50-7:15 min/mile. Over-distance aerobic endurance building.';
    clonedDays[5].progressionRule = 'Over-distance: Build aerobic stamina beyond test distance.';
  } else if (week === 4) {
    // Deload & CNS Reset
    clonedDays[1].run = '3 x 300m Technical Strides (Deload Flush)';
    clonedDays[1].pace = 'Smooth 75-80% mechanics. 3 min full recovery. Restore CNS.';
    clonedDays[1].progressionRule = 'Deload: Focus on sprint mechanics, posture, and arm drive.';
    clonedDays[5].run = '1.25-Mile Light Flush Jog (Deload)';
    clonedDays[5].pace = 'Conversational Zone 2 pace (125-135 BPM). Joint & nervous system recovery.';
    clonedDays[5].progressionRule = 'Deload Flush: Complete tissue restoration before Phase 2 intensity.';
  } else if (week === 5) {
    clonedDays[1].run = '5 x 300m Track Intervals (Max Pursuit Drive)';
    clonedDays[1].pace = 'Target: 48-52 sec per 300m repeat. 2 min walking recovery.';
    clonedDays[1].progressionRule = 'Speed Surge: Drop interval recovery to 2 mins while holding sub-52s.';
    clonedDays[5].run = '1.5-Mile Speed Endurance Run';
    clonedDays[5].pace = 'Target: 6:35-7:10 min/mile (Sub-11:00 standard). Fast cadence focus.';
    clonedDays[5].progressionRule = 'Target: Break the 11:00 barrier for 1.5 miles.';
  } else if (week === 6) {
    clonedDays[1].run = '6 x 300m Track Intervals (Peak Anaerobic Output)';
    clonedDays[1].pace = 'Target: 47-50 sec per 300m repeat. 2 min recovery.';
    clonedDays[1].progressionRule = 'Max Repeat Volume: 6 high-intensity reps under 50s.';
    clonedDays[5].run = '1.5-Mile Academy Passing Threshold Push';
    clonedDays[5].pace = 'Target: 6:30-7:00 min/mile (Sub-10:45 pace standard).';
    clonedDays[5].progressionRule = 'Passing Standard: Target sub-10:45 state POST distinction mark.';
  } else if (week === 7) {
    clonedDays[1].run = '4 x 300m Race-Simulation Intervals';
    clonedDays[1].pace = 'Target: 46-49 sec per 300m. Exact academy test pacing.';
    clonedDays[1].progressionRule = 'Test Simulation: Rehearse exact start-line cadence and turn mechanics.';
    clonedDays[5].run = 'Full 1.5-Mile Mock Agility Test Run';
    clonedDays[5].pace = 'Maximal continuous effort. Goal: Official POST qualifying time.';
    clonedDays[5].progressionRule = 'Mock Test: Official simulation of physical agility test standards.';
  } else {
    // Week 8: Peak & Official Assessment
    clonedDays[1].run = '3 x 300m High-Speed Openers (Taper)';
    clonedDays[1].pace = 'Target: 45-48s. Explosive turnover with 4 min full recovery.';
    clonedDays[1].progressionRule = 'Taper Openers: Prime nervous system without accumulating fatigue.';
    clonedDays[5].run = 'OFFICIAL 1.5-MILE PAT BENCHMARK ASSESSMENT';
    clonedDays[5].pace = 'Maximum competitive effort. Sub-10:30 academy distinction standard.';
    clonedDays[5].progressionRule = 'Official PAT: Record best passing score for academy admission.';
  }

  const isDeload = week === 4;
  const isPeak = week === 8;

  return {
    ...UNIVERSAL_PAT_PROTOCOL,
    id: `universal_pat_week_${week}`,
    title: `Universal PAT Protocol — Week ${week}${isDeload ? ' (DELOAD)' : isPeak ? ' (PEAK ASSESSMENT)' : ''}`,
    weeks: `Week ${week} of 8`,
    days: clonedDays
  };
}



