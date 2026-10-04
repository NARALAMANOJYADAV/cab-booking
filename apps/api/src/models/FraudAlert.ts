import mongoose, { Schema, Document } from 'mongoose';
import { FraudCategory, FraudRiskLevel, UserRole } from '@fairride/types';

export interface IFraudAlert extends Document {
  userId: mongoose.Types.ObjectId;
  userRole: UserRole;
  category: FraudCategory;
  riskLevel: FraudRiskLevel;
  confidenceScore: number;
  evidenceSummary: string;
  metadata: Record<string, any>;
  status: 'PENDING_REVIEW' | 'DISMISSED' | 'ACTIONED';
  actionTaken?: 'NONE' | 'WARNING' | 'SUSPENDED' | 'DOCUMENT_RECHECK';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FraudAlertSchema = new Schema<IFraudAlert>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userRole: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'REFERRAL_ABUSE',
        'COUPON_ABUSE',
        'PAYMENT_ANOMALY',
        'MULTIPLE_ACCOUNT',
        'GPS_ANOMALY',
        'SUSPICIOUS_CANCELLATION',
        'BOOKING_ANOMALY'
      ],
      required: true,
      index: true
    },
    riskLevel: {
      type: String,
      enum: ['NORMAL', 'REVIEW', 'HIGH_RISK'],
      required: true,
      index: true
    },
    confidenceScore: { type: Number, required: true },
    evidenceSummary: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: ['PENDING_REVIEW', 'DISMISSED', 'ACTIONED'],
      default: 'PENDING_REVIEW',
      index: true
    },
    actionTaken: {
      type: String,
      enum: ['NONE', 'WARNING', 'SUSPENDED', 'DOCUMENT_RECHECK'],
      default: 'NONE'
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviewNotes: { type: String }
  },
  { timestamps: true }
);

export const FraudAlert = mongoose.model<IFraudAlert>('FraudAlert', FraudAlertSchema);
