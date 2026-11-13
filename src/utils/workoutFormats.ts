import { BlockMovementItem, ExerciseTemplate, MuscleGroup, SupersetMovementItem, WorkoutFormat } from '../types';
import { isCircuitExercise, parseCircuitDetails } from './circuitParser';

export interface ParsedSupersetInfo {
  isSuperset: boolean;
  title: string;
  movements: SupersetMovementItem[];
  rounds: number;
  restBetweenRoundsSeconds: number;
  targetRpe: number;
}

export interface ParsedEmomInfo {
  isEmom: boolean;
  title: string;
  totalMinutes: number;
  intervalSeconds: number;
  movements: BlockMovementItem[];
  targetRpe: number;
}

export interface ParsedAmrapInfo {
  isAmrap: boolean;
  isMultiMovementBlock: boolean;
  title: string;
  durationMinutes: number;
  movements: BlockMovementItem[];
  targetRpe: number;
}

export function inferMovementMuscleGroup(name: string, fallback: MuscleGroup = 'Full Body'): MuscleGroup {
  const lower = name.toLowerCase();
  if (lower.includes('squat') || lower.includes('lunge') || lower.includes('step-up') || lower.includes('leg press') || lower.includes('calf') || lower.includes('sled')) {
    return 'Quads';
  }
  if (lower.includes('deadlift') || lower.includes('rdl') || lower.includes('romanian') || lower.includes('hip thrust') || lower.includes('glute') || lower.includes('hamstring') || lower.includes('leg curl') || lower.includes('swing')) {
    return 'Hamstrings & Glutes';
  }
  if (lower.includes('bench') || lower.includes('floor press') || lower.includes('push-up') || lower.includes('pushup') || lower.includes('dip') || lower.includes('fly') || lower.includes('svend') || lower.includes('hex press')) {
    return 'Chest';
  }
  if (lower.includes('pull-up') || lower.includes('pullup') || lower.includes('chin-up') || lower.includes('row') || lower.includes('pulldown') || lower.includes('face pull')) {
    return 'Back';
  }
  if (lower.includes('overhead') || lower.includes('ohp') || lower.includes('military') || lower.includes('push press') || lower.includes('lateral raise') || lower.includes('shoulder') || lower.includes('arnold')) {
    return 'Shoulders';
  }
  if (lower.includes('curl') || lower.includes('tricep') || lower.includes('skull') || lower.includes('jm press') || lower.includes('pushdown')) {
    return 'Arms';
  }
  if (lower.includes('plank') || lower.includes('pallof') || lower.includes('hollow') || lower.includes('sit-up') || lower.includes('leg raise') || lower.includes('knee raise') || lower.includes('twist') || lower.includes('rollout')) {
    return 'Core';
  }
  return fallback;
}

/**
 * Splits a raw superset title/string into paired movement names.
 */
function splitSupersetMovementNames(rawTitle: string): string[] {
  let cleaned = rawTitle
    .replace(/\[.*?\]/g, '')
    .replace(/\(\s*\d+\s*x\s*[\w\-+]+\s*\)/gi, '')
    .replace(/\(\s*superset\s*\)/gi, '')
    .replace(/\bsuperset\b\s*:?\s*/gi, '')
    .replace(/\bgiant\s*set\b\s*:?\s*/gi, '')
    .trim();

  // Handle "A1: Squat / A2: RDL" or "A1 Squat + A2 RDL"
  if (/\b[a-z]1[:.\s-]/i.test(cleaned) && /\b[a-z]2[:.\s-]/i.test(cleaned)) {
    const parts = cleaned
      .split(/(?=\b[a-z][1-4][:. \t-])/i)
      .map((s) => s.replace(/^\b[a-z][1-4][:. \t-]+/i, '').replace(/[/+|]+$/, '').trim())
      .filter((s) => s.length > 2);
    if (parts.length >= 2) return parts;
  }

  // Handle "X Superset with Y" or "X paired with Y"
  if (/\b(?:with|paired with)\b/i.test(cleaned)) {
    const parts = cleaned
      .split(/\b(?:with|paired with)\b/i)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);
    if (parts.length >= 2) return parts;
  }

  // Handle separators: "+", "/", " & ", " -> ", ","
  const sepParts = cleaned
    .split(/\s*(?:\+|\/|->|&|,)\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
  if (sepParts.length >= 2) return sepParts;

  return [];
}

/**
 * Checks whether an exercise represents a Superset (paired/grouped movements).
 * Carefully avoids false positives on single compound names like "Clean & Push Press".
 */
export function isSupersetExercise(ex: Partial<ExerciseTemplate> | null | undefined): boolean {
  if (!ex) return false;
  if (ex.format === 'superset' || ex.type === 'superset') return true;
  if (Array.isArray(ex.supersetExercises) && ex.supersetExercises.length >= 2) return true;

  const nameLower = (ex.name || '').toLowerCase();
  const notesLower = (ex.notes || '').toLowerCase();

  if (
    nameLower.includes('superset') ||
    nameLower.includes('giant set') ||
    notesLower.includes('superset') ||
    (/\b[a-z]1[:.\s-]/i.test(ex.name || '') && /\b[a-z]2[:.\s-]/i.test(ex.name || ''))
  ) {
    return true;
  }
  return false;
}

export function parseSupersetDetails(ex: Partial<ExerciseTemplate>): ParsedSupersetInfo {
  const defaultSets = Math.max(1, ex.defaultSets || 3);
  const restBetweenRoundsSeconds = ex.restPeriodSeconds ?? 75;
  const targetRpe = ex.targetRpe ?? 8;
  const fallbackReps = ex.targetReps || '10-12';

  if (Array.isArray(ex.supersetExercises) && ex.supersetExercises.length >= 2) {
    return {
      isSuperset: true,
      title: ex.name || ex.supersetExercises.map((m) => m.name).join(' + '),
      movements: ex.supersetExercises.map((m) => ({
        ...m,
        targetReps: m.targetReps || fallbackReps,
        muscleGroup: m.muscleGroup || inferMovementMuscleGroup(m.name, ex.muscleGroup || 'Full Body'),
      })),
      rounds: defaultSets,
      restBetweenRoundsSeconds,
      targetRpe,
    };
  }

  const partsFromName = splitSupersetMovementNames(ex.name || '');
  let movements: SupersetMovementItem[] = [];

  if (partsFromName.length >= 2) {
    const repsParts = (ex.targetReps || '').split(/\s*(?:\/|\+|&)\s*/).filter(Boolean);
    movements = partsFromName.map((partName, idx) => ({
      name: partName,
      targetReps: repsParts.length === partsFromName.length ? repsParts[idx] : fallbackReps,
      muscleGroup: inferMovementMuscleGroup(partName, ex.muscleGroup || 'Full Body'),
      weight_lbs: ex.weight_lbs,
    }));
  } else if (ex.notes && /superset\s*(?:with|:)\s*([^.;\n]+)/i.test(ex.notes)) {
    const m = ex.notes.match(/superset\s*(?:with|:)\s*([^.;\n]+)/i);
    const partnerName = m?.[1]?.trim();
    const baseName = (ex.name || 'Primary Lift').replace(/\bsuperset\b/gi, '').trim();
    if (partnerName) {
      movements = [
        {
          name: baseName,
          targetReps: fallbackReps,
          muscleGroup: inferMovementMuscleGroup(baseName, ex.muscleGroup || 'Full Body'),
          weight_lbs: ex.weight_lbs,
        },
        {
          name: partnerName,
          targetReps: fallbackReps,
          muscleGroup: inferMovementMuscleGroup(partnerName, ex.muscleGroup || 'Full Body'),
        },
      ];
    }
  }

  if (movements.length < 2 && isSupersetExercise(ex)) {
    const baseName = (ex.name || 'Exercise A').replace(/\bsuperset\b/gi, '').trim();
    movements = [
      {
        name: `${baseName} (Part A)`,
        targetReps: fallbackReps,
        muscleGroup: ex.muscleGroup || 'Full Body',
        weight_lbs: ex.weight_lbs,
      },
      {
        name: 'Paired Movement (Part B)',
        targetReps: fallbackReps,
        muscleGroup: ex.muscleGroup || 'Full Body',
      },
    ];
  }

  return {
    isSuperset: movements.length >= 2,
    title: ex.name || movements.map((m) => m.name).join(' + '),
    movements,
    rounds: defaultSets,
    restBetweenRoundsSeconds,
    targetRpe,
  };
}

export function isEmomExercise(ex: Partial<ExerciseTemplate> | null | undefined): boolean {
  if (!ex) return false;
  if (ex.format === 'emom' || ex.type === 'emom') return true;
  if (ex.emomMinutes && ex.emomMinutes > 0) return true;
  const combined = `${ex.name || ''} ${ex.targetReps || ''} ${ex.notes || ''}`;
  return /\b(?:EMOM|E2MOM|Every Minute)\b/i.test(combined);
}

export function parseEmomDetails(ex: Partial<ExerciseTemplate>): ParsedEmomInfo {
  const combined = `${ex.name || ''} ${ex.targetReps || ''} ${ex.notes || ''}`;
  const minMatch = combined.match(/(\d+)\s*(?:-|\s)?min/i);
  const totalMinutes = ex.emomMinutes || (minMatch ? parseInt(minMatch[1], 10) : Math.max(8, (ex.defaultSets || 10)));
  const isE2mom = /\bE2MOM\b|every\s*2\s*min/i.test(combined);
  const intervalSeconds = ex.emomIntervalSeconds || (isE2mom ? 120 : 60);

  let movements: BlockMovementItem[] = Array.isArray(ex.emomMovements) ? ex.emomMovements : [];
  if (movements.length === 0 && ex.notes && ex.notes.includes(':')) {
    const afterColon = ex.notes.substring(ex.notes.indexOf(':') + 1).split('.')[0];
    const parts = afterColon.split(/[,&+]/).map((s) => s.trim()).filter((s) => s.length > 2);
    movements = parts.map((p) => ({
      name: p,
      targetReps: ex.targetReps || 'Per Minute',
      muscleGroup: inferMovementMuscleGroup(p, ex.muscleGroup || 'Full Body'),
    }));
  }
  if (movements.length === 0) {
    movements = [
      {
        name: ex.name || 'EMOM Task',
        targetReps: ex.targetReps || 'Prescribed Reps',
        muscleGroup: ex.muscleGroup || 'Full Body',
      },
    ];
  }

  return {
    isEmom: isEmomExercise(ex),
    title: ex.name || `${totalMinutes}-Min EMOM`,
    totalMinutes,
    intervalSeconds,
    movements,
    targetRpe: ex.targetRpe ?? 8,
  };
}

export function isAmrapExercise(ex: Partial<ExerciseTemplate> | null | undefined): boolean {
  if (!ex) return false;
  if (ex.format === 'amrap' || ex.type === 'amrap') return true;
  if (ex.amrapDurationMinutes && ex.amrapDurationMinutes > 0) return true;
  const combined = `${ex.name || ''} ${ex.targetReps || ''}`;
  return /\bAMRAP\b/i.test(combined);
}

export function parseAmrapDetails(ex: Partial<ExerciseTemplate>): ParsedAmrapInfo {
  const combined = `${ex.name || ''} ${ex.targetReps || ''} ${ex.notes || ''}`;
  const minMatch = combined.match(/(\d+)\s*(?:-|\s)?min/i);
  const durationMinutes = ex.amrapDurationMinutes || (minMatch ? parseInt(minMatch[1], 10) : 12);

  let movements: BlockMovementItem[] = Array.isArray(ex.amrapMovements) ? ex.amrapMovements : [];
  if (movements.length === 0 && ex.notes && ex.notes.includes(':')) {
    const afterColon = ex.notes.substring(ex.notes.indexOf(':') + 1).split('.')[0];
    const parts = afterColon.split(/[,&+]/).map((s) => s.trim()).filter((s) => s.length > 2);
    if (parts.length >= 2) {
      movements = parts.map((p) => ({
        name: p,
        targetReps: 'Per Round',
        muscleGroup: inferMovementMuscleGroup(p, ex.muscleGroup || 'Full Body'),
      }));
    }
  }

  const isMultiMovementBlock =
    ex.format === 'amrap' ||
    ex.type === 'amrap' ||
    Boolean(ex.amrapDurationMinutes && ex.amrapDurationMinutes > 0) ||
    movements.length >= 2 ||
    /\d+\s*-?\s*min\s*amrap/i.test(combined);

  if (movements.length === 0) {
    movements = [
      {
        name: ex.name || 'AMRAP Movement',
        targetReps: ex.targetReps || 'Max Reps',
        muscleGroup: ex.muscleGroup || 'Full Body',
      },
    ];
  }

  return {
    isAmrap: isAmrapExercise(ex),
    isMultiMovementBlock,
    title: ex.name || `${durationMinutes}-Min AMRAP`,
    durationMinutes,
    movements,
    targetRpe: ex.targetRpe ?? 8.5,
  };
}

/**
 * Determines the primary workout logging format for an exercise template.
 */
export function getExerciseFormat(ex: Partial<ExerciseTemplate> | null | undefined): WorkoutFormat {
  if (!ex) return 'straight';
  if (ex.format) return ex.format;
  if (isSupersetExercise(ex)) return 'superset';
  if (isEmomExercise(ex)) return 'emom';
  const amrap = parseAmrapDetails(ex);
  if (amrap.isAmrap && amrap.isMultiMovementBlock) return 'amrap';
  if (isCircuitExercise(ex)) return 'circuit';
  return 'straight';
}

export function getFormatLabel(format: WorkoutFormat): string {
  switch (format) {
    case 'superset':
      return 'Superset';
    case 'emom':
      return 'EMOM';
    case 'amrap':
      return 'AMRAP';
    case 'circuit':
      return 'Circuit';
    default:
      return 'Straight Sets';
  }
}

export { parseCircuitDetails, isCircuitExercise };
