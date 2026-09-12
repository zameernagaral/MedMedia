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
      postsCount: 42,
      followersCount: 8920,
      connectionsCount: 1420
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
      postsCount: 31,
      followersCount: 6410,
      connectionsCount: 980
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
      postsCount: 56,
      followersCount: 14200,
      connectionsCount: 3100
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
      postsCount: 38,
      followersCount: 9800,
      connectionsCount: 2200
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
      postsCount: 18,
      followersCount: 1840,
      connectionsCount: 620
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
      postsCount: 12,
      followersCount: 920,
      connectionsCount: 340
    }
  }
];

export const INITIAL_STORIES: Story[] = [
  {
    id: "st-prof-1",
    userId: "prof-1",
    userName: "Prof. Rajeshwar Sharma",
    userAvatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=120&h=120&fit=crop&crop=faces",
    mediaUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&h=800&fit=crop",
    caption: "Cardiology Grand Rounds: Reviewing rare Brugada syndrome ECGs with our enthusiastic student cohort! 🫀",
    timestamp: "35m ago",
    isViewed: false
  },
  {
    id: "st-prof-2",
    userId: "prof-2",
    userName: "Prof. Meenakshi Sundaram",
    userAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&h=120&fit=crop&crop=faces",
    mediaUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=500&h=800&fit=crop",
    caption: "Laparoscopic simulation lab open today 4-6 PM for final year MBBS student suturing practice. 🩺",
    timestamp: "1h ago",
    isViewed: false
  },
  {
    id: "st-1",
    userId: "doc-1",
    userName: "Dr. Arvind Ramesh",
    userAvatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&h=120&fit=crop&crop=faces",
    mediaUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&h=800&fit=crop",
    caption: "Cath lab live: Successful complex bifurcation stenting with intravascular imaging.",
    timestamp: "2h ago",
    isViewed: false
  },
  {
    id: "st-2",
    userId: "doc-2",
    userName: "Dr. Priya Nair",
    userAvatar: "https://images.unsplash.com/photo-1594824813581-2292f725350c?w=120&h=120&fit=crop&crop=faces",
    mediaUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&h=800&fit=crop",
    caption: "Pediatric grand rounds starting in 15 mins. Topic: Craniopharyngioma management.",
    timestamp: "3h ago",
    isViewed: false
  },
  {
    id: "st-3",
    userId: "stu-1",
    userName: "Rohan Verma",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces",
    mediaUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&h=800&fit=crop",
    caption: "Bedside cardiology clinical case discussion with batchmates! 🫀",
    timestamp: "5h ago",
    isViewed: true
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: "post-prof-1",
    authorId: "prof-1",
    authorName: "Prof. (Dr.) Rajeshwar Sharma, MD, DM, FICP",
    authorUsername: "prof_rajeshwar_cardio",
    authorAvatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&fit=crop&crop=faces",
    authorRole: "DOCTOR",
    authorSpecializationOrDiscipline: "Prof & HOD Cardiology (KMC / AIIMS)",
    authorIsProfessor: true,
    authorAcademicTitle: "Professor & Head of Department of Cardiology",
    isVerified: true,
    postType: "CLINICAL_DISCUSSION",
    targetAudience: "STUDENT_HIGH_YIELD",
    content: "📢 OPEN CALL FOR 2 MEDICAL STUDENT RESEARCH INTERNS (ICMR-STS 2026 Cohort):\n\nOur university department is recruiting 2 medical scholars for our prospective multicenter registry on 'Early Cardiovascular Phenotypes & Coronary Calcium Scoring in Young Adults'.\n\n🎯 What We Offer:\n• Direct 1-on-1 mentorship & research methodology training\n• Hands-on carotid ultrasound and hemodynamic profiling exposure\n• Guaranteed PubMed-indexed co-authorship (NEJM / JACC sub-journals)\n• Formal Recommendation Letter for USMLE / NEET-PG Residency\n\nEligibility: 3rd or 4th Year MBBS, or B.Pharm students with strong clinical curiosity. Click 'Request Mentorship' on my profile or send a message in chat with your student credentials!",
    mediaUrls: [
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=900&h=500&fit=crop"
    ],
    clinicalTags: ["#Cardiology", "#StudentMentorship", "#ICMRResearch", "#ClinicalInternship"],
    likesCount: 890,
    commentsCount: 142,
    savesCount: 620,
    sharesCount: 185,
    isLiked: false,
    isSaved: true,
    isFollowing: true,
    createdAt: "35 mins ago"
  },
  {
    id: "post-prof-2",
    authorId: "prof-2",
    authorName: "Prof. (Dr.) Meenakshi Sundaram, MS, FRCS",
    authorUsername: "prof_sundaram_surg",
    authorAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=faces",
    authorRole: "DOCTOR",
    authorSpecializationOrDiscipline: "Professor of Surgery (BMCRI)",
    authorIsProfessor: true,
    authorAcademicTitle: "Professor of General & Minimal Access Surgery",
    isVerified: true,
    postType: "IMAGE_CASE",
    targetAudience: "STUDENT_HIGH_YIELD",
    content: "Bedside Surgical Clinic for Final Year MBBS Scholars: The 3 Cardinal Rules of Assessing an Acute Abdomen in Emergency Casualty:\n\n1. Never administer high-dose opioids before identifying localized rebound tenderness and involuntary guarding (the classic 'board-like' rigidity of hollow viscus perforation).\n2. A normal abdominal ultrasound does NOT rule out early retrocecal acute appendicitis when the Alvarado score is > 7.\n3. Always palpate hernial orifices and examine the scrotum/femoral canal in every patient presenting with vomiting and distension.\n\nSave this checklist for your university practical exams and upcoming casualty postings! 🩺",
    mediaUrls: [
      "https://images.unsplash.com/photo-1551076805-e1869033e561?w=900&h=500&fit=crop"
    ],
    clinicalTags: ["#GeneralSurgery", "#ClinicalPearls", "#MBBSPrep", "#AcuteAbdomen"],
    likesCount: 640,
    commentsCount: 78,
    savesCount: 430,
    sharesCount: 120,
    isLiked: true,
    isSaved: true,
    isFollowing: false,
    createdAt: "1 hour ago"
  },
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
    content: "🚨 58-year-old male presents to the ER with sudden retrosternal squeezing chest pain radiating to the left jaw (onset 45 mins ago). BP 90/60 mmHg, HR 52 bpm.\n\nNotice the dramatic ST-segment elevation in leads II, III, and aVF with reciprocal ST depression in I and aVL, accompanied by complete AV dissociation.\n\nWhich coronary artery branch is the culprit, and what is your immediate management protocol prior to cath lab activation?",
    mediaUrls: [
      "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=900&h=500&fit=crop"
    ],
    clinicalTags: ["#Cardiology", "#ECGChallenge", "#STEMI", "#EmergencyMedicine"],
    casePoll: {
      question: "Primary Culprit Vessel Identification:",
      options: [
        { id: "opt-1", text: "Proximal Right Coronary Artery (RCA)", votes: 248 },
        { id: "opt-2", text: "Left Anterior Descending (LAD) Diagonal", votes: 22 },
        { id: "opt-3", text: "Left Circumflex (LCx) dominant branch", votes: 41 },
        { id: "opt-4", text: "Left Main Equivocal", votes: 9 }
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
    authorId: "stu-1",
    authorName: "Rohan Verma",
    authorUsername: "medical student",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
    authorRole: "STUDENT",
    authorSpecializationOrDiscipline: "Final Year MBBS (KIMS)",
    isVerified: true,
    postType: "ARTICLE_LINK",
    content: "Fascinating clinical paper published in the New England Journal of Medicine on early microvascular perfusion monitoring in septic shock.\n\nFor students preparing for university exams: take note of how sublingual capillary flow index correlates far better with patient 28-day mortality than central venous oxygen saturation (ScvO2). Highly recommend reading the trial design!",
    linkUrl: "https://nejm.org/doi/full/10.1056/NEJMoa240182",
    linkMeta: {
      title: "Sublingual Microcirculation Versus Global Hemodynamic Targets in Septic Shock",
      source: "The New England Journal of Medicine (NEJM)",
      description: "A randomized multi-center investigation into targeted microvascular resuscitation in ICU patients."
    },
    clinicalTags: ["#IntensiveCare", "#SepticShock", "#MedicalStudents", "#NEJMReview"],
    likesCount: 189,
    commentsCount: 24,
    savesCount: 82,
    sharesCount: 19,
    isLiked: true,
    isSaved: false,
    isFollowing: false,
    createdAt: "4 hours ago"
  },
  {
    id: "post-3",
    authorId: "doc-2",
    authorName: "Dr. Priya Nair, MS, MCh",
    authorUsername: "neuro_priya",
    authorAvatar: "https://images.unsplash.com/photo-1594824813581-2292f725350c?w=150&h=150&fit=crop&crop=faces",
    authorRole: "DOCTOR",
    authorSpecializationOrDiscipline: "Pediatric Neurosurgery",
    isVerified: true,
    postType: "IMAGE_CASE",
    content: "Surgical pearls from this morning's endoscopic third ventriculostomy (ETV):\n\n1. Always identify the mammillary bodies and infundibular recess before fenestrating the floor.\n2. Use blunt balloon dilation rather than sharp dissection to protect the basilar apex below.\n3. Verify brisk cerebrospinal fluid pulsation before closure.\n\nOpen to questions from residents and surgical interns!",
    mediaUrls: [
      "https://images.unsplash.com/photo-1551076805-e1869033e561?w=900&h=500&fit=crop"
    ],
    clinicalTags: ["#Neurosurgery", "#SurgicalPearls", "#Endoscopy", "#Residents"],
    likesCount: 512,
    commentsCount: 49,
    savesCount: 201,
    sharesCount: 88,
    isLiked: false,
    isSaved: true,
    isFollowing: true,
    createdAt: "7 hours ago"
  },
  {
    id: "post-4",
    authorId: "stu-2",
    authorName: "Ananya Desai",
    authorUsername: "B parm",
    authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces",
    authorRole: "STUDENT",
    authorSpecializationOrDiscipline: "3rd Year B.Pharm",
    isVerified: true,
    postType: "TWEET",
    content: "Reminder for hospital pharmacy & clinical rounds: When switching a heart failure patient from an ACE inhibitor (e.g., Ramipril) to an ARNI (Sacubitril/Valsartan), ALWAYS enforce a strict 36-hour washout period to prevent bradykinin-mediated life-threatening angioedema! 💊⚠️",
    clinicalTags: ["#Pharmacology", "#PatientSafety", "#DrugInteractions", "#PharmacyStudent"],
    likesCount: 275,
    commentsCount: 16,
    savesCount: 164,
    sharesCount: 52,
    isLiked: true,
    isSaved: true,
    isFollowing: false,
    createdAt: "11 hours ago"
  }
];

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
    caption: "Auscultation masterclass: How to instantly distinguish Aortic Stenosis (ejection systolic murmur radiating to carotids) from Mitral Regurgitation (holosystolic radiating to axilla) using handgrip maneuvers. 🎧🩺",
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
    caption: "Surgical Knot Tying: The 1-Handed Square Knot technique essential for OR residents. Watch finger placement carefully to prevent slipping. ✂️",
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
    caption: "ECG Pearl: Identifying Wellens Syndrome Type A (biphasic T-waves in V2-V3) vs Type B (deeply inverted symmetrical T-waves). Imminent anterior wall infarction warning! 🫀",
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
    caption: "Laparoscopic Port Ergonomics: The Golden Triangle principle between camera port and working instruments to prevent surgeon wrist strain and tremor amplification during cholecystectomy. 🩺⚡",
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
    caption: "Antimicrobial stewardship alert: Renal dosage adjustment algorithms for Vancomycin and Piperacillin-Tazobactam. Watch for synergistic acute kidney injury! 💊",
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
    caption: "Transradial cath lab case: Distal radial access (Snuffbox approach) benefits for patient post-op comfort and early discharge within 3 hours. 🏥",
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
    caption: "Bedside POCUS Echocardiography in Cardiogenic Shock: Rapidly evaluating LV contractility, IVC collapsibility, and ruling out cardiac tamponade in under 90 seconds. ⚡",
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

export const INITIAL_JOBS: Job[] = [
  {
    id: "job-1",
    title: "Consultant Interventional Cardiologist",
    category: "Doctor jobs",
    type: "Full time",
    companyName: "Fortis Memorial Research Institute",
    place: "Gurugram, NCR",
    experience: "5+ Years Post DM/DNB",
    salary: "₹38,00,000 - ₹55,00,000 / annum",
    description: "Seeking a dedicated Interventional Cardiologist to lead our second state-of-the-art Cath Lab unit. Responsibilities include primary PCIs, radial interventions, device implantation, and participation in academic seminars.",
    preferenceEducation: "DM / DNB in Cardiology with recognized medical council registration. FACC or FSCAI fellowship preferred.",
    skills: ["Complex PCI", "Cath Lab Leadership", "Rotablation", "IVUS & OCT", "TAVR Assistance"],
    hospitalLogoUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&h=120&fit=crop",
    postedAt: "1 day ago"
  },
  {
    id: "job-2",
    title: "Assistant Professor - Department of Pathology",
    category: "academic jobs",
    type: "Full time",
    companyName: "St. John's National Academy of Health Sciences",
    place: "Bangalore, Karnataka",
    experience: "2-4 Years Post MD",
    salary: "₹18,00,000 - ₹24,00,000 / annum",
    description: "Inviting applications for full-time faculty in Histopathology and Cytogenetics. Role entails teaching MBBS & MD candidates, clinical reporting, and research grant execution.",
    preferenceEducation: "MD Pathology with minimum 3 publications in PubMed-indexed peer-reviewed journals.",
    skills: ["Histopathology Reporting", "Undergraduate Lectures", "Immunohistochemistry", "Curriculum Mentorship"],
    hospitalLogoUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=120&h=120&fit=crop",
    postedAt: "3 days ago"
  },
  {
    id: "job-3",
    title: "Clinical Research & Oncology Internship 2026",
    category: "Internship",
    type: "Part time",
    companyName: "Tata Memorial Centre / ACTREC",
    place: "Mumbai, Maharashtra (Hybrid)",
    experience: "MBBS Intern / Final Year Student",
    salary: "₹35,000 / month stipend",
    description: "6-month rotational research internship focusing on immunotherapy clinical trials, data abstraction, biobanking protocols, and GCP guidelines.",
    preferenceEducation: "Final year MBBS students, recent graduates, or B.Pharm students with strong interest in clinical oncology.",
    skills: ["GCP Guidelines", "Clinical Trial Protocol", "SPSS / R Analysis", "Patient Registry Management"],
    hospitalLogoUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=120&h=120&fit=crop",
    postedAt: "Just now"
  },
  {
    id: "job-4",
    title: "Fellowship in Pediatric Critical Care Medicine (PICU)",
    category: "fellowship",
    type: "Full time",
    companyName: "Rainbow Children's Hospitals",
    place: "Hyderabad, Telangana",
    experience: "MD / DNB Pediatrics Completed",
    salary: "₹1,20,000 / month stipend + Accommodation",
    description: "Accredited 1-year clinical fellowship covering ECMO management, high-frequency oscillatory ventilation, advanced pediatric resuscitation, and bedside echocardiography.",
    preferenceEducation: "MD / DNB in Pediatrics or Child Health.",
    skills: ["Pediatric ECMO", "Advanced Airway", "Point-of-Care Ultrasound (POCUS)", "Invasive Hemodynamic Monitoring"],
    hospitalLogoUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=120&h=120&fit=crop",
    postedAt: "4 days ago"
  },
  {
    id: "job-5",
    title: "Undergraduate Clinical Observership & Cath Lab Internship",
    category: "Internship",
    type: "Part time",
    companyName: "KMC Hospital & University Heart Center",
    place: "Manipal / Bangalore",
    experience: "3rd / 4th Year MBBS Student",
    salary: "₹25,000 / month stipend",
    stipend: "₹25,000 / month stipend",
    duration: "3 Months Rotational",
    isClinicalInternship: true,
    description: "Supervised clinical rotation under Prof. (Dr.) Rajeshwar Sharma. Daily morning ICU rounds, ECG triage seminars, cath lab observation, and weekly clinical case conference presentation.",
    preferenceEducation: "Currently enrolled in recognized MBBS program with good academic standing. College NOC supported.",
    skills: ["12-Lead ECG Interpretation", "Bedside Clinical Semiotics", "Patient Case History", "POCUS Basics"],
    hospitalLogoUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&h=120&fit=crop",
    postedAt: "Just now"
  },
  {
    id: "job-6",
    title: "Surgical Sub-Internship & Laparoscopy Observership",
    category: "Internship",
    type: "Part time",
    companyName: "Victoria Hospital / Bangalore Medical College (BMCRI)",
    place: "Bangalore, Karnataka",
    experience: "MBBS Intern / Final Year Scholar",
    salary: "₹28,000 / month stipend",
    stipend: "₹28,000 / month stipend",
    duration: "4 Months",
    isClinicalInternship: true,
    description: "Hands-on emergency trauma triage, knot-tying and suturing wet-lab, OR assisting on laparoscopic surgeries, and direct surgical mentorship under Prof. Meenakshi Sundaram.",
    preferenceEducation: "Final year MBBS scholars or rotating medical interns.",
    skills: ["Surgical Suture Techniques", "Trauma ATLS Protocol", "Laparoscopic Port Handling", "Pre-op Evaluation"],
    hospitalLogoUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=120&h=120&fit=crop",
    postedAt: "1 day ago"
  }
];

export const INITIAL_OPPORTUNITIES: OpportunityItem[] = [
  {
    id: "opp-1",
    type: "RESEARCH",
    title: "Multi-Center Study: AI-Powered ECG Detection of Early Cardiomyopathy",
    subtitle: "Principal Investigator: Dr. Arvind Ramesh | Open Collaboration Call",
    description: "Seeking 3 medical student / resident co-investigators across tertiary teaching hospitals for patient cohort anonymization and digital ECG record validation. Co-authorship guaranteed on IEEE/Lancet digital health submission.",
    tags: ["#ResearchCall", "#Cardiology", "#MachineLearning", "#CoAuthorWanted"],
    organizerOrAffiliation: "Apollo Research Innovations & Health AI Lab",
    actionLabel: "Join Research Project"
  },
  {
    id: "opp-2",
    type: "FREELANCE",
    title: "Emergency Department Weekend Locum Coverage",
    subtitle: "Columbia Asia / Manipal Hospital - Whitefield",
    description: "Urgent locum shifts available for licensed MBBS / MD physicians for 12-hour trauma & casualty weekend coverage. Competitive hourly compensation with on-call quarters provided.",
    tags: ["#LocumTenens", "#EmergencyDuty", "#DoctorFreelancing", "#WeekendShift"],
    organizerOrAffiliation: "Manipal Hospital Casualty Division",
    locationOrVenue: "Whitefield, Bangalore",
    dateTime: "Upcoming Saturday & Sunday Shifts",
    actionLabel: "Apply for Locum"
  },
  {
    id: "opp-3",
    type: "EVENT",
    title: "77th Annual All India Medical Congress & Surgical Expo 2026",
    subtitle: "Accredited with 6 CME Credit Hours by Medical Council",
    description: "3-day premier medical event bringing together over 4,000 surgeons, clinicians, and medical scholars. Features live robotic surgery broadcasts, simulated trauma bootcamps, and abstract competitions.",
    tags: ["#MedicalCongress", "#CMEEvent", "#RoboticSurgery", "#Exhibition"],
    organizerOrAffiliation: "Indian Medical Association & Surgical Society",
    locationOrVenue: "Bangalore International Exhibition Centre (BIEC)",
    dateTime: "Nov 14 - Nov 16, 2026 • 09:00 AM IST",
    contactEmail: "cme-secretariat@ima-events.org",
    actionLabel: "RSVP & Register"
  },
  {
    id: "opp-4",
    type: "COURSE",
    title: "Mastering Bedside Point-of-Care Ultrasound (POCUS) in Critical Care",
    subtitle: "Certified Comprehensive Online & Simulation Hybrid Module",
    description: "Endorsed by the Society of Critical Care Medicine. 12 comprehensive modules on eFAST, lung ultrasound (B-lines vs A-lines), and focused cardiac evaluation.",
    tags: ["#POCUS", "#UltrasoundMastery", "#CriticalCare", "#OnlineCME"],
    organizerOrAffiliation: "MedMedia Academy & International Ultrasound Society",
    cmeCredits: 4.5,
    actionLabel: "Enroll in Course"
  }
];

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
    deviceName: "Chrome on macOS Sonoma",
    deviceOs: "macOS",
    ipAddress: "103.21.144.2",
    lastActive: "2 hours ago",
    isCurrentDevice: false
  }
];
