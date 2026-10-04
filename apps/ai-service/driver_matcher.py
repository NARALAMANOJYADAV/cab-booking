from typing import List, Dict, Any

class DriverMatchingAssistance:
    def __init__(self):
        pass

    def rank_candidates(
        self,
        ride_requirements: Dict[str, Any],
        drivers: List[Dict[str, Any]],
        weights: Dict[str, float] = None
    ) -> List[Dict[str, Any]]:
        """
        Rank available drivers based on multi-factor weighted scoring.
        AI assists dispatch ranking without black-box lock-in.
        """
        if weights is None:
            weights = {
                "eta": 0.30,
                "distance": 0.20,
                "driver_reliability": 0.15,
                "vehicle_compatibility": 0.15,
                "current_workload": 0.10,
                "fairness": 0.10
            }

        ranked_results = []

        required_category = ride_requirements.get("vehicle_category", "SEDAN")
        special_reqs = ride_requirements.get("special_requirements", [])

        for d in drivers:
            # 1. Compatibility check
            is_compat = (d.get("vehicle_category") == required_category)
            # Special mobility check (e.g. wheelchair accessible)
            if "WHEELCHAIR" in special_reqs and not d.get("is_wheelchair_accessible", False):
                continue

            compat_score = 1.0 if is_compat else 0.5

            # 2. ETA Score (lower is better, e.g. 2 min = 1.0, 15 min = 0.1)
            eta_min = max(1, d.get("eta_minutes", 5))
            eta_score = max(0.1, 1.0 - (eta_min / 20.0))

            # 3. Distance Score (lower is better, e.g. 0.5 km = 1.0, 8 km = 0.1)
            dist_km = max(0.1, d.get("distance_to_pickup_km", 2.0))
            dist_score = max(0.1, 1.0 - (dist_km / 10.0))

            # 4. Reliability Score (driver rating 0-5, cancellation rate 0-1)
            rating = d.get("rating", 4.8) / 5.0
            cancel_penalty = d.get("cancellation_rate", 0.05)
            reliability_score = max(0.2, (rating * 0.8) - (cancel_penalty * 0.5))

            # 5. Current Workload / Shift hours (prevent driver fatigue)
            hours_today = d.get("hours_online_today", 3.0)
            workload_score = 1.0 if hours_today < 6.0 else (0.6 if hours_today < 9.0 else 0.2)

            # 6. Operational Fairness (help drivers who haven't had a ride recently)
            idle_minutes = d.get("idle_minutes_since_last_ride", 15)
            fairness_score = min(1.0, 0.4 + (idle_minutes / 60.0))

            # Calculate composite weighted score
            final_score = (
                (eta_score * weights.get("eta", 0.30)) +
                (dist_score * weights.get("distance", 0.20)) +
                (reliability_score * weights.get("driver_reliability", 0.15)) +
                (compat_score * weights.get("vehicle_compatibility", 0.15)) +
                (workload_score * weights.get("current_workload", 0.10)) +
                (fairness_score * weights.get("fairness", 0.10))
            )

            ranked_results.append({
                "driver_id": d.get("driver_id"),
                "driver_name": d.get("name"),
                "vehicle_model": d.get("vehicle_model"),
                "total_score": round(final_score, 4),
                "eta_minutes": eta_min,
                "distance_km": round(dist_km, 2),
                "breakdown": {
                    "eta_score": round(eta_score, 3),
                    "distance_score": round(dist_score, 3),
                    "reliability_score": round(reliability_score, 3),
                    "compatibility_score": round(compat_score, 3),
                    "fatigue_workload_score": round(workload_score, 3),
                    "fairness_score": round(fairness_score, 3)
                }
            })

        # Sort descending by total score
        ranked_results.sort(key=lambda x: x["total_score"], reverse=True)
        return ranked_results
