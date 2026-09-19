import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('RBAC & Authorization Integration Tests', () => {
  let doctorToken: string;
  let studentToken: string;
  let patientToken: string;
  let patientId: string;
  let assessmentId: string;

  beforeAll(async () => {
    // 1. Doctor login
    const docRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'doctor@example.com', password: 'Password@123' });
    doctorToken = docRes.body.data.token;

    // 2. Student login
    const stuRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@example.com', password: 'Password@123' });
    studentToken = stuRes.body.data.token;

    // 3. Patient login
    const patRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'patient@example.com', password: 'Password@123' });
    patientToken = patRes.body.data.token;

    // 4. Create patient for test
    const newPat = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        fullName: 'RBAC Test Patient',
        dateOfBirth: '2000-01-01',
        gender: 'OTHER',
      });
    patientId = newPat.body.data.patient.id;
  });

  it('TC-RBAC-001: Request without Authorization header returns 401 Unauthorized', async () => {
    const res = await request(app).post('/api/patients').send({
      fullName: 'No Auth Patient',
      dateOfBirth: '1990-01-01',
      gender: 'MALE',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('TOKEN_MISSING');
  });

  it('TC-RBAC-002: Request with invalid / forged JWT returns 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.signature')
      .send({
        fullName: 'Forged JWT Patient',
        dateOfBirth: '1990-01-01',
        gender: 'MALE',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('TOKEN_INVALID');
  });

  it('TC-RBAC-003: Request with malformed header returns 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', 'NotABearerToken')
      .send({
        fullName: 'Malformed Header Patient',
        dateOfBirth: '1990-01-01',
        gender: 'MALE',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('TC-RBAC-004: Student role can start an assessment (201)', async () => {
    const res = await request(app)
      .post(`/api/patients/${patientId}/assessments`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ methodVersion: 'baseline-v1' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.assessmentId).toBeDefined();
    expect(res.body.data.status).toBe('DRAFT');
    assessmentId = res.body.data.assessmentId;
  });

  it('TC-RBAC-005: Student role can save responses and calculate results (200)', async () => {
    // 1. Fetch questions to answer
    const qRes = await request(app)
      .get('/api/questions')
      .set('Authorization', `Bearer ${studentToken}`);
    const questions = qRes.body.data.questions;

    // 2. Submit all answers
    const responsesPayload = questions.map((q: any) => ({
      questionId: q.id,
      responseValue: q.options[0],
    }));

    const saveRes = await request(app)
      .put(`/api/assessments/${assessmentId}/responses`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ responses: responsesPayload });
    expect(saveRes.status).toBe(200);

    // 3. Student triggers calculate
    const calcRes = await request(app)
      .post(`/api/assessments/${assessmentId}/calculate`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(calcRes.status).toBe(200);
    expect(calcRes.body.data.status).toBe('SUBMITTED');
    expect(calcRes.body.data.result.dominantDosha).toBeDefined();
  });

  it('TC-RBAC-006: Student role is strictly FORBIDDEN from finalizing assessments (403)', async () => {
    const res = await request(app)
      .post(`/api/assessments/${assessmentId}/finalize`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ROLE_FORBIDDEN');
  });

  it('TC-RBAC-007: Student role is strictly FORBIDDEN from reopening assessments (403)', async () => {
    const res = await request(app)
      .post(`/api/assessments/${assessmentId}/reopen`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ reason: 'Student trying to reopen' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ROLE_FORBIDDEN');
  });

  it('TC-RBAC-008: Patient role is strictly FORBIDDEN from creating assessments (403)', async () => {
    const res = await request(app)
      .post(`/api/patients/${patientId}/assessments`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ methodVersion: 'baseline-v1' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ROLE_FORBIDDEN');
  });

  it('TC-RBAC-009: Doctor role can finalize a submitted assessment (200)', async () => {
    const res = await request(app)
      .post(`/api/assessments/${assessmentId}/finalize`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('FINALIZED');
    expect(res.body.data.finalizedBy).toBeDefined();
  });
});
