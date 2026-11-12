import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, Modality, LiveServerMessage } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { 
  buildDynamicCalibratedPlan, 
  extractBannedMovements, 
  sanitizePlanAgainstLimitations,
  getDistinctCircuitForDay,
  sanitizeExerciseList,
  validateAndFixSplitLogic,
  periodizeSchedule
} from './tacticalEngineServer.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface WorkoutGenerationRequest {
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
}

// Dynamic tactical plan generator in case API key is missing or quota exceeded
function generateFallbackWorkoutPlan(params: WorkoutGenerationRequest) {
  return buildDynamicCalibratedPlan(params);
}

function _legacyUnusedFallback(params: WorkoutGenerationRequest) {
  const goalStr = params.goals?.join(', ') || 'General Conditioning';
  const isHypertrophy = params.goals?.some(g => g.toLowerCase().includes('hypertrophy') || g.toLowerCase().includes('muscle'));
  const isStrength = params.goals?.some(g => g.toLowerCase().includes('strength') || g.toLowerCase().includes('power'));
  const isEndurance = params.goals?.some(g => g.toLowerCase().includes('endurance') || g.toLowerCase().includes('loss'));

  const injuryRaw = [
    ...(params.injuries || []),
    params.injuryNotes || '',
    params.notes || '',
  ].join(' ');
  const injuryLower = injuryRaw.toLowerCase();
  const hasHipInjury = /hip|labrum|fai|impingement|groin|acetabul/i.test(injuryLower);
  const hasBackInjury = /back|lumbar|disc|herniat|sciatica|spine/i.test(injuryLower);
  const hasShoulderInjury = /shoulder|rotator|cuff|ac joint/i.test(injuryLower);

  const category = isStrength ? 'Strength' : isHypertrophy ? 'Hypertrophy' : isEndurance ? 'Athletic Conditioning' : 'Hybrid';
  const durationDays = params.scheduleDuration === 'monthly' ? 28 : 7;
  const daysPerWeek = parseInt(params.frequency, 10) || 4;

  const sampleDays = [
    {
      day: 1,
      focus: 'Day 1: Heavy Armor Upper Body & Horizontal Press/Pull',
      isRestDay: false,
      exercises: [
        {
          id: 'ex-ai-1',
          name: 'Barbell Bench Press (or Heavy DB Floor Press)',
          muscleGroup: 'Chest' as const,
          defaultSets: 4,
          targetReps: isStrength ? '5 reps' : '8-10 reps',
          restPeriodSeconds: 120,
          targetRpe: 8,
          notes: 'Lower with controlled 3-second eccentric. Explode through lockout.',
        },
        {
          id: 'ex-ai-2',
          name: 'Chest-Supported Row or Barbell Pendlay Row',
          muscleGroup: 'Back' as const,
          defaultSets: 4,
          targetReps: '8-10 reps',
          restPeriodSeconds: 90,
          targetRpe: 8,
          notes: 'Full scapular retraction at top. Squeeze lats for 1 second.',
        },
        {
          id: 'ex-ai-3',
          name: 'Standing Overhead Barbell/Dumbbell Military Press',
          muscleGroup: 'Shoulders' as const,
          defaultSets: 3,
          targetReps: '8-12 reps',
          restPeriodSeconds: 90,
          targetRpe: 8,
          notes: 'Glutes and core locked down. Press in a straight vertical bar path.',
        },
        {
          id: 'ex-ai-4',
          name: 'Weighted or Assisted Pull-Ups',
          muscleGroup: 'Back' as const,
          defaultSets: 3,
          targetReps: '6-8 reps',
          restPeriodSeconds: 90,
          targetRpe: 8,
          notes: 'Full dead-hang at bottom, chest up to touch the bar.',
        },
        {
          id: 'ex-ai-5',
          name: 'Hanging Knee Raises / Hollow Body Rocks',
          muscleGroup: 'Core' as const,
          defaultSets: 3,
          targetReps: '15-20 reps',
          restPeriodSeconds: 60,
          targetRpe: 7,
          notes: 'Strict core tension. Avoid swinging or momentum.',
        },
      ],
    },
    {
      day: 2,
      focus: hasHipInjury
        ? 'Day 2: Lower Body Power & Hip-Sparing Kinetic Chain (Labrum Protected)'
        : 'Day 2: Lower Body Kinetic Power & Posterior Chain',
      isRestDay: false,
      exercises: hasHipInjury ? [
        {
          id: 'ex-ai-6',
          name: 'Box Squat to Parallel (Hip Labrum & Joint Protection)',
          muscleGroup: 'Quads' as const,
          defaultSets: 4,
          targetReps: '8-10 reps',
          restPeriodSeconds: 90,
          targetRpe: 7,
          notes: 'CLINICAL LABRUM PROTOCOL: Box height set to 90° or slightly above. Keep shins vertical and sit back into hips. Eliminates femoral head impingement against acetabular labrum. Never dive below parallel.',
        },
        {
          id: 'ex-ai-7',
          name: 'High-Handle Trap Bar RDL (Restricted Hip Hinge Depth)',
          muscleGroup: 'Hamstrings & Glutes' as const,
          defaultSets: 4,
          targetReps: '8-10 reps',
          restPeriodSeconds: 90,
          targetRpe: 7,
          notes: 'Hinge back with soft knees only to mid-shin level. Stop before any pinch or tension at anterior hip socket.',
        },
        {
          id: 'ex-ai-8',
          name: 'Banded Spanish Squats or Terminal Knee Extensions (TKE)',
          muscleGroup: 'Quads' as const,
          defaultSets: 3,
          targetReps: '12-15 reps',
          restPeriodSeconds: 60,
          targetRpe: 7,
          notes: 'Heavy band behind knees forces vertical tibia. Delivers intense quad hypertrophy with zero hip joint irritation.',
        },
        {
          id: 'ex-ai-8b',
          name: 'Barbell or Dumbbell Hip Thrusts (Neutral Pelvis)',
          muscleGroup: 'Hamstrings & Glutes' as const,
          defaultSets: 3,
          targetReps: '10-12 reps',
          restPeriodSeconds: 75,
          targetRpe: 8,
          notes: 'Drive through heels. Squeeze glutes at top lockout with neutral pelvis. Does not enter deep hip flexion, keeping labrum safe.',
        },
      ] : [
        {
          id: 'ex-ai-6',
          name: 'Barbell Back Squat or Trap Bar Deadlift',
          muscleGroup: 'Quads' as const,
          defaultSets: 4,
          targetReps: isStrength ? '5 reps' : '6-8 reps',
          restPeriodSeconds: 150,
          targetRpe: 8,
          notes: 'Brace abdominal wall tightly against duty belt line. Drive knees out.',
        },
        {
          id: 'ex-ai-7',
          name: 'Romanian Deadlift (RDL)',
          muscleGroup: 'Hamstrings & Glutes' as const,
          defaultSets: 3,
          targetReps: '8-10 reps',
          restPeriodSeconds: 90,
          targetRpe: 8,
          notes: 'Hips back until hamstring stretch is felt. Maintain neutral lumbar spine.',
        },
        {
          id: 'ex-ai-8',
          name: 'Bulgarian Split Squats (or Walking DB Lunges)',
          muscleGroup: 'Quads' as const,
          defaultSets: 3,
          targetReps: '10-12 reps/leg',
          restPeriodSeconds: 75,
          targetRpe: 8,
          notes: 'Unilateral stability for duty sprint velocity and knee health.',
        },
        {
          id: 'ex-ai-9',
          name: 'Standing Heavy Calf Raises',
          muscleGroup: 'Hamstrings & Glutes' as const,
          defaultSets: 3,
          targetReps: '15 reps',
          restPeriodSeconds: 60,
          targetRpe: 7,
          notes: '2-second stretch at bottom, explosive drive onto big toes.',
        },
        {
          id: 'ex-ai-10',
          name: 'Standing Suitcase Carries',
          muscleGroup: 'Core' as const,
          defaultSets: 3,
          targetReps: '50 yds/side',
          restPeriodSeconds: 60,
          targetRpe: 7,
          notes: 'Antilateral flexion. Walk upright with zero torso tilting.',
        },
      ],
    },
    {
      day: 3,
      focus: 'Day 3: Active Tactical Recovery & Mobility Flush',
      isRestDay: true,
      exercises: [],
    },
    {
      day: 4,
      focus: 'Day 4: Tactical Upper Hypertrophy & Arm Armor',
      isRestDay: false,
      exercises: [
        {
          id: 'ex-ai-11',
          name: 'Incline Dumbbell Bench Press',
          muscleGroup: 'Chest' as const,
          defaultSets: 4,
          targetReps: '10-12 reps',
          restPeriodSeconds: 90,
          targetRpe: 8,
          notes: 'Upper clavicular head focus. Controlled eccentric.',
        },
        {
          id: 'ex-ai-12',
          name: 'Neutral Grip Lat Pulldown or Single-Arm Cable Row',
          muscleGroup: 'Back' as const,
          defaultSets: 4,
          targetReps: '10-12 reps',
          restPeriodSeconds: 75,
          targetRpe: 8,
          notes: 'Pull elbows toward back pockets to hit lower lats.',
        },
        {
          id: 'ex-ai-13',
          name: 'Dumbbell Lateral Raises (Heavy Leaning or Cable)',
          muscleGroup: 'Shoulders' as const,
          defaultSets: 4,
          targetReps: '12-15 reps',
          restPeriodSeconds: 60,
          targetRpe: 8,
          notes: 'Slight forward lean, lead with elbows for medial delt cap.',
        },
        {
          id: 'ex-ai-14',
          name: 'Overhead Cable Triceps Extensions & Barbell Biceps Curls',
          muscleGroup: 'Arms' as const,
          defaultSets: 3,
          targetReps: '12-15 reps',
          restPeriodSeconds: 60,
          targetRpe: 8,
          notes: 'Superset arms for combat grip strength and elbow tendon resilience.',
        },
      ],
    },
    {
      day: 5,
      focus: 'Day 5: Posterior Chain Overload & Tactical Conditioning',
      isRestDay: false,
      exercises: [
        {
          id: 'ex-ai-15',
          name: 'Conventional Deadlift or Heavy Kettlebell Swings',
          muscleGroup: 'Hamstrings & Glutes' as const,
          defaultSets: 4,
          targetReps: isStrength ? '4-6 reps' : '8-10 reps',
          restPeriodSeconds: 150,
          targetRpe: 8,
          notes: 'Maximum whole-body recruitment. Solid hip hinge lockout.',
        },
        {
          id: 'ex-ai-16',
          name: 'Front Squats or Goblet Squats',
          muscleGroup: 'Quads' as const,
          defaultSets: 3,
          targetReps: '8-10 reps',
          restPeriodSeconds: 90,
          targetRpe: 8,
          notes: 'High torso angle builds anterior core and quadriceps depth.',
        },
        {
          id: 'ex-ai-17',
          name: 'Farmers Walk with Heavy Dumbbells or Trap Bar',
          muscleGroup: 'Full Body' as const,
          defaultSets: 4,
          targetReps: '60 yds',
          restPeriodSeconds: 90,
          targetRpe: 9,
          notes: 'Crush grip, chest proud, short rapid steps.',
        },
      ],
    },
    {
      day: 6,
      focus: 'Day 6: Aerobic Base Flush or Tactical Ruck Interval',
      isRestDay: daysPerWeek < 5,
      exercises: daysPerWeek < 5 ? [] : [
        {
          id: 'ex-ai-18',
          name: 'Zone 2 Ruck or Trail Run (35-45 lbs)',
          muscleGroup: 'Full Body' as const,
          defaultSets: 1,
          targetReps: '3.0 - 4.0 miles',
          restPeriodSeconds: 0,
          targetRpe: 6,
          notes: 'Conversational pace (120-140 BPM). Aerobic cardiac stroke volume development.',
        },
      ],
    },
    {
      day: 7,
      focus: 'Day 7: Full Regeneration & Ready State Mobility',
      isRestDay: true,
      exercises: [],
    },
  ];

  // If user requested running, cardio circuits, or hybrid, integrate into sampleDays
  if (params.cardioPreference === 'running') {
    const distText = params.runningDistancePreference || '1.5-2.0 Miles';
    sampleDays.forEach((d) => {
      if (!d.isRestDay) {
        d.exercises.push({
          id: `ex-run-${d.day}`,
          name: `Tactical Duty Aerobic Run (${distText})`,
          muscleGroup: 'Full Body' as const,
          defaultSets: 1,
          targetReps: distText,
          restPeriodSeconds: 0,
          targetRpe: 7,
          notes: 'Zone 2 steady-state run for cardiac output and duty stamina.',
        });
      }
    });
  } else if (params.cardioPreference === 'cardio_circuits') {
    const circuitStyle = params.cardioCircuitType || 'Duty Metabolic Circuit';
    sampleDays.forEach((d) => {
      if (!d.isRestDay) {
        d.exercises.push({
          id: `ex-circuit-${d.day}`,
          name: `${circuitStyle} Finisher`,
          muscleGroup: 'Full Body' as const,
          type: 'circuit',
          defaultSets: 3,
          targetReps: '3 rounds (40s work / 20s rest)',
          restPeriodSeconds: 60,
          targetRpe: 8,
          notes: 'Circuit Stations: 1. Kettlebell Swings (40s), 2. Combat Sprawls / Burpees (40s), 3. Mountain Climbers (40s), 4. Loaded Farmer Marches (40s). Continuous rotation, 60s recovery between rounds.',
        });
      }
    });
  } else if (params.cardioPreference === 'hybrid') {
    sampleDays.forEach((d, idx) => {
      if (!d.isRestDay) {
        if (idx % 2 === 0) {
          d.exercises.push({
            id: `ex-run-${d.day}`,
            name: `Duty Aerobic Base Run (1.5 - 2.5 Miles)`,
            muscleGroup: 'Full Body' as const,
            defaultSets: 1,
            targetReps: '1.5 - 2.5 Miles',
            restPeriodSeconds: 0,
            targetRpe: 7,
            notes: 'Steady aerobic endurance run.',
          });
        } else {
          d.exercises.push({
            id: `ex-circuit-${d.day}`,
            name: `Combat Metabolic Conditioning Circuit`,
            muscleGroup: 'Full Body' as const,
            type: 'circuit',
            defaultSets: 3,
            targetReps: '3 rounds (40s work / 20s rest)',
            restPeriodSeconds: 60,
            targetRpe: 8,
            notes: 'Circuit Stations: 1. Combat Burpees (40s), 2. Kettlebell Swings (40s), 3. Speed Mountain Climbers (40s), 4. Plank Knee Drives (40s). 60s round rest.',
          });
        }
      }
    });
  }

  // If monthly duration requested, repeat the weekly block structure across 4 weeks with progression notes
  const fullSchedule = [];
  if (params.scheduleDuration === 'monthly') {
    for (let w = 0; w < 4; w++) {
      for (const d of sampleDays) {
        const dayNumber = w * 7 + d.day;
        const weekLabel = `Week ${w + 1}`;
        fullSchedule.push({
          day: dayNumber,
          focus: `${weekLabel} - ${d.focus}`,
          isRestDay: d.isRestDay,
          exercises: d.exercises.map(ex => ({
            ...ex,
            id: `${ex.id}-w${w + 1}`,
            notes: w === 3 ? `${ex.notes} [Deload/Peak week: reduce volume by 25% to consolidate gains]` : ex.notes,
          })),
        });
      }
    }
  } else {
    fullSchedule.push(...sampleDays);
  }

  return {
    title: `AI Personalized ${category} Protocol`,
    subtitle: `Custom tailored for ${params.fitnessLevel} • ${params.frequency} • ${goalStr}`,
    category,
    frequency: params.frequency,
    scheduleDuration: params.scheduleDuration === 'monthly' ? '4-Week Monthly Protocol' : '7-Day Rotation',
    estimatedDurationMinutes: params.sessionDurationMinutes || 55,
    description: `Scientifically calibrated ${category.toLowerCase()} protocol designed specifically around ${goalStr.toLowerCase()}. Built with progressive overload mechanisms, optimal recovery pacing for ${params.fitnessLevel.toLowerCase()} athletes, and formatted to run with equipment: ${params.equipment?.join(', ') || 'Standard gym equipment'}.`,
    coachingPhilosophy: `Patrol Ready Performance periodization: Compound multi-joint lifts come first when neural drive is highest, followed by targeted structural hypertrophy and stabilization. Rest intervals are strictly timed to balance ATP-CP restoration with metabolic stress.`,
    weeklyProgressionTips: [
      'Apply double progression: when you achieve the upper target rep count across all working sets, increase load by 2.5-5 lbs on upper body and 5-10 lbs on lower body.',
      'Maintain RPE discipline: leave 1-2 reps in reserve on compound lifts to prevent systemic central nervous system burnout.',
      'Sleep minimum 7.5 hours per night for hormone optimization and muscle tissue repair.',
    ],
    nutritionAdvice: isHypertrophy
      ? 'Consume 0.8-1.0g protein per lb of bodyweight daily with a slight 250-350 kcal surplus.'
      : 'Maintain high protein intake (1.0g/lb) with whole-food nutrient density and adequate hydration with electrolytes.',
    schedule: fullSchedule,
  };
}

interface SingleWorkoutRequest {
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

function generateFallbackSingleWorkout(params: SingleWorkoutRequest) {
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

  const exercises: Array<{
    id: string;
    name: string;
    muscleGroup: 'Chest' | 'Back' | 'Quads' | 'Hamstrings & Glutes' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body';
    defaultSets: number;
    targetReps: string;
    restPeriodSeconds: number;
    targetRpe: number;
    notes: string;
  }> = [];

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

  const bannedRules = extractBannedMovements(
    [params.customPrompt || '', params.injuryNotes || '', ...(params.injuries || [])].join(' '),
    params.injuries || []
  );

  // Handle explicit cardio / running preference
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
      notes: 'Paced Zone 2/3 steady aerobic run. Builds officer endurance, cardiac stroke volume, and rapid recovery capacity.',
    });
    title += ' + Duty Run';
    category = 'Hybrid';
  } else if (params.cardioPreference === 'cardio_circuits') {
    const circuitEx = getDistinctCircuitForDay(0, params.cardioCircuitType, bannedRules);
    exercises.push(circuitEx as any);
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
      notes: 'Explosive acceleration and anaerobic lactate tolerance.',
    });
    const circuitEx = getDistinctCircuitForDay(1, params.cardioCircuitType, bannedRules);
    exercises.push(circuitEx as any);
    title += ' + Hybrid Cardio & Run';
    category = 'Hybrid';
  }

  const programId = `ai-single-${Date.now().toString(36)}`;
  const sanitizedExercises = sanitizeExerciseList(exercises, bannedRules);

  return {
    id: programId,
    title,
    subtitle,
    category,
    frequency: 'Single Day Session',
    estimatedDurationMinutes: duration,
    description: `A custom-engineered on-demand single-day session designed around: ${params.workoutType}. Calibrated for ${duration} minutes with equipment: ${(params.equipment || []).join(', ') || 'Standard gear'}. Intensity targeted at ${params.intensity || 'High'}.`,
    recommendedWarmupId,
    exercises: sanitizedExercises,
  };
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // Shared Gemini client management with reactive API key lookup
  let cachedAi: GoogleGenAI | null = null;
  let lastApiKey = '';

  function getGeminiClient(): GoogleGenAI | null {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.trim().length === 0) {
      cachedAi = null;
      lastApiKey = '';
      return null;
    }
    if (cachedAi && lastApiKey === key) {
      return cachedAi;
    }
    try {
      cachedAi = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      lastApiKey = key;
      return cachedAi;
    } catch (err) {
      console.warn('[Server] Error initializing GoogleGenAI:', err);
      return null;
    }
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  function callWithTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Model request timed out after ${ms}ms`)), ms)
      ),
    ]);
  }

  // POST /api/gemini/generate-workout-plan
  app.post('/api/gemini/generate-workout-plan', async (req, res) => {
    const params: WorkoutGenerationRequest = req.body;

    if (!params || !params.goals || !params.fitnessLevel) {
      return res.status(400).json({
        error: 'Missing required training parameters (goals, fitnessLevel, frequency, equipment).',
      });
    }

    const ai = getGeminiClient();

    // If Gemini client is not initialized or API key is absent, return the calibrated fallback plan
    if (!ai) {
      console.log('[Server] No GEMINI_API_KEY configured. Serving high-fidelity personalized fallback plan.');
      const fallback = generateFallbackWorkoutPlan(params);
      return res.json({
        success: true,
        data: fallback,
        source: 'local_engine',
      });
    }

    try {
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
      const scheduleDaysTarget = weeksCount * 7;
      const daysPerWeek = parseInt(params.frequency, 10) || 4;

      const injuriesList = [
        ...(params.injuries || []),
        params.injuryNotes || '',
        params.notes || '',
      ].filter((s) => s && s.trim().length > 0);
      const injuryReported = injuriesList.join('; ');

      const injuryDirectives = injuryReported ? `
================================================================================
CRITICAL MEDICAL SAFETY & INJURY ADAPTATION DIRECTIVE (ZERO-TOLERANCE MANDATE):
The athlete has reported the following injury/condition: "${injuryReported}".
YOU ARE STRICTLY FORBIDDEN FROM PRESCRIBING ANY EXERCISES THAT AGGRAVATE THIS CONDITION.
1. HIP LABRUM TEAR / FAI / HIP IMPINGEMENT:
   - STRICTLY FORBIDDEN: Barbell Back Squats (heavy, deep, or standard), Front Squats past 90°, 45-degree leg press, deep walking lunges, Bulgarian split squats with deep hip flexion.
   - MANDATORY SUBSTITUTES: Box Squats to parallel or above 90° (vertical shins), Belt Squats, Spanish Squats, High-Handle Trap Bar RDLs (restricted hinge depth), Glute Bridges/Hip Thrusts with neutral pelvis, Backward Sled Drags/Pushes.
2. LOWER BACK / LUMBAR DISC / SCIATICA:
   - FORBIDDEN: Heavy axial barbell squats, conventional deadlifts from floor, standing good mornings.
   - SUBSTITUTES: Belt squats, Chest-supported rows, High-handle trap bar deadlifts, McGill Big 3.
3. SHOULDER / ROTATOR CUFF:
   - FORBIDDEN: Behind-the-neck presses, military presses with flared elbows, deep dips, wide bench.
   - SUBSTITUTES: Neutral-grip DB floor presses, landmine presses, face pulls.
4. KNEE / PATELLAR / MENISCUS:
   - FORBIDDEN: Explosive jump squats, lunges with forward knee tracking over toes under load.
   - SUBSTITUTES: Backward sled drags, box squats with vertical shins, hamstring curls.
Include clinical modification cues in each exercise's 'notes' field.
================================================================================
` : '';

      const cardioDirective = params.cardioPreference === 'running' ? `
================================================================================
MANDATORY CARDIO INTEGRATION (RUNNING):
The athlete explicitly requested RUNNING to be integrated into their training plan.
Running Preference / Target: ${params.runningDistancePreference || 'Duty Aerobic Run (1.5 - 3.0 Miles)'}
You MUST integrate running into the schedule:
- Include dedicated running conditioning sessions or append post-lifting running (e.g. "Duty Base Aerobic Run - ${params.runningDistancePreference || '1.5-2.0 Miles'}", "Foot Pursuit 400m-800m Interval Repeats", or "Zone 2 Duty Stamina Run").
- Exercise type should be designated as cardio with target distance/time specified.
================================================================================` : params.cardioPreference === 'cardio_circuits' ? `
================================================================================
MANDATORY CARDIO INTEGRATION (CARDIO CIRCUITS):
The athlete explicitly requested CARDIO CIRCUITS to be integrated into their training plan.
Circuit Style: ${params.cardioCircuitType || 'Duty HIIT & Metabolic Conditioning Circuits'}
You MUST integrate high-impact metabolic cardio circuits into the schedule:
- Program metabolic conditioning finishers or dedicated circuit days (e.g., "Combat Conditioning Circuit: Kettlebell Swings, Burpees, Mountain Climbers, Battle Ropes (4 rounds)", "Assault Bike / Rower Anaerobic Intervals", or "Tactical Ruck & Carry Flush").
================================================================================` : params.cardioPreference === 'hybrid' ? `
================================================================================
MANDATORY CARDIO INTEGRATION (HYBRID RUNNING + CIRCUITS):
The athlete requested BOTH running endurance AND cardio circuits.
Include structured interval/tempo running alongside tactical functional conditioning circuits throughout the training week.
================================================================================` : '';

      const bannedRules = extractBannedMovements(
        [params.notes || '', params.injuryNotes || '', ...(params.injuries || [])].join(' '),
        params.injuries || []
      );

      const bannedSection = bannedRules.length > 0 ? `
================================================================================
CRITICAL ZERO-TOLERANCE BANNED EXERCISES BLACKLIST:
The athlete has explicitly declared they CANNOT do the following exercises or have limitations:
${bannedRules.map(b => `- FORBIDDEN MOVEMENT: "${b.label}" (Banned keyword: ${b.keyword})`).join('\n')}
YOU ARE STRICTLY FORBIDDEN from including any of these movements or their direct variations.
If any of these movements appear, the program is considered completely broken and unsafe.
Instead, use safe, clinical-grade alternatives (e.g. floor press, belt/box squats, landmine press, chest-supported rows).
================================================================================` : '';

      const circuitVarietyDirective = `
================================================================================
CIRCUIT VARIETY REQUIREMENT:
When programming cardio circuits or metabolic finishers, DO NOT REPEAT THE SAME MOVEMENTS ACROSS SESSIONS!
Select from diverse tactical circuit archetypes such as:
1. Tactical Kettlebell Combat Flow: Single-Arm KB Swings, Goblet Squats, Push-up to Renegade Row, KB High Pulls.
2. Duty Foot Pursuit & Anaerobic Intervals: Shuttle Sprints, Combat Sprawls, Skater Hops, Speed Mountain Climbers.
3. SWAT Bodyweight Armor Metcon: Hand-Release Push-Ups, Jump Squats, Inverted Rows, Hollow Body Rocks.
4. Tactical Sandbag Grinder: Ground-to-Shoulder, Bear Hug March, Sandbag Clean, Burpee Over Sandbag.
5. Dumbbell Metabolic Velocity: Dual DB Thrusters, Suitcase Marches, DB RDL to Shrug, Hex Rows.
6. Ergometer & Combat Power: Assault Bike / Rower sprints, Slam Balls, Farmer Carries, Knee Tucks.
7. Combat Core & Anti-Rotation: Pallof Press, Copenhagen Side Plank, Russian Twists, Hanging Tucks.
8. Physical Ability Test Obstacle Simulator: Cadence Push-ups, Dummy Drag Sled/Heel Walk, Box Step-ups, High-Knee Sprints.
Each day's circuit MUST be unique with distinct movements, stations, and work/rest intervals.
================================================================================`;

      const splitArchitectureDirective = `
================================================================================
PHYSIOLOGICAL RECOVERY & WORKOUT SPLIT ARCHITECTURE (MANDATORY):
You MUST build a logical training split adhering strictly to exercise science and physiological recovery:
1. Minimum 48-72 hours between training the same major muscle group, especially LEGS / LOWER BODY / POSTERIOR CHAIN.
2. NEVER PROGRAM BACK-TO-BACK OR NEAR-CONSECUTIVE LEG DAYS:
   - For example, Day 2 Legs, Day 3 Rest, Day 4 Legs is STRICTLY FORBIDDEN and medically illogical.
   - Lower body sessions must NEVER be scheduled on consecutive training days, even if separated by a rest day. Always program an Upper Body session or 2+ rest days between lower body sessions!
3. Follow these exact architectural templates for the athlete's frequency (${daysPerWeek} training days per week):
   * 3-DAY SPLIT:
     - Day 1: Full Body A (Horizontal Push Bench/Press, Squat, Core)
     - Day 2: Rest & Recovery
     - Day 3: Full Body B (Vertical Press, Hinge/Deadlift, Pulling)
     - Day 4: Rest & Recovery
     - Day 5: Full Body C (Unilateral Legs, Incline Press, Carries)
     - Days 6-7: Rest
   * 4-DAY SPLIT:
     - Day 1: Upper Body A (Chest, Horizontal Rows, Delts)
     - Day 2: Lower Body A (Squat/Quad Dominant, Calves, Core)
     - Day 3: REST & ACTIVE RECOVERY (Mandatory Rest)
     - Day 4: Upper Body B (Vertical Pulling, Incline Press, Delts, Arms) - MUST BE UPPER BODY
     - Day 5: Lower Body B (Deadlift/Posterior Chain Hinge, Hamstrings, Glutes, Loaded Carries)
     - Days 6-7: Rest & Mobility Flush
   * 5-DAY SPLIT:
     - Day 1: Upper Push (Chest, Anterior/Lateral Delts, Triceps)
     - Day 2: Upper Pull (Lats, Upper Back, Biceps)
     - Day 3: Lower Body Chassis A (Squats, Quads, Calves, Core)
     - Day 4: REST & ACTIVE RECOVERY
     - Day 5: Upper Body Armor & Density (Push/Pull, Delts, Arms)
     - Day 6: Lower Body Chassis B (Deadlifts, Posterior Chain, Carries)
     - Day 7: REST & REGENERATION
   * 6-DAY SPLIT:
     - Day 1: Push A | Day 2: Pull A | Day 3: Legs A (Squat focus) | Day 4: Push B | Day 5: Pull B | Day 6: Legs B (Deadlift/Hinge focus) | Day 7: Rest
================================================================================`;

      const systemPrompt = `You are the Head Tactical Strength & Conditioning Coach at Patrol Ready Performance, specializing in elite physical preparation, law enforcement readiness, hybrid athlete periodization, and science-backed progressive overload.
Create a comprehensive, custom-tailored workout schedule matching the athlete's exact specifications:
- Fitness Goals: ${params.goals.join(', ')}
- Current Fitness Level: ${params.fitnessLevel}
- Workout Frequency: ${params.frequency} (${daysPerWeek} training days per 7 days)
- Schedule Type: ${weeksCount > 1 ? `${weeksCount}-Week Periodized Program (${scheduleDaysTarget} Total Days)` : '7-Day Rotation Schedule (Day 1 through Day 7)'}
- Available Equipment: ${params.equipment.join(', ')}
- Target Session Duration: ${params.sessionDurationMinutes || 55} minutes
- Cardio / Running Preference: ${params.cardioPreference ? `${params.cardioPreference.toUpperCase()} (${params.runningDistancePreference || params.cardioCircuitType || 'Integrated'})` : 'Default'}
- Reported Injuries / Medical Limitations: ${injuryReported || 'None reported'}
- Special Notes / Constraints: ${params.notes || 'None'}
${bannedSection}
${splitArchitectureDirective}
${cardioDirective}
${circuitVarietyDirective}
${injuryDirectives}

RULES:
1. Every day MUST have a day number (Day 1, Day 2, etc.), a focus description, isRestDay boolean, and an array of exercises (empty if isRestDay).
2. For training days, program 4 to 6 specific exercises strictly matching the available equipment. If running or cardio circuits are requested, ensure every session or scheduled conditioning day includes the specified running or cardio circuits.
3. Every exercise must specify:
   - id: unique string (e.g. "ex-1")
   - name: clear exercise name
   - muscleGroup: one of ['Chest', 'Back', 'Quads', 'Hamstrings & Glutes', 'Shoulders', 'Arms', 'Core', 'Full Body']
   - type: optional string, set to "circuit" for metabolic circuits/finishers, "cardio" for runs, or "strength" / "core"
   - For circuit exercises: set type to "circuit", defaultSets to round count (e.g. 3 or 4), targetReps to interval scheme (e.g. "3 rounds (40s work / 20s rest)"), restPeriodSeconds to rest between rounds (e.g. 60), and in notes list the numbered stations: "Circuit Stations: 1. [Movement 1], 2. [Movement 2], 3. [Movement 3], 4. [Movement 4]. [Execution cue]"
   - targetRpe: integer between 6 and 9
   - notes: tactical execution cue, pace guidance, and progressive overload trigger
4. Category MUST be one of: 'Strength', 'Hypertrophy', 'Athletic Conditioning', 'Power', 'Hybrid'. If running or cardio circuits are added, category should prefer 'Hybrid' or 'Athletic Conditioning'.
5. Include actionable weeklyProgressionTips and nutrition advice tailored to their goal.
6. VARIETY & SETS/REPS CALIBRATION:
   - Provide genuine exercise variety across different days. Do NOT repeat identical templates or exercises.
   - Sets, reps, and rest MUST strictly match the athlete's primary goal:
     * Max Strength / Heavy Power: 4-5 sets x 3-5 reps (120-180s rest, RPE 8-9)
     * Muscle Gain / Armor Hypertrophy: 3-4 sets x 8-12 reps (75-90s rest, RPE 8)
     * Weight Loss / Metabolic Shred: 3-4 sets x 12-15+ reps (45-60s rest, RPE 7-8)
     * Tactical Hybrid / Durability: 3-4 sets x 6-8 reps + metabolic conditioning finisher
     * Physical Ability Test (PAT): 3-4 sets x 15-25 reps or timed sets (60s rest)
     * Beginner: 3 sets x 10-12 reps with fundamental biomechanics
     * Elite: Undulating periodization, cluster sets, and heavy tactical load carriage`;

      let response: any = null;
      const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.8-flash'];
      let lastModelError: any = null;

      for (const modelName of candidateModels) {
        try {
          response = await callWithTimeout(
            ai.models.generateContent({
              model: modelName,
              contents: systemPrompt,
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
                          type: { type: Type.STRING },
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
      }), 8000);

          const responseText = response.text;
          if (responseText) {
            const parsedPlan = JSON.parse(responseText);

            if (Array.isArray(parsedPlan.schedule) && parsedPlan.schedule.length > 0) {
              parsedPlan.schedule = periodizeSchedule(
                parsedPlan.schedule,
                scheduleDaysTarget,
                weeksCount,
                params.goals.join(' '),
                params.fitnessLevel,
                bannedRules,
                params.cardioPreference,
                params.runningDistancePreference,
                params.cardioCircuitType,
                daysPerWeek
              );
            }

            parsedPlan.scheduleDuration = weeksCount === 1
              ? '7-Day Rotation'
              : weeksCount === 4
              ? '4-Week Monthly Periodization'
              : `${weeksCount}-Week Periodized Macro-Cycle (${weeksCount <= 4 ? 'Phase 1' : weeksCount <= 8 ? 'Phases 1-2' : 'Full 3-Phase Periodization'})`;

            if (weeksCount >= 8 && (!parsedPlan.weeklyProgressionTips || parsedPlan.weeklyProgressionTips.length < 3)) {
              parsedPlan.weeklyProgressionTips = [
                'Phase 1 (Weeks 1-4 Accumulation): Build kinetic volume and technical precision. Week 4 features a 25% volume deload.',
                'Phase 2 (Weeks 5-8 Intensification): Heavier compound multi-joint sets with double progression (+2.5-5 lbs upper, +5-10 lbs lower).',
                'Phase 3 (Weeks 9-12 Peak Duty Power): Rate of force development, max strength realization, and Week 12 benchmark testing & tactical taper.',
              ];
            }

            const fixedPlan = validateAndFixSplitLogic(parsedPlan, bannedRules);
            const sanitizedPlan = sanitizePlanAgainstLimitations(fixedPlan, bannedRules);
            return res.json({
              success: true,
              data: sanitizedPlan,
              source: modelName,
            });
          }
        } catch (mErr: any) {
          lastModelError = mErr;
          console.warn(`[Server] Model ${modelName} failed, trying next:`, mErr?.message || mErr);
        }
      }

      throw lastModelError || new Error('All candidate Gemini models returned empty response or failed.');
    } catch (err: any) {
      console.error('[Server] Gemini generation failed:', err);
      // If error occurs, gracefully fallback so the user always receives a personalized workout plan
      const fallback = generateFallbackWorkoutPlan(params);
      const bannedRules = extractBannedMovements(
        [params.notes || '', params.injuryNotes || '', ...(params.injuries || [])].join(' '),
        params.injuries || []
      );
      const fixedFallback = validateAndFixSplitLogic(fallback, bannedRules);
      const sanitizedFallback = sanitizePlanAgainstLimitations(fixedFallback, bannedRules);
      return res.json({
        success: true,
        data: sanitizedFallback,
        source: 'local_engine_fallback',
        warning: err?.message || 'Gemini service note: delivered calibrated tactical template.',
      });
    }
  });

  // POST /api/gemini/generate-single-workout
  app.post('/api/gemini/generate-single-workout', async (req, res) => {
    const params: SingleWorkoutRequest = req.body;

    if (!params || !params.workoutType) {
      return res.status(400).json({
        error: 'Missing required parameter: workoutType.',
      });
    }

    const duration = params.durationMinutes || 45;
    const ai = getGeminiClient();

    // If Gemini client is not initialized or API key is absent, return the calibrated fallback single workout
    if (!ai) {
      console.log('[Server] No GEMINI_API_KEY configured. Serving high-fidelity single-day workout.');
      const fallback = generateFallbackSingleWorkout(params);
      return res.json({
        success: true,
        data: fallback,
        source: 'local_engine',
      });
    }

    try {
      const injuriesList = [
        ...(params.injuries || []),
        params.injuryNotes || '',
        params.customPrompt || '',
      ].filter((s) => s && s.trim().length > 0);
      const injuryReported = injuriesList.join('; ');

      const injuryDirectives = injuryReported ? `
================================================================================
CRITICAL MEDICAL SAFETY & INJURY ADAPTATION DIRECTIVE (ZERO-TOLERANCE MANDATE):
The athlete has reported the following injury/condition: "${injuryReported}".
YOU ARE STRICTLY FORBIDDEN FROM PRESCRIBING ANY EXERCISES THAT AGGRAVATE THIS CONDITION.
1. HIP LABRUM TEAR / FAI / HIP IMPINGEMENT:
   - STRICTLY FORBIDDEN: Barbell Back Squats (heavy, deep, or standard), Front Squats past 90°, 45-degree leg press, deep walking lunges, Bulgarian split squats with deep hip flexion.
   - MANDATORY SUBSTITUTES: Box Squats to parallel or above 90° (vertical shins), Belt Squats, Spanish Squats, High-Handle Trap Bar RDLs (restricted hinge depth), Glute Bridges/Hip Thrusts with neutral pelvis, Backward Sled Drags/Pushes.
2. LOWER BACK / LUMBAR DISC / SCIATICA:
   - FORBIDDEN: Heavy axial barbell squats, conventional deadlifts from floor, standing good mornings.
   - SUBSTITUTES: Belt squats, Chest-supported rows, High-handle trap bar deadlifts, McGill Big 3.
3. SHOULDER / ROTATOR CUFF:
   - FORBIDDEN: Behind-the-neck presses, military presses with flared elbows, deep dips, wide bench.
   - SUBSTITUTES: Neutral-grip DB floor presses, landmine presses, face pulls.
4. KNEE / PATELLAR / MENISCUS:
   - FORBIDDEN: Explosive jump squats, lunges with forward knee tracking over toes under load.
   - SUBSTITUTES: Backward sled drags, box squats with vertical shins, hamstring curls.
Include clinical modification cues in each exercise's 'notes' field.
================================================================================
` : '';

      const bannedRules = extractBannedMovements(
        [params.customPrompt || '', params.injuryNotes || '', ...(params.injuries || [])].join(' '),
        params.injuries || []
      );

      const bannedSection = bannedRules.length > 0 ? `
================================================================================
CRITICAL ATHLETE BLACKLIST - ABSOLUTELY FORBIDDEN EXERCISES (ZERO TOLERANCE):
The athlete has specifically instructed that they CANNOT perform or want EXCLUDED:
${bannedRules.map((r) => `* STRICTLY BANNED: ${r.label}`).join('\n')}
YOU MUST NOT INCLUDE ANY EXERCISE IN THE PROGRAM THAT INVOLVES THESE MOVEMENTS.
Substitute with joint-friendly safe variations!
================================================================================` : '';

      const targetExerciseCount = duration <= 25 ? '3 to 4' : duration <= 45 ? '4 to 6' : '5 to 7';

      const singleCardioDirective = params.cardioPreference === 'running' ? `
================================================================================
MANDATORY CARDIO INTEGRATION (RUNNING):
The athlete requested RUNNING to be incorporated into this single-day workout.
Running Preference / Distance: ${params.runningDistancePreference || 'Duty Aerobic Run (1.5 - 2.5 Miles)'}.
Include dedicated running (e.g. duty run finisher, interval sprint repeats, or warmup/cooldown run).
Designate exercise type as "cardio" with target distance/time.
================================================================================` : params.cardioPreference === 'cardio_circuits' ? `
================================================================================
MANDATORY CARDIO INTEGRATION (CARDIO CIRCUITS):
The athlete requested CARDIO CIRCUITS in this single-day workout.
Circuit Style: ${params.cardioCircuitType || 'Duty Metabolic Circuit'}.
Include a fast-paced cardio circuit or metabolic finisher (e.g. 3-4 rounds of KB swings, burpees, sprint erg intervals).
================================================================================` : params.cardioPreference === 'hybrid' ? `
================================================================================
MANDATORY CARDIO INTEGRATION (HYBRID RUNNING + CIRCUITS):
Include both running endurance intervals and high-density cardio circuits in this session.
================================================================================` : '';

      const systemPrompt = `You are the Head Tactical Strength & Conditioning Coach at Patrol Ready Performance, specializing in elite physical preparation, law enforcement fitness, and athletic periodization.
An athlete wants to generate a SINGLE-DAY on-demand training session because they want SOMETHING DIFFERENT today.

Athlete Request & Session Parameters:
- Session Type / Focus: ${params.workoutType}
- Time Window: Exactly ${duration} minutes
- Equipment Available: ${(params.equipment || []).join(', ') || 'Standard gym equipment'}
- Desired Intensity: ${params.intensity || 'High'}
- Fitness Level: ${params.fitnessLevel || 'Intermediate'}
- Cardio / Running Request: ${params.cardioPreference ? `${params.cardioPreference.toUpperCase()} (${params.runningDistancePreference || params.cardioCircuitType || 'Integrated'})` : 'Default'}
- Reported Injuries / Limitations: ${injuryReported || 'None reported'}
- Custom Officer Request: ${params.customPrompt || 'None'}
${singleCardioDirective}
${injuryDirectives}
${bannedSection}

RULES:
1. Build an executable, high-impact, single-day session fitting strictly within ${duration} minutes.
2. Select ${targetExerciseCount} specific exercises calibrated to the duration.
3. If running or cardio circuits are requested, ensure the session contains the running session or cardio circuit. If programming a circuit, set exercise type to "circuit" and list each numbered station clearly in notes (e.g. "Circuit Stations: 1. [Movement 1], 2. [Movement 2], 3. [Movement 3], 4. [Movement 4]. Continuous station rotation.").
4. STRICTLY match the available equipment: ${(params.equipment || []).join(', ')}. Never prescribe equipment they don't have.
5. Provide engaging tactical names, sets, reps, rest timers, target RPE, and tactical coaching cues in 'notes'.
6. Category MUST be one of: 'Strength', 'Hypertrophy', 'Athletic Conditioning', 'Power', 'Hybrid'.
7. recommendedWarmupId should be one of: 'warmup-apex-sop', 'warmup-upper-primer', 'warmup-lower-prep', 'warmup-universal-tactical', 'warmup-express-primer'.`;

      const candidateModels = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-3.8-flash',
      ];

      let lastModelError: any = null;

      for (const modelName of candidateModels) {
        try {
          const response = await callWithTimeout(
            ai.models.generateContent({
              model: modelName,
              contents: systemPrompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    enum: ['Strength', 'Hypertrophy', 'Athletic Conditioning', 'Power', 'Hybrid'],
                  },
                  frequency: { type: Type.STRING },
                  estimatedDurationMinutes: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                  recommendedWarmupId: { type: Type.STRING },
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
                        type: { type: Type.STRING },
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
                required: [
                  'id',
                  'title',
                  'subtitle',
                  'category',
                  'estimatedDurationMinutes',
                  'description',
                  'exercises',
                ],
              },
            },
          }), 8000);

          const responseText = response.text;
          if (responseText) {
            const parsedWorkout = JSON.parse(responseText);
            if (!parsedWorkout.id) {
              parsedWorkout.id = `ai-single-${Date.now().toString(36)}`;
            }
            if (!parsedWorkout.frequency) {
              parsedWorkout.frequency = 'Single Day Session';
            }
            parsedWorkout.exercises = sanitizeExerciseList(parsedWorkout.exercises || [], bannedRules);

            return res.json({
              success: true,
              data: parsedWorkout,
              source: modelName,
            });
          }
        } catch (mErr: any) {
          lastModelError = mErr;
          console.warn(`[Server] Single workout model ${modelName} failed, trying next:`, mErr?.message || mErr);
        }
      }

      throw lastModelError || new Error('All candidate Gemini models failed.');
    } catch (err: any) {
      console.error('[Server] Single-day workout Gemini generation failed:', err);
      const fallback = generateFallbackSingleWorkout(params);
      return res.json({
        success: true,
        data: fallback,
        source: 'local_engine_fallback',
        warning: err?.message || 'Gemini service note: delivered calibrated tactical template.',
      });
    }
  });

  // POST /api/gemini/stream (Server-Sent Events streaming)
  app.post('/api/gemini/stream', async (req, res) => {
    const { prompt, systemInstruction } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt parameter.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const stream = await ai.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined,
      });

      for await (const chunk of stream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err: any) {
      console.error('[Server] Gemini streaming failed:', err);
      res.write(`data: ${JSON.stringify({ error: err?.message || 'Streaming failed' })}\n\n`);
      res.end();
    }
  });

  const server = http.createServer(app);

  // WebSocket Server for Gemini Live API real-time bidirectional audio/video
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const host = request.headers.host || 'localhost:3000';
    const pathname = request.url ? new URL(request.url, `http://${host}`).pathname : '';
    if (pathname === '/api/gemini/live' || pathname === '/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('[Server] Gemini Live WebSocket client connected');
    const ai = getGeminiClient();
    if (!ai) {
      clientWs.send(JSON.stringify({ error: 'Gemini API not configured on server' }));
      clientWs.close();
      return;
    }

    try {
      const session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are the Head Tactical Strength & Conditioning Coach at Patrol Ready Performance, coaching frontline officers and tactical athletes with clear, encouraging, science-backed guidance.',
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            for (const part of message.serverContent?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
              }
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onclose: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.close();
            }
          },
        },
      });

      clientWs.on('message', (data: any) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.audio) {
            session.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          } else if (msg.text) {
            session.sendClientContent({
              turns: [{ role: 'user', parts: [{ text: msg.text }] }],
              turnComplete: true,
            });
          }
        } catch (e) {
          console.warn('[Server] Live WS message parsing error:', e);
        }
      });

      clientWs.on('close', () => {
        try {
          session.close();
        } catch {}
      });
    } catch (err: any) {
      console.error('[Server] Gemini Live API connection failed:', err);
      clientWs.send(JSON.stringify({ error: err?.message || 'Failed to initialize Gemini Live session' }));
      clientWs.close();
    }
  });

  const distPath = path.resolve(__dirname, 'dist');
  const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(distPath);

  if (isProduction) {
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(path.resolve(distPath, 'index.html'));
      }
      next();
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Patrol Ready Server] Full-stack application running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
