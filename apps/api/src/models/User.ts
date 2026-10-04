import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '@fairride/types';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  profilePicture?: string;
  isVerified: boolean;
  isActive: boolean;
  emergencyContacts: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
  accessibilityPreferences: {
    seniorMode: boolean;
    voiceAssistance: boolean;
    highContrast: boolean;
    wheelchairRequirement: boolean;
  };
  safetyPreferences: {
    shareTripsAutomatically: boolean;
    routeDeviationAlerts: boolean;
    requireTripPin: boolean;
  };
  preferredLanguage: string;
  referralCode: string;
  referredBy?: string;
  corporateId?: string;
  trustScore: number;
  completedRides: number;
  cancelledRides: number;
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    password: { type: String },
    role: {
      type: String,
      enum: [
        'PASSENGER',
        'DRIVER',
        'CORPORATE_EMPLOYEE',
        'CORPORATE_MANAGER',
        'CORPORATE_ADMIN',
        'SUPPORT_AGENT',
        'SAFETY_AGENT',
        'OPERATIONS_ADMIN',
        'SUPER_ADMIN'
      ],
      default: 'PASSENGER',
      index: true
    },
    profilePicture: { type: String },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    emergencyContacts: [
      {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        relationship: { type: String, default: 'Family' }
      }
    ],
    accessibilityPreferences: {
      seniorMode: { type: Boolean, default: false },
      voiceAssistance: { type: Boolean, default: false },
      highContrast: { type: Boolean, default: false },
      wheelchairRequirement: { type: Boolean, default: false }
    },
    safetyPreferences: {
      shareTripsAutomatically: { type: Boolean, default: false },
      routeDeviationAlerts: { type: Boolean, default: true },
      requireTripPin: { type: Boolean, default: true }
    },
    preferredLanguage: { type: String, default: 'en' },
    referralCode: { type: String, unique: true, index: true },
    referredBy: { type: String },
    corporateId: { type: Schema.Types.ObjectId, ref: 'CorporateAccount' },
    trustScore: { type: Number, default: 95, min: 0, max: 100 },
    completedRides: { type: Number, default: 0 },
    cancelledRides: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
