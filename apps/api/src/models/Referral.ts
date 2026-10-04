import mongoose, { Schema, Document } from 'mongoose';

export interface IReferral extends Document {
  referrerUserId: mongoose.Types.ObjectId;
  refereeUserId: mongoose.Types.ObjectId;
  referralCode: string;
  status: 'PENDING_FIRST_RIDE' | 'COMPLETED' | 'FLAGGED_ABUSE';
  qualifyingBookingId?: mongoose.Types.ObjectId;
  referrerRewardAmount: number;
  refereeRewardAmount: number;
  deviceFingerprintReferee?: string;
  ipAddressReferee?: string;
  completedAt?: Date;
  createdAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    referrerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refereeUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    referralCode: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING_FIRST_RIDE', 'COMPLETED', 'FLAGGED_ABUSE'],
      default: 'PENDING_FIRST_RIDE',
      index: true
    },
    qualifyingBookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    referrerRewardAmount: { type: Number, default: 100 },
    refereeRewardAmount: { type: Number, default: 100 },
    deviceFingerprintReferee: { type: String },
    ipAddressReferee: { type: String },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

export const Referral = mongoose.model<IReferral>('Referral', ReferralSchema);

export interface IFairPoint extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  transactions: Array<{
    amount: number;
    type: 'EARNED' | 'REDEEMED';
    reason: string;
    bookingId?: mongoose.Types.ObjectId;
    timestamp: Date;
  }>;
}

const FairPointSchema = new Schema<IFairPoint>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    balance: { type: Number, default: 50 }, // 50 welcome points
    transactions: [
      {
        amount: { type: Number, required: true },
        type: { type: String, enum: ['EARNED', 'REDEEMED'], required: true },
        reason: { type: String, required: true },
        bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const FairPoint = mongoose.model<IFairPoint>('FairPoint', FairPointSchema);
