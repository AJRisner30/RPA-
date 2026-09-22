import { RuckSessionLog, RuckTerrainType } from '../types';

// Default ruck logs start empty so everyone begins with a fresh new log until they create their own
export const DEFAULT_RUCK_LOGS: RuckSessionLog[] = [];

// Sample benchmark logs available for demonstration or template loading
export const SAMPLE_RUCK_BENCHMARK_LOGS: RuckSessionLog[] = [
  {
    id: 'sample-ruck-log-1',
    athleteId: 'athlete-default',
    title: 'Baseline Recon Ruck',
    date: '2026-08-05',
    distanceMiles: 2.5,
    weightLbs: 20,
    durationMinutes: 38,
    paceMinPerMile: 15.2,
    workloadIndex: 50,
    terrain: 'Pavement / Road',
    heartRateAvg: 132,
    rpe: 6,
    notes: 'Initial baseline ruck. Focused on rhythmic breathing and upright posture.',
    createdAt: '2026-08-05T08:30:00Z',
  },
  {
    id: 'sample-ruck-log-2',
    athleteId: 'athlete-default',
    title: 'Tactical Load Progression 1',
    date: '2026-08-12',
    distanceMiles: 3.5,
    weightLbs: 25,
    durationMinutes: 52,
    paceMinPerMile: 14.8,
    workloadIndex: 87.5,
    terrain: 'Mixed Tactical',
    heartRateAvg: 138,
    rpe: 6.5,
    notes: 'Added +5 lbs pack weight. Steady cadence throughout.',
    createdAt: '2026-08-12T07:15:00Z',
  },
  {
    id: 'sample-ruck-log-3',
    athleteId: 'athlete-default',
    title: 'Trail Incline & Load Carry',
    date: '2026-08-19',
    distanceMiles: 4.0,
    weightLbs: 30,
    durationMinutes: 61,
    paceMinPerMile: 15.25,
    workloadIndex: 120,
    terrain: 'Trails / Forest',
    heartRateAvg: 144,
    rpe: 7.5,
    notes: 'Steeper gravel inclines. Felt solid in glutes and calves.',
    createdAt: '2026-08-19T06:45:00Z',
  }
];

export interface RuckMilestoneStandard {
  id: string;
  name: string;
  targetWeightLbs: number;
  targetDistanceMiles: number;
  timeCapMinutes: number;
  description: string;
  badge: string;
}

export const RUCK_STANDARDS: RuckMilestoneStandard[] = [
  {
    id: 'standard-5k-light',
    name: 'Tactical 5K Ruck',
    targetWeightLbs: 25,
    targetDistanceMiles: 3.1,
    timeCapMinutes: 45,
    description: 'Entry-level conditioning: 3.1 miles in under 45 minutes (14:30/mi pace with 25 lbs).',
    badge: '🎖️ 5K RECON'
  },
  {
    id: 'standard-4mi-test',
    name: '4-Mile Tactical Speed Test',
    targetWeightLbs: 45,
    targetDistanceMiles: 4.0,
    timeCapMinutes: 60,
    description: 'Heavy 45-lb dry pack benchmark. Must complete in under 60 minutes (15:00/mi pace).',
    badge: '⚡ 4-MILE BENCHMARK'
  },
  {
    id: 'standard-12mi-army',
    name: '12-Mile Army Standard',
    targetWeightLbs: 35,
    targetDistanceMiles: 12.0,
    timeCapMinutes: 240,
    description: 'Official U.S. Army road march standard: 12 miles in under 4 hours (240 min, 20:00/mi pace with 35 lbs dry ruck).',
    badge: '🎖️ 12-MILE ARMY'
  },
  {
    id: 'standard-12mi-sof',
    name: '12-Mile SOF & Schools Standard',
    targetWeightLbs: 35,
    targetDistanceMiles: 12.0,
    timeCapMinutes: 180,
    description: 'Special Operations Forces & elite schools (SFAS, RASP, Ranger School, Air Assault, EIB): 12 miles in under 3 hours (180 min, 15:00/mi pace with 35 lbs).',
    badge: '⚔️ 12-MILE SOF / SCHOOLS'
  }
];

/**
 * Calculates rucking pace formatted as mm:ss per mile
 */
export function formatRuckPace(paceMinPerMile: number): string {
  if (!paceMinPerMile || isNaN(paceMinPerMile) || paceMinPerMile <= 0) return '0:00';
  const mins = Math.floor(paceMinPerMile);
  const secs = Math.round((paceMinPerMile - mins) * 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Estimates calories burned based on body weight, pack weight, distance and terrain
 */
export function estimateRuckCalories(
  distanceMiles: number,
  bodyWeightLbs: number = 185,
  packWeightLbs: number = 35,
  durationMinutes: number = 60
): number {
  if (distanceMiles <= 0 || durationMinutes <= 0) return 0;
  // Based on MET calculation for weighted backpack marching:
  // Base walking MET is ~3.5. Each 10-15 lbs of pack adds ~1.0-1.5 MET.
  const speedMph = (distanceMiles / durationMinutes) * 60;
  let baseMet = 4.0;
  if (speedMph >= 4.0) baseMet = 7.5;
  else if (speedMph >= 3.5) baseMet = 6.0;
  else if (speedMph >= 3.0) baseMet = 5.0;

  const packFactor = (packWeightLbs / bodyWeightLbs) * 2.8;
  const effectiveMet = baseMet + packFactor;

  const totalMassKg = ((bodyWeightLbs + packWeightLbs) * 0.453592);
  const hours = durationMinutes / 60;
  const calories = Math.round(effectiveMet * totalMassKg * hours);
  return Math.max(50, calories);
}
