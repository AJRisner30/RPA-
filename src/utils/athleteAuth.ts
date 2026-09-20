import { AthleteProfile, WorkoutSessionLog } from '../types';

export type { AthleteProfile };

const CURRENT_ATHLETE_KEY = 'rpa_current_athlete_id';
const ATHLETES_KEY = 'rpa_athletes_list';
const COACH_AUTH_SESSION_KEY = 'rpa_coach_auth_session';

export const DEFAULT_ATHLETES: AthleteProfile[] = [
  {
    id: 'athlete-default',
    name: 'Tactical Athlete',
    email: '',
    pin: '',
    avatarColor: 'from-emerald-600 to-teal-700',
    joinedDate: 'Jan 2026',
    experienceLevel: 'Intermediate',
    primaryGoal: 'Hybrid Athlete',
    weightLbs: 185,
    restingHr: 54,
    maxHr: 190,
    notes: 'Personal training profile. Customize your metrics in My Stats, log sessions, and track progressive overload.',
  }
];

// Coach private profile - only activated upon explicit PIN authentication, never listed for public selection
export const COACH_PROFILE: AthleteProfile = {
  id: 'athlete-aj-risner',
  name: 'Aryan "AJ" Risner',
  email: 'risneraryan@gmail.com',
  pin: '1234',
  avatarColor: 'from-amber-600 to-amber-800',
  joinedDate: 'Jan 2026',
  experienceLevel: 'Elite',
  primaryGoal: 'Hybrid Athlete',
  weightLbs: 195,
  restingHr: 48,
  maxHr: 192,
  notes: 'Founder & Head Coach. Hybrid strength & conditioning protocol focus.',
};

/**
 * Checks if the current session is explicitly authenticated as Coach AJ
 */
export function isCoachSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(COACH_AUTH_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Returns the sanitized athletes list with Jordan Rivera completely purged,
 * and ensuring Coach Aryan Risner is never exposed in the general list.
 */
export function getAthletes(): AthleteProfile[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(ATHLETES_KEY) : null;
    let list: AthleteProfile[] = DEFAULT_ATHLETES;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }

    // Permanently purge Jordan Rivera or legacy records
    const cleaned = list.filter((a) => {
      if (!a || !a.name) return false;
      const lower = a.name.toLowerCase();
      const emailLower = (a.email || '').toLowerCase();
      if (
        a.id === 'athlete-jordan-r' ||
        lower.includes('jordan rivera') ||
        lower.includes('jordan r') ||
        emailLower.includes('jordan')
      ) {
        return false;
      }
      return true;
    });

    if (cleaned.length === 0) {
      cleaned.push(DEFAULT_ATHLETES[0]);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(ATHLETES_KEY, JSON.stringify(cleaned));
    }

    return cleaned;
  } catch (err) {
    console.error('Failed to load athletes:', err);
    return DEFAULT_ATHLETES;
  }
}

/**
 * Returns only the athletes that anyone using the app is permitted to select from.
 * Coach Aryan's name is strictly filtered out so no user sees his name to select.
 */
export function getSelectableAthletes(): AthleteProfile[] {
  const all = getAthletes();
  return all.filter((a) => {
    if (a.id === 'athlete-aj-risner') return false;
    const lower = (a.name || '').toLowerCase();
    const emailLower = (a.email || '').toLowerCase();
    if (
      lower.includes('aryan') ||
      lower.includes('risner') ||
      emailLower.includes('risneraryan')
    ) {
      return false;
    }
    return true;
  });
}

export function getCurrentAthlete(): AthleteProfile {
  if (typeof window === 'undefined') return DEFAULT_ATHLETES[0];

  const currentId = localStorage.getItem(CURRENT_ATHLETE_KEY);

  // If previous session had Jordan, wipe it immediately
  if (currentId === 'athlete-jordan-r') {
    localStorage.setItem(CURRENT_ATHLETE_KEY, DEFAULT_ATHLETES[0].id);
    return DEFAULT_ATHLETES[0];
  }

  // If currentId is Coach AJ, check if this session was explicitly authenticated with PIN
  if (currentId === 'athlete-aj-risner') {
    if (isCoachSession()) {
      return COACH_PROFILE;
    }
    // Standard visitor: reset to Tactical Athlete so nobody sees Aryan's name selected!
    localStorage.setItem(CURRENT_ATHLETE_KEY, DEFAULT_ATHLETES[0].id);
    return DEFAULT_ATHLETES[0];
  }

  const athletes = getAthletes();
  const found = athletes.find((a) => a.id === currentId);
  if (found) {
    const lower = found.name.toLowerCase();
    if ((lower.includes('aryan') || lower.includes('risner')) && !isCoachSession()) {
      localStorage.setItem(CURRENT_ATHLETE_KEY, DEFAULT_ATHLETES[0].id);
      return DEFAULT_ATHLETES[0];
    }
    return found;
  }

  const defaultAthlete = athletes.find((a) => a.id === 'athlete-default') || athletes[0] || DEFAULT_ATHLETES[0];
  localStorage.setItem(CURRENT_ATHLETE_KEY, defaultAthlete.id);
  return defaultAthlete;
}

export function setCurrentAthlete(athleteId: string): AthleteProfile {
  if (athleteId === 'athlete-aj-risner') {
    if (isCoachSession()) {
      localStorage.setItem(CURRENT_ATHLETE_KEY, COACH_PROFILE.id);
      window.dispatchEvent(new CustomEvent('athlete_changed', { detail: COACH_PROFILE }));
      return COACH_PROFILE;
    }
    return getCurrentAthlete();
  }

  const athletes = getAthletes();
  const found = athletes.find((a) => a.id === athleteId);
  if (found) {
    localStorage.setItem(CURRENT_ATHLETE_KEY, found.id);
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
  
  const avatarGradients = [
    'from-emerald-600 to-teal-700',
    'from-blue-600 to-indigo-700',
    'from-amber-600 to-amber-800',
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
  const query = emailOrName.trim().toLowerCase();

  // Explicit Coach Login via credentials & PIN
  if (
    query === 'risneraryan@gmail.com' ||
    query === 'aryan risner' ||
    query === 'coach aj' ||
    query === 'aj risner'
  ) {
    if (COACH_PROFILE.pin && pin && pin !== COACH_PROFILE.pin) {
      return null;
    }
    try {
      sessionStorage.setItem(COACH_AUTH_SESSION_KEY, 'true');
    } catch {}
    localStorage.setItem(CURRENT_ATHLETE_KEY, COACH_PROFILE.id);
    window.dispatchEvent(new CustomEvent('athlete_changed', { detail: COACH_PROFILE }));
    return COACH_PROFILE;
  }

  const athletes = getAthletes();
  const found = athletes.find(
    (a) => a.email.toLowerCase() === query || a.name.toLowerCase() === query
  );

  if (!found) return null;

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
  if (athleteId === 'athlete-aj-risner') {
    Object.assign(COACH_PROFILE, updates);
    window.dispatchEvent(new CustomEvent('athlete_changed', { detail: COACH_PROFILE }));
    return COACH_PROFILE;
  }

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

export function getAthleteSessionLogs(
  athleteId: string,
  allLogs: WorkoutSessionLog[]
): WorkoutSessionLog[] {
  return allLogs.filter((log) => {
    if (log.athleteId) {
      return log.athleteId === athleteId;
    }
    return athleteId === 'athlete-default' || athleteId === 'athlete-aj-risner';
  });
}
