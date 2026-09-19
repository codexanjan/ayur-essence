import { Request, Response } from 'express';
import { ReportService } from './report.service.js';
import { sendSuccess } from '../../utils/response.js';

export class ReportController {
  public static async getReport(req: Request, res: Response) {
    const report = await ReportService.getReport(req.params.id as string, req.user!);
    return sendSuccess(res, report, 200);
  }
}
