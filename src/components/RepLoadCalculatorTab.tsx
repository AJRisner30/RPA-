import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, Dumbbell, Sparkles, Scale, Percent, 
  ArrowRight, RotateCcw, Info, CheckCircle2, Bookmark, 
  Save, Plus, Trash2, HelpCircle, Layers, ChevronDown, 
  ChevronUp, Target, Award, ShieldCheck, Flame, BarChart3,
  Timer
} from 'lucide-react';
import { WorkoutSessionLog } from '../types';
import { calculate1RM, extractPersonalRecords } from '../utils/storage';
import { soundManager } from '../utils/audio';
import { RunPaceHrCalculator } from './RunPaceHrCalculator';

export type CalculationFormula = 'epley' | 'brzycki' | 'lombardi' | 'consensus';
export type WeightUnit = 'lbs' | 'kg';

export interface SavedLift {
  id: string;
  name: string;
  category: 'Barbell' | 'Dumbbell' | 'Bodyweight' | 'Machine';
  estimated1RM: number; // always stored in lbs for consistency
  dateUpdated?: string;
  sourceNote?: string;
}

const DEFAULT_SAVED_LIFTS: SavedLift[] = [
  { id: 'lift-1', name: 'Barbell Bench Press', category: 'Barbell', estimated1RM: 225, sourceNote: 'Standard Upper Push Benchmark' },
  { id: 'lift-2', name: 'Barbell Back Squat', category: 'Barbell', estimated1RM: 315, sourceNote: 'Posterior & Quad Driver' },
  { id: 'lift-3', name: 'Barbell Conventional Deadlift', category: 'Barbell', estimated1RM: 365, sourceNote: 'Max Posterior Chain Pull' },
  { id: 'lift-4', name: 'Overhead Press (OHP)', category: 'Barbell', estimated1RM: 135, sourceNote: 'Vertical Pressing Benchmark' },
  { id: 'lift-5', name: 'Bent-Over Barbell Row', category: 'Barbell', estimated1RM: 185, sourceNote: 'Horizontal Pulling Mass' },
  { id: 'lift-6', name: 'Incline DB Press (Per Hand)', category: 'Dumbbell', estimated1RM: 80, sourceNote: 'Upper Clavicular DB Focus' },
  { id: 'lift-7', name: 'Dumbbell Floor Press (Per Hand)', category: 'Dumbbell', estimated1RM: 75, sourceNote: 'Triceps & Chest Lockout' },
];

const STORAGE_SAVED_LIFTS_KEY = 'rpa_saved_1rm_lifts_v1';

interface RepLoadCalculatorTabProps {
  logs?: WorkoutSessionLog[];
}

export const RepLoadCalculatorTab: React.FC<RepLoadCalculatorTabProps> = ({ logs = [] }) => {
  // Calculator mode: Strength (1RM & Rep Loads) vs Cardio (Run Pace & Heart Rate)
  const [activeCalculator, setActiveCalculator] = useState<'strength' | 'cardio'>('strength');

  // Unit & Formula toggles
  const [unit, setUnit] = useState<WeightUnit>('lbs');
  const [formula, setFormula] = useState<CalculationFormula>('consensus');
  
  // Core Calculator Inputs
  const [estimated1RM, setEstimated1RM] = useState<number>(225);
  const [targetReps, setTargetReps] = useState<number>(5);
  const [targetRpe, setTargetRpe] = useState<number>(10); // RPE 10 = 0 RIR (Max Effort)
  const [exerciseTitle, setExerciseTitle] = useState<string>('Barbell Bench Press');

  // Reverse 1RM Estimator (Calculate 1RM from set first)
  const [showEstimatorModal, setShowEstimatorModal] = useState<boolean>(false);
  const [estimatorWeight, setEstimatorWeight] = useState<number>(185);
  const [estimatorReps, setEstimatorReps] = useState<number>(8);
  const [estimatorRpe, setEstimatorRpe] = useState<number>(9); // 1 RIR

  // Barbell Plate Visualizer toggle & bar weight
  const [showPlateLoader, setShowPlateLoader] = useState<boolean>(true);
  const [barWeightLbs, setBarWeightLbs] = useState<number>(45);

  // Saved lifts state
  const [savedLifts, setSavedLifts] = useState<SavedLift[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_SAVED_LIFTS;
    try {
      const data = localStorage.getItem(STORAGE_SAVED_LIFTS_KEY);
      return data ? JSON.parse(data) : DEFAULT_SAVED_LIFTS;
    } catch {
      return DEFAULT_SAVED_LIFTS;
    }
  });

  const [isAddingCustomLift, setIsAddingCustomLift] = useState<boolean>(false);
  const [customLiftName, setCustomLiftName] = useState<string>('');
  const [customLift1RM, setCustomLift1RM] = useState<number>(185);
  const [customLiftCategory, setCustomLiftCategory] = useState<SavedLift['category']>('Barbell');

  // Save lifts to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_SAVED_LIFTS_KEY, JSON.stringify(savedLifts));
    }
  }, [savedLifts]);

  // Unit conversion multipliers
  const unitFactor = unit === 'kg' ? 0.45359237 : 1;
  const invUnitFactor = unit === 'kg' ? 2.20462262 : 1;

  // Formula core implementations
  const calculateWeightForReps = (oneRM: number, reps: number, calcFormula: CalculationFormula): number => {
    if (oneRM <= 0 || reps <= 0) return 0;
    if (reps === 1) return oneRM;

    switch (calcFormula) {
      case 'epley':
        // 1RM = W * (1 + reps/30) => W = 1RM / (1 + reps/30)
        return oneRM / (1 + reps / 30);
      case 'brzycki':
        // 1RM = W * (36 / (37 - reps)) => W = 1RM * (37 - reps) / 36
        if (reps >= 37) return oneRM * 0.1;
        return oneRM * (37 - reps) / 36;
      case 'lombardi':
        // 1RM = W * (reps ^ 0.10) => W = 1RM / (reps ^ 0.10)
        return oneRM / Math.pow(reps, 0.10);
      case 'consensus':
      default: {
        const epleyW = oneRM / (1 + reps / 30);
        const brzyckiW = reps < 37 ? (oneRM * (37 - reps) / 36) : epleyW;
        return (epleyW + brzyckiW) / 2;
      }
    }
  };

  // Estimate 1RM from (weight, reps, rpe)
  const estimate1RMFromSet = (weight: number, reps: number, rpe: number, calcFormula: CalculationFormula): number => {
    if (weight <= 0 || reps <= 0) return 0;
    // RPE to reps to failure (RIR = 10 - RPE)
    const rir = Math.max(0, 10 - rpe);
    const effectiveRepsToFailure = reps + rir;

    if (effectiveRepsToFailure === 1) return weight;

    switch (calcFormula) {
      case 'epley':
        return weight * (1 + effectiveRepsToFailure / 30);
      case 'brzycki':
        if (effectiveRepsToFailure >= 37) return weight * 2.5;
        return weight * (36 / (37 - effectiveRepsToFailure));
      case 'lombardi':
        return weight * Math.pow(effectiveRepsToFailure, 0.10);
      case 'consensus':
      default: {
        const epley1RM = weight * (1 + effectiveRepsToFailure / 30);
        const brzycki1RM = effectiveRepsToFailure < 37 ? weight * (36 / (37 - effectiveRepsToFailure)) : epley1RM;
        return (epley1RM + brzycki1RM) / 2;
      }
    }
  };

  // Effective reps based on Target RPE (leaving Reps in Reserve)
  const rir = Math.max(0, 10 - targetRpe);
  const effectiveCalculationReps = targetReps + rir;

  // Exact calculated working weight
  const calculatedWeightExact = useMemo(() => {
    return calculateWeightForReps(estimated1RM, effectiveCalculationReps, formula);
  }, [estimated1RM, effectiveCalculationReps, formula]);

  // Rounding for practical gym application
  // In lbs: round to nearest 5 lbs (standard) or 2.5 lbs
  // In kg: round to nearest 2.5 kg or 1.25 kg
  const roundedBarbellWeight = useMemo(() => {
    const step = unit === 'lbs' ? 5 : 2.5;
    return Math.round(calculatedWeightExact / step) * step;
  }, [calculatedWeightExact, unit]);

  const percentageOf1RM = useMemo(() => {
    if (estimated1RM <= 0) return 0;
    return Math.min(100, Math.round((calculatedWeightExact / estimated1RM) * 1000) / 10);
  }, [calculatedWeightExact, estimated1RM]);

  // Determine adaptation zone based on % of 1RM
  const adaptationZone = useMemo(() => {
    if (targetReps <= 3) {
      return {
        label: 'Absolute Strength & Neuromuscular Drive',
        desc: 'Maximum motor unit recruitment, myofibrillar tension, and CNS potentiation.',
        color: 'text-amber-400',
        badge: '90–100% 1RM • Strength Peak'
      };
    } else if (targetReps <= 6) {
      return {
        label: 'Heavy Strength & Power Density',
        desc: 'Core compound strength driver with high mechanical load and moderate volume.',
        color: 'text-amber-400',
        badge: '83–90% 1RM • Primary Strength'
      };
    } else if (targetReps <= 12) {
      return {
        label: 'Hypertrophy & Muscle Density Sweet Spot',
        desc: 'Optimal balance of mechanical tension, metabolic stress, and myofibrillar hypertrophy.',
        color: 'text-emerald-400',
        badge: '68–82% 1RM • Hypertrophy'
      };
    } else {
      return {
        label: 'Muscular Endurance & Metabolic Work Capacity',
        desc: 'Lactate threshold buffering, capillary density expansion, and glycogen endurance.',
        color: 'text-cyan-400',
        badge: '< 68% 1RM • Work Capacity'
      };
    }
  }, [targetReps]);

  // Plate loading breakdown calculation
  const plateLoading = useMemo(() => {
    const currentBarWeight = unit === 'lbs' ? barWeightLbs : Math.round(barWeightLbs * 0.45359237);
    const targetLoad = roundedBarbellWeight;

    if (targetLoad <= currentBarWeight) {
      return {
        platesPerSide: [],
        weightPerSide: 0,
        remainder: 0,
        canLoad: true,
        barWeight: currentBarWeight,
      };
    }

    const weightOnPlates = targetLoad - currentBarWeight;
    const weightPerSide = weightOnPlates / 2;

    const availablePlates = unit === 'lbs' 
      ? [45, 35, 25, 10, 5, 2.5] 
      : [25, 20, 15, 10, 5, 2.5, 1.25];

    let remainingToLoad = weightPerSide;
    const platesPerSide: { weight: number; count: number; color: string }[] = [];

    const plateColorsLbs: Record<number, string> = {
      45: 'bg-amber-500 text-black font-black border-amber-500',
      35: 'bg-blue-600 text-white border-blue-500',
      25: 'bg-amber-500 text-zinc-950 border-amber-400 font-black',
      10: 'bg-emerald-600 text-white border-emerald-500',
      5: 'bg-zinc-200 text-zinc-900 border-zinc-300 font-bold',
      2.5: 'bg-zinc-700 text-zinc-200 border-zinc-500',
    };

    const plateColorsKg: Record<number, string> = {
      25: 'bg-amber-500 text-black font-black border-amber-500',
      20: 'bg-blue-600 text-white border-blue-500',
      15: 'bg-amber-500 text-zinc-950 border-amber-400 font-black',
      10: 'bg-emerald-600 text-white border-emerald-500',
      5: 'bg-zinc-200 text-zinc-900 border-zinc-300 font-bold',
      2.5: 'bg-zinc-700 text-zinc-200 border-zinc-500',
      1.25: 'bg-zinc-800 text-zinc-400 border-zinc-600',
    };

    for (const plate of availablePlates) {
      if (remainingToLoad >= plate) {
        const count = Math.floor(remainingToLoad / plate);
        if (count > 0) {
          platesPerSide.push({
            weight: plate,
            count,
            color: unit === 'lbs' ? (plateColorsLbs[plate] || 'bg-zinc-700 text-white') : (plateColorsKg[plate] || 'bg-zinc-700 text-white'),
          });
          remainingToLoad = Math.round((remainingToLoad - count * plate) * 100) / 100;
        }
      }
    }

    return {
      platesPerSide,
      weightPerSide,
      remainder: remainingToLoad,
      canLoad: true,
      barWeight: currentBarWeight,
    };
  }, [roundedBarbellWeight, unit, barWeightLbs]);

  // Matrix of common rep targets from 1 to 20
  const repMatrix = useMemo(() => {
    const commonReps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 18, 20];
    const step = unit === 'lbs' ? 5 : 2.5;

    return commonReps.map((reps) => {
      const wExact = calculateWeightForReps(estimated1RM, reps, formula);
      const wRound = Math.round(wExact / step) * step;
      const pct = Math.round((wExact / estimated1RM) * 1000) / 10;
      
      let category = 'Max Strength';
      let tagBg = 'bg-amber-950/60 text-amber-400 border-amber-700/50';
      if (reps >= 6 && reps <= 12) {
        category = 'Hypertrophy';
        tagBg = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
      } else if (reps > 12) {
        category = 'Endurance';
        tagBg = 'bg-cyan-950/60 text-cyan-400 border-cyan-800/60';
      }

      return {
        reps,
        wExact,
        wRound,
        pct,
        category,
        tagBg,
      };
    });
  }, [estimated1RM, formula, unit]);

  // Derived Personal Records from logged history
  const loggedPRs = useMemo(() => {
    return extractPersonalRecords(logs);
  }, [logs]);

  // Handler to load a saved lift into active calculator
  const handleSelectSavedLift = (lift: SavedLift) => {
    setExerciseTitle(lift.name);
    setEstimated1RM(lift.estimated1RM);
    soundManager.playSetLogged();
  };

  // Handler to sync PRs from logged workouts
  const handleSyncPRs = () => {
    if (loggedPRs.length === 0) return;
    const updated = [...savedLifts];
    let addedOrUpdatedCount = 0;

    loggedPRs.forEach((pr) => {
      const existingIdx = updated.findIndex((l) => l.name.toLowerCase() === pr.exerciseName.toLowerCase());
      if (existingIdx !== -1) {
        if (pr.estimated1RM > updated[existingIdx].estimated1RM) {
          updated[existingIdx].estimated1RM = pr.estimated1RM;
          updated[existingIdx].sourceNote = `Auto-Synced from Logged PR: ${pr.maxWeightLbs} lbs × ${pr.repsAtMax} reps (${pr.date})`;
          addedOrUpdatedCount++;
        }
      } else {
        updated.push({
          id: `lift-pr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: pr.exerciseName,
          category: 'Barbell',
          estimated1RM: pr.estimated1RM,
          sourceNote: `Auto-Synced from Logged PR: ${pr.maxWeightLbs} lbs × ${pr.repsAtMax} reps (${pr.date})`,
        });
        addedOrUpdatedCount++;
      }
    });

    if (addedOrUpdatedCount > 0) {
      setSavedLifts(updated);
      soundManager.playSetLogged();
    }
  };

  const handleCreateCustomLift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLiftName.trim()) return;

    const newLift: SavedLift = {
      id: `custom-lift-${Date.now()}`,
      name: customLiftName.trim(),
      category: customLiftCategory,
      estimated1RM: Math.max(10, customLift1RM),
      sourceNote: 'Custom Athlete Profile',
    };

    setSavedLifts((prev) => [newLift, ...prev]);
    setExerciseTitle(newLift.name);
    setEstimated1RM(newLift.estimated1RM);
    setIsAddingCustomLift(false);
    setCustomLiftName('');
    soundManager.playSetLogged();
  };

  const handleDeleteSavedLift = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedLifts((prev) => prev.filter((l) => l.id !== id));
  };

  // Calculate estimated 1RM in the sub-modal
  const calculatedEstimator1RM = useMemo(() => {
    return Math.round(estimate1RMFromSet(estimatorWeight, estimatorReps, estimatorRpe, formula));
  }, [estimatorWeight, estimatorReps, estimatorRpe, formula]);

  const handleApplyEstimated1RM = () => {
    setEstimated1RM(calculatedEstimator1RM);
    setShowEstimatorModal(false);
    soundManager.playSetLogged();
  };

  return (
    <div id="rep-calculator-tab" className="space-y-6">
      {/* Top Suite Switcher: 1RM & Rep Loads vs Run Pace & HR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-2 sm:p-2.5 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveCalculator('strength')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeCalculator === 'strength'
                ? 'bg-amber-500 text-black font-black shadow-md shadow-amber-950/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>1RM &amp; Rep Loads</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCalculator('cardio')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeCalculator === 'cardio'
                ? 'bg-amber-500 text-black font-black shadow-md shadow-amber-950/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>Run Pace &amp; Heart Rate</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-zinc-500 hidden md:inline px-3">
          Overland Athletics • Precision Calculators
        </span>
      </div>

      {activeCalculator === 'cardio' ? (
        <RunPaceHrCalculator />
      ) : (
        <>
          {/* Tab Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider">
                  Load Intensity Prescription
                </span>
                <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full text-[10px] font-mono">
                  Epley &amp; Brzycki Model
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-white font-athletic flex items-center gap-2.5">
                <Calculator className="w-7 h-7 text-amber-400" />
                1RM &amp; <span className="text-amber-400">Rep Load</span> Calculator
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Prescribe precise working barbell &amp; dumbbell weights for any rep count based on your estimated 1RM, target reps, and RPE effort level.
              </p>
            </div>

        {/* Global Controls: Unit & Formula */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Unit Switcher */}
          <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800 flex items-center">
            <button
              type="button"
              onClick={() => setUnit('lbs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                unit === 'lbs'
                  ? 'bg-amber-500 text-black font-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              LBS
            </button>
            <button
              type="button"
              onClick={() => setUnit('kg')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                unit === 'kg'
                  ? 'bg-amber-500 text-black font-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              KG
            </button>
          </div>

          {/* Formula Selector */}
          <div className="relative">
            <select
              value={formula}
              onChange={(e) => setFormula(e.target.value as CalculationFormula)}
              className="bg-zinc-950 text-xs font-bold text-zinc-300 border border-zinc-800 rounded-xl px-3 py-2 pr-8 appearance-none focus:outline-none focus:border-amber-500 cursor-pointer"
              title="Select Exercise Science Formula"
            >
              <option value="consensus">Consensus (Epley + Brzycki)</option>
              <option value="epley">Epley Formula (Most Common)</option>
              <option value="brzycki">Brzycki Formula (Powerlifting)</option>
              <option value="lombardi">Lombardi Power-Law</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick 1RM Estimator Trigger */}
          <button
            type="button"
            onClick={() => setShowEstimatorModal(true)}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Estimate 1RM From Set</span>
            <span className="sm:hidden">1RM Estimator</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls & Inputs, Right Output Result Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Target Inputs & Exercise Switcher (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Target Reps & 1RM Inputs Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm sm:text-base font-black uppercase text-white tracking-wider font-athletic">
                  Target Prescription Parameters
                </h2>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                {exerciseTitle}
              </span>
            </div>

            {/* Input 1: Estimated 1RM */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                  Estimated 1 Rep Max (1RM)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {estimated1RM} {unit}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowEstimatorModal(true)}
                    className="text-[10px] text-zinc-400 hover:text-amber-400 underline cursor-pointer"
                  >
                    Calculate from a set
                  </button>
                </div>
              </div>

              <div className="relative flex items-center">
                <input
                  type="number"
                  min={10}
                  max={1200}
                  step={5}
                  value={estimated1RM || ''}
                  onChange={(e) => setEstimated1RM(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-lg font-mono font-black text-white focus:outline-none transition-all"
                  placeholder="e.g. 225"
                />
                <span className="absolute right-3.5 text-xs font-mono font-bold text-zinc-500 uppercase">
                  {unit}
                </span>
              </div>

              {/* Quick 1RM Jump Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-zinc-400 uppercase font-bold mr-1">Quick:</span>
                {[135, 185, 225, 275, 315, 365, 405].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setEstimated1RM(preset);
                      soundManager.playSetLogged();
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      estimated1RM === preset
                        ? 'bg-amber-500 text-black font-black font-black'
                        : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Input 2: Target Reps with slider and quick pills */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
                  Target Reps to Perform
                </label>
                <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {targetReps} {targetReps === 1 ? 'Rep' : 'Reps'}
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={targetReps}
                onChange={(e) => setTargetReps(Number(e.target.value))}
                className="w-full accent-amber-500 bg-zinc-950 h-2 rounded-lg cursor-pointer"
              />

              {/* Quick Rep Range Selector Pills */}
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 mt-2">
                {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setTargetReps(r);
                      soundManager.playSetLogged();
                    }}
                    className={`py-1.5 rounded-lg text-xs font-mono font-bold text-center transition-all cursor-pointer border ${
                      targetReps === r
                        ? 'bg-amber-500 text-zinc-950 border-amber-400 font-black shadow-md'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Input 3: Target RPE / RIR (Rate of Perceived Exertion) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Target Effort (RPE / Reps In Reserve)
                </label>
                <span className="text-xs font-mono text-zinc-300">
                  {targetRpe === 10 ? 'RPE 10 (0 RIR • Failure)' : `RPE ${targetRpe} (${10 - targetRpe} RIR)`}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { rpe: 10, label: 'RPE 10 (0 RIR)', desc: 'Max Effort / Failure' },
                  { rpe: 9, label: 'RPE 9 (1 RIR)', desc: '1 Rep in Reserve' },
                  { rpe: 8, label: 'RPE 8 (2 RIR)', desc: 'Crisp Heavy Working Set' },
                  { rpe: 7, label: 'RPE 7 (3 RIR)', desc: 'Speed / Submaximal' },
                ].map((item) => (
                  <button
                    key={item.rpe}
                    type="button"
                    onClick={() => {
                      setTargetRpe(item.rpe);
                      soundManager.playSetLogged();
                    }}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      targetRpe === item.rpe
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm'
                        : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-xs font-bold block font-mono">{item.label}</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Saved Compound Lifts & Athlete 1RMs */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-md">
            <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-black uppercase text-white tracking-wider font-athletic">
                  Saved Athlete 1RMs &amp; Compound Presets
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {loggedPRs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSyncPRs}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Auto-sync 1RM from your completed workout session PRs"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    Sync Logged PRs
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsAddingCustomLift(!isAddingCustomLift)}
                  className="p-1 text-zinc-400 hover:text-white bg-zinc-800 rounded-lg cursor-pointer"
                  title="Add custom lift"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Custom Lift Inline Creator */}
            {isAddingCustomLift && (
              <form onSubmit={handleCreateCustomLift} className="mb-4 p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase">Add Custom Exercise 1RM</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomLift(false)}
                    className="text-xs text-zinc-500 hover:text-zinc-300"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Lift Name (e.g. Front Squat)"
                    value={customLiftName}
                    onChange={(e) => setCustomLiftName(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="1RM in LBS"
                    value={customLift1RM || ''}
                    onChange={(e) => setCustomLift1RM(Number(e.target.value))}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                  <select
                    value={customLiftCategory}
                    onChange={(e) => setCustomLiftCategory(e.target.value as SavedLift['category'])}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Barbell">Barbell</option>
                    <option value="Dumbbell">Dumbbell</option>
                    <option value="Bodyweight">Bodyweight</option>
                    <option value="Machine">Machine</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black font-bold rounded-lg text-xs cursor-pointer"
                >
                  Save Exercise 1RM
                </button>
              </form>
            )}

            {/* Saved Lifts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {savedLifts.map((lift) => {
                const isSelected = exerciseTitle === lift.name && estimated1RM === lift.estimated1RM;

                return (
                  <div
                    key={lift.id}
                    onClick={() => handleSelectSavedLift(lift)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 shadow-sm'
                        : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded">
                          {lift.category}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-mono text-amber-400 font-bold">Active</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-zinc-200 block truncate mt-1">
                        {lift.name}
                      </span>
                      {lift.sourceNote && (
                        <span className="text-[10px] text-zinc-400 truncate block">
                          {lift.sourceNote}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-sm font-black font-mono text-white block">
                          {lift.estimated1RM} <span className="text-[10px] text-zinc-500">LBS</span>
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {Math.round(lift.estimated1RM * 0.45359237)} kg
                        </span>
                      </div>

                      {/* Delete button (only show on hover or for custom items) */}
                      {savedLifts.length > 3 && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSavedLift(lift.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-amber-400 transition-opacity"
                          title="Remove saved lift"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Load Results & Visual Plate Loader (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Hero Result Card */}
          <div className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border-2 border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Prescribed Target Load
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                {formula.toUpperCase()}
              </span>
            </div>

            {/* Giant Recommended Weight Number */}
            <div className="text-center py-4 border-y border-zinc-800/80 my-2">
              <div className="text-5xl sm:text-6xl font-black font-mono text-white tracking-tight">
                {roundedBarbellWeight}
                <span className="text-xl sm:text-2xl font-bold text-amber-400 ml-1.5 uppercase">
                  {unit}
                </span>
              </div>

              <div className="text-xs text-zinc-400 mt-1 font-mono">
                Exact Calculated: <span className="text-zinc-200 font-bold">{calculatedWeightExact.toFixed(1)} {unit}</span>
                <span className="mx-1.5">•</span>
                <span className="text-amber-400 font-bold">{percentageOf1RM}% of 1RM</span>
              </div>

              {/* Target Reps Badge */}
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full text-xs font-mono font-black text-amber-400">
                <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
                <span>{targetReps} Reps @ {targetRpe === 10 ? 'RPE 10 (0 RIR)' : `RPE ${targetRpe} (${10 - targetRpe} RIR)`}</span>
              </div>
            </div>

            {/* Adaptation Zone */}
            <div className="mt-4 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Target Adaptation
                </span>
                <span className={`text-[10px] font-mono font-bold ${adaptationZone.color}`}>
                  {adaptationZone.badge}
                </span>
              </div>
              <span className="text-xs font-bold text-white block">
                {adaptationZone.label}
              </span>
              <p className="text-[11px] text-zinc-400 leading-snug mt-0.5">
                {adaptationZone.desc}
              </p>
            </div>
          </div>

          {/* Barbell Plate Loading Visualizer */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-md">
            <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-black uppercase text-white tracking-wider font-athletic">
                  Barbell Plate Loading Guide
                </h3>
              </div>

              {/* Barbell Weight Toggle */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span>Bar:</span>
                <button
                  type="button"
                  onClick={() => setBarWeightLbs(barWeightLbs === 45 ? 35 : 45)}
                  className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white rounded font-mono font-bold cursor-pointer"
                >
                  {unit === 'lbs' ? `${barWeightLbs} lbs` : `${Math.round(barWeightLbs * 0.45359237)} kg`}
                </button>
              </div>
            </div>

            {roundedBarbellWeight < plateLoading.barWeight ? (
              <div className="p-3 bg-zinc-950 rounded-xl text-center text-xs text-zinc-400">
                Target weight ({roundedBarbellWeight} {unit}) is below standard barbell weight ({plateLoading.barWeight} {unit}). Use dumbbells or a lighter technique bar.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Per Side Plate Weight:</span>
                  <span className="text-white font-bold">{plateLoading.weightPerSide} {unit} / side</span>
                </div>

                {/* Plates list per side */}
                {plateLoading.platesPerSide.length > 0 ? (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Plates to load on EACH side:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {plateLoading.platesPerSide.map((p, idx) => (
                        <div
                          key={idx}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-black flex items-center gap-1.5 shadow-sm ${p.color}`}
                        >
                          <span>{p.count} ×</span>
                          <span>{p.weight} {unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-400 font-mono py-1">
                    Empty barbell (no additional plates required).
                  </div>
                )}

                {plateLoading.remainder > 0 && (
                  <div className="text-[11px] text-amber-400 font-mono">
                    Remainder unplated: {plateLoading.remainder} {unit} per side (use fractional micro-plates if available).
                  </div>
                )}

                {/* Visual Barbell Graphic */}
                <div className="pt-2">
                  <div className="h-10 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center px-4 relative overflow-hidden">
                    {/* Barbell shaft */}
                    <div className="absolute inset-x-0 h-2 bg-zinc-700 mx-6 rounded-full" />
                    {/* Collar */}
                    <div className="h-6 w-2.5 bg-zinc-400 rounded-sm z-10 mr-2" />
                    {/* Stacked plates representation */}
                    <div className="flex items-center gap-1 z-10">
                      {plateLoading.platesPerSide.map((p, pIdx) => (
                        Array.from({ length: p.count }).map((_, cIdx) => (
                          <div
                            key={`${pIdx}-${cIdx}`}
                            className={`h-8 w-3 rounded-sm border ${p.color}`}
                            title={`${p.weight} ${unit}`}
                          />
                        ))
                      ))}
                    </div>
                    <span className="ml-auto text-[10px] font-mono text-zinc-500 z-10">
                      Bar + Collar
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Coach Directives */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 text-xs text-zinc-400 space-y-2">
            <div className="flex items-center gap-2 text-zinc-200 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Coach AJ&apos;s Directive: Progressive Overload</span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-400">
              When you achieve all target reps at <span className="text-zinc-200 font-bold">RPE 8 or lower</span> across all working sets, advance the working weight by <span className="text-amber-400 font-bold">5 lbs (barbell)</span> or <span className="text-amber-400 font-bold">2.5 lbs (dumbbell per hand)</span> on your subsequent workout session.
            </p>
          </div>
        </div>
      </div>

      {/* Full Rep-to-Weight Lookup Matrix (Reps 1 through 20) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-black uppercase text-white tracking-wider font-athletic flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              Full Rep-to-Weight Matrix (1 to 20 Reps)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Exact calculated loads across standard repetition targets for 1RM = <span className="text-white font-mono font-bold">{estimated1RM} {unit}</span>. Click any row to set target reps.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Formula: <span className="text-amber-400 font-bold uppercase">{formula}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Reps</th>
                <th className="py-2.5 px-3">% of 1RM</th>
                <th className="py-2.5 px-3">Exact Load</th>
                <th className="py-2.5 px-3">Barbell Rounded</th>
                <th className="py-2.5 px-3">Physiological Zone</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {repMatrix.map((item) => {
                const isSelected = item.reps === targetReps;

                return (
                  <tr
                    key={item.reps}
                    onClick={() => {
                      setTargetReps(item.reps);
                      soundManager.playSetLogged();
                    }}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 font-bold text-white'
                        : 'hover:bg-zinc-800/50 text-zinc-300'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{item.reps} {item.reps === 1 ? 'Rep' : 'Reps'}</span>
                    </td>
                    <td className="py-2.5 px-3 text-amber-400 font-bold">
                      {item.pct}%
                    </td>
                    <td className="py-2.5 px-3">
                      {item.wExact.toFixed(1)} {unit}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">
                      {item.wRound} {unit}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-sans ${item.tagBg}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTargetReps(item.reps);
                          soundManager.playSetLogged();
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-black font-black'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: 1RM Reverse Estimator (Calculate 1RM from set first) */}
      {showEstimatorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base sm:text-lg font-black uppercase text-white font-athletic tracking-wide">
                  Estimate 1RM From Completed Set
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEstimatorModal(false)}
                className="text-zinc-500 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Enter any heavy set you recently performed (weight and reps completed) to accurately project your theoretical One Rep Max using validated exercise science algorithms.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Weight Lifted ({unit})
                </label>
                <input
                  type="number"
                  min={1}
                  step={5}
                  value={estimatorWeight || ''}
                  onChange={(e) => setEstimatorWeight(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-base font-mono font-bold text-white focus:outline-none"
                  placeholder="e.g. 185"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Reps Completed
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={estimatorReps || ''}
                  onChange={(e) => setEstimatorReps(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-base font-mono font-bold text-white focus:outline-none"
                  placeholder="e.g. 8"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Perceived Effort (RPE)
                </label>
                <select
                  value={estimatorRpe}
                  onChange={(e) => setEstimatorRpe(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none cursor-pointer"
                >
                  <option value={10}>RPE 10 (Could not do any more reps • To Failure)</option>
                  <option value={9.5}>RPE 9.5 (Maybe 1 rep left with grinding form)</option>
                  <option value={9}>RPE 9 (Definitely 1 rep left in the tank)</option>
                  <option value={8.5}>RPE 8.5 (1-2 reps left in reserve)</option>
                  <option value={8}>RPE 8 (Solid 2 reps left in reserve)</option>
                  <option value={7}>RPE 7 (3 reps left • Speed / Submaximal)</option>
                </select>
              </div>
            </div>

            {/* Calculated Result Preview */}
            <div className="p-4 bg-zinc-950 rounded-xl border border-amber-500/30 text-center space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400">
                Calculated Estimated 1RM
              </span>
              <div className="text-3xl font-black font-mono text-amber-400">
                {calculatedEstimator1RM} <span className="text-sm font-bold text-zinc-400">{unit}</span>
              </div>
              <span className="text-[11px] text-zinc-400 block">
                Based on {estimatorWeight} {unit} × {estimatorReps} reps @ RPE {estimatorRpe}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEstimatorModal(false)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyEstimated1RM}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4" />
                Apply as Active 1RM
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
