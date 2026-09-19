import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Doctor Workflow & Clinical Reports Integration Tests', () => {
  let doctorToken: string;
  let patientId: string;
  let assessmentId: string;
  let questions: any[];

  beforeAll(async () => {
    // 1. Login doctor
    const docRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'doctor@example.com', password: 'Password@123' });
    doctorToken = docRes.body.data.token;

    // 2. Create patient
    const patRes = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        fullName: 'Workflow Patient',
        dateOfBirth: '1985-06-25',
        gender: 'MALE',
      });
    patientId = patRes.body.data.patient.id;

    // 3. Fetch questions
    const qRes = await request(app)
      .get('/api/questions')
      .set('Authorization', `Bearer ${doctorToken}`);
    questions = qRes.body.data.questions;
  });

  it('TC-FLOW-001: Cannot finalize an assessment in DRAFT status (400)', async () => {
    // Create new DRAFT assessment
    const asmtRes = await request(app)
      .post(`/api/patients/${patientId}/assessments`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ methodVersion: 'baseline-v1' });
    assessmentId = asmtRes.body.data.assessmentId;

    const res = await request(app)
      .post(`/api/assessments/${assessmentId}/finalize`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CANNOT_FINALIZE_DRAFT');
  });

  it('TC-FLOW-002: Completing all answers and calculating successfully transitions status to SUBMITTED', async () => {
    // Submit answers for all 16 questions
    const responses = questions.map((q: any) => ({
      questionId: q.id,
      responseValue: q.options[0],
    }));

    await request(app)
      .put(`/api/assessments/${assessmentId}/responses`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ responses });

    const calcRes = await request(app)
      .post(`/api/assessments/${assessmentId}/calculate`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(calcRes.status).toBe(200);
    expect(calcRes.body.data.status).toBe('SUBMITTED');
    expect(calcRes.body.data.result.dominantDosha).toBeDefined();

    const { vataPct, pittaPct, kaphaPct } = calcRes.body.data.result;
    expect(Number(vataPct) + Number(pittaPct) + Number(kaphaPct)).toBeGreaterThanOrEqual(99.9);
    expect(Number(vataPct) + Number(pittaPct) + Number(kaphaPct)).toBeLessThanOrEqual(100.1);
  });

  it('TC-FLOW-003: Doctor finalizes SUBMITTED assessment (200 FINALIZED)', async () => {
    const res = await request(app)
      .post(`/api/assessments/${assessmentId}/finalize`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('FINALIZED');
    expect(res.body.data.finalizedBy).toBeDefined();
    expect(res.body.data.finalizedAt).toBeDefined();
  });

  it('TC-FLOW-004: Finalizing an already FINALIZED assessment returns 409 Conflict', async () => {
    const res = await request(app)
      .post(`/api/assessments/${assessmentId}/finalize`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ASSESSMENT_ALREADY_FINALIZED');
  });

  it('TC-FLOW-005: Doctor reopens FINALIZED assessment for revision (200)', async () => {
    const res = await request(app)
      .post(`/api/assessments/${assessmentId}/reopen`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ reason: 'Patient reported secondary symptoms during in-person follow-up.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('DRAFT');
    expect(res.body.data.revisionNo).toBe(2);
  });

  it('TC-FLOW-006: Cannot reopen an assessment that is not in FINALIZED status (409)', async () => {
    // Current status is now DRAFT (revision 2)
    const res = await request(app)
      .post(`/api/assessments/${assessmentId}/reopen`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ reason: 'Invalid second reopen' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CANNOT_REOPEN_NON_FINALIZED');
  });

  it('TC-FLOW-007: Add practitioner clinical observation note (201)', async () => {
    const res = await request(app)
      .post(`/api/assessments/${assessmentId}/observations`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        notes: 'Pulse examination indicates dry, light Vata characteristics.',
        source: 'PRACTITIONER',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.observation.notes).toContain('Vata characteristics');
  });

  it('TC-FLOW-008: Fetch clinical assessment report and verify disclaimer and data integrity', async () => {
    const res = await request(app)
      .get(`/api/assessments/${assessmentId}/report`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const report = res.body.data;

    expect(report.reportTitle).toBe('Ayur Essence Prakriti Assessment Report');
    expect(report.disclaimer).toContain('not a standalone medical diagnosis');
    expect(report.patient.fullName).toBe('Workflow Patient');
    expect(report.prakritiConstitution.dominantDosha).toBeDefined();
    expect(report.observations.length).toBeGreaterThanOrEqual(1);

    // Verify sensitive properties are never leaked
    expect(JSON.stringify(report)).not.toContain('passwordHash');
    expect(JSON.stringify(report)).not.toContain('JWT_SECRET');
  });
});
