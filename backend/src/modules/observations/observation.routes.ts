import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { ObservationController } from './observation.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import {
  createObservationSchema,
  observationParamSchema,
} from './observation.schema.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.post(
  '/:id/observations',
  authorizeRoles(UserRole.DOCTOR, UserRole.STUDENT),
  validateRequest({
    params: observationParamSchema,
    body: createObservationSchema,
  }),
  asyncHandler(ObservationController.create)
);

export default router;
