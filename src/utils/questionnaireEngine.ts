import { QuestionnaireAnswers, ProgramKey, AthleteProfile } from '../types';

export interface AbilityBenchmarkOption<T> {
  id: T;
  label: string;
  sublabel: string;
  score: number;
}

export const PAT_PREPARATION_OPTIONS = [
  {
    id: 'yes_upcoming_pat' as const,
    label: 'YES — Preparing for Academy / State POST Physical Agility Test (PAT)',
    badge: 'Triggers Universal PAT Protocol',
    description: 'Directly triggers and enrolls you in the Universal Law Enforcement PAT Protocol (1.5-mile run, 300m sprint, push-ups, dummy drag, obstacle agility).',
  },
  {
    id: 'no_general_tactical' as const,
    label: 'NO — General Tactical Duty Fitness, Strength Armor & Hypertrophy',
    badge: 'Comprehensive Tactical Track',
    description: 'Customized based on your lifting experience, equipment access, and primary operational fitness goals.',
  },
];

export const PUSH_UP_OPTIONS: AbilityBenchmarkOption<QuestionnaireAnswers['pushUpScore']>[] = [
  {
    id: 'under_15',
    label: 'Under 15 Reps',
    sublabel: 'Building foundational pushing mechanics and joint stability',
    score: 1,
  },
  {
    id: '15_to_30',
    label: '15 – 30 Reps',
    sublabel: 'Solid base; working toward patrol operational standards',
    score: 2,
  },
  {
    id: '30_to_50',
    label: '30 – 50 Reps',
    sublabel: 'Meets and exceeds most state POST physical agility benchmarks',
    score: 3,
  },
  {
    id: 'over_50',
    label: '50+ Reps Unbroken',
    sublabel: 'High-density tactical stamina and anaerobic chest endurance',
    score: 4,
  },
];

export const PULL_UP_OPTIONS: AbilityBenchmarkOption<QuestionnaireAnswers['pullUpScore']>[] = [
  {
    id: 'zero',
    label: '0 Strict Reps',
    sublabel: 'Requires eccentric hangs, lat pull-downs, and inverted rows',
    score: 1,
  },
  {
    id: '1_to_5',
    label: '1 – 5 Strict Reps',
    sublabel: 'Developing relative bodyweight strength and scapular retraction',
    score: 2,
  },
  {
    id: '6_to_12',
    label: '6 – 12 Strict Reps',
    sublabel: 'Strong tactical pulling strength for wall-clearing and grappling',
    score: 3,
  },
  {
    id: 'over_12',
    label: '12+ Strict Reps',
    sublabel: 'Elite combat chassis power; ready for weighted pull-up progressions',
    score: 4,
  },
];

export const AEROBIC_OPTIONS: AbilityBenchmarkOption<QuestionnaireAnswers['aerobicScore']>[] = [
  {
    id: 'under_1_mile',
    label: 'Cannot run 1 continuous mile',
    sublabel: 'Aerobic base building needed; walk/jog and Zone 2 heart rate protocols',
    score: 1,
  },
  {
    id: '13_to_16_min',
    label: '1.5 Miles in 13:00 – 16:00',
    sublabel: 'Entry academy passing range; needs threshold expansion',
    score: 2,
  },
  {
    id: '10_30_to_13_min',
    label: '1.5 Miles in 10:30 – 13:00',
    sublabel: 'Capable frontline pursuit pace and sustainable aerobic threshold',
    score: 3,
  },
  {
    id: 'sub_10_30',
    label: '1.5 Miles Sub-10:30 (Elite)',
    sublabel: 'Rapid pursuit stamina, superior VO2 max and rapid recovery between calls',
    score: 4,
  },
];

export const EQUIPMENT_OPTIONS = [
  {
    id: 'bodyweight_dumbbells' as const,
    label: 'Dumbbells & Calisthenics Only',
    sublabel: 'Home gym, substation floor, or minimal equipment (dumbbells, bench, pull-up bar)',
  },
  {
    id: 'full_tactical_gym' as const,
    label: 'Full Commercial / Tactical Gym',
    sublabel: 'Olympic barbells, squat racks, trap bars, dumbbells, turf, and cardio equipment',
  },
  {
    id: 'basic_station_gym' as const,
    label: 'Basic Station / Precinct Gym',
    sublabel: 'Moderate dumbbells, cable stack, pull-up bar, and standard treadmill',
  },
];

export const EXPERIENCE_OPTIONS = [
  {
    id: 'beginner' as const,
    label: 'Beginner (< 6 months)',
    sublabel: 'New to progressive overload and periodized structured lifting',
  },
  {
    id: 'intermediate' as const,
    label: 'Intermediate (6 mos – 2 yrs)',
    sublabel: 'Familiar with core compound lifts (squat, bench, deadlift, overhead press)',
  },
  {
    id: 'advanced_tactical' as const,
    label: 'Advanced / Tactical Veteran (2+ yrs)',
    sublabel: 'Consistent training history; seeking peak physical conditioning and load density',
  },
];

export const GOAL_OPTIONS = [
  {
    id: 'tactical_duty_readiness' as const,
    label: 'Frontline Duty Readiness & Agility',
    badge: 'LEO Agility & Sprint Pursuit',
    description: 'Specialized for officers needing high-speed foot pursuit sprints, combat chassis armor, and fatigue resistance during heavy shift demands.',
    preferredProgram: 'apex_protocol' as ProgramKey,
  },
  {
    id: 'muscle_armor_hypertrophy' as const,
    label: 'Tactical Hypertrophy & Muscle Armor',
    badge: 'Upper Body Density & Armor',
    description: 'Focused on building dense muscle mass, upper body strength, and joint resiliency to withstand defensive tactics and physical encounters.',
    preferredProgram: 'tactical_hypertrophy' as ProgramKey,
  },
  {
    id: 'complete_apex_peak' as const,
    label: 'The 52-Week Law Enforcement Fitness & Readiness Program',
    badge: 'Comprehensive 4-Quarter Annual Engine',
    description: 'Year-round tactical periodization taking you from Aerobic Base & Core Stability through Grappling Strength, Limit Strength & Pursuit Speed, and Use-of-Force Readiness.',
    preferredProgram: 'apex_protocol' as ProgramKey,
  },
  {
    id: 'hybrid_strength_running' as const,
    label: 'Hybrid Barbell Strength & Running Engine',
    badge: 'Strength + 5K/10K Expansion',
    description: 'Classic dual-engine athletic development: build maximum barbell squat/bench/deadlift power while progressing running mileage and VO2 max.',
    preferredProgram: 'hybrid_protocol' as ProgramKey,
  },
  {
    id: 'universal_pat_testing' as const,
    label: 'Academy & State POST Physical Agility Test (PAT)',
    badge: 'State POST & PAT Passing Standard',
    description: 'Direct preparation for police recruit physical agility tests, 1.5-mile Cooper standard, unbroken push-ups, 300m sprint, and 165 lb dummy drag.',
    preferredProgram: 'universal_pat' as ProgramKey,
  },
  {
    id: 'station_db_minimal' as const,
    label: 'Dumbbell & Bodyweight Hybrid Adaptation',
    badge: 'Minimal Gear • AI Adapted Hybrid',
    description: 'Uses the 12-Week Hybrid Protocol automatically adapted by the AI Adaptation Engine for dumbbells, bodyweight calisthenics, and running.',
    preferredProgram: 'hybrid_protocol' as ProgramKey,
  },
  {
    id: 'custom_ai_individualized' as const,
    label: 'Custom Individualized Protocol (AI Program Adapter)',
    badge: '100% Bespoke • AI Tailored',
    description: 'Have our AI Adaptation Engine tailor any master training protocol to your exact shift hours, equipment access, and specific joint/injury constraints.',
    preferredProgram: 'custom_ai' as ProgramKey,
  },
];

export interface RecommendationResult {
  programKey: ProgramKey;
  programTitle: string;
  badge: string;
  durationText: string;
  weeklySplit: string;
  fitnessTier: 'Recruit Foundation' | 'Operational LEO' | 'Tactical Elite';
  startingWeek: number;
  startingPhaseTitle: string;
  primaryRationale: string;
  keyActionPoints: string[];
  equipmentNotice?: string;
}

/**
 * Calculates athlete fitness tier and determines the exact recommended program
 * matching their physical ability, equipment constraints, and primary goals.
 */
export function calculateProgramRecommendation(
  answers: Omit<QuestionnaireAnswers, 'completedAt' | 'recommendedProgramKey' | 'recommendedProgramTitle' | 'recommendationReason' | 'recommendedStartingWeek' | 'fitnessTier'>
): RecommendationResult {
  // 1. Calculate fitness score from benchmarks (1-4 each, total 3-12)
  const pushScore = PUSH_UP_OPTIONS.find((o) => o.id === answers.pushUpScore)?.score || 2;
  const pullScore = PULL_UP_OPTIONS.find((o) => o.id === answers.pullUpScore)?.score || 2;
  const runScore = AEROBIC_OPTIONS.find((o) => o.id === answers.aerobicScore)?.score || 2;
  const totalScore = pushScore + pullScore + runScore;

  let fitnessTier: 'Recruit Foundation' | 'Operational LEO' | 'Tactical Elite';
  if (totalScore <= 5 || answers.liftingExperience === 'beginner') {
    fitnessTier = 'Recruit Foundation';
  } else if (totalScore <= 9) {
    fitnessTier = 'Operational LEO';
  } else {
    fitnessTier = 'Tactical Elite';
  }

  // 2. Individualized AI Programming Option takes top precedence if explicitly requested
  if (answers.primaryGoalCategory === 'custom_ai_individualized') {
    return {
      programKey: 'custom_ai',
      programTitle: 'Individualized AI Tactical Protocol',
      badge: 'AI Architect Bespoke System',
      durationText: 'Bespoke Custom AI Schedule',
      weeklySplit: `${answers.weeklyDays} Days Custom Tailored Split`,
      fitnessTier,
      startingWeek: 1,
      startingPhaseTitle: 'Bespoke Phase: Personalized Progression',
      primaryRationale:
        'Matched to your preference for 100% individualized tactical programming. Our AI Workout Architect will generate a bespoke schedule taking your baseline capacity, shift rotation, and injury constraints directly into account.',
      keyActionPoints: [
        'Custom exercise selections built around your joint limitations.',
        'Linear progression pacing calibrated to your weekly shift hours.',
        'Dynamic duty conditioning matched to your operational demands.',
      ],
      equipmentNotice: answers.equipmentAccess === 'bodyweight_dumbbells'
        ? 'Engineered exclusively for dumbbells and bodyweight calisthenics.'
        : 'Engineered for your full tactical gym access.',
    };
  }

  // 3. Direct PAT Question Trigger takes priority: If athlete is preparing for an upcoming PAT
  if (answers.preparingForPat === 'yes_upcoming_pat' || answers.primaryGoalCategory === 'universal_pat_testing') {
    return {
      programKey: 'universal_pat',
      programTitle: 'Universal Law Enforcement Physical Agility Test (PAT) Protocol',
      badge: 'State POST & PAT Passing Standard',
      durationText: '8-Week High-Stakes Agility & Speed Prep',
      weeklySplit: '5 Days Lift & Obstacle Agility + 1-2 Days 1.5-Mi & 300m Sprint',
      fitnessTier,
      startingWeek: 1,
      startingPhaseTitle: 'Weeks 1-8: Foundational Agility & Benchmark Capacity',
      primaryRationale:
        'Selected directly by your answer: actively preparing for an upcoming Physical Agility Test. Engineered specifically to ace state POST and academy Physical Agility Tests: 1.5-mile run, 300-meter sprint, continuous cadence push-ups, 1-minute timed sit-ups, and 165 lb dummy drag.',
      keyActionPoints: [
        'Cadence metronome push-ups build unbreakable chest and shoulder stamina under fatigue.',
        'Weekly 300m anaerobic sprint intervals build high-intensity lactate threshold.',
        'Heavy dummy drags, sled pulls, and farmer carries guarantee maximum grip and posterior obstacle drive.',
      ],
      equipmentNotice: 'Barbell, trap bar, pull-up bar, and running track recommended.',
    };
  }

  // 4. Hardware / Equipment constraint -> Route to 12-Week Hybrid Protocol (which covers DB & Bodyweight via AI Adaptation Engine)
  if (answers.equipmentAccess === 'bodyweight_dumbbells' || answers.primaryGoalCategory === 'station_db_minimal') {
    return {
      programKey: 'hybrid_protocol',
      programTitle: 'Patrol Ready 12-Week Hybrid Protocol (AI DB & Bodyweight Ready)',
      badge: '12-Week Hybrid • AI DB/BW Adapted',
      durationText: '12-Week Master Protocol (3 Phases)',
      weeklySplit: '3-4 Days Resistance + 2 Days Conditioning',
      fitnessTier,
      startingWeek: 1,
      startingPhaseTitle: 'Phase 1: Foundation (Use AI Adapter for DB & Bodyweight Gear)',
      primaryRationale:
        'Matched to your equipment setup. The 12-Week Hybrid Protocol covers full Dumbbell & Bodyweight training seamlessly—tap "Adapt This Program" to swap all barbell movements for Dumbbell & Calisthenics equivalents while preserving the 3-phase progression.',
      keyActionPoints: [
        'Tap "Adapt Program" to automatically swap barbell lifts for goblet squats, DB floor presses, and DB rows.',
        'Starts at the low end of prescribed set and rep ranges and progresses dynamically from your logged sets.',
        'Includes the Mandatory 10-Minute DIME Warm-Up before every session.',
      ],
      equipmentNotice: 'Click "Adapt This Program" with Dumbbells & Bodyweight selected for instant 1-for-1 equipment conversion.',
    };
  }

  // 4. Goal & Schedule matching
  if (answers.primaryGoalCategory === 'muscle_armor_hypertrophy') {
    const startWeek = fitnessTier === 'Recruit Foundation' ? 1 : 1;
    return {
      programKey: 'tactical_hypertrophy',
      programTitle: 'Tactical Hypertrophy & Conditioning',
      badge: '6-Week Rapid Armor Cycle',
      durationText: '6-Week Tactical Mesocycle',
      weeklySplit: '4 Days Upper/Lower Lift + 2 Days Duty Conditioning',
      fitnessTier,
      startingWeek: startWeek,
      startingPhaseTitle: `Week ${startWeek}: Upper/Lower Base Armor`,
      primaryRationale:
        'Selected for your goal to forge dense muscle armor and tactical upper-body strength. The 4-day Upper/Lower frequency provides the optimal balance of high-volume hypertrophy and frontline recovery.',
      keyActionPoints: [
        'Upper/Lower split allows maximal CNS recovery between duty shifts.',
        'Double progression on trap bar deadlifts, barbell bench, and strict pull-ups.',
        'Dedicated foot pursuit intervals and 1.5-mile conditioning sessions on Day 2 and Day 6.',
      ],
    };
  }

  if (answers.primaryGoalCategory === 'hybrid_strength_running') {
    return {
      programKey: 'hybrid_protocol',
      programTitle: 'Hybrid Protocol Master',
      badge: 'Barbell Strength & Running Engine',
      durationText: '12-Week Master (3 Progressive Phases)',
      weeklySplit: '4 Days Barbell Strength + 2-3 Days Aerobic Run',
      fitnessTier,
      startingWeek: 1,
      startingPhaseTitle: 'Phase 1: Foundation (Aerobic Base & Volume)',
      primaryRationale:
        'Ideal for athletes seeking equal mastery of heavy barbell strength and sustained running performance. Follows structured linear progression for squat/bench/deadlift paired with progressive weekly mileage expansion.',
      keyActionPoints: [
        'Build raw barbell power with heavy compound sets.',
        'Zone 2 conversational base running develops high cardiac stroke volume.',
        'Threshold runs expand your sustained top speed and stamina under fatigue.',
      ],
    };
  }

  // Default to Law Enforcement 52-Week Fitness & Readiness Program
  const startingWeek = 1;
  const startingPhase = 'Quarter 1: Aerobic Base, Posture & Core Stability (Weeks 1–13)';

  return {
    programKey: 'apex_protocol',
    programTitle: 'Law Enforcement 52-Week Fitness & Readiness Program',
    badge: '52-Week Frontline Law Enforcement System',
    durationText: '52-Week 4-Quarter Periodized Protocol',
    weeklySplit: '5-6 Days Tactical Strength, Running Stamina & Duty Readiness',
    fitnessTier,
    startingWeek,
    startingPhaseTitle: startingPhase,
    primaryRationale:
      'The complete 52-week law enforcement fitness and readiness blueprint. Engineered across 4 progressive 13-week quarters to build your aerobic base, grappling strength, pursuit speed, and use-of-force stamina with every-4th-week 40% deloads.',
    keyActionPoints: [
      'Mandatory 10-Minute DIME Warm-Up before every session to protect hips, knees, shoulders, and lower back.',
      'Starts at the low end of prescribed set and rep ranges (1. Reps First -> 2. Weight Second -> 3. Sets Third).',
      'Intra-session Set 1 auto-pacing automatically recommends weights for all subsequent sets to maintain target effort.',
    ],
  };
}

/**
 * Returns user-friendly summary of the questionnaire results
 */
export function formatQuestionnaireSummary(answers: QuestionnaireAnswers): string {
  const pushLabel = PUSH_UP_OPTIONS.find((o) => o.id === answers.pushUpScore)?.label || answers.pushUpScore;
  const pullLabel = PULL_UP_OPTIONS.find((o) => o.id === answers.pullUpScore)?.label || answers.pullUpScore;
  const runLabel = AEROBIC_OPTIONS.find((o) => o.id === answers.aerobicScore)?.label || answers.aerobicScore;

  return `Push-ups: ${pushLabel} • Pull-ups: ${pullLabel} • Run: ${runLabel} • Tier: ${answers.fitnessTier}`;
}
