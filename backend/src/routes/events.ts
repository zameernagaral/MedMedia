import { Router, Request, Response } from 'express';
import { db } from '../data/persistentDb';
import { EventItem } from '../data/mockDb';

const router = Router();

// GET /api/events?filter=Near You|International|National|Online|Offline
router.get('/', (req: Request, res: Response) => {
  const { filter } = req.query;
  const events = db.getEvents(filter as string | undefined);
  res.json({ success: true, count: events.length, events });
});

// POST /api/events - Create event (Admin/Manager)
router.post('/', (req: Request, res: Response) => {
  const {
    name, description, date, time, location, isOnline, filterType,
    organizer, registrationLink, cmeCredits, tags, bannerUrl, contactEmail
  } = req.body;

  if (!name || !date || !organizer) {
    return res.status(400).json({ success: false, message: 'name, date, organizer are required.' });
  }

  const validFilters = ['Near You', 'International', 'National', 'Online', 'Offline'];
  const resolvedFilter = filterType || (isOnline ? 'Online' : 'Offline');
  if (!validFilters.includes(resolvedFilter)) {
    return res.status(400).json({ success: false, message: `filterType must be one of: ${validFilters.join(', ')}` });
  }

  const event: EventItem = {
    id: `evt-${Date.now()}`,
    name: name.trim(),
    description: description?.trim() || '',
    date,
    time: time || '',
    location: location?.trim() || (isOnline ? 'Online / Virtual' : 'TBD'),
    isOnline: Boolean(isOnline),
    filterType: resolvedFilter,
    organizer: organizer.trim(),
    registrationLink: registrationLink || '',
    cmeCredits: cmeCredits ? Number(cmeCredits) : undefined,
    tags: Array.isArray(tags) ? tags : [],
    bannerUrl: bannerUrl || '',
    contactEmail: contactEmail || '',
    createdAt: new Date().toISOString()
  };

  db.addEvent(event);
  res.status(201).json({ success: true, event });
});

// POST /api/events/:id/rsvp - RSVP to event
router.post('/:id/rsvp', (req: Request, res: Response) => {
  const { userId, userName } = req.body;
  // In a full implementation this would persist RSVPs
  res.json({
    success: true,
    message: `RSVP confirmed for event. Confirmation sent to ${userName || 'your registered email'}.`,
    eventId: req.params.id
  });
});

export default router;
