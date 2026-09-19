import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authRateLimiter } from '../../middleware/rateLimit.middleware.js';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validateRequest({ body: registerSchema }),
  asyncHandler(AuthController.register)
);

router.post(
  '/login',
  authRateLimiter,
  validateRequest({ body: loginSchema }),
  asyncHandler(AuthController.login)
);

export default router;
