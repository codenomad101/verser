import { Express } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import conversationRoutes from './conversationRoutes';
import communityRoutes from './communityRoutes';
import postRoutes from './postRoutes';
import foodRoutes from './foodRoutes';
import travelRoutes from './travelRoutes';
import adminRoutes from './adminRoutes';
import searchRoutes from './searchRoutes';

export function registerAllRoutes(app: Express) {
  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/conversations', conversationRoutes);
  app.use('/api/communities', communityRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/orders', foodRoutes);
  app.use('/api/travel-bookings', travelRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/search', searchRoutes);

  // Notifications route (keeping simple for now)
  app.get('/api/notifications', async (_req, res) => {
    try {
      // No dummy notifications; return empty for now
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  });
}

// Export all route modules
export {
  authRoutes,
  userRoutes,
  conversationRoutes,
  communityRoutes,
  postRoutes,
  foodRoutes,
  travelRoutes,
  adminRoutes,
  searchRoutes
};
