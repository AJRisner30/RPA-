import { WorkoutSessionLog } from '../types';

export interface OverloadRecommendation {
  exerciseName: string;
  hasPreviousData: boolean;
  lastSessionDate?: string;
  previousWeightLbs: number;
  recommendedWeightLbs: number;
  incrementLbs: number;
  previousReps: number;
  targetRepsText?: string;
  lastRpe?: number;
  status: 'overload_applied' | 'maintain' | 'baseline';
  reason: string;
  isLowerBodyCompound: boolean;
  isUpperBodyCompound: boolean;
  isDumbbell: boolean;
  isTimed: boolean;
  previousTimeFormatted?: string;
  recommendedTimeFormatted?: string;
}

/**
 * Evaluates performance from previous sessions and calculates the exact
 * working weight prescription for the upcoming week based on Coach AJ Risner's Overload Laws.
 */
export function getAutoOverloadRecommendation(
  exerciseName: string,
  targetRepsText?: string,
  targetRpe = 8.5,
  pastLogs: WorkoutSessionLog[] = []
): OverloadRecommendation {
  const nameLower = exerciseName.toLowerCase();

  // Categorize lift mechanics
  const isLowerBodyCompound = 
    nameLower.includes('squat') || 
    nameLower.includes('deadlift') || 
    nameLower.includes('rdl') || 
    nameLower.includes('hip thrust') ||
    nameLower.includes('leg press');

  const isUpperBodyCompound = 
    nameLower.includes('bench') || 
    nameLower.includes('press') || 
    nameLower.includes('row') || 
    nameLower.includes('pull-up') ||
    nameLower.includes('chin-up') ||
    nameLower.includes('push press');

  const isDumbbell = nameLower.includes('db') || nameLower.includes('dumbbell');

  const isTimed = 
    nameLower.includes('plank') || 
    nameLower.includes('hold') || 
    nameLower.includes('run') || 
    nameLower.includes('ruck') ||
    (targetRepsText || '').toLowerCase().includes('min') ||
    (targetRepsText || '').toLowerCase().includes('sec') ||
    (targetRepsText || '').toLowerCase().includes(' s') ||
    (targetRepsText || '').toLowerCase().endsWith('s');

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

  if (!matchingEx || !matchingSession || matchingEx.sets.length === 0) {
    return {
      exerciseName,
      hasPreviousData: false,
      previousWeightLbs: 0,
      recommendedWeightLbs: 0,
      incrementLbs: 0,
      previousReps: 0,
      targetRepsText,
      status: 'baseline',
      reason: 'First session on record. Log your sets to initialize Coach AJ\'s automated progressive overload engine.',
      isLowerBodyCompound,
      isUpperBodyCompound,
      isDumbbell,
      isTimed,
    };
  }

  // Found previous data! Analyze completed working sets
  const validSets = matchingEx.sets.filter((s) => s.weightLbs > 0 || s.reps > 0 || (s.timeSeconds && s.timeSeconds > 0));
  const workingSets = validSets.length > 0 ? validSets : matchingEx.sets;
  
  // Find highest working weight and corresponding stats
  const maxWeightSet = workingSets.reduce((prev, curr) => (curr.weightLbs > prev.weightLbs ? curr : prev), workingSets[0]);
  const lastSet = workingSets[workingSets.length - 1];

  const prevWeight = maxWeightSet.weightLbs || lastSet.weightLbs || 0;
  const prevReps = maxWeightSet.reps || lastSet.reps || 0;
  const avgRpe = workingSets.reduce((acc, s) => acc + (s.rpe || 8), 0) / workingSets.length;
  const highestRpe = workingSets.reduce((max, s) => Math.max(max, s.rpe || 0), 0);

  // Parse target reps upper bound (e.g. "4x8" -> 8, "10-12" -> 12, "3x5" -> 5)
  let targetRepMax = 8;
  if (targetRepsText) {
    const numbers = targetRepsText.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      targetRepMax = parseInt(numbers[numbers.length - 1], 10);
    }
  }

  // Determine overload increment based on movement category
  let defaultIncrement = 5;
  if (isLowerBodyCompound) {
    defaultIncrement = 10; // +10 lbs on Back Squat, Deadlifts, RDLs
  } else if (isUpperBodyCompound) {
    defaultIncrement = 5; // +5 lbs on Bench, OHP, Rows
  } else if (isDumbbell) {
    defaultIncrement = 5; // +5 lbs total
  }

  // Overload Trigger Decision:
  // Did athlete hit or exceed target reps with RPE <= 8.5?
  const hitTargetReps = prevReps >= targetRepMax;
  const controlledEffort = (highestRpe || avgRpe) <= 8.5 || (highestRpe <= 9 && hitTargetReps);

  if (controlledEffort && hitTargetReps && prevWeight > 0) {
    const recommendedWeight = prevWeight + defaultIncrement;
    return {
      exerciseName,
      hasPreviousData: true,
      lastSessionDate: matchingSession.date,
      previousWeightLbs: prevWeight,
      recommendedWeightLbs: recommendedWeight,
      incrementLbs: defaultIncrement,
      previousReps: prevReps,
      targetRepsText,
      lastRpe: highestRpe || avgRpe,
      status: 'overload_applied',
      reason: `Auto-Overload System: +${defaultIncrement} lbs applied for next week! You achieved ${prevReps} reps at RPE ${(highestRpe || avgRpe).toFixed(1)} on ${matchingSession.date}.`,
      isLowerBodyCompound,
      isUpperBodyCompound,
      isDumbbell,
      isTimed,
    };
  } else if (prevWeight > 0) {
    return {
      exerciseName,
      hasPreviousData: true,
      lastSessionDate: matchingSession.date,
      previousWeightLbs: prevWeight,
      recommendedWeightLbs: prevWeight,
      incrementLbs: 0,
      previousReps: prevReps,
      targetRepsText,
      lastRpe: highestRpe || avgRpe,
      status: 'maintain',
      reason: `Consolidate Load: Maintain ${prevWeight} lbs next week. Effort was RPE ${(highestRpe || avgRpe).toFixed(1)} on ${matchingSession.date}. Master rep capacity before advancing.`,
      isLowerBodyCompound,
      isUpperBodyCompound,
      isDumbbell,
      isTimed,
    };
  }

  return {
    exerciseName,
    hasPreviousData: true,
    lastSessionDate: matchingSession.date,
    previousWeightLbs: prevWeight,
    recommendedWeightLbs: prevWeight,
    incrementLbs: 0,
    previousReps: prevReps,
    targetRepsText,
    status: 'maintain',
    reason: `Maintain previous weight from ${matchingSession.date}.`,
    isLowerBodyCompound,
    isUpperBodyCompound,
    isDumbbell,
    isTimed,
  };
}
