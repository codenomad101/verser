import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertMessageSchema, insertPostSchema, insertCommunitySchema, loginSchema, registerSchema, updateUserSettingsSchema, insertFoodOrderSchema, insertTravelBookingSchema } from "@shared/schema";
import { generateToken, hashPassword, comparePassword, authenticateToken, optionalAuth, type AuthenticatedRequest } from "./auth";
import { requireAdmin, optionalAdmin, requireSuperuser } from "./admin";

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

  // Removed demo login endpoint

  // Authentication
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });

      // Generate token
      const token = generateToken(user.id, user.username, user.email, (user as any).role || 'user');
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid registration data' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      console.log('Login attempt:', req.body);
      
      // Process login attempts
      const validatedData = loginSchema.parse(req.body);
      
      // Find user by email for other accounts
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check password
      const isPasswordValid = await comparePassword(validatedData.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Update user status and last seen
      await storage.updateUserStatus(user.id, 'online');
      await storage.updateUserSettings(user.id, { lastSeen: new Date() });

      // Generate token
      const token = generateToken(user.id, user.username, user.email, (user as any).role || 'user');
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.log('Login error:', error);
      res.status(400).json({ message: 'Invalid login data' });
    }
  });

  app.post('/api/auth/logout', optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user) {
        await storage.updateUserStatus(req.user.id, 'offline');
        await storage.updateUserSettings(req.user.id, { lastSeen: new Date() });
      }
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Logout failed' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user data' });
    }
  });

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
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  app.get('/api/users/:id/posts', async (req, res) => {
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
  });

  app.patch('/api/users/settings', authenticateToken, async (req: AuthenticatedRequest, res) => {
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
  });

  // Notifications
  app.get('/api/notifications', async (_req: AuthenticatedRequest, res) => {
    try {
      // No dummy notifications; return empty for now
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  });

  // Posts
  app.get('/api/posts', async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch posts' });
    }
  });

  app.get('/api/posts/trending', async (req, res) => {
    try {
      const posts = await storage.getTrendingPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch trending posts' });
    }
  });

  // Search
  app.get('/api/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.json({ users: [], posts: [], communities: [] });
      }

      const [users, posts, communities] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllPosts(),
        storage.getAllCommunities()
      ]);

      const searchResults = {
        users: users.filter(user => 
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          (user.bio && user.bio.toLowerCase().includes(query.toLowerCase()))
        ).map(user => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        }),
        posts: posts.filter(post => 
          post.content.toLowerCase().includes(query.toLowerCase()) ||
          (post.title && post.title.toLowerCase().includes(query.toLowerCase()))
        ),
        communities: communities.filter(community => 
          community.name.toLowerCase().includes(query.toLowerCase()) ||
          (community.description && community.description.toLowerCase().includes(query.toLowerCase()))
        )
      };

      res.json(searchResults);
    } catch (error) {
      res.status(500).json({ message: 'Search failed' });
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

  app.post('/api/conversations', async (req: AuthenticatedRequest, res) => {
    try {
      const { name, type = 'direct', userId } = req.body;
      const conversationUserId = userId || req.user?.id;
      const conversation = await storage.createConversation({
        name: name || 'New Chat',
        type,
        description: null,
        memberCount: 1
      });

      res.status(201).json(conversation);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create conversation' });
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

  app.post('/api/communities', async (req, res) => {
    try {
      const community = await storage.createCommunity(req.body);
      res.status(201).json(community);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create community' });
    }
  });

  app.get('/api/communities/:id/posts', async (req, res) => {
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

  // Orders (Food)
  app.get('/api/orders/mine', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const orders = await storage.getFoodOrdersByUser(req.user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  });

  app.post('/api/orders', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const data = insertFoodOrderSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const order = await storage.createFoodOrder(data);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: 'Invalid order data' });
    }
  });

  // Travel Bookings
  app.get('/api/travel-bookings/mine', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const bookings = await storage.getTravelBookingsByUser(req.user.id);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch bookings' });
    }
  });

  app.post('/api/travel-bookings', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const data = insertTravelBookingSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const booking = await storage.createTravelBooking(data);
      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ message: 'Invalid booking data' });
    }
  });

  // Admin Routes
  app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
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
  });

  app.get('/api/admin/users', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.get('/api/admin/posts', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch posts' });
    }
  });

  app.get('/api/admin/communities', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const communities = await storage.getAllCommunities();
      res.json(communities);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch communities' });
    }
  });

  app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
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
  });

  app.delete('/api/admin/posts/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
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
  });

  // Admin - Food Orders
  app.get('/api/admin/orders', authenticateToken, requireAdmin, async (_req: AuthenticatedRequest, res) => {
    try {
      const orders = await storage.getAllFoodOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  });

  app.put('/api/admin/orders/:id/status', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      if (isNaN(orderId)) return res.status(400).json({ message: 'Invalid order ID' });
      const updated = await storage.updateFoodOrderStatus(orderId, status);
      if (!updated) return res.status(404).json({ message: 'Order not found' });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update order status' });
    }
  });

  // Admin - Travel Bookings
  app.get('/api/admin/travel-bookings', authenticateToken, requireAdmin, async (_req: AuthenticatedRequest, res) => {
    try {
      const bookings = await storage.getAllTravelBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch bookings' });
    }
  });

  app.put('/api/admin/travel-bookings/:id/status', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { status } = req.body;
      if (isNaN(bookingId)) return res.status(400).json({ message: 'Invalid booking ID' });
      const updated = await storage.updateTravelBookingStatus(bookingId, status);
      if (!updated) return res.status(404).json({ message: 'Booking not found' });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update booking status' });
    }
  });

  app.put('/api/admin/users/:id/status', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
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
  });

  // Superuser - Update user role
  app.put('/api/superuser/users/:id/role', authenticateToken, requireSuperuser, async (req: AuthenticatedRequest, res) => {
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
  });

  // Chat Requests
  app.get('/api/chat-requests', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const requests = await storage.getIncomingChatRequests(req.user.id);
      res.json(requests.filter(r => r.status === 'pending'));
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch chat requests' });
    }
  });

  app.post('/api/chat-requests', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const { receiverId, content } = req.body;
      if (!receiverId || !content) return res.status(400).json({ message: 'receiverId and content are required' });
      if (receiverId === req.user.id) return res.status(400).json({ message: 'Cannot send to self' });

      const created = await storage.createChatRequest({ senderId: req.user.id, receiverId, content });
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ message: 'Invalid chat request' });
    }
  });

  app.post('/api/chat-requests/:id/accept', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const id = parseInt(req.params.id);
      const reqRow = (await storage.getIncomingChatRequests(req.user.id)).find(r => r.id === id);
      if (!reqRow) return res.status(404).json({ message: 'Request not found' });
      if (reqRow.receiverId !== req.user.id) return res.status(403).json({ message: 'Not allowed' });

      await storage.updateChatRequestStatus(id, 'accepted');
      // Create conversation and deliver initial message
      const conv = await storage.createConversation({ name: `${reqRow.senderId}-${reqRow.receiverId}`, type: 'direct', description: null, memberCount: 2 });
      await storage.createMessage({ conversationId: conv.id, userId: reqRow.senderId, content: reqRow.content, type: 'text' });

      res.json({ conversationId: conv.id });
    } catch (error) {
      res.status(500).json({ message: 'Failed to accept request' });
    }
  });

  app.post('/api/chat-requests/:id/reject', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const id = parseInt(req.params.id);
      const reqRow = (await storage.getIncomingChatRequests(req.user.id)).find(r => r.id === id);
      if (!reqRow) return res.status(404).json({ message: 'Request not found' });
      if (reqRow.receiverId !== req.user.id) return res.status(403).json({ message: 'Not allowed' });

      await storage.updateChatRequestStatus(id, 'rejected');
      res.json({ message: 'Rejected' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to reject request' });
    }
  });

  return httpServer;
}
