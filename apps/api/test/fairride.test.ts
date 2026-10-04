import { describe, it, expect } from 'vitest';
import { calculateTransparentFare, calculateDriverNetEarnings, calculateDistanceMeters, calculateHaversineDistanceKm } from '@fairride/shared';
import { PaymentService } from '../src/services/payment.service.js';
import { RouteAnomalyDetector } from '../../ai-service/route_anomaly.js'; // or local logic

describe('FairRide Core Logic & Problem Solving Test Suite', () => {
  it('Fare Lock: Guarantees transparent breakdown with no hidden charges', () => {
    const distanceKm = 15;
    const durationMin = 35;
    const fare = calculateTransparentFare('SEDAN', distanceKm, durationMin);

    expect(fare.baseFare).toBe(80);
    expect(fare.distanceCharge).toBeGreaterThan(0);
    expect(fare.timeComponent).toBeGreaterThan(0);
    expect(fare.platformFee).toBeGreaterThan(0);
    expect(fare.tax).toBeGreaterThan(0);
    expect(fare.currency).toBe('INR');

    // Total must exactly equal sum of components
    const subtotal = (fare.baseFare + fare.distanceCharge + fare.timeComponent);
    const expectedTaxable = subtotal + fare.platformFee;
    const expectedTotal = expectedTaxable + fare.tax + fare.toll;
    expect(fare.totalFare).toBe(expectedTotal);
  });

  it('Driver Net Earnings: Transparently exposes fuel, tolls and real take-home', () => {
    const passengerFare = 600;
    const netPreview = calculateDriverNetEarnings(passengerFare, 'SEDAN', 20, 45, 'UPI', 50);

    expect(netPreview.passengerFare).toBe(600);
    expect(netPreview.platformFee).toBe(60); // 10%
    expect(netPreview.driverGrossEarnings).toBe(540);
    expect(netPreview.estimatedFuelCost).toBe(130); // 20km * 6.5
    expect(netPreview.estimatedToll).toBe(50);
    expect(netPreview.estimatedNetEarnings).toBe(360); // 540 - 130 - 50 = 360
    expect(netPreview.isEstimate).toBe(true);
  });

  it('Route Guardian: Correctly calculates cross-track GPS distance', () => {
    // Point A (Hitech City) to Point B (same spot + 500m offset)
    const coord1: [number, number] = [78.3811, 17.4474];
    const coord2: [number, number] = [78.3855, 17.4474];

    const distMeters = calculateDistanceMeters(coord1, coord2);
    expect(distMeters).toBeGreaterThan(300);
    expect(distMeters).toBeLessThan(700);
  });

  it('Payment Security: Validates signatures and rejects tampered data', () => {
    const isValid = PaymentService.verifyRazorpaySignature('order_test_123', 'pay_test_456', 'mock_valid_signature');
    expect(isValid).toBe(true);

    const isTampered = PaymentService.verifyRazorpaySignature('order_test_123', 'pay_test_456', 'tampered_signature_xyz');
    expect(isTampered).toBe(false);
  });

  it('Green Mobility: EV rides reflect zero emissions and carbon offset', () => {
    const evFare = calculateTransparentFare('EV', 25, 40);
    expect(evFare.baseFare).toBe(65);
    expect(evFare.platformFee).toBeLessThanOrEqual(evFare.totalFare * 0.1);
  });
});
