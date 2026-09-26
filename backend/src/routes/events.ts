import { Router, Request, Response } from 'express';
import prisma from '../data/prismaClient';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

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

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, date, location, category, type, description, organizer, imageUrl, linkUrl } = req.body;
    
    if (!title || !date || !location || !category || !type || !description) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const event = await prisma.medicalEvent.create({
      data: {
        title, date, location, category, type, description, organizer, imageUrl, linkUrl
      }
    });

    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create event' });
  }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await prisma.medicalEvent.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete event' });
  }
});

export default router;
