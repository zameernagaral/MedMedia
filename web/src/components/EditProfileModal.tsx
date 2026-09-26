import React, { useState } from 'react';
import { X, User, Upload, Briefcase, GraduationCap } from 'lucide-react';
import { UserProfile } from '../types';

interface EditProfileModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onSubmit: (updates: Partial<UserProfile>) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ currentUser, onClose, onSubmit }) => {
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [role, setRole] = useState(currentUser.role);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        fullName,
        bio,
        role
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-sky-500" />
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-900 overflow-hidden">
                <img src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName)}&background=0284c7&color=fff`} alt={currentUser.fullName} className="w-full h-full object-cover" />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-sky-600 text-white rounded-full shadow-lg border-2 border-white dark:border-slate-900 hover:bg-sky-700 transition">
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>

          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('DOCTOR')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    role === 'DOCTOR'
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400'
                      : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-500 hover:border-sky-200 dark:hover:border-sky-800'
                  }`}
                >
                  <Briefcase className="w-6 h-6 mb-1" />
                  <span className="text-xs font-bold">Doctor / Resident</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    role === 'STUDENT'
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400'
                      : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-500 hover:border-sky-200 dark:hover:border-sky-800'
                  }`}
                >
                  <GraduationCap className="w-6 h-6 mb-1" />
                  <span className="text-xs font-bold">Medical Student</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about your medical journey..."
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all resize-none h-24"
              />
            </div>
            
          </form>
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-profile-form"
            disabled={isSubmitting || !fullName}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
