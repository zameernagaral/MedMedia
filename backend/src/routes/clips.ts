import { Router, Request, Response } from 'express';
import prisma from '../data/prismaClient';
import { requireAuth } from '../middleware/authMiddleware';
import { z } from 'zod';

const router = Router();

const createClipSchema = z.object({
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  caption: z.string().min(1),
  clipType: z.enum(["Clinical Update", "Social Update"]).optional(),
  tags: z.array(z.string()).optional()
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, clipType, page = '1', limit = '10' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    let where: any = {};
    if (clipType) where.clipType = clipType;
    if (category) where.clinicalCategory = category;

    const prismaClips = await prisma.medclip.findMany({
      where, skip, take: parseInt(limit as string), orderBy: { createdAt: 'desc' },
      include: { user: { include: { doctorProfile: true, studentProfile: true } } }
    });

    const clips = prismaClips.map(c => ({
      id: c.id, authorId: c.userId, authorName: c.user.fullName, authorAvatar: c.user.avatarUrl,
      isVerified: c.user.verificationStatus === 'VERIFIED', clipType: c.clipType,
      videoUrl: c.videoUrl, thumbnailUrl: c.thumbnailUrl, caption: c.caption,
      clinicalCategory: c.clinicalCategory, tags: JSON.parse(c.tags || '[]'),
      likesCount: c.likesCount, commentsCount: c.commentsCount, savesCount: c.savesCount,
      createdAt: c.createdAt.toISOString()
    }));
    res.json({ success: true, count: clips.length, clips });
  } catch (error) { res.status(500).json({ success: false }); }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = createClipSchema.parse(req.body);
    const userId = (req as any).user.userId;

    const newClip = await prisma.medclip.create({
      data: {
        userId,
        clipType: data.clipType || "Clinical Update",
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl || "",
        caption: data.caption,
        clinicalCategory: data.clipType || "Clinical Update",
        tags: JSON.stringify(data.tags || []),
      }
    });

    res.status(201).json({ success: true, clip: newClip });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, errors: (error as any).errors });
    res.status(500).json({ success: false });
  }
});

router.post('/:id/action', requireAuth, async (req: Request, res: Response) => {
  try {
    const { action } = req.body;
    const id = req.params.id as string;
    
    if (action === 'like') await prisma.medclip.update({ where: { id }, data: { likesCount: { increment: 1 } } });
    else if (action === 'save') await prisma.medclip.update({ where: { id }, data: { savesCount: { increment: 1 } } });
    
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false }); }
});

export default router;
