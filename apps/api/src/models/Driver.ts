import mongoose, { Schema, Document } from 'mongoose';
import { DocumentStatus } from '@fairride/types';

export interface IDriver extends Document {
  userId: mongoose.Types.ObjectId;
  vehicleId?: mongoose.Types.ObjectId;
  isOnline: boolean;
  isBusy: boolean;
  currentLocation: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
    updatedAt: Date;
    bearing?: number;
  };
  city: string;
  verificationStatus: DocumentStatus;
  documents: Array<{
    documentType: string;
    documentNumber: string;
    documentUrl: string;
    status: DocumentStatus;
    rejectionReason?: string;
    verifiedAt?: Date;
  }>;
  rating: number;
  ratingCount: number;
  acceptanceRate: number;
  cancellationRate: number;
  completedTripsCount: number;
  hoursOnlineToday: number;
  todayGrossEarnings: number;
  todayNetEarnings: number;
  trustScore: number;
  bankDetails: {
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
  };
  recentCancellationEvents: Array<{
    reason: string;
    timestamp: Date;
    wasAfterContact: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    isOnline: { type: Boolean, default: false, index: true },
    isBusy: { type: Boolean, default: false, index: true },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true, default: [78.3808, 17.4435] }, // Default Hyderabad
      updatedAt: { type: Date, default: Date.now },
      bearing: { type: Number, default: 0 }
    },
    city: { type: String, default: 'Hyderabad', index: true },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED'],
      default: 'PENDING',
      index: true
    },
    documents: [
      {
        documentType: { type: String, required: true },
        documentNumber: { type: String, required: true },
        documentUrl: { type: String, required: true },
        status: {
          type: String,
          enum: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED'],
          default: 'PENDING'
        },
        rejectionReason: { type: String },
        verifiedAt: { type: Date }
      }
    ],
    rating: { type: Number, default: 4.85, min: 1, max: 5 },
    ratingCount: { type: Number, default: 120 },
    acceptanceRate: { type: Number, default: 94 }, // percentage
    cancellationRate: { type: Number, default: 2.1 }, // percentage
    completedTripsCount: { type: Number, default: 0 },
    hoursOnlineToday: { type: Number, default: 0 },
    todayGrossEarnings: { type: Number, default: 0 },
    todayNetEarnings: { type: Number, default: 0 },
    trustScore: { type: Number, default: 98, min: 0, max: 100 },
    bankDetails: {
      accountNumber: { type: String },
      ifscCode: { type: String },
      upiId: { type: String }
    },
    recentCancellationEvents: [
      {
        reason: { type: String },
        timestamp: { type: Date, default: Date.now },
        wasAfterContact: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

// 2dsphere index for lightning-fast geospatial dispatch queries
DriverSchema.index({ currentLocation: '2dsphere' });
DriverSchema.index({ isOnline: 1, isBusy: 1, verificationStatus: 1 });

export const Driver = mongoose.model<IDriver>('Driver', DriverSchema);
