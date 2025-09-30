import { Router } from 'express';
import { SearchController } from '../controllers/searchController';

const router = Router();

// Search routes
router.get('/', SearchController.search);

export default router;
