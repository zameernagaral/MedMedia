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
import { Smartphone, Monitor, ShieldCheck, Info, X } from 'lucide-react';

export const App: React.FC = () => {
  // Application State
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [stories, setStories] = useState(INITIAL_STORIES);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [clips, setClips] = useState(INITIAL_CLIPS);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [opportunities, setOpportunities] = useState(INITIAL_OPPORTUNITIES);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);

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
            <span>{isMobileFrameMode ? 'Wide Web Mode' : 'Mobile App Frame Preview'}</span>
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
          : 'max-w-4xl min-h-screen bg-white shadow-sm'
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
        <main className="p-4 sm:p-6">
          
          {/* TAB 1: HOME FEED (Slide 5 & 7: Stories, Text, tweets, Images, Links, Discussions - No reels) */}
          {currentTab === 'home' && (
            <div>
              {/* Stories Bar (Slide 5: Story update - Accessory feature) */}
              <StoriesBar
                stories={stories}
                currentUser={currentUser}
                onAddStory={() => alert("Story creation camera opened. Capture your 24h clinical update.")}
              />

              {/* Feed Header info */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-1 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <span>Clinical & Medical Discussions Feed</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  (Clean feed • No shorts/reels)
                </span>
              </div>

              {/* Home Feed Post Cards */}
              <div className="space-y-4">
                {posts.map((post) => (
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

      {/* Direct Messages Drawer */}
      {showMessagesDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm bg-white h-full p-5 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">Clinical Messages</h3>
              <button onClick={() => setShowMessagesDrawer(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-3 py-4">
              <div className="p-3.5 bg-slate-50 hover:bg-sky-50 rounded-2xl border border-slate-200 cursor-pointer transition flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1594824813581-2292f725350c?w=100&h=100&fit=crop" className="w-10 h-10 rounded-full object-cover" alt="" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Dr. Priya Nair</h4>
                  <p className="text-[11px] text-slate-500 truncate max-w-[180px]">Regarding the ETV surgical protocol...</p>
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 hover:bg-sky-50 rounded-2xl border border-slate-200 cursor-pointer transition flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" className="w-10 h-10 rounded-full object-cover" alt="" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Rohan Verma</h4>
                  <p className="text-[11px] text-slate-500 truncate max-w-[180px]">Thank you for the cardiology mentoring advice, Doctor!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
