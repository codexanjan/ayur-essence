import { Router } from 'express';
import { QuestionController } from './question.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(QuestionController.getQuestions));

export default router;
