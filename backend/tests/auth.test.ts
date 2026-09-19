import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Auth Module Integration Tests', () => {
  const timestamp = Date.now();
  const testDoctorEmail = `doctor_${timestamp}@ayur.org`;
  const testDoctorPassword = 'Password@123';

  it('TC-AUTH-001: Valid Doctor registration with valid registration code (201)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Dr. Test Physician',
        email: testDoctorEmail,
        password: testDoctorPassword,
        role: 'DOCTOR',
        registrationCode: 'AYUR-2026',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testDoctorEmail.toLowerCase());
    expect(res.body.data.user.role).toBe('DOCTOR');
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('TC-AUTH-002: Rejects duplicate email registration with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Dr. Duplicate',
        email: testDoctorEmail,
        password: testDoctorPassword,
        role: 'DOCTOR',
        registrationCode: 'AYUR-2026',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('TC-AUTH-003: Valid Doctor login returns 200 + JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testDoctorEmail,
        password: testDoctorPassword,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testDoctorEmail.toLowerCase());
  });

  it('TC-AUTH-004: Login with wrong password returns 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testDoctorEmail,
        password: 'WrongPassword@999',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('TC-AUTH-005: Login with unknown account returns 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nobody_exists_12345@ayur.org',
        password: 'Password@123',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('TC-AUTH-006: Rejects registration with invalid email format (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Invalid Email User',
        email: 'not-an-email',
        password: 'Password@123',
        role: 'DOCTOR',
        registrationCode: 'AYUR-2026',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('TC-AUTH-007: Rejects registration with weak password lacking uppercase/special (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Weak Password User',
        email: `weak_${Date.now()}@ayur.org`,
        password: 'simplepassword',
        role: 'DOCTOR',
        registrationCode: 'AYUR-2026',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('TC-AUTH-008: Rejects staff registration with invalid registration code (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Fraudulent Staff',
        email: `fraud_${Date.now()}@ayur.org`,
        password: 'Password@123',
        role: 'DOCTOR',
        registrationCode: 'WRONG-CODE-999',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_REGISTRATION_CODE');
  });
});
