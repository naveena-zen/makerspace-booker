const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const MACHINE_SERVICE_URL = process.env.MACHINE_SERVICE_URL || 'http://localhost:3001';
const CERTIFICATION_SERVICE_URL = process.env.CERTIFICATION_SERVICE_URL || 'http://localhost:3002';
const RESERVATION_SERVICE_URL = process.env.RESERVATION_SERVICE_URL || 'http://localhost:3003';

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'gateway' });
});

// Proxy /api/machines
app.use('/api/machines', async (req, res) => {
  try {
    const targetUrl = `${MACHINE_SERVICE_URL}/api/machines${req.url === '/' ? '' : req.url}`;
    const options = {
      method: req.method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      options.body = JSON.stringify(req.body);
    }
    const upstreamRes = await fetch(targetUrl, options);
    const data = await upstreamRes.json();
    return res.status(upstreamRes.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'Machine Service unavailable', details: err.message });
  }
});

// Proxy /api/certified
app.use('/api/certified', async (req, res) => {
  try {
    const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const targetUrl = `${CERTIFICATION_SERVICE_URL}/api/certified${queryString}`;
    const upstreamRes = await fetch(targetUrl);
    const data = await upstreamRes.json();
    return res.status(upstreamRes.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'Certification Service unavailable', details: err.message });
  }
});

// Proxy /api/reservations
app.use('/api/reservations', async (req, res) => {
  try {
    const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const targetUrl = `${RESERVATION_SERVICE_URL}/api/reservations${queryString}`;
    const options = {
      method: req.method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      options.body = JSON.stringify(req.body);
    }
    const upstreamRes = await fetch(targetUrl, options);
    const data = await upstreamRes.json();
    return res.status(upstreamRes.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'Reservation Service unavailable', details: err.message });
  }
});

// Serve static frontend assets
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Fallback to index.html for SPA routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

module.exports = app;
