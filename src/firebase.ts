import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  linkWithCredential,
  EmailAuthProvider,
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Default Firebase project authDomain (.firebaseapp.com)
// Netlify does not host /__/auth/handler, so authDomain must use the default Firebase project URL
const defaultAuthDomain = firebaseConfig.authDomain || 'teak-router-m53bd.firebaseapp.com';

const app = initializeApp({
  ...firebaseConfig,
  authDomain: defaultAuthDomain,
});

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

// Suppress internal Firestore connection retry logs so harmless offline/reconnection attempts do not pollute console
try {
  setLogLevel('silent');
} catch {
  // Ignore if already configured
}

// Configure auth persistence to browserLocalPersistence (localStorage / IndexedDB)
try {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('[Firebase] Warning setting browserLocalPersistence:', err);
  });
} catch (err) {
  console.warn('[Firebase] Error configuring persistence:', err);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errCode = (error as any)?.code;

  const isPermissionError = 
    errCode === 'permission-denied' || 
    errMsg.toLowerCase().includes('permission') || 
    errMsg.toLowerCase().includes('insufficient permissions');

  const isUnavailableOrOffline = 
    errCode === 'unavailable' || 
    errMsg.toLowerCase().includes('could not reach cloud firestore') ||
    errMsg.toLowerCase().includes('the operation could not be completed') ||
    errMsg.toLowerCase().includes('client is offline') ||
    errMsg.toLowerCase().includes('connection failed') ||
    errMsg.toLowerCase().includes('network');

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };

  if (isPermissionError) {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }

  if (isUnavailableOrOffline) {
    console.warn(`[Firestore ${operationType}] Operating in offline/reconnecting mode for ${path}:`, errMsg);
    return;
  }

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }
  try {
    const { doc, getDocFromServer } = await import('firebase/firestore');
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const code = (error as any)?.code;
    if (msg.includes('client is offline') || code === 'unavailable') {
      console.warn('[Firebase] Client is offline or Firestore backend unavailable.');
      return false;
    }
    return true;
  }
}

export { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  linkWithCredential,
  EmailAuthProvider,
  signOut, 
  setPersistence, 
  browserLocalPersistence 
};
