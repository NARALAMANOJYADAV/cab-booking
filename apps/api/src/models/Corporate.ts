import mongoose, { Schema, Document } from 'mongoose';
import { VehicleCategory } from '@fairride/types';

export interface ICorporateAccount extends Document {
  companyName: string;
  corporateCode: string;
  billingEmail: string;
  phone: string;
  monthlyBudget: number;
  currentSpend: number;
  departments: Array<{
    name: string;
    budget: number;
    spend: number;
  }>;
  travelPolicy: {
    maxFarePerRide: number;
    allowedCategories: VehicleCategory[];
    requireManagerApproval: boolean;
    allowedHoursStart?: string;
    allowedHoursEnd?: string;
  };
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
}

const CorporateAccountSchema = new Schema<ICorporateAccount>(
  {
    companyName: { type: String, required: true, trim: true },
    corporateCode: { type: String, required: true, unique: true, uppercase: true, index: true },
    billingEmail: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    monthlyBudget: { type: Number, required: true, default: 250000 },
    currentSpend: { type: Number, default: 0 },
    departments: [
      {
        name: { type: String, required: true },
        budget: { type: Number, required: true, default: 50000 },
        spend: { type: Number, default: 0 }
      }
    ],
    travelPolicy: {
      maxFarePerRide: { type: Number, default: 1500 },
      allowedCategories: {
        type: [String],
        default: ['ECONOMY', 'HATCHBACK', 'SEDAN', 'EV']
      },
      requireManagerApproval: { type: Boolean, default: true },
      allowedHoursStart: { type: String, default: '06:00' },
      allowedHoursEnd: { type: String, default: '22:00' }
    },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' }
  },
  { timestamps: true }
);

export const CorporateAccount = mongoose.model<ICorporateAccount>(
  'CorporateAccount',
  CorporateAccountSchema
);

export interface ICorporateBooking extends Document {
  corporateAccountId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  employeeUserId: mongoose.Types.ObjectId;
  departmentName: string;
  projectCode?: string;
  reasonForTravel: string;
  fareAmount: number;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: mongoose.Types.ObjectId;
  approvalNotes?: string;
  createdAt: Date;
}

const CorporateBookingSchema = new Schema<ICorporateBooking>(
  {
    corporateAccountId: { type: Schema.Types.ObjectId, ref: 'CorporateAccount', required: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    employeeUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    departmentName: { type: String, required: true },
    projectCode: { type: String },
    reasonForTravel: { type: String, required: true },
    fareAmount: { type: Number, required: true },
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvalNotes: { type: String }
  },
  { timestamps: true }
);

export const CorporateBooking = mongoose.model<ICorporateBooking>(
  'CorporateBooking',
  CorporateBookingSchema
);
