import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../data/prismaClient';
import { requireAuth } from '../middleware/authMiddleware';
const router = Router();
router.get('/metrics', (req: Request, res: Response) => { res.json({ success: true, metrics: {} }); });

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
		res.status(201).json({ success: true, ticket: { id: ticket.id, status: ticket.status, createdAt: ticket.createdAt } });
	} catch (error) {
		if (error instanceof z.ZodError) return res.status(400).json({ success: false, errors: error.issues });
		res.status(500).json({ success: false, message: 'Failed to submit support request' });
	}
};

router.post('/support', createTicket);

router.post('/report', requireAuth, async (req: Request, res: Response) => {
	req.body = { ...req.body, type: 'REPORT' };
	return createTicket(req, res);
});
export default router;
