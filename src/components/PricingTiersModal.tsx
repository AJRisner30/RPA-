import React from 'react';
import { 
  Zap, Lock, CheckCircle2, 
  Sparkles, X, Check, Clock,
  Mail, ShieldCheck
} from 'lucide-react';
import { useUserTier } from '../hooks/useUserTier';

interface PricingTiersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFeature?: (feature: string) => void;
}

export const PricingTiersModal: React.FC<PricingTiersModalProps> = ({ isOpen, onClose }) => {
  const { 
    tier, 
    trialDaysRemaining, 
    isTrialActive, 
    isActiveSubscriber,
  } = useUserTier();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-[#090d16] border border-blue-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
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
              </div>
              <p className="text-xs text-slate-400">
                14-Day Risk-Free Trial • Unlock All Pro Frontline Training Features
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

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

          {/* Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Standard Tier ($15) */}
            <div className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
              tier === 'standard' && !isTrialActive
                ? 'bg-slate-900/90 border-slate-700 shadow-md ring-1 ring-slate-600' 
                : 'bg-[#0b101c]/70 border-slate-800/80 hover:border-slate-700'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase text-slate-400">Standard</span>
                  {tier === 'standard' && !isTrialActive && (
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Active</span>
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

              <div className="mt-6 pt-4 border-t border-slate-800">
                <a
                  href="mailto:risnerathletics@gmail.com?subject=Standard%20Plan%20Subscription%20($15/mo)"
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Select Standard ($15/mo)</span>
                </a>
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
                  {(tier === 'pro' || isTrialActive) && (
                    <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                      {isTrialActive ? 'Trialing' : 'Active'}
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

              <div className="mt-6 pt-4 border-t border-slate-800">
                <a
                  href="mailto:risnerathletics@gmail.com?subject=Pro%20Plan%20Membership%20($30/mo)"
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Activate Pro ($30/mo)</span>
                </a>
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
                  <span>Contact Directly</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-[#0d1527]">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>14-Day Risk-Free Trial • Standard ($15/mo) • Pro ($30/mo)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
