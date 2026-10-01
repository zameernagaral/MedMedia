import { Request, Response, NextFunction } from 'express';
import prisma from '../data/prismaClient';

export const isAdminAccount = async (userId: string) => {
  const account = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  return account?.role === 'ADMIN';
};

export const requireRole = (role: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.userId as string | undefined;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    try {
      const account = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, verificationStatus: true }
      });
      if (!account) return res.status(401).json({ success: false, message: 'Unauthenticated' });
      if (account.role !== role && account.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
      }
      if (role === 'INSTITUTION' && account.role !== 'ADMIN' && account.verificationStatus !== 'VERIFIED') {
        return res.status(403).json({ success: false, message: 'Verified institution account required' });
      }
      next();
    } catch {
      res.status(500).json({ success: false, message: 'Authorization check failed' });
    }
  };
};
