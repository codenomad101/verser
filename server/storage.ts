import { users, conversations, messages, communities, posts, foodOrders, travelBookings, chatRequests, follows, blocks, communityMemberships, type User, type InsertUser, type Conversation, type InsertConversation, type Message, type InsertMessage, type Community, type InsertCommunity, type Post, type InsertPost, type FoodOrder, type InsertFoodOrder, type TravelBooking, type InsertTravelBooking, type ChatRequest, type InsertChatRequest, type Follow, type Block, type CommunityMembership, type InsertCommunityMembership } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: number, status: string): Promise<User | undefined>;
  updateUserSettings(id: number, settings: Partial<User>): Promise<User | undefined>;
  updateUserRole(id: number, role: 'user' | 'admin' | 'superuser'): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUserPosts(userId: number): Promise<Post[]>;

  // Conversations
  getConversation(id: number): Promise<Conversation | undefined>;
  getAllConversations(): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;

  // Messages
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getRecentMessages(limit?: number): Promise<Message[]>;

  // Communities
  getCommunity(id: number): Promise<Community | undefined>;
  getAllCommunities(): Promise<Community[]>;
  createCommunity(community: InsertCommunity): Promise<Community>;
  updateCommunityStats(id: number, memberCount?: number, onlineCount?: number): Promise<Community | undefined>;
  
  // Community Memberships
  joinCommunity(userId: number, communityId: number, role?: 'admin' | 'maintainer' | 'member'): Promise<CommunityMembership>;
  leaveCommunity(userId: number, communityId: number): Promise<boolean>;
  getUserCommunities(userId: number): Promise<Community[]>;
  getCommunityMembers(communityId: number): Promise<User[]>;
  isCommunityMember(userId: number, communityId: number): Promise<boolean>;
  getUserCommunityRole(userId: number, communityId: number): Promise<'admin' | 'maintainer' | 'member' | null>;

  // Posts
  getPost(id: number): Promise<Post | undefined>;
  getAllPosts(): Promise<Post[]>;
  getPostsByCommunity(communityId: number): Promise<Post[]>;
  getTrendingPosts(): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePostStats(id: number, likes?: number, comments?: number, shares?: number): Promise<Post | undefined>;

  // Food Orders
  getAllFoodOrders(): Promise<FoodOrder[]>;
  getFoodOrdersByUser(userId: number): Promise<FoodOrder[]>;
  createFoodOrder(order: InsertFoodOrder): Promise<FoodOrder>;
  updateFoodOrderStatus(id: number, status: string): Promise<FoodOrder | undefined>;

  // Travel Bookings
  getAllTravelBookings(): Promise<TravelBooking[]>;
  getTravelBookingsByUser(userId: number): Promise<TravelBooking[]>;
  createTravelBooking(booking: InsertTravelBooking): Promise<TravelBooking>;
  updateTravelBookingStatus(id: number, status: string): Promise<TravelBooking | undefined>;

  // Chat Requests
  createChatRequest(req: InsertChatRequest): Promise<ChatRequest>;
  getIncomingChatRequests(userId: number): Promise<ChatRequest[]>;
  updateChatRequestStatus(id: number, status: 'pending' | 'accepted' | 'rejected'): Promise<ChatRequest | undefined>;

  // Follow/Block functionality
  followUser(followerId: number, followingId: number): Promise<Follow>;
  unfollowUser(followerId: number, followingId: number): Promise<boolean>;
  blockUser(blockerId: number, blockedId: number): Promise<Block>;
  unblockUser(blockerId: number, blockedId: number): Promise<boolean>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  isBlocked(blockerId: number, blockedId: number): Promise<boolean>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;
  getBlockedUsers(userId: number): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private communities: Map<number, Community>;
  private posts: Map<number, Post>;
  private foodOrders: Map<number, FoodOrder>;
  private travelBookings: Map<number, TravelBooking>;
  private currentUserId: number;
  private currentConversationId: number;
  private currentMessageId: number;
  private currentCommunityId: number;
  private currentPostId: number;
  private currentFoodOrderId: number;
  private currentTravelBookingId: number;
  private chatRequests: Map<number, ChatRequest>;
  private currentChatRequestId: number;
  private follows: Map<number, Follow>;
  private currentFollowId: number;
  private blocks: Map<number, Block>;
  private currentBlockId: number;
  private communityMemberships: Map<number, CommunityMembership>;
  private currentCommunityMembershipId: number;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.communities = new Map();
    this.posts = new Map();
    this.foodOrders = new Map();
    this.travelBookings = new Map();
    this.currentUserId = 1;
    this.currentConversationId = 1;
    this.currentMessageId = 1;
    this.currentCommunityId = 1;
    this.currentPostId = 1;
    this.currentFoodOrderId = 1;
    this.currentTravelBookingId = 1;
    this.chatRequests = new Map();
    this.currentChatRequestId = 1;
    this.follows = new Map();
    this.currentFollowId = 1;
    this.blocks = new Map();
    this.currentBlockId = 1;
    this.communityMemberships = new Map();
    this.currentCommunityMembershipId = 1;

    // Initialize with some sample data
    this.initializeData();
  }

  private initializeData() {
    // Add sample users for testing
    const sampleUsers: User[] = [
      {
        id: 1,
        username: "alex_johnson",
        email: "alex@example.com",
        phone: "0000000000",
        password: "password123",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        bio: "Product Designer",
        about: "I love building web applications and sharing knowledge with the community. Always learning something new!",
        status: "online",
        role: "admin",
        lastSeen: new Date(),
        showLastSeen: true,
        showOnlineStatus: true,
        isVerified: false,
        followersCount: 1250,
        followingCount: 890,
        location: "San Francisco, CA",
        website: "https://alexjohnson.dev",
        createdAt: new Date()
      },
      {
        id: 2,
        username: "jane_smith",
        email: "jane@example.com",
        phone: "0000000001",
        password: "password123",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        bio: "Full-stack developer passionate about creating amazing user experiences",
        about: "I love building web applications and sharing knowledge with the community. Always learning something new!",
        status: "online",
        role: "user",
        lastSeen: new Date(),
        showLastSeen: true,
        showOnlineStatus: true,
        isVerified: true,
        followersCount: 1250,
        followingCount: 340,
        location: "San Francisco, CA",
        website: "https://alexjohnson.dev",
        createdAt: new Date()
      },
      {
        id: 3,
        username: "sarah_chen",
        email: "sarah@example.com",
        phone: "0000000002",
        password: "password123",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        bio: "UI/UX Designer | Creative Director",
        about: "Designing beautiful and functional interfaces that users love. Always exploring new design trends and techniques.",
        status: "online",
        role: "user",
        lastSeen: new Date(),
        showLastSeen: true,
        showOnlineStatus: true,
        isVerified: true,
        followersCount: 890,
        followingCount: 210,
        location: "New York, NY",
        website: "https://sarahchen.design",
        createdAt: new Date()
      },
      {
        id: 4,
        username: "mike_rodriguez",
        email: "mike@example.com",
        phone: "0000000003",
        password: "password123",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        bio: "Startup Founder | Tech Entrepreneur",
        about: "Building the future of technology, one startup at a time. Passionate about innovation and helping others succeed.",
        status: "offline",
        role: "user",
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        showLastSeen: true,
        showOnlineStatus: true,
        isVerified: false,
        followersCount: 567,
        followingCount: 89,
        location: "Austin, TX",
        createdAt: new Date()
      }
    ];

    sampleUsers.forEach(user => {
      this.users.set(user.id, user);
    });
    this.currentUserId = 6; // Start next user ID from 6

    // Create sample communities
    const sampleCommunities: InsertCommunity[] = [
      { name: "Web Developers", description: "A community for web developers to share knowledge, ask questions, and collaborate on projects", icon: "fas fa-code", color: "blue", memberCount: 2500, onlineCount: 45 },
      { name: "UI/UX Designers", description: "Design community for sharing inspiration, tools, and best practices", icon: "fas fa-palette", color: "purple", memberCount: 1800, onlineCount: 32 },
      { name: "Startup Founders", description: "Entrepreneurship discussions, networking, and startup advice", icon: "fas fa-rocket", color: "green", memberCount: 987, onlineCount: 18 },
      { name: "Photography", description: "Photo sharing, tips, and techniques for photographers of all levels", icon: "fas fa-camera", color: "yellow", memberCount: 3200, onlineCount: 67 },
      { name: "Digital Marketing", description: "Marketing strategies, tools, and case studies", icon: "fas fa-bullhorn", color: "red", memberCount: 1500, onlineCount: 28 },
      { name: "React Developers", description: "React.js community for developers working with React ecosystem", icon: "fas fa-code", color: "blue", memberCount: 4200, onlineCount: 89 },
      { name: "Graphic Design", description: "Creative design community for graphic designers and artists", icon: "fas fa-palette", color: "purple", memberCount: 2100, onlineCount: 45 },
      { name: "Tech Entrepreneurs", description: "Technology entrepreneurship and innovation discussions", icon: "fas fa-rocket", color: "green", memberCount: 1200, onlineCount: 25 },
      { name: "Mobile Photography", description: "Mobile photography tips, tricks, and photo challenges", icon: "fas fa-camera", color: "yellow", memberCount: 3800, onlineCount: 78 },
      { name: "Content Marketing", description: "Content creation, strategy, and marketing best practices", icon: "fas fa-bullhorn", color: "red", memberCount: 1900, onlineCount: 35 },
    ];

    sampleCommunities.forEach(community => {
      const id = this.currentCommunityId++;
      const newCommunity: Community = { ...community, id, createdAt: new Date() };
      this.communities.set(id, newCommunity);
    });

    // Add some sample community memberships
    const sampleMemberships = [
      { userId: 1, communityId: 1 }, // John Doe joins Web Developers
      { userId: 1, communityId: 2 }, // John Doe joins UI/UX Designers
      { userId: 2, communityId: 1 }, // Jane Smith joins Web Developers
      { userId: 2, communityId: 3 }, // Jane Smith joins Startup Founders
      { userId: 3, communityId: 2 }, // Alex Johnson joins UI/UX Designers
      { userId: 3, communityId: 4 }, // Alex Johnson joins Photography
      { userId: 4, communityId: 1 }, // Sarah Chen joins Web Developers
      { userId: 4, communityId: 5 }, // Sarah Chen joins Digital Marketing
      { userId: 5, communityId: 3 }, // Mike Rodriguez joins Startup Founders
      { userId: 5, communityId: 4 }, // Mike Rodriguez joins Photography
    ];

    sampleMemberships.forEach(membership => {
      const id = this.currentCommunityMembershipId++;
      const newMembership: CommunityMembership = {
        id,
        userId: membership.userId,
        communityId: membership.communityId,
        role: 'member',
        joinedAt: new Date()
      };
      this.communityMemberships.set(id, newMembership);
    });

    // Create sample posts
    const samplePosts: InsertPost[] = [
      {
        userId: 2,
        communityId: 2,
        title: "The Future of Web Design: Trends to Watch in 2024",
        content: "Exploring the latest trends in web design, from minimalist interfaces to immersive experiences. Here's what every designer should know about the evolving digital landscape...",
        imageUrl: "https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=800&h=400&fit=crop",
        tags: ["WebDesign", "UX", "Trends2024"],
        likes: 128,
        comments: 34,
        shares: 12,
        isTrending: true
      },
      {
        userId: 3,
        communityId: 1,
        title: "Building Real-time Applications: A Complete Guide",
        content: "Deep dive into WebSockets, Server-Sent Events, and modern real-time architectures. Perfect for developers looking to add live features to their applications.",
        tags: ["JavaScript", "WebSocket", "Tutorial"],
        likes: 89,
        comments: 23,
        shares: 8,
        isTrending: false
      },
      {
        userId: 4,
        communityId: 3,
        title: "Lessons from Building a Remote-First Startup",
        content: "After 2 years of building our company with a fully distributed team, here are the key insights that made the difference between success and failure...",
        imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=300&fit=crop",
        tags: ["Startup", "RemoteWork", "Leadership"],
        likes: 156,
        comments: 47,
        shares: 23,
        isTrending: true
      },
      {
        userId: 2,
        communityId: 1,
        title: "React 18: What's New and How to Use It",
        content: "React 18 brings some exciting new features including concurrent rendering, automatic batching, and the new Suspense features. Let me walk you through the key changes...",
        imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
        tags: ["React", "JavaScript", "Frontend"],
        likes: 203,
        comments: 67,
        shares: 34,
        isTrending: true
      },
      {
        userId: 3,
        communityId: 2,
        title: "Design Systems: Creating Consistency at Scale",
        content: "Building a design system that works across multiple products and teams. Here's my approach to creating components that are both flexible and consistent...",
        imageUrl: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=400&fit=crop",
        tags: ["DesignSystem", "UI", "UX"],
        likes: 145,
        comments: 28,
        shares: 19,
        isTrending: false
      },
      {
        userId: 4,
        communityId: 3,
        title: "The Art of Pitching: Lessons from 50+ Investor Meetings",
        content: "After raising multiple rounds of funding, I've learned what works and what doesn't when pitching to investors. Here are the key strategies that helped me succeed...",
        tags: ["Startup", "Funding", "Pitching"],
        likes: 98,
        comments: 15,
        shares: 8,
        isTrending: false
      },
    ];

    samplePosts.forEach(post => {
      const id = this.currentPostId++;
      const newPost: Post = { ...post, id, createdAt: new Date() };
      this.posts.set(id, newPost);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.phone === phone);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      status: "online",
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStatus(id: number, status: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, status };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUserSettings(id: number, settings: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...settings };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(post => post.userId === userId);
  }

  // Conversation methods
  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getAllConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values());
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const conversation: Conversation = { 
      ...insertConversation, 
      id, 
      memberCount: insertConversation.memberCount || 0,
      createdAt: new Date() 
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  // Message methods
  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt: new Date() 
    };
    this.messages.set(id, message);
    return message;
  }

  async getRecentMessages(limit: number = 50): Promise<Message[]> {
    return Array.from(this.messages.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Community methods
  async getCommunity(id: number): Promise<Community | undefined> {
    return this.communities.get(id);
  }

  async getAllCommunities(): Promise<Community[]> {
    return Array.from(this.communities.values());
  }

  async createCommunity(insertCommunity: InsertCommunity): Promise<Community> {
    const id = this.currentCommunityId++;
    const community: Community = { 
      ...insertCommunity, 
      id, 
      memberCount: insertCommunity.memberCount || 0,
      onlineCount: insertCommunity.onlineCount || 0,
      createdAt: new Date() 
    };
    this.communities.set(id, community);
    return community;
  }

  async updateCommunityStats(id: number, memberCount?: number, onlineCount?: number): Promise<Community | undefined> {
    const community = this.communities.get(id);
    if (community) {
      const updatedCommunity = { 
        ...community, 
        memberCount: memberCount ?? community.memberCount,
        onlineCount: onlineCount ?? community.onlineCount
      };
      this.communities.set(id, updatedCommunity);
      return updatedCommunity;
    }
    return undefined;
  }

  // Post methods
  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.posts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPostsByCommunity(communityId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.communityId === communityId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getTrendingPosts(): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.isTrending)
      .sort((a, b) => b.likes - a.likes);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentPostId++;
    const post: Post = { 
      ...insertPost, 
      id, 
      communityId: insertPost.communityId || null,
      title: insertPost.title || null,
      imageUrl: insertPost.imageUrl || null,
      videoUrl: insertPost.videoUrl || null,
      type: insertPost.type || 'text',
      tags: insertPost.tags || null,
      likes: 0,
      comments: 0,
      shares: 0,
      reposts: 0,
      originalPostId: null,
      isRepost: false,
      isTrending: false,
      sentiment: 'neutral',
      createdAt: new Date() 
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePostStats(id: number, likes?: number, comments?: number, shares?: number): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (post) {
      const updatedPost = { 
        ...post, 
        likes: likes ?? post.likes,
        comments: comments ?? post.comments,
        shares: shares ?? post.shares
      };
      this.posts.set(id, updatedPost);
      return updatedPost;
    }
    return undefined;
  }

  async updateUserRole(id: number, role: 'user' | 'admin' | 'superuser'): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, role } as User;
    this.users.set(id, updated);
    return updated;
  }

  // Food Orders
  async getAllFoodOrders(): Promise<FoodOrder[]> {
    return Array.from(this.foodOrders.values());
  }

  async getFoodOrdersByUser(userId: number): Promise<FoodOrder[]> {
    return Array.from(this.foodOrders.values()).filter(o => o.userId === userId);
  }

  async createFoodOrder(order: InsertFoodOrder): Promise<FoodOrder> {
    const id = this.currentFoodOrderId++;
    const newOrder: FoodOrder = {
      id,
      userId: order.userId,
      items: order.items as any,
      total: order.total ?? 0,
      status: 'pending',
      createdAt: new Date(),
    } as any;
    this.foodOrders.set(id, newOrder);
    return newOrder;
  }

  async updateFoodOrderStatus(id: number, status: string): Promise<FoodOrder | undefined> {
    const existing = this.foodOrders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, status } as FoodOrder;
    this.foodOrders.set(id, updated);
    return updated;
  }

  // Travel Bookings
  async getAllTravelBookings(): Promise<TravelBooking[]> {
    return Array.from(this.travelBookings.values());
  }

  async getTravelBookingsByUser(userId: number): Promise<TravelBooking[]> {
    return Array.from(this.travelBookings.values()).filter(b => b.userId === userId);
  }

  async createTravelBooking(booking: InsertTravelBooking): Promise<TravelBooking> {
    const id = this.currentTravelBookingId++;
    const newBooking: TravelBooking = {
      id,
      userId: booking.userId,
      type: booking.type,
      from: (booking as any).from ?? null,
      to: (booking as any).to ?? null,
      location: (booking as any).location ?? null,
      travelDate: (booking as any).travelDate ?? null,
      details: (booking as any).details ?? null,
      price: booking.price ?? 0,
      status: 'pending',
      createdAt: new Date(),
    } as any;
    this.travelBookings.set(id, newBooking);
    return newBooking;
  }

  async updateTravelBookingStatus(id: number, status: string): Promise<TravelBooking | undefined> {
    const existing = this.travelBookings.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, status } as TravelBooking;
    this.travelBookings.set(id, updated);
    return updated;
  }

  // Chat Requests
  async createChatRequest(req: InsertChatRequest): Promise<ChatRequest> {
    const id = this.currentChatRequestId++;
    const row: ChatRequest = { id, status: 'pending', createdAt: new Date(), ...req } as any;
    this.chatRequests.set(id, row);
    return row;
  }

  async getIncomingChatRequests(userId: number): Promise<ChatRequest[]> {
    return Array.from(this.chatRequests.values()).filter(r => r.receiverId === userId);
  }

  async updateChatRequestStatus(id: number, status: 'pending' | 'accepted' | 'rejected'): Promise<ChatRequest | undefined> {
    const r = this.chatRequests.get(id);
    if (!r) return undefined;
    const updated = { ...r, status } as ChatRequest;
    this.chatRequests.set(id, updated);
    return updated;
  }

  // Follow/Block methods
  async followUser(followerId: number, followingId: number): Promise<Follow> {
    const id = this.currentFollowId++;
    const follow: Follow = {
      id,
      followerId,
      followingId,
      createdAt: new Date()
    };
    this.follows.set(id, follow);
    
    // Update follower/following counts
    const follower = this.users.get(followerId);
    const following = this.users.get(followingId);
    if (follower) {
      this.users.set(followerId, { ...follower, followingCount: follower.followingCount + 1 });
    }
    if (following) {
      this.users.set(followingId, { ...following, followersCount: following.followersCount + 1 });
    }
    
    return follow;
  }

  async unfollowUser(followerId: number, followingId: number): Promise<boolean> {
    const follow = Array.from(this.follows.values()).find(
      f => f.followerId === followerId && f.followingId === followingId
    );
    if (!follow) return false;
    
    this.follows.delete(follow.id);
    
    // Update follower/following counts
    const follower = this.users.get(followerId);
    const following = this.users.get(followingId);
    if (follower) {
      this.users.set(followerId, { ...follower, followingCount: Math.max(0, follower.followingCount - 1) });
    }
    if (following) {
      this.users.set(followingId, { ...following, followersCount: Math.max(0, following.followersCount - 1) });
    }
    
    return true;
  }

  async blockUser(blockerId: number, blockedId: number): Promise<Block> {
    const id = this.currentBlockId++;
    const block: Block = {
      id,
      blockerId,
      blockedId,
      createdAt: new Date()
    };
    this.blocks.set(id, block);
    
    // If they were following each other, unfollow them
    await this.unfollowUser(blockerId, blockedId);
    await this.unfollowUser(blockedId, blockerId);
    
    return block;
  }

  async unblockUser(blockerId: number, blockedId: number): Promise<boolean> {
    const block = Array.from(this.blocks.values()).find(
      b => b.blockerId === blockerId && b.blockedId === blockedId
    );
    if (!block) return false;
    
    this.blocks.delete(block.id);
    return true;
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    return Array.from(this.follows.values()).some(
      f => f.followerId === followerId && f.followingId === followingId
    );
  }

  async isBlocked(blockerId: number, blockedId: number): Promise<boolean> {
    return Array.from(this.blocks.values()).some(
      b => b.blockerId === blockerId && b.blockedId === blockedId
    );
  }

  async getFollowers(userId: number): Promise<User[]> {
    const followerIds = Array.from(this.follows.values())
      .filter(f => f.followingId === userId)
      .map(f => f.followerId);
    
    return followerIds.map(id => this.users.get(id)).filter(Boolean) as User[];
  }

  async getFollowing(userId: number): Promise<User[]> {
    const followingIds = Array.from(this.follows.values())
      .filter(f => f.followerId === userId)
      .map(f => f.followingId);
    
    return followingIds.map(id => this.users.get(id)).filter(Boolean) as User[];
  }

  async getBlockedUsers(userId: number): Promise<User[]> {
    const blockedIds = Array.from(this.blocks.values())
      .filter(b => b.blockerId === userId)
      .map(b => b.blockedId);
    
    return blockedIds.map(id => this.users.get(id)).filter(Boolean) as User[];
  }

  // Community Membership methods
  async joinCommunity(userId: number, communityId: number, role: 'admin' | 'maintainer' | 'member' = 'member'): Promise<CommunityMembership> {
    const id = this.currentCommunityMembershipId++;
    const membership: CommunityMembership = {
      id,
      userId,
      communityId,
      role,
      joinedAt: new Date()
    };
    this.communityMemberships.set(id, membership);
    
    // Update community member count
    const community = this.communities.get(communityId);
    if (community) {
      this.communities.set(communityId, { ...community, memberCount: community.memberCount + 1 });
    }
    
    return membership;
  }

  async leaveCommunity(userId: number, communityId: number): Promise<boolean> {
    const membership = Array.from(this.communityMemberships.values())
      .find(m => m.userId === userId && m.communityId === communityId);
    
    if (membership) {
      this.communityMemberships.delete(membership.id);
      
      // Update community member count
      const community = this.communities.get(communityId);
      if (community) {
        this.communities.set(communityId, { ...community, memberCount: Math.max(0, community.memberCount - 1) });
      }
      
      return true;
    }
    return false;
  }

  async getUserCommunities(userId: number): Promise<Community[]> {
    const memberships = Array.from(this.communityMemberships.values())
      .filter(m => m.userId === userId);
    
    return memberships.map(membership => this.communities.get(membership.communityId)!)
      .filter(community => community !== undefined);
  }

  async getCommunityMembers(communityId: number): Promise<User[]> {
    const memberships = Array.from(this.communityMemberships.values())
      .filter(m => m.communityId === communityId);
    
    return memberships.map(membership => this.users.get(membership.userId)!)
      .filter(user => user !== undefined);
  }

  async isCommunityMember(userId: number, communityId: number): Promise<boolean> {
    return Array.from(this.communityMemberships.values())
      .some(m => m.userId === userId && m.communityId === communityId);
  }

  async getUserCommunityRole(userId: number, communityId: number): Promise<'admin' | 'maintainer' | 'member' | null> {
    const membership = Array.from(this.communityMemberships.values())
      .find(m => m.userId === userId && m.communityId === communityId);
    
    return membership ? membership.role as 'admin' | 'maintainer' | 'member' : null;
  }
}

import { DatabaseStorage } from "./db";
export const storage = new DatabaseStorage();
