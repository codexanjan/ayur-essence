import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { sendSuccess } from '../../utils/response.js';

export class AuthController {
  public static async register(req: Request, res: Response) {
    const result = await AuthService.register(req.body);
    return sendSuccess(res, result, 201);
  }

  public static async login(req: Request, res: Response) {
    const result = await AuthService.login(req.body);
    return sendSuccess(res, result, 200);
  }
}
