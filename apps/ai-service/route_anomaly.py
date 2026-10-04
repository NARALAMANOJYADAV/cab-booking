import math
from typing import Dict, Any, List, Tuple

class RouteAnomalyDetector:
    def __init__(self, default_tolerance_meters: float = 350.0):
        self.default_tolerance_meters = default_tolerance_meters

    def _haversine_meters(self, coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
        lng1, lat1 = coord1
        lng2, lat2 = coord2
        R = 6371000  # meters
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lng2 - lng1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def check_deviation(
        self,
        current_gps: Tuple[float, float],
        expected_route_polyline: List[Tuple[float, float]],
        custom_tolerance_meters: float = None
    ) -> Dict[str, Any]:
        """
        Calculates cross-track distance to the closest point along the expected route.
        """
        tolerance = custom_tolerance_meters if custom_tolerance_meters is not None else self.default_tolerance_meters

        if not expected_route_polyline:
            return {
                "deviation_detected": False,
                "distance_from_route_meters": 0.0,
                "tolerance_threshold_meters": tolerance,
                "status": "NORMAL"
            }

        # Find closest point on planned route
        min_dist = float("inf")
        closest_point = None

        for pt in expected_route_polyline:
            d = self._haversine_meters(current_gps, pt)
            if d < min_dist:
                min_dist = d
                closest_point = pt

        deviation_detected = min_dist > tolerance

        if min_dist > (tolerance * 2.5):
            alert_priority = "HIGH"
        elif min_dist > tolerance:
            alert_priority = "MEDIUM"
        else:
            alert_priority = "NORMAL"

        return {
            "deviation_detected": deviation_detected,
            "distance_from_route_meters": round(min_dist, 1),
            "tolerance_threshold_meters": tolerance,
            "closest_expected_point": closest_point,
            "alert_priority": alert_priority,
            "message": (
                "Significant route deviation detected. Route Guardian alert initiated."
                if deviation_detected else "Route within acceptable navigational tolerance."
            ),
            "safety_prompt_options": ["IM_SAFE", "NEED_HELP", "EMERGENCY"] if deviation_detected else []
        }
