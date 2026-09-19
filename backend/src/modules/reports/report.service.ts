import { UserRole } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { AuthUser } from '../../types/express.js';

export class ReportService {
  public static async getReport(assessmentId: string, user: AuthUser) {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        patient: true,
        creator: {
          select: { id: true, fullName: true, role: true },
        },
        finalizer: {
          select: { id: true, fullName: true, role: true },
        },
        observations: {
          include: {
            creator: {
              select: { id: true, fullName: true, role: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        responses: {
          select: {
            questionId: true,
            responseValue: true,
            vataScore: true,
            pittaScore: true,
            kaphaScore: true,
            question: {
              select: { code: true, prompt: true },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw ApiError.notFound(
        `Assessment with ID "${assessmentId}" was not found.`,
        'ASSESSMENT_NOT_FOUND'
      );
    }

    // Role check: If patient, must be their linked profile
    if (
      user.role === UserRole.PATIENT &&
      assessment.patient.linkedUserId !== user.id
    ) {
      throw ApiError.forbidden(
        'You do not have authorization to view this assessment report.',
        'ACCESS_DENIED'
      );
    }

    // Filter observations if patient: Patients only see public/patient-safe observations
    const observations =
      user.role === UserRole.PATIENT
        ? assessment.observations.filter((o) => o.source === 'PUBLIC_SUMMARY')
        : assessment.observations.map((o) => ({
            id: o.id,
            notes: o.notes,
            source: o.source,
            author: o.creator.fullName,
            role: o.creator.role,
            createdAt: o.createdAt,
          }));

    return {
      reportTitle: 'Ayur Essence Prakriti Assessment Report',
      disclaimer:
        'This Prakriti assessment result is based on the configured questionnaire scoring method and is not a standalone medical diagnosis.',
      generatedAt: new Date(),
      patient: {
        id: assessment.patient.id,
        fullName: assessment.patient.fullName,
        dateOfBirth: assessment.patient.dateOfBirth,
        gender: assessment.patient.gender,
        phone: assessment.patient.phone,
        address: assessment.patient.address,
      },
      assessment: {
        id: assessment.id,
        status: assessment.status,
        methodVersion: assessment.methodVersion,
        revisionNo: assessment.revisionNo,
        createdAt: assessment.createdAt,
        finalizedAt: assessment.finalizedAt,
        finalizedBy: assessment.finalizer?.fullName || null,
        assessedBy: assessment.creator.fullName,
      },
      prakritiConstitution: {
        vataPct: assessment.vataPct,
        pittaPct: assessment.pittaPct,
        kaphaPct: assessment.kaphaPct,
        dominantDosha: assessment.dominantDosha,
        isCalculated: assessment.dominantDosha !== null,
      },
      observations,
      totalResponsesCount: assessment.responses.length,
    };
  }
}
