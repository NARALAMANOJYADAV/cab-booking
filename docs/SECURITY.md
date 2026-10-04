# FairRide Security & Compliance Architecture

FairRide is designed with security, financial integrity, and data protection as core engineering tenets.

---

## 1. Authentication & Session Security

- **Password Hashing**: Bcrypt with a salt factor of 10. Passwords are never stored in plain text and are excluded from all query projections by default (`select: false`).
- **Token Architecture**:
  - **Short-Lived Access Tokens**: Signed with `JWT_SECRET`, expiring in 2 hours.
  - **Refresh Tokens**: Signed with distinct `JWT_REFRESH_SECRET`, expiring in 30 days.
  - **Revocation**: Password change or "Logout all devices" increments token version and invalidates existing refresh tokens.
- **Mobile OTP**: Secure 6-digit one-time tokens with rate limiting and 5-minute expiry windows.

---

## 2. Role-Based Access Control (RBAC)

The system strictly enforces role authorizations across nine distinct personas:

| Role | Permissions |
|---|---|
| `PASSENGER` | Book rides, view personal trips, manage wallet, trigger SOS, file disputes |
| `DRIVER` | Toggle status, stream GPS, preview net earnings, accept/decline rides, withdraw |
| `CORPORATE_EMPLOYEE` | Request business travel within travel policy guidelines |
| `CORPORATE_MANAGER` | Review employee travel justification, approve/reject trips |
| `CORPORATE_ADMIN` | Configure department budgets, travel policy caps, view invoices |
| `SUPPORT_AGENT` | Review support tickets, contact parties |
| `SAFETY_AGENT` | Triage CRITICAL SOS alerts, route detours, dispatch local emergency units |
| `OPERATIONS_ADMIN` | Driver document verification, dispute refund execution, fraud audit |
| `SUPER_ADMIN` | Pricing engine modifications, system configuration, immutable audit logs |

---

## 3. Financial Integrity & Payment Security

- **Server-Side Fare Validation**: Frontend fare values are **never** trusted. All pricing calculations, quote locks, and audit comparisons originate exclusively from the server-side pricing engine.
- **Payment Signature Verification**:
  ```typescript
  const generatedSignature = crypto
    .createHmac('sha256', config.RAZORPAY_WEBHOOK_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  ```
  Payments are only credited when the cryptographic signature matches the payment provider's webhook payload.
- **Ledger-Based Accounting**: Direct wallet balance mutations are prohibited. Every modification requires an append-only `WalletTransaction` entry recording `amount`, `balanceAfter`, `category`, and `idempotencyKey`.
- **Idempotency Safeguards**: All critical mutations (booking creation, payment authorization, wallet topups) accept an `Idempotency-Key` header to prevent duplicate execution during network retries.

---

## 4. Anti-Fraud & Abuse Prevention

- **Device Fingerprint Tracking**: Detects duplicate account creation and referral collusion from identical device hardware IDs.
- **Referral Rewards Gate**: Referrer rewards are only released after the referee successfully completes an authenticated qualifying trip.
- **GPS Teleportation Guard**: Discards GPS pings implying velocities above 180 km/h or originating from known mock location providers.
- **Anti-Extortion Guard**: Analyzes repeated patterns where drivers accept, contact passengers, solicit offline cash, and subsequently cancel.

---

## 5. Privacy & Data Minimization

- **Phone Number Masking**: Drivers and passengers communicate via in-app Socket.IO messaging or virtual masked switchboards. Real phone numbers are withheld.
- **Trip Verification PIN**: Drivers cannot begin a trip without entering the passenger's 4-digit boarding PIN, preventing wrong-car boarding.
- **PII Redaction**: Driver uploaded licenses and identity documents are accessible exclusively to authorized verification personnel.
