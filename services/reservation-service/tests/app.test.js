const request = require('supertest');
const app = require('../src/app');

// Mock global fetch for decoupled unit testing
const originalFetch = global.fetch;

describe('Reservation Service', () => {
  beforeEach(() => {
    app.resetData();
    jest.resetAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('GET /health returns 200 and ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'reservation-service' });
  });

  it('POST /api/reservations creates reservation when user is certified', async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/machines/m1')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ id: 'm1', name: '3D Printer', needsCert: true })
        });
      }
      if (url.includes('/api/certified')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ user: 'Ashley', machine: 'm1', certified: true })
        });
      }
      return Promise.reject(new Error(`Unhandled mock url: ${url}`));
    });

    const res = await request(app).post('/api/reservations').send({
      user: 'Ashley',
      machine: 'm1',
      date: '2026-10-15',
      timeSlot: '09:00 - 10:30 AM'
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toBe('Ashley');
    expect(res.body.machine).toBe('m1');
    expect(res.body.machineName).toBe('3D Printer');
  });

  it('POST /api/reservations rejects uncertified user booking certified machine', async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/machines/m1')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ id: 'm1', name: '3D Printer', needsCert: true })
        });
      }
      if (url.includes('/api/certified')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ user: 'Justin', machine: 'm1', certified: false })
        });
      }
      return Promise.reject(new Error(`Unhandled mock url: ${url}`));
    });

    const res = await request(app).post('/api/reservations').send({
      user: 'Justin',
      machine: 'm1',
      date: '2026-10-15',
      timeSlot: '09:00 - 10:30 AM'
    });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/not certified/i);
  });

  it('POST /api/reservations rejects double booking collision on same slot', async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/machines/m3')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ id: 'm3', name: 'Workbench', needsCert: false })
        });
      }
      return Promise.reject(new Error(`Unhandled mock url: ${url}`));
    });

    const payload = {
      user: 'Justin',
      machine: 'm3',
      date: '2026-10-15',
      timeSlot: '10:30 - 12:00 PM'
    };

    const first = await request(app).post('/api/reservations').send(payload);
    expect(first.status).toBe(201);

    const second = await request(app).post('/api/reservations').send(payload);
    expect(second.status).toBe(409);
    expect(second.body.error).toMatch(/already booked/i);
  });

  it('POST /api/reservations returns 404 if machine does not exist', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Machine not found' })
      })
    );

    const res = await request(app).post('/api/reservations').send({
      user: 'Ashley',
      machine: 'unknown',
      date: '2026-10-15',
      timeSlot: '01:00 - 02:30 PM'
    });

    expect(res.status).toBe(404);
  });

  it('GET /api/reservations returns list of confirmed reservations', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 'm3', name: 'Workbench', needsCert: false })
      })
    );

    await request(app).post('/api/reservations').send({
      user: 'Ashley',
      machine: 'm3',
      date: '2026-10-18',
      timeSlot: '02:30 - 04:00 PM'
    });

    const res = await request(app).get('/api/reservations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].user).toBe('Ashley');
  });
});
