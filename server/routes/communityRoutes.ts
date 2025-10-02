import { Router } from 'express';
import { CommunityController } from '../controllers/communityController';
import { authenticateToken } from '../auth';

const router = Router();

// Community routes
router.get('/', CommunityController.getAllCommunities);
router.get('/:id', CommunityController.getCommunityById);
router.post('/', authenticateToken, CommunityController.createCommunity);
router.get('/:id/posts', CommunityController.getCommunityPosts);

// Community membership routes
router.post('/:id/join', authenticateToken, CommunityController.joinCommunity);
router.delete('/:id/leave', authenticateToken, CommunityController.leaveCommunity);
router.get('/user/:userId', CommunityController.getUserCommunities);
router.get('/:id/members', CommunityController.getCommunityMembers);
router.get('/:id/role', authenticateToken, CommunityController.getUserCommunityRole);

export default router;
