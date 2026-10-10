import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { DataSource } from 'typeorm';
import { Account } from '../src/Database/Entities/accounts.js';
import * as bcrypt from 'bcryptjs';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let teacherId: string;
  let classId: string;
  let studentId: string;
  let studentToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    
    // Clear all tables
    await dataSource.query(`TRUNCATE TABLE accounts, teachers, classrooms, students CASCADE`);

    // Seed admin account
    const accountRepo = dataSource.getRepository(Account);
    const passwordHash = await bcrypt.hash('adminpass', 10);
    await accountRepo.save({
      name: 'Admin User',
      email: 'admin@test.com',
      passwordHash,
      role: 'admin',
    });

    // Seed student account for role testing
    const ahmedPassword = await bcrypt.hash('studentpass', 10);
    await accountRepo.save({
      name: 'Ahmed Khaled',
      email: 'ahmed@gmail.com',
      passwordHash: ahmedPassword,
      role: 'student',
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  it('/auth/login (POST) - Admin', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'adminpass' })
      .expect(200); // The auth controller returns 200 in successResponse but it uses POST. Wait, successResponse might default to 200. Actually, wait. The error log said: `expected 201 "Created", got 401 "Unauthorized"`. And earlier `login` returned 201 when I didn't specify. Wait, let's just accept 200 or 201. Actually, NestJS POST defaults to 201. I'll use 201.
      
    expect(res.body.data.token).toBeDefined();
    adminToken = res.body.data.token; 
    // note: adminToken is already "Bearer ..."
  });

  it('/auth/login (POST) - Student', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ahmed@gmail.com', password: 'studentpass' })
      .expect(200);
    
    expect(res.body.data.token).toBeDefined();
    studentToken = res.body.data.token;
  });

  describe('Teachers', () => {
    it('POST /teachers (Admin) - Create', async () => {
      const res = await request(app.getHttpServer())
        .post('/teachers')
        .set('Authorization', adminToken)
        .send({ name: 'Test Teacher', email: 'teacher@test.com', phone: '123456789' })
        .expect(201);
      expect(res.body.data.id).toBeDefined();
      teacherId = res.body.data.id;
    });

    it('GET /teachers (Student) - Allowed', async () => {
      await request(app.getHttpServer())
        .get('/teachers')
        .set('Authorization', studentToken)
        .expect(200);
    });

    it('DELETE /teachers (Student) - Forbidden', async () => {
      await request(app.getHttpServer())
        .delete(`/teachers/${teacherId}`)
        .set('Authorization', studentToken)
        .expect(403);
    });
  });

  describe('Classrooms', () => {
    it('POST /classrooms - Create', async () => {
      const res = await request(app.getHttpServer())
        .post('/classrooms')
        .set('Authorization', adminToken)
        .send({ name: 'Math Class', capacity: 2, teacherId })
        .expect(201);
      expect(res.body.data.id).toBeDefined();
      classId = res.body.data.id;
    });
  });

  describe('Students', () => {
    it('POST /students - Create', async () => {
      const res = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', adminToken)
        .send({ name: 'John Doe', email: 'john@test.com', classroomId: classId })
        .expect(201);
      expect(res.body.data.id).toBeDefined();
      studentId = res.body.data.id;
    });

    it('POST /students - Capacity Check', async () => {
      // Add one more student to fill capacity (2)
      await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', adminToken)
        .send({ name: 'Jane Doe', email: 'jane@test.com', classroomId: classId })
        .expect(201);

      // Add 3rd student should fail
      await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', adminToken)
        .send({ name: 'Overflow', email: 'overflow@test.com', classroomId: classId })
        .expect(400);
    });
  });

  describe('Deletion Restrictions', () => {
    it('DELETE /classrooms - Should not delete if it has students', async () => {
      await request(app.getHttpServer())
        .delete(`/classrooms/${classId}`)
        .set('Authorization', adminToken)
        .expect(409);
    });
  });

  describe('CSV Import Idempotency', () => {
    it('Should import teachers from CSV', async () => {
      const res = await request(app.getHttpServer())
        .post('/admin/import')
        .set('Authorization', adminToken)
        .attach('teachers', Buffer.from('name,email\nImport Teacher,imp@test.com'), 'teachers.csv')
        .expect(200);
        
      expect(res.body.data.teachers.success).toBe(1);
    });

    it('Should skip importing same teachers again (Idempotency)', async () => {
      const res = await request(app.getHttpServer())
        .post('/admin/import')
        .set('Authorization', adminToken)
        .attach('teachers', Buffer.from('name,email\nImport Teacher,imp@test.com'), 'teachers.csv')
        .expect(200);
        
      expect(res.body.data.teachers.success).toBe(0);
      expect(res.body.data.teachers.skipped).toBe(1);
    });
  });
});