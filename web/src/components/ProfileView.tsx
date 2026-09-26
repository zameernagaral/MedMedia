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
  Trash2, 
  Share2, 
  CheckCircle2, 
  Sparkles,
  Settings,
  Sun,
  Moon,
  Camera,
  Lock,
  Eye,
  EyeOff,
  LifeBuoy
} from 'lucide-react';
import { UserProfile, Post, DeviceSession } from '../types';
import { PostCard } from './PostCard';
import { apiService } from '../services/api';

interface ProfileViewProps {
  user: UserProfile;
  posts: Post[];
  currentUser: UserProfile;
  deviceSessions: DeviceSession[];
  onRevokeSession: (sessionId: string) => void;
  onLikePost: (postId: string) => void;
  onSavePost: (postId: string) => void;
  onConnectUser: (userId: string) => void;
  onOpenHelpCenter?: () => void;
  onOpenSupportModal?: () => void;
  onRequestMentorship?: (professor: UserProfile) => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const BANNER_PRESETS = [
  { label: 'Modern Surgical Suite', url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=400&fit=crop' },
  { label: 'Clinical Cardiology Ward', url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=400&fit=crop' },
  { label: 'Neuroimaging & Research', url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=1200&h=400&fit=crop' },
  { label: 'Medical University Campus', url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1200&h=400&fit=crop' },
  { label: 'Emergency Trauma Care', url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&h=400&fit=crop' }
];

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
  onOpenSupportModal,
  onRequestMentorship,
  onUpdateProfile,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'settings_help'>('posts');
  const [isConnected, setIsConnected] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState(user.coverPhotoUrl || '');
  const [isPrivateAccount, setIsPrivateAccount] = useState(Boolean(user.isPrivate));
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [customBannerUrl, setCustomBannerUrl] = useState('');

  const isDoctor = user.role === 'DOCTOR';
  const isSelf = user.id === currentUser.id;

  const handleTogglePrivacy = async () => {
    const nextVal = !isPrivateAccount;
    setIsPrivateAccount(nextVal);
    if (onUpdateProfile) {
      onUpdateProfile({ isPrivate: nextVal });
    }
    await apiService.updateUserProfile(user.id, { isPrivate: nextVal });
  };

  const handleSelectBanner = async (url: string) => {
    setCoverPhoto(url);
    setShowBannerModal(false);
    if (onUpdateProfile) {
      onUpdateProfile({ coverPhotoUrl: url });
    }
    await apiService.updateUserProfile(user.id, { coverPhotoUrl: url });
  };

  // Check if profile is masked (Private account & not self & not following)
  const isAccountLocked = !isSelf && isPrivateAccount && !isFollowing;

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto">
      
      {/* 1. Profile Banner & Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs transition-colors duration-200">
        
        {/* Top Cover Banner (LinkedIn Banner Style) */}
        <div 
          className="h-36 sm:h-48 w-full relative bg-slate-800 bg-cover bg-center transition-all duration-300"
          style={{
            backgroundImage: coverPhoto ? `url(${coverPhoto})` : undefined
          }}
        >
          {!coverPhoto && (
            <div className={`w-full h-full ${
              isDoctor
                ? 'bg-gradient-to-r from-sky-800 via-sky-900 to-slate-900'
                : 'bg-gradient-to-r from-teal-800 via-emerald-900 to-slate-900'
            }`} />
          )}

          {/* Edit Banner Button for Own Profile */}
          {isSelf && (
            <button
              onClick={() => setShowBannerModal(true)}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition cursor-pointer shadow-md"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Edit Banner</span>
            </button>
          )}

          {/* Privacy Indicator Badge */}
          {isPrivateAccount && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/60 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 border border-white/20">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Private Account</span>
            </div>
          )}
        </div>

        {/* Profile Avatar & Primary Details */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-14 mb-4 gap-4">
            
            {/* Avatar with Verified Icon */}
            <div className="relative">
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-xl ring-2 ring-slate-100 dark:ring-slate-800"
              />
              <div className={`absolute bottom-1 right-1 p-1 rounded-full text-white ${
                isDoctor ? 'bg-sky-600' : 'bg-emerald-600'
              } shadow-md`}>
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            {/* Social Actions: Follow | Connect OR Settings for own profile */}
            <div className="flex items-center gap-2">
              {isSelf ? (
                <>
                  <button
                    onClick={() => alert("Edit Profile modal coming soon!")}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-900"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('settings_help')}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  >
                    <Settings className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Settings & Help</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isFollowing
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                        : 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
                    }`}
                  >
                    {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                    <span>{isFollowing ? 'Following' : 'Follow'}</span>
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert("Profile link copied to clipboard!");
                }}
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
              <span title="Verified Account">
                <ShieldCheck className="w-5 h-5 text-sky-600 dark:text-sky-400 fill-sky-100 dark:fill-sky-950" />
              </span>
            </div>

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
                {user.stats.followersCount + 50} {/* Just an arbitrary Following stat for now since Following isn't in model */}
              </span>
              <span className="text-slate-500 dark:text-slate-400 ml-1">Following</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        {/* On other users' profiles, only show Posts and Portfolio */}
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

          {/* Settings & Help is only visible on own profile */}
          {isSelf && (
            <button
              onClick={() => setActiveTab('settings_help')}
              className={`flex-1 min-w-[120px] py-3 text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'settings_help'
                  ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-500 bg-white dark:bg-slate-900'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings & Help</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SUBTAB: POSTS (With Private Account Masking) */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {isAccountLocked ? (
            /* Instagram-style Private Account Mask */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center shadow-xs">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">This Account is Private</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Follow @{user.username} to view their clinical cases, pearls, research notes, and medical discussions.
              </p>
              <button
                onClick={() => setIsFollowing(true)}
                className="mt-5 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition shadow-sm"
              >
                Follow to View Clinical Cases
              </button>
            </div>
          ) : posts.length === 0 ? (
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

      {/* 3. SUBTAB: ABOUT & CREDENTIALS */}
      {activeTab === 'about' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6 transition-colors duration-200">
          
          {/* DOCTOR SPECIFIC ABOUT */}
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

          {/* STUDENT SPECIFIC ABOUT */}
          {!isDoctor && user.studentDetails && (
            <>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Academic Credentials & Medical Scholar Status
                </h3>
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Verified Medical Scholar Badge</h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      Enrolled in recognized healthcare curriculum. Verified via Student ID & Institutional credentials.
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
                    Year {user.studentDetails.academicYear} (Clinical Phase)
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
                  <span className="text-slate-400 dark:text-slate-500 font-bold block text-[10px] uppercase">Target Clinical Specialty:</span>
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

      {/* 4. CONSOLIDATED SUBTAB: SETTINGS & HELP (Only on self profile) */}
      {isSelf && activeTab === 'settings_help' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6 transition-colors duration-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Settings & Help Center
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage clinical privacy, appearance, connected devices, and support queries.
            </p>
          </div>

          {/* 1) Public / Private Account Privacy Toggle */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Account Privacy & Confidentiality
            </h4>
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl ${isPrivateAccount ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600' : 'bg-sky-100 dark:bg-sky-950/60 text-sky-600'}`}>
                  {isPrivateAccount ? <Lock className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {isPrivateAccount ? 'Private Account Active' : 'Public Account Active'}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isPrivateAccount
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {isPrivateAccount ? 'Private' : 'Public'}
                    </span>
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {isPrivateAccount
                      ? 'Only followers you approve can see your clinical pearls, case studies, and posts.'
                      : 'Anyone on MedMedia can view your published cases, clinical pearls, and portfolio.'}
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={handleTogglePrivacy}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isPrivateAccount ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isPrivateAccount ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 2) Appearance & Theme Mode */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
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

          {/* 3) Device & Session Security */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Device & Session Management
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Active sessions logged into your verified MedMedia account.
                </p>
              </div>
              <Smartphone className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>

            <div className="space-y-2.5">
              {deviceSessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        {sess.deviceName}
                        {sess.isCurrentDevice && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                            Current Device
                          </span>
                        )}
                      </h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        IP: {sess.ipAddress} • Last active: {sess.lastActive}
                      </p>
                    </div>
                  </div>

                  {!sess.isCurrentDevice && (
                    <button
                      onClick={() => onRevokeSession(sess.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-800 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                      title="Terminate Session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">Log Out</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4) Help Center & Support Desk (medmedia1409@gmail.com) */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Help Center & Clinical Support Desk
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  All support inquiries are dispatched to <strong>medmedia1409@gmail.com</strong>.
                </p>
              </div>
              <HelpCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>

            <div className="space-y-2">
              {[
                { q: "How are medical credentials verified?", a: "Medical council registration certificates and student IDs are inspected within 12-24 hours by MedMedia credentialing desk." },
                { q: "What are patient privacy (HIPAA) rules on MedMedia?", a: "All clinical case images must redact patient names, hospital numbers, and visible facial identifiers." },
                { q: "How do Locum duty stipends work?", a: "Posting facilities declare stipend ranges upon creation. Payouts are coordinated directly upon completion of duty." }
              ].map((faq, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="text-sky-600 dark:text-sky-400 font-extrabold">Q:</span> {faq.q}
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 pl-3.5 border-l-2 border-sky-400">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h5 className="text-xs font-bold text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
                  <LifeBuoy className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Have a question or account issue?
                </h5>
                <p className="text-[11px] text-teal-800 dark:text-teal-300 mt-0.5">
                  Submit a query to our 24/7 support desk at <strong>medmedia1409@gmail.com</strong>.
                </p>
              </div>
              <button
                onClick={() => {
                  if (onOpenSupportModal) {
                    onOpenSupportModal();
                  } else if (onOpenHelpCenter) {
                    onOpenHelpCenter();
                  }
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex-shrink-0"
              >
                Contact Support Desk
              </button>
            </div>
          </div>

          {/* Account Details */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Account Overview
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
                <span className="text-slate-500 dark:text-slate-400">Professional Credential</span>
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
        </div>
      )}

      {/* Banner Selection Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-sky-600" />
                Change Profile Cover Banner
              </h3>
              <button
                onClick={() => setShowBannerModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a clinical theme or paste a custom image URL for your LinkedIn-style banner.
            </p>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Preset Clinical Themes:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BANNER_PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectBanner(preset.url)}
                    className="group relative h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 text-left transition hover:scale-[1.02]"
                  >
                    <img src={preset.url} alt="" className="w-full h-full object-cover group-hover:brightness-90 transition" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                      <span className="text-[11px] font-bold text-white drop-shadow-sm">{preset.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Or Custom Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customBannerUrl}
                  onChange={(e) => setCustomBannerUrl(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  disabled={!customBannerUrl.trim()}
                  onClick={() => handleSelectBanner(customBannerUrl.trim())}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
