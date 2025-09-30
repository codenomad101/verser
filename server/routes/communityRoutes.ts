import { Router } from 'express';
import { CommunityController } from '../controllers/communityController';

const router = Router();

// Community routes
router.get('/', CommunityController.getAllCommunities);
router.get('/:id', CommunityController.getCommunityById);
router.post('/', CommunityController.createCommunity);
router.get('/:id/posts', CommunityController.getCommunityPosts);

export default router;
