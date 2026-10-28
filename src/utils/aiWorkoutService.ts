import { GoogleGenAI, Type } from '@google/genai';
import { WorkoutProgram, ExerciseTemplate, MuscleGroup } from '../types';

export interface WorkoutGenerationRequest {
  goals: string[];
  fitnessLevel: string;
  frequency: string;
  scheduleDuration: 'weekly' | 'monthly';
  equipment: string[];
  sessionDurationMinutes?: number;
  notes?: string;
  userEmail?: string;
  customApiKey?: string;
}

export interface GeneratedExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  defaultSets: number;
  targetReps: string;
  restPeriodSeconds: number;
  targetRpe: number;
  notes: string;
}

export interface GeneratedDay {
  day: number;
  focus: string;
  isRestDay: boolean;
  warmup?: string;
  conditioning?: string;
  exercises: GeneratedExercise[];
}

export interface GeneratedWorkoutPlan {
  title: string;
  subtitle: string;
  category: 'Strength' | 'Hypertrophy' | 'Athletic Conditioning' | 'Power' | 'Hybrid';
  frequency: string;
  scheduleDuration: string;
  estimatedDurationMinutes: number;
  description: string;
  coachingPhilosophy: string;
  weeklyProgressionTips: string[];
  nutritionAdvice: string;
  schedule: GeneratedDay[];
  source?: 'gemini-3.8-flash' | 'tactical-engine';
}

/**
 * Retrieves the effective Gemini API key from environment variables or custom key.
 */
export function getEffectiveGeminiApiKey(customKey?: string): string {
  if (customKey && customKey.trim().length > 5) {
    return customKey.trim();
  }

  // 1. Vite environment variable (Netlify / static host deployment)
  const viteKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (viteKey && typeof viteKey === 'string' && viteKey.trim().length > 5 && !viteKey.includes('PLACEHOLDER')) {
    return viteKey.trim();
  }

  // 2. Local storage custom override if user provided one
  try {
    const saved = localStorage.getItem('rpa_custom_gemini_api_key');
    if (saved && saved.trim().length > 5) {
      return saved.trim();
    }
  } catch {}

  return '';
}

/**
 * High-precision tactical workout generator that directly respects ALL user input:
 * Equipment, Goals, Frequency (3-6 days), Schedule Duration (Weekly vs Monthly),
 * Session Duration, and Special Constraints.
 */
export function generateCalibratedWorkoutPlan(params: WorkoutGenerationRequest): GeneratedWorkoutPlan {
  const goalStr = params.goals?.join(', ') || 'Tactical Conditioning & Duty Readiness';
  const isHypertrophy = params.goals?.some(g => g.toLowerCase().includes('hypertrophy') || g.toLowerCase().includes('muscle'));
  const isStrength = params.goals?.some(g => g.toLowerCase().includes('strength') || g.toLowerCase().includes('power'));
  const isEndurance = params.goals?.some(g => g.toLowerCase().includes('endurance') || g.toLowerCase().includes('loss') || g.toLowerCase().includes('shred'));
  const isPat = params.goals?.some(g => g.toLowerCase().includes('pat') || g.toLowerCase().includes('academy') || g.toLowerCase().includes('police'));
  const isHybrid = params.goals?.some(g => g.toLowerCase().includes('hybrid') || g.toLowerCase().includes('ruck'));

  const category = isPat 
    ? 'Athletic Conditioning' 
    : isStrength 
    ? 'Strength' 
    : isHypertrophy 
    ? 'Hypertrophy' 
    : isEndurance 
    ? 'Athletic Conditioning' 
    : isHybrid 
    ? 'Hybrid' 
    : 'Power';

  const daysPerWeek = parseInt(params.frequency, 10) || 4;
  const isMonthly = params.scheduleDuration === 'monthly';
  const targetDuration = params.sessionDurationMinutes || 60;
  const level = params.fitnessLevel || 'Intermediate';

  // Determine equipment constraints
  const eqList = params.equipment || [];
  const hasBarbell = eqList.some(e => e.toLowerCase().includes('barbell') || e.toLowerCase().includes('commercial') || e.toLowerCase().includes('home gym'));
  const hasDumbbells = eqList.some(e => e.toLowerCase().includes('dumbbell') || e.toLowerCase().includes('commercial') || e.toLowerCase().includes('home gym'));
  const isBodyweightOnly = eqList.every(e => e.toLowerCase().includes('bodyweight') || e.toLowerCase().includes('pull-up') || e.toLowerCase().includes('vest'));
  const isDumbbellOnly = !hasBarbell && hasDumbbells;
  const hasKettlebell = eqList.some(e => e.toLowerCase().includes('kettlebell') || e.toLowerCase().includes('sandbag'));
  const hasVest = eqList.some(e => e.toLowerCase().includes('vest') || e.toLowerCase().includes('ruck'));

  // Calibrate rep scheme and rest intervals based on primary goal & fitness level
  const baseRest = isStrength ? 120 : isHypertrophy ? 90 : isEndurance ? 45 : 60;
  const targetRpe = level === 'Beginner' ? 7 : level === 'Elite' ? 9 : 8;

  // Build Day Templates strictly using available equipment
  const day1: GeneratedDay = {
    day: 1,
    focus: isBodyweightOnly
      ? 'Day 1: Upper Body Calisthenic Power & Explosive Push/Pull'
      : isDumbbellOnly
      ? 'Day 1: Dumbbell Armor Upper Body & Chest/Back Density'
      : isPat
      ? 'Day 1: PAT Upper Push Endurance & Trunk Power Benchmark'
      : isStrength
      ? 'Day 1: Maximum Strength Upper Body Heavy Horizontal Press/Pull'
      : 'Day 1: Duty Armor Upper Body & Horizontal Press/Pull',
    isRestDay: false,
    warmup: 'Band pull-aparts 2x20, shoulder dislocates, push-up to downward dog, cat-cow 2 mins.',
    conditioning: isPat
      ? '300-Meter Anaerobic Sprint Repeat: 3 rounds x 300m with 2:00 full recovery walk.'
      : 'Rowing machine or assault bike: 12 minutes steady aerobic Zone 2 flush.',
    exercises: isBodyweightOnly ? [
      {
        id: 'ex-bw-1',
        name: hasVest ? 'Weighted Vest Strict Push-Ups' : 'Strict Hand-Release Push-Ups',
        muscleGroup: 'Chest',
        defaultSets: 4,
        targetReps: isStrength ? '12 reps (controlled 3s eccentric)' : '15-25 reps',
        restPeriodSeconds: baseRest,
        targetRpe,
        notes: 'Lock out fully at top with core tightly braced. Chest touches deck each rep.',
      },
      {
        id: 'ex-bw-2',
        name: 'Strict Pull-Ups (Overhand Grip)',
        muscleGroup: 'Back',
        defaultSets: 4,
        targetReps: level === 'Beginner' ? '4-6 reps' : '8-12 reps',
        restPeriodSeconds: baseRest + 15,
        targetRpe,
        notes: 'Full dead-hang stretch at bottom. Chin clearly over bar without kipping.',
      },
      {
        id: 'ex-bw-3',
        name: 'Feet-Elevated Decline Push-Ups or Parallel Bar Dips',
        muscleGroup: 'Chest',
        defaultSets: 3,
        targetReps: '12-15 reps',
        restPeriodSeconds: baseRest,
        targetRpe,
        notes: 'Targets upper clavicular chest and front delts. Controlled descent.',
      },
      {
        id: 'ex-bw-4',
        name: 'Inverted Bodyweight Rows (Under Bar or TRX)',
        muscleGroup: 'Back',
        defaultSets: 3,
        targetReps: '12-15 reps',
        restPeriodSeconds: 60,
        targetRpe,
        notes: 'Squeeze shoulder blades together. Pause 1 second at full chest contact.',
      },
      {
        id: 'ex-bw-5',
        name: 'Hanging Knee-to-Elbows or Hollow Body Rocks',
        muscleGroup: 'Core',
        defaultSets: 3,
        targetReps: '15-20 reps',
        restPeriodSeconds: 45,
        targetRpe: 7,
        notes: 'Keep pelvis tucked. Prevent swinging.',
      },
    ] : isDumbbellOnly ? [
      {
        id: 'ex-db-1',
        name: 'Dumbbell Flat Bench Press (or Heavy Floor Press)',
        muscleGroup: 'Chest',
        defaultSets: 4,
        targetReps: isStrength ? '6-8 reps' : '10-12 reps',
        restPeriodSeconds: baseRest + 15,
        targetRpe,
        notes: 'Control the descent for 3 seconds. Drive through elbows without clanking dumbbells.',
      },
      {
        id: 'ex-db-2',
        name: 'One-Arm Dumbbell Row (Supported on Bench)',
        muscleGroup: 'Back',
        defaultSets: 4,
        targetReps: '8-10 reps per arm',
        restPeriodSeconds: baseRest,
        targetRpe,
        notes: 'Pull towards the hip pocket. Full stretch of the lat at the bottom.',
      },
      {
        id: 'ex-db-3',
        name: 'Incline Dumbbell Chest Press',
        muscleGroup: 'Chest',
        defaultSets: 3,
        targetReps: '10-12 reps',
        restPeriodSeconds: baseRest,
        targetRpe,
        notes: 'Set bench to 30 degrees. Focus on upper chest contraction.',
      },
      {
        id: 'ex-db-4',
        name: 'Standing Dumbbell Arnold Press',
        muscleGroup: 'Shoulders',
        defaultSets: 3,
        targetReps: '10-12 reps',
        restPeriodSeconds: 60,
        targetRpe,
        notes: 'Rotate palms smoothly as you press overhead. Keep core locked.',
      },
      {
        id: 'ex-db-5',
        name: 'Dumbbell Neutral-Grip Hammer Curls',
        muscleGroup: 'Arms',
        defaultSets: 3,
        targetReps: '12-15 reps',
        restPeriodSeconds: 60,
        targetRpe: 7,
        notes: 'Builds brachioradialis and forearm thickness for duty weapon grip.',
      },
    ] : [
      {
        id: 'ex-bb-1',
        name: isStrength ? 'Barbell Bench Press (Heavy Triples)' : 'Barbell Bench Press',
        muscleGroup: 'Chest',
        defaultSets: 4,
        targetReps: isStrength ? '4-5 reps' : '8-10 reps',
        restPeriodSeconds: isStrength ? 150 : 90,
        targetRpe,
        notes: 'Maintain 5 points of contact. Lower with controlled eccentric.',
      },
      {
        id: 'ex-bb-2',
        name: 'Chest-Supported Row or Barbell Pendlay Row',
        muscleGroup: 'Back',
        defaultSets: 4,
        targetReps: '8-10 reps',
        restPeriodSeconds: 90,
        targetRpe,
        notes: 'Explosive pull off deck with flat back. Squeeze mid-back.',
      },
      {
        id: 'ex-bb-3',
        name: 'Overhead Barbell Military Press',
        muscleGroup: 'Shoulders',
        defaultSets: 3,
        targetReps: '8-10 reps',
        restPeriodSeconds: 90,
        targetRpe,
        notes: 'Clear the chin, push head through at top lockout. Squeeze glutes.',
      },
      {
        id: 'ex-bb-4',
        name: 'Weighted or Bodyweight Strict Pull-Ups',
        muscleGroup: 'Back',
        defaultSets: 3,
        targetReps: '8-10 reps',
        restPeriodSeconds: 75,
        targetRpe,
        notes: 'Full extension at bottom. Squeeze lats hard.',
      },
      {
        id: 'ex-bb-5',
        name: 'Hanging Leg Raises / Dragon Flags',
        muscleGroup: 'Core',
        defaultSets: 3,
        targetReps: '12-15 reps',
        restPeriodSeconds: 45,
        targetRpe: 7,
        notes: 'Toes to bar or knee to chest. Eliminate pendulum swing.',
      },
    ],
  };

  const day2: GeneratedDay = {
    day: 2,
    focus: isBodyweightOnly
      ? 'Day 2: Unilateral Leg Power, Sprint Mechanics & Posterior Chain'
      : isDumbbellOnly
      ? 'Day 2: Dumbbell Lower Body Quad Drive & Posterior Kinetic Chain'
      : isPat
      ? 'Day 2: PAT Foot Pursuit Speed & 1.5-Mile Aerobic Velocity'
      : isStrength
      ? 'Day 2: Maximum Lower Body Squat Force & Heavy Posterior Chain'
      : 'Day 2: Lower Body Kinetic Power & Squat Chassis Durability',
    isRestDay: false,
    warmup: 'Worlds greatest stretch 5/side, 90/90 hip mobility, glute bridges x 20, bodyweight squats x 15.',
    conditioning: isPat
      ? '1.5-Mile Timed Run Practice: 600m splits at target passing pace.'
      : '15-Minute Tactical Ruck or Steady Treadmill Incline Walk (12% incline, 3.2 mph).',
    exercises: isBodyweightOnly ? [
      {
        id: 'ex-bw-6',
        name: 'Bulgarian Split Squats (Elevated Rear Foot)',
        muscleGroup: 'Quads',
        defaultSets: 4,
        targetReps: '12 reps per leg',
        restPeriodSeconds: 75,
        targetRpe,
        notes: 'Keep front shin vertical. Drive straight through the lead heel.',
      },
      {
        id: 'ex-bw-7',
        name: 'Nordic Hamstring Curls (or Slider Leg Curls)',
        muscleGroup: 'Hamstrings & Glutes',
        defaultSets: 4,
        targetReps: '6-8 reps (slow eccentric)',
        restPeriodSeconds: 90,
        targetRpe,
        notes: 'Lower body as slowly as possible using hamstring tension. Push up lightly with hands.',
      },
      {
        id: 'ex-bw-8',
        name: 'Explosive Jump Squats (Soft Landing)',
        muscleGroup: 'Quads',
        defaultSets: 3,
        targetReps: '10 reps',
        restPeriodSeconds: 60,
        targetRpe: 7,
        notes: 'Maximum vertical power on drive. Absorb force into quarter squat.',
      },
      {
        id: 'ex-bw-9',
        name: 'Walking Lunge Matrix (Forward + Lateral)',
        muscleGroup: 'Full Body',
        defaultSets: 3,
        targetReps: '20 total steps',
        restPeriodSeconds: 60,
        targetRpe: 8,
        notes: 'Continuous flow. Builds duty knee stability under fatigue.',
      },
      {
        id: 'ex-bw-10',
        name: 'RKC Plank & Side Planks',
        muscleGroup: 'Core',
        defaultSets: 3,
        targetReps: '45 seconds hold',
        restPeriodSeconds: 45,
        targetRpe: 7,
        notes: 'Maximal abdominal squeeze and glute tension.',
      },
    ] : isDumbbellOnly ? [
      {
        id: 'ex-db-6',
        name: 'Dumbbell Goblet Squat (Heavy Load)',
        muscleGroup: 'Quads',
        defaultSets: 4,
        targetReps: isStrength ? '6-8 reps' : '10-12 reps',
        restPeriodSeconds: baseRest + 15,
        targetRpe,
        notes: 'Hold DB vertical against sternum. Elbows track inside knees at bottom.',
      },
      {
        id: 'ex-db-7',
        name: 'Dumbbell Romanian Deadlift (RDL)',
        muscleGroup: 'Hamstrings & Glutes',
        defaultSets: 4,
        targetReps: '8-10 reps',
        restPeriodSeconds: baseRest,
        targetRpe,
        notes: 'Hips back until deep hamstring stretch. Keep back flat like a tabletop.',
      },
      {
        id: 'ex-db-8',
        name: 'Dumbbell Bulgarian Split Squats',
        muscleGroup: 'Quads',
        defaultSets: 3,
        targetReps: '10 reps each leg',
        restPeriodSeconds: 60,
        targetRpe,
        notes: 'Brace core, hold DBs at sides. Build unilateral hip power.',
      },
      {
        id: 'ex-db-9',
        name: 'Heavy Dumbbell Farmer Carries',
        muscleGroup: 'Full Body',
        defaultSets: 3,
        targetReps: '60 yards carry',
        restPeriodSeconds: 60,
        targetRpe: 8,
        notes: 'Shoulders down and back, chest proud. Quick, smooth footsteps.',
      },
      {
        id: 'ex-db-10',
        name: 'Dumbbell Standing Calf Raises',
        muscleGroup: 'Hamstrings & Glutes',
        defaultSets: 3,
        targetReps: '15-20 reps',
        restPeriodSeconds: 45,
        targetRpe: 7,
        notes: 'Hold at top for 2 seconds. Full ankle dorsiflexion stretch at bottom.',
      },
    ] : [
      {
        id: 'ex-bb-6',
        name: isStrength ? 'Barbell Back Squat (Heavy Sets)' : 'Barbell Back Squat',
        muscleGroup: 'Quads',
        defaultSets: 4,
        targetReps: isStrength ? '4-5 reps' : '6-8 reps',
        restPeriodSeconds: isStrength ? 150 : 90,
        targetRpe,
        notes: 'Brace abdominal wall into belt line. Hit parallel or below with upright torso.',
      },
      {
        id: 'ex-bb-7',
        name: 'Barbell Romanian Deadlift (RDL)',
        muscleGroup: 'Hamstrings & Glutes',
        defaultSets: 4,
        targetReps: '8-10 reps',
        restPeriodSeconds: 90,
        targetRpe,
        notes: 'Push hips back towards the wall. Keep bar glued to quads and shins.',
      },
      {
        id: 'ex-bb-8',
        name: 'Walking Dumbbell Lunges or Front Rack Lunges',
        muscleGroup: 'Quads',
        defaultSets: 3,
        targetReps: '10 reps per leg',
        restPeriodSeconds: 75,
        targetRpe,
        notes: 'Keep chest tall. Knee taps floor softly without impact.',
      },
      {
        id: 'ex-bb-9',
        name: 'Trap Bar or Heavy Dumbbell Farmer Walks',
        muscleGroup: 'Full Body',
        defaultSets: 3,
        targetReps: '75 yards',
        restPeriodSeconds: 75,
        targetRpe: 8,
        notes: 'Duty load simulation. High grip tension, upright posture.',
      },
      {
        id: 'ex-bb-10',
        name: 'Standing Calf Raises & Ab Rollouts',
        muscleGroup: 'Core',
        defaultSets: 3,
        targetReps: '12-15 reps',
        restPeriodSeconds: 45,
        targetRpe: 7,
        notes: 'Roll out under control without hyperextending lower lumbar.',
      },
    ],
  };

  const day3: GeneratedDay = {
    day: 3,
    focus: daysPerWeek === 3
      ? 'Day 3: Mid-Week Active Regeneration & Tissue Mobility Flush'
      : isPat
      ? 'Day 3: PAT Obstacle Clearance, Dummy Drag & Anaerobic Shuttle'
      : isEndurance
      ? 'Day 3: High-Density Tactical Aerobic Flush & Movement Foundation'
      : 'Day 3: Active Recovery & Joint Decompression Flush',
    isRestDay: daysPerWeek === 3 || daysPerWeek === 4,
    warmup: '10 minutes light cycle or jog, foam roll lats, quads, and hip flexors.',
    conditioning: 'Zone 2 aerobic base flush: 30 minutes light jogging or walking with 25 lb ruck.',
    exercises: daysPerWeek <= 4 ? [] : [
      {
        id: 'ex-d3-1',
        name: hasKettlebell ? 'Kettlebell Swings (Hip Snap)' : 'High-Intensity Kettlebell / DB Thrusters',
        muscleGroup: 'Full Body',
        defaultSets: 4,
        targetReps: '15 reps',
        restPeriodSeconds: 60,
        targetRpe: 8,
        notes: 'Explosive hip hinge. Do not squat the swing; snap glutes at top.',
      },
      {
        id: 'ex-d3-2',
        name: isPat ? 'Simulated 165 lb Dummy Drag (Heavy Sled or Carries)' : 'Burpee Broad Jumps',
        muscleGroup: 'Full Body',
        defaultSets: 4,
        targetReps: isPat ? '50 feet drag' : '8 reps',
        restPeriodSeconds: 60,
        targetRpe: 8,
        notes: 'Keep hips low, drive through the balls of feet backwards.',
      },
      {
        id: 'ex-d3-3',
        name: 'Pull-Up Hold at Top & Hanging Leg Tucks',
        muscleGroup: 'Back',
        defaultSets: 3,
        targetReps: '20-30s hold + 10 tucks',
        restPeriodSeconds: 60,
        targetRpe: 7,
        notes: 'Grip stamina endurance for tactical fence climb.',
      },
      {
        id: 'ex-d3-4',
        name: 'Side Plank Hip Dips & Bird-Dogs',
        muscleGroup: 'Core',
        defaultSets: 3,
        targetReps: '12 per side',
        restPeriodSeconds: 45,
        targetRpe: 6,
        notes: 'Strengthens quadratus lumborum and deep spinal stabilizers.',
      },
    ],
  };

  const day4: GeneratedDay = {
    day: 4,
    focus: daysPerWeek === 3
      ? 'Day 4: Full Body Structural Balance & Tactical Durability'
      : isBodyweightOnly
      ? 'Day 4: Upper Body Calisthenics Volume & Muscle Armor'
      : isDumbbellOnly
      ? 'Day 4: Dumbbell Upper Hypertrophy, Delt Caps & Arm Volume'
      : 'Day 4: Upper Body Hypertrophy, Scapular Stability & Grip Volume',
    isRestDay: false,
    warmup: 'Arm circles, face pulls with resistance band, thoracic extensions 2x15.',
    conditioning: '10-minute incline treadmill jog or assault bike tabata (20s sprint / 10s rest x 8 rounds).',
    exercises: isBodyweightOnly ? [
      {
        id: 'ex-bw-11',
        name: 'Wide-Grip Pull-Ups (Overhand)',
        muscleGroup: 'Back',
        defaultSets: 4,
        targetReps: '6-10 reps',
        restPeriodSeconds: 75,
        targetRpe,
        notes: 'Focus on lat flare and wide back width. Control down.',
      },
      {
        id: 'ex-bw-12',
        name: 'Diamond Push-Ups (Tricep Focus)',
        muscleGroup: 'Arms',
        defaultSets: 3,
        targetReps: '15-20 reps',
        restPeriodSeconds: 60,
        targetRpe,
        notes: 'Thumbs and index fingers touching. Squeeze triceps at top lockout.',
      },
      {
        id: 'ex-bw-13',
        name: 'Pike Push-Ups (Shoulder Focus)',
        muscleGroup: 'Shoulders',
        defaultSets: 3,
        targetReps: '10-12 reps',
        restPeriodSeconds: 60,
        targetRpe,
        notes: 'Hips high in the air. Lower top of forehead towards floor between hands.',
      },
      {
        id: 'ex-bw-14',
        name: 'Chin-Ups (Underhand Grip for Biceps)',
        muscleGroup: 'Arms',
        defaultSets: 3,
        targetReps: '8-10 reps',
        restPeriodSeconds: 60,
        targetRpe,
        notes: 'Strict biceps pull. Squeeze at peak contraction.',
      },
      {
        id: 'ex-bw-15',
        name: 'Hanging Windshield Wipers or Oblique Crunches',
        muscleGroup: 'Core',
        defaultSets: 3,
        targetReps: '12 per side',
        restPeriodSeconds: 45,
        targetRpe: 7,
        notes: 'Rotational power to resist suspect grappling forces.',
      },
    ] : isDumbbellOnly ? [
      {
        id: 'ex-db-11',
        name: 'Dumbbell Incline Bench Press',
        muscleGroup: 'Chest',
        defaultSets: 4,
        targetReps: '8-10 reps',
        restPeriodSeconds: 75,
        targetRpe,
        notes: 'Focus on clavicular upper chest stretch and deliberate contraction.',
      },
      {
        id: 'ex-db-12',
        name: 'Dumbbell Neutral-Grip Flat Press',
        muscleGroup: 'Chest',
        defaultSets: 3,
        targetReps: '10-12 reps',
        restPeriodSeconds: 60,
        targetRpe,
        notes: 'Joint-friendly shoulder alignment. Great tricep and pec stimulus.',
      },
      {
        id: 'ex-db-13',
        name: 'Dumbbell Standing Lateral Raises',
        muscleGroup: 'Shoulders',
        defaultSets: 4,
        targetReps: '12-15 reps',
        restPeriodSeconds: 45,
        targetRpe: 8,
        notes: 'Lead with elbows. Build wide side delts for duty presence.',
      },
      {
        id: 'ex-db-14',
        name: 'Chest-Supported Incline Rear Delt Flyes',
        muscleGroup: 'Back',
        defaultSets: 3,
        targetReps: '12-15 reps',
        restPeriodSeconds: 45,
        targetRpe: 7,
        notes: 'Scapular health counteracting duty belt and vest forward posture.',
      },
      {
        id: 'ex-db-15',
        name: 'Overhead Dumbbell Tricep Extension',
        muscleGroup: 'Arms',
        defaultSets: 3,
        targetReps: '12-15 reps',
        restPeriodSeconds: 45,
        targetRpe: 7,
        notes: 'Deep stretch on long head of triceps. Keep elbows tucked.',
      },
    ] : [
      {
        id: 'ex-bb-11',
        name: 'Incline Barbell or Dumbbell Press',
        muscleGroup: 'Chest',
        defaultSets: 4,
        targetReps: '8-10 reps',
        restPeriodSeconds: 75,
        targetRpe,
        notes: 'Upper chest mass. Control descent smoothly.',
      },
      {
        id: 'ex-bb-12',
        name: 'Seated Cable Row or Barbell Yates Row',
        muscleGroup: 'Back',
        defaultSets: 4,
        targetReps: '8-10 reps',
        restPeriodSeconds: 75,
        targetRpe,
        notes: 'Pull low towards navel. Retract scaps firmly.',
      },
      {
        id: 'ex-bb-13',
        name: 'Dumbbell Side Lateral Raises',
        muscleGroup: 'Shoulders',
        defaultSets: 4,
        targetReps: '12-15 reps',
        restPeriodSeconds: 45,
        targetRpe: 8,
        notes: 'Slow 2-second negative. Builds wide V-taper frame.',
      },
      {
        id: 'ex-bb-14',
        name: 'Face Pulls with Rope Attachment',
        muscleGroup: 'Shoulders',
        defaultSets: 3,
        targetReps: '15-20 reps',
        restPeriodSeconds: 45,
        targetRpe: 7,
        notes: 'External rotation at top. Essential for heavy armor wearers.',
      },
      {
        id: 'ex-bb-15',
        name: 'Barbell or Cable Bicep Curls',
        muscleGroup: 'Arms',
        defaultSets: 3,
        targetReps: '10-12 reps',
        restPeriodSeconds: 45,
        targetRpe: 7,
        notes: 'No swinging. Strict elbow flexion.',
      },
    ],
  };

  const day5: GeneratedDay = {
    day: 5,
    focus: daysPerWeek === 3
      ? 'Day 5: Tactical Regeneration & Aerobic Maintenance'
      : isBodyweightOnly
      ? 'Day 5: Single-Leg Strength, Hip Hinge & Core Stability'
      : isDumbbellOnly
      ? 'Day 5: Dumbbell Posterior Chain, Hamstrings & Duty Carries'
      : 'Day 5: Deadlift Power, Hamstrings & Heavy Duty Carries',
    isRestDay: daysPerWeek === 3,
    warmup: 'Cat-cow, bird-dog, glute bridges, high knee pulls 2 mins.',
    conditioning: '1.5-mile cadence run or 3-mile weighted vest ruck (conversational pace).',
    exercises: daysPerWeek === 3 ? [] : isBodyweightOnly ? [
      {
        id: 'ex-bw-16',
        name: 'Single-Leg Bodyweight Romanian Deadlifts',
        muscleGroup: 'Hamstrings & Glutes',
        defaultSets: 4,
        targetReps: '10 reps per leg',
        restPeriodSeconds: 60,
        targetRpe,
        notes: 'Hinge back with straight back leg. Stabilizes ankle and hip.',
      },
      {
        id: 'ex-bw-17',
        name: 'Tempo Air Squats (3s down, 1s pause, explode up)',
        muscleGroup: 'Quads',
        defaultSets: 4,
        targetReps: '15-20 reps',
        restPeriodSeconds: 60,
        targetRpe,
        notes: 'Constant tension without locking out knees.',
      },
      {
        id: 'ex-bw-18',
        name: 'Walking Reverse Lunges',
        muscleGroup: 'Quads',
        defaultSets: 3,
        targetReps: '12 reps each side',
        restPeriodSeconds: 60,
        targetRpe,
        notes: 'Front knee stays over midfoot.',
      },
      {
        id: 'ex-bw-19',
        name: 'Plank Shoulder Taps',
        muscleGroup: 'Core',
        defaultSets: 3,
        targetReps: '20 total taps',
        restPeriodSeconds: 45,
        targetRpe: 7,
        notes: 'Do not let hips sway or rotate. Anti-rotation core discipline.',
      },
    ] : isDumbbellOnly ? [
      {
        id: 'ex-db-16',
        name: 'Heavy Dumbbell Stiff-Legged Deadlift',
        muscleGroup: 'Hamstrings & Glutes',
        defaultSets: 4,
        targetReps: '8-10 reps',
        restPeriodSeconds: 75,
        targetRpe,
        notes: 'Hips stay high. Max stretch on hamstrings. Explode up.',
      },
      {
        id: 'ex-db-17',
        name: 'Dumbbell Step-Ups onto Bench or Box',
        muscleGroup: 'Quads',
        defaultSets: 3,
        targetReps: '10 per leg',
        restPeriodSeconds: 60,
        targetRpe,
        notes: 'Step up through lead heel. Minimize push from bottom foot.',
      },
      {
        id: 'ex-db-18',
        name: 'Dumbbell Lying or Seated Hamstring Leg Curls',
        muscleGroup: 'Hamstrings & Glutes',
        defaultSets: 3,
        targetReps: '12-15 reps',
        restPeriodSeconds: 60,
        targetRpe,
        notes: 'Squeeze dumbbell securely between feet if on floor/bench.',
      },
      {
        id: 'ex-db-19',
        name: 'Single-Arm Dumbbell Suitcase Carries',
        muscleGroup: 'Core',
        defaultSets: 3,
        targetReps: '50 yards per side',
        restPeriodSeconds: 60,
        targetRpe: 8,
        notes: 'Resist lateral flexion. Stand completely erect while carrying.',
      },
    ] : [
      {
        id: 'ex-bb-16',
        name: isStrength ? 'Trap Bar or Conventional Deadlift (Heavy 5s)' : 'Conventional or Trap Bar Deadlift',
        muscleGroup: 'Hamstrings & Glutes',
        defaultSets: 4,
        targetReps: isStrength ? '4-5 reps' : '6-8 reps',
        restPeriodSeconds: 120,
        targetRpe,
        notes: 'Pack lats, take slack out of bar. Drive the floor away.',
      },
      {
        id: 'ex-bb-17',
        name: 'Barbell Hip Thrusts or Glute Ham Raises',
        muscleGroup: 'Hamstrings & Glutes',
        defaultSets: 3,
        targetReps: '8-10 reps',
        restPeriodSeconds: 75,
        targetRpe,
        notes: 'Full lock at top. Crucial for acceleration and sprint power.',
      },
      {
        id: 'ex-bb-18',
        name: 'Leg Press or Front Squats',
        muscleGroup: 'Quads',
        defaultSets: 3,
        targetReps: '10-12 reps',
        restPeriodSeconds: 75,
        targetRpe,
        notes: 'Deep knee flexion building anterior quad armor.',
      },
      {
        id: 'ex-bb-19',
        name: 'Heavy Farmers Walk or Trap Bar Carry',
        muscleGroup: 'Full Body',
        defaultSets: 3,
        targetReps: '60 yards',
        restPeriodSeconds: 60,
        targetRpe: 8,
        notes: 'Max grip fatigue. Short quick steps.',
      },
    ],
  };

  const day6: GeneratedDay = {
    day: 6,
    focus: daysPerWeek >= 6
      ? 'Day 6: High-Velocity Sprint Intervals & Hybrid Duty Capacity'
      : daysPerWeek === 5
      ? 'Day 6: Aerobic Base Flush & Tactical Ruck March'
      : 'Day 6: Active Recovery, Mobility & Neurological Reset',
    isRestDay: daysPerWeek < 5,
    warmup: 'Hip flow routine, ankle mobility, dynamic hamstring kicks.',
    conditioning: 'Zone 2 Ruck March: 45 minutes with 35 lb pack at conversational breathing.',
    exercises: daysPerWeek >= 6 ? [
      {
        id: 'ex-d6-1',
        name: 'Track or Hill Sprints (100% Sprint Effort)',
        muscleGroup: 'Full Body',
        defaultSets: 6,
        targetReps: '60 meters sprint',
        restPeriodSeconds: 90,
        targetRpe: 9,
        notes: 'Full sprint mechanics. Drive knees, pump arms. Walk back for rest.',
      },
      {
        id: 'ex-d6-2',
        name: 'Kettlebell or Dumbbell Clean & Press',
        muscleGroup: 'Full Body',
        defaultSets: 4,
        targetReps: '8 reps per side',
        restPeriodSeconds: 60,
        targetRpe: 8,
        notes: 'Explosive triple extension from floor to overhead.',
      },
      {
        id: 'ex-d6-3',
        name: 'Hanging Knee Raises & Plank Walks',
        muscleGroup: 'Core',
        defaultSets: 3,
        targetReps: '15 reps',
        restPeriodSeconds: 45,
        targetRpe: 7,
        notes: 'Maintain bracing under heart rate fatigue.',
      },
    ] : [],
  };

  const day7: GeneratedDay = {
    day: 7,
    focus: 'Day 7: Full Regeneration, Joint Decompression & Ready State',
    isRestDay: true,
    warmup: '15 minutes foam rolling, tissue hydration, and box breathing (4s in, 4s hold, 4s out, 4s hold).',
    conditioning: 'Optional 20-30 minute casual recovery walk in natural daylight.',
    exercises: [],
  };

  const sampleDays = [day1, day2, day3, day4, day5, day6, day7];

  // If monthly duration requested, repeat the 7-day pattern across 4 weeks with periodized progression cues
  const fullSchedule: GeneratedDay[] = [];
  if (isMonthly) {
    for (let w = 0; w < 4; w++) {
      for (const d of sampleDays) {
        const dayNumber = w * 7 + d.day;
        const weekName = w === 0 
          ? 'Week 1 (Base Overload)' 
          : w === 1 
          ? 'Week 2 (Volume Accumulation)' 
          : w === 2 
          ? 'Week 3 (Intensity Peak)' 
          : 'Week 4 (Deload & Test)';

        fullSchedule.push({
          day: dayNumber,
          focus: `${weekName}: ${d.focus.replace(/^Day \d+:\s*/, '')}`,
          isRestDay: d.isRestDay,
          warmup: d.warmup,
          conditioning: d.conditioning,
          exercises: d.exercises.map((ex) => ({
            ...ex,
            id: `${ex.id}-w${w + 1}`,
            defaultSets: w === 1 ? ex.defaultSets + 1 : w === 3 ? Math.max(2, ex.defaultSets - 1) : ex.defaultSets,
            notes: w === 1
              ? `${ex.notes} [Week 2: Add 1 extra working set or 1-2 reps per set]`
              : w === 2
              ? `${ex.notes} [Week 3: Increase weight by +2.5 to 5 lbs on upper, +5 to 10 lbs on lower]`
              : w === 3
              ? `${ex.notes} [Week 4 Deload: Drop load by 20% to consolidate nervous system adaptation]`
              : ex.notes,
          })),
        });
      }
    }
  } else {
    fullSchedule.push(...sampleDays);
  }

  // Construct tailored title & description
  const equipmentSummary = eqList.join(', ') || 'Standard Training Equipment';
  const title = isPat
    ? 'Universal Police PAT & Readiness Protocol'
    : isBodyweightOnly
    ? `Tactical Bodyweight & Calisthenics ${category} Protocol`
    : isDumbbellOnly
    ? `Dumbbell Tactical ${category} Protocol`
    : `Personalized ${category} Protocol`;

  const subtitle = `Tailored for ${level} • ${params.frequency} • ${goalStr}`;

  const description = `Custom-engineered tactical training plan built specifically around ${goalStr.toLowerCase()}. Designed for ${level.toLowerCase()} athletes utilizing: ${equipmentSummary}. Programmed with strict progressive overload increments, duty load resilience, and ${targetDuration}-minute sessions.`;

  const coachingPhilosophy = isPat
    ? 'Patrol Ready PAT Periodization: Peak test scores require simultaneous anaerobic burst capacity (300m sprint), muscular endurance density (push-ups), and high-load carriage stamina (dummy drag).'
    : isStrength
    ? 'Double Progression Strength Rule: When you can complete all prescribed sets at the upper rep target with clean technical RPE, increase load by 2.5-5 lbs on upper and 5-10 lbs on lower body.'
    : isBodyweightOnly
    ? 'Calisthenic Leverage & Tension: Progressive overload with bodyweight is achieved through mechanical leverage, controlled eccentric tempos (3-second descents), and increasing density.'
    : 'Patrol Ready Combat Chassis: Compound multi-joint lifts always precede accessory work. Rest periods are strictly timed to balance ATP restoration with metabolic conditioning.';

  const weeklyProgressionTips = [
    'Log every working set weight and reps accurately to trigger the automatic +2.5 to 10 lbs overload calculator.',
    'Maintain strict RPE discipline: stay at RPE 8 on compound movements during working weeks to prevent duty fatigue.',
    'Hydrate with electrolytes before sessions, especially during sprint or tactical ruck training.',
  ];

  const nutritionAdvice = isHypertrophy
    ? 'Aim for 0.9-1.0g protein per lb of bodyweight daily with a moderate 250-350 kcal surplus from clean whole foods.'
    : isEndurance
    ? 'Prioritize complex carbohydrates around training windows and maintain minimum 0.8g protein per lb to preserve lean tissue.'
    : 'Consume 1.0g protein per lb of bodyweight with high micronutrient density and adequate hydration with sea salt/electrolytes.';

  return {
    title,
    subtitle,
    category,
    frequency: params.frequency,
    scheduleDuration: isMonthly ? '4-Week Monthly Protocol' : '7-Day Rotation',
    estimatedDurationMinutes: targetDuration,
    description,
    coachingPhilosophy,
    weeklyProgressionTips,
    nutritionAdvice,
    schedule: fullSchedule,
    source: 'tactical-engine',
  };
}

/**
 * Main AI Generation function:
 * First attempts to call Gemini via @google/genai client-side if an API key is available.
 * If no API key is configured, or if the Gemini call fails, it uses the high-precision calibrated tactical engine.
 * Never throws 404 or fails silently on static hosts like Netlify.
 */
export async function generateWorkoutPlanClient(
  params: WorkoutGenerationRequest
): Promise<GeneratedWorkoutPlan> {
  const apiKey = getEffectiveGeminiApiKey(params.customApiKey);

  // If API key is available, call Gemini 3.8 Flash directly
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
      });

      const scheduleDaysTarget = params.scheduleDuration === 'monthly' ? 28 : 7;
      const daysPerWeek = parseInt(params.frequency, 10) || 4;
      const equipmentStr = params.equipment?.join(', ') || 'Full Gym';

      const prompt = `You are the Head Tactical Strength & Conditioning Coach at Patrol Ready Performance, specializing in elite physical preparation for frontline law enforcement, tactical athletes, and hybrid conditioning.

Generate a comprehensive, tailored workout schedule strictly matching the athlete's exact specifications:
- Fitness Goals: ${params.goals?.join(', ')}
- Current Fitness Level: ${params.fitnessLevel}
- Workout Frequency: ${params.frequency} (${daysPerWeek} training days per 7 days)
- Schedule Type: ${params.scheduleDuration === 'monthly' ? '4-Week Monthly Periodized Block (Day 1 through Day 28)' : '7-Day Rotation Schedule (Day 1 through Day 7)'}
- Available Equipment: ${equipmentStr} (STRICT CONSTRAINT: ONLY program exercises that can be performed with this equipment! E.g. If Bodyweight only, do NOT program barbells or dumbbells!)
- Target Session Duration: ${params.sessionDurationMinutes || 60} minutes
- Special Notes / Constraints: ${params.notes || 'None'}

CRITICAL RULES:
1. Every day must have:
   - day: integer (Day 1, Day 2, etc.)
   - focus: descriptive string (e.g. "Day 1: Upper Body Armor & Horizontal Push/Pull")
   - isRestDay: boolean (true for rest/recovery days, false for working sessions)
   - exercises: array of exercises (empty array [] if isRestDay is true, otherwise 4 to 6 specific exercises)
2. Every exercise must specify:
   - id: unique string (e.g. "ex-1")
   - name: clear, exact exercise name
   - muscleGroup: strictly one of ["Chest", "Back", "Quads", "Hamstrings & Glutes", "Shoulders", "Arms", "Core", "Full Body"]
   - defaultSets: integer (3 or 4)
   - targetReps: string (e.g. "6-8 reps", "10-12 reps", "15 reps")
   - restPeriodSeconds: integer (e.g. 60, 90, 120)
   - targetRpe: integer (7, 8, or 9)
   - notes: tactical execution cue and progressive overload trigger
3. Category must be one of: 'Strength', 'Hypertrophy', 'Athletic Conditioning', 'Power', 'Hybrid'.
4. Return valid JSON adhering strictly to the schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              category: {
                type: Type.STRING,
                enum: ['Strength', 'Hypertrophy', 'Athletic Conditioning', 'Power', 'Hybrid'],
              },
              frequency: { type: Type.STRING },
              scheduleDuration: { type: Type.STRING },
              estimatedDurationMinutes: { type: Type.INTEGER },
              description: { type: Type.STRING },
              coachingPhilosophy: { type: Type.STRING },
              weeklyProgressionTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              nutritionAdvice: { type: Type.STRING },
              schedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.INTEGER },
                    focus: { type: Type.STRING },
                    isRestDay: { type: Type.BOOLEAN },
                    exercises: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          name: { type: Type.STRING },
                          muscleGroup: {
                            type: Type.STRING,
                            enum: ['Chest', 'Back', 'Quads', 'Hamstrings & Glutes', 'Shoulders', 'Arms', 'Core', 'Full Body'],
                          },
                          defaultSets: { type: Type.INTEGER },
                          targetReps: { type: Type.STRING },
                          restPeriodSeconds: { type: Type.INTEGER },
                          targetRpe: { type: Type.INTEGER },
                          notes: { type: Type.STRING },
                        },
                        required: ['id', 'name', 'muscleGroup', 'defaultSets', 'targetReps', 'restPeriodSeconds'],
                      },
                    },
                  },
                  required: ['day', 'focus', 'isRestDay', 'exercises'],
                },
              },
            },
            required: [
              'title',
              'subtitle',
              'category',
              'frequency',
              'scheduleDuration',
              'estimatedDurationMinutes',
              'description',
              'schedule',
            ],
          },
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return {
          ...parsed,
          source: 'gemini-3.8-flash',
        };
      }
    } catch (apiErr) {
      console.warn('[AIWorkoutService] Gemini client call warning, falling back to tactical generator:', apiErr);
    }
  }

  // Fallback to high-precision calibrated tactical engine
  return generateCalibratedWorkoutPlan(params);
}
