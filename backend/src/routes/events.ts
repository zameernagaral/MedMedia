import { Router, Request, Response } from 'express';
import prisma from '../data/prismaClient';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/role';
import { z } from 'zod';

const router = Router();
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, 'Date must be a valid calendar date');
const eventSchema = z.object({
  title: z.string().trim().min(1).max(200),
  date: z.string().trim().min(1).max(100),
  startDate: dateOnly.optional(),
  endDate: dateOnly.optional(),
  location: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
  type: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(5000),
  organizer: z.string().trim().max(200).optional(),
  department: z.string().trim().max(160).optional(),
  creditHours: z.number().int().min(0).max(1000).optional(),
  contactPhone: z.string().trim().max(32).optional(),
  contactEmail: z.string().trim().email().max(254).optional(),
  imageUrl: z.union([z.string().url(), z.literal('')]).optional(),
  linkUrl: z.union([z.string().url(), z.literal('')]).optional()
}).strict().refine(value => !value.startDate || !value.endDate || value.endDate >= value.startDate, {
  path: ['endDate'], message: 'End date must be on or after the start date'
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await prisma.medicalEvent.findMany({
      orderBy: [{ startDate: 'asc' }, { createdAt: 'desc' }]
    });
    const chronologicallySorted = events.sort((left, right) => {
      if (!left.startDate && right.startDate) return 1;
      if (left.startDate && !right.startDate) return -1;
      if (left.startDate && right.startDate) return left.startDate.getTime() - right.startDate.getTime();
      return right.createdAt.getTime() - left.createdAt.getTime();
    });
    res.json({ success: true, count: chronologicallySorted.length, events: chronologicallySorted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

router.post('/', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { title, date, startDate, endDate, location, category, type, description, organizer, department, creditHours, contactPhone, contactEmail, imageUrl, linkUrl } = eventSchema.parse(req.body);

    const event = await prisma.medicalEvent.create({
      data: {
        title, date,
        startDate: startDate ? new Date(`${startDate}T00:00:00.000Z`) : null,
        endDate: endDate ? new Date(`${endDate}T00:00:00.000Z`) : null,
        location, category, type, description, organizer, department, creditHours,
        contactPhone, contactEmail, imageUrl, linkUrl
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
