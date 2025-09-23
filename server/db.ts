import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { eq } from 'drizzle-orm';
import * as schema from "@shared/schema";
import type { IStorage } from "./storage";
import type { User, InsertUser, Conversation, InsertConversation, Message, InsertMessage, Community, InsertCommunity, Post, InsertPost } from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(schema.users)
      .values({
        ...insertUser,
        isVerified: false,
        followersCount: 0,
        followingCount: 0,
      })
      .returning();
    return user;
  }

  async updateUserStatus(id: number, status: string): Promise<User | undefined> {
    const [user] = await db
      .update(schema.users)
      .set({ status, lastSeen: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserSettings(id: number, settings: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(schema.users)
      .set(settings)
      .where(eq(schema.users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(schema.users);
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    return await db.select().from(schema.posts).where(eq(schema.posts.userId, userId));
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(schema.conversations).where(eq(schema.conversations.id, id));
    return conversation || undefined;
  }

  async getAllConversations(): Promise<Conversation[]> {
    return await db.select().from(schema.conversations);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(schema.conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return await db.select().from(schema.messages).where(eq(schema.messages.conversationId, conversationId));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(schema.messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getRecentMessages(limit: number = 50): Promise<Message[]> {
    return await db.select().from(schema.messages).limit(limit);
  }

  async getCommunity(id: number): Promise<Community | undefined> {
    const [community] = await db.select().from(schema.communities).where(eq(schema.communities.id, id));
    return community || undefined;
  }

  async getAllCommunities(): Promise<Community[]> {
    return await db.select().from(schema.communities);
  }

  async createCommunity(insertCommunity: InsertCommunity): Promise<Community> {
    const [community] = await db
      .insert(schema.communities)
      .values(insertCommunity)
      .returning();
    return community;
  }

  async updateCommunityStats(id: number, memberCount?: number, onlineCount?: number): Promise<Community | undefined> {
    const updateData: any = {};
    if (memberCount !== undefined) updateData.memberCount = memberCount;
    if (onlineCount !== undefined) updateData.onlineCount = onlineCount;
    
    const [community] = await db
      .update(schema.communities)
      .set(updateData)
      .where(eq(schema.communities.id, id))
      .returning();
    return community || undefined;
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(schema.posts).where(eq(schema.posts.id, id));
    return post || undefined;
  }

  async getAllPosts(): Promise<Post[]> {
    return await db.select().from(schema.posts);
  }

  async getPostsByCommunity(communityId: number): Promise<Post[]> {
    return await db.select().from(schema.posts).where(eq(schema.posts.communityId, communityId));
  }

  async getTrendingPosts(): Promise<Post[]> {
    return await db.select().from(schema.posts).where(eq(schema.posts.isTrending, true));
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(schema.posts)
      .values({
        ...insertPost,
        likes: 0,
        comments: 0,
        shares: 0,
        reposts: 0,
        isRepost: false,
        isTrending: false,
        sentiment: "neutral",
      })
      .returning();
    return post;
  }

  async updatePostStats(id: number, likes?: number, comments?: number, shares?: number): Promise<Post | undefined> {
    const updateData: any = {};
    if (likes !== undefined) updateData.likes = likes;
    if (comments !== undefined) updateData.comments = comments;
    if (shares !== undefined) updateData.shares = shares;
    
    const [post] = await db
      .update(schema.posts)
      .set(updateData)
      .where(eq(schema.posts.id, id))
      .returning();
    return post || undefined;
  }

  // Food Orders
  async getAllFoodOrders(): Promise<schema.FoodOrder[]> {
    return await db.select().from(schema.foodOrders);
  }

  async createFoodOrder(order: schema.InsertFoodOrder): Promise<schema.FoodOrder> {
    const [row] = await db.insert(schema.foodOrders).values(order as any).returning();
    return row;
  }

  async updateFoodOrderStatus(id: number, status: string): Promise<schema.FoodOrder | undefined> {
    const [row] = await db
      .update(schema.foodOrders)
      .set({ status })
      .where(eq(schema.foodOrders.id, id))
      .returning();
    return row || undefined;
  }

  // Travel Bookings
  async getAllTravelBookings(): Promise<schema.TravelBooking[]> {
    return await db.select().from(schema.travelBookings);
  }

  async createTravelBooking(booking: schema.InsertTravelBooking): Promise<schema.TravelBooking> {
    const [row] = await db.insert(schema.travelBookings).values(booking as any).returning();
    return row;
  }

  async updateTravelBookingStatus(id: number, status: string): Promise<schema.TravelBooking | undefined> {
    const [row] = await db
      .update(schema.travelBookings)
      .set({ status })
      .where(eq(schema.travelBookings.id, id))
      .returning();
    return row || undefined;
  }
}
