import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertMessageSchema, insertPostSchema, insertCommunitySchema, loginSchema, registerSchema, updateUserSettingsSchema } from "@shared/schema";
import { generateToken, hashPassword, comparePassword, authenticateToken, optionalAuth, type AuthenticatedRequest } from "./auth";

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

  // Demo login endpoint for quick access
  app.post('/api/demo-login', (req, res) => {
    const demoUser = {
      id: 1,
      username: 'alex_johnson',
      email: 'alex@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      bio: 'Product Designer',
      status: 'online',
      lastSeen: new Date(),
      showLastSeen: true,
      showOnlineStatus: true,
      isVerified: false,
      followersCount: 1250,
      followingCount: 890,
      about: null,
      createdAt: new Date()
    };
    
    const token = generateToken(demoUser.id, demoUser.username, demoUser.email);
    
    res.status(200).json({
      user: demoUser,
      token
    });
  });

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
      const token = generateToken(user.id, user.username, user.email);
      
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
      
      // Quick demo account bypass
      if (req.body.email === 'alex@example.com' && req.body.password === 'password123') {
        console.log('Demo account login detected');
        
        // Generate token for demo user
        const token = generateToken(1, 'alex_johnson', 'alex@example.com');
        
        const demoUser = {
          id: 1,
          username: 'alex_johnson',
          email: 'alex@example.com',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          bio: 'Product Designer',
          status: 'online',
          lastSeen: new Date(),
          showLastSeen: true,
          showOnlineStatus: true,
          isVerified: false,
          followersCount: 1250,
          followingCount: 890,
          about: null,
          createdAt: new Date()
        };
        
        console.log('Returning demo user:', demoUser);
        
        return res.status(200).json({
          user: demoUser,
          token
        });
      }
      
      // Process other login attempts
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
      const token = generateToken(user.id, user.username, user.email);
      
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

  app.post('/api/auth/logout', authenticateToken, async (req: AuthenticatedRequest, res) => {
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
  app.get('/api/notifications', async (req: AuthenticatedRequest, res) => {
    try {
      // Return sample notifications for now
      const notifications = [
        {
          id: 1,
          type: 'like',
          message: 'Alex Johnson liked your post',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          read: false
        },
        {
          id: 2,
          type: 'comment',
          message: 'Sarah Chen commented on your post',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b55c?w=40&h=40&fit=crop&crop=face',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: false
        }
      ];
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch notifications' });
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
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { name, type = 'direct' } = req.body;
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
      let communities = await storage.getAllCommunities();
      
      // If no communities exist, create some sample ones
      if (communities.length === 0) {
        const sampleCommunities = [
          {
            name: "Tech Innovators",
            description: "Discussing cutting-edge technology and innovation",
            icon: "💻",
            color: "#3B82F6",
            memberCount: 15420,
            onlineCount: 342
          },
          {
            name: "Creative Minds",
            description: "A space for designers, artists, and creative professionals",
            icon: "🎨",
            color: "#8B5CF6",
            memberCount: 8750,
            onlineCount: 156
          },
          {
            name: "Startup Hub",
            description: "Entrepreneurs sharing insights and building connections",
            icon: "🚀",
            color: "#10B981",
            memberCount: 12300,
            onlineCount: 234
          },
          {
            name: "Photography",
            description: "Capturing moments and sharing visual stories",
            icon: "📸",
            color: "#F59E0B",
            memberCount: 9870,
            onlineCount: 178
          }
        ];

        for (const community of sampleCommunities) {
          await storage.createCommunity(community);
        }
        
        communities = await storage.getAllCommunities();
        
        // Add sample posts to communities
        const samplePosts = [
          {
            userId: 1,
            communityId: 1,
            title: "The Future of AI in Web Development",
            content: "Exploring how artificial intelligence is transforming the way we build websites and applications. From automated code generation to intelligent UX optimization, AI is reshaping our industry.",
            imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=300&fit=crop",
            tags: ["AI", "WebDev", "Technology"]
          },
          {
            userId: 1,
            communityId: 2,
            title: "Minimalist Design Principles for 2024",
            content: "Less is more. Discover the key principles of minimalist design that are driving user engagement and creating memorable digital experiences.",
            imageUrl: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&h=300&fit=crop",
            tags: ["Design", "Minimalism", "UX"]
          },
          {
            userId: 1,
            communityId: 3,
            title: "Building a Startup: Lessons from Year One",
            content: "Sharing insights from our first year as founders. The challenges, victories, and everything in between. What we wish we knew before starting.",
            imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=300&fit=crop",
            tags: ["Startup", "Entrepreneurship", "Business"]
          },
          {
            userId: 1,
            communityId: 4,
            title: "Street Photography Tips for Beginners",
            content: "Capturing authentic moments in urban environments. Essential techniques for composition, lighting, and storytelling through street photography.",
            imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=300&fit=crop",
            tags: ["Photography", "Street", "Tips"]
          }
        ];

        for (const post of samplePosts) {
          await storage.createPost(post);
        }
      }
      
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

  return httpServer;
}
