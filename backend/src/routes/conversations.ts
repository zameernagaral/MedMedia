import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../data/prismaClient';
import { requireAuth } from '../middleware/authMiddleware';
import { createNotification } from '../services/notificationService';

const router = Router();
const createConversationSchema = z.object({ participantId: z.string().uuid() });
const messageSchema = z.object({ content: z.string().trim().min(1).max(5000) });

async function participant(conversationId: string, userId: string) {
  return prisma.conversationParticipant.findUnique({ where: { conversationId_userId: { conversationId, userId } } });
}

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as string;
    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: { include: { user: { select: { id: true, fullName: true, username: true, avatarUrl: true } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json({ success: true, conversations });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to fetch conversations' }); }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { participantId } = createConversationSchema.parse(req.body);
    const userId = (req as any).user.userId as string;
    if (participantId === userId) return res.status(400).json({ success: false, message: 'Cannot message yourself' });
    const target = await prisma.user.findUnique({ where: { id: participantId } });
    if (!target) return res.status(404).json({ success: false, message: 'Participant not found' });

    const existing = await prisma.conversation.findFirst({
      where: { participants: { every: { userId: { in: [userId, participantId] } } } },
      include: { participants: true }
    });
    if (existing && existing.participants.length === 2) return res.json({ success: true, conversation: existing });

    const conversation = await prisma.conversation.create({
      data: { participants: { create: [{ userId }, { userId: participantId }] } },
      include: { participants: { include: { user: { select: { id: true, fullName: true, username: true, avatarUrl: true } } } } }
    });
    res.status(201).json({ success: true, conversation });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, errors: error.issues });
    res.status(500).json({ success: false, message: 'Failed to create conversation' });
  }
});

router.get('/:id/messages', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as string;
    const conversationId = req.params.id as string;
    if (!await participant(conversationId, userId)) return res.status(403).json({ success: false, message: 'Forbidden' });
    const messages = await prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' } });
    await prisma.message.updateMany({ where: { conversationId, senderId: { not: userId }, isRead: false }, data: { isRead: true } });
    res.json({ success: true, messages });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to fetch messages' }); }
});

router.post('/:id/messages', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as string;
    const conversationId = req.params.id as string;
    if (!await participant(conversationId, userId)) return res.status(403).json({ success: false, message: 'Forbidden' });
    const { content } = messageSchema.parse(req.body);
    const message = await prisma.message.create({ data: { conversationId, senderId: userId, content } });
    const recipients = await prisma.conversationParticipant.findMany({ where: { conversationId, userId: { not: userId } } });
    await Promise.all(recipients.map(item => createNotification({ recipientId: item.userId, actorId: userId, type: 'MESSAGE', message: 'sent you a message', entityId: conversationId })));
    res.status(201).json({ success: true, message });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, errors: error.issues });
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

export default router;
