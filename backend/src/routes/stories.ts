import { Router, Request, Response } from 'express';
import prisma from '../data/prismaClient';
import { requireAuth } from '../middleware/authMiddleware';
import { z } from 'zod';

const router = Router();

const createStorySchema = z.object({
  mediaUrl: z.string().url("Must be a valid URL"),
  caption: z.string().max(255).optional(),
  clinicalTags: z.array(z.string()).optional(),
  isVideo: z.boolean().optional()
});

// GET /api/stories
router.get('/', async (req: Request, res: Response) => {
  try {
    const stories = await prisma.story.findMany({
      where: {
        expiresAt: { gt: new Date() } // Only show non-expired stories
      },
      include: {
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedStories = stories.map(s => ({
      id: s.id,
      userId: s.userId,
      userName: s.user.fullName,
      userAvatar: s.user.avatarUrl,
      mediaUrl: s.mediaUrl,
      caption: s.caption,
      clinicalTags: s.clinicalTags ? JSON.parse(s.clinicalTags) : [],
      timestamp: s.createdAt.toISOString(),
      isViewed: s.isViewed,
      isVideo: s.isVideo
    }));

    res.json({ success: true, count: formattedStories.length, stories: formattedStories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch stories', error: error.message });
  }
});

// POST /api/stories - Create new 24h story
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const validatedData = createStorySchema.parse(req.body);
    const userId = (req as any).user.userId;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const newStory = await prisma.story.create({
      data: {
        userId,
        mediaUrl: validatedData.mediaUrl,
        caption: validatedData.caption || '',
        clinicalTags: validatedData.clinicalTags ? JSON.stringify(validatedData.clinicalTags) : null,
        isVideo: validatedData.isVideo || false,
        expiresAt
      },
      include: { user: true }
    });

    res.status(201).json({
      success: true,
      story: {
        id: newStory.id,
        userId: newStory.userId,
        userName: newStory.user.fullName,
        userAvatar: newStory.user.avatarUrl,
        mediaUrl: newStory.mediaUrl,
        caption: newStory.caption,
        clinicalTags: newStory.clinicalTags ? JSON.parse(newStory.clinicalTags) : [],
        timestamp: newStory.createdAt.toISOString(),
        isViewed: newStory.isViewed,
        isVideo: newStory.isVideo
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation Error', errors: (error as any).errors });
    }
    res.status(500).json({ success: false, message: 'Failed to create story', error: error.message });
  }
});

// DELETE /api/stories/:id
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.userId;

    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    if (story.userId !== userId && (req as any).user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await prisma.story.delete({ where: { id } });
    res.json({ success: true, message: 'Story deleted successfully', id });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete story', error: error.message });
  }
});

export default router;
