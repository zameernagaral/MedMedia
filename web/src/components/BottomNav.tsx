import React from 'react';
import { Home, Film, Search, Briefcase, User } from 'lucide-react';

export type TabType = 'home' | 'medclips' | 'search' | 'opportunities' | 'profile';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  userAvatar: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  userAvatar
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'medclips' as TabType, label: 'Medclips', icon: Film, isSpecial: true },
    { id: 'search' as TabType, label: 'Search', icon: Search },
    { id: 'opportunities' as TabType, label: 'Opportunities', icon: Briefcase },
    { id: 'profile' as TabType, label: 'Profile', icon: User, useAvatar: true }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-lg md:max-w-md md:mx-auto md:bottom-3 md:rounded-3xl md:border md:border-slate-200 md:dark:border-slate-800 transition-colors duration-200">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 cursor-pointer ${
                isActive ? 'text-sky-500 scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.useAvatar ? (
                <div className={`w-6 h-6 rounded-full overflow-hidden transition-all ${
                  isActive ? 'ring-2 ring-sky-500 ring-offset-1 dark:ring-offset-slate-900' : 'opacity-80'
                }`}>
                  <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="relative">
                  <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  {tab.isSpecial && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 shadow-sm shadow-rose-500/60" title="New reels from followed creators"></span>
                  )}
                </div>
              )}
              <span className={`text-[10px] mt-1 font-medium tracking-tight ${
                isActive ? 'font-bold text-sky-500' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
