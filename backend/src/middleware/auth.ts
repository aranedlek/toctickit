import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { prisma } from '../prismaClient';

// Extend Express Request object to include the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
        requiresPasswordChange: boolean;
      };
    }
  }
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const payload = verifyToken(token) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, isActive: true, requiresPasswordChange: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (req.user.requiresPasswordChange && req.path !== '/change-password') {
      return res.status(403).json({ error: 'Forbidden: You must change your password first' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient role permissions' });
    }
    next();
  };
};

export const requirePasswordChangeChecked = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.requiresPasswordChange && req.path !== '/change-password' && req.path !== '/logout') {
     return res.status(403).json({ error: 'Forbidden: You must change your password first' });
  }
  next();
};
