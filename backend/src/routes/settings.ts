import { Router, Request, Response } from 'express';
import prisma from '../data/prismaClient';
import { requireAuth } from '../middleware/authMiddleware';
import bcrypt from 'bcryptjs';

const router = Router();

// GET /api/settings — get current user's settings
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        coverPhotoUrl: true,
        bio: true,
        role: true,
        isPrivate: true,
        notifPush: true,
        notifEmail: true,
        createdAt: true,
        verificationStatus: true,
      }
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, settings: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

// PUT /api/settings/profile — update basic profile info
router.put('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { fullName, bio, avatarUrl, coverPhotoUrl } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl && { avatarUrl }),
        ...(coverPhotoUrl && { coverPhotoUrl }),
      },
      select: {
        id: true, fullName: true, username: true, bio: true, avatarUrl: true, coverPhotoUrl: true
      }
    });
    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// PUT /api/settings/privacy — toggle account privacy
router.put('/privacy', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { isPrivate } = req.body;

    if (typeof isPrivate !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isPrivate must be boolean' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isPrivate },
      select: { id: true, isPrivate: true }
    });
    res.json({ success: true, isPrivate: updated.isPrivate });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update privacy' });
  }
});

// PUT /api/settings/notifications — update notification preferences
router.put('/notifications', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { notifPush, notifEmail } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(typeof notifPush === 'boolean' && { notifPush }),
        ...(typeof notifEmail === 'boolean' && { notifEmail }),
      },
      select: { id: true, notifPush: true, notifEmail: true }
    });
    res.json({ success: true, notifications: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
});

// PUT /api/settings/password — change password
router.put('/password', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      return res.status(400).json({ success: false, message: 'Cannot change password for OAuth accounts' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });

    // Invalidate all other sessions
    await prisma.deviceSession.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true }
    });

    res.json({ success: true, message: 'Password changed. All sessions have been logged out.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

// POST /api/settings/support — submit a support ticket
router.post('/support', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { subject, message, category } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message required' });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject,
        message,
        category: category || 'general',
        status: 'open'
      }
    });

    res.status(201).json({ success: true, ticket, ticketId: ticket.id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit ticket' });
  }
});

// GET /api/settings/support — get my support tickets
router.get('/support', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const tickets = await prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
});

// DELETE /api/settings/account — delete account
router.delete('/account', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { password } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // If password-based account, verify password before deletion
    if (user.passwordHash) {
      if (!password) return res.status(400).json({ success: false, message: 'Password required to delete account' });
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    await prisma.user.delete({ where: { id: userId } });
    res.json({ success: true, message: 'Account permanently deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
});

export default router;
