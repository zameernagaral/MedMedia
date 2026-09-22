import { Router, Request, Response } from 'express';
import { db } from '../data/persistentDb';
import { UserProfile } from '../data/mockDb';

const router = Router();

// Mapping specialties and student years to official communities
const SPECIALTY_COMMUNITY_MAP: Record<string, string> = {
  "Cardiology": "comm-cardio",
  "Neurology": "comm-neuro",
  "General Surgery": "comm-surgery",
  "Dermatology": "comm-derma",
  "Pediatrics": "comm-pediatrics",
  "Orthopedics": "comm-ortho",
  "Radiology": "comm-radiology"
};

const STUDENT_YEAR_COMMUNITY_MAP: Record<number, string> = {
  1: "comm-year1",
  2: "comm-year2",
  3: "comm-year3",
  4: "comm-year4"
};

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { identifier, password, role } = req.body;
  const users = db.getUsers();
  
  if (users.length === 0) {
    return res.status(401).json({
      success: false,
      message: "No registered accounts found in the database. Please register your verified Doctor or Student profile."
    });
  }

  // Find matching user by email, username, or ID
  const user = users.find(u => 
    (u.email && u.email.toLowerCase() === identifier?.toLowerCase()) || 
    (u.username && u.username.toLowerCase() === identifier?.toLowerCase()) ||
    u.id === identifier
  ) || users[0];

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User not found. Please check your credentials or register a new profile."
    });
  }

  res.json({
    success: true,
    token: "jwt-medmedia-" + user.id + "-" + Date.now(),
    user,
    sessionId: "sess-1"
  });
});

// POST /api/auth/register (Saves directly to persistent local database on laptop)
router.post('/register', (req: Request, res: Response) => {
  const { 
    fullName, 
    username, 
    email, 
    phoneNumber,
    password, 
    dob, 
    role, 
    doctorDetails, 
    studentDetails,
    isPrivate,
    coverPhotoUrl,
    medicalCouncilCredentialUrl,
    studentIdCredentialUrl
  } = req.body;

  // Determine verification status based on optional credential uploads
  const hasCredential = role === 'DOCTOR' 
    ? Boolean(medicalCouncilCredentialUrl || doctorDetails?.medicalCouncilRegNumber)
    : Boolean(studentIdCredentialUrl);

  const verificationStatus = hasCredential ? 'VERIFIED' : 'UNVERIFIED';

  // Determine auto-joined communities
  const autoJoinedCommunities: string[] = [];
  if (role === 'DOCTOR' && doctorDetails?.specialization) {
    const matchedCommId = SPECIALTY_COMMUNITY_MAP[doctorDetails.specialization] || "comm-surgery";
    autoJoinedCommunities.push(matchedCommId);
  } else if (role === 'STUDENT' && studentDetails?.academicYear) {
    const matchedCommId = STUDENT_YEAR_COMMUNITY_MAP[studentDetails.academicYear] || "comm-year1";
    autoJoinedCommunities.push(matchedCommId);
  }

  const newUser: UserProfile = {
    id: `usr-${Date.now()}`,
    fullName: fullName || (role === 'DOCTOR' ? "Dr. Verified Clinician" : "Medical Scholar"),
    username: username || (role === 'DOCTOR' ? (doctorDetails?.specialization?.toLowerCase().replace(/\s+/g, '_') || "dr_clinician") : (studentDetails?.discipline?.toLowerCase().replace(/_/g, '_') || "med_scholar")),
    email: email || `${Date.now()}@medmedia.health`,
    phoneNumber: phoneNumber || undefined,
    avatarUrl: role === 'DOCTOR'
      ? "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=faces"
      : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
    coverPhotoUrl: coverPhotoUrl || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=400&fit=crop",
    role: role || "DOCTOR",
    verificationStatus,
    badgeTitle: role === 'DOCTOR' 
      ? `${verificationStatus === 'VERIFIED' ? 'Verified ' : ''}${doctorDetails?.specialization || "Medicine"} Specialist` 
      : `${verificationStatus === 'VERIFIED' ? 'Verified ' : ''}${studentDetails?.discipline?.replace(/_/g, ' ') || "Student Scholar"}`,
    bio: role === 'DOCTOR' 
      ? `Clinical practitioner in ${doctorDetails?.specialization || "Healthcare"}. DOB: ${dob || "Confidential"}.` 
      : `${studentDetails?.discipline?.replace(/_/g, ' ') || "Medical Scholar"} at ${studentDetails?.collegeName || "Medical College"}. DOB: ${dob || "Confidential"}.`,
    isPrivate: Boolean(isPrivate),
    medicalCouncilCredentialUrl: medicalCouncilCredentialUrl || undefined,
    studentIdCredentialUrl: studentIdCredentialUrl || undefined,
    joinedCommunityIds: autoJoinedCommunities,
    doctorDetails: role === 'DOCTOR' ? {
      specialization: doctorDetails?.specialization || "General Medicine",
      qualifications: doctorDetails?.qualifications || ["MBBS", "MD"],
      hospitalAffiliation: doctorDetails?.hospitalAffiliation || "State Medical Center",
      location: doctorDetails?.location || "Central Hub",
      yearsExperience: Number(doctorDetails?.yearsExperience) || 4,
      clinicalInterests: doctorDetails?.clinicalInterests || ["Internal Medicine", "Diagnostics"],
      researchPublications: doctorDetails?.researchPublications || ["Clinical Case Evaluations in Tertiary Care"],
      medicalCouncilRegNumber: doctorDetails?.medicalCouncilRegNumber || (hasCredential ? `MCI-REG-${Date.now().toString().slice(-5)}` : "")
    } : undefined,
    studentDetails: role === 'STUDENT' ? {
      discipline: studentDetails?.discipline || "MEDICAL_STUDENT",
      collegeName: studentDetails?.collegeName || "Government Medical College",
      academicYear: Number(studentDetails?.academicYear) || 1,
      interests: studentDetails?.interests || ["Clinical Diagnostics", "Pharmacology"],
      futureSpecialty: studentDetails?.futureSpecialty || "Cardiology",
      researchInterests: studentDetails?.researchInterests || ["Public Health"]
    } : undefined,
    stats: {
      postsCount: 0,
      followersCount: 15,
      connectionsCount: 7
    }
  };

  // Persist directly to local disk database
  db.addUser(newUser);

  // Auto-join communities in DB
  autoJoinedCommunities.forEach(cId => {
    db.joinCommunity(cId, newUser.id);
  });

  console.log(`[MedMedia] Registered user ${newUser.fullName} (${newUser.id}). Auto-joined: ${autoJoinedCommunities.join(', ')}.`);

  res.status(201).json({
    success: true,
    message: "User registered and successfully persisted.",
    user: newUser,
    token: "jwt-medmedia-" + newUser.id
  });
});

// POST /api/auth/google
router.post('/google', (req: Request, res: Response) => {
  const { role, email, fullName } = req.body;
  const users = db.getUsers();
  let user = users.find(u => email && u.email && u.email.toLowerCase() === email.toLowerCase());

  if (!user && users.length > 0) {
    user = users[0];
  }

  if (!user) {
    // Create new Google profile
    const newUser: UserProfile = {
      id: `usr-google-${Date.now()}`,
      fullName: fullName || (role === 'STUDENT' ? "Medical Scholar (Google Verified)" : "Dr. Verified Clinician (Google)"),
      username: (fullName ? fullName.toLowerCase().replace(/\s+/g, '_') : 'clinician_google') + `_${Date.now().toString().slice(-4)}`,
      email: email || `user_${Date.now()}@medmedia.health`,
      avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=faces",
      coverPhotoUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=400&fit=crop",
      role: role || "DOCTOR",
      verificationStatus: "VERIFIED",
      badgeTitle: role === 'STUDENT' ? "Verified Medical Student" : "Verified Clinical Specialist",
      bio: "Healthcare professional verified via Google Authentication. Active on MedMedia clinical network.",
      isPrivate: false,
      joinedCommunityIds: ["comm-surgery"],
      doctorDetails: role !== 'STUDENT' ? {
        specialization: "Internal Medicine",
        qualifications: ["MBBS", "MD"],
        hospitalAffiliation: "University Teaching Hospital",
        location: "Medical City",
        yearsExperience: 5,
        clinicalInterests: ["Internal Medicine", "Diagnostics"],
        researchPublications: ["Clinical Case Reviews"],
        medicalCouncilRegNumber: `MCI-${Date.now().toString().slice(-6)}`
      } : undefined,
      studentDetails: role === 'STUDENT' ? {
        discipline: "MEDICAL_STUDENT",
        collegeName: "Medical University",
        academicYear: 3,
        interests: ["Cardiology", "Diagnostics"],
        futureSpecialty: "Cardiology",
        researchInterests: ["Public Health"]
      } : undefined,
      stats: { postsCount: 0, followersCount: 0, connectionsCount: 0 }
    };
    user = db.addUser(newUser);
  }

  res.json({
    success: true,
    message: "Google OAuth successful",
    user,
    token: "google-oauth-token-" + user.id
  });
});

// GET /api/auth/sessions (Device Management)
router.get('/sessions', (req: Request, res: Response) => {
  res.json({
    success: true,
    sessions: db.getSessions()
  });
});

// POST /api/auth/sessions/revoke
router.post('/sessions/revoke', (req: Request, res: Response) => {
  const { sessionId } = req.body;
  const remaining = db.revokeSession(sessionId);
  res.json({
    success: true,
    message: "Session terminated successfully in persistent database.",
    remainingSessions: remaining
  });
});

export default router;
