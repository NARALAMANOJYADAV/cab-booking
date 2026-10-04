import mongoose, { Schema, Document } from 'mongoose';

export interface IWalletTransaction extends Document {
  walletId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  balanceAfter: number;
  type: 'CREDIT' | 'DEBIT';
  category: 'RIDE_PAYMENT' | 'DRIVER_PAYOUT' | 'REFUND' | 'REWARD' | 'WALLET_TOPUP' | 'COMMISSION_DEDUCTION';
  description: string;
  referenceId?: string;
  idempotencyKey?: string;
  createdAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
    category: {
      type: String,
      enum: [
        'RIDE_PAYMENT',
        'DRIVER_PAYOUT',
        'REFUND',
        'REWARD',
        'WALLET_TOPUP',
        'COMMISSION_DEDUCTION'
      ],
      required: true
    },
    description: { type: String, required: true },
    referenceId: { type: String },
    idempotencyKey: { type: String, sparse: true, index: true }
  },
  { timestamps: true }
);

export const WalletTransaction = mongoose.model<IWalletTransaction>(
  'WalletTransaction',
  WalletTransactionSchema
);

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  userRole: string;
  balance: number;
  heldBalance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    userRole: { type: String, required: true },
    balance: { type: Number, default: 0, min: 0 },
    heldBalance: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR' }
  },
  { timestamps: true }
);

export const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);
