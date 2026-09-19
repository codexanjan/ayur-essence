export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: any;

  constructor(statusCode: number, message: string, code = 'API_ERROR', details: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code = 'BAD_REQUEST', details: any = null) {
    return new ApiError(400, message, code, details);
  }

  static unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED', details: any = null) {
    return new ApiError(401, message, code, details);
  }

  static forbidden(message = 'Permission denied', code = 'FORBIDDEN', details: any = null) {
    return new ApiError(403, message, code, details);
  }

  static notFound(message = 'Resource not found', code = 'RESOURCE_NOT_FOUND', details: any = null) {
    return new ApiError(404, message, code, details);
  }

  static conflict(message: string, code = 'CONFLICT', details: any = null) {
    return new ApiError(409, message, code, details);
  }

  static unprocessableEntity(message: string, code = 'UNPROCESSABLE_ENTITY', details: any = null) {
    return new ApiError(422, message, code, details);
  }

  static internal(message = 'Internal server error', code = 'INTERNAL_ERROR', details: any = null) {
    return new ApiError(500, message, code, details);
  }
}
