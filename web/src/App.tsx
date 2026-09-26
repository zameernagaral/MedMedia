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
import { SupportModal } from './components/SupportModal';
import { getPersonalizedFeed, getPersonalizedMedclips } from './utils/algorithmEngine';
import { apiService } from './services/api';
import { 
  INITIAL_USERS, 
  INITIAL_STORIES, 
  INITIAL_POSTS, 
  INITIAL_CLIPS, 
  INITIAL_JOBS, 
  INITIAL_OPPORTUNITIES, 
  INITIAL_SESSIONS,
  INITIAL_NOTIFICATIONS
} from './data/mockData';
import { UserProfile, Post, Job, MentorshipRequest, InternshipApplication, NotificationItem } from './types';
import { 
  Smartphone, 
  Monitor, 
  ShieldCheck, 
  Calendar, 
  Briefcase, 
  Sparkles, 
  UserPlus, 
  UserCheck,
  X, 
  TrendingUp,
  Stethoscope,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Bell,
  CheckCircle2,
  Plus
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
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('medmedia_current_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.id) return parsed;
        } catch {}
      }
    }
    return INITIAL_USERS[2]; // Default to student scholar
  });
  const [selectedProfileUser, setSelectedProfileUser] = useState<UserProfile | null>(null);
  const [stories, setStories] = useState(INITIAL_STORIES);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [clips, setClips] = useState(INITIAL_CLIPS);
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [opportunities] = useState(INITIAL_OPPORTUNITIES);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [feedFilterTag, setFeedFilterTag] = useState<string>('All');
  const [isManagerMode, setIsManagerMode] = useState<boolean>(false);
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);

  // Load persistent data from laptop database on startup
  useEffect(() => {
    // 1. Fetch posts from persistent laptop database
    apiService.getPosts().then((loadedPosts) => {
      if (loadedPosts && loadedPosts.length > 0) {
        setPosts(loadedPosts);
      }
    });

    // 2. Fetch users from persistent laptop database
    apiService.getUsers().then((loadedUsers) => {
      if (loadedUsers && loadedUsers.length > 0) {
        setUsers(loadedUsers);
        const saved = localStorage.getItem('medmedia_current_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const found = loadedUsers.find(u => u.id === parsed.id || u.email === parsed.email);
            if (found) setCurrentUser(found);
          } catch {}
        }
      }
    });

    // 3. Fetch stories from persistent database & MySQL
    apiService.getStories().then((loadedStories) => {
      if (loadedStories && loadedStories.length > 0) {
        setStories(loadedStories);
      }
    });

    // 4. Fetch notifications (strictly filtered: conferences, jobs, follows - NO likes or comments)
    apiService.getNotifications(currentUser.id).then((loadedNotifs) => {
      if (loadedNotifs && loadedNotifs.length > 0) {
        const allowedTypes = ['CONFERENCE', 'JOB_UPDATE', 'JOB_APPLICATION', 'FOLLOW_REQUEST', 'FOLLOW_ACCEPTED'];
        const cleanNotifs = loadedNotifs.filter(n => allowedTypes.includes(n.type));
        setNotifications(cleanNotifs);
      }
    });

    // 5. Fetch jobs from backend
    apiService.getJobs().then((loadedJobs) => {
      if (loadedJobs && loadedJobs.length > 0) {
        setJobs(loadedJobs);
      }
    });
  }, []);

  // Active Navigation Tab (Slide 5: Home, Medclips, Search, Opportunities, Profile)
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalMode, setCreateModalMode] = useState<'post' | 'story'>('post');
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [showMessagesDrawer, setShowMessagesDrawer] = useState(false);
  const [isMobileFrameMode, setIsMobileFrameMode] = useState(false);
  const [mentoringProfessor, setMentoringProfessor] = useState<UserProfile | null>(null);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDeletePost = async (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    await apiService.deletePost(postId);
    setToastMessage("Clinical post deleted successfully.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteStory = async (storyId: string) => {
    setStories(prev => prev.filter(s => s.id !== storyId));
    await apiService.deleteStory(storyId);
    setToastMessage("Story deleted successfully.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteJob = async (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    await apiService.deleteJob(jobId);
    setToastMessage("Job posting removed by Manager.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAcceptFollow = (notifId: string, authorName?: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
    setToastMessage(`Accepted connection request${authorName ? ` from ${authorName}` : ''}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeclineFollow = (notifId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
    setToastMessage("Declined connection request.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Post Actions (Persisted to database)
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
    apiService.likePost(postId);
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
    apiService.savePost(postId);
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
    apiService.votePoll(postId, optionId);
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
      const found = users.find(u => 
        u.id === userOrId || 
        u.username.toLowerCase() === userOrId.toLowerCase() || 
        u.fullName.toLowerCase() === userOrId.toLowerCase()
      );
      if (found) {
        setSelectedProfileUser(found);
        setCurrentTab('profile');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setSelectedProfileUser(userOrId);
      setCurrentTab('profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSwitchPersona = (user: UserProfile) => {
    setCurrentUser(user);
    setSelectedProfileUser(null);
    setToastMessage(`Switched active profile to ${user.fullName}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Wipe / Reset all test data
  const handleClearAllTestData = async () => {
    if (window.confirm("Are you sure you want to wipe all demo/test data? This will clear all posts, stories, and notifications to give you a completely clean test slate.")) {
      setPosts([]);
      setStories([]);
      setNotifications([]);
      await apiService.clearAllData();
      setToastMessage("All demo data removed! Clean slate ready for testing.");
      setTimeout(() => setToastMessage(null), 3500);
    }
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
      
      {/* Main Container: Responsive App Layout */}
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
          isManagerMode={isManagerMode}
          onToggleManagerMode={() => {
            setIsManagerMode(prev => {
              const nextVal = !prev;
              setToastMessage(nextVal ? "ðŸ›¡ï¸ Switched to Manager Mode (Admin & Moderation active)" : "Switched to Clinician User Mode");
              setTimeout(() => setToastMessage(null), 3500);
              return nextVal;
            });
          }}
          onSwitchUser={(u) => setCurrentUser(u)}
          onClearAllTestData={handleClearAllTestData}
          onCreatePost={() => {
            setCreateModalMode('post');
            setShowCreateModal(true);
          }}
          onOpenNotifications={() => setShowNotificationsDrawer(true)}
          onOpenMessages={() => setShowMessagesDrawer(true)}
          onOpenAuth={() => setShowAuthModal(true)}
          unreadNotificationsCount={notifications.filter(n => !n.isRead).length}
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
                      <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.stats.followingCount ?? 0}</span>
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500">Following</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentTab('profile')}
                    className="w-full mt-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  >
                    View Portfolio
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
                    onOpenCreateStory={() => {
                      setCreateModalMode('story');
                      setShowCreateModal(true);
                    }}
                    onDeleteStory={handleDeleteStory}
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
                        {tag === 'All' ? 'ðŸŽ¯ For You' : tag === '#Professors' ? 'ðŸ‘¨â€ðŸ« Professors & Faculty' : tag === '#Internships' ? 'ðŸ¥ Clinical Internships' : tag}
                      </button>
                    ))}
                  </div>

                  {/* Home Feed Post Cards with Algorithmic Transparency */}
                  <div className="space-y-4">
                    {filteredPosts.length === 0 ? (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 text-center shadow-xs my-3 animate-in fade-in">
                        <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-3.5 border border-sky-100 dark:border-sky-800">
                          <Sparkles className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                          Clean Slate â€¢ Ready for Testing
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
                          All demo posts have been removed. You can now test sharing clinical cases, bedside discussions, or medical pearls.
                        </p>
                        <button
                          onClick={() => {
                            setCreateModalMode('post');
                            setShowCreateModal(true);
                          }}
                          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer inline-flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>Create Your First Clinical Post</span>
                        </button>
                      </div>
                    ) : (
                      filteredPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          currentUser={currentUser}
                          onLike={handleLikePost}
                          onSave={handleSavePost}
                          onVotePoll={handleVotePoll}
                          onSelectUser={handleSelectUser}
                          onDeletePost={handleDeletePost}
                          onConnectAuthor={(authorId) => {
                            const author = users.find(u => u.id === authorId);
                            setToastMessage(`Connection request sent to ${author?.fullName || 'Colleague'}!`);
                            setTimeout(() => setToastMessage(null), 3000);
                          }}
                        />
                      ))
                    )}
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
                    onSelectUser={handleSelectUser}
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
                  isManagerMode={isManagerMode}
                  onDeleteJob={handleDeleteJob}
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
                        Return to My Profile â†’
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
                    onOpenHelpCenter={() => setShowSupportModal(true)}
                    onOpenSupportModal={() => setShowSupportModal(true)}
                    onUpdateProfile={(updated) => {
                      setCurrentUser(prev => ({ ...prev, ...updated }));
                      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updated } : u));
                      setToastMessage("Profile updated successfully!");
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    onRequestMentorship={(prof) => setMentoringProfessor(prof)}
                    isDarkMode={isDarkMode}
                    onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
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
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Nov 14-16 â€¢ 6 CME Credits</p>
                    <button
                      onClick={() => setCurrentTab('opportunities')}
                      className="mt-2 text-[10px] text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
                    >
                      View Venue & RSVP â†’
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

      {/* Notifications Drawer (Strictly ONLY Conferences, Jobs, and Follows - Zero Likes or Comments) */}
      {showNotificationsDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 h-full p-5 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200 border-l border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Professional Alerts</h3>
                <span className="text-[10px] bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-bold px-2 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              </div>
              <button 
                onClick={() => setShowNotificationsDrawer(false)} 
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer transition"
                title="Close Alerts (X)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 py-4 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">You're All Caught Up!</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    No pending conference invitations, job postings, or follow requests.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isConference = notif.type === 'CONFERENCE';
                  const isJob = notif.type === 'JOB_UPDATE' || notif.type === 'JOB_APPLICATION';
                  const isFollowRequest = notif.type === 'FOLLOW_REQUEST';
                  const isFollowAccepted = notif.type === 'FOLLOW_ACCEPTED';

                  return (
                    <div 
                      key={notif.id}
                      className={`p-3.5 rounded-2xl border transition-all text-xs ${
                        notif.isRead 
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-90' 
                          : 'bg-white dark:bg-slate-800 border-sky-200 dark:border-sky-800/80 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                          isConference 
                            ? 'bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400' 
                            : isJob 
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' 
                            : isFollowRequest 
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' 
                            : 'bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400'
                        }`}>
                          {isConference && <Calendar className="w-4 h-4" />}
                          {isJob && <Briefcase className="w-4 h-4" />}
                          {isFollowRequest && <UserPlus className="w-4 h-4" />}
                          {isFollowAccepted && <UserCheck className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white text-xs leading-snug">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                            {notif.description}
                          </p>
                          <span className="inline-block text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                            {notif.timestamp}
                          </span>

                          {/* Follow Request Action Controls */}
                          {isFollowRequest && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                              <button
                                onClick={() => handleAcceptFollow(notif.id, notif.title)}
                                className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold rounded-lg transition cursor-pointer"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleDeclineFollow(notif.id)}
                                className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-semibold rounded-lg transition cursor-pointer"
                              >
                                Decline
                              </button>
                            </div>
                          )}

                          {/* Quick Navigate Button for Jobs / Conferences */}
                          {(isConference || isJob) && (
                            <button
                              onClick={() => {
                                setShowNotificationsDrawer(false);
                                setCurrentTab('opportunities');
                              }}
                              className="mt-2 text-[10px] text-sky-600 dark:text-sky-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>View details in Opportunities</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {notifications.length > 0 && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                    setToastMessage("All alerts marked as read.");
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Mark All as Read
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Support Desk Modal (medmedia1409@gmail.com) */}
      <SupportModal
        isOpen={showSupportModal}
        currentUser={currentUser}
        onClose={() => setShowSupportModal(false)}
      />

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
        onLoginSuccess={(newUser, initialPostContent) => {
          setUsers([newUser, ...users]);
          setCurrentUser(newUser);
          if (initialPostContent && initialPostContent.trim()) {
            const introPost: Post = {
              id: `post-${Date.now()}`,
              authorId: newUser.id,
              authorName: newUser.fullName,
              authorUsername: newUser.username,
              authorAvatar: newUser.avatarUrl,
              authorRole: newUser.role,
              authorSpecializationOrDiscipline: newUser.role === 'DOCTOR' 
                ? (newUser.doctorDetails?.specialization || 'Clinical Specialist')
                : (newUser.studentDetails?.discipline.replace('_', ' ') || 'Medical Student'),
              isVerified: newUser.verificationStatus === 'VERIFIED',
              postType: 'CLINICAL_DISCUSSION',
              content: initialPostContent.trim(),
              clinicalTags: [
                newUser.role === 'DOCTOR' ? 'ClinicalPractice' : 'StudentIntro',
                'MedMediaCommunity',
                'PeerDiscussion'
              ],
              likesCount: 0,
              commentsCount: 0,
              savesCount: 0,
              sharesCount: 0,
              isLiked: false,
              isSaved: false,
              targetAudience: 'ALL',
              recommendationReason: 'Welcome Introductory Post',
              createdAt: 'Just now'
            };
            setPosts([introPost, ...posts]);
            setToastMessage(`Welcome ${newUser.fullName}! Your introductory clinical post is live.`);
            setTimeout(() => setToastMessage(null), 4000);
          } else {
            setToastMessage(`Welcome to MedMedia, ${newUser.fullName}!`);
            setTimeout(() => setToastMessage(null), 3000);
          }
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
      />

      {/* Create Post & Story Creator Studio Modal (Slide 5: Top + button) */}
      <CreatePostModal
        key={createModalMode}
        isOpen={showCreateModal}
        currentUser={currentUser}
        initialMode={createModalMode}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={(newPost) => {
          setPosts([newPost, ...posts]);
          apiService.createPost(newPost);
          setToastMessage("Clinical post published & saved to laptop database & MySQL!");
          setTimeout(() => setToastMessage(null), 3500);
        }}
        onStoryCreated={(newStory) => {
          setStories([newStory, ...stories]);
          setToastMessage("24h Story published (30s limit) & saved to MySQL!");
          setTimeout(() => setToastMessage(null), 3500);
        }}
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

