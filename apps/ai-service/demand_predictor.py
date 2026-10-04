from typing import List, Dict, Any

class DemandPredictor:
    def __init__(self):
        pass

    def predict_zone_demand(self, zone_name: str, hour: int = 17, is_weekend: bool = False) -> Dict[str, Any]:
        # High demand hubs: Airport, IT Corridor (Hitech City, Whitefield), Central Station
        zone_lower = zone_name.lower()

        if "airport" in zone_lower:
            # Airports have high demand across early morning (4-7 AM) and late night (9 PM-1 AM)
            if 4 <= hour <= 7 or 21 <= hour <= 24 or hour <= 1:
                level = "HIGH"
                score = 0.92
            else:
                level = "MEDIUM"
                score = 0.65
        elif any(k in zone_lower for k in ["hitech", "cyber", "whitefield", "electronic city", "financial"]):
            # Tech parks peak at morning and evening commutes
            if 8 <= hour <= 11 or 17 <= hour <= 20:
                level = "HIGH"
                score = 0.95
            elif 12 <= hour <= 16:
                level = "MEDIUM"
                score = 0.58
            else:
                level = "LOW"
                score = 0.25
        elif any(k in zone_lower for k in ["station", "railway", "bus stand", "metro"]):
            level = "HIGH" if (6 <= hour <= 22) else "MEDIUM"
            score = 0.85 if level == "HIGH" else 0.50
        else:
            if 8 <= hour <= 21:
                level = "MEDIUM"
                score = 0.55
            else:
                level = "LOW"
                score = 0.20

        return {
            "zone_name": zone_name,
            "demand_level": level,
            "demand_intensity_score": score,
            "suggested_driver_incentive": "1.2x" if level == "HIGH" else "1.0x",
            "active_rides_probability": "HIGH" if score > 0.8 else "NORMAL"
        }

    def generate_heatmap(self, city: str = "Hyderabad") -> List[Dict[str, Any]]:
        # Returns current and next 2-hour predicted demand for hotspots
        hotspots = [
            {"name": "Hitech City Cyber Towers", "coords": [78.3811, 17.4474], "base_score": 0.92},
            {"name": "Gachibowli Financial District", "coords": [78.3498, 17.4239], "base_score": 0.88},
            {"name": "RGIA Airport Terminal 1 & 2", "coords": [78.4298, 17.2403], "base_score": 0.85},
            {"name": "Secunderabad Railway Hub", "coords": [78.5029, 17.4344], "base_score": 0.70},
            {"name": "Banjara Hills Road No 12", "coords": [78.4412, 17.4156], "base_score": 0.65},
            {"name": "Kukatpally Housing Board (KPHB)", "coords": [78.3995, 17.4933], "base_score": 0.75},
            {"name": "Charminar Old City", "coords": [78.4747, 17.3616], "base_score": 0.40}
        ]

        results = []
        for spot in hotspots:
            score = spot["base_score"]
            level = "HIGH" if score >= 0.75 else ("MEDIUM" if score >= 0.50 else "LOW")
            results.append({
                "name": spot["name"],
                "coordinates": spot["coords"],
                "current_demand": level,
                "intensity": score,
                "predicted_next_hour": "HIGH" if score > 0.65 else level,
                "drivers_needed_ratio": 1.4 if level == "HIGH" else 1.0
            })
        return results
