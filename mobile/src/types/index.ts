export type UserRole = 'DOCTOR' | 'STUDENT';
export type VerificationStatus = 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
export type StudentDiscipline = 'MEDICAL_STUDENT' | 'NURSING' | 'B_PHARM' | 'D_PHARM' | 'LAB_PRACTITIONER';

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  badgeTitle: string;
  bio: string;
  specialization?: string;
  hospital?: string;
  discipline?: StudentDiscipline;
  collegeName?: string;
  academicYear?: number;
}

export interface Post {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorRole: UserRole;
  specialtyOrYear: string;
  isVerified: boolean;
  content: string;
  imageUrl?: string;
  tags: string[];
  pollQuestion?: string;
  pollOptions?: { id: string; text: string; votes: number }[];
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
}

export interface Medclip {
  id: string;
  authorName: string;
  authorSpecialty: string;
  authorAvatar: string;
  caption: string;
  category: 'clinical updates' | 'social update' | 'following';
  tags: string[];
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface Job {
  id: string;
  title: string;
  category: string;
  type: string;
  companyName: string;
  place: string;
  experience: string;
  salary: string;
  description: string;
  preferenceEducation: string;
  skills: string[];
}
