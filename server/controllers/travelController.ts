import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertTravelBookingSchema } from '@shared/schema';
import { type AuthenticatedRequest } from '../auth';

export class TravelController {
  static async getMyBookings(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const bookings = await storage.getTravelBookingsByUser(req.user.id);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch bookings' });
    }
  }

  static async createBooking(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const data = insertTravelBookingSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const booking = await storage.createTravelBooking(data);
      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ message: 'Invalid booking data' });
    }
  }

  static async getAllBookings(req: Request, res: Response) {
    try {
      const bookings = await storage.getAllTravelBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch bookings' });
    }
  }

  static async updateBookingStatus(req: Request, res: Response) {
    try {
      const bookingId = parseInt(req.params.id);
      const { status } = req.body;
      if (isNaN(bookingId)) return res.status(400).json({ message: 'Invalid booking ID' });
      const updated = await storage.updateTravelBookingStatus(bookingId, status);
      if (!updated) return res.status(404).json({ message: 'Booking not found' });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update booking status' });
    }
  }
}
