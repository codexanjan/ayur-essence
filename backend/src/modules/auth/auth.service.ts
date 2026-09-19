import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { signToken } from '../../utils/jwt.js';
import { RegisterInput, LoginInput } from './auth.schema.js';

export class AuthService {
  public static async register(input: RegisterInput) {
    const { fullName, email, password, role, registrationCode } = input;

    // Validate staff registration code for DOCTOR / STUDENT roles
    if (role === UserRole.DOCTOR || role === UserRole.STUDENT) {
      if (!registrationCode || registrationCode !== env.STAFF_REGISTRATION_CODE) {
        throw ApiError.badRequest(
          'Valid staff registration code is required to register as Doctor or Student.',
          'INVALID_REGISTRATION_CODE'
        );
      }
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      throw ApiError.conflict('An account with this email address already exists.', 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        fullName,
        email: email.toLowerCase(),
        passwordHash,
        role,
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    const token = signToken({
      sub: user.id,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    });

    return { user, token };
  }

  public static async login(input: LoginInput) {
    const { email, password } = input;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw ApiError.unauthorized('User account has been deactivated.', 'ACCOUNT_INACTIVE');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
    }

    const token = signToken({
      sub: user.id,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    });

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }
}
