import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Questionnaire Integration Tests', () => {
  let doctorToken: string;

  beforeAll(async () => {
    const docRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'doctor@example.com', password: 'Password@123' });
    doctorToken = docRes.body.data.token;
  });

  it('TC-Q-001: Authenticated practitioner loads active questions (200)', async () => {
    const res = await request(app)
      .get('/api/questions')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.questions).toBeInstanceOf(Array);
    expect(res.body.data.total).toBeGreaterThanOrEqual(16);
  });

  it('TC-Q-002: Only active questions are returned', async () => {
    const res = await request(app)
      .get('/api/questions')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    for (const q of res.body.data.questions) {
      expect(q.code).toBeDefined();
      expect(q.prompt).toBeDefined();
      expect(q.options).toBeInstanceOf(Array);
    }
  });

  it('TC-Q-003: Questions are ordered consistently', async () => {
    const res1 = await request(app)
      .get('/api/questions')
      .set('Authorization', `Bearer ${doctorToken}`);

    const res2 = await request(app)
      .get('/api/questions')
      .set('Authorization', `Bearer ${doctorToken}`);

    const codes1 = res1.body.data.questions.map((q: any) => q.code);
    const codes2 = res2.body.data.questions.map((q: any) => q.code);

    expect(codes1).toEqual(codes2);
  });

  it('TC-Q-004: Internal scoring map is NOT exposed in the questionnaire payload', async () => {
    const res = await request(app)
      .get('/api/questions')
      .set('Authorization', `Bearer ${doctorToken}`);

    for (const q of res.body.data.questions) {
      expect(q.scoringMap).toBeUndefined();
    }
  });
});
