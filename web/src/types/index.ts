export type UserRole = 'DOCTOR' | 'STUDENT';
export type VerificationStatus = 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
export type StudentDiscipline = 'MEDICAL_STUDENT' | 'NURSING' | 'B_PHARM' | 'D_PHARM' | 'LAB_PRACTITIONER';

export interface DoctorDetails {
  specialization: string;
  qualifications: string[];
  hospitalAffiliation: string;
  location: string;
  yearsExperience: number;
  clinicalInterests: string[];
  researchPublications: string[];
  medicalCouncilRegNumber: string;
}

export interface StudentDetails {
  discipline: StudentDiscipline;
  collegeName: string;
  academicYear: number;
  interests: string[];
  futureSpecialty: string;
  researchInterests: string[];
}

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  avatarUrl: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  badgeTitle: string;
  bio: string;
  doctorDetails?: DoctorDetails;
  studentDetails?: StudentDetails;
  stats: {
    postsCount: number;
    followersCount: number;
    connectionsCount: number;
  };
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  caption: string;
  timestamp: string;
  isViewed: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorRole: UserRole;
  authorSpecializationOrDiscipline: string;
  isVerified: boolean;
  postType: 'TEXT' | 'TWEET' | 'IMAGE_CASE' | 'ARTICLE_LINK' | 'CLINICAL_DISCUSSION';
  content: string;
  mediaUrls?: string[];
  linkUrl?: string;
  linkMeta?: {
    title: string;
    source: string;
    description: string;
  };
  clinicalTags: string[];
  casePoll?: {
    question: string;
    options: { id: string; text: string; votes: number }[];
    totalVotes: number;
    userVotedOptionId?: string;
  };
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  createdAt: string;
}

export interface Medclip {
  id: string;
  authorId: string;
  authorName: string;
  authorSpecialty: string;
  authorAvatar: string;
  isVerified: boolean;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  clinicalCategory: 'clinical updates' | 'social update' | 'following';
  tags: string[];
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  category: 'Doctor jobs' | 'academic jobs' | 'Internship' | 'fellowship';
  type: 'Full time' | 'Part time' | 'Locum' | 'Remote';
  companyName: string;
  place: string;
  experience: string;
  salary: string;
  description: string;
  preferenceEducation: string;
  skills: string[];
  hospitalLogoUrl: string;
  postedAt: string;
}

export interface OpportunityItem {
  id: string;
  type: 'RESEARCH' | 'FREELANCE' | 'COMMUNITY' | 'EVENT' | 'COURSE';
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  organizerOrAffiliation: string;
  locationOrVenue?: string;
  dateTime?: string;
  contactEmail?: string;
  actionLabel: string;
  cmeCredits?: number;
}

export interface DeviceSession {
  id: string;
  userId: string;
  deviceName: string;
  deviceOs: string;
  ipAddress: string;
  lastActive: string;
  isCurrentDevice: boolean;
}
