import React, { useState, useEffect } from 'react';
import { 
  X, Dumbbell, ShieldCheck, Flame, 
  Target, Clock, Calendar, CheckCircle2, AlertCircle, 
  ArrowRight, RotateCcw, Copy, Check, Play, Pause, Save, 
  Zap, Heart, Award, SlidersHorizontal, ChevronRight,
  Info, Loader2, RefreshCw, Activity, Compass, CheckSquare, Square, Timer
} from 'lucide-react';
import { WorkoutProgram, ExerciseTemplate, MuscleGroup, AthleteProfile } from '../types';
import { PatrolReadyCompanyEmblem } from './BrandingLogos';
import { soundManager } from '../utils/audio';
import { 
  generateSingleDayWorkoutClient, 
  SingleDayWorkoutRequest 
} from '../utils/aiWorkoutService';

import { useRestTimer } from '../hooks/useRestTimer';

interface AISingleDayWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartWorkout: (program: WorkoutProgram) => void;
  onSaveToCloud?: (program: WorkoutProgram) => Promise<void>;
  currentAthlete?: AthleteProfile;
  userEmail?: string;
}

export const AISingleDayWorkoutModal: React.FC<AISingleDayWorkoutModalProps> = ({
  isOpen,
  onClose,
  onStartWorkout,
  onSaveToCloud,
  currentAthlete,
  userEmail,
}) => {
  // Duration state (minutes)
  const [durationMinutes, setDurationMinutes] = useState<number>(45);

  // Workout type / focus
  const [workoutType, setWorkoutType] = useState<string>('Tactical Full-Body Density');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  // Equipment state
  const [equipment, setEquipment] = useState<string[]>([
    'Full Commercial Gym (Barbells, DBs, Cables, Machines)',
  ]);

  // Intensity state
  const [intensity, setIntensity] = useState<'High' | 'Moderate' | 'Low / Recovery'>('High');

  // Running & Cardio Circuit Integration State
  const [cardioPreference, setCardioPreference] = useState<'none' | 'running' | 'cardio_circuits' | 'hybrid'>('running');
  const [runningDistancePreference, setRunningDistancePreference] = useState<string>('1.5 Miles (Duty Standard)');
  const [cardioCircuitType, setCardioCircuitType] = useState<string>('Duty Tactical HIIT & Combat Intervals');

  // Injury & joint protection state
  const [selectedInjuries, setSelectedInjuries] = useState<string[]>(() => {
    const list: string[] = [];
    const qConstraints = currentAthlete?.questionnaire?.injuryConstraints || currentAthlete?.notes || '';
    if (/hip|labrum/i.test(qConstraints)) list.push('Torn Hip Labrum / FAI (Hip-Sparing)');
    if (/back|lumbar|disc|sciatica/i.test(qConstraints)) list.push('Lower Back / Lumbar Disc (Axial Deload)');
    if (/shoulder|rotator/i.test(qConstraints)) list.push('Shoulder Impingement / Rotator Cuff');
    if (/knee|patell|meniscus/i.test(qConstraints)) list.push('Knee Pain / Patellar Tendonitis');
    return list;
  });
  const [injuryNotes, setInjuryNotes] = useState<string>(() => {
    return currentAthlete?.questionnaire?.injuryConstraints || currentAthlete?.notes || '';
  });

  // UI / generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [generatedWorkout, setGeneratedWorkout] = useState<WorkoutProgram | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Dedicated, wall-clock synchronized rest timer for previewing / testing rest periods in single-day workout
  const {
    activeTimer: activeSingleTimer,
    startTimer: startSingleTimer,
    togglePauseResume: toggleSingleTimer,
    adjustRemaining: adjustSingleTimer,
    stopTimer: stopSingleTimer,
    updateTotalDuration: updateSingleTimerTotal,
  } = useRestTimer();

  const handleToggleSingleTimer = (exerciseName: string, defaultSecs: number) => {
    const cleanName = exerciseName.trim();
    const rawVal = parseInt(String(defaultSecs || 60), 10);
    const targetSecs = !isNaN(rawVal) && rawVal > 0 ? rawVal : 60;

    if (activeSingleTimer && activeSingleTimer.exerciseName === cleanName) {
      toggleSingleTimer(cleanName, targetSecs);
    } else {
      startSingleTimer(cleanName, targetSecs);
    }
  };

  const handleAdjustSingleTimerRemaining = (delta: number) => {
    adjustSingleTimer(delta);
  };

  const handleUpdateExerciseRestPeriod = (exIdx: number, newSeconds: number) => {
    const validSecs = Math.max(15, Math.min(300, newSeconds));
    if (!generatedWorkout || !generatedWorkout.exercises) return;

    const updatedExercises = [...generatedWorkout.exercises];
    const prevEx = updatedExercises[exIdx];
    updatedExercises[exIdx] = {
      ...prevEx,
      restPeriodSeconds: validSecs,
    };

    setGeneratedWorkout({
      ...generatedWorkout,
      exercises: updatedExercises,
    });

    if (activeSingleTimer && activeSingleTimer.exerciseName === prevEx.name) {
      updateSingleTimerTotal(validSecs);
    }
  };

  if (!isOpen) return null;

  const durationOptions = [
    { mins: 20, label: '20 Min', tag: 'Rapid Express' },
    { mins: 30, label: '30 Min', tag: 'Fast Burner' },
    { mins: 45, label: '45 Min', tag: 'Recommended' },
    { mins: 60, label: '60 Min', tag: 'Full Duty' },
    { mins: 75, label: '75 Min', tag: 'Heavy Volume' },
  ];

  const workoutTypeOptions = [
    {
      id: 'Tactical Full-Body Density',
      title: 'Full-Body Density & Armor',
      desc: 'Compound push, pull, squat, hinge, and duty core. Complete balanced work capacity.',
      badge: 'Balanced Duty',
      icon: ShieldCheck,
      color: 'blue',
    },
    {
      id: 'Upper Body Armor & Pump (Chest, Back, Arms)',
      title: 'Upper Body Armor & Pump',
      desc: 'Horizontal & vertical press/pull with dedicated bicep, tricep, and shoulder hypertrophy.',
      badge: 'Upper Armor',
      icon: Dumbbell,
      color: 'amber',
    },
    {
      id: 'Lower Body Power & Posterior Chain Overload',
      title: 'Leg Power & Posterior Chain',
      desc: 'Heavy knee flexion, hip hinge drive, hamstrings, and explosive single-leg stability.',
      badge: 'Chassis Power',
      icon: Activity,
      color: 'emerald',
    },
    {
      id: 'Explosive Foot Pursuit & Conditioning Intervals',
      title: 'Foot Pursuit & Conditioning',
      desc: 'Sprint intervals, VO2 anaerobic threshold, fast recovery pacing, and agility footwork.',
      badge: 'Cardio Engine',
      icon: Flame,
      color: 'red',
    },
    {
      id: 'Kettlebell & Dumbbell High-Density Circuit',
      title: 'Kettlebell / DB Functional Flow',
      desc: 'Non-stop metabolic complexes: clean & press, goblet squats, renegade rows, and carries.',
      badge: 'High Density',
      icon: Zap,
      color: 'orange',
    },
    {
      id: 'Bodyweight Duty Calisthenics & Tactical Core',
      title: 'Zero-Equipment Duty Calisthenics',
      desc: 'Hand-release push-ups, pull-ups, lunges, and isometric core tension with zero gym gear.',
      badge: 'No Equipment',
      icon: Target,
      color: 'sky',
    },
    {
      id: 'Combat Chassis: Ruck, Heavy Carries & Core',
      title: 'Combat Chassis & Heavy Carries',
      desc: 'Trap bar farmers walk, sandbag bear-hugs, suitcase carries, and structural load endurance.',
      badge: 'Grip & Frame',
      icon: Award,
      color: 'purple',
    },
    {
      id: 'Active Regeneration, Decompression & Mobility Flush',
      title: 'Active Regeneration & Mobility',
      desc: 'Low-impact heart rate elevation, joint decompression, hip capsule opening, and tissue flush.',
      badge: 'Recovery',
      icon: Heart,
      color: 'teal',
    },
  ];

  const equipmentOptions = [
    { id: 'Full Commercial Gym (Barbells, DBs, Cables, Machines)', label: 'Full Commercial Gym', desc: 'Barbells, dumbbells, cables, machines, racks' },
    { id: 'Dumbbells Only', label: 'Dumbbells Only', desc: 'Adjustable or fixed dumbbells and flat bench' },
    { id: 'Barbell & Squat Rack', label: 'Barbell & Rack', desc: 'Olympic barbell, weight plates, and squat rack' },
    { id: 'Kettlebells Only', label: 'Kettlebells Only', desc: 'Single or double kettlebells' },
    { id: 'Bodyweight & Pull-Up Bar Only', label: 'Bodyweight Only', desc: 'Zero weights, pull-up bar or floor only' },
    { id: 'Tactical Weight Vest / Ruck Pack (20-45 lbs)', label: 'Weight Vest / Ruck', desc: 'Loaded backpack or plate carrier' },
    { id: 'Cable Machine & Bands', label: 'Cables & Bands', desc: 'Functional cable crossover and resistance bands' },
    { id: 'Cardio Erg (Treadmill, Rower, Airdyne)', label: 'Cardio Ergs', desc: 'Treadmill, assault bike, concept2 rower' },
  ];

  const injuryOptions = [
    { id: 'Torn Hip Labrum / FAI (Hip-Sparing)', label: 'Hip Labrum / FAI', desc: 'Box squats to parallel, vertical shins, zero impingement.' },
    { id: 'Lower Back / Lumbar Disc (Axial Deload)', label: 'Lower Back / Disc', desc: 'Chest-supported rows, belt squats, zero axial spine compression.' },
    { id: 'Shoulder Impingement / Rotator Cuff', label: 'Shoulder Impingement', desc: 'Neutral-grip presses, floor presses, face pulls.' },
    { id: 'Knee Pain / Patellar Tendonitis', label: 'Knee / Tendon Safe', desc: 'Backward sled drags, box squats, vertical tibia angles.' },
  ];

  const toggleEquipment = (eqId: string) => {
    if (equipment.includes(eqId)) {
      if (equipment.length > 1) {
        setEquipment(equipment.filter((e) => e !== eqId));
      }
    } else {
      setEquipment([...equipment, eqId]);
    }
  };

  const toggleInjury = (injId: string) => {
    if (selectedInjuries.includes(injId)) {
      setSelectedInjuries(selectedInjuries.filter((i) => i !== injId));
    } else {
      setSelectedInjuries([...selectedInjuries, injId]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGenerationStep(1);

    const timer1 = setTimeout(() => setGenerationStep(2), 650);
    const timer2 = setTimeout(() => setGenerationStep(3), 1300);

    try {
      const workout = await generateSingleDayWorkoutClient({
        workoutType: showCustomInput && customPrompt.trim().length > 0 ? customPrompt.trim() : workoutType,
        durationMinutes,
        equipment,
        intensity,
        fitnessLevel: currentAthlete?.experienceLevel || 'Intermediate',
        injuries: selectedInjuries,
        injuryNotes,
        customPrompt: showCustomInput ? customPrompt.trim() : undefined,
        cardioPreference,
        runningDistancePreference: cardioPreference === 'running' || cardioPreference === 'hybrid' ? runningDistancePreference : undefined,
        cardioCircuitType: cardioPreference === 'cardio_circuits' || cardioPreference === 'hybrid' ? cardioCircuitType : undefined,
        userEmail,
      });

      if (!workout || !workout.exercises || workout.exercises.length === 0) {
        throw new Error('AI engine did not return exercises for this session.');
      }

      setGeneratedWorkout(workout);
      setIsSaved(false);
    } catch (err: any) {
      console.error('[AISingleDayWorkout] Generation error:', err);
      setError(err?.message || 'Failed to generate single-day workout. Please try again.');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsGenerating(false);
    }
  };

  const handleStartWorkoutNow = () => {
    if (!generatedWorkout) return;
    onStartWorkout(generatedWorkout);
    onClose();
  };

  const handleSaveWorkout = async () => {
    if (!generatedWorkout || !onSaveToCloud) return;
    setIsSaving(true);
    try {
      await onSaveToCloud(generatedWorkout);
      setIsSaved(true);
    } catch (err) {
      console.warn('[AISingleDayWorkout] Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0a0f1d] border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* TOP ACCENT BAR */}
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

        {/* MODAL HEADER */}
        <div className="p-4 sm:p-6 border-b border-slate-800/80 bg-gradient-to-r from-[#0d1627] via-[#0a0f1d] to-[#0d1627] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
              <div className="w-full h-full bg-[#0a0f1d] rounded-[14px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  On-Demand Session
                </span>
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  • Custom Duty Target
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white font-athletic uppercase tracking-wide truncate mt-0.5">
                Single-Day Workout Builder
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-slate-700">
          {!generatedWorkout ? (
            /* CONFIGURATION / INTAKE FORM */
            <div className="space-y-6">
              {/* INTRO CALLOUT */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-amber-950/30 border border-amber-500/30 flex items-start gap-3">
                <Target className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Stepping outside your regular weekly track today? Select how much time you have, the session focus you want, and your equipment on hand. You'll get an executable, calibrated session ready to launch into the live tracker immediately.
                </p>
              </div>

              {/* STEP 1: TIME AVAILABLE (DURATION) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5 font-athletic">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>1. How Much Time Do You Have Today?</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                    {durationMinutes} Minutes
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {durationOptions.map((opt) => {
                    const isSelected = durationMinutes === opt.mins;
                    return (
                      <button
                        key={opt.mins}
                        type="button"
                        onClick={() => setDurationMinutes(opt.mins)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-white shadow-md ring-1 ring-amber-400/50'
                            : 'bg-[#0f172a] border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        <span className="text-sm font-black font-athletic">{opt.label}</span>
                        <span className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                          {opt.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Range Slider for custom minutes */}
                <div className="pt-1 flex items-center gap-3">
                  <input
                    type="range"
                    min={15}
                    max={90}
                    step={5}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                    className="flex-1 accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    Custom: 15–90 min
                  </span>
                </div>
              </div>

              {/* STEP 2: WORKOUT VIBE / TYPE */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5 font-athletic">
                    <Target className="w-4 h-4 text-amber-400" />
                    <span>2. What Type of Workout Do You Want Today?</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(!showCustomInput)}
                    className="text-[11px] font-mono text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    {showCustomInput ? 'Select from list' : '+ Custom write-in'}
                  </button>
                </div>

                {showCustomInput ? (
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border-2 border-amber-500/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                        Custom Focus / Officer Prompt
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCustomInput(false)}
                        className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="e.g. Focus on chest, bicep peak, and rotational core. Use only dumbbells and keep heart rate elevated."
                      className="w-full bg-[#0a0f1d] border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none resize-none"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {workoutTypeOptions.map((opt) => {
                      const isSelected = workoutType === opt.id;
                      const IconComponent = opt.icon;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setWorkoutType(opt.id)}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? 'bg-amber-950/40 border-amber-400 shadow-md ring-1 ring-amber-400/50 text-white'
                              : 'bg-[#0f172a] border-slate-800/90 hover:border-slate-700 text-slate-300 hover:text-white'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'
                          }`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-black uppercase tracking-wide truncate font-athletic">
                                {opt.title}
                              </h4>
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${
                                isSelected ? 'bg-amber-500/30 text-amber-300' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {opt.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-snug">
                              {opt.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* STEP 3: EQUIPMENT ON HAND */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5 font-athletic">
                    <Dumbbell className="w-4 h-4 text-amber-400" />
                    <span>3. What Equipment Do You Have Today? (Select All That Apply)</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {equipment.length} Selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {equipmentOptions.map((opt) => {
                    const isSelected = equipment.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleEquipment(opt.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                          isSelected
                            ? 'bg-blue-950/50 border-blue-400 text-white shadow-sm ring-1 ring-blue-400/40'
                            : 'bg-[#0f172a] border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate text-slate-200">
                            {opt.label}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono truncate">
                            {opt.desc}
                          </span>
                        </div>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                          isSelected ? 'bg-blue-600 border-blue-400 text-white' : 'border-slate-700 bg-slate-900'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 4: INTENSITY & INJURY SAFETY CONTROLS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* INTENSITY */}
                <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5 font-athletic">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span>Intensity Level</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['High', 'Moderate', 'Low / Recovery'] as const).map((lvl) => {
                      const isSelected = intensity === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setIntensity(lvl)}
                          className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-black border-amber-400 font-black shadow-md'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {lvl === 'Low / Recovery' ? 'Low' : lvl}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {intensity === 'High' ? 'Target RPE 8-9: Maximum training stimulus & high density.' : intensity === 'Moderate' ? 'Target RPE 7-8: Steady-state volume, minimal nervous system fatigue.' : 'Target RPE 6: Joint-friendly recovery flush and light conditioning.'}
                  </span>
                </div>

                {/* INJURY SAFETY CHECKLIST */}
                <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5 font-athletic">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Joint Safety Restrictions</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {injuryOptions.map((opt) => {
                      const isSelected = selectedInjuries.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => toggleInjury(opt.id)}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border text-left transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-red-950/60 text-red-300 border-red-500/50'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          <span className="truncate">{opt.label}</span>
                          {isSelected && <Check className="w-3 h-3 text-red-400 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    AI strictly substitutes exercises (e.g. box squats for hip labrum, neutral grip for shoulders).
                  </span>
                </div>

                {/* CARDIO & RUNNING INTEGRATION */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1626] to-[#070b13] border border-blue-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 font-athletic">
                      <Activity className="w-3.5 h-3.5 text-sky-400" />
                      <span>Cardio &amp; Running Integration</span>
                    </label>
                    <span className="text-[10px] font-mono text-sky-300 font-bold px-2 py-0.5 rounded bg-sky-950/70 border border-sky-500/30">
                      Optional Cardio
                    </span>
                  </div>

                  {/* Cardio Option Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { id: 'running', label: 'Add Running', desc: 'Duty run or sprints' },
                      { id: 'cardio_circuits', label: 'Cardio Circuits', desc: 'HIIT & metabolic circuits' },
                      { id: 'hybrid', label: 'Hybrid Run + Circuit', desc: 'Running & circuit combo' },
                      { id: 'none', label: 'No Cardio', desc: 'Weights only' },
                    ].map((opt) => {
                      const isSelected = cardioPreference === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setCardioPreference(opt.id as any)}
                          className={`p-2 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-blue-950/80 border-blue-400 text-white ring-1 ring-blue-500/50'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[11px] font-bold uppercase font-athletic text-white">{opt.label}</span>
                            {isSelected && <Check className="w-3 h-3 text-blue-400 shrink-0" />}
                          </div>
                          <span className="text-[9px] text-slate-400 leading-tight block">{opt.desc}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Sub-options for Running */}
                  {(cardioPreference === 'running' || cardioPreference === 'hybrid') && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <label className="text-[10px] font-bold text-sky-300 uppercase font-mono block">
                        Target Run Distance / Style:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {[
                          '1.5 Miles (Duty Standard)',
                          '2.0 - 3.0 Miles (Aerobic Base)',
                          'Foot Pursuit Sprints (400m-800m Repeats)',
                          '5K (3.1 Miles) Stamina',
                        ].map((dist) => (
                          <button
                            key={dist}
                            type="button"
                            onClick={() => setRunningDistancePreference(dist)}
                            className={`p-1.5 rounded-lg text-[10px] font-bold border text-left transition cursor-pointer ${
                              runningDistancePreference === dist
                                ? 'bg-sky-950 text-white border-sky-400 ring-1 ring-sky-400/40'
                                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            {dist}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sub-options for Cardio Circuits */}
                  {(cardioPreference === 'cardio_circuits' || cardioPreference === 'hybrid') && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <label className="text-[10px] font-bold text-amber-300 uppercase font-mono block">
                        Preferred Cardio Circuit:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                        {[
                          'Duty Tactical HIIT & Combat Intervals',
                          'Kettlebell & Dumbbell Conditioning Flow',
                          'Assault Bike / Erg & Core Burner',
                        ].map((circ) => (
                          <button
                            key={circ}
                            type="button"
                            onClick={() => setCardioCircuitType(circ)}
                            className={`p-1.5 rounded-lg text-[10px] font-bold border text-left transition cursor-pointer ${
                              cardioCircuitType === circ
                                ? 'bg-amber-950 text-white border-amber-400 ring-1 ring-amber-400/40'
                                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            {circ}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          ) : (
            /* GENERATED WORKOUT REVIEW SCREEN */
            <div className="space-y-6 animate-tab-fade">
              {/* WORKOUT OVERVIEW BANNER */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-950/60 via-[#0e1628] to-slate-900 border-2 border-amber-500/50 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase font-mono tracking-wider">
                        {generatedWorkout.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-black uppercase font-mono">
                        {generatedWorkout.estimatedDurationMinutes} Mins
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                        {generatedWorkout.exercises.length} Exercises
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black uppercase text-white font-athletic tracking-wide">
                      {generatedWorkout.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      {generatedWorkout.description}
                    </p>
                  </div>

                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleStartWorkoutNow}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-black uppercase text-xs tracking-wider font-athletic shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-black" />
                      <span>Start Workout Now</span>
                    </button>

                    {onSaveToCloud && (
                      <button
                        type="button"
                        onClick={handleSaveWorkout}
                        disabled={isSaved || isSaving}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                          isSaved
                            ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 cursor-default'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5 text-slate-400" />
                            <span>{isSaving ? 'Saving...' : 'Save Workout'}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* EXERCISE LIST */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 font-athletic flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-amber-400" />
                    <span>Prescribed Exercise Protocol ({generatedWorkout.exercises.length} Exercises)</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    Target Time: ~{generatedWorkout.estimatedDurationMinutes} mins
                  </span>
                </div>

                <div className="space-y-2.5">
                  {generatedWorkout.exercises.map((ex, idx) => (
                    <div
                      key={ex.id || idx}
                      className="p-3.5 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-amber-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-xs font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <h5 className="font-bold text-white text-xs sm:text-sm font-athletic">
                            {ex.name}
                          </h5>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                            {ex.muscleGroup}
                          </span>
                        </div>
                        {ex.notes && (
                          <p className="text-[11px] text-slate-400 mt-1.5 ml-8 italic leading-snug">
                            {ex.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0 ml-8 sm:ml-0">
                        <div className="text-left sm:text-right">
                          <span className="text-xs font-black font-mono text-white block">
                            {ex.defaultSets} sets × {ex.targetReps}
                          </span>
                          <span className="text-[10px] font-mono text-amber-400 block">
                            Target RPE {ex.targetRpe || 8}
                          </span>
                        </div>

                        {/* Dedicated Rest Timer Controls for Single Day Exercise */}
                        <div className="flex items-center gap-1.5 self-start sm:self-center">
                          {activeSingleTimer && activeSingleTimer.exerciseName === ex.name ? (
                            <div className="flex items-center gap-1 bg-[#0f172a] border border-blue-500/60 shadow-lg rounded-xl p-1 animate-in fade-in duration-200">
                              {/* -15s */}
                              <button
                                type="button"
                                onClick={() => handleAdjustSingleTimerRemaining(-15)}
                                className="px-1.5 py-1 text-[11px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                title="Minus 15s"
                              >
                                -15
                              </button>

                              {/* Main Toggle / Countdown Display */}
                              <button
                                type="button"
                                onClick={() => handleToggleSingleTimer(ex.name, ex.restPeriodSeconds || 60)}
                                className={`flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-black rounded-lg transition-all cursor-pointer ${
                                  activeSingleTimer.secondsRemaining === 0
                                    ? 'bg-emerald-500 text-black animate-pulse'
                                    : activeSingleTimer.isRunning
                                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                      : 'bg-slate-800 text-blue-300 border border-blue-500/30'
                                }`}
                              >
                                {activeSingleTimer.secondsRemaining === 0 ? (
                                  <span className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>DONE!</span>
                                  </span>
                                ) : (
                                  <>
                                    {activeSingleTimer.isRunning ? (
                                      <Pause className="w-3 h-3 fill-current" />
                                    ) : (
                                      <Play className="w-3 h-3 fill-current ml-0.5" />
                                    )}
                                    <span>{activeSingleTimer.secondsRemaining}s</span>
                                  </>
                                )}
                              </button>

                              {/* +15s */}
                              <button
                                type="button"
                                onClick={() => handleAdjustSingleTimerRemaining(15)}
                                className="px-1.5 py-1 text-[11px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                title="Plus 15s"
                              >
                                +15
                              </button>

                              {/* Dismiss */}
                              <button
                                type="button"
                                onClick={() => stopSingleTimer()}
                                className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors cursor-pointer ml-0.5"
                                title="Dismiss timer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center bg-[#0a0f1d] border border-slate-800 rounded-lg p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateExerciseRestPeriod(idx, (parseInt(String(ex.restPeriodSeconds), 10) || 60) - 15)}
                                  className="px-1.5 py-1 text-[11px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                  title="Decrease rest by 15s"
                                >
                                  -15
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleSingleTimer(ex.name, ex.restPeriodSeconds || 60)}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-800/80 hover:bg-blue-600 hover:text-white text-blue-400 font-mono text-xs font-bold rounded transition-all cursor-pointer"
                                  title={`Click to start ${ex.restPeriodSeconds || 60}s rest countdown`}
                                >
                                  <Clock className="w-3 h-3" />
                                  <span>{ex.restPeriodSeconds || 60}s</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleUpdateExerciseRestPeriod(idx, (parseInt(String(ex.restPeriodSeconds), 10) || 60) + 15)}
                                  className="px-1.5 py-1 text-[11px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                  title="Increase rest by 15s"
                                >
                                  +15
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleToggleSingleTimer(ex.name, ex.restPeriodSeconds || 60)}
                                className="p-1.5 bg-[#0a0f1d] hover:bg-blue-900/30 text-slate-400 hover:text-blue-400 border border-slate-800 hover:border-blue-500/40 rounded-lg transition-colors cursor-pointer"
                                title="Start rest timer now"
                              >
                                <Timer className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-[#0a0f1d] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {!generatedWorkout ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs font-bold uppercase transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-black uppercase text-xs tracking-wider font-athletic shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>
                      {generationStep === 1
                        ? 'Analyzing Time & Equipment...'
                        : generationStep === 2
                        ? 'Formulating Tactical Protocol...'
                        : 'Finalizing Sets & Overload...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-black fill-black" />
                    <span>Generate Single-Day Workout</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setGeneratedWorkout(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs font-bold uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Change Settings</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 text-xs font-bold uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Generate Another Variation</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartWorkoutNow}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black uppercase text-xs tracking-wider font-athletic shadow-lg transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Start Workout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
