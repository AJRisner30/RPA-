import { ExerciseTemplate } from '../types';

export interface CircuitStation {
  number: number;
  name: string;
  detail?: string;
}

export interface CircuitInfo {
  isCircuit: boolean;
  circuitName: string;
  rounds: number;
  workRestScheme?: string;
  restBetweenRoundsSeconds: number;
  targetRpe: number;
  stations: CircuitStation[];
  notes?: string;
  executionCue: string;
}

/**
 * Checks whether an exercise is a circuit or conditioning circuit finisher.
 */
export function isCircuitExercise(ex: any): boolean {
  if (!ex) return false;
  if (ex.type === 'circuit') return true;
  const nameLower = (ex.name || '').toLowerCase();
  const notesLower = (ex.notes || '').toLowerCase();
  
  if (nameLower.includes('circuit') || nameLower.includes('hiit station') || nameLower.includes('metabolic finisher')) {
    return true;
  }
  if (notesLower.includes('circuit:') || notesLower.includes('circuit stations:') || notesLower.includes('stations:')) {
    return true;
  }
  return false;
}

/**
 * Parses an exercise into rich circuit details for clear tactical visualization.
 */
export function parseCircuitDetails(ex: any): CircuitInfo {
  const name = ex.name || 'Tactical Conditioning Circuit';
  const notes = ex.notes || '';
  const reps = ex.targetReps || '';
  const nameLower = name.toLowerCase();
  const notesLower = notes.toLowerCase();

  // Determine number of rounds
  let rounds = ex.defaultSets || 3;
  const roundsMatch = (reps + ' ' + name + ' ' + notes).match(/(\d+)\s*rounds?/i);
  if (roundsMatch && roundsMatch[1]) {
    const parsedRounds = parseInt(roundsMatch[1], 10);
    if (!isNaN(parsedRounds) && parsedRounds > 0) {
      rounds = parsedRounds;
    }
  }

  // Work / Rest interval scheme
  let workRestScheme = 'Continuous Stations';
  const wrMatch = (reps + ' ' + notes).match(/(\d+\s*s?\s*(?:work|on)\s*[/&,]\s*\d+\s*s?\s*(?:rest|off))/i);
  if (wrMatch && wrMatch[1]) {
    workRestScheme = wrMatch[1];
  } else if (/40s\/20s|40\/20/i.test(reps + ' ' + notes)) {
    workRestScheme = '40s Work / 20s Rest';
  } else if (/45s\/15s|45\/15/i.test(reps + ' ' + notes)) {
    workRestScheme = '45s Work / 15s Rest';
  } else if (/30s\/30s|30\/30/i.test(reps + ' ' + notes)) {
    workRestScheme = '30s Work / 30s Rest';
  } else if (reps && !reps.toLowerCase().includes('round')) {
    workRestScheme = reps;
  }

  // Rest between rounds
  const restBetweenRoundsSeconds = ex.restPeriodSeconds || 60;
  const targetRpe = ex.targetRpe || 8;

  // Parse stations
  let stations: CircuitStation[] = [];

  // Check if explicit circuit_stations or circuitStations array exists
  if (Array.isArray(ex.circuit_stations) && ex.circuit_stations.length > 0) {
    stations = ex.circuit_stations.map((st: string, idx: number) => ({
      number: idx + 1,
      name: st.trim(),
    }));
  } else if (Array.isArray(ex.circuitStations) && ex.circuitStations.length > 0) {
    stations = ex.circuitStations.map((st: string, idx: number) => ({
      number: idx + 1,
      name: st.trim(),
    }));
  }

  // Look for "Station 1: ..., Station 2: ..." or "1. ..., 2. ..."
  if (stations.length === 0) {
    const stationRegex = /(?:station\s*\d+\s*[:\-]|(?:\b\d+\s*[\.\)]))\s*([^,;:\n]+(?:\([^\)]+\))?)/gi;
    const matches = [...notes.matchAll(stationRegex)];
    if (matches.length >= 2) {
      stations = matches.map((m, idx) => {
        const raw = m[1].trim();
        return {
          number: idx + 1,
          name: raw,
        };
      });
    }
  }

  // Look for colon list in notes (e.g. "High-density metabolic conditioning circuit: Swings, Sprawls, Mountain Climbers, and Farmer Marches.")
  if (stations.length === 0 && notes.includes(':')) {
    const afterColon = notes.substring(notes.indexOf(':') + 1).split(/\.|\n/)[0];
    if (afterColon) {
      const parts = afterColon
        .split(/,|\band\b|&/gi)
        .map(s => s.trim().replace(/^and\s+/i, ''))
        .filter(s => s.length > 2 && !/rounds?|rest|recover/i.test(s));

      if (parts.length >= 2) {
        stations = parts.map((part, idx) => ({
          number: idx + 1,
          name: part.charAt(0).toUpperCase() + part.slice(1),
        }));
      }
    }
  }

  // Look for parenthetical list in name e.g. "Tactical Pursuit Circuit (Burpees, Swings & Core)"
  if (stations.length === 0) {
    const parenMatch = name.match(/\(([^)]+)\)/);
    if (parenMatch && parenMatch[1] && (parenMatch[1].includes(',') || parenMatch[1].includes('&'))) {
      const parts = parenMatch[1]
        .split(/,|\band\b|&/gi)
        .map(s => s.trim())
        .filter(s => s.length > 2 && !/rounds?|sets?/i.test(s));

      if (parts.length >= 2) {
        stations = parts.map((part, idx) => ({
          number: idx + 1,
          name: part.charAt(0).toUpperCase() + part.slice(1),
        }));
      }
    }
  }

  // Fallback default tactical stations if none parsed but is a circuit
  if (stations.length === 0) {
    if (notesLower.includes('kettlebell') || nameLower.includes('kettlebell')) {
      stations = [
        { number: 1, name: 'Kettlebell Power Swings (40s)' },
        { number: 2, name: 'Goblet Squats or Lunges (40s)' },
        { number: 3, name: 'Push-up to Renegade Row (40s)' },
        { number: 4, name: 'Plank Knee Drives / Mountain Climbers (40s)' },
      ];
    } else if (notesLower.includes('burpee') || nameLower.includes('pursuit')) {
      stations = [
        { number: 1, name: 'Combat Sprawls / Burpees (40s)' },
        { number: 2, name: 'Kettlebell or DB Swings (40s)' },
        { number: 3, name: 'Speed Mountain Climbers (40s)' },
        { number: 4, name: 'Tactical Farmer Carry / High Knees (40s)' },
      ];
    } else {
      stations = [
        { number: 1, name: 'Explosive Swings or DB Snatches (40s)' },
        { number: 2, name: 'Duty Push-ups / Hand-Release Push-ups (40s)' },
        { number: 3, name: 'Jump Squats or Step-back Lunges (40s)' },
        { number: 4, name: 'Hollow Body Hold or Anti-Rotation Plank (40s)' },
      ];
    }
  }

  return {
    isCircuit: true,
    circuitName: name,
    rounds,
    workRestScheme,
    restBetweenRoundsSeconds,
    targetRpe,
    stations,
    notes,
    executionCue: 'Move continuously from Station 1 through the final station. Complete prescribed work/reps at each station, then take round recovery before repeating.',
  };
}
