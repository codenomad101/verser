import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertCommunitySchema } from '@shared/schema';

interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string; email: string };
}

export class CommunityController {
  static async getAllCommunities(req: Request, res: Response) {
    try {
      const communities = await storage.getAllCommunities();
      res.json(communities);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch communities' });
    }
  }

  static async getCommunityById(req: Request, res: Response) {
    try {
      const community = await storage.getCommunity(parseInt(req.params.id));
      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }
      res.json(community);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch community' });
    }
  }

  static async createCommunity(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const validatedData = insertCommunitySchema.parse(req.body);
      const community = await storage.createCommunity(validatedData);
      
      // Automatically make the creator an admin
      await storage.joinCommunity(req.user.id, community.id, 'admin');
      
      res.status(201).json(community);
    } catch (error) {
      res.status(400).json({ message: 'Invalid community data' });
    }
  }

  static async getCommunityPosts(req: Request, res: Response) {
    try {
      const communityId = parseInt(req.params.id);
      const posts = await storage.getPostsByCommunity(communityId);
      
      // Add user info to each post
      const postsWithUsers = await Promise.all(
        posts.map(async (post) => {
          const user = await storage.getUser(post.userId);
          const { password, ...userWithoutPassword } = user || {};
          return { ...post, user: userWithoutPassword };
        })
      );
      
      res.json(postsWithUsers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch community posts' });
    }
  }

  static async joinCommunity(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const communityId = parseInt(req.params.id);
      const community = await storage.getCommunity(communityId);
      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }

      // Check if already a member
      const isMember = await storage.isCommunityMember(req.user.id, communityId);
      if (isMember) {
        return res.status(400).json({ message: 'Already a member of this community' });
      }

      const membership = await storage.joinCommunity(req.user.id, communityId);
      res.json({ message: 'Successfully joined community', membership });
    } catch (error) {
      console.error('Join community error:', error);
      res.status(500).json({ message: 'Failed to join community' });
    }
  }

  static async leaveCommunity(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const communityId = parseInt(req.params.id);
      const success = await storage.leaveCommunity(req.user.id, communityId);
      
      if (success) {
        res.json({ message: 'Successfully left community' });
      } else {
        res.status(400).json({ message: 'Not a member of this community' });
      }
    } catch (error) {
      console.error('Leave community error:', error);
      res.status(500).json({ message: 'Failed to leave community' });
    }
  }

  static async getUserCommunities(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const communities = await storage.getUserCommunities(userId);
      res.json(communities);
    } catch (error) {
      console.error('Get user communities error:', error);
      res.status(500).json({ message: 'Failed to fetch user communities' });
    }
  }

  static async getCommunityMembers(req: Request, res: Response) {
    try {
      const communityId = parseInt(req.params.id);
      const members = await storage.getCommunityMembers(communityId);
      
      // Remove sensitive information
      const membersWithoutSensitiveData = members.map(member => {
        const { password, ...memberWithoutPassword } = member;
        return memberWithoutPassword;
      });
      
      res.json(membersWithoutSensitiveData);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch community members' });
    }
  }

  static async getUserCommunityRole(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const communityId = parseInt(req.params.id);
      
      // Check if community exists
      const community = await storage.getCommunity(communityId);
      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }
      
      // Check if user exists
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const role = await storage.getUserCommunityRole(req.user.id, communityId);
      
      res.json({ role });
    } catch (error) {
      console.error('Get user community role error:', error);
      res.status(500).json({ message: 'Failed to fetch user role' });
    }
  }
}
