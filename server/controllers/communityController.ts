import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertCommunitySchema } from '@shared/schema';

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

  static async createCommunity(req: Request, res: Response) {
    try {
      const validatedData = insertCommunitySchema.parse(req.body);
      const community = await storage.createCommunity(validatedData);
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
}
