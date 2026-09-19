import { AssessmentStatus, UserRole } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { ScoringService } from '../scoring/scoring.service.js';
import { SaveResponsesInput, ReopenAssessmentInput } from './assessment.schema.js';

export class AssessmentService {
  public static async createAssessment(
    patientId: string,
    createdBy: string,
    methodVersion = 'baseline-v1'
  ) {
    const patient = await prisma.patientProfile.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw ApiError.notFound(
        `Patient with ID "${patientId}" was not found.`,
        'PATIENT_NOT_FOUND'
      );
    }

    const assessment = await prisma.assessment.create({
      data: {
        patientId,
        createdBy,
        methodVersion,
        status: AssessmentStatus.DRAFT,
        revisionNo: 1,
      },
      include: {
        patient: {
          select: { id: true, fullName: true, gender: true, dateOfBirth: true },
        },
      },
    });

    return {
      assessment,
      assessmentId: assessment.id,
      patientId: assessment.patientId,
      status: assessment.status,
      methodVersion: assessment.methodVersion,
      revisionNo: assessment.revisionNo,
      createdAt: assessment.createdAt,
    };
  }

  public static async getAssessmentById(id: string) {
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        patient: true,
        creator: {
          select: { id: true, fullName: true, role: true },
        },
        finalizer: {
          select: { id: true, fullName: true, role: true },
        },
        responses: {
          include: {
            question: {
              select: { id: true, code: true, prompt: true, options: true },
            },
          },
        },
        observations: {
          include: {
            creator: {
              select: { id: true, fullName: true, role: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!assessment) {
      throw ApiError.notFound(
        `Assessment with ID "${id}" was not found.`,
        'ASSESSMENT_NOT_FOUND'
      );
    }

    return assessment;
  }

  public static async saveResponses(id: string, input: SaveResponsesInput) {
    const assessment = await prisma.assessment.findUnique({
      where: { id },
    });

    if (!assessment) {
      throw ApiError.notFound(
        `Assessment with ID "${id}" was not found.`,
        'ASSESSMENT_NOT_FOUND'
      );
    }

    if (assessment.status !== AssessmentStatus.DRAFT) {
      throw ApiError.conflict(
        `Assessment cannot be edited because its current status is "${assessment.status}". Only DRAFT assessments can be modified.`,
        'ASSESSMENT_NOT_EDITABLE'
      );
    }

    // Process and upsert each response within a Prisma transaction
    const savedResponses = await prisma.$transaction(async (tx) => {
      const results = [];

      for (const item of input.responses) {
        const question = await tx.question.findUnique({
          where: { id: item.questionId },
        });

        if (!question || !question.isActive) {
          throw ApiError.badRequest(
            `Question with ID "${item.questionId}" does not exist or is inactive.`,
            'QUESTION_INVALID'
          );
        }

        const options = question.options as string[];
        const stringVal = String(item.responseValue);
        if (!options.includes(stringVal)) {
          throw ApiError.unprocessableEntity(
            `Response "${stringVal}" is not a valid option for question "${question.code}". Valid options: ${options.join(', ')}`,
            'INVALID_QUESTION_OPTION'
          );
        }

        const scoringMap = (question.scoringMap as Record<string, any>) || {};
        const weights = scoringMap[stringVal] || { vata: 0, pitta: 0, kapha: 0 };
        const vata = Number(weights.vata || 0);
        const pitta = Number(weights.pitta || 0);
        const kapha = Number(weights.kapha || 0);

        const scoringSnapshot = {
          questionVersion: question.version,
          methodVersion: question.methodReference,
          selectedOption: stringVal,
          weights: { vata, pitta, kapha },
        };

        const responseRecord = await tx.assessmentResponse.upsert({
          where: {
            assessmentId_questionId: {
              assessmentId: id,
              questionId: item.questionId,
            },
          },
          update: {
            responseValue: stringVal,
            scoringSnapshot,
            vataScore: vata,
            pittaScore: pitta,
            kaphaScore: kapha,
          },
          create: {
            assessmentId: id,
            questionId: item.questionId,
            responseValue: stringVal,
            scoringSnapshot,
            vataScore: vata,
            pittaScore: pitta,
            kaphaScore: kapha,
          },
        });

        results.push(responseRecord);
      }

      return results;
    });

    return {
      assessmentId: id,
      count: savedResponses.length,
      responses: savedResponses,
    };
  }

  public static async calculateResult(id: string) {
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        responses: true,
      },
    });

    if (!assessment) {
      throw ApiError.notFound(
        `Assessment with ID "${id}" was not found.`,
        'ASSESSMENT_NOT_FOUND'
      );
    }

    if (assessment.status === AssessmentStatus.FINALIZED) {
      throw ApiError.conflict(
        'Assessment is already finalized. Reopen the assessment before recalculating.',
        'ASSESSMENT_ALREADY_FINALIZED'
      );
    }

    // Fetch active required questions for this method version
    const activeQuestions = await prisma.question.findMany({
      where: {
        isActive: true,
        methodReference: assessment.methodVersion,
      },
      select: { id: true },
    });

    const activeIds = activeQuestions.map((q) => q.id);
    const answeredIds = assessment.responses.map((r) => r.questionId);

    // Validate completeness
    ScoringService.validateCompleteness(activeIds, answeredIds);

    // Compute Dosha scores
    const scoringResult = ScoringService.calculate(
      assessment.responses.map((r) => ({
        vataScore: r.vataScore,
        pittaScore: r.pittaScore,
        kaphaScore: r.kaphaScore,
      }))
    );

    // Persist scores and transition to SUBMITTED
    const updated = await prisma.assessment.update({
      where: { id },
      data: {
        vataPct: scoringResult.vataPct,
        pittaPct: scoringResult.pittaPct,
        kaphaPct: scoringResult.kaphaPct,
        dominantDosha: scoringResult.dominantDosha,
        status: AssessmentStatus.SUBMITTED,
      },
      select: {
        id: true,
        patientId: true,
        status: true,
        methodVersion: true,
        revisionNo: true,
        vataPct: true,
        pittaPct: true,
        kaphaPct: true,
        dominantDosha: true,
        updatedAt: true,
      },
    });

    return {
      assessmentId: updated.id,
      status: updated.status,
      methodVersion: updated.methodVersion,
      revisionNo: updated.revisionNo,
      result: {
        vataPct: updated.vataPct,
        pittaPct: updated.pittaPct,
        kaphaPct: updated.kaphaPct,
        dominantDosha: updated.dominantDosha,
        scoreTotals: {
          vata: scoringResult.vataScoreTotal,
          pitta: scoringResult.pittaScoreTotal,
          kapha: scoringResult.kaphaScoreTotal,
          total: scoringResult.totalScore,
        },
      },
    };
  }

  public static async finalizeAssessment(id: string, doctorId: string) {
    const assessment = await prisma.assessment.findUnique({
      where: { id },
    });

    if (!assessment) {
      throw ApiError.notFound(
        `Assessment with ID "${id}" was not found.`,
        'ASSESSMENT_NOT_FOUND'
      );
    }

    if (assessment.status === AssessmentStatus.FINALIZED) {
      throw ApiError.conflict(
        'Assessment has already been finalized by a practitioner.',
        'ASSESSMENT_ALREADY_FINALIZED'
      );
    }

    if (assessment.status === AssessmentStatus.DRAFT) {
      throw ApiError.badRequest(
        'Cannot finalize assessment in DRAFT status. Please complete and calculate the assessment first.',
        'CANNOT_FINALIZE_DRAFT'
      );
    }

    const finalized = await prisma.assessment.update({
      where: { id },
      data: {
        status: AssessmentStatus.FINALIZED,
        finalizedBy: doctorId,
        finalizedAt: new Date(),
      },
      include: {
        finalizer: {
          select: { id: true, fullName: true, role: true },
        },
      },
    });

    return {
      assessmentId: finalized.id,
      status: finalized.status,
      finalizedBy: finalized.finalizer?.fullName,
      finalizedAt: finalized.finalizedAt,
    };
  }

  public static async reopenAssessment(
    id: string,
    doctorId: string,
    input: ReopenAssessmentInput
  ) {
    const assessment = await prisma.assessment.findUnique({
      where: { id },
    });

    if (!assessment) {
      throw ApiError.notFound(
        `Assessment with ID "${id}" was not found.`,
        'ASSESSMENT_NOT_FOUND'
      );
    }

    if (assessment.status !== AssessmentStatus.FINALIZED) {
      throw ApiError.conflict(
        `Only FINALIZED assessments can be reopened. Current status is "${assessment.status}".`,
        'CANNOT_REOPEN_NON_FINALIZED'
      );
    }

    // Atomic transaction: log observation note for reopening and increment revision
    const reopened = await prisma.$transaction(async (tx) => {
      await tx.observation.create({
        data: {
          assessmentId: id,
          createdBy: doctorId,
          source: 'DOCTOR_REOPEN',
          notes: `Assessment reopened for revision. Reason: ${input.reason}`,
        },
      });

      return tx.assessment.update({
        where: { id },
        data: {
          status: AssessmentStatus.DRAFT,
          revisionNo: assessment.revisionNo + 1,
        },
      });
    });

    return {
      assessmentId: reopened.id,
      status: reopened.status,
      revisionNo: reopened.revisionNo,
      message: `Assessment successfully reopened for revision ${reopened.revisionNo}.`,
    };
  }
}
