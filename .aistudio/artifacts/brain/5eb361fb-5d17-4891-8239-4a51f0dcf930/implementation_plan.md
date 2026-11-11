# Smart Workout Split Architecture & Recovery Rules

## Overview
Upgraded the AI workout generator and calibrated tactical engine to enforce strict physiological recovery rules, ensuring 48–72 hours between lower body sessions and eliminating illogical splits such as Day 2 Legs followed by Day 3 Rest and Day 4 Legs.

## Key Changes
1. **System Prompt Enforcement (`server.ts`)**:
   - Added `splitArchitectureDirective` to the Gemini generation prompt.
   - Forbids consecutive or near-consecutive leg days (e.g. Day 2 Legs -> Day 3 Rest -> Day 4 Legs is strictly prohibited).
   - Establishes mandatory split templates for:
     - **3-Day Split**: Full Body A -> Rest -> Full Body B -> Rest -> Full Body C -> Rest -> Rest
     - **4-Day Split**: Upper A -> Lower A (Squats/Quads) -> Rest -> Upper B (Incline/Pull/Arms) -> Lower B (Deadlifts/Posterior Chain) -> Rest -> Rest
     - **5-Day Split**: Upper Push -> Upper Pull -> Lower A (Squats/Quads) -> Rest -> Upper Density -> Lower B (Deadlifts/Carries) -> Rest
     - **6-Day Split**: Push A -> Pull A -> Legs A -> Push B -> Pull B -> Legs B -> Rest

2. **Server & Client Calibrated Engines (`tacticalEngineServer.ts` & `src/utils/tacticalExerciseEngine.ts`)**:
   - Replaced legacy catch-all split conditions with dedicated, biomechanically balanced routines for 3, 4, 5, and 6-day programs.
   - 4-day and 5-day splits now guarantee Upper Body work separates lower body sessions with adequate rest periods.

3. **Automated Split Clash Detection & Recovery Auto-Fixer (`validateAndFixSplitLogic`)**:
   - Implemented `isLegOrLowerDay` to identify lower body training days by focus and muscle group composition.
   - `validateAndFixSplitLogic` scans the schedule; if an illegal duplicate leg day is scheduled consecutively or near-consecutively (e.g. Day 2 Legs -> Day 3 Rest -> Day 4 Legs), it automatically converts the second session into an Upper Body session with safe compound and accessory movements while preserving user cardio preferences.
   - Applied to both Gemini API responses, server fallback generators, and client-side plan handlers.

## Verification
- Verified 4-day schedule outputs Upper -> Lower -> Rest -> Upper -> Lower -> Rest -> Rest.
- Verified 5-day schedule outputs Upper Push -> Upper Pull -> Lower A -> Rest -> Upper Density -> Lower B -> Rest.
- Tested `validateAndFixSplitLogic` with an illegal leg clash; confirmed immediate conversion of the clashing session into balanced Upper Body work.
- Dev server running cleanly on port 3000; TypeScript build and lint passed with 0 errors.
