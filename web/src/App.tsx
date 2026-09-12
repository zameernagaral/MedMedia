import React, { useState, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { BottomNav, TabType } from './components/BottomNav';
import { StoriesBar } from './components/StoriesBar';
import { PostCard } from './components/PostCard';
import { MedclipsPlayer } from './components/MedclipsPlayer';
import { OpportunitiesHub } from './components/OpportunitiesHub';
import { ProfileView } from './components/ProfileView';
import { SearchAndNetworking } from './components/SearchAndNetworking';
import { AuthModal } from './components/AuthModal';
import { CreatePostModal } from './components/CreatePostModal';
import { ClinicalChatDrawer } from './components/ClinicalChatDrawer';
import { MentorshipModal } from './components/MentorshipModal';
import { InternshipApplyModal } from './components/InternshipApplyModal';
import { getPersonalizedFeed, getPersonalizedMedclips } from './utils/algorithmEngine';
import { 
  INITIAL_USERS, 
  INITIAL_STORIES, 
  INITIAL_POSTS, 
  INITIAL_CLIPS, 
  INITIAL_JOBS, 
  INITIAL_OPPORTUNITIES, 
  INITIAL_SESSIONS 
} from './data/mockData';
import { UserProfile, Post, Job, MentorshipRequest, InternshipApplication } from './types';
import { 
  Smartphone, 
  Monitor, 
  ShieldCheck, 
  Calendar, 
  Briefcase, 
  Sparkles, 
  UserPlus, 
  X, 
  TrendingUp,
  Stethoscope,
  GraduationCap,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export const App: React.FC = () => {
  // Dark Mode Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('medmedia_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('medmedia_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('medmedia_theme', 'light');
    }
  }, [isDarkMode]);

  // Application State
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[2]); // Default to Rohan Verma (MBBS student) to immediately demonstrate student perspective!
  const [selectedProfileUser, setSelectedProfileUser] = useState<UserProfile | null>(null);
  const [stories, setStories] = useState(INITIAL_STORIES);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [clips, setClips] = useState(INITIAL_CLIPS);
  const [jobs] = useState(INITIAL_JOBS);
  const [opportunities] = useState(INITIAL_OPPORTUNITIES);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [feedFilterTag, setFeedFilterTag] = useState<string>('All');

  // Active Navigation Tab (Slide 5: Home, Medclips, Search, Opportunities, Profile)
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [showMessagesDrawer, setShowMessagesDrawer] = useState(false);
  const [isMobileFrameMode, setIsMobileFrameMode] = useState(false);
  const [mentoringProfessor, setMentoringProfessor] = useState<UserProfile | null>(null);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Post Actions
  const handleLikePost = (postId: string) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const isLiked = !p.isLiked;
        return {
          ...p,
          isLiked,
          likesCount: p.likesCount + (isLiked ? 1 : -1)
        };
      }
      return p;
    }));
  };

  const handleSavePost = (postId: string) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const isSaved = !p.isSaved;
        return {
          ...p,
          isSaved,
          savesCount: p.savesCount + (isSaved ? 1 : -1)
        };
      }
      return p;
    }));
  };

  const handleVotePoll = (postId: string, optionId: string) => {
    setPosts(posts.map(p => {
      if (p.id === postId && p.casePoll) {
        const updatedOptions = p.casePoll.options.map(opt => {
          if (opt.id === optionId) {
            return { ...opt, votes: opt.votes + 1 };
          }
          return opt;
        });
        return {
          ...p,
          casePoll: {
            ...p.casePoll,
            options: updatedOptions,
            totalVotes: p.casePoll.totalVotes + 1,
            userVotedOptionId: optionId
          }
        };
      }
      return p;
    }));
  };

  // Medclip Actions
  const handleLikeClip = (clipId: string) => {
    setClips(clips.map(c => {
      if (c.id === clipId) {
        const isLiked = !c.isLiked;
        return {
          ...c,
          isLiked,
          likesCount: c.likesCount + (isLiked ? 1 : -1)
        };
      }
      return c;
    }));
  };

  const handleSaveClip = (clipId: string) => {
    setClips(clips.map(c => {
      if (c.id === clipId) {
        const isSaved = !c.isSaved;
        return {
          ...c,
          isSaved,
          savesCount: c.savesCount + (isSaved ? 1 : -1)
        };
      }
      return c;
    }));
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    alert("Session successfully revoked. The target device has been logged out.");
  };

  const handleSelectUser = (userOrId: UserProfile | string) => {
    if (typeof userOrId === 'string') {
      const found = users.find(u => u.id === userOrId);
      if (found) {
        setSelectedProfileUser(found);
        setCurrentTab('profile');
      }
    } else {
      setSelectedProfileUser(userOrId);
      setCurrentTab('profile');
    }
  };

  const handleSwitchPersona = (user: UserProfile) => {
    setCurrentUser(user);
    setSelectedProfileUser(null);
    setToastMessage(`Viewer algorithm adjusted for: ${user.fullName}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Algorithmic Personalized Feed & Clips calculation
  const algorithmicPosts = getPersonalizedFeed(posts, currentUser);
  const filteredPosts = algorithmicPosts.filter(p => {
    if (feedFilterTag === 'All') return true;
    if (feedFilterTag === '#Professors') return p.authorIsProfessor;
    if (feedFilterTag === '#Internships') return p.clinicalTags.some(t => t.toLowerCase().includes('internship') || t.toLowerCase().includes('mentorship'));
    return p.clinicalTags.some(t => t.toLowerCase() === feedFilterTag.toLowerCase());
  });

  const algorithmicClips = getPersonalizedMedclips(clips, currentUser);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center transition-colors duration-200">
      
      {/* Top Banner: Algorithm Persona Switcher & Device Frame Preview */}
      <div className="w-full bg-slate-900 text-white px-3 sm:px-4 py-2 text-xs flex flex-wrap items-center justify-between z-50 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold tracking-wide uppercase text-[10px] text-sky-400">
            MedMedia AI Algorithm Mode
          </span>
          <span className="hidden md:inline text-slate-400">• Viewer-Centric Ranking</span>
        </div>

        {/* Quick Persona Selector to test algorithm live */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] text-slate-400 font-bold mr-1 hidden sm:inline">Active Perspective:</span>
          {users.map(u => (
            <button
              key={`persona-${u.id}`}
              onClick={() => handleSwitchPersona(u)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                currentUser.id === u.id
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={`Switch viewer perspective to ${u.fullName}`}
            >
              <img src={u.avatarUrl} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
              <span>{u.fullName.split(' ')[0]}</span>
              <span className="text-[9px] opacity-75 font-normal">
                ({u.role === 'STUDENT' ? 'Student' : u.doctorDetails?.isProfessor ? 'Professor' : 'Doctor'})
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileFrameMode(!isMobileFrameMode)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium text-[11px] cursor-pointer"
          >
            {isMobileFrameMode ? <Monitor className="w-3.5 h-3.5 text-sky-400" /> : <Smartphone className="w-3.5 h-3.5 text-sky-400" />}
            <span className="hidden sm:inline">{isMobileFrameMode ? 'Desktop View' : 'Mobile Preview'}</span>
          </button>
        </div>
      </div>

      {/* Main Container: Responsive Wrapper (with optional phone bezel) */}
      <div className={`w-full transition-all duration-300 ${
        isMobileFrameMode
          ? 'max-w-[420px] my-6 bg-white dark:bg-slate-900 shadow-2xl rounded-[40px] border-[8px] border-slate-900 dark:border-slate-800 overflow-hidden min-h-[850px]'
          : 'max-w-6xl min-h-screen bg-slate-50/50 dark:bg-slate-950 shadow-sm'
      }`}>
        
        {/* Top Header Bar (Slide 5: Create +, Medmedia, Notification bell, Message chat bubble) */}
        <TopNav
          currentUser={currentUser}
          availableUsers={users}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
          onSwitchUser={(u) => setCurrentUser(u)}
          onCreatePost={() => setShowCreateModal(true)}
          onOpenNotifications={() => setShowNotificationsDrawer(true)}
          onOpenMessages={() => setShowMessagesDrawer(true)}
          onOpenAuth={() => setShowAuthModal(true)}
        />

        {/* Content Area Routed by Bottom Navigation Tab */}
        <div className="p-3 sm:p-6">
          <div className={`${!isMobileFrameMode ? 'grid grid-cols-1 lg:grid-cols-12 gap-6' : 'w-full'}`}>
            
            {/* DESKTOP LEFT SIDEBAR (Only in wide mode) */}
            {!isMobileFrameMode && (
              <aside className="hidden lg:block lg:col-span-3 space-y-4">
                {/* Profile Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm text-center">
                  <div className="relative inline-block">
                    <img
                      src={currentUser.avatarUrl}
                      alt=""
                      className="w-20 h-20 rounded-full object-cover border-2 border-sky-500 mx-auto shadow-sm"
                    />
                    <div className={`absolute bottom-0 right-0 p-1 rounded-full text-white ${
                      currentUser.role === 'DOCTOR' ? 'bg-sky-600' : 'bg-emerald-600'
                    }`}>
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2">{currentUser.fullName}</h3>
                  <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">@{currentUser.username}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{currentUser.bio}</p>

                  <div className="flex justify-around mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{posts.filter(p => p.authorId === currentUser.id).length}</span>
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500">Posts</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.stats.followersCount}</span>
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500">Followers</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.stats.connectionsCount}</span>
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500">Network</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentTab('profile')}
                    className="w-full mt-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  >
                    View Verified Portfolio
                  </button>
                </div>

                {/* Quick Navigation Shortcuts */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3">Sections</span>
                  {[
                    { id: 'home', label: 'Clinical Home Feed', icon: Stethoscope },
                    { id: 'medclips', label: 'Medclips Video Feed', icon: TrendingUp },
                    { id: 'search', label: 'Alumni & Search', icon: Sparkles },
                    { id: 'opportunities', label: 'Jobs & Research Hub', icon: Briefcase }
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setCurrentTab(tab.id as any)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          currentTab === tab.id
                            ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </aside>
            )}

            {/* MAIN CENTER COLUMN */}
            <main className={`${!isMobileFrameMode ? 'lg:col-span-6' : 'w-full'}`}>
              
              {/* TAB 1: HOME FEED (Slide 5 & 7: Stories, Text, tweets, Images, Links, Discussions - No reels) */}
              {currentTab === 'home' && (
                <div>
                  {/* Stories Bar (Slide 5: Story update - with clickable author profile) */}
                  <StoriesBar
                    stories={stories}
                    currentUser={currentUser}
                    onAddStorySuccess={(newStory) => setStories([newStory, ...stories])}
                    onSelectUser={handleSelectUser}
                  />

                  {/* LinkedIn + Instagram Hybrid Filter Pills Bar */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mb-3 py-1">
                    {['All', '#Professors', '#Internships', '#Cardiology', '#GeneralSurgery', '#ECGChallenge', '#Pharmacology'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setFeedFilterTag(tag)}
                        className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition whitespace-nowrap cursor-pointer ${
                          feedFilterTag === tag
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {tag === 'All' ? '🎯 For You (AI Algorithm)' : tag === '#Professors' ? '👨‍🏫 Professors & Faculty' : tag === '#Internships' ? '🏥 Clinical Internships' : tag}
                      </button>
                    ))}
                  </div>

                  {/* Home Feed Post Cards with Algorithmic Transparency */}
                  <div className="space-y-4">
                    {filteredPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        onLike={handleLikePost}
                        onSave={handleSavePost}
                        onVotePoll={handleVotePoll}
                        onSelectUser={handleSelectUser}
                        onConnectAuthor={(authorId) => {
                          const author = users.find(u => u.id === authorId);
                          setToastMessage(`Connection request sent to ${author?.fullName || 'Colleague'}!`);
                          setTimeout(() => setToastMessage(null), 3000);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: MEDCLIPS (Slide 6: Medclips, social update / clinical updates / following, side actions) */}
              {currentTab === 'medclips' && (
                <div className="py-2">
                  <MedclipsPlayer
                    clips={algorithmicClips}
                    currentUser={currentUser}
                    onLikeClip={handleLikeClip}
                    onSaveClip={handleSaveClip}
                    onConnectAuthor={(name) => {
                      setToastMessage(`Connection request sent to ${name}!`);
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                  />
                </div>
              )}

              {/* TAB 3: SEARCH & NETWORKING (Slide 10: Accounts, Community, Associations, Posts, Job Offers, Hospital) */}
              {currentTab === 'search' && (
                <SearchAndNetworking
                  currentUser={currentUser}
                  availableUsers={users}
                  jobs={jobs}
                  onSelectUser={handleSelectUser}
                  onConnectSuggestion={(name) => {
                    setToastMessage(`Networking request sent to ${name}!`);
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  onRequestMentorship={(prof) => setMentoringProfessor(prof)}
                  onApplyInternship={(job) => setApplyingJob(job)}
                />
              )}

              {/* TAB 4: OPPORTUNITIES (Slide 8 & 9: Research, Freelancing, Job Offers, Events, Courses, Community) */}
              {currentTab === 'opportunities' && (
                <OpportunitiesHub
                  jobs={jobs}
                  opportunities={opportunities}
                  currentUser={currentUser}
                />
              )}

              {/* TAB 5: PROFILE (Slide 3 Doctor & Slide 4 Student Professional Portfolio) */}
              {currentTab === 'profile' && (
                <div>
                  {selectedProfileUser && selectedProfileUser.id !== currentUser.id && (
                    <div className="mb-3 px-4 py-2 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 rounded-2xl flex items-center justify-between text-xs">
                      <span className="text-sky-900 dark:text-sky-200 font-medium">
                        Viewing profile of: <strong>{selectedProfileUser.fullName}</strong>
                      </span>
                      <button
                        onClick={() => setSelectedProfileUser(null)}
                        className="font-bold text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
                      >
                        Return to My Profile →
                      </button>
                    </div>
                  )}

                  <ProfileView
                    user={selectedProfileUser || currentUser}
                    posts={posts.filter(p => p.authorId === (selectedProfileUser ? selectedProfileUser.id : currentUser.id))}
                    currentUser={currentUser}
                    deviceSessions={sessions}
                    onRevokeSession={handleRevokeSession}
                    onLikePost={handleLikePost}
                    onSavePost={handleSavePost}
                    onConnectUser={(id) => {
                      setToastMessage(`Connected with user #${id}!`);
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    onOpenHelpCenter={() => alert("MedMedia Help & Ethics Desk opened.")}
                    onRequestMentorship={(prof) => setMentoringProfessor(prof)}
                  />
                </div>
              )}

            </main>

            {/* DESKTOP RIGHT SIDEBAR (Only in wide mode) */}
            {!isMobileFrameMode && (
              <aside className="hidden lg:block lg:col-span-3 space-y-4">
                
                {/* Upcoming CME Events Widget (Slide 8) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      Upcoming CME Events
                    </h4>
                    <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">Slide 8</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    <p className="font-bold text-slate-800 dark:text-slate-200">77th Annual Medical Congress</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Nov 14-16 • 6 CME Credits</p>
                    <button
                      onClick={() => setCurrentTab('opportunities')}
                      className="mt-2 text-[10px] text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
                    >
                      View Venue & RSVP →
                    </button>
                  </div>
                </div>

                {/* Alumni Suggestions Widget (Slide 10) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Alumni Connection
                    </h4>
                    <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">Slide 10</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop"
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Dr. Sandeep Kulkarni</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Cardiothoracic Surgeon</p>
                      <span className="text-[9px] text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded font-semibold border border-sky-100 dark:border-sky-900">
                        AIIMS Alumni
                      </span>
                    </div>
                    <button
                      onClick={() => alert("Connected with Dr. Sandeep Kulkarni!")}
                      className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Urgent Locum Shift Widget (Slide 8 & 9) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Urgent Locum Duty
                    </h4>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Open</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Manipal Hospital Emergency Casualty</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Weekend 12h Trauma Coverage</p>
                  <button
                    onClick={() => setCurrentTab('opportunities')}
                    className="mt-2 w-full py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition cursor-pointer"
                  >
                    Apply for Shift
                  </button>
                </div>

              </aside>
            )}

          </div>
        </div>

        {/* Bottom Navigation Dock (Slide 5: Home, Medclips, Search, Opportunities, Profile) */}
        <BottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          userAvatar={currentUser.avatarUrl}
        />

      </div>

      {/* Notifications Drawer */}
      {showNotificationsDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 h-full p-5 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200 border-l border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h3>
              <button onClick={() => setShowNotificationsDrawer(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>
            <div className="space-y-3 py-4">
              <div className="p-3 bg-sky-50 dark:bg-sky-950/50 rounded-xl border border-sky-100 dark:border-sky-800 text-xs">
                <p className="font-bold text-sky-950 dark:text-sky-200">Dr. Priya Nair liked your STEMI ECG challenge post.</p>
                <span className="text-[10px] text-sky-700 dark:text-sky-400">10 mins ago</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <p className="font-bold text-slate-900 dark:text-white">Medical Council verified your board registration status.</p>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">1 hour ago</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <p className="font-bold text-slate-900 dark:text-white">New Locum Emergency shift posted in Bangalore.</p>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">3 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Featured Multi-Conversation Clinical Chat Suite (Slide 5: Messages) */}
      <ClinicalChatDrawer
        isOpen={showMessagesDrawer}
        currentUser={currentUser}
        onClose={() => setShowMessagesDrawer(false)}
      />

      {/* Auth & Verification Modal (Slide 2, 3, 4) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(newUser) => {
          setUsers([newUser, ...users]);
          setCurrentUser(newUser);
        }}
      />

      {/* Create Post Modal (Slide 5: Create + button) */}
      <CreatePostModal
        isOpen={showCreateModal}
        currentUser={currentUser}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={(newPost) => setPosts([newPost, ...posts])}
      />

      {/* Professor Mentorship Request Modal (LinkedIn-Style Mentorship Suite) */}
      <MentorshipModal
        isOpen={!!mentoringProfessor}
        professor={mentoringProfessor}
        student={currentUser}
        onClose={() => setMentoringProfessor(null)}
        onSubmitSuccess={(req) => {
          setToastMessage(`Mentorship request submitted to ${req.professorName}!`);
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />

      {/* Clinical Internship Application Modal */}
      <InternshipApplyModal
        isOpen={!!applyingJob}
        job={applyingJob}
        applicant={currentUser}
        onClose={() => setApplyingJob(null)}
        onSubmitSuccess={(app) => {
          setToastMessage(`Application submitted for ${app.opportunityTitle} at ${app.hospitalName}!`);
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />

      {/* Global Interactive Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/80 dark:border-slate-600/80 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};

export default App;
