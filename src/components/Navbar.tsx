import React from 'react';
import { 
  Dumbbell, Flame, Calculator, History, TrendingUp, Award 
} from 'lucide-react';
import { RisnerLogo, IssaCertifiedBadge } from './BrandingLogos';

export type TabType = 'workouts' | 'warmups' | 'calculator' | 'logs' | 'graphs';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onStartActiveWorkout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onStartActiveWorkout,
}) => {
  const tabs = [
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'warmups', label: 'Warm-Ups', icon: Flame },
    { id: 'calculator', label: '1RM & Reps', icon: Calculator },
    { id: 'logs', label: 'Workout Logs', icon: History },
    { id: 'graphs', label: 'Progress', icon: TrendingUp },
  ];

  return (
    <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Brand & Actions Row */}
        <div className="flex items-center justify-between h-20 border-b border-zinc-900">
          <div className="flex items-center gap-4">
            <RisnerLogo size="md" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* ISSA Certified Badge */}
            <IssaCertifiedBadge />
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-start sm:justify-center gap-1 sm:gap-2 overflow-x-auto py-2.5 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/90'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
