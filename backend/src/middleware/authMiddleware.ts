import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../data/prismaClient';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("FATAL: JWT_SECRET environment variable is missing");

export interface AuthRequest extends Request {
  user?: any;
}

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next();

  let decoded: string | jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    return next();
  }
  if (typeof decoded !== 'string' && typeof decoded.userId === 'string') {
    try {
      const account = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { role: true, authVersion: true } });
      const tokenVersion = typeof decoded.tv === 'number' ? decoded.tv : 0;
      if (account && tokenVersion === account.authVersion) req.user = { ...decoded, role: account.role };
    } catch {
      return res.status(503).json({ success: false, message: 'Authentication service is temporarily unavailable' });
    }
  }
  next();
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  optionalAuth(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    next();
  });
};
