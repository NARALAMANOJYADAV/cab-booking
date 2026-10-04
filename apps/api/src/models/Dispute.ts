import mongoose, { Schema, Document } from 'mongoose';
import { DisputeCategory } from '@fairride/types';

export interface IDispute extends Document {
  disputeNumber: string;
  bookingId: mongoose.Types.ObjectId;
  passengerId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  category: DisputeCategory;
  description: string;
  demandedAmount?: number;
  evidence: {
    lockedFare: number;
    actualFare: number;
    bookingReference: string;
    eventsTimeline: Array<{
      event: string;
      actor: string;
      timestamp: Date;
    }>;
    gpsTrackPointsCount: number;
    routeDeviationFlagged: boolean;
  };
  passengerScreenshots?: string[];
  status:
    | 'SUBMITTED'
    | 'UNDER_REVIEW'
    | 'REFUND_APPROVED'
    | 'PARTIAL_REFUND_APPROVED'
    | 'REJECTED'
    | 'RESOLVED';
  refundAmount?: number;
  adminDecisionNotes?: string;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    disputeNumber: { type: String, required: true, unique: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    passengerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true, index: true },
    category: {
      type: String,
      enum: [
        'DRIVER_DEMANDED_EXTRA_MONEY',
        'WRONG_FARE',
        'DRIVER_CANCELLATION',
        'PASSENGER_CANCELLATION_ISSUE',
        'ROUTE_ISSUE',
        'PAYMENT_ISSUE',
        'VEHICLE_ISSUE',
        'SAFETY_ISSUE',
        'LOST_ITEM',
        'OTHER'
      ],
      required: true,
      index: true
    },
    description: { type: String, required: true },
    demandedAmount: { type: Number },
    evidence: {
      lockedFare: { type: Number, required: true },
      actualFare: { type: Number, required: true },
      bookingReference: { type: String, required: true },
      eventsTimeline: [
        {
          event: { type: String, required: true },
          actor: { type: String, required: true },
          timestamp: { type: Date, required: true }
        }
      ],
      gpsTrackPointsCount: { type: Number, default: 0 },
      routeDeviationFlagged: { type: Boolean, default: false }
    },
    passengerScreenshots: [{ type: String }],
    status: {
      type: String,
      enum: [
        'SUBMITTED',
        'UNDER_REVIEW',
        'REFUND_APPROVED',
        'PARTIAL_REFUND_APPROVED',
        'REJECTED',
        'RESOLVED'
      ],
      default: 'SUBMITTED',
      index: true
    },
    refundAmount: { type: Number, default: 0 },
    adminDecisionNotes: { type: String },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date }
  },
  { timestamps: true }
);

export const Dispute = mongoose.model<IDispute>('Dispute', DisputeSchema);
