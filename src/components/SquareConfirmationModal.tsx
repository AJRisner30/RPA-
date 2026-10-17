import React from 'react';
import { 
  ShieldCheck, CheckCircle2, Zap, Sparkles, 
  ArrowRight, CreditCard, Lock, X
} from 'lucide-react';
import { SubscriptionRecord } from '../types';

interface SquareConfirmationModalProps {
  isOpen: boolean;
  tier: 'standard' | 'pro' | 'enterprise';
  subscriptionRecord?: SubscriptionRecord | null;
  onClose: () => void;
  onNavigateToWorkouts: () => void;
}

export const SquareConfirmationModal: React.FC<SquareConfirmationModalProps> = ({
  isOpen,
  tier,
  subscriptionRecord,
  onClose,
  onNavigateToWorkouts,
}) => {
  if (!isOpen) return null;

  const isPro = tier === 'pro' || tier === 'enterprise';
  const planTitle = isPro ? 'Pro Frontline Tier' : 'Standard Tactical Tier';
  const priceFormatted = isPro ? '$30.00 / month' : '$15.00 / month';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#0a0f1d] border border-emerald-500/50 rounded-3xl shadow-2xl shadow-emerald-500/10 overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-b from-[#0e1a2f] via-[#091122] to-[#0a0f1d] border-b border-emerald-500/20 text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close confirmation"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Verification Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Square Payment Verified</span>
          </div>

          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white font-athletic">
            Subscription Confirmed!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Your {planTitle} is now fully activated and operational.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-left">
          {/* Receipt Breakdown Card */}
          <div className="p-4 rounded-2xl bg-[#0e172a]/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800/80">
              <span className="text-slate-400 uppercase">Plan Level</span>
              <span className="font-bold text-white flex items-center gap-1">
                {isPro && <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />}
                {planTitle}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800/80">
              <span className="text-slate-400 uppercase">Billing Rate</span>
              <span className="font-bold text-emerald-400">{priceFormatted}</span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800/80">
              <span className="text-slate-400 uppercase">Payment Processor</span>
              <span className="font-bold text-white flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                Square Secure Hosted Billing
              </span>
            </div>

            {subscriptionRecord?.squareOrderId && (
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-0.5">
                <span className="text-slate-500 uppercase">Order Reference</span>
                <span className="text-slate-300 truncate max-w-[200px]">
                  {subscriptionRecord.squareOrderId}
                </span>
              </div>
            )}
          </div>

          {/* Unlocked Features Summary */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Features Automatically Unlocked</span>
            </h3>
            
            <ul className="space-y-2 text-xs text-slate-300">
              {isPro ? (
                <>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Auto-Overload Engine:</strong> Micro-load calculations applied on all working sets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Real-Time Timers:</strong> Dynamic interval pacing &amp; tactical rest countdowns</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Pursuit Capacity Metrics:</strong> Foot pursuit threshold graphs and volume trends</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>All Tactical Protocols:</strong> APEX, Hybrid 3-Day, Dumbbell Duty &amp; Universal PAT</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Foundational Protocol Logging:</strong> Complete set, rep, and volume tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Duty Readiness Scoring:</strong> Sleep and shift recovery diagnostics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Rep Load Calculators:</strong> Standard 1RM and percentage load guidance</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Security Assurance */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Recurring billing managed securely via Square. Cancel anytime through your receipt or Square customer portal.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-[#0d1527] flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateToWorkouts();
            }}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <span>Open Tactical Training Hub</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer text-center"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
