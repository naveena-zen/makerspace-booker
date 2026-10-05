const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const MACHINES = [
  { id: 'm1', name: '3D Printer', needsCert: true },
  { id: 'm2', name: 'Laser Cutter', needsCert: true },
  { id: 'm3', name: 'Workbench', needsCert: false }
];

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'machine-service' });
});

app.get('/api/machines', (_req, res) => {
  res.status(200).json(MACHINES);
});

app.get('/api/machines/:id', (req, res) => {
  const machine = MACHINES.find((m) => m.id === req.params.id);
  if (!machine) {
    return res.status(404).json({ error: 'Machine not found' });
  }
  return res.status(200).json(machine);
});

module.exports = app;
