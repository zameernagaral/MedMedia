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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 via-teal-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
              M
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

          {/* User Persona Switcher & Profile Quick View */}
          <div className="relative">
            <button
              onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition cursor-pointer"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-sky-500/30"
              />
              <div className="hidden md:flex flex-col text-left pr-1">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight flex items-center gap-1">
                  {currentUser.role === 'DOCTOR' ? 'Dr.' : ''} {currentUser.fullName.split(' ')[currentUser.role === 'DOCTOR' ? 1 : 0]}
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-600 inline" />
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {currentUser.role === 'DOCTOR'
                    ? (currentUser.doctorDetails?.academicTitle || currentUser.doctorDetails?.specialization || 'Physician Specialist')
                    : currentUser.studentDetails?.discipline.replace('_', ' ')}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 mr-1" />
            </button>

            {/* Dropdown for role switching & verification testing */}
            {showSwitchDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                
                {/* Manager / Admin Toggle for Testing */}
                {onToggleManagerMode && (
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Manager (Admin) Mode</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Moderate communities & jobs</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleManagerMode()}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isManagerMode ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isManagerMode ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                )}

                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Active Profile Persona</p>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                    Switch between verified Doctor, Professor, and Student accounts.
                  </p>
                </div>

                <div className="py-1 max-h-60 overflow-y-auto no-scrollbar">
                  {availableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSwitchUser(user);
                        setShowSwitchDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition cursor-pointer ${
                        user.id === currentUser.id ? 'bg-sky-50/60 dark:bg-sky-950/40' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            {user.role === 'DOCTOR' ? <Stethoscope className="w-3.5 h-3.5 text-sky-600" /> : <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />}
                            {user.fullName}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {user.role === 'DOCTOR' ? (user.doctorDetails?.academicTitle || user.doctorDetails?.specialization) : user.studentDetails?.discipline.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      {user.id === currentUser.id && <Check className="w-4 h-4 text-sky-600 font-bold" />}
                    </button>
                  ))}
                </div>

                {onClearAllTestData && (
                  <div className="border-t border-slate-100 dark:border-slate-800 px-3 py-1">
                    <button
                      onClick={() => {
                        setShowSwitchDropdown(false);
                        onClearAllTestData();
                      }}
                      className="w-full text-left py-2 px-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      title="Wipe all demo posts & stories to start completely clean"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Wipe Demo Data (Clean Slate)</span>
                    </button>
                  </div>
                )}

                <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1 px-3">
                  <button
                    onClick={() => {
                      setShowSwitchDropdown(false);
                      onOpenAuth();
                    }}
                    className="w-full text-center py-2 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                  >
                    Switch Account / Sign In →
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
