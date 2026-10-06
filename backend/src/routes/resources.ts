import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../data/prismaClient';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware';

const router = Router();
const createResourceSchema = z.object({
  title: z.string().trim().min(1).max(200),
  specialty: z.string().trim().min(1).max(160),
  category: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(10000),
  pageCount: z.number().int().min(0).max(10000).default(0),
  fileSize: z.string().trim().max(40).default(''),
  downloadUrl: z.string().url(),
  keyPearls: z.array(z.string().trim().min(1).max(1000)).max(100).default([]),
  aiSummary: z.string().trim().max(10000).optional(),
  publishedDate: z.string().trim().min(1).max(40).default(() => String(new Date().getFullYear()))
}).strict();

function parseList(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

// GET /api/resources
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const category = typeof req.query.category === 'string' && req.query.category !== 'All' ? req.query.category : undefined;
    const specialty = typeof req.query.specialty === 'string' && req.query.specialty !== 'All' ? req.query.specialty : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const viewerId = (req as any).user?.userId as string | undefined;
    const resources = await prisma.resource.findMany({
      where: {
        ...(category ? { category: { equals: category } } : {}),
        ...(specialty ? { specialty: { contains: specialty } } : {}),
        ...(search ? { OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { specialty: { contains: search } }
        ] } : {})
      },
      include: {
        author: { select: { fullName: true, role: true } },
        _count: { select: { votes: true } },
        votes: { where: { userId: viewerId || '' }, select: { id: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, count: resources.length, resources: resources.map(resource => ({
      id: resource.id,
      title: resource.title,
      author: resource.author?.fullName || 'MedMedia member',
      authorRole: resource.author?.role || resource.authorRole || undefined,
      specialty: resource.specialty,
      category: resource.category,
      description: resource.description,
      pageCount: resource.pageCount,
      fileSize: resource.fileSize,
      downloadUrl: resource.downloadUrl,
      upvotesCount: resource._count.votes,
      isUpvoted: viewerId ? resource.votes.length > 0 : false,
      isSaved: false,
      keyPearls: parseList(resource.keyPearls),
      aiSummary: resource.aiSummary || undefined,
      publishedDate: resource.publishedDate
    })) });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch resources' });
  }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = createResourceSchema.parse(req.body);
    const authorId = (req as any).user.userId as string;
    const author = await prisma.user.findUnique({ where: { id: authorId }, select: { role: true } });
    const resource = await prisma.resource.create({
      data: {
        ...data,
        authorId,
        authorRole: author?.role,
        keyPearls: JSON.stringify(data.keyPearls)
      }
    });
    res.status(201).json({ success: true, resource: { ...resource, author: undefined, upvotesCount: 0, isUpvoted: false, isSaved: false, keyPearls: data.keyPearls } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, errors: error.issues });
    res.status(500).json({ success: false, message: 'Could not create resource' });
  }
});

router.post('/:id/upvote', requireAuth, async (req: Request, res: Response) => {
  try {
    const resourceId = req.params.id as string;
    const userId = (req as any).user.userId as string;
    const existing = await prisma.resourceVote.findUnique({ where: { userId_resourceId: { userId, resourceId } } });
    if (existing) {
      await prisma.resourceVote.delete({ where: { id: existing.id } });
    } else {
      await prisma.resourceVote.create({ data: { userId, resourceId } });
    }
    const [upvotesCount, currentVote] = await Promise.all([
      prisma.resourceVote.count({ where: { resourceId } }),
      prisma.resourceVote.findUnique({ where: { userId_resourceId: { userId, resourceId } }, select: { id: true } })
    ]);
    res.json({ success: true, isUpvoted: Boolean(currentVote), upvotesCount });
  } catch (error) {
    if ((error as { code?: string }).code === 'P2025' || (error as { code?: string }).code === 'P2003') {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.status(500).json({ success: false, message: 'Could not update resource vote' });
  }
});

export default router;
