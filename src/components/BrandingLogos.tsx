import React, { useState, useEffect } from 'react';
import { Award, ShieldCheck, X, Mail, Instagram, ExternalLink, Zap } from 'lucide-react';

/**
 * Official Overland Athletics Shield Emblem Logo Component
 * Loads the official vectorized shield emblem:
 * - Distressed tactical shield crest with beveled gold trim and charcoal borders
 * - Arched top header containing bold white 'OVERLAND'
 * - Radiant sunrise with golden sunburst rays and mountain stars in upper sky
 * - Jagged mountain peaks and winding earthen trail
 * - Central tactical athlete rucking with loaded rucksack and carrying Olympic barbell
 * - Lower horizontal banner containing bold white 'ATHLETICS'
 * - Gold sub-banner with '— RUN | LIFT | RUCK —'
 * - Curved bottom rocker with 'ELITE PERFORMANCE | GO THE DISTANCE'
 */
export const OverlandCompanyEmblem: React.FC<{
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
}> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    xs: 'h-6 w-auto',
    sm: 'h-8 sm:h-9 w-auto',
    md: 'h-11 sm:h-12 w-auto',
    lg: 'h-16 sm:h-20 w-auto',
    xl: 'h-24 sm:h-28 w-auto',
    hero: 'h-36 sm:h-44 w-auto',
  }[size];

  return (
    <img
      src="/overland-logo.svg"
      alt="Overland Athletics Logo — Run • Lift • Ruck • Go The Distance"
      className={`${sizeClasses} ${className} object-contain select-none drop-shadow-md shrink-0`}
      loading="eager"
      decoding="async"
    />
  );
};

// Aliases for backwards-compatibility
export const RpaCompanyEmblem = OverlandCompanyEmblem;

/**
 * Official Overland Athletics Horizontal Logo Lockup
 */
export const OverlandLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'hero' }> = ({ size = 'md' }) => {
  return (
    <div className="flex items-center gap-2 sm:gap-3 select-none">
      {/* Official Overland Shield Crest Emblem */}
      <div className="relative shrink-0 flex items-center justify-center">
        <OverlandCompanyEmblem size={size} />
      </div>

      {/* Brand Text Lockup */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-athletic font-black uppercase tracking-wider text-white text-lg sm:text-xl leading-none">
            Overland
          </span>
          <span className="font-athletic font-black uppercase tracking-wider text-amber-400 text-lg sm:text-xl leading-none">
            Athletics
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5">
          <span className="tracking-widest uppercase font-extrabold text-amber-300 text-[10px] sm:text-xs whitespace-nowrap">
            Run • Lift • Ruck
          </span>
          <span className="text-amber-400/90 font-black text-[10px] sm:text-xs leading-none">•</span>
          <span className="tracking-wider uppercase font-black text-amber-400 text-[10px] sm:text-xs whitespace-nowrap">
            Go The Distance
          </span>
        </div>
      </div>
    </div>
  );
};

// Aliases for backwards-compatibility
export const RisnerLogo = OverlandLogo;

export const IssaCertifiedBadge: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="group relative flex items-center gap-2.5 px-3 py-1.5 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border border-amber-500/40 hover:border-amber-400 rounded-lg shadow-md hover:shadow-amber-500/10 transition-all cursor-pointer text-left"
        title="View ISSA Certified Trainer Verification"
      >
        {/* Official-looking ISSA Seal / Crest */}
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 p-0.5 shadow-sm shrink-0 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-zinc-950 flex flex-col items-center justify-center border border-amber-400/30">
            <Award className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-black tracking-widest text-amber-400 font-athletic uppercase">
              ISSA CERTIFIED
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          {!compact && (
            <span className="text-[9px] text-zinc-400 tracking-tight font-medium">
              Overland Athletics Strength Coach
            </span>
          )}
        </div>
      </button>

      {/* ISSA Credential Verification Modal */}
      {showModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-md bg-zinc-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl shadow-amber-500/10">
            {/* Dedicated Top-Right Exit Button */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-zinc-700 hover:border-zinc-500 cursor-pointer shadow-sm"
              title="Exit Verification Modal"
            >
              <X className="w-4 h-4 text-amber-400" />
              <span>Exit</span>
            </button>

            {/* Official ISSA Header with Overland Logo */}
            <div className="flex flex-col items-center text-center pb-5 border-b border-zinc-800 pt-2 sm:pt-0">
              <div className="mb-3">
                <OverlandCompanyEmblem size="lg" />
              </div>

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 mb-2 shadow-lg shadow-amber-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-zinc-950 rounded-xl flex flex-col items-center justify-center p-1">
                  <span className="text-amber-400 font-athletic font-black text-base tracking-tighter">ISSA</span>
                  <span className="text-[7px] text-amber-200 font-bold uppercase tracking-wider">CERTIFIED</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white tracking-wide">
                International Sports Sciences Association
              </h3>
              <p className="text-xs text-amber-400 font-semibold tracking-wider uppercase mt-0.5">
                Official Coach Certification Credentials
              </p>
            </div>

            {/* Coach & Verification Details */}
            <div className="mt-5 space-y-3.5 text-sm">
              <div className="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400">Head Coach:</span>
                <span className="text-white font-bold tracking-wide">Coach AJ, ISSA-CPT</span>
              </div>

              <div className="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400">Organization:</span>
                <span className="text-amber-400 font-bold">Overland Athletics</span>
              </div>

              <div className="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400">Disciplines:</span>
                <span className="text-zinc-200 font-medium text-xs">Run • Lift • Ruck</span>
              </div>

              {/* Direct Email */}
              <div className="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  Contact Email:
                </span>
                <a
                  href="mailto:risnerathletics@gmail.com"
                  className="text-amber-400 hover:text-amber-300 font-mono text-xs font-bold underline"
                >
                  risnerathletics@gmail.com
                </a>
              </div>

              {/* Instagram */}
              <div className="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  Instagram:
                </span>
                <a
                  href="https://www.instagram.com/ajrisner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300 font-bold text-xs flex items-center gap-1"
                >
                  <span>@ajrisner</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Bucked Up Supplement Partner */}
              <div className="p-3 bg-zinc-950/70 rounded-xl border border-amber-500/20 flex justify-between items-center">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Supplements:
                </span>
                <a
                  href="https://bckd.co/87uJC2e"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center gap-1 font-mono"
                >
                  <span>Bucked Up (bckd.co/87uJC2e)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Verified Competencies */}
              <div className="pt-2">
                <span className="text-xs text-zinc-400 font-semibold block mb-2">
                  Verified ISSA Elite Competencies:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
                  <div className="flex items-center gap-1.5 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/80">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Combat Durability</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/80">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Heavy Load Carriage (Ruck)</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/80">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Compound Overload</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/80">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Aerobic Threshold / Tempo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Modal Confirmation Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-athletic font-black tracking-wider uppercase text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] cursor-pointer"
              >
                Close Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
