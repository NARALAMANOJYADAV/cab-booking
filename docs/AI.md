# FairRide AI & Mobility Intelligence Service

FairRide incorporates a dedicated Python FastAPI microservice (`apps/ai-service`) running predictive models, decision support heuristics, and fraud detection algorithms.

---

## 1. Principles of AI in FairRide

1. **Decision Support, Not Blind Automation**:
   - AI outputs assist human dispatchers and safety agents.
   - Accounts are **never** automatically terminated or suspended solely from an ML prediction without human review.
2. **Explainability**:
   - Every prediction includes feature attributions (e.g. distance impact, time impact, demand level).
3. **High-Availability Fallback**:
   - The Node.js backend features built-in fallback heuristics to guarantee 100% platform uptime even if the AI microservice is temporarily rebooting.

---

## 2. Machine Learning Modules

### 1. Fare Prediction (`fare_predictor.py`)
- **Features**: Distance (km), Estimated duration (min), Vehicle Category, Hour of day, Day of week, Demand factor (Low / Medium / High), Tolls.
- **Output**:
  - `predicted_fare_range`: `{ min, max, expected }`
  - `confidence_score`: (e.g. 0.94)
  - `feature_attributions`: Transparent percentage impact of distance, time, and demand factors.

### 2. ETA Prediction (`eta_predictor.py`)
- **Features**: Distance, Hour of day, Corridor traffic index (historical congestion curves), Weather conditions (Clear, Rain, Heavy Rain, Fog).
- **Output**:
  - `predicted_eta_minutes`
  - `eta_range`: Lower and upper bounds
  - `effective_speed_kmph`

### 3. Demand Prediction & Heatmap (`demand_predictor.py`)
- **Methodology**: Analyzes historical ride frequency by geographic clusters (Tech parks, Airports, Central railway hubs) across temporal hours.
- **Output**:
  - Classified zones: `HIGH`, `MEDIUM`, `LOW`
  - `demand_intensity_score` (0.0 to 1.0)
  - Driver incentive recommendations (`1.2x`, `1.0x`) to balance supply without exploiting passengers.

### 4. Cancellation Risk Analyzer (`cancellation_risk.py`)
- **Objective**: Evaluates the probability of driver cancellation to prepare the Auto-Recovery engine in advance.
- **Features**: Pickup distance (km), driver historical cancellation rate, time to arrival, recent cancellations recorded today.
- **Anti-Abuse Pattern Recognition**:
  - Flags drivers who repeatedly:
    1. Accept ride
    2. Contact passenger
    3. Solicit offline cash
    4. Cancel if passenger insists on locked app fare
  - Generates an operational review flag (`SUSPICIOUS_CANCELLATION`) in the Admin Fraud Center without making accusations.

### 5. Fraud Detection (`fraud_detector.py`)
- **Categories**:
  - `REFERRAL_ABUSE`: Device hardware fingerprint matching across multiple accounts, missing qualifying rides.
  - `GPS_ANOMALY`: Physical impossibility checks (speeds exceeding 180 km/h) and mock location spoofer detection.
  - `PAYMENT_ANOMALY`: Velocity failures and prior chargeback histories.
  - `COUPON_ABUSE`: Repeated promotion attempts with identical payment instruments.
- **Outputs**: `NORMAL`, `REVIEW`, `HIGH_RISK`.

### 6. Multi-Factor Driver Matching (`driver_matcher.py`)
- **Configurable Multi-Factor Scoring**:
  $$\text{Score} = (\text{ETA} \times 0.30) + (\text{Distance} \times 0.20) + (\text{Reliability} \times 0.15) + (\text{Vehicle Compatibility} \times 0.15) + (\text{Workload} \times 0.10) + (\text{Fairness} \times 0.10)$$
- **Workload / Fatigue Balancing**: Prevents driver exhaustion by penalizing drivers online for > 8 hours.
- **Operational Fairness**: Slightly prioritizes eligible drivers who have been idle longer.

### 7. Route Anomaly Detection (`route_anomaly.py`)
- **Route Guardian Watchdog**:
  - Computes cross-track Haversine distance between current vehicle GPS and nearest point along expected route polyline.
  - Compares distance against configurable tolerance buffer ($300\text{m}$).
  - Accommodates legitimate road closures and traffic diversions while promptly flagging acute departures ($>800\text{m}$) for passenger check-in.
