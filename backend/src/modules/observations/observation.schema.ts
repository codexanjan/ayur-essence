import { z } from 'zod';

export const createObservationSchema = z.object({
  notes: z.string().min(1, 'Observation notes cannot be empty'),
  source: z.string().default('PRACTITIONER'),
});

export const observationParamSchema = z.object({
  id: z.string().uuid('Valid assessment UUID is required'),
});

export type CreateObservationInput = z.infer<typeof createObservationSchema>;
