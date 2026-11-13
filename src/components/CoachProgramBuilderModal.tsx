import React, { useState, useEffect } from 'react';
import {
  X, Plus, Trash2, Check, Layers, Clock, Dumbbell, Zap,
  Flame, Calendar, ArrowUp, ArrowDown, ShieldCheck, Save, Sparkles, Copy
} from 'lucide-react';
import {
  WorkoutProgram,
  ProgramScheduleDay,
  ExerciseTemplate,
  MuscleGroup,
  WorkoutFormat,
  SupersetMovementItem,
  BlockMovementItem,
} from '../types';

interface CoachProgramBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProgram?: WorkoutProgram | null;
  onSaveProgram: (program: WorkoutProgram) => Promise<void>;
  userEmail?: string;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  'Full Body',
  'Chest',
  'Back',
  'Quads',
  'Hamstrings & Glutes',
  'Shoulders',
  'Arms',
  'Core',
];

const CATEGORIES: WorkoutProgram['category'][] = [
  'Hybrid',
  'Strength',
  'Hypertrophy',
  'Athletic Conditioning',
  'Power',
];

function createDefaultBlock(format: WorkoutFormat, index: number): ExerciseTemplate {
  const uid = `coach-blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${index}`;
  if (format === 'superset') {
    const movA: SupersetMovementItem = {
      name: 'Incline Dumbbell Bench Press',
      targetReps: '8-10',
      muscleGroup: 'Chest',
    };
    const movB: SupersetMovementItem = {
      name: 'Chest-Supported Dumbbell Row',
      targetReps: '10-12',
      muscleGroup: 'Back',
    };
    return {
      id: uid,
      name: `${movA.name} + ${movB.name}`,
      muscleGroup: 'Full Body',
      defaultSets: 4,
      targetReps: '8-10 / 10-12',
      targetRpe: 8,
      restPeriodSeconds: 75,
      type: 'superset',
      format: 'superset',
      supersetExercises: [movA, movB],
      notes: 'Move directly from A1 to A2 with zero rest, then rest between rounds.',
    };
  }

  if (format === 'emom') {
    const movements: BlockMovementItem[] = [
      { name: 'Kettlebell Swings', targetReps: '15 reps', muscleGroup: 'Hamstrings & Glutes' },
      { name: 'Push-Ups', targetReps: '12 reps', muscleGroup: 'Chest' },
    ];
    return {
      id: uid,
      name: 'Tactical Work-Capacity EMOM',
      muscleGroup: 'Full Body',
      defaultSets: 10,
      targetReps: '10 Min EMOM',
      targetRpe: 8.5,
      restPeriodSeconds: 0,
      type: 'emom',
      format: 'emom',
      emomMinutes: 10,
      emomIntervalSeconds: 60,
      emomMovements: movements,
      notes: 'Complete prescribed work at the top of every minute; remaining time is rest.',
    };
  }

  if (format === 'amrap') {
    const movements: BlockMovementItem[] = [
      { name: 'Thrusters (95/65 lbs or DBs)', targetReps: '10 reps', muscleGroup: 'Full Body' },
      { name: 'Pull-Ups or Inverted Rows', targetReps: '8 reps', muscleGroup: 'Back' },
      { name: 'Calorie Row or 200m Run', targetReps: '12 cal', muscleGroup: 'Full Body' },
    ];
    return {
      id: uid,
      name: 'Patrol Readiness AMRAP',
      muscleGroup: 'Full Body',
      defaultSets: 1,
      targetReps: '12 Min AMRAP',
      targetRpe: 8.5,
      restPeriodSeconds: 120,
      type: 'amrap',
      format: 'amrap',
      amrapDurationMinutes: 12,
      amrapMovements: movements,
      notes: 'Steady crisp pacing through full rounds; track total completed rounds + extra reps.',
    };
  }

  if (format === 'circuit') {
    const stations = [
      'Heavy Sled Push or Goblet Squats (40s)',
      'Battle Ropes or Slam Ball Slams (40s)',
      'Farmer Carry March (40s)',
      'Plank Shoulder Taps (40s)',
    ];
    return {
      id: uid,
      name: 'Combat Chassis Tactical Circuit',
      muscleGroup: 'Full Body',
      defaultSets: 4,
      targetReps: '4 Rounds (40s Work / 20s Rest)',
      targetRpe: 8.5,
      restPeriodSeconds: 60,
      type: 'circuit',
      format: 'circuit',
      workSeconds: 40,
      restSeconds: 20,
      circuitStations: stations,
      notes: 'Rotate cleanly station to station; take full 60s recovery after finishing all stations.',
    };
  }

  return {
    id: uid,
    name: 'Trap Bar Deadlift',
    muscleGroup: 'Hamstrings & Glutes',
    defaultSets: 4,
    targetReps: '6-8',
    targetRpe: 8,
    restPeriodSeconds: 120,
    type: 'strength',
    format: 'straight',
    notes: 'Explosive concentric pull, controlled 2s eccentric.',
  };
}

export const CoachProgramBuilderModal: React.FC<CoachProgramBuilderModalProps> = ({
  isOpen,
  onClose,
  initialProgram,
  onSaveProgram,
  userEmail,
}) => {
  const [programKind, setProgramKind] = useState<'program' | 'single_workout'>('program');
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [category, setCategory] = useState<WorkoutProgram['category']>('Hybrid');
  const [frequency, setFrequency] = useState<string>('4 Days / Week');
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState<number>(60);
  const [description, setDescription] = useState<string>('');
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [allowAiAdaptation, setAllowAiAdaptation] = useState<boolean>(true);

  const [days, setDays] = useState<ProgramScheduleDay[]>([
    {
      day: 1,
      focus: 'Day 1: Upper Armor & Conditioning',
      warmup: '5 min Row/Bike + Band Pull-Aparts 2x20 + Scap Push-Ups 2x12',
      conditioning: '',
      isRestDay: false,
      exercises: [createDefaultBlock('straight', 0)],
    },
  ]);
  const [activeDayIdx, setActiveDayIdx] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    if (initialProgram) {
      setProgramKind(initialProgram.programKind || (initialProgram.schedule && initialProgram.schedule.length > 1 ? 'program' : 'single_workout'));
      setTitle(initialProgram.title || '');
      setSubtitle(initialProgram.subtitle || '');
      setCategory(initialProgram.category || 'Hybrid');
      setFrequency(initialProgram.frequency || '4 Days / Week');
      setEstimatedDurationMinutes(initialProgram.estimatedDurationMinutes || 60);
      setDescription(initialProgram.description || '');
      setIsPublished(initialProgram.isPublished !== false);
      setAllowAiAdaptation(initialProgram.allowAiAdaptation !== false);

      if (initialProgram.schedule && initialProgram.schedule.length > 0) {
        setDays(
          initialProgram.schedule.map((d, idx) => ({
            ...d,
            day: d.day || idx + 1,
            exercises: d.exercises || [],
          }))
        );
      } else {
        setDays([
          {
            day: 1,
            focus: initialProgram.title || 'Coach Custom Workout',
            isRestDay: false,
            exercises: initialProgram.exercises || [createDefaultBlock('straight', 0)],
          },
        ]);
      }
      setActiveDayIdx(0);
    } else {
      setProgramKind('program');
      setTitle('');
      setSubtitle('');
      setCategory('Hybrid');
      setFrequency('4 Days / Week');
      setEstimatedDurationMinutes(60);
      setDescription('');
      setIsPublished(true);
      setAllowAiAdaptation(true);
      setDays([
        {
          day: 1,
          focus: 'Day 1: Strength & Conditioning',
          warmup: '5 min dynamic prep + activation',
          conditioning: '',
          isRestDay: false,
          exercises: [createDefaultBlock('straight', 0)],
        },
      ]);
      setActiveDayIdx(0);
    }
  }, [isOpen, initialProgram]);

  if (!isOpen) return null;

  const safeDayIdx = Math.min(activeDayIdx, Math.max(0, days.length - 1));
  const currentDay = days[safeDayIdx];

  const updateCurrentDay = (updater: (d: ProgramScheduleDay) => ProgramScheduleDay) => {
    setDays((prev) => prev.map((d, i) => (i === safeDayIdx ? updater(d) : d)));
  };

  const handleAddDay = (duplicateCurrent = false) => {
    setDays((prev) => {
      const nextNum = prev.length + 1;
      const newDay: ProgramScheduleDay = duplicateCurrent && currentDay
        ? {
            ...currentDay,
            day: nextNum,
            focus: `Day ${nextNum}: ${currentDay.focus.replace(/^Day\s*\d+\s*[:•-]\s*/i, '')}`,
            exercises: currentDay.exercises.map((ex, i) => ({
              ...ex,
              id: `coach-blk-${Date.now()}-${nextNum}-${i}`,
            })),
          }
        : {
            day: nextNum,
            focus: `Day ${nextNum}: Training Session`,
            warmup: '',
            conditioning: '',
            isRestDay: false,
            exercises: [createDefaultBlock('straight', nextNum)],
          };
      const updated = [...prev, newDay];
      setActiveDayIdx(updated.length - 1);
      return updated;
    });
  };

  const handleDeleteDay = (idx: number) => {
    if (days.length <= 1) return;
    setDays((prev) => {
      const filtered = prev
        .filter((_, i) => i !== idx)
        .map((d, i) => ({ ...d, day: i + 1 }));
      setActiveDayIdx(Math.max(0, Math.min(idx, filtered.length - 1)));
      return filtered;
    });
  };

  const handleAddBlock = (format: WorkoutFormat) => {
    updateCurrentDay((d) => ({
      ...d,
      isRestDay: false,
      exercises: [...d.exercises, createDefaultBlock(format, d.exercises.length)],
    }));
  };

  const handleUpdateBlock = (exIdx: number, patch: Partial<ExerciseTemplate>) => {
    updateCurrentDay((d) => ({
      ...d,
      exercises: d.exercises.map((ex, i) => (i === exIdx ? { ...ex, ...patch } : ex)),
    }));
  };

  const handleMoveBlock = (exIdx: number, direction: -1 | 1) => {
    updateCurrentDay((d) => {
      const target = exIdx + direction;
      if (target < 0 || target >= d.exercises.length) return d;
      const copy = [...d.exercises];
      const temp = copy[exIdx];
      copy[exIdx] = copy[target];
      copy[target] = temp;
      return { ...d, exercises: copy };
    });
  };

  const handleDeleteBlock = (exIdx: number) => {
    updateCurrentDay((d) => ({
      ...d,
      exercises: d.exercises.filter((_, i) => i !== exIdx),
    }));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a program or workout title.');
      return;
    }

    const effectiveDays =
      programKind === 'single_workout' ? [days[0]] : days;

    const hasAnyBlock = effectiveDays.some((d) => !d.isRestDay && d.exercises.length > 0);
    if (!hasAnyBlock) {
      setErrorMsg('Please add at least one exercise block to an active training day.');
      return;
    }

    setErrorMsg(null);
    setIsSaving(true);
    try {
      const firstActiveDay =
        effectiveDays.find((d) => !d.isRestDay && d.exercises.length > 0) || effectiveDays[0];

      const cleanId =
        initialProgram?.id ||
        `coach_${programKind === 'single_workout' ? 'wod' : 'prog'}_${Date.now()}`;

      const payload: WorkoutProgram = {
        id: cleanId,
        title: title.trim(),
        subtitle:
          subtitle.trim() ||
          (programKind === 'single_workout'
            ? 'Coach Risner Standalone Duty Session'
            : `Coach Risner Custom ${effectiveDays.length}-Day Program`),
        category,
        frequency:
          programKind === 'single_workout'
            ? 'Single Workout Session'
            : frequency.trim() || `${effectiveDays.filter((d) => !d.isRestDay).length} Days / Week`,
        estimatedDurationMinutes: Math.max(10, Math.min(240, estimatedDurationMinutes || 60)),
        description:
          description.trim() ||
          'Built in the Patrol Ready Coach Architect supporting Straight Sets, Supersets, EMOM, AMRAP, and Tactical Circuits.',
        exercises: firstActiveDay.exercises,
        schedule: effectiveDays.map((d, i) => ({
          ...d,
          day: i + 1,
          exercises: d.isRestDay ? [] : d.exercises,
        })),
        programKind,
        isCoachPublished: true,
        isPublished,
        allowAiAdaptation,
        createdByEmail: userEmail || 'risneraryan@gmail.com',
        createdAt: initialProgram?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSaveProgram(payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save custom program to Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#0b121e] border border-blue-500/40 rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  Coach Exclusive Builder
                </span>
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  {userEmail || 'risneraryan@gmail.com'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white font-athletic uppercase tracking-wide truncate mt-0.5">
                {initialProgram ? 'Edit Coach Program / Workout' : 'Create Custom Program or Single Workout'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Builder Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#070b14]">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-200 font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Type & Publishing Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-[#0b121e] border border-slate-800 rounded-2xl p-4">
            <div className="lg:col-span-5 space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Build Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProgramKind('program')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold font-athletic uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    programKind === 'program'
                      ? 'bg-blue-600 text-white border-blue-400 shadow'
                      : 'bg-[#070c14] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Multi-Day Program
                </button>
                <button
                  type="button"
                  onClick={() => setProgramKind('single_workout')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold font-athletic uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    programKind === 'single_workout'
                      ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow'
                      : 'bg-[#070c14] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Single Workout
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#070c14] border border-slate-800 cursor-pointer hover:border-blue-500/40">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="mt-0.5 accent-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Publish to All Athletes
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Makes this visible in Workouts for every signed-in user.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#070c14] border border-slate-800 cursor-pointer hover:border-blue-500/40">
                <input
                  type="checkbox"
                  checked={allowAiAdaptation}
                  onChange={(e) => setAllowAiAdaptation(e.target.checked)}
                  className="mt-0.5 accent-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Allow AI Adaptation Engine
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Users can adapt sets, reps, injuries &amp; equipment via Adaptive AI.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Program Metadata */}
          <div className="bg-[#0b121e] border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1 font-bold">
                  {programKind === 'single_workout' ? 'Workout Title *' : 'Program Title *'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={programKind === 'single_workout' ? 'e.g. Shift-Ready Upper Superset & EMOM' : 'e.g. 6-Week SWAT Work Capacity Block'}
                  className="w-full bg-[#070c14] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1 font-bold">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as WorkoutProgram['category'])}
                  className="w-full bg-[#070c14] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1 font-bold">
                  Est. Duration (Mins)
                </label>
                <input
                  type="number"
                  min="10"
                  max="240"
                  value={estimatedDurationMinutes}
                  onChange={(e) => setEstimatedDurationMinutes(parseInt(e.target.value, 10) || 45)}
                  className="w-full bg-[#070c14] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1 font-bold">
                  Subtitle / Coaching Focus
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Heavy Barbell + Paired Supersets + 12-Min AMRAP Finisher"
                  className="w-full bg-[#070c14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              {programKind === 'program' && (
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1 font-bold">
                    Weekly Frequency
                  </label>
                  <input
                    type="text"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder="4 Days / Week"
                    className="w-full bg-[#070c14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1 font-bold">
                Program / Session Notes &amp; Intent
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain intended stimulus, pacing, or duty carry-over..."
                className="w-full bg-[#070c14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Day Selector (for Multi-Day Programs) */}
          {programKind === 'program' && (
            <div className="bg-[#0b121e] border border-slate-800 rounded-2xl p-3.5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-athletic font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Training Days ({days.length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddDay(true)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-blue-400" />
                    Duplicate Day
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDay(false)}
                    className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Day
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {days.map((d, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveDayIdx(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      idx === safeDayIdx
                        ? 'bg-blue-600 text-white border-blue-400 shadow'
                        : 'bg-[#070c14] text-slate-300 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <span>Day {d.day}</span>
                    {d.isRestDay && <span className="text-[10px] opacity-75">(Rest)</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Day Editor */}
          {currentDay && (
            <div className="bg-[#0b121e] border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex-1 min-w-[220px]">
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1 font-bold">
                    {programKind === 'single_workout' ? 'Session Focus Header' : `Day ${currentDay.day} Focus`}
                  </label>
                  <input
                    type="text"
                    value={currentDay.focus}
                    onChange={(e) => updateCurrentDay((d) => ({ ...d, focus: e.target.value }))}
                    className="w-full bg-[#070c14] border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {programKind === 'program' && (
                  <div className="flex items-center gap-2 self-end">
                    <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#070c14] border border-slate-700 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(currentDay.isRestDay)}
                        onChange={(e) => updateCurrentDay((d) => ({ ...d, isRestDay: e.target.checked }))}
                        className="accent-blue-500"
                      />
                      Rest Day
                    </label>
                    {days.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDay(safeDayIdx)}
                        className="p-2 rounded-xl bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-700/50 cursor-pointer"
                        title="Remove Day"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {!currentDay.isRestDay && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Warm-Up Prescription (Optional)
                      </label>
                      <input
                        type="text"
                        value={currentDay.warmup || ''}
                        onChange={(e) => updateCurrentDay((d) => ({ ...d, warmup: e.target.value }))}
                        placeholder="e.g. 5 min Zone 2 Row + Hip Flow"
                        className="w-full bg-[#070c14] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Additional Conditioning Note (Optional)
                      </label>
                      <input
                        type="text"
                        value={currentDay.conditioning || ''}
                        onChange={(e) => updateCurrentDay((d) => ({ ...d, conditioning: e.target.value }))}
                        placeholder="e.g. Cool-down 10 min incline walk"
                        className="w-full bg-[#070c14] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Add Format Block Toolbar */}
                  <div className="p-3 rounded-xl bg-[#070c14] border border-slate-800 space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                      + Add Training Block
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddBlock('straight')}
                        className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/35 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Dumbbell className="w-3.5 h-3.5" />
                        + Straight Sets
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddBlock('superset')}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        + Superset (A1/A2)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddBlock('emom')}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        + EMOM
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddBlock('amrap')}
                        className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/35 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        + AMRAP
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddBlock('circuit')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        + Circuit
                      </button>
                    </div>
                  </div>

                  {/* Block Editors */}
                  <div className="space-y-3">
                    {currentDay.exercises.map((block, bIdx) => {
                      const fmt: WorkoutFormat = block.format || (block.type === 'circuit' ? 'circuit' : block.type === 'superset' ? 'superset' : block.type === 'emom' ? 'emom' : block.type === 'amrap' ? 'amrap' : 'straight');

                      return (
                        <div
                          key={block.id || bIdx}
                          className="p-3.5 rounded-2xl bg-[#070c14] border border-slate-700/80 space-y-3"
                        >
                          {/* Block Header */}
                          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-slate-400">#{bIdx + 1}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-athletic font-bold uppercase tracking-wider border ${
                                  fmt === 'superset'
                                    ? 'bg-indigo-950 text-indigo-300 border-indigo-500/40'
                                    : fmt === 'emom'
                                    ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                                    : fmt === 'amrap'
                                    ? 'bg-red-950 text-red-300 border-red-500/40'
                                    : fmt === 'circuit'
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                                    : 'bg-blue-950 text-blue-300 border-blue-500/40'
                                }`}
                              >
                                {fmt === 'straight' ? 'Straight Sets' : fmt.toUpperCase()}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={bIdx === 0}
                                onClick={() => handleMoveBlock(bIdx, -1)}
                                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={bIdx === currentDay.exercises.length - 1}
                                onClick={() => handleMoveBlock(bIdx, 1)}
                                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBlock(bIdx)}
                                className="p-1.5 text-slate-500 hover:text-red-400 cursor-pointer"
                                title="Remove Block"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* 1. STRAIGHT SETS */}
                          {fmt === 'straight' && (
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                              <div className="sm:col-span-4">
                                <label className="text-[10px] font-mono text-slate-400 block mb-1">Exercise Name</label>
                                <input
                                  type="text"
                                  value={block.name}
                                  onChange={(e) => handleUpdateBlock(bIdx, { name: e.target.value })}
                                  className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="text-[10px] font-mono text-slate-400 block mb-1">Muscle Group</label>
                                <select
                                  value={block.muscleGroup}
                                  onChange={(e) => handleUpdateBlock(bIdx, { muscleGroup: e.target.value as MuscleGroup })}
                                  className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                                >
                                  {MUSCLE_GROUPS.map((mg) => (
                                    <option key={mg} value={mg}>{mg}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="sm:col-span-1">
                                <label className="text-[10px] font-mono text-slate-400 block mb-1">Sets</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="12"
                                  value={block.defaultSets}
                                  onChange={(e) => handleUpdateBlock(bIdx, { defaultSets: parseInt(e.target.value, 10) || 1 })}
                                  className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="text-[10px] font-mono text-slate-400 block mb-1">Target Reps</label>
                                <input
                                  type="text"
                                  value={block.targetReps}
                                  onChange={(e) => handleUpdateBlock(bIdx, { targetReps: e.target.value })}
                                  placeholder="8-10"
                                  className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="text-[10px] font-mono text-slate-400 block mb-1">Rest (sec)</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="15"
                                  value={block.restPeriodSeconds}
                                  onChange={(e) => handleUpdateBlock(bIdx, { restPeriodSeconds: parseInt(e.target.value, 10) || 0 })}
                                  className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center"
                                />
                              </div>
                              <div className="sm:col-span-1">
                                <label className="text-[10px] font-mono text-slate-400 block mb-1">RPE</label>
                                <input
                                  type="number"
                                  step="0.5"
                                  min="5"
                                  max="10"
                                  value={block.targetRpe ?? 8}
                                  onChange={(e) => handleUpdateBlock(bIdx, { targetRpe: parseFloat(e.target.value) || 8 })}
                                  className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center"
                                />
                              </div>
                            </div>
                          )}

                          {/* 2. SUPERSET BUILDER */}
                          {fmt === 'superset' && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                                <div className="sm:col-span-6">
                                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Superset Group Title</label>
                                  <input
                                    type="text"
                                    value={block.name}
                                    onChange={(e) => handleUpdateBlock(bIdx, { name: e.target.value })}
                                    className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Rounds / Sets</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={block.defaultSets}
                                    onChange={(e) => handleUpdateBlock(bIdx, { defaultSets: parseInt(e.target.value, 10) || 3 })}
                                    className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center"
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Rest Between Rnds (s)</label>
                                  <input
                                    type="number"
                                    step="15"
                                    value={block.restPeriodSeconds}
                                    onChange={(e) => handleUpdateBlock(bIdx, { restPeriodSeconds: parseInt(e.target.value, 10) || 60 })}
                                    className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center"
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Target RPE</label>
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="5"
                                    max="10"
                                    value={block.targetRpe ?? 8}
                                    onChange={(e) => handleUpdateBlock(bIdx, { targetRpe: parseFloat(e.target.value) || 8 })}
                                    className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2 pl-2 border-l-2 border-indigo-500/50">
                                {(block.supersetExercises || []).map((sub, sIdx) => (
                                  <div key={sIdx} className="grid grid-cols-12 gap-2 items-center">
                                    <span className="col-span-1 text-[11px] font-mono font-bold text-indigo-300">
                                      A{sIdx + 1}
                                    </span>
                                    <input
                                      type="text"
                                      value={sub.name}
                                      placeholder="Movement name"
                                      onChange={(e) => {
                                        const next = [...(block.supersetExercises || [])];
                                        next[sIdx] = { ...next[sIdx], name: e.target.value };
                                        handleUpdateBlock(bIdx, {
                                          supersetExercises: next,
                                          name: next.map((m) => m.name).filter(Boolean).join(' + '),
                                          targetReps: next.map((m) => m.targetReps).join(' / '),
                                        });
                                      }}
                                      className="col-span-5 bg-[#0d1424] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                    />
                                    <select
                                      value={sub.muscleGroup || 'Full Body'}
                                      onChange={(e) => {
                                        const next = [...(block.supersetExercises || [])];
                                        next[sIdx] = { ...next[sIdx], muscleGroup: e.target.value as MuscleGroup };
                                        handleUpdateBlock(bIdx, { supersetExercises: next });
                                      }}
                                      className="col-span-3 bg-[#0d1424] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                                    >
                                      {MUSCLE_GROUPS.map((mg) => (
                                        <option key={mg} value={mg}>{mg}</option>
                                      ))}
                                    </select>
                                    <input
                                      type="text"
                                      value={sub.targetReps}
                                      placeholder="Reps"
                                      onChange={(e) => {
                                        const next = [...(block.supersetExercises || [])];
                                        next[sIdx] = { ...next[sIdx], targetReps: e.target.value };
                                        handleUpdateBlock(bIdx, {
                                          supersetExercises: next,
                                          targetReps: next.map((m) => m.targetReps).join(' / '),
                                        });
                                      }}
                                      className="col-span-2 bg-[#0d1424] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center"
                                    />
                                    <div className="col-span-1 flex justify-end">
                                      {(block.supersetExercises?.length || 0) > 2 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const next = (block.supersetExercises || []).filter((_, i) => i !== sIdx);
                                            handleUpdateBlock(bIdx, {
                                              supersetExercises: next,
                                              name: next.map((m) => m.name).join(' + '),
                                            });
                                          }}
                                          className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}

                                {(block.supersetExercises?.length || 0) < 4 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [
                                        ...(block.supersetExercises || []),
                                        { name: 'Hanging Leg Raises', targetReps: '12', muscleGroup: 'Core' as MuscleGroup },
                                      ];
                                      handleUpdateBlock(bIdx, { supersetExercises: next });
                                    }}
                                    className="text-[11px] font-bold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" /> Add Paired Movement (Triset/Giant)
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* 3. EMOM BUILDER */}
                          {fmt === 'emom' && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                                <div className="sm:col-span-5">
                                  <label className="text-[10px] font-mono text-slate-400 block mb-1">EMOM Title</label>
                                  <input
                                    type="text"
                                    value={block.name}
                                    onChange={(e) => handleUpdateBlock(bIdx, { name: e.target.value })}
                                    className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Total Mins</label>
                                  <input
                                    type="number"
                                    min="2"
                                    max="60"
                                    value={block.emomMinutes ?? 10}
                                    onChange={(e) => {
                                      const mins = parseInt(e.target.value, 10) || 10;
                                      const intSec = block.emomIntervalSeconds || 60;
                                      handleUpdateBlock(bIdx, {
                                        emomMinutes: mins,
                                        defaultSets: Math.max(1, Math.round((mins * 60) / intSec)),
                                        targetReps: `${mins} Min EMOM`,
                                      });
                                    }}
                                    className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center"
                                  />
                                </div>
                                <div className="sm:col-span-3">
                                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Interval Cadence</label>
                                  <select
                                    value={block.emomIntervalSeconds ?? 60}
                                    onChange={(e) => {
                                      const intSec = parseInt(e.target.value, 10) || 60;
                                      const mins = block.emomMinutes || 10;
                                      handleUpdateBlock(bIdx, {
                                        emomIntervalSeconds: intSec,
                                        defaultSets: Math.max(1, Math.round((mins * 60) / intSec)),
                                      });
                                    }}
                                    className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                                  >
                                    <option value={60}>Every 60s (EMOM)</option>
                                    <option value={90}>Every 90s (E1.5MOM)</option>
                                    <option value={120}>Every 2:00 (E2MOM)</option>
                                    <option value={180}>Every 3:00 (E3MOM)</option>
                                  </select>
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Target RPE</label>
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="5"
                                    max="10"
                                    value={block.targetRpe ?? 8.5}
                                    onChange={(e) => handleUpdateBlock(bIdx, { targetRpe: parseFloat(e.target.value) || 8.5 })}
                                    className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1.5 pl-2 border-l-2 border-amber-500/50">
                                {(block.emomMovements || []).map((mov, mIdx) => (
                                  <div key={mIdx} className="grid grid-cols-12 gap-2 items-center">
                                    <input
                                      type="text"
                                      value={mov.name}
                                      placeholder="Movement / Station"
                                      onChange={(e) => {
                                        const next = [...(block.emomMovements || [])];
                                        next[mIdx] = { ...next[mIdx], name: e.target.value };
                                        handleUpdateBlock(bIdx, { emomMovements: next });
                                      }}
                                      className="col-span-7 bg-[#0d1424] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                    />
                                    <input
                                      type="text"
                                      value={mov.targetReps}
                                      placeholder="Reps / Cal"
                                      onChange={(e) => {
                                        const next = [...(block.emomMovements || [])];
                                        next[mIdx] = { ...next[mIdx], targetReps: e.target.value };
                                        handleUpdateBlock(bIdx, { emomMovements: next });
                                      }}
                                      className="col-span-4 bg-[#0d1424] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                                    />
                                    <div className="col-span-1 flex justify-end">
                                      {(block.emomMovements?.length || 0) > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const next = (block.emomMovements || []).filter((_, i) => i !== mIdx);
                                            handleUpdateBlock(bIdx, { emomMovements: next });
                                          }}
                                          className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [
                                      ...(block.emomMovements || []),
                                      { name: 'Burpees', targetReps: '10 reps', muscleGroup: 'Full Body' as MuscleGroup },
                                    ];
                                    handleUpdateBlock(bIdx, { emomMovements: next });
                                  }}
                                  className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" /> Add EMOM Movement
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 4. AMRAP BUILDER */}
                          {fmt === 'amrap' && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                                <div className="sm:col-span-6">
                                  <label className="text-[10px] font-mono text-slate-400 block mb-1">AMRAP Title</label>
                                  <input
                                    type="text"
                                    value={block.name}
                                    onChange={(e) => handleUpdateBlock(bIdx, { name: e.target.value })}
                                    className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                                  />
                                </div>
                                <div className="sm:col-span-3">
                                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Time Cap (Mins)</label>
                                  <input
                                    type="number"
                                    min="3"
                                    max="60"
                                    value={block.amrapDurationMinutes ?? 12}
                                    onChange={(e) => {
                                      const mins = parseInt(e.target.value, 10) || 12;
                                      handleUpdateBlock(bIdx, {
                                        amrapDurationMinutes: mins,
                                        targetReps: `${mins} Min AMRAP`,
                                      });
                                    }}
                                    className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center"
                                  />
                                </div>
                                <div className="sm:col-span-3">
                                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Target RPE</label>
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="5"
                                    max="10"
                                    value={block.targetRpe ?? 8.5}
                                    onChange={(e) => handleUpdateBlock(bIdx, { targetRpe: parseFloat(e.target.value) || 8.5 })}
                                    className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1.5 pl-2 border-l-2 border-red-500/50">
                                {(block.amrapMovements || []).map((mov, mIdx) => (
                                  <div key={mIdx} className="grid grid-cols-12 gap-2 items-center">
                                    <input
                                      type="text"
                                      value={mov.name}
                                      placeholder="Movement"
                                      onChange={(e) => {
                                        const next = [...(block.amrapMovements || [])];
                                        next[mIdx] = { ...next[mIdx], name: e.target.value };
                                        handleUpdateBlock(bIdx, { amrapMovements: next });
                                      }}
                                      className="col-span-7 bg-[#0d1424] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                    />
                                    <input
                                      type="text"
                                      value={mov.targetReps}
                                      placeholder="Reps / Dist"
                                      onChange={(e) => {
                                        const next = [...(block.amrapMovements || [])];
                                        next[mIdx] = { ...next[mIdx], targetReps: e.target.value };
                                        handleUpdateBlock(bIdx, { amrapMovements: next });
                                      }}
                                      className="col-span-4 bg-[#0d1424] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                                    />
                                    <div className="col-span-1 flex justify-end">
                                      {(block.amrapMovements?.length || 0) > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const next = (block.amrapMovements || []).filter((_, i) => i !== mIdx);
                                            handleUpdateBlock(bIdx, { amrapMovements: next });
                                          }}
                                          className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [
                                      ...(block.amrapMovements || []),
                                      { name: 'Box Step-Overs', targetReps: '12 reps', muscleGroup: 'Quads' as MuscleGroup },
                                    ];
                                    handleUpdateBlock(bIdx, { amrapMovements: next });
                                  }}
                                  className="text-[11px] font-bold text-red-300 hover:text-red-200 flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" /> Add AMRAP Movement
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 5. CIRCUIT BUILDER */}
                          {fmt === 'circuit' && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                                <div className="sm:col-span-4">
                                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Circuit Title</label>
                                  <input
                                    type="text"
                                    value={block.name}
                                    onChange={(e) => handleUpdateBlock(bIdx, { name: e.target.value })}
                                    className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Rounds</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={block.defaultSets}
                                    onChange={(e) => {
                                      const rounds = parseInt(e.target.value, 10) || 4;
                                      handleUpdateBlock(bIdx, {
                                        defaultSets: rounds,
                                        targetReps: `${rounds} Rounds (${block.workSeconds || 40}s Work / ${block.restSeconds || 20}s Rest)`,
                                      });
                                    }}
                                    className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center"
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Work (sec)</label>
                                  <input
                                    type="number"
                                    step="5"
                                    value={block.workSeconds ?? 40}
                                    onChange={(e) => {
                                      const w = parseInt(e.target.value, 10) || 40;
                                      handleUpdateBlock(bIdx, {
                                        workSeconds: w,
                                        targetReps: `${block.defaultSets} Rounds (${w}s Work / ${block.restSeconds || 20}s Rest)`,
                                      });
                                    }}
                                    className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center"
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Station Rest (s)</label>
                                  <input
                                    type="number"
                                    step="5"
                                    value={block.restSeconds ?? 20}
                                    onChange={(e) => {
                                      const r = parseInt(e.target.value, 10) || 20;
                                      handleUpdateBlock(bIdx, {
                                        restSeconds: r,
                                        targetReps: `${block.defaultSets} Rounds (${block.workSeconds || 40}s Work / ${r}s Rest)`,
                                      });
                                    }}
                                    className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center"
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Round Rest (s)</label>
                                  <input
                                    type="number"
                                    step="15"
                                    value={block.restPeriodSeconds}
                                    onChange={(e) => handleUpdateBlock(bIdx, { restPeriodSeconds: parseInt(e.target.value, 10) || 60 })}
                                    className="w-full bg-[#0d1424] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1.5 pl-2 border-l-2 border-emerald-500/50">
                                {(block.circuitStations || []).map((st, sIdx) => (
                                  <div key={sIdx} className="grid grid-cols-12 gap-2 items-center">
                                    <span className="col-span-1 text-[11px] font-mono font-bold text-emerald-400">
                                      S{sIdx + 1}
                                    </span>
                                    <input
                                      type="text"
                                      value={st}
                                      onChange={(e) => {
                                        const next = [...(block.circuitStations || [])];
                                        next[sIdx] = e.target.value;
                                        handleUpdateBlock(bIdx, { circuitStations: next });
                                      }}
                                      className="col-span-10 bg-[#0d1424] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                    />
                                    <div className="col-span-1 flex justify-end">
                                      {(block.circuitStations?.length || 0) > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const next = (block.circuitStations || []).filter((_, i) => i !== sIdx);
                                            handleUpdateBlock(bIdx, { circuitStations: next });
                                          }}
                                          className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [
                                      ...(block.circuitStations || []),
                                      'Assault Bike Sprint (40s)',
                                    ];
                                    handleUpdateBlock(bIdx, { circuitStations: next });
                                  }}
                                  className="text-[11px] font-bold text-emerald-300 hover:text-emerald-200 flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" /> Add Circuit Station
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Notes input shared across all formats */}
                          <div>
                            <input
                              type="text"
                              value={block.notes || ''}
                              onChange={(e) => handleUpdateBlock(bIdx, { notes: e.target.value })}
                              placeholder="Coaching cue / execution standard..."
                              className="w-full bg-[#0d1424] border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#0f172a] border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider font-athletic flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>
              {isSaving
                ? 'Saving...'
                : isPublished
                ? 'Save & Publish to Athletes'
                : 'Save as Coach Draft'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
