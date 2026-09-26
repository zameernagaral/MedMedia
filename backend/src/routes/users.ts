import { Router, Request, Response } from 'express';
import prisma from '../data/prismaClient';
import { requireAuth } from '../middleware/authMiddleware';
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

router.get('/:id', async (req: Request, res: Response) => {
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

    const userPosts = await prisma.post.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });

    const currentUserId = (req as any).user?.userId;
    const isFollowing = currentUserId
      ? Boolean(await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: currentUserId, followingId: id } } }))
      : false;

    res.json({
      success: true,
      user: {
        id: user.id, fullName: user.fullName, username: user.username, avatarUrl: user.avatarUrl,
        role: user.role, bio: user.bio, verificationStatus: user.verificationStatus,
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
    if ((req as any).user.userId !== id && (req as any).user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const data = updateUserSchema.parse(req.body);
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { fullName: data.fullName, bio: data.bio, avatarUrl: data.avatarUrl }
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
    const users = await prisma.user.findMany({ where: role ? { role: role as string } : {}, take: 50 });
    res.json({ success: true, users });
  } catch (error) { res.status(500).json({ success: false }); }
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
