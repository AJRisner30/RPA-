import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  testFirestoreConnection 
} from '../firebase';

export interface AuthErrorInfo {
  code: string;
  message: string;
  domain?: string;
  isDomainError?: boolean;
  isPopupBlocked?: boolean;
  isOperationDisabled?: boolean;
  isCancelled?: boolean;
}

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  isAuthenticating: boolean;
  isCloudConnected: boolean;
  isIframe: boolean;
  authError: AuthErrorInfo | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<User | null>;
  signInWithGoogleRedirect: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

export function parseAuthError(err: any): AuthErrorInfo {
  const code = err?.code || 'auth/unknown-error';
  const message = err?.message || 'Authentication failed. Please try again.';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

  return {
    code,
    message,
    domain: hostname,
    isDomainError: code === 'auth/unauthorized-domain' || message.includes('unauthorized domain') || message.includes('authorized domain'),
    isPopupBlocked: code === 'auth/popup-blocked' || (message.toLowerCase().includes('popup') && message.toLowerCase().includes('blocked')),
    isOperationDisabled: code === 'auth/operation-not-allowed',
    isCancelled: code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request',
  };
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  isAuthenticating: false,
  isCloudConnected: false,
  isIframe: false,
  authError: null,
  clearAuthError: () => {},
  signInWithGoogle: async () => null,
  signInWithGoogleRedirect: async () => {},
  signOutUser: async () => {},
});

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [authError, setAuthError] = useState<AuthErrorInfo | null>(null);
  const [isIframe, setIsIframe] = useState<boolean>(false);

  useEffect(() => {
    // Detect iframe environment
    try {
      setIsIframe(window.self !== window.top);
    } catch {
      setIsIframe(true);
    }

    // 1. Check Firestore database connection test on initial boot
    testFirestoreConnection().then((connected) => {
      setIsCloudConnected(connected);
    });

    const handleOnline = () => setIsCloudConnected(true);
    const handleOffline = () => setIsCloudConnected(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 2. Auth state listener (tracks user session from browserLocalPersistence / localStorage)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setIsCloudConnected(true);
        setAuthError(null);
      }
    });

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSignInWithGoogle = async (): Promise<User | null> => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      setIsCloudConnected(true);
      setAuthError(null);
      return result.user;
    } catch (err: any) {
      console.error('[Firebase] Sign in with Google error:', err);
      const parsed = parseAuthError(err);
      setAuthError(parsed);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignInWithGoogleRedirect = async (): Promise<void> => {
    // In Android WebView / WebsiteToApp wrapper, redirect sign-in throws missing-initial-state.
    // Forward directly to signInWithPopup to maintain state integrity.
    await handleSignInWithGoogle();
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setAuthError(null);
    } catch (err) {
      console.error('[Firebase] Sign out error:', err);
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        loading,
        isAuthenticating,
        isCloudConnected,
        isIframe,
        authError,
        clearAuthError,
        signInWithGoogle: handleSignInWithGoogle,
        signInWithGoogleRedirect: handleSignInWithGoogleRedirect,
        signOutUser: handleSignOut,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export function useFirebase() {
  return useContext(FirebaseContext);
}
