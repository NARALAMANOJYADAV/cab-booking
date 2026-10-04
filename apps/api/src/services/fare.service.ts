import { v4 as uuidv4 } from 'uuid';
import { FareLock, FareAudit, Booking } from '../models/index.js';
import { calculateTransparentFare, calculateHaversineDistanceKm, estimateDurationMinutes } from '@fairride/shared';
import { VehicleCategory, TripType, FareBreakdown } from '@fairride/types';

export class FareService {
  /**
   * Generates a detailed fare quote for a requested trip
   */
  static generateQuote(
    pickupCoords: [number, number],
    destCoords: [number, number],
    category: VehicleCategory = 'SEDAN',
    tripType: TripType = 'ONE_WAY',
    surgeMultiplier = 1.0,
    toll = 0
  ) {
    const distanceKm = calculateHaversineDistanceKm(pickupCoords, destCoords);
    const durationMin = estimateDurationMinutes(distanceKm);
    const breakdown = calculateTransparentFare(category, distanceKm, durationMin, tripType, surgeMultiplier, toll);

    return {
      quoteId: `quote_${uuidv4().substring(0, 8)}`,
      vehicleCategory: category,
      tripType,
      distanceKm,
      durationMin,
      breakdown,
      surgeMultiplier,
      validForMinutes: 10
    };
  }

  /**
   * Locks the fare for the passenger (FARE LOCK SYSTEM)
   */
  static async lockFare(
    passengerId: string,
    quote: {
      quoteId: string;
      vehicleCategory: VehicleCategory;
      distanceKm: number;
      durationMin: number;
      breakdown: FareBreakdown;
    }
  ) {
    const lockedAt = new Date();
    const expiresAt = new Date(lockedAt.getTime() + 15 * 60 * 1000); // 15 mins lock guarantee

    const fareLock = await FareLock.create({
      quoteId: quote.quoteId,
      passengerId,
      vehicleCategory: quote.vehicleCategory,
      distanceKm: quote.distanceKm,
      durationMin: quote.durationMin,
      breakdown: quote.breakdown,
      lockedFare: quote.breakdown.totalFare,
      lockedAt,
      expiresAt,
      status: 'ACTIVE'
    });

    return fareLock;
  }

  /**
   * Generate post-trip Fare Audit record
   */
  static async auditFare(
    bookingId: string,
    finalFareOverride?: number,
    tollAdjustment = 0
  ) {
    const booking = await Booking.findById(bookingId).populate('fareLockId');
    if (!booking) throw new Error('Booking not found for Fare Audit');

    const fareLock: any = booking.fareLockId;
    const originalLockedFare = fareLock ? fareLock.lockedFare : booking.lockedFare;
    
    // Check if legitimate adjustment occurred
    const adjustments: any[] = [];
    if (tollAdjustment > 0) {
      adjustments.push({
        reason: 'Highway Toll Fee adjustment',
        amount: tollAdjustment,
        category: 'TOLL_ADJUSTMENT',
        approvedBySystem: true
      });
    }

    const calculatedFinalFare = finalFareOverride || (originalLockedFare + tollAdjustment);
    const difference = calculatedFinalFare - originalLockedFare;

    const receiptRef = `FR-REC-${booking.bookingReference.substring(0, 8)}-${Date.now().toString().slice(-4)}`;

    const fareAudit = await FareAudit.findOneAndUpdate(
      { bookingId: booking._id },
      {
        bookingId: booking._id,
        passengerId: booking.passengerId,
        driverId: booking.driverId,
        originalLockedFare,
        finalFare: calculatedFinalFare,
        difference,
        breakdown: fareLock ? fareLock.breakdown : {
          baseFare: 80,
          distanceCharge: booking.distanceKm * 18,
          timeComponent: booking.estimatedDurationMin * 2,
          toll: tollAdjustment,
          platformFee: Math.round(originalLockedFare * 0.1),
          tax: Math.round(originalLockedFare * 0.05),
          totalFare: calculatedFinalFare,
          currency: 'INR'
        },
        adjustments,
        status: difference === 0 ? 'VERIFIED_MATCH' : 'ADJUSTMENT_APPROVED',
        receiptReference: receiptRef
      },
      { upsert: true, new: true }
    );

    // Update booking final fare
    booking.finalFare = calculatedFinalFare;
    await booking.save();

    return fareAudit;
  }
}
