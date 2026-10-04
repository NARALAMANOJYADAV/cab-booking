# FairRide Deployment Guide

FairRide is designed for modular, cloud-agnostic deployment. Each microservice and frontend can be deployed together via Docker Compose or independently on dedicated cloud infrastructure.

---

## 1. Quickstart via Docker Compose

To run the entire multi-service stack (MongoDB, Redis, AI Microservice, Node.js API, and Nginx Web Frontend) locally:

```bash
# 1. Clone repository
git clone https://github.com/your-org/fairride.git
cd fairride

# 2. Configure environment
cp .env.example .env

# 3. Spin up full containerized stack
docker-compose up --build -d
```

- **Web Frontend**: `http://localhost:3000` (or `http://localhost:5173` in dev)
- **Backend API**: `http://localhost:5000` (Health check: `http://localhost:5000/health`)
- **Python AI Engine**: `http://localhost:8000` (OpenAPI docs: `http://localhost:8000/docs`)

---

## 2. Independent Cloud Deployment

### A. Frontend (`apps/web`) -> Vercel / Cloudflare Pages / AWS S3 + CloudFront
1. **Build Command**: `npm run build --workspace=@fairride/web`
2. **Output Directory**: `apps/web/dist`
3. **Environment Variables**:
   - `VITE_API_URL`: URL of the deployed backend API (e.g. `https://api.fairride.com`)

### B. Backend API (`apps/api`) -> AWS ECS / Render / Railway / Google Cloud Run
1. **Runtime**: Node.js 22 LTS
2. **Build Command**: `npm run build --workspace=@fairride/api`
3. **Start Command**: `node apps/api/dist/server.js`
4. **Environment Variables**:
   - `MONGO_URI`: MongoDB Atlas connection string (`mongodb+srv://...`)
   - `REDIS_URL`: Redis Cloud or AWS ElastiCache instance (`redis://...`)
   - `JWT_SECRET`: 64-character cryptographically random secret
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`: Live payment credentials
   - `AI_SERVICE_URL`: URL of the deployed Python microservice

### C. AI Microservice (`apps/ai-service`) -> AWS Lambda / Google Cloud Run / Railway
1. **Runtime**: Python 3.12
2. **Build Command**: `pip install -r requirements.txt`
3. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 8000`

---

## 3. Database & Caching Setup

### MongoDB Atlas Configuration
1. Create a dedicated M10+ cluster on MongoDB Atlas.
2. Enable Network Access whitelist for your API IP addresses.
3. Verify that geospatial indexes are built:
   - `Driver.currentLocation`: `2dsphere`
   - `Booking.pickup.coordinates`: `2dsphere`
   - `SafetyIncident.currentLocation`: `2dsphere`

### Redis Cache
1. Use Redis 7.x with eviction policy `volatile-lru`.
2. Configure persistent snapshotting (RDB + AOF) for caching dispatch states.
