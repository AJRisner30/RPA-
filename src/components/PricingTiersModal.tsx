import React, { useState, useEffect } from 'react';
import { 
  Zap, Lock, CheckCircle2, 
  Sparkles, X, Check, Clock,
  Mail, ShieldCheck, CreditCard,
  ExternalLink, Info, Smartphone,
  CheckCircle, ArrowRight, KeyRound,
  AlertCircle, RefreshCw
} from 'lucide-react';
import { useUserTier } from '../hooks/useUserTier';
import { getCurrentAthlete } from '../utils/athleteAuth';
import { 
  buildSquareCheckoutUrl, 
  getCachedSquareConfig, 
  subscribeToSquareConfig, 
  SQUARE_REQUIREMENTS_CHECKLIST 
} from '../utils/squarePayments';
import { SquareConfig } from '../types';
import { DEFAULT_TRIAL_CODES, normalizeTrialCode } from '../utils/trialCodes';

interface PricingTiersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFeature?: (feature: string) => void;
  onPaymentSuccess?: (tier: 'standard' | 'pro') => void;
  onOpenCodeModal?: () => void;
}

export const PricingTiersModal: React.FC<PricingTiersModalProps> = ({ 
  isOpen, 
  onClose,
  onPaymentSuccess
}) => {
  const { 
    tier, 
    trialDaysRemaining, 
    isTrialActive, 
    isTrialExpired,
    isActiveSubscriber,
    activateSubscription,
    activateTrialWithCode,
    startFreeTrial,
    simulateTrialDaysRemaining,
    setSimulatedOverride,
    isExempt,
  } = useUserTier();

  const [squareConfig, setSquareConfig] = useState<SquareConfig>(() => getCachedSquareConfig());
  const [showSquareHelp, setShowSquareHelp] = useState<boolean>(false);
  const [testingSandbox, setTestingSandbox] = useState<boolean>(false);

  // Free Trial Code Activation State
  const [trialCodeInput, setTrialCodeInput] = useState<string>('');
  const [submittingTrialCode, setSubmittingTrialCode] = useState<boolean>(false);
  const [trialCodeFeedback, setTrialCodeFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const unsub = subscribeToSquareConfig((cfg) => {
      setSquareConfig(cfg);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const athlete = getCurrentAthlete();

  const handleSquareCheckout = (selectedTier: 'standard' | 'pro') => {
    const checkoutUrl = buildSquareCheckoutUrl(selectedTier, athlete, squareConfig);
    // In preview iFrame, open Square Checkout in new tab or top level window
    try {
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = checkoutUrl;
    }
  };

  const handleSimulateSandboxUnlock = async (selectedTier: 'standard' | 'pro') => {
    try {
      setTestingSandbox(true);
      await activateSubscription(selectedTier, {
        orderId: `sq_sandbox_sim_${Date.now().toString(36)}`,
        environment: squareConfig.environment,
      });
      if (onPaymentSuccess) {
        onPaymentSuccess(selectedTier);
      }
    } finally {
      setTestingSandbox(false);
    }
  };

  const handleActivateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizeTrialCode(trialCodeInput);
    if (!clean) {
      setTrialCodeFeedback({ type: 'error', text: 'Please enter a valid trial code.' });
      return;
    }

    try {
      setSubmittingTrialCode(true);
      setTrialCodeFeedback(null);
      const res = await activateTrialWithCode(clean);
      if (res.success) {
        setTrialCodeFeedback({
          type: 'success',
          text: res.message,
        });
        setTrialCodeInput('');
      } else {
        setTrialCodeFeedback({
          type: 'error',
          text: res.message,
        });
      }
    } catch (err: any) {
      setTrialCodeFeedback({
        type: 'error',
        text: err?.message || 'Error activating code.',
      });
    } finally {
      setSubmittingTrialCode(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-[#090d16] border border-blue-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d1527]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white font-athletic">
                  Membership Plans &amp; 14-Day Free Trial
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  {tier} Tier
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${
                  isActiveSubscriber
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : isTrialActive
                    ? 'bg-blue-950/80 border-blue-500 text-blue-300'
                    : 'bg-red-950/80 border-red-500 text-red-300'
                }`}>
                  {isActiveSubscriber ? 'Active Subscriber' : isTrialActive ? `Trial (${trialDaysRemaining}d left)` : 'Trial Expired'}
                </span>

                <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold border ${
                  squareConfig.environment === 'production'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600/50'
                    : 'bg-amber-950 text-amber-300 border-amber-600/50'
                }`}>
                  Square {squareConfig.environment === 'production' ? 'Live' : 'Sandbox'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                14-Day Risk-Free Trial • Secure Square Payment Checkout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSquareHelp(!showSquareHelp)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
              title="View Square requirements checklist"
            >
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Square Requirements</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Square Setup Requirements Drawer (Togglable) */}
        {showSquareHelp && (
          <div className="p-4 sm:p-5 bg-gradient-to-b from-[#0b1424] to-[#070d18] border-b border-blue-500/30 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider font-athletic">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Everything Needed From You for Square Payments</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSquareHelp(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close Guide
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Patrol Ready Performance uses <strong>Square Hosted Payment Links</strong> for recurring monthly subscriptions. Here is the full checklist:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {SQUARE_REQUIREMENTS_CHECKLIST.map((step) => (
                <div key={step.step} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                    {step.step}
                  </div>
                  <div className="space-y-1">
                    <strong className="text-white block font-medium">{step.title}</strong>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{step.description}</p>
                    {step.link && (
                      <a
                        href={step.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-mono"
                      >
                        <span>Open Square Dashboard</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Active Trial Notice */}
          {isTrialActive && (
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/40 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong className="text-white">14-Day Risk-Free Trial Active:</strong> You currently have full access to all Pro features ({trialDaysRemaining} days remaining).
                </span>
              </div>
              <span className="font-mono text-blue-300 font-bold px-2 py-0.5 rounded bg-blue-900/60 shrink-0">
                {trialDaysRemaining}d Left
              </span>
            </div>
          )}

          {/* Square Processor Trust Bar */}
          <div className="p-3 rounded-xl bg-[#0b1320] border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">Powered by Square Checkout:</span>
              <span className="text-slate-400 hidden sm:inline">Cards, Apple Pay, Google Pay, and Cash App Pay</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Apple Pay</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Google Pay</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Cash App</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Credit Cards</span>
            </div>
          </div>

          {/* Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Standard Tier ($15) */}
            <div className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
              tier === 'standard' && !isTrialActive && isActiveSubscriber
                ? 'bg-slate-900/90 border-slate-700 shadow-md ring-1 ring-slate-600' 
                : 'bg-[#0b101c]/70 border-slate-800/80 hover:border-slate-700'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase text-slate-400">Standard</span>
                  {tier === 'standard' && isActiveSubscriber && (
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded">Active Plan</span>
                  )}
                </div>
                <div className="text-2xl font-black text-white font-athletic mb-1">
                  $15<span className="text-xs font-normal text-slate-400 font-sans">/mo</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">Core workout logging &amp; foundational tactical training.</p>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>All Tactical Training Protocols</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Full Workout &amp; Exercise Set Logging</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Standard 1RM &amp; Rep Load Calculators</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Readiness Scoring Diagnostics</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={() => handleSquareCheckout('standard')}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow"
                >
                  <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                  <span>Square Checkout ($15/mo)</span>
                </button>

                {/* Instant Sandbox Testing shortcut */}
                <button
                  type="button"
                  disabled={testingSandbox}
                  onClick={() => handleSimulateSandboxUnlock('standard')}
                  className="w-full py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-slate-200 text-[10px] font-mono rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>⚡ Instant Sandbox Unlock ($15)</span>
                </button>
              </div>
            </div>

            {/* Pro Tier ($30) with 14-Day Free Trial */}
            <div className="rounded-2xl p-5 border flex flex-col justify-between relative bg-gradient-to-b from-[#162032] via-[#0b1322] to-[#070b14] border-amber-500/60 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/40">
              <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[10px] font-black font-mono uppercase px-2.5 py-0.5 rounded-full shadow-md">
                14-Day Free Trial
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase text-amber-400">Pro Tier</span>
                  {(tier === 'pro' && isActiveSubscriber) && (
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded">
                      Active Subscriber
                    </span>
                  )}
                  {isTrialActive && (
                    <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                      Trial Active
                    </span>
                  )}
                </div>
                <div className="text-2xl font-black text-white font-athletic mb-1">
                  $30<span className="text-xs font-normal text-slate-400 font-sans">/mo</span>
                </div>
                <p className="text-xs text-slate-300 mb-4">Complete auto-regulation &amp; advanced tactical conditioning.</p>

                <ul className="space-y-2.5 text-xs text-slate-200">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong>Auto-Overload Progression</strong> (Linear &amp; Stepped)</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Real-Time Rest Timers &amp; Telemetry</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Advanced Heart Rate &amp; Pursuit Pace Zones</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Tactical Readiness Composite Ratings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Volume Trends &amp; Historical Graphs</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
                {!isTrialActive && !isActiveSubscriber && !isExempt && (
                  <button
                    type="button"
                    onClick={async () => {
                      await startFreeTrial(14);
                      if (onPaymentSuccess) onPaymentSuccess('pro');
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Start 14-Day Free Trial ($0 Today)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSquareCheckout('pro')}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Square Checkout ($30/mo)</span>
                </button>

                {/* Instant Sandbox Testing shortcut */}
                <button
                  type="button"
                  disabled={testingSandbox}
                  onClick={() => handleSimulateSandboxUnlock('pro')}
                  className="w-full py-1.5 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 text-[10px] font-mono rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>⚡ Instant Sandbox Unlock ($30 Pro)</span>
                </button>
              </div>
            </div>

            {/* Enterprise Tier */}
            <div className="rounded-2xl p-5 border flex flex-col justify-between bg-[#0b101c]/70 border-slate-800/80 hover:border-slate-700 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase text-blue-400">Enterprise</span>
                  {tier === 'enterprise' && (
                    <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/40">Active</span>
                  )}
                </div>
                <div className="text-lg font-black text-white font-athletic mb-1 leading-tight">
                  AGENCY WIDE
                </div>
                <p className="text-xs text-blue-300/90 italic font-medium my-3 p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl leading-relaxed">
                  "Contact directly for specific pricing and all the benefits of agency wide tracking"
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>All Pro Tier Tactical Features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Department &amp; Shift Team Rosters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Centralized Physical Fitness Test Analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Direct Agency Coaching Access</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <a
                  href="mailto:risnerathletics@gmail.com?subject=Agency%20Wide%20Tracking%20Inquiry"
                  className="w-full py-2.5 bg-blue-900/40 hover:bg-blue-800/60 border border-blue-500/40 text-blue-200 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact Coach Aryan Directly</span>
                </a>
              </div>
            </div>
          </div>

          {/* Free Trial Code Activation Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0b1426] via-[#091122] to-[#070d18] border border-amber-500/40 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white font-athletic">
                  Have an Agency or Free Trial Code?
                </h3>
              </div>
              <span className="text-[10px] font-mono text-amber-300/90 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                Instant Pro Frontline Unlock
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Enter your department promo code, recruit academy pass, or trial code to immediately unlock full Pro access.
            </p>

            <form onSubmit={handleActivateCode} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={trialCodeInput}
                onChange={(e) => setTrialCodeInput(e.target.value.toUpperCase())}
                placeholder="E.G. PATROLREADY, DUTY30"
                className="flex-1 bg-[#060b14] border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none font-mono font-bold tracking-wider"
              />
              <button
                type="submit"
                disabled={submittingTrialCode || !trialCodeInput.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-md"
              >
                {submittingTrialCode ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 fill-black" />
                )}
                <span>{submittingTrialCode ? 'Validating...' : 'Activate Code'}</span>
              </button>
            </form>

            {/* Trial Code Feedback Alert */}
            {trialCodeFeedback && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border animate-in fade-in duration-150 ${
                trialCodeFeedback.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                  : 'bg-red-950/80 border-red-500/60 text-red-200'
              }`}>
                {trialCodeFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{trialCodeFeedback.text}</span>
              </div>
            )}

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-slate-400">
              <span>Popular Codes:</span>
              {['PATROLREADY', 'DUTY30', 'ACADEMY2026', 'SWATPRO'].map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setTrialCodeInput(code);
                    setTrialCodeFeedback(null);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[10px] cursor-pointer"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-[#0d1527]">
          <div className="flex flex-col gap-1">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>256-Bit Encrypted Square Checkout • Instant Automated Account Unlock</span>
            </div>
            {/* Quick Testing Controls */}
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 pt-0.5 flex-wrap">
              <span>Test Live Trial:</span>
              <button
                type="button"
                onClick={() => simulateTrialDaysRemaining(14)}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 cursor-pointer"
                title="Simulate fresh 14 days"
              >
                14d
              </button>
              <button
                type="button"
                onClick={() => simulateTrialDaysRemaining(2)}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 cursor-pointer"
                title="Simulate 2 days remaining"
              >
                2d Left
              </button>
              <button
                type="button"
                onClick={() => simulateTrialDaysRemaining(0)}
                className="px-1.5 py-0.5 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 cursor-pointer"
                title="Simulate trial ended (lock everything)"
              >
                Expired Lockdown
              </button>
              <button
                type="button"
                onClick={() => setSimulatedOverride(null)}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 cursor-pointer"
                title="Clear simulation override"
              >
                Reset
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
