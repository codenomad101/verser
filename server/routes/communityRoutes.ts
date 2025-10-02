import { Router } from 'express';
import { CommunityController } from '../controllers/communityController';
import { authenticateToken } from '../auth';

const router = Router();

// Community routes
router.get('/', CommunityController.getAllCommunities);
router.get('/search', CommunityController.searchCommunities);
router.get('/user/:userId', CommunityController.getUserCommunities);
router.get('/:id', CommunityController.getCommunityById);
router.post('/', authenticateToken, CommunityController.createCommunity);
router.get('/:id/posts', CommunityController.getCommunityPosts);

// Community membership routes
router.post('/:id/join', authenticateToken, CommunityController.joinCommunity);
router.delete('/:id/leave', authenticateToken, CommunityController.leaveCommunity);
router.get('/:id/members', CommunityController.getCommunityMembers);
router.get('/:id/membership', authenticateToken, CommunityController.checkMembership);
router.get('/:id/role', authenticateToken, CommunityController.getUserCommunityRole);

// Community management routes (admin/maintainer only)
router.put('/:id/members/:userId/role', authenticateToken, CommunityController.updateMemberRole);
router.delete('/:id/members/:userId', authenticateToken, CommunityController.removeMember);
router.delete('/:id', authenticateToken, CommunityController.deleteCommunity);
router.put('/:id', authenticateToken, CommunityController.updateCommunity);

export default router;
