import {
  VehicleCategory,
  TripType,
  FareBreakdown,
  DriverNetEarningsPreview,
  PaymentMethod,
  MultimodalOption
} from '@fairride/types';
import {
  VEHICLE_CONFIGS,
  FUEL_COST_PER_KM_ESTIMATE,
  TOLL_ESTIMATE_DEFAULT
} from '@fairride/constants';

/**
 * Calculate Great-Circle distance in kilometers between two GPS coordinates using Haversine formula
 */
export function calculateHaversineDistanceKm(
  coord1: [number, number], // [lng, lat]
  coord2: [number, number]
): number {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const roadNetworkFactor = 1.35; // City road network routing multiplier vs straight line
  return Number((R * c * roadNetworkFactor).toFixed(2));
}

/**
 * Calculate distance in meters between two points
 */
export function calculateDistanceMeters(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Estimate travel duration in minutes based on distance and city speed profile
 */
export function estimateDurationMinutes(
  distanceKm: number,
  trafficMultiplier = 1.0
): number {
  const averageCitySpeedKmph = 26; // Realistic urban city speed
  const baseMinutes = (distanceKm / averageCitySpeedKmph) * 60;
  const withTraffic = baseMinutes * trafficMultiplier;
  return Math.max(5, Math.round(withTraffic));
}

/**
 * Server-side guaranteed Fare Calculator
 */
export function calculateTransparentFare(
  category: VehicleCategory,
  distanceKm: number,
  durationMin: number,
  tripType: TripType = 'ONE_WAY',
  surgeMultiplier = 1.0,
  tollAmount = TOLL_ESTIMATE_DEFAULT
): FareBreakdown {
  const config = VEHICLE_CONFIGS[category];
  if (!config) {
    throw new Error(`Invalid vehicle category: ${category}`);
  }

  // Base fare covers up to baseKm
  const baseFare = config.baseFare;
  const billableDistanceKm = Math.max(0, distanceKm - config.baseKm);
  const distanceCharge = Math.round(billableDistanceKm * config.perKmRate);
  const timeComponent = Math.round(durationMin * config.perMinuteRate);

  const subtotalBeforePlatform = (baseFare + distanceCharge + timeComponent) * surgeMultiplier;
  const platformFee = Math.round(subtotalBeforePlatform * config.platformFeeRate);
  const taxableAmount = subtotalBeforePlatform + platformFee;
  const tax = Math.round(taxableAmount * config.gstRate);
  const totalFare = Math.round(taxableAmount + tax + tollAmount);

  return {
    baseFare,
    distanceCharge,
    timeComponent,
    toll: tollAmount,
    platformFee,
    tax,
    totalFare,
    currency: 'INR'
  };
}

/**
 * Calculate Driver Net Earnings Preview
 */
export function calculateDriverNetEarnings(
  passengerFare: number,
  category: VehicleCategory,
  distanceKm: number,
  durationMin: number,
  paymentMethod: PaymentMethod = 'UPI',
  tollAmount = 0
): DriverNetEarningsPreview {
  const config = VEHICLE_CONFIGS[category];
  const platformFee = Math.round(passengerFare * config.platformFeeRate);
  const driverGrossEarnings = passengerFare - platformFee;

  // EV has lower running cost (₹1.8/km) vs petrol/diesel (₹6.5/km)
  const costPerKm = config.isZeroEmission ? 1.8 : FUEL_COST_PER_KM_ESTIMATE;
  const estimatedFuelCost = Math.round(distanceKm * costPerKm);
  const estimatedNetEarnings = Math.max(0, driverGrossEarnings - estimatedFuelCost - tollAmount);

  return {
    passengerFare,
    platformFee,
    driverGrossEarnings,
    estimatedFuelCost,
    estimatedToll: tollAmount,
    estimatedNetEarnings,
    distanceKm,
    estimatedDurationMin: durationMin,
    paymentMethod,
    isEstimate: true
  };
}

/**
 * Generate 4-digit verification PIN for boarding
 */
export function generateTripPin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Generate Multimodal journey alternatives for any trip
 */
export function generateMultimodalOptions(
  originName: string,
  destinationName: string,
  distanceKm: number
): MultimodalOption[] {
  const cabFare = Math.round(70 + distanceKm * 18);
  const cabMinutes = estimateDurationMinutes(distanceKm);

  return [
    {
      optionId: 'multi-direct-cab',
      title: 'Direct FairRide Cab',
      type: 'DIRECT_CAB',
      totalFare: cabFare,
      estimatedDurationMin: cabMinutes,
      co2SavingsKg: 0,
      transfersCount: 0,
      walkingDistanceKm: 0.1,
      legs: [
        {
          mode: 'CAB',
          instruction: `Direct door-to-door ride via ${originName} to ${destinationName}`,
          from: originName,
          to: destinationName,
          durationMin: cabMinutes,
          cost: cabFare
        }
      ]
    },
    {
      optionId: 'multi-cab-metro',
      title: 'FairRide Feeder + Metro Express',
      type: 'CAB_PLUS_METRO',
      totalFare: Math.round(65 + 40),
      estimatedDurationMin: Math.round(cabMinutes * 0.85),
      co2SavingsKg: Number((distanceKm * 0.08).toFixed(2)),
      transfersCount: 1,
      walkingDistanceKm: 0.3,
      legs: [
        {
          mode: 'CAB',
          instruction: 'Fast cab to nearest Metro Station Hub',
          from: originName,
          to: 'Nearest Metro Station',
          durationMin: 12,
          cost: 65
        },
        {
          mode: 'METRO',
          instruction: 'Air-conditioned express metro train line direct to destination sector',
          from: 'Metro Station',
          to: destinationName,
          durationMin: Math.max(15, Math.round(cabMinutes * 0.6)),
          cost: 40
        }
      ]
    },
    {
      optionId: 'multi-bus-metro',
      title: 'Eco Transit (Bus + Metro)',
      type: 'BUS_PLUS_METRO',
      totalFare: 55,
      estimatedDurationMin: Math.round(cabMinutes * 1.4),
      co2SavingsKg: Number((distanceKm * 0.12).toFixed(2)),
      transfersCount: 2,
      walkingDistanceKm: 0.8,
      legs: [
        {
          mode: 'BUS',
          instruction: 'Electric City Feeder Bus',
          from: originName,
          to: 'Transit Interchange',
          durationMin: 20,
          cost: 15
        },
        {
          mode: 'METRO',
          instruction: 'Rapid Metro connection',
          from: 'Transit Interchange',
          to: destinationName,
          durationMin: 25,
          cost: 40
        }
      ]
    },
    {
      optionId: 'multi-shared-ride',
      title: 'FairShare Pooled Corridor',
      type: 'SHARED_RIDE',
      totalFare: Math.round(cabFare * 0.62),
      estimatedDurationMin: Math.round(cabMinutes * 1.18),
      co2SavingsKg: Number((distanceKm * 0.06).toFixed(2)),
      transfersCount: 0,
      walkingDistanceKm: 0.2,
      legs: [
        {
          mode: 'CAB',
          instruction: 'Shared ride with 1 verified co-passenger on the same route',
          from: originName,
          to: destinationName,
          durationMin: Math.round(cabMinutes * 1.18),
          cost: Math.round(cabFare * 0.62)
        }
      ]
    }
  ];
}

/**
 * Format currency into Indian Rupees (INR)
 */
export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}
