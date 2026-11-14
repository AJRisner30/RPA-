import { WorkoutSessionLog, isExerciseTimed } from '../types';

export interface OverloadRecommendation {
  exerciseName: string;
  hasPreviousData: boolean;
  lastSessionDate?: string;
  previousWeightLbs: number;
  recommendedWeightLbs: number;
  incrementLbs: number;
  previousReps: number;
  recommendedReps: number;
  repRangeMin: number;
  repRangeMax: number;
  recommendedSets: number;
  setRangeMin: number;
  setRangeMax: number;
  targetRepsText?: string;
  lastRpe?: number;
  status: 'overload_applied' | 'rep_progression' | 'set_progression' | 'maintain' | 'baseline';
  reason: string;
  isLowerBodyCompound: boolean;
  isUpperBodyCompound: boolean;
  isDumbbell: boolean;
  isTimed: boolean;
  previousTimeFormatted?: string;
  recommendedTimeFormatted?: string;
}

export interface SubsequentSetPacingRecommendation {
  set1WeightLbs: number;
  set1Reps: number;
  set1Rpe: number;
  targetRpe: number;
  recommendedSubsequentWeightLbs: number;
  weightDeltaLbs: number;
  direction: 'increase' | 'maintain' | 'decrease';
  reason: string;
}

export function parseRepRangeBounds(targetRepsText?: string): { min: number; max: number } {
  if (!targetRepsText) return { min: 8, max: 10 };
  const clean = targetRepsText.trim();
  if (clean.includes('5x5') || clean.includes('5 x 5')) {
    return { min: 5, max: 5 };
  }
  if (clean.includes('3x3') || clean.includes('3 x 3')) {
    return { min: 3, max: 3 };
  }
  // Check if there's an explicit range like "10-12", "6-8", "3-5", "3-4", "4-6"
  const rangeMatch = clean.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    if (!isNaN(min) && !isNaN(max) && max >= min) {
      return { min, max };
    }
  }
  const firstNum = clean.match(/(\d+)/);
  if (firstNum) {
    const val = parseInt(firstNum[1], 10);
    if (!isNaN(val) && val > 0) {
      return { min: val, max: val };
    }
  }
  return { min: 8, max: 10 };
}

/**
 * Evaluates performance from previous sessions and calculates the exact
 * working weight, rep, and set prescription for the upcoming session.
 * Starts at the low end of rep ranges and set ranges until session history shows what the user needs.
 */
export function getAutoOverloadRecommendation(
  exerciseName: string,
  targetRepsText?: string,
  targetRpe = 8.0,
  pastLogs: WorkoutSessionLog[] = [],
  setRangeMin = 3,
  setRangeMax = 3
): OverloadRecommendation {
  const nameLower = exerciseName.toLowerCase();
  const { min: repRangeMin, max: repRangeMax } = parseRepRangeBounds(targetRepsText);
  const safeSetMin = Math.max(1, setRangeMin);
  const safeSetMax = Math.max(safeSetMin, setRangeMax);

  // Categorize lift mechanics
  const isLowerBodyCompound =
    nameLower.includes('squat') ||
    nameLower.includes('deadlift') ||
    nameLower.includes('trap bar') ||
    nameLower.includes('trap-bar') ||
    nameLower.includes('rdl') ||
    nameLower.includes('hip thrust') ||
    nameLower.includes('leg press') ||
    nameLower.includes('leg curl') ||
    nameLower.includes('lunge') ||
    nameLower.includes('sled');

  const isUpperBodyCompound =
    nameLower.includes('bench') ||
    nameLower.includes('press') ||
    nameLower.includes('row') ||
    nameLower.includes('pull-up') ||
    nameLower.includes('chin-up') ||
    nameLower.includes('push-up') ||
    nameLower.includes('push press') ||
    nameLower.includes('z-press') ||
    nameLower.includes('face pull') ||
    nameLower.includes('curl');

  const isDumbbell = nameLower.includes('db') || nameLower.includes('dumbbell');

  const isTimed = isExerciseTimed(exerciseName, undefined, targetRepsText);

  // Search past logs for this exercise (most recent first)
  let matchingSession: WorkoutSessionLog | undefined;
  let matchingEx: WorkoutSessionLog['exercises'][0] | undefined;

  for (const log of pastLogs) {
    const ex = log.exercises.find((e) => {
      const eName = e.exerciseName.toLowerCase();
      return eName === nameLower || nameLower.includes(eName) || eName.includes(nameLower);
    });
    if (ex && ex.sets.length > 0) {
      matchingSession = log;
      matchingEx = ex;
      break;
    }
  }

  // No session history yet -> Start at the LOW END of both the set range and rep range
  if (!matchingEx || !matchingSession || matchingEx.sets.length === 0) {
    const rangeNote =
      safeSetMax > safeSetMin || repRangeMax > repRangeMin
        ? `Starting at the low end (${safeSetMin} sets × ${repRangeMin} reps) until logged sessions establish your recovery and work capacity.`
        : `First session on record (${safeSetMin} sets × ${repRangeMin} reps). Log Set 1 to auto-calibrate subsequent set weights.`;
    return {
      exerciseName,
      hasPreviousData: false,
      previousWeightLbs: 0,
      recommendedWeightLbs: 0,
      incrementLbs: 0,
      previousReps: 0,
      recommendedReps: repRangeMin,
      repRangeMin,
      repRangeMax,
      recommendedSets: safeSetMin,
      setRangeMin: safeSetMin,
      setRangeMax: safeSetMax,
      targetRepsText,
      status: 'baseline',
      reason: rangeNote,
      isLowerBodyCompound,
      isUpperBodyCompound,
      isDumbbell,
      isTimed,
    };
  }

  // Found previous data! Analyze completed working sets
  const validSets = matchingEx.sets.filter(
    (s) => s.weightLbs > 0 || s.reps > 0 || (s.timeSeconds && s.timeSeconds > 0)
  );
  const workingSets = validSets.length > 0 ? validSets : matchingEx.sets;

  const maxWeightSet = workingSets.reduce(
    (prev, curr) => (curr.weightLbs > prev.weightLbs ? curr : prev),
    workingSets[0]
  );
  const lastSet = workingSets[workingSets.length - 1];

  const prevWeight = maxWeightSet.weightLbs || lastSet.weightLbs || 0;
  const prevReps = maxWeightSet.reps || lastSet.reps || 0;
  const prevCompletedSets = workingSets.length;
  const avgRpe = workingSets.reduce((acc, s) => acc + (s.rpe || targetRpe), 0) / workingSets.length;
  const highestRpe = workingSets.reduce((max, s) => Math.max(max, s.rpe || 0), 0);
  const effectiveRpe = highestRpe || avgRpe;

  // Determine overload increment based on movement category (exact to 52-Week LEO & Tactical guidelines)
  let defaultIncrement = 5;
  if (
    nameLower.includes('overhead press') ||
    nameLower.includes('shoulder press') ||
    nameLower.includes('landmine press') ||
    nameLower.includes('ohp') ||
    nameLower.includes('strict overhead')
  ) {
    defaultIncrement = 2.5;
  } else if (
    nameLower.includes('weighted pull-up') ||
    nameLower.includes('pull-up') ||
    nameLower.includes('chin-up') ||
    nameLower.includes('pullup')
  ) {
    defaultIncrement = 2.5;
  } else if (nameLower.includes('lateral raise')) {
    defaultIncrement = 2.5;
  } else if (
    (nameLower.includes('squat') && !nameLower.includes('split')) ||
    nameLower.includes('deadlift') ||
    nameLower.includes('trap bar') ||
    nameLower.includes('trap-bar') ||
    nameLower.includes('hip thrust') ||
    nameLower.includes('rdl') ||
    nameLower.includes('romanian')
  ) {
    // Lower-body compounds: +5 to 10 lbs (never >5% at once)
    defaultIncrement = prevWeight > 0 && prevWeight * 0.05 < 10 ? 5 : 10;
  } else if (isLowerBodyCompound) {
    defaultIncrement = 5;
  } else if (isUpperBodyCompound) {
    // Upper-body compounds: +2.5 to 5 lbs (never >5% at once)
    defaultIncrement = prevWeight > 0 && prevWeight * 0.05 < 5 ? 2.5 : 5;
  } else if (isDumbbell) {
    defaultIncrement = 5;
  }

  const hitTopOfRepRange = prevReps >= repRangeMax;
  const controlledEffort = effectiveRpe <= Math.max(8.5, targetRpe + 0.5) || (effectiveRpe <= 9 && hitTopOfRepRange);

  // Determine recommended sets (Start at setRangeMin; progress toward setRangeMax once athlete proves recovery)
  let recommendedSets = Math.max(safeSetMin, Math.min(safeSetMax, prevCompletedSets));
  if (safeSetMax > safeSetMin && controlledEffort && prevCompletedSets >= safeSetMin && effectiveRpe <= targetRpe) {
    recommendedSets = Math.min(safeSetMax, prevCompletedSets + 1);
  }

  // Step 1: Double Progression — If top of rep range is achieved at controlled RPE, add weight & reset reps to repRangeMin
  if (controlledEffort && hitTopOfRepRange && prevWeight > 0) {
    const recommendedWeight = prevWeight + defaultIncrement;
    return {
      exerciseName,
      hasPreviousData: true,
      lastSessionDate: matchingSession.date,
      previousWeightLbs: prevWeight,
      recommendedWeightLbs: recommendedWeight,
      incrementLbs: defaultIncrement,
      previousReps: prevReps,
      recommendedReps: repRangeMin,
      repRangeMin,
      repRangeMax,
      recommendedSets,
      setRangeMin: safeSetMin,
      setRangeMax: safeSetMax,
      targetRepsText,
      lastRpe: effectiveRpe,
      status: 'overload_applied',
      reason: `Top of rep range (${prevReps} reps @ RPE ${effectiveRpe.toFixed(1)}) achieved on ${matchingSession.date}! Added +${defaultIncrement} lbs (${recommendedWeight} lbs) and reset target to ${repRangeMin} reps (${recommendedSets} sets).`,
      isLowerBodyCompound,
      isUpperBodyCompound,
      isDumbbell,
      isTimed,
    };
  }

  // Step 2: Reps First Progression — If below top of rep range with controlled effort, keep weight & add +1-2 reps
  if (prevWeight > 0 && prevReps < repRangeMax && controlledEffort) {
    const nextReps = Math.min(repRangeMax, Math.max(repRangeMin, prevReps + 1));
    return {
      exerciseName,
      hasPreviousData: true,
      lastSessionDate: matchingSession.date,
      previousWeightLbs: prevWeight,
      recommendedWeightLbs: prevWeight,
      incrementLbs: 0,
      previousReps: prevReps,
      recommendedReps: nextReps,
      repRangeMin,
      repRangeMax,
      recommendedSets,
      setRangeMin: safeSetMin,
      setRangeMax: safeSetMax,
      targetRepsText,
      lastRpe: effectiveRpe,
      status: 'rep_progression',
      reason: `Reps-First Progression: Hold ${prevWeight} lbs and advance from ${prevReps} → ${nextReps} reps (${recommendedSets} sets). Add weight once you hit ${repRangeMax} reps across all sets.`,
      isLowerBodyCompound,
      isUpperBodyCompound,
      isDumbbell,
      isTimed,
    };
  }

  // Step 3: Consolidate / Maintain
  return {
    exerciseName,
    hasPreviousData: true,
    lastSessionDate: matchingSession.date,
    previousWeightLbs: prevWeight,
    recommendedWeightLbs: prevWeight,
    incrementLbs: 0,
    previousReps: prevReps,
    recommendedReps: Math.max(repRangeMin, Math.min(repRangeMax, prevReps || repRangeMin)),
    repRangeMin,
    repRangeMax,
    recommendedSets: safeSetMin,
    setRangeMin: safeSetMin,
    setRangeMax: safeSetMax,
    targetRepsText,
    lastRpe: effectiveRpe,
    status: 'maintain',
    reason: `Consolidate Load: Maintain ${prevWeight} lbs (${safeSetMin} sets × ${Math.max(repRangeMin, prevReps || repRangeMin)} reps). Effort was RPE ${effectiveRpe.toFixed(1)} on ${matchingSession.date}.`,
    isLowerBodyCompound,
    isUpperBodyCompound,
    isDumbbell,
    isTimed,
  };
}

/**
 * Intra-Session Auto-Overload Pacing Engine:
 * Once a user logs Set 1 of an exercise, automatically calculates and recommends
 * the exact working weight for all subsequent sets (Sets 2..N) to maintain the target effort level (targetRpe).
 */
export function calculateSubsequentSetsWeight(
  set1WeightLbs: number,
  set1Reps: number,
  set1Rpe: number,
  targetRpe = 8.0,
  targetRepsText?: string,
  exerciseName = ''
): SubsequentSetPacingRecommendation {
  const safeTargetRpe = targetRpe > 0 ? targetRpe : 8.0;
  const safeSet1Rpe = set1Rpe > 0 ? set1Rpe : safeTargetRpe;
  const { min: repMin, max: repMax } = parseRepRangeBounds(targetRepsText);

  if (set1WeightLbs <= 0) {
    return {
      set1WeightLbs: 0,
      set1Reps,
      set1Rpe: safeSet1Rpe,
      targetRpe: safeTargetRpe,
      recommendedSubsequentWeightLbs: 0,
      weightDeltaLbs: 0,
      direction: 'maintain',
      reason: `Bodyweight / unloaded movement logged at RPE ${safeSet1Rpe}. Maintain crisp tempo across remaining sets to hold Target RPE ${safeTargetRpe}.`,
    };
  }

  const nameLower = exerciseName.toLowerCase();
  const isLower =
    nameLower.includes('squat') ||
    nameLower.includes('deadlift') ||
    nameLower.includes('trap') ||
    nameLower.includes('rdl') ||
    nameLower.includes('lunge') ||
    nameLower.includes('sled');

  const minStep = isLower && set1WeightLbs >= 100 ? 5 : 2.5;
  const roundToStep = (val: number) => Math.round(val / minStep) * minStep;

  // RPE difference: positive means Set 1 felt easier than targetRpe; negative means Set 1 felt harder
  let effectiveRpeReserve = safeTargetRpe - safeSet1Rpe;

  // Factor in reps relative to the prescribed rep range
  if (set1Reps > repMax && repMax > 0) {
    effectiveRpeReserve += Math.min(1.5, (set1Reps - repMax) * 0.5);
  } else if (set1Reps > 0 && set1Reps < repMin) {
    effectiveRpeReserve -= Math.min(2.0, (repMin - set1Reps) * 0.75);
  }

  // Case 1: Set 1 was meaningfully below target effort -> Recommend increasing weight on Sets 2+
  if (effectiveRpeReserve >= 0.75) {
    // ~3% load increase per 1.0 RPE below target, capped at 10%
    const pctIncrease = Math.min(0.1, effectiveRpeReserve * 0.03);
    const rawDelta = Math.max(minStep, set1WeightLbs * pctIncrease);
    const deltaLbs = Math.max(minStep, roundToStep(rawDelta));
    const nextWeight = set1WeightLbs + deltaLbs;

    return {
      set1WeightLbs,
      set1Reps,
      set1Rpe: safeSet1Rpe,
      targetRpe: safeTargetRpe,
      recommendedSubsequentWeightLbs: nextWeight,
      weightDeltaLbs: deltaLbs,
      direction: 'increase',
      reason: `Set 1 logged below target effort (${set1WeightLbs} lbs × ${set1Reps} @ RPE ${safeSet1Rpe} vs Target RPE ${safeTargetRpe}). Auto-recommended +${deltaLbs} lbs (${nextWeight} lbs) for Sets 2+ to hit target effort.`,
    };
  }

  // Case 2: Set 1 overshot target effort or missed minimum reps -> Recommend reducing weight on Sets 2+ to stay in target zone
  if (effectiveRpeReserve <= -0.75) {
    const pctDecrease = Math.min(0.12, Math.abs(effectiveRpeReserve) * 0.035);
    const rawDelta = Math.max(minStep, set1WeightLbs * pctDecrease);
    const deltaLbs = Math.max(minStep, roundToStep(rawDelta));
    const nextWeight = Math.max(minStep, set1WeightLbs - deltaLbs);

    return {
      set1WeightLbs,
      set1Reps,
      set1Rpe: safeSet1Rpe,
      targetRpe: safeTargetRpe,
      recommendedSubsequentWeightLbs: nextWeight,
      weightDeltaLbs: -deltaLbs,
      direction: 'decrease',
      reason: `Set 1 exceeded target effort (${set1WeightLbs} lbs × ${set1Reps} @ RPE ${safeSet1Rpe} vs Target RPE ${safeTargetRpe}). Auto-recommended -${deltaLbs} lbs (${nextWeight} lbs) for Sets 2+ to maintain target effort without form breakdown.`,
    };
  }

  // Case 3: Set 1 was right on target effort -> Lock Set 1 weight across Sets 2+
  return {
    set1WeightLbs,
    set1Reps,
    set1Rpe: safeSet1Rpe,
    targetRpe: safeTargetRpe,
    recommendedSubsequentWeightLbs: set1WeightLbs,
    weightDeltaLbs: 0,
    direction: 'maintain',
    reason: `Set 1 hit target effort (${set1WeightLbs} lbs × ${set1Reps} @ RPE ${safeSet1Rpe} • Target RPE ${safeTargetRpe}). Locked ${set1WeightLbs} lbs across all remaining sets.`,
  };
}

