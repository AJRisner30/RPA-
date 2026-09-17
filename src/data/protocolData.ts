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
        pace: "3-4 Miles at Tempo Pace (RPE 6-7 with 0.5 mi warm-up/cool-down).",
        progressionRule: "Deadlift: +10 lbs on 5 reps; Push Press: +5 lbs on 6 reps"
      },
      {
        day: "Thursday",
        focus: "Active Recovery",
        warmup: "Cat-cow transitions, 90/90 hip stretches, and deep diaphragmatic breathing.",
        strength: ["Stretching, foam rolling, or light yoga."],
        run: "Optional Light Spin (20-30 mins)",
        pace: "Keep heart rate under 110 bpm.",
        progressionRule: "Active recovery & mobility. Heart rate < 110 bpm."
      },
      {
        day: "Friday",
        focus: "Long Endurance",
        warmup: "5 mins brisk walk, calf stretching, and hip flexor activation.",
        strength: ["Pre-hab exercises (glute bridges, clamshells)."],
        run: "Long Run (6-10 Miles)",
        pace: "6-10 Miles in Zone 2 / RPE 3-4. Time on feet is the goal.",
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
        pace: "4-6 Miles total (1 mi warmup + 3-4 Miles at Threshold Pace RPE 7-8 + 1 mi cooldown).",
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
        run: "Race Pace Simulation (2-3 Miles)",
        pace: "2-3 Miles at Goal Race Pace (RPE 8.5-9).",
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
  // 180s (3 Min) for Trap Bar Deadlift & heavy power compounds
  if (lower.includes('trap bar') || lower.includes('deadlift') || lower.includes('speed deadlift')) {
    return 180;
  }
  // 120s (2 Min) for Barbell Back Squat, Strict OHP, Push Press, Weighted Pull-Ups, and Track Sprints
  if (
    lower.includes('squat') ||
    lower.includes('overhead press') ||
    lower.includes('ohp') ||
    lower.includes('push press') ||
    lower.includes('pull-up') ||
    lower.includes('pullup') ||
    lower.includes('bench') ||
    lower.includes('800m') ||
    lower.includes('sprint')
  ) {
    return 120;
  }
  // 90s for Romanian Deadlift, Bulgarian Split Squat, DB Incline Bench, Chest-Supported Row, Farmer's Carry, Walking Lunges
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
  // 60s for Pallof Press and Kettlebell Swings
  if (lower.includes('pallof') || lower.includes('swing') || lower.includes('twist') || lower.includes('raise')) {
    return 60;
  }
  // 45s for Plank Series
  if (lower.includes('plank')) {
    return 45;
  }
  return 90;
};

export interface ParsedExercise {
  name: string;
  defaultSets: number;
  targetReps: string;
  restSeconds: number;
  notes: string;
  overloadHint?: string;
}

export function parseExerciseString(exerciseStr: string): ParsedExercise {
  let overloadHint = '';
  const bracketMatch = exerciseStr.match(/\[(.*?)\]/);
  if (bracketMatch) {
    overloadHint = bracketMatch[1].trim();
  }
  const cleanStr = exerciseStr.replace(/\[.*?\]/g, '').trim().replace(/\.$/, '');

  let name = cleanStr;
  let defaultSets = 3;
  let targetReps = '8-10';
  const notes = overloadHint;

  const parenMatch = cleanStr.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    name = parenMatch[1].trim().replace(/\.$/, '');
    const spec = parenMatch[2].trim();

    if (spec.toLowerCase().includes('5x5')) {
      defaultSets = 5;
      targetReps = '5';
    } else if (spec.toLowerCase().includes('3x3')) {
      defaultSets = 3;
      targetReps = '3';
    } else {
      const parts = spec.split(/x/i);
      if (parts.length === 2) {
        const s = parseInt(parts[0].trim(), 10);
        if (!isNaN(s)) defaultSets = s;
        targetReps = parts[1].trim();
      } else {
        targetReps = spec;
      }
    }
  }

  let restSeconds = getDefaultRestPeriod(name);
  if (bracketMatch) {
    const restMatch = bracketMatch[1].match(/rest:\s*(\d+)s?/i);
    if (restMatch) {
      const parsedRest = parseInt(restMatch[1], 10);
      if (!isNaN(parsedRest) && parsedRest > 0) {
        restSeconds = parsedRest;
      }
    }
  }

  return {
    name,
    defaultSets,
    targetReps,
    restSeconds,
    notes,
    overloadHint
  };
}

// ---------------------------------------------------------------------------
// THE APEX PROTOCOL: 26-Week Master Tactical Fitness & Conditioning
// ---------------------------------------------------------------------------
export const APEX_PROTOCOL_PHASES: Record<string, ProtocolPhase> = {
  apex_phase1: {
    id: 'apex_phase1',
    title: 'Phase 1: Foundation & Base',
    weeks: 'Weeks 1-4',
    desc: 'Hypertrophy, structural prep, and foundational Zone 2 aerobic base. Linear overload +2.5 to 5 lbs on compounds.',
    coachRule: "Coach Aryan's Overload Laws: Add 2.5 to 5 lbs to your main compound lifts each week, provided form remains pristine. Strict Overhead Press: Add 2.5lbs from last week. Strict Zone 2 aerobic base on Day 2 & Day 6.",
    days: [
      {
        day: 'Sunday (Day 1)',
        focus: 'Lower Body Prime (Structural Leg Strength)',
        warmup: 'Execute SOP Warmup Sequence (Elevate, Mobilize, Activate). Lubricate joints and prime CNS.',
        strength: [
          'Barbell Back Squat (4x8-10) [Overload: +2.5 to 5 lbs on 10 reps - Rest: 120s]',
          'Romanian Deadlift (3x10) [Overload: +5 to 10 lbs on 10 reps - Rest: 90s]',
          'Bulgarian Split Squat (3x8/leg) [Overload: +5 lbs KB - Rest: 90s]',
          'Pallof Press (3x12/side) [Core stability & anti-rotation - Rest: 60s]'
        ],
        run: 'Rest / Pre-hab Recovery',
        pace: 'N/A',
        progressionRule: 'Back Squat: +2.5 to 5 lbs upon hitting 10 reps; RDL: +5 to 10 lbs'
      },
      {
        day: 'Monday (Day 2)',
        focus: 'Energy Systems (Aerobic Capacity)',
        warmup: '5 mins dynamic leg swings, ankle mobility drills, and high knees.',
        strength: [
          'Plank Series (3x60s) [Front and side planks - Rest: 45s]'
        ],
        run: 'Tactical Aerobic Base (35-50 Min)',
        pace: 'Zone 2 (135-150 BPM). Review heart rate data post-run. Conversational output.',
        progressionRule: '+5 Min duration per week (W1: 35m, W2: 40m, W3: 45m, W4: 50m)'
      },
      {
        day: 'Tuesday (Day 3)',
        focus: 'Upper Body Push/Pull (Torso & Grip Integrity)',
        warmup: 'Band pull-aparts, shoulder dislocates, scapular retractions, and push-up walkouts.',
        strength: [
          'Strict Overhead Press (4x8-10) [Overload: +2.5 lbs from last week - Rest: 120s]',
          'Weighted Pull-Ups (4x6-8) [Overload: +2.5 to 5 lbs on 8 reps - Rest: 120s]',
          'DB Incline Bench (3x10) [Overload: +5 lbs on 10 reps - Rest: 90s]',
          'Chest-Supported Row (3x10) [Overload: +5 lbs on 10 reps - Rest: 90s]',
          "Heavy Farmer's Carry (4x40m) [Overload: +5 lbs DBs/KBs - Rest: 90s]"
        ],
        run: 'Rest from running',
        pace: 'N/A',
        progressionRule: 'Strict OHP: +2.5 lbs weekly; Weighted Pull-Ups: +2.5 to 5 lbs; Farmer Carries: +5 lbs'
      },
      {
        day: 'Wednesday (Day 4)',
        focus: 'Active Recovery (CNS Down-regulation)',
        warmup: 'Gentle foam rolling, thoracic spine rotations, and diaphragmatic breathing.',
        strength: [
          'Recovery / Active Mobility (1x30 Min) [Light walk, yoga, or mobility flow]'
        ],
        run: 'Active Recovery Walk / Stretch (30 Min)',
        pace: 'Zone 1 / HR < 110 BPM. Pure parasympathetic recovery.',
        progressionRule: 'Hydration, tissue quality, and joint decompression.'
      },
      {
        day: 'Thursday (Day 5)',
        focus: 'Full Body Power (Combat Chassis Development)',
        warmup: 'Execute SOP Warmup Sequence (Goblet squats with pause, broad jumps max intent).',
        strength: [
          'Trap Bar Deadlift (4x8-10) [Overload: +2.5 to 5 lbs on 10 reps - Rest: 180s]',
          'Push Press (4x6) [Overload: +5 lbs on 6 reps - Rest: 120s]',
          'Walking Lunges (3x20 steps) [Overload: +5 lbs DBs - Rest: 90s]',
          'KB Swings (4x15) [Overload: +5 lbs KB - Rest: 60s]'
        ],
        run: 'Rest / CNS recovery',
        pace: 'N/A',
        progressionRule: 'Trap Bar Deadlift: +2.5 to 5 lbs upon hitting 10 reps; Push Press: +5 lbs'
      },
      {
        day: 'Friday (Day 6)',
        focus: 'Tactical Endurance (Zone 2 Output)',
        warmup: 'Dynamic lunges, calf pumps, ankle rotations, and 3 light strides.',
        strength: [
          'Pre-run dynamic mobility & hydration.'
        ],
        run: 'Long Slow Distance Run (47-53 Min)',
        pace: 'Keep HR strictly under 145 BPM (Zone 2). Aerobic base building.',
        progressionRule: 'Progress by +2 mins weekly: W1: 47m, W2: 49m, W3: 51m, W4: 53m'
      },
      {
        day: 'Saturday (Day 7)',
        focus: 'Complete Rest & Nutrition Replenishment',
        warmup: 'None',
        strength: [
          'Complete Rest & Nutrition Replenishment'
        ],
        run: 'Complete Rest',
        pace: 'N/A',
        progressionRule: 'Carb replenishment, electrolytes, and 8+ hours quality sleep.'
      }
    ]
  },
  apex_phase2: {
    id: 'apex_phase2',
    title: 'Phase 2: Strength & Threshold',
    weeks: 'Weeks 5-10',
    desc: 'Neurological strength development, heavier loads (5-8 reps), and anaerobic lactate threshold intervals.',
    coachRule: "Compound lifts transition to 5-8 reps. Increase load progressively. Day 2 introduces Zone 3 Tempo (40 Min). Day 6 LSD run climbs from 55 to 65 minutes (+2 min weekly).",
    days: [
      {
        day: 'Sunday (Day 1)',
        focus: 'Lower Body Strength & Neural Drive',
        warmup: 'Execute SOP Warmup Sequence (Elevate, Mobilize, Activate).',
        strength: [
          'Barbell Back Squat (4x5-8) [Overload: +2.5 to 5 lbs on 8 reps - Rest: 120s]',
          'Romanian Deadlift (3x10) [Overload: +5 to 10 lbs on 10 reps - Rest: 90s]',
          'Bulgarian Split Squat (3x8/leg) [Overload: +5 lbs KB - Rest: 90s]',
          'Pallof Press (3x12/side) [Core anti-rotation - Rest: 60s]'
        ],
        run: 'Rest / Pre-hab',
        pace: 'N/A',
        progressionRule: 'Back Squat: +2.5 to 5 lbs upon hitting 8 reps'
      },
      {
        day: 'Monday (Day 2)',
        focus: 'Lactate Threshold & Tempo',
        warmup: '5 mins light jog, dynamic leg swings, and ankle circles.',
        strength: [
          'Plank Series (3x60s) [Front and side planks - Rest: 45s]'
        ],
        run: 'Tactical Aerobic Base (40 Min Zone 3 / Tempo)',
        pace: 'Zone 3 (Lactate Threshold Pace - comfortably hard).',
        progressionRule: 'Maintain target tempo pace across full 40 minutes.'
      },
      {
        day: 'Tuesday (Day 3)',
        focus: 'Upper Body Heavy Push/Pull',
        warmup: 'Band pull-aparts, shoulder dislocations, scapular shrugs, push-up walkouts.',
        strength: [
          'Strict Overhead Press (4x5-8) [Overload: +2.5 lbs from last week - Rest: 120s]',
          'Weighted Pull-Ups (4x6-8) [Overload: +2.5 to 5 lbs on 8 reps - Rest: 120s]',
          'DB Incline Bench (3x10) [Overload: +5 lbs on 10 reps - Rest: 90s]',
          'Chest-Supported Row (3x10) [Overload: +5 lbs on 10 reps - Rest: 90s]',
          "Heavy Farmer's Carry (4x40m) [Overload: +5 lbs DBs/KBs - Rest: 90s]"
        ],
        run: 'Rest from running',
        pace: 'N/A',
        progressionRule: 'Strict OHP: +2.5 lbs weekly; Weighted Pull-Ups: +2.5 to 5 lbs'
      },
      {
        day: 'Wednesday (Day 4)',
        focus: 'Active Recovery & Tissue Care',
        warmup: 'Full body mobility flow and foam rolling.',
        strength: [
          'Recovery / Active Mobility (1x30 Min) [Light walk, yoga, or stretching]'
        ],
        run: 'Active Recovery Walk / Stretch (30 Min)',
        pace: 'Zone 1 / HR < 110 BPM',
        progressionRule: 'Hydration and active flushing.'
      },
      {
        day: 'Thursday (Day 5)',
        focus: 'Full Body Power & Posterior Chain',
        warmup: 'Execute SOP Warmup Sequence (Goblet squats, broad jumps).',
        strength: [
          'Trap Bar Deadlift (4x5-8) [Overload: +2.5 to 5 lbs on 8 reps - Rest: 180s]',
          'Push Press (4x6) [Overload: +5 lbs on 6 reps - Rest: 120s]',
          'Walking Lunges (3x20 steps) [Overload: +5 lbs DBs - Rest: 90s]',
          'KB Swings (4x15) [Overload: +5 lbs KB - Rest: 60s]'
        ],
        run: 'Rest / CNS recovery',
        pace: 'N/A',
        progressionRule: 'Trap Bar Deadlift: +2.5 to 5 lbs on 8 reps; Push Press: +5 lbs'
      },
      {
        day: 'Friday (Day 6)',
        focus: 'Tactical Endurance (LSD Run)',
        warmup: 'Dynamic lunges, calf stretch, and strides.',
        strength: [
          'Pre-run mobility and hydration.'
        ],
        run: 'Long Slow Distance Run (55-65 Min)',
        pace: 'Keep HR strictly under 145 BPM (Zone 2).',
        progressionRule: 'Progress by +2 mins weekly: W5: 55m, W6: 57m, W7: 59m, W8: 61m, W9: 63m, W10: 65m'
      },
      {
        day: 'Saturday (Day 7)',
        focus: 'Complete Rest & Nutrition Replenishment',
        warmup: 'None',
        strength: [
          'Complete Rest & Nutrition Replenishment'
        ],
        run: 'Complete Rest',
        pace: 'N/A',
        progressionRule: 'Carb replenishment, hydration, and sleep.'
      }
    ]
  },
  apex_phase3: {
    id: 'apex_phase3',
    title: 'Phase 3: Tactical Power',
    weeks: 'Weeks 11-16',
    desc: 'Maximal force development (3-5 reps), VO2 Max track intervals, and plyometric acceleration.',
    coachRule: "Compound lifts shift to heavy 3-5 reps for explosive power. Day 2 features 8 x 400m track repeats (VO2 Max). Day 6 LSD run advances from 67 to 77 minutes (+2 min weekly).",
    days: [
      {
        day: 'Sunday (Day 1)',
        focus: 'Lower Body Maximal Force & Power',
        warmup: 'Execute SOP Warmup Sequence (Elevate, Mobilize, Activate).',
        strength: [
          'Barbell Back Squat (4x3-5) [Overload: +2.5 to 5 lbs on 5 reps - Rest: 120s]',
          'Romanian Deadlift (3x10) [Overload: +5 to 10 lbs - Rest: 90s]',
          'Bulgarian Split Squat (3x8/leg) [Overload: +5 lbs KB - Rest: 90s]',
          'Pallof Press (3x12/side) [Core stability - Rest: 60s]'
        ],
        run: 'Rest / Pre-hab',
        pace: 'N/A',
        progressionRule: 'Back Squat: +2.5 to 5 lbs upon hitting 5 reps'
      },
      {
        day: 'Monday (Day 2)',
        focus: 'VO2 Max Intervals (Track)',
        warmup: '10 mins jog, high knees, butt kicks, A-skips, and 3 build-up strides.',
        strength: [
          'Plank Series (3x60s) [Front and side planks - Rest: 45s]'
        ],
        run: 'Tactical Aerobic Base (8 x 400m Repeats)',
        pace: 'VO2 Max Pace (RPE 8.5-9). 90 seconds active jog recovery between repeats.',
        progressionRule: 'Target consistent or dropping 400m split times each week.'
      },
      {
        day: 'Tuesday (Day 3)',
        focus: 'Upper Body Maximal Strength',
        warmup: 'Band pull-aparts, shoulder circles, scapular retractions, push-ups.',
        strength: [
          'Strict Overhead Press (4x3-5) [Overload: +2.5 lbs from last week - Rest: 120s]',
          'Weighted Pull-Ups (4x6-8) [Overload: +2.5 to 5 lbs - Rest: 120s]',
          'DB Incline Bench (3x10) [Overload: +5 lbs - Rest: 90s]',
          'Chest-Supported Row (3x10) [Overload: +5 lbs - Rest: 90s]',
          "Heavy Farmer's Carry (4x40m) [Overload: +5 lbs DBs/KBs - Rest: 90s]"
        ],
        run: 'Rest from running',
        pace: 'N/A',
        progressionRule: 'Strict OHP: +2.5 lbs weekly; Weighted Pull-Ups: +2.5 to 5 lbs'
      },
      {
        day: 'Wednesday (Day 4)',
        focus: 'Active Recovery & Joint Decompression',
        warmup: 'Gentle mobility flow and hip openers.',
        strength: [
          'Recovery / Active Mobility (1x30 Min) [Light walk, yoga, or stretching]'
        ],
        run: 'Active Recovery Walk / Stretch (30 Min)',
        pace: 'Zone 1 / HR < 110 BPM',
        progressionRule: 'Soft tissue care and parasympathetic reset.'
      },
      {
        day: 'Thursday (Day 5)',
        focus: 'Full Body Explosive Power',
        warmup: 'Execute SOP Warmup Sequence (Goblet squats, broad jumps).',
        strength: [
          'Trap Bar Deadlift (4x3-5) [Overload: +2.5 to 5 lbs on 5 reps - Rest: 180s]',
          'Push Press (4x6) [Overload: +5 lbs on 6 reps - Rest: 120s]',
          'Walking Lunges (3x20 steps) [Overload: +5 lbs DBs - Rest: 90s]',
          'KB Swings (4x15) [Overload: +5 lbs KB - Rest: 60s]'
        ],
        run: 'Rest / CNS recovery',
        pace: 'N/A',
        progressionRule: 'Trap Bar Deadlift: +2.5 to 5 lbs on 5 reps; Push Press: +5 lbs'
      },
      {
        day: 'Friday (Day 6)',
        focus: 'Tactical Endurance (LSD Run)',
        warmup: 'Dynamic lunges, calf pumps, and strides.',
        strength: [
          'Pre-run mobility and hydration.'
        ],
        run: 'Long Slow Distance Run (67-77 Min)',
        pace: 'Keep HR strictly under 145 BPM (Zone 2).',
        progressionRule: 'Progress by +2 mins weekly: W11: 67m, W12: 69m, W13: 71m, W14: 73m, W15: 75m, W16: 77m'
      },
      {
        day: 'Saturday (Day 7)',
        focus: 'Complete Rest & Nutrition Replenishment',
        warmup: 'None',
        strength: [
          'Complete Rest & Nutrition Replenishment'
        ],
        run: 'Complete Rest',
        pace: 'N/A',
        progressionRule: 'Carbohydrate fueling, electrolyte balance, 8+ hrs sleep.'
      }
    ]
  },
  apex_phase4: {
    id: 'apex_phase4',
    title: 'Phase 4: Combat Chassis & Endurance',
    weeks: 'Weeks 17-22',
    desc: 'Heavy carries, work capacity, 5x5 compound strength, and 35lb load carriage rucking.',
    coachRule: "5x5 Strength protocol for primary compound lifts. Load carriage initiates: 35lb Dry Weight Ruck on Day 2 (45-70 min) and Day 6 Ruck March (3-8 Miles). Maintain strictly under 15:00/mi pace.",
    days: [
      {
        day: 'Sunday (Day 1)',
        focus: 'Combat Chassis Leg Strength (5x5)',
        warmup: 'Execute SOP Warmup Sequence (Elevate, Mobilize, Activate).',
        strength: [
          'Barbell Back Squat (4x5) [Overload: 5x5 Strength / +2.5 to 5 lbs - Rest: 120s]',
          'Romanian Deadlift (3x10) [Overload: +5 to 10 lbs - Rest: 90s]',
          'Bulgarian Split Squat (3x8/leg) [Overload: +5 lbs KB - Rest: 90s]',
          'Pallof Press (3x12/side) [Core anti-rotation - Rest: 60s]'
        ],
        run: 'Rest / Pre-hab',
        pace: 'N/A',
        progressionRule: 'Back Squat: +2.5 to 5 lbs on solid 5 reps'
      },
      {
        day: 'Monday (Day 2)',
        focus: 'Load Carriage Conditioning (Ruck)',
        warmup: 'Dynamic leg swings, shoulder rolls, and foot prep.',
        strength: [
          'Plank Series (3x60s) [Front and side planks - Rest: 45s]'
        ],
        run: 'Tactical Aerobic Base (45-70 Min Ruck)',
        pace: '35lb Dry Weight Ruck. Maintain brisk tactical cadence. W17: 45m, W18: 50m, W19: 55m, W20: 60m, W21: 65m, W22: 70m.',
        progressionRule: 'Add +5 mins duration weekly while keeping pace brisk.'
      },
      {
        day: 'Tuesday (Day 3)',
        focus: 'Upper Body Combat Armor (5x5)',
        warmup: 'Band pull-aparts, shoulder dislocates, scapular retractions, push-ups.',
        strength: [
          'Strict Overhead Press (4x5) [Overload: 5x5 Strength / +2.5 lbs - Rest: 120s]',
          'Weighted Pull-Ups (4x6-8) [Overload: +2.5 to 5 lbs - Rest: 120s]',
          'DB Incline Bench (3x10) [Overload: +5 lbs - Rest: 90s]',
          'Chest-Supported Row (3x10) [Overload: +5 lbs - Rest: 90s]',
          "Heavy Farmer's Carry (4x40m) [Overload: +5 lbs DBs/KBs - Rest: 90s]"
        ],
        run: 'Rest from running',
        pace: 'N/A',
        progressionRule: 'Strict OHP: +2.5 lbs weekly; Farmer Carries: +5 lbs'
      },
      {
        day: 'Wednesday (Day 4)',
        focus: 'Active Recovery & Spinal Decompression',
        warmup: 'Spine decompression, dead hangs, and hip mobility.',
        strength: [
          'Recovery / Active Mobility (1x30 Min) [Light walk, yoga, or stretching]'
        ],
        run: 'Active Recovery Walk / Stretch (30 Min)',
        pace: 'Zone 1 / HR < 110 BPM',
        progressionRule: 'Decompress spine, foam roll lats, and hydrate.'
      },
      {
        day: 'Thursday (Day 5)',
        focus: 'Posterior Chain Power (5x5)',
        warmup: 'Execute SOP Warmup Sequence (Goblet squats, broad jumps).',
        strength: [
          'Trap Bar Deadlift (4x5) [Overload: 5x5 Strength / +2.5 to 5 lbs - Rest: 180s]',
          'Push Press (4x6) [Overload: +5 lbs on 6 reps - Rest: 120s]',
          'Walking Lunges (3x20 steps) [Overload: +5 lbs DBs - Rest: 90s]',
          'KB Swings (4x15) [Overload: +5 lbs KB - Rest: 60s]'
        ],
        run: 'Rest / CNS recovery',
        pace: 'N/A',
        progressionRule: 'Trap Bar Deadlift: +2.5 to 5 lbs on 5 reps; Push Press: +5 lbs'
      },
      {
        day: 'Friday (Day 6)',
        focus: 'Tactical Load Carriage (Ruck March)',
        warmup: 'Footwear inspection, wool socks, ankle mobilization.',
        strength: [
          'Footwear prep, hydration, and lower back decompression.'
        ],
        run: 'Ruck March (3-8 Miles)',
        pace: '35lb Dry Weight Ruck. Maintain strictly under 15:00/mi pace. W17: 3mi, W18: 4mi, W19: 5mi, W20: 6mi, W21: 7mi, W22: 8mi.',
        progressionRule: '+1.0 Mile distance weekly. Add +5 lbs pack weight when pace drops under 14:00/mi.'
      },
      {
        day: 'Saturday (Day 7)',
        focus: 'Complete Rest & Nutrition Replenishment',
        warmup: 'None',
        strength: [
          'Complete Rest & Nutrition Replenishment'
        ],
        run: 'Complete Rest',
        pace: 'N/A',
        progressionRule: 'Carb replenishment, sodium, magnesium, and deep rest.'
      }
    ]
  },
  apex_phase5: {
    id: 'apex_phase5',
    title: "Phase 5: Peaking (Tactical Peak & Taper)",
    weeks: 'Weeks 23-26',
    desc: "Tapering volume, 3x3 peaking triples, 2-mile race pace target intervals, and 6x800m track sprints.",
    coachRule: "Peak CNS output with 3x3 triples. Day 2 targets 2-Mile Race Pace. Day 6 features 6 x 800m track sprints with 2-minute rest intervals at maximum sustainable race pace. Execute and conquer.",
    days: [
      {
        day: 'Sunday (Day 1)',
        focus: 'Lower Body Peaking Triples (3x3)',
        warmup: 'Execute SOP Warmup Sequence (Elevate, Mobilize, Activate).',
        strength: [
          'Barbell Back Squat (4x3) [Overload: 3x3 Peaking Triples / Max CNS Intent - Rest: 120s]',
          'Romanian Deadlift (3x10) [Overload: +5 to 10 lbs - Rest: 90s]',
          'Bulgarian Split Squat (3x8/leg) [Overload: +5 lbs KB - Rest: 90s]',
          'Pallof Press (3x12/side) [Core stability - Rest: 60s]'
        ],
        run: 'Rest / Pre-hab',
        pace: 'N/A',
        progressionRule: 'Back Squat: Max barbell velocity on 3 reps'
      },
      {
        day: 'Monday (Day 2)',
        focus: "2-Mile Race Pace Calibration",
        warmup: '10 mins jog, dynamic mobility, and 3 race-pace strides.',
        strength: [
          'Plank Series (3x60s) [Front and side planks - Rest: 45s]'
        ],
        run: 'Tactical Aerobic Base (2-Mile Race Pace Target)',
        pace: "Threshold Intervals at 2-Mile goal race pace.",
        progressionRule: "Dial in exact goal pace per mile. Review heart rate and splits."
      },
      {
        day: 'Tuesday (Day 3)',
        focus: 'Upper Body Peaking Triples (3x3)',
        warmup: 'Band pull-aparts, shoulder dislocates, scapular retractions, push-ups.',
        strength: [
          'Strict Overhead Press (4x3) [Overload: 3x3 Peaking Triples / +2.5 lbs - Rest: 120s]',
          'Weighted Pull-Ups (4x6-8) [Overload: +2.5 to 5 lbs - Rest: 120s]',
          'DB Incline Bench (3x10) [Overload: +5 lbs - Rest: 90s]',
          'Chest-Supported Row (3x10) [Overload: +5 lbs - Rest: 90s]',
          "Heavy Farmer's Carry (4x40m) [Overload: +5 lbs DBs/KBs - Rest: 90s]"
        ],
        run: 'Rest from running',
        pace: 'N/A',
        progressionRule: 'Strict OHP: +2.5 lbs weekly; Max explosive pressing speed'
      },
      {
        day: 'Wednesday (Day 4)',
        focus: 'Active Recovery & Championship Taper',
        warmup: 'Light foam rolling and mobility work.',
        strength: [
          'Recovery / Active Mobility (1x30 Min) [Light walk, yoga, or stretching]'
        ],
        run: 'Active Recovery Walk / Stretch (30 Min)',
        pace: 'Zone 1 / HR < 110 BPM',
        progressionRule: 'CNS preservation and neural recovery.'
      },
      {
        day: 'Thursday (Day 5)',
        focus: 'Full Body Power Peaking Triples (3x3)',
        warmup: 'Execute SOP Warmup Sequence (Goblet squats, broad jumps).',
        strength: [
          'Trap Bar Deadlift (4x3) [Overload: 3x3 Peaking Triples / Max Force Production - Rest: 180s]',
          'Push Press (4x6) [Overload: +5 lbs on 6 reps - Rest: 120s]',
          'Walking Lunges (3x20 steps) [Overload: +5 lbs DBs - Rest: 90s]',
          'KB Swings (4x15) [Overload: +5 lbs KB - Rest: 60s]'
        ],
        run: 'Rest / CNS recovery',
        pace: 'N/A',
        progressionRule: 'Trap Bar Deadlift: Max power production on 3 reps'
      },
      {
        day: 'Friday (Day 6)',
        focus: "Track Sprints (Speed & Tactical Peak)",
        warmup: '15 mins dynamic warmup, A-skips, B-skips, dynamic lunges, 3 progressive strides.',
        strength: [
          'Pre-sprint neuromuscular priming.'
        ],
        run: 'Track Sprints (6 x 800m)',
        pace: "Rest: 2 Min between repeats. Run at goal race pace (100% Intent).",
        progressionRule: "Lock in target 800m split times with pristine running mechanics."
      },
      {
        day: 'Saturday (Day 7)',
        focus: "Peak Restoration & Assessment Readiness",
        warmup: 'None',
        strength: [
          'Complete Rest & Nutrition Replenishment'
        ],
        run: 'Complete Rest',
        pace: 'N/A',
        progressionRule: "Pre-race meal, optimal hydration, mental visualization, and peak readiness."
      }
    ]
  }
};

/**
 * Returns customized week data for any week 1 through 26 of The Apex Protocol.
 * Dynamically injects the exact weekly Day 2 and Day 6 run/ruck prescriptions.
 */
export function getApexWeekData(weekNumber: number): ProtocolPhase {
  const week = Math.max(1, Math.min(26, weekNumber));

  let basePhaseId = 'apex_phase1';
  if (week >= 1 && week <= 4) basePhaseId = 'apex_phase1';
  else if (week >= 5 && week <= 10) basePhaseId = 'apex_phase2';
  else if (week >= 11 && week <= 16) basePhaseId = 'apex_phase3';
  else if (week >= 17 && week <= 22) basePhaseId = 'apex_phase4';
  else basePhaseId = 'apex_phase5';

  const basePhase = APEX_PROTOCOL_PHASES[basePhaseId];
  const clonedDays = JSON.parse(JSON.stringify(basePhase.days)) as ProtocolDay[];

  // Week-specific conditioning values:
  if (week >= 1 && week <= 4) {
    // Phase 1: Day 2 is +5 min weekly (35, 40, 45, 50); Day 6 is +2 min weekly (47, 49, 51, 53)
    const day2Minutes = 35 + (week - 1) * 5;
    const day6Minutes = 47 + (week - 1) * 2;
    clonedDays[1].run = `Tactical Aerobic Base (${day2Minutes} Min)`;
    clonedDays[1].pace = `Zone 2 (135-150 BPM). Review heart rate data post-run. Week ${week} volume target.`;
    clonedDays[5].run = `Long Slow Distance Run (${day6Minutes} Min)`;
    clonedDays[5].pace = `Keep HR under 145 BPM (Zone 2). Week ${week} progressive aerobic volume.`;
  } else if (week >= 5 && week <= 10) {
    // Phase 2: Day 2 is 40 Min Zone 3 / Tempo; Day 6 LSD is +2 min weekly (55, 57, 59, 61, 63, 65)
    const day6Minutes = 55 + (week - 5) * 2;
    clonedDays[1].run = `Tactical Aerobic Base (40 Min Zone 3 / Tempo)`;
    clonedDays[5].run = `Long Slow Distance Run (${day6Minutes} Min)`;
    clonedDays[5].pace = `Keep HR under 145 BPM (Zone 2). Week ${week} progressive aerobic volume.`;
  } else if (week >= 11 && week <= 16) {
    // Phase 3: Day 2 is 8 x 400m Repeats; Day 6 LSD is +2 min weekly (67, 69, 71, 73, 75, 77)
    const day6Minutes = 67 + (week - 11) * 2;
    clonedDays[1].run = `Tactical Aerobic Base (8 x 400m Repeats - VO2 Max)`;
    clonedDays[5].run = `Long Slow Distance Run (${day6Minutes} Min)`;
    clonedDays[5].pace = `Keep HR under 145 BPM (Zone 2). Week ${week} progressive aerobic volume.`;
  } else if (week >= 17 && week <= 22) {
    // Phase 4: Day 2 is 35lb Ruck (+5 min weekly: 45, 50, 55, 60, 65, 70); Day 6 is Ruck March (+1 mi weekly: 3, 4, 5, 6, 7, 8 miles)
    const ruckMinutes = 45 + (week - 17) * 5;
    const ruckMiles = 3 + (week - 17);
    clonedDays[1].run = `Tactical Aerobic Base (${ruckMinutes} Min Ruck - 35lb Dry Weight)`;
    clonedDays[1].pace = `Maintain brisk cadence with 35lb pack. Week ${week} load carriage conditioning.`;
    clonedDays[5].run = `Ruck March (${ruckMiles} Miles - 35lb Dry Weight)`;
    clonedDays[5].pace = `Maintain strictly under 15:00/mi pace. Week ${week} tactical endurance volume.`;
  } else {
    // Phase 5: Weeks 23-26: Day 2 is 2-Mile Race Pace Target; Day 6 is 6 x 800m Track Sprints
    clonedDays[1].run = `Tactical Aerobic Base (2-Mile Race Pace Target)`;
    clonedDays[1].pace = `Threshold intervals at goal race pace. Week ${week} speed calibration.`;
    clonedDays[5].run = `Track Sprints (6 x 800m)`;
    clonedDays[5].pace = `Rest: 2 Min between repeats. Target goal race pace. Week ${week} peaking sprint.`;
  }

  return {
    ...basePhase,
    id: `apex_week_${week}`,
    title: `${basePhase.title} — Week ${week}`,
    weeks: `Week ${week} of 26`,
    days: clonedDays
  };
}

// Merge Apex Protocol into PROTOCOL_DATA
Object.assign(PROTOCOL_DATA, APEX_PROTOCOL_PHASES);
