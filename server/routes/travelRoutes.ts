import { Router } from 'express';
import { TravelController } from '../controllers/travelController';
import { authenticateToken } from '../auth';
import { requireAdmin } from '../admin';

const router = Router();

// Travel booking routes
router.get('/mine', authenticateToken, TravelController.getMyBookings);
router.post('/', authenticateToken, TravelController.createBooking);

// Admin travel routes
router.get('/admin', authenticateToken, requireAdmin, TravelController.getAllBookings);
router.put('/admin/:id/status', authenticateToken, requireAdmin, TravelController.updateBookingStatus);

export default router;
