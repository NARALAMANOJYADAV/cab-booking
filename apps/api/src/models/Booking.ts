import mongoose, { Schema, Document } from 'mongoose';
import { BookingState, VehicleCategory, TripType, PaymentMethod, PaymentStatus } from '@fairride/types';

export interface IBookingTimelineEvent {
  event: string;
  actor: 'PASSENGER' | 'DRIVER' | 'SYSTEM' | 'ADMIN';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface IBooking extends Document {
  bookingReference: string;
  passengerId: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  vehicleId?: mongoose.Types.ObjectId;
  fareLockId: mongoose.Types.ObjectId;
  state: BookingState;
  vehicleCategory: VehicleCategory;
  tripType: TripType;
  pickup: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
    city?: string;
    landmark?: string;
    pickupPointType?: string;
    specificInstructions?: string;
  };
  destination: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
    city?: string;
    landmark?: string;
  };
  verificationPin: string;
  distanceKm: number;
  estimatedDurationMin: number;
  lockedFare: number;
  finalFare?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  timeline: IBookingTimelineEvent[];
  gpsBreadcrumbs: Array<{
    coordinates: [number, number];
    timestamp: Date;
    speedKmph?: number;
  }>;
  routeDeviations: Array<{
    coordinates: [number, number];
    distanceMeters: number;
    timestamp: Date;
    status: string;
  }>;
  isRecovered: boolean;
  recoveryAttempts: number;
  previousDriverIds: mongoose.Types.ObjectId[];
  cancellationReason?: string;
  cancelledBy?: 'PASSENGER' | 'DRIVER' | 'SYSTEM';
  passengerRating?: number;
  driverRating?: number;
  passengerFeedback?: string;
  driverFeedback?: string;
  isSeniorMode: boolean;
  isVoiceBooking: boolean;
  corporateId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingReference: { type: String, required: true, unique: true, index: true },
    passengerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver', index: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    fareLockId: { type: Schema.Types.ObjectId, ref: 'FareLock', required: true },
    state: {
      type: String,
      enum: [
        'SEARCHING',
        'QUOTE_CREATED',
        'FARE_LOCKED',
        'REQUESTED',
        'DRIVER_ASSIGNED',
        'DRIVER_ACCEPTED',
        'DRIVER_ARRIVING',
        'DRIVER_ARRIVED',
        'TRIP_STARTED',
        'TRIP_IN_PROGRESS',
        'TRIP_COMPLETED',
        'PAYMENT_PENDING',
        'PAYMENT_COMPLETED',
        'CANCELLED',
        'RECOVERY',
        'DISPUTED',
        'REFUNDED'
      ],
      default: 'REQUESTED',
      index: true
    },
    vehicleCategory: {
      type: String,
      enum: ['ECONOMY', 'HATCHBACK', 'SEDAN', 'SUV', 'PREMIUM', 'EV', 'SHARED', 'ACCESSIBLE'],
      required: true
    },
    tripType: {
      type: String,
      enum: ['ONE_WAY', 'ROUND_TRIP', 'OUTSTATION', 'AIRPORT_TRANSFER', 'HOURLY_RENTAL', 'SCHEDULED'],
      default: 'ONE_WAY'
    },
    pickup: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
      address: { type: String, required: true },
      city: { type: String },
      landmark: { type: String },
      pickupPointType: { type: String, default: 'MAIN_ENTRANCE' },
      specificInstructions: { type: String }
    },
    destination: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
      address: { type: String, required: true },
      city: { type: String },
      landmark: { type: String }
    },
    verificationPin: { type: String, required: true },
    distanceKm: { type: Number, required: true },
    estimatedDurationMin: { type: Number, required: true },
    lockedFare: { type: Number, required: true },
    finalFare: { type: Number },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'CARD', 'NET_BANKING', 'WALLET', 'CASH', 'CORPORATE_BILLING'],
      default: 'UPI'
    },
    paymentStatus: {
      type: String,
      enum: ['INITIATED', 'AUTHORIZED', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIAL_REFUND', 'PENDING'],
      default: 'PENDING'
    },
    timeline: [
      {
        event: { type: String, required: true },
        actor: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        metadata: { type: Schema.Types.Mixed }
      }
    ],
    gpsBreadcrumbs: [
      {
        coordinates: { type: [Number], required: true },
        timestamp: { type: Date, default: Date.now },
        speedKmph: { type: Number }
      }
    ],
    routeDeviations: [
      {
        coordinates: { type: [Number], required: true },
        distanceMeters: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now },
        status: { type: String, default: 'ALERT_SENT' }
      }
    ],
    isRecovered: { type: Boolean, default: false },
    recoveryAttempts: { type: Number, default: 0 },
    previousDriverIds: [{ type: Schema.Types.ObjectId, ref: 'Driver' }],
    cancellationReason: { type: String },
    cancelledBy: { type: String, enum: ['PASSENGER', 'DRIVER', 'SYSTEM'] },
    passengerRating: { type: Number, min: 1, max: 5 },
    driverRating: { type: Number, min: 1, max: 5 },
    passengerFeedback: { type: String },
    driverFeedback: { type: String },
    isSeniorMode: { type: Boolean, default: false },
    isVoiceBooking: { type: Boolean, default: false },
    corporateId: { type: Schema.Types.ObjectId, ref: 'CorporateAccount' }
  },
  { timestamps: true }
);

BookingSchema.index({ 'pickup.coordinates': '2dsphere' });
BookingSchema.index({ passengerId: 1, createdAt: -1 });
BookingSchema.index({ driverId: 1, state: 1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
