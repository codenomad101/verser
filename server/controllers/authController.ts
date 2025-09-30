import { Request, Response } from 'express';
import { storage } from '../storage';
import { loginSchema, registerSchema } from '@shared/schema';
import { generateToken, hashPassword, comparePassword, type AuthenticatedRequest } from '../auth';

export class AuthController {
  static async register(req: Request, res: Response) {
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
  }

  static async login(req: Request, res: Response) {
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
  }

  static async logout(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user) {
        await storage.updateUserStatus(req.user.id, 'offline');
        await storage.updateUserSettings(req.user.id, { lastSeen: new Date() });
      }
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Logout failed' });
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response) {
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
  }
}
