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

// 12-Week Protocol (Sunday Start + Warmups) - Risner Performance Athletics Template
export const PROTOCOL_DATA: Record<string, ProtocolPhase> = {
  phase1: {
    id: 'phase1',
    title: "Phase 1: Foundation",
    weeks: "Weeks 1-4",
    desc: "Establish aerobic base (Zone 2) and build foundational movement strength. Progress by adding 10% volume each week.",
    coachRule: "Coach Aryan's Overload Laws: +10 lbs on lower compound lifts (Squat, Deadlift) and +5 lbs on upper compound lifts (Bench, OHP, Rows) upon completing top rep range with strict form. Weekly Zone 2 volume increases by 0.5 - 1.0 mile.",
    days: [
      {
        day: "Sunday",
        focus: "Lower Strength + Base",
        warmup: "5 mins light cardio, dynamic leg swings, bodyweight squats, and ankle mobility.",
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
        day: "Monday",
        focus: "Upper Hypertrophy",
        warmup: "Arm circles, band pull-aparts, push-up walkouts, and thoracic rotations.",
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
        day: "Tuesday",
        focus: "Interval Speed Work",
        warmup: "10 mins easy jog, high knees, butt kicks, A-skips, and 3 short strides.",
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
        day: "Wednesday",
        focus: "Full Body + Tempo",
        warmup: "Dynamic lunges, inchworms, light kettlebell swings, and hip openers.",
        strength: [
          "Deadlift (4x5 Heavy) [Overload: +10 lbs on 5 reps]",
          "Push Press (4x6) [Overload: +5 lbs on 6 reps]",
          "Chest-Supported Row (3x10) [Overload: +5 lbs on 10 reps]"
        ],
        run: "Tempo Run (3-4 Miles)",
        pace: "2-3 Miles at Tempo Pace (RPE 6-7).",
        progressionRule: "Deadlift: +10 lbs on 5 reps; Push Press: +5 lbs on 6 reps"
      },
      {
        day: "Thursday",
        focus: "Active Recovery",
        warmup: "Cat-cow transitions, 90/90 hip stretches, and deep diaphragmatic breathing.",
        strength: ["Stretching, foam rolling, or light yoga."],
        run: "Optional Light Spin",
        pace: "Keep heart rate under 110 bpm.",
        progressionRule: "Active recovery & mobility. Heart rate < 110 bpm."
      },
      {
        day: "Friday",
        focus: "Long Endurance",
        warmup: "5 mins brisk walk, calf stretching, and hip flexor activation.",
        strength: ["Pre-hab exercises (glute bridges, clamshells)."],
        run: "Long Run (6-10 Miles)",
        pace: "Zone 2 / RPE 3-4. Time on feet is the goal.",
        progressionRule: "Zone 2 Long Run: +0.5 to +1.0 mile/week base building"
      },
      {
        day: "Saturday",
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
    coachRule: "Coach Aryan's Overload Laws: +10 lbs on lower compound lifts (Squat, Deadlift) and +5 lbs on upper compound lifts (Bench, OHP, Rows) upon completing top rep range with strict form. Weekly Zone 2 volume increases by 0.5 - 1.0 mile.",
    days: [
      {
        day: "Sunday",
        focus: "Lower Power + Recovery",
        warmup: "5 mins bike, glute bridges, pogo jumps, and empty bar warm-up sets.",
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
        day: "Monday",
        focus: "Upper Body Strength",
        warmup: "Band dislocates, scapular pull-ups, and light dumbbell presses.",
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
        day: "Tuesday",
        focus: "Threshold Intervals",
        warmup: "10-15 mins easy jog, dynamic stretches, and 3-4 tempo buildups.",
        strength: [
          "Hanging Leg Raises (3x12)",
          "Ab Wheel Rollouts (3x10) [Overload: +2 reps/set]"
        ],
        run: "Long Intervals (40 Mins)",
        pace: "4x800m at 5K Pace (RPE 8-9). 2 Min recovery.",
        progressionRule: "800m Repeats: Maintain target 5K pace; Rest: strict 2 min"
      },
      {
        day: "Wednesday",
        focus: "Full Body Volume",
        warmup: "PVC pipe overhead squats, bird-dogs, and kettlebell halos.",
        strength: [
          "Deadlift (4x4) [Overload: +10 lbs on 4 reps]",
          "DB Bench Press (3x10) [Overload: +5 lbs on 10 reps]",
          "Single Arm Row (3x10) [Overload: +5 lbs on 10 reps]"
        ],
        run: "Threshold Run (4-6 Miles)",
        pace: "3-4 Miles at Threshold Pace (RPE 7-8).",
        progressionRule: "Deadlift: +10 lbs on 4x4; DB Bench: +5 lbs on 10 reps"
      },
      {
        day: "Thursday",
        focus: "Active Recovery",
        warmup: "Foam rolling calves and quads, followed by a light mobility flow.",
        strength: ["Light mobility work."],
        run: "Cross-training (20 mins)",
        pace: "Low intensity.",
        progressionRule: "Active recovery & low-impact aerobic flush"
      },
      {
        day: "Friday",
        focus: "Long Endurance",
        warmup: "Ankle circles, walking lunges, and gentle dynamic stretching.",
        strength: ["None."],
        run: "Long Run (8-14 Miles)",
        pace: "Zone 2. Add 2-3 surges in final miles.",
        progressionRule: "Long Run: Zone 2 pacing with 2-3 surges in final 2 miles"
      },
      {
        day: "Saturday",
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
    coachRule: "Coach Aryan's Overload Laws: +10 lbs on lower compound lifts (Squat, Deadlift) and +5 lbs on upper compound lifts (Bench, OHP, Rows) upon completing top rep range with strict form. Weekly Zone 2 volume increases by 0.5 - 1.0 mile.",
    days: [
      {
        day: "Sunday",
        focus: "Lower Max Strength",
        warmup: "CNS Prep: Box jumps (3x3), heavy sled pushes, and dynamic stretches.",
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
        day: "Monday",
        focus: "Upper Max Strength",
        warmup: "Plyo push-ups (3x3), medicine ball slams, and rotator cuff warm-up.",
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
        day: "Tuesday",
        focus: "Speed Endurance",
        warmup: "15 mins easy jog, thorough dynamic stretching, and full-speed 50m sprints (x3).",
        strength: [
          "Weighted Planks (3x45s) [Overload: +5-10 lbs plate]",
          "Cable Woodchoppers (3x12/side)"
        ],
        run: "Short Sprint Intervals",
        pace: "10x200m at Mile Pace (RPE 9+). 200m walk recovery.",
        progressionRule: "Sprint Intervals: 10x200m at Mile Pace (RPE 9+)"
      },
      {
        day: "Wednesday",
        focus: "Race Pace Sim",
        warmup: "10 mins easy jog, dynamic stretches, and dial into race pace for 1 min.",
        strength: [
          "Trap Bar Deadlift (3x5) [Overload: +10 lbs on 5 reps]",
          "DB Overhead Press (3x8) [Overload: +5 lbs on 8 reps]"
        ],
        run: "Race Pace Simulation",
        pace: "2-3 Miles at Goal Race Pace.",
        progressionRule: "Trap Bar Deadlift: +10 lbs on 5 reps; Race Pace Sim"
      },
      {
        day: "Thursday",
        focus: "Active Recovery",
        warmup: "Yoga flow, deep stretching, and parasympathetic breathing.",
        strength: ["Yoga or dynamic stretching."],
        run: "Rest.",
        pace: "N/A",
        progressionRule: "Parasympathetic breathing, light yoga, and recovery"
      },
      {
        day: "Friday",
        focus: "Long Endurance (Taper)",
        warmup: "Light walk, hip mobility, and mental visualization.",
        strength: ["None."],
        run: "Long Run (10-15+ Miles)",
        pace: "Zone 2. (Reduce mileage by 50% in Week 12).",
        progressionRule: "Taper & peak: reduce volume by 50% in Week 12"
      },
      {
        day: "Saturday",
        focus: "Complete Rest",
        warmup: "None.",
        strength: ["Refuel and rest."],
        run: "Rest.",
        pace: "N/A",
        progressionRule: "Complete Rest & Mental preparation for testing"
      }
    ]
  },
  db_phase1: {
    id: 'db_phase1',
    title: "Phase 1: DB Foundation & Muscular Endurance",
    weeks: "Weeks 1-4",
    desc: "Engineered by Coach Aryan Risner, ISSA-CPT. Base hypertrophy, push-up volume accumulation, and aerobic base building with standard 25-30 lb ruck.",
    coachRule: "Phase 1 Overload Laws: Floor press +5 lbs when hitting 3x12. Push-ups +1 rep every session. Zone 2 run +0.5 mi/wk. Ruck +5 lbs when pace < 15 min/mi.",
    days: [
      {
        day: "Monday",
        focus: "Upper Body & Zone 2 Run",
        warmup: "Arm circles, band pull-aparts, push-up walkouts, scapular wall slides (5-8 mins).",
        strength: [
          "Dumbbell Floor Press (3x10-12) [Overload: +5 lbs on 12 reps]",
          "Push-ups (3xAMRAP) [Overload: +1 rep per session]",
          "Neutral Grip DB Row (3x10-12) [Overload: +5 lbs on 12 reps]",
          "Overhead Dumbbell Triceps Extension (3x12)"
        ],
        run: "3.0 Mile Zone 2 Run",
        pace: "Conversational (HR ~65-75% max) [+0.5 mi / wk progression]",
        progressionRule: "Floor Press: +5 lbs upon hitting 12 reps; Push-ups: +1 rep/session; Run: +0.5 mi/wk"
      },
      {
        day: "Tuesday",
        focus: "Lower Power & Core",
        warmup: "Dynamic leg swings, bodyweight squats, hip 90/90 openers, and glute bridges.",
        strength: [
          "Dumbbell Bulgarian Split Squats (3x10-12/leg) [Overload: +5 lbs]",
          "Dumbbell Romanian Deadlift (3x10-12) [Overload: +5-10 lbs]",
          "Goblet Squats (3x12) [Overload: +5 lbs]",
          "Plank to Bear Crawl Holds (3x45-60s)"
        ],
        run: "Active Recovery Walk or Light Spin (20 mins)",
        pace: "Zone 1 / HR under 120 bpm",
        progressionRule: "Bulgarian Split Squats: +5 lbs; DB RDL: +5-10 lbs upon hitting 12 reps"
      },
      {
        day: "Wednesday",
        focus: "Active Recovery & Mobility",
        warmup: "Full-body yoga flow, hip openers, band dislocates (10-15 mins).",
        strength: [
          "Thoracic Spine Openers & Foam Rolling (15 mins)",
          "Hanging Knee / Leg Raises (3x12-15)",
          "Side Plank Rotations (3x10/side)"
        ],
        run: "20-30 Min Easy Aerobic Flush Run",
        pace: "Zone 1-2 / RPE 3. Conversational.",
        progressionRule: "Active recovery: flush metabolic byproducts, perfect mobility"
      },
      {
        day: "Thursday",
        focus: "Full Body Work Capacity",
        warmup: "Inchworms, jumping jacks, mountain climbers, light dumbbell halos.",
        strength: [
          "Dumbbell Clean & Push Press (4x8) [Overload: +5 lbs on 8 reps]",
          "Renegade Rows with DBs (3x10/side) [Overload: +5 lbs]",
          "Dumbbell Walking Lunges (3x12/leg)",
          "Ab Wheel Rollouts or Weighted Plank (3x60s)"
        ],
        run: "Metcon Intervals (20-25 mins)",
        pace: "6x300m hard efforts (RPE 8) with 90s walk recovery",
        progressionRule: "Clean & Push Press: +5 lbs on 8 reps; Metcon: drop 2s per interval"
      },
      {
        day: "Friday",
        focus: "Rucking (Base Pack Load)",
        warmup: "Calf stretch, brisk unloaded walk 5 mins, hip flexor stretch, shoulder band pulls.",
        strength: [
          "Ruck Pack Upright March (30 lbs pack)",
          "Farmer Walk Carries with DBs (3x50 yards) [Overload: +5 lbs DBs]",
          "Standing DB Calf Raises (3x15)"
        ],
        run: "4.0 - 5.0 Mile Ruck March (30 lbs Pack)",
        pace: "15-20 min/mile [+5 lbs pack load when pace drops under 15 min/mi]",
        progressionRule: "Ruck March: +5 lbs pack load when pace drops below 15 min/mi"
      },
      {
        day: "Saturday",
        focus: "Long Aerobic Endurance",
        warmup: "Dynamic lower-body routine, high knees, butt kicks, leg swings.",
        strength: [
          "Push-up Volume Finisher (2x20)",
          "Bodyweight Walking Lunges (2x20/leg)"
        ],
        run: "5.0 - 7.0 Mile Zone 2 Long Run",
        pace: "Conversational Base (HR 130-145 bpm). Strict Zone 2.",
        progressionRule: "Zone 2 Long Run: +0.5 mi weekly aerobic volume expansion"
      },
      {
        day: "Sunday",
        focus: "Complete Rest & Prep",
        warmup: "Gentle walking and hydration.",
        strength: ["Full recovery, meal prep, and sleep restoration."],
        run: "Rest.",
        pace: "N/A",
        progressionRule: "Hydrate, sleep 8+ hours, plan upcoming training block"
      }
    ]
  },
  db_phase2: {
    id: 'db_phase2',
    title: "Phase 2: DB Strength Density & Threshold",
    weeks: "Weeks 5-8",
    desc: "Engineered by Coach Aryan Risner, ISSA-CPT. Heavy dumbbell loading, paused/deficit push-up volume, threshold tempo runs, and 35 lb ruck endurance.",
    coachRule: "Phase 2 Overload Laws: Floor press +5 lbs on 3x8-10. Push-ups: add 5-10 lbs plate or elevate feet (+1 rep/session). Long run 6-8 mi at Zone 2. 35 lb Ruck March pace target sub-14:30/mi.",
    days: [
      {
        day: "Monday",
        focus: "Upper Strength & Push Density",
        warmup: "Arm swings, scapular push-ups, light DB external rotations, band pull-aparts.",
        strength: [
          "Heavy DB Floor Press (3x8-10) [Overload: +5 lbs on 10 reps]",
          "Deficit or Weighted Push-ups (3xAMRAP) [Overload: +1 rep or +5 lbs vest]",
          "Heavy Neutral DB Row (4x8-10) [Overload: +5 lbs on 10 reps]",
          "DB Overhead Triceps Extensions (3x10-12)"
        ],
        run: "3.5 - 4.0 Mile Threshold Tempo Run",
        pace: "RPE 7-8 (Comfortably hard, 15-20s slower than 5K pace)",
        progressionRule: "Floor Press: +5 lbs on 10 reps; Weighted Push-ups: +1 rep or +5 lbs vest"
      },
      {
        day: "Tuesday",
        focus: "Lower Strength & Posterior Chain",
        warmup: "Leg swings, hip airplanes, bodyweight squats, deep ankle dorsiflexion rocks.",
        strength: [
          "Heavy DB Bulgarian Split Squats (3x8-10/leg) [Overload: +5 lbs]",
          "Heavy DB Romanian Deadlift (3x8-10) [Overload: +10 lbs on 10 reps]",
          "Heavy DB Goblet Squats (4x8-10) [Overload: +5-10 lbs]",
          "Weighted Plank Holds (3x60s) [Overload: +10 lbs plate]"
        ],
        run: "Active Recovery Spin or Flush (20-25 mins)",
        pace: "Zone 1 / Recovery",
        progressionRule: "DB RDL: +10 lbs on 10 reps; Weighted Plank: +10 lbs plate"
      },
      {
        day: "Wednesday",
        focus: "Aerobic Threshold / Hill Intervals",
        warmup: "10 mins easy jog, dynamic drills, 3x50m strides.",
        strength: [
          "Russian Twists with Dumbbell (3x20 total)",
          "Hanging Leg Raises (3x12-15)"
        ],
        run: "Hill Repeats or 8x400m Track Intervals",
        pace: "5K Effort (RPE 8.5) with 90s jog recovery",
        progressionRule: "Track Intervals: drop 2s per 400m repeat over mesocycle"
      },
      {
        day: "Thursday",
        focus: "Tactical Full Body Density",
        warmup: "World's greatest stretch, inchworms, bear crawls.",
        strength: [
          "Dumbbell Clean & Push Press (4x6-8) [Overload: +5 lbs on 8 reps]",
          "Heavy Renegade Rows (3x8/side) [Overload: +5 lbs]",
          "DB Walking Lunges (3x10/leg) [Overload: +5 lbs DBs]",
          "Ab Rollouts (3x12-15)"
        ],
        run: "25 Min Zone 2 Aerobic Run",
        pace: "Zone 2 Conversational",
        progressionRule: "Clean & Press: +5 lbs on 8 reps; DB Lunges: +5 lbs bells"
      },
      {
        day: "Friday",
        focus: "Heavy Ruck March (35 lbs)",
        warmup: "Brisk walk 5 mins, hip flexor stretches, calf stretching, trap activation.",
        strength: [
          "Ruck Pack Stepups (3x12/leg with 35 lbs pack)",
          "Farmer's Carries (3x60 yards heavy DBs) [Overload: +5-10 lbs]",
          "Core Suitcase Carries (3x40 yards/side)"
        ],
        run: "5.0 - 6.0 Mile Ruck March (35 lbs Pack)",
        pace: "Sub-15 min/mile target (Maintain 14:00-14:45/mi)",
        progressionRule: "Ruck: hold sub-14:30 pace with 35 lbs pack before increasing to Phase 3"
      },
      {
        day: "Saturday",
        focus: "Long Aerobic Base Run",
        warmup: "Dynamic mobility, leg swings, glute activation.",
        strength: [
          "Push-up Pyramid (25, 20, 15, 10 reps)",
          "Air Squat Flush (3x25 reps)"
        ],
        run: "6.0 - 8.0 Mile Zone 2 Long Run",
        pace: "Strict Zone 2 (~70% max HR, conversational)",
        progressionRule: "Weekly aerobic volume expansion (+0.5 mi/wk)"
      },
      {
        day: "Sunday",
        focus: "Complete Rest & Nutrition Prep",
        warmup: "Light walk and mobility.",
        strength: ["Recovery, sleep, mobility work."],
        run: "Rest.",
        pace: "N/A",
        progressionRule: "Complete CNS and tissue rest"
      }
    ]
  },
  db_phase3: {
    id: 'db_phase3',
    title: "Phase 3: Tactical Peak & Muscular Power",
    weeks: "Weeks 9-12",
    desc: "Engineered by Coach Aryan Risner, ISSA-CPT. Max dumbbell loads, explosive plyometric push-ups, tactical ruck marching (40-45 lbs), and race pace / time-trial peaking.",
    coachRule: "Phase 3 Overload Laws: Max DB loads (3x6 heavy). Plyo push-ups for explosive height. 40-45 lb Ruck March at sub-14:30 pace. Week 12: Peak taper and tactical physical fitness test (Max push-ups, 5-mile ruck, 5k time trial).",
    days: [
      {
        day: "Monday",
        focus: "Upper Max DB Power & Plyo Push-Ups",
        warmup: "Explosive medicine ball drops, band dislocates, plyo clapping push-ups (2x3).",
        strength: [
          "Heavy DB Floor Press (4x6) [Overload: +5 lbs on 6 reps]",
          "Plyometric Clapping Push-ups (4x8) [Overload: Max explosive height]",
          "Heavy Single-Arm DB Row (4x6/arm) [Overload: +5-10 lbs]",
          "Standing DB Arnold Press (3x8) [Overload: +5 lbs]"
        ],
        run: "3.0 Mile Fast Shakeout Run",
        pace: "RPE 4-5 with 4x100m strides at 90% sprint speed",
        progressionRule: "Floor Press: +5 lbs on heavy 6; Plyo Push-ups: max explosive drive"
      },
      {
        day: "Tuesday",
        focus: "Lower Max Power & Posterior Drive",
        warmup: "Hip openers, glute activation, box jumps (3x3), dynamic hamstrings.",
        strength: [
          "Heavy DB Romanian Deadlift (4x6) [Overload: +10 lbs on 6 reps]",
          "Heavy DB Goblet Squats (4x6) [Overload: +10 lbs on 6 reps]",
          "Explosive DB Jump Lunges (3x8/leg)",
          "Hollow Body Holds (3x60s)"
        ],
        run: "20 Min Recovery Flush Run",
        pace: "RPE 2-3 (Easy conversational)",
        progressionRule: "DB RDL: +10 lbs on heavy 6; Goblet Squats: +10 lbs"
      },
      {
        day: "Wednesday",
        focus: "Race Pace Sim / Track Speed",
        warmup: "12 mins easy jog, dynamic stretches, 4x60m accelerations.",
        strength: [
          "Weighted Planks (3x60s) [Overload: +15-25 lbs]",
          "Hanging Toes-to-Bar / Knee Raises (3x15)"
        ],
        run: "Goal Race Pace Intervals",
        pace: "3-4 Miles at Target 5K / 10K Race Pace (RPE 8.5-9)",
        progressionRule: "Dial into target race pacing with minimal split variance"
      },
      {
        day: "Thursday",
        focus: "Tactical Full Body Peak",
        warmup: "Dynamic movement primer, inchworms, bear crawls.",
        strength: [
          "DB Devil Presses or Clean & Press (4x6) [Overload: +5 lbs]",
          "Inverted DB Rows or Heavy Chins (3x8)",
          "Heavy DB Farmer Carries (4x50 yards with max DBs)",
          "Dragon Flags or Ab Wheel (3x10-12)"
        ],
        run: "25 Min Zone 2 Base Run",
        pace: "Zone 2 conversational",
        progressionRule: "Farmer Carries: maximal grip and core stability under max load"
      },
      {
        day: "Friday",
        focus: "Tactical Heavy Ruck (40-45 lbs)",
        warmup: "Calf stretches, dynamic hips, shoulder rotations, unloaded 5 min brisk walk.",
        strength: [
          "Ruck Pack Overhead Press (3x10 with pack)",
          "Farmer's Walks (3x50 yards)",
          "Core Hanging Knee Tucks (3x15)"
        ],
        run: "6.0 - 8.0 Mile Heavy Ruck (40-45 lbs Pack)",
        pace: "Sub-14:30 min/mile target (Reduce volume by 50% in Week 12 for taper)",
        progressionRule: "Tactical Heavy Ruck: maintain sub-14:30/mi pace under 40-45 lbs pack load"
      },
      {
        day: "Saturday",
        focus: "Peak Long Run / Fitness Test",
        warmup: "Dynamic lower-body prep, mental focus visualization.",
        strength: [
          "Push-up Test Preparation (2x15 pristine reps)",
          "Mobility cool-down"
        ],
        run: "8.0 - 10.0 Mile Long Run (Week 12: Fitness Assessment)",
        pace: "Zone 2 (Reduce mileage to 4-5 miles in Week 12 for taper)",
        progressionRule: "Week 12: 5K Time Trial + Max Push-Up Test + 5-Mile Ruck Time Test"
      },
      {
        day: "Sunday",
        focus: "Complete Rest & Restoration",
        warmup: "Gentle recovery walk.",
        strength: ["Full recovery, hydration, celebratory recap."],
        run: "Rest.",
        pace: "N/A",
        progressionRule: "Complete mental and CNS restoration"
      }
    ]
  },
  hybrid_db: {
    id: 'hybrid_db',
    title: "Hybrid Dumbbell & Bodyweight Planner",
    weeks: "DB & Bodyweight • Auto-Overload",
    desc: "Engineered by Coach Aryan Risner, ISSA-CPT. Dedicated dumbbell compound power, chest-to-deck bodyweight volume, and aerobic ruck endurance with automated progressive overload rules.",
    coachRule: "Aryan Risner's Overload Laws: +5 lbs floor press when completing all sets at 12 reps (max reps). +1 rep on push-ups every session. +0.5 miles weekly on Zone 2 runs. +5 lbs pack load when maintaining sub-15 min/mile ruck pace.",
    days: [
      {
        day: "Monday",
        focus: "Upper Body & Run",
        warmup: "Arm circles, band pull-aparts, push-up walkouts, scapular wall slides (5-8 mins).",
        strength: [
          "Dumbbell Floor Press (3x10-12) [Overload: +5 lbs on 12 reps]",
          "Push-ups (3xAMRAP) [Overload: +1 rep per session]",
          "Neutral Grip DB Row (3x10-12) [Overload: +5 lbs on 12 reps]",
          "Overhead Dumbbell Triceps Extension (3x12)"
        ],
        run: "3.0 Mile Zone 2 Run",
        pace: "Conversational (HR ~65-75% max) [+0.5 mi / wk progression]",
        progressionRule: "Floor Press: +5 lbs upon hitting 12 reps; Push-ups: +1 rep/session; Run: +0.5 mi/wk"
      },
      {
        day: "Tuesday",
        focus: "Lower Power & Core",
        warmup: "Dynamic leg swings, bodyweight squats, hip 90/90 openers, and glute bridges.",
        strength: [
          "Dumbbell Bulgarian Split Squats (3x10-12/leg) [Overload: +5 lbs]",
          "Dumbbell Romanian Deadlift (3x10-12) [Overload: +5-10 lbs]",
          "Goblet Squats (3x12) [Overload: +5 lbs]",
          "Plank to Bear Crawl Holds (3x45-60s)"
        ],
        run: "Active Recovery Walk or Light Spin (20 mins)",
        pace: "Zone 1 / HR under 120 bpm",
        progressionRule: "Bulgarian Split Squats: +5 lbs; DB RDL: +5-10 lbs"
      },
      {
        day: "Wednesday",
        focus: "Active Recovery & Mobility",
        warmup: "Full-body yoga flow, hip openers, band dislocates (10-15 mins).",
        strength: [
          "Thoracic Spine Openers & Foam Rolling (15 mins)",
          "Hanging Knee / Leg Raises (3x12-15)",
          "Side Plank Rotations (3x10/side)"
        ],
        run: "20-30 Min Easy Aerobic Flush Run",
        pace: "Zone 1-2 / RPE 3. Conversational.",
        progressionRule: "Active recovery: flush metabolic byproducts, perfect mobility"
      },
      {
        day: "Thursday",
        focus: "Full Body Work Capacity",
        warmup: "Inchworms, jumping jacks, mountain climbers, light dumbbell halos.",
        strength: [
          "Dumbbell Clean & Push Press (4x8) [Overload: +5 lbs on 8 reps]",
          "Renegade Rows with DBs (3x10/side) [Overload: +5 lbs]",
          "Dumbbell Walking Lunges (3x12/leg)",
          "Ab Wheel Rollouts or Weighted Plank (3x60s)"
        ],
        run: "Metcon Intervals (20-25 mins)",
        pace: "6x300m hard efforts (RPE 8) with 90s walk recovery",
        progressionRule: "Clean & Push Press: +5 lbs on 8 reps"
      },
      {
        day: "Friday",
        focus: "Rucking (Heavy Pack)",
        warmup: "Calf stretch, brisk unloaded walk 5 mins, hip flexor stretch, shoulder band pulls.",
        strength: [
          "Ruck Pack Upright March (30 lbs pack)",
          "Farmer Walk Carries with DBs (3x50 yards) [Overload: +5 lbs DBs]",
          "Hanging Knee / Leg Raises (3x12-15)"
        ],
        run: "5.0 Mile Ruck March (30 lbs Pack)",
        pace: "15-20 min/mile [+5 lbs pack load when pace drops under 15 min/mi]",
        progressionRule: "Ruck March: +5 lbs pack load when pace drops below 15 min/mi"
      },
      {
        day: "Saturday",
        focus: "Long Aerobic Endurance",
        warmup: "Dynamic lower-body routine, high knees, butt kicks, leg swings.",
        strength: [
          "Push-up Volume Finisher (2x20)",
          "Bodyweight Walking Lunges (2x20/leg)"
        ],
        run: "5.0 - 7.0 Mile Zone 2 Long Run",
        pace: "Conversational Base (HR 130-145 bpm). Strict Zone 2.",
        progressionRule: "Zone 2 Long Run: +0.5 mi weekly aerobic volume expansion"
      },
      {
        day: "Sunday",
        focus: "Complete Rest & Prep",
        warmup: "Gentle walking and hydration.",
        strength: ["Full recovery, meal prep, and sleep restoration."],
        run: "Rest.",
        pace: "N/A",
        progressionRule: "Hydrate, sleep 8+ hours, plan upcoming training block"
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
    rule: "Aim to progress by adding ~10% volume or 2.5-5 lbs on compound working sets each week. Never sacrifice barbell velocity or depth for arbitrary load increases."
  }
};

export const TEMPLATE_EXERCISES = [
  "Back Squat",
  "Front Squat",
  "Deadlift",
  "Romanian Deadlift (RDL)",
  "Bench Press",
  "Incline Bench",
  "Overhead Press",
  "Pull-Ups (Weighted)",
  "Hip Thrusts",
  "Bulgarian Split Squats",
  "Chest-Supported Row",
  "Push Press",
  "Bent Over Row",
  "Arnold Press",
  "Trap Bar Deadlift",
  "Other"
];

export const getDefaultRestPeriod = (exerciseStr: string): number => {
  const lower = exerciseStr.toLowerCase();
  if (lower.includes('heavy') || lower.includes('3x3') || lower.includes('5x5') || lower.includes('deadlift') || lower.includes('speed deadlift')) {
    return 180; // 3 minutes for heavy CNS compounds
  }
  if (lower.includes('squat') || lower.includes('bench') || lower.includes('press') || lower.includes('row')) {
    return 120; // 2 minutes for standard compound work
  }
  if (lower.includes('rdl') || lower.includes('pull-up') || lower.includes('split squat') || lower.includes('thrust') || lower.includes('lunge')) {
    return 90; // 90 seconds for hypertrophy & unilateral accessories
  }
  if (lower.includes('plank') || lower.includes('twist') || lower.includes('raise') || lower.includes('rollout') || lower.includes('woodchopper') || lower.includes('mobility') || lower.includes('pre-hab')) {
    return 60; // 60 seconds for core and active mobility
  }
  return 90;
};
