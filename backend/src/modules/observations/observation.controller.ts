import { Request, Response } from 'express';
import { ObservationService } from './observation.service.js';
import { sendSuccess } from '../../utils/response.js';

export class ObservationController {
  public static async create(req: Request, res: Response) {
    const observation = await ObservationService.addObservation(
      req.params.id as string,
      req.body,
      req.user!.id
    );
    return sendSuccess(res, { observation, id: observation.id }, 201);
  }
}
