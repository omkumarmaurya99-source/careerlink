// ==================================================
// CareerLink - Security & Robustness Tests
// ==================================================
// Tests for security headers, rate limiting, token tampering, and input validation

const request = require('supertest');
const {
  app,
  connectTestDB,
  cleanTestDB,
  closeTestDB,
  createTestUser,
  createTestRecruiter,
} = require('./setup');

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await cleanTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Security & Protection Tests', () => {
  it('should include Helmet security headers on responses', async () => {
    const res = await request(app).get('/health');

    // Helmet security headers check
    expect(res.headers).toHaveProperty('x-dns-prefetch-control');
    expect(res.headers).toHaveProperty('x-frame-options');
    expect(res.headers).toHaveProperty('strict-transport-security');
  });

  it('should reject requests with malformed or tampered Authorization header', async () => {
    // No "Bearer " prefix
    const res1 = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'InvalidFormatHeader');

    expect(res1.statusCode).toBe(401);

    // Tampered token
    const res2 = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature');

    expect(res2.statusCode).toBe(401);
  });

  it('should strictly enforce RBAC - Jobseeker cannot access Recruiter-only endpoints', async () => {
    const { token: seekerToken } = await createTestUser({ role: 'jobseeker' });

    // Jobseeker trying to access recruiter my-jobs
    const res = await request(app)
      .get('/api/jobs/recruiter/my-jobs')
      .set('Authorization', `Bearer ${seekerToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should strictly enforce RBAC - Recruiter cannot apply for jobs', async () => {
    const { token: recruiterToken } = await createTestRecruiter();

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .field('jobId', '507f1f77bcf86cd799439011');

    expect(res.statusCode).toBe(403);
  });

  it('should reject NoSQL injection / invalid parameter structures safely', async () => {
    const res = await request(app)
      .get('/api/jobs/not_a_valid_hex_id')
      .send();

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
