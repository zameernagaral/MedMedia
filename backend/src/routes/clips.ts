import { Router, Request, Response } from 'express';
import prisma from '../data/prismaClient';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware';
import { z } from 'zod';

const router = Router();

const createClipSchema = z.object({
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  caption: z.string().min(1),
  clipType: z.enum(["Clinical Update", "Social Update"]).optional(),
  tags: z.array(z.string()).optional()
});
const clipActionSchema = z.object({ action: z.enum(['like', 'save']) }).strict();

router.get('/saved', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as string;
    const bookmarks = await prisma.clipBookmark.findMany({
      where: { userId },
      include: { clip: { include: { user: { select: { id: true, fullName: true, username: true, avatarUrl: true, role: true, verificationStatus: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, clips: bookmarks.map(({ clip }) => ({
      id: clip.id,
      authorId: clip.userId,
      authorName: clip.user.fullName,
      authorAvatar: clip.user.avatarUrl,
      isVerified: clip.user.verificationStatus === 'VERIFIED',
      clipType: clip.clipType,
      videoUrl: clip.videoUrl,
      thumbnailUrl: clip.thumbnailUrl,
      caption: clip.caption,
      clinicalCategory: clip.clinicalCategory,
      tags: JSON.parse(clip.tags || '[]'),
      likesCount: clip.likesCount,
      commentsCount: clip.commentsCount,
      savesCount: clip.savesCount,
      isSaved: true,
      createdAt: clip.createdAt.toISOString()
    })) });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch saved reels' });
  }
});

router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { category, clipType, page = '1', limit = '10' } = req.query;
    const pageNumber = Math.max(1, Number.parseInt(page as string, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, Number.parseInt(limit as string, 10) || 10));
    const skip = (pageNumber - 1) * pageSize;
    const viewerId = (req as any).user?.userId as string | undefined;

    let where: any = {};
    if (clipType) where.clipType = clipType;
    if (category) where.clinicalCategory = category;
    where.user = {
      OR: [
        { isPrivate: false },
        ...(viewerId ? [
          { id: viewerId },
          { followers: { some: { followerId: viewerId } } }
        ] : [])
      ]
    };

    const prismaClips = await prisma.medclip.findMany({
      where, skip, take: pageSize, orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, username: true, avatarUrl: true, role: true, verificationStatus: true } },
        ...(viewerId ? { bookmarks: { where: { userId: viewerId }, select: { id: true } } } : {})
      }
    });

    const clips = prismaClips.map(c => ({
      id: c.id, authorId: c.userId, authorName: c.user.fullName, authorAvatar: c.user.avatarUrl,
      isVerified: c.user.verificationStatus === 'VERIFIED', clipType: c.clipType,
      videoUrl: c.videoUrl, thumbnailUrl: c.thumbnailUrl, caption: c.caption,
      clinicalCategory: c.clinicalCategory, tags: JSON.parse(c.tags || '[]'),
      likesCount: c.likesCount, commentsCount: c.commentsCount, savesCount: c.savesCount,
      isSaved: viewerId ? c.bookmarks.length > 0 : false,
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
    const { action } = clipActionSchema.parse(req.body);
    const id = req.params.id as string;

    if (action === 'like') {
      const updated = await prisma.medclip.update({ where: { id }, data: { likesCount: { increment: 1 } } });
      return res.json({ success: true, likesCount: updated.likesCount });
    }

    const userId = (req as any).user.userId as string;
    const existing = await prisma.clipBookmark.findUnique({ where: { userId_clipId: { userId, clipId: id } } });
    if (existing) {
      await prisma.clipBookmark.delete({ where: { id: existing.id } });
      const updated = await prisma.medclip.update({ where: { id }, data: { savesCount: { decrement: 1 } } });
      return res.json({ success: true, isSaved: false, savesCount: Math.max(0, updated.savesCount) });
    }

    await prisma.clipBookmark.create({ data: { userId, clipId: id } });
    const updated = await prisma.medclip.update({ where: { id }, data: { savesCount: { increment: 1 } } });
    res.json({ success: true, isSaved: true, savesCount: updated.savesCount });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, errors: error.issues });
    res.status(500).json({ success: false, message: 'Failed to update reel' });
  }
});

export default router;
