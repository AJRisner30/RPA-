import React, { useState } from 'react';
import { 
  X, User, ShieldCheck, Dumbbell, Award, Plus, LogIn, 
  Check, ChevronRight, Lock, Mail, Activity, Sparkles, Download, ArrowRight,
  Trash2, AlertTriangle, Cloud, LogOut, CheckCircle2, RefreshCw
} from 'lucide-react';
import { AthleteProfile, WorkoutSessionLog } from '../types';
import { 
  getAthletes, 
  getSelectableAthletes,
  getCurrentAthlete, 
  setCurrentAthlete, 
  registerAthlete, 
  loginAthlete,
  updateAthleteProfile
} from '../utils/athleteAuth';
import { 
  getStoredWorkoutLogs, 
  clearAllWorkoutLogs, 
  clearAthleteWorkoutLogs, 
  clearHybridStrengthLogs,
  clearAllRuckLogs,
  clearAthleteRuckLogs
} from '../utils/storage';
import { useFirebase } from '../context/FirebaseContext';
import { saveAthleteToFirestore } from '../utils/firebaseSync';

interface AthleteLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAthleteChanged: (athlete: AthleteProfile) => void;
}

export const AthleteLoginModal: React.FC<AthleteLoginModalProps> = ({
  isOpen,
  onClose,
  onAthleteChanged,
}) => {
  const { user, isCloudConnected, signInWithGoogle, signOutUser } = useFirebase();
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [athletes, setAthletes] = useState<AthleteProfile[]>(() => getSelectableAthletes());
  const [currentAthlete, setCurrentAthleteState] = useState<AthleteProfile>(() => getCurrentAthlete());
  const [viewMode, setViewMode] = useState<'switch' | 'register' | 'login' | 'profile'>('switch');

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regGoal, setRegGoal] = useState<AthleteProfile['primaryGoal']>('Hybrid Athlete');
  const [regLevel, setRegLevel] = useState<AthleteProfile['experienceLevel']>('Intermediate');
  const [regWeight, setRegWeight] = useState('185');
  const [formError, setFormError] = useState('');

  // Login Query State
  const [loginQuery, setLoginQuery] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState('');

  // Clear Logs State
  const [confirmClearAction, setConfirmClearAction] = useState<'none' | 'current' | 'all'>('none');
  const [clearSuccessMsg, setClearSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const allLogs: WorkoutSessionLog[] = getStoredWorkoutLogs();
  const athleteLogs = allLogs.filter(
    (l) => l.athleteId === currentAthlete.id || (!l.athleteId && (currentAthlete.id === 'athlete-default' || currentAthlete.id === 'athlete-aj-risner'))
  );
  const totalVolume = athleteLogs.reduce((acc, l) => acc + (l.totalVolumeLbs || 0), 0);
  const totalSessions = athleteLogs.length;

  const handleExecuteAthleteClear = (scope: 'current' | 'all') => {
    if (scope === 'all') {
      clearAllWorkoutLogs();
      clearHybridStrengthLogs();
      clearAllRuckLogs();
      setClearSuccessMsg('All workout and ruck logs cleared successfully across all athletes.');
    } else {
      clearAthleteWorkoutLogs(currentAthlete.id);
      clearAthleteRuckLogs(currentAthlete.id);
      setClearSuccessMsg(`${currentAthlete.name}'s logs cleared successfully.`);
    }
    setConfirmClearAction('none');
    setTimeout(() => setClearSuccessMsg(null), 3500);
  };

  const handleSelectAthlete = (athlete: AthleteProfile) => {
    const updated = setCurrentAthlete(athlete.id);
    setCurrentAthleteState(updated);
    onAthleteChanged(updated);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!regName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    try {
      const newAthlete = registerAthlete({
        name: regName,
        email: regEmail,
        pin: regPin,
        experienceLevel: regLevel,
        primaryGoal: regGoal,
        weightLbs: parseFloat(regWeight) || 180,
      });

      setAthletes(getSelectableAthletes());
      setCurrentAthleteState(newAthlete);
      onAthleteChanged(newAthlete);
      onClose();
    } catch {
      setFormError('Registration failed. Please try again.');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginQuery.trim()) {
      setLoginError('Enter your athlete email or name.');
      return;
    }

    const found = loginAthlete(loginQuery, loginPin);
    if (found) {
      setAthletes(getSelectableAthletes());
      setCurrentAthleteState(found);
      onAthleteChanged(found);
      onClose();
    } else {
      setLoginError('No matching athlete profile found, or incorrect PIN.');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningInGoogle(true);
    try {
      const googleUser = await signInWithGoogle();
      if (googleUser) {
        const name = googleUser.displayName || 'Google Athlete';
        const email = googleUser.email || '';

        let athlete = athletes.find((a) => (a.email || '').toLowerCase() === email.toLowerCase());
        if (!athlete) {
          athlete = registerAthlete({
            name,
            email,
            experienceLevel: 'Intermediate',
            primaryGoal: 'Hybrid Athlete',
            weightLbs: 185,
          });
        }
        setAthletes(getSelectableAthletes());
        setCurrentAthleteState(athlete);
        onAthleteChanged(athlete);

        // Sync with Firestore
        saveAthleteToFirestore(athlete, googleUser.uid).catch((err) => {
          console.warn('[Firebase] Athlete profile sync note:', err);
        });
      }
    } catch (err) {
      console.error('[Firebase] Sign-in failed:', err);
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await signOutUser();
  };

  const exportAthleteData = () => {
    const data = {
      athlete: currentAthlete,
      sessions: athleteLogs,
      exportedAt: new Date().toISOString(),
      platform: 'Overland Athletics',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overland_athlete_${currentAthlete.name.toLowerCase().replace(/\s+/g, '_')}_logs.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 px-5 sm:px-6 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${currentAthlete.avatarColor} flex items-center justify-center text-white font-athletic font-black text-base shadow-lg shadow-amber-950/40 border border-white/15`}>
              {currentAthlete.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white font-athletic tracking-wide">
                  Athlete Profile & Progress
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Log in to save workouts, auto-overload progression, and personal records.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="grid grid-cols-3 bg-zinc-900/60 p-1.5 border-b border-zinc-800/80 text-xs font-bold shrink-0">
          <button
            onClick={() => setViewMode('switch')}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              viewMode === 'switch'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Switch Athlete</span>
          </button>

          <button
            onClick={() => setViewMode('register')}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              viewMode === 'register'
                ? 'bg-amber-500 text-black font-black shadow-md shadow-amber-950/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Profile</span>
          </button>

          <button
            onClick={() => setViewMode('profile')}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              viewMode === 'profile'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>My Stats</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Firebase Cloud Sync Card */}
          <div className="bg-gradient-to-r from-[#141b22] to-[#1a232e] border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                user ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs sm:text-sm">
                    {user ? 'Firebase Cloud Sync Active' : 'Firebase Cloud Backup & Sync'}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    user ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {user ? 'Synced' : isCloudConnected ? 'Cloud Ready' : 'Local'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {user ? (
                    <span>Signed in as <strong className="text-zinc-200">{user.email}</strong>. Workouts & biometrics auto-persist to Firestore.</span>
                  ) : (
                    <span>Sign in with Google to automatically backup and sync your workout logs across devices in real-time.</span>
                  )}
                </p>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              {user ? (
                <button
                  type="button"
                  onClick={handleGoogleSignOut}
                  className="w-full sm:w-auto px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSigningInGoogle}
                  className="w-full sm:w-auto px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-950/40 cursor-pointer disabled:opacity-50"
                >
                  {isSigningInGoogle ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  )}
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>
          </div>

          {/* VIEW: SWITCH ATHLETE */}
          {viewMode === 'switch' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                  Registered Athletes ({athletes.length})
                </span>
                <button
                  onClick={() => setViewMode('login')}
                  className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In with PIN / Email
                </button>
              </div>

              <div className="space-y-2.5">
                {athletes.map((athlete) => {
                  const isActive = athlete.id === currentAthlete.id;
                  const count = allLogs.filter(
                    (l) => l.athleteId === athlete.id || (!l.athleteId && athlete.id === 'athlete-default')
                  ).length;

                  return (
                    <div
                      key={athlete.id}
                      onClick={() => handleSelectAthlete(athlete)}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-amber-950/25 border-amber-500/60 shadow-md'
                          : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${athlete.avatarColor} flex items-center justify-center text-white font-black font-athletic text-sm shrink-0 shadow-md`}>
                          {athlete.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm truncate">
                              {athlete.name}
                            </span>
                            {isActive && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                            <span>{athlete.primaryGoal}</span>
                            <span>•</span>
                            <span>{athlete.experienceLevel}</span>
                            <span>•</span>
                            <span className="text-zinc-300 font-mono">{count} workouts saved</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isActive ? (
                          <div className="w-8 h-8 rounded-xl bg-amber-500 text-black font-black flex items-center justify-center">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-bold text-xs transition-colors"
                          >
                            Switch
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <p className="text-zinc-500 text-[11px]">
                  All workouts, PRs, and auto-overload weights are saved automatically to the active athlete.
                </p>
                <button
                  onClick={() => setViewMode('register')}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  New Athlete
                </button>
              </div>
            </div>
          )}

          {/* VIEW: REGISTER NEW ATHLETE */}
          {viewMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px] mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Create Your Personal Athlete Account
                </div>
                <p className="text-zinc-400 text-xs">
                  Saves your complete lifting logs, running paces, and automatically calculates next week's progressive overload weights.
                </p>
              </div>

              {formError && (
                <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl text-red-300 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 text-xs font-bold mb-1 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-bold mb-1 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="athlete@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 text-xs font-bold mb-1 uppercase tracking-wider">
                    Primary Goal
                  </label>
                  <select
                    value={regGoal}
                    onChange={(e) => setRegGoal(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="Hybrid Athlete">Hybrid Athlete</option>
                    <option value="Strength & Power">Strength & Power</option>
                    <option value="Hypertrophy">Hypertrophy</option>
                    <option value="Tactical & Rucking">Tactical & Rucking</option>
                    <option value="Endurance & Running">Endurance & Running</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-bold mb-1 uppercase tracking-wider">
                    Experience Level
                  </label>
                  <select
                    value={regLevel}
                    onChange={(e) => setRegLevel(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="Beginner">Beginner (0-1 yr)</option>
                    <option value="Intermediate">Intermediate (1-3 yrs)</option>
                    <option value="Advanced">Advanced (3-5 yrs)</option>
                    <option value="Elite">Elite (5+ yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-bold mb-1 uppercase tracking-wider">
                    Bodyweight (lbs)
                  </label>
                  <input
                    type="number"
                    value={regWeight}
                    onChange={(e) => setRegWeight(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-bold mb-1 uppercase tracking-wider flex items-center justify-between">
                  <span>Quick Access PIN (Optional)</span>
                  <span className="text-[10px] text-zinc-500">4 digits</span>
                </label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="e.g. 1234"
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs font-mono tracking-widest focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('switch')}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl text-xs shadow-lg shadow-amber-950/40 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save & Activate Athlete
                </button>
              </div>
            </form>
          )}

          {/* VIEW: LOGIN */}
          {viewMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800">
                <div className="text-amber-400 font-bold uppercase tracking-wider text-[11px] mb-1">
                  Athlete Quick Sign-In
                </div>
                <p className="text-zinc-400 text-xs">
                  Enter your registered email address or name to load your workout logs and progressive overload history.
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl text-red-300 text-xs font-semibold">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-zinc-400 text-xs font-bold mb-1 uppercase tracking-wider">
                  Athlete Name or Email
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. athlete@example.com or athlete name"
                  value={loginQuery}
                  onChange={(e) => setLoginQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-bold mb-1 uppercase tracking-wider">
                  PIN (If configured)
                </label>
                <input
                  type="password"
                  placeholder="4 digits"
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs font-mono tracking-widest focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('switch')}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl text-xs shadow-lg shadow-amber-950/40 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* VIEW: ATHLETE STATS / PROFILE */}
          {viewMode === 'profile' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentAthlete.avatarColor} flex items-center justify-center text-white font-black font-athletic text-lg shadow-md`}>
                    {currentAthlete.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white font-athletic">
                      {currentAthlete.name}
                    </h4>
                    <p className="text-zinc-400 text-xs">
                      {currentAthlete.email} • {currentAthlete.primaryGoal}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2 py-1 bg-amber-950/60 border border-amber-700/50 text-amber-300 rounded-lg text-xs font-bold uppercase">
                    {currentAthlete.experienceLevel}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                  <div className="text-[10px] text-zinc-400 font-bold uppercase">Workouts Logged</div>
                  <div className="text-lg font-black text-white font-mono mt-0.5">{totalSessions}</div>
                </div>

                <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                  <div className="text-[10px] text-zinc-400 font-bold uppercase">Total Volume</div>
                  <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                    {totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume} <span className="text-xs">lbs</span>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                  <div className="text-[10px] text-zinc-400 font-bold uppercase">Bodyweight</div>
                  <div className="text-lg font-black text-white font-mono mt-0.5">
                    {currentAthlete.weightLbs} <span className="text-xs">lbs</span>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                  <div className="text-[10px] text-zinc-400 font-bold uppercase">Auto-Overload</div>
                  <div className="text-xs font-black text-emerald-400 font-mono mt-1 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Active
                  </div>
                </div>
              </div>

              {/* Log History Management / Fresh Start Options */}
              <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Trash2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Workout Log Management</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {athleteLogs.length} saved sessions
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Start fresh at any time by clearing this athlete's workout log or wiping all historical logs in the app.
                </p>

                {confirmClearAction === 'none' ? (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setConfirmClearAction('current')}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-amber-950/40 text-zinc-300 hover:text-amber-300 border border-zinc-700 hover:border-amber-700/50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Clear {currentAthlete.name.split(' ')[0]}'s Logs
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClearAction('all')}
                      className="px-3 py-1.5 bg-amber-950/30 hover:bg-amber-900/60 text-amber-300 border border-amber-700/50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Clear All Athletes (Fresh Start)
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-950/30 border border-amber-700/50 rounded-xl space-y-2">
                    <div className="flex items-start gap-2 text-xs text-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        {confirmClearAction === 'all'
                          ? 'Are you sure you want to clear ALL workout logs across all athletes? This cannot be undone.'
                          : `Are you sure you want to clear all workout logs for ${currentAthlete.name}?`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setConfirmClearAction('none')}
                        className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExecuteAthleteClear(confirmClearAction)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Confirm Clear
                      </button>
                    </div>
                  </div>
                )}

                {clearSuccessMsg && (
                  <div className="p-2 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{clearSuccessMsg}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={exportAthleteData}
                  className="w-full sm:w-auto px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                  Export Athlete Logbook (JSON)
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('switch')}
                  className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  Switch / Change Athlete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
