import { Driver, FraudAlert } from '../models/index.js';

export class AntiCancellationEngine {
  /**
   * Tracks and evaluates driver cancellation behavior
   */
  static async recordAndAnalyzeCancellation(
    driverId: string,
    reason: string,
    wasAfterPassengerContact = false,
    passengerReportedDemandingCash = false
  ) {
    const driver = await Driver.findById(driverId);
    if (!driver) return null;

    // Record the event
    driver.recentCancellationEvents.push({
      reason,
      timestamp: new Date(),
      wasAfterContact: wasAfterPassengerContact
    });

    // Update cancellation stats
    driver.cancellationRate = Math.min(100, Number(((driver.cancellationRate || 2) + 0.5).toFixed(1)));
    await driver.save();

    // Analyze pattern in the last 7 days
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentEvents = driver.recentCancellationEvents.filter((e) => new Date(e.timestamp) > oneWeekAgo);

    const postContactCancels = recentEvents.filter((e) => e.wasAfterContact).length;
    let suspicionScore = 0;
    const signals: string[] = [];

    if (passengerReportedDemandingCash) {
      suspicionScore += 0.55;
      signals.push('Passenger reported driver demanding offline cash beyond locked fare');
    }

    if (postContactCancels >= 2) {
      suspicionScore += 0.35;
      signals.push(`${postContactCancels} cancellations immediately following passenger contact in past week`);
    }

    if (recentEvents.length >= 4) {
      suspicionScore += 0.25;
      signals.push(`${recentEvents.length} total cancellations recorded this week`);
    }

    if (suspicionScore >= 0.50) {
      // Create operational review flag - Never auto-ban
      await FraudAlert.create({
        userId: driver.userId,
        userRole: 'DRIVER',
        category: 'SUSPICIOUS_CANCELLATION',
        riskLevel: suspicionScore >= 0.75 ? 'HIGH_RISK' : 'REVIEW',
        confidenceScore: Math.min(1.0, suspicionScore),
        evidenceSummary: `Suspicious cancellation pattern detected: ${signals.join('; ')}`,
        metadata: {
          driverId: driver._id,
          totalCancellationsWeek: recentEvents.length,
          postContactCancels,
          signals
        },
        status: 'PENDING_REVIEW',
        actionTaken: 'NONE'
      });

      console.log(`[AntiCancellationEngine] Flagged driver ${driverId} for Operations Review. Score: ${suspicionScore}`);
    }

    return {
      flaggedForReview: suspicionScore >= 0.50,
      signals,
      suspicionScore
    };
  }
}
