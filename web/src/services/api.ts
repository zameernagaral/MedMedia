import { Post, Medclip, Job, OpportunityItem, UserProfile, Story } from '../types';
import { 
  INITIAL_POSTS, 
  INITIAL_CLIPS, 
  INITIAL_JOBS, 
  INITIAL_OPPORTUNITIES, 
  INITIAL_USERS,
  INITIAL_STORIES
} from '../data/mockData';

const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

export const apiService = {
  // 1. GET POSTS (Persistent laptop database)
  async getPosts(): Promise<Post[]> {
    try {
      const res = await fetch(`${API_BASE}/posts`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (data.posts && Array.isArray(data.posts) && data.posts.length > 0) {
        localStorage.setItem('medmedia_posts_cache', JSON.stringify(data.posts));
        return data.posts;
      }
    } catch (e) {
      console.warn('[MedMedia API] Backend not reachable, using local cache:', e);
    }

    // LocalStorage fallback
    const cached = localStorage.getItem('medmedia_posts_cache');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return INITIAL_POSTS;
  },

  // 2. CREATE POST (Save to laptop database disk)
  async createPost(post: Partial<Post>): Promise<Post> {
    let savedPost: Post | null = null;
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
      });
      if (res.ok) {
        const data = await res.json();
        savedPost = data.post;
      }
    } catch (e) {
      console.warn('[MedMedia API] Could not reach backend, caching locally:', e);
    }

    if (!savedPost) {
      savedPost = {
        id: `post-${Date.now()}`,
        authorId: post.authorId || 'usr-local',
        authorName: post.authorName || 'Verified Clinician',
        authorUsername: post.authorUsername || 'clinician',
        authorAvatar: post.authorAvatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop',
        authorRole: post.authorRole || 'DOCTOR',
        authorSpecializationOrDiscipline: post.authorSpecializationOrDiscipline || 'General Medicine',
        isVerified: true,
        postType: post.postType || 'CLINICAL_DISCUSSION',
        content: post.content || '',
        mediaUrls: post.mediaUrls,
        linkUrl: post.linkUrl,
        clinicalTags: post.clinicalTags || ['#ClinicalDiscussion'],
        casePoll: post.casePoll,
        likesCount: 0,
        commentsCount: 0,
        savesCount: 0,
        sharesCount: 0,
        isLiked: false,
        isSaved: false,
        createdAt: 'Just now'
      };
    }

    // Update local cache
    const current = await this.getPosts();
    const updated = [savedPost, ...current.filter(p => p.id !== savedPost?.id)];
    localStorage.setItem('medmedia_posts_cache', JSON.stringify(updated));

    return savedPost;
  },

  // 3. GET USERS (Persistent laptop database)
  async getUsers(): Promise<UserProfile[]> {
    try {
      const res = await fetch(`${API_BASE}/users`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (data.users && Array.isArray(data.users) && data.users.length > 0) {
        localStorage.setItem('medmedia_users_cache', JSON.stringify(data.users));
        return data.users;
      }
    } catch (e) {
      console.warn('[MedMedia API] Backend not reachable for users, using local cache:', e);
    }

    const cached = localStorage.getItem('medmedia_users_cache');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return INITIAL_USERS;
  },

  // 4. REGISTER NEW USER (Save to laptop database disk)
  async registerUser(userData: any): Promise<UserProfile> {
    let savedUser: UserProfile | null = null;
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        const data = await res.json();
        savedUser = data.user;
      }
    } catch (e) {
      console.warn('[MedMedia API] Backend registration error, saving locally:', e);
    }

    if (!savedUser) {
      savedUser = {
        id: `usr-${Date.now()}`,
        fullName: userData.fullName || 'Verified Medical Member',
        username: userData.username || 'verified_member',
        email: userData.email || 'user@medmedia.health',
        avatarUrl: userData.role === 'DOCTOR'
          ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
        role: userData.role || 'DOCTOR',
        verificationStatus: 'VERIFIED',
        badgeTitle: userData.role === 'DOCTOR' ? 'Verified Doctor' : 'Verified Student Scholar',
        bio: userData.bio || 'Verified Healthcare Member on MedMedia.',
        doctorDetails: userData.doctorDetails,
        studentDetails: userData.studentDetails,
        stats: { postsCount: 0, followersCount: 15, connectionsCount: 8 }
      };
    }

    // Persist to user cache
    const currentUsers = await this.getUsers();
    const updatedUsers = [savedUser, ...currentUsers.filter(u => u.id !== savedUser?.id)];
    localStorage.setItem('medmedia_users_cache', JSON.stringify(updatedUsers));
    localStorage.setItem('medmedia_current_user', JSON.stringify(savedUser));

    return savedUser;
  },

  // 5. LOGIN
  async loginUser(identifier: string, password?: string): Promise<UserProfile | null> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localStorage.setItem('medmedia_current_user', JSON.stringify(data.user));
          return data.user;
        }
      }
    } catch {}

    const users = await this.getUsers();
    const match = users.find(u => 
      u.email.toLowerCase() === identifier.toLowerCase() || 
      u.username.toLowerCase() === identifier.toLowerCase()
    );
    if (match) {
      localStorage.setItem('medmedia_current_user', JSON.stringify(match));
      return match;
    }
    return null;
  },

  async getClips(): Promise<Medclip[]> {
    try {
      const res = await fetch(`${API_BASE}/clips`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.clips || INITIAL_CLIPS;
    } catch {
      return INITIAL_CLIPS;
    }
  },

  async getJobs(): Promise<Job[]> {
    try {
      const res = await fetch(`${API_BASE}/opportunities/jobs`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.jobs || INITIAL_JOBS;
    } catch {
      return INITIAL_JOBS;
    }
  },

  async getOpportunities(): Promise<OpportunityItem[]> {
    try {
      const res = await fetch(`${API_BASE}/opportunities/hub`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.opportunities || INITIAL_OPPORTUNITIES;
    } catch {
      return INITIAL_OPPORTUNITIES;
    }
  },

  async likePost(postId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/like`, { method: 'POST' });
      const data = await res.json();
      return data.isLiked;
    } catch {
      return false;
    }
  },

  async savePost(postId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/save`, { method: 'POST' });
      const data = await res.json();
      return data.isSaved;
    } catch {
      return false;
    }
  },

  async votePoll(postId: string, optionId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/poll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId })
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // 7. GET STORIES (Local database & MySQL)
  async getStories(): Promise<Story[]> {
    try {
      const res = await fetch(`${API_BASE}/stories`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (data.stories && Array.isArray(data.stories) && data.stories.length > 0) {
        localStorage.setItem('medmedia_stories_cache', JSON.stringify(data.stories));
        return data.stories;
      }
    } catch (e) {
      console.warn('[MedMedia API] Backend not reachable for stories:', e);
    }
    const cached = localStorage.getItem('medmedia_stories_cache');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return INITIAL_STORIES;
  },

  // 8. CREATE STORY (Device upload with caption & hashtags saved to MySQL & disk)
  async createStory(storyData: {
    userId: string;
    userName: string;
    userAvatar: string;
    mediaUrl: string;
    caption: string;
    clinicalTags?: string[];
  }): Promise<Story> {
    let savedStory: Story | null = null;
    try {
      const res = await fetch(`${API_BASE}/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyData)
      });
      if (res.ok) {
        const data = await res.json();
        savedStory = data.story;
      }
    } catch (e) {
      console.warn('[MedMedia API] Failed to post story to backend:', e);
    }

    if (!savedStory) {
      savedStory = {
        id: `story-${Date.now()}`,
        userId: storyData.userId,
        userName: storyData.userName,
        userAvatar: storyData.userAvatar,
        mediaUrl: storyData.mediaUrl,
        caption: storyData.caption,
        timestamp: 'Just now',
        isViewed: false
      };
      if (storyData.clinicalTags) {
        (savedStory as any).clinicalTags = storyData.clinicalTags;
      }
    }

    try {
      const existingRaw = localStorage.getItem('medmedia_stories_cache');
      const list: Story[] = existingRaw ? JSON.parse(existingRaw) : [...INITIAL_STORIES];
      list.unshift(savedStory);
      localStorage.setItem('medmedia_stories_cache', JSON.stringify(list));
    } catch {}

    return savedStory;
  }
};
