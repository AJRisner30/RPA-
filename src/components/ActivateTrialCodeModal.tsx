import React, { useState } from 'react';
import { 
  KeyRound, ShieldCheck, Sparkles, CheckCircle2, 
  AlertCircle, X, ArrowRight, Zap, RefreshCw, Clock
} from 'lucide-react';
import { useUserTier } from '../hooks/useUserTier';
import { DEFAULT_TRIAL_CODES, normalizeTrialCode } from '../utils/trialCodes';

interface ActivateTrialCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (daysGranted: number, code: string) => void;
}

export const ActivateTrialCodeModal: React.FC<ActivateTrialCodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { activateTrialWithCode } = useUserTier();
  const [codeInput, setCodeInput] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string; days?: number; code?: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizeTrialCode(codeInput);
    if (!clean) {
      setFeedback({ type: 'error', text: 'Please enter a trial activation code.' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await activateTrialWithCode(clean);
      if (res.success) {
        setFeedback({
          type: 'success',
          text: res.message,
          days: res.daysGranted,
          code: clean,
        });
        if (onSuccess && res.daysGranted) {
          onSuccess(res.daysGranted, clean);
        }
      } else {
        setFeedback({
          type: 'error',
          text: res.message,
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.message || 'Failed to activate code. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectPreset = (code: string) => {
    setCodeInput(code);
    setFeedback(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#0a0f1d] border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d1527]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white font-athletic flex items-center gap-2">
                <span>Activate Free Trial Code</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  VIP &amp; Agency
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Redeem promotional, department, or academy trial codes for Pro access
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
        <div className="p-6 space-y-5 text-left">
          {/* Success State */}
          {feedback?.type === 'success' ? (
            <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-950/60 to-[#071318] border border-emerald-500/50 text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                  Code "{feedback.code}" Activated
                </span>
                <h3 className="text-lg font-black uppercase text-white font-athletic">
                  {feedback.days || 14}-Day Pro Frontline Access Unlocked
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Your free trial is now active. All Pro auto-overload algorithms and real-time interval timers are ready.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <span>Start Training Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Form Input */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-mono flex items-center justify-between">
                    <span>Enter Activation Code</span>
                    <span className="text-slate-500 text-[10px] lowercase font-sans">case-insensitive</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                      placeholder="E.G. PATROLREADY, DUTY30..."
                      autoFocus
                      className="w-full bg-[#070c14] border border-blue-500/40 focus:border-amber-400 rounded-2xl px-4 py-3.5 text-sm font-mono font-bold tracking-widest text-white placeholder-slate-600 focus:outline-none transition shadow-inner"
                    />
                    <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  </div>
                </div>

                {/* Feedback Error Notice */}
                {feedback?.type === 'error' && (
                  <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{feedback.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !codeInput.trim()}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{submitting ? 'Verifying Code...' : 'Activate Free Trial Code'}</span>
                </button>
              </form>

              {/* Quick Select Preset Agency Codes */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                  Quick Active Trial Codes:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {DEFAULT_TRIAL_CODES.slice(0, 4).map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleSelectPreset(c.code)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        codeInput === c.code
                          ? 'bg-amber-950/50 border-amber-500/80 text-amber-300'
                          : 'bg-[#0e1726]/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-white">{c.code}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                          {c.days}d
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {c.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust & Guarantee note */}
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>No credit card required. Free trial grants full access to all Pro tactical protocols.</span>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-[#0d1527]">
          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Zero-Delay Activation</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
