import { Request, Response } from 'express';
import { storage } from '../storage';
import { updateUserSettingsSchema } from '@shared/schema';
import { type AuthenticatedRequest } from '../auth';

export class UserController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  }

  static async getUserPosts(req: Request, res: Response) {
    try {
      const posts = await storage.getUserPosts(parseInt(req.params.id));
      const postsWithUsers = await Promise.all(
        posts.map(async (post) => {
          const user = await storage.getUser(post.userId);
          const { password, ...userWithoutPassword } = user || {};
          return { ...post, user: userWithoutPassword };
        })
      );
      res.json(postsWithUsers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user posts' });
    }
  }

  static async updateUserSettings(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Allow updating bio, about, avatar, and other profile fields
      const allowedFields = ['bio', 'about', 'avatar', 'showLastSeen', 'showOnlineStatus'];
      const updateData: any = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      const updatedUser = await storage.updateUserSettings(req.user.id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Settings update error:', error);
      res.status(400).json({ message: 'Failed to update settings' });
    }
  }

  static async followUser(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const targetUserId = parseInt(req.params.id);
      if (targetUserId === req.user.id) {
        return res.status(400).json({ message: 'Cannot follow yourself' });
      }

      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if already following
      const isAlreadyFollowing = await storage.isFollowing(req.user.id, targetUserId);
      if (isAlreadyFollowing) {
        return res.status(400).json({ message: 'Already following this user' });
      }

      // Check if blocked
      const isBlocked = await storage.isBlocked(req.user.id, targetUserId);
      if (isBlocked) {
        return res.status(400).json({ message: 'Cannot follow blocked user' });
      }

      const follow = await storage.followUser(req.user.id, targetUserId);
      res.json({ message: 'Successfully followed user', follow });
    } catch (error) {
      console.error('Follow user error:', error);
      res.status(500).json({ message: 'Failed to follow user' });
    }
  }

  static async unfollowUser(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const targetUserId = parseInt(req.params.id);
      const success = await storage.unfollowUser(req.user.id, targetUserId);
      
      if (!success) {
        return res.status(400).json({ message: 'Not following this user' });
      }

      res.json({ message: 'Successfully unfollowed user' });
    } catch (error) {
      console.error('Unfollow user error:', error);
      res.status(500).json({ message: 'Failed to unfollow user' });
    }
  }

  static async blockUser(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const targetUserId = parseInt(req.params.id);
      if (targetUserId === req.user.id) {
        return res.status(400).json({ message: 'Cannot block yourself' });
      }

      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if already blocked
      const isAlreadyBlocked = await storage.isBlocked(req.user.id, targetUserId);
      if (isAlreadyBlocked) {
        return res.status(400).json({ message: 'User is already blocked' });
      }

      const block = await storage.blockUser(req.user.id, targetUserId);
      res.json({ message: 'Successfully blocked user', block });
    } catch (error) {
      console.error('Block user error:', error);
      res.status(500).json({ message: 'Failed to block user' });
    }
  }

  static async unblockUser(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const targetUserId = parseInt(req.params.id);
      const success = await storage.unblockUser(req.user.id, targetUserId);
      
      if (!success) {
        return res.status(400).json({ message: 'User is not blocked' });
      }

      res.json({ message: 'Successfully unblocked user' });
    } catch (error) {
      console.error('Unblock user error:', error);
      res.status(500).json({ message: 'Failed to unblock user' });
    }
  }

  static async getFollowers(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const followers = await storage.getFollowers(userId);
      res.json(followers);
    } catch (error) {
      console.error('Get followers error:', error);
      res.status(500).json({ message: 'Failed to fetch followers' });
    }
  }

  static async getFollowing(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const following = await storage.getFollowing(userId);
      res.json(following);
    } catch (error) {
      console.error('Get following error:', error);
      res.status(500).json({ message: 'Failed to fetch following' });
    }
  }

  static async getFollowStatus(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const targetUserId = parseInt(req.params.id);
      const isFollowing = await storage.isFollowing(req.user.id, targetUserId);
      res.json(isFollowing);
    } catch (error) {
      console.error('Get follow status error:', error);
      res.status(500).json({ message: 'Failed to check follow status' });
    }
  }

  static async getBlockedUsers(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const userId = parseInt(req.params.id);
      if (userId !== req.user.id) {
        return res.status(403).json({ message: 'Can only view your own blocked users' });
      }

      const blockedUsers = await storage.getBlockedUsers(userId);
      res.json(blockedUsers);
    } catch (error) {
      console.error('Get blocked users error:', error);
      res.status(500).json({ message: 'Failed to fetch blocked users' });
    }
  }
}
