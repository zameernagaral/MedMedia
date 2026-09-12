import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Stethoscope, 
  GraduationCap, 
  MapPin, 
  Building2, 
  Clock, 
  BookOpen, 
  Award, 
  UserPlus, 
  UserCheck, 
  Smartphone, 
  HelpCircle, 
  FileText, 
  Trash2, 
  Share2, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { UserProfile, Post, DeviceSession } from '../types';
import { PostCard } from './PostCard';

interface ProfileViewProps {
  user: UserProfile;
  posts: Post[];
  currentUser: UserProfile;
  deviceSessions: DeviceSession[];
  onRevokeSession: (sessionId: string) => void;
  onLikePost: (postId: string) => void;
  onSavePost: (postId: string) => void;
  onConnectUser: (userId: string) => void;
  onOpenHelpCenter: () => void;
  onRequestMentorship?: (professor: UserProfile) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  posts,
  currentUser,
  deviceSessions,
  onRevokeSession,
  onLikePost,
  onSavePost,
  onConnectUser,
  onOpenHelpCenter,
  onRequestMentorship,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'settings' | 'sessions' | 'help'>('posts');
  const [isConnected, setIsConnected] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const isDoctor = user.role === 'DOCTOR';
  const isSelf = user.id === currentUser.id;

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto">
      
      {/* 1. Profile Banner & Header Card (Slides 3 & 4) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs transition-colors duration-200">
        
        {/* Top Cover Banner */}
        <div className={`h-32 sm:h-40 w-full relative ${
          isDoctor
            ? 'bg-gradient-to-r from-sky-800 via-sky-900 to-slate-900'
            : 'bg-gradient-to-r from-teal-800 via-emerald-900 to-slate-900'
        }`}>
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center gap-1">
              {isDoctor ? <Stethoscope className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
              {user.badgeTitle}
            </span>
          </div>
        </div>

        {/* Profile Avatar & Primary Details */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-14 mb-4 gap-4">
            
            {/* Avatar with Verified Ring */}
            <div className="relative">
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-xl ring-2 ring-slate-100 dark:ring-slate-800"
              />
              <div className={`absolute bottom-1 right-1 p-1.5 rounded-full text-white ${
                isDoctor ? 'bg-sky-600' : 'bg-emerald-600'
              } shadow-md`}>
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            {/* Social Actions: Follow | Connect OR Settings for own profile */}
            <div className="flex items-center gap-2">
              {isSelf ? (
                <button
                  onClick={() => setActiveTab('settings')}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  <Settings className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Settings & Theme</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsFollowing(!isFollowing);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isFollowing
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                        : 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
                    }`}
                  >
                    {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                    <span>{isFollowing ? 'Following' : 'Follow'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsConnected(!isConnected);
                      onConnectUser(user.id);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 cursor-pointer ${
                      isConnected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isConnected ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />}
                    <span>{isConnected ? 'Connected' : 'Connect'}</span>
                  </button>
                </>
              )}

              <button
                onClick={() => alert("Profile link copied!")}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Share Profile"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Name & Specialization Username */}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{user.fullName}</h1>
              <ShieldCheck className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>

            {/* Slide 3 Doctor: Username: specialization; Slide 4 Student: Username: medical student, nursing, B parm, D parm, lab practioner */}
            <p className="text-xs font-bold text-sky-600 dark:text-sky-400 mt-0.5">
              @{user.username}
            </p>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-xl font-normal">
              {user.bio}
            </p>

            {/* LinkedIn-Style Academic Banner */}
            {user.doctorDetails?.isAcceptingMentees && (
              <div className="mt-3.5 p-3.5 bg-gradient-to-r from-sky-50 via-indigo-50 to-slate-50 dark:from-sky-950/40 dark:via-indigo-950/40 dark:to-slate-900 rounded-2xl border border-sky-200/90 dark:border-sky-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-sky-950 dark:text-sky-200">Academic Mentorship & Guidance Open</p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                        {user.doctorDetails.mentorshipSlots?.available ?? 2} Slots Left
                      </span>
                    </div>
                    <p className="text-[11px] text-sky-800 dark:text-sky-300 mt-0.5">
                      Accepting student research co-investigators & clinical interns for {user.doctorDetails.activeResearchProject || 'academic trials'}.
                    </p>
                  </div>
                </div>

                {!isSelf && currentUser.role === 'STUDENT' && onRequestMentorship && (
                  <button
                    onClick={() => onRequestMentorship(user)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 self-end sm:self-center flex-shrink-0 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Request Mentorship</span>
                  </button>
                )}
              </div>
            )}

            {user.studentDetails?.isSeekingInternship && (
              <div className="mt-3.5 p-3 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Seeking Clinical Internship & Observership</p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      Target Specialty: <strong>{user.studentDetails.futureSpecialty}</strong> • College: {user.studentDetails.collegeName}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 rounded-md">
                  Candidate Ready
                </span>
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{posts.length}</span>
              <span className="text-slate-500 dark:text-slate-400 ml-1">Posts</span>
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {user.stats.followersCount + (isFollowing ? 1 : 0)}
              </span>
              <span className="text-slate-500 dark:text-slate-400 ml-1">Followers</span>
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {user.stats.connectionsCount + (isConnected ? 1 : 0)}
              </span>
              <span className="text-slate-500 dark:text-slate-400 ml-1">Connections</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 min-w-[80px] py-3 text-center transition cursor-pointer ${
              activeTab === 'posts'
                ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-500 bg-white dark:bg-slate-900'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Posts ({posts.length})
          </button>
          
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 min-w-[110px] py-3 text-center transition cursor-pointer ${
              activeTab === 'about'
                ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-500 bg-white dark:bg-slate-900'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Portfolio
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 min-w-[100px] py-3 text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'settings'
                ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-500 bg-white dark:bg-slate-900'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 min-w-[90px] py-3 text-center transition cursor-pointer ${
              activeTab === 'sessions'
                ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-500 bg-white dark:bg-slate-900'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Devices
          </button>

          <button
            onClick={() => setActiveTab('help')}
            className={`flex-1 min-w-[85px] py-3 text-center transition cursor-pointer ${
              activeTab === 'help'
                ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-500 bg-white dark:bg-slate-900'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Help
          </button>
        </div>
      </div>

      {/* 2. SUBTAB: POSTS */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl text-center text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 transition-colors duration-200">
              No clinical cases or posts published yet.
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onLike={onLikePost}
                onSave={onSavePost}
              />
            ))
          )}
        </div>
      )}

      {/* 3. SUBTAB: ABOUT & CREDENTIALS (Slide 3 Doctor & Slide 4 Student) */}
      {activeTab === 'about' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6 transition-colors duration-200">
          
          {/* DOCTOR SPECIFIC ABOUT (Slide 3) */}
          {isDoctor && user.doctorDetails && (
            <>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Qualifications & Medical Registration
                </h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {user.doctorDetails.qualifications.map((q, i) => (
                    <span key={i} className="text-xs font-bold px-3 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-100 dark:border-sky-800/60">
                      {q}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Medical Council Registration: <strong className="text-slate-800 dark:text-slate-200">{user.doctorDetails.medicalCouncilRegNumber}</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-bold block text-[10px] uppercase">Hospital Affiliation:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    {user.doctorDetails.hospitalAffiliation}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-bold block text-[10px] uppercase">Location:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    {user.doctorDetails.location}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-bold block text-[10px] uppercase">Experience:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    {user.doctorDetails.yearsExperience} Years Clinical Practice
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-bold block text-[10px] uppercase">Specialization:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                    <Stethoscope className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    {user.doctorDetails.specialization}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Clinical Interests
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {user.doctorDetails.clinicalInterests.map((interest, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Research & Landmark Publications
                </h4>
                <div className="space-y-2">
                  {user.doctorDetails.researchPublications.map((pub, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                      <span>{pub}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* STUDENT SPECIFIC ABOUT (Slide 4) */}
          {!isDoctor && user.studentDetails && (
            <>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Academic Credentials & Verification Badge
                </h3>
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Verified Medical Scholar Badge</h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      Enrolled in recognized healthcare curriculum. Verified via Student ID & Institutional domain.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-bold block text-[10px] uppercase">College / University:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {user.studentDetails.collegeName}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-bold block text-[10px] uppercase">Current Academic Year:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Year {user.studentDetails.academicYear} (Final Phase)
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-bold block text-[10px] uppercase">Discipline / Branch:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {user.studentDetails.discipline.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-bold block text-[10px] uppercase">Future Specialty Goal:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {user.studentDetails.futureSpecialty}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Academic Interests
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {user.studentDetails.interests.map((interest, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Research Interests
                </h4>
                <div className="space-y-1.5">
                  {user.studentDetails.researchInterests.map((r, i) => (
                    <div key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      )}

      {/* 3.5 SUBTAB: ACCOUNT SETTINGS & THEME */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6 transition-colors duration-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Settings & Preferences
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize visual appearance, display preferences, and clinical confidentiality.
            </p>
          </div>

          {/* Theme & Display Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Appearance & Theme Mode
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Light Mode Option */}
              <button
                type="button"
                onClick={() => {
                  if (isDarkMode && onToggleDarkMode) onToggleDarkMode();
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  !isDarkMode
                    ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 ring-2 ring-sky-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                    <Sun className="w-5 h-5" />
                  </div>
                  {!isDarkMode && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-600 text-white">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">Medical Daylight</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    High clarity for daylight rounds, clean documentation, and daytime reading.
                  </p>
                </div>
              </button>

              {/* Dark Mode Option */}
              <button
                type="button"
                onClick={() => {
                  if (!isDarkMode && onToggleDarkMode) onToggleDarkMode();
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isDarkMode
                    ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 ring-2 ring-sky-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-400 flex items-center justify-center">
                    <Moon className="w-5 h-5" />
                  </div>
                  {isDarkMode && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-600 text-white">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">Clinical Dark Mode</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Reduced eye fatigue during night shifts, OT imaging review, and low-light wards.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Account Details */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Verified Account Overview
            </h4>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Full Name</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user.fullName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Handle / Username</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">@{user.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Role Status</span>
                <span className="font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user.badgeTitle}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">HIPAA & Clinical Consent</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active & Verified</span>
              </div>
            </div>
          </div>

          {/* Clinical Privacy Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <p>
              Your clinical data, case posts, and mentorship interactions are shielded by MedMedia Medical Privacy Shield. Patient anonymization is strictly enforced on all case studies.
            </p>
          </div>
        </div>
      )}

      {/* 4. SUBTAB: DEVICE MANAGEMENT (Slide 2 & 4: Device/session management) */}
      {activeTab === 'sessions' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Device & Session Security</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage devices logged into your verified MedMedia account.</p>
            </div>
            <Smartphone className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          </div>

          <div className="space-y-3 pt-2">
            {deviceSessions.map((sess) => (
              <div
                key={sess.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      {sess.deviceName}
                      {sess.isCurrentDevice && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          Current Device
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      IP: {sess.ipAddress} • Last active: {sess.lastActive}
                    </p>
                  </div>
                </div>

                {!sess.isCurrentDevice && (
                  <button
                    onClick={() => onRevokeSession(sess.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Terminate Session"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Log Out</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SUBTAB: HELP CENTER (Slide 4: Help center) */}
      {activeTab === 'help' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">MedMedia Help Center & Support</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Healthcare guidelines, verification inquiries, and HIPAA standards.</p>
            </div>
            <HelpCircle className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          </div>

          <div className="space-y-2.5 pt-2">
            {[
              { q: "How long does Doctor verification take?", a: "Medical council registration number verification is processed within 12-24 hours by our clinical credentials committee." },
              { q: "What documents qualify for Student Verification?", a: "Valid college photo ID card, tuition registration receipt for the current academic year, or official .edu institutional email." },
              { q: "What are the rules for posting Clinical Cases in Home Feed & Medclips?", a: "All cases must adhere strictly to HIPAA patient de-identification guidelines. Facial features, names, hospital numbers, and identifying traits must be redacted." },
              { q: "Can medical students apply for Doctor jobs?", a: "Students have access to Internships, Observerships, and Fellowship prep, while senior clinical positions require Doctor Tier verification." }
            ].map((faq, i) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="text-sky-600 dark:text-sky-400 font-extrabold">Q:</span> {faq.q}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed pl-4 border-l-2 border-sky-400">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Need urgent credentials assistance?</span>
            <button
              onClick={() => alert("Connecting to MedMedia 24/7 Clinical Support Ticket Desk...")}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Contact Support
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
