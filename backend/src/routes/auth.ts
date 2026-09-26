import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../data/prismaClient';

import { env } from '../config/env';
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many auth requests from this IP, please try again later.'
});


const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("FATAL: JWT_SECRET environment variable is missing");

// POST /api/auth/login
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const identifier = String(req.body.identifier || req.body.email || req.body.phoneNumber || '').trim();
    const password = String(req.body.password || '');

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: "Identifier and password required" });
    }

    const user = await prisma.user.findFirst({
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

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found." });
    }

    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid credentials." });
      }
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.json({
      success: true,
      token,
      sessionId: `sess-${user.id}`,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isPrivate: false,
        verificationStatus: user.verificationStatus,
        badgeTitle: user.role === 'DOCTOR' ? 'Verified Specialist' : 'Medical Scholar',
        doctorDetails: user.doctorProfile ? {
          specialization: user.doctorProfile.specialization,
          hospitalAffiliation: user.doctorProfile.hospitalAffiliation,
          yearsExperience: user.doctorProfile.yearsExperience,
          medicalCouncilRegNumber: user.doctorProfile.medicalCouncilRegNumber
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
    console.error('[Auth API] Login Error:', error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// POST /api/auth/register
router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    let {
      fullName, username, email, phoneNumber, password, role, 
      doctorDetails, studentDetails 
    } = req.body;
    if (email) email = email.toLowerCase();
    if (username) username = username.toLowerCase();

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';
    const normalizedPhone = typeof phoneNumber === 'string' ? phoneNumber.trim() : undefined;

    if (!fullName?.trim() || !normalizedUsername || !normalizedEmail || !password || password.length < 8) {
      return res.status(400).json({ success: false, message: "Full name, username, email, and a password of at least 8 characters are required" });
    }

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
      return res.status(400).json({ success: false, message: "Email or username already exists" });
    }

    const passwordHash = await bcrypt.hash(password || 'password123', 10);
    const verificationStatus = (doctorDetails?.medicalCouncilRegNumber || studentDetails?.studentIdCredentialUrl) ? 'VERIFIED' : 'UNVERIFIED';

    const newUser = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        username: normalizedUsername,
        email: normalizedEmail,
        passwordHash,
        phoneNumber: normalizedPhone,
        role: role || "DOCTOR",
        avatarUrl: null,
        verificationStatus,
        doctorProfile: role === 'DOCTOR' ? {
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
        studentProfile: role === 'STUDENT' ? {
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

    const token = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
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
    console.error('[Auth API] Registration Error:', error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

// POST /api/auth/google
router.post('/google', async (req: Request, res: Response) => {
  res.json({ success: true, message: 'Google Auth logic not yet migrated to Prisma' });
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response) => {
  res.json({ success: true, message: 'OTP verified (Mock)', token: 'mock-jwt-token' });
});

// POST /api/auth/request-password-reset
router.post('/request-password-reset', async (req: Request, res: Response) => {
  res.json({ success: true, message: 'Reset email sent (Mock)' });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  res.json({ success: true, message: 'Password reset (Mock)' });
});

export default router;
