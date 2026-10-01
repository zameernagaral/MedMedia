import React from 'react';
import { 
  Plus, 
  Bell, 
  MessageSquare, 
  ShieldCheck, 
  ChevronDown, 
  ShieldAlert,
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
  unreadNotificationsCount?: number;
  unreadMessagesCount?: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentUser,
  availableUsers,
  onSwitchUser,
  onCreatePost,
  onOpenNotifications,
  onOpenMessages,
  onOpenAuth,
  unreadNotificationsCount = 0,
  unreadMessagesCount = 0
}) => {

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
            {/* MedMedia Official Logo */}
            <img
              src="/medmedia-logo.png"
              alt="MedMedia Logo"
              className="h-10 w-auto object-contain drop-shadow-sm"
              style={{ maxWidth: '140px' }}
              onError={(e) => {
                // Fallback if image not found
                const t = e.currentTarget as HTMLImageElement;
                t.style.display = 'none';
                const next = t.nextElementSibling as HTMLElement;
                if (next) next.style.display = 'flex';
              }}
            />
            {/* Fallback text logo (hidden when image loads) */}
            <div className="hidden items-center gap-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                M
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                MedMedia
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Icons: Notification, Message only — Profile is in bottom nav */}
        <div className="flex items-center gap-1.5 sm:gap-3">

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Messages Button */}
          <button
            onClick={() => {
              onOpenMessages();
            }}
            className="relative p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
            title="Messages"
          >
            <MessageSquare className="w-5 h-5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-sky-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

        </div>

      </div>
    </header>
  );
};
