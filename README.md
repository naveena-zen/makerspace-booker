# Maker Space Booker

[![CI Workflow](https://github.com/naveena-zen/makerspace-booker/actions/workflows/ci.yml/badge.svg)](https://github.com/naveena-zen/makerspace-booker/actions/workflows/ci.yml)
[![CD Delivery](https://github.com/naveena-zen/makerspace-booker/actions/workflows/cd.yml/badge.svg)](https://github.com/naveena-zen/makerspace-booker/actions/workflows/cd.yml)
[![Pages Deploy](https://github.com/naveena-zen/makerspace-booker/actions/workflows/pages.yml/badge.svg)](https://github.com/naveena-zen/makerspace-booker/actions/workflows/pages.yml)

A lightweight university makerspace equipment reservation system developed for the course **"Agile Project Development with Scrum"**. Users can safely reserve makerspace machinery (3D printers, laser cutters, workbenches) with strict automated operator safety-certification gating and collision prevention.

## Architecture

```mermaid
graph TD
    Client["Browser / Static Client (Port 3000)"] --> Gateway["API Gateway (Port 3000)"]
    Gateway -->|/api/machines| MachineSvc["Machine Service (Port 3001)"]
    Gateway -->|/api/certified| CertSvc["Certification Service (Port 3002)"]
    Gateway -->|/api/reservations| ResSvc["Reservation Service (Port 3003)"]
    ResSvc -->|Verify Machine| MachineSvc
    ResSvc -->|Check Operator Cert| CertSvc
```

## How to Run

### Microservices via Docker Compose
```bash
docker compose up -d --build
```
Access the application at [http://localhost:3000](http://localhost:3000).

### Monolith (Legacy Mode)
```bash
cd monolith
npm install
npm test
npm start
```

### Microservices (Local Node.js)
Run each service independently:
```bash
# Terminal 1: Machine Service
cd services/machine-service && npm install && npm start

# Terminal 2: Certification Service
cd services/certification-service && npm install && npm start

# Terminal 3: Reservation Service
cd services/reservation-service && npm install && npm start

# Terminal 4: Gateway & Static Site
cd services/gateway && npm install && npm start
```
