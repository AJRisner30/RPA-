import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  auth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  linkWithCredential,
  EmailAuthProvider,
  signOut, 
  testFirestoreConnection 
} from '../firebase';

export interface AuthErrorInfo {
  code: string;
  message: string;
  isAccountExists?: boolean;
  isInvalidCredential?: boolean;
  isWeakPassword?: boolean;
  isInvalidEmail?: boolean;
  isUserNotFound?: boolean;
}

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  isAuthenticating: boolean;
  isCloudConnected: boolean;
  authError: AuthErrorInfo | null;
  clearAuthError: () => void;
  signInWithEmail: (email: string, password: string) => Promise<User | null>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<User | null>;
  sendPasswordSetupEmail: (email: string) => Promise<void>;
  setUserPassword: (newPassword: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

export function parseAuthError(err: any): AuthErrorInfo {
  const code = err?.code || 'auth/unknown-error';
  let message = err?.message || 'Authentication failed. Please check your credentials and try again.';

  const isAccountExists = code === 'auth/email-already-in-use';
  const isInvalidCredential = code === 'auth/wrong-password' || code === 'auth/invalid-credential';
  const isUserNotFound = code === 'auth/user-not-found';
  const isWeakPassword = code === 'auth/weak-password';
  const isInvalidEmail = code === 'auth/invalid-email';

  if (isAccountExists) {
    message = 'An account already exists with this email (e.g. from previous Google sign in). Please use "Set / Reset Password" to set a password for this email.';
  } else if (isInvalidCredential) {
    message = 'Incorrect password or account credentials. If you previously signed in with Google, you must set a password first using the "Set Password" tab.';
  } else if (isUserNotFound) {
    message = 'No account found with this email. If this is your first time, please create an account.';
  } else if (isWeakPassword) {
    message = 'Password must be at least 6 characters long.';
  } else if (isInvalidEmail) {
    message = 'Please enter a valid email address.';
  } else if (code === 'auth/too-many-requests') {
    message = 'Access temporarily restricted due to multiple failed login attempts. Please reset your password or wait a few minutes.';
  }

  return {
    code,
    message,
    isAccountExists,
    isInvalidCredential,
    isWeakPassword,
    isInvalidEmail,
    isUserNotFound,
  };
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  isAuthenticating: false,
  isCloudConnected: false,
  authError: null,
  clearAuthError: () => {},
  signInWithEmail: async () => null,
  signUpWithEmail: async () => null,
  sendPasswordSetupEmail: async () => {},
  setUserPassword: async () => {},
  signOutUser: async () => {},
});

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [authError, setAuthError] = useState<AuthErrorInfo | null>(null);

  useEffect(() => {
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

  // Sign In with Email & Password
  const handleSignInWithEmail = async (email: string, password: string): Promise<User | null> => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const cleanEmail = email.trim();
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      setUser(userCredential.user);
      setIsCloudConnected(true);
      return userCredential.user;
    } catch (err: any) {
      console.warn('[Firebase] Email sign-in error:', err);
      const parsed = parseAuthError(err);
      setAuthError(parsed);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Sign Up / Create Account with Email & Password
  const handleSignUpWithEmail = async (
    email: string, 
    password: string, 
    displayName?: string
  ): Promise<User | null> => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const cleanEmail = email.trim();
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      if (displayName && userCredential.user) {
        try {
          await updateProfile(userCredential.user, { displayName });
        } catch (profileErr) {
          console.warn('[Firebase] Profile display name set error:', profileErr);
        }
      }
      setUser(userCredential.user);
      setIsCloudConnected(true);
      return userCredential.user;
    } catch (err: any) {
      console.warn('[Firebase] Email sign-up error:', err);
      const parsed = parseAuthError(err);
      setAuthError(parsed);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Send Password Setup / Reset Email
  // Works for both password resets AND allowing previous Google Sign-In users to set their initial password!
  const handleSendPasswordSetupEmail = async (email: string): Promise<void> => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const cleanEmail = email.trim();
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (err: any) {
      console.warn('[Firebase] Password reset email error:', err);
      const parsed = parseAuthError(err);
      setAuthError(parsed);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Set / Update Password directly on current user
  // Allows users currently logged in (including previous Google users) to set their password immediately
  const handleSetUserPassword = async (newPassword: string): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error('No user is currently authenticated.');
    }
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const currentUser = auth.currentUser;
      try {
        await updatePassword(currentUser, newPassword);
      } catch (err: any) {
        // If password provider wasn't linked yet (e.g. Google-only user), link password credential
        if (currentUser.email) {
          const cred = EmailAuthProvider.credential(currentUser.email, newPassword);
          await linkWithCredential(currentUser, cred);
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      console.warn('[Firebase] Set user password error:', err);
      const parsed = parseAuthError(err);
      setAuthError(parsed);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
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
        authError,
        clearAuthError,
        signInWithEmail: handleSignInWithEmail,
        signUpWithEmail: handleSignUpWithEmail,
        sendPasswordSetupEmail: handleSendPasswordSetupEmail,
        setUserPassword: handleSetUserPassword,
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
