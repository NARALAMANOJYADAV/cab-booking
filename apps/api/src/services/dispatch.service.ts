import { Driver, Booking, Vehicle } from '../models/index.js';
import { calculateHaversineDistanceKm, estimateDurationMinutes } from '@fairride/shared';
import { VehicleCategory } from '@fairride/types';

export class DispatchService {
  /**
   * Finds and ranks eligible candidate drivers within radius
   */
  static async findCandidateDrivers(
    pickupCoords: [number, number],
    category: VehicleCategory,
    excludedDriverIds: string[] = [],
    specialRequirements: string[] = [],
    maxRadiusKm = 15.0
  ) {
    // 1. Fetch available online verified drivers
    const drivers = await Driver.find({
      isOnline: true,
      isBusy: false,
      verificationStatus: 'VERIFIED',
      _id: { $nin: excludedDriverIds }
    }).populate('vehicleId').populate('userId');

    const candidates: any[] = [];

    for (const d of drivers) {
      const coords = d.currentLocation?.coordinates;
      if (!coords || coords.length !== 2) continue;

      const distKm = calculateHaversineDistanceKm(coords, pickupCoords);
      if (distKm > maxRadiusKm) continue;

      const vehicle: any = d.vehicleId;
      // Category compatibility check
      if (vehicle && vehicle.category !== category) {
        continue;
      }

      // Special mobility check
      if (specialRequirements.includes('WHEELCHAIR') && vehicle && !vehicle.isWheelchairAccessible) {
        continue;
      }

      const etaMin = estimateDurationMinutes(distKm);

      // Score components
      const etaScore = Math.max(0.1, 1.0 - (etaMin / 25.0));
      const distScore = Math.max(0.1, 1.0 - (distKm / maxRadiusKm));
      const reliabilityScore = ((d.rating || 4.8) / 5.0) * (1 - (d.cancellationRate || 2) / 100);
      const workloadScore = (d.hoursOnlineToday || 2) < 8 ? 1.0 : 0.4;
      const fairnessScore = Math.min(1.0, 0.5 + ((d.completedTripsCount || 0) < 5 ? 0.3 : 0));

      const totalScore =
        etaScore * 0.30 +
        distScore * 0.20 +
        reliabilityScore * 0.15 +
        1.0 * 0.15 + // vehicle compatibility confirmed
        workloadScore * 0.10 +
        fairnessScore * 0.10;

      candidates.push({
        driver: d,
        distanceKm: distKm,
        etaMinutes: etaMin,
        score: totalScore
      });
    }

    // Sort descending by match score
    candidates.sort((a, b) => b.score - a.score);
    return candidates;
  }

  /**
   * Core Auto-Recovery Engine:
   * When a driver cancels, immediately search next best driver and reassign
   * without passenger starting over or paying penalty.
   */
  static async triggerAutoRecovery(bookingId: string, cancellingDriverId?: string) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error('Booking not found for recovery');

    // Mark previous driver if provided
    if (cancellingDriverId) {
      booking.previousDriverIds.push(cancellingDriverId as any);
    }
    booking.state = 'RECOVERY';
    booking.recoveryAttempts += 1;
    booking.isRecovered = true;
    booking.timeline.push({
      event: 'AUTO_RECOVERY_INITIATED',
      actor: 'SYSTEM',
      timestamp: new Date(),
      metadata: {
        reason: 'Driver cancelled ride. Searching replacement driver immediately with zero penalty.',
        attempt: booking.recoveryAttempts
      }
    });
    await booking.save();

    // Search eligible candidates excluding already cancelled drivers
    const candidates = await this.findCandidateDrivers(
      booking.pickup.coordinates,
      booking.vehicleCategory,
      booking.previousDriverIds.map((id) => id.toString()),
      [],
      15.0
    );

    if (candidates.length > 0) {
      const bestCandidate = candidates[0];
      booking.driverId = bestCandidate.driver._id;
      booking.vehicleId = bestCandidate.driver.vehicleId;
      booking.state = 'DRIVER_ASSIGNED';
      booking.timeline.push({
        event: 'DRIVER_ASSIGNED_RECOVERY',
        actor: 'SYSTEM',
        timestamp: new Date(),
        metadata: {
          driverId: bestCandidate.driver._id,
          etaMinutes: bestCandidate.etaMinutes,
          distanceKm: bestCandidate.distanceKm
        }
      });
      await booking.save();

      return {
        recovered: true,
        booking,
        driver: bestCandidate.driver,
        etaMinutes: bestCandidate.etaMinutes
      };
    } else {
      // No replacement immediately available
      booking.state = 'RECOVERY';
      booking.timeline.push({
        event: 'RECOVERY_NO_DRIVERS_AVAILABLE',
        actor: 'SYSTEM',
        timestamp: new Date(),
        metadata: { message: 'All nearby drivers currently engaged. Retry or alternative transit options suggested.' }
      });
      await booking.save();

      return {
        recovered: false,
        booking,
        message: 'Unfortunately, all nearby vehicles are currently occupied.'
      };
    }
  }
}
