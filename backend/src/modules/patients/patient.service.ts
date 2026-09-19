import { UserRole } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { AuthUser } from '../../types/express.js';
import { CreatePatientInput, PatientQueryInput } from './patient.schema.js';

export class PatientService {
  public static async createPatient(input: CreatePatientInput, createdBy: string) {
    const { fullName, dateOfBirth, gender, phone, address } = input;

    const patient = await prisma.patientProfile.create({
      data: {
        fullName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        phone,
        address,
        createdBy,
      },
      include: {
        creator: {
          select: { id: true, fullName: true, role: true },
        },
      },
    });

    return patient;
  }

  public static async getPatientById(id: string, user: AuthUser) {
    const patient = await prisma.patientProfile.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, fullName: true, role: true },
        },
        assessments: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            vataPct: true,
            pittaPct: true,
            kaphaPct: true,
            dominantDosha: true,
            revisionNo: true,
            methodVersion: true,
            createdAt: true,
            finalizedAt: true,
          },
        },
      },
    });

    if (!patient) {
      throw ApiError.notFound(`Patient with ID "${id}" was not found.`, 'PATIENT_NOT_FOUND');
    }

    // Role check: If role is PATIENT, they may only view their linked profile
    if (user.role === UserRole.PATIENT && patient.linkedUserId !== user.id) {
      throw ApiError.forbidden('You do not have permission to view this patient profile.', 'ACCESS_DENIED');
    }

    return patient;
  }

  public static async listPatients(query: PatientQueryInput) {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search && search.trim()) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, patients] = await Promise.all([
      prisma.patientProfile.count({ where }),
      prisma.patientProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { assessments: true },
          },
        },
      }),
    ]);

    return {
      patients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public static async getPatientHistory(id: string, user: AuthUser) {
    const patient = await prisma.patientProfile.findUnique({
      where: { id },
      select: { id: true, linkedUserId: true, fullName: true },
    });

    if (!patient) {
      throw ApiError.notFound(`Patient with ID "${id}" was not found.`, 'PATIENT_NOT_FOUND');
    }

    if (user.role === UserRole.PATIENT && patient.linkedUserId !== user.id) {
      throw ApiError.forbidden('You do not have permission to access this patient history.', 'ACCESS_DENIED');
    }

    const assessments = await prisma.assessment.findMany({
      where: { patientId: id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        status: true,
        vataPct: true,
        pittaPct: true,
        kaphaPct: true,
        dominantDosha: true,
        revisionNo: true,
        methodVersion: true,
        finalizedAt: true,
      },
    });

    return {
      patientId: id,
      patientName: patient.fullName,
      assessments: assessments.map((a) => ({
        id: a.id,
        date: a.createdAt,
        vataPct: a.vataPct,
        pittaPct: a.pittaPct,
        kaphaPct: a.kaphaPct,
        dominantDosha: a.dominantDosha,
        status: a.status,
        revisionNo: a.revisionNo,
        methodVersion: a.methodVersion,
        finalizedAt: a.finalizedAt,
      })),
    };
  }
}
