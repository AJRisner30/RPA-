import React from 'react';
import { 
  Dumbbell, Flame, Calculator, History, TrendingUp, Mail, 
  Instagram, ExternalLink, Zap, UserCheck, Cloud, LogOut
} from 'lucide-react';
import { PatrolReadyCompanyEmblem } from './BrandingLogos';
import { AthleteProfile } from '../utils/athleteAuth';
import { PWAInstallButton } from './PWAInstallButton';
import { useFirebase } from '../context/FirebaseContext';

export type TabType = 'workouts' | 'warmups' | 'calculator' | 'logs' | 'graphs' | 'contact';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onStartActiveWorkout: () => void;
  currentAthlete?: AthleteProfile;
  onOpenAthleteModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  currentAthlete,
  onOpenAthleteModal,
}) => {
  const { user, isCloudConnected, authError, signOutUser } = useFirebase();

  const tabs = [
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'warmups', label: 'Warm-Ups', icon: Flame },
    { id: 'calculator', label: 'Calculators', icon: Calculator },
    { id: 'logs', label: 'Workout Logs', icon: History },
    { id: 'graphs', label: 'Progress', icon: TrendingUp },
    { id: 'contact', label: 'Contact Me', icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#0b1320]/98 backdrop-blur-md border-b border-blue-500/30 shadow-lg">
      <div className="max-w-7xl mx-auto">
        {/* Tier 1: Ultra-Compact Brand & Partner Links Bar (Single Line, Never Wraps) */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 gap-2 overflow-x-auto scrollbar-none">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2 shrink-0 select-none">
            <PatrolReadyCompanyEmblem size="xs" className="h-8 w-auto drop-shadow-sm" />
            <div className="flex items-baseline gap-1">
              <span className="font-athletic font-black uppercase tracking-wider text-white text-sm sm:text-base leading-none">
                Patrol Ready
              </span>
              <span className="font-athletic font-black uppercase tracking-wider text-blue-400 text-sm sm:text-base leading-none">
                Performance
              </span>
            </div>
            <span className="hidden xl:inline text-[10px] text-blue-300/80 font-mono pl-1.5 border-l border-slate-700">
              Tactical fitness for the Frontline.
            </span>
          </div>

          {/* Top Quick Links & Athlete Controls (Compact Micro-Pills) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Bucked Up Partner Pill */}
            <a
              href="https://bckd.co/87uJC2e"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-[#0f172a] hover:bg-blue-900/30 text-blue-200 hover:text-white border border-blue-500/40 hover:border-blue-400 rounded-lg text-[11px] font-black transition-all shadow-sm shrink-0 cursor-pointer"
              title="Official Supplement Partner: Bucked Up"
            >
              <Zap className="w-3 h-3 text-blue-400 fill-blue-400 shrink-0" />
              <span className="hidden sm:inline font-bold">Bucked Up</span>
              <span className="text-[9px] bg-blue-600 text-white px-1 rounded font-mono font-black">
                Supps
              </span>
              <ExternalLink className="w-2.5 h-2.5 text-blue-400/80 shrink-0" />
            </a>

            {/* Instagram: AJ Risner */}
            <a
              href="https://www.instagram.com/ajrisner"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-[#0f172a] hover:bg-blue-900/30 text-slate-200 hover:text-white border border-slate-700 hover:border-blue-400 rounded-lg text-[11px] font-bold transition-all shadow-sm shrink-0 cursor-pointer"
              title="Follow Instagram: AJ Risner"
            >
              <Instagram className="w-3 h-3 text-blue-400 shrink-0" />
              <span className="hidden md:inline">@ajrisner</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400 shrink-0" />
            </a>

            {/* PWA Install Button */}
            <PWAInstallButton variant="pill" className="text-[10px] py-1 px-2 hidden xs:inline-flex" />

            {/* Cloud Sync Status */}
            <button
              type="button"
              onClick={onOpenAthleteModal}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                authError
                  ? 'bg-red-950/40 border border-red-500/50 hover:border-red-400 text-red-300'
                  : 'bg-[#0f172a] hover:bg-[#162238] border border-slate-700/80 hover:border-blue-400/60'
              }`}
              title={
                authError
                  ? `Google Login Notice: Click to view instructions (${authError.code})`
                  : user
                  ? `Firebase Synced: ${user.email}`
                  : isCloudConnected
                  ? 'Firestore Connected (Guest)'
                  : 'Connecting to Firestore...'
              }
            >
              <span className="relative flex h-2 w-2">
                {user && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                {authError && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    authError
                      ? 'bg-red-400'
                      : user
                      ? 'bg-emerald-400'
                      : isCloudConnected
                      ? 'bg-blue-400'
                      : 'bg-slate-500'
                  }`}
                />
              </span>
              <Cloud className={`w-3 h-3 ${authError ? 'text-red-400' : 'text-slate-300'}`} />
            </button>

            {/* Athlete Profile Chip */}
            <button
              type="button"
              onClick={onOpenAthleteModal}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0f172a] hover:bg-blue-900/40 text-white border border-blue-500/50 hover:border-blue-400 rounded-lg text-[11px] font-black transition-all shadow-sm cursor-pointer active:scale-95 shrink-0"
              title="View athlete profile and cloud sync details"
            >
              <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${currentAthlete?.avatarColor || 'from-blue-600 to-blue-400'} flex items-center justify-center text-[9px] font-black text-white shrink-0`}>
                {currentAthlete ? currentAthlete.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <span className="font-bold text-white whitespace-nowrap truncate max-w-[80px] sm:max-w-none">
                {currentAthlete ? currentAthlete.name : 'Officer'}
              </span>
              <UserCheck className="w-3 h-3 text-blue-400 shrink-0" />
            </button>

            {/* Quick Sign Out Button */}
            {user && (
              <button
                type="button"
                onClick={signOutUser}
                className="flex items-center gap-1 px-2 py-1 bg-[#0f172a] hover:bg-red-950/50 text-slate-400 hover:text-red-300 border border-slate-700/80 hover:border-red-500/50 rounded-lg text-[11px] font-bold transition-all shadow-sm cursor-pointer shrink-0"
                title={`Signed in as ${user.email}. Click to sign out.`}
              >
                <LogOut className="w-3 h-3 text-red-400 shrink-0" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Tier 2: Streamlined Single-Line Tab Rail (Horizontal Scroll, Zero Multi-Line Stacking) */}
        <nav 
          className="border-t border-slate-800/80 bg-[#070c14]/95 px-2 sm:px-4 py-1.5 overflow-x-auto scrollbar-none"
          aria-label="Main Navigation"
        >
          <div className="flex items-center gap-1 sm:gap-1.5 sm:justify-center min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id as TabType)}
                  className={`nav-tab-interactive group relative flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider whitespace-nowrap cursor-pointer select-none shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-950/60 border border-blue-400 ring-1 ring-blue-400/40'
                      : 'bg-[#0f172a] hover:bg-[#162238] text-slate-300 hover:text-white border border-slate-800 hover:border-blue-500/40'
                  }`}
                >
                  <Icon 
                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ease-out ${
                      isActive 
                        ? 'text-white stroke-[2.5] scale-110' 
                        : 'text-blue-400 stroke-[2] group-hover:scale-110'
                    }`} 
                  />
                  <span className="whitespace-nowrap transition-colors duration-200">{tab.label}</span>
                  {isActive && (
                    <span 
                      className="animate-tab-indicator absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-white/80 rounded-full pointer-events-none" 
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
};
