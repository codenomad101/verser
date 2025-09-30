import { Request, Response, NextFunction } from 'express';
import { type AuthenticatedRequest } from './auth';

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  // Admin routes are accessible by admin and superuser
  if (req.user.role !== 'admin' && req.user.role !== 'superuser') {
    return res.status(403).json({ message: 'Admin or superuser access required' });
  }
  next();
}

export function requireSuperuser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  if (req.user.role !== 'superuser') {
    return res.status(403).json({ message: 'Superuser access required' });
  }
  next();
}

export function optionalAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  (req as any).isAdmin = !!req.user && (req.user.role === 'admin' || req.user.role === 'superuser');
  next();
}
