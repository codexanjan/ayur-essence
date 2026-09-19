import { api } from './api.ts';

export interface Question {
  id: string;
  code: string;
  prompt: string;
  answerType: string;
  options: string[];
}

export const assessmentService = {
  getQuestions: async (methodVersion = 'baseline-v1') => {
    const res = await api.get('/questions', { params: { methodVersion } });
    return res.data.data;
  },

  create: async (patientId: string, methodVersion = 'baseline-v1') => {
    const res = await api.post(`/patients/${patientId}/assessments`, { methodVersion });
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`/assessments/${id}`);
    return res.data.data.assessment;
  },

  saveResponses: async (id: string, responses: Array<{ questionId: string; responseValue: string }>) => {
    const res = await api.put(`/assessments/${id}/responses`, { responses });
    return res.data.data;
  },

  calculate: async (id: string) => {
    const res = await api.post(`/assessments/${id}/calculate`);
    return res.data.data;
  },

  finalize: async (id: string) => {
    const res = await api.post(`/assessments/${id}/finalize`);
    return res.data.data;
  },

  reopen: async (id: string, reason: string) => {
    const res = await api.post(`/assessments/${id}/reopen`, { reason });
    return res.data.data;
  },

  addObservation: async (id: string, notes: string, source = 'PRACTITIONER') => {
    const res = await api.post(`/assessments/${id}/observations`, { notes, source });
    return res.data.data;
  },

  getReport: async (id: string) => {
    const res = await api.get(`/assessments/${id}/report`);
    return res.data.data;
  },
};
