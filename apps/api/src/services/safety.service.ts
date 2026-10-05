import { v4 as uuidv4 } from 'uuid';
import { SafetyIncident, Booking, User } from '../models/index.js';
import { calculateDistanceMeters } from '@fairride/shared';
import { ROUTE_DEVIATION_TOLERANCE_METERS } from '@fairride/constants';
import { SafetyPriority } from '@fairride/types';
import { syncSafetyIncidentToSupabase } from './supabaseSync.service.js';

export class SafetyService {
  /**
   * Triggers an Emergency SOS incident
   */
  static async triggerSos(
    bookingId: string,
    currentLocation: [number, number],
    address = 'Live GPS Coordinates',
    audioSnapshotUrl?: string
  ) {
    const booking = await Booking.findById(bookingId).populate('passengerId').populate('driverId');
    if (!booking) throw new Error('Booking not found');

    const incidentNumber = `SOS-${Date.now().toString().slice(-6)}-${uuidv4().substring(0, 4).toUpperCase()}`;

    const incident = await SafetyIncident.create({
      incidentNumber,
      bookingId: booking._id,
      passengerId: booking.passengerId._id,
      driverId: booking.driverId?._id,
      priority: 'CRITICAL',
      triggerType: 'SOS_BUTTON',
      currentLocation: {
        type: 'Point',
        coordinates: currentLocation
      },
      addressAtIncident: address,
      audioSnapshotUrl,
      notes: [
        {
          author: 'SYSTEM',
          text: `Emergency SOS triggered by passenger ${(booking.passengerId as any).name}. Live location locked. Safety Operations notified.`,
          timestamp: new Date()
        }
      ],
      status: 'OPEN'
    });

    // Record in booking timeline
    booking.timeline.push({
      event: 'EMERGENCY_SOS_TRIGGERED',
      actor: 'PASSENGER',
      timestamp: new Date(),
      metadata: { incidentNumber, currentLocation, priority: 'CRITICAL' }
    });
    await booking.save();

    // Sync to Supabase
    syncSafetyIncidentToSupabase(incident).catch(() => {});

    return incident;
  }

  /**
   * Route Guardian: Detects significant deviation from expected route
   */
  static async evaluateRouteDeviation(
    bookingId: string,
    currentGps: [number, number],
    nearestExpectedGps: [number, number]
  ) {
    const deviationMeters = calculateDistanceMeters(currentGps, nearestExpectedGps);
    const booking = await Booking.findById(bookingId);
    if (!booking) return null;

    // Append to GPS breadcrumbs
    booking.gpsBreadcrumbs.push({
      coordinates: currentGps,
      timestamp: new Date()
    });

    const isDeviated = deviationMeters > ROUTE_DEVIATION_TOLERANCE_METERS;

    if (isDeviated) {
      booking.routeDeviations.push({
        coordinates: currentGps,
        distanceMeters: deviationMeters,
        timestamp: new Date(),
        status: 'ALERT_SENT'
      });

      // If deviation is acute (> 800m), escalate to Safety Incident
      if (deviationMeters > 800) {
        const priority: SafetyPriority = deviationMeters > 1500 ? 'HIGH' : 'MEDIUM';
        const incident = await SafetyIncident.create({
          incidentNumber: `DEV-${Date.now().toString().slice(-6)}`,
          bookingId: booking._id,
          passengerId: booking.passengerId,
          driverId: booking.driverId,
          priority,
          triggerType: 'ROUTE_DEVIATION',
          currentLocation: {
            type: 'Point',
            coordinates: currentGps
          },
          addressAtIncident: `Significant route detour: ${deviationMeters}m off corridor`,
          notes: [
            {
              author: 'ROUTE_GUARDIAN',
              text: `Detected ${deviationMeters}m departure from calculated corridor. Awaiting passenger status acknowledgment.`,
              timestamp: new Date()
            }
          ],
          status: 'OPEN'
        });

        // Sync to Supabase
        syncSafetyIncidentToSupabase(incident).catch(() => {});
      }
    }

    await booking.save();

    return {
      deviationMeters,
      isDeviated,
      toleranceThreshold: ROUTE_DEVIATION_TOLERANCE_METERS,
      promptOptions: isDeviated ? ["I'M SAFE", 'NEED HELP', 'EMERGENCY'] : []
    };
  }
}

