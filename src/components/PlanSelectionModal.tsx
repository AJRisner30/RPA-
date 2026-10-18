import React, { useState } from 'react';
import { 
  ShieldCheck, Zap, Sparkles, CheckCircle2, 
  ArrowRight, KeyRound, Lock, Clock, CreditCard
} from 'lucide-react';
import { PatrolReadyCompanyEmblem } from './BrandingLogos';

interface PlanSelectionModalProps {
  isOpen: boolean;
  onStartTrial: () => Promise<void>;
  onOpenPricingModal: () => void;
  onOpenCodeModal?: () => void;
}

export const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({
  isOpen,
  onStartTrial,
  onOpenPricingModal,
  onOpenCodeModal,
}) => {
  const [isStartingTrial, setIsStartingTrial] = useState(false);

  if (!isOpen) return null;

  const handleStartTrial = async () => {
    setIsStartingTrial(true);
    try {
      await onStartTrial();
    } finally {
      setIsStartingTrial(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#090d16] border-2 border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Siren Glow Header Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-sky-400 to-amber-500" />

        {/* Header */}
        <div className="p-6 sm:p-8 bg-[#0c1424] border-b border-slate-800 text-center relative">
          <div className="flex justify-center mb-3">
            <div className="p-1.5 bg-gradient-to-b from-blue-500/30 to-slate-900 rounded-2xl border border-blue-400/40 shadow-lg">
              <PatrolReadyCompanyEmblem size="md" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[11px] font-mono uppercase font-bold tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Welcome to Patrol Ready Performance</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-athletic tracking-wide">
            Select Your Membership Plan
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-1.5 leading-relaxed">
            Choose how you would like to proceed. Start with your <strong className="text-white">14-day risk-free Pro trial</strong> or subscribe directly to lock in uninterrupted tactical training.
          </p>
        </div>

        {/* Options Grid */}
        <div className="p-5 sm:p-7 space-y-4 overflow-y-auto">
          {/* PRIMARY OPTION: 14-DAY RISK-FREE PRO TRIAL */}
          <div className="relative rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-blue-950/70 via-[#0d1627] to-amber-950/30 border-2 border-blue-500 shadow-xl shadow-blue-950/40">
            <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider font-athletic shadow">
              Most Popular • $0 Today
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black uppercase text-white font-athletic tracking-wide">
                    14-Day Risk-Free Pro Trial
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  Experience full Pro Frontline access with automated progressive overload, 26-week tactical periodization, live workout execution, and readiness metrics.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] text-blue-200 font-mono">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Full Pro Features
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Active 14-Day Clock
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> No Initial Charge
                  </span>
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <div className="text-2xl font-black font-mono text-white mb-2 sm:mb-3">
                  $0 <span className="text-xs font-normal text-slate-400 font-sans">/ 14 days</span>
                </div>
                <button
                  type="button"
                  disabled={isStartingTrial}
                  onClick={handleStartTrial}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isStartingTrial ? (
                    <span>Activating Access...</span>
                  ) : (
                    <>
                      <span>Start 14-Day Free Trial</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* SECONDARY OPTION: SUBSCRIBE DIRECTLY WITH SQUARE */}
          <div className="rounded-2xl p-4 sm:p-5 bg-[#0b1220] border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-athletic">
                    Direct Membership Subscriptions
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                    Square Checkout
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pro ($30/mo) or Standard ($15/mo). Secure monthly billing via credit card, Apple Pay, or Google Pay.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenPricingModal}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>View Plans &amp; Subscribe</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* TERTIARY OPTION: ENTER PROMO / AGENCY CODE */}
          {onOpenCodeModal && (
            <div className="rounded-2xl p-3.5 sm:p-4 bg-[#080d17] border border-slate-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-300">
                  Have an agency access code or promotional pass?
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenCodeModal}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider cursor-pointer transition shrink-0"
              >
                Enter Code →
              </button>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-[#070b13] border-t border-slate-800/80 text-center text-[11px] text-slate-500">
          Once your 14-day free trial concludes, your account will prompt you to select an ongoing subscription. You will never be billed without your explicit consent.
        </div>
      </div>
    </div>
  );
};
