import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateToken } from '../auth';
import { requireAdmin, requireSuperuser } from '../admin';

const router = Router();

// Admin routes
router.get('/stats', authenticateToken, requireAdmin, AdminController.getStats);
router.get('/users', authenticateToken, requireAdmin, AdminController.getAllUsers);
router.get('/posts', authenticateToken, requireAdmin, AdminController.getAllPosts);
router.get('/communities', authenticateToken, requireAdmin, AdminController.getAllCommunities);
router.delete('/users/:id', authenticateToken, requireAdmin, AdminController.deleteUser);
router.delete('/posts/:id', authenticateToken, requireAdmin, AdminController.deletePost);
router.put('/users/:id/status', authenticateToken, requireAdmin, AdminController.updateUserStatus);

// Superuser routes
router.put('/users/:id/role', authenticateToken, requireSuperuser, AdminController.updateUserRole);

export default router;
