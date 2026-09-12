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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-lg md:max-w-md md:mx-auto md:bottom-3 md:rounded-3xl md:border">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
                isActive ? 'text-sky-600 scale-105' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.useAvatar ? (
                <div className={`w-6 h-6 rounded-full overflow-hidden transition-all ${
                  isActive ? 'ring-2 ring-sky-600 ring-offset-1' : 'opacity-80'
                }`}>
                  <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="relative">
                  <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  {tab.isSpecial && (
                    <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 animate-ping"></span>
                  )}
                </div>
              )}
              <span className={`text-[10px] mt-1 font-medium tracking-tight ${
                isActive ? 'font-bold text-sky-600' : 'text-slate-500'
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
