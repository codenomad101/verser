import { users, conversations, messages, communities, posts, type User, type InsertUser, type Conversation, type InsertConversation, type Message, type InsertMessage, type Community, type InsertCommunity, type Post, type InsertPost } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: number, status: string): Promise<User | undefined>;
  updateUserSettings(id: number, settings: Partial<User>): Promise<User | undefined>;
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

  // Posts
  getPost(id: number): Promise<Post | undefined>;
  getAllPosts(): Promise<Post[]>;
  getPostsByCommunity(communityId: number): Promise<Post[]>;
  getTrendingPosts(): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePostStats(id: number, likes?: number, comments?: number, shares?: number): Promise<Post | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private communities: Map<number, Community>;
  private posts: Map<number, Post>;
  private currentUserId: number;
  private currentConversationId: number;
  private currentMessageId: number;
  private currentCommunityId: number;
  private currentPostId: number;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.communities = new Map();
    this.posts = new Map();
    this.currentUserId = 1;
    this.currentConversationId = 1;
    this.currentMessageId = 1;
    this.currentCommunityId = 1;
    this.currentPostId = 1;

    // Initialize with some sample data
    this.initializeData();
  }

  private initializeData() {
    // Create sample users
    const sampleUsers: InsertUser[] = [
      { username: "alex_johnson", email: "alex@example.com", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face", bio: "Product Designer" },
      { username: "sarah_wilson", email: "sarah@example.com", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face", bio: "UX Designer" },
      { username: "mike_johnson", email: "mike@example.com", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face", bio: "Frontend Developer" },
      { username: "emma_rodriguez", email: "emma@example.com", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face", bio: "Full Stack Developer" },
      { username: "david_chen", email: "david@example.com", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", bio: "Backend Engineer" },
    ];

    sampleUsers.forEach(user => {
      const id = this.currentUserId++;
      const newUser: User = { 
        ...user, 
        id, 
        status: Math.random() > 0.5 ? "online" : "offline",
        createdAt: new Date() 
      };
      this.users.set(id, newUser);
    });

    // Create sample conversations
    const sampleConversations: InsertConversation[] = [
      { name: "Design Team", type: "group", avatar: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&h=100&fit=crop", description: "Design discussions", memberCount: 3 },
      { name: "Marketing Team", type: "group", avatar: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=100&h=100&fit=crop", description: "Marketing strategies", memberCount: 5 },
    ];

    sampleConversations.forEach(conv => {
      const id = this.currentConversationId++;
      const newConv: Conversation = { ...conv, id, createdAt: new Date() };
      this.conversations.set(id, newConv);
    });

    // Create sample messages
    const sampleMessages: InsertMessage[] = [
      { conversationId: 1, userId: 2, content: "The new mockups look great! I especially love the color scheme and the navigation flow.", type: "text" },
      { conversationId: 1, userId: 1, content: "Thanks! Yes, let's set up a meeting for this afternoon. I'll send a calendar invite.", type: "text" },
      { conversationId: 1, userId: 3, content: "Perfect! From a development perspective, the designs look very feasible.", type: "text" },
    ];

    sampleMessages.forEach(msg => {
      const id = this.currentMessageId++;
      const newMsg: Message = { ...msg, id, createdAt: new Date() };
      this.messages.set(id, newMsg);
    });

    // Create sample communities
    const sampleCommunities: InsertCommunity[] = [
      { name: "Web Developers", description: "A community for web developers", icon: "fas fa-code", color: "blue", memberCount: 2500, onlineCount: 45 },
      { name: "UI/UX Designers", description: "Design community", icon: "fas fa-palette", color: "purple", memberCount: 1800, onlineCount: 32 },
      { name: "Startup Founders", description: "Entrepreneurship discussions", icon: "fas fa-rocket", color: "green", memberCount: 987, onlineCount: 18 },
      { name: "Photography", description: "Photo sharing and tips", icon: "fas fa-camera", color: "yellow", memberCount: 3200, onlineCount: 67 },
      { name: "Digital Marketing", description: "Marketing strategies", icon: "fas fa-bullhorn", color: "red", memberCount: 1500, onlineCount: 28 },
    ];

    sampleCommunities.forEach(community => {
      const id = this.currentCommunityId++;
      const newCommunity: Community = { ...community, id, createdAt: new Date() };
      this.communities.set(id, newCommunity);
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
        userId: 4,
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
        userId: 1,
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
      likes: 0,
      comments: 0,
      shares: 0,
      isTrending: false,
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
}

export const storage = new MemStorage();
