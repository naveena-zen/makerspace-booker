const request = require('supertest');
const app = require('../src/app');

describe('Maker Space Booker Monolith API', () => {
  beforeEach(() => {
    app.resetData();
  });

  describe('GET /health', () => {
    it('should return 200 and ok status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok', service: 'monolith' });
    });
  });

  describe('GET /api/machines', () => {
    it('should return all seed machines with certification flags', async () => {
      const res = await request(app).get('/api/machines');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(3);

      const m1 = res.body.find((m) => m.id === 'm1');
      const m2 = res.body.find((m) => m.id === 'm2');
      const m3 = res.body.find((m) => m.id === 'm3');

      expect(m1).toMatchObject({ id: 'm1', name: '3D Printer', needsCert: true });
      expect(m2).toMatchObject({ id: 'm2', name: 'Laser Cutter', needsCert: true });
      expect(m3).toMatchObject({ id: 'm3', name: 'Workbench', needsCert: false });
    });
  });

  describe('GET /api/certified', () => {
    it('should confirm Ashley is certified for m1 (3D Printer)', async () => {
      const res = await request(app).get('/api/certified?user=Ashley&machine=m1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        user: 'Ashley',
        machine: 'm1',
        certified: true
      });
    });

    it('should confirm Ashley is certified for m2 (Laser Cutter)', async () => {
      const res = await request(app).get('/api/certified?user=Ashley&machine=m2');
      expect(res.status).toBe(200);
      expect(res.body.certified).toBe(true);
    });

    it('should confirm Justin is NOT certified for m1', async () => {
      const res = await request(app).get('/api/certified?user=Justin&machine=m1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        user: 'Justin',
        machine: 'm1',
        certified: false
      });
    });

    it('should return 400 when required query params are missing', async () => {
      const res = await request(app).get('/api/certified?user=Ashley');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/reservations', () => {
    it('should allow certified user Ashley to book m1', async () => {
      const payload = {
        user: 'Ashley',
        machine: 'm1',
        date: '2026-10-10',
        timeSlot: '09:00 - 10:30 AM'
      };

      const res = await request(app).post('/api/reservations').send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        user: 'Ashley',
        machine: 'm1',
        machineName: '3D Printer',
        date: '2026-10-10',
        timeSlot: '09:00 - 10:30 AM'
      });
      expect(res.body).toHaveProperty('id');
    });

    it('should allow uncertified user Justin to book m3 (no certification required)', async () => {
      const payload = {
        user: 'Justin',
        machine: 'm3',
        date: '2026-10-10',
        timeSlot: '10:30 - 12:00 PM'
      };

      const res = await request(app).post('/api/reservations').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.user).toBe('Justin');
      expect(res.body.machine).toBe('m3');
    });

    it('should reject uncertified user Justin when attempting to book m1', async () => {
      const payload = {
        user: 'Justin',
        machine: 'm1',
        date: '2026-10-10',
        timeSlot: '01:00 - 02:30 PM'
      };

      const res = await request(app).post('/api/reservations').send(payload);
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/not certified/i);
    });

    it('should reject reservation if the slot is already booked for that machine', async () => {
      const payload1 = {
        user: 'Ashley',
        machine: 'm1',
        date: '2026-10-10',
        timeSlot: '02:30 - 04:00 PM'
      };

      const firstRes = await request(app).post('/api/reservations').send(payload1);
      expect(firstRes.status).toBe(201);

      // Attempt conflicting booking
      const payload2 = {
        user: 'Ashley',
        machine: 'm1',
        date: '2026-10-10',
        timeSlot: '02:30 - 04:00 PM'
      };

      const secondRes = await request(app).post('/api/reservations').send(payload2);
      expect(secondRes.status).toBe(409);
      expect(secondRes.body.error).toMatch(/already booked/i);
    });

    it('should reject requests with missing fields with 400', async () => {
      const res = await request(app).post('/api/reservations').send({
        user: 'Ashley'
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/reservations', () => {
    it('should return all confirmed reservations', async () => {
      await request(app).post('/api/reservations').send({
        user: 'Ashley',
        machine: 'm1',
        date: '2026-10-12',
        timeSlot: '09:00 - 10:30 AM'
      });

      const res = await request(app).get('/api/reservations');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].user).toBe('Ashley');
    });
  });
});
