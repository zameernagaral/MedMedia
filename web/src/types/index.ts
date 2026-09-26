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
  academicTitle?: string;
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
  isPrivate?: boolean;
  coverPhotoUrl?: string;
  isAdmin?: boolean;
  medicalCouncilCredentialUrl?: string;
  studentIdCredentialUrl?: string;
  joinedCommunityIds?: string[];
  doctorDetails?: DoctorDetails;
  studentDetails?: StudentDetails;
  stats: {
    postsCount: number;
    followersCount: number;
    followingCount: number;
    // Connections removed - platform uses followers/following model only
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
  isVideo?: boolean;
  clinicalTags?: string[];
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorRole: UserRole;
  authorSpecializationOrDiscipline: string;
  authorIsProfessor?: boolean;
  authorAcademicTitle?: string;
  isVerified: boolean;
  postType: 'TWEET' | 'IMAGE_CASE' | 'TEXT' | 'CLINICAL_DISCUSSION' | 'ARTICLE_LINK' | 'CLINICAL_POST';
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
  targetAudience?: 'DOCTOR' | 'STUDENT' | 'ALL' | 'STUDENT_HIGH_YIELD' | 'PROFESSOR_ACADEMIC' | string;
  recommendationReason?: string;
  createdAt: string;
}

export interface MedclipComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface Medclip {
  id: string;
  authorId: string;
  authorName: string;
  authorSpecialty: string;
  authorAvatar: string;
  authorIsProfessor?: boolean;
  isVerified: boolean;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  clipType: 'Clinical Update' | 'Social Update'; // Required: user must select before posting
  clinicalCategory: 'clinical updates' | 'social update' | 'social updates' | 'following' | 'Clinical Update' | 'Social Update' | string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  sharesCount: number;
  comments?: MedclipComment[];
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  targetAudience?: 'DOCTOR' | 'STUDENT' | 'ALL' | 'STUDENT_HIGH_YIELD' | 'PROFESSOR_ACADEMIC' | string;
  createdAt: string;
}

export interface CommunityChannel {
  id: string;
  name: string;
  description: string;
  isAnnouncement?: boolean;
  messagesCount?: number;
  lastMessageSnippet?: string;
  lastMessageTime?: string;
}

export interface Community {
  id: string;
  name: string;
  iconUrl?: string;
  avatarUrl?: string;
  description: string;
  category: string;
  membersCount: number;
  maxMembers?: number;
  maxCapacity: number; // 10,000 limit enforced
  creatorId: string;
  creatorName: string;
  isOfficial?: boolean;
  announcementText?: string;
  channels?: CommunityChannel[];
  createdAt: string;
}

export interface ResearchNote {
  id: string;
  title: string;
  content: string;
  authorId?: string;
  authorName: string;
  authorRole?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface ResearchMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole?: string;
  text: string;
  mediaUrl?: string;
  attachment?: {
    type: 'IMAGE' | 'VIDEO' | 'PDF' | 'DOCUMENT' | string;
    url: string;
    name?: string;
  };
  isVideo?: boolean;
  timestamp: string;
}

export interface ResearchProject {
  id: string;
  projectName?: string;
  title?: string;
  instituteName?: string;
  institution?: string;
  departmentName?: string;
  department?: string;
  place?: string;
  location?: string;
  description: string;
  tags?: string[];
  hashtags?: string[];
  requiredSkills?: string[];
  photosOrLink?: string;
  creatorId: string;
  creatorName?: string;
  leadDoctorName?: string;
  creatorAvatar?: string;
  leadDoctorAvatar?: string;
  // targetSampleSize REMOVED per requirements
  collaboratorCount?: number;
  memberIds?: string[];
  pendingJoinRequestIds?: string[];
  pendingJoinRequests?: any[];
  notes?: ResearchNote[];
  messages?: ResearchMessage[];
  createdAt?: string;
}

export interface LocumGig {
  id: string;
  instituteName?: string;
  hospitalName?: string;
  place?: string;
  location?: string;
  duration?: string;
  shiftTiming?: string;
  gigName?: string;
  department?: string;
  stipend?: string;
  stipendAmount?: string;
  stipendType?: string;
  requiredDocuments?: string[];
  documentsUrl?: string;
  email?: string;
  contactEmail?: string;
  phone?: string;
  contactPhone?: string;
  otherLink?: string;
  creatorId?: string;
  creatorName?: string;
  postedByDoctorId?: string;
  createdAt?: string;
}

export interface LocumApplication {
  id: string;
  gigId: string;
  gigName: string;
  name?: string;
  applicantName?: string;
  applicantRole?: string;
  applicantPhone?: string;
  applicantEmail?: string;
  yearsOfExperience?: string;
  medicalCouncilRegNumber?: string;
  qualification?: string;
  resumeUrl?: string;
  email?: string;
  contactNumber?: string;
  otherLink?: string;
  applicantId?: string;
  submittedAt?: string;
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
  focusArea: 'Clinical Research' | 'Surgical Mentorship' | 'USMLE / PLAB Guidance' | 'Residency Match' | string;
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
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';
  submittedAt: string;
}

export interface ScholarshipItem {
  id: string;
  name?: string;
  title?: string;
  organization?: string;
  provider?: string;
  logoUrl: string;
  fundingAmount?: string;
  coverage?: string;
  description: string;
  deadline: string;
  applyLink?: string;
  link?: string;
}

export interface CourseItem {
  id: string;
  name?: string;
  title?: string;
  provider?: string;
  platform?: string;
  logoUrl: string;
  description: string;
  link: string;
  isFree: boolean;
  cmeCredits?: number;
}

export interface LibraryItem {
  id: string;
  name: string;
  author: string;
  description: string;
  link?: string;
  category: string;
  coverUrl?: string;
  edition?: string;
  createdAt: string;
}

export interface EventItem {
  id: string;
  name: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  isOnline: boolean;
  filterType: 'Near You' | 'International' | 'National' | 'Online' | 'Offline';
  organizer: string;
  registrationLink: string;
  cmeCredits?: number;
  tags?: string[];
  bannerUrl?: string;
  contactEmail?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: string;
  description: string;
  forwardedTo: string;
  status: 'RECEIVED' | 'IN_REVIEW' | 'RESOLVED';
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
  // targetSampleSize REMOVED per requirements
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
  stipendOrFunding?: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  type: 'EVENT' | 'EXAM' | 'CONFERENCE' | 'JOB_UPDATE' | 'JOB_APPLICATION' | 'FOLLOW_REQUEST' | 'FOLLOW_ACCEPTED' | 'ADMIN_BROADCAST';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  targetAudience?: 'DOCTOR' | 'STUDENT' | 'ALL';
  referenceId?: string;
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

export interface OtpRequest {
  destination: string; // email or phone
  channel: 'email' | 'mobile';
}

export interface PasswordResetRequest {
  resetToken: string;
  newPassword: string;
}
