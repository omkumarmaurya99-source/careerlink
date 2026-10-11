// ==================================================
// CareerLink - Resume Parser & Upload Tests
// ==================================================
// Tests for resume parsing service and resume endpoints

const request = require('supertest');
const ResumeParserService = require('../src/services/resumeParserService');
const {
  app,
  connectTestDB,
  cleanTestDB,
  closeTestDB,
  createTestUser,
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

describe('Resume Parsing & Upload Endpoints', () => {
  describe('ResumeParserService.extractInformation (Unit Test)', () => {
    it('should extract email, phone, and technical skills from resume text', () => {
      const sampleText = `
        Rahul Sharma
        Software Developer
        Email: rahul.developer@gmail.com
        Phone: +91 98765 43210
        Summary: Experienced backend developer proficient in JavaScript, Node.js, Express, MongoDB, Docker, and Git.
      `;

      const parsed = ResumeParserService.extractInformation(sampleText);

      expect(parsed.extractedEmail).toBe('rahul.developer@gmail.com');
      expect(parsed.extractedPhone).toBe('+91 98765 43210');
      expect(parsed.extractedSkills).toEqual(
        expect.arrayContaining(['javascript', 'node.js', 'express', 'mongodb', 'docker', 'git'])
      );
      expect(parsed.extractedName).toBe('Rahul Sharma');
    });

    it('should handle empty or whitespace text gracefully', () => {
      const parsed = ResumeParserService.extractInformation('   ');

      expect(parsed.extractedEmail).toBe('');
      expect(parsed.extractedSkills).toEqual([]);
      expect(parsed.extractedName).toBe('');
    });
  });

  describe('GET /api/resume/parsed', () => {
    it('should fetch parsed resume information for authenticated user', async () => {
      const { user, token } = await createTestUser({
        resume: '/uploads/test_resume.pdf',
        parsedResume: {
          rawText: 'Experienced Node.js developer',
          extractedSkills: ['node.js', 'mongodb'],
          extractedEmail: 'test@example.com',
          extractedName: 'Test Candidate',
          parsedAt: new Date(),
        },
      });

      const res = await request(app)
        .get('/api/resume/parsed')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.parsedData.extractedSkills).toContain('node.js');
    });

    it('should require authentication to access parsed resume', async () => {
      const res = await request(app).get('/api/resume/parsed');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/resume/upload - File validation', () => {
    it('should reject upload when no file is attached (400)', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .post('/api/resume/upload')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/please upload a (resume )?file/i);
    });

    it('should reject file upload with unsupported extension like .exe (400)', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .post('/api/resume/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('resume', Buffer.from('malicious content'), 'exploit.exe');

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/only pdf, doc, and docx/i);
    });
  });
});
