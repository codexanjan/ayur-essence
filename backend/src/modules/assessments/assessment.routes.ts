import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { AssessmentController } from './assessment.controller.js';
import { ObservationController } from '../observations/observation.controller.js';
import { createObservationSchema } from '../observations/observation.schema.js';
import { ReportController } from '../reports/report.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import {
  saveResponsesSchema,
  reopenAssessmentSchema,
  assessmentIdParamSchema,
} from './assessment.schema.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

// Get assessment details
router.get(
  '/:id',
  validateRequest({ params: assessmentIdParamSchema }),
  asyncHandler(AssessmentController.getById)
);

// Save / Upsert responses
router.put(
  '/:id/responses',
  authorizeRoles(UserRole.DOCTOR, UserRole.STUDENT),
  validateRequest({
    params: assessmentIdParamSchema,
    body: saveResponsesSchema,
  }),
  asyncHandler(AssessmentController.saveResponses)
);

// Calculate Prakriti result
router.post(
  '/:id/calculate',
  authorizeRoles(UserRole.DOCTOR, UserRole.STUDENT),
  validateRequest({ params: assessmentIdParamSchema }),
  asyncHandler(AssessmentController.calculate)
);

// Finalize assessment (Doctor ONLY)
router.post(
  '/:id/finalize',
  authorizeRoles(UserRole.DOCTOR),
  validateRequest({ params: assessmentIdParamSchema }),
  asyncHandler(AssessmentController.finalize)
);

// Reopen assessment (Doctor ONLY)
router.post(
  '/:id/reopen',
  authorizeRoles(UserRole.DOCTOR),
  validateRequest({
    params: assessmentIdParamSchema,
    body: reopenAssessmentSchema,
  }),
  asyncHandler(AssessmentController.reopen)
);

// Add practitioner observation
router.post(
  '/:id/observations',
  authorizeRoles(UserRole.DOCTOR, UserRole.STUDENT),
  validateRequest({
    params: assessmentIdParamSchema,
    body: createObservationSchema,
  }),
  asyncHandler(ObservationController.create)
);

// Get assessment report
router.get(
  '/:id/report',
  validateRequest({ params: assessmentIdParamSchema }),
  asyncHandler(ReportController.getReport)
);

export default router;
