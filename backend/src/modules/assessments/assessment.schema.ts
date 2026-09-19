import { z } from 'zod';

export const createAssessmentSchema = z.object({
  methodVersion: z.string().default('baseline-v1'),
});

export const saveResponsesSchema = z.object({
  responses: z
    .array(
      z.object({
        questionId: z.string().uuid('Question ID must be a valid UUID'),
        responseValue: z.union([z.string(), z.number(), z.array(z.string())]),
      })
    )
    .min(1, 'At least one response is required'),
});

export const reopenAssessmentSchema = z.object({
  reason: z.string().min(3, 'Reason for reopening must be at least 3 characters'),
});

export const assessmentIdParamSchema = z.object({
  id: z.string().uuid('Valid assessment UUID is required'),
});

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
export type SaveResponsesInput = z.infer<typeof saveResponsesSchema>;
export type ReopenAssessmentInput = z.infer<typeof reopenAssessmentSchema>;
