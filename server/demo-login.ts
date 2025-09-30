// Simple demo login handler
import { Express } from "express";
import { generateToken } from "./auth";

export function setupDemoLogin(app: Express) {
  app.post('/api/demo-login', (req, res) => {
    // Demo user data
    const demoUser = {
      id: 1,
      username: 'alex_johnson',
      email: 'alex@example.com',
      role: 'admin' as const,
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
    
    // Generate token
    const token = generateToken(demoUser.id, demoUser.username, demoUser.email, demoUser.role);
    
    res.status(200).json({
      user: demoUser,
      token
    });
  });
}