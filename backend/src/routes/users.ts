import { Router, Request, Response } from 'express';
import prisma from '../data/prismaClient';
import { requireAuth } from '../middleware/authMiddleware';
import { z } from 'zod';

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
    const user = await prisma.user.findUnique({ where: { id }, include: { doctorProfile: true, studentProfile: true } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const userPosts = await prisma.post.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });

    res.json({
      success: true,
      user: {
        id: user.id, fullName: user.fullName, username: user.username, avatarUrl: user.avatarUrl,
        role: user.role, bio: user.bio, verificationStatus: user.verificationStatus,
        doctorDetails: user.doctorProfile || undefined, studentDetails: user.studentProfile || undefined
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
  res.json({ success: true, message: `Action successful`, followersCount: 1 });
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    const users = await prisma.user.findMany({ where: role ? { role: role as string } : {}, take: 50 });
    res.json({ success: true, users });
  } catch (error) { res.status(500).json({ success: false }); }
});

export default router;
