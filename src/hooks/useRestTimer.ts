import { useState, useRef, useEffect, useCallback } from 'react';
import { soundManager } from '../utils/audio';

export interface RestTimerState {
  exerciseName: string;
  secondsRemaining: number;
  totalSeconds: number;
  isRunning: boolean;
  isComplete: boolean;
}

export interface UseRestTimerOptions {
  onComplete?: (exerciseName: string) => void;
  enableAudioBeeps?: boolean;
}

/**
 * High-precision, wall-clock synchronized Rest Timer hook.
 *
 * Uses Date.now() timestamps rather than raw interval decrements.
 * This guarantees the timer ticks down at exact 1-to-1 real-world speed,
 * immune to iframe background throttling, React render delays, or JS event loop jitter.
 */
export function useRestTimer(options?: UseRestTimerOptions) {
  const [activeTimer, setActiveTimer] = useState<RestTimerState | null>(null);

  // References to keep accurate real-world timing across renders
  const targetEndTimeRef = useRef<number | null>(null);
  const remainingSecondsRef = useRef<number>(0);
  const totalSecondsRef = useRef<number>(90);
  const exerciseNameRef = useRef<string>('');
  const isRunningRef = useRef<boolean>(false);
  const lastBeepSecondRef = useRef<number | null>(null);
  const tickerIntervalRef = useRef<number | null>(null);

  const clearTicker = useCallback(() => {
    if (tickerIntervalRef.current !== null) {
      window.clearInterval(tickerIntervalRef.current);
      tickerIntervalRef.current = null;
    }
  }, []);

  const stopTimer = useCallback(() => {
    clearTicker();
    isRunningRef.current = false;
    targetEndTimeRef.current = null;
    lastBeepSecondRef.current = null;
    setActiveTimer(null);
  }, [clearTicker]);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Main high-frequency tick callback (runs every 100ms)
  const onTick = useCallback(() => {
    if (!isRunningRef.current || targetEndTimeRef.current === null) return;

    const now = Date.now();
    const diffMs = targetEndTimeRef.current - now;
    const remaining = Math.max(0, Math.ceil(diffMs / 1000));

    remainingSecondsRef.current = remaining;

    // Check countdown beeps (3, 2, 1)
    if (remaining <= 3 && remaining > 0) {
      if (lastBeepSecondRef.current !== remaining) {
        lastBeepSecondRef.current = remaining;
        soundManager.playCountdownBeep(false);
      }
    }

    if (remaining <= 0) {
      // Timer complete!
      clearTicker();
      isRunningRef.current = false;
      targetEndTimeRef.current = null;
      lastBeepSecondRef.current = null;

      soundManager.playRestComplete();
      optionsRef.current?.onComplete?.(exerciseNameRef.current);

      setActiveTimer({
        exerciseName: exerciseNameRef.current,
        secondsRemaining: 0,
        totalSeconds: totalSecondsRef.current,
        isRunning: false,
        isComplete: true,
      });
      return;
    }

    // Update state whenever the second count ticks
    setActiveTimer((prev) => {
      if (!prev || prev.secondsRemaining === remaining) return prev;
      return {
        ...prev,
        secondsRemaining: remaining,
        isRunning: true,
        isComplete: false,
      };
    });
  }, [clearTicker]);

  const startTicker = useCallback(() => {
    clearTicker();
    // Run an immediate tick, then repeat every 100ms for smooth, jitter-free precision
    onTick();
    tickerIntervalRef.current = window.setInterval(onTick, 100);
  }, [clearTicker, onTick]);

  const startTimer = useCallback(
    (exerciseName: string, durationSeconds: number) => {
      const cleanName = exerciseName.replace(/\[.*?\]/g, '').trim() || 'Rest';
      const parsed = parseInt(String(durationSeconds), 10);
      const validDuration = !isNaN(parsed) && parsed > 0 ? parsed : 90;

      clearTicker();
      exerciseNameRef.current = cleanName;
      totalSecondsRef.current = validDuration;
      remainingSecondsRef.current = validDuration;
      isRunningRef.current = true;
      lastBeepSecondRef.current = null;
      targetEndTimeRef.current = Date.now() + validDuration * 1000;

      setActiveTimer({
        exerciseName: cleanName,
        secondsRemaining: validDuration,
        totalSeconds: validDuration,
        isRunning: true,
        isComplete: false,
      });

      soundManager.playCountdownBeep(true);
      startTicker();
    },
    [clearTicker, startTicker]
  );

  const pauseTimer = useCallback(() => {
    if (!isRunningRef.current || targetEndTimeRef.current === null) return;

    clearTicker();
    const now = Date.now();
    const diffMs = targetEndTimeRef.current - now;
    const remaining = Math.max(0, Math.ceil(diffMs / 1000));

    isRunningRef.current = false;
    remainingSecondsRef.current = remaining;
    targetEndTimeRef.current = null;

    setActiveTimer((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        secondsRemaining: remaining,
        isRunning: false,
      };
    });
  }, [clearTicker]);

  const resumeTimer = useCallback(() => {
    if (isRunningRef.current) return;
    const remaining = remainingSecondsRef.current > 0 ? remainingSecondsRef.current : totalSecondsRef.current;
    if (remaining <= 0) return;

    isRunningRef.current = true;
    targetEndTimeRef.current = Date.now() + remaining * 1000;

    setActiveTimer((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        secondsRemaining: remaining,
        isRunning: true,
        isComplete: false,
      };
    });

    startTicker();
  }, [startTicker]);

  const togglePauseResume = useCallback(
    (defaultExerciseName?: string, defaultDurationSeconds?: number) => {
      if (!activeTimer) {
        if (defaultExerciseName && defaultDurationSeconds) {
          startTimer(defaultExerciseName, defaultDurationSeconds);
        }
        return;
      }

      if (activeTimer.isComplete || activeTimer.secondsRemaining === 0) {
        // Restart the timer with the target duration
        startTimer(activeTimer.exerciseName, activeTimer.totalSeconds);
      } else if (activeTimer.isRunning) {
        pauseTimer();
      } else {
        resumeTimer();
      }
    },
    [activeTimer, pauseTimer, resumeTimer, startTimer]
  );

  const adjustRemaining = useCallback(
    (deltaSeconds: number) => {
      if (!activeTimer) return;

      const deltaMs = deltaSeconds * 1000;

      if (isRunningRef.current && targetEndTimeRef.current !== null) {
        const now = Date.now();
        // Shift absolute end time
        targetEndTimeRef.current = Math.max(now + 2000, targetEndTimeRef.current + deltaMs);
        const newRemaining = Math.max(1, Math.ceil((targetEndTimeRef.current - now) / 1000));
        remainingSecondsRef.current = newRemaining;

        setActiveTimer((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            secondsRemaining: newRemaining,
            isComplete: false,
          };
        });
      } else {
        // When paused or completed
        const newRemaining = Math.max(5, remainingSecondsRef.current + deltaSeconds);
        remainingSecondsRef.current = newRemaining;
        setActiveTimer((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            secondsRemaining: newRemaining,
            isComplete: false,
          };
        });
      }
    },
    [activeTimer]
  );

  const updateTotalDuration = useCallback((newTotalSeconds: number) => {
    const valid = Math.max(15, parseInt(String(newTotalSeconds), 10) || 15);
    totalSecondsRef.current = valid;

    setActiveTimer((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        totalSeconds: valid,
      };
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTicker();
    };
  }, [clearTicker]);

  return {
    activeTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    togglePauseResume,
    adjustRemaining,
    stopTimer,
    updateTotalDuration,
  };
}
