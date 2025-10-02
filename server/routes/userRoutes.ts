import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken } from '../auth';

const router = Router();

// User routes
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.get('/:id/posts', UserController.getUserPosts);
router.patch('/settings', authenticateToken, UserController.updateUserSettings);

// Follow/Block routes
router.post('/:id/follow', authenticateToken, UserController.followUser);
router.delete('/:id/follow', authenticateToken, UserController.unfollowUser);
router.post('/:id/block', authenticateToken, UserController.blockUser);
router.delete('/:id/block', authenticateToken, UserController.unblockUser);
router.get('/:id/followers', UserController.getFollowers);
router.get('/:id/following', UserController.getFollowing);
router.get('/:id/follow-status', authenticateToken, UserController.getFollowStatus);
router.get('/:id/blocked', authenticateToken, UserController.getBlockedUsers);

export default router;
