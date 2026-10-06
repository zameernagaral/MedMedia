import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import prisma from '../data/prismaClient';

import { env } from '../config/env';
import rateLimit from 'express-rate-limit';
import { verificationBadgeTitle } from '../utils/verification';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many auth requests from this IP, please try again later.'
});


const router = Router();
const JWT_SECRET = env.JWT_SECRET;
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(randomBytes(32).toString('hex'), 10);
const registrationSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  username: z.string().trim().min(3).max(60).regex(/^[a-zA-Z0-9_.-]+$/),
  email: z.string().trim().email().max(254),
  phoneNumber: z.string().trim().max(32).optional(),
  password: z.string().min(8).max(128),
  role: z.enum(['DOCTOR', 'STUDENT', 'INSTITUTION']).default('DOCTOR'),
  bio: z.string().trim().max(500).optional(),
  isPrivate: z.boolean().default(false),
  doctorDetails: z.object({
    specialization: z.string().trim().max(120).optional(),
    hospitalAffiliation: z.string().trim().max(160).optional(),
    location: z.string().trim().max(160).optional(),
    yearsExperience: z.coerce.number().int().min(0).max(80).optional(),
    medicalCouncilRegNumber: z.string().trim().max(100).optional(),
    qualifications: z.array(z.string().max(120)).max(30).optional(),
    clinicalInterests: z.array(z.string().max(120)).max(50).optional(),
    researchPublications: z.array(z.string().max(500)).max(100).optional()
  }).passthrough().optional(),
  studentDetails: z.object({
    discipline: z.enum(['MEDICAL_STUDENT', 'NURSING', 'B_PHARM', 'D_PHARM', 'LAB_PRACTITIONER']).optional(),
    collegeName: z.string().trim().max(160).optional(),
    academicYear: z.coerce.number().int().min(1).max(20).optional(),
    interests: z.array(z.string().max(120)).max(50).optional(),
    researchInterests: z.array(z.string().max(500)).max(100).optional()
  }).passthrough().optional()
}).passthrough();

// POST /api/auth/login
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const identifier = String(req.body.identifier || req.body.email || req.body.phoneNumber || '').trim();
    const password = String(req.body.password || '');

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: "Identifier and password required" });
    }

    let user: any;
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier.toLowerCase() },
            { username: identifier },
            { phoneNumber: identifier }
          ]
        },
        include: {
          doctorProfile: true,
          studentProfile: true
        }
      });

      if (!user?.passwordHash) await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
    } catch {
      return res.status(503).json({ success: false, message: 'Authentication service is temporarily unavailable' });
    }

    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const token = jwt.sign({ userId: user.id, role: user.role, tv: user.authVersion }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isPrivate: user.isPrivate,
        verificationStatus: user.verificationStatus,
        badgeTitle: verificationBadgeTitle(user.role, user.verificationStatus),
        doctorDetails: user.doctorProfile ? {
          specialization: user.doctorProfile.specialization,
          hospitalAffiliation: user.doctorProfile.hospitalAffiliation,
          yearsExperience: user.doctorProfile.yearsExperience
        } : undefined,
        studentDetails: user.studentProfile ? {
          discipline: user.studentProfile.discipline,
          collegeName: user.studentProfile.collegeName,
          academicYear: user.studentProfile.academicYear
        } : undefined,
        stats: {
          postsCount: await prisma.post.count({ where: { userId: user.id } }),
          followersCount: await prisma.follow.count({ where: { followingId: user.id } }),
          followingCount: await prisma.follow.count({ where: { followerId: user.id } })
        }
      }
    });
  } catch (error) {
    console.error('[Auth API] Login failed');
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// POST /api/auth/register
router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const registration = registrationSchema.parse(req.body);
    const { fullName, username, email, phoneNumber, password, role: assignedRole, doctorDetails, studentDetails } = registration;
    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username.toLowerCase();
    const normalizedPhone = phoneNumber || undefined;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { username: normalizedUsername },
          ...(normalizedPhone ? [{ phoneNumber: normalizedPhone }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email, username, or phone number already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({
      data: {
        fullName,
        username: normalizedUsername,
        email: normalizedEmail,
        passwordHash,
        phoneNumber: normalizedPhone,
        role: assignedRole,
        avatarUrl: null,
        bio: registration.bio || null,
        isPrivate: registration.isPrivate,
        verificationStatus: 'PENDING',
        doctorProfile: assignedRole === 'DOCTOR' ? {
          create: {
            specialization: doctorDetails?.specialization || "General Medicine",
            hospitalAffiliation: doctorDetails?.hospitalAffiliation || "Hospital",
            location: doctorDetails?.location || "Unknown",
            yearsExperience: Number(doctorDetails?.yearsExperience) || 0,
            medicalCouncilRegNumber: doctorDetails?.medicalCouncilRegNumber || "PENDING",
            qualifications: JSON.stringify(doctorDetails?.qualifications || []),
            clinicalInterests: JSON.stringify(doctorDetails?.clinicalInterests || []),
            researchPublications: JSON.stringify(doctorDetails?.researchPublications || [])
          }
        } : undefined,
        studentProfile: assignedRole === 'STUDENT' ? {
          create: {
            discipline: studentDetails?.discipline || "MEDICAL_STUDENT",
            collegeName: studentDetails?.collegeName || "Medical College",
            academicYear: Number(studentDetails?.academicYear) || 1,
            interests: JSON.stringify(studentDetails?.interests || []),
            researchInterests: JSON.stringify(studentDetails?.researchInterests || [])
          }
        } : undefined
      },
      include: {
        doctorProfile: true,
        studentProfile: true
      }
    });

    const token = jwt.sign({ userId: newUser.id, role: newUser.role, tv: newUser.authVersion }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl,
        role: newUser.role,
        verificationStatus: newUser.verificationStatus,
        stats: { postsCount: 0, followersCount: 0, followingCount: 0 }
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, errors: error.issues });
    if ((error as { code?: string }).code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Email, username, or phone number already exists' });
    }
    console.error('[Auth API] Registration failed');
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

// POST /api/auth/google
router.post('/google', async (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: 'Google Auth not yet implemented on this deployment' });
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response) => {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith('Bearer ')) token = req.headers.authorization.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
      if (typeof decoded !== 'string' && typeof decoded.userId === 'string') {
        await prisma.user.update({ where: { id: decoded.userId }, data: { authVersion: { increment: 1 } } });
      }
    } catch (error) {
      if (!(error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError)) {
        return res.status(503).json({ success: false, message: 'Could not invalidate the current session' });
      }
    }
  }
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/me — validate token and return current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ success: false, message: 'No token' });

    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    if (typeof decoded === 'string' || typeof decoded.userId !== 'string') {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { doctorProfile: true, studentProfile: true }
    });

    if (!user) return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    const tokenVersion = typeof decoded.tv === 'number' ? decoded.tv : 0;
    if (tokenVersion !== user.authVersion) return res.status(401).json({ success: false, message: 'Invalid or expired token' });

    res.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isPrivate: user.isPrivate,
        verificationStatus: user.verificationStatus,
        bio: user.bio,
        coverPhotoUrl: user.coverPhotoUrl,
        badgeTitle: verificationBadgeTitle(user.role, user.verificationStatus),
        doctorDetails: user.doctorProfile ? {
          specialization: user.doctorProfile.specialization,
          hospitalAffiliation: user.doctorProfile.hospitalAffiliation,
          yearsExperience: user.doctorProfile.yearsExperience,
          qualifications: (() => { try { return JSON.parse(user.doctorProfile!.qualifications); } catch { return []; } })()
        } : undefined,
        studentDetails: user.studentProfile ? {
          discipline: user.studentProfile.discipline,
          collegeName: user.studentProfile.collegeName,
          academicYear: user.studentProfile.academicYear,
          futureSpecialty: user.studentProfile.futureSpecialty
        } : undefined,
        stats: {
          postsCount: await prisma.post.count({ where: { userId: user.id } }),
          followersCount: await prisma.follow.count({ where: { followingId: user.id } }),
          followingCount: await prisma.follow.count({ where: { followerId: user.id } })
        }
      }
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    res.status(503).json({ success: false, message: 'Authentication service is temporarily unavailable' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: 'OTP verification not configured on this deployment' });
});

// POST /api/auth/request-password-reset
router.post('/request-password-reset', async (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: 'Password reset email not configured on this deployment' });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: 'Password reset not configured on this deployment' });
});

export default router;
