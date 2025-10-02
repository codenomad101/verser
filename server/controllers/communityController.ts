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

  static async searchCommunities(req: Request, res: Response) {
    try {
      const { q, type, category } = req.query;
      const searchQuery = q as string || '';
      const communityType = type as string || 'public'; // Default to public only
      const categoryFilter = category as string || 'all';

      const communities = await storage.searchCommunities(searchQuery, communityType, categoryFilter);
      res.json(communities);
    } catch (error) {
      console.error('Search communities error:', error);
      res.status(500).json({ message: 'Failed to search communities' });
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

  static async checkMembership(req: AuthenticatedRequest, res: Response) {
    try {
      const communityId = parseInt(req.params.id);
      const isMember = await storage.isCommunityMember(req.user.id, communityId);
      
      res.json({ isMember });
    } catch (error) {
      console.error('Check membership error:', error);
      res.status(500).json({ message: 'Failed to check membership' });
    }
  }

  static async updateMemberRole(req: AuthenticatedRequest, res: Response) {
    try {
      const communityId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      const { role } = req.body;

      // Check if user has permission to update roles
      const userRole = await storage.getUserCommunityRole(req.user.id, communityId);
      if (!userRole || (userRole !== 'admin' && userRole !== 'maintainer')) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      // Prevent non-admins from promoting to admin
      if (role === 'admin' && userRole !== 'admin') {
        return res.status(403).json({ message: 'Only admins can promote to admin' });
      }

      // Update member role
      await storage.updateMemberRole(userId, communityId, role);
      
      res.json({ message: 'Member role updated successfully' });
    } catch (error) {
      console.error('Update member role error:', error);
      res.status(500).json({ message: 'Failed to update member role' });
    }
  }

  static async removeMember(req: AuthenticatedRequest, res: Response) {
    try {
      const communityId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);

      // Check if user has permission to remove members
      const userRole = await storage.getUserCommunityRole(req.user.id, communityId);
      if (!userRole || (userRole !== 'admin' && userRole !== 'maintainer')) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      // Prevent removing admins unless you're an admin
      const targetRole = await storage.getUserCommunityRole(userId, communityId);
      if (targetRole === 'admin' && userRole !== 'admin') {
        return res.status(403).json({ message: 'Only admins can remove other admins' });
      }

      // Remove member
      await storage.leaveCommunity(userId, communityId);
      
      res.json({ message: 'Member removed successfully' });
    } catch (error) {
      console.error('Remove member error:', error);
      res.status(500).json({ message: 'Failed to remove member' });
    }
  }

  static async deleteCommunity(req: AuthenticatedRequest, res: Response) {
    try {
      const communityId = parseInt(req.params.id);

      // Check if user is admin
      const userRole = await storage.getUserCommunityRole(req.user.id, communityId);
      if (userRole !== 'admin') {
        return res.status(403).json({ message: 'Only admins can delete communities' });
      }

      // Delete community
      await storage.deleteCommunity(communityId);
      
      res.json({ message: 'Community deleted successfully' });
    } catch (error) {
      console.error('Delete community error:', error);
      res.status(500).json({ message: 'Failed to delete community' });
    }
  }

  static async updateCommunity(req: AuthenticatedRequest, res: Response) {
    try {
      const communityId = parseInt(req.params.id);
      const updateData = req.body;

      // Check if user has permission to update community
      const userRole = await storage.getUserCommunityRole(req.user.id, communityId);
      if (!userRole || (userRole !== 'admin' && userRole !== 'maintainer')) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      // Update community
      const updatedCommunity = await storage.updateCommunity(communityId, updateData);
      
      res.json(updatedCommunity);
    } catch (error) {
      console.error('Update community error:', error);
      res.status(500).json({ message: 'Failed to update community' });
    }
  }
}
