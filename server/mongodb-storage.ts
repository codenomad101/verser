import { 
  UserModel, 
  ConversationModel, 
  MessageModel, 
  CommunityModel, 
  PostModel,
  connectToMongoDB,
  initializeDatabase
} from './database';
import { 
  type User, 
  type InsertUser, 
  type Conversation, 
  type InsertConversation, 
  type Message, 
  type InsertMessage, 
  type Community, 
  type InsertCommunity, 
  type Post, 
  type InsertPost 
} from "@shared/schema";
import { IStorage } from './storage';

export class MongoStorage implements IStorage {
  private isInitialized = false;
  private userIdCounter = 1;
  private conversationIdCounter = 1;
  private messageIdCounter = 1;
  private communityIdCounter = 1;
  private postIdCounter = 1;

  async init() {
    if (!this.isInitialized) {
      await connectToMongoDB();
      await initializeDatabase();
      this.isInitialized = true;
    }
  }

  // Helper to convert MongoDB document to our schema format
  private convertUser(doc: any): User {
    return {
      id: doc._id ? parseInt(doc._id.toString().slice(-6), 16) : this.userIdCounter++,
      username: doc.username,
      email: doc.email,
      avatar: doc.avatar || null,
      status: doc.status,
      bio: doc.bio || null,
      createdAt: doc.createdAt
    };
  }

  private convertConversation(doc: any): Conversation {
    return {
      id: doc._id ? parseInt(doc._id.toString().slice(-6), 16) : this.conversationIdCounter++,
      name: doc.name,
      type: doc.type,
      avatar: doc.avatar || null,
      description: doc.description || null,
      memberCount: doc.memberCount,
      createdAt: doc.createdAt
    };
  }

  private convertMessage(doc: any): Message {
    return {
      id: doc._id ? parseInt(doc._id.toString().slice(-6), 16) : this.messageIdCounter++,
      conversationId: doc.conversationId,
      userId: doc.userId,
      content: doc.content,
      type: doc.type,
      createdAt: doc.createdAt
    };
  }

  private convertCommunity(doc: any): Community {
    return {
      id: doc._id ? parseInt(doc._id.toString().slice(-6), 16) : this.communityIdCounter++,
      name: doc.name,
      description: doc.description || null,
      icon: doc.icon,
      color: doc.color,
      memberCount: doc.memberCount,
      onlineCount: doc.onlineCount,
      createdAt: doc.createdAt
    };
  }

  private convertPost(doc: any): Post {
    return {
      id: doc._id ? parseInt(doc._id.toString().slice(-6), 16) : this.postIdCounter++,
      userId: doc.userId,
      communityId: doc.communityId || null,
      title: doc.title || null,
      content: doc.content,
      imageUrl: doc.imageUrl || null,
      tags: doc.tags || null,
      likes: doc.likes,
      comments: doc.comments,
      shares: doc.shares,
      isTrending: doc.isTrending,
      createdAt: doc.createdAt
    };
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    await this.init();
    const users = await UserModel.find().limit(20);
    const user = users[id - 1];
    return user ? this.convertUser(user) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.init();
    const user = await UserModel.findOne({ username });
    return user ? this.convertUser(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await this.init();
    const user = await UserModel.findOne({ email });
    return user ? this.convertUser(user) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await this.init();
    const user = new UserModel({
      username: insertUser.username,
      email: insertUser.email,
      avatar: insertUser.avatar || null,
      bio: insertUser.bio || null,
      status: 'online'
    });
    const saved = await user.save();
    return this.convertUser(saved);
  }

  async updateUserStatus(id: number, status: string): Promise<User | undefined> {
    await this.init();
    const users = await UserModel.find().limit(20);
    const user = users[id - 1];
    if (user) {
      user.status = status;
      await user.save();
      return this.convertUser(user);
    }
    return undefined;
  }

  async getAllUsers(): Promise<User[]> {
    await this.init();
    const users = await UserModel.find();
    return users.map(user => this.convertUser(user));
  }

  // Conversations
  async getConversation(id: number): Promise<Conversation | undefined> {
    await this.init();
    const conversations = await ConversationModel.find();
    const conversation = conversations[id - 1];
    return conversation ? this.convertConversation(conversation) : undefined;
  }

  async getAllConversations(): Promise<Conversation[]> {
    await this.init();
    const conversations = await ConversationModel.find();
    return conversations.map(conv => this.convertConversation(conv));
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    await this.init();
    const conversation = new ConversationModel({
      name: insertConversation.name,
      type: insertConversation.type || 'group',
      avatar: insertConversation.avatar || null,
      description: insertConversation.description || null,
      memberCount: 0
    });
    const saved = await conversation.save();
    return this.convertConversation(saved);
  }

  // Messages
  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    await this.init();
    const messages = await MessageModel.find({ conversationId }).sort({ createdAt: 1 });
    return messages.map(msg => this.convertMessage(msg));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    await this.init();
    const message = new MessageModel({
      conversationId: insertMessage.conversationId,
      userId: insertMessage.userId,
      content: insertMessage.content,
      type: insertMessage.type || 'text'
    });
    const saved = await message.save();
    return this.convertMessage(saved);
  }

  async getRecentMessages(limit: number = 50): Promise<Message[]> {
    await this.init();
    const messages = await MessageModel.find().sort({ createdAt: -1 }).limit(limit);
    return messages.map(msg => this.convertMessage(msg));
  }

  // Communities
  async getCommunity(id: number): Promise<Community | undefined> {
    await this.init();
    const communities = await CommunityModel.find();
    const community = communities[id - 1];
    return community ? this.convertCommunity(community) : undefined;
  }

  async getAllCommunities(): Promise<Community[]> {
    await this.init();
    const communities = await CommunityModel.find();
    return communities.map(comm => this.convertCommunity(comm));
  }

  async createCommunity(insertCommunity: InsertCommunity): Promise<Community> {
    await this.init();
    const community = new CommunityModel({
      name: insertCommunity.name,
      description: insertCommunity.description || null,
      icon: insertCommunity.icon || 'fas fa-users',
      color: insertCommunity.color || 'blue',
      memberCount: 0,
      onlineCount: 0
    });
    const saved = await community.save();
    return this.convertCommunity(saved);
  }

  async updateCommunityStats(id: number, memberCount?: number, onlineCount?: number): Promise<Community | undefined> {
    await this.init();
    const communities = await CommunityModel.find();
    const community = communities[id - 1];
    if (community) {
      if (memberCount !== undefined) community.memberCount = memberCount;
      if (onlineCount !== undefined) community.onlineCount = onlineCount;
      await community.save();
      return this.convertCommunity(community);
    }
    return undefined;
  }

  // Posts
  async getPost(id: number): Promise<Post | undefined> {
    await this.init();
    const posts = await PostModel.find();
    const post = posts[id - 1];
    return post ? this.convertPost(post) : undefined;
  }

  async getAllPosts(): Promise<Post[]> {
    await this.init();
    const posts = await PostModel.find().sort({ createdAt: -1 });
    return posts.map(post => this.convertPost(post));
  }

  async getPostsByCommunity(communityId: number): Promise<Post[]> {
    await this.init();
    const posts = await PostModel.find({ communityId }).sort({ createdAt: -1 });
    return posts.map(post => this.convertPost(post));
  }

  async getTrendingPosts(): Promise<Post[]> {
    await this.init();
    const posts = await PostModel.find({ isTrending: true }).sort({ likes: -1 });
    return posts.map(post => this.convertPost(post));
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    await this.init();
    const post = new PostModel({
      userId: insertPost.userId,
      communityId: insertPost.communityId || null,
      title: insertPost.title || null,
      content: insertPost.content,
      imageUrl: insertPost.imageUrl || null,
      tags: insertPost.tags || [],
      likes: 0,
      comments: 0,
      shares: 0,
      isTrending: false
    });
    const saved = await post.save();
    return this.convertPost(saved);
  }

  async updatePostStats(id: number, likes?: number, comments?: number, shares?: number): Promise<Post | undefined> {
    await this.init();
    const posts = await PostModel.find();
    const post = posts[id - 1];
    if (post) {
      if (likes !== undefined) post.likes = likes;
      if (comments !== undefined) post.comments = comments;
      if (shares !== undefined) post.shares = shares;
      await post.save();
      return this.convertPost(post);
    }
    return undefined;
  }
}

export const mongoStorage = new MongoStorage();