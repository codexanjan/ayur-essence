import { z } from 'zod';

export const createPatientSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  dateOfBirth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Valid date of birth in YYYY-MM-DD format is required'),
  gender: z.string().min(1, 'Gender is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const patientQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
});

export const patientIdParamSchema = z.object({
  id: z.string().uuid('Valid patient UUID is required'),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type PatientQueryInput = z.infer<typeof patientQuerySchema>;
