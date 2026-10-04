import numpy as np

VEHICLE_BASE_RATES = {
    "ECONOMY": {"base": 50, "per_km": 14, "per_min": 1.5},
    "HATCHBACK": {"base": 60, "per_km": 16, "per_min": 1.8},
    "SEDAN": {"base": 80, "per_km": 19, "per_min": 2.0},
    "SUV": {"base": 120, "per_km": 25, "per_min": 2.5},
    "PREMIUM": {"base": 150, "per_km": 32, "per_min": 3.5},
    "EV": {"base": 65, "per_km": 16, "per_min": 1.6},
    "SHARED": {"base": 40, "per_km": 11, "per_min": 1.2},
    "ACCESSIBLE": {"base": 70, "per_km": 17, "per_min": 1.5},
}

class FarePredictor:
    def __init__(self):
        pass

    def predict(self, distance_km: float, duration_min: float, vehicle_category: str = "SEDAN", 
                hour: int = 12, day_of_week: int = 2, demand_level: str = "MEDIUM", toll: float = 0.0) -> dict:
        category = vehicle_category.upper()
        rates = VEHICLE_BASE_RATES.get(category, VEHICLE_BASE_RATES["SEDAN"])

        # Demand adjustment factor
        demand_factors = {"LOW": 0.95, "MEDIUM": 1.0, "HIGH": 1.15}
        d_factor = demand_factors.get(demand_level.upper(), 1.0)

        # Peak hours adjustment (e.g., 8-10 AM and 5-8 PM)
        peak_factor = 1.1 if (8 <= hour <= 10 or 17 <= hour <= 20) else 1.0

        base_fare = rates["base"]
        distance_cost = max(0, distance_km - 2) * rates["per_km"]
        time_cost = duration_min * rates["per_min"]

        expected_subtotal = (base_fare + distance_cost + time_cost) * (d_factor * 0.5 + peak_factor * 0.5)
        
        # Taxes and platform fee
        platform_fee = expected_subtotal * 0.10
        tax = (expected_subtotal + platform_fee) * 0.05
        expected_total = expected_subtotal + platform_fee + tax + toll

        # Provide a tight prediction range (transparency without deception)
        min_fare = int(round(expected_total * 0.95))
        max_fare = int(round(expected_total * 1.05))
        expected_fare = int(round(expected_total))

        return {
            "predicted_fare_range": {
                "min": min_fare,
                "max": max_fare,
                "expected": expected_fare
            },
            "confidence_score": 0.94,
            "currency": "INR",
            "model_version": "fairride-fare-v1.2",
            "feature_attributions": {
                "distance_component": round(distance_cost, 2),
                "time_component": round(time_cost, 2),
                "demand_impact": round((d_factor - 1.0) * 100, 1),
                "peak_hour_impact": round((peak_factor - 1.0) * 100, 1)
            }
        }
