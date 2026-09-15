import React, { useState, useEffect } from 'react';
import { Award, ShieldCheck, CheckCircle2, X, Mail, Instagram, ExternalLink, Zap } from 'lucide-react';

/**
 * Official Risner Performance Athletics Shield Emblem Vector Logo
 * Faithfully matches the company logo:
 * - Crest shield with stepped athletic red top brackets & barb hooks
 * - Royal blue inner shield border
 * - Upward-trending blue athletic performance line & breakthrough arrow
 * - Metallic 3D beveled 'RISNER' wordmark
 * - Athletic red 'PERFORMANCE' bar flanked by solid red directional chevron arrows
 * - Deep navy blue 'ATHLETICS ™'
 * - Two-tone faceted lower shield base in royal blue & dark navy
 */
export const RpaCompanyEmblem: React.FC<{
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
}> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-11 sm:h-12 w-auto',
    lg: 'h-16 sm:h-20 w-auto',
    xl: 'h-24 sm:h-28 w-auto',
    hero: 'h-36 sm:h-44 w-auto',
  }[size];

  return (
    <svg
      viewBox="0 0 600 340"
      className={`${sizeClasses} ${className} select-none drop-shadow-md`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Risner Performance Athletics Logo"
    >
      <defs>
        {/* Metallic Bevel Gradient for RISNER */}
        <linearGradient id="rpaMetallicGrad" x1="0" y1="130" x2="0" y2="215" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="15%" stopColor="#E2E8F0" />
          <stop offset="48%" stopColor="#94A3B8" />
          <stop offset="50%" stopColor="#64748B" />
          <stop offset="52%" stopColor="#475569" />
          <stop offset="78%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Top Metallic Highlight Filter */}
        <linearGradient id="rpaMetallicHighlight" x1="0" y1="140" x2="0" y2="175" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.1" />
        </linearGradient>

        {/* Dynamic Royal Blue Arrow Gradient */}
        <linearGradient id="rpaBlueArrowGrad" x1="190" y1="120" x2="440" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="40%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>

        {/* Athletic Red Gradient */}
        <linearGradient id="rpaRedGrad" x1="0" y1="0" x2="600" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="50%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>

        {/* Lower Shield Facet Shading */}
        <linearGradient id="rpaShieldLeftFacet" x1="200" y1="290" x2="300" y2="335" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        <linearGradient id="rpaShieldRightFacet" x1="300" y1="290" x2="400" y2="335" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F2B5C" />
          <stop offset="100%" stopColor="#0A192F" />
        </linearGradient>

        <filter id="rpaDropShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* 1. Shield Background Face (Clean High-Contrast White Surface) */}
      <path
        d="M 174 72 L 426 72 C 438 155 422 250 300 325 C 178 250 162 155 174 72 Z"
        fill="#FFFFFF"
        stroke="#E2E8F0"
        strokeWidth="2"
      />

      {/* 2. Top Red Stepped Outer Brackets & Barbs */}
      {/* Left Red Bracket with horizontal arrow hook pointing left */}
      <path
        d="M 100 108 L 138 96 L 138 103 L 168 103 L 168 62 L 188 62 L 188 32 L 275 32 L 275 42 L 198 42 L 198 72 L 178 72 L 178 113 L 138 113 L 138 120 Z"
        fill="#DC2626"
      />
      {/* Right Red Bracket with horizontal arrow hook pointing right */}
      <path
        d="M 500 108 L 462 96 L 462 103 L 432 103 L 432 62 L 422 62 L 422 42 L 432 42 L 432 32 L 325 32 L 325 42 L 412 42 L 412 72 L 422 72 L 422 113 L 462 113 L 462 120 Z"
        fill="#DC2626"
      />

      {/* 3. Inner Royal Blue Shield Frame */}
      <path
        d="M 188 74 L 412 74 C 424 148 408 238 300 306 C 192 238 176 148 188 74 Z"
        fill="none"
        stroke="#0D3B7A"
        strokeWidth="9"
        strokeLinejoin="round"
      />

      {/* 4. Dynamic Ascending Performance Arrow & Trendline */}
      {/* Jagged Progress Polyline Chart */}
      <polyline
        points="198,124 235,108 258,126 282,108 308,122 342,75 390,44"
        fill="none"
        stroke="url(#rpaBlueArrowGrad)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Ascending Blue Performance Arrow Shaft & Head Breaking Through Top Right */}
      <g filter="url(#rpaDropShadow)">
        {/* Main Thick Diagonal Thrust */}
        <path
          d="M 336 82 L 420 28"
          stroke="url(#rpaBlueArrowGrad)"
          strokeWidth="14"
          strokeLinecap="square"
        />
        {/* Arrowhead */}
        <polygon
          points="444,12 428,52 405,42 414,32 376,56 370,44 408,20 398,12"
          fill="#1D4ED8"
          stroke="#0D3B7A"
          strokeWidth="2"
        />
      </g>

      {/* 5. Metallic Beveled "RISNER" Wordmark */}
      <g filter="url(#rpaDropShadow)">
        {/* Shadow Outline */}
        <text
          x="300"
          y="198"
          textAnchor="middle"
          fontSize="92"
          fontWeight="900"
          fontFamily="'Barlow Condensed', Impact, 'Arial Black', sans-serif"
          letterSpacing="1.5"
          fill="#1E293B"
          stroke="#0F172A"
          strokeWidth="6"
        >
          RISNER
        </text>
        {/* Main Metallic Fill */}
        <text
          x="300"
          y="198"
          textAnchor="middle"
          fontSize="92"
          fontWeight="900"
          fontFamily="'Barlow Condensed', Impact, 'Arial Black', sans-serif"
          letterSpacing="1.5"
          fill="url(#rpaMetallicGrad)"
        >
          RISNER
        </text>
        {/* Top Glint Highlight */}
        <text
          x="300"
          y="198"
          textAnchor="middle"
          fontSize="92"
          fontWeight="900"
          fontFamily="'Barlow Condensed', Impact, 'Arial Black', sans-serif"
          letterSpacing="1.5"
          fill="url(#rpaMetallicHighlight)"
          clipPath="url(#topHighlightClip)"
        >
          RISNER
        </text>
      </g>

      {/* 6. Athletic Red "PERFORMANCE" with Flanking Chevron Arrows */}
      {/* Left Chevron Red Arrow */}
      <polygon
        points="95,240 125,220 125,233 148,233 148,247 125,247 125,260"
        fill="#DC2626"
        stroke="#991B1B"
        strokeWidth="1"
      />

      {/* "PERFORMANCE" Text */}
      <text
        x="300"
        y="249"
        textAnchor="middle"
        fontSize="34"
        fontWeight="900"
        fontFamily="'Barlow Condensed', Impact, 'Arial Black', sans-serif"
        letterSpacing="3"
        fill="#DC2626"
      >
        PERFORMANCE
      </text>

      {/* Right Chevron Red Arrow */}
      <polygon
        points="505,240 475,220 475,233 452,233 452,247 475,247 475,260"
        fill="#DC2626"
        stroke="#991B1B"
        strokeWidth="1"
      />

      {/* 7. Deep Navy Blue "ATHLETICS ™" */}
      <text
        x="294"
        y="285"
        textAnchor="middle"
        fontSize="36"
        fontWeight="900"
        fontFamily="'Barlow Condensed', Impact, 'Arial Black', sans-serif"
        letterSpacing="5"
        fill="#0A2540"
      >
        ATHLETICS
      </text>
      {/* Trademark Symbol */}
      <text
        x="456"
        y="272"
        fontSize="14"
        fontWeight="800"
        fontFamily="sans-serif"
        fill="#0A2540"
      >
        TM
      </text>

      {/* 8. Lower Shield Rim & Faceted Apex Underneath ATHLETICS */}
      {/* Bottom Red Curve Accent */}
      <path
        d="M 218 296 C 248 318 274 332 300 338 C 326 332 352 318 382 296"
        fill="none"
        stroke="#DC2626"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Lower Faceted Shield Base Point */}
      <path
        d="M 235 292 C 265 310 286 322 300 326 L 300 292 Z"
        fill="url(#rpaShieldLeftFacet)"
      />
      <path
        d="M 300 292 L 300 326 C 314 322 335 310 365 292 Z"
        fill="url(#rpaShieldRightFacet)"
      />
      {/* Bottom Outer Navy Rim */}
      <path
        d="M 200 284 C 235 314 268 335 300 342 C 332 335 365 314 400 284"
        fill="none"
        stroke="#0D3B7A"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const RisnerLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'hero' }> = ({ size = 'md' }) => {
  return (
    <div className="flex items-center gap-2 sm:gap-3 select-none">
      {/* Official RPA Shield Crest Company Logo */}
      <div className="relative shrink-0 flex items-center justify-center">
        <RpaCompanyEmblem size={size} />
      </div>

      {/* Brand Text Lockup for clear hierarchy */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-athletic font-black uppercase tracking-wider text-white text-lg sm:text-xl leading-none">
            Risner
          </span>
          <span className="font-athletic font-black uppercase tracking-wider text-rose-500 text-lg sm:text-xl leading-none">
            Performance
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="tracking-widest uppercase font-extrabold text-zinc-300 text-[10px] sm:text-xs">
            Athletics
          </span>
          <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
          <span className="tracking-wider uppercase font-semibold text-amber-400 text-[9px] sm:text-[10px]">
            Strength & Conditioning
          </span>
        </div>
      </div>
    </div>
  );
};

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
              Personal Trainer & Strength Coach
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
              <X className="w-4 h-4 text-rose-400" />
              <span>Exit</span>
            </button>

            {/* Official ISSA Header with Company Logo */}
            <div className="flex flex-col items-center text-center pb-5 border-b border-zinc-800 pt-2 sm:pt-0">
              <div className="mb-3">
                <RpaCompanyEmblem size="lg" />
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
                <span className="text-white font-bold tracking-wide">Aryan &quot;AJ&quot; Risner, ISSA-CPT</span>
              </div>

              <div className="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400">Organization:</span>
                <span className="text-rose-400 font-bold">Risner Performance Athletics</span>
              </div>

              {/* Direct Email */}
              <div className="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-rose-400" />
                  Contact Email:
                </span>
                <a
                  href="mailto:risnerathletics@gmail.com"
                  className="text-rose-400 hover:text-rose-300 font-mono text-xs font-bold underline"
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
                  <span>AJ Risner (@ajrisner)</span>
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
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                  Certified Competencies & Standards
                </span>
                <div className="space-y-1.5">
                  {[
                    'Periodized Strength & Hypertrophy Program Design',
                    'Biomechanically Optimized Warm-Up Protocols',
                    'Estimated 1RM & Rep-Load Calculations',
                    'Rate of Force Development & CNS Potentiation',
                    'Progressive Overload & Recovery Management'
                  ].map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions with Prominent Exit Button */}
            <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl text-xs sm:text-sm transition-all border border-zinc-700 hover:border-zinc-600 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <X className="w-4 h-4 text-rose-400" />
                <span>Exit Verification</span>
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-amber-600/20 cursor-pointer text-center"
              >
                Verified Active
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
