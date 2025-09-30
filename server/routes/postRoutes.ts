import { Router } from 'express';
import { PostController } from '../controllers/postController';

const router = Router();

// Post routes
router.get('/', PostController.getAllPosts);
router.get('/trending', PostController.getTrendingPosts);
router.post('/', PostController.createPost);
router.patch('/:id/like', PostController.likePost);

export default router;
