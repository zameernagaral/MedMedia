import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../data/prismaClient';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/role';
import { sendSupportNotification } from '../services/supportEmail';
import rateLimit from 'express-rate-limit';
const router = Router();
const ticketLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	message: 'Too many support requests. Please try again later.'
});
router.get('/metrics', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response) => {
	try {
		const [users, posts, clips, jobs, events, resources] = await Promise.all([
			prisma.user.count(), prisma.post.count(), prisma.medclip.count(),
			prisma.job.count(), prisma.medicalEvent.count(), prisma.resource.count()
		]);
		res.json({ success: true, metrics: { users, posts, clips, jobs, events, resources } });
	} catch {
		res.status(500).json({ success: false, message: 'Failed to load admin metrics' });
	}
});

router.get('/support/tickets', requireAuth, requireRole('ADMIN'), async (_req: Request, res: Response) => {
	try {
		const tickets = await prisma.supportTicket.findMany({
			orderBy: { createdAt: 'desc' },
			take: 100,
			include: { user: { select: { id: true, fullName: true, email: true } } }
		});
		res.json({ success: true, tickets });
	} catch {
		res.status(500).json({ success: false, message: 'Failed to load support tickets' });
	}
});

router.get('/support/tickets/:id', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response) => {
	try {
		const ticket = await prisma.supportTicket.findUnique({
			where: { id: String(req.params.id) },
			include: { user: { select: { id: true, fullName: true, email: true } } }
		});
		if (!ticket) return res.status(404).json({ success: false, message: 'Support ticket not found' });
		res.json({ success: true, ticket });
	} catch {
		res.status(500).json({ success: false, message: 'Failed to load support ticket' });
	}
});

const ticketSchema = z.object({
	type: z.enum(['SUPPORT', 'REPORT']).default('SUPPORT'),
	subject: z.string().trim().min(3).max(160),
	message: z.string().trim().min(5).max(5000)
});

const createTicket = async (req: Request, res: Response) => {
	try {
		const data = ticketSchema.parse(req.body);
		const userId = (req as any).user?.userId as string | undefined;
		const ticket = await prisma.supportTicket.create({ data: { ...data, userId } });
		const notificationStatus = await sendSupportNotification({
			id: ticket.id,
			type: ticket.type as 'SUPPORT' | 'REPORT',
			createdAt: ticket.createdAt
		});
		res.status(201).json({ success: true, ticket: { id: ticket.id, status: ticket.status, createdAt: ticket.createdAt }, notificationStatus });
	} catch (error) {
		if (error instanceof z.ZodError) return res.status(400).json({ success: false, errors: error.issues });
		res.status(500).json({ success: false, message: 'Failed to submit support request' });
	}
};

router.post('/support', ticketLimiter, createTicket);

router.post('/report', ticketLimiter, requireAuth, async (req: Request, res: Response) => {
	req.body = { ...req.body, type: 'REPORT' };
	return createTicket(req, res);
});
export default router;
