import axios from 'axios';
import { Platform } from 'react-native';

// For Android Emulator, localhost points to the emulator itself.
// We use 10.0.2.2 to point to the host machine's localhost.
const getBaseUrl = () => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (configuredUrl) return configuredUrl;
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5001/api';
    }
    return 'http://localhost:5001/api';
  }
  throw new Error('EXPO_PUBLIC_API_URL must be set to the deployed MedMedia API URL for production builds.');
};

export const API_BASE = getBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const toStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const mapUser = (user: any) => ({
  id: user.id,
  fullName: user.fullName,
  username: user.username,
  email: user.email,
  avatarUrl: user.avatarUrl || '',
  role: user.role,
  verificationStatus: user.verificationStatus,
  badgeTitle: user.badgeTitle || 'MedMedia member',
  bio: user.bio || '',
  specialization: user.doctorDetails?.specialization,
  hospital: user.doctorDetails?.hospitalAffiliation,
  discipline: user.studentDetails?.discipline,
  collegeName: user.studentDetails?.collegeName,
  academicYear: user.studentDetails?.academicYear,
  stats: user.stats || { postsCount: 0, followersCount: 0, followingCount: 0 }
});

const mapPost = (post: any) => {
  const mediaUrls = toStringList(post.mediaUrls);
  const author = post.user || {};
  return {
    id: post.id,
    authorId: post.authorId || post.userId,
    authorName: post.authorName || author.fullName || 'MedMedia member',
    authorUsername: post.authorUsername || author.username || '',
    authorAvatar: post.authorAvatar || author.avatarUrl || '',
    authorRole: post.authorRole || author.role || 'STUDENT',
    specialtyOrYear: post.authorSpecializationOrDiscipline || 'Healthcare professional',
    isVerified: Boolean(post.isVerified ?? author.verificationStatus === 'VERIFIED'),
    content: post.content,
    imageUrl: mediaUrls[0],
    tags: toStringList(post.clinicalTags),
    likesCount: post.likesCount || 0,
    commentsCount: post.commentsCount || 0,
    savesCount: post.savesCount || 0,
    isLiked: Boolean(post.isLiked),
    isSaved: Boolean(post.isSaved),
    createdAt: post.createdAt
  };
};

const mapClip = (clip: any) => ({
  id: clip.id,
  authorId: clip.authorId || clip.userId,
  authorName: clip.authorName || clip.user?.fullName || 'MedMedia member',
  authorSpecialty: clip.authorSpecialty || clip.user?.doctorProfile?.specialization || 'Healthcare professional',
  authorAvatar: clip.authorAvatar || clip.user?.avatarUrl || '',
  caption: clip.caption,
  category: clip.clinicalCategory || clip.clipType || 'clinical updates',
  videoUrl: clip.videoUrl,
  thumbnailUrl: clip.thumbnailUrl || '',
  tags: toStringList(clip.tags),
  likesCount: clip.likesCount || 0,
  commentsCount: clip.commentsCount || 0,
  savesCount: clip.savesCount || 0,
  isLiked: Boolean(clip.isLiked),
  isSaved: Boolean(clip.isSaved),
  createdAt: clip.createdAt
});

export const apiService = {
  async login(identifier: string, password: string) {
    const res = await apiClient.post('/auth/login', { identifier, password });
    return mapUser(res.data.user);
  },

  async register(registration: Record<string, unknown>) {
    const res = await apiClient.post('/auth/register', registration);
    return mapUser(res.data.user);
  },

  async getCurrentUser() {
    const res = await apiClient.get('/auth/me');
    return mapUser(res.data.user);
  },

  async logout() {
    await apiClient.post('/auth/logout');
  },

  async getPosts() {
    const res = await apiClient.get('/posts');
    return (res.data.posts || []).map(mapPost);
  },

  async getSavedPosts() {
    const res = await apiClient.get('/users/me/bookmarks');
    return (res.data.bookmarks || []).map(mapPost);
  },

  async getClips() {
    const res = await apiClient.get('/clips');
    return (res.data.clips || []).map(mapClip);
  },

  async getSavedClips() {
    const res = await apiClient.get('/clips/saved');
    return (res.data.clips || []).map(mapClip);
  },

  async getFollowingIds(): Promise<string[]> {
    const res = await apiClient.get('/users/me/following');
    return res.data.followingIds || [];
  },

  async setPostLike(postId: string, isLiked: boolean) {
    const res = await apiClient.post(`/posts/${postId}/like`, { isLiked });
    return { isLiked: Boolean(res.data.isLiked), likesCount: Number(res.data.likesCount) };
  },

  async setPostSaved(postId: string, isSaved: boolean) {
    const res = await apiClient.post(`/posts/${postId}/bookmark`, { isSaved });
    return { isSaved: Boolean(res.data.isSaved), savesCount: Number(res.data.savesCount) };
  },

  async setClipLike(clipId: string, isLiked: boolean) {
    const res = await apiClient.post(`/clips/${clipId}/action`, { action: 'like', state: isLiked });
    return { isLiked: Boolean(res.data.isLiked), likesCount: Number(res.data.likesCount) };
  },

  async setClipSaved(clipId: string, isSaved: boolean) {
    const res = await apiClient.post(`/clips/${clipId}/action`, { action: 'save', state: isSaved });
    return { isSaved: Boolean(res.data.isSaved), savesCount: Number(res.data.savesCount) };
  },

  async followUser(userId: string) {
    const res = await apiClient.post(`/users/${userId}/follow`);
    return res.data as { isFollowing: boolean; followersCount: number; followingCount: number };
  },

  async unfollowUser(userId: string) {
    const res = await apiClient.delete(`/users/${userId}/follow`);
    return res.data as { isFollowing: boolean; followersCount: number; followingCount: number };
  }
};
