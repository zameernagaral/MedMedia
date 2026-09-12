import { Router, Request, Response } from 'express';
import { db } from '../data/persistentDb';
import { UserProfile } from '../data/mockDb';

const router = Router();

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { identifier, password, role } = req.body;
  const users = db.getUsers();
  
  // Find matching user by email, username or ID
  const user = users.find(u => 
    u.email.toLowerCase() === identifier?.toLowerCase() || 
    u.username.toLowerCase() === identifier?.toLowerCase() ||
    u.id === identifier
  ) || users[role === 'STUDENT' ? 2 : 0];

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
    studentDetails 
  } = req.body;

  const newUser: UserProfile = {
    id: `usr-${Date.now()}`,
    fullName: fullName || (role === 'DOCTOR' ? "Dr. Verified Clinician" : "Medical Scholar"),
    username: username || (role === 'DOCTOR' ? (doctorDetails?.specialization?.toLowerCase().replace(/\s+/g, '_') || "dr_clinician") : (studentDetails?.discipline?.toLowerCase().replace(/_/g, '_') || "med_scholar")),
    email: email || `${Date.now()}@medmedia.health`,
    phoneNumber: phoneNumber || undefined,
    avatarUrl: role === 'DOCTOR'
      ? "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=faces"
      : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
    role: role || "DOCTOR",
    verificationStatus: "VERIFIED",
    badgeTitle: role === 'DOCTOR' 
      ? `Verified ${doctorDetails?.specialization || "Medicine"} Specialist` 
      : `Verified ${studentDetails?.discipline?.replace(/_/g, ' ') || "Student Scholar"}`,
    bio: role === 'DOCTOR' 
      ? `Clinical practitioner in ${doctorDetails?.specialization || "Healthcare"}. DOB: ${dob || "Confidential"}. Verified on MedMedia.` 
      : `${studentDetails?.discipline?.replace(/_/g, ' ') || "Medical Scholar"} at ${studentDetails?.collegeName || "Medical College"}. DOB: ${dob || "Confidential"}.`,
    doctorDetails: role === 'DOCTOR' ? {
      specialization: doctorDetails?.specialization || "General Medicine",
      qualifications: doctorDetails?.qualifications || ["MBBS", "MD"],
      hospitalAffiliation: doctorDetails?.hospitalAffiliation || "State Medical Center",
      location: doctorDetails?.location || "Central Hub",
      yearsExperience: Number(doctorDetails?.yearsExperience) || 4,
      clinicalInterests: doctorDetails?.clinicalInterests || ["Internal Medicine", "Diagnostics"],
      researchPublications: doctorDetails?.researchPublications || ["Clinical Case Evaluations in Tertiary Care"],
      medicalCouncilRegNumber: doctorDetails?.medicalCouncilRegNumber || `MCI-REG-${Date.now().toString().slice(-5)}`
    } : undefined,
    studentDetails: role === 'STUDENT' ? {
      discipline: studentDetails?.discipline || "MEDICAL_STUDENT",
      collegeName: studentDetails?.collegeName || "Government Medical College",
      academicYear: Number(studentDetails?.academicYear) || 4,
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

  console.log(`[MedMedia] Registered & persisted new user ${newUser.fullName} (${newUser.id}) to laptop database.`);

  res.status(201).json({
    success: true,
    message: "User registered and successfully persisted to local database on laptop.",
    user: newUser,
    token: "jwt-medmedia-" + newUser.id
  });
});

// POST /api/auth/google
router.post('/google', (req: Request, res: Response) => {
  const { role } = req.body;
  const users = db.getUsers();
  const user = users[role === 'STUDENT' ? 2 : 0];
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
