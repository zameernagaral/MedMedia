import { Router, Request, Response } from 'express';
import prisma from '../data/prismaClient';
import { requireAuth } from '../middleware/authMiddleware';
import { z } from 'zod';

const router = Router();

// Zod schemas for validation
const createCommunitySchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  description: z.string().optional(),
  category: z.string().optional(),
  iconUrl: z.string().url().optional(),
  avatarUrl: z.string().url().optional()
});

const createJobSchema = z.object({
  title: z.string().min(1),
  category: z.string(),
  employmentType: z.string(),
  companyName: z.string(),
  location: z.string(),
  jobDescription: z.string(),
  requiredExperienceYears: z.number().int().nonnegative().optional(),
  salaryRange: z.string().optional(),
  educationPreference: z.string(),
  skillsRequired: z.array(z.string())
});

// GET /api/opportunities (Overview)
router.get('/', async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({ take: 10, orderBy: { createdAt: 'desc' } });
    const communities = await prisma.community.findMany({ take: 10, orderBy: { createdAt: 'desc' } });
    const researchProjects = await prisma.researchProject.findMany({ take: 10 });
    const locumGigs = await prisma.locumGig.findMany({ take: 10 });
    const scholarships = await prisma.scholarship.findMany({ take: 10 });
    const courses = await prisma.course.findMany({ take: 10 });

    const opportunities = [
      ...jobs.map(j => ({ id: j.id, type: 'Job', title: j.title })),
      ...researchProjects.map(r => ({ id: r.id, type: 'Research', title: r.title }))
    ];

    res.json({
      success: true,
      count: opportunities.length + jobs.length,
      opportunities,
      jobs,
      communities,
      researchProjects,
      locumGigs,
      scholarships,
      courses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// COMMUNITIES
router.get('/communities', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    let where: any = {};
    if (category && category !== 'All') where.category = category;
    if (search) where.name = { contains: search as string };

    const list = await prisma.community.findMany({ where });
    res.json({ success: true, count: list.length, communities: list });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.post('/communities', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = createCommunitySchema.parse(req.body);
    const creatorId = (req as any).user.userId;

    const newComm = await prisma.community.create({
      data: {
        name: data.name,
        description: data.description || '',
        category: data.category || 'Specialty',
        iconUrl: data.iconUrl || data.avatarUrl || '',
        creatorId,
        maxCapacity: 10000
      }
    });
    res.status(201).json({ success: true, community: newComm });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, errors: (error as any).errors });
    res.status(500).json({ success: false });
  }
});

// COMMUNITY MESSAGES
router.get('/communities/:id/messages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const messages = await prisma.communityMessage.findMany({
      where: { communityId: id as string },
      include: { sender: true },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.post('/communities/:id/messages', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const senderId = (req as any).user.userId;
    const { text, imageUrl, videoUrl } = req.body;
    
    if (!text && !imageUrl && !videoUrl) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const message = await prisma.communityMessage.create({
      data: {
        text: text || (videoUrl ? '🎬 Sent a video' : '📷 Sent an image'),
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        communityId: id as string,
        senderId
      },
      include: { sender: true }
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// JOBS
router.get('/jobs', async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.post('/jobs', requireAuth, async (req: Request, res: Response) => {
  try {
    // Basic role guard
    if ((req as any).user.role !== 'INSTITUTION' && (req as any).user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only institutions can post jobs' });
    }

    const data = createJobSchema.parse(req.body);
    
    const newJob = await prisma.job.create({
      data: {
        ...data,
        requiredExperienceYears: data.requiredExperienceYears || 0,
        skillsRequired: JSON.stringify(data.skillsRequired)
      }
    });
    res.status(201).json({ success: true, job: newJob });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, errors: (error as any).errors });
    res.status(500).json({ success: false });
  }
});

router.post('/jobs/:id/apply', requireAuth, async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id as string;
    const applicantId = (req as any).user.userId;
    
    const existing = await prisma.jobApplication.findFirst({ where: { jobId, applicantId } });
    if (existing) return res.status(400).json({ success: false, message: 'Already applied' });

    const application = await prisma.jobApplication.create({
      data: { jobId, applicantId }
    });
    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default router;
