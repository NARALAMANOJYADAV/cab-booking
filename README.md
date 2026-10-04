# FAIRRIDE

> **Tagline:** *"Book With Confidence."*

FairRide is a production-quality, full-stack, trust-first intelligent mobility platform. It is **NOT** a clone of legacy cab aggregators. Instead, FairRide is architected from the ground up to systematically resolve the 25 most frequent structural problems in modern ride-hailing platforms.

---

## 🚀 Key Innovations & Problems Solved

1. **Driver Demanding Extra Cash**: Eliminated via the **Fare Lock System** and server-side guaranteed upfront contract.
2. **Post-Acceptance Driver Cancellations**: Automatically handled by the **Auto-Recovery Engine**, which seamlessly pairs the next best driver with zero passenger penalty.
3. **Unexpected Charges & Surge Spikes**: Every fee component (Base, Km, Minute, Fastag Toll, Platform Fee, GST) is locked before booking and verified post-trip via a downloadable **Fare Audit Receipt**.
4. **Driver Net Earnings Uncertainty**: Drivers preview their exact **Net Take-Home** (Gross minus 10% platform fee minus estimated fuel cost and tolls) before accepting any trip.
5. **Route Deviations & Detours**: **Route Guardian** actively monitors real-time GPS coordinates against a 300m corridor buffer, offering instant passenger check-in (`I'M SAFE`, `NEED HELP`, `EMERGENCY SOS`).
6. **Poor Pickup Coordination**: **Smart Pickup Points** specify exact Gates, Metro Exits, and Airport Terminals (e.g., "Meet at Gate 1 near security kiosk").
7. **Elderly Accessibility**: Built-in **Senior Mode** with high contrast, large touch targets, simplified 1-tap navigation, and speech-driven **Natural Voice Booking**.
8. **Slow/Unstable Internet**: **FairRide Lite Mode** minimizes bandwidth consumption, removes heavy animations, caches saved places, and uses idempotency retry keys.
9. **Evidence-Based Dispute Resolution**: Support tickets automatically assemble an immutable evidence bundle (FareLock quote, final fare, GPS coordinate count, and timeline events) for 1-click admin refunds.
10. **Corporate Travel Chaos**: Dedicated **Corporate Portal** with department budget tracking, employee directories, and a manager ride approval queue.
11. **Fragmented Airport Rides**: **Airport Mode** with flight number tracking, terminal guidance, and scheduled pickup buffers.
12. **Blind Cruising**: **AI Demand Heatmap** categorizes High, Medium, and Low passenger volume zones so drivers save fuel.
13. **Referral & Coupon Abuse**: Hardware device fingerprinting and qualifying trip completion requirements prevent promo fraud.
14. **Multimodal Options**: Integrated journey planner comparing Direct Cab, Cab + Metro, Bus + Metro, and Shared Ride.
15. **Green Mobility**: EV vehicle prioritization with real-time calculated CO2 emissions avoided.

---

## 👥 The Four Primary Roles

FairRide serves four distinct roles with dedicated interfaces and permissions:

1. **Passenger**: Smart Search, Pickup coordination, Fare Lock, 4-Digit Boarding PIN, Live GPS Tracking, Auto-Recovery experience, Fare Audit download, Ledger Wallet, Voice Booking, Senior Mode.
2. **Driver**: Online/Offline toggle, Net Earnings Preview, Ride Accept/Decline (with reason logging), Boarding PIN entry, Active GPS Navigation, AI Demand Heatmaps, Earnings payouts.
3. **Admin / Operations**: Live Operations fleet map, KPI dashboard, **Safety Operations Console** (CRITICAL/HIGH SOS triage), **Evidence-Based Dispute Resolution Panel**, Fraud AI alerts, Pricing rules, and Immutable Audit Trail.
4. **Corporate Organization**: Corporate travel dashboard, Department budget allocations, Travel policy configurations, and **Manager Ride Approval Queue**.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Zustand, TanStack Query, Responsive Mobile-First PWA design.
- **Backend**: Node.js 22, Express.js, TypeScript, Socket.IO, Mongoose, Redis caching with graceful in-memory fallback, Helmet, CORS, Zod validation.
- **Database**: MongoDB with `2dsphere` geospatial indexing and ledger-based wallet models. (Includes zero-setup auto-fallback to `mongodb-memory-server` for effortless local execution!).
- **AI Microservice**: Python 3.12, FastAPI, Uvicorn, Scikit-Learn (Fare prediction, ETA predictor, Demand heatmap, Cancellation risk analyzer, Fraud detection, Route Guardian).
- **Payment & Security**: Razorpay webhook verification with HMAC-SHA256 signatures, JWT access + refresh tokens, bcrypt password hashing, and idempotency protection.

---

## 📂 Project Monorepo Structure

```
fairride/
├── apps/
│   ├── web/               # React 18 + Vite Frontend Application
│   │   ├── src/components/ # InteractiveMap, FareLockBadge, DriverEarningsCard, etc.
│   │   ├── src/pages/      # Passenger, Driver, Admin, and Corporate Portals
│   │   └── src/store/      # Zustand app store with instant 4-Role Switcher
│   │
│   ├── api/               # Node.js + Express + Socket.IO Backend
│   │   ├── src/models/     # Mongoose models (Booking, Driver, FareLock, Dispute, etc.)
│   │   ├── src/services/   # Dispatch, Auto-Recovery, Fare, Payment, Safety, AI
│   │   ├── src/routes/     # Versioned REST API endpoints (/api/v1/...)
│   │   ├── src/scripts/    # Database Seeder (20 drivers, 50 riders, 100 rides)
│   │   └── test/           # Comprehensive Vitest test suite
│   │
│   └── ai-service/        # Python FastAPI Mobility Intelligence Microservice
│       ├── fare_predictor.py
│       ├── eta_predictor.py
│       ├── demand_predictor.py
│       ├── cancellation_risk.py
│       ├── fraud_detector.py
│       └── route_anomaly.py
│
├── packages/
│   ├── types/             # Domain TypeScript interfaces
│   ├── constants/         # Vehicle configs, pricing rules, i18n dictionaries
│   ├── validation/        # Zod validation schemas
│   └── shared/            # Shared algorithms (Haversine, Fare, Net-Earnings, PIN)
│
├── docs/                  # ARCHITECTURE, API, DATABASE, AI, SECURITY, DEPLOYMENT
├── .env.example           # Environment template
├── docker-compose.yml     # Multi-container deployment configuration
└── README.md
```

---

## ⚡ Quickstart Guide

### Prerequisites
- Node.js >= 20.x and npm >= 10.x
- Python >= 3.10 (for the optional AI microservice)
- Docker & Docker Compose (optional for containerized deployment)

### 1. Installation
Clone the repository and install all monorepo dependencies:
```bash
npm install
```

### 2. Run Database Seeder
FairRide automatically initializes and seeds 20 verified drivers, 50 passengers, 10 vehicles, and 100 completed historical rides with FareLock receipts:
```bash
npm run seed
```

### 3. Run the Entire Platform
Start the Backend API and Web Frontend concurrently:
```bash
npm run dev
```
- **Web Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000` (Health Check: `http://localhost:5000/health`)

*(Optional) Start Python AI Microservice:*
```bash
npm run dev:ai
```
- **AI Docs (Swagger)**: `http://localhost:8000/docs`

---

## 🔑 Demo Credentials & Instant Role Switcher

The top navigation bar features a **1-Click Role Switcher Toolbar** that allows you to instantly switch views between all four roles without typing passwords. Alternatively, you can log in with:

| Persona | Email | Password | Role |
|---|---|---|---|
| **Passenger** (Aarav Sharma) | `passenger@fairride.local` | `Password@123` | `PASSENGER` |
| **Driver** (Rajesh Kumar) | `driver@fairride.local` | `Password@123` | `DRIVER` |
| **Admin / Safety** (Sunita Verma) | `admin@fairride.local` | `Password@123` | `SUPER_ADMIN` |
| **Corporate** (Vikram Patel) | `corporate@fairride.local` | `Password@123` | `CORPORATE_MANAGER` |

---

## 🧪 Testing

Run the automated test suite verifying fare calculation, driver net earnings, Route Guardian GPS cross-track algorithms, and cryptographic payment signatures:
```bash
npm test
```

Build all packages for production:
```bash
npm run build
```

---

## 🐳 Docker Deployment

To spin up MongoDB, Redis, Python AI Service, Backend API, and Nginx Web Frontend in containers:
```bash
docker-compose up --build -d
```

---

## 📜 Documentation Index

- [Architecture & State Machine Specs](docs/ARCHITECTURE.md)
- [REST API & Socket.IO Event Reference](docs/API.md)
- [MongoDB Schema & Ledger Design](docs/DATABASE.md)
- [AI Models & Mobility Algorithms](docs/AI.md)
- [Security, Cryptography & Privacy](docs/SECURITY.md)
- [Cloud Deployment & Scaling](docs/DEPLOYMENT.md)

---

## 🛡️ License

FairRide is open-source software built for fair, safe, and transparent transportation systems.
