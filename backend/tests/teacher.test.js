const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../models/User');
const Topic = require('../models/Topic');
const RegistrationPeriod = require('../models/RegistrationPeriod');

let teacherToken;
let teacherId;
let studentToken;
let studentId;
let testTopic;
let registrationPeriod;

describe('Teacher Features API', () => {
  beforeAll(async () => {
    await mongoose.connect(
      process.env.MONGODB_URI_TEST || process.env.MONGODB_URI
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear data
    await User.deleteMany({});
    await Topic.deleteMany({});
    await RegistrationPeriod.deleteMany({});

    // Create test users
    const teacher = await User.create({
      user_id: 'TEA001',
      email: 'teacher@test.com',
      password: 'password123',
      user_name: 'Test Teacher',
      role: 'teacher',
      user_status: true,
    });

    const student = await User.create({
      user_id: 'STU001',
      email: 'student@test.com',
      password: 'password123',
      user_name: 'Test Student',
      role: 'student',
      user_status: true,
    });

    // Create a registration period required by Topic schema
    const reg = await RegistrationPeriod.create({
      registration_period_semester: '2026-1',
      registration_period_start: new Date(),
      registration_period_end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      registration_period_status: 'active',
    });
    registrationPeriod = reg;

    // Create test topic (descriptions must be >=50 chars per schema)
    testTopic = await Topic.create({
      topic_title: 'Test Topic for Approval',
      topic_description:
        'Đây là đề tài kiểm thử với mô tả chi tiết hơn 50 ký tự để thỏa điều kiện kiểm tra.',
      topic_registration_period: reg._id,
      topic_category: new mongoose.Types.ObjectId(),
      topic_major: new mongoose.Types.ObjectId(),
      topic_creator: student._id,
      topic_instructor: teacher._id,
      topic_teacher_status: 'pending',
      is_active: true,
    });

    // Get tokens
    const teacherLogin = await request(app).post('/api/auth/login').send({
      email: 'teacher@test.com',
      password: 'password123',
    });

    const studentLogin = await request(app).post('/api/auth/login').send({
      email: 'student@test.com',
      password: 'password123',
    });

    teacherToken = teacherLogin.body.data.accessToken;
    studentToken = studentLogin.body.data.accessToken;
    teacherId = teacherLogin.body.data.user._id;
    studentId = studentLogin.body.data.user._id;
  });

  describe('GET /api/teacher/topics', () => {
    it('should get teacher topics', async () => {
      const res = await request(app)
        .get('/api/teacher/topics')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should not allow non-teachers', async () => {
      const res = await request(app)
        .get('/api/teacher/topics')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('POST /api/teacher/topics', () => {
    it('should allow teacher to create topic', async () => {
      const newTopic = {
        topic_title: 'New Teacher Topic',
        topic_description:
          'Mô tả chi tiết cho đề tài giảng viên, đảm bảo dài hơn 50 ký tự để vượt validator của schema.',
        topic_category: new mongoose.Types.ObjectId().toString(),
        topic_registration_period: registrationPeriod._id.toString(),
        topic_max_members: 3,
      };

      const res = await request(app)
        .post('/api/teacher/topics')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(newTopic);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.topic_title).toBe(newTopic.topic_title);
    });
  });

  describe('GET /api/teacher/topics/pending-approval', () => {
    it('should get pending approval topics', async () => {
      const res = await request(app)
        .get('/api/teacher/topics/pending-approval')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('PUT /api/teacher/topics/:id/approve', () => {
    it('should allow teacher to approve topic', async () => {
      const res = await request(app)
        .put(`/api/teacher/topics/${testTopic._id}/approve`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          status: 'approved',
          feedback: 'Good topic',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/teacher/students/registrations', () => {
    it('should get student registrations', async () => {
      // First register student to topic
      await Topic.findByIdAndUpdate(testTopic._id, {
        $push: {
          topic_group_student: {
            student: studentId,
            status: 'pending',
          },
        },
      });

      const res = await request(app)
        .get('/api/teacher/students/registrations')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });
  });
});
