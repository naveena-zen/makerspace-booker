# System Requirements & Specifications

## Course Context
- **Course**: Agile Project Development with Scrum
- **Project Name**: MakerSpace Equipment Safety Booking System
- **Paradigm**: Agile / Scrum with GitFlow and Continuous Integration & Delivery (CI/CD)

---

## 1. Domain Model & Seed Data

### 1.1 Equipment Catalog
| ID | Name | Model | Certification Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `m1` | 3D Printer | Prusa MK4 FDM | **Yes** (`true`) | Fused Deposition Modeling printer with thermal nozzle hazards. |
| `m2` | Laser Cutter | Boss Laser 60W | **Yes** (`true`) | Class 4 optical cutter requiring high-temperature & fume protocol. |
| `m3` | Workbench | Station 04 Assembly | **No** (`false`) | General electronics assembly and soldering bench (open access). |

### 1.2 User Personas & Credentials
| User Name | Email | Role | Certified Equipment | Permission Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Ashley** | `ashley@university.edu` | Certified Lab Specialist | `['m1', 'm2']` | Authorized to book 3D printers, laser cutters, and workbenches. |
| **Justin** | `justin@university.edu` | Undergraduate (Novice) | `[]` | Authorized to book open-access workbenches (`m3`) only. |

---

## 2. Functional Requirements (FR)

- **FR-1: Equipment Discovery**: Any client must be able to list available machinery along with safety requirement metadata.
- **FR-2: Operator Clearance Verification**: The system must verify whether an identified student persona has acquired the requisite safety certification for a specific machine.
- **FR-3: Safety-Gated Reservation**:
  - If a machine has `needsCert: true`, reservations from uncertified operators must be rejected immediately with HTTP 403 Forbidden.
  - If a machine has `needsCert: false`, any active student persona may book the machine without certification checks.
- **FR-4: Collision Prevention**: Attempting to book an already reserved time slot for the same machine on the same calendar date must be rejected with HTTP 409 Conflict.
- **FR-5: Ledger Querying**: Confirmed bookings must be retrievable in chronological sequence through the reservations endpoint.

---

## 3. Architecture & Microservice Decomposition (Strangler Fig)

The platform supports two parallel architectural tiers:

### Phase 1: Monolithic Service (`/monolith`)
- Single Express application exposing all endpoints.
- Self-contained in-memory data store and Jest/Supertest suite.
- Port: `3000` (or `PORT` environment variable).

### Phase 2: Decoupled Microservices (`/services`)
- **Machine Service** (`port 3001`): Exposes `GET /api/machines` and `GET /api/machines/:id`.
- **Certification Service** (`port 3002`): Exposes `GET /api/certified?user=&machine=`.
- **Reservation Service** (`port 3003`): Exposes `GET /api/reservations` and `POST /api/reservations`. Interacts with Machine and Certification services via HTTP `fetch`.
- **Gateway & Web Host** (`port 3000`): Serves the single-page application and reverse-proxies API requests to upstream microservices.
- **Docker Compose Orchestration**: Coordinates network routing, healthchecks, and environment variables across all four services.

---

## 4. REST API Specifications

### 4.1 `GET /health`
Returns service vitality status.
- **Response**: `200 OK`
```json
{
  "status": "ok",
  "service": "reservation-service"
}
```

### 4.2 `GET /api/machines`
Returns the complete equipment catalog.
- **Response**: `200 OK`
```json
[
  { "id": "m1", "name": "3D Printer", "needsCert": true },
  { "id": "m2", "name": "Laser Cutter", "needsCert": true },
  { "id": "m3", "name": "Workbench", "needsCert": false }
]
```

### 4.3 `GET /api/certified?user=&machine=`
Validates user safety clearance.
- **Parameters**: `user` (string), `machine` (string)
- **Response `200 OK`**:
```json
{
  "user": "Ashley",
  "machine": "m1",
  "certified": true
}
```
- **Error `400 Bad Request`**: If parameters are missing.

### 4.4 `POST /api/reservations`
Submits a reservation request.
- **Payload**:
```json
{
  "user": "Ashley",
  "machine": "m1",
  "date": "2026-10-15",
  "timeSlot": "09:00 - 10:30 AM"
}
```
- **Success `201 Created`**:
```json
{
  "id": "RES-1728135000000",
  "user": "Ashley",
  "machine": "m1",
  "machineName": "3D Printer",
  "date": "2026-10-15",
  "timeSlot": "09:00 - 10:30 AM",
  "createdAt": "2026-10-05T20:30:00.000Z"
}
```
- **Error `403 Forbidden`**: `{ "error": "User is not certified to reserve this machine" }`
- **Error `409 Conflict`**: `{ "error": "Slot is already booked for this machine" }`
- **Error `404 Not Found`**: `{ "error": "Machine not found" }`

---

## 5. Agile Scrum Backlog & Sprint Mapping

### Sprint 1: Monolith Core & Safety Verification
- **US-1.1**: As Ashley, I want to reserve a 3D printer so I can construct prototype parts for my engineering project.
- **US-1.2**: As a lab manager, I want Justin barred from operating hazardous laser cutters so that safety regulations are enforced.
- **US-1.3**: As any student, I want to reserve an open workbench without needing special certifications.

### Sprint 2: Strangler Fig Microservices Decomposition
- **US-2.1**: As a DevOps engineer, I want machine inventory decoupled into a standalone service so that equipment maintenance doesn't affect booking transactions.
- **US-2.2**: As a security officer, I want certification verification handled by a dedicated service to enable future enterprise identity federation.
- **US-2.3**: As a system architect, I want an API Gateway serving static assets and reverse-proxying calls to prevent CORS and client-side coupling.

### Sprint 3: CI/CD Automation & Quality Gates
- **US-3.1**: As a developer, I want a GitHub Actions matrix pipeline to test all services in parallel on pull requests.
- **US-3.2**: As a release engineer, I want validated Docker images published automatically to GHCR on `main` branch merges.
- **US-3.3**: As an automated tester, I want continuous smoke testing against live service health endpoints before release signoff.
