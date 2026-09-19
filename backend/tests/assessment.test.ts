import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Assessment & Upsert Integration Tests', () => {
  let doctorToken: string;
  let patientId: string;
  let assessmentId: string;
  let questions: any[];

  beforeAll(async () => {
    // 1. Doctor login
    const docRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'doctor@example.com', password: 'Password@123' });
    doctorToken = docRes.body.data.token;

    // 2. Create patient
    const patRes = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        fullName: 'Assessment Test Patient',
        dateOfBirth: '1996-03-10',
        gender: 'FEMALE',
      });
    patientId = patRes.body.data.patient.id;

    // 3. Fetch questions
    const qRes = await request(app)
      .get('/api/questions')
      .set('Authorization', `Bearer ${doctorToken}`);
    questions = qRes.body.data.questions;
  });

  it('TC-ASMT-001: Create assessment for valid patient returns 201 + DRAFT status', async () => {
    const res = await request(app)
      .post(`/api/patients/${patientId}/assessments`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ methodVersion: 'baseline-v1' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.assessmentId).toBeDefined();
    expect(res.body.data.status).toBe('DRAFT');
    expect(res.body.data.revisionNo).toBe(1);
    assessmentId = res.body.data.assessmentId;
  });

  it('TC-ASMT-002: Create assessment for unknown patient ID returns 404', async () => {
    const res = await request(app)
      .post('/api/patients/00000000-0000-0000-0000-000000000000/assessments')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ methodVersion: 'baseline-v1' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('PATIENT_NOT_FOUND');
  });

  it('TC-ASMT-003: Save valid questionnaire responses (200)', async () => {
    const firstQ = questions[0];
    const res = await request(app)
      .put(`/api/assessments/${assessmentId}/responses`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        responses: [
          { questionId: firstQ.id, responseValue: firstQ.options[0] },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.count).toBe(1);
  });

  it('TC-ASMT-004: Rejects response with non-existent questionId (400)', async () => {
    const res = await request(app)
      .put(`/api/assessments/${assessmentId}/responses`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        responses: [
          { questionId: '00000000-0000-0000-0000-000000000000', responseValue: 'Option' },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('QUESTION_INVALID');
  });

  it('TC-ASMT-005: Rejects response with invalid option string (422)', async () => {
    const firstQ = questions[0];
    const res = await request(app)
      .put(`/api/assessments/${assessmentId}/responses`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        responses: [
          { questionId: firstQ.id, responseValue: 'NonExistentBogusOption' },
        ],
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_QUESTION_OPTION');
  });

  it('TC-ASMT-006: Submitting updated answer for same question performs DB UPSERT without duplicates', async () => {
    const firstQ = questions[0];
    const newOption = firstQ.options[1];

    // Submit different option for question 0
    const updateRes = await request(app)
      .put(`/api/assessments/${assessmentId}/responses`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        responses: [
          { questionId: firstQ.id, responseValue: newOption },
        ],
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);

    // Verify in database via GET assessment
    const getRes = await request(app)
      .get(`/api/assessments/${assessmentId}`)
      .set('Authorization', `Bearer ${doctorToken}`);

    const responsesForQ0 = getRes.body.data.assessment.responses.filter(
      (r: any) => r.questionId === firstQ.id
    );

    // Exactly 1 response record must exist
    expect(responsesForQ0.length).toBe(1);
    expect(responsesForQ0[0].responseValue).toBe(newOption);
  });

  it('TC-ASMT-007: Response stores scoring snapshot for historical reproducibility', async () => {
    const getRes = await request(app)
      .get(`/api/assessments/${assessmentId}`)
      .set('Authorization', `Bearer ${doctorToken}`);

    const resp = getRes.body.data.assessment.responses[0];
    expect(resp.scoringSnapshot).toBeDefined();
    expect(resp.scoringSnapshot.weights).toBeDefined();
    expect(resp.scoringSnapshot.weights.vata).toBeDefined();
    expect(resp.scoringSnapshot.methodVersion).toBe('baseline-v1');
  });

  it('TC-ASMT-008: Reject calculate on incomplete assessment (422 ASSESSMENT_INCOMPLETE)', async () => {
    // Currently only 1 of 16 questions is answered
    const calcRes = await request(app)
      .post(`/api/assessments/${assessmentId}/calculate`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(calcRes.status).toBe(422);
    expect(calcRes.body.success).toBe(false);
    expect(calcRes.body.error.code).toBe('ASSESSMENT_INCOMPLETE');
    expect(calcRes.body.error.details.missingQuestionIds).toBeInstanceOf(Array);
    expect(calcRes.body.error.details.missingQuestionIds.length).toBeGreaterThan(0);
  });
});
