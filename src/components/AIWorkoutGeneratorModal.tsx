import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, Flame, 
  Target, Clock, Calendar, CheckCircle2, AlertCircle, 
  ArrowRight, RotateCcw, Copy, Check, Play, Pause, Save, 
  Zap, Heart, Award, SlidersHorizontal,
  Info, Timer, Activity, RefreshCw
} from 'lucide-react';
import { WorkoutProgram, ExerciseTemplate, AthleteProfile, ProgramKey } from '../types';
import { 
  generateWorkoutPlanClient, 
  GeneratedWorkoutPlan 
} from '../utils/aiWorkoutService';
import { MASTER_PROGRAMS_CATALOG, getMasterProgramMetadata } from '../utils/masterProgramAdapter';
import { useRestTimer } from '../hooks/useRestTimer';
import { saveActiveCustomAIProgram } from '../utils/storage';
import { isCircuitExercise } from '../utils/circuitParser';
import { TacticalCircuitCard } from './TacticalCircuitCard';

interface AIWorkoutGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivateProgram: (program: WorkoutProgram) => void;
  onStartWorkout: (program: WorkoutProgram) => void;
  onSaveToCloud?: (program: WorkoutProgram) => Promise<void>;
  onSwitchToSingleDay?: () => void;
  currentAthlete?: AthleteProfile;
  userEmail?: string;
  initialBaseProgramKey?: ProgramKey;
  coachPublishedPrograms?: WorkoutProgram[];
  initialCustomProgram?: WorkoutProgram | null;
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
  initialBaseProgramKey,
  coachPublishedPrograms = [],
  initialCustomProgram = null,
}) => {
  // Base Master Program OR Coach Custom Program to Adapt
  const [baseProgramKey, setBaseProgramKey] = useState<ProgramKey>(
    initialBaseProgramKey || currentAthlete?.questionnaire?.recommendedProgramKey || 'apex_protocol'
  );
  const [selectedCustomProgram, setSelectedCustomProgram] = useState<WorkoutProgram | null>(
    initialCustomProgram || null
  );

  // Sync when modal opens with a specific program or Coach custom program requested from WorkoutsTab
  useEffect(() => {
    if (!isOpen) return;
    if (initialCustomProgram) {
      setSelectedCustomProgram(initialCustomProgram);
      const isSingle = initialCustomProgram.programKind === 'single_workout';
      const defaultWks = isSingle ? 1 : 4;
      setScheduleWeeks(defaultWks);
      setScheduleDuration(isSingle ? 'weekly' : 'monthly');
      setFrequency(initialCustomProgram.frequency || '4 Days / Week');
      setGeneratedPlan(null);
      return;
    }

    setSelectedCustomProgram(null);
    if (initialBaseProgramKey) {
      setBaseProgramKey(initialBaseProgramKey);
      const meta = getMasterProgramMetadata(initialBaseProgramKey);
      const defaultWks = meta.key === 'tactical_hypertrophy' ? 6 : meta.key === 'universal_pat' ? 8 : 12;
      setScheduleWeeks(defaultWks);
      setScheduleDuration(`${defaultWks}weeks`);
      setFrequency(meta.frequency);
    }
  }, [initialBaseProgramKey, initialCustomProgram, isOpen]);

  const handleSelectBaseProgram = (progKey: ProgramKey) => {
    setSelectedCustomProgram(null);
    const normalizedKey = progKey === 'hybrid_db' ? 'hybrid_protocol' : progKey;
    setBaseProgramKey(normalizedKey);
    const meta = getMasterProgramMetadata(normalizedKey);
    const defaultWks = normalizedKey === 'tactical_hypertrophy' ? 6 : normalizedKey === 'universal_pat' ? 8 : 12;
    setScheduleWeeks(defaultWks);
    setScheduleDuration(`${defaultWks}weeks`);
    setFrequency(meta.frequency);
  };

  const handleSelectCustomProgram = (prog: WorkoutProgram) => {
    setSelectedCustomProgram(prog);
    const isSingle = prog.programKind === 'single_workout';
    const wks = isSingle ? 1 : 4;
    setScheduleWeeks(wks);
    setScheduleDuration(isSingle ? 'weekly' : 'monthly');
    setFrequency(prog.frequency || '4 Days / Week');
  };

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
  const [scheduleDuration, setScheduleDuration] = useState<'weekly' | 'monthly' | '8weeks' | '12weeks' | string>('12weeks');
  const [scheduleWeeks, setScheduleWeeks] = useState<number>(12);
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<'all' | number>(1);
  const [equipment, setEquipment] = useState<string[]>([
    'Full Commercial Gym (Barbells, DBs, Cables, Machines)',
  ]);
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState<number>(60);
  const [notes, setNotes] = useState<string>('');

  // Running & Cardio Circuit Adaptation State
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

  // Dedicated, wall-clock synchronized rest timer for previewing / testing rest periods
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

  const selectedMasterMeta = selectedCustomProgram
    ? {
        key: selectedCustomProgram.id as any,
        title: selectedCustomProgram.title,
        shortTitle: selectedCustomProgram.title,
        subtitle: selectedCustomProgram.subtitle || 'Coach Custom Blueprint',
        nativeWeeks: selectedCustomProgram.programKind === 'single_workout' ? 1 : 4,
        recommendedWeeksOptions: selectedCustomProgram.programKind === 'single_workout' ? [1] : [4, 8, 12],
        frequency: selectedCustomProgram.frequency || '4 Days / Week',
        category: selectedCustomProgram.category || 'Hybrid',
        summary: selectedCustomProgram.description || '',
        defaultEquipment: 'Coach Prescribed Blueprint',
      }
    : getMasterProgramMetadata(baseProgramKey);

  const fitnessLevelOptions = [
    {
      id: 'Beginner',
      label: 'Beginner / Rebuild (-1 Set • +2 Reps • RPE 7-7.5)',
      desc: 'Reduces heavy set volume by 1 set per lift, raises target reps for motor control, and adds +15s rest for joint & CNS recovery.',
    },
    {
      id: 'Intermediate',
      label: 'Intermediate / Duty Standard (As Prescribed • RPE 8)',
      desc: 'Preserves Coach Risner’s baseline sets, reps, and rest intervals with structured double progression.',
    },
    {
      id: 'Advanced',
      label: 'Advanced Operator (+1 Working Set on Compounds • RPE 8.5)',
      desc: 'Adds 1 working set to primary compound lifts and increases conditioning density for veteran operators.',
    },
    {
      id: 'Elite',
      label: 'Elite / SWAT Readiness (+1 Set • High Density • RPE 9)',
      desc: 'Maximum work capacity, tighter rest intervals (-15s), and +20% conditioning distance/interval output.',
    },
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
      desc: 'Swaps deep barbell squats, lunges & leg press in the master program for Box Squats to Parallel, Trap Bar RDLs, and Sled Work.',
      tag: 'Hip-Sparing',
    },
    {
      id: 'Lower Back / Lumbar Disc (Axial Deload)',
      label: 'Lower Back / Lumbar Disc',
      desc: 'Swaps conventional deadlifts, barbell rows & axial loads for Chest-Supported Rows, Belt/Goblet Squats, and McGill Big 3.',
      tag: 'Spinal Deload',
    },
    {
      id: 'Shoulder Impingement / Rotator Cuff',
      label: 'Shoulder Impingement / Rotator Cuff',
      desc: 'Swaps barbell bench, dips & overhead press for Neutral-Grip DB Floor Press, Landmine Press, and Face Pulls.',
      tag: 'Scapular Plane',
    },
    {
      id: 'Knee Pain / Patellar Tendonitis',
      label: 'Knee Pain / Patellar Tendonitis',
      desc: 'Swaps lunges, jump squats & high-impact sprints for Backward Sled Drags, Box Squats (vertical shins), and Glute Bridges.',
      tag: 'Tendon-Safe',
    },
    {
      id: 'Cervical Spine / Neck Strain',
      label: 'Neck / Cervical Strain',
      desc: 'Eliminates barbell back rack pressure and overhead axial loading across all weeks.',
      tag: 'Neck-Safe',
    },
    {
      id: 'Wrist / Elbow Tendonitis',
      label: 'Wrist / Elbow Tendonitis',
      desc: 'Substitutes straight-bar curls, chin-ups & heavy front racks with neutral-grip DBs and strap variations.',
      tag: 'Joint-Neutral',
    },
  ];

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

    const stepTimer1 = setTimeout(() => setGenerationStep(2), 650);
    const stepTimer2 = setTimeout(() => setGenerationStep(3), 1300);

    try {
      const plan = await generateWorkoutPlanClient({
        baseProgramKey: selectedCustomProgram ? selectedCustomProgram.id : baseProgramKey,
        customProgram: selectedCustomProgram || undefined,
        goals: selectedGoals,
        fitnessLevel,
        frequency: selectedMasterMeta.frequency,
        scheduleDuration,
        scheduleWeeks,
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
        throw new Error('Failed to adapt master program schedule.');
      }

      setGeneratedPlan(plan);
      setActiveDayIndex(0);
      setSelectedWeekFilter(1);
      setIsSaved(false);
    } catch (err: any) {
      console.error('[MasterProgramAdapter] Adaptation error:', err);
      setError(err?.message || 'Failed to adapt program. Please try again.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsGenerating(false);
    }
  };

  // Convert adapted plan to a valid app WorkoutProgram object, preserving all adaptation & multi-format fields
  const mapGeneratedExercise = (ex: any, fallbackId: string): ExerciseTemplate => {
    const rawRest = ex.restPeriodSeconds;
    const parsedRest = parseInt(String(rawRest), 10);
    const cleanRest = rawRest === 0 ? 0 : !isNaN(parsedRest) && parsedRest > 0 ? parsedRest : 90;
    return {
      id: ex.id || fallbackId,
      name: ex.name,
      muscleGroup: ex.muscleGroup || 'Full Body',
      type:
        ex.type ||
        (ex.name.toLowerCase().includes('run') || ex.name.toLowerCase().includes('circuit')
          ? 'cardio'
          : 'strength'),
      format: ex.format,
      supersetExercises: ex.supersetExercises,
      emomMinutes: ex.emomMinutes,
      emomIntervalSeconds: ex.emomIntervalSeconds,
      emomMovements: ex.emomMovements,
      amrapDurationMinutes: ex.amrapDurationMinutes,
      amrapMovements: ex.amrapMovements,
      circuitStations: ex.circuitStations,
      workSeconds: ex.workSeconds,
      restSeconds: ex.restSeconds,
      defaultSets: ex.defaultSets || 3,
      targetReps: ex.targetReps || '8-10 reps',
      restPeriodSeconds: cleanRest,
      targetRpe: ex.targetRpe || 8,
      notes: ex.notes || '',
      originalExerciseName: ex.originalExerciseName,
      adaptationReason: ex.adaptationReason,
      scalingNote: ex.scalingNote,
    };
  };

  const buildAppWorkoutProgram = (planData: GeneratedWorkoutPlan): WorkoutProgram => {
    const rawExercises: ExerciseTemplate[] = [];
    (planData.schedule || []).forEach((day: any) => {
      (day.exercises || []).forEach((ex: any) => {
        if (!rawExercises.some((e) => e.name === ex.name)) {
          rawExercises.push(
            mapGeneratedExercise(
              ex,
              `ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
            )
          );
        }
      });
    });

    const programSchedule = (planData.schedule || []).map((day: any, idx: number) => ({
      day: day.day || idx + 1,
      focus: day.focus || `Day ${day.day || idx + 1}`,
      warmup: day.warmup,
      conditioning: day.conditioning,
      isRestDay: Boolean(day.isRestDay),
      exercises: (day.exercises || []).map((ex: any, exIdx: number) =>
        mapGeneratedExercise(ex, `ai-day-${day.day || idx + 1}-${exIdx}`)
      ),
    }));

    const programId = `ai-prog-${Date.now().toString(36)}`;

    return {
      id: programId,
      title: planData.title || `${selectedMasterMeta.shortTitle} (Adapted)`,
      subtitle: planData.subtitle || `Adapted from ${selectedMasterMeta.title}`,
      category: (planData.category as any) || selectedMasterMeta.category || 'Hybrid',
      frequency: planData.frequency || selectedMasterMeta.frequency,
      estimatedDurationMinutes: planData.estimatedDurationMinutes || sessionDurationMinutes,
      recommendedWarmupId: 'warmup-dime-mandatory',
      description: planData.description || `Adapted from ${selectedMasterMeta.title} for ${fitnessLevel} ability and clinical joint guardrails.`,
      baseProgramKey: planData.baseProgramKey || baseProgramKey,
      programKind: planData.programKind,
      exercises: rawExercises.length > 0 ? rawExercises : (programSchedule[0]?.exercises || []),
      schedule: programSchedule,
    };
  };

  const handleActivate = () => {
    if (!generatedPlan) return;
    const prog = buildAppWorkoutProgram(generatedPlan);
    saveActiveCustomAIProgram(prog);
    onActivateProgram(prog);
    if (onSaveToCloud) {
      onSaveToCloud(prog).catch(() => {});
    }
    onClose();
  };

  const handleStartDayWorkout = (dayIndex: number) => {
    if (!generatedPlan) return;
    const prog = buildAppWorkoutProgram(generatedPlan);
    saveActiveCustomAIProgram(prog);
    if (onSaveToCloud) {
      onSaveToCloud(prog).catch(() => {});
    }
    const day = prog.schedule?.[dayIndex];
    if (day && day.exercises.length > 0) {
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
      console.warn('[MasterProgramAdapter] Save note:', err);
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
      md += `### Adaptation & Periodization Strategy\n${generatedPlan.coachingPhilosophy}\n\n`;
    }
    md += `## Adapted Training Schedule\n\n`;
    (generatedPlan.schedule || []).forEach((d: any) => {
      md += `### ${d.focus}\n`;
      if (d.isRestDay || !d.exercises || d.exercises.length === 0) {
        md += `*Active Recovery & Mobility*\n\n`;
      } else {
        d.exercises.forEach((ex: any, idx: number) => {
          md += `${idx + 1}. **${ex.name}** (${ex.muscleGroup}): ${ex.defaultSets} sets × ${ex.targetReps} | Rest: ${ex.restPeriodSeconds}s | RPE: ${ex.targetRpe || 8}\n`;
          if (ex.originalExerciseName) md += `   - *Adapted From*: ${ex.originalExerciseName} (${ex.adaptationReason || 'Clinical/Equipment Swap'})\n`;
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

  // Available week horizon buttons based on the selected master program
  const availableWeekOptions = baseProgramKey === 'apex_protocol'
    ? [4, 8, 12, 26, 52]
    : baseProgramKey === 'tactical_hypertrophy'
    ? [4, 6, 12]
    : baseProgramKey === 'universal_pat'
    ? [4, 6, 8, 12]
    : [4, 6, 8, 12];

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
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase tracking-wider">
                  Patrol Ready • Clinical &amp; Ability Program Adapter
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black uppercase text-white font-athletic tracking-wide">
                Master Program Adaptation Engine
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
                <strong className="block font-bold mb-0.5">Adaptation Note</strong>
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
                  <ShieldCheck className="w-8 h-8 text-blue-400 animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black uppercase text-white font-athletic tracking-wide">
                  Adapting {selectedMasterMeta.shortTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {!selectedCustomProgram && baseProgramKey === 'apex_protocol'
                    ? 'Preserving the 52-Week Program’s built-in sets, reps, and quarterly progression while adapting exercises for injuries and equipment.'
                    : `Preserving Coach Risner’s authentic split & mesocycle structure while swapping contraindicated movements and scaling volume to ${fitnessLevel} ability.`}
                </p>
              </div>

              <div className="w-full max-w-sm space-y-2 text-left font-mono text-xs">
                <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  generationStep >= 1 ? 'bg-blue-950/40 border-blue-500/50 text-blue-200' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <CheckCircle2 className={`w-4 h-4 ${generationStep >= 1 ? 'text-blue-400' : 'text-slate-600'}`} />
                  <span>1. Loading {selectedMasterMeta.shortTitle} ({scheduleWeeks} weeks)</span>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  generationStep >= 2 ? 'bg-blue-950/40 border-blue-500/50 text-blue-200' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <CheckCircle2 className={`w-4 h-4 ${generationStep >= 2 ? 'text-blue-400' : 'text-slate-600'}`} />
                  <span>2. Swapping injury-aggravating &amp; unavailable equipment lifts</span>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  generationStep >= 3 ? 'bg-blue-950/40 border-blue-500/50 text-blue-200' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <CheckCircle2 className={`w-4 h-4 ${generationStep >= 3 ? 'text-blue-400' : 'text-slate-600'}`} />
                  <span>
                    {!selectedCustomProgram && baseProgramKey === 'apex_protocol'
                      ? '3. Preserving built-in 52-week sets, reps & progression rules'
                      : `3. Scaling sets, reps, RPE & conditioning to ${fitnessLevel}`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW ADAPTED PLAN */}
          {!isGenerating && generatedPlan && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Plan Banner */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-950/70 via-[#0e1628] to-amber-950/30 border-2 border-blue-500/60 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase font-mono tracking-wider">
                        Adapted Master Protocol
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-black uppercase font-mono">
                        {generatedPlan.frequency || selectedMasterMeta.frequency}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                        {generatedPlan.scheduleDuration || `${scheduleWeeks}-Week Adapted Cycle`}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {generatedPlan.estimatedDurationMinutes || sessionDurationMinutes} mins/session
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border bg-sky-950/80 text-sky-300 border-sky-500/40">
                        <Award className="w-3 h-3 text-sky-400" />
                        {generatedPlan.baseProgramKey === 'apex_protocol'
                          ? 'Built-In 52-Wk Progression'
                          : `${fitnessLevel} Scaling`}
                      </span>
                      {(selectedInjuries.length > 0 || injuryNotes.trim().length > 0 || (generatedPlan.adaptationStats?.clinicalSwapsCount || 0) > 0) && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border bg-amber-500/20 text-amber-300 border-amber-500/40">
                          <ShieldCheck className="w-3 h-3 text-amber-400" />
                          <span>Injury-Protected</span>
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
                      <span>Activate Adapted Plan</span>
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

                {/* Adaptation Telemetry Strip */}
                {generatedPlan.adaptationStats && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-[#080f1d] border border-blue-500/30">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Base Master Program</span>
                      <span className="text-xs font-black text-white font-athletic uppercase truncate block mt-0.5">
                        {generatedPlan.adaptationStats.baseProgramTitle}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#080f1d] border border-amber-500/30">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Clinical &amp; Equip Swaps</span>
                      <span className="text-xs font-black text-amber-300 font-mono block mt-0.5">
                        {generatedPlan.adaptationStats.clinicalSwapsCount + generatedPlan.adaptationStats.equipmentSwapsCount} Movements Replaced
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#080f1d] border border-sky-500/30">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Sets &amp; Reps Progression</span>
                      <span className="text-xs font-black text-sky-300 font-mono block mt-0.5">
                        {generatedPlan.baseProgramKey === 'apex_protocol'
                          ? 'Built-In 52-Wk Preserved'
                          : `${generatedPlan.adaptationStats.fitnessLevel || fitnessLevel} (${generatedPlan.adaptationStats.scaledExercisesCount} Lifts Scaled)`}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#080f1d] border border-emerald-500/30">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Conditioning / Runs</span>
                      <span className="text-xs font-black text-emerald-300 font-mono block mt-0.5">
                        {generatedPlan.adaptationStats.conditioningAdaptationsCount} Sessions Calibrated
                      </span>
                    </div>
                  </div>
                )}

                {/* Coaching Philosophy / Progressive Overload Details */}
                {generatedPlan.coachingPhilosophy && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white uppercase font-bold text-[11px] font-athletic">Adaptation Architecture: </strong>
                      <span>{generatedPlan.coachingPhilosophy}</span>
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
                      Adapted Master Schedule ({generatedPlan.schedule?.length || 7} Days • {Math.ceil((generatedPlan.schedule?.length || 7) / 7)} Weeks)
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

                {/* Week Filter Pills (When schedule is multi-week) */}
                {generatedPlan.schedule && generatedPlan.schedule.length > 7 && (
                  <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin mb-2">
                    <button
                      type="button"
                      onClick={() => setSelectedWeekFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition shrink-0 cursor-pointer border ${
                        selectedWeekFilter === 'all'
                          ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      All Days ({generatedPlan.schedule.length})
                    </button>
                    {Array.from({ length: Math.ceil(generatedPlan.schedule.length / 7) }).map((_, wIdx) => {
                      const wkNum = wIdx + 1;
                      const isSelected = selectedWeekFilter === wkNum;
                      const phaseTag = wkNum === 4 || wkNum === 8 ? 'Deload' : wkNum <= 4 ? 'Phase 1' : wkNum <= 8 ? 'Phase 2' : 'Phase 3';
                      return (
                        <button
                          key={wkNum}
                          type="button"
                          onClick={() => {
                            setSelectedWeekFilter(wkNum);
                            setActiveDayIndex((wkNum - 1) * 7);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition shrink-0 cursor-pointer border flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          <span>Week {wkNum}</span>
                          <span className="text-[10px] opacity-75 font-sans">({phaseTag})</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Day Buttons Rail */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                  {(generatedPlan.schedule || [])
                    .map((day: any, idx: number) => ({ day, idx }))
                    .filter(({ idx }) => {
                      if (selectedWeekFilter === 'all') return true;
                      const weekOfIndex = Math.floor(idx / 7) + 1;
                      return weekOfIndex === selectedWeekFilter;
                    })
                    .map(({ day, idx }) => {
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
                        <span>Day {generatedPlan.schedule[activeDayIndex].day || activeDayIndex + 1} Adapted Prescription</span>
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
                        No heavy resistance training prescribed for this day in the master schedule. Perform light 20-30 minute Zone 1 mobility, hip/thoracic flushes, or casual walking.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-12 gap-2 text-[11px] font-mono text-slate-400 uppercase font-bold px-3 py-1 bg-slate-900/60 rounded-lg">
                        <div className="col-span-6 sm:col-span-5">Exercise &amp; Adaptation Status</div>
                        <div className="col-span-3 sm:col-span-2 text-center">Sets × Reps</div>
                        <div className="col-span-3 sm:col-span-2 text-center">Rest Period</div>
                        <div className="hidden sm:block sm:col-span-3 text-right">Target RPE</div>
                      </div>

                      {generatedPlan.schedule[activeDayIndex].exercises.map((ex: any, exIdx: number) => {
                        if (isCircuitExercise(ex)) {
                          return (
                            <div key={exIdx} className="space-y-1.5">
                              {(ex.originalExerciseName || ex.adaptationReason || ex.scalingNote) && (
                                <div className="flex flex-wrap items-center gap-1.5 px-2">
                                  {ex.originalExerciseName && (
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                      <RefreshCw className="w-2.5 h-2.5 text-amber-400" />
                                      Swapped from: {ex.originalExerciseName}
                                    </span>
                                  )}
                                  {ex.adaptationReason && (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                                      {ex.adaptationReason}
                                    </span>
                                  )}
                                </div>
                              )}
                              <TacticalCircuitCard
                                exercise={ex}
                                index={exIdx}
                                activeTimer={activeBuilderTimer}
                                onToggleTimer={handleToggleBuilderTimer}
                                onAdjustTimer={handleAdjustBuilderTimerRemaining}
                                onStopTimer={stopBuilderTimer}
                              />
                            </div>
                          );
                        }

                        return (
                        <div 
                          key={exIdx}
                          className={`p-3 rounded-xl bg-[#080e1a] border transition flex flex-col gap-2 ${
                            ex.originalExerciseName
                              ? 'border-amber-500/50 hover:border-amber-400'
                              : 'border-slate-800/80 hover:border-blue-500/40'
                          }`}
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
                              <div className="flex flex-wrap items-center gap-1.5 ml-7 mt-1">
                                {ex.format && ex.format !== 'straight' && (
                                  <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/40">
                                    {ex.format}
                                  </span>
                                )}
                                <span className="text-[10px] text-blue-400 font-mono">
                                  {ex.muscleGroup || 'Full Body'}
                                </span>
                                {ex.originalExerciseName && (
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                    <RefreshCw className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                    <span>Replaced: {ex.originalExerciseName}</span>
                                  </span>
                                )}
                                {ex.scalingNote && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950/90 text-sky-300 border border-sky-500/30">
                                    {ex.scalingNote}
                                  </span>
                                )}
                              </div>
                              {ex.format === 'superset' && ex.supersetExercises && ex.supersetExercises.length > 0 && (
                                <div className="ml-7 mt-1.5 space-y-1">
                                  {ex.supersetExercises.map((sub: any, sIdx: number) => (
                                    <div key={sIdx} className="text-[11px] font-mono text-indigo-200 flex items-center gap-1.5">
                                      <span className="text-indigo-400 font-bold">A{sIdx + 1}:</span>
                                      <span>{sub.name}</span>
                                      <span className="text-slate-400">({sub.targetReps})</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {(ex.emomMovements || ex.amrapMovements) && (
                                <div className="ml-7 mt-1.5 space-y-0.5">
                                  {(ex.emomMovements || ex.amrapMovements || []).map((mov: any, mIdx: number) => (
                                    <div key={mIdx} className="text-[11px] font-mono text-slate-300">
                                      • {mov.name} {mov.targetReps ? `(${mov.targetReps})` : ''}
                                    </div>
                                  ))}
                                </div>
                              )}
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
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustBuilderTimerRemaining(-15)}
                                    className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                    title="Minus 15s"
                                  >
                                    -15
                                  </button>

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

                                  <button
                                    type="button"
                                    onClick={() => handleAdjustBuilderTimerRemaining(15)}
                                    className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                    title="Plus 15s"
                                  >
                                    +15
                                  </button>

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
                        );
                      })}
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
                  <span>Adjust Injury / Ability Settings</span>
                </button>

                <button
                  type="button"
                  onClick={handleActivate}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Activate Adapted Program</span>
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
                    Adapt Coach Risner&apos;s Core Programs to Your Injuries &amp; Ability
                  </strong>
                  <span>
                    Instead of building random workouts from scratch, this engine takes Coach Risner&apos;s proven master protocols and surgically alters exercises, set/rep volume, target RPE, and conditioning runs around your exact injuries, equipment, and ability level.
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
                        Generate an on-demand single-day session without replacing your active multi-week program.
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

              {/* STEP 1: SELECT MASTER PROGRAM TO ADAPT */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-sm font-black uppercase tracking-wide text-white font-athletic flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-[11px] font-mono flex items-center justify-center">1</span>
                    <span>Select Coach Risner Master Program to Adapt</span>
                  </label>
                  <span className="text-[11px] font-mono text-blue-400 font-bold">
                    Authentic Mesocycles &amp; Split Preserved
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {MASTER_PROGRAMS_CATALOG.map((prog) => {
                    const isSelected = !selectedCustomProgram && baseProgramKey === prog.key;
                    return (
                      <button
                        key={prog.key}
                        type="button"
                        onClick={() => handleSelectBaseProgram(prog.key)}
                        className={`p-3.5 rounded-2xl text-left border transition cursor-pointer flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'bg-blue-950/75 border-blue-400 text-white shadow-lg shadow-blue-950/50 ring-1 ring-blue-400/50'
                            : 'bg-[#0b1220] hover:bg-[#101a2e] border-slate-800 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-black text-xs sm:text-sm uppercase tracking-wide font-athletic text-white">
                              {prog.title}
                            </span>
                            <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded shrink-0 ${
                              isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {prog.nativeWeeks} WKS
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            {prog.summary}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-blue-300">
                          <span>{prog.frequency}</span>
                          <span>•</span>
                          <span className="truncate max-w-[180px]">{prog.defaultEquipment}</span>
                        </div>
                      </button>
                    );
                  })}

                  {/* Coach Published Custom Programs & Single Workouts enabled for AI Adaptation */}
                  {coachPublishedPrograms
                    .filter((cp) => cp.allowAiAdaptation !== false && cp.isPublished !== false)
                    .map((cp) => {
                      const isSelected = selectedCustomProgram?.id === cp.id;
                      const isSingle = cp.programKind === 'single_workout';
                      return (
                        <button
                          key={cp.id}
                          type="button"
                          onClick={() => handleSelectCustomProgram(cp)}
                          className={`p-3.5 rounded-2xl text-left border transition cursor-pointer flex flex-col justify-between gap-2 ${
                            isSelected
                              ? 'bg-indigo-950/80 border-indigo-400 text-white shadow-lg ring-1 ring-indigo-400/50'
                              : 'bg-[#0b1220] hover:bg-[#101a2e] border-slate-800 text-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-black text-xs sm:text-sm uppercase tracking-wide font-athletic text-white">
                                {cp.title}
                              </span>
                              <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded shrink-0 ${
                                isSelected ? 'bg-indigo-500 text-white' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}>
                                {isSingle ? 'COACH SINGLE' : 'COACH CUSTOM'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                              {cp.description || cp.subtitle}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-indigo-300">
                            <span>{cp.frequency}</span>
                            <span>•</span>
                            <span>{cp.category}</span>
                          </div>
                        </button>
                      );
                    })}
                </div>

                {/* Adaptation Horizon Selector */}
                <div className="p-3 rounded-xl bg-[#080d19] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-white uppercase font-athletic block">
                      Program Horizon to Generate: <span className="text-amber-400">{scheduleWeeks === 1 && selectedCustomProgram?.programKind === 'single_workout' ? '1 Single Adapted Workout' : `${scheduleWeeks} Weeks (${scheduleWeeks * 7} Days)`}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {selectedCustomProgram?.programKind === 'single_workout'
                        ? 'Adapts every movement, superset, EMOM, AMRAP, and circuit in Coach’s standalone session.'
                        : `Includes built-in Week 4 & Week 8 deloads and progressive transitions from ${selectedMasterMeta.shortTitle}.`}
                    </span>
                  </div>
                  {!(selectedCustomProgram?.programKind === 'single_workout') && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {(selectedCustomProgram ? [4, 8, 12] : availableWeekOptions).map((wk) => (
                        <button
                          key={wk}
                          type="button"
                          onClick={() => {
                            setScheduleWeeks(wk);
                            setScheduleDuration(wk === 4 ? 'monthly' : `${wk}weeks`);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer border ${
                            scheduleWeeks === wk
                              ? 'bg-blue-600 text-white border-blue-400 shadow'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {wk}W
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 2: CURRENT ABILITY LEVEL & VOLUME SCALING */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <label className="text-sm font-black uppercase tracking-wide text-white font-athletic flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-[11px] font-mono flex items-center justify-center">2</span>
                    <span>Ability Level (Scales Sets, Reps, Rest &amp; Target RPE)</span>
                  </label>
                  <span className="text-[11px] font-mono text-sky-400">
                    {!selectedCustomProgram && baseProgramKey === 'apex_protocol'
                      ? 'Excluded for 52-Week Program'
                      : 'Auto-calibrates intensity & volume'}
                  </span>
                </div>

                {!selectedCustomProgram && baseProgramKey === 'apex_protocol' ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/35 border border-emerald-500/40 text-xs text-slate-200 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-black uppercase text-emerald-300 font-athletic tracking-wide block">
                        Sets &amp; Reps Excluded from Ability Scaling (Built-In 52-Week Progression)
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        The <strong>Law Enforcement 52-Week Fitness &amp; Readiness Program</strong> already includes built-in 4-quarter periodization, low-end set/rep initialization, every-4th-week 40% deloads, and intra-session Set 1 auto-pacing. Prescribed sets and reps are preserved intact—Steps 3 &amp; 4 below still customize exercises for injuries, equipment, and conditioning preferences.
                      </p>
                    </div>
                  </div>
                ) : (
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
                )}
              </div>

              {/* STEP 3: PHYSICAL INJURIES, SURGERIES & BANNED EXERCISES */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#0c1426] border-2 border-amber-500/40 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-sm font-black uppercase tracking-wide text-white font-athletic flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-amber-500 text-black text-[11px] font-mono flex items-center justify-center font-black">3</span>
                    <span>Injuries, Joint Limitations &amp; Banned Exercises</span>
                  </label>
                  <span className="text-[11px] font-mono text-amber-400 font-bold">1-for-1 Biomechanical Exercise Swaps</span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Select any injuries or type specific movements you cannot perform. Every aggravated exercise inside <strong>{selectedMasterMeta.shortTitle}</strong> will be automatically replaced with a joint-sparing clinical equivalent while keeping the rest of the program intact.
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
                    Specific Exercises to Ban or Injury Details (e.g. &ldquo;No barbell back squats, no overhead press, left knee meniscus&rdquo;):
                  </label>
                  <input
                    type="text"
                    value={injuryNotes}
                    onChange={(e) => setInjuryNotes(e.target.value)}
                    placeholder="e.g. Cannot do conventional deadlifts, back squats, or running; swap with low-impact alternatives"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#070b13] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                {/* Active Clinical Warning Banner */}
                {(selectedInjuries.length > 0 || injuryNotes.trim().length > 0) && (
                  <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/60 text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed flex-1">
                      <strong className="text-amber-300 font-bold block mb-0.5">
                        Clinical Movement Replacement Active for {selectedMasterMeta.shortTitle}:
                      </strong>
                      <span>
                        All contraindicated exercises across every week and circuit will be intercepted and swapped with biomechanically matched joint-sparing movements (tagged with <em>&ldquo;Replaced: [Original Lift]&rdquo;</em> on your schedule).
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 4: EQUIPMENT & RUNNING / CONDITIONING ADAPTATION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Equipment Loadout */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-[#0b1220] border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black uppercase tracking-wide text-white font-athletic flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-[11px] font-mono flex items-center justify-center">4</span>
                      <span>Available Equipment</span>
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    If you don&apos;t have a full barbell gym, barbell lifts in the master program will automatically convert to dumbbell or bodyweight equivalents.
                  </p>
                  <div className="space-y-1.5">
                    {equipmentOptions.map((eq) => {
                      const isSelected = equipment.includes(eq);
                      return (
                        <button
                          key={eq}
                          type="button"
                          onClick={() => toggleEquipment(eq)}
                          className={`w-full p-2 rounded-xl text-left border transition cursor-pointer flex items-center gap-2.5 text-xs ${
                            isSelected
                              ? 'bg-blue-950/70 border-blue-500 text-white font-bold ring-1 ring-blue-500/40'
                              : 'bg-[#080d18] hover:bg-[#101a2e] border-slate-800 text-slate-300'
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

                {/* Conditioning & Running Adaptation */}
                <div className="space-y-3 p-4 rounded-2xl bg-[#0b1220] border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-black uppercase tracking-wide text-white font-athletic flex items-center gap-2">
                        <Activity className="w-4 h-4 text-sky-400" />
                        <span>Running &amp; Conditioning Scaling</span>
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Choose how to handle the prescribed runs and conditioning finishers inside {selectedMasterMeta.shortTitle}.
                    </p>

                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'running', label: 'Keep & Scale Master Program Runs', desc: 'Scales run distances, intervals & paces to your ability level' },
                        { id: 'cardio_circuits', label: 'Swap Runs to Low-Impact Tactical Circuits', desc: 'Replaces impact running with joint-sparing conditioning circuits' },
                        { id: 'hybrid', label: 'Hybrid (Alternate Runs & Tactical Circuits)', desc: 'Combines scaled runs with metabolic work capacity circuits' },
                        { id: 'none', label: 'Strength Only (Remove Conditioning)', desc: 'Strips conditioning runs to focus 100% on lifting blocks' },
                      ].map((opt) => {
                        const isSelected = cardioPreference === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setCardioPreference(opt.id as any)}
                            className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-blue-950/80 border-blue-400 text-white ring-1 ring-blue-500/50'
                                : 'bg-[#080d18] hover:bg-[#10192e] border-slate-800 text-slate-300'
                            }`}
                          >
                            <div>
                              <span className="font-bold text-xs uppercase font-athletic text-white block">
                                {opt.label}
                              </span>
                              <span className="text-[10px] text-slate-400 leading-snug block">
                                {opt.desc}
                              </span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      Additional Adaptation Requests (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Emphasize pull-up endurance and dummy drag readiness..."
                      className="w-full px-3 py-2 rounded-xl bg-[#070b13] border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* GENERATE ACTION BUTTON */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 hover:from-blue-500 hover:to-sky-400 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <SlidersHorizontal className="w-5 h-5 text-amber-300" />
                  <span>Adapt {selectedMasterMeta.shortTitle} ({scheduleWeeks} Weeks)</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="mt-2 text-center text-[11px] text-slate-500 font-mono">
                  Patrol Ready Master Program Adapter • Authentic Coach Risner Splits • Clinical Joint Guardrails
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
