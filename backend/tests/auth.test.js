// ==================================================
// CareerLink - Authentication & Authorization Tests
// ==================================================
// Tests for user registration, login, profile, and JWT verification

const request = require('supertest');
const { app, connectTestDB, cleanTestDB, closeTestDB, createTestUser } = require('./setup');

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await cleanTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Authentication Endpoints (/api/auth)', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new jobseeker successfully', async () => {
      // Naya jobseeker user register karo
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Rahul Sharma',
          email: 'rahul.sharma@example.com',
          password: 'securepassword123',
          role: 'jobseeker',
          phone: '+919876543210',
          skills: ['javascript', 'react', 'node.js'],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('rahul.sharma@example.com');
      expect(res.body.data.user.role).toBe('jobseeker');
      expect(res.body.data).toHaveProperty('token');
      expect(typeof res.body.data.token).toBe('string');
    });

    it('should register a new recruiter successfully', async () => {
      // Naya recruiter register karo
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Priya Verma',
          email: 'priya.recruiter@techcorp.com',
          password: 'securepassword123',
          role: 'recruiter',
          company: 'TechCorp India',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.company).toBe('TechCorp India');
      expect(res.body.data.user.role).toBe('recruiter');
      expect(res.body.data).toHaveProperty('token');
    });

    it('should reject registration with duplicate email (409 Conflict)', async () => {
      // Pehle ek user banao
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate User',
          email: 'duplicate@example.com',
          password: 'password123',
          role: 'jobseeker',
        });

      // Same email se dobara register karne ki koshish karo
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'duplicate@example.com',
          password: 'password123',
          role: 'jobseeker',
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should fail validation when required fields are missing (400)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'incomplete@example.com',
          // name missing
          // password missing
          // role missing
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should fail validation when password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Short Pass',
          email: 'shortpass@example.com',
          password: '123', // less than 6 chars
          role: 'jobseeker',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should reject invalid role (not recruiter or jobseeker)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'password123',
          role: 'superadmin', // invalid role
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Test user register karo
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login Test User',
          email: 'logintest@example.com',
          password: 'correctpassword123',
          role: 'jobseeker',
        });
    });

    it('should login successfully with valid email and password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'correctpassword123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('logintest@example.com');
    });

    it('should return 401 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'somepassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when login payload is missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
        });

      expect(res.statusCode).toBe(400);
    });

    it('should strictly reject email-only authentication attempt without password or token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/firebase-login (Firebase ID Token Flow)', () => {
    it('should authenticate and issue JWT when valid Firebase token is provided in body', async () => {
      const res = await request(app)
        .post('/api/auth/firebase-login')
        .send({
          firebaseToken: 'mock_test_token_firebaseuser@example.com',
          role: 'jobseeker',
          name: 'Firebase User',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('firebaseuser@example.com');
      expect(res.body.data.user.firebaseUid).toBe('test_uid_firebaseuser@example.com');
    });

    it('should authenticate when Firebase token is sent via Bearer Authorization header', async () => {
      const res = await request(app)
        .post('/api/auth/firebase-login')
        .set('Authorization', 'Bearer mock_test_token_headeruser@example.com')
        .send({
          role: 'recruiter',
          company: 'Acme Corp',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('headeruser@example.com');
      expect(res.body.data.user.role).toBe('recruiter');
    });

    it('should return 401 when Firebase token is missing', async () => {
      const res = await request(app)
        .post('/api/auth/firebase-login')
        .send({});

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET & PUT /api/auth/profile', () => {
    it('should fetch user profile when authenticated with valid JWT', async () => {
      const { user, token } = await createTestUser();

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user._id).toBe(user._id.toString());
      expect(res.body.data.user.email).toBe(user.email);
    });

    it('should return 401 when Authorization header is missing', async () => {
      const res = await request(app).get('/api/auth/profile');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for an invalid or tampered JWT token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid.token.value');

      expect(res.statusCode).toBe(401);
    });

    it('should update user profile details with valid JWT', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          bio: 'Full stack developer with 3 years experience',
          skills: ['javascript', 'react', 'typescript', 'docker'],
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.name).toBe('Updated Name');
      expect(res.body.data.user.bio).toBe('Full stack developer with 3 years experience');
      expect(res.body.data.user.skills).toContain('docker');
    });
  });
});
