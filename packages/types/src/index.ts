export type UserRole =
  | 'PASSENGER'
  | 'DRIVER'
  | 'CORPORATE_EMPLOYEE'
  | 'CORPORATE_MANAGER'
  | 'CORPORATE_ADMIN'
  | 'SUPPORT_AGENT'
  | 'SAFETY_AGENT'
  | 'OPERATIONS_ADMIN'
  | 'SUPER_ADMIN';

export type BookingState =
  | 'SEARCHING'
  | 'QUOTE_CREATED'
  | 'FARE_LOCKED'
  | 'REQUESTED'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ACCEPTED'
  | 'DRIVER_ARRIVING'
  | 'DRIVER_ARRIVED'
  | 'TRIP_STARTED'
  | 'TRIP_IN_PROGRESS'
  | 'TRIP_COMPLETED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_COMPLETED'
  | 'CANCELLED'
  | 'RECOVERY'
  | 'DISPUTED'
  | 'REFUNDED';

export type VehicleCategory =
  | 'ECONOMY'
  | 'HATCHBACK'
  | 'SEDAN'
  | 'SUV'
  | 'PREMIUM'
  | 'EV'
  | 'SHARED'
  | 'ACCESSIBLE';

export type TripType =
  | 'ONE_WAY'
  | 'ROUND_TRIP'
  | 'OUTSTATION'
  | 'AIRPORT_TRANSFER'
  | 'HOURLY_RENTAL'
  | 'SCHEDULED';

export type RidePreference =
  | 'FASTEST'
  | 'CHEAPEST'
  | 'SAFEST'
  | 'GREENEST'
  | 'COMFORT'
  | 'ACCESSIBILITY';

export type SpecialMobilityRequirement =
  | 'WHEELCHAIR'
  | 'EXTRA_LUGGAGE'
  | 'ELDERLY_PASSENGER'
  | 'ACCESSIBILITY_ASSISTANCE'
  | 'CHILD_SEAT'
  | 'AIRPORT_ASSISTANCE';

export type PickupPointType =
  | 'GATE'
  | 'METRO_EXIT'
  | 'AIRPORT_TERMINAL'
  | 'MALL_ENTRANCE'
  | 'HOSPITAL_ENTRANCE'
  | 'COLLEGE_GATE'
  | 'PARKING'
  | 'MAIN_ENTRANCE'
  | 'CUSTOM';

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
  city?: string;
  landmark?: string;
  pickupPointType?: PickupPointType;
  specificInstructions?: string;
}

export interface FareBreakdown {
  baseFare: number;
  distanceCharge: number;
  timeComponent: number;
  toll: number;
  platformFee: number;
  tax: number;
  totalFare: number;
  currency: string;
}

export interface FareQuote {
  quoteId: string;
  vehicleCategory: VehicleCategory;
  tripType: TripType;
  distanceKm: number;
  durationMin: number;
  breakdown: FareBreakdown;
  surgeMultiplier: number;
  greenDiscount?: number;
  estimatedCo2AvoidedKg?: number;
  createdAt: string;
  validUntil: string;
}

export interface FareLock {
  lockId: string;
  quoteId: string;
  passengerId: string;
  originalQuote: FareBreakdown;
  lockedFare: number;
  lockedAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'ADJUSTED';
  adjustmentAllowedReasons: string[];
}

export interface FareAdjustment {
  adjustmentId: string;
  bookingId: string;
  originalFare: number;
  updatedFare: number;
  difference: number;
  reason: string;
  category: 'TOLL_ADJUSTMENT' | 'ROUTE_EXTENSION' | 'WAITING_CHARGE' | 'OTHER';
  acknowledgedByPassenger: boolean;
  createdAt: string;
}

export interface FareAuditRecord {
  auditId: string;
  bookingId: string;
  originalLockedFare: number;
  finalFare: number;
  difference: number;
  breakdown: FareBreakdown;
  adjustments: FareAdjustment[];
  status: 'VERIFIED_MATCH' | 'ADJUSTMENT_APPROVED' | 'DISPUTED';
  receiptUrl?: string;
  createdAt: string;
}

export interface DriverNetEarningsPreview {
  passengerFare: number;
  platformFee: number;
  driverGrossEarnings: number;
  estimatedFuelCost: number;
  estimatedToll: number;
  estimatedNetEarnings: number;
  distanceKm: number;
  estimatedDurationMin: number;
  paymentMethod: PaymentMethod;
  isEstimate: true;
}

export type DocumentStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED';

export interface DriverDocument {
  documentType: 'DRIVING_LICENSE' | 'VEHICLE_RC' | 'INSURANCE' | 'PERMIT' | 'POLICE_VERIFICATION';
  documentNumber: string;
  documentUrl: string;
  expiryDate?: string;
  status: DocumentStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface DriverTrustProfile {
  identityVerified: boolean;
  vehicleVerified: boolean;
  documentsVerified: boolean;
  completedRides: number;
  rating: number;
  onTimePercentage: number;
  cancellationRate: number;
  safetyComplaintsCount: number;
  trustScore: number; // 0 - 100
}

export interface PassengerTrustProfile {
  completedRides: number;
  cancellationRate: number;
  rating: number;
  paymentReliability: 'EXCELLENT' | 'GOOD' | 'NEEDS_REVIEW';
  trustScore: number; // 0 - 100
}

export type PaymentMethod = 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET' | 'CASH' | 'CORPORATE_BILLING';

export type PaymentStatus =
  | 'INITIATED'
  | 'AUTHORIZED'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIAL_REFUND'
  | 'PENDING';

export type SafetyPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface SafetyIncident {
  incidentId: string;
  bookingId: string;
  passengerId: string;
  driverId?: string;
  priority: SafetyPriority;
  triggerType: 'SOS_BUTTON' | 'ROUTE_DEVIATION' | 'UNUSUAL_STOP' | 'USER_REPORT';
  currentLocation: [number, number];
  addressAtIncident: string;
  timestamp: string;
  status: 'OPEN' | 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED' | 'FALSE_ALARM';
  notes: string[];
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface RouteDeviationAlert {
  bookingId: string;
  actualLocation: [number, number];
  nearestExpectedLocation: [number, number];
  deviationDistanceMeters: number;
  toleranceThresholdMeters: number;
  timestamp: string;
  passengerResponse?: 'IM_SAFE' | 'NEED_HELP' | 'EMERGENCY';
}

export type DisputeCategory =
  | 'DRIVER_DEMANDED_EXTRA_MONEY'
  | 'WRONG_FARE'
  | 'DRIVER_CANCELLATION'
  | 'PASSENGER_CANCELLATION_ISSUE'
  | 'ROUTE_ISSUE'
  | 'PAYMENT_ISSUE'
  | 'VEHICLE_ISSUE'
  | 'SAFETY_ISSUE'
  | 'LOST_ITEM'
  | 'OTHER';

export interface DisputeEvidenceBundle {
  bookingId: string;
  fareLock: FareLock;
  actualFare: number;
  gpsTrackPointsCount: number;
  eventsTimeline: Array<{
    event: string;
    timestamp: string;
    actor: string;
    metadata?: Record<string, unknown>;
  }>;
  driverNotes?: string;
  passengerScreenshots?: string[];
}

export interface DisputeRecord {
  disputeId: string;
  bookingId: string;
  passengerId: string;
  driverId: string;
  category: DisputeCategory;
  description: string;
  evidence: DisputeEvidenceBundle;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'REFUND_APPROVED' | 'PARTIAL_REFUND_APPROVED' | 'REJECTED' | 'RESOLVED';
  refundAmount?: number;
  adminDecisionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export type FraudRiskLevel = 'NORMAL' | 'REVIEW' | 'HIGH_RISK';

export type FraudCategory =
  | 'REFERRAL_ABUSE'
  | 'COUPON_ABUSE'
  | 'PAYMENT_ANOMALY'
  | 'MULTIPLE_ACCOUNT'
  | 'GPS_ANOMALY'
  | 'SUSPICIOUS_CANCELLATION'
  | 'BOOKING_ANOMALY';

export interface FraudAlertRecord {
  alertId: string;
  userId: string;
  userRole: UserRole;
  category: FraudCategory;
  riskLevel: FraudRiskLevel;
  confidenceScore: number;
  evidenceSummary: string;
  metadata: Record<string, unknown>;
  status: 'PENDING_REVIEW' | 'DISMISSED' | 'ACTIONED';
  actionTaken?: 'NONE' | 'WARNING' | 'SUSPENDED' | 'DOCUMENT_RECHECK';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface MultimodalOption {
  optionId: string;
  title: string;
  type: 'DIRECT_CAB' | 'CAB_PLUS_METRO' | 'BUS_PLUS_METRO' | 'SHARED_RIDE';
  totalFare: number;
  estimatedDurationMin: number;
  co2SavingsKg: number;
  transfersCount: number;
  walkingDistanceKm: number;
  legs: Array<{
    mode: 'CAB' | 'METRO' | 'BUS' | 'WALK';
    instruction: string;
    from: string;
    to: string;
    durationMin: number;
    cost: number;
  }>;
}

export interface VoiceBookingParsedResult {
  rawTranscript: string;
  pickup: string;
  destination: string;
  vehicleCategory: VehicleCategory;
  scheduledDate: string;
  scheduledTime: string;
  estimatedFareRange: { min: number; max: number };
  passengerCount?: number;
  confidenceScore: number;
}

export interface CorporateAccountProfile {
  companyId: string;
  companyName: string;
  domain: string;
  billingEmail: string;
  monthlyBudget: number;
  currentMonthSpend: number;
  departments: Array<{
    id: string;
    name: string;
    monthlyBudget: number;
    currentSpend: number;
  }>;
  travelPolicy: {
    maxFarePerRide: number;
    allowedCategories: VehicleCategory[];
    requireManagerApproval: boolean;
    allowedHoursStart?: string;
    allowedHoursEnd?: string;
  };
}

export interface AuditLogEntry {
  auditId: string;
  actorId: string;
  actorRole: UserRole;
  actorEmail?: string;
  action: string;
  targetResource: string;
  targetId: string;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}
