# FairRide API Documentation

All REST APIs are versioned under `/api/v1/` and follow standardized JSON request and response envelopes.

---

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "code": "DRIVER_UNAVAILABLE",
  "message": "No eligible driver is currently available within the service radius."
}
```

---

## 1. Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Authorization |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new Passenger, Driver, or Corporate user | Public |
| `POST` | `/api/v1/auth/login` | Login with email/phone & password | Public |
| `POST` | `/api/v1/auth/send-otp` | Send 6-digit OTP to mobile phone | Public |
| `POST` | `/api/v1/auth/verify-otp` | Verify OTP and return JWT access + refresh tokens | Public |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile & trust score | `Bearer <token>` |

---

## 2. Locations & Smart Pickup (`/api/v1/locations`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/locations/search?q={query}` | Search destinations with specific Gate, Metro, & Airport pickup points |
| `POST` | `/api/v1/locations/multimodal-plan` | Compare Direct Cab vs Cab + Metro vs Bus + Metro vs Shared |

---

## 3. Fares & Fare Lock (`/api/v1/fares`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/fares/quotes` | Generate itemized fare quotes for all 8 vehicle categories |
| `POST` | `/api/v1/fares/lock` | **Lock Upfront Fare** with a 15-minute guarantee window |
| `GET` | `/api/v1/fares/audit/:bookingId` | Retrieve post-trip itemized **Fare Audit** receipt |

---

## 4. Bookings & Lifecycle (`/api/v1/bookings`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/bookings/create` | Create booking from FareLock, generate 4-digit PIN, and match drivers |
| `GET` | `/api/v1/bookings/:id` | Fetch booking status, timeline, driver profile, and GPS coordinates |
| `POST` | `/api/v1/bookings/:id/driver-response` | Driver Accept or Decline with reason (triggers **Auto-Recovery** on cancel) |
| `POST` | `/api/v1/bookings/:id/transition` | State transitions (`DRIVER_ARRIVED`, `TRIP_STARTED` [requires PIN], `TRIP_COMPLETED`) |
| `POST` | `/api/v1/bookings/:id/passenger-cancel` | Cancel ride with zero hidden penalties |

---

## 5. Driver Management (`/api/v1/drivers`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/drivers/profile` | Driver profile, trust rating, and vehicle details |
| `POST` | `/api/v1/drivers/toggle-status` | Switch between `ONLINE` and `OFFLINE` |
| `POST` | `/api/v1/drivers/location` | Stream live GPS coordinates and heading bearing |
| `POST` | `/api/v1/drivers/earnings-preview` | **Net Earnings Preview** calculating fuel, commission, and net take-home |
| `GET` | `/api/v1/drivers/active-ride` | Get assigned ride with passenger pickup point |

---

## 6. Safety Center & Route Guardian (`/api/v1/safety`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/safety/sos` | **Trigger Emergency SOS**: captures GPS, booking, audio snapshot |
| `POST` | `/api/v1/safety/route-deviation-check` | Check live GPS against 300m corridor tolerance |
| `POST` | `/api/v1/safety/deviation-response` | Passenger response: `IM_SAFE`, `NEED_HELP`, or `EMERGENCY` |
| `GET` | `/api/v1/safety/incidents` | Safety Operations incident triage queue |
| `PATCH` | `/api/v1/safety/incidents/:id` | Update safety incident status, add operator notes, or resolve |

---

## 7. Evidence-Based Disputes (`/api/v1/disputes`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/disputes/create` | File dispute (auto-attaches FareLock, GPS trace, and timeline) |
| `GET` | `/api/v1/disputes/my` | Passenger dispute history |
| `GET` | `/api/v1/disputes/all` | Admin dispute resolution queue |
| `POST` | `/api/v1/disputes/:id/resolve` | Resolve dispute with full refund, partial refund, or rejection |

---

## 8. Payments & Ledger Wallet (`/api/v1/payments`, `/api/v1/wallet`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/payments/create-order` | Create Razorpay order representation with idempotency key |
| `POST` | `/api/v1/payments/verify` | Verify HMAC-SHA256 signature and credit driver wallet ledger |
| `POST` | `/api/v1/payments/webhook` | Webhook verification endpoint |
| `GET` | `/api/v1/wallet/my` | Wallet balance, FairPoints loyalty points, and transaction history |
| `POST` | `/api/v1/wallet/topup` | Add funds to passenger wallet |
| `POST` | `/api/v1/wallet/withdraw` | Driver instant earnings payout settlement to bank |

---

## 9. AI & Mobility Intelligence (`/api/v1/ai`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/ai/predict-fare` | Predict fare range with confidence score |
| `POST` | `/api/v1/ai/predict-eta` | Traffic, congestion, and weather ETA predictor |
| `GET` | `/api/v1/ai/demand-heatmap` | High, Medium, Low passenger demand hotspots |
| `POST` | `/api/v1/ai/parse-voice-booking` | Natural language voice booking parser |

---

## 10. Real-time Socket.IO Events

| Event Name | Direction | Payload / Description |
|---|---|---|
| `driver:location` | Client ➔ Server | Streams driver GPS `[lng, lat]` and bearing |
| `ride:join` | Client ➔ Server | Subscribes socket to ride room `ride:{bookingId}` |
| `ride:accepted` | Server ➔ Client | Notifies passenger that driver accepted with ETA |
| `route:deviation` | Server ➔ Client | Emitted when vehicle detours past 300m tolerance |
| `safety:incident` | Server ➔ Admin | Emitted immediately when passenger triggers SOS |
| `ride:message` | Bidirectional | Secure masked passenger <-> driver in-app chat |
