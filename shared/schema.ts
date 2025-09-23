import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  status: text("status").notNull().default("offline"), // online, offline, away
  bio: text("bio"),
  about: text("about"),
  lastSeen: timestamp("last_seen").defaultNow(),
  showLastSeen: boolean("show_last_seen").notNull().default(true),
  showOnlineStatus: boolean("show_online_status").notNull().default(true),
  isVerified: boolean("is_verified").notNull().default(false),
  followersCount: integer("followers_count").notNull().default(0),
  followingCount: integer("following_count").notNull().default(0),
  location: text("location"),
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().default("group"), // group, direct
  avatar: text("avatar"),
  description: text("description"),
  memberCount: integer("member_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("text"), // text, image, file
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull().default("fas fa-users"),
  color: text("color").notNull().default("blue"),
  memberCount: integer("member_count").notNull().default(0),
  onlineCount: integer("online_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  communityId: integer("community_id"),
  title: text("title"),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  type: text("type").default("text"), // text, image, video, short
  tags: text("tags").array(),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  shares: integer("shares").notNull().default(0),
  reposts: integer("reposts").notNull().default(0),
  originalPostId: integer("original_post_id"), // For reposts
  isRepost: boolean("is_repost").notNull().default(false),
  isTrending: boolean("is_trending").notNull().default(false),
  sentiment: text("sentiment").default("neutral"), // positive, negative, neutral
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Food orders for the food delivery section
export const foodOrders = pgTable("food_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  items: jsonb("items").notNull(), // [{ id, name, price, quantity }]
  total: integer("total").notNull().default(0), // store in smallest currency unit or plain integer
  status: text("status").notNull().default("pending"), // pending, preparing, delivered, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Travel bookings for buses, trains, and hotels
export const travelBookings = pgTable("travel_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // bus, train, hotel
  from: text("from"),
  to: text("to"),
  location: text("location"),
  travelDate: timestamp("travel_date"),
  details: jsonb("details"), // flexible extra info per type
  price: integer("price").notNull().default(0),
  status: text("status").notNull().default("pending"), // pending, confirmed, cancelled, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New table for trending topics (Weibo-inspired)
export const trendingTopics = pgTable("trending_topics", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull().unique(),
  postCount: integer("post_count").notNull().default(0),
  isHot: boolean("is_hot").notNull().default(false),
  category: text("category").default("general"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User follows table
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull(),
  followingId: integer("following_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Post likes table
export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  postId: integer("post_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  avatar: true,
  bio: true,
  about: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = insertUserSchema.extend({
  password: z.string().min(6),
});

export const updateUserSettingsSchema = createInsertSchema(users).pick({
  username: true,
  bio: true,
  about: true,
  location: true,
  website: true,
  showLastSeen: true,
  showOnlineStatus: true,
  avatar: true,
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  name: true,
  type: true,
  avatar: true,
  description: true,
  memberCount: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  userId: true,
  content: true,
  type: true,
});

export const insertCommunitySchema = createInsertSchema(communities).pick({
  name: true,
  description: true,
  icon: true,
  color: true,
  memberCount: true,
  onlineCount: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  userId: true,
  communityId: true,
  title: true,
  content: true,
  imageUrl: true,
  tags: true,
});

export const insertFoodOrderSchema = createInsertSchema(foodOrders).pick({
  userId: true,
  items: true,
  total: true,
});

export const insertTravelBookingSchema = createInsertSchema(travelBookings).pick({
  userId: true,
  type: true,
  from: true,
  to: true,
  location: true,
  travelDate: true,
  details: true,
  price: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Community = typeof communities.$inferSelect;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type FoodOrder = typeof foodOrders.$inferSelect;
export type InsertFoodOrder = z.infer<typeof insertFoodOrderSchema>;
export type TravelBooking = typeof travelBookings.$inferSelect;
export type InsertTravelBooking = z.infer<typeof insertTravelBookingSchema>;
