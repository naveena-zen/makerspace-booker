const request = require('supertest');
const app = require('../src/app');

const originalFetch = global.fetch;

describe('API Gateway & Static Host', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('GET /health returns 200 and ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'gateway' });
  });

  it('GET / returns 200 and serves static HTML', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('MakerSpace Booker');
  });

  it('Proxy GET /api/machines forwards to Machine Service', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([{ id: 'm1', name: '3D Printer' }])
      })
    );

    const res = await request(app).get('/api/machines');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 'm1', name: '3D Printer' }]);
    expect(global.fetch).toHaveBeenCalled();
  });

  it('Proxy GET /api/certified forwards to Certification Service', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ user: 'Ashley', machine: 'm1', certified: true })
      })
    );

    const res = await request(app).get('/api/certified?user=Ashley&machine=m1');
    expect(res.status).toBe(200);
    expect(res.body.certified).toBe(true);
  });

  it('Proxy POST /api/reservations forwards to Reservation Service', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ id: 'RES-999', user: 'Ashley', machine: 'm1' })
      })
    );

    const res = await request(app).post('/api/reservations').send({
      user: 'Ashley',
      machine: 'm1'
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe('RES-999');
  });
});
