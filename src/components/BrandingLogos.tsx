import React, { useState, useEffect } from 'react';
import { Award, ShieldCheck, X, Mail, Instagram, ExternalLink, Zap, Shield } from 'lucide-react';

/**
 * Official Patrol Ready Performance Badge Emblem Logo Component
 * Loads the official vectorized police shield emblem:
 * - Tactical police shield crest with chrome/silver beveled borders and midnight navy field
 * - 5-point star and tactical rank chevrons at apex
 * - Athletic tactical patrol officer in duty uniform and tactical vest sprinting forward
 * - Silver laurel wreath branches
 * - Lower ribbon banner reading '★ POLICE ★' and shield point 'PRP'
 * - Metallic block typography: 'PATROL READY PERFORMANCE' & '••• FITNESS FOR THE FRONTLINE •••'
 */
export const PatrolReadyCompanyEmblem: React.FC<{
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
      src="/patrol-ready-logo.svg"
      alt="Patrol Ready Performance Logo — Tactical fitness for the Frontline."
      className={`${sizeClasses} ${className} object-contain select-none drop-shadow-md shrink-0`}
      loading="eager"
      decoding="async"
    />
  );
};

// Aliases for backwards-compatibility across the app
export const OverlandCompanyEmblem = PatrolReadyCompanyEmblem;
export const RpaCompanyEmblem = PatrolReadyCompanyEmblem;

/**
 * Official Patrol Ready Performance Horizontal Logo Lockup
 */
export const PatrolReadyLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'hero' }> = ({ size = 'md' }) => {
  return (
    <div className="flex items-center gap-2 sm:gap-3 select-none">
      {/* Official Police Shield Crest Emblem */}
      <div className="relative shrink-0 flex items-center justify-center">
        <PatrolReadyCompanyEmblem size={size} />
      </div>

      {/* Brand Text Lockup */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-athletic font-black uppercase tracking-wider text-white text-lg sm:text-xl leading-none">
            Patrol Ready
          </span>
          <span className="font-athletic font-black uppercase tracking-wider text-blue-400 text-lg sm:text-xl leading-none">
            Performance
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5">
          <span className="tracking-widest uppercase font-extrabold text-blue-300 text-[10px] sm:text-xs whitespace-nowrap">
            Tactical Fitness For The Frontline
          </span>
        </div>
      </div>
    </div>
  );
};

// Aliases for backwards-compatibility
export const OverlandLogo = PatrolReadyLogo;
export const RisnerLogo = PatrolReadyLogo;

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
        className="group relative flex items-center gap-2.5 px-3 py-1.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-blue-500/40 hover:border-blue-400 rounded-lg shadow-md hover:shadow-blue-500/10 transition-all cursor-pointer text-left"
        title="View ISSA Certified Trainer Verification"
      >
        {/* Official-looking ISSA Seal / Crest with Tactical Blue Accent */}
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-300 via-blue-500 to-slate-700 p-0.5 shadow-sm shrink-0 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center border border-blue-400/30">
            <Award className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-black tracking-widest text-blue-400 font-athletic uppercase">
              ISSA CERTIFIED
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          {!compact && (
            <span className="text-[9px] text-slate-400 tracking-tight font-medium">
              Law Enforcement Fitness Specialist
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
          <div className="relative w-full max-w-md bg-slate-900 border border-blue-500/40 rounded-2xl p-6 shadow-2xl shadow-blue-500/10">
            {/* Dedicated Top-Right Exit Button */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 hover:border-slate-500 cursor-pointer shadow-sm"
              title="Exit Verification Modal"
            >
              <X className="w-4 h-4 text-blue-400" />
              <span>Exit</span>
            </button>

            {/* Official ISSA Header with Patrol Ready Logo */}
            <div className="flex flex-col items-center text-center pb-5 border-b border-slate-800 pt-2 sm:pt-0">
              <div className="mb-3">
                <PatrolReadyCompanyEmblem size="lg" />
              </div>

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-slate-700 p-0.5 mb-2 shadow-lg shadow-blue-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-xl flex flex-col items-center justify-center p-1">
                  <span className="text-blue-400 font-athletic font-black text-base tracking-tighter">ISSA</span>
                  <span className="text-[7px] text-blue-200 font-bold uppercase tracking-wider">CERTIFIED</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white tracking-wide">
                International Sports Sciences Association
              </h3>
              <p className="text-xs text-blue-400 font-semibold tracking-wider uppercase mt-0.5">
                Tactical Conditioning &amp; Strength Specialist
              </p>
            </div>

            {/* Coach & Verification Details */}
            <div className="mt-5 space-y-3.5 text-sm">
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Head Coach:</span>
                <span className="text-white font-bold tracking-wide">Coach AJ, ISSA-CPT</span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Organization:</span>
                <span className="text-blue-400 font-bold">Patrol Ready Performance</span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Specialization:</span>
                <span className="text-slate-200 font-medium text-xs">Tactical fitness for the Frontline.</span>
              </div>

              {/* Direct Email */}
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  Contact Email:
                </span>
                <a
                  href="mailto:risnerathletics@gmail.com"
                  className="text-blue-400 hover:text-blue-300 font-mono text-xs font-bold underline"
                >
                  risnerathletics@gmail.com
                </a>
              </div>

              {/* Instagram */}
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-blue-400" />
                  Instagram:
                </span>
                <a
                  href="https://www.instagram.com/ajrisner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-bold text-xs flex items-center gap-1"
                >
                  <span>@ajrisner</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Verified Competencies */}
              <div className="pt-2">
                <span className="text-xs text-slate-400 font-semibold block mb-2">
                  Verified Frontline Law Enforcement Competencies:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Combat Chassis Durability</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Duty Gear &amp; Armor Carriage</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Foot Pursuit Sprint Engine</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Suspect Control Power</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Modal Confirmation Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-athletic font-black tracking-wider uppercase text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.99] cursor-pointer"
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
