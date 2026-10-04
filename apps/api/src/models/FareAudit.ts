import mongoose, { Schema, Document } from 'mongoose';
import { FareBreakdown } from '@fairride/types';

export interface IFareAudit extends Document {
  bookingId: mongoose.Types.ObjectId;
  passengerId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  originalLockedFare: number;
  finalFare: number;
  difference: number;
  breakdown: FareBreakdown;
  adjustments: Array<{
    reason: string;
    amount: number;
    category: 'TOLL_ADJUSTMENT' | 'ROUTE_EXTENSION' | 'WAITING_CHARGE' | 'OTHER';
    approvedBySystem: boolean;
  }>;
  status: 'VERIFIED_MATCH' | 'ADJUSTMENT_APPROVED' | 'DISPUTED';
  receiptReference: string;
  createdAt: Date;
  updatedAt: Date;
}

const FareAuditSchema = new Schema<IFareAudit>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true, index: true },
    passengerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    originalLockedFare: { type: Number, required: true },
    finalFare: { type: Number, required: true },
    difference: { type: Number, required: true, default: 0 },
    breakdown: {
      baseFare: { type: Number, required: true },
      distanceCharge: { type: Number, required: true },
      timeComponent: { type: Number, required: true },
      toll: { type: Number, default: 0 },
      platformFee: { type: Number, required: true },
      tax: { type: Number, required: true },
      totalFare: { type: Number, required: true },
      currency: { type: String, default: 'INR' }
    },
    adjustments: [
      {
        reason: { type: String, required: true },
        amount: { type: Number, required: true },
        category: {
          type: String,
          enum: ['TOLL_ADJUSTMENT', 'ROUTE_EXTENSION', 'WAITING_CHARGE', 'OTHER'],
          default: 'TOLL_ADJUSTMENT'
        },
        approvedBySystem: { type: Boolean, default: true }
      }
    ],
    status: {
      type: String,
      enum: ['VERIFIED_MATCH', 'ADJUSTMENT_APPROVED', 'DISPUTED'],
      default: 'VERIFIED_MATCH'
    },
    receiptReference: { type: String, required: true }
  },
  { timestamps: true }
);

export const FareAudit = mongoose.model<IFareAudit>('FareAudit', FareAuditSchema);
