export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  avatarUrl: string;
  role: 'DOCTOR' | 'STUDENT';
  verificationStatus: 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
  badgeTitle: string;
  bio: string;
  isPrivate?: boolean;
  coverPhotoUrl?: string;
  isAdmin?: boolean;
  medicalCouncilCredentialUrl?: string;
  studentIdCredentialUrl?: string;
  joinedCommunityIds?: string[];
  doctorDetails?: {
    specialization: string;
    qualifications: string[];
    hospitalAffiliation: string;
    location: string;
    yearsExperience: number;
    clinicalInterests: string[];
    researchPublications: string[];
    medicalCouncilRegNumber: string;
  };
  studentDetails?: {
    discipline: 'MEDICAL_STUDENT' | 'NURSING' | 'B_PHARM' | 'D_PHARM' | 'LAB_PRACTITIONER';
    collegeName: string;
    academicYear: number;
    interests: string[];
    futureSpecialty: string;
    researchInterests: string[];
  };
  stats: {
    postsCount: number;
    followersCount: number;
    followingCount: number;
    // connectionsCount removed - only followers/following model
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
  authorRole: 'DOCTOR' | 'STUDENT';
  authorSpecializationOrDiscipline: string;
  isVerified: boolean;
  postType: 'TWEET' | 'IMAGE_CASE' | 'TEXT' | 'CLINICAL_DISCUSSION';
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
  isVerified: boolean;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  clipType: 'Clinical Update' | 'Social Update'; // Required selection before posting
  clinicalCategory: 'Clinical Update' | 'Social Update' | 'clinical updates' | 'social update' | 'following' | string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  sharesCount: number;
  comments?: MedclipComment[];
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
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
  maxCapacity: number; // 10,000 maximum capacity limit enforced
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
  authorId: string;
  authorName: string;
  updatedAt: string;
}

export interface ResearchMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  mediaUrl?: string;
  isVideo?: boolean;
  timestamp: string;
}

export interface ResearchProject {
  id: string;
  projectName: string;
  instituteName: string;
  departmentName: string;
  place: string;
  description: string;
  tags: string[];
  photosOrLink?: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  memberIds: string[];
  pendingJoinRequestIds: string[];
  notes: ResearchNote[];
  messages: ResearchMessage[];
  createdAt: string;
}

export interface LocumGig {
  id: string;
  instituteName: string;
  place: string;
  duration: string;
  gigName: string;
  stipend: string; // Mandatory: amount or "Experience only" / "No stipend, other benefits"
  documentsUrl?: string;
  email: string;
  phone: string;
  otherLink?: string;
  creatorId: string;
  creatorName: string;
  createdAt: string;
}

export interface LocumApplication {
  id: string;
  gigId: string;
  gigName: string;
  name: string;
  qualification: string;
  resumeUrl: string;
  email: string;
  contactNumber: string;
  otherLink?: string;
  applicantId: string;
  submittedAt: string;
}

export interface ScholarshipItem {
  id: string;
  name: string;
  organization: string;
  logoUrl: string;
  fundingAmount: string;
  description: string;
  deadline: string;
  applyLink: string;
}

export interface CourseItem {
  id: string;
  name: string;
  provider: string;
  logoUrl: string;
  description: string;
  link: string;
  isFree: boolean;
  cmeCredits?: number;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: string;
  description: string;
  forwardedTo: string; // medmedia1409@gmail.com
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

export interface EventItem {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  isOnline: boolean;
  filterType: 'Near You' | 'International' | 'National' | 'Online' | 'Offline';
  organizer: string;
  registrationLink: string;
  cmeCredits?: number;
  tags?: string[];
  bannerUrl?: string;
  time?: string;
  contactEmail?: string;
  createdAt: string;
}

export interface LibraryItem {
  id: string;
  name: string;
  author: string;
  description: string;
  link: string;
  category: string;
  coverUrl?: string;
  edition?: string;
  createdAt: string;
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

// ==========================================
// CLEAN PRODUCTION DATA SEED
// ==========================================

export const USERS: UserProfile[] = [
  {
    id: "doc-1",
    fullName: "Dr. Arvind Ramesh, MD, DM",
    username: "cardio_ramesh",
    email: "dr.ramesh@apollohospitals.org",
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=faces",
    coverPhotoUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=400&fit=crop",
    role: "DOCTOR",
    verificationStatus: "VERIFIED",
    badgeTitle: "Board Certified Interventional Cardiologist",
    bio: "Senior Consultant Interventional Cardiologist @ Apollo Heart Institute. Specializing in complex CTO, TAVR, and evidence-based clinical trials.",
    isPrivate: false,
    isAdmin: false,
    joinedCommunityIds: ["comm-cardio", "comm-surgery"],
    doctorDetails: {
      specialization: "Cardiology",
      qualifications: ["MBBS (AIIMS)", "MD Internal Medicine", "DM Cardiology (PGI)", "FSCAI (USA)"],
      hospitalAffiliation: "Apollo Hospitals, Bangalore",
      location: "Bangalore, India",
      yearsExperience: 14,
      clinicalInterests: ["Coronary Angioplasty", "Structural Heart Disease", "Intravascular Ultrasound (IVUS)", "Heart Failure Guidelines"],
      researchPublications: [
        "10-Year Clinical Outcomes of Bioresorbable Stents in South Asian Population (JACC 2024)",
        "Early Dual Antiplatelet Therapy Cessation in Post-PCI High Bleeding Risk Patients (Lancet Cardiology 2023)"
      ],
      medicalCouncilRegNumber: "KMC-48192-IND"
    },
    stats: {
      postsCount: 2,
      followersCount: 8920,
      followingCount: 340
    }
  },
  {
    id: "doc-2",
    fullName: "Dr. Priya Nair, MS, MCh",
    username: "neuro_priya",
    email: "priya.nair@manipal.edu",
    avatarUrl: "https://images.unsplash.com/photo-1594824813581-2292f725350c?w=200&h=200&fit=crop&crop=faces",
    coverPhotoUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=400&fit=crop",
    role: "DOCTOR",
    verificationStatus: "VERIFIED",
    badgeTitle: "Consultant Pediatric Neurosurgeon",
    bio: "Pediatric Neurosurgery @ Manipal Hospitals. Minimally invasive endoscopy, skull base surgery, and medical student mentorship.",
    isPrivate: false,
    isAdmin: false,
    joinedCommunityIds: ["comm-neuro", "comm-surgery"],
    doctorDetails: {
      specialization: "Neurology",
      qualifications: ["MBBS (CMC Vellore)", "MS General Surgery", "MCh Neurosurgery (NIMHANS)"],
      hospitalAffiliation: "Manipal Hospital",
      location: "Bangalore, India",
      yearsExperience: 11,
      clinicalInterests: ["Craniosynostosis", "Pediatric Brain Tumors", "Hydrocephalus Endoscopy"],
      researchPublications: [
        "Neuroendoscopic Third Ventriculostomy in Congenital Hydrocephalus (Neurosurgery Journal 2024)"
      ],
      medicalCouncilRegNumber: "KMC-59281-IND"
    },
    stats: {
      postsCount: 1,
      followersCount: 6410,
      followingCount: 280
    }
  },
  {
    id: "stu-1",
    fullName: "Rohan Verma",
    username: "rohan_verma_mbbs",
    email: "rohan.v@kims.ac.in",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
    coverPhotoUrl: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1200&h=400&fit=crop",
    role: "STUDENT",
    verificationStatus: "VERIFIED",
    badgeTitle: "Verified Final Year Medical Student (MBBS)",
    bio: "Final Year MBBS Scholar @ Kempegowda Institute of Medical Sciences. Interested in Interventional Cardiology, clinical auditing, and USMLE preparation.",
    isPrivate: false,
    isAdmin: false,
    joinedCommunityIds: ["comm-year4", "comm-cardio"],
    studentDetails: {
      discipline: "MEDICAL_STUDENT",
      collegeName: "Kempegowda Institute of Medical Sciences (KIMS)",
      academicYear: 4,
      interests: ["Cardiology", "Emergency Medicine", "Pharmacology"],
      futureSpecialty: "Cardiology / Internal Medicine",
      researchInterests: ["Preventive Cardiology", "Point-of-Care Ultrasound (POCUS)"]
    },
    stats: {
      postsCount: 1,
      followersCount: 1840,
      followingCount: 190
    }
  },
  {
    id: "mgr-1",
    fullName: "MedMedia Administrator (Manager)",
    username: "medmedia_admin",
    email: "medmedia1409@gmail.com",
    avatarUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=faces",
    coverPhotoUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&h=400&fit=crop",
    role: "DOCTOR",
    verificationStatus: "VERIFIED",
    badgeTitle: "Chief Medical Officer & Platform Manager",
    bio: "Official MedMedia System Administrator & Clinical Governance Officer. Reviewing platform compliance, HIPAA guidelines, and community verification.",
    isPrivate: false,
    isAdmin: true,
    joinedCommunityIds: ["comm-cardio", "comm-neuro", "comm-surgery", "comm-year4"],
    doctorDetails: {
      specialization: "General Surgery",
      qualifications: ["MBBS", "MS", "MHA", "FRCS"],
      hospitalAffiliation: "MedMedia Central Governance Board",
      location: "Bangalore / New Delhi",
      yearsExperience: 20,
      clinicalInterests: ["Clinical Governance", "Health Informatics", "Surgical Ethics"],
      researchPublications: ["Modern Digital Healthcare Protocols & HIPAA Compliance (2025)"],
      medicalCouncilRegNumber: "NMC-DIR-0001"
    },
    stats: {
      postsCount: 1,
      followersCount: 15400,
      followingCount: 450
    }
  }
];

export const STORIES: Story[] = [
  {
    id: "st-1",
    userId: "doc-1",
    userName: "Dr. Arvind Ramesh, MD, DM",
    userAvatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop",
    mediaUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=700&h=1000&fit=crop",
    caption: "Cath lab live: Successful complex bifurcation stenting completed in under 45 minutes using IVUS guidance.",
    timestamp: "2 hours ago",
    isViewed: false,
    isVideo: false,
    clinicalTags: ["#Cardiology", "#CathLab", "#IVUS"]
  },
  {
    id: "st-2",
    userId: "doc-2",
    userName: "Dr. Priya Nair, MS, MCh",
    userAvatar: "https://images.unsplash.com/photo-1594824813581-2292f725350c?w=150&h=150&fit=crop",
    mediaUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=700&h=1000&fit=crop",
    caption: "Surgical Pearl: In endoscopic 3rd ventriculostomy, keep the basilar artery bifurcation clearly in view before blunt puncturing.",
    timestamp: "4 hours ago",
    isViewed: false,
    isVideo: false,
    clinicalTags: ["#Neurosurgery", "#SurgicalPearl", "#Endoscopy"]
  },
  {
    id: "st-3",
    userId: "stu-1",
    userName: "Rohan Verma",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    mediaUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=700&h=1000&fit=crop",
    caption: "Grand Rounds clinical finding: Classic water-hammer pulse observed in severe aortic regurgitation. High yield for viva!",
    timestamp: "6 hours ago",
    isViewed: false,
    isVideo: false,
    clinicalTags: ["#MedicalStudent", "#Cardiology", "#NEETPG"]
  }
];

export const POSTS: Post[] = [
  {
    id: "post-1",
    authorId: "doc-1",
    authorName: "Dr. Arvind Ramesh, MD, DM",
    authorUsername: "cardio_ramesh",
    authorAvatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=faces",
    authorRole: "DOCTOR",
    authorSpecializationOrDiscipline: "Interventional Cardiology",
    isVerified: true,
    postType: "CLINICAL_DISCUSSION",
    content: "58-year-old male presents to the ER with sudden retrosternal squeezing chest pain radiating to the left jaw (onset 45 mins ago). BP 90/60 mmHg, HR 52 bpm.\n\nNotice dramatic ST-segment elevation in leads II, III, and aVF with reciprocal ST depression in I and aVL, accompanied by complete AV dissociation.\n\nWhich coronary artery branch is the culprit, and what is your immediate management protocol prior to cath lab activation?",
    mediaUrls: ["https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=900&h=500&fit=crop"],
    clinicalTags: ["#Cardiology", "#STEMI", "#ECGChallenge"],
    casePoll: {
      question: "Primary Culprit Vessel Identification:",
      options: [
        { id: "opt-1", text: "Right Coronary Artery (Proximal RCA)", votes: 242 },
        { id: "opt-2", text: "Left Circumflex Artery (LCx)", votes: 48 },
        { id: "opt-3", text: "Left Anterior Descending (LAD)", votes: 18 },
        { id: "opt-4", text: "Posterior Descending Artery (PDA)", votes: 12 }
      ],
      totalVotes: 320,
      userVotedOptionId: "opt-1"
    },
    likesCount: 342,
    commentsCount: 68,
    savesCount: 114,
    sharesCount: 45,
    isLiked: false,
    isSaved: true,
    isFollowing: true,
    createdAt: "2 hours ago"
  },
  {
    id: "post-2",
    authorId: "doc-2",
    authorName: "Dr. Priya Nair, MS, MCh",
    authorUsername: "neuro_priya",
    authorAvatar: "https://images.unsplash.com/photo-1594824813581-2292f725350c?w=150&h=150&fit=crop&crop=faces",
    authorRole: "DOCTOR",
    authorSpecializationOrDiscipline: "Pediatric Neurosurgery",
    isVerified: true,
    postType: "TWEET",
    content: "High-yield pearl for all surgical residents: In hydrocephalus secondary to aqueductal stenosis, Endoscopic Third Ventriculostomy (ETV) demonstrates a 78% success rate without the lifelong mechanical malfunction risks of VP shunts. Check the liliequist membrane carefully during prep.",
    clinicalTags: ["#Neurosurgery", "#MedTweet", "#Pediatrics", "#SurgicalPearls"],
    likesCount: 185,
    commentsCount: 29,
    savesCount: 82,
    sharesCount: 24,
    isLiked: true,
    isSaved: false,
    isFollowing: true,
    createdAt: "4 hours ago"
  },
  {
    id: "post-3",
    authorId: "stu-1",
    authorName: "Rohan Verma",
    authorUsername: "rohan_verma_mbbs",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
    authorRole: "STUDENT",
    authorSpecializationOrDiscipline: "Final Year MBBS",
    isVerified: true,
    postType: "IMAGE_CASE",
    content: "Radiology round review: Classic 'Water Bottle Heart' contour on AP chest radiograph in a 34-year-old female presenting with muffled heart sounds, elevated JVP, and systemic hypotension (Beck's Triad). Immediate bedside pericardiocentesis was life-saving.",
    mediaUrls: ["https://images.unsplash.com/photo-1516549655169-df83a0774514?w=900&h=500&fit=crop"],
    clinicalTags: ["#Radiology", "#CardiacTamponade", "#MedicalStudent", "#HighYield"],
    likesCount: 224,
    commentsCount: 31,
    savesCount: 95,
    sharesCount: 19,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    createdAt: "7 hours ago"
  }
];

export const MEDCLIPS: Medclip[] = [
  {
    id: "clip-1",
    authorId: "doc-1",
    authorName: "Dr. Arvind Ramesh, MD, DM",
    authorSpecialty: "Interventional Cardiology",
    authorAvatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop",
    isVerified: true,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-doctor-writing-a-prescription-43403-large.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=900&fit=crop",
    caption: "Cath Lab Tutorial: Intravascular Ultrasound (IVUS) interpretation before bifurcation stenting. Learn the exact vessel lumen diameter calculation.",
    clinicalCategory: "following",
    tags: ["#Cardiology", "#CathLab", "#Fellowship"],
    likesCount: 890,
    commentsCount: 64,
    savesCount: 240,
    sharesCount: 110,
    isLiked: true,
    isSaved: false,
    isFollowing: true,
    createdAt: "1 day ago"
  },
  {
    id: "clip-2",
    authorId: "doc-2",
    authorName: "Dr. Priya Nair, MS, MCh",
    authorSpecialty: "Pediatric Neurosurgery",
    authorAvatar: "https://images.unsplash.com/photo-1594824813581-2292f725350c?w=150&h=150&fit=crop",
    isVerified: true,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-doctor-checking-a-patients-x-ray-43404-large.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&h=900&fit=crop",
    caption: "Surgical knots under loupes: Demonstrating single-hand surgical knot tying technique for deep cavity neurosurgical closures.",
    clinicalCategory: "following",
    tags: ["#Neurosurgery", "#SurgicalTechnique", "#Residents"],
    likesCount: 1240,
    commentsCount: 92,
    savesCount: 410,
    sharesCount: 178,
    isLiked: false,
    isSaved: true,
    isFollowing: true,
    createdAt: "2 days ago"
  },
  {
    id: "clip-3",
    authorId: "mgr-1",
    authorName: "MedMedia Administrator",
    authorSpecialty: "Clinical Governance",
    authorAvatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop",
    isVerified: true,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-medical-researcher-in-a-laboratory-looking-at-a-microscope-43408-large.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&h=900&fit=crop",
    caption: "Clinical Practice Update: 2026 Guidelines on Patient De-identification & Ethical Case Sharing in Social Medicine.",
    clinicalCategory: "following",
    tags: ["#Ethics", "#HIPAA", "#MedicalEducation"],
    likesCount: 620,
    commentsCount: 45,
    savesCount: 190,
    sharesCount: 75,
    isLiked: false,
    isSaved: false,
    isFollowing: true,
    createdAt: "3 days ago"
  }
];

export const COMMUNITIES: Community[] = [
  // 0. Flagship WhatsApp-Style Community: Anatomic Community
  {
    id: "comm-anatomy",
    name: "Anatomic Community",
    iconUrl: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=150&h=150&fit=crop",
    avatarUrl: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=150&h=150&fit=crop",
    description: "Official Anatomic & Surgical Dissection Community. Hub for anatomical cross-sections, cadaveric studies, and surgical anatomy pearls.",
    category: "Specialty",
    membersCount: 4120,
    maxCapacity: 10000,
    creatorId: "doc-1",
    creatorName: "Dr. Arvind Ramesh",
    isOfficial: true,
    announcementText: "Welcome to the Anatomic Community! Weekly cadaveric prosection review every Thursday at 7:00 PM. Access all sub-channels below.",
    channels: [
      {
        id: "chan-announcements",
        name: "Announcements & CME Notices",
        description: "Official broadcast channel for dissecting lab protocols, conferences, and surgical anatomy workshops.",
        isAnnouncement: true,
        messagesCount: 18,
        lastMessageSnippet: "New cadaveric workshop registration link posted for upcoming weekend.",
        lastMessageTime: "Today, 11:30 AM"
      },
      {
        id: "chan-gross-anatomy",
        name: "Gross Anatomy & Dissections",
        description: "Case discussions on muscular variants, arterial branching anomalies, and peripheral nerves.",
        messagesCount: 94,
        lastMessageSnippet: "Check out the anomalous branching of the coeliac trunk in today's cadaveric dissection.",
        lastMessageTime: "Yesterday"
      },
      {
        id: "chan-neuroanatomy",
        name: "Neuroanatomy & Brain Correlates",
        description: "Brainstem tracts, cranial nerve pathways, and 3D ventricular system reconstructions.",
        messagesCount: 62,
        lastMessageSnippet: "Coronal MRI vs 3D anatomical reconstruction comparison posted.",
        lastMessageTime: "2 days ago"
      },
      {
        id: "chan-surgical-anatomy",
        name: "Applied Surgical Anatomy",
        description: "Anatomical landmarks for laparoscopy, robotic access, and hepatobiliary triangles.",
        messagesCount: 120,
        lastMessageSnippet: "Safe dissection planes during retroperitoneal exposure and vascular control.",
        lastMessageTime: "3 days ago"
      }
    ],
    createdAt: "2026-01-01"
  },
  // 1. Specialty Communities
  {
    id: "comm-cardio",
    name: "Cardiology & Vascular Medicine",
    iconUrl: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=150&h=150&fit=crop",
    description: "Hub for cardiologists, cardiac surgeons, and fellows. ECG challenges, cath lab trials, and heart failure protocols.",
    category: "Specialty",
    membersCount: 4820,
    maxCapacity: 10000,
    creatorId: "doc-1",
    creatorName: "Dr. Arvind Ramesh",
    isOfficial: true,
    createdAt: "2026-01-01"
  },
  {
    id: "comm-neuro",
    name: "Neurology & Neurosurgery",
    iconUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=150&h=150&fit=crop",
    description: "Brain imaging, stroke management, neuroendoscopy, and spine surgery clinical discussions.",
    category: "Specialty",
    membersCount: 3950,
    maxCapacity: 10000,
    creatorId: "doc-2",
    creatorName: "Dr. Priya Nair",
    isOfficial: true,
    createdAt: "2026-01-01"
  },
  {
    id: "comm-surgery",
    name: "General & Laparoscopic Surgery",
    iconUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=150&h=150&fit=crop",
    description: "OR tips, minimally invasive surgical procedures, post-op complication reviews, and surgical residency forum.",
    category: "Specialty",
    membersCount: 5210,
    maxCapacity: 10000,
    creatorId: "mgr-1",
    creatorName: "MedMedia Administration",
    isOfficial: true,
    createdAt: "2026-01-01"
  },
  {
    id: "comm-derma",
    name: "Dermatology & Cosmetology",
    iconUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&h=150&fit=crop",
    description: "Dermoscopy patterns, rare rashes, autoimmune skin disorders, and aesthetic lasers.",
    category: "Specialty",
    membersCount: 2640,
    maxCapacity: 10000,
    creatorId: "mgr-1",
    creatorName: "MedMedia Administration",
    isOfficial: true,
    createdAt: "2026-01-01"
  },
  {
    id: "comm-pediatrics",
    name: "Pediatrics & Neonatology",
    iconUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=150&h=150&fit=crop",
    description: "NICU management, pediatric milestones, vaccination updates, and childhood disease case reviews.",
    category: "Specialty",
    membersCount: 3120,
    maxCapacity: 10000,
    creatorId: "doc-2",
    creatorName: "Dr. Priya Nair",
    isOfficial: true,
    createdAt: "2026-01-01"
  },
  {
    id: "comm-ortho",
    name: "Orthopedics & Sports Medicine",
    iconUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=150&h=150&fit=crop",
    description: "Arthroplasty, fracture fixation, arthroscopy, and spine stabilization case sharing.",
    category: "Specialty",
    membersCount: 2980,
    maxCapacity: 10000,
    creatorId: "mgr-1",
    creatorName: "MedMedia Administration",
    isOfficial: true,
    createdAt: "2026-01-01"
  },
  {
    id: "comm-radiology",
    name: "Radiology & Imaging Diagnostics",
    iconUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=150&h=150&fit=crop",
    description: "CT, MRI, Ultrasound, and PET-CT film discussions with consultant radiologists.",
    category: "Specialty",
    membersCount: 4400,
    maxCapacity: 10000,
    creatorId: "mgr-1",
    creatorName: "MedMedia Administration",
    isOfficial: true,
    createdAt: "2026-01-01"
  },

  // 2. Student Year Communities
  {
    id: "comm-year1",
    name: "1st Year MBBS Medical Cohort",
    iconUrl: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=150&h=150&fit=crop",
    description: "Anatomy dissection tips, Physiology graphs, Biochemistry pathways, and professional foundation.",
    category: "Student Cohort",
    membersCount: 3890,
    maxCapacity: 10000,
    creatorId: "mgr-1",
    creatorName: "MedMedia Student Wing",
    isOfficial: true,
    createdAt: "2026-01-01"
  },
  {
    id: "comm-year2",
    name: "2nd Year MBBS Medical Cohort",
    iconUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=150&h=150&fit=crop",
    description: "Pathology gross specimens, Pharmacology drug tables, and Microbiology culture identification.",
    category: "Student Cohort",
    membersCount: 4210,
    maxCapacity: 10000,
    creatorId: "mgr-1",
    creatorName: "MedMedia Student Wing",
    isOfficial: true,
    createdAt: "2026-01-01"
  },
  {
    id: "comm-year3",
    name: "3rd Year MBBS Medical Cohort",
    iconUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=150&h=150&fit=crop",
    description: "Ophthalmology fundus exams, ENT tuning forks, Forensic medicine, and Community health field postings.",
    category: "Student Cohort",
    membersCount: 3670,
    maxCapacity: 10000,
    creatorId: "mgr-1",
    creatorName: "MedMedia Student Wing",
    isOfficial: true,
    createdAt: "2026-01-01"
  },
  {
    id: "comm-year4",
    name: "Final Year MBBS & Clinical Interns",
    iconUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    description: "Medicine, Surgery, OBG, Pediatrics bedside case presentations, NEET-PG & USMLE high-yield tips.",
    category: "Student Cohort",
    membersCount: 6890,
    maxCapacity: 10000,
    creatorId: "stu-1",
    creatorName: "Rohan Verma",
    isOfficial: true,
    createdAt: "2026-01-01"
  }
];

export const COURSES: CourseItem[] = [
  {
    id: "crs-who",
    name: "WHO Academy: Clinical Infection Prevention & Outbreak Control",
    provider: "WHO Academy",
    logoUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=150&h=150&fit=crop",
    description: "Official World Health Organization training module on standard precautions, PPE sequencing, hospital disinfection, and IPC audit execution.",
    link: "https://academy.who.int",
    isFree: true,
    cmeCredits: 4
  },
  {
    id: "crs-stanford",
    name: "Stanford Medicine: Antimicrobial Stewardship & Critical Care",
    provider: "Stanford University",
    logoUrl: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=150&h=150&fit=crop",
    description: "Advanced antimicrobial decision pathways, empirical vs targeted antibiotic de-escalation, and reducing MDR organism emergence in tertiary care.",
    link: "https://online.stanford.edu",
    isFree: true,
    cmeCredits: 6
  },
  {
    id: "crs-nih",
    name: "NIH: Principles & Practice of Clinical Research (IPPCR)",
    provider: "National Institutes of Health",
    logoUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=150&h=150&fit=crop",
    description: "Comprehensive curriculum from the NIH Clinical Center covering clinical study design, biostatistics, FDA IND/IDE regulations, and medical ethics.",
    link: "https://ocr.od.nih.gov",
    isFree: true,
    cmeCredits: 8
  },
  {
    id: "crs-harvard",
    name: "Harvard Medical School: Mechanical Ventilation in Critical Illness",
    provider: "Harvard University",
    logoUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=150&h=150&fit=crop",
    description: "Practical ICU physiology, ventilator waveform interpretation, lung-protective ventilation in ARDS, and patient-ventilator dyssynchrony troubleshooting.",
    link: "https://pll.harvard.edu",
    isFree: true,
    cmeCredits: 5
  },
  {
    id: "crs-research",
    name: "Cochrane Clinical Trials Review & Systematic Literature Synthesis",
    provider: "Research Courses",
    logoUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=150&h=150&fit=crop",
    description: "Methodology of systematic reviews, PRISMA flowcharts, risk-of-bias assessment tools, and meta-analytic forest plot interpretation for clinician investigators.",
    link: "https://www.authoraid.info",
    isFree: true,
    cmeCredits: 4
  },
  {
    id: "crs-ai",
    name: "AI & Deep Learning Applications in Diagnostic Radiology",
    provider: "AI Courses",
    logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&h=150&fit=crop",
    description: "Demystifying computer vision convolutional networks for CXR, brain CT hemorrhage triage, and integrating CAD algorithms into hospital PACS workflows.",
    link: "https://coursera.org",
    isFree: true,
    cmeCredits: 6
  },
  {
    id: "crs-unicef",
    name: "UNICEF Agora: Integrated Management of Neonatal & Child Illness",
    provider: "UNICEF Agora",
    logoUrl: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=150&h=150&fit=crop",
    description: "Emergency triage, assessment, and treatment (ETAT) guidelines for infants, pediatric dehydration management, and severe acute malnutrition protocols.",
    link: "https://agora.unicef.org",
    isFree: true,
    cmeCredits: 3
  },
  {
    id: "crs-openwho",
    name: "OpenWHO: Public Health Emergency Operations & Mass Casualty Triage",
    provider: "OpenWHO",
    logoUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150&h=150&fit=crop",
    description: "Fast-track international emergency health guidelines, incident management frameworks, and chemical/biological disaster triage algorithms.",
    link: "https://openwho.org",
    isFree: true,
    cmeCredits: 4
  }
];

export const SCHOLARSHIPS: ScholarshipItem[] = [
  {
    id: "sch-icmr",
    name: "ICMR Short Term Studentship (STS) 2026",
    organization: "Indian Council of Medical Research",
    logoUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=150&h=150&fit=crop",
    fundingAmount: "₹50,000 Stipend + ICMR Certificate",
    description: "Prestigious national research grant for undergraduate MBBS/BDS students to conduct 2 months of mentored clinical or laboratory research.",
    deadline: "October 30, 2026",
    applyLink: "https://icmr.gov.in"
  },
  {
    id: "sch-wellcome",
    name: "Wellcome Trust International Clinical Fellowship",
    organization: "Wellcome Trust Foundation",
    logoUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=150&h=150&fit=crop",
    fundingAmount: "£180,000 / 3-Year Grant",
    description: "Enables early-career clinical specialists to conduct groundbreaking global health and translational epidemiology studies with UK host institutions.",
    deadline: "November 15, 2026",
    applyLink: "https://wellcome.org"
  },
  {
    id: "sch-rhodes",
    name: "Rhodes Medical Sciences Scholarship (Oxford)",
    organization: "Oxford University Rhodes Trust",
    logoUrl: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=150&h=150&fit=crop",
    fundingAmount: "100% Tuition + £19,000 / year stipend",
    description: "Postgraduate medical scholars scholarship covering MSc or DPhil in Clinical Neurosciences, Oncology, or Global Health at University of Oxford.",
    deadline: "December 01, 2026",
    applyLink: "https://www.rhodeshouse.ox.ac.uk"
  },
  {
    id: "sch-harvard",
    name: "Harvard Global Health Travel & Research Fellowship",
    organization: "Harvard Global Health Institute",
    logoUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=150&h=150&fit=crop",
    fundingAmount: "$12,000 Project Sponsorship",
    description: "Provides travel, laboratory logistics, and publication sponsorship for collaborative health equity and low-resource clinical trials.",
    deadline: "January 10, 2027",
    applyLink: "https://globalhealth.harvard.edu"
  }
];

export const RESEARCH_PROJECTS: ResearchProject[] = [
  {
    id: "res-1",
    projectName: "Multi-Center AI-ECG Early Arrhythmia Detection Trial",
    instituteName: "Apollo Hospitals & AIIMS Consortium",
    departmentName: "Department of Cardiology & Health Informatics",
    place: "Bangalore, India",
    description: "Investigating deep learning model sensitivity in detecting subtle paroxysmal atrial fibrillation and subclinical QT prolongation on standard 12-lead ECGs prior to cardiac arrest events. #Cardiology #MachineLearning #Arrhythmia #ClinicalTrial",
    tags: ["#Cardiology", "#AI", "#ClinicalTrial", "#ECG"],
    photosOrLink: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=900&h=500&fit=crop",
    creatorId: "doc-1",
    creatorName: "Dr. Arvind Ramesh, MD, DM",
    creatorAvatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop",
    memberIds: ["doc-1", "stu-1"],
    pendingJoinRequestIds: [],
    notes: [
      {
        id: "note-1",
        title: "Cohort Inclusion Criteria Protocol v2.1",
        content: "Patients aged 18-75 presenting with intermittent palpitation episodes and baseline normal Sinus Rhythm. Exclude patients with implanted permanent pacemakers or severe valvular stenosis.",
        authorId: "doc-1",
        authorName: "Dr. Arvind Ramesh",
        updatedAt: "2 days ago"
      },
      {
        id: "note-2",
        title: "Interim De-identified Dataset Snapshot",
        content: "240 anonymized recordings collected from Apollo Cath Unit 2. Validation ROC AUC currently at 0.942 on external validation set.",
        authorId: "stu-1",
        authorName: "Rohan Verma",
        updatedAt: "Yesterday"
      }
    ],
    messages: [
      {
        id: "rm-1",
        senderId: "doc-1",
        senderName: "Dr. Arvind Ramesh",
        senderAvatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop",
        text: "Team, the IRB ethical clearance renewal has been formally approved. We can expand cohort intake to 500 patients.",
        timestamp: "10:30 AM"
      },
      {
        id: "rm-2",
        senderId: "stu-1",
        senderName: "Rohan Verma",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
        text: "Excellent news Dr. Ramesh! I will finalize the anonymization log for the incoming patient records today.",
        timestamp: "10:45 AM"
      }
    ],
    createdAt: "2026-02-10"
  },
  {
    id: "res-2",
    projectName: "Pediatric Neuroendoscopy Hydrocephalus Outcome Registry",
    instituteName: "Manipal Hospital & NIMHANS",
    departmentName: "Department of Pediatric Neurosurgery",
    place: "Bangalore, India",
    description: "Prospective registry analyzing 24-month shunt-free survival in infants undergoing ETV with choroid plexus cauterization (ETV+CPC). #Neurosurgery #Pediatrics #Hydrocephalus",
    tags: ["#Neurosurgery", "#Pediatrics", "#Hydrocephalus"],
    photosOrLink: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=900&h=500&fit=crop",
    creatorId: "doc-2",
    creatorName: "Dr. Priya Nair, MS, MCh",
    creatorAvatar: "https://images.unsplash.com/photo-1594824813581-2292f725350c?w=150&h=150&fit=crop",
    memberIds: ["doc-2"],
    pendingJoinRequestIds: ["stu-1"],
    notes: [
      {
        id: "note-3",
        title: "ETV Success Score (ETVSS) Stratification Table",
        content: "Age < 1 month (score 0), 1-6 months (score 10), etiology post-infectious vs congenital stenosis, previous shunt history.",
        authorId: "doc-2",
        authorName: "Dr. Priya Nair",
        updatedAt: "3 days ago"
      }
    ],
    messages: [
      {
        id: "rm-3",
        senderId: "doc-2",
        senderName: "Dr. Priya Nair",
        senderAvatar: "https://images.unsplash.com/photo-1594824813581-2292f725350c?w=150&h=150&fit=crop",
        text: "Welcoming candidate co-investigators for the 2026 surgical cohort follow-up audit.",
        timestamp: "Yesterday"
      }
    ],
    createdAt: "2026-02-18"
  }
];

export const LOCUM_GIGS: LocumGig[] = [
  {
    id: "locum-1",
    instituteName: "Apollo Emergency Center",
    place: "Bannerghatta Road, Bangalore",
    duration: "2 Weeks (Covering Oct 15 - Oct 30, Weekend Duty)",
    gigName: "Consultant Interventional Cardiologist On-Call Locum",
    stipend: "₹45,000 / Weekend Shift + Travel Covered",
    documentsUrl: "https://example.com/locum-guidelines.pdf",
    email: "cardio.locum@apollohospitals.org",
    phone: "+91 98450 11223",
    otherLink: "https://apollohospitals.org/careers",
    creatorId: "doc-1",
    creatorName: "Dr. Arvind Ramesh",
    createdAt: "2026-09-10"
  },
  {
    id: "locum-2",
    instituteName: "Fortis Super Specialty Hospital",
    place: "Cunningham Road, Bangalore",
    duration: "1 Month (Night Shift ICU Cover)",
    gigName: "Critical Care / ICU Registrar Night Locum",
    stipend: "₹3,500 / 12-Hour Night Shift",
    email: "hr.bangalore@fortishealthcare.com",
    phone: "+91 80 4199 4444",
    otherLink: "https://fortishealthcare.com",
    creatorId: "mgr-1",
    creatorName: "MedMedia Administration",
    createdAt: "2026-09-12"
  },
  {
    id: "locum-3",
    instituteName: "St. John's Community Outreach Hospital",
    place: "Rural Karnataka Health Outpost",
    duration: "3 Days (Tribal Health & Clinical Screening Camp)",
    gigName: "Community Pediatric Screening Volunteer Clinician",
    stipend: "Experience only (Official Institutional Certificate & All Boarding Covered)",
    email: "outreach@stjohns.in",
    phone: "+91 80 2206 5000",
    creatorId: "doc-2",
    creatorName: "Dr. Priya Nair",
    createdAt: "2026-09-15"
  }
];

export const LOCUM_APPLICATIONS: LocumApplication[] = [
  {
    id: "loc-app-1",
    gigId: "locum-2",
    gigName: "Critical Care / ICU Registrar Night Locum",
    name: "Dr. Vikram Seth",
    qualification: "MBBS, MD Anesthesiology",
    resumeUrl: "https://example.com/vikram_seth_cv.pdf",
    email: "vikram.seth@gmail.com",
    contactNumber: "+91 98801 44552",
    otherLink: "https://linkedin.com/in/vikram-seth-md",
    applicantId: "doc-1",
    submittedAt: "2026-09-18"
  }
];

export const JOBS: Job[] = [
  {
    id: "job-1",
    title: "Senior Consultant Interventional Cardiologist",
    category: "Doctor jobs",
    type: "Full time",
    companyName: "Apollo Hospitals",
    place: "Bangalore, Karnataka",
    experience: "8+ Years Post DM / DNB",
    salary: "₹38 - 55 Lakhs P.A.",
    description: "Seeking an experienced consultant to lead the structural heart disease program, TAVR clinical pathway, and advanced cardiac catheterization suite. High-volume center with state-of-the-art biplane cath labs.",
    preferenceEducation: "MBBS, MD Internal Medicine, DM/DNB Cardiology, FSCAI preferred",
    skills: ["TAVR", "CTO Angioplasty", "IVUS", "Rotablation", "IABP"],
    hospitalLogoUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&h=120&fit=crop",
    postedAt: "1 day ago"
  },
  {
    id: "job-2",
    title: "Assistant Professor & Clinical Fellow - Pediatric Neurosurgery",
    category: "academic jobs",
    type: "Full time",
    companyName: "Manipal Hospital Academic Medical Center",
    place: "Bangalore, Karnataka",
    experience: "3-5 Years Post MCh / DNB",
    salary: "₹24 - 32 Lakhs P.A.",
    description: "Academic faculty position involving resident teaching, micro-neurosurgical pediatric theater cases, and clinical research trial management.",
    preferenceEducation: "MBBS, MS General Surgery, MCh / DNB Neurosurgery",
    skills: ["Pediatric Brain Tumors", "Endoscopy", "Craniosynostosis", "Medical Teaching"],
    hospitalLogoUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=120&h=120&fit=crop",
    postedAt: "3 days ago"
  },
  {
    id: "job-3",
    title: "Junior Clinical Resident & Ward Registrar",
    category: "Internship",
    type: "Full time",
    companyName: "Fortis Memorial Healthcare Institute",
    place: "New Delhi / Gurgaon",
    experience: "Fresh MBBS Graduates / 0-2 Years",
    salary: "₹85,000 - 1,10,000 / month",
    description: "Comprehensive in-patient care, triage stabilization, daily ward rounds with senior faculty, and preparation for PG medical entrance.",
    preferenceEducation: "MBBS (NMC / State Council Registered)",
    skills: ["Emergency Triaging", "ACLS / BLS", "Arterial Line Insertion", "Patient Management"],
    hospitalLogoUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=120&h=120&fit=crop",
    postedAt: "5 days ago"
  },
  {
    id: "job-4",
    title: "Post-Doctoral Fellow in Clinical Oncology Research",
    category: "fellowship",
    type: "Full time",
    companyName: "Tata Memorial Medical Centre",
    place: "Mumbai, Maharashtra",
    experience: "1-3 Years",
    salary: "₹18 - 24 Lakhs P.A. + Grant",
    description: "Dedicated fellowship in molecular oncology, genomic targeted therapies, and Phase II/III immuno-oncology clinical trials.",
    preferenceEducation: "MD / DNB / DM Oncology or Pharmacology",
    skills: ["Genomic Profiling", "Immunotherapy Protocols", "Biostatistics", "IRB Documentation"],
    hospitalLogoUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=120&h=120&fit=crop",
    postedAt: "1 week ago"
  }
];

export const OPPORTUNITIES: OpportunityItem[] = [
  {
    id: "opp-1",
    type: "EVENT",
    title: "77th Annual All India Medical & Surgical Congress",
    subtitle: "Indian Medical Association National Forum",
    description: "Premier academic assembly bringing 2,500+ surgeons, physicians, and medical students together. Keynotes by international AIIMS and Harvard faculty.",
    tags: ["#MedicalConference", "#CME", "#Surgery", "#InternalMedicine"],
    organizerOrAffiliation: "Indian Medical Association (IMA)",
    locationOrVenue: "Bangalore International Exhibition Centre (BIEC)",
    dateTime: "Nov 14-16, 2026 • 09:00 AM IST",
    contactEmail: "congress2026@ima-india.org",
    actionLabel: "Register for CME",
    cmeCredits: 6
  },
  {
    id: "opp-2",
    type: "EVENT",
    title: "Hands-on Workshop: Critical Care Hemodynamic Ultrasound (POCUS)",
    subtitle: "Apollo Institute of Critical Care Simulation",
    description: "Intensive 2-day simulation workshop covering cardiac echo windows, lung sliding signs for pneumothorax, and IVC collapsibility assessment.",
    tags: ["#POCUS", "#Ultrasound", "#CriticalCare", "#EmergencyMedicine"],
    organizerOrAffiliation: "Apollo Simulation Center",
    locationOrVenue: "Apollo Hospitals Simulation Lab, 5th Floor, Bangalore",
    dateTime: "Oct 22-23, 2026 • 08:30 AM IST",
    contactEmail: "simulation.pocus@apollohospitals.org",
    actionLabel: "Book Workshop Seat",
    cmeCredits: 4
  }
];

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    userId: "doc-1",
    type: "CONFERENCE",
    title: "Conference Call: 77th Annual Medical Congress Registration Open",
    description: "Early bird registration and abstract submission for the National Medical Congress is now open. 6 CME credits granted.",
    timestamp: "10 mins ago",
    isRead: false,
    actionUrl: "opportunities?tab=events"
  },
  {
    id: "notif-2",
    userId: "doc-1",
    type: "JOB_APPLICATION",
    title: "Job Application Update: Apollo Interventional Fellow Position",
    description: "Dr. Sandeep Kulkarni has shortlisted your profile for the Senior Consultant review panel.",
    timestamp: "1 hour ago",
    isRead: false,
    actionUrl: "opportunities?tab=jobs"
  },
  {
    id: "notif-3",
    userId: "doc-1",
    type: "JOB_UPDATE",
    title: "New Job Alert: Academic Faculty Opening in Pediatric Neurosurgery",
    description: "Manipal Hospital posted a new position matching your clinical network interests.",
    timestamp: "3 hours ago",
    isRead: true,
    actionUrl: "opportunities?tab=jobs"
  },
  {
    id: "notif-4",
    userId: "doc-1",
    type: "FOLLOW_ACCEPTED",
    title: "Dr. Sandeep Kulkarni accepted your follow request",
    description: "You are now connected with Dr. Sandeep Kulkarni (CTVS Surgeon @ AIIMS).",
    timestamp: "Yesterday",
    isRead: true,
    actionUrl: "users/doc-3"
  }
];

export const SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "ticket-1001",
    userId: "doc-1",
    userName: "Dr. Arvind Ramesh",
    userEmail: "dr.ramesh@apollohospitals.org",
    category: "Verification",
    description: "Requesting additional Board Certification badge update for FSCAI credential.",
    forwardedTo: "medmedia1409@gmail.com",
    status: "RESOLVED",
    createdAt: "2026-09-15"
  }
];

export const EVENTS: EventItem[] = [
  {
    id: "evt-1",
    name: "Karnataka State Medical Council Annual Clinical Conclave 2026",
    description: "Multi-specialty state symposium covering emerging infection protocols, medicolegal compliance, and clinical governance.",
    date: "Oct 18-20, 2026",
    time: "09:00 AM - 05:00 PM IST",
    location: "Bangalore Medical College Auditorium, Bangalore",
    isOnline: false,
    filterType: "Near You",
    organizer: "Karnataka Medical Council (KMC) & BMCRI",
    registrationLink: "https://kmc.karnataka.gov.in/events/conclave2026",
    cmeCredits: 4,
    tags: ["#ClinicalMedicine", "#CME", "#NearYou", "#Karnataka"],
    bannerUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=400&fit=crop",
    contactEmail: "events@kmc.org.in",
    createdAt: "2026-09-20"
  },
  {
    id: "evt-2",
    name: "Hands-on Emergency Airway & Trauma Resuscitation Masterclass",
    description: "Simulated scenario masterclass for rapid sequence intubation, surgical cricothyroidotomy, and chest tube placement.",
    date: "Nov 05, 2026",
    time: "10:00 AM - 04:00 PM IST",
    location: "Apollo Hospitals Simulation Training Center, Bannerghatta Road, Bangalore",
    isOnline: false,
    filterType: "Near You",
    organizer: "Apollo Department of Emergency Medicine",
    registrationLink: "https://apollohospitals.com/education/trauma-cme",
    cmeCredits: 3,
    tags: ["#EmergencyMedicine", "#Trauma", "#NearYou", "#HandsOn"],
    bannerUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&h=400&fit=crop",
    contactEmail: "simcenter@apollohospitals.org",
    createdAt: "2026-09-22"
  },
  {
    id: "evt-3",
    name: "World Congress of Cardiology & Cardiovascular Health (WCC 2026)",
    description: "The global flagship gathering for interventional cardiologists, electrophysiologists, and cardiovascular epidemiologists.",
    date: "Dec 02-05, 2026",
    time: "All Day",
    location: "Paris Expo Porte de Versailles, Paris, France",
    isOnline: false,
    filterType: "International",
    organizer: "World Heart Federation (WHF)",
    registrationLink: "https://worldheart.org/wcc-2026",
    cmeCredits: 18,
    tags: ["#Cardiology", "#International", "#GlobalHealth", "#WCC"],
    bannerUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=400&fit=crop",
    contactEmail: "info@worldheart.org",
    createdAt: "2026-09-18"
  },
  {
    id: "evt-4",
    name: "Harvard Global Internal Medicine & Clinical Diagnostics Summit",
    description: "International symposium exploring high-yield diagnostic dilemmas, biomarker innovations, and clinical AI implementation.",
    date: "Jan 14-16, 2027",
    time: "08:30 AM EST",
    location: "Harvard Medical School, Boston, MA, USA",
    isOnline: false,
    filterType: "International",
    organizer: "Harvard Medical School Executive Education",
    registrationLink: "https://postgraduateeducation.hms.harvard.edu",
    cmeCredits: 20,
    tags: ["#InternalMedicine", "#International", "#Diagnostics", "#Harvard"],
    bannerUrl: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&h=400&fit=crop",
    contactEmail: "cme@hms.harvard.edu",
    createdAt: "2026-09-15"
  },
  {
    id: "evt-5",
    name: "All India Medical & Surgical Conference (AIMCON 2026)",
    description: "National annual gathering of physicians and surgeons featuring plenary lectures from AIIMS, PGI, and CMC faculties.",
    date: "Nov 22-25, 2026",
    time: "09:00 AM - 06:00 PM IST",
    location: "Vigyan Bhawan, New Delhi",
    isOnline: false,
    filterType: "National",
    organizer: "All India Institute of Medical Sciences & IMA",
    registrationLink: "https://aimcon2026.med.in",
    cmeCredits: 8,
    tags: ["#National", "#Surgery", "#Medicine", "#AIMCON"],
    bannerUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&h=400&fit=crop",
    contactEmail: "secretariat@aimcon2026.med.in",
    createdAt: "2026-09-10"
  },
  {
    id: "evt-6",
    name: "National Pediatric Intensive Care & Neonatal Assembly",
    description: "Consensus guidelines on high-frequency oscillatory ventilation and neonatal sepsis management protocols.",
    date: "Dec 10-12, 2026",
    time: "10:00 AM - 05:00 PM IST",
    location: "PGI Chandigarh Auditorium, Chandigarh",
    isOnline: false,
    filterType: "National",
    organizer: "Indian Academy of Pediatrics (IAP)",
    registrationLink: "https://iapindia.org/events/national2026",
    cmeCredits: 6,
    tags: ["#National", "#Pediatrics", "#NICU", "#PGI"],
    bannerUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&h=400&fit=crop",
    contactEmail: "pediatrics@iapindia.org",
    createdAt: "2026-09-12"
  },
  {
    id: "evt-7",
    name: "Global Webinar on Clinical AI & Deep Learning in Radiology",
    description: "Interactive virtual workshop detailing chest CT lesion segmentation, stroke detection algorithms, and FDA AI approvals.",
    date: "Oct 28, 2026",
    time: "06:00 PM - 08:30 PM IST",
    location: "Live Virtual Stream (Zoom & MedMedia Auditorium)",
    isOnline: true,
    filterType: "Online",
    organizer: "MedMedia Digital Imaging Council & RSNA Fellows",
    registrationLink: "https://medmedia.health/events/ai-radiology-live",
    cmeCredits: 2,
    tags: ["#Online", "#Radiology", "#AI", "#Webinar"],
    bannerUrl: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&h=400&fit=crop",
    contactEmail: "webinars@medmedia.health",
    createdAt: "2026-09-24"
  },
  {
    id: "evt-8",
    name: "Cadaveric Pelvic & Acetabular Surgical Approach Masterclass",
    description: "Intensive 2-day cadaveric dissection workshop demonstrating modified Stoppa and ilioinguinal approaches.",
    date: "Nov 28-29, 2026",
    time: "08:30 AM - 05:30 PM IST",
    location: "Anatomy Dissection Hall, Ramaiah Advanced Learning Centre, Bangalore",
    isOnline: false,
    filterType: "Offline",
    organizer: "Department of Anatomy & Orthopedic Trauma Society",
    registrationLink: "https://msralc.org/surgical-courses/acetabular-2026",
    cmeCredits: 6,
    tags: ["#Offline", "#Anatomy", "#Orthopedics", "#Cadaveric"],
    bannerUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=400&fit=crop",
    contactEmail: "courses@msralc.org",
    createdAt: "2026-09-21"
  }
];

export const LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: "lib-1",
    name: "Gray's Anatomy for Students (5th Edition)",
    author: "Richard Drake, A. Wayne Vogl, Adam W. M. Mitchell",
    description: "The gold standard anatomical reference for conceptual understanding, surface anatomy, and clinical pearls.",
    link: "https://www.clinicalkey.com/#!/browse/book/3-s2.0-C20180029337",
    category: "Anatomy & Embryology",
    edition: "5th Edition (2024)",
    coverUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=400&h=600&fit=crop",
    createdAt: "2026-01-01"
  },
  {
    id: "lib-2",
    name: "Harrison's Principles of Internal Medicine (21st Edition)",
    author: "Joseph Loscalzo, Anthony Fauci, Dennis Kasper, Stephen Hauser",
    description: "The definitive landmark textbook for pathophysiology, clinical manifestations, and evidence-based therapeutics.",
    link: "https://accessmedicine.mhmedical.com/book.aspx?bookid=3095",
    category: "Internal Medicine",
    edition: "21st Edition",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
    createdAt: "2026-01-01"
  },
  {
    id: "lib-3",
    name: "Robbins & Cotran Pathologic Basis of Disease (10th Edition)",
    author: "Vinay Kumar, Abul K. Abbas, Jon C. Aster",
    description: "Readable and authoritative coverage of cellular injury, molecular pathogenesis, and morphologic changes.",
    link: "https://www.elsevier.com/books/robbins-and-cotran-pathologic-basis-of-disease/kumar/978-0-323-53113-9",
    category: "Pathology & Microbiology",
    edition: "10th Edition",
    coverUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=600&fit=crop",
    createdAt: "2026-01-01"
  },
  {
    id: "lib-4",
    name: "Guyton and Hall Textbook of Medical Physiology (14th Edition)",
    author: "John E. Hall, Michael E. Hall",
    description: "Clear and comprehensive presentation of how organ systems interact to maintain bodily homeostasis.",
    link: "https://www.elsevier.com/books/guyton-and-hall-textbook-of-medical-physiology/hall/978-0-323-59712-8",
    category: "Physiology",
    edition: "14th Edition",
    coverUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop",
    createdAt: "2026-01-01"
  },
  {
    id: "lib-5",
    name: "Schwartz's Principles of Surgery (11th Edition)",
    author: "F. Charles Brunicardi, Dana K. Andersen, Timothy R. Billiar",
    description: "Foundational surgical text detailing trauma management, critical care, and advanced operative procedures.",
    link: "https://accesssurgery.mhmedical.com/book.aspx?bookid=2576",
    category: "Surgery",
    edition: "11th Edition",
    coverUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=600&fit=crop",
    createdAt: "2026-01-01"
  }
];

