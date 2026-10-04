import mongoose, { Schema, Document } from 'mongoose';
import { FareBreakdown } from '@fairride/types';

export interface IFareLock extends Document {
  quoteId: string;
  passengerId: mongoose.Types.ObjectId;
  vehicleCategory: string;
  distanceKm: number;
  durationMin: number;
  breakdown: FareBreakdown;
  lockedFare: number;
  lockedAt: Date;
  expiresAt: Date;
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'ADJUSTED';
  adjustmentAllowedReasons: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FareLockSchema = new Schema<IFareLock>(
  {
    quoteId: { type: String, required: true, unique: true, index: true },
    passengerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vehicleCategory: { type: String, required: true },
    distanceKm: { type: Number, required: true },
    durationMin: { type: Number, required: true },
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
    lockedFare: { type: Number, required: true },
    lockedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'USED', 'EXPIRED', 'ADJUSTED'],
      default: 'ACTIVE',
      index: true
    },
    adjustmentAllowedReasons: [
      {
        type: String,
        default: ['Official highway toll variance', 'Passenger requested route destination change']
      }
    ]
  },
  { timestamps: true }
);

export const FareLock = mongoose.model<IFareLock>('FareLock', FareLockSchema);
