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
export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const fetchWithAuth = (url: string, options: RequestInit = {}) => {
  return fetch(url, { ...options, credentials: 'include' }).catch((error: unknown) => {
    if (error instanceof TypeError) {
      throw new Error('Unable to connect to MedMedia right now. Check your connection and try again.');
    }
    throw error;
  });
};

type OpportunityCatalog = {
  researchProjects: ResearchProject[];
  locumGigs: LocumGig[];
  scholarships: ScholarshipItem[];
  courses: CourseItem[];
};

const fetchOpportunityCatalog = async (): Promise<OpportunityCatalog> => {
  try {
    const res = await fetchWithAuth(`${API_BASE}/opportunities`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return {
      researchProjects: data.researchProjects || [],
      locumGigs: data.locumGigs || [],
      scholarships: data.scholarships || [],
      courses: data.courses || []
    };
  } catch {
    return {
      researchProjects: [],
      locumGigs: [],
      scholarships: [],
      courses: []
    };
  }
};


export const apiService = {
  // 1. GET POSTS
  async getPosts(): Promise<Post[]> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/posts`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return Array.isArray(data.posts) ? data.posts : [];
    } catch {
      return [];
    }
  },

  // 2. CREATE POST
  async createPost(post: Partial<Post>): Promise<Post> {
    const res = await fetchWithAuth(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });
    const data = await res.json();
    if (!res.ok || !data.post) throw new Error(data.message || 'Failed to publish post');
    return data.post;
  },

  async getBookmarkedPosts(): Promise<Post[]> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/users/me/bookmarks`);
      if (!res.ok) return [];
      const data = await res.json();
      const parseList = (value: unknown): string[] => {
        if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
        if (typeof value !== 'string') return [];
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed.filter((item: unknown): item is string => typeof item === 'string') : [];
        } catch {
          return [];
        }
      };

      return (data.bookmarks || []).map((post: any): Post => ({
        id: post.id,
        authorId: post.userId,
        authorName: post.user?.fullName || 'MedMedia member',
        authorUsername: post.user?.username || '',
        authorAvatar: post.user?.avatarUrl || '',
        authorRole: post.user?.role || 'STUDENT',
        authorSpecializationOrDiscipline: 'Healthcare professional',
        isVerified: post.user?.verificationStatus === 'VERIFIED',
        postType: post.postType,
        content: post.content,
        mediaUrls: parseList(post.mediaUrls),
        linkUrl: post.linkUrl || undefined,
        clinicalTags: parseList(post.clinicalTags),
        likesCount: post.likesCount || 0,
        commentsCount: post.commentsCount || 0,
        savesCount: post.savesCount || 0,
        sharesCount: post.sharesCount || 0,
        isLiked: false,
        isSaved: true,
        createdAt: post.createdAt ? new Date(post.createdAt).toISOString() : ''
      }));
    } catch {
      return [];
    }
  },

  // 3. GET USERS
  async getUsers(): Promise<UserProfile[]> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/users`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return Array.isArray(data.users) ? data.users : [];
    } catch {
      return [];
    }
  },

  async getFollowingIds(): Promise<string[]> {
    const res = await fetchWithAuth(`${API_BASE}/users/me/following`);
    const data = await res.json();
    if (!res.ok || !Array.isArray(data.followingIds)) throw new Error(data.message || 'Failed to load following list');
    return data.followingIds;
  },

  // 4. REGISTER NEW USER
  async registerUser(userData: any): Promise<UserProfile> {
    const res = await fetchWithAuth(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok || !data.user) throw new Error(data.message || 'Registration failed');
    const savedUser = data.user as UserProfile;

    return savedUser;
  },

  async loginUser(identifier: string, password?: string): Promise<UserProfile> {
    const res = await fetchWithAuth(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: identifier.trim(), password })
    });
    const data = await res.json();
    if (!res.ok || !data.user) throw new Error(data.message || 'Login failed');
    return data.user;
  },

  // 6. UPDATE USER PROFILE
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
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
      const res = await fetchWithAuth(`${API_BASE}/clips`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return Array.isArray(data.clips) ? data.clips : [];
    } catch {
      return [];
    }
  },

  async getJobs(): Promise<Job[]> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/opportunities/jobs`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.jobs || [];
    } catch {
      return [];
    }
  },

  async getSavedClips(): Promise<Medclip[]> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/clips/saved`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.clips || []).map((clip: any): Medclip => ({
        id: clip.id,
        authorId: clip.authorId,
        authorName: clip.authorName,
        authorSpecialty: 'Healthcare professional',
        authorAvatar: clip.authorAvatar || '',
        isVerified: Boolean(clip.isVerified),
        videoUrl: clip.videoUrl,
        thumbnailUrl: clip.thumbnailUrl || '',
        caption: clip.caption,
        clipType: clip.clipType,
        clinicalCategory: clip.clinicalCategory,
        tags: clip.tags || [],
        likesCount: clip.likesCount || 0,
        commentsCount: clip.commentsCount || 0,
        savesCount: clip.savesCount || 0,
        sharesCount: clip.sharesCount || 0,
        isSaved: true,
        createdAt: clip.createdAt
      }));
    } catch {
      return [];
    }
  },

  async saveClip(clipId: string): Promise<boolean | null> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/clips/${clipId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save' })
      });
      if (!res.ok) return null;
      const data = await res.json();
      return typeof data.isSaved === 'boolean' ? data.isSaved : null;
    } catch {
      return null;
    }
  },

  async deleteJob(jobId: string): Promise<boolean> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/opportunities/jobs/${jobId}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getOpportunities(): Promise<OpportunityItem[]> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/opportunities`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.opportunities || [];
    } catch {
      return [];
    }
  },

  async getOpportunityCatalog(): Promise<OpportunityCatalog> {
    return fetchOpportunityCatalog();
  },

  async likePost(postId: string): Promise<boolean> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/posts/${postId}/like`, { method: 'POST' });
      const data = await res.json();
      return data.isLiked;
    } catch {
      return false;
    }
  },

  async savePost(postId: string): Promise<boolean> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/posts/${postId}/bookmark`, { method: 'POST' });
      const data = await res.json();
      return data.isSaved;
    } catch {
      return false;
    }
  },

  async getPostComments(postId: string): Promise<any[]> {
    const res = await fetchWithAuth(`${API_BASE}/posts/${postId}/comments`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load comments');
    return data.comments || [];
  },

  async createPostComment(postId: string, content: string, parentId?: string): Promise<any> {
    const res = await fetchWithAuth(`${API_BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, parentId })
    });
    const data = await res.json();
    if (!res.ok || !data.comment) throw new Error(data.message || 'Failed to post comment');
    return data.comment;
  },

  async deletePostComment(postId: string, commentId: string): Promise<void> {
    const res = await fetchWithAuth(`${API_BASE}/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to delete comment');
    }
  },

  async followUser(userId: string): Promise<boolean> {
    const res = await fetchWithAuth(`${API_BASE}/users/${userId}/follow`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to follow user');
    return Boolean(data.isFollowing);
  },

  async unfollowUser(userId: string): Promise<boolean> {
    const res = await fetchWithAuth(`${API_BASE}/users/${userId}/follow`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to unfollow user');
    return Boolean(data.isFollowing);
  },

  async votePoll(postId: string, optionId: string): Promise<any> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/posts/${postId}/poll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId })
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // 7. GET STORIES
  async getStories(): Promise<Story[]> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/stories`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return Array.isArray(data.stories) ? data.stories : [];
    } catch {
      return [];
    }
  },

  async createClip(clipData: any): Promise<Medclip> {
    const payload = {
      videoUrl: clipData.mediaUrl,
      thumbnailUrl: clipData.mediaUrl,
      caption: clipData.caption,
      clipType: clipData.clinicalCategory || clipData.clipType || 'Clinical Update',
      tags: clipData.clinicalTags || []
    };
    const res = await fetchWithAuth(`${API_BASE}/clips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.clip) throw new Error(data.message || 'Failed to publish reel');
    return {
      ...data.clip,
      tags: typeof data.clip.tags === 'string' ? JSON.parse(data.clip.tags) : (data.clip.tags || []),
      authorId: clipData.userId,
      authorName: clipData.userName,
      authorAvatar: clipData.userAvatar,
      authorSpecialty: clipData.userSpecialty,
      isVerified: clipData.isVerified === true,
      likesCount: 0,
      commentsCount: 0,
      savesCount: 0,
      sharesCount: 0
    };
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
    const res = await fetchWithAuth(`${API_BASE}/stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storyData)
    });
    const data = await res.json();
    if (!res.ok || !data.story) throw new Error(data.message || 'Failed to publish story');
    return data.story;
  },

  // 9. DELETE STORY
  async deleteStory(id: string): Promise<boolean> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/stories/${id}`, { method: 'DELETE' });
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
      const res = await fetchWithAuth(`${API_BASE}/posts/${id}`, { method: 'DELETE' });
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

  // ==========================================
  // COMMUNITIES (10,000 Capacity Limit)
  // ==========================================
  async getCommunities(category?: string, search?: string): Promise<Community[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (search) params.append('search', search);

      const res = await fetchWithAuth(`${API_BASE}/opportunities/communities?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return data.communities || [];
      }
    } catch {}
    return [];
  },

  async createCommunity(community: Partial<Community>): Promise<{ success: boolean; community?: Community; message?: string }> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/opportunities/communities`, {
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
      const res = await fetchWithAuth(`${API_BASE}/opportunities/communities/${communityId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Failed to join community.' };
    }
  },

  async getCommunityMessages(communityId: string): Promise<{ success: boolean; messages: any[] }> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/opportunities/communities/${communityId}/messages`);
      return await res.json();
    } catch {
      return { success: false, messages: [] };
    }
  },

  async sendCommunityMessage(communityId: string, text: string, imageUrl?: string, videoUrl?: string): Promise<{ success: boolean; message?: any }> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/opportunities/communities/${communityId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, imageUrl, videoUrl })
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async deleteCommunity(communityId: string): Promise<boolean> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/opportunities/communities/${communityId}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ==========================================
  // RESEARCH WORKSPACE
  // ==========================================
  async getResearchProjects(search?: string, tag?: string): Promise<ResearchProject[]> {
    const projects = (await fetchOpportunityCatalog()).researchProjects;
    const query = search?.trim().toLowerCase();
    return projects.filter(project =>
      (!query || `${project.title} ${project.description}`.toLowerCase().includes(query)) &&
      (!tag || project.hashtags?.some(value => value.toLowerCase() === tag.toLowerCase()))
    );
  },

  async createResearchProject(proj: Partial<ResearchProject>): Promise<ResearchProject | null> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/opportunities/research`, {
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
      const res = await fetchWithAuth(`${API_BASE}/opportunities/research/${projectId}/join`, {
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
      const res = await fetchWithAuth(`${API_BASE}/opportunities/research/${projectId}/approve`, {
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
      const res = await fetchWithAuth(`${API_BASE}/opportunities/research/${projectId}/notes`, {
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
      const res = await fetchWithAuth(`${API_BASE}/opportunities/research/${projectId}/notes/${noteId}`, {
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
      const res = await fetchWithAuth(`${API_BASE}/opportunities/research/${projectId}/messages`, {
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
    return (await fetchOpportunityCatalog()).locumGigs;
  },

  async createLocumGig(gig: Partial<LocumGig>): Promise<{ success: boolean; gig?: LocumGig; message?: string }> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/opportunities/locum`, {
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
      const res = await fetchWithAuth(`${API_BASE}/opportunities/locum/${gigId}/apply`, {
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
    return (await fetchOpportunityCatalog()).scholarships;
  },

  async getCourses(): Promise<CourseItem[]> {
    return (await fetchOpportunityCatalog()).courses;
  },

  async getResources(): Promise<any[]> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/resources`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.resources) ? data.resources : [];
    } catch {
      return [];
    }
  },

  async upvoteResource(resourceId: string): Promise<{ isUpvoted: boolean; upvotesCount: number } | null> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/resources/${resourceId}/upvote`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok || typeof data.isUpvoted !== 'boolean') return null;
      return { isUpvoted: data.isUpvoted, upvotesCount: data.upvotesCount };
    } catch {
      return null;
    }
  },

  // ==========================================
  // JOBS (Doctor jobs, Academic, Internships)
  // ==========================================
  async createJob(job: {
    title: string;
    category: string;
    employmentType: string;
    companyName: string;
    location: string;
    jobDescription: string;
    salaryRange: string;
    educationPreference: string;
    skillsRequired: string[];
  }): Promise<{ success: boolean; job?: Job; message?: string }> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/opportunities/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job)
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.job) {
        return { success: false, message: data.message || 'Failed to post job.' };
      }

      let skills: string[] = [];
      try {
        skills = Array.isArray(data.job.skillsRequired)
          ? data.job.skillsRequired
          : JSON.parse(data.job.skillsRequired || '[]');
      } catch {}

      return {
        success: true,
        job: {
          id: data.job.id,
          title: data.job.title,
          category: data.job.category as Job['category'],
          type: String(data.job.employmentType).replace(/-/g, ' ') as Job['type'],
          companyName: data.job.companyName,
          place: data.job.location,
          experience: data.job.requiredExperienceYears ? `${data.job.requiredExperienceYears} years` : 'Any',
          salary: data.job.salaryRange || 'Not specified',
          description: data.job.jobDescription,
          preferenceEducation: data.job.educationPreference,
          skills,
          hospitalLogoUrl: '',
          postedAt: data.job.createdAt ? new Date(data.job.createdAt).toLocaleDateString() : 'Just now'
        }
      };
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
      const res = await fetchWithAuth(url);
      if (res.ok) {
        const data = await res.json();
        return data.notifications || [];
      }
    } catch {}
    return [];
  },

  async markNotificationRead(id: string): Promise<boolean> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' });
      return res.ok;
    } catch {
      return false;
    }
  },

  async addNotification(notif: any): Promise<boolean> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/notifications`, {
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
  // SEARCH
  // ==========================================
  async search(query: string, category: string = 'Accounts'): Promise<any> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`);
      if (res.ok) {
        const data = await res.json();
        return data.results;
      }
    } catch {}
    return null;
  },

  // ==========================================
  // EVENTS
  // ==========================================
  async getEvents(): Promise<any[]> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/events`);
      const data = await res.json();
      return data.success ? data.events : [];
    } catch {
      return [];
    }
  },

  async createEvent(eventData: any): Promise<any | null> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      const data = await res.json();
      return data.success ? data.event : null;
    } catch {
      return null;
    }
  },

  // ==========================================
  // MEDIA UPLOAD
  // ==========================================
  async uploadMedia(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('media', file);
    
    const res = await fetchWithAuth(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) {
      throw new Error('Upload failed');
    }
    
    const data = await res.json();
    return data.url;
  },

  // ==========================================
  // SETTINGS
  // ==========================================
  async getSettings(): Promise<any | null> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/settings`);
      const data = await res.json();
      return data.success ? data.settings : null;
    } catch { return null; }
  },

  async updatePrivacy(isPrivate: boolean): Promise<boolean> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/settings/privacy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrivate })
      });
      const data = await res.json();
      return data.success;
    } catch { return false; }
  },

  async updateNotifications(prefs: { notifPush?: boolean; notifEmail?: boolean }): Promise<boolean> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/settings/notifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs)
      });
      const data = await res.json();
      return data.success;
    } catch { return false; }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/settings/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      return { success: data.success, message: data.message || '' };
    } catch { return { success: false, message: 'Network error' }; }
  },

  async submitSupportTicket(ticket: { subject: string; message: string; category: string }): Promise<any | null> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/settings/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket)
      });
      const data = await res.json();
      return data.success ? data : null;
    } catch { return null; }
  },

  async submitPostReport(postId: string): Promise<{ ticketId: string; notificationStatus: string }> {
    const res = await fetchWithAuth(`${API_BASE}/admin/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: `Privacy report for post ${postId}`,
        message: `A MedMedia member reported post ${postId} for review.`
      })
    });
    const data = await res.json();
    if (!res.ok || !data.success || !data.ticket?.id) {
      throw new Error(data.message || 'Could not submit the report. Please try again.');
    }
    return { ticketId: data.ticket.id, notificationStatus: data.notificationStatus || 'not_configured' };
  },

  async getSupportTickets(): Promise<any[]> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/settings/support`);
      const data = await res.json();
      return data.success ? data.tickets : [];
    } catch { return []; }
  },

  async deleteAccount(password: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/settings/account`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      return { success: data.success, message: data.message || '' };
    } catch { return { success: false, message: 'Network error' }; }
  },

  // ==========================================
  // SUGGESTED CONNECTIONS
  // ==========================================
  async getSuggestedConnections(): Promise<UserProfile[]> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/users/me/suggested`);
      if (res.ok) {
        const data = await res.json();
        return data.suggestions || [];
      }
    } catch {}
    return [];
  },

  // ==========================================
  // UNREAD MESSAGES COUNT
  // ==========================================
  async getUnreadMessagesCount(): Promise<number> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/users/me/unread-messages`);
      if (res.ok) {
        const data = await res.json();
        return data.count || 0;
      }
    } catch {}
    return 0;
  },

  // ==========================================
  // SHARE POST
  // ==========================================
  async sharePost(postId: string): Promise<{ sharesCount: number; shareUrl: string } | null> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/posts/${postId}/share`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        return { sharesCount: data.sharesCount, shareUrl: data.shareUrl };
      }
    } catch {}
    return null;
  },

  // ==========================================
  // MARK ALL NOTIFICATIONS READ
  // ==========================================
  async markAllNotificationsRead(): Promise<boolean> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/notifications/read-all`, { method: 'PATCH' });
      return res.ok;
    } catch { return false; }
  },

  // ==========================================
  // UPDATE PROFILE (settings route)
  // ==========================================
  async updateProfile(updates: { fullName?: string; bio?: string; avatarUrl?: string; coverPhotoUrl?: string }): Promise<any | null> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/settings/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      return data.success ? data.user : null;
    } catch { return null; }
  }
};

