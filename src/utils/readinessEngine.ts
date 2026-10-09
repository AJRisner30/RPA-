import { AthleteProfile, WorkoutSessionLog, ReadinessScoreBreakdown, ReadinessTier, RecoveryCheckIn, BodyweightEntry } from '../types';

/**
 * Calculates a comprehensive Tactical Readiness Score for law enforcement officers
 * aggregating Recovery, Weight Logging Consistency, and Workout Completion Rates.
 */
export function calculateReadinessScore(
  athlete: AthleteProfile,
  allLogs: WorkoutSessionLog[]
): ReadinessScoreBreakdown {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Filter logs for this athlete
  const athleteLogs = allLogs.filter((l) => {
    if (l.athleteId) return l.athleteId === athlete.id;
    return athlete.id === 'athlete-default' || athlete.id === 'athlete-aj-risner';
  });

  // -------------------------------------------------------------------------
  // 1. WORKOUT COMPLETION RATES (Weight: 35%)
  // -------------------------------------------------------------------------
  const targetWorkoutsPerWeek = athlete.questionnaire?.weeklyDays || 4;

  // Count workouts completed in rolling 7 days
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const logsLast7Days = athleteLogs.filter((l) => {
    const logDate = new Date(l.date);
    return logDate >= sevenDaysAgo;
  });
  const workoutsCompleted7d = logsLast7Days.length;

  let completionRatio = workoutsCompleted7d / targetWorkoutsPerWeek;
  let workoutCompletionScore = 75;

  if (completionRatio >= 1.0) {
    workoutCompletionScore = 100;
  } else if (completionRatio >= 0.75) {
    workoutCompletionScore = 85;
  } else if (completionRatio >= 0.5) {
    workoutCompletionScore = 68;
  } else if (completionRatio >= 0.25) {
    workoutCompletionScore = 48;
  } else if (workoutsCompleted7d === 0) {
    // If brand new or inactive in last 7 days
    workoutCompletionScore = athleteLogs.length > 0 ? 35 : 50;
  }

  // Calculate workout streak (weeks with at least target - 1 workouts)
  let workoutStreak = 0;
  if (athleteLogs.length > 0) {
    // Basic streak representation: 1 streak point per 3 workouts logged, up to 6
    workoutStreak = Math.min(8, Math.floor(athleteLogs.length / 3));
    if (workoutStreak >= 3) {
      workoutCompletionScore = Math.min(100, workoutCompletionScore + 5);
    }
  }

  // -------------------------------------------------------------------------
  // 2. WEIGHT LOGGING CONSISTENCY (Weight: 30%)
  // -------------------------------------------------------------------------
  const weightEntries = athlete.weightHistory || [];
  let lastWeightDate: string | undefined;
  let lastWeightLbs: number | undefined = athlete.weightLbs;
  let daysSinceLastWeight = 999;

  if (weightEntries.length > 0) {
    const sortedWeights = [...weightEntries].sort((a, b) => b.date.localeCompare(a.date));
    lastWeightDate = sortedWeights[0].date;
    lastWeightLbs = sortedWeights[0].weightLbs;
    const diffMs = now.getTime() - new Date(lastWeightDate).getTime();
    daysSinceLastWeight = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  } else if (athlete.weightLbs) {
    // Athlete has base weight configured
    lastWeightDate = athlete.joinedDate || todayStr;
    daysSinceLastWeight = 3; // Give reasonable starting credit
  }

  let weightConsistencyScore = 40;
  if (daysSinceLastWeight === 0) {
    weightConsistencyScore = 100; // Logged today
  } else if (daysSinceLastWeight <= 2) {
    weightConsistencyScore = 95;
  } else if (daysSinceLastWeight <= 4) {
    weightConsistencyScore = 85;
  } else if (daysSinceLastWeight <= 7) {
    weightConsistencyScore = 72;
  } else if (daysSinceLastWeight <= 14) {
    weightConsistencyScore = 55;
  } else {
    weightConsistencyScore = 38;
  }

  // Bonus if athlete has logged 3+ bodyweight points
  if (weightEntries.length >= 3) {
    weightConsistencyScore = Math.min(100, weightConsistencyScore + 5);
  }

  // -------------------------------------------------------------------------
  // 3. RECOVERY PILLAR (Weight: 35%)
  // -------------------------------------------------------------------------
  const lastRecovery = athlete.lastRecoveryCheckIn;
  let recoveryScore = 82; // Default baseline
  let hoursOfSleep: number | undefined = lastRecovery?.sleepHours;
  let lastRecoveryDate = lastRecovery?.date;

  if (lastRecovery) {
    const diffMs = now.getTime() - new Date(lastRecovery.date).getTime();
    const daysSinceRecovery = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    // 1. Sleep Duration Score (30%)
    let sleepScore = 80;
    if (lastRecovery.sleepHours >= 7.5) sleepScore = 100;
    else if (lastRecovery.sleepHours >= 7.0) sleepScore = 90;
    else if (lastRecovery.sleepHours >= 6.0) sleepScore = 75;
    else if (lastRecovery.sleepHours >= 5.0) sleepScore = 55;
    else sleepScore = 35;

    // 2. Sleep Quality (25%)
    const qualityScoreMap: Record<number, number> = { 5: 100, 4: 88, 3: 70, 2: 48, 1: 25 };
    const sleepQualityScore = qualityScoreMap[lastRecovery.sleepQuality] || 70;

    // 3. Muscle Soreness (25%) (1 = Fresh -> 100%, 5 = Extreme -> 35%)
    const sorenessScoreMap: Record<number, number> = { 1: 100, 2: 90, 3: 75, 4: 55, 5: 35 };
    const sorenessScore = sorenessScoreMap[lastRecovery.muscleSoreness] || 75;

    // 4. Shift Stress (20%) (1 = Low -> 100%, 5 = Critical -> 30%)
    const stressScoreMap: Record<number, number> = { 1: 100, 2: 88, 3: 72, 4: 50, 5: 30 };
    const stressScore = stressScoreMap[lastRecovery.shiftStress] || 72;

    const weightedRecovery = Math.round(
      sleepScore * 0.30 +
      sleepQualityScore * 0.25 +
      sorenessScore * 0.25 +
      stressScore * 0.20
    );

    // If check-in is older than 2 days, slightly regress to baseline
    if (daysSinceRecovery <= 1) {
      recoveryScore = weightedRecovery;
    } else if (daysSinceRecovery <= 3) {
      recoveryScore = Math.round((weightedRecovery + 80) / 2);
    } else {
      recoveryScore = 78;
    }
  } else {
    // Estimate from recent training frequency & resting HR
    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
    const recentWorkouts = athleteLogs.filter((l) => new Date(l.date) >= fourDaysAgo).length;

    if (recentWorkouts >= 4) {
      // 4 consecutive workout days -> moderate fatigue
      recoveryScore = 72;
    } else if (recentWorkouts >= 2) {
      recoveryScore = 84;
    } else {
      recoveryScore = 88;
    }

    if (athlete.restingHr && athlete.restingHr <= 56) {
      recoveryScore = Math.min(100, recoveryScore + 4);
    }
  }

  // -------------------------------------------------------------------------
  // 4. AGGREGATED READINESS SCORE & CLASSIFICATION
  // -------------------------------------------------------------------------
  const overallScore = Math.round(
    recoveryScore * 0.35 +
    weightConsistencyScore * 0.30 +
    workoutCompletionScore * 0.35
  );

  let tier: ReadinessTier;
  let statusBadgeColor: string;

  if (overallScore >= 90) {
    tier = 'Patrol Ready: Peak';
    statusBadgeColor = 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300';
  } else if (overallScore >= 80) {
    tier = 'Optimal: Combat Chassis';
    statusBadgeColor = 'bg-blue-950/80 border-blue-500/50 text-blue-300';
  } else if (overallScore >= 70) {
    tier = 'Operational: Monitor Fatigue';
    statusBadgeColor = 'bg-sky-950/80 border-sky-500/50 text-sky-300';
  } else if (overallScore >= 55) {
    tier = 'Recovery Advisory';
    statusBadgeColor = 'bg-amber-950/80 border-amber-500/50 text-amber-300';
  } else {
    tier = 'Strained / De-load Priority';
    statusBadgeColor = 'bg-red-950/80 border-red-500/50 text-red-300';
  }

  // -------------------------------------------------------------------------
  // 5. COACH ARYAN'S TACTICAL ADVISORY
  // -------------------------------------------------------------------------
  let coachAdvisory = '';
  const lowestPillar = Math.min(recoveryScore, weightConsistencyScore, workoutCompletionScore);

  if (overallScore >= 90) {
    coachAdvisory =
      'Peak Combat Chassis. Central nervous system recovery, training volume, and bodyweight tracking are in full alignment. You are cleared for high-intensity foot pursuit sprints and progressive overload.';
  } else if (lowestPillar === recoveryScore && recoveryScore < 75) {
    coachAdvisory =
      'Shift Fatigue Advisory: Recovery is currently your primary bottleneck. Prioritize 7.5+ hours of sleep, electrolytes, and 15 minutes of post-shift hip/thoracic mobility before tackling heavy compound sets.';
  } else if (lowestPillar === weightConsistencyScore && weightConsistencyScore < 70) {
    coachAdvisory =
      'Weight Logging Consistency Notice: Your scale weight has not been recorded recently. Log your current bodyweight to monitor power-to-weight ratio and gear load calibration.';
  } else if (lowestPillar === workoutCompletionScore && workoutCompletionScore < 70) {
    coachAdvisory = `Training Volume Gap: You have logged ${workoutsCompleted7d} of ${targetWorkoutsPerWeek} planned sessions this week. Execute today’s scheduled session to maintain adaptation momentum.`;
  } else {
    coachAdvisory =
      'Operational State Maintained. Training consistency and physical readiness are balanced. Focus on high-quality eccentric control and adequate intra-shift hydration.';
  }

  return {
    overallScore,
    tier,
    recoveryScore,
    weightConsistencyScore,
    workoutCompletionScore,
    workoutsCompleted7d,
    targetWorkoutsPerWeek,
    workoutStreak,
    lastWeightDate,
    lastWeightLbs,
    daysSinceLastWeight,
    lastRecoveryDate,
    hoursOfSleep,
    coachAdvisory,
    statusBadgeColor,
  };
}
