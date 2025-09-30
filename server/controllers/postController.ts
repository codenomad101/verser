import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertPostSchema } from '@shared/schema';

export class PostController {
  static async getAllPosts(req: Request, res: Response) {
    try {
      const posts = await storage.getAllPosts();
      const postsWithUsers = await Promise.all(
        posts.map(async (post) => {
          const user = await storage.getUser(post.userId);
          return { ...post, user };
        })
      );
      res.json(postsWithUsers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch posts' });
    }
  }

  static async getTrendingPosts(req: Request, res: Response) {
    try {
      const posts = await storage.getTrendingPosts();
      const postsWithUsers = await Promise.all(
        posts.map(async (post) => {
          const user = await storage.getUser(post.userId);
          return { ...post, user };
        })
      );
      res.json(postsWithUsers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch trending posts' });
    }
  }

  static async createPost(req: Request, res: Response) {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validatedData);
      const user = await storage.getUser(validatedData.userId);
      
      res.json({ ...post, user });
    } catch (error) {
      res.status(400).json({ message: 'Invalid post data' });
    }
  }

  static async likePost(req: Request, res: Response) {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      const updatedPost = await storage.updatePostStats(postId, post.likes + 1);
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: 'Failed to like post' });
    }
  }
}
