import { Router, Request, Response } from 'express';
import prisma from '../data/prismaClient';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/role';
import { z } from 'zod';

const router = Router();
const eventSchema = z.object({
  title: z.string().trim().min(1).max(200),
  date: z.string().trim().min(1).max(100),
  location: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
  type: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(5000),
  organizer: z.string().trim().max(200).optional(),
  imageUrl: z.union([z.string().url(), z.literal('')]).optional(),
  linkUrl: z.union([z.string().url(), z.literal('')]).optional()
}).strict();

router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await prisma.medicalEvent.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: events.length, events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

router.post('/', requireAuth, requireRole('INSTITUTION'), async (req: Request, res: Response) => {
  try {
    const { title, date, location, category, type, description, organizer, imageUrl, linkUrl } = eventSchema.parse(req.body);

    const event = await prisma.medicalEvent.create({
      data: {
        title, date, location, category, type, description, organizer, imageUrl, linkUrl
      }
    });

    res.status(201).json({ success: true, event });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, errors: error.issues });
    res.status(500).json({ success: false, message: 'Failed to create event' });
  }
});

router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    await prisma.medicalEvent.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(404).json({ success: false, message: 'Event not found' });
  }
});

export default router;
