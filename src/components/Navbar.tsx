import React from 'react';
import { 
  Dumbbell, Flame, Calculator, History, TrendingUp, Mail, 
  Instagram, ExternalLink, Zap, User, UserCheck
} from 'lucide-react';
import { OverlandLogo } from './BrandingLogos';
import { AthleteProfile } from '../utils/athleteAuth';
import { PWAInstallButton } from './PWAInstallButton';

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
  onStartActiveWorkout,
  currentAthlete,
  onOpenAthleteModal,
}) => {
  const tabs = [
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'warmups', label: 'Warm-Ups', icon: Flame },
    { id: 'calculator', label: 'Calculators', icon: Calculator },
    { id: 'logs', label: 'Workout Logs', icon: History },
    { id: 'graphs', label: 'Progress', icon: TrendingUp },
    { id: 'contact', label: 'Contact Me', icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#10151a]/95 backdrop-blur-md border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Brand & Actions Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-2.5 sm:py-3 border-b border-zinc-800/80 gap-3">
          <div className="flex items-center justify-between gap-3 shrink-0">
            <OverlandLogo size="md" />
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-start md:justify-end">
            {/* Store & Direct Install Button */}
            <PWAInstallButton variant="nav" />

            {/* Athlete Login & Profile Switcher */}
            <button
              type="button"
              onClick={onOpenAthleteModal}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#161e27] hover:bg-[#202c3a] text-white border-2 border-amber-500/60 hover:border-amber-400 rounded-xl text-xs font-black transition-all shadow-md shadow-black/40 cursor-pointer active:scale-95 shrink-0"
              title="Switch athlete profile or sign in to track personal progress"
            >
              <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${currentAthlete?.avatarColor || 'from-amber-500 to-amber-300'} flex items-center justify-center text-[10px] font-black text-black shrink-0 ring-1 ring-amber-300`}>
                {currentAthlete ? currentAthlete.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="font-black text-white tracking-wide whitespace-nowrap">
                {currentAthlete ? currentAthlete.name : 'Athlete Login'}
              </span>
              <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
            </button>

            {/* Bucked Up Supplement Partner Link */}
            <a
              href="https://bckd.co/87uJC2e"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161e27] hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border-2 border-amber-500/60 hover:border-amber-400 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer shrink-0"
              title="Official Supplement Partner: Bucked Up"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              <span className="font-black tracking-wide whitespace-nowrap">Bucked Up</span>
              <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-mono font-black shrink-0">
                Supps
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </a>

            {/* Instagram: AJ Risner Link */}
            <a
              href="https://www.instagram.com/ajrisner"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161e27] hover:bg-[#202c3a] text-white hover:text-amber-300 border-2 border-zinc-700 hover:border-amber-400 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer shrink-0"
              title="Follow Instagram: AJ Risner"
            >
              <Instagram className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-bold whitespace-nowrap">Instagram:</span>
              <span className="font-black text-white whitespace-nowrap">AJ Risner</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            </a>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="py-2.5 sm:py-3" aria-label="Main Navigation">
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap sm:items-center sm:justify-center gap-1.5 sm:gap-2.5 md:gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id as TabType)}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 md:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer select-none ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black shadow-xl shadow-amber-500/30 border-2 border-amber-300 ring-2 ring-amber-400/20 scale-[1.02]'
                      : 'bg-[#161e27] hover:bg-[#202c3a] text-zinc-100 hover:text-white border-2 border-zinc-700 hover:border-amber-400 shadow-md'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-black stroke-[2.5]' : 'text-amber-400 stroke-[2.2]'}`} />
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
