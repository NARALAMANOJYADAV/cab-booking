class ETAPredictor:
    def __init__(self):
        pass

    def predict(self, distance_km: float, hour: int = 14, day_of_week: int = 2,
                corridor_traffic_index: float = 1.0, weather_condition: str = "CLEAR") -> dict:
        # Base urban speed
        base_speed_kmph = 26.0

        # Time of day congestion curve
        time_multipliers = {
            # Morning peak
            8: 1.35, 9: 1.45, 10: 1.30,
            # Evening peak
            17: 1.40, 18: 1.50, 19: 1.45, 20: 1.25,
            # Late night
            23: 0.85, 0: 0.80, 1: 0.75, 2: 0.75, 3: 0.75, 4: 0.80
        }
        time_factor = time_multipliers.get(hour, 1.0)

        # Weather factor
        weather_factors = {"CLEAR": 1.0, "RAIN": 1.25, "HEAVY_RAIN": 1.50, "FOG": 1.20}
        weather_factor = weather_factors.get(weather_condition.upper(), 1.0)

        total_multiplier = corridor_traffic_index * time_factor * weather_factor
        effective_speed = max(10.0, base_speed_kmph / total_multiplier)

        predicted_minutes = (distance_km / effective_speed) * 60.0
        predicted_min = max(4, int(round(predicted_minutes * 0.90)))
        predicted_max = max(6, int(round(predicted_minutes * 1.15)))
        expected = max(5, int(round(predicted_minutes)))

        return {
            "predicted_eta_minutes": expected,
            "eta_range": {
                "min_minutes": predicted_min,
                "max_minutes": predicted_max
            },
            "effective_speed_kmph": round(effective_speed, 1),
            "traffic_impact_factor": round(total_multiplier, 2),
            "confidence": 0.91
        }
