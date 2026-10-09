import React, { useState } from 'react';
import { 
  ShieldCheck, Activity, Scale, CheckCircle2, 
  Flame, Moon, AlertTriangle, ChevronRight, Plus, 
  Sparkles, RefreshCw, X, Heart, BatteryCharging, Zap, Info
} from 'lucide-react';
import { AthleteProfile, WorkoutSessionLog, RecoveryCheckIn, BodyweightEntry } from '../types';
import { calculateReadinessScore } from '../utils/readinessEngine';

interface ReadinessScoreCardProps {
  athlete: AthleteProfile;
  logs: WorkoutSessionLog[];
  onUpdateAthlete: (updated: AthleteProfile) => void;
  compact?: boolean;
}

export const ReadinessScoreCard: React.FC<ReadinessScoreCardProps> = ({
  athlete,
  logs,
  onUpdateAthlete,
  compact = false,
}) => {
  const readiness = calculateReadinessScore(athlete, logs);

  // Modal states
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

  // Weight form state
  const [inputWeight, setInputWeight] = useState<string>(
    athlete.weightLbs ? String(athlete.weightLbs) : '185'
  );
  const [inputWeightDate, setInputWeightDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [weightSaveMsg, setWeightSaveMsg] = useState<string | null>(null);

  // Recovery form state
  const [sleepHours, setSleepHours] = useState<number>(
    athlete.lastRecoveryCheckIn?.sleepHours || 7.5
  );
  const [sleepQuality, setSleepQuality] = useState<1 | 2 | 3 | 4 | 5>(
    athlete.lastRecoveryCheckIn?.sleepQuality || 4
  );
  const [muscleSoreness, setMuscleSoreness] = useState<1 | 2 | 3 | 4 | 5>(
    athlete.lastRecoveryCheckIn?.muscleSoreness || 2
  );
  const [shiftStress, setShiftStress] = useState<1 | 2 | 3 | 4 | 5>(
    athlete.lastRecoveryCheckIn?.shiftStress || 2
  );
  const [restingHrInput, setRestingHrInput] = useState<string>(
    athlete.restingHr ? String(athlete.restingHr) : '54'
  );
  const [recoverySaveMsg, setRecoverySaveMsg] = useState<string | null>(null);

  // Circular gauge circumference
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readiness.overallScore / 100) * circumference;

  // Meter color logic
  const getGaugeColor = (score: number) => {
    if (score >= 90) return '#10b981'; // emerald-500
    if (score >= 80) return '#3b82f6'; // blue-500
    if (score >= 70) return '#38bdf8'; // sky-400
    if (score >= 55) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(inputWeight);
    if (isNaN(parsed) || parsed <= 50 || parsed >= 500) return;

    const newEntry: BodyweightEntry = {
      id: `bw-${Date.now()}`,
      date: inputWeightDate,
      weightLbs: Math.round(parsed * 10) / 10,
    };

    const currentHistory = athlete.weightHistory || [];
    const updatedHistory = [newEntry, ...currentHistory.filter((w) => w.date !== inputWeightDate)];

    const updatedAthlete: AthleteProfile = {
      ...athlete,
      weightLbs: newEntry.weightLbs,
      weightHistory: updatedHistory,
    };

    onUpdateAthlete(updatedAthlete);
    setWeightSaveMsg(`Logged ${newEntry.weightLbs} lbs!`);
    setTimeout(() => {
      setWeightSaveMsg(null);
      setIsWeightModalOpen(false);
    }, 900);
  };

  const handleSaveRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const parsedHr = restingHrInput ? parseInt(restingHrInput, 10) : undefined;

    const newCheckIn: RecoveryCheckIn = {
      id: `rec-${Date.now()}`,
      date: today,
      sleepHours,
      sleepQuality,
      muscleSoreness,
      shiftStress,
      restingHr: !isNaN(parsedHr || NaN) ? parsedHr : undefined,
      createdAt: new Date().toISOString(),
    };

    const currentHistory = athlete.recoveryHistory || [];
    const updatedHistory = [newCheckIn, ...currentHistory.filter((r) => r.date !== today)];

    const updatedAthlete: AthleteProfile = {
      ...athlete,
      lastRecoveryCheckIn: newCheckIn,
      recoveryHistory: updatedHistory,
      restingHr: newCheckIn.restingHr || athlete.restingHr,
    };

    onUpdateAthlete(updatedAthlete);
    setRecoverySaveMsg('Daily Check-In Recorded!');
    setTimeout(() => {
      setRecoverySaveMsg(null);
      setIsRecoveryModalOpen(false);
    }, 900);
  };

  if (compact) {
    return (
      <div className="bg-[#0b1322] border border-blue-500/30 rounded-2xl p-3 shadow-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 -rotate-90">
              <circle
                cx="22"
                cy="22"
                r="18"
                stroke="#1e293b"
                strokeWidth="3.5"
                fill="none"
              />
              <circle
                cx="22"
                cy="22"
                r="18"
                stroke={getGaugeColor(readiness.overallScore)}
                strokeWidth="3.5"
                fill="none"
                strokeDasharray={2 * Math.PI * 18}
                strokeDashoffset={2 * Math.PI * 18 - (readiness.overallScore / 100) * (2 * Math.PI * 18)}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute text-xs font-mono font-black text-white">
              {readiness.overallScore}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-blue-400 font-bold">
                Readiness Index
              </span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border ${readiness.statusBadgeColor}`}>
                {readiness.tier.split(':')[0]}
              </span>
            </div>
            <span className="text-xs font-bold text-white block">
              {readiness.workoutsCompleted7d}/{readiness.targetWorkoutsPerWeek} Lifts • {readiness.recoveryScore}% Recovery
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsRecoveryModalOpen(true)}
            className="px-2 py-1 bg-blue-950/80 hover:bg-blue-900 border border-blue-500/40 text-blue-300 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
          >
            Check-In
          </button>
          <button
            type="button"
            onClick={() => setIsWeightModalOpen(true)}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
          >
            + Weight
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#0c1424] via-[#09101d] to-[#070d18] border-2 border-blue-500/35 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden space-y-4">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Deck: Readiness Index & Tier Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 shrink-0">
            <BatteryCharging className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-blue-400 font-athletic">
                Tactical Readiness Index
              </span>
              <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full font-mono border border-slate-800">
                Pillar Aggregate
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white font-athletic uppercase tracking-wide">
              Officer Preparedness &amp; Work Capacity
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black uppercase border shadow-sm ${readiness.statusBadgeColor}`}>
            {readiness.tier}
          </span>
        </div>
      </div>

      {/* Main Score Visual: Circular Gauge + Quick Insight */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center relative z-10">
        {/* Gauge Center */}
        <div className="md:col-span-5 lg:col-span-4 flex items-center justify-center sm:justify-start gap-4 p-3 bg-black/30 rounded-2xl border border-slate-800/80">
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg className="w-28 h-28 -rotate-90 drop-shadow-md">
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke="#1e293b"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke={getGaugeColor(readiness.overallScore)}
                strokeWidth="7"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-white font-mono leading-none tracking-tight">
                {readiness.overallScore}
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                / 100
              </span>
            </div>
          </div>

          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block">
              Readiness Status
            </span>
            <div className="text-sm font-black text-white font-athletic uppercase leading-tight truncate">
              {readiness.tier.split(':')[0]}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Weighted by recovery, weigh-in recency, and 7-day completion.
            </p>
          </div>
        </div>

        {/* Coach Tactical Advisory Box */}
        <div className="md:col-span-7 lg:col-span-8 p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/50 via-[#0a1220] to-[#070e1a] border border-blue-500/25 flex flex-col justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-300 font-athletic">
              Coach Aryan&apos;s Tactical Advisory
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {readiness.coachAdvisory}
          </p>
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
            <span>Weekly Lifts: <strong className="text-blue-400">{readiness.workoutsCompleted7d}/{readiness.targetWorkoutsPerWeek}</strong></span>
            <span>•</span>
            <span>Scale: <strong className="text-slate-200">{readiness.lastWeightLbs || athlete.weightLbs || '--'} lbs</strong></span>
            <span>•</span>
            <span>Sleep: <strong className="text-emerald-400">{readiness.hoursOfSleep ? `${readiness.hoursOfSleep}h` : 'Est.'}</strong></span>
          </div>
        </div>
      </div>

      {/* The 3 Core Pillars Visual Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
        {/* Pillar 1: Recovery (35%) */}
        <div className="p-3.5 rounded-2xl bg-[#09101d] border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between gap-3 shadow-md">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span>Recovery (35%)</span>
              </span>
              <span className="font-mono font-black text-sm text-blue-400">
                {readiness.recoveryScore}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${readiness.recoveryScore}%` }}
              />
            </div>

            <div className="mt-2.5 space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Sleep Duration:</span>
                <span className="text-slate-200 font-mono font-bold">
                  {readiness.hoursOfSleep ? `${readiness.hoursOfSleep} hrs` : '7.5 hrs (Est)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Check-In:</span>
                <span className="text-slate-200 font-mono">
                  {readiness.lastRecoveryDate ? readiness.lastRecoveryDate : 'None yet'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsRecoveryModalOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>Daily Recovery Check-In</span>
          </button>
        </div>

        {/* Pillar 2: Weight Logging Consistency (30%) */}
        <div className="p-3.5 rounded-2xl bg-[#09101d] border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between gap-3 shadow-md">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                <span>Weight Consistency (30%)</span>
              </span>
              <span className="font-mono font-black text-sm text-emerald-400">
                {readiness.weightConsistencyScore}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${readiness.weightConsistencyScore}%` }}
              />
            </div>

            <div className="mt-2.5 space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Current Weight:</span>
                <span className="text-slate-200 font-mono font-bold">
                  {readiness.lastWeightLbs || athlete.weightLbs || 185} lbs
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Logged:</span>
                <span className="text-slate-200 font-mono">
                  {readiness.daysSinceLastWeight === 0 
                    ? 'Today' 
                    : readiness.daysSinceLastWeight === 1 
                    ? 'Yesterday' 
                    : readiness.daysSinceLastWeight && readiness.daysSinceLastWeight < 90
                    ? `${readiness.daysSinceLastWeight}d ago`
                    : 'Initial Setup'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsWeightModalOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Log Scale Weight</span>
          </button>
        </div>

        {/* Pillar 3: Workout Completion Rates (35%) */}
        <div className="p-3.5 rounded-2xl bg-[#09101d] border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between gap-3 shadow-md">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-sky-400" />
                <span>Workout Completion (35%)</span>
              </span>
              <span className="font-mono font-black text-sm text-sky-400">
                {readiness.workoutCompletionScore}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${readiness.workoutCompletionScore}%` }}
              />
            </div>

            <div className="mt-2.5 space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>7-Day Volume:</span>
                <span className="text-slate-200 font-mono font-bold">
                  {readiness.workoutsCompleted7d} / {readiness.targetWorkoutsPerWeek} Target
                </span>
              </div>
              <div className="flex justify-between">
                <span>Training Cadence:</span>
                <span className="text-slate-200 font-mono">
                  {readiness.workoutStreak > 0 ? `${readiness.workoutStreak}-Cycle Streak` : 'Active'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <span className="text-[10px] font-mono text-slate-400">
              {readiness.workoutsCompleted7d >= readiness.targetWorkoutsPerWeek
                ? 'Target Met: Full Stimulus Achieved'
                : `${readiness.targetWorkoutsPerWeek - readiness.workoutsCompleted7d} session(s) remaining this week`}
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* MODAL 1: LOG BODYWEIGHT POPUP                                     */}
      {/* ================================================================= */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-[#0a1120] border border-blue-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white font-athletic uppercase">
                  Log Bodyweight
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsWeightModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWeight} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Scale Weight (lbs)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  placeholder="e.g. 185.5"
                  className="w-full bg-[#060b14] border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white text-base font-mono font-bold focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={inputWeightDate}
                  onChange={(e) => setInputWeightDate(e.target.value)}
                  className="w-full bg-[#060b14] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none"
                />
              </div>

              {weightSaveMsg && (
                <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{weightSaveMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWeightModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black font-athletic uppercase tracking-wider shadow-md"
                >
                  Save Weight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 2: DAILY RECOVERY CHECK-IN POPUP                            */}
      {/* ================================================================= */}
      {isRecoveryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-md bg-[#0a1120] border border-blue-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <div>
                  <h4 className="text-sm font-black text-white font-athletic uppercase">
                    Daily Tactical Recovery Check-In
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    20-second shift fatigue calibration
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRecoveryModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecovery} className="space-y-4">
              {/* 1. Sleep Hours */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300">1. Sleep Duration</span>
                  <span className="font-mono font-bold text-blue-400">{sleepHours} hours</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="10"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>&lt; 5h (Critical)</span>
                  <span>7.5h (Optimal)</span>
                  <span>9h+ (High)</span>
                </div>
              </div>

              {/* 2. Sleep Quality */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  2. Sleep Restfulness / Quality
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
                      onClick={() => setSleepQuality(item.val as any)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        sleepQuality === item.val
                          ? 'bg-blue-600 border-blue-400 text-white font-bold shadow-md'
                          : 'bg-[#060b14] border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-xs font-mono font-bold block">{item.val}</span>
                      <span className="text-[9px] block leading-tight">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Muscle Soreness */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  3. Muscle &amp; Joint Soreness
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
                      onClick={() => setMuscleSoreness(item.val as any)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        muscleSoreness === item.val
                          ? 'bg-blue-600 border-blue-400 text-white font-bold shadow-md'
                          : 'bg-[#060b14] border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-xs font-mono font-bold block">{item.val}</span>
                      <span className="text-[9px] block leading-tight">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Shift Stress / Fatigue */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  4. Shift Strain &amp; Mental Stress
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
                      onClick={() => setShiftStress(item.val as any)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        shiftStress === item.val
                          ? 'bg-blue-600 border-blue-400 text-white font-bold shadow-md'
                          : 'bg-[#060b14] border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-xs font-mono font-bold block">{item.val}</span>
                      <span className="text-[9px] block leading-tight">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Optional Resting HR */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Morning Resting HR <span className="text-slate-500 font-normal">(Optional, bpm)</span>
                </label>
                <input
                  type="number"
                  value={restingHrInput}
                  onChange={(e) => setRestingHrInput(e.target.value)}
                  placeholder="e.g. 52"
                  className="w-full bg-[#060b14] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none"
                />
              </div>

              {recoverySaveMsg && (
                <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{recoverySaveMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRecoveryModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black font-athletic uppercase tracking-wider shadow-lg shadow-blue-600/30"
                >
                  Save Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
