import { WorkoutProgram, WarmUpRoutine, SupplementProtocol, WorkoutSessionLog } from '../types';

export const INITIAL_PROGRAMS: WorkoutProgram[] = [
  {
    id: 'the-apex-protocol-master',
    title: 'The Apex Protocol (26-Week Master)',
    subtitle: 'Comprehensive Tactical Fitness & Conditioning • Elite Standard',
    category: 'Hybrid',
    frequency: '6 Days / Week',
    estimatedDurationMinutes: 70,
    recommendedWarmupId: 'warmup-apex-sop',
    description: 'The definitive 26-week tactical conditioning blueprint by Overland Athletics. Built to forge elite combat chassis durability, massive compound strength, high-velocity running, and load carriage mastery.',
    schedule: [
      {
        day: 1,
        focus: 'Lower Body Prime (Structural Leg Strength)',
        exercises: [
          {
            id: 'apex-d1-squat',
            name: 'Barbell Back Squat',
            muscleGroup: 'Quads',
            type: 'strength',
            defaultSets: 4,
            targetReps: '8-10',
            targetRpe: 8,
            restPeriodSeconds: 120,
            notes: 'Linear Auto-Overload: +2.5 to 5 lbs on top reps. Pristine depth.'
          },
          {
            id: 'apex-d1-rdl',
            name: 'Romanian Deadlift',
            muscleGroup: 'Hamstrings & Glutes',
            type: 'strength',
            defaultSets: 3,
            targetReps: '10',
            targetRpe: 8,
            restPeriodSeconds: 90,
            notes: 'Hinge back into hamstrings, keep bar glued to shins.'
          },
          {
            id: 'apex-d1-bss',
            name: 'Bulgarian Split Squat',
            muscleGroup: 'Quads',
            type: 'strength',
            defaultSets: 3,
            targetReps: '8/leg',
            targetRpe: 8.5,
            restPeriodSeconds: 90,
            notes: 'Elevate rear foot on bench, maintain upright torso.'
          },
          {
            id: 'apex-d1-pallof',
            name: 'Pallof Press',
            muscleGroup: 'Core',
            type: 'strength',
            defaultSets: 3,
            targetReps: '12/side',
            targetRpe: 7.5,
            restPeriodSeconds: 60,
            notes: 'Anti-rotational core bracing against cable/band tension.'
          }
        ]
      },
      {
        day: 2,
        focus: 'Energy Systems (Aerobic Capacity)',
        exercises: [
          {
            id: 'apex-d2-run',
            name: 'Tactical Aerobic Base',
            muscleGroup: 'Full Body',
            type: 'cardio',
            defaultSets: 1,
            targetReps: '35-50 Min',
            restPeriodSeconds: 0,
            pace: 'Zone 2 (135-150 BPM)',
            notes: 'Conversational pace. +5 mins duration weekly in Phase 1.'
          },
          {
            id: 'apex-d2-plank',
            name: 'Plank Series',
            muscleGroup: 'Core',
            type: 'strength',
            defaultSets: 3,
            targetReps: '60s',
            targetRpe: 8,
            restPeriodSeconds: 45,
            notes: 'Front and side planks. +15s hold progression.'
          }
        ]
      },
      {
        day: 3,
        focus: 'Upper Body Push/Pull (Torso & Grip Integrity)',
        exercises: [
          {
            id: 'apex-d3-ohp',
            name: 'Strict Overhead Press',
            muscleGroup: 'Shoulders',
            type: 'strength',
            defaultSets: 4,
            targetReps: '8-10',
            targetRpe: 8,
            restPeriodSeconds: 120,
            notes: 'Strict linear progression: Add 2.5 lbs from last week.'
          },
          {
            id: 'apex-d3-pullups',
            name: 'Weighted Pull-Ups',
            muscleGroup: 'Back',
            type: 'strength',
            defaultSets: 4,
            targetReps: '6-8',
            targetRpe: 8.5,
            restPeriodSeconds: 120,
            notes: 'Linear progression: +2.5 to 5 lbs upon hitting 8 reps.'
          },
          {
            id: 'apex-d3-incline',
            name: 'DB Incline Bench',
            muscleGroup: 'Chest',
            type: 'strength',
            defaultSets: 3,
            targetReps: '10',
            targetRpe: 8,
            restPeriodSeconds: 90,
            notes: '+5 lbs total load when hitting 10 clean reps.'
          },
          {
            id: 'apex-d3-row',
            name: 'Chest-Supported Row',
            muscleGroup: 'Back',
            type: 'strength',
            defaultSets: 3,
            targetReps: '10',
            targetRpe: 8,
            restPeriodSeconds: 90,
            notes: 'Upper back thickness and scapular retraction.'
          },
          {
            id: 'apex-d3-carry',
            name: "Heavy Farmer's Carry",
            muscleGroup: 'Full Body',
            type: 'strength',
            defaultSets: 4,
            targetReps: '40m',
            targetRpe: 9,
            restPeriodSeconds: 90,
            notes: 'Grip, traps, and core endurance. 40m per set.'
          }
        ]
      },
      {
        day: 4,
        focus: 'Active Recovery (CNS Down-regulation)',
        exercises: [
          {
            id: 'apex-d4-recovery',
            name: 'Recovery / Active Mobility',
            muscleGroup: 'Full Body',
            type: 'strength',
            defaultSets: 1,
            targetReps: '30 Min',
            restPeriodSeconds: 0,
            notes: 'Light walk, yoga, or stretching flow. HR < 110 BPM.'
          }
        ]
      },
      {
        day: 5,
        focus: 'Full Body Power (Combat Chassis Development)',
        exercises: [
          {
            id: 'apex-d5-deadlift',
            name: 'Trap Bar Deadlift',
            muscleGroup: 'Hamstrings & Glutes',
            type: 'strength',
            defaultSets: 4,
            targetReps: '8-10',
            targetRpe: 8.5,
            restPeriodSeconds: 180,
            notes: 'Linear Auto-Overload: +2.5 to 5 lbs on top reps. 3 min rest.'
          },
          {
            id: 'apex-d5-pushpress',
            name: 'Push Press',
            muscleGroup: 'Shoulders',
            type: 'strength',
            defaultSets: 4,
            targetReps: '6',
            targetRpe: 8,
            restPeriodSeconds: 120,
            notes: 'Explosive dip and drive. +5 lbs when all sets clean.'
          },
          {
            id: 'apex-d5-lunges',
            name: 'Walking Lunges',
            muscleGroup: 'Quads',
            type: 'strength',
            defaultSets: 3,
            targetReps: '20 steps',
            targetRpe: 8.5,
            restPeriodSeconds: 90,
            notes: '20 total steps with heavy dumbbells.'
          },
          {
            id: 'apex-d5-swings',
            name: 'KB Swings',
            muscleGroup: 'Hamstrings & Glutes',
            type: 'strength',
            defaultSets: 4,
            targetReps: '15',
            targetRpe: 8,
            restPeriodSeconds: 60,
            notes: 'Violent hip snap, Russian height.'
          }
        ]
      },
      {
        day: 6,
        focus: 'Tactical Endurance (Zone 2 Output)',
        exercises: [
          {
            id: 'apex-d6-run',
            name: 'Long Slow Distance Run',
            muscleGroup: 'Full Body',
            type: 'cardio',
            defaultSets: 1,
            targetReps: '47-77 Min',
            restPeriodSeconds: 0,
            pace: 'Zone 2 (Keep HR < 145 BPM)',
            notes: 'Strict aerobic adaptation. Progresses by +2 mins weekly.'
          }
        ]
      },
      {
        day: 7,
        focus: 'Complete Rest & Nutrition Replenishment',
        exercises: [
          {
            id: 'apex-d7-rest',
            name: 'Complete Rest & Nutrition Replenishment',
            muscleGroup: 'Full Body',
            type: 'strength',
            defaultSets: 1,
            targetReps: 'Full Day',
            restPeriodSeconds: 0,
            notes: 'Carb replenishment, electrolytes, and 8+ hours quality sleep.'
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'apex-d1-squat',
        name: 'Barbell Back Squat',
        muscleGroup: 'Quads',
        type: 'strength',
        defaultSets: 4,
        targetReps: '8-10',
        targetRpe: 8,
        restPeriodSeconds: 120,
        notes: 'Linear Auto-Overload: +2.5 to 5 lbs on top reps. Pristine depth.'
      },
      {
        id: 'apex-d1-rdl',
        name: 'Romanian Deadlift',
        muscleGroup: 'Hamstrings & Glutes',
        type: 'strength',
        defaultSets: 3,
        targetReps: '10',
        targetRpe: 8,
        restPeriodSeconds: 90,
        notes: 'Hinge back into hamstrings, keep bar glued to shins.'
      },
      {
        id: 'apex-d1-bss',
        name: 'Bulgarian Split Squat',
        muscleGroup: 'Quads',
        type: 'strength',
        defaultSets: 3,
        targetReps: '8/leg',
        targetRpe: 8.5,
        restPeriodSeconds: 90,
        notes: 'Elevate rear foot on bench, maintain upright torso.'
      },
      {
        id: 'apex-d1-pallof',
        name: 'Pallof Press',
        muscleGroup: 'Core',
        type: 'strength',
        defaultSets: 3,
        targetReps: '12/side',
        targetRpe: 7.5,
        restPeriodSeconds: 60,
        notes: 'Anti-rotational core bracing against cable/band tension.'
      }
    ]
  },
  {
    id: 'rpa-strength-upper',
    title: 'Overland Upper Body Strength & Hypertrophy',
    subtitle: 'Compound Power + Shoulder Integrity',
    category: 'Strength',
    frequency: '2x / week',
    estimatedDurationMinutes: 65,
    recommendedWarmupId: 'warmup-upper-primer',
    description: 'Designed by Overland Athletics. Focuses on horizontal/vertical pressing power, back thickness, and rotator cuff stability with structured progressive overload.',
    exercises: [
      {
        id: 'ex-bench-press',
        name: 'Barbell Flat Bench Press',
        muscleGroup: 'Chest',
        defaultSets: 4,
        targetReps: '5-8',
        targetRpe: 8,
        restPeriodSeconds: 120,
        notes: 'ISSA Cue: Retract scapulae, pack lats, drive heels into the floor. Touch lower sternum with control.'
      },
      {
        id: 'ex-barbell-row',
        name: 'Pendlay Barbell Row',
        muscleGroup: 'Back',
        defaultSets: 4,
        targetReps: '6-8',
        targetRpe: 8,
        restPeriodSeconds: 90,
        notes: 'Reset on floor between each rep to build explosive horizontal pulling power. Keep torso parallel.'
      },
      {
        id: 'ex-overhead-press',
        name: 'Standing Barbell Overhead Press (OHP)',
        muscleGroup: 'Shoulders',
        defaultSets: 3,
        targetReps: '6-8',
        targetRpe: 8,
        restPeriodSeconds: 120,
        notes: 'Brace glutes and abs to avoid lumbar hyperextension. Press bar in a straight vertical path.'
      },
      {
        id: 'ex-weighted-pullups',
        name: 'Weighted Pull-Ups (or Neutral Lat Pulldown)',
        muscleGroup: 'Back',
        defaultSets: 3,
        targetReps: '8-10',
        targetRpe: 8.5,
        restPeriodSeconds: 90,
        notes: 'Full dead-hang stretch at bottom, drive elbows down into back pockets.'
      },
      {
        id: 'ex-incline-db-press',
        name: 'Incline Dumbbell Press (30° Angle)',
        muscleGroup: 'Chest',
        defaultSets: 3,
        targetReps: '10-12',
        targetRpe: 9,
        restPeriodSeconds: 75,
        notes: 'Upper clavicular fiber focus. 2-second negative stretch at bottom.'
      },
      {
        id: 'ex-face-pulls',
        name: 'Cable Face Pulls with External Rotation',
        muscleGroup: 'Shoulders',
        defaultSets: 3,
        targetReps: '15',
        targetRpe: 8,
        restPeriodSeconds: 60,
        notes: 'Overland Prehab protocol: pull rope towards forehead and rotate thumbs back to target rear delts & lower traps.'
      },
      {
        id: 'ex-tricep-skullcrushers',
        name: 'Incline EZ-Bar Skullcrushers',
        muscleGroup: 'Arms',
        defaultSets: 3,
        targetReps: '10-12',
        targetRpe: 8.5,
        restPeriodSeconds: 60,
        notes: 'Keep elbows tucked; lower bar slightly behind crown of head for peak long-head triceps stretch.'
      }
    ]
  },
  {
    id: 'rpa-lower-squat',
    title: 'Overland Lower Body Posterior & Quad Drive',
    subtitle: 'Hip Extension & Knee Dominance',
    category: 'Power',
    frequency: '2x / week',
    estimatedDurationMinutes: 70,
    recommendedWarmupId: 'warmup-lower-hip',
    description: 'High-yield lower body session engineering maximal force production, posterior chain resilience, and unilateral knee stability.',
    exercises: [
      {
        id: 'ex-barbell-back-squat',
        name: 'Barbell Back Squat',
        muscleGroup: 'Quads',
        defaultSets: 4,
        targetReps: '5-6',
        targetRpe: 8.5,
        restPeriodSeconds: 180,
        notes: 'ISSA Cue: 3-point foot contact (tripod). High diaphragmatic brace into lifting belt. Hit parallel depth.'
      },
      {
        id: 'ex-romanian-deadlift',
        name: 'Romanian Deadlift (RDL)',
        muscleGroup: 'Hamstrings & Glutes',
        defaultSets: 3,
        targetReps: '8-10',
        targetRpe: 8,
        restPeriodSeconds: 120,
        notes: 'Maintain soft knee bend and push hips directly back towards the wall until deep hamstring tension.'
      },
      {
        id: 'ex-bulgarian-split-squat',
        name: 'Dumbbell Bulgarian Split Squat',
        muscleGroup: 'Quads',
        defaultSets: 3,
        targetReps: '10-12 / leg',
        targetRpe: 8.5,
        restPeriodSeconds: 90,
        notes: 'Slight forward torso lean for glute recruitment. Control the descent for 3 seconds.'
      },
      {
        id: 'ex-standing-calf-raise',
        name: 'Standing Calf Raise with Pause',
        muscleGroup: 'Quads',
        defaultSets: 4,
        targetReps: '12-15',
        targetRpe: 9,
        restPeriodSeconds: 60,
        notes: 'Hold a strict 2-second isometric pause in the bottom stretch to eliminate Achilles tendon elasticity recoil.'
      },
      {
        id: 'ex-hanging-leg-raise',
        name: 'Hanging Leg / Knee Tucks',
        muscleGroup: 'Core',
        defaultSets: 3,
        targetReps: '12-15',
        targetRpe: 8,
        restPeriodSeconds: 60,
        notes: 'Posterior pelvic tilt at the top to fire rectus abdominis rather than purely hip flexors.'
      }
    ]
  },
  {
    id: 'rpa-pull-deadlift',
    title: 'Overland Pull & Posterior Chain Engine',
    subtitle: 'Deadlift Velocity & Lat Width',
    category: 'Strength',
    frequency: '1-2x / week',
    estimatedDurationMinutes: 60,
    recommendedWarmupId: 'warmup-cns-ramp',
    description: 'Specialized deadlift pulling dynamics paired with upper back density, posterior deltoid prehab, and biceps hypertrophy.',
    exercises: [
      {
        id: 'ex-barbell-deadlift',
        name: 'Conventional Barbell Deadlift',
        muscleGroup: 'Back',
        defaultSets: 4,
        targetReps: '4-5',
        targetRpe: 8.5,
        restPeriodSeconds: 180,
        notes: 'Pull slack out of the barbell first. Engage lats like holding an orange under your armpits, then drive the earth away.'
      },
      {
        id: 'ex-chest-supported-db-row',
        name: 'Chest-Supported Incline DB Row',
        muscleGroup: 'Back',
        defaultSets: 3,
        targetReps: '10-12',
        targetRpe: 8.5,
        restPeriodSeconds: 75,
        notes: 'Completely eliminates lower back strain, allowing maximal lat and rhomboid contraction.'
      },
      {
        id: 'ex-lat-pulldown',
        name: 'Wide Grip Lat Pulldown',
        muscleGroup: 'Back',
        defaultSets: 3,
        targetReps: '10-12',
        targetRpe: 8,
        restPeriodSeconds: 75,
        notes: 'Slight arch in thoracic spine; squeeze lats hard at bottom.'
      },
      {
        id: 'ex-incline-dumbbell-curl',
        name: 'Incline Bench Bicep Dumbbell Curl',
        muscleGroup: 'Arms',
        defaultSets: 3,
        targetReps: '10-12',
        targetRpe: 9,
        restPeriodSeconds: 60,
        notes: 'Maximizes long head stretch of biceps brachii. Keep elbows stationary behind torso.'
      },
      {
        id: 'ex-hammer-curl',
        name: 'Standing Rope Cable Hammer Curl',
        muscleGroup: 'Arms',
        defaultSets: 3,
        targetReps: '12-15',
        targetRpe: 8.5,
        restPeriodSeconds: 60,
        notes: 'Targets brachialis and brachioradialis for forearm thickness and elbow joint protection.'
      }
    ]
  },
  {
    id: 'rpa-athletic-power',
    title: 'Overland Athletic Potentiation & Speed',
    subtitle: 'Triphasic Plyometrics & Rate of Force',
    category: 'Athletic Conditioning',
    frequency: '1x / week',
    estimatedDurationMinutes: 50,
    recommendedWarmupId: 'warmup-cns-ramp',
    description: 'High-performance athletic development combining contrast training, rotational power, and central nervous system recruitment.',
    exercises: [
      {
        id: 'ex-trap-bar-jump',
        name: 'Trap Bar Jump Shrugs / Explosive Pulls',
        muscleGroup: 'Full Body',
        defaultSets: 4,
        targetReps: '4',
        targetRpe: 7.5,
        restPeriodSeconds: 120,
        notes: 'Use 25-30% of 1RM. Maximum velocity intent on triple extension (ankles, knees, hips).'
      },
      {
        id: 'ex-med-ball-rotational-throw',
        name: 'Med Ball Rotational Scoop Toss',
        muscleGroup: 'Core',
        defaultSets: 3,
        targetReps: '6 / side',
        targetRpe: 8,
        restPeriodSeconds: 60,
        notes: 'Pivot on rear foot, whip hips through to generate athletic rotational kinetic chain power.'
      },
      {
        id: 'ex-single-leg-kb-rdl',
        name: 'Single Leg Kettlebell RDL',
        muscleGroup: 'Hamstrings & Glutes',
        defaultSets: 3,
        targetReps: '8 / leg',
        targetRpe: 8,
        restPeriodSeconds: 75,
        notes: 'Glute medius pelvic stability. Square hips toward floor.'
      },
      {
        id: 'ex-farmer-carry',
        name: 'Heavy Trap Bar / Dumbbell Farmer Carries',
        muscleGroup: 'Full Body',
        defaultSets: 3,
        targetReps: '40 yards',
        targetRpe: 8.5,
        restPeriodSeconds: 90,
        notes: 'Grip endurance, anti-lateral flexion core bracing, and trap development.'
      }
    ]
  },
  {
    id: 'hybrid-dumbbell-bodyweight-v2',
    title: 'Hybrid Dumbbell & Bodyweight Planner v2',
    subtitle: 'Automated Overload Rules • Strength & Aerobic Ruck Engine',
    category: 'Hybrid',
    frequency: '2 Days / Week Programmed (Days 1 & 3)',
    estimatedDurationMinutes: 55,
    recommendedWarmupId: 'warmup-upper-primer',
    description: 'Advanced hybrid athletic protocol with automated progression rules: +5 lbs floor press when completing max reps, +1 rep on push-ups every session, +0.5 miles weekly Zone 2 running, and +5 lbs on ruck march when sub-15 min/mi pace is maintained.',
    schedule: [
      {
        day: 1,
        focus: 'Upper Body & Run',
        exercises: [
          {
            id: 'hdb-v2-d1-floor-press',
            name: 'Dumbbell Floor Press',
            muscleGroup: 'Chest',
            type: 'strength',
            defaultSets: 3,
            targetReps: '10-12',
            targetRpe: 8.5,
            restPeriodSeconds: 90,
            progression_rules: {
              metric: 'weight_lbs',
              trigger: 'complete_max_reps',
              increment_value: 5
            },
            notes: 'Progression rule: +5 lbs increment when completing all 3 sets at 12 reps (max reps). Triceps touch floor gently without bouncing.'
          },
          {
            id: 'hdb-v2-d1-pushups',
            name: 'Push-ups',
            muscleGroup: 'Chest',
            type: 'strength',
            defaultSets: 3,
            targetReps: 'AMRAP',
            targetRpe: 9,
            restPeriodSeconds: 60,
            progression_rules: {
              metric: 'reps',
              trigger: 'always',
              increment_value: 1
            },
            notes: 'Progression rule: +1 rep every session. Complete strict chest-to-deck AMRAP (As Many Reps As Possible).'
          },
          {
            id: 'hdb-v2-d1-zone2-run',
            name: 'Zone 2 Run',
            muscleGroup: 'Full Body',
            type: 'cardio',
            defaultSets: 1,
            targetReps: '3 miles',
            restPeriodSeconds: 0,
            distance_miles: 3,
            pace: 'conversational',
            progression_rules: {
              metric: 'distance_miles',
              trigger: 'per_week',
              increment_value: 0.5
            },
            notes: 'Pace: conversational (HR ~65-75% max). Progression rule: +0.5 miles added per week.'
          }
        ]
      },
      {
        day: 3,
        focus: 'Rucking',
        exercises: [
          {
            id: 'hdb-v2-d3-ruck-march',
            name: 'Ruck March',
            muscleGroup: 'Full Body',
            type: 'cardio',
            defaultSets: 1,
            targetReps: '5 miles',
            restPeriodSeconds: 0,
            distance_miles: 5,
            weight_lbs: 30,
            pace: '15-20 min/mi',
            progression_rules: {
              metric: 'weight_lbs',
              trigger: 'pace_under_15_min',
              increment_value: 5
            },
            notes: 'Load: 30 lbs pack. Maintain upright posture and cadence. Progression rule: +5 lbs load when pace drops under 15 min/mi.'
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'hdb-v2-d1-floor-press',
        name: 'Dumbbell Floor Press',
        muscleGroup: 'Chest',
        type: 'strength',
        defaultSets: 3,
        targetReps: '10-12',
        targetRpe: 8.5,
        restPeriodSeconds: 90,
        progression_rules: {
          metric: 'weight_lbs',
          trigger: 'complete_max_reps',
          increment_value: 5
        },
        notes: 'Progression rule: +5 lbs increment when completing all 3 sets at 12 reps (max reps).'
      },
      {
        id: 'hdb-v2-d1-pushups',
        name: 'Push-ups',
        muscleGroup: 'Chest',
        type: 'strength',
        defaultSets: 3,
        targetReps: 'AMRAP',
        targetRpe: 9,
        restPeriodSeconds: 60,
        progression_rules: {
          metric: 'reps',
          trigger: 'always',
          increment_value: 1
        },
        notes: 'Progression rule: +1 rep every session. Complete strict chest-to-deck AMRAP.'
      },
      {
        id: 'hdb-v2-d1-zone2-run',
        name: 'Zone 2 Run',
        muscleGroup: 'Full Body',
        type: 'cardio',
        defaultSets: 1,
        targetReps: '3 miles',
        restPeriodSeconds: 0,
        distance_miles: 3,
        pace: 'conversational',
        progression_rules: {
          metric: 'distance_miles',
          trigger: 'per_week',
          increment_value: 0.5
        },
        notes: 'Pace: conversational. Progression: +0.5 miles per week.'
      },
      {
        id: 'hdb-v2-d3-ruck-march',
        name: 'Ruck March (Day 3 Focus)',
        muscleGroup: 'Full Body',
        type: 'cardio',
        defaultSets: 1,
        targetReps: '5 miles',
        restPeriodSeconds: 0,
        distance_miles: 5,
        weight_lbs: 30,
        pace: '15-20 min/mi',
        progression_rules: {
          metric: 'weight_lbs',
          trigger: 'pace_under_15_min',
          increment_value: 5
        },
        notes: 'Load: 30 lbs pack. Progression: +5 lbs when pace is under 15 min/mi.'
      }
    ]
  },
  {
    id: 'hybrid-dumbbell-bodyweight-v1',
    title: 'Hybrid Dumbbell & Bodyweight Planner',
    subtitle: '4-Day Split • Strength, Core, Ruck & Metcon Intervals',
    category: 'Hybrid',
    frequency: '4 Days / Week Split',
    estimatedDurationMinutes: 60,
    recommendedWarmupId: 'warmup-upper-primer',
    description: 'Comprehensive 4-day hybrid regime combining dumbbell hypertrophy, bodyweight endurance, heavy rucking, and high-intensity interval running.',
    schedule: [
      {
        day: 1,
        focus: 'Upper Body & Run',
        exercises: [
          {
            id: 'hdb-v1-d1-floor-press',
            name: 'Dumbbell Floor Press',
            muscleGroup: 'Chest',
            type: 'strength',
            defaultSets: 3,
            targetReps: '10-12',
            targetRpe: 8.5,
            restPeriodSeconds: 90,
            notes: 'Keep forearms perpendicular to floor. Controlled touch on elbows.'
          },
          {
            id: 'hdb-v1-d1-pullups',
            name: 'Pull-ups',
            muscleGroup: 'Back',
            type: 'strength',
            defaultSets: 3,
            targetReps: '8-10',
            targetRpe: 8.5,
            restPeriodSeconds: 90,
            notes: 'Full dead-hang stretch, pull chin over bar without swinging.'
          },
          {
            id: 'hdb-v1-d1-ohp',
            name: 'Dumbbell Overhead Press',
            muscleGroup: 'Shoulders',
            type: 'strength',
            defaultSets: 3,
            targetReps: '10',
            targetRpe: 8,
            restPeriodSeconds: 60,
            notes: 'Brace core and lock out arms overhead.'
          },
          {
            id: 'hdb-v1-d1-pushups',
            name: 'Push-ups',
            muscleGroup: 'Chest',
            type: 'strength',
            defaultSets: 3,
            targetReps: 'AMRAP',
            targetRpe: 9,
            restPeriodSeconds: 60,
            notes: 'As many reps as possible with disciplined form.'
          },
          {
            id: 'hdb-v1-d1-run',
            name: 'Zone 2 Run',
            muscleGroup: 'Full Body',
            type: 'cardio',
            defaultSets: 1,
            targetReps: '3 miles',
            restPeriodSeconds: 0,
            distance_miles: 3,
            pace: 'conversational',
            notes: '3.0 miles continuous aerobic run at conversational pace.'
          }
        ]
      },
      {
        day: 2,
        focus: 'Lower Body & Core',
        exercises: [
          {
            id: 'hdb-v1-d2-goblet-squat',
            name: 'Dumbbell Goblet Squat',
            muscleGroup: 'Quads',
            type: 'strength',
            defaultSets: 4,
            targetReps: '10',
            targetRpe: 8.5,
            restPeriodSeconds: 90,
            notes: 'Hold heavy dumbbell vertically at chest. Full hip depth.'
          },
          {
            id: 'hdb-v1-d2-rdl',
            name: 'Dumbbell RDL',
            muscleGroup: 'Hamstrings & Glutes',
            type: 'strength',
            defaultSets: 3,
            targetReps: '12',
            targetRpe: 8,
            restPeriodSeconds: 90,
            notes: 'Push hips back; maintain flat back and hamstring stretch.'
          },
          {
            id: 'hdb-v1-d2-lunges',
            name: 'Dumbbell Reverse Lunges',
            muscleGroup: 'Quads',
            type: 'strength',
            defaultSets: 3,
            targetReps: '10 per leg',
            targetRpe: 8.5,
            restPeriodSeconds: 90,
            notes: 'Step back with control. Keep torso upright.'
          },
          {
            id: 'hdb-v1-d2-plank',
            name: 'Plank',
            muscleGroup: 'Core',
            type: 'core',
            defaultSets: 3,
            targetReps: '60s',
            targetRpe: 8,
            restPeriodSeconds: 45,
            notes: '60-second isometric hold. Squeeze glutes and pack core tight.'
          }
        ]
      },
      {
        day: 3,
        focus: 'Rucking',
        exercises: [
          {
            id: 'hdb-v1-d3-ruck',
            name: 'Ruck March',
            muscleGroup: 'Full Body',
            type: 'cardio',
            defaultSets: 1,
            targetReps: '5 miles',
            restPeriodSeconds: 0,
            distance_miles: 5,
            weight_lbs: 30,
            pace: '15-20 min/mi',
            notes: '5 miles ruck with 30 lbs pack. Target 15-20 minutes per mile pace.'
          }
        ]
      },
      {
        day: 4,
        focus: 'Full Body & Intervals',
        exercises: [
          {
            id: 'hdb-v1-d4-thrusters',
            name: 'Dumbbell Thrusters',
            muscleGroup: 'Full Body',
            type: 'strength',
            defaultSets: 3,
            targetReps: '12',
            targetRpe: 9,
            restPeriodSeconds: 60,
            notes: 'Deep front squat into explosive overhead thruster.'
          },
          {
            id: 'hdb-v1-d4-renegade-rows',
            name: 'Dumbbell Renegade Rows',
            muscleGroup: 'Back',
            type: 'strength',
            defaultSets: 3,
            targetReps: '8 per side',
            targetRpe: 8.5,
            restPeriodSeconds: 60,
            notes: 'Push-up plank position; row dumbbell to hip without twisting pelvis.'
          },
          {
            id: 'hdb-v1-d4-jump-squats',
            name: 'Bodyweight Jump Squats',
            muscleGroup: 'Quads',
            type: 'strength',
            defaultSets: 3,
            targetReps: '15',
            targetRpe: 8.5,
            restPeriodSeconds: 60,
            notes: 'Explosive triple extension. Land softly on balls of feet.'
          },
          {
            id: 'hdb-v1-d4-intervals',
            name: '400m Run Intervals',
            muscleGroup: 'Full Body',
            type: 'cardio',
            defaultSets: 6,
            targetReps: '400m',
            restPeriodSeconds: 90,
            notes: '6 rounds of 400m sprints. Rest 90 seconds between rounds.'
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'hdb-v1-d1-floor-press',
        name: 'Dumbbell Floor Press',
        muscleGroup: 'Chest',
        type: 'strength',
        defaultSets: 3,
        targetReps: '10-12',
        targetRpe: 8.5,
        restPeriodSeconds: 90,
        notes: 'Keep forearms perpendicular to floor. Controlled touch on elbows.'
      },
      {
        id: 'hdb-v1-d1-pullups',
        name: 'Pull-ups',
        muscleGroup: 'Back',
        type: 'strength',
        defaultSets: 3,
        targetReps: '8-10',
        targetRpe: 8.5,
        restPeriodSeconds: 90,
        notes: 'Full dead-hang stretch, pull chin over bar without swinging.'
      },
      {
        id: 'hdb-v1-d1-ohp',
        name: 'Dumbbell Overhead Press',
        muscleGroup: 'Shoulders',
        type: 'strength',
        defaultSets: 3,
        targetReps: '10',
        targetRpe: 8,
        restPeriodSeconds: 60,
        notes: 'Brace core and lock out arms overhead.'
      },
      {
        id: 'hdb-v1-d1-pushups',
        name: 'Push-ups',
        muscleGroup: 'Chest',
        type: 'strength',
        defaultSets: 3,
        targetReps: 'AMRAP',
        targetRpe: 9,
        restPeriodSeconds: 60,
        notes: 'As many reps as possible with disciplined form.'
      },
      {
        id: 'hdb-v1-d1-run',
        name: 'Zone 2 Run',
        muscleGroup: 'Full Body',
        type: 'cardio',
        defaultSets: 1,
        targetReps: '3 miles',
        restPeriodSeconds: 0,
        distance_miles: 3,
        pace: 'conversational',
        notes: '3.0 miles continuous aerobic run at conversational pace.'
      }
    ]
  }
];

export const INITIAL_WARMUPS: WarmUpRoutine[] = [
  {
    id: 'warmup-apex-sop',
    title: 'The Apex Protocol SOP Warmup (Elevate, Mobilize, Activate)',
    category: 'Full Body / CNS',
    durationMinutes: 10,
    description: "Standard Operating Procedures (WARMUP) - Execute this sequence before every strength session. Do not bypass the preparation phase. This lubricates the joints, activates the CNS, and primes the kinetic chain.",
    focusMuscles: ['Full Body', 'CNS Priming', 'Thoracic Spine', 'Hip Complex', 'Ankles'],
    steps: [
      {
        id: 'sop-elevate',
        name: '1. Elevate: Row, Assault Bike, or Light Jog',
        targetArea: 'Systemic Temperature & Blood Flow',
        durationSeconds: 240,
        repsText: '3-5 Minutes',
        cues: [
          'Progressively elevate core body temperature and heart rate.',
          'Bring breathing rate up without inducing lactic fatigue.'
        ],
        coachingPoint: 'Joint fluid becomes less viscous as body temperature rises.'
      },
      {
        id: 'sop-wgs',
        name: "2. Mobilize: World's Greatest Stretch",
        targetArea: 'Hips, Thoracic Spine, Ankles & Hamstrings',
        repsText: '10 Reps per side',
        durationSeconds: 90,
        cues: [
          'Deep lunge stance, place inside elbow toward ankle.',
          'Rotate arm to ceiling, tracking thumb with eyes.',
          'Shift back to straighten front leg and stretch hamstring.'
        ],
        coachingPoint: 'Unlocks multi-planar rotational mobility across ankles, hips, and T-spine.'
      },
      {
        id: 'sop-band-pullapart',
        name: '2. Mobilize: Band Pull-Aparts',
        targetArea: 'Scapular Retractors & Rear Delts',
        repsText: '3 x 15 Reps',
        durationSeconds: 60,
        cues: [
          'Keep arms straight, depress shoulders away from ears.',
          'Pull band until it contacts breastbone. 1s pause.'
        ],
        coachingPoint: 'Establishes a solid upper back platform for heavy pressing and pulling.'
      },
      {
        id: 'sop-lunge-twist',
        name: '2. Mobilize: Walking Lunge w/ Thoracic Twist',
        targetArea: 'Hip Flexors, Glutes & Thoracic Spine',
        repsText: '10 Reps per side',
        durationSeconds: 75,
        cues: [
          'Step forward into deep lunge, knee tracking over toes.',
          'Rotate torso over lead knee with tall upright posture.'
        ],
        coachingPoint: 'Opens anterior hip capsule and primes reciprocal glute firing.'
      },
      {
        id: 'sop-goblet-squat',
        name: '3. Activate: KB Goblet Squat (3-sec pause)',
        targetArea: 'Quadriceps, Adductors & Deep Core',
        repsText: '2 x 8 Reps (3s pause)',
        durationSeconds: 60,
        cues: [
          'Hold kettlebell at sternum.',
          'Descend into deep squat, hold bottom position for 3 full seconds.',
          'Drive through whole foot to stand tall.'
        ],
        coachingPoint: 'Forces neuromuscular recruitment at the deep end-range of hip flexion.'
      },
      {
        id: 'sop-shoulder-taps',
        name: '3. Activate: Plank Shoulder Taps',
        targetArea: 'Anti-Rotational Core & Scapular Stability',
        repsText: '2 x 20 Reps (10/side)',
        durationSeconds: 50,
        cues: [
          'Solid pushup plank, feet slightly wider than shoulder width.',
          'Tap opposite shoulder without letting hips sway side-to-side.'
        ],
        coachingPoint: 'Primes rotational stability and anti-torsional core stiffness.'
      },
      {
        id: 'sop-broad-jumps',
        name: '3. Activate: Broad Jumps (Max Intent)',
        targetArea: 'CNS Neurological Firing & Triple Extension',
        repsText: '2 x 3 Reps (Max Intent)',
        durationSeconds: 45,
        cues: [
          'Load hips back, swing arms back, explode forward with 100% intent.',
          'Land softly in athletic quarter squat, absorbing force through hips.'
        ],
        coachingPoint: 'Maximal velocity CNS recruitment immediately before loading compound barbells.'
      }
    ]
  },
  {
    id: 'warmup-upper-primer',
    title: 'Overland Upper Body Scapular & Thoracic Primer',
    category: 'Upper Body',
    durationMinutes: 7,
    description: 'Essential pre-lift protocol designed to unlock thoracic spine mobility, lubricate the glenohumeral joint, and fire rotator cuff stabilizers prior to pressing and pulling.',
    focusMuscles: ['Thoracic Spine', 'Rotator Cuff', 'Pectorals', 'Serratus Anterior', 'Scapulae'],
    steps: [
      {
        id: 'wus-1',
        name: 'Thoracic Spine Foam Roller Extensions',
        targetArea: 'T-Spine & Posture',
        durationSeconds: 45,
        cues: [
          'Place roller at mid-back level (below scapulae).',
          'Support neck with hands; inhale as you arch back gently over the roller.',
          'Exhale and return to neutral without arching lumbar spine.'
        ],
        coachingPoint: 'ISSA Guideline: Restoring 15° of thoracic extension significantly reduces impingement risk during overhead and bench presses.'
      },
      {
        id: 'wus-2',
        name: 'Band Pull-Aparts (Overhand & Underhand)',
        targetArea: 'Rear Delts & Rhomboids',
        repsText: '20 reps (10 over / 10 under)',
        durationSeconds: 40,
        cues: [
          'Keep elbows locked straight and shoulders depressed away from ears.',
          'Pull band horizontally across chest until it touches breastbone.',
          'Hold 1-second peak squeeze between shoulder blades.'
        ],
        coachingPoint: 'Wakes up mid-trapezius and rhomboids to create a sturdy pressing platform.'
      },
      {
        id: 'wus-3',
        name: 'Quadruped Scapular Push-Ups',
        targetArea: 'Serratus Anterior',
        repsText: '12 controlled reps',
        durationSeconds: 35,
        cues: [
          'Arms remain completely straight in high plank or quadruped stance.',
          'Pinch shoulder blades together, then push the floor away to protract.',
          'Feel the ribs wrap around your torso.'
        ],
        coachingPoint: 'Crucial for upward scapular rotation and overhead joint clearance.'
      },
      {
        id: 'wus-4',
        name: 'Banded Face Pulls with External Rotation',
        targetArea: 'Infraspinatus & Teres Minor',
        repsText: '15 reps',
        durationSeconds: 45,
        cues: [
          'Anchor band at eye level.',
          'Pull band towards eyes while rotating fists backward above elbows into a "double biceps" pose.',
          'Control the eccentric return.'
        ],
        coachingPoint: 'Pre-activates the dynamic stabilizers of the humeral head.'
      },
      {
        id: 'wus-5',
        name: 'Push-Up to Downward Dog Flow',
        targetArea: 'Pecs, Lats & Posterior Chain',
        repsText: '8 smooth reps',
        durationSeconds: 45,
        cues: [
          'Perform a standard crisp pushup.',
          'Drive hips high into the ceiling, pushing chest back towards thighs.',
          'Pedal heels slightly to awaken calf and hamstring tension.'
        ],
        coachingPoint: 'Full kinetic chain integration prior to loading the barbell.'
      }
    ]
  },
  {
    id: 'warmup-lower-hip',
    title: 'Overland Lower Body Hip Capsule & Ankle Opener',
    category: 'Lower Body',
    durationMinutes: 8,
    description: 'Targeted mobility protocol to open hip capsules, improve ankle dorsiflexion for deeper squats, and activate glute medius for knee tracking stability.',
    focusMuscles: ['Hip Flexors', 'Glutes', 'Adductors', 'Ankle Joint', 'Hamstrings'],
    steps: [
      {
        id: 'wus-l1',
        name: '90/90 Hip Mobility Flow',
        targetArea: 'Hip Internal & External Rotation',
        durationSeconds: 60,
        cues: [
          'Sit with front leg bent 90° and back leg bent 90° on the floor.',
          'Hinge forward over front shin with a tall neutral spine.',
          'Transition to opposite side without using hands on the ground if mobility allows.'
        ],
        coachingPoint: 'Hip internal rotation is required for squat depth without compensating in the lumbar spine.'
      },
      {
        id: 'wus-l2',
        name: 'Half-Kneeling Ankle Dorsiflexion Rocks',
        targetArea: 'Talocrural Joint & Achilles',
        repsText: '10 rocks / ankle',
        durationSeconds: 50,
        cues: [
          'Drive lead knee forward directly over 2nd and 3rd toes.',
          'Keep heel glued to the floor with firm downward pressure.',
          'Hold 2-second stretch at end range.'
        ],
        coachingPoint: 'Greater ankle dorsiflexion permits upright torso angle in back and front squats.'
      },
      {
        id: 'wus-l3',
        name: 'World\'s Greatest Stretch + Hamstring Floss',
        targetArea: 'Hip Flexor, Groin & Thoracic',
        repsText: '5 reps / side',
        durationSeconds: 60,
        cues: [
          'Long runner lunge with both hands inside front foot.',
          'Reach lead elbow down to inside ankle, then rotate chest up to the sky.',
          'Rock back onto rear heel to floss front hamstring.'
        ],
        coachingPoint: 'Addresses hip extension, thoracic rotation, and hamstring excursion in one sequence.'
      },
      {
        id: 'wus-l4',
        name: 'Mini-Band Glute Bridges with Abduction',
        targetArea: 'Gluteus Maximus & Medius',
        repsText: '15 reps + 5s hold',
        durationSeconds: 45,
        cues: [
          'Place band just above knees.',
          'Drive through heels to full hip extension without hyperextending lumbar spine.',
          'Push knees outward against band resistance at top of bridge.'
        ],
        coachingPoint: 'ISSA Neural Priming: Prevents knee valgus collapse under heavy loads.'
      },
      {
        id: 'wus-l5',
        name: 'Cossack Squats (Lateral Lunges)',
        targetArea: 'Adductors & Hip Mobility',
        repsText: '6 reps / side',
        durationSeconds: 45,
        cues: [
          'Wide sumo stance. Shift weight to one side, sitting deep into hip.',
          'Keep non-working leg straight with toes rotated upward.',
          'Keep working heel planted firmly.'
        ],
        coachingPoint: 'Prepares adductor magnus for deep deceleration and lateral stability.'
      }
    ]
  },
  {
    id: 'warmup-cns-ramp',
    title: 'Overland Central Nervous System Potentiation & Ramp',
    category: 'Full Body / CNS',
    durationMinutes: 5,
    description: 'Short, high-intensity neural primer designed to elevate heart rate, recruit high-threshold motor units (Type IIx fibers), and synchronize coordination.',
    focusMuscles: ['CNS', 'Core Bracing', 'Posterior Chain', 'Foot & Ankle Stiffness'],
    steps: [
      {
        id: 'wus-c1',
        name: 'Reactive Pogo Hops (Ankle Stiffness)',
        targetArea: 'Achilles Spring & CNS Frequency',
        durationSeconds: 30,
        cues: [
          'Bounce rapidly on balls of feet with minimal knee bend.',
          'Pull toes up towards shins in midair (dorsiflexion).',
          'Make ground contact time as short and crisp as possible.'
        ],
        coachingPoint: 'Fires stretch-shortening cycle (SSC) to prime fast-twitch muscle fibers.'
      },
      {
        id: 'wus-c2',
        name: 'Deadbugs with Contrasting Tension',
        targetArea: 'Anterior Core & Pelvic Anti-Extension',
        repsText: '10 reps (slow & deliberate)',
        durationSeconds: 40,
        cues: [
          'Flatten lower back into the floor until zero light can pass under.',
          'Extend opposite arm and leg while maintaining continuous abdominal pressure.',
          'Exhale forcefully through pursed lips on extension.'
        ],
        coachingPoint: 'Establishes the intra-abdominal pressure (IAP) required for heavy compound lifts.'
      },
      {
        id: 'wus-c3',
        name: 'Explosive Medicine Ball Slams or Broad Jumps',
        targetArea: 'Full Body Power Transfer',
        repsText: '5 max-effort reps',
        durationSeconds: 35,
        cues: [
          'Triple extension reaching overhead.',
          'Hinge violently through hips and slam ball straight down.',
          'Reset completely between each repetition.'
        ],
        coachingPoint: 'Post-Activation Potentiation (PAP): Priming neural pathways for 1RM and heavy sets.'
      }
    ]
  }
];

export const INITIAL_SUPPLEMENTS: SupplementProtocol[] = [
  {
    id: 'supp-pre-1',
    name: 'BAMF / Woke AF High-Stim Pre-Workout',
    dosage: '1 Rounded Scoop (approx. 12g / 6,000 mg L-Citrulline) in 8-10oz water',
    phase: 'pre_workout',
    phaseLabel: 'Pre-Workout Priming',
    timingWindow: 'T-Minus 20-30 Min Prior to Training',
    benefit: 'Prime your CNS and lock in focus with 6,000 mg L-Citrulline pump complex. For empty stomach training, consume 20 mins prior. If you\'ve had a meal, allow 45 mins. Formulated for heavy lifting or intense interval days.',
    issaGuideline: 'ISSA Protocol: High-potency stimulants elevate motor unit firing rates and delay perceived exertion during high-RPE lifting or track intervals.',
    takenToday: false
  },
  {
    id: 'supp-pre-2',
    name: 'Bucked Up Non-Stim Pre-Workout',
    dosage: '1 Scoop (6,000 mg L-Citrulline) in 10-12oz water',
    phase: 'pre_workout',
    phaseLabel: 'Pre-Workout Priming',
    timingWindow: 'T-Minus 20-30 Min Prior to Training',
    benefit: 'Cellular hydration, peak vasodilation (6,000 mg L-Citrulline), and pump without caffeine or stims. Ideal for evening sessions or Zone 2 recovery runs.',
    issaGuideline: 'ISSA Protocol: Non-stimulant nitric oxide boosters enhance capillary delivery without disrupting autonomic parasympathetic tone or sleep onset.',
    takenToday: false
  },
  {
    id: 'supp-pre-3',
    name: 'L-Citrulline (Nitric Oxide & Blood Flow)',
    dosage: '6,000 mg in 8-12oz water',
    phase: 'pre_workout',
    phaseLabel: 'Pre-Workout Priming',
    timingWindow: 'T-Minus 20-30 Min Prior to Training',
    benefit: 'Endothelial nitric oxide synthase priming for maximal muscle pump, vascular dilation, and accelerated ammonia/lactate clearance during hybrid lifting & running.',
    issaGuideline: 'ISSA Sports Nutrition Protocol: Clinical 6,000 mg dose optimizes plasma L-arginine levels and muscular oxygen delivery without digestive distress.',
    takenToday: false
  },
  {
    id: 'supp-intra-1',
    name: 'Original BCAA 2:1:1 Intra-Workout',
    dosage: '1 Scoop (approx. 7g) in 20-24oz cold water',
    phase: 'intra_workout',
    phaseLabel: 'Intra-Workout Fuel',
    timingWindow: 'During Session (Sip Steadily)',
    benefit: 'Hybrid training rapidly depletes glycogen. Sipping aminos delays fatigue and starts the recovery process early. Sip throughout long runs or heavy lifts.',
    issaGuideline: 'ISSA Protocol: Leucine:Isoleucine:Valine in 2:1:1 ratio halts exercise-induced proteolysis and spares muscle glycogen during concurrent aerobic/strength training.',
    takenToday: false
  },
  {
    id: 'supp-intra-2',
    name: 'RACKED Branched-Chain Aminos',
    dosage: '1 Scoop in 24oz water',
    phase: 'intra_workout',
    phaseLabel: 'Intra-Workout Fuel',
    timingWindow: 'During Session / Fasted Cardio',
    benefit: 'Use during fasted cardio for thermogenic fat utilization and muscle sparing during early morning runs or interval sprints.',
    issaGuideline: 'ISSA Protocol: Acetyl L-Carnitine shuttles long-chain fatty acids into mitochondria for beta-oxidation during Zone 2 aerobic pacing.',
    takenToday: false
  },
  {
    id: 'supp-post-1',
    name: 'Six Point Creatine',
    dosage: '5g daily with 16oz hydration or post shake',
    phase: 'post_workout',
    phaseLabel: 'Post-Workout Recovery',
    timingWindow: 'Within 30 Min Post-Workout',
    benefit: '5g daily with hydration to restore ATP stores. Replenish ATP and repair muscle fibers. Essential for surviving 12 weeks of concurrent volume.',
    issaGuideline: 'ISSA Protocol: Chronic phosphocreatine saturation increases power output across repeated explosive bouts by up to 15%. Co-ingest with carbohydrate for peak uptake.',
    takenToday: false
  },
  {
    id: 'supp-post-2',
    name: 'Buck Feed Protein (Grass-Fed Whey)',
    dosage: '1-2 Scoops (25-50g protein) in 12oz water/milk',
    phase: 'post_workout',
    phaseLabel: 'Post-Workout Recovery',
    timingWindow: 'Within 30 Min Post-Workout',
    benefit: 'Fast-acting whey to restore glycogen and initiate rapid muscle protein synthesis (MPS). Essential for concurrent recovery.',
    issaGuideline: 'ISSA Protocol: Delivers ≥3g leucine to trigger the mTOR anabolic cascade during the heightened post-exercise insulin sensitivity window.',
    takenToday: false
  },
  {
    id: 'supp-found-1',
    name: 'High-Potency Omega-3 Fish Oil (EPA/DHA)',
    dosage: '2,000 mg (1,200mg EPA / 600mg DHA)',
    phase: 'morning',
    phaseLabel: 'Morning Foundation',
    timingWindow: 'With Breakfast / Dietary Fats',
    benefit: 'Systemic joint lubrication and anti-inflammatory support across the 12-week high-impact running & lifting volume.',
    issaGuideline: 'ISSA Protocol: Fat-soluble fatty acids improve red blood cell deformability and oxygen kinetics during sustained aerobic work.',
    takenToday: true,
    takenAt: '08:00 AM'
  },
  {
    id: 'supp-found-2',
    name: 'Magnesium Glycinate (TRAACS Chelate)',
    dosage: '400 mg Elemental Magnesium',
    phase: 'evening',
    phaseLabel: 'Evening Recovery & Sleep',
    timingWindow: '45 Min Before Bed',
    benefit: 'Parasympathetic down-regulation, muscle twitch prevention, and restorative deep slow-wave sleep after concurrent training.',
    issaGuideline: 'ISSA Protocol: Magnesium is a cofactor in >300 enzymatic reactions, crucial for neuromuscular transmission and nocturnal growth hormone secretion.',
    takenToday: false
  }
];

// Past workout session history - starts empty so every athlete begins fresh
export const INITIAL_PAST_LOGS: WorkoutSessionLog[] = [];

