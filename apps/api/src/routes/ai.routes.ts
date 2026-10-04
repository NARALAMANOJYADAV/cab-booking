import { Router, Request, Response } from 'express';
import { AIService } from '../services/ai.service.js';
import { VehicleCategory } from '@fairride/types';

export const aiRouter = Router();

/**
 * Predict Fare range using AI model
 */
aiRouter.post('/predict-fare', async (req: Request, res: Response) => {
  try {
    const result = await AIService.predictFare(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Predict ETA using AI model
 */
aiRouter.post('/predict-eta', async (req: Request, res: Response) => {
  try {
    const result = await AIService.predictETA(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Get Demand Heatmap
 */
aiRouter.get('/demand-heatmap', async (req: Request, res: Response) => {
  try {
    const city = (req.query.city as string) || 'Hyderabad';
    const result = await AIService.getDemandHeatmap(city);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Voice Booking Natural Language Parser:
 * Converts spoken/typed sentence into structured intent:
 * "Book a sedan from my home to Hyderabad airport tomorrow at 5 AM"
 */
aiRouter.post('/parse-voice-booking', (req: Request, res: Response) => {
  const { transcript } = req.body;
  if (!transcript || typeof transcript !== 'string') {
    res.status(400).json({ success: false, message: 'transcript is required' });
    return;
  }

  const text = transcript.toLowerCase();

  // Extract category
  let vehicleCategory: VehicleCategory = 'SEDAN';
  if (text.includes('suv')) vehicleCategory = 'SUV';
  else if (text.includes('economy') || text.includes('cheap') || text.includes('hatchback')) vehicleCategory = 'ECONOMY';
  else if (text.includes('ev') || text.includes('electric') || text.includes('green')) vehicleCategory = 'EV';
  else if (text.includes('share') || text.includes('shared')) vehicleCategory = 'SHARED';
  else if (text.includes('accessible') || text.includes('wheelchair')) vehicleCategory = 'ACCESSIBLE';
  else if (text.includes('prime') || text.includes('luxury') || text.includes('premium')) vehicleCategory = 'PREMIUM';

  // Extract pickup & destination
  let pickup = 'Current Location';
  let destination = 'Destination';

  if (text.includes('from') && text.includes('to')) {
    const parts = text.split('to');
    const fromPart = parts[0].split('from')[1];
    pickup = fromPart ? fromPart.trim() : 'Current Location';
    destination = parts[1] ? parts[1].replace(/tomorrow|today|at.*/g, '').trim() : 'Destination';
  } else if (text.includes('to')) {
    const parts = text.split('to');
    destination = parts[1] ? parts[1].replace(/tomorrow|today|at.*/g, '').trim() : 'Destination';
  }

  // Capitalize nicely
  pickup = pickup.charAt(0).toUpperCase() + pickup.slice(1);
  destination = destination.charAt(0).toUpperCase() + destination.slice(1);

  // Time and Date parsing
  const isTomorrow = text.includes('tomorrow');
  const scheduledDate = isTomorrow ? 'Tomorrow' : 'Today';

  let scheduledTime = 'Now (Immediate)';
  const timeMatch = text.match(/(\d{1,2}(:\d{2})?\s*(am|pm))/i);
  if (timeMatch) {
    scheduledTime = timeMatch[0].toUpperCase();
  }

  res.json({
    success: true,
    data: {
      rawTranscript: transcript,
      pickup: pickup || 'Home',
      destination: destination || 'Airport',
      vehicleCategory,
      scheduledDate,
      scheduledTime,
      estimatedFareRange: {
        min: 450,
        max: 530,
        expected: 490
      },
      confidenceScore: 0.94,
      confirmationRequired: true
    }
  });
});
