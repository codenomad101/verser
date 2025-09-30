import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertMessageSchema } from '@shared/schema';
import { type AuthenticatedRequest } from '../auth';

export class ConversationController {
  static async getAllConversations(req: Request, res: Response) {
    try {
      const conversations = await storage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch conversations' });
    }
  }

  static async createConversation(req: AuthenticatedRequest, res: Response) {
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
  }

  static async getConversationMessages(req: Request, res: Response) {
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
  }

  static async createMessage(req: Request, res: Response) {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      const user = await storage.getUser(validatedData.userId);
      
      res.json({ ...message, user });
    } catch (error) {
      res.status(400).json({ message: 'Invalid message data' });
    }
  }

  static async getIncomingChatRequests(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const requests = await storage.getIncomingChatRequests(req.user.id);
      res.json(requests.filter(r => r.status === 'pending'));
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch chat requests' });
    }
  }

  static async createChatRequest(req: AuthenticatedRequest, res: Response) {
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
  }

  static async acceptChatRequest(req: AuthenticatedRequest, res: Response) {
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
  }

  static async rejectChatRequest(req: AuthenticatedRequest, res: Response) {
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
  }
}
