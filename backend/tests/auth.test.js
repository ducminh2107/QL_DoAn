const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/User');

let testUser;

describe('Authentication API', () => {
  beforeAll(async () => {
    await mongoose.connect(
      process.env.MONGODB_URI_TEST || process.env.MONGODB_URI
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});

    // Create test user
    testUser = await User.create({
      user_id: 'TEST001',
      email: 'test@example.com',
      password: 'password123',
      user_name: 'Test User',
      role: 'student',
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/auth/register').send({
        user_id: 'NEW001',
        email: 'new@example.com',
        password: 'password123',
        user_name: 'New User',
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('email', 'new@example.com');
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should not register with duplicate email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        user_id: 'NEW002',
        email: 'test@example.com', // Already exists
        password: 'password123',
        user_name: 'Duplicate User',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should not login with invalid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user with valid token', async () => {
      // First login to get token
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      const token = loginRes.body.data.accessToken;

      // Get current user
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
    });

    it('should not get user without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toEqual(401);
    });
  });
});
