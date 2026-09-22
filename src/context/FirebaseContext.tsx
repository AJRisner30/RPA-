import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, signInWithPopup, signOut, testFirestoreConnection } from '../firebase';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  isCloudConnected: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  isCloudConnected: false,
  signInWithGoogle: async () => null,
  signOutUser: async () => {},
});

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check Firestore database connection test on initial boot
    testFirestoreConnection().then((connected) => {
      setIsCloudConnected(connected);
    });

    // 2. Auth state listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setIsCloudConnected(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignInWithGoogle = async (): Promise<User | null> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      console.error('[Firebase] Sign in with Google error:', err);
      return null;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('[Firebase] Sign out error:', err);
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        loading,
        isCloudConnected,
        signInWithGoogle: handleSignInWithGoogle,
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
