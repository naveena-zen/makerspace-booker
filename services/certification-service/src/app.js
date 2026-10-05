const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const CERTIFICATIONS = {
  Ashley: ['m1', 'm2'],
  Justin: []
};

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'certification-service' });
});

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

module.exports = app;
