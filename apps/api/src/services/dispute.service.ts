import { v4 as uuidv4 } from 'uuid';
import { Dispute, Booking, FareLock, AuditLog } from '../models/index.js';
import { PaymentService } from './payment.service.js';
import { DisputeCategory } from '@fairride/types';
import { syncDisputeToSupabase, syncBookingToSupabase } from './supabaseSync.service.js';

export class DisputeService {
  /**
   * Files a dispute and automatically attaches the immutable evidence bundle
   */
  static async createDispute(
    bookingId: string,
    passengerId: string,
    category: DisputeCategory,
    description: string,
    demandedAmount?: number,
    passengerScreenshots?: string[]
  ) {
    const booking = await Booking.findById(bookingId).populate('fareLockId');
    if (!booking) throw new Error('Booking not found for dispute');

    const disputeNumber = `DISP-${Date.now().toString().slice(-6)}-${uuidv4().substring(0, 4).toUpperCase()}`;

    // Auto-assemble evidence bundle
    const fareLock: any = booking.fareLockId;
    const evidence = {
      lockedFare: fareLock ? fareLock.lockedFare : booking.lockedFare,
      actualFare: booking.finalFare || booking.lockedFare,
      bookingReference: booking.bookingReference,
      eventsTimeline: booking.timeline.map((t) => ({
        event: t.event,
        actor: t.actor,
        timestamp: t.timestamp
      })),
      gpsTrackPointsCount: booking.gpsBreadcrumbs.length,
      routeDeviationFlagged: booking.routeDeviations.length > 0
    };

    const dispute = await Dispute.create({
      disputeNumber,
      bookingId: booking._id,
      passengerId,
      driverId: booking.driverId,
      category,
      description,
      demandedAmount,
      evidence,
      passengerScreenshots: passengerScreenshots || [],
      status: 'SUBMITTED'
    });

    booking.state = 'DISPUTED';
    booking.timeline.push({
      event: 'DISPUTE_FILED',
      actor: 'PASSENGER',
      timestamp: new Date(),
      metadata: { disputeNumber, category }
    });
    await booking.save();

    // Sync to Supabase in background
    syncDisputeToSupabase(dispute).catch(() => {});
    syncBookingToSupabase(booking).catch(() => {});

    return dispute;
  }

  /**
   * Resolves a dispute with optional full or partial refund
   */
  static async resolveDispute(
    disputeId: string,
    adminUserId: string,
    status: 'REFUND_APPROVED' | 'PARTIAL_REFUND_APPROVED' | 'REJECTED' | 'RESOLVED',
    refundAmount = 0,
    decisionNotes: string
  ) {
    const dispute = await Dispute.findById(disputeId).populate('bookingId');
    if (!dispute) throw new Error('Dispute not found');

    const previousStatus = dispute.status;
    dispute.status = status;
    dispute.refundAmount = refundAmount;
    dispute.adminDecisionNotes = decisionNotes;
    dispute.resolvedBy = adminUserId as any;
    dispute.resolvedAt = new Date();
    await dispute.save();

    const booking: any = dispute.bookingId;

    // Process refund if approved
    if ((status === 'REFUND_APPROVED' || status === 'PARTIAL_REFUND_APPROVED') && refundAmount > 0) {
      await PaymentService.processRefund(
        dispute.passengerId.toString(),
        refundAmount,
        `Dispute resolution (${dispute.disputeNumber}): ${decisionNotes}`,
        booking.bookingReference
      );
      booking.state = 'REFUNDED';
      await booking.save();
    }

    // Append to immutable audit log
    await AuditLog.create({
      actorId: adminUserId,
      actorRole: 'OPERATIONS_ADMIN',
      action: 'RESOLVE_DISPUTE',
      targetResource: 'Dispute',
      targetId: dispute._id.toString(),
      previousState: { status: previousStatus },
      newState: { status, refundAmount, decisionNotes }
    });

    // Sync to Supabase in background
    syncDisputeToSupabase(dispute).catch(() => {});
    if (booking) syncBookingToSupabase(booking).catch(() => {});

    return dispute;
  }
}

