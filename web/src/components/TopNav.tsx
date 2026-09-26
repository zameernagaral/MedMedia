import React, { useState } from 'react';
import { 
  Plus, 
  Bell, 
  MessageSquare, 
  ShieldCheck, 
  Stethoscope, 
  GraduationCap, 
  ChevronDown, 
  Check, 
  Sun, 
  Moon,
  ShieldAlert,
  UserCheck,
  Trash2
} from 'lucide-react';
import { UserProfile } from '../types';

interface TopNavProps {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  onCreatePost: () => void;
  onOpenNotifications: () => void;
  onOpenMessages: () => void;
  onOpenAuth: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  isManagerMode?: boolean;
  onToggleManagerMode?: () => void;
  onClearAllTestData?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentUser,
  availableUsers,
  onSwitchUser,
  onCreatePost,
  onOpenNotifications,
  onOpenMessages,
  onOpenAuth,
  isDarkMode,
  onToggleDarkMode,
  isManagerMode = false,
  onToggleManagerMode,
  onClearAllTestData
}) => {
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [unreadMessages, setUnreadMessages] = useState(2);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left: Create Button & Medmedia Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onCreatePost}
            title="Create Post / Clinical Case"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 transition-all transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2">
            {/* Placeholder Container for Logo */}
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 overflow-hidden shadow-sm">
              <span className="text-[10px] font-bold text-center leading-tight">Your<br/>Logo</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                Medmedia
                {/* Rule: Blue tick icon only, no "Verified" text */}
                <ShieldCheck className="w-4 h-4 text-sky-500 fill-sky-500/20" />
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline -mt-1 font-medium">
                Healthcare & Student Professional Network
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Icons: Notification, Message, User Profile Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* Manager / Admin Mode Indicator Badge */}
          {isManagerMode && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] font-bold animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Manager Mode Active</span>
            </div>
          )}

          {/* Notifications Button */}
          <button
            onClick={() => {
              setUnreadNotifications(0);
              onOpenNotifications();
            }}
            className="relative p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Messages Button */}
          <button
            onClick={() => {
              setUnreadMessages(0);
              onOpenMessages();
            }}
            className="relative p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
            title="Messages"
          >
            <MessageSquare className="w-5 h-5" />
            {unreadMessages > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-sky-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

        </div>

        </div>

      </div>
    </header>
  );
};
