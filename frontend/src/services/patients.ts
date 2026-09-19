import { api } from './api.ts';

export interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  address?: string;
  createdAt: string;
  _count?: {
    assessments: number;
  };
  assessments?: any[];
}

export const patientService = {
  list: async (params?: { page?: number; limit?: number; search?: string }) => {
    const res = await api.get('/patients', { params });
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`/patients/${id}`);
    return res.data.data.patient;
  },

  create: async (data: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    phone?: string;
    address?: string;
  }) => {
    const res = await api.post('/patients', data);
    return res.data.data.patient;
  },

  getHistory: async (id: string) => {
    const res = await api.get(`/patients/${id}/history`);
    return res.data.data;
  },
};
