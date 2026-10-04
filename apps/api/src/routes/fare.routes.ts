import { Router, Request, Response } from 'express';
import { FareService } from '../services/fare.service.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { VehicleCategory } from '@fairride/types';
import { VEHICLE_CONFIGS } from '@fairride/constants';
import { FareLock, FareAudit } from '../models/index.js';

export const fareRouter = Router();

/**
 * Generate comprehensive quotes for all vehicle categories
 */
fareRouter.post('/quotes', (req: Request, res: Response) => {
  try {
    const { pickupCoordinates, destinationCoordinates, tripType = 'ONE_WAY', surgeMultiplier = 1.0, toll = 0 } = req.body;
    if (!pickupCoordinates || !destinationCoordinates) {
      res.status(400).json({ success: false, message: 'Pickup and destination coordinates are required' });
      return;
    }

    const categories: VehicleCategory[] = [
      'ECONOMY',
      'HATCHBACK',
      'SEDAN',
      'SUV',
      'PREMIUM',
      'EV',
      'SHARED',
      'ACCESSIBLE'
    ];

    const quotes = categories.map((cat) => {
      const quote = FareService.generateQuote(
        pickupCoordinates,
        destinationCoordinates,
        cat,
        tripType,
        surgeMultiplier,
        toll
      );
      const config = VEHICLE_CONFIGS[cat];
      const co2AvoidedKg = config.isZeroEmission
        ? Number((quote.distanceKm * 0.14).toFixed(2))
        : 0;

      return {
        ...quote,
        vehicleName: config.name,
        description: config.description,
        capacity: config.capacity,
        co2AvoidedKg
      };
    });

    res.json({
      success: true,
      data: {
        quotes,
        pickupCoordinates,
        destinationCoordinates
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Lock Fare (FARE LOCK SYSTEM)
 */
fareRouter.post('/lock', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { quote } = req.body;
    if (!quote || !quote.quoteId || !quote.breakdown) {
      res.status(400).json({ success: false, message: 'Valid quote object is required to lock fare' });
      return;
    }

    const fareLock = await FareService.lockFare(req.user!.userId, quote);
    res.status(201).json({
      success: true,
      message: 'Fare successfully locked with 15-minute guarantee.',
      data: fareLock
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Get Fare Audit for a completed trip
 */
fareRouter.get('/audit/:bookingId', authenticate, async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    let audit = await FareAudit.findOne({ bookingId }).populate('bookingId');
    if (!audit) {
      // Trigger dynamic generation if not yet generated
      audit = await FareService.auditFare(bookingId as string);
    }

    res.json({
      success: true,
      data: audit
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
