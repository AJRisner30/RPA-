import { WorkoutProgram, WorkoutSessionLog, SupplementProtocol, PersonalRecord } from '../types';
import { INITIAL_PROGRAMS, INITIAL_PAST_LOGS, INITIAL_SUPPLEMENTS } from '../data/initialData';
import { getCurrentAthlete } from './athleteAuth';

const PROGRAMS_KEY = 'rpa_programs_v1';
const LOGS_KEY = 'rpa_workout_logs_v1';
const SUPPLEMENTS_KEY = 'rpa_supplements_v1';
const TIMER_CONFIG_KEY = 'rpa_timer_config_v1';

export interface TimerConfig {
  defaultRestSeconds: number;
  autoStartRestOnSetComplete: boolean;
  soundAlertsEnabled: boolean;
  vibrationEnabled: boolean;
}

export const defaultTimerConfig: TimerConfig = {
  defaultRestSeconds: 90,
  autoStartRestOnSetComplete: true,
  soundAlertsEnabled: true,
  vibrationEnabled: true,
};

export function getStoredPrograms(): WorkoutProgram[] {
  if (typeof window === 'undefined') return INITIAL_PROGRAMS;
  try {
    const data = localStorage.getItem(PROGRAMS_KEY);
    if (!data) {
      localStorage.setItem(PROGRAMS_KEY, JSON.stringify(INITIAL_PROGRAMS));
      return INITIAL_PROGRAMS;
    }
    const parsed: WorkoutProgram[] = JSON.parse(data);
    // Automatically include newly added default programs like Hybrid Planners if not present
    const existingIds = new Set(parsed.map((p) => p.id));
    const missingDefaults = INITIAL_PROGRAMS.filter((p) => !existingIds.has(p.id));
    if (missingDefaults.length > 0) {
      const merged = [...parsed, ...missingDefaults];
      localStorage.setItem(PROGRAMS_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load programs', e);
    return INITIAL_PROGRAMS;
  }
}

export function savePrograms(programs: WorkoutProgram[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROGRAMS_KEY, JSON.stringify(programs));
  } catch (e) {
    console.error('Failed to save programs', e);
  }
}

const FRESH_START_V1_KEY = 'rpa_fresh_start_cleared_v1';

export function getStoredWorkoutLogs(): WorkoutSessionLog[] {
  if (typeof window === 'undefined') return [];
  try {
    // Check if one-time fresh reset was performed to wipe legacy mock logs
    const hasFreshStart = localStorage.getItem(FRESH_START_V1_KEY);
    if (!hasFreshStart) {
      localStorage.setItem(FRESH_START_V1_KEY, 'true');
      localStorage.setItem(LOGS_KEY, JSON.stringify([]));
      localStorage.removeItem('hybridStrengthLogs');
      return [];
    }

    const data = localStorage.getItem(LOGS_KEY);
    if (!data) {
      localStorage.setItem(LOGS_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(data);
    // Extra safety: if data only contains old mock logs (log-1 through log-6), clear them
    if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((l) => typeof l.id === 'string' && /^log-[1-6]$/.test(l.id))) {
      localStorage.setItem(LOGS_KEY, JSON.stringify([]));
      return [];
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load logs', e);
    return [];
  }
}

export function saveWorkoutLog(log: WorkoutSessionLog): WorkoutSessionLog[] {
  let taggedLog = { ...log };
  if (!taggedLog.athleteId) {
    try {
      const currentAthlete = getCurrentAthlete();
      taggedLog.athleteId = currentAthlete.id;
    } catch {
      // fallback
    }
  }

  const currentLogs = getStoredWorkoutLogs();
  const updated = [taggedLog, ...currentLogs];
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function deleteWorkoutLog(logId: string): WorkoutSessionLog[] {
  const currentLogs = getStoredWorkoutLogs();
  const updated = currentLogs.filter(l => l.id !== logId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  }
  return updated;
}

/**
 * Completely clears all workout session logs and recent lift tracker sets
 * across every athlete so all athletes start fresh at one time.
 */
export function clearAllWorkoutLogs(): WorkoutSessionLog[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOGS_KEY, JSON.stringify([]));
    localStorage.removeItem('hybridStrengthLogs');
    window.dispatchEvent(new CustomEvent('logs_cleared', { detail: { scope: 'all' } }));
  }
  return [];
}

/**
 * Clears workout session logs for a specific athlete only.
 */
export function clearAthleteWorkoutLogs(athleteId: string): WorkoutSessionLog[] {
  const currentLogs = getStoredWorkoutLogs();
  const updated = currentLogs.filter((l) => {
    // If athleteId matches or if log has no athleteId and target is default
    if (l.athleteId === athleteId) return false;
    if (!l.athleteId && (athleteId === 'athlete-default' || athleteId === 'athlete-aj-risner')) return false;
    return true;
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('logs_cleared', { detail: { scope: 'athlete', athleteId } }));
  }
  return updated;
}

/**
 * Clears quick lift tracker sets from local storage.
 */
export function clearHybridStrengthLogs(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('hybridStrengthLogs');
  }
}


export function getStoredSupplements(): SupplementProtocol[] {
  if (typeof window === 'undefined') return INITIAL_SUPPLEMENTS;
  try {
    const data = localStorage.getItem(SUPPLEMENTS_KEY);
    if (!data) {
      localStorage.setItem(SUPPLEMENTS_KEY, JSON.stringify(INITIAL_SUPPLEMENTS));
      return INITIAL_SUPPLEMENTS;
    }
    const parsed: SupplementProtocol[] = JSON.parse(data);
    let updated = false;

    // Migrate any items referencing 8,000 mg or Citrulline to 6,000 mg
    const migrated = parsed.map((supp) => {
      const mentions8000 = supp.dosage.includes('8,000') || supp.dosage.includes('8000') || supp.dosage.toLowerCase().includes('8g');
      const isCitrulline = supp.name.toLowerCase().includes('citrulline') || supp.benefit.toLowerCase().includes('citrulline');

      if (mentions8000 || isCitrulline) {
        updated = true;
        return {
          ...supp,
          dosage: supp.dosage.replace(/8[,.]?000\s*mg/gi, '6,000 mg').replace(/8g/gi, '6,000 mg'),
          benefit: supp.benefit.replace(/8[,.]?000\s*mg/gi, '6,000 mg').replace(/8g/gi, '6,000 mg'),
          issaGuideline: supp.issaGuideline ? supp.issaGuideline.replace(/8[,.]?000\s*mg/gi, '6,000 mg') : undefined,
        };
      }
      return supp;
    });

    // Ensure L-Citrulline protocol is included
    const hasCitrulline = migrated.some((s) => s.name.toLowerCase().includes('citrulline'));
    if (!hasCitrulline) {
      const citrullineItem = INITIAL_SUPPLEMENTS.find((s) => s.id === 'supp-pre-3') || {
        id: 'supp-pre-3',
        name: 'L-Citrulline (Nitric Oxide & Blood Flow)',
        dosage: '6,000 mg in 8-12oz water',
        phase: 'pre_workout' as const,
        phaseLabel: 'Pre-Workout Priming',
        timingWindow: 'T-Minus 20-30 Min Prior to Training',
        benefit: 'Endothelial nitric oxide synthase priming for maximal muscle pump, vascular dilation, and accelerated ammonia/lactate clearance during hybrid lifting & running.',
        issaGuideline: 'ISSA Sports Nutrition Protocol: Clinical 6,000 mg dose optimizes plasma L-arginine levels and muscular oxygen delivery without digestive distress.',
        takenToday: false,
      };
      const lastPreIdx = migrated.map(s => s.phase).lastIndexOf('pre_workout');
      if (lastPreIdx !== -1) {
        migrated.splice(lastPreIdx + 1, 0, citrullineItem);
      } else {
        migrated.unshift(citrullineItem);
      }
      updated = true;
    }

    if (updated) {
      localStorage.setItem(SUPPLEMENTS_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load supplements', e);
    return INITIAL_SUPPLEMENTS;
  }
}

export function saveSupplements(supplements: SupplementProtocol[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SUPPLEMENTS_KEY, JSON.stringify(supplements));
  } catch (e) {
    console.error('Failed to save supplements', e);
  }
}

export function getTimerConfig(): TimerConfig {
  if (typeof window === 'undefined') return defaultTimerConfig;
  try {
    const data = localStorage.getItem(TIMER_CONFIG_KEY);
    if (!data) return defaultTimerConfig;
    return { ...defaultTimerConfig, ...JSON.parse(data) };
  } catch {
    return defaultTimerConfig;
  }
}

export function saveTimerConfig(config: TimerConfig) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TIMER_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save timer config', e);
  }
}

/**
 * Calculates Estimated One Rep Max using Epley formula:
 * 1RM = Weight * (1 + Reps / 30)
 */
export function calculate1RM(weightLbs: number, reps: number): number {
  if (reps <= 0 || weightLbs <= 0) return 0;
  if (reps === 1) return weightLbs;
  return Math.round(weightLbs * (1 + reps / 30));
}

/**
 * Derives Personal Records from all logged workout sessions
 */
export function extractPersonalRecords(logs: WorkoutSessionLog[]): PersonalRecord[] {
  const prMap = new Map<string, PersonalRecord>();

  logs.forEach(session => {
    session.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.weightLbs <= 0 || set.reps <= 0) return;
        const e1RM = calculate1RM(set.weightLbs, set.reps);
        const existing = prMap.get(ex.exerciseName);

        if (!existing || e1RM > existing.estimated1RM || (e1RM === existing.estimated1RM && set.weightLbs > existing.maxWeightLbs)) {
          prMap.set(ex.exerciseName, {
            exerciseName: ex.exerciseName,
            maxWeightLbs: set.weightLbs,
            repsAtMax: set.reps,
            estimated1RM: e1RM,
            date: session.date,
          });
        }
      });
    });
  });

  return Array.from(prMap.values()).sort((a, b) => b.estimated1RM - a.estimated1RM);
}
