import { Request, Response } from 'express';
import { PatientService } from './patient.service.js';
import { sendSuccess } from '../../utils/response.js';

export class PatientController {
  public static async create(req: Request, res: Response) {
    const patient = await PatientService.createPatient(req.body, req.user!.id);
    return sendSuccess(res, { patient, id: patient.id }, 201);
  }

  public static async getById(req: Request, res: Response) {
    const patient = await PatientService.getPatientById(req.params.id as string, req.user!);
    return sendSuccess(res, { patient, id: patient.id }, 200);
  }

  public static async list(req: Request, res: Response) {
    const result = await PatientService.listPatients(req.query as any);
    return sendSuccess(res, result, 200);
  }

  public static async getHistory(req: Request, res: Response) {
    const history = await PatientService.getPatientHistory(req.params.id as string, req.user!);
    return sendSuccess(res, history, 200);
  }
}
