import { Request, Response } from 'express';
import { storage } from '../storage';

export class SearchController {
  static async search(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: 'Query parameter required' });
      }

      const [users, communities, posts] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllCommunities(),
        storage.getAllPosts()
      ]);

      const results = {
        users: users.filter(user => 
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.bio?.toLowerCase().includes(query.toLowerCase())
        ),
        communities: communities.filter(community =>
          community.name.toLowerCase().includes(query.toLowerCase()) ||
          community.description?.toLowerCase().includes(query.toLowerCase())
        ),
        posts: posts.filter(post =>
          post.title?.toLowerCase().includes(query.toLowerCase()) ||
          post.content.toLowerCase().includes(query.toLowerCase()) ||
          post.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        )
      };

      res.json(results);
    } catch (error) {
      res.status(500).json({ message: 'Search failed' });
    }
  }
}
