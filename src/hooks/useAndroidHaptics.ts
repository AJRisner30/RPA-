import { useCallback, useMemo } from 'react';

/**
 * Android Native Tactile Haptics Hook
 * Provides tactile vibration feedback on Android devices via navigator.vibrate
 */

export function useAndroidHaptics() {
  const isSupported = typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;

  const vibrate = useCallback((pattern: number | number[]) => {
    if (!isSupported) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignored if device doesn't support or permission blocked
    }
  }, [isSupported]);

  /** Light tactile tick for tab switching & button clicks (12ms) */
  const tap = useCallback(() => vibrate(12), [vibrate]);

  /** Double pulse for confirming selections (15ms - pause - 15ms) */
  const doubleTap = useCallback(() => vibrate([15, 40, 15]), [vibrate]);

  /** Success vibration when completing an exercise set or logging a workout */
  const success = useCallback(() => vibrate([20, 60, 30]), [vibrate]);

  /** Distinctive tactical alert when timer runs out or urgent alert fires */
  const alert = useCallback(() => vibrate([60, 80, 60, 80, 100]), [vibrate]);

  /** Heavy impact vibration for starting a live workout */
  const heavy = useCallback(() => vibrate(45), [vibrate]);

  return useMemo(
    () => ({
      isSupported,
      vibrate,
      tap,
      doubleTap,
      success,
      alert,
      heavy,
    }),
    [isSupported, vibrate, tap, doubleTap, success, alert, heavy]
  );
}
