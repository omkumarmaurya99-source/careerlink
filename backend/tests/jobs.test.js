// ==================================================
// CareerLink - Job CRUD, Search & RBAC Tests
// ==================================================
// Tests for job creation, search, listing, update, delete, and ownership enforcement

const request = require('supertest');
const mongoose = require('mongoose');
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

describe('Job Endpoints (/api/jobs)', () => {
  describe('POST /api/jobs (Create Job)', () => {
    it('should allow a recruiter to create a new job posting', async () => {
      const { user: recruiter, token } = await createTestRecruiter();

      const jobData = {
        title: 'Senior Node.js Developer',
        company: 'Cloud Innovators',
        description: 'We are hiring a Senior Node.js developer with microservices and MongoDB experience.',
        location: 'Bangalore, India',
        salary: '18-24 LPA',
        skills: ['node.js', 'express', 'mongodb', 'docker', 'redis'],
        jobType: 'full-time',
        experienceLevel: 'senior',
      };

      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${token}`)
        .send(jobData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.job.title).toBe(jobData.title);
      expect(res.body.data.job.company).toBe(jobData.company);
      expect((res.body.data.job.recruiter._id || res.body.data.job.recruiter).toString()).toBe(recruiter._id.toString());
      expect(res.body.data.job.skills).toContain('node.js');
    });

    it('should reject job creation by a jobseeker (403 Forbidden - RBAC)', async () => {
      const { token } = await createTestUser({ role: 'jobseeker' });

      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Unauthorized Job',
          company: 'Fake Co',
          description: 'This should fail because applicant cannot post job postings.',
          location: 'Remote',
          skills: ['javascript'],
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/forbidden|access denied|permission/i);
    });

    it('should reject job creation without authentication (401 Unauthorized)', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .send({
          title: 'Unauthenticated Job',
          company: 'No Auth Co',
          description: 'Missing token header',
          location: 'Remote',
          skills: ['javascript'],
        });

      expect(res.statusCode).toBe(401);
    });

    it('should fail validation when required fields are missing (400 Bad Request)', async () => {
      const { token } = await createTestRecruiter();

      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${token}`)
        .send({
          // title missing
          company: 'Incomplete Co',
          // description missing
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/jobs (List Jobs)', () => {
    beforeEach(async () => {
      const { user: recruiter } = await createTestRecruiter();
      await createTestJob(recruiter._id, {
        title: 'React Frontend Developer',
        location: 'Pune',
        skills: ['react', 'javascript', 'css'],
      });
      await createTestJob(recruiter._id, {
        title: 'Backend Python Engineer',
        location: 'Hyderabad',
        skills: ['python', 'django', 'postgresql'],
      });
      await createTestJob(recruiter._id, {
        title: 'Full Stack MERN Developer',
        location: 'Pune',
        skills: ['react', 'node.js', 'mongodb'],
      });
    });

    it('should list all available jobs with pagination metadata', async () => {
      const res = await request(app).get('/api/jobs');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(3);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.totalItems).toBe(3);
    });

    it('should filter jobs by location', async () => {
      const res = await request(app).get('/api/jobs?location=Pune');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data.every((j) => j.location.includes('Pune'))).toBe(true);
    });

    it('should filter jobs by skill', async () => {
      const res = await request(app).get('/api/jobs?skill=python');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe('Backend Python Engineer');
    });
  });

  describe('GET /api/jobs/search (Search Jobs)', () => {
    beforeEach(async () => {
      const { user: recruiter } = await createTestRecruiter();
      await createTestJob(recruiter._id, {
        title: 'DevOps Engineer AWS Docker',
        description: 'Managing cloud infrastructure and CI/CD pipelines with Kubernetes.',
        skills: ['aws', 'docker', 'kubernetes'],
      });
      await createTestJob(recruiter._id, {
        title: 'Data Scientist AI ML',
        description: 'Building machine learning models with TensorFlow and PyTorch.',
        skills: ['python', 'tensorflow', 'machine learning'],
      });
    });

    it('should search jobs by keyword matching title or description', async () => {
      const res = await request(app).get('/api/jobs/search?keyword=DevOps');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].title).toMatch(/DevOps/i);
    });

    it('should search jobs by skill keyword', async () => {
      const res = await request(app).get('/api/jobs/search?keyword=kubernetes');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/jobs/:id (Get Single Job)', () => {
    it('should return job details for a valid existing ID', async () => {
      const { user: recruiter } = await createTestRecruiter();
      const job = await createTestJob(recruiter._id);

      const res = await request(app).get(`/api/jobs/${job._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.job._id).toBe(job._id.toString());
      expect(res.body.data.job.title).toBe(job.title);
    });

    it('should return 404 for a non-existent job ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/jobs/${nonExistentId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for an invalid MongoDB ObjectId format', async () => {
      const res = await request(app).get('/api/jobs/not-a-valid-object-id');

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/jobs/:id (Update Job & Ownership)', () => {
    it('should allow the owner recruiter to update their job', async () => {
      const { user: recruiter, token } = await createTestRecruiter();
      const job = await createTestJob(recruiter._id);

      const res = await request(app)
        .put(`/api/jobs/${job._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Lead Backend Developer',
          salary: '25-30 LPA',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.job.title).toBe('Lead Backend Developer');
      expect(res.body.data.job.salary).toBe('25-30 LPA');
    });

    it('should forbid a different recruiter from updating the job (403 Forbidden)', async () => {
      const { user: recruiter1 } = await createTestRecruiter({ email: 'r1@test.com' });
      const { token: recruiter2Token } = await createTestRecruiter({ email: 'r2@test.com' });
      const job = await createTestJob(recruiter1._id);

      const res = await request(app)
        .put(`/api/jobs/${job._id}`)
        .set('Authorization', `Bearer ${recruiter2Token}`)
        .send({
          title: 'Hacked Title Attempt',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/authorized|permission|only.*own job/i);
    });
  });

  describe('DELETE /api/jobs/:id (Delete Job & Ownership)', () => {
    it('should allow the owner recruiter to delete their job', async () => {
      const { user: recruiter, token } = await createTestRecruiter();
      const job = await createTestJob(recruiter._id);

      const res = await request(app)
        .delete(`/api/jobs/${job._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion from DB
      const checkRes = await request(app).get(`/api/jobs/${job._id}`);
      expect(checkRes.statusCode).toBe(404);
    });

    it('should forbid another recruiter from deleting someone else job (403 Forbidden)', async () => {
      const { user: recruiter1 } = await createTestRecruiter({ email: 'owner@test.com' });
      const { token: recruiter2Token } = await createTestRecruiter({ email: 'intruder@test.com' });
      const job = await createTestJob(recruiter1._id);

      const res = await request(app)
        .delete(`/api/jobs/${job._id}`)
        .set('Authorization', `Bearer ${recruiter2Token}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
