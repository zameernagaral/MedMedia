import React, { useState, useEffect } from 'react';
import {
  Settings, Lock, Eye, Sun, Moon, Bell, BellOff, Mail, MailOpen,
  Smartphone, Trash2, HelpCircle, LifeBuoy, ChevronRight, ShieldCheck,
  KeyRound, AlertTriangle, CheckCircle2, Loader2, User, ExternalLink, X,
  MessageSquare, Clock, Tag
} from 'lucide-react';
import { UserProfile, DeviceSession } from '../types';
import { apiService } from '../services/api';

interface SettingsAndHelpProps {
  currentUser: UserProfile;
  deviceSessions: DeviceSession[];
  onRevokeSession: (sessionId: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onLogout: () => void;
}

type SettingsSection = 'overview' | 'privacy' | 'notifications' | 'security' | 'sessions' | 'support' | 'danger';

interface SettingsData {
  isPrivate: boolean;
  notifPush: boolean;
  notifEmail: boolean;
  email: string;
  fullName: string;
  username: string;
  verificationStatus: string;
  createdAt: string;
}

export const SettingsAndHelp: React.FC<SettingsAndHelpProps> = ({
  currentUser,
  deviceSessions,
  onRevokeSession,
  isDarkMode,
  onToggleDarkMode,
  onLogout
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('overview');
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  // Privacy state
  const [isPrivate, setIsPrivate] = useState(false);

  // Notifications state
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);

  // Password change state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Support ticket state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('general');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketLoading, setTicketLoading] = useState(false);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // Account deletion state
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await apiService.getSettings();
      if (data) {
        setSettings(data);
        setIsPrivate(data.isPrivate);
        setNotifPush(data.notifPush);
        setNotifEmail(data.notifEmail);
      }
      const tickets = await apiService.getSupportTickets();
      setMyTickets(tickets);
      setIsLoading(false);
    };
    load();
  }, []);

  const showFeedback = (msg: string, type: 'success' | 'error' = 'success') => {
    setSaveStatus(type);
    setStatusMsg(msg);
    setTimeout(() => { setSaveStatus('idle'); setStatusMsg(''); }, 3000);
  };

  const handleTogglePrivacy = async () => {
    const next = !isPrivate;
    setIsPrivate(next);
    const ok = await apiService.updatePrivacy(next);
    showFeedback(ok ? `Account set to ${next ? 'Private' : 'Public'}` : 'Failed to update privacy', ok ? 'success' : 'error');
  };

  const handleToggleNotifPush = async () => {
    const next = !notifPush;
    setNotifPush(next);
    await apiService.updateNotifications({ notifPush: next });
    showFeedback(next ? 'Push notifications enabled' : 'Push notifications disabled');
  };

  const handleToggleNotifEmail = async () => {
    const next = !notifEmail;
    setNotifEmail(next);
    await apiService.updateNotifications({ notifEmail: next });
    showFeedback(next ? 'Email notifications enabled' : 'Email notifications disabled');
  };

  const handleChangePassword = async () => {
    setPwError('');
    setPwSuccess('');
    if (!currentPw || !newPw || !confirmPw) { setPwError('All fields required.'); return; }
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { setPwError('New passwords do not match.'); return; }
    setPwLoading(true);
    const result = await apiService.changePassword(currentPw, newPw);
    setPwLoading(false);
    if (result.success) {
      setPwSuccess(result.message || 'Password changed. Please log in again.');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => onLogout(), 2500);
    } else {
      setPwError(result.message || 'Failed to change password.');
    }
  };

  const handleSubmitTicket = async () => {
    if (!ticketSubject || !ticketMessage) return;
    setTicketLoading(true);
    const result = await apiService.submitSupportTicket({ subject: ticketSubject, message: ticketMessage, category: ticketCategory });
    setTicketLoading(false);
    if (result) {
      setTicketSubmitted(true);
      setMyTickets(prev => [result.ticket, ...prev]);
      setTicketSubject(''); setTicketMessage(''); setTicketCategory('general');
      setTimeout(() => setTicketSubmitted(false), 4000);
    } else {
      showFeedback('Failed to submit ticket. Try again.', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') { return; }
    setDeleteLoading(true);
    const result = await apiService.deleteAccount(deletePassword);
    setDeleteLoading(false);
    if (result.success) {
      onLogout();
    } else {
      showFeedback(result.message || 'Failed to delete account.', 'error');
    }
  };

  const sections = [
    { id: 'overview' as SettingsSection, label: 'Account Overview', icon: User },
    { id: 'privacy' as SettingsSection, label: 'Privacy', icon: Lock },
    { id: 'notifications' as SettingsSection, label: 'Notifications', icon: Bell },
    { id: 'security' as SettingsSection, label: 'Security & Password', icon: KeyRound },
    { id: 'sessions' as SettingsSection, label: 'Active Sessions', icon: Smartphone },
    { id: 'support' as SettingsSection, label: 'Help & Support', icon: LifeBuoy },
    { id: 'danger' as SettingsSection, label: 'Danger Zone', icon: AlertTriangle },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Settings & Help Center
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your account, privacy, notifications, and get support.
            </p>
          </div>
          {/* Feedback toast */}
          {saveStatus !== 'idle' && (
            <div className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl animate-in fade-in duration-200 ${
              saveStatus === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400'
            }`}>
              {saveStatus === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {statusMsg}
            </div>
          )}
        </div>

        {/* Section Nav */}
        <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {sections.map(sec => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeSection === sec.id
                    ? sec.id === 'danger'
                      ? 'bg-rose-600 text-white'
                      : 'bg-sky-600 text-white'
                    : sec.id === 'danger'
                      ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {sec.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION: Account Overview */}
      {/* ============================================================ */}
      {activeSection === 'overview' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Information</h4>
          <div className="space-y-2">
            {[
              { label: 'Full Name', value: settings?.fullName || currentUser.fullName },
              { label: 'Username', value: `@${settings?.username || currentUser.username}` },
              { label: 'Email', value: settings?.email || currentUser.email || '—' },
              { label: 'Role', value: currentUser.role === 'DOCTOR' ? '🩺 Doctor / Resident' : '🎓 Medical Student' },
              { label: 'Verification', value: settings?.verificationStatus || 'PENDING' },
              { label: 'Member Since', value: settings?.createdAt ? new Date(settings.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">{row.label}</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Appearance */}
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">Appearance</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { if (isDarkMode && onToggleDarkMode) onToggleDarkMode(); }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                !isDarkMode ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 ring-2 ring-sky-500/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500 mb-2" />
              <div className="text-xs font-bold text-slate-900 dark:text-white">Medical Daylight</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Clean light mode for daytime</div>
              {!isDarkMode && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-600 text-white mt-1 inline-block">Active</span>}
            </button>
            <button
              onClick={() => { if (!isDarkMode && onToggleDarkMode) onToggleDarkMode(); }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isDarkMode ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 ring-2 ring-sky-500/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
              }`}
            >
              <Moon className="w-5 h-5 text-indigo-400 mb-2" />
              <div className="text-xs font-bold text-slate-900 dark:text-white">Clinical Dark</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Reduced fatigue for night shifts</div>
              {isDarkMode && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-600 text-white mt-1 inline-block">Active</span>}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION: Privacy */}
      {/* ============================================================ */}
      {activeSection === 'privacy' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Privacy</h4>
          
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl flex-shrink-0 ${isPrivate ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600' : 'bg-sky-100 dark:bg-sky-950/60 text-sky-600'}`}>
                  {isPrivate ? <Lock className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {isPrivate ? 'Private Account' : 'Public Account'}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPrivate ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'}`}>
                      {isPrivate ? 'Private' : 'Public'}
                    </span>
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {isPrivate
                      ? 'Only followers you approve can see your posts, clinical pearls, and portfolio.'
                      : 'Anyone on MedMedia can view your published cases, pearls, and portfolio.'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleTogglePrivacy}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  isPrivate ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${isPrivate ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-sky-500" /> HIPAA & Clinical Privacy Guidelines</h5>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">All clinical case images must redact patient names, hospital numbers, and visible facial identifiers before posting.</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">By using MedMedia you agree to our <span className="text-sky-600 dark:text-sky-400 cursor-pointer font-semibold">Clinical Privacy Policy</span>.</p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION: Notifications */}
      {/* ============================================================ */}
      {activeSection === 'notifications' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Notification Preferences</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">These preferences are saved to your account and synced across devices.</p>
          
          {[
            {
              icon: Bell, title: 'Push Notifications', desc: 'Get notified about follows, messages, and clinical updates in real-time.',
              value: notifPush, toggle: handleToggleNotifPush,
              active: 'bg-sky-100 dark:bg-sky-950/60 text-sky-600',
              inactive: 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            },
            {
              icon: Mail, title: 'Email Notifications', desc: 'Receive weekly summaries, job alerts, and important account notices via email.',
              value: notifEmail, toggle: handleToggleNotifEmail,
              active: 'bg-sky-100 dark:bg-sky-950/60 text-sky-600',
              inactive: 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${item.value ? item.active : item.inactive}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={item.toggle}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      item.value ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${item.value ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION: Security & Password */}
      {/* ============================================================ */}
      {activeSection === 'security' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Change Password</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Changing your password will log out all other active sessions for security.</p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Current Password</label>
              <input
                type="password"
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                placeholder="Enter your current password"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">New Password</label>
              <input
                type="password"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
              />
            </div>
          </div>

          {pwError && (
            <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 rounded-xl">
              <X className="w-4 h-4 flex-shrink-0" /> {pwError}
            </div>
          )}
          {pwSuccess && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {pwSuccess}
            </div>
          )}

          <button
            onClick={handleChangePassword}
            disabled={pwLoading}
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {pwLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Changing...</> : <><KeyRound className="w-4 h-4" />Change Password</>}
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION: Active Sessions */}
      {/* ============================================================ */}
      {activeSection === 'sessions' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Sessions</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Devices currently logged into your MedMedia account.</p>
            </div>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2 py-1 rounded-lg">
              {deviceSessions.length} active
            </span>
          </div>

          <div className="space-y-2.5">
            {deviceSessions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No active sessions found.</div>
            ) : (
              deviceSessions.map(sess => (
                <div key={sess.id} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        {sess.deviceName}
                        {sess.isCurrentDevice && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                            This Device
                          </span>
                        )}
                      </h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {sess.deviceOs} • IP: {sess.ipAddress || 'Unknown'} • Last active: {typeof sess.lastActive === 'string' ? new Date(sess.lastActive).toLocaleDateString() : sess.lastActive}
                      </p>
                    </div>
                  </div>
                  {!sess.isCurrentDevice && (
                    <button
                      onClick={() => onRevokeSession(sess.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-800 transition flex items-center gap-1 cursor-pointer text-[11px] font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Revoke</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION: Help & Support */}
      {/* ============================================================ */}
      {activeSection === 'support' && (
        <div className="space-y-4">
          {/* FAQ */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><HelpCircle className="w-4 h-4 text-sky-500" />Frequently Asked Questions</h4>
            {[
              { q: 'How are medical credentials verified?', a: 'Medical council registration certificates and student IDs are reviewed within 12–24 hours by our credentialing desk.' },
              { q: 'What are patient privacy rules on MedMedia?', a: 'All clinical case images must redact patient names, hospital numbers, and visible facial identifiers before posting.' },
              { q: 'How do Locum stipends work?', a: 'Posting facilities declare stipend ranges upon creation. Payouts are coordinated directly between parties upon duty completion.' },
              { q: 'Can I delete my posts?', a: 'Yes — tap the three-dot menu on any of your posts to delete or archive it permanently.' },
              { q: 'Is my data encrypted?', a: 'All communications are encrypted over HTTPS/TLS. Passwords are hashed with bcrypt before storage.' },
            ].map((faq, i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="text-sky-600 font-extrabold">Q:</span> {faq.q}
                </h5>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 pl-4 border-l-2 border-sky-400">{faq.a}</p>
              </div>
            ))}
          </div>

          {/* Submit Ticket */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-teal-500" />Submit a Support Ticket</h4>
            
            {ticketSubmitted ? (
              <div className="flex flex-col items-center py-6 text-center gap-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Ticket Submitted!</p>
                  <p className="text-xs text-slate-500 mt-1">Our team at <strong>medmedia1409@gmail.com</strong> will respond within 24 hours.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Category</label>
                  <select
                    value={ticketCategory}
                    onChange={e => setTicketCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="account">Account Issue</option>
                    <option value="verification">Verification Problem</option>
                    <option value="content">Content / Post Issue</option>
                    <option value="billing">Billing / Payments</option>
                    <option value="bug">Bug Report</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Subject *</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={e => setTicketSubject(e.target.value)}
                    placeholder="Brief description of your issue"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Message *</label>
                  <textarea
                    value={ticketMessage}
                    onChange={e => setTicketMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all resize-none h-24"
                  />
                </div>
                <button
                  onClick={handleSubmitTicket}
                  disabled={ticketLoading || !ticketSubject || !ticketMessage}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {ticketLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : 'Submit Ticket'}
                </button>
              </div>
            )}
          </div>

          {/* My Tickets */}
          {myTickets.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-500" />My Tickets ({myTickets.length})</h4>
              {myTickets.map(t => (
                <div key={t.id} className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{t.subject}</h5>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      t.status === 'open' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    }`}>{t.status}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{t.message}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Tag className="w-3 h-3" /> {t.category} •
                    <Clock className="w-3 h-3" /> {new Date(t.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION: Danger Zone */}
      {/* ============================================================ */}
      {activeSection === 'danger' && (
        <div className="bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-900/50 rounded-3xl p-5 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 dark:bg-rose-950/60 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400">Danger Zone</h4>
              <p className="text-[11px] text-rose-600/70 dark:text-rose-500/70">These actions are irreversible. Please proceed with caution.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 space-y-4">
            <h5 className="text-xs font-bold text-slate-900 dark:text-white">Delete My Account</h5>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Permanently deletes your account, all posts, medclips, communities, and associated data from MedMedia. This <strong>cannot be undone</strong>.
            </p>

            {!showDeleteWarning ? (
              <button
                onClick={() => setShowDeleteWarning(true)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition"
              >
                I want to delete my account
              </button>
            ) : (
              <div className="space-y-3 pt-2 border-t border-rose-200 dark:border-rose-800">
                <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">To confirm, type <code className="bg-rose-100 dark:bg-rose-950 px-1.5 py-0.5 rounded font-mono">DELETE</code> in the box below:</p>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                />
                <input
                  type="password"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  placeholder="Enter your password to confirm"
                  className="w-full bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowDeleteWarning(false); setDeleteConfirm(''); setDeletePassword(''); }}
                    className="flex-1 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading || deleteConfirm !== 'DELETE'}
                    className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white transition disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    {deleteLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Deleting...</> : 'Permanently Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
