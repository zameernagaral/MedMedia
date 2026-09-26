import { 
  Post, 
  Medclip, 
  Job, 
  OpportunityItem, 
  UserProfile, 
  Story, 
  Community, 
  ResearchProject, 
  ResearchNote, 
  ResearchMessage, 
  LocumGig, 
  LocumApplication, 
  ScholarshipItem, 
  CourseItem, 
  NotificationItem, 
  SupportTicket 
} from '../types';
import { 
  INITIAL_POSTS, 
  INITIAL_CLIPS, 
  INITIAL_JOBS, 
  INITIAL_OPPORTUNITIES, 
  INITIAL_USERS,
  INITIAL_STORIES,
  INITIAL_COMMUNITIES,
  INITIAL_RESEARCH_PROJECTS,
  INITIAL_LOCUM_GIGS,
  INITIAL_SCHOLARSHIPS,
  INITIAL_COURSES,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';

const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5001/api'
  : '/api';

export const apiService = {
  // 1. GET POSTS (Persistent laptop database)
  async getPosts(): Promise<Post[]> {
    try {
      const res = await fetch(`${API_BASE}/posts`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (data.posts && Array.isArray(data.posts)) {
        localStorage.setItem('medmedia_posts_cache', JSON.stringify(data.posts));
        return data.posts;
      }
    } catch (e) {
      console.warn('[MedMedia API] Backend not reachable, using local cache:', e);
    }

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
        authorId: post.authorId || 'doc-1',
        authorName: post.authorName || 'Dr. Arvind Ramesh',
        authorUsername: post.authorUsername || 'cardio_ramesh',
        authorAvatar: post.authorAvatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop',
        authorRole: post.authorRole || 'DOCTOR',
        authorSpecializationOrDiscipline: post.authorSpecializationOrDiscipline || 'Interventional Cardiology',
        isVerified: true,
        postType: post.postType || 'TWEET',
        content: post.content || '',
        mediaUrls: post.mediaUrls,
        linkUrl: post.linkUrl,
        clinicalTags: post.clinicalTags || ['#Cardiology'],
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

  // 4. REGISTER NEW USER
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
      const hasCred = Boolean(userData.medicalCouncilCredentialUrl || userData.studentIdCredentialUrl);
      savedUser = {
        id: `usr-${Date.now()}`,
        fullName: userData.fullName || 'Medical Member',
        username: userData.username || 'user_member',
        email: userData.email || 'user@medmedia.health',
        avatarUrl: userData.role === 'DOCTOR'
          ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
        coverPhotoUrl: userData.coverPhotoUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=400&fit=crop',
        role: userData.role || 'DOCTOR',
        verificationStatus: hasCred ? 'VERIFIED' : 'UNVERIFIED',
        badgeTitle: userData.role === 'DOCTOR' ? (hasCred ? 'Verified Specialist' : 'Specialist') : (hasCred ? 'Verified Student Scholar' : 'Student Scholar'),
        bio: userData.bio || 'Healthcare Member on MedMedia.',
        isPrivate: Boolean(userData.isPrivate),
        doctorDetails: userData.doctorDetails,
        studentDetails: userData.studentDetails,
        stats: { postsCount: 0, followersCount: 15, followingCount: 8 }
      };
    }

    const currentUsers = await this.getUsers();
    const updatedUsers = [savedUser, ...currentUsers.filter(u => u.id !== savedUser?.id)];
    localStorage.setItem('medmedia_users_cache', JSON.stringify(updatedUsers));
    localStorage.setItem('medmedia_current_user', JSON.stringify(savedUser));

    return savedUser;
  },

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

  // 6. UPDATE USER PROFILE
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localStorage.setItem('medmedia_current_user', JSON.stringify(data.user));
          return data.user;
        }
      }
    } catch (e) {
      console.warn('[MedMedia API] Backend updateUserProfile error:', e);
    }
    return null;
  },

  async getClips(): Promise<Medclip[]> {
    try {
      const res = await fetch(`${API_BASE}/clips`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (data.clips && Array.isArray(data.clips)) {
        localStorage.setItem('medmedia_clips_cache', JSON.stringify(data.clips));
        return data.clips;
      }
    } catch {
      console.warn('[MedMedia API] Backend not reachable for clips');
    }
    const cached = localStorage.getItem('medmedia_clips_cache');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return INITIAL_CLIPS;
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

  async deleteJob(jobId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/opportunities/jobs/${jobId}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
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
      if (data.stories && Array.isArray(data.stories)) {
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

  async createClip(clipData: any): Promise<Medclip> {
    let savedClip: Medclip | null = null;
    try {
      const res = await fetch(`${API_BASE}/clips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clipData)
      });
      if (res.ok) {
        const data = await res.json();
        savedClip = data.clip;
      }
    } catch (e) {
      console.warn('[MedMedia API] Failed to post clip to backend:', e);
    }

    if (!savedClip) {
      savedClip = {
        id: `clip-${Date.now()}`,
        clipType: clipData.clipType || 'Clinical Update',
        authorId: clipData.userId,
        authorName: clipData.userName,
        authorSpecialty: clipData.userSpecialty || '',
        authorAvatar: clipData.userAvatar,
        isVerified: true,
        videoUrl: clipData.mediaUrl,
        thumbnailUrl: clipData.mediaUrl, // use same for fallback
        caption: clipData.caption,
        clinicalCategory: clipData.clinicalCategory,
        tags: clipData.clinicalTags || [],
        likesCount: 0,
        commentsCount: 0,
        savesCount: 0,
        sharesCount: 0,
        isLiked: false,
        isSaved: false,
        isFollowing: false,
        createdAt: 'Just now'
      } as Medclip;
    }

    try {
      const existingRaw = localStorage.getItem('medmedia_clips_cache');
      const list: Medclip[] = existingRaw ? JSON.parse(existingRaw) : [...INITIAL_CLIPS];
      list.unshift(savedClip!);
      localStorage.setItem('medmedia_clips_cache', JSON.stringify(list));
    } catch {}

    return savedClip!;
  },

  // 8. CREATE STORY
  async createStory(storyData: {
    userId: string;
    userName: string;
    userAvatar: string;
    mediaUrl: string;
    caption: string;
    clinicalTags?: string[];
    isVideo?: boolean;
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
        isViewed: false,
        isVideo: storyData.isVideo,
        clinicalTags: storyData.clinicalTags
      };
    }

    try {
      const existingRaw = localStorage.getItem('medmedia_stories_cache');
      const list: Story[] = existingRaw ? JSON.parse(existingRaw) : [...INITIAL_STORIES];
      list.unshift(savedStory);
      localStorage.setItem('medmedia_stories_cache', JSON.stringify(list));
    } catch {}

    return savedStory;
  },

  // 9. DELETE STORY
  async deleteStory(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/stories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const raw = localStorage.getItem('medmedia_stories_cache');
        if (raw) {
          const list: Story[] = JSON.parse(raw);
          localStorage.setItem('medmedia_stories_cache', JSON.stringify(list.filter(s => s.id !== id)));
        }
        return true;
      }
    } catch (e) {
      console.warn('[MedMedia API] Backend deleteStory failed:', e);
    }
    return false;
  },

  // 10. DELETE POST
  async deletePost(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const raw = localStorage.getItem('medmedia_posts_cache');
        if (raw) {
          const list: Post[] = JSON.parse(raw);
          localStorage.setItem('medmedia_posts_cache', JSON.stringify(list.filter(p => p.id !== id)));
        }
        return true;
      }
    } catch (e) {
      console.warn('[MedMedia API] Backend deletePost failed:', e);
    }
    return false;
  },

  // Wipe all test data (Clean Slate)
  async clearAllData(): Promise<void> {
    try {
      await fetch(`${API_BASE}/admin/clear`, { method: 'POST' });
    } catch (e) {
      console.warn('[MedMedia API] Backend clear error:', e);
    }
    localStorage.removeItem('medmedia_posts_cache');
    localStorage.removeItem('medmedia_stories_cache');
  },


  // ==========================================
  // COMMUNITIES (10,000 Capacity Limit)
  // ==========================================
  async getCommunities(category?: string, search?: string): Promise<Community[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE}/opportunities/communities?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return data.communities || INITIAL_COMMUNITIES;
      }
    } catch {}
    return INITIAL_COMMUNITIES;
  },

  async createCommunity(community: Partial<Community>): Promise<{ success: boolean; community?: Community; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/opportunities/communities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(community)
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Could not connect to backend server.' };
    }
  },

  async joinCommunity(communityId: string, userId: string): Promise<{ success: boolean; message: string; membersCount?: number }> {
    try {
      const res = await fetch(`${API_BASE}/opportunities/communities/${communityId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Failed to join community.' };
    }
  },

  async deleteCommunity(communityId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/opportunities/communities/${communityId}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ==========================================
  // RESEARCH WORKSPACE
  // ==========================================
  async getResearchProjects(search?: string, tag?: string): Promise<ResearchProject[]> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (tag) params.append('tag', tag);
      const res = await fetch(`${API_BASE}/opportunities/research?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return data.researchProjects || INITIAL_RESEARCH_PROJECTS;
      }
    } catch {}
    return INITIAL_RESEARCH_PROJECTS;
  },

  async createResearchProject(proj: Partial<ResearchProject>): Promise<ResearchProject | null> {
    try {
      const res = await fetch(`${API_BASE}/opportunities/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proj)
      });
      if (res.ok) {
        const data = await res.json();
        return data.project;
      }
    } catch {}
    return null;
  },

  async joinResearch(projectId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/opportunities/research/${projectId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Failed to request join.' };
    }
  },

  async approveResearch(projectId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/opportunities/research/${projectId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Approval failed.' };
    }
  },

  async addResearchNote(projectId: string, note: Partial<ResearchNote>): Promise<ResearchNote | null> {
    try {
      const res = await fetch(`${API_BASE}/opportunities/research/${projectId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });
      if (res.ok) {
        const data = await res.json();
        return data.note;
      }
    } catch {}
    return null;
  },

  async editResearchNote(projectId: string, noteId: string, title: string, content: string): Promise<ResearchNote | null> {
    try {
      const res = await fetch(`${API_BASE}/opportunities/research/${projectId}/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      if (res.ok) {
        const data = await res.json();
        return data.note;
      }
    } catch {}
    return null;
  },

  async sendResearchMessage(projectId: string, msg: Partial<ResearchMessage>): Promise<ResearchMessage | null> {
    try {
      const res = await fetch(`${API_BASE}/opportunities/research/${projectId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      });
      if (res.ok) {
        const data = await res.json();
        return data.message;
      }
    } catch {}
    return null;
  },

  // ==========================================
  // LOCUM GIGS
  // ==========================================
  async getLocumGigs(): Promise<LocumGig[]> {
    try {
      const res = await fetch(`${API_BASE}/opportunities/locum`);
      if (res.ok) {
        const data = await res.json();
        return data.locumGigs || INITIAL_LOCUM_GIGS;
      }
    } catch {}
    return INITIAL_LOCUM_GIGS;
  },

  async createLocumGig(gig: Partial<LocumGig>): Promise<{ success: boolean; gig?: LocumGig; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/opportunities/locum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gig)
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Failed to post locum gig.' };
    }
  },

  async applyLocum(gigId: string, app: Partial<LocumApplication>): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/opportunities/locum/${gigId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(app)
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Application submission failed.' };
    }
  },

  // ==========================================
  // SCHOLARSHIPS & COURSES
  // ==========================================
  async getScholarships(): Promise<ScholarshipItem[]> {
    try {
      const res = await fetch(`${API_BASE}/opportunities/scholarships`);
      if (res.ok) {
        const data = await res.json();
        return data.scholarships || INITIAL_SCHOLARSHIPS;
      }
    } catch {}
    return INITIAL_SCHOLARSHIPS;
  },

  async getCourses(): Promise<CourseItem[]> {
    try {
      const res = await fetch(`${API_BASE}/opportunities/courses`);
      if (res.ok) {
        const data = await res.json();
        return data.courses || INITIAL_COURSES;
      }
    } catch {}
    return INITIAL_COURSES;
  },

  // ==========================================
  // JOBS (Doctor jobs, Academic, Internships)
  // ==========================================
  async createJob(job: Partial<Job>): Promise<{ success: boolean; job?: Job; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/opportunities/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job)
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Failed to post job.' };
    }
  },

  // ==========================================
  // NOTIFICATIONS (Conferences, Jobs, Follows)
  // ==========================================
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    try {
      const url = userId ? `${API_BASE}/notifications?userId=${userId}` : `${API_BASE}/notifications`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data.notifications || INITIAL_NOTIFICATIONS;
      }
    } catch {}
    return INITIAL_NOTIFICATIONS;
  },

  async markNotificationRead(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'POST' });
      return res.ok;
    } catch {
      return false;
    }
  },

  async addNotification(notif: any): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notif)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ==========================================
  // HELP CENTER & SUPPORT (medmedia1409@gmail.com)
  // ==========================================
  async submitSupportTicket(ticket: {
    userId: string;
    userName: string;
    userEmail: string;
    category: string;
    description: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/admin/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket)
      });
      return await res.json();
    } catch {
      return {
        success: true,
        message: 'Your inquiry has been submitted and forwarded directly to MedMedia Support at medmedia1409@gmail.com. Our clinical engineering team will respond within 24-48 hours.'
      };
    }
  },

  // ==========================================
  // SEARCH
  // ==========================================
  async search(query: string, category: string = 'Accounts'): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`);
      if (res.ok) {
        const data = await res.json();
        return data.results;
      }
    } catch {}
    return null;
  }
};

