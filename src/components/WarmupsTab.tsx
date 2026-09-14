import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, Play, Pause, RotateCcw, CheckCircle2, ChevronRight, 
  Clock, ShieldCheck, Sparkles, X, Activity, Volume2 
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

  // Guided Warmup Player State
  const [isPlayingGuided, setIsPlayingGuided] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [stepSecondsRemaining, setStepSecondsRemaining] = useState<number>(45);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // Update routine if selectedWarmupId changes externally
  useEffect(() => {
    if (selectedWarmupId) {
      const found = routines.find((r) => r.id === selectedWarmupId);
      if (found) {
        setActiveRoutine(found);
      }
    }
  }, [selectedWarmupId, routines]);

  // Guided timer ticker
  useEffect(() => {
    if (isTimerRunning && isPlayingGuided) {
      timerRef.current = window.setInterval(() => {
        setStepSecondsRemaining((prev) => {
          if (prev <= 1) {
            soundManager.playRestComplete();
            // Advance to next step or finish
            if (currentStepIndex < activeRoutine.steps.length - 1) {
              const nextIdx = currentStepIndex + 1;
              setCurrentStepIndex(nextIdx);
              return activeRoutine.steps[nextIdx].durationSeconds || 45;
            } else {
              setIsTimerRunning(false);
              return 0;
            }
          }
          if (prev <= 4 && prev > 1) {
            soundManager.playCountdownBeep(false);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isPlayingGuided, currentStepIndex, activeRoutine]);

  const handleStartGuided = (routine: WarmUpRoutine) => {
    setActiveRoutine(routine);
    setCurrentStepIndex(0);
    setStepSecondsRemaining(routine.steps[0].durationSeconds || 45);
    setIsPlayingGuided(true);
    setIsTimerRunning(true);
    soundManager.playCountdownBeep(true);
  };

  const handleNextStep = () => {
    if (currentStepIndex < activeRoutine.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      setStepSecondsRemaining(activeRoutine.steps[nextIdx].durationSeconds || 45);
      soundManager.playCountdownBeep(true);
    } else {
      setIsTimerRunning(false);
      soundManager.playRestComplete();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      setStepSecondsRemaining(activeRoutine.steps[prevIdx].durationSeconds || 45);
    }
  };

  const currentGuidedStep = activeRoutine.steps[currentStepIndex];

  return (
    <div className="space-y-6">
      {/* Tab Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              Dynamic Mobility & CNS Primer
            </span>
            <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ISSA Certified Protocol
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white font-athletic uppercase tracking-wide leading-tight">
            Athlete Warm-Up Protocols
          </h1>
          <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
            Risner Performance Athletics joint lubrication, rotator cuff activation, hip capsule mobilization,
            and CNS neural potentiation routines prior to heavy loading.
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
                  setIsTimerRunning(false);
                }
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-zinc-900 border-amber-500/60 shadow-lg shadow-amber-950/20'
                  : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/80 text-zinc-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-800 text-amber-300 border border-zinc-700">
                    {routine.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    ~{routine.durationMinutes} mins
                  </span>
                </div>
                <h3 className="text-lg font-black text-white font-athletic tracking-wide">
                  {routine.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{routine.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs text-zinc-400">{routine.steps.length} Steps</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartGuided(routine);
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-zinc-950" />
                  Start Guided
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Routine Detail & Steps List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {activeRoutine.category}
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-xs text-zinc-400 font-mono">
                {activeRoutine.steps.length} Priming Drills
              </span>
            </div>
            <h2 className="text-2xl font-black text-white font-athletic tracking-wide mt-1">
              {activeRoutine.title}
            </h2>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {activeRoutine.focusMuscles.map((m) => (
                <span
                  key={m}
                  className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[11px] font-medium border border-zinc-700/60"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleStartGuided(activeRoutine)}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Play className="w-4 h-4 fill-zinc-950" />
            Launch Step-by-Step Guided Timer
          </button>
        </div>

        {/* Steps List */}
        <div className="mt-6 space-y-3">
          {activeRoutine.steps.map((step, idx) => (
            <div
              key={step.id}
              className="p-4 bg-zinc-950/70 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-base font-bold text-white tracking-wide">{step.name}</h4>
                  <span className="text-[11px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full font-mono">
                    {step.targetArea}
                  </span>
                </div>

                <ul className="space-y-1 pl-8 text-xs text-zinc-300">
                  {step.cues.map((cue, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{cue}</span>
                    </li>
                  ))}
                </ul>

                <p className="pl-8 text-[11px] text-amber-300/80 italic font-mono pt-1">
                  💡 {step.coachingPoint}
                </p>
              </div>

              <div className="flex items-center gap-3 pl-8 md:pl-0 shrink-0">
                <span className="font-mono text-sm font-bold text-amber-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                  {step.repsText || `${step.durationSeconds}s`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guided Warm-up Interactive Modal */}
      {isPlayingGuided && currentGuidedStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative flex flex-col">
            <button
              onClick={() => {
                setIsPlayingGuided(false);
                setIsTimerRunning(false);
              }}
              className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Guided Player Header */}
            <div className="text-center pb-4 border-b border-zinc-800">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Guided Warm-Up • Step {currentStepIndex + 1} of {activeRoutine.steps.length}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-athletic mt-2">
                {currentGuidedStep.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Target: <span className="text-amber-300 font-semibold">{currentGuidedStep.targetArea}</span>
              </p>
            </div>

            {/* Big Countdown Timer */}
            <div className="my-6 flex flex-col items-center justify-center">
              <div className="relative w-44 h-44 rounded-full border-4 border-zinc-800 flex flex-col items-center justify-center bg-zinc-950 shadow-inner">
                <div
                  className="absolute inset-0 rounded-full border-4 border-amber-400 transition-all duration-300 pointer-events-none"
                  style={{
                    clipPath: `inset(0 0 ${100 - (stepSecondsRemaining / (currentGuidedStep.durationSeconds || 45)) * 100}% 0)`,
                  }}
                />
                <span
                  className={`font-mono text-5xl font-black tracking-tight ${
                    stepSecondsRemaining <= 5 && isTimerRunning ? 'text-amber-400 animate-pulse' : 'text-white'
                  }`}
                >
                  {stepSecondsRemaining}
                </span>
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider mt-1">
                  Seconds
                </span>
                {currentGuidedStep.repsText && (
                  <span className="text-[11px] text-amber-300 font-bold mt-0.5">
                    {currentGuidedStep.repsText}
                  </span>
                )}
              </div>
            </div>

            {/* Form Cues */}
            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Execution Cues
              </span>
              <div className="space-y-1.5 text-xs text-zinc-300">
                {currentGuidedStep.cues.map((cue, i) => (
                  <p key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{cue}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-zinc-800">
              <button
                type="button"
                disabled={currentStepIndex === 0}
                onClick={handlePrevStep}
                className="px-4 py-2 bg-zinc-800 disabled:opacity-30 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl"
              >
                Previous Step
              </button>

              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isTimerRunning ? 'bg-amber-500 text-zinc-950' : 'bg-rose-600 text-white'
                }`}
              >
                {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-zinc-950 text-xs font-bold rounded-xl flex items-center gap-1"
              >
                {currentStepIndex === activeRoutine.steps.length - 1 ? 'Finish Warmup' : 'Next Step'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
