import React, { useState } from 'react';
import { 
  Sparkles, X, Dumbbell, ShieldCheck, Flame, 
  Target, Clock, Calendar, CheckCircle2, AlertCircle, 
  ArrowRight, RotateCcw, Copy, Check, Play, Save, 
  Zap, Heart, Award, SlidersHorizontal, ChevronRight,
  Info, Loader2, Dumbbell as WeightIcon, Key
} from 'lucide-react';
import { WorkoutProgram, ExerciseTemplate, MuscleGroup, AthleteProfile } from '../types';
import { PatrolReadyCompanyEmblem } from './BrandingLogos';
import { 
  generateWorkoutPlanClient, 
  getEffectiveGeminiApiKey, 
  GeneratedWorkoutPlan 
} from '../utils/aiWorkoutService';

interface AIWorkoutGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivateProgram: (program: WorkoutProgram) => void;
  onStartWorkout: (program: WorkoutProgram) => void;
  onSaveToCloud?: (program: WorkoutProgram) => Promise<void>;
  currentAthlete?: AthleteProfile;
  userEmail?: string;
}

export const AIWorkoutGeneratorModal: React.FC<AIWorkoutGeneratorModalProps> = ({
  isOpen,
  onClose,
  onActivateProgram,
  onStartWorkout,
  onSaveToCloud,
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

  // API Key state for Netlify / standalone client deployment
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('rpa_custom_gemini_api_key') || '';
    } catch {
      return '';
    }
  });
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);
  const [keySaveMessage, setKeySaveMessage] = useState<string | null>(null);

  // UI state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedWorkoutPlan | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!isOpen) return null;

  const effectiveKey = getEffectiveGeminiApiKey(customApiKey);
  const hasLiveApiKey = Boolean(effectiveKey && effectiveKey.length > 5);

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

  const handleSaveApiKey = () => {
    try {
      if (customApiKey.trim()) {
        localStorage.setItem('rpa_custom_gemini_api_key', customApiKey.trim());
        setKeySaveMessage('API key saved to browser local storage!');
      } else {
        localStorage.removeItem('rpa_custom_gemini_api_key');
        setKeySaveMessage('Custom API key removed. Using environment defaults.');
      }
      setTimeout(() => setKeySaveMessage(null), 3000);
    } catch (e) {
      console.warn('Failed to save API key to local storage', e);
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
        notes,
        userEmail,
        customApiKey: customApiKey.trim() || undefined,
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
          rawExercises.push({
            id: ex.id || `ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: ex.name,
            muscleGroup: ex.muscleGroup || 'Full Body',
            defaultSets: ex.defaultSets || 3,
            targetReps: ex.targetReps || '8-10 reps',
            restPeriodSeconds: ex.restPeriodSeconds || 90,
            targetRpe: ex.targetRpe || 8,
            notes: ex.notes || '',
          });
        }
      });
    });

    const programSchedule = (planData.schedule || []).map((day: any, idx: number) => ({
      day: day.day || idx + 1,
      focus: day.focus || `Day ${day.day || idx + 1}`,
      exercises: (day.exercises || []).map((ex: any, exIdx: number) => ({
        id: ex.id || `ai-day-${day.day || idx + 1}-${exIdx}`,
        name: ex.name,
        muscleGroup: ex.muscleGroup || 'Full Body',
        defaultSets: ex.defaultSets || 3,
        targetReps: ex.targetReps || '8-10 reps',
        restPeriodSeconds: ex.restPeriodSeconds || 90,
        targetRpe: ex.targetRpe || 8,
        notes: ex.notes || '',
      })),
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
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase tracking-wider">
                  Gemini 3.8 Flash • Client SDK
                </span>
                <button
                  type="button"
                  onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition cursor-pointer flex items-center gap-1 ${
                    hasLiveApiKey 
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60' 
                      : 'bg-amber-950/60 text-amber-300 border-amber-500/40 hover:bg-amber-900/60'
                  }`}
                  title="Configure Gemini API Key for Netlify or custom deployment"
                >
                  <Key className="w-2.5 h-2.5" />
                  <span>{hasLiveApiKey ? 'API Key Connected' : 'Netlify API Key Setup'}</span>
                </button>
              </div>
              <h2 className="text-lg sm:text-2xl font-black uppercase text-white font-athletic tracking-wide">
                Personalized AI Workout Architect
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
          {/* NETLIFY / CUSTOM API KEY CONFIGURATION PANEL */}
          {showApiKeyInput && (
            <div className="p-4 rounded-2xl bg-[#0d1627] border-2 border-blue-500/40 shadow-xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase font-athletic text-blue-300">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Gemini Client-Side API Key Configuration (Netlify / Static Hosting)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowApiKeyInput(false)}
                  className="text-slate-400 hover:text-white text-xs font-mono"
                >
                  ✕ Close
                </button>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                This app runs completely static on Netlify with <strong>zero server 404 dependencies</strong>. You can configure your key via Netlify environment variables (<code className="text-amber-300 font-mono">VITE_GEMINI_API_KEY</code>) or paste it directly below to save it in this browser.
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="Paste AI Studio / Gemini API Key (e.g. AIzaSy...)"
                  className="flex-1 px-3 py-2 rounded-xl bg-[#070b13] border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase rounded-xl transition cursor-pointer whitespace-nowrap"
                >
                  Save Key
                </button>
              </div>

              {keySaveMessage && (
                <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{keySaveMessage}</span>
                </div>
              )}
            </div>
          )}

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
                  <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
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
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border ${
                        generatedPlan.source === 'gemini-3.8-flash'
                          ? 'bg-blue-950/70 text-blue-300 border-blue-500/40'
                          : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                      }`}>
                        <Sparkles className="w-3 h-3" />
                        {generatedPlan.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Calibrated Engine'}
                      </span>
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

                            {/* Rest Period */}
                            <div className="col-span-3 sm:col-span-2 text-center">
                              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                <Clock className="w-3 h-3 text-blue-400" />
                                {ex.restPeriodSeconds}s
                              </span>
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

              {/* OPTIONAL CONSTRAINTS / FOCUS NOTES */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                  <span>Custom Focus or Injury Constraints (Optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Focus on pull-ups and core stability; protect lower back from heavy barbell squats; include explosive foot pursuit speed drills..."
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
                  <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
                  <span>Generate Personalized Training Plan</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="mt-2 text-center text-[11px] text-slate-500 font-mono">
                  Powered by Gemini 3.8 Flash • Generates exercises, set volume, reps, and ATP rest intervals
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
