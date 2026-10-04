from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Tuple

from fare_predictor import FarePredictor
from eta_predictor import ETAPredictor
from demand_predictor import DemandPredictor
from cancellation_risk import CancellationRiskAnalyzer
from fraud_detector import FraudDetector
from driver_matcher import DriverMatchingAssistance
from route_anomaly import RouteAnomalyDetector

app = FastAPI(
    title="FairRide AI & Mobility Intelligence Service",
    description="Intelligent models for Fare, ETA, Demand, Cancellation Risk, Fraud and Route Guardian",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fare_service = FarePredictor()
eta_service = ETAPredictor()
demand_service = DemandPredictor()
cancellation_service = CancellationRiskAnalyzer()
fraud_service = FraudDetector()
matcher_service = DriverMatchingAssistance()
anomaly_service = RouteAnomalyDetector()

# --- Request Models ---

class FarePredictRequest(BaseModel):
    distance_km: float = Field(..., gt=0)
    duration_min: float = Field(..., gt=0)
    vehicle_category: str = "SEDAN"
    hour: int = 12
    day_of_week: int = 2
    demand_level: str = "MEDIUM"
    toll: float = 0.0

class ETAPredictRequest(BaseModel):
    distance_km: float = Field(..., gt=0)
    hour: int = 14
    day_of_week: int = 2
    corridor_traffic_index: float = 1.0
    weather_condition: str = "CLEAR"

class DemandPredictRequest(BaseModel):
    zone_name: str
    hour: int = 17
    is_weekend: bool = False

class CancellationRiskRequest(BaseModel):
    pickup_distance_km: float
    driver_historical_cancellation_rate: float
    time_to_pickup_min: float
    is_cash_trip: bool = False
    recent_cancellations_count_today: int = 0

class CancellationAbuseCheckRequest(BaseModel):
    driver_id: str
    recent_events: List[Dict[str, Any]]

class FraudCheckRequest(BaseModel):
    user_id: str
    category: str
    metadata: Dict[str, Any]

class DriverMatchRequest(BaseModel):
    ride_requirements: Dict[str, Any]
    drivers: List[Dict[str, Any]]
    weights: Optional[Dict[str, float]] = None

class RouteDeviationRequest(BaseModel):
    current_gps: Tuple[float, float]
    expected_route_polyline: List[Tuple[float, float]]
    custom_tolerance_meters: Optional[float] = None

# --- Endpoints ---

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "FairRide AI Engine",
        "version": "1.0.0"
    }

@app.post("/api/v1/ai/predict-fare")
def predict_fare(req: FarePredictRequest):
    return fare_service.predict(
        distance_km=req.distance_km,
        duration_min=req.duration_min,
        vehicle_category=req.vehicle_category,
        hour=req.hour,
        day_of_week=req.day_of_week,
        demand_level=req.demand_level,
        toll=req.toll
    )

@app.post("/api/v1/ai/predict-eta")
def predict_eta(req: ETAPredictRequest):
    return eta_service.predict(
        distance_km=req.distance_km,
        hour=req.hour,
        day_of_week=req.day_of_week,
        corridor_traffic_index=req.corridor_traffic_index,
        weather_condition=req.weather_condition
    )

@app.post("/api/v1/ai/predict-demand")
def predict_demand(req: DemandPredictRequest):
    return demand_service.predict_zone_demand(
        zone_name=req.zone_name,
        hour=req.hour,
        is_weekend=req.is_weekend
    )

@app.get("/api/v1/ai/demand-heatmap")
def demand_heatmap(city: str = "Hyderabad"):
    return {
        "city": city,
        "hotspots": demand_service.generate_heatmap(city)
    }

@app.post("/api/v1/ai/cancellation-risk")
def cancellation_risk(req: CancellationRiskRequest):
    return cancellation_service.evaluate_driver_cancellation_risk(
        pickup_distance_km=req.pickup_distance_km,
        driver_historical_cancellation_rate=req.driver_historical_cancellation_rate,
        time_to_pickup_min=req.time_to_pickup_min,
        is_cash_trip=req.is_cash_trip,
        recent_cancellations_count_today=req.recent_cancellations_count_today
    )

@app.post("/api/v1/ai/cancellation-abuse-check")
def cancellation_abuse_check(req: CancellationAbuseCheckRequest):
    return cancellation_service.detect_suspicious_cancellation_abuse(
        driver_id=req.driver_id,
        recent_events=req.recent_events
    )

@app.post("/api/v1/ai/fraud-check")
def fraud_check(req: FraudCheckRequest):
    return fraud_service.evaluate_transaction_or_activity(
        user_id=req.user_id,
        category=req.category,
        metadata=req.metadata
    )

@app.post("/api/v1/ai/driver-matching")
def driver_matching(req: DriverMatchRequest):
    return {
        "ranked_drivers": matcher_service.rank_candidates(
            ride_requirements=req.ride_requirements,
            drivers=req.drivers,
            weights=req.weights
        )
    }

@app.post("/api/v1/ai/check-route-deviation")
def check_route_deviation(req: RouteDeviationRequest):
    return anomaly_service.check_deviation(
        current_gps=req.current_gps,
        expected_route_polyline=req.expected_route_polyline,
        custom_tolerance_meters=req.custom_tolerance_meters
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
