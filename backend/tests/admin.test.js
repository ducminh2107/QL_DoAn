const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/User');
const Semester = require('../src/models/Semester');

let adminToken;

describe('Admin API', () => {
  beforeAll(async () => {
    await mongoose.connect(
      process.env.MONGODB_URI_TEST || process.env.MONGODB_URI
    );
  });

  afterAll(async () => {
    await Semester.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Semester.deleteMany({});

    // Create admin user for testing
    const admin = await User.create({
      user_id: 'ADMIN001',
      email: 'admin@test.com',
      password: 'password123',
      user_name: 'Admin Test',
      role: 'admin',
    });

    // Login to get token
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'password123',
    });
    adminToken = loginRes.body.data.accessToken;
  });

  describe('GET /api/users', () => {
    it('should allow admin to get all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Semester Management', () => {
    it('should create a new semester', async () => {
      const res = await request(app)
        .post('/api/semesters')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          semester_name: 'Test Semester 2024',
          semester_start_date: '2024-01-01',
          semester_end_date: '2024-06-30',
          semester_status: 'upcoming',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.semester_name).toBe('Test Semester 2024');
    });

    it('should get all semesters', async () => {
      await Semester.create({
        semester_name: 'Existing Semester',
        semester_start_date: new Date(),
        semester_end_date: new Date(),
      });

      const res = await request(app)
        .get('/api/semesters')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.count).toBeGreaterThan(0);
    });
  });

  describe('Major & Registration Period (404 Fix Verification)', () => {
    it('should get all majors', async () => {
      const res = await request(app)
        .get('/api/majors')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });

    it('should get all registration periods', async () => {
      const res = await request(app)
        .get('/api/registration-periods')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });
  });
});
