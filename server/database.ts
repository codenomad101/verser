import mongoose from 'mongoose';
import { Schema, model, Document } from 'mongoose';

// MongoDB connection
export async function connectToMongoDB() {
  try {
    const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/connecthub';
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// User Schema
interface IUser extends Document {
  username: string;
  email: string;
  avatar?: string;
  status: string;
  bio?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String, default: null },
  status: { type: String, default: 'offline' },
  bio: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

export const UserModel = model<IUser>('User', userSchema);

// Conversation Schema
interface IConversation extends Document {
  name: string;
  type: string;
  avatar?: string;
  description?: string;
  memberCount: number;
  createdAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  name: { type: String, required: true },
  type: { type: String, default: 'group' },
  avatar: { type: String, default: null },
  description: { type: String, default: null },
  memberCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const ConversationModel = model<IConversation>('Conversation', conversationSchema);

// Message Schema
interface IMessage extends Document {
  conversationId: number;
  userId: number;
  content: string;
  type: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  conversationId: { type: Number, required: true },
  userId: { type: Number, required: true },
  content: { type: String, required: true },
  type: { type: String, default: 'text' },
  createdAt: { type: Date, default: Date.now }
});

export const MessageModel = model<IMessage>('Message', messageSchema);

// Community Schema
interface ICommunity extends Document {
  name: string;
  description?: string;
  icon: string;
  color: string;
  memberCount: number;
  onlineCount: number;
  createdAt: Date;
}

const communitySchema = new Schema<ICommunity>({
  name: { type: String, required: true },
  description: { type: String, default: null },
  icon: { type: String, default: 'fas fa-users' },
  color: { type: String, default: 'blue' },
  memberCount: { type: Number, default: 0 },
  onlineCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const CommunityModel = model<ICommunity>('Community', communitySchema);

// Post Schema
interface IPost extends Document {
  userId: number;
  communityId?: number;
  title?: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
  likes: number;
  comments: number;
  shares: number;
  isTrending: boolean;
  createdAt: Date;
}

const postSchema = new Schema<IPost>({
  userId: { type: Number, required: true },
  communityId: { type: Number, default: null },
  title: { type: String, default: null },
  content: { type: String, required: true },
  imageUrl: { type: String, default: null },
  tags: { type: [String], default: [] },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  isTrending: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const PostModel = model<IPost>('Post', postSchema);

// Initialize database with sample data
export async function initializeDatabase() {
  try {
    // Check if data already exists
    const userCount = await UserModel.countDocuments();
    if (userCount > 0) {
      console.log('Database already initialized');
      return;
    }

    console.log('Initializing database with sample data...');

    // Create sample users
    const users = await UserModel.insertMany([
      { username: "alex_johnson", email: "alex@example.com", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face", bio: "Product Designer", status: "online" },
      { username: "sarah_wilson", email: "sarah@example.com", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face", bio: "UX Designer", status: "offline" },
      { username: "mike_johnson", email: "mike@example.com", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face", bio: "Frontend Developer", status: "online" },
      { username: "emma_rodriguez", email: "emma@example.com", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face", bio: "Full Stack Developer", status: "offline" },
      { username: "david_chen", email: "david@example.com", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", bio: "Backend Engineer", status: "online" },
    ]);

    // Create sample conversations
    const conversations = await ConversationModel.insertMany([
      { name: "Design Team", type: "group", avatar: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&h=100&fit=crop", description: "Design discussions", memberCount: 3 },
      { name: "Marketing Team", type: "group", avatar: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=100&h=100&fit=crop", description: "Marketing strategies", memberCount: 5 },
    ]);

    // Create sample messages
    await MessageModel.insertMany([
      { conversationId: 1, userId: 2, content: "The new mockups look great! I especially love the color scheme and the navigation flow.", type: "text" },
      { conversationId: 1, userId: 1, content: "Thanks! Yes, let's set up a meeting for this afternoon. I'll send a calendar invite.", type: "text" },
      { conversationId: 1, userId: 3, content: "Perfect! From a development perspective, the designs look very feasible.", type: "text" },
    ]);

    // Create sample communities
    const communities = await CommunityModel.insertMany([
      { name: "Web Developers", description: "A community for web developers", icon: "fas fa-code", color: "blue", memberCount: 2500, onlineCount: 45 },
      { name: "UI/UX Designers", description: "Design community", icon: "fas fa-palette", color: "purple", memberCount: 1800, onlineCount: 32 },
      { name: "Startup Founders", description: "Entrepreneurship discussions", icon: "fas fa-rocket", color: "green", memberCount: 987, onlineCount: 18 },
      { name: "Photography", description: "Photo sharing and tips", icon: "fas fa-camera", color: "yellow", memberCount: 3200, onlineCount: 67 },
      { name: "Digital Marketing", description: "Marketing strategies", icon: "fas fa-bullhorn", color: "red", memberCount: 1500, onlineCount: 28 },
    ]);

    // Create sample posts
    await PostModel.insertMany([
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
    ]);

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}