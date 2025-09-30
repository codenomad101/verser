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
}
