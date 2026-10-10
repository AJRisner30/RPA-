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
import { AthleteProfile, WorkoutSessionLog, OfficerAssignedProgram } from '../types';

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

/**
 * Subscribes in real-time to the individual officer program uploaded specifically for this officer.
 * Ensures an officer sees ONLY their own program, and no other officer's data.
 */
export function subscribeToOfficerProgram(
  officerUserId: string,
  onProgram: (program: OfficerAssignedProgram | null) => void
): Unsubscribe {
  const path = 'officerPrograms';
  try {
    const q = query(
      collection(db, path),
      where('officerUserId', '==', officerUserId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          // Take the latest assigned program for this officer
          const docs = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              officerUserId: data.officerUserId,
              officerEmail: data.officerEmail || '',
              officerName: data.officerName || '',
              badgeNumber: data.badgeNumber || '',
              department: data.department || '',
              programTitle: data.programTitle || 'Individualized Duty Program',
              programSubtitle: data.programSubtitle || '',
              category: data.category || 'Tactical & Rucking',
              coachNotes: data.coachNotes || '',
              frequency: data.frequency || '4-5 Days / Week',
              estimatedDurationMinutes: data.estimatedDurationMinutes || 60,
              scheduleDays: data.scheduleDays || [],
              exercises: data.exercises || [],
              assignedByEmail: data.assignedByEmail || 'risnerathletics@gmail.com',
              assignedAt: data.assignedAt || '',
              createdAt: data.createdAt || '',
              updatedAt: data.updatedAt || '',
            } as OfficerAssignedProgram;
          });

          // Sort by assignedAt / createdAt descending
          docs.sort((a, b) => (b.assignedAt || b.createdAt || '').localeCompare(a.assignedAt || a.createdAt || ''));
          onProgram(docs[0]);
        } else {
          onProgram(null);
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
 * Subscribes to all assigned officer programs (for Coach AJ / Admin portal view)
 */
export function subscribeToAllOfficerPrograms(
  onPrograms: (programs: OfficerAssignedProgram[]) => void
): Unsubscribe {
  const path = 'officerPrograms';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: OfficerAssignedProgram[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            officerUserId: data.officerUserId,
            officerEmail: data.officerEmail || '',
            officerName: data.officerName || '',
            badgeNumber: data.badgeNumber || '',
            department: data.department || '',
            programTitle: data.programTitle || 'Assigned Duty Program',
            programSubtitle: data.programSubtitle || '',
            category: data.category || 'Tactical & Rucking',
            coachNotes: data.coachNotes || '',
            frequency: data.frequency || '',
            estimatedDurationMinutes: data.estimatedDurationMinutes || 60,
            scheduleDays: data.scheduleDays || [],
            exercises: data.exercises || [],
            assignedByEmail: data.assignedByEmail || '',
            assignedAt: data.assignedAt || '',
            createdAt: data.createdAt || '',
            updatedAt: data.updatedAt || '',
          } as OfficerAssignedProgram);
        });

        list.sort((a, b) => (b.assignedAt || b.createdAt || '').localeCompare(a.assignedAt || a.createdAt || ''));
        onPrograms(list);
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
 * Subscribes to all registered athletes across the department (for Coach AJ / Admin to select an officer)
 */
export function subscribeToAllAthletes(
  onAthletes: (athletes: AthleteProfile[]) => void
): Unsubscribe {
  const path = 'athletes';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: AthleteProfile[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            name: data.name || 'Officer',
            email: data.email || '',
            avatarColor: data.avatarColor || 'from-blue-600 to-indigo-700',
            joinedDate: data.joinedDate || '',
            experienceLevel: data.experienceLevel || 'Intermediate',
            primaryGoal: data.primaryGoal || 'Tactical Conditioning & Pursuit',
            weightLbs: data.weightLbs || 185,
            restingHr: data.restingHr || 55,
            maxHr: data.maxHr || 190,
            notes: data.notes || '',
            questionnaire: data.questionnaire,
            weightHistory: data.weightHistory || [],
            recoveryHistory: data.recoveryHistory || [],
            lastRecoveryCheckIn: data.lastRecoveryCheckIn,
          });
        });
        onAthletes(list);
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
 * Uploads/saves an individualized officer program to Firestore specifically for that officer
 */
export async function saveOfficerProgramToFirestore(
  program: OfficerAssignedProgram
): Promise<void> {
  const path = `officerPrograms/${program.id}`;
  try {
    const cleanProgram: any = {
      id: program.id,
      officerUserId: program.officerUserId,
      officerEmail: (program.officerEmail || '').slice(0, 150),
      officerName: (program.officerName || '').slice(0, 100),
      badgeNumber: (program.badgeNumber || '').slice(0, 40),
      department: (program.department || '').slice(0, 120),
      programTitle: program.programTitle.slice(0, 150),
      programSubtitle: (program.programSubtitle || '').slice(0, 250),
      category: program.category || 'Tactical & Rucking',
      coachNotes: (program.coachNotes || '').slice(0, 3000),
      frequency: (program.frequency || '4 Days / Week').slice(0, 80),
      estimatedDurationMinutes: Math.max(0, Math.min(360, program.estimatedDurationMinutes || 60)),
      scheduleDays: program.scheduleDays || [],
      exercises: program.exercises || [],
      assignedByEmail: (program.assignedByEmail || 'risnerathletics@gmail.com').slice(0, 150),
      assignedAt: program.assignedAt || new Date().toISOString(),
      createdAt: program.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sanitized = sanitizeForFirestore(cleanProgram);
    await setDoc(doc(db, 'officerPrograms', program.id), sanitized);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes an officer's assigned program from Firestore
 */
export async function deleteOfficerProgramFromFirestore(programId: string): Promise<void> {
  const path = `officerPrograms/${programId}`;
  try {
    await deleteDoc(doc(db, 'officerPrograms', programId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}


