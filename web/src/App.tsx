import React, { useState } from 'react';
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
import { 
  INITIAL_USERS, 
  INITIAL_STORIES, 
  INITIAL_POSTS, 
  INITIAL_CLIPS, 
  INITIAL_JOBS, 
  INITIAL_OPPORTUNITIES, 
  INITIAL_SESSIONS 
} from './data/mockData';
import { UserProfile, Post } from './types';
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
  GraduationCap
} from 'lucide-react';

export const App: React.FC = () => {
  // Application State
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
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


  const filteredPosts = posts.filter(p => {
    if (feedFilterTag === 'All') return true;
    return p.clinicalTags.some(t => t.toLowerCase() === feedFilterTag.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center">
      
      {/* Top Banner with Device Frame Preview Switcher for Desktop Testing */}
      <div className="w-full bg-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between z-50 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold tracking-wide uppercase text-[10px] text-sky-400">
            MedMedia Healthcare System v1.0
          </span>
          <span className="hidden md:inline text-slate-400">• Doctor/Student Tiered Platform</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFrameMode(!isMobileFrameMode)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium text-[11px]"
          >
            {isMobileFrameMode ? <Monitor className="w-3.5 h-3.5 text-sky-400" /> : <Smartphone className="w-3.5 h-3.5 text-sky-400" />}
            <span>{isMobileFrameMode ? 'Desktop 3-Column View' : 'Mobile Phone Preview'}</span>
          </button>

          <button
            onClick={() => setShowAuthModal(true)}
            className="px-3 py-1 bg-sky-600 hover:bg-sky-500 font-bold text-white rounded-full transition text-[11px]"
          >
            Switch / Register Account
          </button>
        </div>
      </div>

      {/* Main Container: Responsive Wrapper (with optional phone bezel) */}
      <div className={`w-full transition-all duration-300 ${
        isMobileFrameMode
          ? 'max-w-[420px] my-6 bg-white shadow-2xl rounded-[40px] border-[8px] border-slate-900 overflow-hidden min-h-[850px]'
          : 'max-w-6xl min-h-screen bg-slate-50/50 shadow-sm'
      }`}>
        
        {/* Top Header Bar (Slide 5: Create +, Medmedia, Notification bell, Message chat bubble) */}
        <TopNav
          currentUser={currentUser}
          availableUsers={users}
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
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
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
                  <h3 className="text-sm font-bold text-slate-900 mt-2">{currentUser.fullName}</h3>
                  <p className="text-xs font-semibold text-sky-600">@{currentUser.username}</p>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{currentUser.bio}</p>

                  <div className="flex justify-around mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{posts.filter(p => p.authorId === currentUser.id).length}</span>
                      <span className="block text-[10px] text-slate-400">Posts</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">{currentUser.stats.followersCount}</span>
                      <span className="block text-[10px] text-slate-400">Followers</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">{currentUser.stats.connectionsCount}</span>
                      <span className="block text-[10px] text-slate-400">Network</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentTab('profile')}
                    className="w-full mt-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition"
                  >
                    View Verified Portfolio
                  </button>
                </div>

                {/* Quick Navigation Shortcuts */}
                <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">Sections</span>
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
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                          currentTab === tab.id
                            ? 'bg-sky-50 text-sky-700 font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
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
                  {/* Stories Bar (Slide 5: Story update - Accessory feature) */}
                  <StoriesBar
                    stories={stories}
                    currentUser={currentUser}
                    onAddStorySuccess={(newStory) => setStories([newStory, ...stories])}
                  />

                  {/* Filter Pills Bar */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mb-3 py-1">
                    {['All', '#Cardiology', '#ECGChallenge', '#Neurosurgery', '#Pharmacology', '#IntensiveCare'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setFeedFilterTag(tag)}
                        className={`text-xs px-3 py-1 rounded-full font-semibold transition whitespace-nowrap ${
                          feedFilterTag === tag
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Home Feed Post Cards */}
                  <div className="space-y-4">
                    {filteredPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        onLike={handleLikePost}
                        onSave={handleSavePost}
                        onVotePoll={handleVotePoll}
                        onConnectAuthor={(authorId) => {
                          const author = users.find(u => u.id === authorId);
                          alert(`Connection request sent to ${author?.fullName || 'Colleague'}!`);
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
                    clips={clips}
                    currentUser={currentUser}
                    onLikeClip={handleLikeClip}
                    onSaveClip={handleSaveClip}
                    onConnectAuthor={(name) => alert(`Connection request sent to ${name}!`)}
                  />
                </div>
              )}

              {/* TAB 3: SEARCH & NETWORKING (Slide 10: Accounts, Community, Associations, Posts, Job Offers, Hospital) */}
              {currentTab === 'search' && (
                <SearchAndNetworking
                  currentUser={currentUser}
                  onSelectUser={(u) => {
                    setCurrentUser(u);
                    setCurrentTab('profile');
                  }}
                  onConnectSuggestion={(name) => alert(`Networking request sent to ${name}!`)}
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
                <ProfileView
                  user={currentUser}
                  posts={posts.filter(p => p.authorId === currentUser.id)}
                  currentUser={currentUser}
                  deviceSessions={sessions}
                  onRevokeSession={handleRevokeSession}
                  onLikePost={handleLikePost}
                  onSavePost={handleSavePost}
                  onConnectUser={(id) => alert(`Connected with user #${id}!`)}
                  onOpenHelpCenter={() => alert("MedMedia Help & Ethics Desk opened.")}
                />
              )}

            </main>

            {/* DESKTOP RIGHT SIDEBAR (Only in wide mode) */}
            {!isMobileFrameMode && (
              <aside className="hidden lg:block lg:col-span-3 space-y-4">
                
                {/* Upcoming CME Events Widget (Slide 8) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-600" />
                      Upcoming CME Events
                    </h4>
                    <span className="text-[10px] text-sky-600 font-bold">Slide 8</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <p className="font-bold text-slate-800">77th Annual Medical Congress</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Nov 14-16 • 6 CME Credits</p>
                    <button
                      onClick={() => setCurrentTab('opportunities')}
                      className="mt-2 text-[10px] text-sky-600 font-bold hover:underline"
                    >
                      View Venue & RSVP →
                    </button>
                  </div>
                </div>

                {/* Alumni Suggestions Widget (Slide 10) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Alumni Connection
                    </h4>
                    <span className="text-[10px] text-sky-600 font-bold">Slide 10</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop"
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900">Dr. Sandeep Kulkarni</p>
                      <p className="text-[10px] text-slate-500">Cardiothoracic Surgeon</p>
                      <span className="text-[9px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded font-semibold">
                        AIIMS Alumni
                      </span>
                    </div>
                    <button
                      onClick={() => alert("Connected with Dr. Sandeep Kulkarni!")}
                      className="p-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Urgent Locum Shift Widget (Slide 8 & 9) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                      Urgent Locum Duty
                    </h4>
                    <span className="text-[10px] text-emerald-600 font-bold">Open</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700">Manipal Hospital Emergency Casualty</p>
                  <p className="text-[10px] text-slate-500">Weekend 12h Trauma Coverage</p>
                  <button
                    onClick={() => setCurrentTab('opportunities')}
                    className="mt-2 w-full py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 hover:bg-emerald-100 transition"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm bg-white h-full p-5 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">Notifications</h3>
              <button onClick={() => setShowNotificationsDrawer(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-3 py-4">
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs">
                <p className="font-bold text-sky-950">Dr. Priya Nair liked your STEMI ECG challenge post.</p>
                <span className="text-[10px] text-sky-700">10 mins ago</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <p className="font-bold text-slate-900">Medical Council verified your board registration status.</p>
                <span className="text-[10px] text-slate-500">1 hour ago</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <p className="font-bold text-slate-900">New Locum Emergency shift posted in Bangalore.</p>
                <span className="text-[10px] text-slate-500">3 hours ago</span>
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

    </div>
  );
};

export default App;
