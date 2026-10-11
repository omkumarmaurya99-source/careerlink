// ==================================================
// CareerLink - Application Tests
// ==================================================
// Tests for job application submission, duplicate prevention, status updates, and RBAC

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

describe('Application Endpoints (/api/applications)', () => {
  describe('POST /api/applications (Apply for Job)', () => {
    it('should allow a jobseeker to apply for an active job', async () => {
      const { user: recruiter } = await createTestRecruiter();
      const job = await createTestJob(recruiter._id);
      const { user: jobseeker, token: seekerToken } = await createTestUser({ role: 'jobseeker' });

      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${seekerToken}`)
        .field('jobId', job._id.toString())
        .field('coverLetter', 'I am very excited about this role and have all required skills.');

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect((res.body.data.application.job._id || res.body.data.application.job).toString()).toBe(job._id.toString());
      expect((res.body.data.application.applicant._id || res.body.data.application.applicant).toString()).toBe(jobseeker._id.toString());
      expect(res.body.data.application.status).toBe('applied');
    });

    it('should prevent duplicate applications for the same job by the same user (409 Conflict)', async () => {
      const { user: recruiter } = await createTestRecruiter();
      const job = await createTestJob(recruiter._id);
      const { token: seekerToken } = await createTestUser({ role: 'jobseeker' });

      // First application
      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${seekerToken}`)
        .field('jobId', job._id.toString())
        .field('coverLetter', 'First application');

      // Duplicate attempt
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${seekerToken}`)
        .field('jobId', job._id.toString())
        .field('coverLetter', 'Second application attempt');

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already applied/i);
    });

    it('should forbid a recruiter from applying for a job (403 Forbidden)', async () => {
      const { user: recruiter1 } = await createTestRecruiter({ email: 'rec1@test.com' });
      const { token: recruiter2Token } = await createTestRecruiter({ email: 'rec2@test.com' });
      const job = await createTestJob(recruiter1._id);

      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${recruiter2Token}`)
        .field('jobId', job._id.toString());

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/applications/user/:id (Jobseeker Applications)', () => {
    it('should return all applications for the authenticated jobseeker', async () => {
      const { user: recruiter } = await createTestRecruiter();
      const job1 = await createTestJob(recruiter._id, { title: 'Backend Dev' });
      const job2 = await createTestJob(recruiter._id, { title: 'Frontend Dev' });
      const { user: jobseeker, token: seekerToken } = await createTestUser({ role: 'jobseeker' });

      // Apply to both jobs
      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${seekerToken}`)
        .field('jobId', job1._id.toString());

      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${seekerToken}`)
        .field('jobId', job2._id.toString());

      const res = await request(app)
        .get(`/api/applications/user/${jobseeker._id}`)
        .set('Authorization', `Bearer ${seekerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });
  });

  describe('PUT /api/applications/:id/status (Update Application Status)', () => {
    it('should allow job owner recruiter to update applicant status', async () => {
      const { user: recruiter, token: recruiterToken } = await createTestRecruiter();
      const job = await createTestJob(recruiter._id);
      const { token: seekerToken } = await createTestUser({ role: 'jobseeker' });

      // Apply
      const applyRes = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${seekerToken}`)
        .field('jobId', job._id.toString());

      const applicationId = applyRes.body.data.application._id;

      // Update status to shortlisted
      const updateRes = await request(app)
        .put(`/api/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          status: 'shortlisted',
          feedback: 'Candidate has strong background. Moving to interview round.',
        });

      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.application.status).toBe('shortlisted');
    });

    it('should forbid a non-owner recruiter from updating application status', async () => {
      const { user: recruiter1 } = await createTestRecruiter({ email: 'ownerrec@test.com' });
      const { token: recruiter2Token } = await createTestRecruiter({ email: 'otherrec@test.com' });
      const job = await createTestJob(recruiter1._id);
      const { token: seekerToken } = await createTestUser({ role: 'jobseeker' });

      const applyRes = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${seekerToken}`)
        .field('jobId', job._id.toString());

      const applicationId = applyRes.body.data.application._id;

      const updateRes = await request(app)
        .put(`/api/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${recruiter2Token}`)
        .send({ status: 'rejected' });

      expect(updateRes.statusCode).toBe(403);
    });

    it('should reject invalid status values (400 Bad Request)', async () => {
      const { user: recruiter, token: recruiterToken } = await createTestRecruiter();
      const job = await createTestJob(recruiter._id);
      const { token: seekerToken } = await createTestUser({ role: 'jobseeker' });

      const applyRes = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${seekerToken}`)
        .field('jobId', job._id.toString());

      const applicationId = applyRes.body.data.application._id;

      const res = await request(app)
        .put(`/api/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({ status: 'invalid-status-xyz' });

      expect(res.statusCode).toBe(400);
    });
  });
});
