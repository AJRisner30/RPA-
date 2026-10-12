/**
 * Android Native Tactile Haptics Hook
 * Provides tactile vibration feedback on Android devices via navigator.vibrate
 */

export function useAndroidHaptics() {
  const isSupported = typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;

  const vibrate = (pattern: number | number[]) => {
    if (!isSupported) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignored if device doesn't support or permission blocked
    }
  };

  /** Light tactile tick for tab switching & button clicks (12ms) */
  const tap = () => vibrate(12);

  /** Double pulse for confirming selections (15ms - pause - 15ms) */
  const doubleTap = () => vibrate([15, 40, 15]);

  /** Success vibration when completing an exercise set or logging a workout */
  const success = () => vibrate([20, 60, 30]);

  /** Distinctive tactical alert when timer runs out or urgent alert fires */
  const alert = () => vibrate([60, 80, 60, 80, 100]);

  /** Heavy impact vibration for starting a live workout */
  const heavy = () => vibrate(45);

  return {
    isSupported,
    vibrate,
    tap,
    doubleTap,
    success,
    alert,
    heavy,
  };
}
