import React, { useState } from 'react';
import { 
  ShieldCheck, Dumbbell, Zap, Lock, LogIn, Sparkles, 
  ExternalLink, Mail, Instagram, AlertCircle, RefreshCw,
  Flame, Activity, Compass, Footprints, CheckCircle2, ChevronRight, Shield
} from 'lucide-react';
import { PatrolReadyCompanyEmblem } from './BrandingLogos';
import { useFirebase } from '../context/FirebaseContext';
import { PWAInstallButton } from './PWAInstallButton';

export const SignInGate: React.FC = () => {
  const { 
    signInWithGoogle, 
    signInWithGoogleRedirect, 
    isAuthenticating, 
    authError, 
    clearAuthError,
    isIframe 
  } = useFirebase();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAlternative, setShowAlternative] = useState<boolean>(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    clearAuthError();
    try {
      await signInWithGoogle();
    } catch (err) {
      console.warn('[SignInGate] Popup sign-in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedirectSignIn = async () => {
    setIsLoading(true);
    clearAuthError();
    try {
      await signInWithGoogleRedirect();
    } catch (err) {
      console.warn('[SignInGate] Redirect sign-in error:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080e18] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background Ambience & Police Tactical Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(37,99,235,0.18),transparent_70%)] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Top Banner & Brand Rail */}
      <header className="relative z-10 border-b border-blue-500/30 bg-[#0b1320]/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PatrolReadyCompanyEmblem size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-athletic font-black text-sm sm:text-base tracking-wider text-white uppercase">
                Patrol Ready
              </span>
              <span className="font-athletic font-black text-sm sm:text-base tracking-wider text-blue-400 uppercase">
                Performance
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono">
                LEO v2.6
              </span>
            </div>
            <span className="text-[11px] text-blue-300 font-bold block tracking-wider uppercase font-athletic">
              Tactical fitness for the Frontline.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PWAInstallButton variant="pill" className="text-xs py-1 px-2.5 hidden sm:inline-flex" />
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-blue-500/30 rounded-lg text-xs font-mono text-slate-300">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden xs:inline">Access:</span>
            <span className="text-blue-400 font-bold">Secure Gate</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 my-auto flex flex-col items-center">
        {/* Emblem Hero Badge */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <div className="relative mb-3">
            <div className="absolute inset-0 bg-blue-500/25 rounded-full blur-2xl animate-pulse" />
            <div className="relative p-1 bg-gradient-to-b from-blue-400/40 via-slate-800 to-slate-950 rounded-2xl shadow-2xl border border-blue-400/40">
              <PatrolReadyCompanyEmblem size="lg" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/15 border border-blue-500/40 rounded-full text-[11px] font-bold text-blue-300 uppercase tracking-widest font-mono mb-2">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Tactical &amp; Law Enforcement Portal • Authorized Sign-In</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white font-athletic">
            Patrol Ready Performance
          </h1>

          <p className="mt-2 text-xs sm:text-base text-slate-300 max-w-xl leading-relaxed">
            Welcome to <span className="text-white font-bold">Patrol Ready Performance</span> — Tactical fitness for the Frontline. Sign in to access your duty-specific training protocols, automated progressive overload tracking, and secure officer performance records.
          </p>
        </div>

        {/* Primary Sign-In Box */}
        <div className="w-full max-w-md bg-[#0f172a]/95 border-2 border-blue-500/30 hover:border-blue-400/50 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative transition-all">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider font-athletic shadow-md border border-blue-400/40">
            Frontline Officer Portal
          </div>

          {/* Auth Error Notification */}
          {authError && (
            <div className="mb-5 p-3.5 bg-red-950/70 border border-red-500/60 rounded-xl text-left animate-in fade-in duration-150">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs text-red-200 space-y-1">
                  <div className="font-bold text-red-300">Sign-in Notice ({authError.code})</div>
                  <p className="leading-snug text-red-200/90">{authError.message}</p>
                  {authError.isDomainError && (
                    <div className="text-[11px] text-blue-300 pt-1 font-mono">
                      Domain: {authError.domain || window.location.hostname}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={clearAuthError}
                    className="mt-1 text-[11px] underline text-red-400 hover:text-red-300 font-bold cursor-pointer"
                  >
                    Dismiss notification
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Google Sign-in CTA */}
          <div className="space-y-3.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isAuthenticating}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/10 flex items-center justify-center gap-3 border border-slate-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading || isAuthenticating ? (
                <>
                  <RefreshCw className="w-5 h-5 text-slate-900 animate-spin" />
                  <span>Connecting to Patrol Cloud...</span>
                </>
              ) : (
                <>
                  {/* Google SVG Logo */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="text-slate-900 group-hover:text-black font-bold">
                    Sign in with Google
                  </span>
                </>
              )}
            </button>

            {/* In-app Browser / Redirect Alternative */}
            <div className="pt-2 text-center">
              {!showAlternative ? (
                <button
                  type="button"
                  onClick={() => setShowAlternative(true)}
                  className="text-xs text-slate-400 hover:text-blue-400 transition-colors font-medium cursor-pointer"
                >
                  Trouble with popup window? Use direct redirect &darr;
                </button>
              ) : (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-left space-y-2 animate-in fade-in duration-150">
                  <p className="text-[11px] text-slate-300 leading-snug">
                    If your mobile device or browser blocks popup windows, sign in via full redirect:
                  </p>
                  <button
                    type="button"
                    onClick={handleRedirectSignIn}
                    disabled={isLoading || isAuthenticating}
                    className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign in with Full-Page Redirect</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Secure 256-Bit Cloud Sync • Patrol Ready Performance</span>
          </div>
        </div>

        {/* Tactical Law Enforcement Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full mt-8 sm:mt-12 text-left">
          <div className="p-4 bg-slate-900/70 border border-blue-500/25 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-blue-400 mb-1.5">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-black uppercase tracking-wider font-athletic">
                Duty Readiness &amp; Armor
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Combat chassis resilience engineered to withstand duty vest and belt loads through 12-hour patrol shifts.
            </p>
          </div>

          <div className="p-4 bg-slate-900/70 border border-blue-500/25 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-blue-400 mb-1.5">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-black uppercase tracking-wider font-athletic">
                Foot Pursuit Speed
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Explosive sprint mechanics, change-of-direction agility, and anaerobic capacity for high-stress tactical chases.
            </p>
          </div>

          <div className="p-4 bg-slate-900/70 border border-blue-500/25 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider font-athletic">
                Auto-Overload Engine
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Data-driven progression (+2.5 to 10 lbs) calculated automatically from completed sets, reps, and RPE feedback.
            </p>
          </div>

          <div className="p-4 bg-slate-900/70 border border-blue-500/25 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-blue-400 mb-1.5">
              <Footprints className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-black uppercase tracking-wider font-athletic">
                Tactical Ruck &amp; Load
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Progressive tactical load carriage (25-50 lbs), pace benchmarks, and aerobic heart-rate zone conditioning.
            </p>
          </div>
        </div>

        {/* Coach / Law Enforcement Directive */}
        <div className="mt-8 text-center max-w-xl">
          <blockquote className="text-xs sm:text-sm text-slate-400 italic">
            &ldquo;On patrol, you don&apos;t rise to the occasion — you sink to the level of your training. Build the armor before the call.&rdquo;
          </blockquote>
          <span className="text-[11px] font-bold text-blue-400 font-athletic uppercase tracking-wider block mt-1">
            — Coach Aryan Risner • Patrol Ready Performance
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-[#0b1320] py-4 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="text-slate-300 font-bold uppercase tracking-wider">Patrol Ready Performance</span>
            <span className="text-slate-700">•</span>
            <span className="text-blue-400 font-semibold">Tactical fitness for the Frontline.</span>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <a
              href="https://bckd.co/87uJC2e"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors font-bold inline-flex items-center gap-1"
            >
              <Zap className="w-3 h-3 fill-blue-400 text-blue-400" />
              <span>Bucked Up Partner</span>
            </a>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <a
              href="https://www.instagram.com/ajrisner"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-400 transition-colors hidden sm:inline-flex items-center gap-1"
            >
              <Instagram className="w-3 h-3 text-blue-400" />
              <span>@ajrisner</span>
            </a>
          </div>

          <span className="text-slate-500 font-mono text-[11px]">
            © {new Date().getFullYear()} Patrol Ready Performance. All Rights Reserved.
          </span>
        </div>
      </footer>
    </div>
  );
};
