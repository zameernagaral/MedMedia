import { Router, Request, Response } from 'express';
import prisma from '../data/prismaClient';
import { requireAuth } from '../middleware/authMiddleware';
const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user.userId as string;
		const notifications = await prisma.notification.findMany({
			where: { recipientId: userId },
			include: { actor: { select: { id: true, fullName: true, username: true, avatarUrl: true } } },
			orderBy: { createdAt: 'desc' },
			take: 100
		});
		res.json({ success: true, count: notifications.length, unreadCount: notifications.filter(item => !item.isRead).length, notifications });
	} catch (error) { res.status(500).json({ success: false, message: 'Failed to fetch notifications' }); }
});

router.get('/unread-count', requireAuth, async (req: Request, res: Response) => {
	try {
		const count = await prisma.notification.count({ where: { recipientId: (req as any).user.userId, isRead: false } });
		res.json({ success: true, count });
	} catch (error) { res.status(500).json({ success: false, message: 'Failed to fetch unread count' }); }
});

router.patch('/:id/read', requireAuth, async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string;
		const notification = await prisma.notification.findFirst({ where: { id, recipientId: (req as any).user.userId } });
		if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
		const updated = await prisma.notification.update({ where: { id: notification.id }, data: { isRead: true } });
		res.json({ success: true, notification: updated });
	} catch (error) { res.status(500).json({ success: false, message: 'Failed to mark notification as read' }); }
});

router.patch('/read-all', requireAuth, async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user.userId as string;
		await prisma.notification.updateMany({ where: { recipientId: userId, isRead: false }, data: { isRead: true } });
		res.json({ success: true, message: 'All notifications marked as read' });
	} catch (error) { res.status(500).json({ success: false, message: 'Failed to mark all as read' }); }
});

export default router;
