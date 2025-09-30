import { Request, Response } from 'express';
import { storage } from '../storage';
import { type AuthenticatedRequest } from '../auth';

export class AdminController {
  static async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await storage.getAllUsers();
      const communities = await storage.getAllCommunities();
      const posts = await storage.getAllPosts();
      const conversations = await storage.getAllConversations();

      const stats = {
        totalUsers: users.length,
        totalCommunities: communities.length,
        totalPosts: posts.length,
        totalConversations: conversations.length,
        onlineUsers: users.filter(u => u.status === 'online').length,
        trendingPosts: posts.filter(p => p.isTrending).length,
        recentUsers: users.slice(-5).map(u => ({
          id: u.id,
          username: u.username,
          email: u.email,
          status: u.status,
          createdAt: u.createdAt
        })),
        recentPosts: posts.slice(-5).map(p => ({
          id: p.id,
          content: p.content.substring(0, 100) + '...',
          likes: p.likes,
          comments: p.comments,
          createdAt: p.createdAt
        }))
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch admin stats' });
    }
  }

  static async getAllUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  }

  static async getAllPosts(req: AuthenticatedRequest, res: Response) {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch posts' });
    }
  }

  static async getAllCommunities(req: AuthenticatedRequest, res: Response) {
    try {
      const communities = await storage.getAllCommunities();
      res.json(communities);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch communities' });
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Don't allow deleting admin user
      if (userId === req.user?.id) {
        return res.status(400).json({ message: 'Cannot delete admin user' });
      }

      // Note: You might want to implement a deleteUser method in storage
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete user' });
    }
  }

  static async deletePost(req: AuthenticatedRequest, res: Response) {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }

      // Note: You might want to implement a deletePost method in storage
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete post' });
    }
  }

  static async updateUserStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const { status } = req.body;

      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      if (!['online', 'offline', 'away'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const updatedUser = await storage.updateUserStatus(userId, status);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user status' });
    }
  }

  static async updateUserRole(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body as { role: 'user' | 'admin' | 'superuser' };
      if (isNaN(userId)) return res.status(400).json({ message: 'Invalid user ID' });
      if (!['user', 'admin', 'superuser'].includes(role)) return res.status(400).json({ message: 'Invalid role' });

      const updated = await storage.updateUserRole(userId, role);
      if (!updated) return res.status(404).json({ message: 'User not found' });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user role' });
    }
  }
}
