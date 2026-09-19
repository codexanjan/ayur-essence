import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Patient Management Integration Tests', () => {
  let doctorToken: string;
  let studentToken: string;
  let createdPatientId: string;

  beforeAll(async () => {
    // Login as seeded Doctor
    const docRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'doctor@example.com', password: 'Password@123' });
    doctorToken = docRes.body.data.token;

    // Login as seeded Student
    const stuRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@example.com', password: 'Password@123' });
    studentToken = stuRes.body.data.token;
  });

  it('TC-PAT-001: Doctor creates valid patient profile (201)', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        fullName: 'Rohit Verma',
        dateOfBirth: '1992-08-15',
        gender: 'MALE',
        phone: '9845012345',
        address: 'Bengaluru, Karnataka',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.patient.id).toBeDefined();
    expect(res.body.data.patient.fullName).toBe('Rohit Verma');
    createdPatientId = res.body.data.patient.id;
  });

  it('TC-PAT-002: Student creates valid patient profile (201)', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        fullName: 'Meera Nambiar',
        dateOfBirth: '1995-11-20',
        gender: 'FEMALE',
        phone: '9845099999',
        address: 'Kochi, Kerala',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.patient.fullName).toBe('Meera Nambiar');
  });

  it('TC-PAT-003: Rejects patient creation when fullName is missing (400)', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        dateOfBirth: '1990-01-01',
        gender: 'MALE',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('TC-PAT-004: Rejects patient creation with invalid date of birth (400)', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        fullName: 'Invalid DOB Patient',
        dateOfBirth: 'not-a-real-date',
        gender: 'OTHER',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('TC-PAT-005: Querying unknown patient ID returns 404', async () => {
    const res = await request(app)
      .get('/api/patients/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('PATIENT_NOT_FOUND');
  });

  it('TC-PAT-006: Retrieve existing patient profile by ID (200)', async () => {
    const res = await request(app)
      .get(`/api/patients/${createdPatientId}`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.patient.id).toBe(createdPatientId);
    expect(res.body.data.patient.fullName).toBe('Rohit Verma');
  });
});
