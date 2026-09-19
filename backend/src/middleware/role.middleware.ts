import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required', 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Role ${req.user.role} does not have required permissions for this action.`,
          'ROLE_FORBIDDEN'
        )
      );
    }

    next();
  };
};
