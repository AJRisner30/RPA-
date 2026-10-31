import React, { useState } from 'react';
import { 
  X, User, ShieldCheck, Dumbbell, Award, Plus, LogIn, 
  Check, ChevronRight, Lock, Mail, Activity, Sparkles, Download, ArrowRight,
  Trash2, AlertTriangle, Cloud, LogOut, CheckCircle2, RefreshCw, Copy, ExternalLink, KeyRound
} from 'lucide-react';
import { AthleteProfile, WorkoutSessionLog } from '../types';
import { ReadinessScoreCard } from './ReadinessScoreCard';
import { 
  getAthletes, 
  getSelectableAthletes,
  getCurrentAthlete, 
  setCurrentAthlete, 
  registerAthlete, 
  loginAthlete,
  updateAthleteProfile,
  isCoachSession
} from '../utils/athleteAuth';
import { 
  getStoredWorkoutLogs, 
  clearAllWorkoutLogs, 
  clearAthleteWorkoutLogs, 
  clearHybridStrengthLogs
} from '../utils/storage';
import { useFirebase } from '../context/FirebaseContext';
import { saveAthleteToFirestore } from '../utils/firebaseSync';

interface AthleteLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAthleteChanged: (athlete: AthleteProfile) => void;
  onOpenQuestionnaire?: () => void;
}

export const AthleteLoginModal: React.FC<AthleteLoginModalProps> = ({
  isOpen,
  onClose,
  onAthleteChanged,
  onOpenQuestionnaire,
}) => {
  const { 
    user, 
    isCloudConnected, 
    isAuthenticating, 
    authError, 
    clearAuthError, 
    signInWithEmail,
    signUpWithEmail,
    sendPasswordSetupEmail,
    setUserPassword,
    signOutUser 
  } = useFirebase();
  const isCoach = Boolean(
    (user?.email && user.email.trim().toLowerCase() === 'risneraryan@gmail.com') ||
    isCoachSession()
  );

  // Cloud Sync & Auth States
  const [showCloudAuth, setShowCloudAuth] = useState(false);
  const [cloudAuthMode, setCloudAuthMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [cloudEmail, setCloudEmail] = useState('');
  const [cloudPassword, setCloudPassword] = useState('');
  const [cloudName, setCloudName] = useState('');
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [cloudSuccessMsg, setCloudSuccessMsg] = useState<string | null>(null);

  // Set/Update Password for authenticated user
  const [showSetPasswordForm, setShowSetPasswordForm] = useState(false);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [athletes, setAthletes] = useState<AthleteProfile[]>(() => getSelectableAthletes(isCoach));
  const [currentAthlete, setCurrentAthleteState] = useState<AthleteProfile>(() => getCurrentAthlete());
  const [viewMode, setViewMode] = useState<'switch' | 'register' | 'login' | 'profile'>(() => isCoach ? 'switch' : 'profile');

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
      setClearSuccessMsg('All workout logs cleared successfully across all athletes.');
    } else {
      clearAthleteWorkoutLogs(currentAthlete.id);
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

  const handleUpdateCurrentAthlete = (updated: AthleteProfile) => {
    setCurrentAthleteState(updated);
    updateAthleteProfile(updated.id, updated);
    onAthleteChanged(updated);
    if (user) {
      saveAthleteToFirestore(updated, user.uid).catch((err) => {
        console.warn('[Firebase] Save athlete note:', err);
      });
    }
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

  const handleCloudSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setCloudError(null);
    setCloudSuccessMsg(null);
    clearAuthError();
    try {
      const signedInUser = await signInWithEmail(cloudEmail.trim(), cloudPassword);
      if (signedInUser) {
        const email = signedInUser.email || cloudEmail.trim();
        let athlete = athletes.find((a) => (a.email || '').toLowerCase() === email.toLowerCase());
        if (!athlete) {
          athlete = registerAthlete({
            name: signedInUser.displayName || email.split('@')[0],
            email,
            experienceLevel: 'Intermediate',
            primaryGoal: 'Hybrid Athlete',
            weightLbs: 185,
          });
        }
        setAthletes(getSelectableAthletes());
        setCurrentAthleteState(athlete);
        onAthleteChanged(athlete);
        saveAthleteToFirestore(athlete, signedInUser.uid).catch(() => {});
        setShowCloudAuth(false);
        setCloudPassword('');
      }
    } catch (err: any) {
      setCloudError(authError?.message || 'Failed to sign in. Please check your credentials or set a password.');
    }
  };

  const handleCloudSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setCloudError(null);
    setCloudSuccessMsg(null);
    clearAuthError();
    if (cloudPassword.length < 6) {
      setCloudError('Password must be at least 6 characters long.');
      return;
    }
    try {
      const signedUpUser = await signUpWithEmail(cloudEmail.trim(), cloudPassword, cloudName.trim() || undefined);
      if (signedUpUser) {
        const email = signedUpUser.email || cloudEmail.trim();
        const athlete = registerAthlete({
          name: cloudName.trim() || email.split('@')[0],
          email,
          experienceLevel: 'Intermediate',
          primaryGoal: 'Hybrid Athlete',
          weightLbs: 185,
        });
        setAthletes(getSelectableAthletes());
        setCurrentAthleteState(athlete);
        onAthleteChanged(athlete);
        saveAthleteToFirestore(athlete, signedUpUser.uid).catch(() => {});
        setShowCloudAuth(false);
        setCloudPassword('');
      }
    } catch (err: any) {
      setCloudError(authError?.message || 'Registration failed. If you already have an account, please Sign In or Set Password.');
    }
  };

  const handleCloudPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setCloudError(null);
    setCloudSuccessMsg(null);
    clearAuthError();
    if (!cloudEmail.trim() || !cloudEmail.includes('@')) {
      setCloudError('Please enter a valid email address.');
      return;
    }
    try {
      await sendPasswordSetupEmail(cloudEmail.trim());
      setCloudSuccessMsg(`Password setup email sent to ${cloudEmail.trim()}! Please check your inbox (and spam) to set your password.`);
    } catch (err: any) {
      setCloudError(authError?.message || 'Could not send password setup email.');
    }
  };

  const handleUpdateUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPasswordVal.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (newPasswordVal !== newPasswordConfirm) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await setUserPassword(newPasswordVal);
      setPasswordMsg({ type: 'success', text: 'Password set successfully! You can now log in using this password and your email.' });
      setNewPasswordVal('');
      setNewPasswordConfirm('');
      setTimeout(() => setShowSetPasswordForm(false), 3500);
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err?.message || 'Failed to update password.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSignOut = async () => {
    clearAuthError();
    await signOutUser();
    setShowSetPasswordForm(false);
  };

  const exportAthleteData = () => {
    const data = {
      athlete: currentAthlete,
      sessions: athleteLogs,
      exportedAt: new Date().toISOString(),
      platform: 'Patrol Ready Performance',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patrol_ready_officer_${currentAthlete.name.toLowerCase().replace(/\s+/g, '_')}_logs.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0b1329] via-[#0f172a] to-[#0b1329] px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${currentAthlete.avatarColor} flex items-center justify-center text-white font-athletic font-black text-base shadow-lg shadow-blue-950/40 border border-white/15`}>
              {currentAthlete.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white font-athletic tracking-wide">
                  Athlete Profile & Progress
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Log in to save workouts, auto-overload progression, and personal records.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className={`grid ${isCoach ? 'grid-cols-3' : 'grid-cols-2'} bg-[#0a0f1d] p-1.5 border-b border-slate-800/80 text-xs font-bold shrink-0`}>
          {isCoach && (
            <button
              onClick={() => setViewMode('switch')}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                viewMode === 'switch'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Agency Roster</span>
            </button>
          )}

          <button
            onClick={() => setViewMode('profile')}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              viewMode === 'profile'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>My Stats &amp; Readiness</span>
          </button>

          <button
            onClick={() => setViewMode('register')}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              viewMode === 'register'
                ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-950/40 border border-blue-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isCoach ? 'Create Profile' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Firebase Cloud Sync Card */}
          <div className="bg-gradient-to-r from-[#0f172a] to-[#131d36] border border-blue-500/30 rounded-2xl p-3.5 sm:p-4 shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  user ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs sm:text-sm">
                      {user ? 'Firebase Cloud Sync Active' : 'Firebase Cloud Backup & Sync'}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      user ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}>
                      {user ? 'Synced' : isCloudConnected ? 'Cloud Ready' : 'Local'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {user ? (
                      <span>Signed in as <strong className="text-slate-200">{user.email}</strong>. Workouts &amp; biometrics auto-persist to Firestore.</span>
                    ) : (
                      <span>Sign in with Email &amp; Password to backup and sync your workout logs across devices in real-time.</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="shrink-0 w-full sm:w-auto flex flex-wrap items-center gap-2">
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowSetPasswordForm(!showSetPasswordForm)}
                      className="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-white border border-blue-500/40 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{showSetPasswordForm ? 'Close Password Form' : 'Set / Update Password'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCloudAuth(!showCloudAuth);
                      setCloudError(null);
                      setCloudSuccessMsg(null);
                    }}
                    className="w-full sm:w-auto px-3.5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-950/40 cursor-pointer border border-blue-400/40"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{showCloudAuth ? 'Hide Sign In' : 'Sign In / Connect Account'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Set Password Form for Currently Logged-in User */}
            {user && showSetPasswordForm && (
              <form onSubmit={handleUpdateUserPassword} className="p-3 bg-[#0a0f1d] border border-blue-500/30 rounded-xl space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
                  <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                  <span>Set / Update Account Password</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Did you previously sign in using Google? Setting a password allows you to log in with your email address (<strong className="text-white">{user.email}</strong>) and password on any device.
                </p>

                {passwordMsg && (
                  <div className={`p-2.5 rounded-lg text-xs font-semibold ${
                    passwordMsg.type === 'success' 
                      ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300' 
                      : 'bg-red-950/60 border border-red-500/50 text-red-300'
                  }`}>
                    {passwordMsg.text}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="password"
                    placeholder="New password (min 6 chars)"
                    value={newPasswordVal}
                    onChange={(e) => setNewPasswordVal(e.target.value)}
                    className="bg-[#060b14] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    className="bg-[#060b14] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSetPasswordForm(false)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isUpdatingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Save Password</span>
                  </button>
                </div>
              </form>
            )}

            {/* Inline Cloud Auth Form when not logged in */}
            {!user && showCloudAuth && (
              <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-xl space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-lg border border-slate-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => { setCloudAuthMode('signin'); setCloudError(null); }}
                    className={`flex-1 py-1.5 rounded-md text-center transition-all cursor-pointer ${
                      cloudAuthMode === 'signin' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCloudAuthMode('signup'); setCloudError(null); }}
                    className={`flex-1 py-1.5 rounded-md text-center transition-all cursor-pointer ${
                      cloudAuthMode === 'signup' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCloudAuthMode('reset'); setCloudError(null); }}
                    className={`flex-1 py-1.5 rounded-md text-center transition-all cursor-pointer ${
                      cloudAuthMode === 'reset' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Set Password
                  </button>
                </div>

                {cloudError && (
                  <div className="p-2.5 bg-red-950/60 border border-red-500/50 rounded-lg text-red-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{cloudError}</span>
                  </div>
                )}

                {cloudSuccessMsg && (
                  <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{cloudSuccessMsg}</span>
                  </div>
                )}

                {cloudAuthMode === 'signin' && (
                  <form onSubmit={handleCloudSignIn} className="space-y-2.5">
                    <input
                      type="email"
                      required
                      placeholder="Email address"
                      value={cloudEmail}
                      onChange={(e) => setCloudEmail(e.target.value)}
                      className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="password"
                      required
                      placeholder="Password"
                      value={cloudPassword}
                      onChange={(e) => setCloudPassword(e.target.value)}
                      className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setCloudAuthMode('reset')}
                        className="text-[11px] text-blue-400 hover:text-blue-300 underline font-semibold cursor-pointer"
                      >
                        Previously used Google? Set password &rarr;
                      </button>
                      <button
                        type="submit"
                        disabled={isAuthenticating}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isAuthenticating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
                        <span>Sign In</span>
                      </button>
                    </div>
                  </form>
                )}

                {cloudAuthMode === 'signup' && (
                  <form onSubmit={handleCloudSignUp} className="space-y-2.5">
                    <input
                      type="text"
                      placeholder="Full Name (optional)"
                      value={cloudName}
                      onChange={(e) => setCloudName(e.target.value)}
                      className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email address"
                      value={cloudEmail}
                      onChange={(e) => setCloudEmail(e.target.value)}
                      className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="password"
                      required
                      placeholder="Password (minimum 6 characters)"
                      value={cloudPassword}
                      onChange={(e) => setCloudPassword(e.target.value)}
                      className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex items-center justify-end pt-1">
                      <button
                        type="submit"
                        disabled={isAuthenticating}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isAuthenticating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>Create Account</span>
                      </button>
                    </div>
                  </form>
                )}

                {cloudAuthMode === 'reset' && (
                  <form onSubmit={handleCloudPasswordReset} className="space-y-2.5">
                    <p className="text-[11px] text-slate-400">
                      Enter the email address you previously used with Google Sign-In or your account. We will send a link so you can set your password:
                    </p>
                    <input
                      type="email"
                      required
                      placeholder="Enter previous Google sign-in email"
                      value={cloudEmail}
                      onChange={(e) => setCloudEmail(e.target.value)}
                      className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex items-center justify-end pt-1">
                      <button
                        type="submit"
                        disabled={isAuthenticating}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isAuthenticating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                        <span>Send Password Setup Link</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* VIEW: SWITCH ATHLETE */}
          {viewMode === 'switch' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  Registered Athletes ({athletes.length})
                </span>
                <button
                  onClick={() => setViewMode('login')}
                  className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
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
                          ? 'bg-blue-950/40 border-blue-500/60 shadow-md'
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
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{athlete.primaryGoal}</span>
                            <span>•</span>
                            <span>{athlete.experienceLevel}</span>
                            <span>•</span>
                            <span className="text-slate-300 font-mono">{count} workouts saved</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isActive ? (
                          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center shadow-md shadow-blue-900/40">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs transition-colors"
                          >
                            Switch
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <p className="text-slate-500 text-[11px]">
                  All workouts, PRs, and auto-overload weights are saved automatically to the active athlete.
                </p>
                <button
                  onClick={() => setViewMode('register')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-400" />
                  New Athlete
                </button>
              </div>
            </div>
          )}

          {/* VIEW: REGISTER NEW ATHLETE */}
          {viewMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="bg-[#0a0f1d] p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-[11px] mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Create Your Personal Athlete Account
                </div>
                <p className="text-slate-400 text-xs">
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
                  <label className="block text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-[#060b14] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="athlete@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-[#060b14] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">
                    Primary Goal
                  </label>
                  <select
                    value={regGoal}
                    onChange={(e) => setRegGoal(e.target.value as any)}
                    className="w-full bg-[#060b14] border border-slate-700 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="Hybrid Athlete">Hybrid Athlete</option>
                    <option value="Strength & Power">Strength & Power</option>
                    <option value="Hypertrophy">Hypertrophy</option>
                    <option value="Tactical Conditioning & Pursuit">Tactical Conditioning & Pursuit</option>
                    <option value="Endurance & Running">Endurance & Running</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">
                    Experience Level
                  </label>
                  <select
                    value={regLevel}
                    onChange={(e) => setRegLevel(e.target.value as any)}
                    className="w-full bg-[#060b14] border border-slate-700 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="Beginner">Beginner (0-1 yr)</option>
                    <option value="Intermediate">Intermediate (1-3 yrs)</option>
                    <option value="Advanced">Advanced (3-5 yrs)</option>
                    <option value="Elite">Elite (5+ yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">
                    Bodyweight (lbs)
                  </label>
                  <input
                    type="number"
                    value={regWeight}
                    onChange={(e) => setRegWeight(e.target.value)}
                    className="w-full bg-[#060b14] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider flex items-center justify-between">
                  <span>Quick Access PIN (Optional)</span>
                  <span className="text-[10px] text-slate-500">4 digits</span>
                </label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="e.g. 1234"
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value)}
                  className="w-full bg-[#060b14] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono tracking-widest focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('switch')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-950/40 transition-all cursor-pointer flex items-center gap-1.5 border border-blue-400/40"
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
              <div className="bg-[#0a0f1d] p-3.5 rounded-2xl border border-slate-800">
                <div className="text-blue-400 font-bold uppercase tracking-wider text-[11px] mb-1">
                  Athlete Quick Sign-In
                </div>
                <p className="text-slate-400 text-xs">
                  Enter your registered email address or name to load your workout logs and progressive overload history.
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl text-red-300 text-xs font-semibold">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">
                  Athlete Name or Email
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. athlete@example.com or athlete name"
                  value={loginQuery}
                  onChange={(e) => setLoginQuery(e.target.value)}
                  className="w-full bg-[#060b14] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">
                  PIN (If configured)
                </label>
                <input
                  type="password"
                  placeholder="4 digits"
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  className="w-full bg-[#060b14] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono tracking-widest focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('switch')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs shadow-lg shadow-blue-950/40 transition-all cursor-pointer flex items-center gap-1.5 border border-blue-400/40"
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
              <div className="p-4 bg-[#0c1322] rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentAthlete.avatarColor} flex items-center justify-center text-white font-black font-athletic text-lg shadow-md`}>
                    {currentAthlete.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white font-athletic">
                      {currentAthlete.name}
                    </h4>
                    <p className="text-slate-400 text-xs">
                      {currentAthlete.email} • {currentAthlete.primaryGoal}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2 py-1 bg-blue-950/60 border border-blue-700/50 text-blue-300 rounded-lg text-xs font-bold uppercase">
                    {currentAthlete.experienceLevel}
                  </span>
                </div>
              </div>

              {/* TACTICAL READINESS SCORE SUMMARY */}
              <ReadinessScoreCard
                athlete={currentAthlete}
                logs={allLogs}
                onUpdateAthlete={handleUpdateCurrentAthlete}
              />

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Workouts Logged</div>
                  <div className="text-lg font-black text-white font-mono mt-0.5">{totalSessions}</div>
                </div>

                <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Total Volume</div>
                  <div className="text-lg font-black text-blue-400 font-mono mt-0.5">
                    {totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume} <span className="text-xs">lbs</span>
                  </div>
                </div>

                <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Bodyweight</div>
                  <div className="text-lg font-black text-white font-mono mt-0.5">
                    {currentAthlete.weightLbs} <span className="text-xs">lbs</span>
                  </div>
                </div>

                <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Auto-Overload</div>
                  <div className="text-xs font-black text-emerald-400 font-mono mt-1 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Active
                  </div>
                </div>
              </div>

              {/* Physical Ability Assessment & Recommended Track */}
              <div className="p-3.5 bg-[#0a0f1d] border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Award className="w-4 h-4 text-blue-400" />
                    <span>Physical Ability &amp; Recommended Track</span>
                  </div>
                  {currentAthlete.questionnaire && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-500/30 font-bold">
                      {currentAthlete.questionnaire.fitnessTier}
                    </span>
                  )}
                </div>

                {currentAthlete.questionnaire ? (
                  <div className="space-y-1.5">
                    <div className="text-xs text-slate-200">
                      Recommended Track: <span className="font-bold text-white font-athletic uppercase">{currentAthlete.questionnaire.recommendedProgramTitle}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {currentAthlete.questionnaire.recommendationReason}
                    </p>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenQuestionnaire?.();
                        }}
                        className="px-3 py-1.5 rounded-xl border border-blue-500/40 bg-blue-950/80 hover:bg-blue-900 text-blue-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                        <span>Retake Ability Questionnaire</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-400">
                      No initial assessment recorded yet. Complete the 2-minute questionnaire to diagnose your current fitness tier and receive a recommended beginning program.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenQuestionnaire?.();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-athletic uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-900/40"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Take Ability Assessment</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Log History Management / Fresh Start Options */}
              <div className="p-3.5 bg-[#0a0f1d] border border-slate-800 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Trash2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Workout Log Management</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {athleteLogs.length} saved sessions
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Start fresh at any time by clearing this athlete's workout log or wiping all historical logs in the app.
                </p>

                {confirmClearAction === 'none' ? (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setConfirmClearAction('current')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-blue-950/40 text-slate-300 hover:text-blue-300 border border-slate-700 hover:border-blue-700/50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Clear {currentAthlete.name.split(' ')[0]}'s Logs
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClearAction('all')}
                      className="px-3 py-1.5 bg-blue-950/30 hover:bg-blue-900/60 text-blue-300 border border-blue-700/50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Clear All Athletes (Fresh Start)
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-950/30 border border-blue-700/50 rounded-xl space-y-2">
                    <div className="flex items-start gap-2 text-xs text-blue-200">
                      <AlertTriangle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
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
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExecuteAthleteClear(confirmClearAction)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer border border-blue-400/40"
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
                  className="w-full sm:w-auto px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  Export Athlete Logbook (JSON)
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('switch')}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer text-center border border-blue-400/40 shadow-md shadow-blue-950/30"
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
