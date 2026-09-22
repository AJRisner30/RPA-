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
import { AthleteProfile, WorkoutSessionLog, RuckSessionLog } from '../types';

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

    await setDoc(doc(db, 'workoutLogs', log.id), cleanLog);
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
            avatarColor: data.avatarColor || 'from-amber-500 to-orange-600',
            joinedDate: data.joinedDate || 'Jan 2026',
            experienceLevel: data.experienceLevel || 'Intermediate',
            primaryGoal: data.primaryGoal || 'Hybrid Athlete',
            weightLbs: data.weightLbs || 185,
            restingHr: data.restingHr || 55,
            maxHr: data.maxHr || 190,
            notes: data.notes || '',
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
    const cleanAthlete = {
      id: userId,
      userId,
      name: athlete.name.slice(0, 100),
      email: (athlete.email || '').slice(0, 150),
      avatarColor: (athlete.avatarColor || 'from-amber-500 to-orange-600').slice(0, 80),
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

    await setDoc(doc(db, 'athletes', userId), cleanAthlete);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribes to real-time rucking logs for the authenticated user from Firestore
 */
export function subscribeToUserRuckLogs(
  userId: string,
  onRuckLogs: (logs: RuckSessionLog[]) => void
): Unsubscribe {
  const path = 'ruckLogs';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', userId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const logs: RuckSessionLog[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          logs.push({
            id: docSnap.id,
            userId: data.userId,
            athleteId: data.athleteId || data.userId,
            title: data.title || 'Ruck Session',
            date: data.date,
            distanceMiles: data.distanceMiles || 0,
            weightLbs: data.weightLbs || 0,
            durationMinutes: data.durationMinutes || 0,
            paceMinPerMile: data.paceMinPerMile || (data.durationMinutes && data.distanceMiles ? data.durationMinutes / data.distanceMiles : 0),
            workloadIndex: data.workloadIndex || (data.distanceMiles * data.weightLbs),
            terrain: data.terrain || 'Pavement / Road',
            heartRateAvg: data.heartRateAvg,
            rpe: data.rpe,
            notes: data.notes || '',
            createdAt: data.createdAt || new Date().toISOString(),
          } as RuckSessionLog);
        });

        // Sort descending by date
        logs.sort((a, b) => b.date.localeCompare(a.date));
        onRuckLogs(logs);
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
 * Persists a rucking session log to Firestore
 */
export async function saveRuckLogToFirestore(
  log: RuckSessionLog,
  userId: string
): Promise<void> {
  const path = `ruckLogs/${log.id}`;
  try {
    const workloadIndex = Math.round((log.workloadIndex ?? (log.distanceMiles * log.weightLbs)) * 10) / 10;
    const paceMinPerMile = Math.round((log.paceMinPerMile ?? (log.durationMinutes / (log.distanceMiles || 1))) * 100) / 100;

    const cleanLog = {
      id: log.id,
      userId,
      athleteId: log.athleteId || userId,
      title: (log.title || 'Ruck Session').slice(0, 150),
      date: log.date,
      distanceMiles: Math.max(0, Math.min(100, log.distanceMiles || 0)),
      weightLbs: Math.max(0, Math.min(300, log.weightLbs || 0)),
      durationMinutes: Math.max(0, Math.min(1440, log.durationMinutes || 0)),
      paceMinPerMile: Math.max(0, Math.min(120, paceMinPerMile)),
      workloadIndex: Math.max(0, Math.min(30000, workloadIndex)),
      terrain: (log.terrain || 'Pavement / Road').slice(0, 60),
      heartRateAvg: log.heartRateAvg ? Math.max(30, Math.min(250, log.heartRateAvg)) : 0,
      rpe: log.rpe ? Math.max(1, Math.min(10, log.rpe)) : 7,
      notes: (log.notes || '').slice(0, 1000),
      createdAt: log.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'ruckLogs', log.id), cleanLog);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a rucking session log from Firestore
 */
export async function deleteRuckLogFromFirestore(ruckId: string): Promise<void> {
  const path = `ruckLogs/${ruckId}`;
  try {
    await deleteDoc(doc(db, 'ruckLogs', ruckId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

