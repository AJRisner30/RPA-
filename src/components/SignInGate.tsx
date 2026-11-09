import React, { useState } from 'react';
import { 
  ShieldCheck, Dumbbell, Zap, Lock, LogIn, TrendingUp, 
  ExternalLink, Mail, Instagram, AlertCircle, RefreshCw,
  Flame, Activity, Compass, Footprints, CheckCircle2, ChevronRight, Shield,
  Eye, EyeOff, UserPlus, KeyRound
} from 'lucide-react';
import { PatrolReadyCompanyEmblem } from './BrandingLogos';
import { useFirebase } from '../context/FirebaseContext';
import { PWAInstallButton } from './PWAInstallButton';
import { getSelectableAthletes, registerAthlete, setCurrentAthlete } from '../utils/athleteAuth';
import { saveAthleteToFirestore } from '../utils/firebaseSync';

interface SignInGateProps {
  onOpenPricingModal?: () => void;
  onOpenCodeModal?: () => void;
}

type AuthMode = 'signin' | 'signup' | 'set_password';

export const SignInGate: React.FC<SignInGateProps> = ({
  onOpenPricingModal,
  onOpenCodeModal,
}) => {
  const { 
    signInWithEmail, 
    signUpWithEmail,
    sendPasswordSetupEmail,
    isAuthenticating, 
    authError, 
    clearAuthError 
  } = useFirebase();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSuccessEmail, setResetSuccessEmail] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const syncAthleteAfterAuth = (userEmail: string, displayName?: string, uid?: string) => {
    try {
      const existing = getSelectableAthletes();
      let matched = existing.find((a) => (a.email || '').toLowerCase() === userEmail.toLowerCase());
      if (!matched) {
        const defaultName = displayName || (userEmail.toLowerCase() === 'risneraryan@gmail.com' ? 'Coach AJ Risner' : userEmail.split('@')[0]);
        matched = registerAthlete({
          name: defaultName,
          email: userEmail,
          experienceLevel: 'Intermediate',
          primaryGoal: 'Hybrid Athlete',
          weightLbs: 185,
        });
      } else {
        setCurrentAthlete(matched.id);
      }
      if (uid && matched) {
        saveAthleteToFirestore(matched, uid).catch(() => {});
      }
    } catch (err) {
      console.warn('[SignInGate] Athlete sync note:', err);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setLocalError(null);
    setResetSuccessEmail(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    try {
      const user = await signInWithEmail(cleanEmail, password);
      if (user) {
        syncAthleteAfterAuth(user.email || cleanEmail, user.displayName || undefined, user.uid);
      }
    } catch (err) {
      // Auth error is captured in FirebaseContext
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setLocalError(null);
    setResetSuccessEmail(null);

    const cleanEmail = email.trim();
    const cleanName = fullName.trim();

    if (!cleanName) {
      setLocalError('Please enter your full name or rank.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      const user = await signUpWithEmail(cleanEmail, password, cleanName);
      if (user) {
        syncAthleteAfterAuth(cleanEmail, cleanName, user.uid);
        try {
          localStorage.setItem('patrol_ready_show_tour', 'true');
          localStorage.setItem('patrol_ready_tour_trigger_reason', 'signup');
        } catch {}
      }
    } catch (err) {
      // If error indicates email already exists, provide guidance
    }
  };

  const handleSendResetEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearAuthError();
    setLocalError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setLocalError('Please enter the email address associated with your account.');
      return;
    }

    try {
      await sendPasswordSetupEmail(cleanEmail);
      setResetSuccessEmail(cleanEmail);
    } catch (err) {
      // Handled by context
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
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg text-xs font-mono text-amber-300 font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>14-Day Free Trial</span>
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
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>14-Day Risk-Free Trial • $0 Today • No Commitment</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white font-athletic">
            {mode === 'signin' && 'Sign In to Patrol Ready'}
            {mode === 'signup' && 'Activate 14-Day Free Trial & Sign Up'}
            {mode === 'set_password' && 'Set / Reset Account Password'}
          </h1>

          <p className="mt-2 text-xs sm:text-base text-slate-300 max-w-xl leading-relaxed">
            {mode === 'signin' && 'Welcome back, Officer. Enter your email and password to access your workout protocols, progressive overload logs, and readiness scores.'}
            {mode === 'signup' && 'Sign up to start your 14-day free trial. Instant access to all 5 tactical fitness protocols, the Universal PAT program, automated overload, and the AI workout architect.'}
            {mode === 'set_password' && 'Previously signed in with Google or need to reset your password? Enter your email address to receive a secure link to set your password.'}
          </p>
        </div>

        {/* Primary Action Box */}
        <div className="w-full max-w-lg bg-[#0f172a]/95 border-2 border-blue-500/40 hover:border-blue-400/60 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative transition-all">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-sky-500 text-white px-3.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider font-athletic shadow-md border border-blue-400/40">
            {mode === 'signin' && 'Officer Sign-In'}
            {mode === 'signup' && '14-Day Free Trial Gateway'}
            {mode === 'set_password' && 'Account Password Setup'}
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 bg-[#080d19] p-1 rounded-2xl border border-slate-800 mb-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                clearAuthError();
                setLocalError(null);
              }}
              className={`py-2 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'signin'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signup');
                clearAuthError();
                setLocalError(null);
              }}
              className={`py-2 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('set_password');
                clearAuthError();
                setLocalError(null);
              }}
              className={`py-2 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'set_password'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Set Password</span>
            </button>
          </div>

          {/* Notice for Previous Google Sign-In Users */}
          {mode !== 'set_password' && (
            <div className="mb-4 px-3 py-2 bg-blue-950/40 border border-blue-500/30 rounded-xl flex items-center justify-between gap-2 text-[11px] text-blue-200">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Previously used Google Sign-In?</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setMode('set_password');
                  clearAuthError();
                  setLocalError(null);
                }}
                className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer shrink-0"
              >
                Set your password here &rarr;
              </button>
            </div>
          )}

          {/* Trial Value Callout Banner for Sign Up */}
          {mode === 'signup' && (
            <div className="mb-5 p-3.5 bg-gradient-to-r from-blue-950/80 via-[#0a1224] to-indigo-950/60 border border-blue-500/40 rounded-2xl text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-black uppercase text-amber-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Full Pro Access Included
                </span>
                <span className="text-xs font-mono font-black text-white bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30">
                  $0 / 14 Days
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Apex, Tactical Hypertrophy, Hybrid &amp; PAT Protocols</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Automated Double Progression (+2.5 to +10 lbs)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Custom Tactical Workout Plan Architect</span>
                </div>
              </div>
            </div>
          )}

          {/* Local Validation Error */}
          {localError && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{localError}</span>
            </div>
          )}

          {/* Auth Error Notification */}
          {authError && (
            <div className="mb-5 p-3.5 bg-red-950/50 border border-red-500/50 rounded-2xl text-left animate-in fade-in duration-150">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-200 space-y-1.5 flex-1">
                  <div className="font-bold text-white">Sign-In Notice</div>
                  <p className="leading-snug text-slate-300">
                    {authError.message}
                  </p>

                  {/* Special guidance if account already exists from Google Sign-In */}
                  {authError.isAccountExists && (
                    <div className="mt-2 pt-2 border-t border-red-800/60 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-amber-300">
                        Previously signed in with Google? Set a password for this email now:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('set_password');
                          handleSendResetEmail();
                        }}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-[11px] cursor-pointer shrink-0 shadow"
                      >
                        Send Setup Link
                      </button>
                    </div>
                  )}

                  {authError.isInvalidCredential && (
                    <div className="mt-2 pt-2 border-t border-red-800/60">
                      <button
                        type="button"
                        onClick={() => {
                          setMode('set_password');
                          clearAuthError();
                        }}
                        className="text-[11px] text-blue-400 hover:text-blue-300 underline font-semibold cursor-pointer"
                      >
                        Did you previously sign in with Google? Click here to set your password &rarr;
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Password Reset Success Banner */}
          {resetSuccessEmail && (
            <div className="mb-5 p-4 bg-emerald-950/50 border border-emerald-500/60 rounded-2xl text-left animate-in fade-in duration-150 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Password Setup Email Sent!</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                We sent a secure password setup link to <strong className="text-white">{resetSuccessEmail}</strong>. 
                Please open your email inbox (and check your spam folder), click the link to set your password, and then come back to sign in.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setResetSuccessEmail(null);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs cursor-pointer shadow"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          )}

          {/* MODE: SIGN IN */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 text-xs font-bold mb-1 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="officer@department.gov or personal email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#070d18] border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 text-xs font-bold uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('set_password');
                      clearAuthError();
                      setLocalError(null);
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 underline font-semibold cursor-pointer"
                  >
                    Forgot / Set Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#070d18] border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/20 flex items-center justify-center gap-2 border border-blue-400/40 cursor-pointer disabled:opacity-50 mt-4 active:scale-98"
              >
                {isAuthenticating ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-white animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Patrol Ready</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE: SIGN UP */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 text-xs font-bold mb-1 uppercase tracking-wider">
                  Full Name / Rank
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Officer Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#070d18] border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-bold mb-1 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="officer@department.gov or personal email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#070d18] border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs font-bold mb-1 uppercase tracking-wider">
                    Password (min 6 chars)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#070d18] border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-bold mb-1 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#070d18] border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 flex items-center justify-center gap-2 border border-emerald-400/40 cursor-pointer disabled:opacity-50 mt-4 active:scale-98"
              >
                {isAuthenticating ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-white animate-spin" />
                    <span>Creating Account &amp; Starting Trial...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Activate 14-Day Free Trial</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE: SET / RESET PASSWORD */}
          {mode === 'set_password' && (
            <form onSubmit={handleSendResetEmail} className="space-y-4">
              <div className="p-3.5 bg-blue-950/50 border border-blue-500/30 rounded-2xl text-left space-y-2">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
                  <KeyRound className="w-4 h-4 text-blue-400" />
                  <span>Set Password for Previous Google Accounts</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If you previously signed in using Google, enter your previous Google email address below. 
                  We will email you a secure link to choose a password so you can sign in directly using email and password.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-bold mb-1 uppercase tracking-wider">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your previous Google sign-in or registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#070d18] border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    clearAuthError();
                    setLocalError(null);
                  }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 border border-blue-400/40 cursor-pointer disabled:opacity-50"
                >
                  {isAuthenticating ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-white animate-spin" />
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Send Password Setup Link</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Mode Switcher & Secondary Links */}
          <div className="pt-4 mt-4 border-t border-slate-800/80 flex flex-col gap-2.5 text-center text-xs">
            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 flex-wrap">
              {onOpenPricingModal && (
                <button
                  type="button"
                  onClick={onOpenPricingModal}
                  className="text-slate-300 hover:text-white underline cursor-pointer"
                >
                  View Membership Pricing ($30 / $15)
                </button>
              )}
              {onOpenPricingModal && onOpenCodeModal && <span>•</span>}
              {onOpenCodeModal && (
                <button
                  type="button"
                  onClick={onOpenCodeModal}
                  className="text-amber-400 hover:text-amber-300 font-mono font-bold cursor-pointer"
                >
                  Have an Agency Code?
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>256-Bit Encrypted Cloud Sync • No Card Required for 14-Day Trial</span>
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
              <TrendingUp className="w-4 h-4" />
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
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-black uppercase tracking-wider font-athletic">
                Tactical Duty &amp; Pursuit
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Frontline sprint intervals, 1.5-mile physical agility standards, and anaerobic foot pursuit work capacity.
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
              href="https://50callabz.com/risner55"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 transition-colors font-bold inline-flex items-center gap-1"
              title="Official Supplement Partner: 50 Cal Labz (Code: PATROLREADY)"
            >
              <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>50 Cal Labz Partner (Code: PATROLREADY)</span>
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
