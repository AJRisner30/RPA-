import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { AthleteProfile, WorkoutSessionLog } from '../types';

/**
 * Recursively strips undefined values from an object or array.
 * Firestore strictly rejects documents containing 'undefined' with:
 * "Function setDoc() called with invalid data. Unsupported field value: undefined"
 */
export function sanitizeForFirestore<T>(val: T): T {
  if (val === null || val === undefined) {
    return null as any;
  }
  if (Array.isArray(val)) {
    return val
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as any;
  }
  if (typeof val === 'object' && !(val instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, v] of Object.entries(val)) {
      if (v !== undefined) {
        cleaned[key] = sanitizeForFirestore(v);
      }
    }
    return cleaned as T;
  }
  return val;
}

/**
 * Subscribes to real-time workout logs for the authenticated user from Firestore
 */
export function subscribeToUserWorkoutLogs(
  userId: string,
  onLogs: (logs: WorkoutSessionLog[]) => void
): Unsubscribe {
  const path = 'workoutLogs';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', userId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const logs: WorkoutSessionLog[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          logs.push({
            id: docSnap.id,
            userId: data.userId,
            athleteId: data.athleteId || data.userId,
            programId: data.programId,
            workoutTitle: data.workoutTitle || 'Workout Session',
            date: data.date,
            startTime: data.startTime || '',
            endTime: data.endTime || '',
            durationMinutes: data.durationMinutes || 0,
            totalVolumeLbs: data.totalVolumeLbs || 0,
            totalSetsCompleted: data.totalSetsCompleted || 0,
            rating: data.rating,
            notes: data.notes || '',
            exercises: data.exercises || [],
          } as WorkoutSessionLog);
        });

        // Sort descending by date and startTime
        logs.sort((a, b) => (b.date + (b.startTime || '')).localeCompare(a.date + (a.startTime || '')));
        onLogs(logs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Persists a workout session log to Firestore
 */
export async function saveWorkoutLogToFirestore(
  log: WorkoutSessionLog,
  userId: string
): Promise<void> {
  const path = `workoutLogs/${log.id}`;
  try {
    const cleanLog = {
      id: log.id,
      userId,
      athleteId: log.athleteId || userId,
      programId: log.programId || '',
      workoutTitle: log.workoutTitle.slice(0, 150),
      date: log.date,
      startTime: (log.startTime || '').slice(0, 50),
      endTime: (log.endTime || '').slice(0, 50),
      durationMinutes: Math.max(0, Math.min(1440, log.durationMinutes || 0)),
      totalVolumeLbs: Math.max(0, Math.min(2000000, log.totalVolumeLbs || 0)),
      totalSetsCompleted: Math.max(0, Math.min(300, log.totalSetsCompleted || 0)),
      rating: log.rating ? Math.max(1, Math.min(5, log.rating)) : 5,
      notes: (log.notes || '').slice(0, 1000),
      exercises: log.exercises || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sanitizedLog = sanitizeForFirestore(cleanLog);
    await setDoc(doc(db, 'workoutLogs', log.id), sanitizedLog);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a workout session log from Firestore
 */
export async function deleteWorkoutLogFromFirestore(logId: string): Promise<void> {
  const path = `workoutLogs/${logId}`;
  try {
    await deleteDoc(doc(db, 'workoutLogs', logId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribes to real-time athlete profile updates for the user
 */
export function subscribeToUserAthlete(
  userId: string,
  onAthlete: (athlete: AthleteProfile | null) => void
): Unsubscribe {
  const path = `athletes/${userId}`;
  try {
    const docRef = doc(db, 'athletes', userId);
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          onAthlete({
            id: docSnap.id,
            name: data.name || 'Tactical Athlete',
            email: data.email || '',
            avatarColor: data.avatarColor || 'from-blue-600 to-indigo-700',
            joinedDate: data.joinedDate || 'Jan 2026',
            experienceLevel: data.experienceLevel || 'Intermediate',
            primaryGoal: data.primaryGoal || 'Hybrid Athlete',
            weightLbs: data.weightLbs || 185,
            restingHr: data.restingHr || 55,
            maxHr: data.maxHr || 190,
            notes: data.notes || '',
            questionnaire: data.questionnaire || undefined,
            weightHistory: data.weightHistory || [],
            recoveryHistory: data.recoveryHistory || [],
            lastRecoveryCheckIn: data.lastRecoveryCheckIn || undefined,
          });
        } else {
          onAthlete(null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Saves or updates athlete profile in Firestore
 */
export async function saveAthleteToFirestore(
  athlete: AthleteProfile,
  userId: string
): Promise<void> {
  const path = `athletes/${userId}`;
  try {
    const cleanAthlete: any = {
      id: userId,
      userId,
      name: athlete.name.slice(0, 100),
      email: (athlete.email || '').slice(0, 150),
      avatarColor: (athlete.avatarColor || 'from-blue-600 to-indigo-700').slice(0, 80),
      joinedDate: (athlete.joinedDate || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })).slice(0, 40),
      experienceLevel: athlete.experienceLevel || 'Intermediate',
      primaryGoal: athlete.primaryGoal || 'Hybrid Athlete',
      weightLbs: athlete.weightLbs || 185,
      restingHr: athlete.restingHr || 55,
      maxHr: athlete.maxHr || 190,
      notes: (athlete.notes || '').slice(0, 1000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (athlete.questionnaire) {
      cleanAthlete.questionnaire = athlete.questionnaire;
    }
    if (athlete.weightHistory && athlete.weightHistory.length > 0) {
      cleanAthlete.weightHistory = athlete.weightHistory.slice(0, 60);
    }
    if (athlete.recoveryHistory && athlete.recoveryHistory.length > 0) {
      cleanAthlete.recoveryHistory = athlete.recoveryHistory.slice(0, 60);
    }
    if (athlete.lastRecoveryCheckIn) {
      cleanAthlete.lastRecoveryCheckIn = athlete.lastRecoveryCheckIn;
    }

    const sanitizedAthlete = sanitizeForFirestore(cleanAthlete);
    await setDoc(doc(db, 'athletes', userId), sanitizedAthlete);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

