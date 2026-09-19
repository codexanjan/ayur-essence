import { api } from './api.ts';

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  register: async (data: {
    fullName: string;
    email: string;
    password: string;
    role: string;
    registrationCode?: string;
  }) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
};
