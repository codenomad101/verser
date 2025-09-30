import { Router } from 'express';
import { FoodController } from '../controllers/foodController';
import { authenticateToken } from '../auth';
import { requireAdmin } from '../admin';

const router = Router();

// Food order routes
router.get('/mine', authenticateToken, FoodController.getMyOrders);
router.post('/', authenticateToken, FoodController.createOrder);

// Admin food routes
router.get('/admin', authenticateToken, requireAdmin, FoodController.getAllOrders);
router.put('/admin/:id/status', authenticateToken, requireAdmin, FoodController.updateOrderStatus);

export default router;
