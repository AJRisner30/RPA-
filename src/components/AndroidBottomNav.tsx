import React, { useState } from 'react';
import { 
  Dumbbell, 
  ShieldCheck, 
  Flame, 
  Calculator, 
  Menu, 
  X, 
  History, 
  TrendingUp, 
  Mail, 
  UserCheck, 
  Smartphone, 
  LogOut, 
  Zap,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { TabType } from './Navbar';
import { AthleteProfile } from '../types';
import { useFirebase } from '../context/FirebaseContext';
import { useUserTier } from '../hooks/useUserTier';
import { useAndroidHaptics } from '../hooks/useAndroidHaptics';
import { PatrolReadyCompanyEmblem } from './BrandingLogos';
import { isCoachSession } from '../utils/athleteAuth';

interface AndroidBottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  currentAthlete?: AthleteProfile;
  onOpenAthleteModal: () => void;
  onOpenPricingModal?: () => void;
  onOpenAndroidAppModal?: () => void;
  readinessScore?: number;
  hasOfficerProgram?: boolean;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  onSelectTab,
  currentAthlete,
  onOpenAthleteModal,
  onOpenPricingModal,
  onOpenAndroidAppModal,
  readinessScore,
  hasOfficerProgram = false,
}) => {
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const { user, signOutUser } = useFirebase();
  const { tier } = useUserTier();
  const { tap, doubleTap } = useAndroidHaptics();

  const handleTabClick = (tabId: TabType) => {
    tap();
    onSelectTab(tabId);
    setIsMoreSheetOpen(false);
  };

  const openSheet = () => {
    doubleTap();
    setIsMoreSheetOpen(true);
  };

  const closeSheet = () => {
    tap();
    setIsMoreSheetOpen(false);
  };

  const isMoreTabActive = activeTab === 'logs' || activeTab === 'graphs' || activeTab === 'contact';

  const isCoach = Boolean(
    (user?.email && (
      user.email.toLowerCase() === 'risneraryan@gmail.com' ||
      user.email.toLowerCase() === 'risnerathletics@gmail.com'
    )) ||
    isCoachSession()
  );

  const canViewOfficerPortal = isCoach || hasOfficerProgram;

  return (
    <>
      {/* Android Native Fixed Bottom Navigation Bar (Mobile Viewports Only) */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070c14]/98 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.8)] pb-[max(0.6rem,env(safe-area-inset-bottom))]"
        aria-label="Android Bottom Navigation"
      >
        <div className="grid grid-cols-5 items-center justify-around px-1 py-1.5 max-w-md mx-auto">
          {/* 1. Workouts */}
          <button
            type="button"
            onClick={() => handleTabClick('workouts')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer select-none relative ${
              activeTab === 'workouts'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`flex items-center justify-center w-10 h-7 rounded-full transition-all ${
              activeTab === 'workouts' 
                ? 'bg-blue-600 shadow-md shadow-blue-600/40 text-white scale-105' 
                : 'text-slate-400'
            }`}>
              <Dumbbell className="w-4 h-4 stroke-[2.3]" />
            </div>
            <span className={`text-[10px] font-athletic font-bold uppercase tracking-wider mt-0.5 ${
              activeTab === 'workouts' ? 'text-blue-400 font-black' : 'text-slate-400'
            }`}>
              Workouts
            </span>
          </button>

          {/* 2. Officer Portal (Only for Coach Aryan or Officer with assigned protocol) OR Warm-Ups */}
          {canViewOfficerPortal ? (
            <button
              type="button"
              onClick={() => handleTabClick('officer_portal')}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer select-none relative ${
                activeTab === 'officer_portal'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-7 rounded-full transition-all relative ${
                activeTab === 'officer_portal' 
                  ? 'bg-amber-500 shadow-md shadow-amber-500/40 text-black scale-105' 
                  : 'text-amber-400/90 bg-amber-500/10'
              }`}>
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
              </div>
              <span className={`text-[10px] font-athletic font-bold uppercase tracking-wider mt-0.5 ${
                activeTab === 'officer_portal' ? 'text-amber-400 font-black' : 'text-amber-300/80'
              }`}>
                {isCoach ? 'Portal' : 'Protocol'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleTabClick('warmups')}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer select-none relative ${
                activeTab === 'warmups'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-7 rounded-full transition-all ${
                activeTab === 'warmups' 
                  ? 'bg-orange-600 shadow-md shadow-orange-600/40 text-white scale-105' 
                  : 'text-slate-400'
              }`}>
                <Flame className="w-4 h-4 stroke-[2.3]" />
              </div>
              <span className={`text-[10px] font-athletic font-bold uppercase tracking-wider mt-0.5 ${
                activeTab === 'warmups' ? 'text-orange-400 font-black' : 'text-slate-400'
              }`}>
                Warm-Ups
              </span>
            </button>
          )}

          {/* 3. Warm-Ups (if portal shown) OR Calculators */}
          {canViewOfficerPortal ? (
            <button
              type="button"
              onClick={() => handleTabClick('warmups')}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer select-none relative ${
                activeTab === 'warmups'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-7 rounded-full transition-all ${
                activeTab === 'warmups' 
                  ? 'bg-orange-600 shadow-md shadow-orange-600/40 text-white scale-105' 
                  : 'text-slate-400'
              }`}>
                <Flame className="w-4 h-4 stroke-[2.3]" />
              </div>
              <span className={`text-[10px] font-athletic font-bold uppercase tracking-wider mt-0.5 ${
                activeTab === 'warmups' ? 'text-orange-400 font-black' : 'text-slate-400'
              }`}>
                Warm-Ups
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleTabClick('calculator')}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer select-none relative ${
                activeTab === 'calculator'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-7 rounded-full transition-all ${
                activeTab === 'calculator' 
                  ? 'bg-blue-600 shadow-md shadow-blue-600/40 text-white scale-105' 
                  : 'text-slate-400'
              }`}>
                <Calculator className="w-4 h-4 stroke-[2.3]" />
              </div>
              <span className={`text-[10px] font-athletic font-bold uppercase tracking-wider mt-0.5 ${
                activeTab === 'calculator' ? 'text-blue-400 font-black' : 'text-slate-400'
              }`}>
                Calculators
              </span>
            </button>
          )}

          {/* 4. Calculators (if portal shown) OR Workout Logs */}
          {canViewOfficerPortal ? (
            <button
              type="button"
              onClick={() => handleTabClick('calculator')}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer select-none relative ${
                activeTab === 'calculator'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-7 rounded-full transition-all ${
                activeTab === 'calculator' 
                  ? 'bg-blue-600 shadow-md shadow-blue-600/40 text-white scale-105' 
                  : 'text-slate-400'
              }`}>
                <Calculator className="w-4 h-4 stroke-[2.3]" />
              </div>
              <span className={`text-[10px] font-athletic font-bold uppercase tracking-wider mt-0.5 ${
                activeTab === 'calculator' ? 'text-blue-400 font-black' : 'text-slate-400'
              }`}>
                Calculators
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleTabClick('logs')}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer select-none relative ${
                activeTab === 'logs'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-7 rounded-full transition-all ${
                activeTab === 'logs' 
                  ? 'bg-blue-600 shadow-md shadow-blue-600/40 text-white scale-105' 
                  : 'text-slate-400'
              }`}>
                <History className="w-4 h-4 stroke-[2.3]" />
              </div>
              <span className={`text-[10px] font-athletic font-bold uppercase tracking-wider mt-0.5 ${
                activeTab === 'logs' ? 'text-blue-400 font-black' : 'text-slate-400'
              }`}>
                Logs
              </span>
            </button>
          )}

          {/* 5. More / Quick Actions Drawer */}
          <button
            type="button"
            onClick={openSheet}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer select-none relative ${
              isMoreSheetOpen || isMoreTabActive
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`flex items-center justify-center w-10 h-7 rounded-full transition-all relative ${
              isMoreSheetOpen || isMoreTabActive
                ? 'bg-slate-700 shadow-md text-white scale-105' 
                : 'text-slate-400'
            }`}>
              <Menu className="w-4 h-4 stroke-[2.3]" />
            </div>
            <span className={`text-[10px] font-athletic font-bold uppercase tracking-wider mt-0.5 ${
              isMoreSheetOpen || isMoreTabActive ? 'text-blue-400 font-black' : 'text-slate-400'
            }`}>
              More
            </span>
          </button>
        </div>
      </nav>

      {/* Android Native Material 3 Bottom Sheet (Opened by 'More') */}
      {isMoreSheetOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col justify-end animate-fadeIn"
          onClick={closeSheet}
        >
          <div 
            className="w-full bg-[#0b1320] border-t border-blue-500/30 rounded-t-3xl shadow-2xl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] animate-slideUp overflow-hidden max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Android Drag Handle */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4" />

            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <PatrolReadyCompanyEmblem size="xs" />
                <div>
                  <h3 className="text-sm font-athletic font-black uppercase text-white tracking-wide">
                    Tactical Command Menu
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Patrol Ready Performance • Android Edition
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeSheet}
                className="p-1.5 rounded-full bg-slate-800/80 text-slate-400 hover:text-white"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions List */}
            <div className="py-3 space-y-2 overflow-y-auto">
              {/* Workout History */}
              <button
                type="button"
                onClick={() => handleTabClick('logs')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  activeTab === 'logs'
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-[#111c2e]/60 hover:bg-[#111c2e] border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-white">Workout Logs &amp; History</div>
                    <div className="text-[11px] text-slate-400">Review past sessions &amp; load volume</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              {/* Progress Graphs */}
              <button
                type="button"
                onClick={() => handleTabClick('graphs')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  activeTab === 'graphs'
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-[#111c2e]/60 hover:bg-[#111c2e] border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-white">Progress Analytics</div>
                    <div className="text-[11px] text-slate-400">Strength gains, pursuit pace &amp; readiness</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              {/* Contact Me */}
              <button
                type="button"
                onClick={() => handleTabClick('contact')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  activeTab === 'contact'
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-[#111c2e]/60 hover:bg-[#111c2e] border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-white">Contact &amp; Coaching</div>
                    <div className="text-[11px] text-slate-400">Message coach &amp; agency inquiries</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              {/* Android App Center */}
              {onOpenAndroidAppModal && (
                <button
                  type="button"
                  onClick={() => {
                    tap();
                    closeSheet();
                    onOpenAndroidAppModal();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 to-slate-900 text-left transition-all hover:border-emerald-400"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                        Android App Hub
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/30 text-emerald-200 font-mono">APK / PWA</span>
                      </div>
                      <div className="text-[11px] text-slate-400">Install native app, wake-lock &amp; offline tools</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                </button>
              )}

              {/* Athlete Profile & Subscription */}
              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    tap();
                    closeSheet();
                    onOpenAthleteModal();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white text-xs font-bold"
                >
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <span>Officer Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    tap();
                    closeSheet();
                    onOpenPricingModal?.();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white text-xs font-bold"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="uppercase">{tier} Tier</span>
                </button>
              </div>

              {/* Sign Out if Authenticated */}
              {user && (
                <button
                  type="button"
                  onClick={() => {
                    tap();
                    closeSheet();
                    signOutUser();
                  }}
                  className="w-full mt-2 flex items-center justify-center gap-2 p-2 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-bold transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out ({user.email})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
