import { Post, Medclip, Job, OpportunityItem, UserProfile } from '../types';
import { 
  INITIAL_POSTS, 
  INITIAL_CLIPS, 
  INITIAL_JOBS, 
  INITIAL_OPPORTUNITIES, 
  INITIAL_USERS 
} from '../data/mockData';

const API_BASE = '/api';

export const apiService = {
  async getPosts(): Promise<Post[]> {
    try {
      const res = await fetch(`${API_BASE}/posts`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.posts || INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
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
  }
};
