import { z } from 'zod';

export const CoordinatesSchema = z.tuple([z.number(), z.number()]); // [lng, lat]

export const GeoLocationSchema = z.object({
  type: z.literal('Point').default('Point'),
  coordinates: CoordinatesSchema,
  address: z.string().min(1, 'Address is required'),
  city: z.string().optional(),
  landmark: z.string().optional(),
  pickupPointType: z.enum([
    'GATE',
    'METRO_EXIT',
    'AIRPORT_TERMINAL',
    'MALL_ENTRANCE',
    'HOSPITAL_ENTRANCE',
    'COLLEGE_GATE',
    'PARKING',
    'MAIN_ENTRANCE',
    'CUSTOM'
  ]).optional(),
  specificInstructions: z.string().optional()
});

export const RegisterUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum([
    'PASSENGER',
    'DRIVER',
    'CORPORATE_EMPLOYEE',
    'CORPORATE_MANAGER',
    'CORPORATE_ADMIN',
    'SUPPORT_AGENT',
    'SAFETY_AGENT',
    'OPERATIONS_ADMIN',
    'SUPER_ADMIN'
  ]).default('PASSENGER'),
  referralCode: z.string().optional()
});

export const LoginSchema = z.object({
  identifier: z.string().min(3, 'Email or Phone is required'),
  password: z.string().min(6, 'Password is required')
});

export const SendOtpSchema = z.object({
  phone: z.string().min(10, 'Valid 10-digit mobile number required')
});

export const VerifyOtpSchema = z.object({
  phone: z.string().min(10, 'Valid 10-digit mobile number required'),
  otp: z.string().length(6, 'OTP must be 6 digits')
});

export const QuoteRequestSchema = z.object({
  pickup: GeoLocationSchema,
  destination: GeoLocationSchema,
  intermediateStops: z.array(GeoLocationSchema).optional(),
  vehicleCategory: z.enum([
    'ECONOMY',
    'HATCHBACK',
    'SEDAN',
    'SUV',
    'PREMIUM',
    'EV',
    'SHARED',
    'ACCESSIBLE'
  ]).optional(),
  tripType: z.enum([
    'ONE_WAY',
    'ROUND_TRIP',
    'OUTSTATION',
    'AIRPORT_TRANSFER',
    'HOURLY_RENTAL',
    'SCHEDULED'
  ]).default('ONE_WAY'),
  preference: z.enum([
    'FASTEST',
    'CHEAPEST',
    'SAFEST',
    'GREENEST',
    'COMFORT',
    'ACCESSIBILITY'
  ]).default('FASTEST'),
  specialRequirements: z.array(z.enum([
    'WHEELCHAIR',
    'EXTRA_LUGGAGE',
    'ELDERLY_PASSENGER',
    'ACCESSIBILITY_ASSISTANCE',
    'CHILD_SEAT',
    'AIRPORT_ASSISTANCE'
  ])).optional(),
  rentalHours: z.number().min(1).max(24).optional(),
  flightNumber: z.string().optional()
});

export const LockFareSchema = z.object({
  quoteId: z.string().min(1, 'Quote ID is required')
});

export const CreateBookingSchema = z.object({
  lockId: z.string().min(1, 'Locked fare ID is required'),
  pickup: GeoLocationSchema,
  destination: GeoLocationSchema,
  vehicleCategory: z.enum([
    'ECONOMY',
    'HATCHBACK',
    'SEDAN',
    'SUV',
    'PREMIUM',
    'EV',
    'SHARED',
    'ACCESSIBLE'
  ]),
  paymentMethod: z.enum(['UPI', 'CARD', 'NET_BANKING', 'WALLET', 'CASH', 'CORPORATE_BILLING']),
  passengerNotes: z.string().optional(),
  specialRequirements: z.array(z.string()).optional(),
  isSeniorMode: z.boolean().optional(),
  isVoiceBooking: z.boolean().optional(),
  corporateId: z.string().optional()
});

export const DriverResponseSchema = z.object({
  action: z.enum(['ACCEPT', 'DECLINE']),
  reason: z.string().optional()
});

export const UpdateLocationSchema = z.object({
  coordinates: CoordinatesSchema,
  bearing: z.number().optional(),
  speedKmph: z.number().optional()
});

export const RouteDeviationSchema = z.object({
  bookingId: z.string(),
  currentLocation: CoordinatesSchema,
  nearestExpectedLocation: CoordinatesSchema,
  deviationDistanceMeters: z.number()
});

export const SafetySosSchema = z.object({
  bookingId: z.string(),
  currentLocation: CoordinatesSchema,
  address: z.string().optional(),
  audioSnapshot: z.string().optional(), // base64 or blob URL reference if recorded
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('CRITICAL')
});

export const CreateDisputeSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  category: z.enum([
    'DRIVER_DEMANDED_EXTRA_MONEY',
    'WRONG_FARE',
    'DRIVER_CANCELLATION',
    'PASSENGER_CANCELLATION_ISSUE',
    'ROUTE_ISSUE',
    'PAYMENT_ISSUE',
    'VEHICLE_ISSUE',
    'SAFETY_ISSUE',
    'LOST_ITEM',
    'OTHER'
  ]),
  description: z.string().min(10, 'Please describe the issue with at least 10 characters'),
  demandedAmount: z.number().optional(),
  passengerScreenshots: z.array(z.string()).optional()
});

export const ResolveDisputeSchema = z.object({
  status: z.enum(['REFUND_APPROVED', 'PARTIAL_REFUND_APPROVED', 'REJECTED', 'RESOLVED']),
  refundAmount: z.number().optional(),
  adminDecisionNotes: z.string().min(5, 'Decision notes are required for dispute resolution')
});
