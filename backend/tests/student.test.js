const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/User');
const Topic = require('../src/models/Topic');
const RegistrationPeriod = require('../src/models/RegistrationPeriod');
const Faculty = require('../src/models/Faculty');
const Major = require('../src/models/Major');
const TopicCategory = require('../src/models/TopicCategory');

let studentToken;
let studentId;
let teacherToken;
let testTopic;
let testPeriod;
let testMajor;
let testCategory;

describe('Student Features API', () => {
  beforeAll(async () => {
    await mongoose.connect(
      process.env.MONGODB_URI_TEST ||
        process.env.MONGODB_CONNECTIONSTRING ||
        process.env.MONGODB_URI
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
    await Faculty.deleteMany({});
    await Major.deleteMany({});
    await TopicCategory.deleteMany({});

    // Create faculty and major
    const faculty = await Faculty.create({
      faculty_title: 'Công nghệ thông tin',
      faculty_code: 'CNTT',
    });

    testMajor = await Major.create({
      major_title: 'Kỹ thuật phần mềm',
      major_code: 'KTPM',
      major_faculty: faculty._id,
    });

    // Create topic category
    testCategory = await TopicCategory.create({
      topic_category_title: 'Ứng dụng Web',
      topic_category_description: 'Các đề tài về phát triển ứng dụng web',
    });

    // Create test users
    const student = await User.create({
      user_id: 'STU001',
      email: 'student@test.com',
      password: 'password123',
      user_name: 'Test Student',
      role: 'student',
      user_status: true,
      user_major: testMajor._id,
    });

    const teacher = await User.create({
      user_id: 'TEA001',
      email: 'teacher@test.com',
      password: 'password123',
      user_name: 'Test Teacher',
      role: 'teacher',
      user_status: true,
    });

    // Create registration period
    const now = new Date();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1
    );
    const endDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate()
    );

    testPeriod = await RegistrationPeriod.create({
      registration_period_semester: 'HK_TEST',
      registration_period_start: startDate,
      registration_period_end: endDate,
      registration_period_status: 'active',
      allow_registration: true,
      allow_proposal: true,
    });

    // Create test topic
    testTopic = await Topic.create({
      topic_title: 'Hệ thống quản lý thư viện trực tuyến',
      topic_description:
        'Đây là mô tả chi tiết của đề tài nhằm mục đích kiểm tra tính năng đăng ký đề tài của sinh viên trên hệ thống quản lý đồ án tốt nghiệp.',
      topic_category: testCategory._id,
      topic_major: testMajor._id,
      topic_creator: teacher._id,
      topic_instructor: teacher._id,
      topic_teacher_status: 'approved',
      topic_leader_status: 'approved',
      topic_registration_period: testPeriod._id,
      is_active: true,
    });

    // Get tokens
    const studentLogin = await request(app).post('/api/auth/login').send({
      email: 'student@test.com',
      password: 'password123',
    });

    studentToken = studentLogin.body.data.accessToken;
    studentId = studentLogin.body.data.user._id;

    const teacherLogin = await request(app).post('/api/auth/login').send({
      email: 'teacher@test.com',
      password: 'password123',
    });
    teacherToken = teacherLogin.body.data.accessToken;
  });

  describe('GET /api/student/topics', () => {
    it('should get available topics for student', async () => {
      const res = await request(app)
        .get('/api/student/topics')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should not allow non-students to access', async () => {
      const res = await request(app)
        .get('/api/student/topics')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('POST /api/student/topics/:id/register', () => {
    it('should allow student to register for topic', async () => {
      const res = await request(app)
        .post(`/api/student/topics/${testTopic._id}/register`)
        .set('Authorization', `Bearer ${studentToken}`);

      if (res.statusCode !== 200)
        console.log('DEBUG: registerForTopic ERROR:', res.body);
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Đăng ký đề tài thành công');
    });

    it('should prevent duplicate registration', async () => {
      // First registration
      await request(app)
        .post(`/api/student/topics/${testTopic._id}/register`)
        .set('Authorization', `Bearer ${studentToken}`);

      // Second registration (should fail)
      const res = await request(app)
        .post(`/api/student/topics/${testTopic._id}/register`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('POST /api/student/topics/propose', () => {
    it('should allow student to propose new topic', async () => {
      const newTopic = {
        topic_title: 'Hệ thống quản lý điểm sinh viên trực tuyến',
        topic_description:
          'Đây là mô tả chi tiết cho đề xuất đề tài mới của sinh viên, bao gồm các mục tiêu và phạm vi nghiên cứu dự kiến của đề tài này.',
        topic_category: testCategory._id.toString(),
        topic_max_members: 3,
      };

      const res = await request(app)
        .post('/api/student/topics/propose')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(newTopic);

      if (res.statusCode !== 201)
        console.log('DEBUG: proposeTopic ERROR:', res.body);
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.topic_title).toBe(newTopic.topic_title);
    });
  });

  describe('GET /api/student/my-topic', () => {
    it('should return null if student has no topic', async () => {
      const res = await request(app)
        .get('/api/student/my-topic')
        .set('Authorization', `Bearer ${studentToken}`);

      if (res.statusCode !== 200)
        console.log('DEBUG: getMyTopic ERROR:', res.body);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeNull();
    });
  });
});
