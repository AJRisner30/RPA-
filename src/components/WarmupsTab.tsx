import React, { useState, useEffect } from 'react';
import { 
  Flame, CheckCircle2, ChevronRight, ChevronLeft, 
  ShieldCheck, Sparkles, X, Activity, Dumbbell, Play, RotateCcw
} from 'lucide-react';
import { WarmUpRoutine, WarmUpStep } from '../types';
import { INITIAL_WARMUPS } from '../data/initialData';
import { soundManager } from '../utils/audio';

export const WarmupsTab: React.FC<{ selectedWarmupId?: string | null }> = ({
  selectedWarmupId,
}) => {
  const [routines] = useState<WarmUpRoutine[]>(INITIAL_WARMUPS);
  const [activeRoutine, setActiveRoutine] = useState<WarmUpRoutine>(() => {
    if (selectedWarmupId) {
      const found = INITIAL_WARMUPS.find((w) => w.id === selectedWarmupId);
      if (found) return found;
    }
    return INITIAL_WARMUPS[0];
  });

  // Guided Reps-Based Warmup Tracker State
  const [isPlayingGuided, setIsPlayingGuided] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Update routine if selectedWarmupId changes externally
  useEffect(() => {
    if (selectedWarmupId) {
      const found = routines.find((r) => r.id === selectedWarmupId);
      if (found) {
        setActiveRoutine(found);
      }
    }
  }, [selectedWarmupId, routines]);

  const handleStartGuided = (routine: WarmUpRoutine) => {
    setActiveRoutine(routine);
    setCurrentStepIndex(0);
    setCompletedSteps({});
    setIsPlayingGuided(true);
    soundManager.playCountdownBeep(true);
  };

  const handleCompleteCurrentStep = () => {
    soundManager.playRestComplete();
    setCompletedSteps((prev) => ({ ...prev, [currentStepIndex]: true }));
    if (currentStepIndex < activeRoutine.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Completed all steps
      setTimeout(() => {
        setIsPlayingGuided(false);
      }, 600);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < activeRoutine.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      soundManager.playCountdownBeep(true);
    } else {
      soundManager.playRestComplete();
      setIsPlayingGuided(false);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const currentGuidedStep = activeRoutine.steps[currentStepIndex];

  return (
    <div className="space-y-6">
      {/* Tab Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0c1322] via-[#0f172a] to-[#0c1322] border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              Dynamic Mobility &amp; CNS Primers
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-mono">
              <Dumbbell className="w-3.5 h-3.5" />
              100% Reps-Based (No Timers)
            </span>
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              ISSA Certified Protocol
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white font-athletic uppercase tracking-wide leading-tight">
            Athlete Warm-Up Protocols
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Patrol Ready Performance joint lubrication, rotator cuff activation, hip capsule mobilization,
            and CNS neural potentiation routines executed through controlled repetitions prior to frontline loading.
          </p>
        </div>
      </div>

      {/* Routine Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {routines.map((routine) => {
          const isSelected = activeRoutine.id === routine.id;

          return (
            <div
              key={routine.id}
              onClick={() => {
                setActiveRoutine(routine);
                if (isPlayingGuided) {
                  setIsPlayingGuided(false);
                }
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#0f172a] border-blue-500/60 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/30'
                  : 'bg-[#0c1322] hover:bg-[#0f172a] border-slate-800/80 text-slate-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-950/60 text-blue-300 border border-blue-800/40">
                    {routine.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {routine.steps.length} Rep Drills
                  </span>
                </div>
                <h3 className="text-lg font-black text-white font-athletic tracking-wide">
                  {routine.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{routine.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Dynamic Primer</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartGuided(routine);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all border border-blue-400/40 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Start Reps Guide
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Routine Detail & Steps List */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                {activeRoutine.category}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-amber-300 font-mono font-bold">
                {activeRoutine.steps.length} Rep Priming Drills
              </span>
            </div>
            <h2 className="text-2xl font-black text-white font-athletic tracking-wide mt-1">
              {activeRoutine.title}
            </h2>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {activeRoutine.focusMuscles.map((m) => (
                <span
                  key={m}
                  className="px-2 py-0.5 rounded-md bg-[#060b14] text-slate-300 text-[11px] font-medium border border-slate-700/60"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleStartGuided(activeRoutine)}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-blue-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer self-start sm:self-auto border border-blue-400/40"
          >
            <Play className="w-4 h-4 fill-white" />
            Launch Step-by-Step Reps Primer
          </button>
        </div>

        {/* Steps List */}
        <div className="mt-6 space-y-3">
          {activeRoutine.steps.map((step, idx) => (
            <div
              key={step.id}
              className="p-4 bg-[#060b14] rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-base font-bold text-white tracking-wide">{step.name}</h4>
                  <span className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full font-mono">
                    {step.targetArea}
                  </span>
                </div>

                <ul className="space-y-1 pl-8 text-xs text-slate-300">
                  {step.cues.map((cue, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>{cue}</span>
                    </li>
                  ))}
                </ul>

                <p className="pl-8 text-[11px] text-blue-300/80 italic font-mono pt-1">
                  💡 {step.coachingPoint}
                </p>
              </div>

              {/* Bold Reps Target Badge */}
              <div className="flex items-center gap-3 pl-8 md:pl-0 shrink-0">
                <span className="font-mono text-xs sm:text-sm font-black text-amber-300 bg-amber-500/10 px-3.5 py-1.5 rounded-xl border border-amber-500/30 uppercase tracking-wide">
                  {step.repsText || '10-15 Controlled Reps'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guided Reps-Based Interactive Primer Modal */}
      {isPlayingGuided && currentGuidedStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#0c1322] border-2 border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative flex flex-col">
            <button
              onClick={() => setIsPlayingGuided(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Guided Player Header */}
            <div className="text-center pb-4 border-b border-slate-800">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Guided Reps Primer • Drill {currentStepIndex + 1} of {activeRoutine.steps.length}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Reps Mode
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-athletic mt-1">
                {currentGuidedStep.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Target: <span className="text-blue-300 font-semibold">{currentGuidedStep.targetArea}</span>
              </p>
            </div>

            {/* Prominent Rep Target Card (Heroic Reps Display - NO TIMER) */}
            <div className="my-6 flex flex-col items-center justify-center">
              <div className="w-full py-6 px-4 rounded-2xl bg-gradient-to-b from-[#080d18] to-[#040810] border-2 border-amber-500/50 flex flex-col items-center justify-center shadow-xl shadow-amber-950/20 text-center">
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400/90 font-bold flex items-center gap-1.5 mb-1">
                  <Dumbbell className="w-4 h-4 text-amber-400" />
                  Target Repetition Prescription
                </span>
                <span className="font-athletic text-3xl sm:text-4xl font-black text-amber-300 tracking-wide mt-1">
                  {currentGuidedStep.repsText || '10-15 Reps'}
                </span>
                <p className="text-xs text-slate-400 mt-2 max-w-sm">
                  Perform complete repetitions with controlled tempo and full range of motion. No timer rush.
                </p>

                {/* Mark Reps Completed Check Button */}
                <button
                  type="button"
                  onClick={handleCompleteCurrentStep}
                  className="mt-4 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/50 transition cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Mark Drill Completed</span>
                </button>
              </div>
            </div>

            {/* Form Cues */}
            <div className="p-4 bg-[#060b14] rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Execution Cues
              </span>
              <div className="space-y-1.5 text-xs text-slate-300">
                {currentGuidedStep.cues.map((cue, i) => (
                  <p key={i} className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>{cue}</span>
                  </p>
                ))}
              </div>
              <p className="text-[11px] text-blue-300/80 italic font-mono pt-1 border-t border-slate-800/80 mt-2">
                💡 {currentGuidedStep.coachingPoint}
              </p>
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-800">
              <button
                type="button"
                disabled={currentStepIndex === 0}
                onClick={handlePrevStep}
                className="px-4 py-2 bg-slate-800 disabled:opacity-30 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Drill</span>
              </button>

              <div className="text-[11px] font-mono text-slate-400">
                {currentStepIndex + 1} / {activeRoutine.steps.length}
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 border border-blue-400/40 shadow-md shadow-blue-950/40 cursor-pointer active:scale-95"
              >
                <span>{currentStepIndex === activeRoutine.steps.length - 1 ? 'Finish Warmup' : 'Next Drill'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarmupsTab;
