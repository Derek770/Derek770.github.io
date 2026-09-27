# FleetPulse - Commercial Fleet & Driver Management System

FleetPulse is a production-ready, full-stack Fleet Management Web Application engineered specifically for commercial taxi and cab operators. The system streamlines yard operations, manages driver vehicle dispatch and return handoffs, tracks live GPS telematics and historical route trails on an interactive map, automates daily rental fee calculations and driver deficit ledgers (in Indian Rupees ₹), and proactively audits vehicle compliance certificates.

---

## 1. Technical Stack & Architecture

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling & UI:** Tailwind CSS v4, Lucide-React icons, custom high-contrast dark ops theme
- **Maps & Telematics:** Leaflet.js with OpenStreetMap (zero paid API key dependencies; turnkey out of the box)
- **State Management & Persistence:** Modular in-memory / persistent singleton database with optimistic client-side synchronization and automated seed data
- **API Architecture:** Serverless REST API endpoints for vehicles, drivers, shifts, daily collections, expenses, and GPS telemetry ingestion webhook
- **Delight & Feedback:** Canvas confetti, real-time clock, digital receipt generator with print/PDF support

---

## 2. Core Modules & Functionality

### Module A: Driver Dispatch & Shift Handoff (`/dispatch`)
- **Shift Check-Out:**
  - Yard supervisor selects an available vehicle and an active driver.
  - Inputs: Starting Odometer (km), Starting Fuel/CNG level (0–100% slider), Pre-existing vehicle damage checklist with notes and photo upload preview.
  - Action: Locks vehicle status to `ASSIGNED` ("On Trip / Dispatched") and generates unique `shift_id`.
- **Shift Check-In (Return & Settlement):**
  - Driver returns vehicle to the yard.
  - Inputs: Ending Odometer, Ending Fuel/CNG level, Return timestamp, New damage remarks.
  - **Automated Calculations:**
    - Total Kilometers Driven = $\text{Ending Odometer} - \text{Starting Odometer}$
    - Shift Duration = $\text{Return Time} - \text{Check-out Time}$
    - Daily Rent Due (defaults to configured rate, e.g., ₹800) + any penalties (late return penalty, fuel deficit penalty).
  - Action: Sets vehicle status back to `AVAILABLE` (or `MAINTENANCE` if damaged).

### Module B: Real-Time Fleet Map & Telematics Tracking (`/map`)
- **Interactive Live Map View:**
  - Full-screen interactive map displaying all vehicles as custom pin markers.
  - Marker Color Coding:
    - **Green:** Moving (speed > 5 km/h, ignition ON) with pulsing radar ring
    - **Yellow:** Idling (speed $\le$ 5 km/h, ignition ON) with amber radar ring
    - **Red:** Parked (ignition OFF)
    - **Gray:** Offline
  - Clicking any vehicle opens a quick-look slide-out drawer showing:
    - Plate number, make & model
    - Assigned driver with photo, phone number, and ledger balance
    - Live speed, current odometer, fuel/CNG gauge, ignition status
    - "Time since dispatched" live elapsed counter
- **Route Playback & Audit:**
  - Select any past shift and draw the full GPS trail/polyline across Delhi NCR.
  - Interactive playback control bar with Play/Pause, speed slider ($1\times, 2\times, 5\times$), and position scrubber.
- **GPS Ingestion Webhook (`/api/telematics/ping`):**
  - Accepts standard JSON payloads:
    ```json
    {
      "device_id": "DL 1TA 4821",
      "lat": 28.6315,
      "lng": 77.2167,
      "speed": 45,
      "ignition": true,
      "timestamp": "2026-09-27T17:30:00Z"
    }
    ```
  - Built-in **Telematics Simulator** widget on the map to trigger live pings or run auto-driving cabs!

### Module C: Financial Ledger & Daily Collections (`/finances`)
- **Daily Collections Dashboard:**
  - Table of active drivers, assigned vehicles, expected daily rent (₹800), payment status (`Paid`, `Pending`, `Partial`), and payment mode (`Cash`, `UPI`, `NetBanking`).
  - "Mark as Paid" action with instant payment modal.
- **Digital Printable Receipts:**
  - Instant branded digital receipt with receipt number, driver details, amount paid, and supervisor signature stamp. Supports printing or saving as PDF.
- **Driver Balance & Deficit Tracking:**
  - Rolling driver balances (unpaid rent automatically carried over as negative debt).
- **Vehicle Expense Logger:**
  - Track vehicle operating costs: Routine servicing, tyre puncture repair, oil changes, traffic challans/fines, CNG hydro-testing, and yard rent.

### Module D: Vehicle & Compliance Registry (`/vehicles`)
- **Vehicle Profiles:**
  - Registration plate, chassis number, engine type (CNG, Petrol, EV), purchase date/cost, current odometer.
- **Document Expiry Tracker:**
  - Tracks expiration dates for Commercial Fitness Certificate, State/All-India Permit, Comprehensive Taxi Insurance, and Pollution (PUC).
  - Status Badges:
    - **Valid (Green):** Document is active and compliant
    - **Expiring within 15 Days (Yellow):** Proactive renewal warning
    - **Expired (Red):** Critical alert to prevent traffic police impoundment

### Module E: Driver Directory (`/drivers`)
- Profiles of all commercial drivers, phone contacts, license numbers, security deposit collateral held (₹10,000–₹12,000), current rolling ledger balance, and active vehicle assignment.

---

## 3. Pre-Seeded Indian Taxi Fleet & Drivers

### Vehicles:
1. **`DL 1TA 4821`** - Maruti WagonR Tour H3 (CNG) - Status: `ASSIGNED` (Driver: Rajesh Kumar)
2. **`HR 55 AJ 9012`** - Maruti Suzuki Dzire Tour S (CNG) - Status: `ASSIGNED` (Driver: Amit Singh)
3. **`UP 16 BT 3344`** - Maruti Suzuki Ertiga Tour M CNG (7-Seater) - Status: `AVAILABLE` (Yard: Noida Sec 62)
4. **`DL 1ZB 7789`** - Tata Tigor EV (Commercial Fleet) - Status: `MAINTENANCE` (Okhla Phase 3 Workshop)
5. **`UP 14 ET 1122`** - Hyundai Aura Prime CNG - Status: `ASSIGNED` (Driver: Mohammad Imran)

### Drivers:
1. **Rajesh Kumar** (+91 98101 23456) - Lic: DL-0420180019284 - Deposit: ₹10,000 - Balance: -₹300 (Deficit)
2. **Amit Singh** (+91 98712 34567) - Lic: HR-2620190084311 - Deposit: ₹10,000 - Balance: ₹0 (Clear)
3. **Mohammad Imran** (+91 99110 56789) - Lic: UP-1420200051290 - Deposit: ₹12,000 - Balance: -₹850 (Due)
4. **Vikram Sharma** (+91 98188 44321) - Lic: DL-0120170067823 - Deposit: ₹10,000 - Balance: +₹500 (Advance)
5. **Suresh Yadav** (+91 97177 88990) - Lic: UP-1620160032918 - Deposit: ₹10,000 - Balance: -₹1,600 (Overdue)

---

## 4. Local Setup & Execution Instructions

### Prerequisites
- Node.js v18+ or v20+ or v24+
- npm v9+

### Step 1: Open Terminal in the Project Directory
```bash
cd C:\Users\PREDATOR\.gemini\antigravity\scratch\fleetpulse
```

### Step 2: Install Dependencies (Already installed)
```bash
npm install
```

### Step 3: Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Step 4: Run Production Build
```bash
npm run build
npm start
```

### Step 5: Run Automated End-to-End Verification Test
While the server is running on port 3000:
```bash
node test_endpoints.js
```

---

## 5. API Reference & Webhooks

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/vehicles` | List all vehicles with optional `?status=AVAILABLE` filter |
| `PATCH` | `/api/vehicles` | Update vehicle status, odometer, or documents |
| `GET` | `/api/drivers` | List all registered drivers |
| `PATCH` | `/api/drivers` | Update driver details, status, or balance |
| `GET` | `/api/shifts` | List shifts with optional filters (`?active=true`, `?vehicle_id=...`) |
| `POST` | `/api/shifts` | Check-out vehicle: locks status to `ASSIGNED`, creates shift ID |
| `PATCH` | `/api/shifts` | Check-in vehicle: calculates km driven, shift hours, penalties, rent |
| `POST` | `/api/telematics/ping` | Secure GPS tracker webhook ingestion endpoint |
| `GET` | `/api/finances/collections` | Fetch daily rent payment collection records |
| `POST` | `/api/finances/collections` | Record payment, update driver balance & generate receipt |
| `GET` | `/api/finances/expenses` | Fetch itemized fleet operating costs |
| `POST` | `/api/finances/expenses` | Log new maintenance, fuel, or repair expense |
| `POST` | `/api/seed` | Reset database back to default seed data |

---

## 6. Project Architecture

```
fleetpulse/
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # App shell with Sidebar, Header & styling
│   │   ├── page.tsx                       # Dashboard Overview & KPI command center
│   │   ├── map/page.tsx                   # Interactive Leaflet Telematics Map
│   │   ├── dispatch/page.tsx              # Shift Check-Out & Return Workflows
│   │   ├── drivers/page.tsx               # Commercial Driver Directory
│   │   ├── vehicles/page.tsx              # Vehicle Specs & Compliance Tracker
│   │   ├── finances/page.tsx              # Collections Ledger & Expense Logger
│   │   └── api/                           # Serverless Route Handlers
│   ├── components/
│   │   ├── layout/                        # Sidebar, Header & navigation
│   │   ├── dashboard/                     # KPI cards, status charts
│   │   ├── map/                           # Leaflet map, Vehicle drawer, Route playback, GPS simulator
│   │   ├── dispatch/                      # Check-out form, Check-in form, Damage inspector
│   │   └── finances/                      # Receipt modal, Payment modal, Expense modal
│   ├── lib/
│   │   ├── db.ts                          # Server database service with seed data
│   │   ├── store.ts                       # Client-side API sync helpers
│   │   ├── calculations.ts                # Km driven, rent due, penalties, deficits
│   │   └── utils.ts                       # Currency (₹ INR), date and doc compliance helpers
│   └── types/
│       └── index.ts                       # Full TypeScript domain models
├── test_endpoints.js                      # Automated HTTP API verification script
└── README.md
```
