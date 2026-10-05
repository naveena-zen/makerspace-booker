const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-Memory Seed Data
const MACHINES = [
  { id: 'm1', name: '3D Printer', needsCert: true },
  { id: 'm2', name: 'Laser Cutter', needsCert: true },
  { id: 'm3', name: 'Workbench', needsCert: false }
];

const CERTIFICATIONS = {
  Ashley: ['m1', 'm2'],
  Justin: []
};

// In-memory reservations storage
let reservations = [];

// Helper function to reset data for clean test runs
app.resetData = () => {
  reservations = [];
};

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'monolith' });
});

// GET /api/machines
app.get('/api/machines', (_req, res) => {
  res.status(200).json(MACHINES);
});

// GET /api/certified?user=&machine=
app.get('/api/certified', (req, res) => {
  const { user, machine } = req.query;

  if (!user || !machine) {
    return res.status(400).json({
      error: 'Missing required query parameters: user and machine'
    });
  }

  const userCerts = CERTIFICATIONS[user] || [];
  const isCertified = userCerts.includes(machine);

  return res.status(200).json({
    user,
    machine,
    certified: isCertified
  });
});

// POST /api/reservations
app.post('/api/reservations', (req, res) => {
  const { user, date, timeSlot } = req.body;
  const machine = req.body.machine || req.body.machineId;

  if (!user || !machine || !date || !timeSlot) {
    return res.status(400).json({
      error: 'Missing required fields: user, machine, date, timeSlot'
    });
  }

  const targetMachine = MACHINES.find((m) => m.id === machine);
  if (!targetMachine) {
    return res.status(404).json({ error: 'Machine not found' });
  }

  // Check certification if required
  if (targetMachine.needsCert) {
    const userCerts = CERTIFICATIONS[user] || [];
    if (!userCerts.includes(machine)) {
      return res.status(403).json({
        error: 'User is not certified to reserve this machine'
      });
    }
  }

  // Check duplicate slot booking
  const conflict = reservations.find(
    (r) => r.machine === machine && r.date === date && r.timeSlot === timeSlot
  );

  if (conflict) {
    return res.status(409).json({
      error: 'Slot is already booked for this machine'
    });
  }

  const newReservation = {
    id: `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    user,
    machine,
    machineName: targetMachine.name,
    date,
    timeSlot,
    createdAt: new Date().toISOString()
  };

  reservations.push(newReservation);
  return res.status(201).json(newReservation);
});

// GET /api/reservations
app.get('/api/reservations', (_req, res) => {
  res.status(200).json(reservations);
});

module.exports = app;
