import React, { useState, useEffect } from 'react';
import { 
  X, ChevronRight, ChevronLeft, Check, Compass, Film,
  Dumbbell, Timer, TrendingUp, Calculator, ShieldCheck, Zap, 
  Activity, Copy, CheckCircle2, Play, Flame, Award, 
  ExternalLink, ArrowRight, Eye, RefreshCw, Smartphone, Cloud, Share2
} from 'lucide-react';
import { PatrolReadyCompanyEmblem } from './BrandingLogos';
import { TabType } from './Navbar';

export interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: TabType) => void;
  onOpenAIGenerator?: () => void;
  onOpenSingleDayWorkout?: () => void;
  onOpenQuestionnaire?: () => void;
  initialStepIndex?: number;
}

interface TourStep {
  id: string;
  badge: string;
  title: string;
  tagline: string;
  tabTarget: TabType;
  actionLabel?: string;
  actionCallback?: 'ai_generator' | 'single_day' | 'questionnaire' | 'navigate';
  icon: React.ElementType;
  iconColor: string;
  features: string[];
  locationTip: string;
  promoPitch: string;
  socialHook: string;
  visualPreviewType: 'readiness' | 'programs' | 'ai_architect' | 'live_tracker' | 'auto_overload' | 'pt_calculator' | 'coach_logs' | 'offline_perks';
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'readiness',
    badge: 'Officer Command Center',
    title: 'Daily Tactical Readiness Scoring',
    tagline: 'Know your physical capacity and shift fatigue before every tour of duty',
    tabTarget: 'workouts',
    icon: Activity,
    iconColor: 'text-blue-400',
    locationTip: 'Found in: Workouts Tab → Top Status Bar & Readiness Gauge',
    features: [
      '1–100% composite score combining sleep quality, shift fatigue, muscle soreness, and hydration.',
      'Operational Tiers: Peak Patrol (PR attempts), Tactical Ready (optimal working volume), CNS Caution, and Deload.',
      'Shift-aware training recommendations: tells you when to push intensity and when to consolidate working weights.',
      'Personalized biometric baseline tracking for resting heart rate and recovery trends.'
    ],
    promoPitch: 'Tired of training blindly before an unpredictable 12-hour patrol shift? Patrol Ready Performance scores your physical readiness every morning so you optimize tactical strength without getting burned out on duty.',
    socialHook: 'POV: When your fitness app actually understands what working graveyard shifts does to your body. 👮‍♂️🛡️',
    visualPreviewType: 'readiness'
  },
  {
    id: 'programs',
    badge: 'Duty Protocols',
    title: '4 Periodized Law Enforcement Protocols',
    tagline: 'Evidence-based training for recruits, patrol officers, and SWAT operators',
    tabTarget: 'workouts',
    actionLabel: 'Take Ability Matcher',
    actionCallback: 'questionnaire',
    icon: Award,
    iconColor: 'text-amber-400',
    locationTip: 'Found in: Workouts Tab → Program Selector & Diagnostic Ability Matcher',
    features: [
      'Universal PAT Protocol: 8-week structured state police academy & physical ability test preparation.',
      'SWAT / SRT Operator Heavy: Heavy barbell strength paired with kit mobility and pursuit conditioning.',
      'Patrol Hybrid Conditioning: Balances compound strength with aerobic 1.5-mile running pace.',
      'Muscle Armor Hypertrophy: Joint resilience and shoulder/core armor to handle 30-lb duty belts.',
      'Diagnostic Assessment: 2-minute questionnaire automatically prescribes your ideal protocol.'
    ],
    promoPitch: 'Built by law enforcement for law enforcement. Every protocol is structured in multi-week periodized phases to pass academy tests or maintain elite physical dominance on the street.',
    socialHook: 'No generic bodybuilder fluff. 4 combat-tested training protocols designed for police, sheriff, and tactical operators.',
    visualPreviewType: 'programs'
  },
  {
    id: 'ai_architect',
    badge: 'AI Workout Generator',
    title: 'AI Duty Workout Architect & Cardio Generator',
    tagline: 'Multi-week custom programs or on-demand single day duty workouts',
    tabTarget: 'workouts',
    actionLabel: 'Open Workout Architect',
    actionCallback: 'ai_generator',
    icon: Zap,
    iconColor: 'text-sky-400',
    locationTip: 'Found in: Top Bar → "Workout Architect" or Workouts Tab → "Generate Single Day"',
    features: [
      'Custom Multi-Week Architect: Generates complete periodized programs based on your shift schedule and gear.',
      'On-Demand Single Day Builder: Need something different today? Generate an instant session in 15–90 minutes.',
      'Mandatory Running & Cardio Circuits: Option to inject interval runs, sprints, or conditioning circuits into every plan.',
      'Equipment Agnostic: Adapts seamlessly to precinct garage gyms, commercial gyms, hotel rooms, or bodyweight.'
    ],
    promoPitch: 'Unpredictable overtime or stuck in a hotel? The AI Tactical Workout Architect builds custom multi-week periodized training or on-demand 30-minute sessions with cardio circuits on the fly.',
    socialHook: 'Build your own tactical police fitness program in 10 seconds. Time, equipment, and running circuits completely tailored to you.',
    visualPreviewType: 'ai_architect'
  },
  {
    id: 'live_tracker',
    badge: 'In-Session Tracking',
    title: 'Live Workout Tracker & Rest Countdown',
    tagline: 'Real-time set logging, live rest timer progress, and automatic 1RM calculation',
    tabTarget: 'workouts',
    icon: Timer,
    iconColor: 'text-emerald-400',
    locationTip: 'Found in: Workouts Tab → Tap any scheduled day → "Start Live Workout"',
    features: [
      'Friction-free set logging: Log weights, reps, and RPE with instant tactile completion checkmarks.',
      'Uncluttered Rest Countdown: Prominent countdown digits, visual progress bar, +30s adjustment, and audible cues.',
      'Conditioning Stopwatch: Live split times and lap pacing for 1.5-mile runs, interval sprints, and planks.',
      'Dynamic 1RM Engine: Live calculation of your peak estimated one-rep max as you complete each set.'
    ],
    promoPitch: 'Zero clutter and built for the gym floor. Log your weights and RPE with one tap, hear your rest countdown, and monitor your estimated 1RM without wrestling with complicated screens.',
    socialHook: 'The cleanest live workout screen in tactical fitness. High-contrast, audible rest timers, and live 1RM feedback.',
    visualPreviewType: 'live_tracker'
  },
  {
    id: 'auto_overload',
    badge: 'Progression Engine',
    title: 'Automated Progressive Overload Engine',
    tagline: 'Algorithm calculates exact weight increases so you never guess what to lift',
    tabTarget: 'workouts',
    icon: TrendingUp,
    iconColor: 'text-blue-400',
    locationTip: 'Found in: Live Workout Screen → Top "⚡ Auto-Overload" Recommendation Banner',
    features: [
      'Week-over-week performance tracking evaluates your logged sets, reps completed, and target RPE.',
      'Prescribes exact weight increments: +5 lbs or +10 lbs next week when you beat working targets.',
      'Fatigue & Consolidation Guard: Alerts you to maintain current weight when shift fatigue lowers recovery.',
      'One-Click Apply: Tap "Apply Overload Weight" to automatically set all working sets in seconds.'
    ],
    promoPitch: 'Never guess what weight to put on the bar again. Patrol Ready\'s automated progressive overload algorithm reviews your previous performance and tells you the exact target weight for next week.',
    socialHook: 'How tactical athletes get stronger on duty without burning out. The app automatically tells you when to add 5 lbs or when to consolidate.',
    visualPreviewType: 'auto_overload'
  },
  {
    id: 'pt_calculator',
    badge: 'Test Simulators',
    title: 'Law Enforcement PT Test & Load Calculators',
    tagline: 'Official POST/PAT academy physical standards and rep-load percentages',
    tabTarget: 'calculator',
    actionLabel: 'Open Calculators Tab',
    actionCallback: 'navigate',
    icon: Calculator,
    iconColor: 'text-amber-400',
    locationTip: 'Found in: Top Navigation Bar → "Calculators" Tab',
    features: [
      'State POST / PAT Physical Ability Test simulators with official scoring tables (pushups, sit-ups, 1.5-mi run, 300m sprint).',
      'Instant percentile ranking and pass/fail grading against law enforcement academy standards.',
      'Rep-Max percentage load calculator: Instantly calculates 70%, 80%, 85%, and 90% of your 1RM for any exercise.',
      'Aerobic heart-rate zone and running pace calculators for target 1.5-mile run times.'
    ],
    promoPitch: 'Get academy-ready or verify your tactical SWAT benchmarks. Simulators calculate exact passing scores for pushups, sit-ups, sprints, and 1.5-mile runs with rep-max percentage tables.',
    socialHook: 'Could you pass the state police physical fitness test today? Calculate your exact score and percentile in seconds.',
    visualPreviewType: 'pt_calculator'
  },
  {
    id: 'coach_logs',
    badge: 'Real Accountability',
    title: 'Officer Training Record & Live Coach AJ Feed',
    tagline: 'Train alongside real law enforcement with live verified training logs',
    tabTarget: 'logs',
    actionLabel: 'View Workout Logs',
    actionCallback: 'navigate',
    icon: ShieldCheck,
    iconColor: 'text-blue-400',
    locationTip: 'Found in: Top Navigation Bar → "Workout Logs" & "Progress" Tabs',
    features: [
      'Officer Training Record: Permanent historical record of every workout, total volume, tonnage, and exertion.',
      'Live Coach AJ Risner Feed: Every single workout logged by Coach AJ appears live in your feed in real-time.',
      'Progress analytics: Interactive strength curves and tonnage graphs across upper body and lower body compounds.',
      'Department / Agency export: Download full training log summaries for departmental physical readiness records.'
    ],
    promoPitch: 'Real accountability. You are not training alone. View Coach AJ Risner\'s live workout logs as he trains on duty, and maintain your verified Officer Training Record over years of service.',
    socialHook: 'No fake influencer workouts. Every session Coach AJ logs drops live into your app so you train together.',
    visualPreviewType: 'coach_logs'
  },
  {
    id: 'offline_perks',
    badge: 'Field Ready & Perks',
    title: 'Offline Field Mode, Nutrition & Partner Perks',
    tagline: '100% offline logging, shift nutrition guidelines, and exclusive gear discounts',
    tabTarget: 'contact',
    actionLabel: 'View Contact & Perks',
    actionCallback: 'navigate',
    icon: Compass,
    iconColor: 'text-emerald-400',
    locationTip: 'Found in: Top Partner Pills, Contact Tab, and Profile Modal',
    features: [
      'Progressive Web App (PWA): Install directly to your iPhone, Android, or PC home screen for native speed.',
      'Offline-First Capability: Logs workouts seamlessly in gym basements or remote facilities without cellular signal.',
      'Shift Nutrition Protocol: Meal timing, hydration formulas, and caffeine guidelines for night shifts.',
      'Exclusive Partner Perk: 50 Cal Labz tactical supplements discount with code "PATROLREADY".'
    ],
    promoPitch: 'No cell reception in the precinct basement? Patrol Ready works 100% offline and auto-syncs when you reconnect. Plus exclusive officer discounts on tactical supplements with code PATROLREADY.',
    socialHook: 'An app that actually works in basement gyms with zero cell service. Offline-ready, installable PWA for first responders.',
    visualPreviewType: 'offline_perks'
  }
];

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenAIGenerator,
  onOpenSingleDayWorkout,
  onOpenQuestionnaire,
  initialStepIndex = 0,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(initialStepIndex);
  const [promoMode, setPromoMode] = useState<boolean>(false);
  const [copiedPitch, setCopiedPitch] = useState<boolean>(false);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(Math.max(0, Math.min(TOUR_STEPS.length - 1, initialStepIndex)));
      setCopiedPitch(false);
    }
  }, [isOpen, initialStepIndex]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const StepIcon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      setCurrentStep((prev) => Math.min(TOUR_STEPS.length - 1, prev + 1));
      setCopiedPitch(false);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
    setCopiedPitch(false);
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('patrol_ready_tour_completed_v1', 'true');
      localStorage.removeItem('patrol_ready_show_tour');
      if (dontShowAgain) {
        localStorage.setItem('patrol_ready_never_show_tour', 'true');
      }
    } catch {}
    onClose();
  };

  const handleJumpToFeatureInApp = () => {
    if (step.actionCallback === 'ai_generator' && onOpenAIGenerator) {
      onClose();
      onOpenAIGenerator();
      return;
    }
    if (step.actionCallback === 'single_day' && onOpenSingleDayWorkout) {
      onClose();
      onOpenSingleDayWorkout();
      return;
    }
    if (step.actionCallback === 'questionnaire' && onOpenQuestionnaire) {
      onClose();
      onOpenQuestionnaire();
      return;
    }
    onNavigateTab(step.tabTarget);
    onClose();
  };

  const handleCopyPitch = () => {
    const textToCopy = `🛡️ ${step.title}\n${step.promoPitch}\n\n👉 Social Hook: ${step.socialHook}\n\nGet started at https://patrolreadyperformance.com`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0a101d] border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] relative">
        
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-[#0d172e] via-[#0f1f3a] to-[#0d172e] border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <PatrolReadyCompanyEmblem size="xs" className="h-7 w-auto drop-shadow" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-athletic font-black uppercase tracking-wider text-white text-xs sm:text-sm truncate">
                  Patrol Ready Tour
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase font-bold shrink-0">
                  Feature Guide
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate hidden sm:block">
                Everything you need to know about your tactical training system
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Promotional Mode Toggle Button */}
            <button
              type="button"
              onClick={() => setPromoMode(!promoMode)}
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold font-athletic uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                promoMode
                  ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/30 font-black'
                  : 'bg-slate-900/90 text-amber-300 border-amber-500/40 hover:bg-amber-950/40'
              }`}
              title="Toggle Promotional Demo Mode with copy-ready pitch and caption hooks"
            >
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>Promo Demo</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleComplete}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Close tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progression Timeline Pills */}
        <div className="bg-[#070c16] px-4 py-2 border-b border-slate-800/80 overflow-x-auto flex items-center gap-1.5 shrink-0 topbar-scroll">
          {TOUR_STEPS.map((s, idx) => {
            const isCurrent = idx === currentStep;
            const isPassed = idx < currentStep;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setCurrentStep(idx);
                  setCopiedPitch(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer shrink-0 ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50 border border-blue-400/50'
                    : isPassed
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/40'
                    : 'bg-slate-900/70 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
                title={`Jump to ${s.title}`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">
                  {isPassed ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                </span>
                <span className="truncate max-w-[110px] sm:max-w-none">{s.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Promotional Pitch Box (Visible when Promo Mode is On) */}
          {promoMode && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-950/50 via-[#181308] to-amber-950/40 border border-amber-500/50 text-xs shadow-lg animate-in fade-in space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/30 pb-2">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-400" />
                  <span className="font-athletic font-black uppercase text-amber-300 text-xs tracking-wider">
                    Promotional Demo & Reel Hook Copy
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPitch}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-black font-mono text-[11px] rounded-lg transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-sm active:scale-95"
                >
                  {copiedPitch ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Caption</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1.5 text-slate-300">
                <p className="leading-relaxed">
                  <strong className="text-amber-200">Pitch: </strong>
                  {step.promoPitch}
                </p>
                <p className="text-slate-400 font-mono text-[11px]">
                  <strong className="text-amber-300">Social Hook: </strong>
                  {step.socialHook}
                </p>
              </div>
            </div>
          )}

          {/* Main 2-Column Feature Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* Left Column: Feature Details & Location Guidance (7 cols) */}
            <div className="lg:col-span-7 bg-[#0d1527] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Badge & Step indicator */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                      <StepIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-300">
                      Step {currentStep + 1} of {TOUR_STEPS.length} • {step.badge}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Tab: {step.tabTarget}
                  </span>
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-athletic tracking-wide leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-snug">
                    {step.tagline}
                  </p>
                </div>

                {/* Bulleted Feature Highlights */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-athletic font-bold uppercase tracking-wider text-slate-400 block">
                    What This Does For You:
                  </span>
                  <div className="space-y-1.5">
                    {step.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location & Quick Jump Callout */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#080d19] p-3 rounded-xl border">
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 min-w-0 truncate">
                  <Compass className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{step.locationTip}</span>
                </div>
                <button
                  type="button"
                  onClick={handleJumpToFeatureInApp}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1 shadow-sm"
                  title="Switch to this feature in the app"
                >
                  <span>{step.actionLabel || 'Jump to Feature'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Column: Visual Preview Mockup (5 cols) */}
            <div className="lg:col-span-5 bg-[#080d1a] border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-center space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-[11px] font-athletic font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  Live Preview Snapshot
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  Interactive UI
                </span>
              </div>

              {/* Dynamic Feature Mockup Rendering */}
              {step.visualPreviewType === 'readiness' && (
                <div className="space-y-3 p-3.5 rounded-xl bg-[#0d1628] border border-blue-500/30 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">Daily Tactical Readiness</span>
                    <span className="text-emerald-400 font-mono font-black text-sm">88% Ready</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400 w-[88%] rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[9px]">Shift State:</span>
                      <span className="text-blue-300 font-bold">Graveyard / Night</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[9px]">Recommendation:</span>
                      <span className="text-emerald-300 font-bold">Optimal PR Zone</span>
                    </div>
                  </div>
                </div>
              )}

              {step.visualPreviewType === 'programs' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/40">
                    <div className="flex items-center justify-between font-bold text-blue-200">
                      <span>Universal PAT Academy Prep</span>
                      <span className="text-[10px] font-mono text-amber-400">8 Weeks</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Pushups, sit-ups, 1.5 mi run and agility test conditioning.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span>Patrol Hybrid Strength & Run</span>
                      <span className="text-[10px] font-mono text-blue-400">Continuous</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Compound lifts paired with Zone 2 aerobic running.</p>
                  </div>
                </div>
              )}

              {step.visualPreviewType === 'ai_architect' && (
                <div className="space-y-2 p-3 rounded-xl bg-[#0d1628] border border-sky-500/30 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-300 flex items-center gap-1 font-athletic uppercase">
                      <Zap className="w-3.5 h-3.5 fill-sky-400" />
                      Single-Day Builder
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">10s Generation</span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span className="text-slate-400">Time Available:</span>
                      <span className="text-white font-mono font-bold">30 Minutes</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span className="text-slate-400">Location:</span>
                      <span className="text-white font-mono font-bold">Precinct Garage / Dumbbells</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cardio Circuit:</span>
                      <span className="text-emerald-400 font-mono font-bold">✓ Included</span>
                    </div>
                  </div>
                </div>
              )}

              {step.visualPreviewType === 'live_tracker' && (
                <div className="space-y-2.5 p-3 rounded-xl bg-[#0b1322] border border-emerald-500/40 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">Live Rest Interval</span>
                    <span className="text-blue-400 font-mono font-black text-sm animate-pulse">01:15</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 w-[60%]" />
                  </div>
                  <div className="p-2 rounded bg-[#070c16] border border-slate-800 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Set 2: 225 lbs × 8</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Done
                    </span>
                  </div>
                </div>
              )}

              {step.visualPreviewType === 'auto_overload' && (
                <div className="space-y-2 p-3 rounded-xl bg-[#0c182d] border border-blue-500/40 text-xs">
                  <div className="flex items-center gap-1.5 text-blue-300 font-bold font-athletic uppercase">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    Auto-Overload Engine
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    ⚡ Target <strong>230 lbs</strong> (+5 lbs) recommended for next week.
                  </p>
                  <div className="pt-1">
                    <span className="px-2 py-1 rounded bg-blue-600 text-white font-mono text-[10px] font-bold inline-block">
                      Apply Overload to All Sets
                    </span>
                  </div>
                </div>
              )}

              {step.visualPreviewType === 'pt_calculator' && (
                <div className="space-y-2 p-3 rounded-xl bg-[#0d1628] border border-amber-500/30 text-xs font-mono">
                  <div className="flex items-center justify-between font-bold text-amber-300">
                    <span>POST Academy PAT</span>
                    <span className="text-emerald-400">PASS (92%)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Push-Ups:</span>
                      <span className="text-white font-bold">48 reps</span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">1.5 Mi Run:</span>
                      <span className="text-white font-bold">10:45 min</span>
                    </div>
                  </div>
                </div>
              )}

              {step.visualPreviewType === 'coach_logs' && (
                <div className="space-y-2 p-3 rounded-xl bg-[#0c172a] border border-amber-500/30 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-black font-black text-[10px] flex items-center justify-center">
                        AJ
                      </div>
                      <span className="font-bold text-amber-300">Coach AJ Live Feed</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">Just Now</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Heavy Barbell Squats + 4x400m pursuit sprints logged. Total Volume: 18,450 lbs.
                  </p>
                </div>
              )}

              {step.visualPreviewType === 'offline_perks' && (
                <div className="space-y-2 p-3 rounded-xl bg-[#091424] border border-emerald-500/30 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 flex items-center gap-1">
                      <Cloud className="w-3.5 h-3.5" />
                      Offline Mode Active
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Syncs on Signal</span>
                  </div>
                  <div className="p-2 rounded bg-amber-950/40 border border-amber-500/30 text-[11px]">
                    <div className="font-bold text-amber-300">50 Cal Labz Partner Code</div>
                    <div className="font-mono text-slate-300 text-[10px] mt-0.5">Use code <strong className="text-white">PATROLREADY</strong> for officer discount.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="bg-[#090f1c] border-t border-slate-800 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-[11px]">Don't auto-open again on sign-in</span>
            </label>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={isFirst}
              onClick={handlePrev}
              className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={handleComplete}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black uppercase tracking-wider text-xs font-athletic flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer active:scale-95"
              >
                <span>Complete Tour & Start Training</span>
                <Check className="w-4 h-4 stroke-[3]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black uppercase tracking-wider text-xs font-athletic flex items-center gap-1.5 shadow-lg shadow-blue-900/40 transition-all cursor-pointer active:scale-95"
              >
                <span>Next Feature</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
