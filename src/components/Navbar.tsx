import React from 'react';
import { 
  Dumbbell, Flame, Calculator, History, TrendingUp, Mail, 
  Instagram, ExternalLink, Zap, UserCheck, Cloud, Footprints
} from 'lucide-react';
import { OverlandCompanyEmblem } from './BrandingLogos';
import { AthleteProfile } from '../utils/athleteAuth';
import { PWAInstallButton } from './PWAInstallButton';
import { useFirebase } from '../context/FirebaseContext';

export type TabType = 'workouts' | 'warmups' | 'calculator' | 'logs' | 'graphs' | 'ruck' | 'contact';

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
  const { user, isCloudConnected } = useFirebase();

  const tabs = [
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'warmups', label: 'Warm-Ups', icon: Flame },
    { id: 'calculator', label: 'Calculators', icon: Calculator },
    { id: 'logs', label: 'Workout Logs', icon: History },
    { id: 'graphs', label: 'Progress', icon: TrendingUp },
    { id: 'ruck', label: 'Ruck Progress', icon: Footprints },
    { id: 'contact', label: 'Contact Me', icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#10151a]/98 backdrop-blur-md border-b border-amber-500/20 shadow-md">
      <div className="max-w-7xl mx-auto">
        {/* Tier 1: Ultra-Compact Brand & Partner Links Bar (Single Line, Never Wraps) */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 gap-2 overflow-x-auto scrollbar-none">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2 shrink-0 select-none">
            <OverlandCompanyEmblem size="xs" className="h-7 w-auto drop-shadow-sm" />
            <div className="flex items-baseline gap-1">
              <span className="font-athletic font-black uppercase tracking-wider text-white text-sm sm:text-base leading-none">
                Overland
              </span>
              <span className="font-athletic font-black uppercase tracking-wider text-amber-400 text-sm sm:text-base leading-none">
                Athletics
              </span>
            </div>
            <span className="hidden xl:inline text-[10px] text-zinc-400 font-mono pl-1 border-l border-zinc-700">
              Run • Lift • Ruck
            </span>
          </div>

          {/* Top Quick Links & Athlete Controls (Compact Micro-Pills) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Bucked Up Partner Pill */}
            <a
              href="https://bckd.co/87uJC2e"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-[#161e27] hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/50 hover:border-amber-400 rounded-lg text-[11px] font-black transition-all shadow-sm shrink-0 cursor-pointer"
              title="Official Supplement Partner: Bucked Up"
            >
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
              <span className="hidden sm:inline font-bold">Bucked Up</span>
              <span className="text-[9px] bg-amber-400 text-black px-1 rounded font-mono font-black">
                Supps
              </span>
              <ExternalLink className="w-2.5 h-2.5 text-amber-400/80 shrink-0" />
            </a>

            {/* Instagram: AJ Risner */}
            <a
              href="https://www.instagram.com/ajrisner"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-[#161e27] hover:bg-[#202c3a] text-zinc-200 hover:text-amber-300 border border-zinc-700 hover:border-amber-400 rounded-lg text-[11px] font-bold transition-all shadow-sm shrink-0 cursor-pointer"
              title="Follow Instagram: AJ Risner"
            >
              <Instagram className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="hidden md:inline">@ajrisner</span>
              <ExternalLink className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
            </a>

            {/* PWA Install Button */}
            <PWAInstallButton variant="pill" className="text-[10px] py-1 px-2 hidden xs:inline-flex" />

            {/* Cloud Sync Status */}
            <button
              type="button"
              onClick={onOpenAthleteModal}
              className="flex items-center gap-1 px-2 py-1 bg-[#161e27] hover:bg-[#202c3a] border border-zinc-700/80 hover:border-amber-400/60 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0"
              title={user ? `Firebase Synced: ${user.email}` : isCloudConnected ? 'Firestore Connected (Guest)' : 'Connecting to Firestore...'}
            >
              <span className="relative flex h-2 w-2">
                {user && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${user ? 'bg-emerald-400' : isCloudConnected ? 'bg-amber-400' : 'bg-zinc-500'}`} />
              </span>
              <Cloud className="w-3 h-3 text-zinc-300" />
            </button>

            {/* Athlete Profile Chip */}
            <button
              type="button"
              onClick={onOpenAthleteModal}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#161e27] hover:bg-[#202c3a] text-white border border-amber-500/60 hover:border-amber-400 rounded-lg text-[11px] font-black transition-all shadow-sm cursor-pointer active:scale-95 shrink-0"
              title="Switch athlete profile or sign in"
            >
              <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${currentAthlete?.avatarColor || 'from-amber-500 to-amber-300'} flex items-center justify-center text-[9px] font-black text-black shrink-0`}>
                {currentAthlete ? currentAthlete.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="font-bold text-white whitespace-nowrap truncate max-w-[80px] sm:max-w-none">
                {currentAthlete ? currentAthlete.name : 'Sign In'}
              </span>
              <UserCheck className="w-3 h-3 text-amber-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* Tier 2: Streamlined Single-Line Tab Rail (Horizontal Scroll, Zero Multi-Line Stacking) */}
        <nav 
          className="border-t border-zinc-800/80 bg-[#0d1217]/95 px-2 sm:px-4 py-1.5 overflow-x-auto scrollbar-none"
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
                  className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer select-none shrink-0 ${
                    isActive
                      ? 'bg-amber-400 text-black shadow-md shadow-amber-950/40 border border-amber-300 ring-1 ring-amber-400/30'
                      : 'bg-[#141a22] hover:bg-[#1c2430] text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-black stroke-[2.5]' : 'text-amber-400 stroke-[2]'}`} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
};
