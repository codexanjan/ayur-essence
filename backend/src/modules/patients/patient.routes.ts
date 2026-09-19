import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { PatientController } from './patient.controller.js';
import { AssessmentController } from '../assessments/assessment.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import {
  createPatientSchema,
  patientQuerySchema,
  patientIdParamSchema,
} from './patient.schema.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorizeRoles(UserRole.DOCTOR, UserRole.STUDENT),
  validateRequest({ body: createPatientSchema }),
  asyncHandler(PatientController.create)
);

router.get(
  '/',
  authorizeRoles(UserRole.DOCTOR, UserRole.STUDENT),
  validateRequest({ query: patientQuerySchema }),
  asyncHandler(PatientController.list)
);

router.get(
  '/:id',
  validateRequest({ params: patientIdParamSchema }),
  asyncHandler(PatientController.getById)
);

router.get(
  '/:id/history',
  validateRequest({ params: patientIdParamSchema }),
  asyncHandler(PatientController.getHistory)
);

router.post(
  '/:id/assessments',
  authorizeRoles(UserRole.DOCTOR, UserRole.STUDENT),
  validateRequest({ params: patientIdParamSchema }),
  asyncHandler(AssessmentController.create)
);

export default router;
