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
  isProfessor?: boolean;
  academicTitle?: string; // e.g. "Professor & HOD Cardiology"
  isAcceptingMentees?: boolean;
  isAcceptingInterns?: boolean;
  mentorshipSlots?: { available: number; total: number };
  alumniCollege?: string;
  activeResearchProject?: string;
}

export interface StudentDetails {
  discipline: StudentDiscipline;
  collegeName: string;
  academicYear: number;
  interests: string[];
  futureSpecialty: string;
  researchInterests: string[];
  isSeekingInternship?: boolean;
  isSeekingMentorship?: boolean;
  targetHospitalPreference?: string[];
  academicAchievements?: string[];
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
  authorIsProfessor?: boolean;
  authorAcademicTitle?: string;
  targetAudience?: 'ALL' | 'STUDENT_HIGH_YIELD' | 'PROFESSOR_ACADEMIC' | 'SPECIALIST_CONSULT';
  recommendationReason?: string;
  createdAt: string;
}

export interface Medclip {
  id: string;
  authorId: string;
  authorName: string;
  authorSpecialty: string;
  authorAvatar: string;
  isVerified: boolean;
  authorIsProfessor?: boolean;
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
  targetAudience?: 'ALL' | 'STUDENT_HIGH_YIELD' | 'PROFESSOR_ACADEMIC' | 'SPECIALIST_CONSULT';
  recommendationReason?: string;
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
  stipend?: string;
  duration?: string;
  isClinicalInternship?: boolean;
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
  targetAudience?: 'STUDENTS' | 'PROFESSORS' | 'ALL';
  stipendOrFunding?: string;
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

export interface MentorshipRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentCollege: string;
  studentYear: number;
  studentAvatar: string;
  professorId: string;
  professorName: string;
  focusArea: 'Clinical Research' | 'USMLE / NEET-PG Strategy' | 'Surgical Skills' | 'Subspecialty Guidance' | 'Case Reporting';
  statementOfPurpose: string;
  hasCollegeNoc: boolean;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
}

export interface InternshipApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantDiscipline: string;
  applicantCollege: string;
  applicantYear: number;
  opportunityOrJobId: string;
  opportunityTitle: string;
  hospitalName: string;
  applicantSop: string;
  availableFrom: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'INTERVIEW_SCHEDULED' | 'ACCEPTED';
  submittedAt: string;
}
