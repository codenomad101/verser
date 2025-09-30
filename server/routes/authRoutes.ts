import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken, optionalAuth } from '../auth';

const router = Router();

// Authentication routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', optionalAuth, AuthController.logout);
router.get('/me', authenticateToken, AuthController.getMe);

export default router;
