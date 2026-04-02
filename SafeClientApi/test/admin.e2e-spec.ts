import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * E2E tests for Admin endpoints.
 * Requires a running PostgreSQL instance with the admin seed user:
 *   email: admin@safeclient.com  password: Admin@123456
 *
 * Run with: npm run test:e2e
 */
describe('Admin (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  const adminEmail = 'admin@safeclient.com';
  const adminPassword = 'Admin@123456';
  const testUserEmail = `e2e-admin-test-${Date.now()}@safeclient.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Get admin token
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password: adminPassword });
    adminToken = adminLogin.body.access_token;

    // Register and login as regular user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: testUserEmail, password: 'TestSenha@123' });
    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUserEmail, password: 'TestSenha@123' });
    userToken = userLogin.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /admin/stats', () => {
    it('should return stats for admin', () => {
      return request(app.getHttpServer())
        .get('/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalReports');
          expect(res.body).toHaveProperty('totalUsers');
        });
    });

    it('should reject regular user', () => {
      return request(app.getHttpServer())
        .get('/admin/stats')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should reject unauthenticated request', () => {
      return request(app.getHttpServer())
        .get('/admin/stats')
        .expect(401);
    });
  });

  describe('GET /admin/users', () => {
    it('should return user list for admin', () => {
      return request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('GET /admin/reports', () => {
    it('should return report list for admin', () => {
      return request(app.getHttpServer())
        .get('/admin/reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
        });
    });

    it('should support active filter', () => {
      return request(app.getHttpServer())
        .get('/admin/reports?active=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          const reports = res.body.data as any[];
          reports.forEach((r) => expect(r.active).toBe(true));
        });
    });
  });

  describe('POST /admin/users', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: `new-admin-created-${Date.now()}@test.com`, password: 'Senha@1234' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).not.toHaveProperty('passwordHash');
        });
    });
  });
});
