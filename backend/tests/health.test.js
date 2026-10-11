// ==================================================
// CareerLink - Health Route Tests
// ==================================================
// Health check endpoints verification using Jest & Supertest

const request = require('supertest');
const { app, connectTestDB, closeTestDB } = require('./setup');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Health Check Endpoints', () => {
  it('GET /health - Should return server health status 200 OK', async () => {
    // Health endpoint check karo
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('OK');
    expect(res.body.data).toHaveProperty('uptime');
    expect(res.body.data).toHaveProperty('nodeVersion');
    expect(res.body.data).toHaveProperty('memoryUsage');
  });

  it('GET /api/health - Should also return health status via /api prefix', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('OK');
  });

  it('GET /non-existent-route - Should return 404 for unknown endpoints', async () => {
    const res = await request(app).get('/api/unknown-route-12345');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
