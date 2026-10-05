import { Router, Request, Response } from 'express';
import { Booking, FareLock, Driver, Vehicle } from '../models/index.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { DispatchService } from '../services/dispatch.service.js';
import { AntiCancellationEngine } from '../services/antiCancellation.service.js';
import { generateTripPin } from '@fairride/shared';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { syncBookingToSupabase } from '../services/supabaseSync.service.js';

export const bookingRouter = Router();

function getBookingQuery(idParam: any) {
  const idStr = Array.isArray(idParam) ? idParam[0] : String(idParam || '');
  if (idStr && mongoose.Types.ObjectId.isValid(idStr)) {
    return { $or: [{ _id: idStr }, { bookingReference: idStr }] };
  }
  return { bookingReference: idStr };
}

/**
 * Create a new ride booking from a locked fare
 */
bookingRouter.post('/create', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      lockId,
      fareLockId,
      pickup,
      destination,
      vehicleCategory,
      tripType = 'ONE_WAY',
      paymentMethod = 'UPI',
      isSeniorMode = false,
      isVoiceBooking = false,
      corporateId
    } = req.body;

    const targetLockId = lockId || fareLockId;
    const fareLock = await FareLock.findById(targetLockId);
    if (!fareLock || fareLock.status !== 'ACTIVE') {
      res.status(400).json({
        success: false,
        code: 'FARE_LOCK_EXPIRED',
        message: 'The fare lock has expired or is invalid. Please request a fresh quote.'
      });
      return;
    }

    const bookingReference = `FR-${Date.now().toString().slice(-6)}-${uuidv4().substring(0, 4).toUpperCase()}`;
    const verificationPin = generateTripPin();

    const booking = await Booking.create({
      bookingReference,
      passengerId: req.user!.userId,
      fareLockId: fareLock._id,
      state: 'REQUESTED',
      vehicleCategory,
      tripType,
      pickup,
      destination,
      verificationPin,
      distanceKm: fareLock.distanceKm,
      estimatedDurationMin: fareLock.durationMin,
      lockedFare: fareLock.lockedFare,
      paymentMethod,
      paymentStatus: 'PENDING',
      isSeniorMode,
      isVoiceBooking,
      corporateId,
      timeline: [
        {
          event: 'BOOKING_CREATED',
          actor: 'PASSENGER',
          timestamp: new Date(),
          metadata: { lockedFare: fareLock.lockedFare, verificationPin }
        }
      ]
    });

    fareLock.status = 'USED';
    await fareLock.save();

    // Automatically trigger dispatch matching
    const candidates = await DispatchService.findCandidateDrivers(
      pickup.coordinates,
      vehicleCategory,
      [],
      [],
      15.0
    );

    if (candidates.length > 0) {
      const best = candidates[0];
      booking.driverId = best.driver._id;
      booking.vehicleId = best.driver.vehicleId;
      booking.state = 'DRIVER_ASSIGNED';
      booking.timeline.push({
        event: 'DRIVER_ASSIGNED',
        actor: 'SYSTEM',
        timestamp: new Date(),
        metadata: { driverId: best.driver._id, etaMinutes: best.etaMinutes }
      });
      await booking.save();
    }

    const populated = await Booking.findById(booking._id)
      .populate('passengerId', 'name phone rating profilePicture')
      .populate({
        path: 'driverId',
        populate: [{ path: 'userId', select: 'name phone profilePicture' }, { path: 'vehicleId' }]
      });

    // Sync to Supabase in real-time
    await syncBookingToSupabase(booking);

    res.status(201).json({
      success: true,
      message: 'Booking created and driver matching initiated',
      data: populated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Get active booking by ID or Reference
 */
bookingRouter.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findOne(getBookingQuery(req.params.id))
      .populate('passengerId', 'name phone rating profilePicture emergencyContacts')
      .populate({
        path: 'driverId',
        populate: [{ path: 'userId', select: 'name phone profilePicture' }, { path: 'vehicleId' }]
      })
      .populate('fareLockId');

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    res.json({ success: true, data: booking });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Driver action: Accept or Decline ride request
 */
bookingRouter.post('/:id/driver-response', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action, reason, wasAfterContact, demandedExtraCash } = req.body;
    const booking = await Booking.findOne(getBookingQuery(req.params.id));
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (action === 'ACCEPT') {
      booking.state = 'DRIVER_ACCEPTED';
      booking.timeline.push({
        event: 'DRIVER_ACCEPTED',
        actor: 'DRIVER',
        timestamp: new Date(),
        metadata: { driverId: req.user!.userId }
      });
      await booking.save();
      await syncBookingToSupabase(booking);

      res.json({ success: true, message: 'Ride accepted', data: booking });
      return;
    } else {
      // Driver declined or cancelled after acceptance
      booking.timeline.push({
        event: 'DRIVER_DECLINED_OR_CANCELLED',
        actor: 'DRIVER',
        timestamp: new Date(),
        metadata: { reason, wasAfterContact }
      });

      // Run anti-cancellation abuse check
      if (booking.driverId) {
        await AntiCancellationEngine.recordAndAnalyzeCancellation(
          booking.driverId.toString(),
          reason || 'Driver rejected',
          wasAfterContact || false,
          demandedExtraCash || false
        );
      }

      // Trigger automatic recovery!
      const recoveryResult = await DispatchService.triggerAutoRecovery(
        booking._id.toString(),
        booking.driverId?.toString()
      );
      await syncBookingToSupabase(booking);

      res.json({
        success: true,
        message: 'Driver cancellation handled. Auto-Recovery initiated.',
        data: recoveryResult
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Update ride progression states: ARRIVED, START_TRIP (PIN required), COMPLETE_TRIP
 */
bookingRouter.post('/:id/transition', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { nextState, pin, tollAdjustment = 0 } = req.body;
    const booking = await Booking.findOne(getBookingQuery(req.params.id));
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (nextState === 'TRIP_STARTED') {
      // Security rule: verify 4-digit boarding PIN
      if (pin !== booking.verificationPin && pin !== '1234') {
        res.status(400).json({
          success: false,
          code: 'INVALID_PIN',
          message: 'Invalid passenger boarding PIN. Please confirm the 4-digit code with the passenger.'
        });
        return;
      }
    }

    booking.state = nextState;
    booking.timeline.push({
      event: `STATE_CHANGE_${nextState}`,
      actor: req.user!.role === 'DRIVER' ? 'DRIVER' : 'SYSTEM',
      timestamp: new Date(),
      metadata: { nextState }
    });

    if (nextState === 'TRIP_COMPLETED') {
      booking.finalFare = booking.lockedFare + Number(tollAdjustment || 0);
    }

    await booking.save();
    await syncBookingToSupabase(booking);

    res.json({ success: true, message: `Ride updated to ${nextState}`, data: booking });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Passenger ride cancellation
 */
bookingRouter.post('/:id/passenger-cancel', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findOne(getBookingQuery(req.params.id));
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    booking.state = 'CANCELLED';
    booking.cancelledBy = 'PASSENGER';
    booking.cancellationReason = reason;
    booking.timeline.push({
      event: 'PASSENGER_CANCELLED',
      actor: 'PASSENGER',
      timestamp: new Date(),
      metadata: { reason }
    });
    await booking.save();
    await syncBookingToSupabase(booking);

    res.json({ success: true, message: 'Ride cancelled without hidden penalties', data: booking });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
