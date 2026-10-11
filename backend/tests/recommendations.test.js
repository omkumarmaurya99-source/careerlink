// ==================================================
// CareerLink - Job Recommendations Tests
// ==================================================
// Tests for skill-match scoring algorithm and personalized recommendations

const request = require('supertest');
const {
  app,
  connectTestDB,
  cleanTestDB,
  closeTestDB,
  createTestUser,
  createTestRecruiter,
  createTestJob,
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

describe('Recommendation Endpoints (/api/recommendations)', () => {
  it('should recommend jobs based on candidate skills with match percentage', async () => {
    const { user: recruiter } = await createTestRecruiter();

    // 100% match job for ['javascript', 'react', 'node.js']
    await createTestJob(recruiter._id, {
      title: 'Full Stack JavaScript Engineer',
      skills: ['javascript', 'react', 'node.js'],
    });

    // Partial match job (1 of 3 matches)
    await createTestJob(recruiter._id, {
      title: 'Data Engineer',
      skills: ['python', 'sql', 'node.js'],
    });

    // Zero match job
    await createTestJob(recruiter._id, {
      title: 'C++ Systems Engineer',
      skills: ['c++', 'rust', 'embedded'],
    });

    // Jobseeker with specific skills
    const { token: seekerToken } = await createTestUser({
      role: 'jobseeker',
      skills: ['javascript', 'react', 'node.js'],
    });

    const res = await request(app)
      .get('/api/recommendations')
      .set('Authorization', `Bearer ${seekerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recommendations.length).toBe(2);

    // First recommendation should be highest match percentage (100%)
    const topJob = res.body.data.recommendations[0];
    expect(topJob.matchPercentage).toBe(100);
    expect(topJob.matchedSkills).toEqual(expect.arrayContaining(['javascript', 'react', 'node.js']));
    expect(topJob.missingSkills.length).toBe(0);

    // Second recommendation should be partial match (33%)
    const partialJob = res.body.data.recommendations[1];
    expect(partialJob.matchPercentage).toBe(33);
    expect(partialJob.matchedSkills).toContain('node.js');
    expect(partialJob.missingSkills).toEqual(expect.arrayContaining(['python', 'sql']));
  });

  it('should return empty recommendations if user has no skills profile', async () => {
    const { token: seekerToken } = await createTestUser({
      role: 'jobseeker',
      skills: [],
    });

    const res = await request(app)
      .get('/api/recommendations')
      .set('Authorization', `Bearer ${seekerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.recommendations.length).toBe(0);
    expect(res.body.data.message).toMatch(/add skills/i);
  });

  it('should reject unauthenticated recommendation requests (401)', async () => {
    const res = await request(app).get('/api/recommendations');

    expect(res.statusCode).toBe(401);
  });
});
