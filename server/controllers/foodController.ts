import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertFoodOrderSchema } from '@shared/schema';
import { type AuthenticatedRequest } from '../auth';

export class FoodController {
  static async getMyOrders(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const orders = await storage.getFoodOrdersByUser(req.user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  }

  static async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const data = insertFoodOrderSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const order = await storage.createFoodOrder(data);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: 'Invalid order data' });
    }
  }

  static async getAllOrders(req: Request, res: Response) {
    try {
      const orders = await storage.getAllFoodOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  }

  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      if (isNaN(orderId)) return res.status(400).json({ message: 'Invalid order ID' });
      const updated = await storage.updateFoodOrderStatus(orderId, status);
      if (!updated) return res.status(404).json({ message: 'Order not found' });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update order status' });
    }
  }
}
