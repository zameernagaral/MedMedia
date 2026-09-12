import React, { useState } from 'react';
import { Plus, Bell, MessageSquare, ShieldCheck, Stethoscope, GraduationCap, ChevronDown, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface TopNavProps {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  onCreatePost: () => void;
  onOpenNotifications: () => void;
  onOpenMessages: () => void;
  onOpenAuth: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentUser,
  availableUsers,
  onSwitchUser,
  onCreatePost,
  onOpenNotifications,
  onOpenMessages,
  onOpenAuth
}) => {
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [unreadMessages, setUnreadMessages] = useState(2);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left: Create Button & Medmedia Logo (Slide 5) */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onCreatePost}
            title="Create Post / Clinical Case"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 transition-all transform active:scale-95"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
              M
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
                Medmedia
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 uppercase tracking-wider">
                  Verified
                </span>
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:inline -mt-1 font-medium">
                Healthcare & Student Professional Network
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Icons: Notification, Message, User Profile Switcher */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Notifications Button (Slide 5) */}
          <button
            onClick={() => {
              setUnreadNotifications(0);
              onOpenNotifications();
            }}
            className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-700 transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Messages Button (Slide 5) */}
          <button
            onClick={() => {
              setUnreadMessages(0);
              onOpenMessages();
            }}
            className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-700 transition"
            title="Clinical Discussions & Direct Messages"
          >
            <MessageSquare className="w-5 h-5" />
            {unreadMessages > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-sky-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          {/* User Persona Switcher & Profile Quick View */}
          <div className="relative">
            <button
              onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 border border-slate-200 transition"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-sky-500/30"
              />
              <div className="hidden md:flex flex-col text-left pr-1">
                <span className="text-xs font-semibold text-slate-800 leading-tight flex items-center gap-1">
                  {currentUser.role === 'DOCTOR' ? 'Dr.' : ''} {currentUser.fullName.split(' ')[currentUser.role === 'DOCTOR' ? 1 : 0]}
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-600 inline" />
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {currentUser.role === 'DOCTOR' ? 'Verified Physician' : currentUser.studentDetails?.discipline.replace('_', ' ')}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 mr-1" />
            </button>

            {/* Dropdown for role switching & verification testing */}
            {showSwitchDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Role Mode</p>
                  <p className="text-xs font-medium text-slate-600 mt-0.5">
                    Toggle between Doctor and Student personas to test tiered privileges.
                  </p>
                </div>

                <div className="py-1">
                  {availableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSwitchUser(user);
                        setShowSwitchDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-slate-50 transition ${
                        user.id === currentUser.id ? 'bg-sky-50/60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            {user.role === 'DOCTOR' ? <Stethoscope className="w-3.5 h-3.5 text-sky-600" /> : <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />}
                            {user.fullName}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {user.role === 'DOCTOR' ? user.doctorDetails?.specialization : user.studentDetails?.discipline.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      {user.id === currentUser.id && <Check className="w-4 h-4 text-sky-600 font-bold" />}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 mt-1 pt-1 px-3">
                  <button
                    onClick={() => {
                      setShowSwitchDropdown(false);
                      onOpenAuth();
                    }}
                    className="w-full text-center py-2 text-xs font-semibold text-sky-600 hover:bg-sky-50 rounded-lg transition"
                  >
                    Manage Account & Verification Status →
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
