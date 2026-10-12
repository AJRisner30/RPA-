import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Android Screen Wake Lock Hook
 * Prevents Android devices from sleeping/locking the screen while an officer is actively working out or timing rest.
 */
export function useAndroidWakeLock(shouldKeepAwake: boolean = false) {
  const [isLocked, setIsLocked] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const requestLock = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return false;
    }

    try {
      if (wakeLockRef.current && !wakeLockRef.current.released) {
        return true;
      }
      const sentinel = await navigator.wakeLock.request('screen');
      sentinel.addEventListener('release', () => {
        setIsLocked(false);
        wakeLockRef.current = null;
      });
      wakeLockRef.current = sentinel;
      setIsLocked(true);
      return true;
    } catch {
      setIsLocked(false);
      return false;
    }
  }, []);

  const releaseLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // Ignored
      }
      wakeLockRef.current = null;
      setIsLocked(false);
    }
  }, []);

  useEffect(() => {
    if (shouldKeepAwake) {
      requestLock();
    } else {
      releaseLock();
    }

    // Handle visibility changes on Android (lock automatically releases when tab/app is minimized)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && shouldKeepAwake) {
        requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseLock();
    };
  }, [shouldKeepAwake, requestLock, releaseLock]);

  return {
    isLocked,
    requestLock,
    releaseLock,
    isSupported: typeof navigator !== 'undefined' && 'wakeLock' in navigator,
  };
}
