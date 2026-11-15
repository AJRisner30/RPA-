import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  BatteryCharging,
  CheckCircle2,
  Heart,
  Moon,
  Scale,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Zap,
  Calendar,
} from 'lucide-react';
import { AthleteProfile, BodyweightEntry, RecoveryCheckIn, WorkoutSessionLog } from '../types';
import {
  calculateReadinessScore,
  getLocalTodayDateStr,
  markDailyReadinessCompletedToday,
} from '../utils/readinessEngine';

interface DailyReadinessModalProps {
  isOpen: boolean;
  athlete: AthleteProfile;
  logs: WorkoutSessionLog[];
  userId?: string | null;
  userEmail?: string | null;
  onComplete: (updatedAthlete: AthleteProfile) => void;
  onClose?: () => void;
  allowDismiss?: boolean;
}

export const DailyReadinessModal: React.FC<DailyReadinessModalProps> = ({
  isOpen,
  athlete,
  logs,
  userId,
  userEmail,
  onComplete,
  onClose,
  allowDismiss = false,
}) => {
  const todayStr = getLocalTodayDateStr();
  const formattedToday = useMemo(() => {
    try {
      return new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return todayStr;
    }
  }, [todayStr]);

  const [sleepHours, setSleepHours] = useState<number>(
    athlete.lastRecoveryCheckIn?.sleepHours ?? 7.5
  );
  const [sleepQuality, setSleepQuality] = useState<1 | 2 | 3 | 4 | 5>(
    athlete.lastRecoveryCheckIn?.sleepQuality ?? 4
  );
  const [muscleSoreness, setMuscleSoreness] = useState<1 | 2 | 3 | 4 | 5>(
    athlete.lastRecoveryCheckIn?.muscleSoreness ?? 2
  );
  const [shiftStress, setShiftStress] = useState<1 | 2 | 3 | 4 | 5>(
    athlete.lastRecoveryCheckIn?.shiftStress ?? 2
  );
  const [logWeightToday, setLogWeightToday] = useState<boolean>(true);
  const [weightInput, setWeightInput] = useState<string>(
    athlete.weightLbs ? String(athlete.weightLbs) : '185'
  );
  const [restingHrInput, setRestingHrInput] = useState<string>(
    athlete.restingHr ? String(athlete.restingHr) : '54'
  );
  const [savedBanner, setSavedBanner] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSleepHours(athlete.lastRecoveryCheckIn?.sleepHours ?? 7.5);
      setSleepQuality(athlete.lastRecoveryCheckIn?.sleepQuality ?? 4);
      setMuscleSoreness(athlete.lastRecoveryCheckIn?.muscleSoreness ?? 2);
      setShiftStress(athlete.lastRecoveryCheckIn?.shiftStress ?? 2);
      setWeightInput(athlete.weightLbs ? String(athlete.weightLbs) : '185');
      setRestingHrInput(athlete.restingHr ? String(athlete.restingHr) : '54');
      setSavedBanner(false);
    }
  }, [isOpen, athlete]);

  // Real-time preview of the athlete's Readiness Score based on current form answers
  const previewReadiness = useMemo(() => {
    const parsedWeight = parseFloat(weightInput);
    const validWeight =
      logWeightToday && !isNaN(parsedWeight) && parsedWeight > 50 && parsedWeight < 500
        ? Math.round(parsedWeight * 10) / 10
        : athlete.weightLbs;

    const previewCheckIn: RecoveryCheckIn = {
      id: 'preview-checkin',
      date: todayStr,
      sleepHours,
      sleepQuality,
      muscleSoreness,
      shiftStress,
      createdAt: new Date().toISOString(),
    };

    const previewWeightHistory: BodyweightEntry[] =
      logWeightToday && validWeight
        ? [
            { id: 'preview-bw', date: todayStr, weightLbs: validWeight },
            ...(athlete.weightHistory || []).filter((w) => w.date !== todayStr),
          ]
        : athlete.weightHistory || [];

    const previewAthlete: AthleteProfile = {
      ...athlete,
      weightLbs: validWeight || athlete.weightLbs,
      weightHistory: previewWeightHistory,
      lastRecoveryCheckIn: previewCheckIn,
    };

    return calculateReadinessScore(previewAthlete, logs);
  }, [
    athlete,
    logs,
    todayStr,
    sleepHours,
    sleepQuality,
    muscleSoreness,
    shiftStress,
    logWeightToday,
    weightInput,
  ]);

  if (!isOpen) return null;

  const isHighFatigue = sleepHours <= 5.5 || shiftStress >= 4 || muscleSoreness >= 4;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedHr = restingHrInput ? parseInt(restingHrInput, 10) : undefined;
    const parsedWeight = parseFloat(weightInput);
    const validWeight =
      logWeightToday && !isNaN(parsedWeight) && parsedWeight > 50 && parsedWeight < 500
        ? Math.round(parsedWeight * 10) / 10
        : undefined;

    const newCheckIn: RecoveryCheckIn = {
      id: `rec-${Date.now()}`,
      date: todayStr,
      sleepHours,
      sleepQuality,
      muscleSoreness,
      shiftStress,
      restingHr: !isNaN(parsedHr || NaN) ? parsedHr : undefined,
      createdAt: new Date().toISOString(),
    };

    const currentRecoveryHistory = athlete.recoveryHistory || [];
    const updatedRecoveryHistory = [
      newCheckIn,
      ...currentRecoveryHistory.filter((r) => r.date !== todayStr),
    ];

    let updatedWeightHistory = athlete.weightHistory || [];
    if (validWeight !== undefined) {
      const newWeightEntry: BodyweightEntry = {
        id: `bw-${Date.now()}`,
        date: todayStr,
        weightLbs: validWeight,
      };
      updatedWeightHistory = [
        newWeightEntry,
        ...updatedWeightHistory.filter((w) => w.date !== todayStr),
      ];
    }

    const updatedAthlete: AthleteProfile = {
      ...athlete,
      weightLbs: validWeight !== undefined ? validWeight : athlete.weightLbs,
      weightHistory: updatedWeightHistory,
      lastRecoveryCheckIn: newCheckIn,
      recoveryHistory: updatedRecoveryHistory,
      restingHr: newCheckIn.restingHr || athlete.restingHr,
    };

    markDailyReadinessCompletedToday(updatedAthlete, userId, userEmail);
    setSavedBanner(true);

    setTimeout(() => {
      onComplete(updatedAthlete);
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#0c1629] via-[#091120] to-[#060b14] border-2 border-blue-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[94vh] overflow-y-auto">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-emerald-500 rounded-t-3xl" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800/90 pb-3.5 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/25 border border-blue-500/50 flex items-center justify-center text-blue-400 shrink-0 shadow-md">
              <BatteryCharging className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950/90 border border-blue-500/40 text-blue-300">
                  Daily First-Login Check-In
                </span>
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-400" />
                  {formattedToday}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white font-athletic uppercase tracking-wide mt-0.5">
                Daily Tactical Readiness Questionnaire
              </h2>
            </div>
          </div>

          {allowDismiss && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-mono text-slate-400 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer"
            >
              Close
            </button>
          )}
        </div>

        {/* Live Readiness Preview Banner */}
        <div className="p-3.5 rounded-2xl bg-[#070d19] border border-blue-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-mono font-black border shrink-0 ${
                previewReadiness.overallScore >= 85
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                  : previewReadiness.overallScore >= 70
                  ? 'bg-blue-950/80 border-blue-500/50 text-blue-300'
                  : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
              }`}
            >
              <span className="text-lg leading-none">{previewReadiness.overallScore}</span>
              <span className="text-[8px] uppercase opacity-75">Index</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  Officer: <strong className="text-white">{athlete.name}</strong>
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${previewReadiness.statusBadgeColor}`}
                >
                  {previewReadiness.tier}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Recovery: <strong className="text-blue-400">{previewReadiness.recoveryScore}%</strong> • Weight Consistency:{' '}
                <strong className="text-emerald-400">{previewReadiness.weightConsistencyScore}%</strong> • 7d Lifts:{' '}
                <strong className="text-sky-400">
                  {previewReadiness.workoutsCompleted7d}/{previewReadiness.targetWorkoutsPerWeek}
                </strong>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question 1: Sleep Hours */}
          <div className="space-y-2 bg-[#080f1d] p-3.5 rounded-2xl border border-slate-800/90">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span>1. Hours of Sleep Last Night</span>
              </span>
              <span className="font-mono font-black text-sm text-blue-400">
                {sleepHours} hrs
              </span>
            </div>

            <input
              type="range"
              min="3.5"
              max="10"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value))}
              className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />

            <div className="grid grid-cols-5 gap-1.5 pt-0.5">
              {[4.5, 5.5, 6.5, 7.5, 8.5].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSleepHours(preset)}
                  className={`py-1 rounded-lg text-[10px] font-mono font-bold border transition cursor-pointer ${
                    sleepHours === preset
                      ? 'bg-blue-600/30 border-blue-400 text-blue-200'
                      : 'bg-[#050a14] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset}h
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Sleep Restfulness / Quality */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 block">
              2. Sleep Quality &amp; Restfulness
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { val: 1, label: 'Poor' },
                { val: 2, label: 'Restless' },
                { val: 3, label: 'Normal' },
                { val: 4, label: 'Good' },
                { val: 5, label: 'Deep' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setSleepQuality(item.val as 1 | 2 | 3 | 4 | 5)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    sleepQuality === item.val
                      ? 'bg-blue-600 border-blue-400 text-white font-bold shadow-md shadow-blue-600/20'
                      : 'bg-[#060b14] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs font-mono font-black block">{item.val}</span>
                  <span className="text-[9px] block leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Muscle & Joint Soreness */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 block">
              3. Muscle &amp; Joint Soreness (DOMS)
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { val: 1, label: 'Fresh' },
                { val: 2, label: 'Mild' },
                { val: 3, label: 'Moderate' },
                { val: 4, label: 'Heavy' },
                { val: 5, label: 'Extreme' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setMuscleSoreness(item.val as 1 | 2 | 3 | 4 | 5)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    muscleSoreness === item.val
                      ? 'bg-blue-600 border-blue-400 text-white font-bold shadow-md shadow-blue-600/20'
                      : 'bg-[#060b14] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs font-mono font-black block">{item.val}</span>
                  <span className="text-[9px] block leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question 4: Patrol Shift Strain & Mental Stress */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 block">
              4. Patrol Shift Strain &amp; CNS Stress
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { val: 1, label: 'Calm' },
                { val: 2, label: 'Routine' },
                { val: 3, label: 'Active' },
                { val: 4, label: 'Heavy' },
                { val: 5, label: 'Critical' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setShiftStress(item.val as 1 | 2 | 3 | 4 | 5)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    shiftStress === item.val
                      ? 'bg-blue-600 border-blue-400 text-white font-bold shadow-md shadow-blue-600/20'
                      : 'bg-[#060b14] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs font-mono font-black block">{item.val}</span>
                  <span className="text-[9px] block leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question 5: Bodyweight & Resting HR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#080f1d] p-3.5 rounded-2xl border border-slate-800/90">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-400" />
                  <span>5. Scale Weight (lbs)</span>
                </label>
                <label className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={logWeightToday}
                    onChange={(e) => setLogWeightToday(e.target.checked)}
                    className="accent-emerald-500 rounded cursor-pointer"
                  />
                  <span>Log Today</span>
                </label>
              </div>
              <input
                type="number"
                step="0.1"
                disabled={!logWeightToday}
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="e.g. 185"
                className="w-full bg-[#050a14] border border-slate-700 focus:border-emerald-500 disabled:opacity-50 rounded-xl px-3 py-2 text-white text-xs font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Resting HR (Optional)</span>
              </label>
              <input
                type="number"
                value={restingHrInput}
                onChange={(e) => setRestingHrInput(e.target.value)}
                placeholder="e.g. 54 bpm"
                className="w-full bg-[#050a14] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-white text-xs font-mono font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Shift Fatigue Auto-Regulation Advisory if High Fatigue */}
          {isHighFatigue && (
            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-200/90 leading-relaxed">
                <strong className="text-amber-300 uppercase font-mono block">
                  Shift Fatigue Calibration Active
                </strong>
                High shift stress, soreness, or restricted sleep (&le;5.5h) detected. Mandate the{' '}
                <strong>DIME Warm-Up Protocol</strong> before training and utilize the AI Adaptation
                Engine&apos;s Bad Shift Protocol if needed.
              </div>
            </div>
          )}

          {savedBanner && (
            <div className="p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Daily Readiness Calibrated! Syncing profile...</span>
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-1">
            <button
              type="submit"
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white text-xs sm:text-sm font-black font-athletic uppercase tracking-wider shadow-lg shadow-blue-600/30 transition cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Log Today&apos;s Readiness &amp; Continue</span>
            </button>
            <p className="text-[10px] font-mono text-slate-400 text-center mt-2">
              Mandated once daily at first login • Calibrates your Tactical Readiness Index
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
