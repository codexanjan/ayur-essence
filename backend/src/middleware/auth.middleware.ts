import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../config/database.js';

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authorization token is required', 'TOKEN_MISSING');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw ApiError.unauthorized('Bearer token is missing', 'TOKEN_MISSING');
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Token has expired', 'TOKEN_EXPIRED');
      }
      throw ApiError.unauthorized('Invalid authorization token', 'TOKEN_INVALID');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, fullName: true, isActive: true },
    });

    if (!user) {
      throw ApiError.unauthorized('User associated with token not found', 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw ApiError.unauthorized('User account is inactive', 'USER_INACTIVE');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    next();
  } catch (error) {
    next(error);
  }
};
