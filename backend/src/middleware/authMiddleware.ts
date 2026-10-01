import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("FATAL: JWT_SECRET environment variable is missing");

export interface AuthRequest extends Request {
  user?: any;
}

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    if (typeof decoded === 'object' && typeof decoded.userId === 'string') req.user = decoded;
  } catch {}
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
