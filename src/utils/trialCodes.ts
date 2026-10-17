import { doc, getDoc, setDoc, collection, onSnapshot, Unsubscribe, updateDoc, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { AthleteProfile, TrialActivationRecord, TrialCodeRecord } from '../types';
import { getCurrentAthlete, updateAthleteProfile } from './athleteAuth';
import { saveAthleteToFirestore } from './firebaseSync';

// Local storage key for tier override
const STORAGE_TIER_OVERRIDE_KEY = 'rpa_tier_simulation_override_v1';
const STORAGE_ACTIVE_TRIAL_CODE_KEY = 'prp_active_trial_code_v1';

/**
 * Predefined Tactical Free Trial Activation Codes
 */
export const DEFAULT_TRIAL_CODES: TrialCodeRecord[] = [
  {
    code: 'PATROLREADY',
    days: 14,
    tier: 'pro',
    description: 'Standard 14-Day Pro Frontline Access (Auto-Overload & Timers)',
  },
  {
    code: 'FRONTLINE14',
    days: 14,
    tier: 'pro',
    description: '14-Day Frontline Operational Duty Pass',
  },
  {
    code: 'DUTY30',
    days: 30,
    tier: 'pro',
    description: '30-Day Extended Duty & Pursuit Conditioning Pass',
  },
  {
    code: 'ACADEMY2026',
    days: 30,
    tier: 'pro',
    description: '30-Day Recruit & Academy Preparation Pass',
  },
  {
    code: 'SHERIFF',
    days: 30,
    tier: 'pro',
    description: '30-Day Sheriff Department Tactical Fitness Pass',
  },
  {
    code: 'SWATPRO',
    days: 60,
    tier: 'pro',
    description: '60-Day Tactical Operator & High-Stress Conditioning Pass',
  },
  {
    code: 'CHASSIS14',
    days: 14,
    tier: 'pro',
    description: '14-Day Combat Chassis Injury Prevention & Armor Pass',
  },
  {
    code: 'COACHAJ',
    days: 90,
    tier: 'pro',
    description: '90-Day VIP Head Coach All-Access Tactical Pass',
  },
];

/**
 * Normalizes code string for comparison
 */
export function normalizeTrialCode(rawCode: string): string {
  return rawCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}

/**
 * Validates a trial code against default static codes and custom Firestore codes
 */
export async function validateTrialCode(rawCode: string): Promise<{
  valid: boolean;
  codeRecord?: TrialCodeRecord;
  message: string;
}> {
  const code = normalizeTrialCode(rawCode);
  if (!code) {
    return { valid: false, message: 'Please enter a valid activation code.' };
  }

  // 1. Check predefined list
  const defaultFound = DEFAULT_TRIAL_CODES.find((c) => c.code === code);
  if (defaultFound) {
    return {
      valid: true,
      codeRecord: defaultFound,
      message: `Valid code! Grants ${defaultFound.days} days of ${defaultFound.tier.toUpperCase()} Frontline access.`,
    };
  }

  // 2. Check Firestore /trial_codes/{code}
  try {
    const docRef = doc(db, 'trial_codes', code);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as TrialCodeRecord;
      if (typeof data.maxUses === 'number' && typeof data.currentUses === 'number') {
        if (data.currentUses >= data.maxUses) {
          return { valid: false, message: 'This code has reached its maximum redemptions.' };
        }
      }
      return {
        valid: true,
        codeRecord: {
          code,
          days: data.days || 14,
          tier: data.tier || 'pro',
          description: data.description || `${data.days || 14}-Day Agency Trial`,
        },
        message: `Valid agency code! Grants ${data.days || 14} days of ${data.tier || 'pro'} access.`,
      };
    }
  } catch (err) {
    console.warn('[TrialCodes] Remote code check error:', err);
  }

  return {
    valid: false,
    message: `Code "${code}" was not recognized. Try "PATROLREADY" or "DUTY30" for instant access.`,
  };
}

/**
 * Activates a trial code for the user, updating local override and cloud athlete document
 */
export async function activateTrialCode(
  rawCode: string,
  userId: string
): Promise<{
  success: boolean;
  message: string;
  activationRecord?: TrialActivationRecord;
  daysGranted?: number;
}> {
  const validation = await validateTrialCode(rawCode);
  if (!validation.valid || !validation.codeRecord) {
    return {
      success: false,
      message: validation.message,
    };
  }

  const codeRec = validation.codeRecord;
  const days = codeRec.days;
  const trialEndMs = Date.now() + days * 24 * 60 * 60 * 1000;

  const activationRecord: TrialActivationRecord = {
    code: codeRec.code,
    activatedAt: new Date().toISOString(),
    trialEndMs,
    daysGranted: days,
    tier: codeRec.tier,
  };

  // 1. Immediately store in localStorage override so useUserTier unlocks with 0 delay
  try {
    const overridePayload = {
      tier: codeRec.tier,
      status: 'trialing',
      trialEndMs,
      trialEndOffsetDays: days,
      activatedCode: codeRec.code,
    };
    localStorage.setItem(STORAGE_TIER_OVERRIDE_KEY, JSON.stringify(overridePayload));
    localStorage.setItem(STORAGE_ACTIVE_TRIAL_CODE_KEY, JSON.stringify(activationRecord));
  } catch (err) {
    console.warn('[TrialCodes] Local storage write error:', err);
  }

  // 2. Update athlete in memory and localStorage
  try {
    const current = getCurrentAthlete();
    if (current) {
      const updatedAthlete: AthleteProfile = {
        ...current,
        trialActivation: activationRecord,
      };
      updateAthleteProfile(current.id, updatedAthlete);
    }
  } catch (err) {
    console.warn('[TrialCodes] Local athlete update note:', err);
  }

  // 3. Persist to Firestore /athletes/{userId}
  try {
    const current = getCurrentAthlete();
    const athleteToSave: AthleteProfile = {
      ...(current || {
        id: userId,
        name: 'Patrol Officer',
        email: '',
        avatarColor: 'from-blue-600 to-indigo-800',
        joinedDate: new Date().toISOString().split('T')[0],
        experienceLevel: 'Intermediate',
        primaryGoal: 'Tactical Conditioning & Pursuit',
      }),
      trialActivation: activationRecord,
    };
    await saveAthleteToFirestore(athleteToSave, userId);

    // Increment usage on Firestore trial_codes if exists
    try {
      const codeDocRef = doc(db, 'trial_codes', codeRec.code);
      const snap = await getDoc(codeDocRef);
      if (snap.exists()) {
        await updateDoc(codeDocRef, {
          currentUses: increment(1),
        });
      }
    } catch {}
  } catch (err) {
    console.warn('[TrialCodes] Cloud sync note:', err);
  }

  return {
    success: true,
    message: `Free Trial Activated! Code "${codeRec.code}" unlocked ${days} days of Pro Frontline features.`,
    activationRecord,
    daysGranted: days,
  };
}

/**
 * Subscribes to custom agency trial codes stored in Firestore (for Coach AJ)
 */
export function subscribeToCustomTrialCodes(
  onCodes: (codes: TrialCodeRecord[]) => void
): Unsubscribe {
  const path = 'trial_codes';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const remoteCodes: TrialCodeRecord[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          remoteCodes.push({
            code: d.id,
            days: data.days || 14,
            tier: data.tier || 'pro',
            description: data.description || '',
            createdAt: data.createdAt,
            createdBy: data.createdBy,
            maxUses: data.maxUses,
            currentUses: data.currentUses || 0,
          });
        });

        // Merge defaults with custom remote codes (no duplicates)
        const combinedMap = new Map<string, TrialCodeRecord>();
        DEFAULT_TRIAL_CODES.forEach((c) => combinedMap.set(c.code, c));
        remoteCodes.forEach((c) => combinedMap.set(c.code, c));
        onCodes(Array.from(combinedMap.values()));
      },
      () => {
        onCodes(DEFAULT_TRIAL_CODES);
      }
    );
  } catch {
    onCodes(DEFAULT_TRIAL_CODES);
    return () => {};
  }
}

/**
 * Allows Coach AJ to create or update an agency trial code in Firestore
 */
export async function createAgencyTrialCode(
  codeRecord: TrialCodeRecord,
  adminEmail?: string
): Promise<void> {
  const code = normalizeTrialCode(codeRecord.code);
  const path = `trial_codes/${code}`;
  try {
    const cleanDoc: TrialCodeRecord = {
      code,
      days: Math.max(1, Math.min(365, codeRecord.days || 14)),
      tier: codeRecord.tier || 'pro',
      description: (codeRecord.description || `${codeRecord.days} Days Access`).slice(0, 150),
      createdAt: new Date().toISOString(),
      createdBy: adminEmail || 'risnerathletics@gmail.com',
      maxUses: codeRecord.maxUses || 500,
      currentUses: 0,
    };
    await setDoc(doc(db, 'trial_codes', code), cleanDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
