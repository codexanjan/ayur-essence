import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { sendError } from '../utils/response.js';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Handle explicit ApiError
  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.code, err.message, err.details);
  }

  // Handle Prisma Known Request Errors
  if (err?.code === 'P2002') {
    const target = (err.meta?.target as string[])?.join(', ') || 'resource';
    return sendError(
      res,
      409,
      'RESOURCE_CONFLICT',
      `A unique constraint conflict occurred on: ${target}`,
      err.meta
    );
  }

  if (err?.code === 'P2025') {
    return sendError(
      res,
      404,
      'RESOURCE_NOT_FOUND',
      'The requested record was not found.',
      null
    );
  }

  // Handle JSON parsing errors in body
  if (err instanceof SyntaxError && 'body' in err) {
    return sendError(res, 400, 'INVALID_JSON', 'Malformed JSON payload in request body.');
  }

  // Catch-all Internal Server Error
  console.error('[Unhandled Server Error]:', err);
  return sendError(
    res,
    500,
    'INTERNAL_SERVER_ERROR',
    'An unexpected server error occurred. Please contact support.',
    null
  );
};

export const notFoundHandler = (_req: Request, res: Response) => {
  return sendError(
    res,
    404,
    'ENDPOINT_NOT_FOUND',
    'The requested API endpoint does not exist.'
  );
};
