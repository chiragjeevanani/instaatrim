# DrimStyle (InstaaTrim) - Enterprise Capabilities & Verification URLs

Saari Enterprise Capabilities, Test Results, aur Franchise/Catalog features ko browser ya Postman me verify karne ke liye ye live URLs hain:

---

### 1. Live Enterprise Status, SLA & Latency Metrics
* **URL:** `http://localhost:6200/api/enterprise/status`
* **Method:** `GET`
* **Kya check karein:**
  - Real-time SLA Target (`99.95%`)
  - Overall Health (`OPERATIONAL`)
  - Active components (Database, Realtime WebSockets, AuthService, PaymentGateway)
  - Rolling **p50**, **p95**, aur **p99** Latency (in milliseconds)

---

### 2. Zero-Downtime Health & Uptime Probe
* **URL:** `http://localhost:6200/api/enterprise/healthz`
* **Method:** `GET`
* **Kya check karein:**
  - Container / Server uptime seconds
  - Process memory usage (`heapUsed`, `heapTotal`, `rss`)

---

### 3. Database Live Readiness Probe
* **URL:** `http://localhost:6200/api/enterprise/readyz`
* **Method:** `GET`
* **Kya check karein:**
  - Real-time MongoDB connection status (`ready` / `connected`)

---

### 4. GDPR Article 20 - Data Portability Export
* **URL:** `http://localhost:6200/api/enterprise/gdpr/export`
* **Method:** `GET` (With Customer JWT Token)
* **Kya check karein:**
  - User profile, bookings aur preferences ka downloadable compliant JSON export

---

### 5. GDPR Right-to-Erasure (PII Anonymization)
* **URL:** `http://localhost:6200/api/enterprise/gdpr/erase`
* **Method:** `POST` (With Customer JWT Token)
* **Kya check karein:**
  - Sensitive personal identifiable information (PII) ka irreversible anonymization while preserving non-personal booking analytics

---

### 6. Franchise & Multi-Branch Chain Onboarding
* **URL:** `http://localhost:5173/salon/register`
* **Method:** Browser UI
* **Kya check karein:**
  - 3-Way Organization toggle:
    1. **Independent Salon**
    2. **Franchise Branch**
    3. **Chain Outlet** (Looks, Apple, Enrich, etc.)
  - Parent Brand Name aur Branch Name ke dynamic inputs jo MongoDB me live save hote hain.

---

### 7. Dynamic Service Catalog & Custom Pricing
* **URL:** `http://localhost:5173/salon/services/add`
* **Method:** Browser UI
* **Kya check karein:**
  - 95% industry catalog (Hair, Makeup, Spa, Facial, Nails, Waxing, Packages)
  - Fast autocomplete cards
  - Salon-controlled 100% dynamic selling price, discount, aur duration overrides.

---

### 8. Admin Global Taxonomy & Category Management
* **URL:** `http://localhost:5173/admin/categories`
* **Method:** Browser UI
* **Kya check karein:**
  - Smart autocomplete categories aur subcategory tags
  - Real-time database creation (`POST /api/categories`) jo salon partners ko reflect hoti hai.
