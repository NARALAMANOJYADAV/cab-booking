import mongoose, { Schema, Document } from 'mongoose';
import { SafetyPriority } from '@fairride/types';

export interface ISafetyIncident extends Document {
  incidentNumber: string;
  bookingId: mongoose.Types.ObjectId;
  passengerId: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  priority: SafetyPriority;
  triggerType: 'SOS_BUTTON' | 'ROUTE_DEVIATION' | 'UNUSUAL_STOP' | 'USER_REPORT';
  currentLocation: {
    type: 'Point';
    coordinates: [number, number];
  };
  addressAtIncident: string;
  status: 'OPEN' | 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED' | 'FALSE_ALARM';
  audioSnapshotUrl?: string;
  notes: Array<{
    author: string;
    text: string;
    timestamp: Date;
  }>;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  resolutionSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SafetyIncidentSchema = new Schema<ISafetyIncident>(
  {
    incidentNumber: { type: String, required: true, unique: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    passengerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
    priority: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'HIGH',
      index: true
    },
    triggerType: {
      type: String,
      enum: ['SOS_BUTTON', 'ROUTE_DEVIATION', 'UNUSUAL_STOP', 'USER_REPORT'],
      required: true
    },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    },
    addressAtIncident: { type: String, default: 'Live Coordinates' },
    status: {
      type: String,
      enum: ['OPEN', 'INVESTIGATING', 'ESCALATED', 'RESOLVED', 'FALSE_ALARM'],
      default: 'OPEN',
      index: true
    },
    audioSnapshotUrl: { type: String },
    notes: [
      {
        author: { type: String, required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    resolutionSummary: { type: String }
  },
  { timestamps: true }
);

SafetyIncidentSchema.index({ currentLocation: '2dsphere' });

export const SafetyIncident = mongoose.model<ISafetyIncident>('SafetyIncident', SafetyIncidentSchema);
