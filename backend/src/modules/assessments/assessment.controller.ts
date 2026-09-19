import { Request, Response } from 'express';
import { AssessmentService } from './assessment.service.js';
import { sendSuccess } from '../../utils/response.js';

export class AssessmentController {
  public static async create(req: Request, res: Response) {
    const patientId = (req.params.id || req.params.patientId || req.body.patientId) as string;
    const methodVersion = (req.body.methodVersion as string) || 'baseline-v1';
    const result = await AssessmentService.createAssessment(patientId, req.user!.id, methodVersion);
    return sendSuccess(res, result, 201);
  }

  public static async getById(req: Request, res: Response) {
    const assessment = await AssessmentService.getAssessmentById(req.params.id as string);
    return sendSuccess(res, { assessment, id: assessment.id }, 200);
  }

  public static async saveResponses(req: Request, res: Response) {
    const result = await AssessmentService.saveResponses(req.params.id as string, req.body);
    return sendSuccess(res, result, 200);
  }

  public static async calculate(req: Request, res: Response) {
    const result = await AssessmentService.calculateResult(req.params.id as string);
    return sendSuccess(res, result, 200);
  }

  public static async finalize(req: Request, res: Response) {
    const result = await AssessmentService.finalizeAssessment(req.params.id as string, req.user!.id);
    return sendSuccess(res, result, 200);
  }

  public static async reopen(req: Request, res: Response) {
    const result = await AssessmentService.reopenAssessment(req.params.id as string, req.user!.id, req.body);
    return sendSuccess(res, result, 200);
  }
}
