import { UserProfile, Story, Post, Medclip, Job, OpportunityItem, DeviceSession } from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: "doc-1",
    fullName: "Dr. Arvind Ramesh, MD, DM",
    username: "cardio_ramesh",
    email: "dr.ramesh@apollohospitals.org",
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=faces",
    role: "DOCTOR",
    verificationStatus: "VERIFIED",
    badgeTitle: "Board Certified Interventional Cardiologist",
    bio: "Senior Consultant Interventional Cardiologist @ Apollo Heart Institute. Specializing in complex CTO, TAVR, and clinical trials in heart failure.",
    doctorDetails: {
      specialization: "Interventional Cardiology",
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
      postsCount: 0,
      followersCount: 8920,
      followingCount: 1420
    }
  },
  {
    id: "doc-2",
    fullName: "Dr. Priya Nair, MS, MCh",
    username: "neuro_priya",
    email: "priya.nair@manipal.edu",
    avatarUrl: "https://images.unsplash.com/photo-1594824813581-2292f725350c?w=200&h=200&fit=crop&crop=faces",
    role: "DOCTOR",
    verificationStatus: "VERIFIED",
    badgeTitle: "Consultant Pediatric Neurosurgeon",
    bio: "Pediatric Neurosurgery @ Manipal Hospitals. Passionate about minimally invasive endoscopy, skull base surgery, and medical student mentorship.",
    doctorDetails: {
      specialization: "Pediatric Neurosurgery",
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
      postsCount: 0,
      followersCount: 6410,
      followingCount: 980
    }
  },
  {
    id: "prof-1",
    fullName: "Prof. (Dr.) Rajeshwar Sharma, MD, DM, FICP",
    username: "prof_rajeshwar_cardio",
    email: "dr.rajeshwar@kmc.manipal.edu",
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=faces",
    role: "DOCTOR",
    verificationStatus: "VERIFIED",
    badgeTitle: "Professor & HOD Cardiology | Chief Academic Dean",
    bio: "Senior Professor & Head of Department of Cardiology. Former Director at AIIMS. Dedicated to training the next generation of cardiologists. Accepting ICMR-STS student researchers & clinical interns.",
    doctorDetails: {
      specialization: "Cardiovascular Medicine & Academic Mentorship",
      qualifications: ["MBBS (KIMS Gold Medalist)", "MD Internal Medicine (PGI)", "DM Cardiology (AIIMS)", "FICP", "FRCP (London)"],
      hospitalAffiliation: "KMC Hospital & University Medical Center",
      location: "Manipal / Bangalore, India",
      yearsExperience: 26,
      clinicalInterests: ["Preventive Cardiology", "Valvular Heart Disease", "Bedside Clinical Semiotics", "Undergraduate Mentorship"],
      researchPublications: [
        "Prevalence and Clinical Genetics of Familial Hypercholesterolemia in South India (NEJM 2023)",
        "Undergraduate Medical Curriculum Innovations for Bedside Cardiovascular Skills (Medical Teacher 2024)"
      ],
      medicalCouncilRegNumber: "KMC-19402-IND",
      isProfessor: true,
      academicTitle: "Professor & Head of Department (Cardiology)",
      isAcceptingMentees: true,
      isAcceptingInterns: true,
      mentorshipSlots: { available: 2, total: 5 },
      alumniCollege: "Kempegowda Institute of Medical Sciences (KIMS)",
      activeResearchProject: "ICMR Multicentric Registry: Early Cardiovascular Biomarkers in Young Adults"
    },
    stats: {
      postsCount: 0,
      followersCount: 14200,
      followingCount: 3100
    }
  },
  {
    id: "prof-2",
    fullName: "Prof. (Dr.) Meenakshi Sundaram, MS, FRCS",
    username: "prof_sundaram_surg",
    email: "m.sundaram@bmcri.edu",
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=faces",
    role: "DOCTOR",
    verificationStatus: "VERIFIED",
    badgeTitle: "Professor of Surgery | Laparoscopy Mentor",
    bio: "Professor of General & Minimal Access Surgery @ Bangalore Medical College (BMCRI). 20+ years teaching MBBS & MS surgical residents. Observerships open for final year scholars.",
    doctorDetails: {
      specialization: "General & Laparoscopic Surgery",
      qualifications: ["MBBS (BMCRI)", "MS General Surgery (AIIMS)", "FRCS (Glasgow)", "FACS"],
      hospitalAffiliation: "Victoria Hospital / BMCRI",
      location: "Bangalore, India",
      yearsExperience: 22,
      clinicalInterests: ["Surgical Oncology", "Bariatric Surgery", "Surgical Anatomy", "Residency Training"],
      researchPublications: [
        "Single-Incision Laparoscopic Cholecystectomy: A 10-Year Academic Hospital Series (Annals of Surgery 2023)"
      ],
      medicalCouncilRegNumber: "KMC-28471-IND",
      isProfessor: true,
      academicTitle: "Professor of Surgery & Department Head",
      isAcceptingMentees: true,
      isAcceptingInterns: true,
      mentorshipSlots: { available: 1, total: 4 },
      alumniCollege: "Bangalore Medical College (BMCRI)",
      activeResearchProject: "Evaluating Ergonomics & Simulation in Surgical Resident Training"
    },
    stats: {
      postsCount: 0,
      followersCount: 9800,
      followingCount: 2200
    }
  },
  {
    id: "stu-1",
    fullName: "Rohan Verma",
    username: "medical student",
    email: "rohan.v@kims.edu",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
    role: "STUDENT",
    verificationStatus: "VERIFIED",
    badgeTitle: "Verified Medical Student (MBBS)",
    bio: "Final Year MBBS Student at Kempegowda Institute of Medical Sciences (KIMS). Aspiring Cardiothoracic Surgeon. Seeking Professor Mentorship for ICMR Research & Clinical Internship.",
    studentDetails: {
      discipline: "MEDICAL_STUDENT",
      collegeName: "Kempegowda Institute of Medical Sciences (KIMS)",
      academicYear: 4,
      interests: ["Cardiothoracic Surgery", "ECG Diagnostics", "Bedside Clinical Skills", "USMLE / NEET-PG"],
      futureSpecialty: "Cardiovascular & Thoracic Surgery",
      researchInterests: ["Mechanical Circulatory Support", "Post-operative Hemodynamics in CABG"],
      isSeekingInternship: true,
      isSeekingMentorship: true,
      targetHospitalPreference: ["Manipal Hospital", "Apollo Hospitals", "Narayana Health", "KMC"],
      academicAchievements: ["Gold Medal in Pharmacology (2nd MBBS)", "ICMR-STS Research Grant Recipient 2025"]
    },
    stats: {
      postsCount: 0,
      followersCount: 1840,
      followingCount: 620
    }
  },
  {
    id: "stu-2",
    fullName: "Ananya Desai",
    username: "B parm",
    email: "ananya.d@manipalpharmacy.edu",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces",
    role: "STUDENT",
    verificationStatus: "VERIFIED",
    badgeTitle: "Verified Pharmacy Scholar (B.Pharm)",
    bio: "3rd Year B.Pharm scholar @ Manipal College of Pharmaceutical Sciences. Research intern in clinical pharmacokinetics and therapeutic drug monitoring. Seeking hospital pharmacy observership.",
    studentDetails: {
      discipline: "B_PHARM",
      collegeName: "Manipal College of Pharmaceutical Sciences",
      academicYear: 3,
      interests: ["Pharmacogenomics", "Chemotherapeutic Drug Interactions", "Hospital Pharmacy"],
      futureSpecialty: "Clinical Pharmacology",
      researchInterests: ["Nanocarriers for Targeted Drug Delivery in Glioblastoma"],
      isSeekingInternship: true,
      isSeekingMentorship: true,
      targetHospitalPreference: ["Manipal Hospital", "Tata Memorial Hospital"]
    },
    stats: {
      postsCount: 0,
      followersCount: 920,
      followingCount: 340
    }
  }
];

export const INITIAL_STORIES: Story[] = [];

export const INITIAL_POSTS: Post[] = [];

export const INITIAL_CLIPS: Medclip[] = [
  {
    id: "clip-1",
    authorId: "doc-1",
    authorName: "Dr. Arvind Ramesh",
    authorSpecialty: "Interventional Cardiology",
    authorAvatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop&crop=faces",
    isVerified: true,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=1000&fit=crop",
    caption: "Auscultation masterclass: How to instantly distinguish Aortic Stenosis (ejection systolic murmur radiating to carotids) from Mitral Regurgitation (holosystolic radiating to axilla) using handgrip maneuvers. ðŸŽ§ðŸ©º",
    clinicalCategory: "clinical updates",
    tags: ["#Cardiology", "#ClinicalSkills", "#Auscultation", "#MedEd"],
    likesCount: 1420,
    commentsCount: 112,
    savesCount: 890,
    sharesCount: 310,
    isLiked: false,
    isSaved: true,
    isFollowing: true,
    createdAt: "1 day ago"
  },
  {
    id: "clip-2",
    authorId: "doc-2",
    authorName: "Dr. Priya Nair",
    authorSpecialty: "Pediatric Neurosurgery",
    authorAvatar: "https://images.unsplash.com/photo-1594824813581-2292f725350c?w=100&h=100&fit=crop&crop=faces",
    isVerified: true,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&h=1000&fit=crop",
    caption: "Surgical Knot Tying: The 1-Handed Square Knot technique essential for OR residents. Watch finger placement carefully to prevent slipping. âœ‚ï¸",
    clinicalCategory: "following",
    tags: ["#Surgery", "#SurgicalKnot", "#ORResident", "#SurgicalPearls"],
    likesCount: 2980,
    commentsCount: 184,
    savesCount: 1650,
    sharesCount: 520,
    isLiked: true,
    isSaved: true,
    isFollowing: true,
    createdAt: "2 days ago"
  },
  {
    id: "clip-3",
    authorId: "stu-1",
    authorName: "Rohan Verma",
    authorSpecialty: "Medical Student (Final MBBS)",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    isVerified: true,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=1000&fit=crop",
    caption: "Radiology High-Yield: The Rigler Sign vs Continuous Diaphragm Sign on emergency abdominal X-Rays. Never miss pneumoperitoneum!",
    clinicalCategory: "social update",
    tags: ["#Radiology", "#XRayInterpretation", "#MBBSPrep", "#Emergency"],
    likesCount: 840,
    commentsCount: 45,
    savesCount: 510,
    sharesCount: 95,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    createdAt: "3 days ago"
  },
  {
    id: "clip-4",
    authorId: "prof-1",
    authorName: "Prof. (Dr.) Rajeshwar Sharma",
    authorSpecialty: "HOD Cardiology (KMC / AIIMS)",
    authorAvatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=faces",
    isVerified: true,
    authorIsProfessor: true,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&h=1000&fit=crop",
    caption: "ECG Pearl: Identifying Wellens Syndrome Type A (biphasic T-waves in V2-V3) vs Type B (deeply inverted symmetrical T-waves). Imminent anterior wall infarction warning! ðŸ«€",
    clinicalCategory: "clinical updates",
    tags: ["#Cardiology", "#WellensSyndrome", "#ECGPearls", "#ProfSharma"],
    likesCount: 3820,
    commentsCount: 310,
    savesCount: 2450,
    sharesCount: 890,
    isLiked: false,
    isSaved: true,
    isFollowing: true,
    createdAt: "4 hours ago"
  },
  {
    id: "clip-5",
    authorId: "prof-2",
    authorName: "Prof. (Dr.) Meenakshi Sundaram",
    authorSpecialty: "Professor of Surgery (BMCRI)",
    authorAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=faces",
    isVerified: true,
    authorIsProfessor: true,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&h=1000&fit=crop",
    caption: "Laparoscopic Port Ergonomics: The Golden Triangle principle between camera port and working instruments to prevent surgeon wrist strain and tremor amplification during cholecystectomy. ðŸ©ºâš¡",
    clinicalCategory: "following",
    tags: ["#Surgery", "#Laparoscopy", "#SurgicalMentorship", "#ProfSundaram"],
    likesCount: 2190,
    commentsCount: 165,
    savesCount: 1420,
    sharesCount: 410,
    isLiked: true,
    isSaved: true,
    isFollowing: true,
    createdAt: "6 hours ago"
  },
  {
    id: "clip-6",
    authorId: "stu-2",
    authorName: "Ananya Desai",
    authorSpecialty: "Clinical Pharmacy Scholar",
    authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces",
    isVerified: true,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=1000&fit=crop",
    caption: "Antimicrobial stewardship alert: Renal dosage adjustment algorithms for Vancomycin and Piperacillin-Tazobactam. Watch for synergistic acute kidney injury! ðŸ’Š",
    clinicalCategory: "social update",
    tags: ["#Pharmacology", "#AntimicrobialStewardship", "#MedEd", "#Pharmacy"],
    likesCount: 960,
    commentsCount: 52,
    savesCount: 680,
    sharesCount: 140,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    createdAt: "1 day ago"
  },
  {
    id: "clip-7",
    authorId: "doc-1",
    authorName: "Dr. Arvind Ramesh",
    authorSpecialty: "Interventional Cardiology",
    authorAvatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop&crop=faces",
    isVerified: true,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=1000&fit=crop",
    caption: "Transradial cath lab case: Distal radial access (Snuffbox approach) benefits for patient post-op comfort and early discharge within 3 hours. ðŸ¥",
    clinicalCategory: "following",
    tags: ["#CathLab", "#InterventionalCardiology", "#RadialAccess"],
    likesCount: 1750,
    commentsCount: 98,
    savesCount: 1100,
    sharesCount: 280,
    isLiked: false,
    isSaved: true,
    isFollowing: true,
    createdAt: "1 day ago"
  },
  {
    id: "clip-8",
    authorId: "prof-1",
    authorName: "Prof. (Dr.) Rajeshwar Sharma",
    authorSpecialty: "HOD Cardiology (KMC / AIIMS)",
    authorAvatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=faces",
    isVerified: true,
    authorIsProfessor: true,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=1000&fit=crop",
    caption: "Bedside POCUS Echocardiography in Cardiogenic Shock: Rapidly evaluating LV contractility, IVC collapsibility, and ruling out cardiac tamponade in under 90 seconds. âš¡",
    clinicalCategory: "clinical updates",
    tags: ["#POCUS", "#EmergencyMedicine", "#Echocardiography", "#ProfSharma"],
    likesCount: 4510,
    commentsCount: 420,
    savesCount: 3120,
    sharesCount: 1240,
    isLiked: true,
    isSaved: true,
    isFollowing: true,
    createdAt: "2 days ago"
  }
];

export const INITIAL_JOBS: Job[] = [];

export const INITIAL_OPPORTUNITIES: OpportunityItem[] = [];

export const INITIAL_SESSIONS: DeviceSession[] = [
  {
    id: "sess-1",
    userId: "doc-1",
    deviceName: "Pixel 8 Pro (Android 15)",
    deviceOs: "Android",
    ipAddress: "152.58.12.91",
    lastActive: "Active Now",
    isCurrentDevice: true
  },
  {
    id: "sess-2",
    userId: "doc-1",
    deviceName: "Chrome on Windows 11 (Laptop)",
    deviceOs: "Windows",
    ipAddress: "103.21.144.2",
    lastActive: "Active Now",
    isCurrentDevice: true
  }
];

export const INITIAL_COMMUNITIES: any[] = [];

export const INITIAL_COURSES: any[] = [];

export const INITIAL_SCHOLARSHIPS: any[] = [];

export const INITIAL_RESEARCH_PROJECTS: any[] = [];

export const INITIAL_LOCUM_GIGS: any[] = [];

export const INITIAL_NOTIFICATIONS: any[] = [];

