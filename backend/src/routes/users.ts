import { Router, Request, Response } from 'express';
import prisma from '../data/prismaClient';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware';
import { isAdminAccount } from '../middleware/role';
import { z } from 'zod';
import { createNotification } from '../services/notificationService';

const router = Router();

const updateUserSchema = z.object({
  fullName: z.string().optional(),
  bio: z.string().optional(),
  coverPhotoUrl: z.string().url().optional(),
  avatarUrl: z.string().url().optional(),
  doctorDetails: z.any().optional(),
  studentDetails: z.any().optional()
});

router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        doctorProfile: true,
        studentProfile: true,
        _count: { select: { followers: true, following: true, posts: true } }
      }
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const currentUserId = (req as any).user?.userId;
    const isFollowing = currentUserId
      ? Boolean(await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: currentUserId, followingId: id } } }))
      : false;

    if (user.isPrivate && currentUserId !== id && !isFollowing) {
      return res.json({
        success: true,
        user: { id: user.id, fullName: user.fullName, username: user.username, avatarUrl: user.avatarUrl, isPrivate: true },
        posts: [],
        isMasked: true
      });
    }

    const userPosts = await prisma.post.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });

    res.json({
      success: true,
      user: {
        id: user.id, fullName: user.fullName, username: user.username, avatarUrl: user.avatarUrl,
        role: user.role, bio: user.bio, isPrivate: user.isPrivate, verificationStatus: user.verificationStatus,
        doctorDetails: user.doctorProfile || undefined, studentDetails: user.studentProfile || undefined,
        stats: {
          postsCount: user._count.posts,
          followersCount: user._count.followers,
          followingCount: user._count.following
        },
        isFollowing
      },
      posts: userPosts,
      isMasked: false
    });
  } catch (error) { res.status(500).json({ success: false }); }
});

router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if ((req as any).user.userId !== id && !(await isAdminAccount((req as any).user.userId))) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const data = updateUserSchema.parse(req.body);
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { fullName: data.fullName, bio: data.bio, avatarUrl: data.avatarUrl },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        role: true,
        verificationStatus: true,
        isPrivate: true,
        coverPhotoUrl: true
      }
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, errors: (error as any).errors });
    res.status(500).json({ success: false });
  }
});

router.post('/:id/connect', requireAuth, async (req: Request, res: Response) => {
  return res.redirect(307, `/api/users/${req.params.id}/follow`);
});

router.post('/:id/follow', requireAuth, async (req: Request, res: Response) => {
  try {
    const followerId = (req as any).user.userId as string;
    const followingId = req.params.id as string;
    if (followerId === followingId) return res.status(400).json({ success: false, message: 'You cannot follow yourself' });

    const target = await prisma.user.findUnique({ where: { id: followingId } });
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      create: { followerId, followingId },
      update: {}
    });
    await createNotification({ recipientId: followingId, actorId: followerId, type: 'FOLLOW', message: 'started following you' });

    const followersCount = await prisma.follow.count({ where: { followingId } });
    res.status(201).json({ success: true, isFollowing: true, followersCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to follow user' });
  }
});

router.delete('/:id/follow', requireAuth, async (req: Request, res: Response) => {
  try {
    const followerId = (req as any).user.userId as string;
    const followingId = req.params.id as string;
    await prisma.follow.deleteMany({ where: { followerId, followingId } });
    const followersCount = await prisma.follow.count({ where: { followingId } });
    res.json({ success: true, isFollowing: false, followersCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to unfollow user' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    const users = await prisma.user.findMany({
      where: role ? { role: role as string } : {},
      include: {
        doctorProfile: true,
        studentProfile: true,
        _count: { select: { followers: true, following: true, posts: true } }
      },
      take: 100,
      orderBy: { createdAt: 'desc' }
    });
    res.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        fullName: u.fullName,
        username: u.username,
        avatarUrl: u.avatarUrl,
        role: u.role,
        bio: u.bio,
        verificationStatus: u.verificationStatus,
        isPrivate: u.isPrivate,
        coverPhotoUrl: u.coverPhotoUrl,
        badgeTitle: u.role === 'DOCTOR' ? 'Verified Specialist' : 'Medical Scholar',
        doctorDetails: u.doctorProfile ? {
          specialization: u.doctorProfile.specialization,
          hospitalAffiliation: u.doctorProfile.hospitalAffiliation,
          yearsExperience: u.doctorProfile.yearsExperience,
          medicalCouncilRegNumber: u.doctorProfile.medicalCouncilRegNumber,
          qualifications: (() => { try { return JSON.parse(u.doctorProfile!.qualifications); } catch { return []; } })()
        } : undefined,
        studentDetails: u.studentProfile ? {
          discipline: u.studentProfile.discipline,
          collegeName: u.studentProfile.collegeName,
          academicYear: u.studentProfile.academicYear,
          futureSpecialty: u.studentProfile.futureSpecialty,
          researchInterests: u.studentProfile.researchInterests
        } : undefined,
        stats: {
          postsCount: u._count.posts,
          followersCount: u._count.followers,
          followingCount: u._count.following
        }
      }))
    });
  } catch (error) { res.status(500).json({ success: false }); }
});


// GET /api/users/me/suggested — suggested connections based on specialty/hospital/college
router.get('/me/suggested', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as string;
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { doctorProfile: true, studentProfile: true }
    });
    if (!currentUser) return res.status(404).json({ success: false, message: 'User not found' });

    // Get users already followed
    const alreadyFollowing = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    });
    const followingIds = new Set(alreadyFollowing.map(f => f.followingId));
    followingIds.add(userId); // exclude self

    // Build where conditions for similarity signals
    const orConditions: any[] = [];
    if (currentUser.role === 'DOCTOR' && currentUser.doctorProfile) {
      orConditions.push({ role: 'DOCTOR', doctorProfile: { specialization: currentUser.doctorProfile.specialization } });
      orConditions.push({ role: 'DOCTOR', doctorProfile: { hospitalAffiliation: currentUser.doctorProfile.hospitalAffiliation } });
    }
    if (currentUser.role === 'STUDENT' && currentUser.studentProfile) {
      orConditions.push({ role: 'STUDENT', studentProfile: { collegeName: currentUser.studentProfile.collegeName } });
      orConditions.push({ role: 'STUDENT', studentProfile: { discipline: currentUser.studentProfile.discipline } });
    }
    // Always include some doctors for students and vice versa
    orConditions.push({ role: currentUser.role === 'DOCTOR' ? 'STUDENT' : 'DOCTOR' });

    const candidates = await prisma.user.findMany({
      where: {
        id: { notIn: Array.from(followingIds) },
        OR: orConditions.length > 0 ? orConditions : undefined
      },
      include: {
        doctorProfile: true,
        studentProfile: true,
        _count: { select: { followers: true, following: true } }
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      suggestions: candidates.map(u => ({
        id: u.id,
        fullName: u.fullName,
        username: u.username,
        avatarUrl: u.avatarUrl,
        role: u.role,
        verificationStatus: u.verificationStatus,
        bio: u.bio,
        doctorDetails: u.doctorProfile ? {
          specialization: u.doctorProfile.specialization,
          hospitalAffiliation: u.doctorProfile.hospitalAffiliation,
          yearsExperience: u.doctorProfile.yearsExperience
        } : undefined,
        studentDetails: u.studentProfile ? {
          discipline: u.studentProfile.discipline,
          collegeName: u.studentProfile.collegeName,
          academicYear: u.studentProfile.academicYear
        } : undefined,
        stats: {
          followersCount: u._count.followers,
          followingCount: u._count.following
        }
      }))
    });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to fetch suggestions' }); }
});

// GET /api/users/me/unread-messages — count unread messages across all conversations
router.get('/me/unread-messages', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as string;
    const count = await prisma.message.count({
      where: {
        conversation: { participants: { some: { userId } } },
        senderId: { not: userId },
        isRead: false
      }
    });
    res.json({ success: true, count });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to fetch unread count' }); }
});

router.get('/me/bookmarks', requireAuth, async (req: Request, res: Response) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: (req as any).user.userId },
      include: { post: { include: { user: { select: { id: true, fullName: true, username: true, avatarUrl: true, role: true, verificationStatus: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, bookmarks: bookmarks.map(item => ({ ...item.post, isSaved: true })) });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to fetch bookmarks' }); }
});

export default router;
