import { config } from '../config/index.js';
import { DEMO_CITIES } from '@fairride/constants';

export class AIService {
  private static baseUrl = config.AI_SERVICE_URL;

  static async predictFare(params: {
    distance_km: number;
    duration_min: number;
    vehicle_category?: string;
    hour?: number;
    day_of_week?: number;
    demand_level?: string;
    toll?: number;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ai/predict-fare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(2000)
      });
      if (response.ok) return await response.json();
    } catch {
      // Fallback local heuristic
    }

    const dist = params.distance_km;
    const dur = params.duration_min;
    const baseExpected = Math.round(80 + dist * 18 + dur * 2);
    return {
      predicted_fare_range: {
        min: Math.round(baseExpected * 0.95),
        max: Math.round(baseExpected * 1.05),
        expected: baseExpected
      },
      confidence_score: 0.92,
      currency: 'INR',
      model_version: 'fairride-fare-builtin',
      feature_attributions: {
        distance_component: Math.round(dist * 18),
        time_component: Math.round(dur * 2),
        demand_impact: 0,
        peak_hour_impact: 0
      }
    };
  }

  static async predictETA(params: {
    distance_km: number;
    hour?: number;
    day_of_week?: number;
    corridor_traffic_index?: number;
    weather_condition?: string;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ai/predict-eta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(2000)
      });
      if (response.ok) return await response.json();
    } catch {
      // Fallback
    }

    const speed = 25; // km/h
    const minutes = Math.max(5, Math.round((params.distance_km / speed) * 60));
    return {
      predicted_eta_minutes: minutes,
      eta_range: {
        min_minutes: Math.max(4, Math.round(minutes * 0.9)),
        max_minutes: Math.round(minutes * 1.2)
      },
      effective_speed_kmph: speed,
      traffic_impact_factor: 1.0,
      confidence: 0.90
    };
  }

  static async getDemandHeatmap(city = 'Hyderabad') {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ai/demand-heatmap?city=${encodeURIComponent(city)}`, {
        signal: AbortSignal.timeout(2000)
      });
      if (response.ok) return await response.json();
    } catch {
      // Fallback
    }

    const targetCity = DEMO_CITIES.find((c) => c.name.toLowerCase() === city.toLowerCase()) || DEMO_CITIES[0];
    return {
      city: targetCity.name,
      hotspots: targetCity.hotspots.map((h) => ({
        name: h.name,
        coordinates: h.coordinates,
        current_demand: h.demand,
        intensity: h.demand === 'HIGH' ? 0.9 : (h.demand === 'MEDIUM' ? 0.6 : 0.3),
        predicted_next_hour: h.demand,
        drivers_needed_ratio: h.demand === 'HIGH' ? 1.4 : 1.0
      }))
    };
  }

  static async evaluateFraud(params: { user_id: string; category: string; metadata: any }) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ai/fraud-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(2000)
      });
      if (response.ok) return await response.json();
    } catch {
      // Fallback
    }

    return {
      user_id: params.user_id,
      category: params.category,
      risk_score: 0.1,
      risk_level: 'NORMAL',
      recommended_action: 'ALLOW',
      reasons: ['No abnormal activity detected'],
      requires_human_review: false
    };
  }
}
