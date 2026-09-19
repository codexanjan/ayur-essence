import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import patientRoutes from '../modules/patients/patient.routes.js';
import questionRoutes from '../modules/questions/question.routes.js';
import assessmentRoutes from '../modules/assessments/assessment.routes.js';

const router = Router();

// Health Check
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ayur Essence API is running',
  });
});

// Mounted feature routers
router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/questions', questionRoutes);
router.use('/assessments', assessmentRoutes);

export default router;
