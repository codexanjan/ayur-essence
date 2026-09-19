import { Router } from 'express';
import { ReportController } from './report.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { assessmentIdParamSchema } from '../assessments/assessment.schema.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.get(
  '/:id/report',
  validateRequest({ params: assessmentIdParamSchema }),
  asyncHandler(ReportController.getReport)
);

export default router;
