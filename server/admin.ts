import { Request, Response, NextFunction } from 'express';
import { type AuthenticatedRequest } from './auth';

// Allow configuring admin by email via env var; fallback to a sensible default
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Check if user is admin by username or configured admin email
  const isAdminUser = req.user.username === 'admin' || req.user.email === ADMIN_EMAIL;
  if (!isAdminUser) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
}

export function optionalAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Similar to requireAdmin but doesn't block non-admin users
  // Just adds admin flag to request
  const isAdminUser = !!req.user && (req.user.username === 'admin' || req.user.email === ADMIN_EMAIL);
  (req as any).isAdmin = isAdminUser;
  
  next();
}
