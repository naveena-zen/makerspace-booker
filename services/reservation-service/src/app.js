const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const MACHINE_SERVICE_URL = process.env.MACHINE_SERVICE_URL || 'http://localhost:3001';
const CERTIFICATION_SERVICE_URL = process.env.CERTIFICATION_SERVICE_URL || 'http://localhost:3002';

// In-memory reservations database
let reservations = [];

app.resetData = () => {
  reservations = [];
};

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'reservation-service' });
});

app.get('/api/reservations', (_req, res) => {
  res.status(200).json(reservations);
});

app.post('/api/reservations', async (req, res) => {
  const { user, date, timeSlot } = req.body;
  const machine = req.body.machine || req.body.machineId;

  if (!user || !machine || !date || !timeSlot) {
    return res.status(400).json({
      error: 'Missing required fields: user, machine, date, timeSlot'
    });
  }

  try {
    // 1. Query Machine Service to verify existence and certification requirements
    const machineRes = await fetch(`${MACHINE_SERVICE_URL}/api/machines/${encodeURIComponent(machine)}`);
    if (!machineRes.ok) {
      if (machineRes.status === 404) {
        return res.status(404).json({ error: 'Machine not found' });
      }
      return res.status(502).json({ error: 'Failed to communicate with Machine Service' });
    }
    const machineData = await machineRes.json();

    // 2. Query Certification Service if machine requires certification
    if (machineData.needsCert) {
      const certUrl = `${CERTIFICATION_SERVICE_URL}/api/certified?user=${encodeURIComponent(user)}&machine=${encodeURIComponent(machine)}`;
      const certRes = await fetch(certUrl);
      if (!certRes.ok) {
        return res.status(502).json({ error: 'Failed to communicate with Certification Service' });
      }
      const certData = await certRes.json();

      if (!certData.certified) {
        return res.status(403).json({
          error: 'User is not certified to reserve this machine'
        });
      }
    }

    // 3. Collision / Double-booking prevention check
    const conflict = reservations.find(
      (r) => r.machine === machine && r.date === date && r.timeSlot === timeSlot
    );

    if (conflict) {
      return res.status(409).json({
        error: 'Slot is already booked for this machine'
      });
    }

    // 4. Save and return confirmed reservation
    const newReservation = {
      id: `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user,
      machine,
      machineName: machineData.name,
      date,
      timeSlot,
      createdAt: new Date().toISOString()
    };

    reservations.push(newReservation);
    return res.status(201).json(newReservation);
  } catch (err) {
    return res.status(500).json({
      error: 'Internal service error during reservation processing',
      details: err.message
    });
  }
});

module.exports = app;
