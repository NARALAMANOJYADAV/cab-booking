import mongoose, { Schema, Document } from 'mongoose';
import { VehicleCategory } from '@fairride/types';

export interface IVehicle {
  driverId: mongoose.Types.ObjectId;
  registrationNumber: string;
  brand: string;
  model: string;
  color: string;
  category: VehicleCategory;
  seatingCapacity: number;
  fuelType: 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC' | 'HYBRID';
  isElectric: boolean;
  isWheelchairAccessible: boolean;
  hasChildSeat: boolean;
  hasAc: boolean;
  rcNumber: string;
  insuranceNumber: string;
  permitNumber?: string;
  photos: string[];
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true, index: true },
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    color: { type: String, required: true },
    category: {
      type: String,
      enum: ['ECONOMY', 'HATCHBACK', 'SEDAN', 'SUV', 'PREMIUM', 'EV', 'SHARED', 'ACCESSIBLE'],
      required: true,
      index: true
    },
    seatingCapacity: { type: Number, required: true, default: 4 },
    fuelType: {
      type: String,
      enum: ['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID'],
      required: true
    },
    isElectric: { type: Boolean, default: false, index: true },
    isWheelchairAccessible: { type: Boolean, default: false },
    hasChildSeat: { type: Boolean, default: false },
    hasAc: { type: Boolean, default: true },
    rcNumber: { type: String, required: true },
    insuranceNumber: { type: String, required: true },
    permitNumber: { type: String },
    photos: [{ type: String }],
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'VERIFIED'
    }
  },
  { timestamps: true }
);

export const Vehicle = mongoose.model<IVehicle>('Vehicle', VehicleSchema);
