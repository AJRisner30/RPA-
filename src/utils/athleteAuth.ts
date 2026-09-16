import { AthleteProfile, WorkoutSessionLog } from '../types';

export type { AthleteProfile };

const CURRENT_ATHLETE_KEY = 'rpa_current_athlete_id';
const ATHLETES_KEY = 'rpa_athletes_list';

export const DEFAULT_ATHLETES: AthleteProfile[] = [
  {
    id: 'athlete-aj-risner',
    name: 'Aryan "AJ" Risner',
    email: 'risneraryan@gmail.com',
    pin: '1234',
    avatarColor: 'from-rose-600 to-red-700',
    joinedDate: 'Jan 2026',
    experienceLevel: 'Elite',
    primaryGoal: 'Hybrid Athlete',
    weightLbs: 195,
    restingHr: 48,
    maxHr: 192,
    notes: 'Founder & Head Coach. Hybrid strength & conditioning protocol focus.',
  },
  {
    id: 'athlete-jordan-r',
    name: 'Jordan Rivera',
    email: 'jordan.hybrid@example.com',
    pin: '0000',
    avatarColor: 'from-amber-500 to-orange-600',
    joinedDate: 'Feb 2026',
    experienceLevel: 'Intermediate',
    primaryGoal: 'Tactical & Rucking',
    weightLbs: 178,
    restingHr: 54,
    maxHr: 188,
    notes: 'Aiming for sub-14:30 min/mile heavy ruck and 315 squat.',
  }
];

export function getAthletes(): AthleteProfile[] {
  try {
    const raw = localStorage.getItem(ATHLETES_KEY);
    if (!raw) {
      localStorage.setItem(ATHLETES_KEY, JSON.stringify(DEFAULT_ATHLETES));
      return DEFAULT_ATHLETES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ATHLETES;
  } catch (err) {
    console.error('Failed to load athletes:', err);
    return DEFAULT_ATHLETES;
  }
}

export function getCurrentAthlete(): AthleteProfile {
  const athletes = getAthletes();
  const currentId = localStorage.getItem(CURRENT_ATHLETE_KEY);
  const found = athletes.find((a) => a.id === currentId);
  if (found) return found;

  // Fallback to first athlete (Coach AJ)
  const defaultAthlete = athletes[0] || DEFAULT_ATHLETES[0];
  localStorage.setItem(CURRENT_ATHLETE_KEY, defaultAthlete.id);
  return defaultAthlete;
}

export function setCurrentAthlete(athleteId: string): AthleteProfile {
  const athletes = getAthletes();
  const found = athletes.find((a) => a.id === athleteId);
  if (found) {
    localStorage.setItem(CURRENT_ATHLETE_KEY, found.id);
    // Dispatch custom event for cross-component reactive update
    window.dispatchEvent(new CustomEvent('athlete_changed', { detail: found }));
    return found;
  }
  return getCurrentAthlete();
}

export function registerAthlete(params: {
  name: string;
  email: string;
  pin?: string;
  experienceLevel: AthleteProfile['experienceLevel'];
  primaryGoal: AthleteProfile['primaryGoal'];
  weightLbs?: number;
  restingHr?: number;
}): AthleteProfile {
  const athletes = getAthletes();
  
  // Choose distinct gradient colors for athlete avatars
  const avatarGradients = [
    'from-rose-600 to-red-700',
    'from-emerald-600 to-teal-700',
    'from-blue-600 to-indigo-700',
    'from-amber-500 to-orange-600',
    'from-purple-600 to-pink-700',
    'from-cyan-600 to-blue-700',
  ];
  const colorIndex = athletes.length % avatarGradients.length;

  const newAthlete: AthleteProfile = {
    id: `athlete-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: params.name.trim(),
    email: params.email.trim().toLowerCase(),
    pin: params.pin || '',
    avatarColor: avatarGradients[colorIndex],
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    experienceLevel: params.experienceLevel,
    primaryGoal: params.primaryGoal,
    weightLbs: params.weightLbs || 180,
    restingHr: params.restingHr || 60,
    maxHr: params.restingHr ? 220 - 28 : 190,
  };

  const updated = [...athletes, newAthlete];
  localStorage.setItem(ATHLETES_KEY, JSON.stringify(updated));
  localStorage.setItem(CURRENT_ATHLETE_KEY, newAthlete.id);
  window.dispatchEvent(new CustomEvent('athlete_changed', { detail: newAthlete }));
  return newAthlete;
}

export function loginAthlete(emailOrName: string, pin?: string): AthleteProfile | null {
  const athletes = getAthletes();
  const query = emailOrName.trim().toLowerCase();

  const found = athletes.find(
    (a) => a.email.toLowerCase() === query || a.name.toLowerCase() === query
  );

  if (!found) return null;

  // If athlete has a PIN set and PIN was provided, check it (optional for quick access)
  if (found.pin && pin && found.pin !== pin) {
    return null;
  }

  setCurrentAthlete(found.id);
  return found;
}

export function updateAthleteProfile(
  athleteId: string,
  updates: Partial<AthleteProfile>
): AthleteProfile | null {
  const athletes = getAthletes();
  const index = athletes.findIndex((a) => a.id === athleteId);
  if (index === -1) return null;

  athletes[index] = { ...athletes[index], ...updates };
  localStorage.setItem(ATHLETES_KEY, JSON.stringify(athletes));
  
  const currentId = localStorage.getItem(CURRENT_ATHLETE_KEY);
  if (currentId === athleteId) {
    window.dispatchEvent(new CustomEvent('athlete_changed', { detail: athletes[index] }));
  }
  return athletes[index];
}

/**
 * Filters workout session logs to only include the active athlete's data,
 * or retrofits unassigned legacy logs to the primary athlete.
 */
export function getAthleteSessionLogs(
  athleteId: string,
  allLogs: WorkoutSessionLog[]
): WorkoutSessionLog[] {
  return allLogs.filter((log) => {
    if (log.athleteId) {
      return log.athleteId === athleteId;
    }
    // Legacy logs without athleteId default to coach AJ
    return athleteId === 'athlete-aj-risner';
  });
}
