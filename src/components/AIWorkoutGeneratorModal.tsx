import React, { useState, useEffect } from 'react';
import { 
  X, Dumbbell, ShieldCheck, Flame, 
  Target, Clock, Calendar, CheckCircle2, AlertCircle, 
  ArrowRight, RotateCcw, Copy, Check, Play, Pause, Save, 
  Zap, Heart, Award, SlidersHorizontal, ChevronRight,
  Info, Loader2, Timer, Dumbbell as WeightIcon, Activity
} from 'lucide-react';
import { WorkoutProgram, ExerciseTemplate, MuscleGroup, AthleteProfile } from '../types';
import { PatrolReadyCompanyEmblem } from './BrandingLogos';
import { soundManager } from '../utils/audio';
import { 
  generateWorkoutPlanClient, 
  GeneratedWorkoutPlan 
} from '../utils/aiWorkoutService';

import { useRestTimer } from '../hooks/useRestTimer';

interface AIWorkoutGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivateProgram: (program: WorkoutProgram) => void;
  onStartWorkout: (program: WorkoutProgram) => void;
  onSaveToCloud?: (program: WorkoutProgram) => Promise<void>;
  onSwitchToSingleDay?: () => void;
  currentAthlete?: AthleteProfile;
  userEmail?: string;
}

export const AIWorkoutGeneratorModal: React.FC<AIWorkoutGeneratorModalProps> = ({
  isOpen,
  onClose,
  onActivateProgram,
  onStartWorkout,
  onSaveToCloud,
  onSwitchToSingleDay,
  currentAthlete,
  userEmail,
}) => {
  // Intake state
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    currentAthlete?.primaryGoal === 'Hypertrophy'
      ? 'Muscle Gain & Armor Hypertrophy'
      : currentAthlete?.primaryGoal === 'Hybrid Athlete'
      ? 'Hybrid Conditioning & Tactical Durability'
      : 'Tactical Conditioning & Pursuit Speed',
  ]);
  const [fitnessLevel, setFitnessLevel] = useState<string>(
    currentAthlete?.experienceLevel || 'Intermediate'
  );
  const [frequency, setFrequency] = useState<string>('4 Days / Week');
  const [scheduleDuration, setScheduleDuration] = useState<'weekly' | 'monthly'>('weekly');
  const [equipment, setEquipment] = useState<string[]>([
    'Full Commercial Gym (Barbells, DBs, Cables, Machines)',
  ]);
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState<number>(60);
  const [notes, setNotes] = useState<string>('');

  // Running & Cardio Circuit Integration State
  const [cardioPreference, setCardioPreference] = useState<'none' | 'running' | 'cardio_circuits' | 'hybrid'>('running');
  const [runningDistancePreference, setRunningDistancePreference] = useState<string>('1.5 Miles (Duty Standard)');
  const [cardioCircuitType, setCardioCircuitType] = useState<string>('Duty Tactical HIIT & Combat Intervals');

  // Injury & Physical Limitation state (auto-populated from athlete profile if available)
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

  // UI state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedWorkoutPlan | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Dedicated, wall-clock synchronized rest timer for previewing / testing rest periods in the AI workout builder
  const {
    activeTimer: activeBuilderTimer,
    startTimer: startBuilderTimer,
    togglePauseResume: toggleBuilderTimer,
    adjustRemaining: adjustBuilderTimer,
    stopTimer: stopBuilderTimer,
    updateTotalDuration: updateBuilderTimerTotal,
  } = useRestTimer();

  const handleToggleBuilderTimer = (exerciseName: string, defaultSecs: number) => {
    const cleanName = exerciseName.trim();
    const rawVal = parseInt(String(defaultSecs || 90), 10);
    const targetSecs = !isNaN(rawVal) && rawVal > 0 ? rawVal : 90;

    if (activeBuilderTimer && activeBuilderTimer.exerciseName === cleanName) {
      toggleBuilderTimer(cleanName, targetSecs);
    } else {
      startBuilderTimer(cleanName, targetSecs);
    }
  };

  const handleAdjustBuilderTimerRemaining = (delta: number) => {
    adjustBuilderTimer(delta);
  };

  const handleUpdateExerciseRestPeriod = (dayIdx: number, exIdx: number, newSeconds: number) => {
    const validSecs = Math.max(15, Math.min(300, newSeconds));
    if (!generatedPlan || !generatedPlan.schedule) return;

    const updatedSchedule = [...generatedPlan.schedule];
    const targetDay = { ...updatedSchedule[dayIdx] };
    const updatedExercises = [...targetDay.exercises];
    const prevEx = updatedExercises[exIdx];
    updatedExercises[exIdx] = {
      ...prevEx,
      restPeriodSeconds: validSecs,
    };
    targetDay.exercises = updatedExercises;
    updatedSchedule[dayIdx] = targetDay;

    setGeneratedPlan({
      ...generatedPlan,
      schedule: updatedSchedule,
    });

    if (activeBuilderTimer && activeBuilderTimer.exerciseName === prevEx.name) {
      updateBuilderTimerTotal(validSecs);
    }
  };

  if (!isOpen) return null;

  const goalOptions = [
    { id: 'Tactical Conditioning & Pursuit Speed', label: 'Tactical Conditioning & Pursuit', desc: 'Duty readiness, explosive sprint velocity, and combat chassis resilience.' },
    { id: 'Muscle Gain & Armor Hypertrophy', label: 'Muscle Gain / Armor Hypertrophy', desc: 'Dense upper & lower body structural mass to withstand high-impact physical duty.' },
    { id: 'Weight Loss & Metabolic Shred', label: 'Weight Loss & Metabolic Shred', desc: 'High metabolic output, conditioning density, and lean body composition.' },
    { id: 'Max Strength & Heavy Power', label: 'Max Strength & Heavy Power', desc: 'Heavy compound barbell lifts (Squat, Bench, Deadlift, Overhead Press).' },
    { id: 'Hybrid Conditioning & Tactical Durability', label: 'Hybrid Athlete & Rucking', desc: 'Simultaneous strength overload paired with Zone 2 rucking and aerobic power.' },
    { id: 'Physical Ability Test (PAT) Prep', label: 'Police PAT / Academy Readiness', desc: 'Push-ups, dummy drag, sprint intervals, and obstacle clearance.' },
  ];

  const fitnessLevelOptions = [
    { id: 'Beginner', label: 'Beginner (0-1 Years)', desc: 'Learning compound movements, building neurological foundations.' },
    { id: 'Intermediate', label: 'Intermediate (1-3 Years)', desc: 'Consistent lifting experience, ready for structured double progression.' },
    { id: 'Advanced', label: 'Advanced (3-5+ Years)', desc: 'High work capacity, undulating periodization, heavy load management.' },
    { id: 'Elite', label: 'Elite / Tactical Veteran', desc: 'Frontline operator conditioning, high-volume tactical load carriage.' },
  ];

  const frequencyOptions = [
    { id: '3 Days / Week', label: '3 Days / Week', desc: 'Full Body rotational split with maximum recovery between sessions.' },
    { id: '4 Days / Week', label: '4 Days / Week (Recommended)', desc: 'Upper / Lower or Push-Pull split balancing strength and recovery.' },
    { id: '5 Days / Week', label: '5 Days / Week', desc: 'Targeted hypertrophy & athletic volume for committed athletes.' },
    { id: '6 Days / Week', label: '6 Days / Week', desc: 'High frequency Push/Pull/Legs rotation for advanced conditioning.' },
  ];

  const equipmentOptions = [
    'Full Commercial Gym (Barbells, DBs, Cables, Machines)',
    'Home Gym (Barbell, Squat Rack, Bench, Plates)',
    'Dumbbells & Adjustable Bench Only',
    'Bodyweight & Pull-Up Bar Only',
    'Kettlebells & Sandbag (Functional Tactical)',
    'Tactical Weight Vest / Ruck Pack (20-45 lbs)',
  ];

  const injuryOptions = [
    {
      id: 'Torn Hip Labrum / FAI (Hip-Sparing)',
      label: 'Torn Hip Labrum / FAI',
      desc: 'Strictly forbids deep barbell squats or acute hip impingement (>90°). Replaces with Box Squats, Belt Squats, and Sled Work.',
      tag: 'Hip-Sparing',
    },
    {
      id: 'Lower Back / Lumbar Disc (Axial Deload)',
      label: 'Lower Back / Lumbar Disc',
      desc: 'Eliminates heavy spinal axial compression and conventional floor deadlifts. Uses Belt Squats, McGill Big 3, and chest support.',
      tag: 'Spinal Deload',
    },
    {
      id: 'Shoulder Impingement / Rotator Cuff',
      label: 'Shoulder Impingement / Rotator Cuff',
      desc: 'Eliminates behind-the-neck and wide barbell bench. Uses neutral-grip floor presses, landmine presses, and face pulls.',
      tag: 'Scapular Plane',
    },
    {
      id: 'Knee Pain / Patellar Tendonitis',
      label: 'Knee Pain / Patellar Tendonitis',
      desc: 'Eliminates jump squats and forward knee travel lunges. Employs backward sled drags, box squats with vertical shins, and leg curls.',
      tag: 'Tendon-Safe',
    },
    {
      id: 'Cervical Spine / Neck Strain',
      label: 'Neck / Cervical Strain',
      desc: 'Zero behind-the-neck loads or heavy barbell back yoke pressure.',
      tag: 'Neck-Safe',
    },
    {
      id: 'Wrist / Elbow Tendonitis',
      label: 'Wrist / Elbow Tendonitis',
      desc: 'Neutral-grip dumbbell and strap handles to eliminate wrist and epicondyle strain.',
      tag: 'Joint-Neutral',
    },
  ];

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter((g) => g !== goalId));
      }
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const toggleEquipment = (eq: string) => {
    if (equipment.includes(eq)) {
      if (equipment.length > 1) {
        setEquipment(equipment.filter((e) => e !== eq));
      }
    } else {
      setEquipment([...equipment, eq]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGenerationStep(1);

    const stepTimer1 = setTimeout(() => setGenerationStep(2), 700);
    const stepTimer2 = setTimeout(() => setGenerationStep(3), 1400);

    try {
      const plan = await generateWorkoutPlanClient({
        goals: selectedGoals,
        fitnessLevel,
        frequency,
        scheduleDuration,
        equipment,
        sessionDurationMinutes,
        injuries: selectedInjuries,
        injuryNotes,
        notes,
        cardioPreference,
        runningDistancePreference: cardioPreference === 'running' || cardioPreference === 'hybrid' ? runningDistancePreference : undefined,
        cardioCircuitType: cardioPreference === 'cardio_circuits' || cardioPreference === 'hybrid' ? cardioCircuitType : undefined,
        userEmail,
      });

      if (!plan || !plan.schedule || plan.schedule.length === 0) {
        throw new Error('Failed to retrieve structured plan data from AI engine.');
      }

      setGeneratedPlan(plan);
      setActiveDayIndex(0);
      setIsSaved(false);
    } catch (err: any) {
      console.error('[AIWorkoutGenerator] Generation error:', err);
      setError(err?.message || 'Failed to generate personalized workout plan. Please try again.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsGenerating(false);
    }
  };

  // Convert AI plan to a valid app WorkoutProgram object
  const buildAppWorkoutProgram = (planData: any): WorkoutProgram => {
    const rawExercises: ExerciseTemplate[] = [];
    (planData.schedule || []).forEach((day: any) => {
      (day.exercises || []).forEach((ex: any) => {
        if (!rawExercises.some((e) => e.name === ex.name)) {
          const restVal = parseInt(String(ex.restPeriodSeconds), 10);
          const cleanRest = (!isNaN(restVal) && restVal > 0) ? restVal : 90;
          rawExercises.push({
            id: ex.id || `ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: ex.name,
            muscleGroup: ex.muscleGroup || 'Full Body',
            type: ex.type || (ex.name.toLowerCase().includes('run') || ex.name.toLowerCase().includes('circuit') ? 'cardio' : 'strength'),
            defaultSets: ex.defaultSets || 3,
            targetReps: ex.targetReps || '8-10 reps',
            restPeriodSeconds: cleanRest,
            targetRpe: ex.targetRpe || 8,
            notes: ex.notes || '',
          });
        }
      });
    });

    const programSchedule = (planData.schedule || []).map((day: any, idx: number) => ({
      day: day.day || idx + 1,
      focus: day.focus || `Day ${day.day || idx + 1}`,
      exercises: (day.exercises || []).map((ex: any, exIdx: number) => {
        const restVal = parseInt(String(ex.restPeriodSeconds), 10);
        const cleanRest = (!isNaN(restVal) && restVal > 0) ? restVal : 90;
        return {
          id: ex.id || `ai-day-${day.day || idx + 1}-${exIdx}`,
          name: ex.name,
          muscleGroup: ex.muscleGroup || 'Full Body',
          type: ex.type || (ex.name.toLowerCase().includes('run') || ex.name.toLowerCase().includes('circuit') ? 'cardio' : 'strength'),
          defaultSets: ex.defaultSets || 3,
          targetReps: ex.targetReps || '8-10 reps',
          restPeriodSeconds: cleanRest,
          targetRpe: ex.targetRpe || 8,
          notes: ex.notes || '',
        };
      }),
    }));

    const programId = `ai-prog-${Date.now().toString(36)}`;

    return {
      id: programId,
      title: planData.title || 'Personalized AI Tactical Protocol',
      subtitle: planData.subtitle || 'Generated by Patrol Ready AI Engine',
      category: planData.category || 'Hybrid',
      frequency: planData.frequency || frequency,
      estimatedDurationMinutes: planData.estimatedDurationMinutes || sessionDurationMinutes,
      description: planData.description || 'Custom tailored AI strength & conditioning protocol.',
      exercises: rawExercises.length > 0 ? rawExercises : (programSchedule[0]?.exercises || []),
      schedule: programSchedule,
    };
  };

  const handleActivate = () => {
    if (!generatedPlan) return;
    const prog = buildAppWorkoutProgram(generatedPlan);
    onActivateProgram(prog);
    onClose();
  };

  const handleStartDayWorkout = (dayIndex: number) => {
    if (!generatedPlan) return;
    const prog = buildAppWorkoutProgram(generatedPlan);
    const day = prog.schedule?.[dayIndex];
    if (day && day.exercises.length > 0) {
      // Create single day executable program
      const dayProgram: WorkoutProgram = {
        ...prog,
        title: `${prog.title} - ${day.focus}`,
        exercises: day.exercises,
      };
      onStartWorkout(dayProgram);
      onClose();
    } else {
      onStartWorkout(prog);
      onClose();
    }
  };

  const handleSaveProgram = async () => {
    if (!generatedPlan || !onSaveToCloud || isSaving) return;
    setIsSaving(true);
    try {
      const prog = buildAppWorkoutProgram(generatedPlan);
      await onSaveToCloud(prog);
      setIsSaved(true);
    } catch (err) {
      console.warn('[AIWorkoutGenerator] Save note:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!generatedPlan) return;
    let md = `# ${generatedPlan.title}\n`;
    md += `*${generatedPlan.subtitle}*\n\n`;
    md += `**Category**: ${generatedPlan.category} | **Frequency**: ${generatedPlan.frequency} | **Duration**: ${generatedPlan.estimatedDurationMinutes} mins/session\n\n`;
    md += `### Description\n${generatedPlan.description}\n\n`;
    if (generatedPlan.coachingPhilosophy) {
      md += `### Coaching Philosophy\n${generatedPlan.coachingPhilosophy}\n\n`;
    }
    md += `## Training Schedule\n\n`;
    (generatedPlan.schedule || []).forEach((d: any) => {
      md += `### ${d.focus}\n`;
      if (d.isRestDay || !d.exercises || d.exercises.length === 0) {
        md += `*Active Recovery & Mobility*\n\n`;
      } else {
        d.exercises.forEach((ex: any, idx: number) => {
          md += `${idx + 1}. **${ex.name}** (${ex.muscleGroup}): ${ex.defaultSets} sets × ${ex.targetReps} | Rest: ${ex.restPeriodSeconds}s | RPE: ${ex.targetRpe || 8}\n`;
          if (ex.notes) md += `   - *Coaching Cue*: ${ex.notes}\n`;
        });
        md += `\n`;
      }
    });

    if (generatedPlan.weeklyProgressionTips?.length) {
      md += `### Progressive Overload Rules\n`;
      generatedPlan.weeklyProgressionTips.forEach((tip: string) => {
        md += `- ${tip}\n`;
      });
      md += `\n`;
    }

    if (generatedPlan.nutritionAdvice) {
      md += `### Nutrition & Recovery\n${generatedPlan.nutritionAdvice}\n`;
    }

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#090e18] border-2 border-blue-500/50 rounded-3xl shadow-2xl flex flex-col my-auto max-h-[94vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Siren Glow Header Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-sky-400 to-amber-500 animate-pulse" />

        {/* Top Header Rail */}
        <div className="p-4 sm:p-6 bg-[#0c1424] border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-b from-blue-500/20 to-slate-900 rounded-xl border border-blue-400/40 text-blue-400 shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase tracking-wider">
                  Patrol Ready • Tactical Periodization Engine
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black uppercase text-white font-athletic tracking-wide">
                Personalized Workout Architect
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {error && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/50 text-red-200 flex items-start gap-3 text-xs animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-0.5">Generation Note</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* LOADING STATE */}
          {isGenerating && (
            <div className="py-16 px-4 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin flex items-center justify-center" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-blue-400 animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black uppercase text-white font-athletic tracking-wide">
                  Generating Personalized Training Protocol
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Applying tactical strength periodization, matching equipment loadout, and calculating volume-recovery curves.
                </p>
              </div>

              <div className="w-full max-w-sm space-y-2 text-left font-mono text-xs">
                <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  generationStep >= 1 ? 'bg-blue-950/40 border-blue-500/50 text-blue-200' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <CheckCircle2 className={`w-4 h-4 ${generationStep >= 1 ? 'text-blue-400' : 'text-slate-600'}`} />
                  <span>1. Parsing goals, fitness level &amp; equipment constraints</span>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  generationStep >= 2 ? 'bg-blue-950/40 border-blue-500/50 text-blue-200' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <CheckCircle2 className={`w-4 h-4 ${generationStep >= 2 ? 'text-blue-400' : 'text-slate-600'}`} />
                  <span>2. Calibrating volume load, RPE &amp; ATP-CP rest intervals</span>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  generationStep >= 3 ? 'bg-blue-950/40 border-blue-500/50 text-blue-200' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <CheckCircle2 className={`w-4 h-4 ${generationStep >= 3 ? 'text-blue-400' : 'text-slate-600'}`} />
                  <span>3. Structuring progressive overload &amp; periodized schedule</span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW GENERATED PLAN */}
          {!isGenerating && generatedPlan && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Plan Banner */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-950/70 via-[#0e1628] to-amber-950/30 border-2 border-blue-500/60 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase font-mono tracking-wider">
                        {generatedPlan.category || 'Hybrid'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-black uppercase font-mono">
                        {generatedPlan.frequency || frequency}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                        {generatedPlan.scheduleDuration || (scheduleDuration === 'monthly' ? '4-Week Monthly Protocol' : '7-Day Rotation')}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {generatedPlan.estimatedDurationMinutes || sessionDurationMinutes} mins/session
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border bg-blue-950/70 text-blue-300 border-blue-500/40">
                        <ShieldCheck className="w-3 h-3 text-blue-400" />
                        Calibrated Duty Protocol
                      </span>
                      {(selectedInjuries.length > 0 || injuryNotes.trim().length > 0 || generatedPlan.title.includes('Adapted') || generatedPlan.title.includes('Protected')) && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border bg-amber-500/20 text-amber-300 border-amber-500/40">
                          <ShieldCheck className="w-3 h-3 text-amber-400" />
                          <span>Clinically Adapted</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black uppercase text-white font-athletic tracking-wide">
                      {generatedPlan.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      {generatedPlan.subtitle || generatedPlan.description}
                    </p>
                  </div>

                  {/* Quick Plan Actions */}
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleActivate}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Activate Plan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartDayWorkout(activeDayIndex)}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-black" />
                      <span>Start Day {activeDayIndex + 1}</span>
                    </button>
                  </div>
                </div>

                {/* Coaching Philosophy / Progressive Overload Details */}
                {generatedPlan.coachingPhilosophy && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white uppercase font-bold text-[11px] font-athletic">Tactical Periodization Strategy: </strong>
                      <span>{generatedPlan.coachingPhilosophy}</span>
                    </div>
                  </div>
                )}

                {/* Injury Safety Callout Banner */}
                {(selectedInjuries.length > 0 || injuryNotes.trim().length > 0 || generatedPlan.title.includes('Adapted') || generatedPlan.title.includes('Protected')) && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-2.5 text-xs text-amber-200">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-amber-300 font-bold mb-0.5">
                        Clinical Joint &amp; Injury Guardrails Enforced:
                      </strong>
                      <span className="text-[11px] leading-relaxed text-slate-200">
                        Contraindicated exercises (such as heavy deep back squats, front squats, deep lunges, and axial compressive loads) have been eliminated. Replaced with safe, joint-preserving alternatives (Box Squats to parallel, High-Handle Trap Bar RDLs, Spanish Squats, and Sled Work) allowing continuous strength progression without irritating damaged tissue.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Schedule Days Selector */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-black uppercase text-white font-athletic tracking-wide">
                      Tailored Schedule Horizon ({generatedPlan.schedule?.length || 7} Days)
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    {onSaveToCloud && (
                      <button
                        type="button"
                        onClick={handleSaveProgram}
                        disabled={isSaving || isSaved}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                          isSaved 
                            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Saved to Cloud</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5 text-blue-400" />
                            <span>{isSaving ? 'Saving...' : 'Save to Cloud'}</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleCopyMarkdown}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                      title="Copy structured workout plan to clipboard"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Plan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Day Buttons Rail */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                  {(generatedPlan.schedule || []).map((day: any, idx: number) => {
                    const isSelected = activeDayIndex === idx;
                    const isRest = day.isRestDay || !day.exercises || day.exercises.length === 0;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveDayIndex(idx)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase transition-all shrink-0 cursor-pointer flex flex-col items-center min-w-[70px] border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-900/40 ring-1 ring-blue-400/50'
                            : isRest
                            ? 'bg-[#090f1d] hover:bg-[#0f172a] text-slate-400 border-slate-800/80'
                            : 'bg-[#0e1628] hover:bg-[#142038] text-slate-200 border-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-mono opacity-80">Day {day.day || idx + 1}</span>
                        <span className="font-athletic text-xs truncate max-w-[80px]">
                          {isRest ? 'Rest' : 'Workout'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Day Detail Card */}
              {generatedPlan.schedule && generatedPlan.schedule[activeDayIndex] && (
                <div className="p-5 rounded-2xl bg-[#0b1322] border border-blue-500/40 shadow-lg space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase mb-1">
                        <span>Day {generatedPlan.schedule[activeDayIndex].day || activeDayIndex + 1} Prescribed Focus</span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-black uppercase text-white font-athletic">
                        {generatedPlan.schedule[activeDayIndex].focus}
                      </h4>
                    </div>

                    {!generatedPlan.schedule[activeDayIndex].isRestDay && (
                      <button
                        type="button"
                        onClick={() => handleStartDayWorkout(activeDayIndex)}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        <span>Start Day {activeDayIndex + 1} Workout</span>
                      </button>
                    )}
                  </div>

                  {/* Exercises List */}
                  {generatedPlan.schedule[activeDayIndex].isRestDay || 
                   !generatedPlan.schedule[activeDayIndex].exercises || 
                   generatedPlan.schedule[activeDayIndex].exercises.length === 0 ? (
                    <div className="p-8 text-center bg-[#070b13] rounded-xl border border-slate-800/80">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3">
                        <Flame className="w-6 h-6" />
                      </div>
                      <h5 className="text-base font-bold text-white uppercase font-athletic">
                        Tactical Regeneration &amp; Active Recovery
                      </h5>
                      <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                        No heavy resistance training prescribed for this day. Perform light 20-30 minute Zone 1 mobility, hip/thoracic flushes, or casual walking to accelerate metabolic clearance.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-12 gap-2 text-[11px] font-mono text-slate-400 uppercase font-bold px-3 py-1 bg-slate-900/60 rounded-lg">
                        <div className="col-span-6 sm:col-span-5">Exercise &amp; Muscle Group</div>
                        <div className="col-span-3 sm:col-span-2 text-center">Sets × Reps</div>
                        <div className="col-span-3 sm:col-span-2 text-center">Rest Period</div>
                        <div className="hidden sm:block sm:col-span-3 text-right">Target RPE / Form Cue</div>
                      </div>

                      {generatedPlan.schedule[activeDayIndex].exercises.map((ex: any, exIdx: number) => (
                        <div 
                          key={exIdx}
                          className="p-3 rounded-xl bg-[#080e1a] border border-slate-800/80 hover:border-blue-500/40 transition flex flex-col gap-2"
                        >
                          <div className="grid grid-cols-12 gap-2 items-center">
                            {/* Exercise Name & Muscle Group */}
                            <div className="col-span-6 sm:col-span-5">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-300 font-mono text-[10px] font-black flex items-center justify-center shrink-0">
                                  {exIdx + 1}
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-white font-athletic leading-tight">
                                  {ex.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-blue-400 font-mono ml-7 block">
                                {ex.muscleGroup || 'Full Body'}
                              </span>
                            </div>

                            {/* Sets x Reps */}
                            <div className="col-span-3 sm:col-span-2 text-center">
                              <span className="text-xs sm:text-sm font-black font-mono text-white">
                                {ex.defaultSets} <span className="text-[10px] text-slate-400 font-sans">sets</span>
                              </span>
                              <span className="block text-[11px] text-amber-300 font-mono font-bold">
                                {ex.targetReps}
                              </span>
                            </div>

                            {/* Rest Period Controls & Timer */}
                            <div className="col-span-3 sm:col-span-2 text-center">
                              {activeBuilderTimer && activeBuilderTimer.exerciseName === ex.name ? (
                                <div className="flex items-center justify-center gap-1 bg-[#0f172a] border border-blue-500/60 shadow-lg rounded-xl p-1 animate-in fade-in duration-200">
                                  {/* -15s */}
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustBuilderTimerRemaining(-15)}
                                    className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                    title="Minus 15s"
                                  >
                                    -15
                                  </button>

                                  {/* Main Toggle / Countdown Display */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleBuilderTimer(ex.name, ex.restPeriodSeconds || 90)}
                                    className={`flex items-center gap-1 px-2 py-0.5 font-mono text-xs font-black rounded transition-all cursor-pointer ${
                                      activeBuilderTimer.secondsRemaining === 0
                                        ? 'bg-emerald-500 text-black animate-pulse'
                                        : activeBuilderTimer.isRunning
                                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                          : 'bg-slate-800 text-blue-300 border border-blue-500/30'
                                    }`}
                                  >
                                    {activeBuilderTimer.secondsRemaining === 0 ? (
                                      <span className="flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>DONE!</span>
                                      </span>
                                    ) : (
                                      <>
                                        {activeBuilderTimer.isRunning ? (
                                          <Pause className="w-3 h-3 fill-current" />
                                        ) : (
                                          <Play className="w-3 h-3 fill-current ml-0.5" />
                                        )}
                                        <span>{activeBuilderTimer.secondsRemaining}s</span>
                                      </>
                                    )}
                                  </button>

                                  {/* +15s */}
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustBuilderTimerRemaining(15)}
                                    className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                    title="Plus 15s"
                                  >
                                    +15
                                  </button>

                                  {/* Dismiss */}
                                  <button
                                    type="button"
                                    onClick={() => stopBuilderTimer()}
                                    className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors cursor-pointer ml-0.5"
                                    title="Dismiss timer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1">
                                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateExerciseRestPeriod(activeDayIndex, exIdx, (parseInt(String(ex.restPeriodSeconds), 10) || 90) - 15)}
                                      className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                      title="Decrease rest by 15s"
                                    >
                                      -15
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleToggleBuilderTimer(ex.name, ex.restPeriodSeconds || 90)}
                                      className="flex items-center gap-1 px-2 py-0.5 bg-slate-800/80 hover:bg-blue-600 hover:text-white text-blue-300 font-mono text-xs font-bold rounded transition-all cursor-pointer"
                                      title={`Click to start ${ex.restPeriodSeconds || 90}s rest countdown`}
                                    >
                                      <Clock className="w-3 h-3 text-blue-400" />
                                      <span>{ex.restPeriodSeconds || 90}s</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleUpdateExerciseRestPeriod(activeDayIndex, exIdx, (parseInt(String(ex.restPeriodSeconds), 10) || 90) + 15)}
                                      className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                      title="Increase rest by 15s"
                                    >
                                      +15
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleToggleBuilderTimer(ex.name, ex.restPeriodSeconds || 90)}
                                    className="p-1.5 bg-slate-900 hover:bg-blue-900/40 text-slate-400 hover:text-blue-400 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                                    title="Start rest timer now"
                                  >
                                    <Timer className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* RPE & Quick Note */}
                            <div className="hidden sm:block sm:col-span-3 text-right">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/30 text-blue-300 font-bold">
                                RPE {ex.targetRpe || 8}
                              </span>
                            </div>
                          </div>

                          {/* Coaching Cue / Form Note */}
                          {ex.notes && (
                            <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-300 flex items-start gap-1.5 pl-7">
                              <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                              <span className="italic">{ex.notes}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Weekly Progression & Nutrition Tips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {generatedPlan.weeklyProgressionTips && generatedPlan.weeklyProgressionTips.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#0b1322] border border-slate-800">
                    <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold uppercase font-athletic">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Double Progression &amp; Overload Rules</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc list-inside">
                      {generatedPlan.weeklyProgressionTips.map((tip: string, idx: number) => (
                        <li key={idx} className="leading-snug">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {generatedPlan.nutritionAdvice && (
                  <div className="p-4 rounded-2xl bg-[#0b1322] border border-slate-800">
                    <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold uppercase font-athletic">
                      <Heart className="w-4 h-4 text-blue-400" />
                      <span>Nutrition &amp; Recovery Strategy</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {generatedPlan.nutritionAdvice}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Re-configure Bar */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setGeneratedPlan(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Modify Intake &amp; Regenerate</span>
                </button>

                <button
                  type="button"
                  onClick={handleActivate}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Activate This Program</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* INTAKE FORM (WHEN NOT GENERATING AND NO PLAN GENERATED YET) */}
          {!isGenerating && !generatedPlan && (
            <div className="space-y-6">
              {/* Introduction Banner */}
              <div className="p-4 rounded-2xl bg-[#0b1424] border border-blue-500/30 text-xs text-slate-300 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/40">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-white block uppercase font-bold text-sm font-athletic mb-0.5">
                    Tactical Exercise Prescription Engine
                  </strong>
                  <span>
                    Answer 5 quick training questions below. The AI will synthesize a custom weekly or monthly workout schedule featuring target exercises, set volume, double progression reps, and timed rest intervals.
                  </span>
                </div>
              </div>

              {onSwitchToSingleDay && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white font-athletic uppercase">
                        Looking for a quick 1-day workout instead?
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Create an on-demand duty session tailored to today's available time and equipment.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSwitchToSingleDay();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase font-athletic tracking-wide shrink-0 transition cursor-pointer self-start sm:self-auto shadow"
                  >
                    Build Single Day &rarr;
                  </button>
                </div>
              )}

              {/* QUESTION 1: FITNESS GOALS */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black uppercase tracking-wide text-white font-athletic flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-[11px] font-mono flex items-center justify-center">1</span>
                    <span>Fitness Goals &amp; Operational Priorities</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">Select all that apply</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {goalOptions.map((g) => {
                    const isSelected = selectedGoals.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleGoal(g.id)}
                        className={`p-3 rounded-2xl text-left border transition cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'bg-blue-950/60 border-blue-500 text-white shadow-md shadow-blue-950/40 ring-1 ring-blue-500/40'
                            : 'bg-[#0b1220] hover:bg-[#101a2e] border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-blue-600 border-blue-400 text-white' : 'border-slate-700 bg-slate-900'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="font-bold text-xs uppercase tracking-wide block font-athletic">
                            {g.label}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5 block leading-snug">
                            {g.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* QUESTION 2: CURRENT FITNESS LEVEL */}
              <div className="space-y-2.5">
                <label className="text-sm font-black uppercase tracking-wide text-white font-athletic flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-[11px] font-mono flex items-center justify-center">2</span>
                  <span>Current Training Experience Level</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {fitnessLevelOptions.map((lvl) => {
                    const isSelected = fitnessLevel === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setFitnessLevel(lvl.id)}
                        className={`p-3 rounded-2xl text-left border transition cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'bg-blue-950/60 border-blue-500 text-white shadow-md shadow-blue-950/40 ring-1 ring-blue-500/40'
                            : 'bg-[#0b1220] hover:bg-[#101a2e] border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-blue-400 bg-blue-600' : 'border-slate-700 bg-slate-900'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div>
                          <span className="font-bold text-xs uppercase tracking-wide block font-athletic">
                            {lvl.label}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5 block leading-snug">
                            {lvl.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* QUESTION 3: FREQUENCY & SCHEDULE DURATION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <label className="text-sm font-black uppercase tracking-wide text-white font-athletic flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-[11px] font-mono flex items-center justify-center">3</span>
                    <span>Workout Frequency</span>
                  </label>

                  <div className="space-y-2">
                    {frequencyOptions.map((f) => {
                      const isSelected = frequency === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFrequency(f.id)}
                          className={`w-full p-2.5 rounded-xl text-left border transition cursor-pointer flex items-center justify-between text-xs ${
                            isSelected
                              ? 'bg-blue-950/70 border-blue-500 text-white font-bold ring-1 ring-blue-500/40'
                              : 'bg-[#0b1220] hover:bg-[#101a2e] border-slate-800 text-slate-300'
                          }`}
                        >
                          <span>{f.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-sm font-black uppercase tracking-wide text-white font-athletic flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-[11px] font-mono flex items-center justify-center">4</span>
                    <span>Schedule Horizon</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setScheduleDuration('weekly')}
                      className={`p-3 rounded-2xl text-center border transition cursor-pointer flex flex-col items-center justify-center ${
                        scheduleDuration === 'weekly'
                          ? 'bg-blue-950/70 border-blue-500 text-white ring-1 ring-blue-500/40'
                          : 'bg-[#0b1220] hover:bg-[#101a2e] border-slate-800 text-slate-300'
                      }`}
                    >
                      <Calendar className="w-5 h-5 text-blue-400 mb-1" />
                      <span className="font-bold text-xs uppercase font-athletic">7-Day Split</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Weekly Rotation</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setScheduleDuration('monthly')}
                      className={`p-3 rounded-2xl text-center border transition cursor-pointer flex flex-col items-center justify-center ${
                        scheduleDuration === 'monthly'
                          ? 'bg-blue-950/70 border-blue-500 text-white ring-1 ring-blue-500/40'
                          : 'bg-[#0b1220] hover:bg-[#101a2e] border-slate-800 text-slate-300'
                      }`}
                    >
                      <Award className="w-5 h-5 text-amber-400 mb-1" />
                      <span className="font-bold text-xs uppercase font-athletic">4-Week Block</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Monthly Periodization</span>
                    </button>
                  </div>

                  <div className="pt-2">
                    <label className="text-xs text-slate-400 font-mono block mb-1">
                      Target Time Per Session: <strong className="text-white">{sessionDurationMinutes} Minutes</strong>
                    </label>
                    <div className="flex gap-2">
                      {[30, 45, 60, 75].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setSessionDurationMinutes(mins)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                            sessionDurationMinutes === mins
                              ? 'bg-blue-600 text-white border-blue-400'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* QUESTION 4: AVAILABLE EQUIPMENT */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black uppercase tracking-wide text-white font-athletic flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-[11px] font-mono flex items-center justify-center">5</span>
                    <span>Available Equipment Loadout</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">Select what you have access to</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {equipmentOptions.map((eq) => {
                    const isSelected = equipment.includes(eq);
                    return (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => toggleEquipment(eq)}
                        className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex items-center gap-2.5 text-xs ${
                          isSelected
                            ? 'bg-blue-950/70 border-blue-500 text-white font-bold ring-1 ring-blue-500/40'
                            : 'bg-[#0b1220] hover:bg-[#101a2e] border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-blue-600 border-blue-400 text-white' : 'border-slate-700 bg-slate-900'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="leading-snug">{eq}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* QUESTION 6: PHYSICAL INJURIES & JOINT LIMITATIONS */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#0c1426] border-2 border-amber-500/40 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-sm font-black uppercase tracking-wide text-white font-athletic flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-amber-500 text-black text-[11px] font-mono flex items-center justify-center font-black">6</span>
                    <span>Injuries, Surgeries &amp; Joint Limitations (Clinical Guardrails)</span>
                  </label>
                  <span className="text-[11px] font-mono text-amber-400 font-bold">Strictly eliminates contraindicated exercises</span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Select any injuries or painful joints. The AI will <strong>strictly forbid contraindicated exercises</strong> (such as heavy deep back squats for a torn hip labrum or heavy spinal compression for back pain) and prescribe joint-preserving clinical alternatives.
                </p>

                {/* Injury Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {injuryOptions.map((inj) => {
                    const isSelected = selectedInjuries.includes(inj.id);
                    return (
                      <button
                        key={inj.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedInjuries(selectedInjuries.filter((i) => i !== inj.id));
                          } else {
                            setSelectedInjuries([...selectedInjuries, inj.id]);
                          }
                        }}
                        className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-amber-950/70 border-amber-500 text-white shadow-md ring-1 ring-amber-500/50'
                            : 'bg-[#090f1b] hover:bg-[#101b2f] border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-amber-500 border-amber-400 text-black' : 'border-slate-700 bg-slate-900'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs uppercase font-athletic text-white">{inj.label}</span>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              {inj.tag}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">{inj.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Freeform Injury Specifics */}
                <div className="pt-1">
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Specific Injury Details or Medical Diagnosis (e.g. &ldquo;Torn hip labrum on left side, hurts when squatting past 90 degrees&rdquo;):
                  </label>
                  <input
                    type="text"
                    value={injuryNotes}
                    onChange={(e) => setInjuryNotes(e.target.value)}
                    placeholder="e.g. Torn hip labrum, pain when squatting below parallel; avoid deep lunges and leg press"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#070b13] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                {/* Active Clinical Warning Banner */}
                {(selectedInjuries.length > 0 || injuryNotes.trim().length > 0) && (
                  <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/60 text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed flex-1">
                      <strong className="text-amber-300 font-bold block mb-0.5">
                        Clinical Joint Guardrails Engaged:
                      </strong>
                      {selectedInjuries.some(i => i.toLowerCase().includes('hip') || i.toLowerCase().includes('labrum')) || injuryNotes.toLowerCase().includes('hip') || injuryNotes.toLowerCase().includes('labrum') ? (
                        <span>
                          <strong>Heavy deep back squats, front squats, and deep leg presses will be strictly forbidden.</strong> The AI will program Box Squats to parallel (vertical shins), Belt Squats, High-Handle Trap Bar RDLs, Spanish Squats, and Sled Work to protect your torn hip labrum from impingement.
                        </span>
                      ) : (
                        <span>
                          Contradicted movements for your reported conditions will be removed and substituted with clinically sound, joint-sparing alternatives.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* CARDIO & RUNNING INTEGRATION (USER REQUESTED FEATURE) */}
              <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-br from-[#0c1626] to-[#070b13] border-2 border-blue-500/40 shadow-lg">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black uppercase tracking-wide text-white font-athletic flex items-center gap-2">
                    <Activity className="w-4 h-4 text-sky-400" />
                    <span>Cardio &amp; Running Integration</span>
                  </label>
                  <span className="text-[10px] font-mono text-sky-300 font-bold px-2 py-0.5 rounded bg-sky-950/70 border border-sky-500/30">
                    Tactical Stamina
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Choose how you want cardiovascular conditioning structured into your training plan. You can add duty running to every session, high-intensity cardio circuits, or a balanced hybrid rotation.
                </p>

                {/* Cardio Mode Radio Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'running', label: 'Add Running', desc: 'Aerobic base runs, duty mile benchmarks, or pursuit intervals' },
                    { id: 'cardio_circuits', label: 'Cardio Circuits', desc: 'High-density metabolic finishers, kettlebell flows & HIIT' },
                    { id: 'hybrid', label: 'Hybrid Run + Circuits', desc: 'Alternating running days and metabolic conditioning circuits' },
                    { id: 'none', label: 'No Cardio', desc: 'Strict resistance training and barbell/dumbbell work only' },
                  ].map((opt) => {
                    const isSelected = cardioPreference === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCardioPreference(opt.id as any)}
                        className={`p-3 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-950/80 border-blue-400 text-white ring-2 ring-blue-500/50 shadow-md'
                            : 'bg-[#0a101d] hover:bg-[#10192e] border-slate-800 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs uppercase font-athletic text-white">
                              {opt.label}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                          </div>
                          <span className="text-[10px] text-slate-400 leading-snug block">
                            {opt.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Sub-options for Running */}
                {(cardioPreference === 'running' || cardioPreference === 'hybrid') && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <label className="text-[11px] font-bold text-sky-300 uppercase font-mono block">
                      Target Running Distance / Style:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                          className={`p-2 rounded-lg text-[11px] font-bold border text-left transition cursor-pointer ${
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
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <label className="text-[11px] font-bold text-amber-300 uppercase font-mono block">
                      Preferred Cardio Circuit Style:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        'Duty Tactical HIIT & Combat Intervals',
                        'Kettlebell & Dumbbell Conditioning Flow',
                        'Assault Bike / Erg & Core Burner',
                      ].map((circ) => (
                        <button
                          key={circ}
                          type="button"
                          onClick={() => setCardioCircuitType(circ)}
                          className={`p-2 rounded-lg text-[11px] font-bold border text-left transition cursor-pointer ${
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

              {/* OPTIONAL CONSTRAINTS / FOCUS NOTES */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                  <span>Additional Training Focus / Equipment Preferences (Optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Focus on pull-ups and core stability; include explosive foot pursuit speed drills..."
                  rows={2}
                  maxLength={300}
                  className="w-full p-3 rounded-xl bg-[#070b13] border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition resize-none font-sans"
                />
              </div>

              {/* GENERATE ACTION BUTTON */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 hover:from-blue-500 hover:to-sky-400 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
                  <span>Generate Personalized Training Plan</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="mt-2 text-center text-[11px] text-slate-500 font-mono">
                  Patrol Ready Engine • Calibrated volume, double progression, and tactical rest intervals
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
