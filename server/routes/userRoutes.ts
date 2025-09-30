import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken } from '../auth';

const router = Router();

// User routes
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.get('/:id/posts', UserController.getUserPosts);
router.patch('/settings', authenticateToken, UserController.updateUserSettings);

export default router;
