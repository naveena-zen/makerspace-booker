const request = require('supertest');
const app = require('../src/app');

describe('Machine Service', () => {
  it('GET /health returns 200 and ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'machine-service' });
  });

  it('GET /api/machines returns all machines', async () => {
    const res = await request(app).get('/api/machines');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0]).toMatchObject({ id: 'm1', name: '3D Printer', needsCert: true });
  });

  it('GET /api/machines/m1 returns specific machine details', async () => {
    const res = await request(app).get('/api/machines/m1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'm1', name: '3D Printer', needsCert: true });
  });

  it('GET /api/machines/unknown returns 404', async () => {
    const res = await request(app).get('/api/machines/unknown');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
