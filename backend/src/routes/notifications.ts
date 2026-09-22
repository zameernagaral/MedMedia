import { Router, Request, Response } from 'express';
import { db } from '../data/persistentDb';
import { NotificationItem } from '../data/mockDb';

const router = Router();

// GET /api/notifications (Only Conferences, Job Updates, Job Applications, Follow Requests & Follow Accepted)
router.get('/', (req: Request, res: Response) => {
  const { userId } = req.query;
  const list = db.getNotifications(userId as string | undefined);
  res.json({
    success: true,
    count: list.length,
    notifications: list
  });
});

// POST /api/notifications/:id/read
router.post('/:id/read', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const success = db.markNotificationRead(id);
  res.json({ success });
});

// POST /api/notifications (Create notification)
router.post('/', (req: Request, res: Response) => {
  const { userId, type, title, description, actionUrl } = req.body;
  const validTypes = ['CONFERENCE', 'JOB_UPDATE', 'JOB_APPLICATION', 'FOLLOW_REQUEST', 'FOLLOW_ACCEPTED'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ 
      success: false, 
      message: `Invalid notification type. Must be one of: ${validTypes.join(', ')}` 
    });
  }

  const notif: NotificationItem = {
    id: `notif-${Date.now()}`,
    userId: userId || "doc-1",
    type,
    title,
    description,
    timestamp: "Just now",
    isRead: false,
    actionUrl
  };

  db.addNotification(notif);
  res.status(201).json({ success: true, notification: notif });
});

export default router;
