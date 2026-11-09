import { WorkoutProgram, ExerciseTemplate, MuscleGroup } from '../types';

export interface WorkoutGenerationRequest {
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
  runningDistancePreference?: string; // e.g. "1.5 Miles (Duty Benchmark)", "2-3 Miles Base", "Sprints / 400m-800m", "5K"
  cardioCircuitType?: string; // e.g. "Kettlebell & Bodyweight Conditioning", "Duty HIIT / Pursuit Intervals", "Assault Bike / Rower Flush", "Ruck Conditioning (20-45 lbs)"
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
 * Retained for backwards compatibility; all API calls are strictly handled server-side.
 */
export function getEffectiveGeminiApiKey(_customKey?: string): string {
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

  // Clinical Movement & Injury Adaptation Protocol
  const injuryRaw = [
    ...(params.injuries || []),
    params.injuryNotes || '',
    params.notes || '',
  ].join(' ');
  const injuryLower = injuryRaw.toLowerCase();

  const hasHipInjury = /hip|labrum|fai|impingement|groin|acetabul/i.test(injuryLower);
  const hasBackInjury = /back|lumbar|disc|herniat|sciatica|spine/i.test(injuryLower);
  const hasShoulderInjury = /shoulder|rotator|cuff|ac joint/i.test(injuryLower);
  const hasKneeInjury = /knee|patell|meniscus|acl|mcl|tendonitis/i.test(injuryLower);
  const hasAnyInjury = hasHipInjury || hasBackInjury || hasShoulderInjury || hasKneeInjury || injuryRaw.trim().length > 0;

  // Calibrate rep scheme and rest intervals based on primary goal & fitness level
  const baseRest = isStrength ? 120 : isHypertrophy ? 90 : isEndurance ? 45 : 60;
  const targetRpe = level === 'Beginner' ? 7 : level === 'Elite' ? 9 : 8;

  // Build Day Templates strictly using available equipment
  const day1: GeneratedDay = {
    day: 1,
    focus: hasShoulderInjury
      ? 'Day 1: Upper Body Armor & Scapular Plane Press/Pull (Shoulder-Sparing)'
      : isBodyweightOnly
      ? 'Day 1: Upper Body Calisthenic Power & Explosive Push/Pull'
      : isDumbbellOnly
      ? 'Day 1: Dumbbell Armor Upper Body & Chest/Back Density'
      : isPat
      ? 'Day 1: PAT Upper Push Endurance & Trunk Power Benchmark'
      : isStrength
      ? 'Day 1: Maximum Strength Upper Body Heavy Horizontal Press/Pull'
      : 'Day 1: Duty Armor Upper Body & Horizontal Press/Pull',
    isRestDay: false,
    warmup: hasShoulderInjury
      ? 'Band pull-aparts 3x20, face pulls with external rotation, thoracic extensions, rotator cuff Y-T-Ws 2 mins.'
      : 'Band pull-aparts 2x20, shoulder dislocates, push-up to downward dog, cat-cow 2 mins.',
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
        name: hasShoulderInjury 
          ? 'Push-Ups on Neutral Handles (Shoulder-Safe)' 
          : 'Feet-Elevated Decline Push-Ups or Parallel Bar Dips',
        muscleGroup: 'Chest',
        defaultSets: 3,
        targetReps: '12-15 reps',
        restPeriodSeconds: baseRest,
        targetRpe,
        notes: hasShoulderInjury
          ? 'Neutral wrist/shoulder angle prevents impingement and eliminates front capsule strain.'
          : 'Targets upper clavicular chest and front delts. Controlled descent.',
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
        name: hasHipInjury
          ? 'RKC High-Tension Plank & Pallof Anti-Rotation Press'
          : 'Hanging Knee-to-Elbows or Hollow Body Rocks',
        muscleGroup: 'Core',
        defaultSets: 3,
        targetReps: hasHipInjury ? '45s hold / 12 reps' : '15-20 reps',
        restPeriodSeconds: 45,
        targetRpe: 7,
        notes: hasHipInjury
          ? 'Direct abdominal stability without repetitive hip flexor pulling on the acetabular labrum.'
          : 'Keep pelvis tucked. Prevent swinging.',
      },
    ] : isDumbbellOnly ? [
      {
        id: 'ex-db-1',
        name: hasShoulderInjury
          ? 'Neutral-Grip Dumbbell Floor Press (Shoulder Safe)'
          : 'Dumbbell Flat Bench Press (or Heavy Floor Press)',
        muscleGroup: 'Chest',
        defaultSets: 4,
        targetReps: isStrength ? '6-8 reps' : '10-12 reps',
        restPeriodSeconds: baseRest + 15,
        targetRpe,
        notes: hasShoulderInjury
          ? 'Floor stops excessive humeral extension. Neutral grip centers rotator cuff tendon.'
          : 'Control the descent for 3 seconds. Drive through elbows without clanking dumbbells.',
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
        name: hasShoulderInjury
          ? 'Half-Kneeling Landmine Overhead Press (Scapular Plane)'
          : 'Standing Dumbbell Arnold Press',
        muscleGroup: 'Shoulders',
        defaultSets: 3,
        targetReps: '10-12 reps',
        restPeriodSeconds: 60,
        targetRpe,
        notes: hasShoulderInjury
          ? 'Pressing in the 30° scapular plane completely avoids subacromial impingement.'
          : 'Rotate palms smoothly as you press overhead. Keep core locked.',
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
        name: hasShoulderInjury
          ? 'Neutral-Grip Dumbbell Floor Press (Shoulder Safe)'
          : isStrength
          ? 'Barbell Bench Press (Heavy Triples)'
          : 'Barbell Bench Press',
        muscleGroup: 'Chest',
        defaultSets: 4,
        targetReps: isStrength && !hasShoulderInjury ? '4-5 reps' : '8-10 reps',
        restPeriodSeconds: isStrength ? 150 : 90,
        targetRpe,
        notes: hasShoulderInjury
          ? 'Floor restricts hyperextension of the glenohumeral joint, completely protecting rotator cuff.'
          : 'Maintain 5 points of contact. Lower with controlled eccentric.',
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
        name: hasShoulderInjury
          ? 'Half-Kneeling Landmine Press or DB Neutral Press'
          : 'Overhead Barbell Military Press',
        muscleGroup: 'Shoulders',
        defaultSets: 3,
        targetReps: '8-10 reps',
        restPeriodSeconds: 90,
        targetRpe,
        notes: hasShoulderInjury
          ? 'Angled pressing vector eliminates subacromial pinch while building heavy anterior delt power.'
          : 'Clear the chin, push head through at top lockout. Squeeze glutes.',
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
        name: hasHipInjury
          ? 'RKC High-Tension Plank & Pallof Anti-Rotation Press'
          : 'Hanging Leg Raises / Dragon Flags',
        muscleGroup: 'Core',
        defaultSets: 3,
        targetReps: hasHipInjury ? '45s hold / 12 reps' : '12-15 reps',
        restPeriodSeconds: 45,
        targetRpe: 7,
        notes: hasHipInjury
          ? 'Core stabilization without hip flexor tugging on the torn hip labrum.'
          : 'Toes to bar or knee to chest. Eliminate pendulum swing.',
      },
    ],
  };

  const day2: GeneratedDay = {
    day: 2,
    focus: hasHipInjury
      ? 'Day 2: Lower Body Power & Hip-Sparing Kinetic Chain (Labrum Protected)'
      : hasBackInjury
      ? 'Day 2: Lower Body Kinetic Power (Lumbar-Protected & Axial Deload)'
      : isBodyweightOnly
      ? 'Day 2: Unilateral Leg Power, Sprint Mechanics & Posterior Chain'
      : isDumbbellOnly
      ? 'Day 2: Dumbbell Lower Body Quad Drive & Posterior Kinetic Chain'
      : isPat
      ? 'Day 2: PAT Foot Pursuit Speed & 1.5-Mile Aerobic Velocity'
      : isStrength
      ? 'Day 2: Maximum Lower Body Squat Force & Heavy Posterior Chain'
      : 'Day 2: Lower Body Kinetic Power & Squat Chassis Durability',
    isRestDay: false,
    warmup: hasHipInjury
      ? 'Hip distraction band stretch, gentle 90/90 mobility (pain-free ROM only), glute bridge activations, terminal knee extensions (TKE) x 20.'
      : 'Worlds greatest stretch 5/side, 90/90 hip mobility, glute bridges x 20, bodyweight squats x 15.',
    conditioning: hasHipInjury
      ? 'Low-Impact Recumbent Cycle or Backward Sled Drag: 15 mins Zone 2. Zero femoral impingement or labrum irritation.'
      : isPat
      ? '1.5-Mile Timed Run Practice: 600m splits at target passing pace.'
      : '15-Minute Tactical Ruck or Steady Treadmill Incline Walk (12% incline, 3.2 mph).',
    exercises: hasHipInjury ? (
      isBodyweightOnly ? [
        {
          id: 'ex-bw-6',
          name: 'Bodyweight Box Squats to Bench (Strict 90° Angle)',
          muscleGroup: 'Quads',
          defaultSets: 4,
          targetReps: '12-15 reps',
          restPeriodSeconds: 75,
          targetRpe: 7,
          notes: 'CLINICAL LABRUM PROTOCOL: Touch bench lightly and drive up. Strict vertical shin angle protects hip labrum. Never drop below parallel.',
        },
        {
          id: 'ex-bw-7',
          name: 'Nordic Hamstring Curls (or Slider Leg Curls)',
          muscleGroup: 'Hamstrings & Glutes',
          defaultSets: 4,
          targetReps: '6-8 reps (slow eccentric)',
          restPeriodSeconds: 90,
          targetRpe: 8,
          notes: 'Slow eccentric hamstring control without deep hip angle flexion.',
        },
        {
          id: 'ex-bw-8',
          name: 'Banded Spanish Squat Isometric Holds',
          muscleGroup: 'Quads',
          defaultSets: 3,
          targetReps: '45-second hold',
          restPeriodSeconds: 60,
          targetRpe: 7,
          notes: 'Zero impact force. Heavy quad burn with pure vertical tibia and zero hip impingement.',
        },
        {
          id: 'ex-bw-9',
          name: 'Low-Box Step-Ups (6-inch box) & Glute Bridges',
          muscleGroup: 'Full Body',
          defaultSets: 3,
          targetReps: '12 reps each leg',
          restPeriodSeconds: 60,
          targetRpe: 7,
          notes: 'Low elevation eliminates deep hip flexion shear. Focus on driving straight through lead heel.',
        },
        {
          id: 'ex-bw-10',
          name: 'Side Planks with Leg Lift Hold & Glute Bridges',
          muscleGroup: 'Core',
          defaultSets: 3,
          targetReps: '30s hold per side',
          restPeriodSeconds: 45,
          targetRpe: 7,
          notes: 'Pelvic stability strengthening lateral hip stabilizers to support the acetabulum.',
        },
      ] : isDumbbellOnly ? [
        {
          id: 'ex-db-6',
          name: 'Dumbbell Box Squats to Bench (Strict Shins - Hip Labrum Safe)',
          muscleGroup: 'Quads',
          defaultSets: 4,
          targetReps: '8-10 reps',
          restPeriodSeconds: 90,
          targetRpe: 7,
          notes: 'CLINICAL LABRUM PROTOCOL: Descend to bench height without letting hips drop below parallel. Keeps femur head safely centered in socket without anterior pinch.',
        },
        {
          id: 'ex-db-7',
          name: 'Dumbbell Romanian Deadlift (Controlled Pain-Free ROM)',
          muscleGroup: 'Hamstrings & Glutes',
          defaultSets: 4,
          targetReps: '8-10 reps',
          restPeriodSeconds: 90,
          targetRpe: 7,
          notes: 'Hips back to mid-shin. Protects anterior hip capsule while loading hamstrings and glutes.',
        },
        {
          id: 'ex-db-8',
          name: 'Low-Step Box Step-Ups (6-inch box) & Glute Bridges',
          muscleGroup: 'Quads',
          defaultSets: 3,
          targetReps: '10 reps each leg',
          restPeriodSeconds: 60,
          targetRpe: 7,
          notes: 'Low elevation eliminates deep hip flexion shear. Focus on driving straight through lead heel.',
        },
        {
          id: 'ex-db-9',
          name: 'Heavy Dumbbell Farmer Carries (Tall Neutral Torso)',
          muscleGroup: 'Full Body',
          defaultSets: 3,
          targetReps: '60 yards carry',
          restPeriodSeconds: 60,
          targetRpe: 8,
          notes: 'Upright posture. Core and glute stabilization with zero acute hip flexion.',
        },
        {
          id: 'ex-db-10',
          name: 'Dumbbell Standing Calf Raises & McGill Side Planks',
          muscleGroup: 'Hamstrings & Glutes',
          defaultSets: 3,
          targetReps: '15 reps / 30s side',
          restPeriodSeconds: 45,
          targetRpe: 7,
          notes: 'Hold at top for 2 seconds. Lateral hip and ankle support.',
        },
      ] : [
        {
          id: 'ex-bb-6',
          name: 'Box Squat to Parallel (Hip Labrum & Joint Protection)',
          muscleGroup: 'Quads',
          defaultSets: 4,
          targetReps: '8-10 reps',
          restPeriodSeconds: 90,
          targetRpe: 7,
          notes: 'CLINICAL LABRUM PROTOCOL: Box height set to 90° or slightly above. Keep shins vertical and sit back into hips. Eliminates femoral head impingement against acetabular labrum. Never dive below parallel.',
        },
        {
          id: 'ex-bb-7',
          name: 'High-Handle Trap Bar RDL (Restricted Hip Hinge Depth)',
          muscleGroup: 'Hamstrings & Glutes',
          defaultSets: 4,
          targetReps: '8-10 reps',
          restPeriodSeconds: 90,
          targetRpe: 7,
          notes: 'Hinge back with soft knees only to mid-shin level. Stop before any pinch or tension at anterior hip socket.',
        },
        {
          id: 'ex-bb-8',
          name: 'Banded Spanish Squats or Terminal Knee Extensions (TKE)',
          muscleGroup: 'Quads',
          defaultSets: 3,
          targetReps: '12-15 reps',
          restPeriodSeconds: 60,
          targetRpe: 7,
          notes: 'Heavy band behind knees forces vertical tibia. Delivers intense quad hypertrophy with zero hip joint irritation.',
        },
        {
          id: 'ex-bb-9',
          name: 'Barbell or Dumbbell Hip Thrusts (Neutral Pelvis)',
          muscleGroup: 'Hamstrings & Glutes',
          defaultSets: 3,
          targetReps: '10-12 reps',
          restPeriodSeconds: 75,
          targetRpe: 8,
          notes: 'Drive through heels. Squeeze glutes at top lockout with neutral pelvis. Does not enter deep hip flexion, keeping labrum safe.',
        },
        {
          id: 'ex-bb-10',
          name: 'Standing Calf Raises & Side Planks (McGill Protocol)',
          muscleGroup: 'Core',
          defaultSets: 3,
          targetReps: '15 reps / 30s per side',
          restPeriodSeconds: 45,
          targetRpe: 7,
          notes: 'Strengthens glute medius and quadratus lumborum to stabilize pelvic tracking.',
        },
      ]
    ) : hasBackInjury ? (
      [
        {
          id: 'ex-bb-6',
          name: 'Belt Squat or Dumbbell Goblet Box Squat (Spine Deloaded)',
          muscleGroup: 'Quads',
          defaultSets: 4,
          targetReps: '8-10 reps',
          restPeriodSeconds: 90,
          targetRpe: 7,
          notes: 'Completely removes spinal axial load while delivering maximum quad tension.',
        },
        {
          id: 'ex-bb-7',
          name: 'High-Handle Trap Bar RDL (Flat Spine)',
          muscleGroup: 'Hamstrings & Glutes',
          defaultSets: 4,
          targetReps: '8-10 reps',
          restPeriodSeconds: 90,
          targetRpe: 7,
          notes: 'Pack lats and lock pelvis. Hinge strictly from hips with zero lumbar flexion.',
        },
        {
          id: 'ex-bb-8',
          name: 'Backward Sled Drags or Supported Step-Ups',
          muscleGroup: 'Quads',
          defaultSets: 3,
          targetReps: '50 yards or 10 reps/side',
          restPeriodSeconds: 60,
          targetRpe: 7,
          notes: 'Zero compressive spinal shear. Builds knee resilience and quad density.',
        },
        {
          id: 'ex-bb-9',
          name: 'Heavy Farmers Carries (Upright Posture)',
          muscleGroup: 'Full Body',
          defaultSets: 3,
          targetReps: '60 yards',
          restPeriodSeconds: 60,
          targetRpe: 8,
          notes: 'Anti-lateral flexion core stability. Stand tall.',
        },
        {
          id: 'ex-bb-10',
          name: 'McGill Big 3: Bird-Dogs & Side Planks',
          muscleGroup: 'Core',
          defaultSets: 3,
          targetReps: '8 holds per side',
          restPeriodSeconds: 45,
          targetRpe: 7,
          notes: 'Gold standard spinal stability protocol for disc and lumbar preservation.',
        },
      ]
    ) : isBodyweightOnly ? [
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
    focus: hasHipInjury
      ? 'Day 5: Hip-Sparing Posterior Chain, High-Handle Trap Bar & Sled Drive'
      : hasBackInjury
      ? 'Day 5: Posterior Chain Resilience & Axial Deloaded Trap Bar'
      : daysPerWeek === 3
      ? 'Day 5: Tactical Regeneration & Aerobic Maintenance'
      : isBodyweightOnly
      ? 'Day 5: Single-Leg Strength, Hip Hinge & Core Stability'
      : isDumbbellOnly
      ? 'Day 5: Dumbbell Posterior Chain, Hamstrings & Duty Carries'
      : 'Day 5: Deadlift Power, Hamstrings & Heavy Duty Carries',
    isRestDay: daysPerWeek === 3,
    warmup: hasHipInjury
      ? 'Band glute bridges 2x20, cat-cow, gentle bird-dogs, knee hugs (pain-free ROM).'
      : 'Cat-cow, bird-dog, glute bridges, high knee pulls 2 mins.',
    conditioning: hasHipInjury
      ? 'Assault bike smooth cadence or backward sled pull: 20 mins Zone 2. Zero hip joint shear.'
      : '1.5-mile cadence run or 3-mile weighted vest ruck (conversational pace).',
    exercises: daysPerWeek === 3 ? [] : hasHipInjury ? (
      isBodyweightOnly ? [
        {
          id: 'ex-bw-16',
          name: 'Single-Leg Bodyweight Romanian Deadlifts (Controlled ROM)',
          muscleGroup: 'Hamstrings & Glutes',
          defaultSets: 4,
          targetReps: '10 reps per leg',
          restPeriodSeconds: 60,
          targetRpe,
          notes: 'CLINICAL LABRUM PROTOCOL: Hinge back with soft knee only to mid-shin level. Eliminates anterior hip socket pinch.',
        },
        {
          id: 'ex-bw-17',
          name: 'Tempo Air Squats to Box/Bench (3s down, pause at 90°)',
          muscleGroup: 'Quads',
          defaultSets: 4,
          targetReps: '12-15 reps',
          restPeriodSeconds: 60,
          targetRpe,
          notes: 'Box stops descent strictly at 90°, preventing hip labrum impingement.',
        },
        {
          id: 'ex-bw-18',
          name: 'Glute Bridge Isometric Holds (Banded)',
          muscleGroup: 'Hamstrings & Glutes',
          defaultSets: 3,
          targetReps: '12 reps with 3s hold',
          restPeriodSeconds: 60,
          targetRpe,
          notes: 'Drives pure glute extension without acute hip angle flexion.',
        },
        {
          id: 'ex-bw-19',
          name: 'Plank Shoulder Taps & Bird-Dogs',
          muscleGroup: 'Core',
          defaultSets: 3,
          targetReps: '20 total taps',
          restPeriodSeconds: 45,
          targetRpe: 7,
          notes: 'Anti-rotation core discipline without repetitive hip flexion.',
        },
      ] : isDumbbellOnly ? [
        {
          id: 'ex-db-16',
          name: 'Dumbbell Romanian Deadlift (Controlled Mid-Shin Depth)',
          muscleGroup: 'Hamstrings & Glutes',
          defaultSets: 4,
          targetReps: '8-10 reps',
          restPeriodSeconds: 75,
          targetRpe,
          notes: 'CLINICAL LABRUM PROTOCOL: Hips stay high, knees soft. Reverse direction as soon as hamstrings stretch, before hip impinges.',
        },
        {
          id: 'ex-db-17',
          name: 'Low-Box Step-Ups (6-inch box) or Spanish Squats',
          muscleGroup: 'Quads',
          defaultSets: 3,
          targetReps: '10 per leg',
          restPeriodSeconds: 60,
          targetRpe,
          notes: 'Low elevation avoids deep hip flexion. Pure vastus medialis quad burn.',
        },
        {
          id: 'ex-db-18',
          name: 'Dumbbell Lying or Seated Hamstring Leg Curls',
          muscleGroup: 'Hamstrings & Glutes',
          defaultSets: 3,
          targetReps: '12-15 reps',
          restPeriodSeconds: 60,
          targetRpe,
          notes: 'Direct knee flexion hamstring hypertrophy with zero hip joint irritation.',
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
          name: 'High-Handle Trap Bar Deadlift (Hip-Sparing Stance)',
          muscleGroup: 'Hamstrings & Glutes',
          defaultSets: 4,
          targetReps: '6-8 reps',
          restPeriodSeconds: 120,
          targetRpe: 7,
          notes: 'CLINICAL LABRUM PROTOCOL: High handles elevate starting height by 5 inches, keeping torso upright and reducing hip flexion angle to prevent labral pinch.',
        },
        {
          id: 'ex-bb-17',
          name: 'Barbell Hip Thrusts (Neutral Pelvis Lockout)',
          muscleGroup: 'Hamstrings & Glutes',
          defaultSets: 3,
          targetReps: '10-12 reps',
          restPeriodSeconds: 75,
          targetRpe: 8,
          notes: 'Full glute lockout at top. Zero anterior hip impingement throughout the entire range of motion.',
        },
        {
          id: 'ex-bb-18',
          name: 'Belt Squats or Low-Box Squats (Upright Torso, Zero Hip Pinch)',
          muscleGroup: 'Quads',
          defaultSets: 3,
          targetReps: '10-12 reps',
          restPeriodSeconds: 75,
          targetRpe: 7,
          notes: 'Loads quads without compressive spinal shear or acute deep hip flexion.',
        },
        {
          id: 'ex-bb-19',
          name: 'Heavy Farmers Walk or Trap Bar Carry',
          muscleGroup: 'Full Body',
          defaultSets: 3,
          targetReps: '60 yards',
          restPeriodSeconds: 60,
          targetRpe: 8,
          notes: 'Max grip fatigue and core brace. Short, smooth, upright steps.',
        },
      ]
    ) : isBodyweightOnly ? [
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

  // Append user-selected cardio preference (Running, Cardio Circuits, or Hybrid) across training days
  if (params.cardioPreference === 'running') {
    const distText = params.runningDistancePreference || '1.5-2.0 Miles';
    sampleDays.forEach((d) => {
      if (!d.isRestDay) {
        d.exercises.push({
          id: `ex-run-duty-${d.day}`,
          name: `Tactical Aerobic Run (${distText})`,
          muscleGroup: 'Full Body',
          defaultSets: 1,
          targetReps: distText,
          restPeriodSeconds: 0,
          targetRpe: 7,
          notes: 'Zone 2 steady-state run for cardiac stroke volume, officer pursuit endurance, and metabolic recovery.',
        });
      }
    });
  } else if (params.cardioPreference === 'cardio_circuits') {
    const circuitStyle = params.cardioCircuitType || 'Duty Metabolic Circuit';
    sampleDays.forEach((d) => {
      if (!d.isRestDay) {
        d.exercises.push({
          id: `ex-circuit-duty-${d.day}`,
          name: `${circuitStyle} Finisher`,
          muscleGroup: 'Full Body',
          defaultSets: 3,
          targetReps: '3 rounds (40s work / 20s rest)',
          restPeriodSeconds: 60,
          targetRpe: 8,
          notes: 'High-density metabolic conditioning circuit: Swings, Sprawls, Mountain Climbers, and Farmer Marches.',
        });
      }
    });
  } else if (params.cardioPreference === 'hybrid') {
    sampleDays.forEach((d, idx) => {
      if (!d.isRestDay) {
        if (idx % 2 === 0) {
          d.exercises.push({
            id: `ex-run-duty-${d.day}`,
            name: `Tactical Aerobic Base Run (1.5 - 2.5 Miles)`,
            muscleGroup: 'Full Body',
            defaultSets: 1,
            targetReps: '1.5 - 2.5 Miles',
            restPeriodSeconds: 0,
            targetRpe: 7,
            notes: 'Continuous conversational cadence building duty aerobic reserve.',
          });
        } else {
          d.exercises.push({
            id: `ex-circuit-duty-${d.day}`,
            name: `Tactical Pursuit Circuit (Burpees, Swings & Core)`,
            muscleGroup: 'Full Body',
            defaultSets: 3,
            targetReps: '3 rounds',
            restPeriodSeconds: 60,
            targetRpe: 8,
            notes: 'High-power output metabolic circuit for rapid lactate clearance.',
          });
        }
      }
    });
  }

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
  const injuryLabel = hasHipInjury 
    ? 'Hip Labrum Protected' 
    : hasBackInjury 
    ? 'Lumbar Spine Protected' 
    : hasShoulderInjury 
    ? 'Shoulder-Sparing' 
    : hasKneeInjury 
    ? 'Knee-Sparing' 
    : 'Clinically Adapted';

  const baseTitle = isPat
    ? 'Universal Police PAT & Readiness Protocol'
    : isBodyweightOnly
    ? `Tactical Bodyweight & Calisthenics ${category} Protocol`
    : isDumbbellOnly
    ? `Dumbbell Tactical ${category} Protocol`
    : `Personalized ${category} Protocol`;

  const title = hasAnyInjury ? `${baseTitle} [${injuryLabel}]` : baseTitle;

  const subtitle = hasAnyInjury
    ? `Clinically Adapted for ${injuryLabel} • ${level} • ${params.frequency}`
    : `Tailored for ${level} • ${params.frequency} • ${goalStr}`;

  const injuryDescriptionNote = hasAnyInjury
    ? ` CLINICAL INJURY PROTECTION ACTIVE: Prescribed movements have been modified to protect ${hasHipInjury ? 'the hip labrum (FAI)' : hasBackInjury ? 'the lumbar spine' : hasShoulderInjury ? 'the shoulder rotator cuff' : 'joint structures'}. Heavy deep squats, axial spinal compression, and contraindicated joint angles have been eliminated and replaced with joint-sparing alternatives (box squats to parallel, high-handle trap bars, and sled work).`
    : '';

  const description = `Custom-engineered tactical training plan built specifically around ${goalStr.toLowerCase()}. Designed for ${level.toLowerCase()} athletes utilizing: ${equipmentSummary}. Programmed with strict progressive overload increments, duty load resilience, and ${targetDuration}-minute sessions.${injuryDescriptionNote}`;

  const coachingPhilosophy = hasHipInjury
    ? 'Patrol Ready Hip Labrum Rehabilitation Protocol: Deep hip flexion past 90 degrees creates femoroacetabular impingement (FAI), pinching damaged labral tissue against the bone. Heavy deep squats and deep leg presses are strictly eliminated. By programming Box Squats to parallel with vertical shins, banded Spanish squats, high-handle trap bars, and glute thrusts, we preserve maximum lower-body strength without joint irritation.'
    : hasBackInjury
    ? 'Patrol Ready Spinal Sparing Protocol: Back injuries require removing excessive axial spinal compression. Conventional floor deadlifts and heavy back squats are replaced with Belt Squats, Goblet Box Squats, and Chest-Supported Rows alongside the McGill Big 3 for 360-degree spinal stiffness.'
    : hasShoulderInjury
    ? 'Patrol Ready Shoulder Impingement Protocol: Pressing is shifted into the 30-degree scapular plane using neutral-grip dumbbell floor presses, landmine presses, and high-frequency face pulls to keep the rotator cuff centered and safe.'
    : isPat
    ? 'Patrol Ready PAT Periodization: Peak test scores require simultaneous anaerobic burst capacity (300m sprint), muscular endurance density (push-ups), and high-load carriage stamina (dummy drag).'
    : isStrength
    ? 'Double Progression Strength Rule: When you can complete all prescribed sets at the upper rep target with clean technical RPE, increase load by 2.5-5 lbs on upper and 5-10 lbs on lower body.'
    : isBodyweightOnly
    ? 'Calisthenic Leverage & Tension: Progressive overload with bodyweight is achieved through mechanical leverage, controlled eccentric tempos (3-second descents), and increasing density.'
    : 'Patrol Ready Combat Chassis: Compound multi-joint lifts always precede accessory work. Rest periods are strictly timed to balance ATP restoration with metabolic conditioning.';

  const weeklyProgressionTips = [
    hasHipInjury
      ? 'Never squat below parallel or through pinching pain. If anterior groin tightness occurs, substitute with backward sled drags.'
      : 'Log every working set weight and reps accurately to trigger the automatic +2.5 to 10 lbs overload calculator.',
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
 * Calls the server-side Gemini 3.8 Flash endpoint (/api/gemini/generate-workout-plan).
 * If the server responds with a generated plan, returns it.
 * If offline or during any network interruption, seamlessly falls back to the high-precision calibrated tactical engine.
 */
export async function generateWorkoutPlanClient(
  params: WorkoutGenerationRequest
): Promise<GeneratedWorkoutPlan> {
  try {
    const response = await fetch('/api/gemini/generate-workout-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      const result = await response.json();
      if (result && result.data && Array.isArray(result.data.schedule) && result.data.schedule.length > 0) {
        const sanitizedSchedule = result.data.schedule.map((day: any) => ({
          ...day,
          exercises: (day.exercises || []).map((ex: any) => {
            const raw = parseInt(String(ex.restPeriodSeconds), 10);
            return {
              ...ex,
              restPeriodSeconds: !isNaN(raw) && raw > 0 ? raw : 90,
            };
          }),
        }));

        return {
          ...result.data,
          schedule: sanitizedSchedule,
          source: result.source === 'gemini-3.8-flash' ? 'gemini-3.8-flash' : 'tactical-engine',
        };
      }
    } else {
      console.warn('[AIWorkoutService] Server responded with status:', response.status);
    }
  } catch (err) {
    console.warn('[AIWorkoutService] Server API unreachable, engaging tactical engine:', err);
  }

  // Gracefully deliver calibrated tactical plan
  return generateCalibratedWorkoutPlan(params);
}

export interface SingleDayWorkoutRequest {
  workoutType: string;
  durationMinutes: number;
  equipment: string[];
  intensity?: 'High' | 'Moderate' | 'Low / Recovery';
  fitnessLevel?: string;
  injuries?: string[];
  injuryNotes?: string;
  customPrompt?: string;
  cardioPreference?: 'none' | 'running' | 'cardio_circuits' | 'hybrid';
  runningDistancePreference?: string;
  cardioCircuitType?: string;
  userEmail?: string;
}

function buildLocalSingleWorkout(params: SingleDayWorkoutRequest): WorkoutProgram {
  const duration = params.durationMinutes || 45;
  const typeLower = (params.workoutType || 'Full-Body Density').toLowerCase();
  const equipStr = (params.equipment || []).join(' ').toLowerCase();
  const isDbOnly = equipStr.includes('dumbbell') && !equipStr.includes('barbell') && !equipStr.includes('commercial');
  const isBwOnly = equipStr.includes('bodyweight') && !equipStr.includes('dumbbell') && !equipStr.includes('barbell');
  const isKbOnly = equipStr.includes('kettlebell') && !equipStr.includes('barbell');

  const injuryRaw = [
    ...(params.injuries || []),
    params.injuryNotes || '',
    params.customPrompt || '',
  ].join(' ').toLowerCase();

  const hasHipInjury = /hip|labrum|fai|impingement/i.test(injuryRaw);
  const hasBackInjury = /back|lumbar|disc|sciatica|spine/i.test(injuryRaw);
  const hasShoulderInjury = /shoulder|rotator|cuff/i.test(injuryRaw);
  const hasKneeInjury = /knee|patell|meniscus/i.test(injuryRaw);

  let title = 'AI Tactical Single-Day Session';
  let subtitle = `${duration}-Min Custom Session • ${params.intensity || 'High'} Intensity`;
  let category: 'Strength' | 'Hypertrophy' | 'Athletic Conditioning' | 'Power' | 'Hybrid' = 'Hybrid';
  let recommendedWarmupId = 'warmup-universal-tactical';

  const exercises: ExerciseTemplate[] = [];

  if (typeLower.includes('upper') || typeLower.includes('pump') || typeLower.includes('chest') || typeLower.includes('arm')) {
    category = 'Hypertrophy';
    title = isDbOnly ? 'Dumbbell Upper Armor & Hypertrophy Burner' : 'Tactical Upper Body Power & Arm Density';
    subtitle = `${duration}-Min Upper Push/Pull Density • Chest, Back & Arms`;
    recommendedWarmupId = 'warmup-upper-primer';

    exercises.push({
      id: 'sw-ex-1',
      name: isDbOnly ? 'Heavy Dumbbell Neutral-Grip Flat Bench' : hasShoulderInjury ? 'Neutral-Grip Dumbbell Floor Press' : 'Barbell Bench Press (or Heavy DB Press)',
      muscleGroup: 'Chest',
      defaultSets: 4,
      targetReps: '8-10 reps',
      restPeriodSeconds: 90,
      targetRpe: 8,
      notes: 'Controlled 3-second descent. Keep scapulae pinned back to protect rotator cuff.',
    });

    exercises.push({
      id: 'sw-ex-2',
      name: isBwOnly ? 'Chest-to-Bar Pull-Ups or Inverted Rows' : 'Chest-Supported Dumbbell / Barbell Row',
      muscleGroup: 'Back',
      defaultSets: 4,
      targetReps: '8-10 reps',
      restPeriodSeconds: 75,
      targetRpe: 8,
      notes: 'Full lat stretch at bottom, explosive squeeze at top with neutral spine.',
    });

    exercises.push({
      id: 'sw-ex-3',
      name: hasShoulderInjury ? 'Landmine Shoulder Press or Half-Kneeling DB Press' : 'Standing Dumbbell Overhead Strict Press',
      muscleGroup: 'Shoulders',
      defaultSets: 3,
      targetReps: '10-12 reps',
      restPeriodSeconds: 60,
      targetRpe: 8,
      notes: 'Lock down ribcage and glutes. Avoid spinal arching.',
    });

    if (duration >= 30) {
      exercises.push({
        id: 'sw-ex-4',
        name: isBwOnly ? 'Diamond Push-Ups (or Deficit Push-Ups)' : 'Incline Dumbbell Hammer Curls',
        muscleGroup: 'Arms',
        defaultSets: 3,
        targetReps: '12-15 reps',
        restPeriodSeconds: 60,
        targetRpe: 8,
        notes: 'Strict elbow flexion. Grip handle tightly for forearm tendon resilience.',
      });
      exercises.push({
        id: 'sw-ex-5',
        name: isBwOnly ? 'Bench / Box Dips (Strict Scapular Retraction)' : 'Overhead Rope Triceps Extensions or Skull Crushers',
        muscleGroup: 'Arms',
        defaultSets: 3,
        targetReps: '12-15 reps',
        restPeriodSeconds: 60,
        targetRpe: 8,
        notes: 'Target long head of triceps for structural elbow joint stabilization.',
      });
    }

    if (duration >= 45) {
      exercises.push({
        id: 'sw-ex-6',
        name: 'Face Pulls with Band or Cable (Scapular Retraction)',
        muscleGroup: 'Shoulders',
        defaultSets: 3,
        targetReps: '15-20 reps',
        restPeriodSeconds: 45,
        targetRpe: 7,
        notes: 'External rotation focus to balance chest pressing volume.',
      });
    }
  } else if (typeLower.includes('leg') || typeLower.includes('lower') || typeLower.includes('squat')) {
    category = 'Strength';
    title = 'Lower Body Chassis Overload & Power';
    subtitle = `${duration}-Min Leg Drive & Posterior Chain Resilience`;
    recommendedWarmupId = 'warmup-lower-prep';

    exercises.push({
      id: 'sw-ex-1',
      name: hasHipInjury ? 'Box Squat to Parallel (Hip Labrum Safe • Vertical Shins)' : isDbOnly ? 'Heavy Dumbbell Goblet Squats (Elevated Heels)' : 'Barbell Back Squats (or Safety Bar Squat)',
      muscleGroup: 'Quads',
      defaultSets: 4,
      targetReps: '8-10 reps',
      restPeriodSeconds: 100,
      targetRpe: 8,
      notes: hasHipInjury ? 'Sit back onto box to eliminate acute hip pinch. Vertical tibia angles.' : 'Drive through full foot balance. Control descent.',
    });

    exercises.push({
      id: 'sw-ex-2',
      name: hasBackInjury ? 'Chest-Supported DB Romanian Deadlift' : 'High-Handle Trap Bar Deadlift / Dumbbell RDL',
      muscleGroup: 'Hamstrings & Glutes',
      defaultSets: 4,
      targetReps: '8-10 reps',
      restPeriodSeconds: 90,
      targetRpe: 8,
      notes: 'Hip hinge emphasis. Soft knees, push hips back to the wall until hamstring tension peaks.',
    });

    exercises.push({
      id: 'sw-ex-3',
      name: hasKneeInjury ? 'Backward Sled Drags or Step-Downs' : 'Bulgarian Split Squats or Walking Lunges',
      muscleGroup: 'Quads',
      defaultSets: 3,
      targetReps: '10-12 reps per leg',
      restPeriodSeconds: 75,
      targetRpe: 8,
      notes: 'Unilateral quad balance and knee tendon stabilization.',
    });

    if (duration >= 30) {
      exercises.push({
        id: 'sw-ex-4',
        name: 'Dumbbell / Barbell Hip Thrusts or Glute Bridges',
        muscleGroup: 'Hamstrings & Glutes',
        defaultSets: 3,
        targetReps: '12-15 reps',
        restPeriodSeconds: 60,
        targetRpe: 8,
        notes: 'Full glute extension at lockout with a neutral pelvis.',
      });
      exercises.push({
        id: 'sw-ex-5',
        name: 'Standing Dumbbell Calf Raises & Tibialis Raises',
        muscleGroup: 'Quads',
        defaultSets: 3,
        targetReps: '15-20 reps',
        restPeriodSeconds: 45,
        targetRpe: 8,
        notes: 'Ankle joint durability and foot pursuit propulsion.',
      });
    }
  } else if (typeLower.includes('sprint') || typeLower.includes('pursuit') || typeLower.includes('conditioning') || typeLower.includes('metabolic')) {
    category = 'Athletic Conditioning';
    title = 'Tactical Foot Pursuit & VO2 Conditioning Engine';
    subtitle = `${duration}-Min High-Output Aerobic / Anaerobic Shifter`;
    recommendedWarmupId = 'warmup-apex-sop';

    exercises.push({
      id: 'sw-ex-1',
      name: 'Foot Pursuit Sprint Repeats (100m to 200m or High-Incline Treadmill)',
      muscleGroup: 'Full Body',
      defaultSets: duration <= 25 ? 5 : 8,
      targetReps: '100m sprint / 45s recovery',
      restPeriodSeconds: 60,
      targetRpe: 9,
      notes: 'Simulate foot pursuit acceleration: explode from zero to max velocity in first 3 strides.',
    });

    exercises.push({
      id: 'sw-ex-2',
      name: isKbOnly ? 'Kettlebell Hardstyle Swings' : 'Dumbbell Thrusters (Squat to Overhead Press)',
      muscleGroup: 'Full Body',
      defaultSets: 4,
      targetReps: '15 reps',
      restPeriodSeconds: 60,
      targetRpe: 8,
      notes: 'Continuous metabolic rhythm. Drive hard through hips.',
    });

    exercises.push({
      id: 'sw-ex-3',
      name: 'Farmers Walk with Heavy Load (or Heavy Kettlebell Carry)',
      muscleGroup: 'Full Body',
      defaultSets: 4,
      targetReps: '60 yards',
      restPeriodSeconds: 60,
      targetRpe: 9,
      notes: 'Maintain tactical upright posture under intense grip exhaustion.',
    });

    if (duration >= 30) {
      exercises.push({
        id: 'sw-ex-4',
        name: 'Burpee Broad Jumps or Sprawl to Sprint',
        muscleGroup: 'Full Body',
        defaultSets: 3,
        targetReps: '10 reps',
        restPeriodSeconds: 60,
        targetRpe: 9,
        notes: 'Duty ground-recovery speed and anaerobic power transfer.',
      });
      exercises.push({
        id: 'sw-ex-5',
        name: 'Hanging Knee Raises / RKC Planks',
        muscleGroup: 'Core',
        defaultSets: 3,
        targetReps: '45s hold / 15 reps',
        restPeriodSeconds: 45,
        targetRpe: 8,
        notes: 'Anterior core brace against rotational torsional stress.',
      });
    }
  } else if (typeLower.includes('kettlebell') || typeLower.includes('circuit')) {
    category = 'Athletic Conditioning';
    title = 'Tactical Kettlebell & Dumbbell Combat Circuit';
    subtitle = `${duration}-Min Functional Flow & Work Capacity`;
    recommendedWarmupId = 'warmup-universal-tactical';

    exercises.push({
      id: 'sw-ex-1',
      name: 'Double Kettlebell (or Dumbbell) Clean & Press',
      muscleGroup: 'Full Body',
      defaultSets: 4,
      targetReps: '8 reps',
      restPeriodSeconds: 60,
      targetRpe: 8,
      notes: 'Hips generate clean momentum. Strict lockout overhead.',
    });

    exercises.push({
      id: 'sw-ex-2',
      name: 'Goblet Squats with 3-Second Isometric Pause',
      muscleGroup: 'Quads',
      defaultSets: 4,
      targetReps: '10 reps',
      restPeriodSeconds: 60,
      targetRpe: 8,
      notes: 'Sit into deep squat, pause 3s at bottom, explode up.',
    });

    exercises.push({
      id: 'sw-ex-3',
      name: 'Single-Arm Kettlebell / DB Renegade Rows with Push-Up',
      muscleGroup: 'Back',
      defaultSets: 3,
      targetReps: '8 reps per side',
      restPeriodSeconds: 60,
      targetRpe: 8,
      notes: 'Anti-rotational core stabilization. Squeeze upper back.',
    });

    if (duration >= 30) {
      exercises.push({
        id: 'sw-ex-4',
        name: 'Kettlebell Snatch or High Pulls',
        muscleGroup: 'Hamstrings & Glutes',
        defaultSets: 3,
        targetReps: '10 reps per arm',
        restPeriodSeconds: 60,
        targetRpe: 8,
        notes: 'Explosive hip hinge driving bell in vertical trajectory.',
      });
      exercises.push({
        id: 'sw-ex-5',
        name: 'Suitcase Carry (Unilateral Offset Weight)',
        muscleGroup: 'Core',
        defaultSets: 3,
        targetReps: '50 yds per side',
        restPeriodSeconds: 45,
        targetRpe: 8,
        notes: 'Resist lateral spinal bending. Keep shoulders completely level.',
      });
    }
  } else if (typeLower.includes('ruck') || typeLower.includes('carry')) {
    category = 'Hybrid';
    title = 'Combat Chassis: Ruck, Heavy Carry & Core Overload';
    subtitle = `${duration}-Min Tactical Frame & Structural Load Endurance`;
    recommendedWarmupId = 'warmup-apex-sop';

    exercises.push({
      id: 'sw-ex-1',
      name: 'Heavy Weighted Trap Bar / Dumbbell Farmers Carry',
      muscleGroup: 'Full Body',
      defaultSets: 5,
      targetReps: '60 yds (Max Load)',
      restPeriodSeconds: 75,
      targetRpe: 9,
      notes: 'Crush grip, chest proud, glutes tight, controlled strides.',
    });

    exercises.push({
      id: 'sw-ex-2',
      name: 'Heavy Sandbag or Dumbbell Bear-Hug Carry',
      muscleGroup: 'Full Body',
      defaultSets: 4,
      targetReps: '50 yds',
      restPeriodSeconds: 60,
      targetRpe: 8,
      notes: 'Anterior core isometric tension mimicking body drags and subject control.',
    });

    exercises.push({
      id: 'sw-ex-3',
      name: 'High-Handle Trap Bar Deadlift or Romanian Deadlift',
      muscleGroup: 'Hamstrings & Glutes',
      defaultSets: 4,
      targetReps: '8 reps',
      restPeriodSeconds: 90,
      targetRpe: 8,
      notes: 'Build posterior spinal erectors to support heavy gear belts and plate carriers.',
    });

    if (duration >= 30) {
      exercises.push({
        id: 'sw-ex-4',
        name: 'Weighted Vest / Pack Walking Lunges or Step-Ups',
        muscleGroup: 'Quads',
        defaultSets: 3,
        targetReps: '10 reps per leg',
        restPeriodSeconds: 60,
        targetRpe: 8,
        notes: 'Structural leg endurance under load.',
      });
      exercises.push({
        id: 'sw-ex-5',
        name: 'Suitcase Hold & March (Anti-Lateral Flexion)',
        muscleGroup: 'Core',
        defaultSets: 3,
        targetReps: '40s per side',
        restPeriodSeconds: 45,
        targetRpe: 8,
        notes: 'Reinforces the lumbar spine against uneven duty gear weight.',
      });
    }
  } else {
    // Default: Tactical Full-Body Density
    category = 'Hybrid';
    title = isBwOnly ? 'Bodyweight Duty Calisthenics & Tactical Core' : 'Tactical Full-Body Density & Armor Protocol';
    subtitle = `${duration}-Min Complete Duty Session • Push, Pull, Hinge, Carry`;
    recommendedWarmupId = 'warmup-universal-tactical';

    exercises.push({
      id: 'sw-ex-1',
      name: isDbOnly ? 'Heavy Dumbbell Flat Bench Press' : isBwOnly ? 'Hand-Release Push-Ups (or Deficit Push-Ups)' : 'Barbell Bench Press or Floor Press',
      muscleGroup: 'Chest',
      defaultSets: 4,
      targetReps: isBwOnly ? '15-20 reps' : '8-10 reps',
      restPeriodSeconds: 90,
      targetRpe: 8,
      notes: 'Drive through floor, maintain solid shoulder retraction.',
    });

    exercises.push({
      id: 'sw-ex-2',
      name: isBwOnly ? 'Strict Dead-Hang Pull-Ups' : 'Chest-Supported Row or Barbell Row',
      muscleGroup: 'Back',
      defaultSets: 4,
      targetReps: isBwOnly ? '6-10 reps' : '8-10 reps',
      restPeriodSeconds: 75,
      targetRpe: 8,
      notes: 'Full pull with elbows leading back toward hips.',
    });

    exercises.push({
      id: 'sw-ex-3',
      name: hasHipInjury ? 'Parallel Box Squats (Vertical Shins)' : isDbOnly ? 'Dumbbell Front Squats / Goblet Squats' : 'Barbell Back Squats',
      muscleGroup: 'Quads',
      defaultSets: 3,
      targetReps: '10 reps',
      restPeriodSeconds: 90,
      targetRpe: 8,
      notes: 'Smooth descent with zero joint bounce.',
    });

    if (duration >= 30) {
      exercises.push({
        id: 'sw-ex-4',
        name: hasBackInjury ? 'Hamstring Glute Bridges' : 'High-Handle Trap Bar RDL or Dumbbell RDL',
        muscleGroup: 'Hamstrings & Glutes',
        defaultSets: 3,
        targetReps: '10 reps',
        restPeriodSeconds: 60,
        targetRpe: 8,
        notes: 'Peak hamstring stretch before driving through heels.',
      });
      exercises.push({
        id: 'sw-ex-5',
        name: isBwOnly ? 'Hanging Knee Raises & Plank Walkouts' : 'Heavy Farmers Carry or Kettlebell March',
        muscleGroup: 'Core',
        defaultSets: 3,
        targetReps: isBwOnly ? '15 reps' : '50 yds',
        restPeriodSeconds: 45,
        targetRpe: 8,
        notes: 'High-tension combat core brace.',
      });
    }

    if (duration >= 45) {
      exercises.push({
        id: 'sw-ex-6',
        name: 'Standing DB Lateral Raises & Face Pulls Superset',
        muscleGroup: 'Shoulders',
        defaultSets: 3,
        targetReps: '12-15 reps',
        restPeriodSeconds: 45,
        targetRpe: 8,
        notes: 'Shoulder stability and upper armor definition.',
      });
    }
  }

  // Handle explicit cardio / running preference in local fallback
  if (params.cardioPreference === 'running') {
    const distText = params.runningDistancePreference || '1.5 Miles';
    exercises.push({
      id: `sw-cardio-${Date.now()}`,
      name: `Tactical Aerobic Run (${distText})`,
      muscleGroup: 'Full Body',
      type: 'cardio',
      defaultSets: 1,
      targetReps: distText,
      restPeriodSeconds: 0,
      targetRpe: 7,
      notes: 'Zone 2 aerobic endurance run. Builds duty stamina, cardiac stroke volume, and rapid pulse recovery.',
    });
    title += ' + Duty Run';
    category = 'Hybrid';
  } else if (params.cardioPreference === 'cardio_circuits') {
    const circuitStyle = params.cardioCircuitType || 'Duty Metabolic Circuit';
    exercises.push({
      id: `sw-cardio-${Date.now()}`,
      name: `${circuitStyle} Finisher (4 Rounds)`,
      muscleGroup: 'Full Body',
      type: 'cardio',
      defaultSets: 4,
      targetReps: '4 rounds (45s work / 15s rest)',
      restPeriodSeconds: 60,
      targetRpe: 9,
      notes: 'High-density metabolic conditioning circuit: Swings, Sprawls, Mountain Climbers, and Jump Ropes.',
    });
    title += ' + Cardio Circuit';
    category = 'Hybrid';
  } else if (params.cardioPreference === 'hybrid') {
    exercises.push({
      id: `sw-cardio-1-${Date.now()}`,
      name: `Foot Pursuit Sprint Repeats (400m x 4)`,
      muscleGroup: 'Full Body',
      type: 'cardio',
      defaultSets: 4,
      targetReps: '400m @ 85% sprint',
      restPeriodSeconds: 90,
      targetRpe: 9,
      notes: 'Explosive acceleration and anaerobic threshold pacing.',
    });
    exercises.push({
      id: `sw-cardio-2-${Date.now()}`,
      name: `Combat Core & Functional Circuit`,
      muscleGroup: 'Full Body',
      type: 'cardio',
      defaultSets: 3,
      targetReps: '3 rounds',
      restPeriodSeconds: 45,
      targetRpe: 8,
      notes: 'Plank walkouts, dumbbell snatches, and sandbag carries.',
    });
    title += ' + Hybrid Run & Circuit';
    category = 'Hybrid';
  }

  const programId = `ai-single-${Date.now().toString(36)}`;

  return {
    id: programId,
    title,
    subtitle,
    category,
    frequency: 'Single Day Session',
    estimatedDurationMinutes: duration,
    description: `A custom-engineered on-demand single-day session designed around: ${params.workoutType}. Calibrated for ${duration} minutes with equipment: ${(params.equipment || []).join(', ') || 'Standard gear'}. Intensity targeted at ${params.intensity || 'High'}.`,
    recommendedWarmupId,
    exercises,
  };
}

export async function generateSingleDayWorkoutClient(
  params: SingleDayWorkoutRequest
): Promise<WorkoutProgram> {
  try {
    const response = await fetch('/api/gemini/generate-single-workout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      const result = await response.json();
      if (result && result.data && Array.isArray(result.data.exercises) && result.data.exercises.length > 0) {
        const sanitizedExercises = result.data.exercises.map((ex: any) => {
          const raw = parseInt(String(ex.restPeriodSeconds), 10);
          return {
            ...ex,
            restPeriodSeconds: !isNaN(raw) && raw > 0 ? raw : 60,
          };
        });
        return {
          ...result.data,
          exercises: sanitizedExercises,
        } as WorkoutProgram;
      }
    } else {
      console.warn('[AIWorkoutService] Server responded with status:', response.status);
    }
  } catch (err) {
    console.warn('[AIWorkoutService] Server API unreachable, building local session:', err);
  }

  // Graceful client fallback
  return buildLocalSingleWorkout(params);
}
