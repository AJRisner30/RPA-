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
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { AthleteProfile, WorkoutSessionLog, OfficerAssignedProgram, WorkoutProgram } from '../types';
import { COACH_AJ_DEFAULT_LOGS } from '../data/coachLogsData';

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
 * Persists a workout session log to Firestore with Coach AJ verification stamping
 */
export async function saveWorkoutLogToFirestore(
  log: WorkoutSessionLog,
  userId: string,
  userEmail?: string
): Promise<void> {
  const cleanId = (log.id && typeof log.id === 'string' && log.id.trim().length > 0)
    ? log.id.trim()
    : `log-${Date.now()}`;
  const path = `workoutLogs/${cleanId}`;

  try {
    const currentAuthEmail = (auth.currentUser?.email || userEmail || '').trim().toLowerCase();
    const isCoachUser = Boolean(currentAuthEmail === 'risneraryan@gmail.com');

    // Date normalization: Ensure strict YYYY-MM-DD format
    const rawDate = typeof log.date === 'string' && log.date.trim().length > 0
      ? log.date.trim()
      : new Date().toISOString().split('T')[0];
    const normalizedDate = rawDate.includes('T')
      ? rawDate.split('T')[0]
      : (rawDate.match(/^\d{4}-\d{2}-\d{2}$/) ? rawDate : new Date().toISOString().split('T')[0]);

    const workoutTitle = (typeof log.workoutTitle === 'string' && log.workoutTitle.trim().length > 0
      ? log.workoutTitle.trim()
      : 'Duty Workout Session'
    ).slice(0, 150);

    const cleanLog = {
      id: cleanId,
      userId,
      athleteId: isCoachUser
        ? 'athlete-aj-risner'
        : ((typeof log.athleteId === 'string' && log.athleteId.trim().length > 0 && log.athleteId !== 'athlete-aj-risner')
            ? log.athleteId.trim().slice(0, 128)
            : userId),
      athleteName: isCoachUser
        ? 'Aryan "AJ" Risner'
        : ((typeof log.athleteName === 'string' && log.athleteName.trim().length > 0 && log.athleteName !== 'Aryan "AJ" Risner')
            ? log.athleteName.trim().slice(0, 100)
            : 'Tactical Athlete'),
      userEmail: isCoachUser
        ? 'risneraryan@gmail.com'
        : (currentAuthEmail || (typeof log.userEmail === 'string' && log.userEmail.toLowerCase() !== 'risneraryan@gmail.com' ? log.userEmail : '')),
      isCoachLog: isCoachUser,
      programId: typeof log.programId === 'string' ? log.programId.slice(0, 128) : '',
      workoutTitle,
      date: normalizedDate,
      startTime: typeof log.startTime === 'string' ? log.startTime.slice(0, 50) : '',
      endTime: typeof log.endTime === 'string' ? log.endTime.slice(0, 50) : '',
      durationMinutes: Math.max(0, Math.min(1440, Math.round(Number(log.durationMinutes) || 0))),
      totalVolumeLbs: Math.max(0, Math.min(2000000, Math.round(Number(log.totalVolumeLbs) || 0))),
      totalSetsCompleted: Math.max(0, Math.min(300, Math.round(Number(log.totalSetsCompleted) || 0))),
      rating: typeof log.rating === 'number' && !isNaN(log.rating)
        ? Math.max(1, Math.min(5, Math.round(log.rating)))
        : 5,
      notes: typeof log.notes === 'string' ? log.notes.slice(0, 1000) : '',
      exercises: Array.isArray(log.exercises) ? log.exercises.slice(0, 50) : [],
      createdAt: (log as any).createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sanitizedLog = sanitizeForFirestore(cleanLog);
    await setDoc(doc(db, 'workoutLogs', cleanId), sanitizedLog);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribes in real-time to all workout logs performed by Coach AJ Risner (risneraryan@gmail.com).
 * Open to every user so everyone can inspect, review, and train along with Coach AJ's verified protocols.
 */
export function subscribeToCoachWorkoutLogs(
  onLogs: (logs: WorkoutSessionLog[]) => void
): Unsubscribe {
  const path = 'workoutLogs';
  try {
    const q = query(
      collection(db, path),
      where('isCoachLog', '==', true)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const logs: WorkoutSessionLog[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Filter out legacy mock logs: only authentic workouts completed by Coach AJ are shown
          if (docSnap.id.startsWith('coach-log-') || data.workoutTitle === 'Coach AJ Duty Workout') {
            return;
          }
          // Only show workouts where userEmail is verified risneraryan@gmail.com
          const logEmail = (data.userEmail || '').trim().toLowerCase();
          if (logEmail !== 'risneraryan@gmail.com') {
            return;
          }

          logs.push({
            id: docSnap.id,
            userId: data.userId,
            athleteId: data.athleteId || 'athlete-aj-risner',
            athleteName: data.athleteName || 'Aryan "AJ" Risner',
            userEmail: 'risneraryan@gmail.com',
            isCoachLog: true,
            programId: data.programId,
            workoutTitle: data.workoutTitle || 'Coach AJ Duty Session',
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
        console.warn('[Firebase] Coach workout logs subscription notice:', error);
        onLogs([]);
      }
    );
  } catch (error) {
    console.warn('[Firebase] Error creating coach workout logs subscription:', error);
    onLogs([]);
    return () => {};
  }
}

/**
 * Removes legacy fictitious mock coach logs from Firestore
 */
export async function cleanUpLegacyMockCoachLogs(): Promise<void> {
  const legacyIds = [
    'coach-log-combat-chassis-lower',
    'coach-log-vest-conditioning',
    'coach-log-tactical-press-arms',
  ];
  for (const id of legacyIds) {
    try {
      await deleteDoc(doc(db, 'workoutLogs', id));
    } catch {
      // document may not exist
    }
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
            subscription: data.subscription || undefined,
            trialActivation: data.trialActivation || undefined,
            trialState: data.trialState || undefined,
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
    if (athlete.subscription) {
      cleanAthlete.subscription = athlete.subscription;
    }
    if (athlete.trialActivation) {
      cleanAthlete.trialActivation = athlete.trialActivation;
    }
    if (athlete.trialState) {
      cleanAthlete.trialState = athlete.trialState;
    }

    const sanitizedAthlete = sanitizeForFirestore(cleanAthlete);
    await setDoc(doc(db, 'athletes', userId), sanitizedAthlete, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Saves or updates trial activation record in Firestore with merge protection
 */
export async function saveTrialActivationToFirestore(
  userId: string,
  trialActivation: any
): Promise<void> {
  const path = `athletes/${userId}`;
  try {
    const cleanTrial = sanitizeForFirestore(trialActivation);
    await setDoc(doc(db, 'athletes', userId), {
      trialActivation: cleanTrial,
      trialState: cleanTrial,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
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

/**
 * Persists a user's custom or AI-generated workout program to Firestore
 */
export async function saveCustomProgramToFirestore(
  program: WorkoutProgram,
  userId: string
): Promise<void> {
  const path = `customPrograms/${program.id}`;
  try {
    const cleanProgram = {
      id: program.id,
      userId,
      title: program.title.slice(0, 120),
      subtitle: (program.subtitle || '').slice(0, 200),
      category: program.category || 'Hybrid',
      frequency: (program.frequency || '4 Days / Week').slice(0, 80),
      estimatedDurationMinutes: Math.max(0, Math.min(360, program.estimatedDurationMinutes || 55)),
      description: (program.description || '').slice(0, 2000),
      exercises: (program.exercises || []).slice(0, 50),
      schedule: program.schedule || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sanitized = sanitizeForFirestore(cleanProgram);
    await setDoc(doc(db, 'customPrograms', program.id), sanitized);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribes to custom programs created by or saved for the authenticated user
 */
export function subscribeToUserCustomPrograms(
  userId: string,
  onPrograms: (programs: WorkoutProgram[]) => void
): Unsubscribe {
  const path = 'customPrograms';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', userId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const list: WorkoutProgram[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            title: data.title,
            subtitle: data.subtitle || '',
            category: data.category || 'Hybrid',
            frequency: data.frequency || '4 Days / Week',
            estimatedDurationMinutes: data.estimatedDurationMinutes || 55,
            description: data.description || '',
            exercises: data.exercises || [],
            schedule: data.schedule || [],
          });
        });
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
 * Deletes a custom program from Firestore
 */
export async function deleteCustomProgramFromFirestore(programId: string): Promise<void> {
  const path = `customPrograms/${programId}`;
  try {
    await deleteDoc(doc(db, 'customPrograms', programId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribes in real-time to custom programs & single workouts created by Coach Aryan Risner.
 * Regular signed-in users receive published items only (matching Firestore list rules).
 * Coach admin (risneraryan@gmail.com) receives both published and draft items.
 */
export function subscribeToCoachPublishedPrograms(
  isAdminUser: boolean,
  onPrograms: (programs: WorkoutProgram[]) => void
): Unsubscribe {
  const path = 'coachPrograms';
  try {
    const q = isAdminUser
      ? collection(db, path)
      : query(collection(db, path), where('isPublished', '==', true));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: WorkoutProgram[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            title: data.title || 'Coach Custom Program',
            subtitle: data.subtitle || '',
            category: data.category || 'Hybrid',
            frequency: data.frequency || '4 Days / Week',
            estimatedDurationMinutes: data.estimatedDurationMinutes || 60,
            description: data.description || '',
            exercises: data.exercises || [],
            schedule: data.schedule || [],
            programKind: data.programKind || 'program',
            isCoachPublished: data.isCoachPublished !== false,
            isPublished: data.isPublished !== false,
            allowAiAdaptation: data.allowAiAdaptation !== false,
            createdByEmail: data.createdByEmail || 'risneraryan@gmail.com',
            createdAt: data.createdAt || '',
            updatedAt: data.updatedAt || '',
          });
        });

        list.sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));
        onPrograms(list);
      },
      (error) => {
        console.warn('[Firebase] coachPrograms subscription notice:', error);
        onPrograms([]);
      }
    );
  } catch (error) {
    console.warn('[Firebase] Error creating coachPrograms subscription:', error);
    onPrograms([]);
    return () => {};
  }
}

/**
 * Saves or updates a Coach-authored shared custom program or single workout in Firestore.
 * Restricted strictly to risneraryan@gmail.com by security rules and client check.
 */
export async function saveCoachProgramToFirestore(
  program: WorkoutProgram
): Promise<void> {
  const currentEmail = (auth.currentUser?.email || '').trim().toLowerCase();
  if (currentEmail !== 'risneraryan@gmail.com') {
    throw new Error('Unauthorized: Only Coach Aryan Risner may publish shared custom programs.');
  }

  const cleanId = (program.id && program.id.trim().length > 0)
    ? program.id.trim().replace(/[^a-zA-Z0-9_-]/g, '_')
    : `coach_prog_${Date.now()}`;
  const path = `coachPrograms/${cleanId}`;

  try {
    const cleanDoc = {
      id: cleanId,
      title: program.title.slice(0, 150),
      subtitle: (program.subtitle || '').slice(0, 300),
      category: program.category || 'Hybrid',
      programKind: program.programKind === 'single_workout' ? 'single_workout' : 'program',
      frequency: (program.frequency || '4 Days / Week').slice(0, 100),
      estimatedDurationMinutes: Math.max(5, Math.min(360, Number(program.estimatedDurationMinutes) || 60)),
      description: (program.description || '').slice(0, 5000),
      exercises: (program.exercises || []).slice(0, 100),
      schedule: (program.schedule || []).slice(0, 100),
      isPublished: program.isPublished !== false,
      isCoachPublished: true,
      allowAiAdaptation: program.allowAiAdaptation !== false,
      createdByEmail: 'risneraryan@gmail.com',
      createdAt: program.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sanitized = sanitizeForFirestore(cleanDoc);
    await setDoc(doc(db, 'coachPrograms', cleanId), sanitized);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a Coach-authored shared custom program or single workout from Firestore.
 */
export async function deleteCoachProgramFromFirestore(programId: string): Promise<void> {
  const currentEmail = (auth.currentUser?.email || '').trim().toLowerCase();
  if (currentEmail !== 'risneraryan@gmail.com') {
    throw new Error('Unauthorized: Only Coach Aryan Risner may delete shared custom programs.');
  }
  const path = `coachPrograms/${programId}`;
  try {
    await deleteDoc(doc(db, 'coachPrograms', programId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}



