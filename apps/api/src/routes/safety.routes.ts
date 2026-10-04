import { Router, Request, Response } from 'express';
import { SafetyService } from '../services/safety.service.js';
import { SafetyIncident, Booking, User } from '../models/index.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { syncSafetyIncidentToSupabase } from '../services/supabaseSync.service.js';

export const safetyRouter = Router();

/**
 * Trigger Emergency SOS
 */
safetyRouter.post('/sos', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bookingId, coordinates, address, audioSnapshot } = req.body;
    if (!bookingId || !coordinates) {
      res.status(400).json({ success: false, message: 'bookingId and coordinates required for SOS' });
      return;
    }

    const incident = await SafetyService.triggerSos(bookingId, coordinates, address, audioSnapshot);
    syncSafetyIncidentToSupabase(incident).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Emergency SOS activated. Safety Operations team and emergency contacts alerted.',
      data: incident
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Route Guardian: Ping live coordinate and evaluate deviation
 */
safetyRouter.post('/route-deviation-check', authenticate, async (req: Request, res: Response) => {
  try {
    const { bookingId, currentGps, nearestExpectedGps } = req.body;
    if (!bookingId || !currentGps || !nearestExpectedGps) {
      res.status(400).json({ success: false, message: 'bookingId, currentGps, and nearestExpectedGps required' });
      return;
    }

    const result = await SafetyService.evaluateRouteDeviation(bookingId, currentGps, nearestExpectedGps);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Passenger response to route deviation prompt (I'M SAFE / NEED HELP / EMERGENCY)
 */
safetyRouter.post('/deviation-response', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bookingId, responseType } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    booking.timeline.push({
      event: `ROUTE_DEVIATION_RESPONSE_${responseType}`,
      actor: 'PASSENGER',
      timestamp: new Date(),
      metadata: { responseType }
    });
    await booking.save();

    if (responseType === 'EMERGENCY' || responseType === 'NEED_HELP') {
      await SafetyService.triggerSos(
        bookingId,
        booking.pickup.coordinates,
        'Passenger requested immediate help following route departure alert'
      );
    }

    res.json({
      success: true,
      message: responseType === 'IM_SAFE' ? 'Status acknowledged as Safe' : 'Safety team alerted',
      data: { status: responseType }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * List live safety incidents for Safety Operations Console
 */
safetyRouter.get('/incidents', authenticate, async (req: Request, res: Response) => {
  try {
    const incidents = await SafetyIncident.find()
      .populate('passengerId', 'name phone email profilePicture emergencyContacts')
      .populate({
        path: 'driverId',
        populate: [{ path: 'userId', select: 'name phone' }, { path: 'vehicleId' }]
      })
      .populate('bookingId')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: incidents });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Update / Resolve Safety Incident
 */
safetyRouter.patch('/incidents/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, note, resolutionSummary } = req.body;
    const incident = await SafetyIncident.findById(req.params.id);
    if (!incident) {
      res.status(404).json({ success: false, message: 'Incident not found' });
      return;
    }

    if (status) incident.status = status;
    if (resolutionSummary) incident.resolutionSummary = resolutionSummary;
    if (note) {
      incident.notes.push({
        author: req.user!.name || 'Safety Operator',
        text: note,
        timestamp: new Date()
      });
    }

    if (status === 'RESOLVED' || status === 'FALSE_ALARM') {
      incident.resolvedBy = req.user!.userId as any;
      incident.resolvedAt = new Date();
    }

    await incident.save();
    res.json({ success: true, message: 'Incident updated', data: incident });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
