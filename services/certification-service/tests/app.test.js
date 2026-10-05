const request = require('supertest');
const app = require('../src/app');

describe('Certification Service', () => {
  it('GET /health returns 200 and ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'certification-service' });
  });

  it('GET /api/certified returns certified true for Ashley on m1', async () => {
    const res = await request(app).get('/api/certified?user=Ashley&machine=m1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      user: 'Ashley',
      machine: 'm1',
      certified: true
    });
  });

  it('GET /api/certified returns certified false for Justin on m1', async () => {
    const res = await request(app).get('/api/certified?user=Justin&machine=m1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      user: 'Justin',
      machine: 'm1',
      certified: false
    });
  });

  it('GET /api/certified returns 400 when user or machine parameter is missing', async () => {
    const res = await request(app).get('/api/certified?user=Ashley');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
