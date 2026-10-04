import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@fairride/types';

export interface IAuditLog extends Document {
  actorId: mongoose.Types.ObjectId;
  actorRole: UserRole;
  actorEmail?: string;
  action: string;
  targetResource: string;
  targetId: string;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actorRole: { type: String, required: true },
    actorEmail: { type: String },
    action: { type: String, required: true, index: true },
    targetResource: { type: String, required: true, index: true },
    targetId: { type: String, required: true, index: true },
    previousState: { type: Schema.Types.Mixed },
    newState: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export interface ISavedPlace extends Document {
  userId: mongoose.Types.ObjectId;
  label: 'HOME' | 'WORK' | 'COLLEGE' | 'HOSPITAL' | 'AIRPORT' | 'CUSTOM';
  customName?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
    landmark?: string;
    pickupPointType?: string;
    specificInstructions?: string;
  };
  createdAt: Date;
}

const SavedPlaceSchema = new Schema<ISavedPlace>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: {
      type: String,
      enum: ['HOME', 'WORK', 'COLLEGE', 'HOSPITAL', 'AIRPORT', 'CUSTOM'],
      required: true
    },
    customName: { type: String },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
      address: { type: String, required: true },
      landmark: { type: String },
      pickupPointType: { type: String, default: 'GATE' },
      specificInstructions: { type: String }
    }
  },
  { timestamps: true }
);

export const SavedPlace = mongoose.model<ISavedPlace>('SavedPlace', SavedPlaceSchema);
