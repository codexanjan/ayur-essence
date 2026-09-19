import { Request, Response } from 'express';
import { QuestionService } from './question.service.js';
import { sendSuccess } from '../../utils/response.js';

export class QuestionController {
  public static async getQuestions(req: Request, res: Response) {
    const methodVersion = (req.query.methodVersion as string) || 'baseline-v1';
    const data = await QuestionService.getActiveQuestions(methodVersion);
    return sendSuccess(res, data, 200);
  }
}
