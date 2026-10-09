import { QuestionnaireAnswers, ProgramKey, AthleteProfile } from '../types';

export interface AbilityBenchmarkOption<T> {
  id: T;
  label: string;
  sublabel: string;
  score: number;
}

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
    label: 'The 26-Week Peak Tactical Transformation',
    badge: 'Comprehensive 5-Mesocycle Engine',
    description: 'Long-term elite periodization taking you from foundational hypertrophy through peak speed, heavy triple strength, and tactical conditioning.',
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
    id: 'station_db_minimal' as const,
    label: 'Dumbbell & Precinct Bodyweight Mastery',
    badge: 'Minimal Gear • Maximum Intensity',
    description: 'Zero barbells required. Full progression using progressive dumbbell volume, push-up densities, and interval conditioning.',
    preferredProgram: 'hybrid_db' as ProgramKey,
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

  // 2. Hardware / Equipment constraint takes absolute priority
  if (answers.equipmentAccess === 'bodyweight_dumbbells' || answers.primaryGoalCategory === 'station_db_minimal') {
    return {
      programKey: 'hybrid_db',
      programTitle: 'Hybrid DB & Bodyweight Protocol',
      badge: 'Dumbbell & Calisthenics Engine',
      durationText: '12-Week Master Protocol (3 Phases)',
      weeklySplit: '3-4 Days Resistance + 2 Days Conditioning',
      fitnessTier,
      startingWeek: 1,
      startingPhaseTitle: 'Phase 1: DB Foundation & Work Capacity',
      primaryRationale:
        'Matched to your equipment setup and current volume capacity. This protocol maximizes progressive dumbbell loads, push-up density, and structured running without requiring a barbell or commercial gym rack.',
      keyActionPoints: [
        'Utilize floor presses, goblet squats, and dumbbell rows with linear load increments.',
        'Track push-up total volume (+1 rep per workout progression).',
        'Build steady Zone 2 conversational running base alongside interval conditioning.',
      ],
      equipmentNotice: 'No barbell required — optimized for station gyms or home workout spaces.',
    };
  }

  // 3. Goal & Schedule matching
  if (answers.primaryGoalCategory === 'muscle_armor_hypertrophy' || (answers.weeklyDays === 4 && answers.primaryGoalCategory !== 'complete_apex_peak')) {
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
        'Dedicated foot pursuit intervals and 1.5-mile conditioning sessions on Tuesdays and Saturdays.',
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

  // Default to The Apex Protocol (comprehensive 26-week tactical blueprint)
  const startingWeek = fitnessTier === 'Recruit Foundation' ? 1 : 1;
  const startingPhase = 'Phase 1: Base & Hypertrophy (Weeks 1-4)';

  return {
    programKey: 'apex_protocol',
    programTitle: 'The Apex Protocol (26-Week Tactical Blueprint)',
    badge: 'Frontline Law Enforcement Peak System',
    durationText: '26-Week Multi-Mesocycle Protocol',
    weeklySplit: '4-5 Days Tactical Strength + Duty Conditioning & Agility',
    fitnessTier,
    startingWeek,
    startingPhaseTitle: startingPhase,
    primaryRationale:
      'The premier law enforcement tactical fitness protocol. Designed to systematically build a resilient combat chassis, eliminate weak points, and peak your physical speed and durability across 5 dedicated mesocycles.',
    keyActionPoints: [
      'Mesocycle 1 builds thick connective tissue armor and foundational work capacity.',
      'Progresses seamlessly through Heavy Strength, Threshold Power, and Frontline Agility.',
      'Includes auto-overload rules (+2.5 to +10 lbs) dynamically tailored to your logged performance.',
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
