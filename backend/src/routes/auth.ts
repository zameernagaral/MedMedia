import { Router, Request, Response } from 'express';
import { USERS, UserProfile } from '../data/mockDb';

const router = Router();

// In-memory active sessions list
let ACTIVE_SESSIONS = [
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

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { identifier, password, role } = req.body;
  
  // Find matching user or fallback to demo
  const user = USERS.find(u => 
    u.email.toLowerCase() === identifier?.toLowerCase() || 
    u.username.toLowerCase() === identifier?.toLowerCase()
  ) || USERS[role === 'STUDENT' ? 2 : 0];

  res.json({
    success: true,
    token: "mock-jwt-medmedia-" + user.id + "-" + Date.now(),
    user,
    sessionId: "sess-1"
  });
});

// POST /api/auth/register (Slide 3 & 4 Verification & Selection)
router.post('/register', (req: Request, res: Response) => {
  const { fullName, username, email, role, doctorDetails, studentDetails } = req.body;

  const newUser: UserProfile = {
    id: `usr-${Date.now()}`,
    fullName: fullName || "New Healthcare Practitioner",
    username: username || (role === 'DOCTOR' ? "specialization" : "medical student"),
    email: email || "newuser@medmedia.health",
    avatarUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=faces",
    role: role || "DOCTOR",
    verificationStatus: "PENDING",
    badgeTitle: role === 'DOCTOR' ? "Doctor (Verification Pending)" : "Student (Verification Pending)",
    bio: role === 'DOCTOR' ? "Doctor in verification process" : "Healthcare student in verification",
    doctorDetails: role === 'DOCTOR' ? {
      specialization: doctorDetails?.specialization || "General Medicine",
      qualifications: doctorDetails?.qualifications || ["MBBS"],
      hospitalAffiliation: doctorDetails?.hospitalAffiliation || "City Hospital",
      location: doctorDetails?.location || "National",
      yearsExperience: Number(doctorDetails?.yearsExperience) || 1,
      clinicalInterests: doctorDetails?.clinicalInterests || ["Internal Medicine"],
      researchPublications: [],
      medicalCouncilRegNumber: doctorDetails?.medicalCouncilRegNumber || "MED-PENDING-001"
    } : undefined,
    studentDetails: role === 'STUDENT' ? {
      discipline: studentDetails?.discipline || "MEDICAL_STUDENT",
      collegeName: studentDetails?.collegeName || "Medical College",
      academicYear: Number(studentDetails?.academicYear) || 1,
      interests: studentDetails?.interests || ["Clinical Diagnostics"],
      futureSpecialty: studentDetails?.futureSpecialty || "Cardiology",
      researchInterests: studentDetails?.researchInterests || ["Public Health"]
    } : undefined,
    stats: {
      postsCount: 0,
      followersCount: 0,
      connectionsCount: 0
    }
  };

  USERS.push(newUser);

  res.status(201).json({
    success: true,
    message: "Registration successful. Medical verification document received.",
    user: newUser,
    token: "mock-jwt-medmedia-" + newUser.id
  });
});

// POST /api/auth/google
router.post('/google', (req: Request, res: Response) => {
  const { role } = req.body;
  const user = USERS[role === 'STUDENT' ? 2 : 0];
  res.json({
    success: true,
    message: "Google OAuth successful",
    user,
    token: "google-oauth-token-" + user.id
  });
});

// GET /api/auth/sessions (Slide 2 & 4: Device Management)
router.get('/sessions', (req: Request, res: Response) => {
  res.json({
    success: true,
    sessions: ACTIVE_SESSIONS
  });
});

// POST /api/auth/sessions/revoke
router.post('/sessions/revoke', (req: Request, res: Response) => {
  const { sessionId } = req.body;
  ACTIVE_SESSIONS = ACTIVE_SESSIONS.filter(s => s.id !== sessionId);
  res.json({
    success: true,
    message: "Session terminated successfully.",
    remainingSessions: ACTIVE_SESSIONS
  });
});

export default router;
