# DrimStyle (InstaaTrim) Technical Audit & Assessment Report
**Target System:** DrimStyle (InstaaTrim) Booking & Salon Management Platform  
**Architecture:** Node.js (Express), MongoDB Atlas (Mongoose ODM), Socket.IO (WebSockets), Firebase Cloud Messaging (FCM), Razorpay Payments, React (Vite) Frontend.  
**Report Standard:** Evidence-based engineering audit separating verified facts from unverified assumptions and pending checks.

---

## Executive Summary & Audit Methodology

This report strictly adheres to the client's mandatory audit instructions:
- **No invented metrics:** No fictitious TPS, RPS, concurrent user capacity, or response time figures.
- **Clear classification:** Findings are explicitly segmented into **Verified Facts (Code-proven)**, **Unverified Assumptions (Requiring Load Testing)**, and **Pending Manual Checks (Cloud/Atlas Console)**.
- **Zero code modifications:** Existing business logic, UI, database schemas, and configuration remain untouched.

---

## 1. Performance and Capacity Audit

### 1.1 Verified Architectural Facts (From Codebase)
* **Single-Process Node.js / Express API:**  
  The backend runs as a single-threaded Node.js process listening on `process.env.PORT || 6200` (`server.js`). No multi-core clustering (`cluster` module or PM2 cluster mode) is configured in `package.json`.
* **Payload Limits & Middleware:**  
  Configured with `express.json({ limit: '50mb' })` and `express.urlencoded({ limit: '50mb', extended: true })`.
* **Database Connection & Pooling:**  
  Connects to MongoDB using Mongoose default settings (`config/db.js`). Default Mongoose connection pool limit is 100 concurrent sockets per process.
* **Booking Creation Bottlenecks Identified in Code (`bookingController.js`):**
  - **Sequential Table Scan:** Custom ID generation executes `await Booking.countDocuments()` on every booking creation. As the booking collection grows, this will cause execution delays under concurrent load.
  - **Inline External Notifications:** `POST /api/bookings` triggers inline asynchronous operations: FCM dispatch (`notifyBookingFCM`) and Socket.IO broadcast (`io.emit('booking_created')`) inside the request execution cycle rather than delegating to an asynchronous worker queue (such as BullMQ/Redis).
* **Payment Flow:**
  - Order generation initiates an outbound HTTP call to Razorpay API (`razorpay.orders.create`).
  - Signature validation (`/api/payments/verify-payment`) is an in-memory HMAC-SHA256 comparison (`crypto.createHmac`), which executes with sub-millisecond CPU overhead.
* **Socket.IO:**
  - Mounted directly on the HTTP server instance (`socket.js`). Because there is no Redis pub/sub adapter (`@socket.io/redis-adapter`), real-time socket events are bound to the single active Node server process.

### 1.2 Unverified Assumptions (Pending Controlled Load Testing)
* **Actual Requests Per Second (RPS) & TPS:** The exact requests per second (RPS) and transactions per second (TPS) cannot be stated as fact without running controlled load tests. Any prior numerical capacity figures represent theoretical expectations, not verified test results.
* **Concurrent Active User Capacity:** Maximum concurrent WebSocket sessions and active HTTP requests before event-loop latency spikes (P95 > 500ms) are unmeasured.
* **P95 / P99 Latencies:** Unknown until synthetic tests are executed against a designated staging environment.

### 1.3 Proposed Load-Testing Plan (k6 / Artillery)

> [!IMPORTANT]  
> In accordance with instructions, **no load test will be run against production** without explicit client approval and a designated staging target.

#### Tooling Selection: **k6** (Recommended for lightweight, accurate JavaScript-based distributed testing)

#### Scenario A: Catalog Discovery Load Test (Read Heavy)
* **Target Endpoint:** `GET /api/salons` & `GET /api/categories`
* **Test Profile:**
  - Ramp up: 0 to 200 Virtual Users (VUs) over 2 minutes.
  - Steady state: 200 VUs for 5 minutes.
  - Ramp down: 1 minute.
* **Pass/Fail Thresholds:**
  - `http_req_duration{p95} < 300ms`
  - `http_req_failed < 1%`

#### Scenario B: Booking Placement Spike Test (Write Heavy)
* **Target Endpoint:** `POST /api/bookings`
* **Test Profile:**
  - Step load: 10, 25, 50, 100 concurrent booking submissions.
* **Metrics to Capture:**
  - MongoDB connection pool saturation.
  - Booking creation latency curve (P50, P90, P95, P99).
  - Impact of `countDocuments()` execution time under concurrency.

#### Scenario C: Socket.IO Connection Resilience
* **Target:** Persistent WebSocket connection pool.
* **Target Profile:** 500 to 2,000 persistent socket clients listening to `booking_created`.
* **Metric to Capture:** Memory footprint (RSS) growth per 1,000 active socket connections.

---

## 2. Data Recovery Strategy (MongoDB Atlas, RPO & RTO)

### 2.1 Verified Facts (From Environment & Code Inspection)
* **Database Target:**  
  The environment references a cloud-hosted MongoDB cluster:  
  `MONGODB_URI=mongodb+srv://...cluster0.oabfonq.mongodb.net/instamart` (in `.env`).
* **Secret Handling:**  
  Database connection credentials and payment gateway secrets (`RAZORPAY_KEY_SECRET`) are stored in `.env` and kept strictly internal.
* **Uploaded Media Storage:**  
  User uploaded files are saved locally to the filesystem directory: `backend/uploads/` (served via `express.static`). They are not stored in database blobs or backed up to an external cloud storage bucket (e.g., AWS S3).

### 2.2 Pending Manual Checks (Required in MongoDB Atlas Console)
The following configuration settings cannot be determined from local code and must be manually verified in the MongoDB Atlas Console:
1. **Cluster Tier:** Determine whether the cluster is an M0 (Free Tier / Sandbox), M2/M5 (Shared), or M10+ (Dedicated).
   - *Note:* M0 Free Tier clusters **do not support** automated cloud snapshots or Point-In-Time Recovery (PITR).
2. **Backup Schedule:** Check under **Cluster ➔ Backup**:
   - Snapshot frequency (e.g., every 6 hours, daily).
   - Snapshot retention policy (e.g., 7 days, 30 days).
3. **Point-In-Time Recovery (PITR):** Verify if continuous Oplog streaming (PITR) is enabled (available on M10+ clusters).

### 2.3 Safe Recovery-Test Checklist (Non-Destructive)

To validate RPO and RTO without disrupting live operations, execute the following safe checklist:

- [ ] **Step 1: Atlas Snapshot Verification**  
  Log in to MongoDB Atlas Console ➔ Verify that at least one valid snapshot exists within the last 24 hours.
- [ ] **Step 2: Non-Destructive Restore Test**  
  Trigger a test restore of the latest snapshot to a **new test cluster** (e.g., `instamart-dr-test`). **Never restore over the active production cluster.**
- [ ] **Step 3: Measure Recovery Time Objective (RTO)**  
  Start a stopwatch when the restore is initiated; stop it when the new cluster is active and reachable. Record this duration as the **Measured RTO**.
- [ ] **Step 4: Measure Recovery Point Objective (RPO)**  
  Compare the timestamp of the latest record in the restored test database against the active database to calculate the exact data loss delta (**Measured RPO**).
- [ ] **Step 5: Media Files Recovery Audit**  
  Establish an automated synchronization script (e.g., `rclone` or AWS CLI) to replicate `backend/uploads/` to cloud object storage (S3) so media assets match database restore points.

---

## 3. Order Closure Time & Lifecycle Endpoints

### 3.1 Verified Codebase Endpoints & Workflows

From [`backend/routes/bookingRoutes.js`](file:///d:/old%20d/instaatrim/instaatrim/backend/routes/bookingRoutes.js) and [`bookingController.js`](file:///d:/old%20d/instaatrim/instaatrim/backend/controllers/bookingController.js):

| Action | HTTP Method | Endpoint | Internal Operations |
| :--- | :--- | :--- | :--- |
| **Order Status Update / Closure** | `PATCH` | `/api/bookings/:id/status` | `Booking.findByIdAndUpdate` setting status to `Completed` or `Active`. Emits Socket.IO `booking_updated`. |
| **Order Cancellation** | `PATCH` | `/api/bookings/:id/status` | Updates `status: 'Cancelled'` and persists `cancelReason`. Emits Socket.IO `booking_cancelled` + sends FCM push notification. |
| **Order Reschedule** | `PATCH` | `/api/bookings/:id/reschedule` | Updates `dateKey`, `time`, and resets status to `Confirmed`. |
| **Customer Booking History** | `GET` | `/api/bookings/customer/:customerId` | Query with `{ createdAt: -1 }` sort. |

### 3.2 Non-Invasive Timing Measurement Proposal

To report empirical average and P95 latency for status updates without changing business logic, we propose adding a lightweight, non-invasive execution duration measurement in `bookingController.updateBookingStatus`:

```javascript
// Proposed Non-Invasive Timing Instrumentation (Sample)
exports.updateBookingStatus = async (req, res) => {
    const startTime = process.hrtime.bigint();
    try {
        const { id } = req.params;
        const { status, cancelReason } = req.body;
        
        const updateData = { status };
        if (cancelReason) updateData.cancelReason = cancelReason;

        const dbStart = process.hrtime.bigint();
        const booking = await Booking.findByIdAndUpdate(id, updateData, { new: true });
        const dbDurationMs = Number(process.hrtime.bigint() - dbStart) / 1e6;

        // ... existing Socket and FCM alert dispatch ...

        const totalDurationMs = Number(process.hrtime.bigint() - startTime) / 1e6;
        
        // Log timing metric non-invasively for telemetry:
        // console.log(`[LATENCY] updateBookingStatus total=${totalDurationMs.toFixed(2)}ms db=${dbDurationMs.toFixed(2)}ms`);

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
```

### 3.3 Latency Measurement Status
* **Current Status:** **Unmeasured in production / No synthetic load applied.**
* **Next Step:** As per client constraints, **no average or P95 latency numbers will be fabricated**. Accurate numbers will be populated once the staging test harness executes the proposed non-invasive timing run.

---

## 4. Summary Matrix: Verified Facts vs. Pending Checks

| Requirement | Verified Facts (Code-Proven) | Unverified Assumptions | Action / Pending Checks |
| :--- | :--- | :--- | :--- |
| **1. Performance & Capacity** | Single-instance Node.js; Mongoose connection pool = 100; payload limit = 50MB; synchronous `countDocuments()` on booking. | Exact RPS/TPS thresholds under high concurrency; event-loop saturation limits. | Execute k6 staging load test across Discovery & Booking endpoints with client approval. |
| **2. Data Recovery** | Connected to MongoDB Atlas cluster URI; local `/uploads` storage; credentials in `.env`. | Backup frequency, PITR activation, snapshot retention. | Inspect Atlas console (Cluster tier M0 vs M10+; verify Backup tab). Run non-destructive restore test. |
| **3. Order Closure Time** | Endpoint `PATCH /api/bookings/:id/status`; `cancelReason` stored; Socket.IO & FCM triggered. | P50, P95, and P99 latency numbers under live network conditions. | Deploy non-invasive timing logger in staging and record empirical latency test evidence. |

---
*Report compiled directly from DrimStyle project codebase audit. Prepared for client review.*
