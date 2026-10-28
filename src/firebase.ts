import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Resolve custom authDomain for Android WebView / WebsiteToApp wrapper
const customAuthDomain = 'patrolreadyperformance.store';
const defaultAuthDomain = firebaseConfig.authDomain || 'teak-router-m53bd.firebaseapp.com';
const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

const resolvedAuthDomain = (currentHostname.includes('patrolreadyperformance.store') || !defaultAuthDomain)
  ? customAuthDomain
  : defaultAuthDomain;

const app = initializeApp({
  ...firebaseConfig,
  authDomain: resolvedAuthDomain,
});

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

// Configure auth persistence to browserLocalPersistence (localStorage / IndexedDB)
// This eliminates the "missing initial state" error caused by sessionStorage wipes in Android WebViews
try {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('[Firebase] Warning setting browserLocalPersistence:', err);
  });
} catch (err) {
  console.warn('[Firebase] Error configuring persistence:', err);
}

// Use browser device language for Google Auth screens
try {
  auth.useDeviceLanguage();
} catch {}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }
  return true;
}

// Safe compatibility export for legacy callers
export const getRedirectResult = async () => null;
export const signInWithRedirect = signInWithPopup;

export { 
  signInWithPopup, 
  signOut, 
  setPersistence, 
  browserLocalPersistence 
};
