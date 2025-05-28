import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { localStorage as storage } from "./local-storage";
import { insertMessageSchema, insertPostSchema, insertCommunitySchema } from "@shared/schema";

interface WebSocketClient extends WebSocket {
  userId?: number;
  isAlive?: boolean;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store connected clients
  const clients = new Set<WebSocketClient>();

  // Broadcast function
  function broadcast(message: any, excludeClient?: WebSocketClient) {
    const messageStr = JSON.stringify(message);
    clients.forEach(client => {
      if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  // WebSocket connection handler
  wss.on('connection', (ws: WebSocketClient) => {
    clients.add(ws);
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'join':
            ws.userId = message.userId;
            if (message.userId) {
              await storage.updateUserStatus(message.userId, 'online');
              broadcast({ type: 'user_status', userId: message.userId, status: 'online' }, ws);
            }
            break;
            
          case 'send_message':
            if (message.userId && message.conversationId && message.content) {
              const newMessage = await storage.createMessage({
                userId: message.userId,
                conversationId: message.conversationId,
                content: message.content,
                type: 'text'
              });
              
              const user = await storage.getUser(message.userId);
              broadcast({
                type: 'new_message',
                message: newMessage,
                user: user
              });
            }
            break;
            
          case 'typing':
            broadcast({
              type: 'user_typing',
              userId: message.userId,
              conversationId: message.conversationId,
              isTyping: message.isTyping
            }, ws);
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', async () => {
      clients.delete(ws);
      if (ws.userId) {
        await storage.updateUserStatus(ws.userId, 'offline');
        broadcast({ type: 'user_status', userId: ws.userId, status: 'offline' });
      }
    });
  });

  // Heartbeat to keep connections alive
  const interval = setInterval(() => {
    clients.forEach((ws) => {
      if (ws.isAlive === false) {
        clients.delete(ws);
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  // API Routes

  // Users
  app.get('/api/users', async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  // Conversations
  app.get('/api/conversations', async (req, res) => {
    try {
      const conversations = await storage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch conversations' });
    }
  });

  app.get('/api/conversations/:id/messages', async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversation(parseInt(req.params.id));
      const messagesWithUsers = await Promise.all(
        messages.map(async (message) => {
          const user = await storage.getUser(message.userId);
          return { ...message, user };
        })
      );
      res.json(messagesWithUsers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  app.post('/api/messages', async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      const user = await storage.getUser(validatedData.userId);
      
      // Broadcast to WebSocket clients
      broadcast({
        type: 'new_message',
        message,
        user
      });
      
      res.json({ ...message, user });
    } catch (error) {
      res.status(400).json({ message: 'Invalid message data' });
    }
  });

  // Communities
  app.get('/api/communities', async (req, res) => {
    try {
      const communities = await storage.getAllCommunities();
      res.json(communities);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch communities' });
    }
  });

  app.get('/api/communities/:id', async (req, res) => {
    try {
      const community = await storage.getCommunity(parseInt(req.params.id));
      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }
      res.json(community);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch community' });
    }
  });

  app.post('/api/communities', async (req, res) => {
    try {
      const validatedData = insertCommunitySchema.parse(req.body);
      const community = await storage.createCommunity(validatedData);
      res.json(community);
    } catch (error) {
      res.status(400).json({ message: 'Invalid community data' });
    }
  });

  app.get('/api/communities/:id/posts', async (req, res) => {
    try {
      const posts = await storage.getPostsByCommunity(parseInt(req.params.id));
      const postsWithUsers = await Promise.all(
        posts.map(async (post) => {
          const user = await storage.getUser(post.userId);
          return { ...post, user };
        })
      );
      res.json(postsWithUsers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch community posts' });
    }
  });

  // Posts
  app.get('/api/posts', async (req, res) => {
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
  });

  app.get('/api/posts/trending', async (req, res) => {
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
  });

  app.post('/api/posts', async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validatedData);
      const user = await storage.getUser(validatedData.userId);
      
      // Broadcast to WebSocket clients
      broadcast({
        type: 'new_post',
        post,
        user
      });
      
      res.json({ ...post, user });
    } catch (error) {
      res.status(400).json({ message: 'Invalid post data' });
    }
  });

  app.patch('/api/posts/:id/like', async (req, res) => {
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
  });

  // Search
  app.get('/api/search', async (req, res) => {
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
  });

  return httpServer;
}
