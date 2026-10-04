import { Router, Request, Response } from 'express';
import { Driver, Booking, Vehicle } from '../models/index.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { calculateDriverNetEarnings } from '@fairride/shared';

export const driverRouter = Router();

/**
 * Get or initialize Driver profile
 */
driverRouter.get('/profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let driver = await Driver.findOne({ userId: req.user!.userId })
      .populate('userId', 'name phone email profilePicture')
      .populate('vehicleId');

    if (!driver && req.user!.role === 'DRIVER') {
      driver = await Driver.create({
        userId: req.user!.userId,
        verificationStatus: 'VERIFIED', // Default verified for demo drivers
        isOnline: true,
        currentLocation: {
          type: 'Point',
          coordinates: [78.3808, 17.4435],
          updatedAt: new Date()
        }
      });
      driver = await Driver.findById(driver._id).populate('userId').populate('vehicleId');
    }

    res.json({ success: true, data: driver });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Toggle Online/Offline status
 */
driverRouter.post('/toggle-status', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { isOnline } = req.body;
    const driver = await Driver.findOne({ userId: req.user!.userId });
    if (!driver) {
      res.status(404).json({ success: false, message: 'Driver profile not found' });
      return;
    }

    driver.isOnline = isOnline;
    await driver.save();

    res.json({
      success: true,
      message: `Driver status switched to ${isOnline ? 'ONLINE' : 'OFFLINE'}`,
      data: { isOnline: driver.isOnline }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Update Driver live GPS Location
 */
driverRouter.post('/location', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { coordinates, bearing } = req.body;
    if (!coordinates || coordinates.length !== 2) {
      res.status(400).json({ success: false, message: 'Coordinates [lng, lat] required' });
      return;
    }

    const driver = await Driver.findOne({ userId: req.user!.userId });
    if (!driver) {
      res.status(404).json({ success: false, message: 'Driver not found' });
      return;
    }

    driver.currentLocation = {
      type: 'Point',
      coordinates,
      updatedAt: new Date(),
      bearing: bearing || 0
    };
    await driver.save();

    res.json({ success: true, data: driver.currentLocation });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Driver Net Earnings preview calculation for any trip
 */
driverRouter.post('/earnings-preview', authenticate, (req: Request, res: Response) => {
  try {
    const { passengerFare, category = 'SEDAN', distanceKm = 10, durationMin = 25, paymentMethod = 'UPI', toll = 0 } = req.body;
    const preview = calculateDriverNetEarnings(passengerFare, category, distanceKm, durationMin, paymentMethod, toll);
    res.json({ success: true, data: preview });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Get active ride assigned to driver
 */
driverRouter.get('/active-ride', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const driver = await Driver.findOne({ userId: req.user!.userId });
    if (!driver) {
      res.status(404).json({ success: false, message: 'Driver not found' });
      return;
    }

    const activeRide = await Booking.findOne({
      driverId: driver._id,
      state: {
        $in: [
          'DRIVER_ASSIGNED',
          'DRIVER_ACCEPTED',
          'DRIVER_ARRIVING',
          'DRIVER_ARRIVED',
          'TRIP_STARTED',
          'TRIP_IN_PROGRESS'
        ]
      }
    }).populate('passengerId', 'name phone rating profilePicture');

    res.json({ success: true, data: activeRide });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Upload onboarding documents
 */
driverRouter.post('/documents', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { documentType, documentNumber, documentUrl } = req.body;
    const driver = await Driver.findOne({ userId: req.user!.userId });
    if (!driver) {
      res.status(404).json({ success: false, message: 'Driver profile not found' });
      return;
    }

    driver.documents.push({
      documentType,
      documentNumber,
      documentUrl: documentUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300',
      status: 'VERIFIED', // Auto-verified in demo mode
      verifiedAt: new Date()
    });
    driver.verificationStatus = 'VERIFIED';
    await driver.save();

    res.json({ success: true, message: 'Document verified and uploaded', data: driver.documents });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
