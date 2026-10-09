import React, { useState } from 'react';
import { 
  X, ShieldCheck, Dumbbell, Activity, CheckCircle2, 
  ArrowRight, ArrowLeft, Sparkles, Award, Zap, 
  Flame, Clock, ChevronDown, ChevronUp, RefreshCw, Check
} from 'lucide-react';
import { AthleteProfile, ProgramKey, QuestionnaireAnswers } from '../types';
import { 
  PUSH_UP_OPTIONS, 
  PULL_UP_OPTIONS, 
  AEROBIC_OPTIONS, 
  EQUIPMENT_OPTIONS, 
  EXPERIENCE_OPTIONS, 
  GOAL_OPTIONS, 
  calculateProgramRecommendation,
  RecommendationResult
} from '../utils/questionnaireEngine';
import { PatrolReadyCompanyEmblem } from './BrandingLogos';

interface AbilityQuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAthlete: AthleteProfile;
  onSaveQuestionnaire: (answers: QuestionnaireAnswers, recommendedProgram: ProgramKey) => void;
}

export const AbilityQuestionnaireModal: React.FC<AbilityQuestionnaireModalProps> = ({
  isOpen,
  onClose,
  currentAthlete,
  onSaveQuestionnaire,
}) => {
  const existing = currentAthlete.questionnaire;

  // Step 1: Benchmarks
  const [pushUpScore, setPushUpScore] = useState<QuestionnaireAnswers['pushUpScore']>(
    existing?.pushUpScore || '15_to_30'
  );
  const [pullUpScore, setPullUpScore] = useState<QuestionnaireAnswers['pullUpScore']>(
    existing?.pullUpScore || '1_to_5'
  );
  const [aerobicScore, setAerobicScore] = useState<QuestionnaireAnswers['aerobicScore']>(
    existing?.aerobicScore || '10_30_to_13_min'
  );

  // Step 2: Training logistics
  const [equipmentAccess, setEquipmentAccess] = useState<QuestionnaireAnswers['equipmentAccess']>(
    existing?.equipmentAccess || 'full_tactical_gym'
  );
  const [liftingExperience, setLiftingExperience] = useState<QuestionnaireAnswers['liftingExperience']>(
    existing?.liftingExperience || 'intermediate'
  );
  const [weeklyDays, setWeeklyDays] = useState<QuestionnaireAnswers['weeklyDays']>(
    existing?.weeklyDays || 4
  );
  const [injuryConstraints, setInjuryConstraints] = useState<string>(
    existing?.injuryConstraints || ''
  );

  // Step 3: Goals
  const [primaryGoalCategory, setPrimaryGoalCategory] = useState<QuestionnaireAnswers['primaryGoalCategory']>(
    existing?.primaryGoalCategory || 'tactical_duty_readiness'
  );

  // Wizard state: 1, 2, 3, 4 (Result)
  const [currentStep, setCurrentStep] = useState<number>(existing ? 4 : 1);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(() => {
    if (existing) {
      return calculateProgramRecommendation({
        pushUpScore: existing.pushUpScore,
        pullUpScore: existing.pullUpScore,
        aerobicScore: existing.aerobicScore,
        equipmentAccess: existing.equipmentAccess,
        liftingExperience: existing.liftingExperience,
        weeklyDays: existing.weeklyDays,
        primaryGoalCategory: existing.primaryGoalCategory,
        injuryConstraints: existing.injuryConstraints,
      });
    }
    return null;
  });

  const [showOtherPrograms, setShowOtherPrograms] = useState(false);
  const [appliedProgramMsg, setAppliedProgramMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCalculateRecommendation = () => {
    const result = calculateProgramRecommendation({
      pushUpScore,
      pullUpScore,
      aerobicScore,
      equipmentAccess,
      liftingExperience,
      weeklyDays,
      primaryGoalCategory,
      injuryConstraints,
    });
    setRecommendation(result);
    setCurrentStep(4);
  };

  const handleApplyProgram = (overrideProgramKey?: ProgramKey) => {
    if (!recommendation) return;

    const chosenKey = overrideProgramKey || recommendation.programKey;
    const finalAnswers: QuestionnaireAnswers = {
      completedAt: new Date().toISOString(),
      pushUpScore,
      pullUpScore,
      aerobicScore,
      equipmentAccess,
      liftingExperience,
      weeklyDays,
      primaryGoalCategory,
      ...(injuryConstraints.trim() ? { injuryConstraints: injuryConstraints.trim() } : {}),
      recommendedProgramKey: chosenKey,
      recommendedProgramTitle: recommendation.programTitle,
      recommendationReason: recommendation.primaryRationale,
      recommendedStartingWeek: recommendation.startingWeek,
      fitnessTier: recommendation.fitnessTier,
    };

    onSaveQuestionnaire(finalAnswers, chosenKey);
    setAppliedProgramMsg(`Enrolled in ${recommendation.programTitle}!`);
    setTimeout(() => {
      setAppliedProgramMsg(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#080e18] border border-blue-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Subtle Siren / Tactical Header Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-red-600" />

        {/* Modal Top Rail */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0c1322] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <PatrolReadyCompanyEmblem size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-blue-400 font-athletic">
                  Frontline Assessment
                </span>
                <span className="text-[10px] bg-blue-950/80 border border-blue-500/40 text-blue-300 px-2 py-0.5 rounded-full font-mono">
                  {currentStep <= 3 ? `Step ${currentStep} of 3` : 'Diagnostic Match'}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-white font-athletic tracking-wide uppercase">
                Physical Ability &amp; Program Matcher
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Close Assessment"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-900 h-1 shrink-0">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 via-sky-400 to-emerald-400 transition-all duration-300"
            style={{ width: `${(Math.min(currentStep, 3) / 3) * 100}%` }}
          />
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* ============================================================ */}
          {/* STEP 1: PHYSICAL ABILITY BENCHMARKS                         */}
          {/* ============================================================ */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-tab-fade">
              <div className="border-b border-slate-800/80 pb-3">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Step 1: Your Baseline Physical Capacity
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Be honest with your current numbers. This ensures you start at an overload intensity that builds real durability without early burnout or injury.
                </p>
              </div>

              {/* 1. Push-ups */}
              <div className="space-y-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>1. Max Unbroken Push-ups (Chest-to-Floor)</span>
                  <span className="text-[10px] text-blue-400 font-mono">Upper Body Pushing Endurance</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PUSH_UP_OPTIONS.map((opt) => {
                    const isSelected = pushUpScore === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPushUpScore(opt.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-950/70 border-blue-400 shadow-md ring-1 ring-blue-400/40 text-white'
                            : 'bg-[#0b1220] border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold font-athletic uppercase">{opt.label}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 leading-snug">{opt.sublabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Pull-ups */}
              <div className="space-y-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>2. Strict Pull-ups (Dead-Hang, No Kipping)</span>
                  <span className="text-[10px] text-blue-400 font-mono">Posterior Chain &amp; Pulling Strength</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PULL_UP_OPTIONS.map((opt) => {
                    const isSelected = pullUpScore === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPullUpScore(opt.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-950/70 border-blue-400 shadow-md ring-1 ring-blue-400/40 text-white'
                            : 'bg-[#0b1220] border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold font-athletic uppercase">{opt.label}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 leading-snug">{opt.sublabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Aerobic 1.5-mile Pace */}
              <div className="space-y-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>3. Continuous 1.5-Mile Run or Aerobic Base</span>
                  <span className="text-[10px] text-blue-400 font-mono">Law Enforcement Standard</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AEROBIC_OPTIONS.map((opt) => {
                    const isSelected = aerobicScore === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAerobicScore(opt.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-950/70 border-blue-400 shadow-md ring-1 ring-blue-400/40 text-white'
                            : 'bg-[#0b1220] border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold font-athletic uppercase">{opt.label}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 leading-snug">{opt.sublabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: EQUIPMENT ACCESS & SCHEDULE                         */}
          {/* ============================================================ */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-tab-fade">
              <div className="border-b border-slate-800/80 pb-3">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-blue-400" />
                  Step 2: Training Environment &amp; Schedule
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  We match your protocol to what gear you actually have available on shift or at home.
                </p>
              </div>

              {/* Equipment */}
              <div className="space-y-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Equipment Available
                </label>
                <div className="space-y-2">
                  {EQUIPMENT_OPTIONS.map((opt) => {
                    const isSelected = equipmentAccess === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setEquipmentAccess(opt.id)}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-blue-950/70 border-blue-400 shadow-md ring-1 ring-blue-400/40 text-white'
                            : 'bg-[#0b1220] border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div>
                          <span className="text-xs sm:text-sm font-bold block">{opt.label}</span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">{opt.sublabel}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lifting History */}
              <div className="space-y-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Strength Training Experience
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {EXPERIENCE_OPTIONS.map((opt) => {
                    const isSelected = liftingExperience === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLiftingExperience(opt.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-950/70 border-blue-400 shadow-md ring-1 ring-blue-400/40 text-white'
                            : 'bg-[#0b1220] border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{opt.label}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
                        </div>
                        <span className="text-[10px] text-slate-400">{opt.sublabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Days */}
              <div className="space-y-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Target Training Days Per Week</span>
                  <span className="text-[10px] text-blue-400 font-mono">Resistance + Conditioning</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 4, 5, 6].map((days) => {
                    const isSelected = weeklyDays === days;
                    return (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setWeeklyDays(days as 3 | 4 | 5 | 6)}
                        className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-400 shadow-md font-black'
                            : 'bg-[#0b1220] border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-sm font-black font-mono block">{days} Days</span>
                        <span className="text-[9px] opacity-75 block font-athletic uppercase">
                          {days === 3 ? 'Minimal' : days === 4 ? 'Optimal' : days === 5 ? 'High Volume' : 'Elite Split'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Injury Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Duty Schedule or Joint Limitations <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={injuryConstraints}
                  onChange={(e) => setInjuryConstraints(e.target.value)}
                  placeholder="e.g., Graveyard 12-hr shifts, lower back caution with heavy squats"
                  className="w-full bg-[#0b1220] border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: MISSION GOALS                                       */}
          {/* ============================================================ */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-tab-fade">
              <div className="border-b border-slate-800/80 pb-3">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  Step 3: Your Primary Mission Goal
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  What is your highest priority outcome over the upcoming training cycle?
                </p>
              </div>

              <div className="space-y-2.5">
                {GOAL_OPTIONS.map((g) => {
                  const isSelected = primaryGoalCategory === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setPrimaryGoalCategory(g.id)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-blue-950/70 border-blue-400 shadow-md ring-1 ring-blue-400/40 text-white'
                          : 'bg-[#0b1220] border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-black font-athletic uppercase text-white">
                            {g.label}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-blue-900/60 text-blue-300 border border-blue-500/30">
                            {g.badge}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {g.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 4: RECOMMENDATION & DIAGNOSTIC REPORT                   */}
          {/* ============================================================ */}
          {currentStep === 4 && recommendation && (
            <div className="space-y-6 animate-tab-fade">
              {/* Tactical Tier Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 via-[#0c182c] to-blue-950/80 border border-blue-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold block">
                      Calculated Fitness Classification
                    </span>
                    <span className="text-base sm:text-lg font-black text-white font-athletic uppercase">
                      {recommendation.fitnessTier}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center">
                  <span className="text-xs text-slate-300 font-mono">
                    {weeklyDays} Days/Wk Target
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-blue-400 font-mono font-bold">
                    {equipmentAccess === 'bodyweight_dumbbells' ? 'DB & BW' : 'Full Gym'}
                  </span>
                </div>
              </div>

              {/* Recommended Program Showcase Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#0b1322] border-2 border-blue-400 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl font-athletic tracking-wider shadow">
                  Top Tactical Match
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wide">
                      Recommended Beginning Track
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white font-athletic tracking-wide uppercase">
                    {recommendation.programTitle}
                  </h3>

                  <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-950 border border-blue-500/40 text-blue-300 font-bold">
                      {recommendation.durationText}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                      {recommendation.weeklySplit}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
                      Start: {recommendation.startingPhaseTitle}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
                    {recommendation.primaryRationale}
                  </p>

                  {recommendation.equipmentNotice && (
                    <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-300 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{recommendation.equipmentNotice}</span>
                    </div>
                  )}

                  {/* Key Action Points */}
                  <div className="pt-2 space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-athletic block">
                      Program Directives &amp; Overload Focus:
                    </span>
                    <div className="space-y-1">
                      {recommendation.keyActionPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleApplyProgram()}
                    className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-athletic font-black uppercase text-sm tracking-wider shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>Apply &amp; Launch {recommendation.programTitle.split('(')[0].trim()}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                </div>

                {appliedProgramMsg && (
                  <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2 animate-bounce">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{appliedProgramMsg}</span>
                  </div>
                )}
              </div>

              {/* Compare Other 3 Programs Accordion */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-[#0a0f1d]">
                <button
                  type="button"
                  onClick={() => setShowOtherPrograms(!showOtherPrograms)}
                  className="w-full p-3.5 text-left flex items-center justify-between text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <span>Explore &amp; Switch to Other Available Tracks</span>
                  {showOtherPrograms ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showOtherPrograms && (
                  <div className="p-3.5 border-t border-slate-800 space-y-2.5 bg-black/40">
                    <p className="text-[11px] text-slate-400">
                      You are always in control of your active program. If your training goals shift or you want to review the full catalog:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { key: 'apex_protocol' as const, name: 'The Apex Protocol', weeks: '26 Wks', desc: '5 mesocycles from base to peak tactical readiness' },
                        { key: 'tactical_hypertrophy' as const, name: 'Tactical Hypertrophy', weeks: '6 Wks', desc: 'Upper/Lower body armor & pursuit sprints' },
                        { key: 'hybrid_protocol' as const, name: 'Hybrid Protocol', weeks: '12 Wks', desc: 'Heavy barbell lifts + running progression' },
                        { key: 'hybrid_db' as const, name: 'Hybrid DB & BW', weeks: '12 Wks', desc: 'Dumbbell volume & calisthenics density' },
                      ]
                        .filter((p) => p.key !== recommendation.programKey)
                        .map((p) => (
                          <div key={p.key} className="p-3 rounded-xl bg-[#0e1626] border border-slate-800 flex flex-col justify-between gap-2">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white font-athletic uppercase">{p.name}</span>
                                <span className="text-[9px] font-mono text-blue-400">{p.weeks}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 block mt-0.5">{p.desc}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleApplyProgram(p.key)}
                              className="w-full py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 border border-blue-500/40 text-[11px] font-bold text-blue-300 transition-colors cursor-pointer text-center"
                            >
                              Enroll in {p.name}
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Rail (Steps 1 to 3) */}
        {currentStep <= 3 && (
          <div className="p-4 border-t border-slate-800 bg-[#0c1322] flex items-center justify-between gap-3 shrink-0">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-athletic uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-2 ml-auto"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCalculateRecommendation}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-black font-athletic uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-2 ml-auto active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Analyze Ability &amp; Recommend Program</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
